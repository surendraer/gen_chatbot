const express = require("express");
const User = require("../models/user");
const {generateToken,jwtAuthMiddleware} = require("../jwt");
const router = express.Router();

// signup
router.post("/signup", async (req,res)=>{

    try {
        const data = req.body;
        const newUser = new User(data);
        const response = await newUser.save();

        const payload = {
            id: response.id
        };

        const token = generateToken(payload);

        console.log("User registered successfully!!!");
        res.status(200).json({response: response, token: token});
    } catch (error) {
        console.log("error in registering user : "+error);
        res.status(500).json({message: "user not registered"});
    }
});

// login 

router.post("/login", async (req,res)=>{
    try {
        const {userName,password} = req.body;
        const user = await User.findOne({userName:userName});

        if(!user){
            return res.status(401).json({message: "User not found"});
        }

        const isPasswordMatch = await user.comparePassword(password)
        if(! isPasswordMatch){
            return res.status(401).json({message: "Invalid password"});
        }

        const payload = 
        {
            id: user.id
        };
        const token = generateToken(payload);
        res.status(200).json(token);
    } catch (error) {
        console.log("error in logging in: "+ error);
        res.status(500).json({message: "cant login the user"});
    }
})

// user profile
router.get("/profile", jwtAuthMiddleware, async (req,res)=>{
    try {
        const userData = req.user.id;
        const user = await User.findById(userData);

        res.status(200).json(user);
    } catch (error) {
        console.log("error in profile finding: "+error);
        res.status(500).json({message: "error in finding the profile"});
    }
});

module.exports = router;
