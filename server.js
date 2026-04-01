const express = require("express");
const app = express();
const db = require("./db");
require("dotenv").config();
const cors = require("cors");


const requiredEnvs = ["MONGO_URL", "JWT_SECRET", "GROQ_API_KEY"];

const missingEnvs = requiredEnvs.filter((key) => {
    const value = process.env[key];
    return !value || value.trim() === "";
});

if (missingEnvs.length > 0) {
    console.error("Missing required environment variables:");
    missingEnvs.forEach((key) => console.error(`- ${key}`));
    process.exit(1);
}


app.use(cors({
  origin: ["https://gen-chatbot-three.vercel.app", "http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
const {jwtAuthMiddleware } = require("./jwt");
const userRoutes = require("./routes/userRoutes");
app.use("/user", userRoutes);
const promptRoutes = require("./routes/promptRoutes");
app.use("/prompt", jwtAuthMiddleware, promptRoutes);
app.get("/", (req, res) => {
    res.send("hii")
})
const Port = process.env.PORT || 3000;
app.listen(Port, () => {
    console.log("project is live")
})