const express = require("express");
const app = express();
const db = require("./db");
require("dotenv").config();
const bodyParser = require('body-parser');
app.use(express.json());
app.use(bodyParser.json());
const {generateToken,jwtAuthMiddleware} = require("./jwt");
const userRoutes = require("./routes/userRoutes");
app.use("/user",userRoutes);
const promptRoutes = require("./routes/promptRoutes");
app.use("/prompt", jwtAuthMiddleware, promptRoutes);
app.listen(3000, ()=>{
    console.log("project is live")
})