const mongoose = require("mongoose");
require("dotenv").config();
const mongoUrl = process.env.MONGO_URL;

mongoose.connect(mongoUrl);

const db = mongoose.connection;

db.on("connected", ()=>{
    console.log("Database connected successfully !!!!!");
});

db.on("disconnected", ()=>{
    console.log("Database is disconnected");
});

db.on("error", (error)=>{
    console.log("Error occured during connecting the database: "+ error);
});

module.exports = db;