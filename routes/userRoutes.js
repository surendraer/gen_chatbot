const express = require("express");
const User = require("../models/user");
const { generateToken, jwtAuthMiddleware } = require("../jwt");
const router = express.Router();

function toPublicUser(userData) {
    if (!userData) return null;

    return {
        id: userData._id,
        name: userData.name,
        userName: userData.userName,
        age: userData.age,
        email: userData.email,
        mobile: userData.mobile
    };
}
// signup
router.post("/signup", async (req, res) => {

    try {
        const data = req.body;

        const name = (data.name || "").trim();
        const userName = (data.userName || "").trim();
        const email = (data.email || "").trim().toLowerCase();
        const mobile = String(data.mobile || "").trim();
        const password = (data.password || "").trim();
        const age = Number(data.age);

        if (!name || !userName || !email || !mobile || !password || Number.isNaN(age)) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        if (name.length < 2 || name.length > 50) {
            return res.status(400).json({ success: false, message: "Name must be between 2 and 50 characters" });
        }
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(userName)) {
            return res.status(400).json({
                success: false,
                message: "Username must be 3-20 chars and contain only letters, numbers, underscore"
            });
        }
        if (!Number.isInteger(age) || age < 13 || age > 120) {
            return res.status(400).json({ success: false, message: "Age must be an integer between 13 and 120" });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }
        if (!/^\d{10}$/.test(mobile)) {
            return res.status(400).json({ success: false, message: "Mobile must be exactly 10 digits" });
        }
        if (
            password.length < 8 ||
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password) ||
            !/[0-9]/.test(password) ||
            !/[^A-Za-z0-9]/.test(password)
        ) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 chars and include uppercase, lowercase, number, special character"
            });
        }

        data.name = name;
        data.userName = userName;
        data.email = email;
        data.mobile = mobile;
        data.password = password;
        data.age = age;

        const newUser = new User(data);
        const response = await newUser.save();

        const payload = {
            id: response.id
        };

        const token = generateToken(payload);

        console.log("User registered successfully!!!");
        res.status(201).json({
            success: true,
            message: "User Registered successfully",
            data: {

                response: toPublicUser(response),
                token: token
            }
        });
    } catch (error) {
        console.log("error in registering user : " + error);
        res.status(500).json({ success: false, message: "user not registered" });
    }
});
//password reset
router.post("/password/reset", jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        if (currentPassword.trim() == "" || newPassword.trim() == "") {
            return res.status(400).json({
                success: false,
                message: "password field cant be empty"
            })
        };
        if (
            newPassword.length < 8 ||
            !/[A-Z]/.test(newPassword) ||
            !/[a-z]/.test(newPassword) ||
            !/[0-9]/.test(newPassword) ||
            !/[^A-Za-z0-9]/.test(newPassword)
        ) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 chars and include uppercase, lowercase, number, special character"
            });
        }
        const user = await User.findById(userId);
        if (!await user.comparePassword(currentPassword)) {
            return res.status(400).json({
                success: false,
                message: "current password is wrong"
            })
        };

        user.password = newPassword;
        await user.save();
        res.status(200).json({
            success: true,
            message: "password reset successfully"
        })
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "problem in resetting password"
        });

    }
})

// forgot password (need email verification for this so i have to it later);
// profile update

//profile delete
// need to add password validation later
router.delete("/profile/delete", jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const response = await User.findByIdAndDelete(userId);
        res.status(200).json({
            success: true,
            message: "user deleted successfully",
            data: response
        })
    } catch (error) {
        res.status(500).json({ success: false, message: "internal server error" });

    }
})


// login 

router.post("/login", async (req, res) => {
    try {
        const { userName, password } = req.body;
        if (!userName.trim() || !password.trim()) {
            return res.status(400).json({ success: false, message: "invalid login credentials" });
        }
        const user = await User.findOne({ userName: userName });

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        const isPasswordMatch = await user.comparePassword(password)
        if (!isPasswordMatch) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }

        const payload =
        {
            id: user.id
        };
        const token = generateToken(payload);
        res.status(200).json({
            success: true,
            message: "User log in successful",
            data: {
                response: toPublicUser(user),
                token: token
            }
        });
    } catch (error) {
        console.log("error in logging in: " + error);
        res.status(500).json({ success: false, message: "cant login the user" });
    }
})

// user profile
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user.id;
        const user = await User.findById(userData);

        if (!user) {
            return res.status(404).json({ success: false, message: "user not found" })
        }

        res.status(200).json({
            success: true,
            message: "User Data fetched successfully",
            data: {
                response: toPublicUser(user)
            }
        });
    } catch (error) {
        console.log("error in profile finding: " + error);
        res.status(500).json({
            success: false,
            message: "error in finding the profile"
        });
    }
});

module.exports = router;
