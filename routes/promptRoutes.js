const express = require("express");
const router = express.Router();
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post("/", async (req, res) => {

    try {
        const prompt = req.body.prompt;
        if (!prompt) {
            return res.status(400).json({ success: false, message: "Empty prompt" });
        }

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });

        console.log(response.text);
        res.status(200).json({
            success: true,
            message: "answer generated successfully",
            data: {
                answer: response.text
            }
        });
        console.log(response.text);

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }


})

module.exports = router;