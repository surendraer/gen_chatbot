const express = require("express");
const router = express.Router();
const Prompt = require("../models/prompt");
require("dotenv").config();
const OpenAI = require("openai");
const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});
//const { GoogleGenAI } = require("@google/genai");
//const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post("/", async (req, res) => {
    try {
        const { prompt } = req.body;
        const userId = req.user.id;
        
        if (!prompt) {
            return res.status(400).json({ success: false, message: "Empty prompt" });
        }

        // 1. Set headers for Streaming (Server-Sent Events)
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        // Disable nginx buffering on Render — critical for SSE to work in production
        res.setHeader("X-Accel-Buffering", "no");

        // Flush headers immediately so the browser knows streaming has started
        if (res.flush) res.flush();

        // 2. Start the AI Stream
        const stream = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            stream: true,
        });

        let fullAnswer = "";

        // 3. Loop through chunks and send to frontend
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                fullAnswer += content;
                // SSE format: data: { JSON string }\n\n
                res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
                // Force flush each chunk through nginx proxy
                if (res.flush) res.flush();
            }
        }

        // 4. Save to Database (History)
        const newPrompt = new Prompt({
            textPrompt: prompt,
            textAnswer: fullAnswer,
            userId: userId
        });
        await newPrompt.save();

        // 5. Final message to close stream
        res.write("data: [DONE]\n\n");
        res.end();

    } catch (error) {
        console.error("Streaming error:", error);
        // If headers haven't been sent yet, send a 500
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Internal server error" });
        } else {
            // Otherwise, send an error chunk to stop the frontend
            res.write(`data: ${JSON.stringify({ error: "Internal server error" })}\n\n`);
            res.end();
        }
    }
});






router.get("/history", async (req,res)=>{

    try {
        const prompts = await Prompt.find({userId: req.user.id});
        res.status(200).json({
        success:true,
        data: prompts
        });        
    } catch (error) {
        console.log("error in fetching user prompt history"+error);
        res.status(400).json({
            success:false,
            message:"error in finding user history"
        });
        
    }
});

router.delete("/clear", async (req, res) => {
    try {
        await Prompt.deleteMany({ userId: req.user.id });
        res.status(200).json({
            success: true,
            message: "History cleared successfully"
        });
    } catch (error) {
        console.error("Error clearing history:", error);
        res.status(500).json({
            success: false,
            message: "Failed to clear history"
        });
    }
});

module.exports = router;