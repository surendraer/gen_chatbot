const express = require("express");
const app = express();
const db = require("./db");
require("dotenv").config();
const bodyParser = require('body-parser');
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