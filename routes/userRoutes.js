// Production Launch v1.0.0 - Optimized AI Chatbot
const express = require("express");
const User = require("../models/user");
const { generateToken, jwtAuthMiddleware } = require("../jwt");
const { sendVerificationEmail } = require("../utils/mailer");
const router = express.Router();

function toPublicUser(userData) {
    if (!userData) return null;

    return {
        id: userData._id,
        name: userData.name,
        userName: userData.userName,
        email: userData.email,
        mobile: userData.mobile
    };
}

// check username availability
router.get("/check-username/:username", async (req, res) => {
    try {
        const userName = req.params.username.trim();
        if (!userName) {
            return res.status(400).json({ success: false, message: "Username is required" });
        }
        const user = await User.findOne({ userName: userName });
        if (user) {
            return res.status(200).json({ success: true, available: false, message: "Username is already taken" });
        }
        return res.status(200).json({ success: true, available: true, message: "Username is available" });
    } catch (error) {
        console.error("Error checking username availability:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// signup
router.post("/signup", async (req, res) => {

    try {
        const data = req.body;

        const name = (data.name || "").trim();
        const userName = (data.userName || "").trim();
        const email = (data.email || "").trim().toLowerCase();
        const mobile = String(data.mobile || "").trim();
        const password = (data.password || "").trim();

        if (!name || !userName || !email || !mobile || !password) {
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

        // Check for existing user
        const existingUser = await User.findOne({
            $or: [
                { email: email },
                { userName: userName },
                { mobile: mobile }
            ]
        });

        if (existingUser) {
            let conflictMsg = "User already exists";
            if (existingUser.email === email) conflictMsg = "Email is already registered";
            else if (existingUser.userName === userName) conflictMsg = "Username is already taken";
            else if (existingUser.mobile === mobile) conflictMsg = "Mobile number is already registered";
            
            return res.status(409).json({ success: false, message: conflictMsg });
        }

        data.name = name;
        data.userName = userName;
        data.email = email;
        data.mobile = mobile;
        data.password = password;

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        data.isVerified = false;
        data.emailVerificationOtp = otp;
        data.otpExpiresAt = otpExpiresAt;

        const newUser = new User(data);
        const response = await newUser.save();

        try {
            await sendVerificationEmail(email, otp);
            console.log(`Verification email sent with OTP: ${otp}`);
        } catch (mailError) {
            console.error("Mailer error on signup:", mailError);
        }

        console.log("User registered (unverified) successfully!!!");
        res.status(201).json({
            success: true,
            message: "User registered. Please verify your email.",
            email: email
        });
    } catch (error) {
        console.error("error in registering user :", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
//password reset
router.post("/password/reset", jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword || currentPassword.trim() === '' || newPassword.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "password field cant be empty"
            });
        }
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
// handle the password chnage (dont allow it)
router.put("/profile/update", jwtAuthMiddleware, async(req,res)=>{
    try {
        const userId = req.user.id;
        const newData = req.body;

        // Strip sensitive fields
        const { password, _id, id, ...safeData } = newData;

        // Perform basic validation on updated fields if they exist
        if (safeData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeData.email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }
        if (safeData.mobile && !/^\d{10}$/.test(safeData.mobile)) {
            return res.status(400).json({ success: false, message: "Mobile must be exactly 10 digits" });
        }


        // Check for conflicts if unique fields are being updated
        if (safeData.email || safeData.userName || safeData.mobile) {
            const conflictQuery = [];
            if (safeData.email) conflictQuery.push({ email: safeData.email });
            if (safeData.userName) conflictQuery.push({ userName: safeData.userName });
            if (safeData.mobile) conflictQuery.push({ mobile: safeData.mobile });

            const conflict = await User.findOne({
                _id: { $ne: userId },
                $or: conflictQuery
            });

            if (conflict) {
                let msg = "One of the provided unique fields is already in use";
                if (conflict.email === safeData.email) msg = "Email already in use";
                else if (conflict.userName === safeData.userName) msg = "Username already taken";
                else if (conflict.mobile === safeData.mobile) msg = "Mobile already in use";
                return res.status(409).json({ success: false, message: msg });
            }
        }

        const response = await User.findByIdAndUpdate(userId, safeData, { returnDocument: 'after', runValidators: true });
        
        if (!response) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: toPublicUser(response)
        });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ success: false, message: "An error occurred while updating the profile" });
    }
})
//profile delete
// need to add password validation later
router.delete("/profile/delete", jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const response = await User.findByIdAndDelete(userId);
        if (!response) {
            return res.status(404).json({ success: false, message: "user not found" });
        }
        // Never return the deleted document — it contains the hashed password
        res.status(200).json({
            success: true,
            message: "user deleted successfully"
        });
    } catch (error) {
        console.error("Profile delete error:", error);
        res.status(500).json({ success: false, message: "internal server error" });
    }
})

// verify otp
router.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and OTP are required" });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: "User is already verified" });
        }

        if (user.emailVerificationOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid verification code" });
        }

        if (user.otpExpiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
        }

        user.isVerified = true;
        user.emailVerificationOtp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();

        // Login user immediately on successful verification
        const payload = { id: user.id };
        const token = generateToken(payload);

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            data: {
                response: toPublicUser(user),
                token: token
            }
        });
    } catch (error) {
        console.error("Error in verifying OTP:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// resend otp
router.post("/resend-otp", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: "User is already verified" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        user.emailVerificationOtp = otp;
        user.otpExpiresAt = otpExpiresAt;
        await user.save();

        await sendVerificationEmail(user.email, otp);

        res.status(200).json({
            success: true,
            message: "Verification OTP resent to your email"
        });
    } catch (error) {
        console.error("Error in resending OTP:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// login 

router.post("/login", async (req, res) => {
    try {
        const { userName, password } = req.body;
        if (!userName || !password || !userName.trim() || !password.trim()) {
            return res.status(400).json({ success: false, message: "invalid login credentials" });
        }
        // Trim but preserve case (usernames are case-sensitive in the schema)
        const user = await User.findOne({ userName: userName.trim() });

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        const isPasswordMatch = await user.comparePassword(password)
        if (!isPasswordMatch) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }

        if (!user.isVerified) {
            return res.status(403).json({ success: false, message: "Email is not verified. Please verify your email first.", email: user.email });
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
