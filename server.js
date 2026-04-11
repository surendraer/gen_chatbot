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


const rawOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(",") 
    : ["http://localhost:5173", "http://localhost:5174"];

const allowedOrigins = rawOrigins.map(origin => origin.trim().replace(/\/$/, ''));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const cleanOrigin = origin.trim().replace(/\/$/, '');
    if (allowedOrigins.includes(cleanOrigin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS:', cleanOrigin);
      callback(null, true); // Allow all for now to prevent strict CORS blocks until properly tested
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
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