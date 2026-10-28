require('dotenv').config();
const cors=require("cors");
const express = require('express');
const {GoogleGenAI}=require('@google/genai');
const app = express();
const port = 3000;

const ai=new GoogleGenAI({
    apiKey:process.env.GEMINI_API_KEY
});

app.use(express.json());
app.use(cors({origin:"http://localhost:5173"}));

app.get('/api/hello', (req, res) => {
  res.json({
    message:"Hello form my first API",
    status:"success"
  });
});

app.post('/api/ask',async(req,res)=>{
    const question =req.body?.question;
    console.log("Req body: ",req.body);
   
        if(!question || typeof question !== "string" || !question.trim()) {
            res.status(400).json({
                Error:"Please provide valid question"
            })
        }
    try {
        const response=await ai.interactions.create({
            model:'gemini-3.8-flash',
            input:question
        });
        res.json({
            question:question,
            answer:response.output_text
        });
    } catch (error) {
        console.log("Gemini API error : ",error.message)
        res.status(500).json({
            error:'Failed to generate an AI response'
        });
    }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});