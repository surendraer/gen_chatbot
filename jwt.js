const jwt = require("jsonwebtoken");

const jwtAuthMiddleware = (req,res,next)=>{
    try {
        const authorization = req.headers.authorization;
        if(!authorization){
            return res.status(401).json({message: "token not found"});
        }

        const token = req.headers.authorization.split(" ")[1];
        if(!token){
            return res.status(401).json({message: "unauthorized"});
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        req.user = decoded;
        next();
    } catch (error) {
        console.log("error in token verification"+ error);
        res.status(500).json({error: "Invalid token"});
    }
};

const generateToken = (userData)=>{
    
        const token = jwt.sign(userData,process.env.JWT_SECRET);
        return token;
};

module.exports = {generateToken,jwtAuthMiddleware};