require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cors = require("cors");
const express = require('express');
const multer = require('multer');
const { QdrantClient } = require("@qdrant/js-client-rest");
const crypto = require('node:crypto');
const { PDFParse } = require('pdf-parse')
const { GoogleGenAI } = require('@google/genai');
const session = require('express-session');
const connectMongo = require('connect-mongo');
const authMiddleware = require('./middleware/authMiddleware');
const MongoStore = connectMongo.default || connectMongo;
const app = express();
const port = process.env.PORT || 3000;

if(process.env.NODE_ENV==='production')
{
    app.set('trust proxy',1);
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});
const qdrantClient = new QdrantClient({
    url:process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY || undefined
});
async function initializeQdrant() {
    const collectionName = 'pdf_chunks'

    const collections = await qdrantClient.getCollections();
    const collectionExists = collections.collections.some(
        collection => collection.name === collectionName
    );
    if(!collectionExists)
    {
        await qdrantClient.createCollection(collectionName,{
            vectors:{
                size:3072,
                distance:'Cosine'
            }
        });
        console.log("Qdrant Collection created");
    }
    else{
        console.log("Qdrant collection already exists");
    }
    await qdrantClient.createPayloadIndex(collectionName,{
        field_name:'documentId',
        field_schema:'keyword'
    });
    await qdrantClient.createPayloadIndex(collectionName,{
        field_name:'userId',
        field_schema:'keyword'
    });
    console.log("Qdrant payload indexes initializes");
}

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60
    }),
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV==='production',
        sameSite: 'lax'
    }
}))
app.use('/api/auth', authRoutes);

//receive one pdf in memory with 10MB size limit
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const ispdf =
            file.mimetype === 'application/pdf' &&
            file.originalname.toLowerCase().endsWith('.pdf');

        if (!ispdf) {
            const error = new Error('Please select a valid PDF file');
            error.status = 400;
            return cb(error);
        }

        cb(null, true);
    }
})
function handlePdfUpload(req, res, next) {
    upload.single('pdf')(req, res, (error) => {
        if (error) {
            return next(error);
        }
        next();
    })
}

const chunksize = 500;
const overlap = 100;

function createChunks(text) {
    const chunkarr = [];
    let start = 0;

    while (start < text.length) {
        const end = start + chunksize;
        const chunk = text.slice(start, end);
        chunkarr.push(chunk);

        const step = chunksize - overlap;
        start += step;
    }

    return chunkarr;
}
async function generateEmbeddings(chunks) {
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: chunks,
        config: {
            taskType: 'RETRIEVAL_DOCUMENT'
        }
    });
    const embeddings = response.embeddings.map(
        item => item.values
    );
    return embeddings;
}
async function storeVectors(chunks, embeddings, userId) {
    const collectionName = 'pdf_chunks';
    const documentId = crypto.randomUUID();
    const points = chunks.map((chunk, index) => ({
        id: crypto.randomUUID(),
        vector: embeddings[index],
        payload: {
            text: chunk,
            documentId: documentId,
            userId: userId,
            index: index
        }
    }));
    await qdrantClient.upsert(collectionName, {
        wait: true,
        points: points
    });
    return {
        documentId: documentId,
        storedPoints: points.length
    };
}
async function generateQueryEmbeddings(question) {
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: question,
        config: {
            taskType: 'RETRIEVAL_QUERY'
        }
    });
    return response.embeddings[0].values;
}
async function retrieveRelevantQ(queryembeddings, documentId, userId) {
    const collectionName = 'pdf_chunks';
    const results = await qdrantClient.query(collectionName, {
        query: queryembeddings,
        limit: 5,
        with_payload: true,
        filter: {
            must: [
                {
                    key: 'documentId',
                    match: {
                        value: documentId
                    }
                },
                {
                    key: 'userId',
                    match: {
                        value: userId
                    }
                }
            ]
        }
    });
    return results.points.map(result => ({
        text: result.payload.text,
        score: result.score,
        chunkIndex: result.payload.index
    }));
}
app.post('/api/upload-pdf', authMiddleware, handlePdfUpload, async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            error: 'Please provide a valid PDF file'
        });
    }
    console.time("PDF Ingestion Time");
    let parser;
    try {
        // console.log("PDF Ingestion Pipeline");
        parser = new PDFParse({
            data: req.file.buffer
        });
        // console.log("Parser created. Extracting text...");

        const result = await parser.getText();

        const rawText = result.text;
        const cleanedText = rawText.trim().replace(/ {2,}/g, " ").replace(/\n{3,}/g, "\n\n");

        // console.log("Raw Text length: ", rawText.length);
        // console.log("Extracted PDF text length:", cleanedText.length);
        // console.log("Extracted PDF text preview:", cleanedText.slice(0, 500));

        if (!cleanedText) {
            return res.status(400).json({
                error: "No readable content was found in the PDF"
            })
        }
        const chunks = createChunks(cleanedText);

        // console.log("Total Chunks : ", chunks.length);
        // console.log("first chunk length: ", chunks[0].length);
        // console.log("second chunk length: ", chunks[1]?.length);
        // console.log(
        //     "Overlap verified:",
        //     chunks.length > 1 && chunks[0].slice(-100) === chunks[1].slice(0, 100)
        // );

        const embeddings = await generateEmbeddings(chunks);

        const storageresults = await storeVectors(chunks, embeddings, req.user._id.toString());

        return res.status(201).json({
            message: "PDF uploaded successfully",
            documentId: storageresults.documentId,
            totalChunks: chunks.length,
            Embeddings: embeddings.length,
            totalStoragePoints: storageresults.storedPoints
        });
    }
    catch (error) {
        console.error("PDF ingestion error: ",error);
        return res.status(500).json({
            error: "Failed to process the PDF.Please try again."
        });
    }
    finally {
        if (parser) {
            await parser.destroy().catch(() => { });
        }
        console.timeEnd("PDF Ingestion Time");
    }
});
app.post('/api/ask-pdf', authMiddleware, async (req, res) => {

    // console.log("Request body:", req.body);
    // console.log("Uploaded file:", req.file);

    const questions = req.body?.question;
    const documentId = req.body?.documentId;

    // console.log("Question:", JSON.stringify(questions));
    // console.log("Is valid string:", typeof questions === 'string' && questions.trim().length > 0);
    if (typeof questions !== 'string' || !questions.trim()) {
        return res.status(400).json({
            error: 'Please provide valid question'
        });
    }
    if (typeof documentId !== 'string' || !documentId.trim()) {
        return res.status(400).json({
            error: 'Please provide a valid document Id'
        });
    }

    try {
        const queryembeddings = await generateQueryEmbeddings(questions);

        const relevantchunks = await retrieveRelevantQ(queryembeddings, documentId, req.user._id.toString());

        // console.log("Retrieved chunks:", relevantchunks.length);

        if (relevantchunks.length === 0) {
            return res.status(404).json({
                error: "No relevant content found for this document"
            });
        }

        // console.log("Relevant results:", relevantchunks);
        // return res.json({
        //     message: "PDF retrieval successful",
        //     documentId: documentId,
        //     retrievedChunks: relevantchunks.length,
        //     results: relevantchunks
        // });

        const context = relevantchunks.map(chunk => chunk.text).join("\n\n");
        const prompt = `
        You are doculens-ai assistant who answers the user questions bases on the provided PDF Document.
        Answer the user's question only using the provided content.
        If the answer is not available in the PDF, clearly tell the user that the answer is not available in the PDF.
        PDF content :${context}
        User's question:${questions}`;

        console.log("Sending the prompt to gemini...");
        console.time('Gemini Response');
        let response;
        try {
            response = await ai.interactions.create({
                model: 'gemini-3.5-flash-lite',
                input: prompt
            })
        } finally {
            console.timeEnd('Gemini Response');
        }

        // console.log("Gemini API call completed");
        // console.log("Full Gemini response:", JSON.stringify(response, null, 2));
        // console.log("Response keys:", Object.keys(response || {}));
        // console.log("Output text:", response?.output_text);

        res.json({
            question: questions,
            answer: response.output_text
        });
    } catch (error) {
        console.error("PDF question answering error", error);

        return res.status(500).json({
            error: "Failed to generate an answer.Please try again."
           
        });
    }

})

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    // console.log("Error name:", err.name);
    // console.log("Error code:", err.code);
    // console.log("Error message:", err.message);
    // console.log("Error status:", err.status);

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                error: "PDF must be 10MB or smaller"
            });
        }
        return res.status(400).json({
            error: "PDF upload fail.Please check the file and try again"
        });
    }
    if (err.status === 400) {
        return res.status(400).json({
            error: err.message
        });
    }
    //unexpected server errors
    console.error('Unhandled server error', err);

    return res.status(500).json({
        error: "Something went wrong.Please try again"
    });
})
connectDB()
    .then(() => {
        return initializeQdrant();
    })
    .then(() => {
        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`);
        });
    })
    .catch(error => {
        console.log("Failed to initialize Qdrant:", error);
        process.exit(1);
    });