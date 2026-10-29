require('dotenv').config();
const cors = require("cors");
const express = require('express');
const multer = require('multer');
const { PDFParse } = require('pdf-parse')
const { GoogleGenAI } = require('@google/genai');
const app = express();
const port = 3000;

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

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
            model: 'gemini-3.8-flash',
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

app.post('/api/ask-pdf', upload.single('pdf'), async (req, res) => {


    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    const questions = req.body?.question;




    console.log("Question:", JSON.stringify(questions));
    console.log("Is valid string:", typeof question === 'string' && question.trim().length > 0);
    if (typeof questions !== 'string' || !questions.trim()) {
        return res.status(400).json({
            error: 'Please provide valid question'
        });
    }

    if (!req.file) {
        return res.status(400).json({
            error: 'Please provide a valid PDF file'
        });
    }

    let parser;
    try {
        console.log("Starting PDF parser...");

        parser = new PDFParse({
            data: req.file.buffer
        });

        console.log("Parser created. Extracting text...");

        const result = await parser.getText();

        console.log("PDF parsing completed.");

        const Pdftext = result.text.trim();

        console.log("Extracted PDF text length:", Pdftext.length);
        console.log("Extracted PDF text preview:", Pdftext.slice(0, 500));

        if (!Pdftext) {
            return res.status(400).json({
                error: "No readable content was found in the PDF"
            })
        }
        const prompt = `
        Use the PDF content provided below to answer the user's question.
        Treat the PDF as the reference source.
        If the answer is not available in the PDF, clearly tell the user that the answer is not available in the PDF.
        PDF content :${Pdftext}
        User's question:${questions}`;
    } catch (error) {
        console.log("Error message : ", error.message);
        return res.status(500).json({
            error: "failed to process the pdf or generate an answer"
        });
    }
    finally {
        if (parser) {
            await parser.destroy().catch(() => { });
        }
    }

})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});