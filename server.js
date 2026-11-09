require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes=require('./routes/authRoutes');
const cors = require("cors");
const express = require('express');
const multer = require('multer');
const { QdrantClient } = require("@qdrant/js-client-rest");
const crypto = require('node:crypto');
const { PDFParse } = require('pdf-parse')
const { GoogleGenAI } = require('@google/genai');
const session=require('express-session');
const connectMongo=require('connect-mongo');
const MongoStore = connectMongo.default || connectMongo;
const app = express();
const port = 3000;

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});
const qdrantClient = new QdrantClient({
    host: 'localhost',
    port: 6333
});
async function initializeQdrant() {
    const collectionName = 'pdf_chunks'

    const collections = await qdrantClient.getCollections();
    const collectionExists = collections.collections.some(
        collection => collection.name === collectionName
    );
    if (collectionExists) {
        console.log("Qdrant Collection already exists")
        return;
    }
    await qdrantClient.createCollection(collectionName, {
        vectors: {
            size: 3072,
            distance: 'Cosine'
        }
    });
}

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    resave:false,
    saveUninitialized:false,
    store:MongoStore.create({
        mongoUrl:process.env.MONGODB_URI,
        collectionName:'sessions',
        ttl:12*14*60*60
    }),
    cookie:{
        httpOnly:true,
        secure:false,
        sameSite:'lax'
    }
}))
app.use('/api/auth',authRoutes);

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

        cb(null, ispdf);
    }

})

app.get('/api/hello', (req, res) => {
    res.json({
        message: "Hello form my first API",
        status: "success"
    });
});

app.post('/api/ask', async (req, res) => {
    const questions = req.body?.question;
    console.log("Req body: ", req.body);

    if (!questions || typeof questions !== "string" || !questions.trim()) {
        return res.status(400).json({
            Error: "Please provide valid question"
        })
    }
    try {
        const response = await ai.interactions.create({
            model: 'gemini-3.5-flash-lite',
            input: questions
        });
        res.json({
            question: questions,
            answer: response.output_text
        });
    } catch (error) {
        console.log("Gemini API error : ", error.message)
        res.status(500).json({
            error: 'Failed to generate an AI response'
        });
    }
});
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
async function storeVectors(chunks, embeddings) {
    const collectionName = 'pdf_chunks';
    const documentId = crypto.randomUUID();
    const points = chunks.map((chunk, index) => ({
        id: crypto.randomUUID(),
        vector: embeddings[index],
        payload: {
            text: chunk,
            documentId: documentId,
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
async function retrieveRelevantQ(queryembeddings, documentId) {
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
app.post('/api/upload-pdf', upload.single('pdf'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            error: 'Please provide a valid PDF file'
        });
    }
    console.time("PDF Ingestion Time");
    let parser;
    try {
        console.log("PDF Ingestion Pipeline");
        parser = new PDFParse({
            data: req.file.buffer
        });
        console.log("Parser created. Extracting text...");

        const result = await parser.getText();

        const rawText = result.text;
        const cleanedText = rawText.trim().replace(/ {2,}/g, " ").replace(/\n{3,}/g, "\n\n");

        console.log("Raw Text length: ", rawText.length);
        console.log("Extracted PDF text length:", cleanedText.length);
        console.log("Extracted PDF text preview:", cleanedText.slice(0, 500));

        if (!cleanedText) {
            return res.status(400).json({
                error: "No readable content was found in the PDF"
            })
        }
        const chunks = createChunks(cleanedText);

        console.log("Total Chunks : ", chunks.length);
        console.log("first chunk length: ", chunks[0].length);
        console.log("second chunk length: ", chunks[1].length);
        console.log("Overlap verified : ", chunks[0].slice(-100) === chunks[1].slice(0, 100));

        const embeddings = await generateEmbeddings(chunks);

        const storageresults = await storeVectors(chunks, embeddings);

        return res.status(201).json({
            message: "PDF uploaded successfully",
            documentId: storageresults.documentId,
            totalChunks: chunks.length,
            Embeddings: embeddings.length,
            totalStoragePoints: storageresults.storedPoints
        });
    }
    catch (error) {
        console.error("PDF ingestion error: ");
        return res.status(500).json({
            error: "PDF Ingestion failed",
            details: error.message
        });
    }
    finally {
        if (parser) {
            await parser.destroy().catch(() => { });
        }
        console.timeEnd("PDF Ingestion Time");
    }
});
app.post('/api/ask-pdf', async (req, res) => {

    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    const questions = req.body?.question;
    const documentId = req.body?.documentId;

    console.log("Question:", JSON.stringify(questions));
    console.log("Is valid string:", typeof questions === 'string' && questions.trim().length > 0);
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

        const relevantchunks = await retrieveRelevantQ(queryembeddings, documentId);

        console.log("Retrieved chunks:", relevantchunks.length);

        if (relevantchunks.length === 0) {
            return res.status(404).json({
                error: "No relevant content found for this document"
            });
        }

        console.log("Relevant results:", relevantchunks);
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
        console.log("Gemini API call completed");
        console.log("Full Gemini response:", JSON.stringify(response, null, 2));
        console.log("Response keys:", Object.keys(response || {}));
        console.log("Output text:", response?.output_text);
        res.json({
    question: questions,
    answer: response.output_text
});
    } catch (error) {
        console.error("PDF question answering error", error);

        return res.status(500).json({
            error: "PDF question answering failed",
            details: error.message
        });
    }

})

connectDB()
.then(()=>{
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