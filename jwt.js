const jwt = require("jsonwebtoken");

const jwtAuthMiddleware = (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization) {
            return res.status(401).json({ success: false, message: "token not found" });
        }

        const token = authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Token verification error:", error.name);

        // Distinguish expired tokens from invalid ones
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
        }
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

const generateToken = (userData) => {
    const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: "7d" });
    return token;
};

module.exports = { generateToken, jwtAuthMiddleware };