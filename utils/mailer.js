// Production Launch v1.0.0 - Optimized AI Chatbot
const nodemailer = require("nodemailer");
require("dotenv").config();

// Create transporter using environment variables
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true", // true for 465, false for 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationEmail = async (email, otp) => {
    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || "GenBot"}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
        to: email.trim().toLowerCase(),
        subject: "🤖 Verify Your GenBot Account",
        text: `Your GenBot verification OTP is: ${otp}. It will expire in 10 minutes.`,
        html: `
            <div style="font-family: 'Inter', sans-serif; padding: 2rem; background-color: #f5f5f5; color: #111;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 2rem; border: 1px solid #e5e5e5; border-radius: 8px;">
                    <h2 style="font-size: 22px; text-transform: uppercase; margin-bottom: 1.5rem; color: #111; font-weight: 700; letter-spacing: 0.05em;">🤖 Verify Your GenBot Account</h2>
                    <p>Thank you for signing up for GenBot! Please use the following One-Time Password (OTP) to verify your email address:</p>
                    <div style="background-color: #111; color: #fff; padding: 1rem; text-align: center; font-size: 26px; font-weight: 700; letter-spacing: 0.15em; margin: 1.5rem 0; border-radius: 4px;">
                        ${otp}
                    </div>
                    <p style="font-size: 13px; color: #8e8e93; line-height: 1.5;">This verification code is valid for 10 minutes. If you did not register for a GenBot account, you can safely ignore this email.</p>
                </div>
            </div>
        `
    };
    return transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail };
