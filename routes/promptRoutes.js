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
        const prompt = req.body.prompt;
        const userId = req.user.id;
        if (!prompt) {
            return res.status(400).json({ success: false, message: "Empty prompt" });
        }

        // const response = await ai.models.generateContent({
        //     model: "gemini-3-flash-preview",
        //     contents: prompt,
        // });
        const response = await client.responses.create({
            model: "openai/gpt-oss-20b",
            input: prompt,
        });

        const newPrompt = new Prompt({
            textPrompt: prompt,
            textAnswer: response.text,
            userId : userId
        });

        await newPrompt.save();

        console.log(response.text);
        res.status(200).json({
            success: true,
            message: "answer generated successfully",
            data: {
                answer: response.output_text
            }
        });
        //console.log(response.text);
        console.log(response.output_text);

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
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

})

module.exports = router;