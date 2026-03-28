const express = require("express");
const app = express();
const db = require("./db");
require("dotenv").config();


const requiredEnvs = ["MONGO_URL", "JWT_SECRET", "GEMINI_API_KEY"];

const missingEnvs = requiredEnvs.filter((key) => {
  const value = process.env[key];
  return !value || value.trim() === "";
});

if (missingEnvs.length > 0) {
  console.error("Missing required environment variables:");
  missingEnvs.forEach((key) => console.error(`- ${key}`));
  process.exit(1);
}


app.use(express.json());
const {generateToken,jwtAuthMiddleware} = require("./jwt");
const userRoutes = require("./routes/userRoutes");
app.use("/user",userRoutes);
const promptRoutes = require("./routes/promptRoutes");
app.use("/prompt", jwtAuthMiddleware, promptRoutes);
app.get("/",(req,res)=>{
    res.send("hii")
})
const Port = process.env.PORT || 3000;
app.listen(Port, ()=>{
    console.log("project is live")
})