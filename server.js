const { GoogleGenAI } = require("@google/genai");
const express = require("express");
const app = express();
require("dotenv").config();
const ai = new GoogleGenAI({});
const bodyParser = require('body-parser');
app.use(express.json());
app.use(bodyParser.json());

app.post("/",async (req,res)=>{

    const prompt = req.body.prompt;

    const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  res.status(200).json(response.text);
  console.log(response.text);
})

app.listen(3000, ()=>{
    console.log("project is live")
})