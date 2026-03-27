const express = require("express");
const User = require("../models/user");
const {generateToken,jwtAuthMiddleware} = require("../jwt");
const router = express.Router();
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({GEMINI_API_KEY: process.env.GEMINI_API_KEY});

router.post("/",async (req,res)=>{

    try {
    const prompt = req.body.prompt;
    if(!prompt){
        return res.status(400).json({message:"Empty prompt"});
    }

    const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    });

    console.log(response.text);
    res.status(200).json(response.text);
    console.log(response.text);  

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal server error"});
    }


})

module.exports = router;