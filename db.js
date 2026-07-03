const mongoose = require("mongoose");
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();
const mongoUrl = process.env.MONGO_URL;


// Reject the promise so the crash is visible, rather than silently hanging
mongoose.connect(mongoUrl).catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
});

const db = mongoose.connection;

db.on("connected", () => {
    console.log("Database connected successfully !!!!!");
});

db.on("disconnected", () => {
    console.log("Database is disconnected");
});

db.on("error", (error) => {
    console.error("Database error:", error);
});

module.exports = db;