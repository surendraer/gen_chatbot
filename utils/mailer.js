// Production Launch v1.0.0 - Optimized AI Chatbot
const nodemailer = require("nodemailer");
require("dotenv").config();

// Helper to clean environment variables (strip inline comments and trim whitespace)
const cleanEnvVar = (val) => {
    if (!val) return "";
    return val.split("#")[0].trim();
};

const EMAIL_HOST = cleanEnvVar(process.env.EMAIL_HOST) || "smtp-relay.brevo.com";
const EMAIL_PORT = parseInt(cleanEnvVar(process.env.EMAIL_PORT) || "2525");
const EMAIL_SECURE = cleanEnvVar(process.env.EMAIL_SECURE) === "true";
const EMAIL_USER = cleanEnvVar(process.env.EMAIL_USER);
const EMAIL_PASS = cleanEnvVar(process.env.EMAIL_PASS);
const EMAIL_FROM_ADDRESS = cleanEnvVar(process.env.EMAIL_FROM_ADDRESS);
const EMAIL_FROM_NAME = cleanEnvVar(process.env.EMAIL_FROM_NAME) || "GenBot";

// Create transporter using cleaned environment variables
const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_SECURE, // true for 465, false for 587
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

const sendVerificationEmail = async (email, otp) => {
    const htmlContent = `
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
        `;

    const isBrevoAPI = EMAIL_PASS && EMAIL_PASS.startsWith("xsmtpsib-");

    if (isBrevoAPI) {
        try {
            const toEmail = email.trim().toLowerCase();

            const response = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                    "accept": "application/json",
                    "api-key": EMAIL_PASS,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    sender: {
                        name: EMAIL_FROM_NAME,
                        email: EMAIL_FROM_ADDRESS || EMAIL_USER
                    },
                    to: [
                        {
                            email: toEmail
                        }
                    ],
                    subject: "🤖 Verify Your GenBot Account",
                    htmlContent: htmlContent
                })
            });

            if (response.ok) {
                console.log(`Email successfully sent via Brevo HTTP API to ${toEmail}`);
                return response.json();
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error(`Brevo HTTP API returned status ${response.status}:`, errorData);
            }
        } catch (error) {
            console.error("Failed to send email via Brevo HTTP API:", error);
        }
    }

    // Fallback to SMTP if not Brevo API key or if HTTP request failed
    const mailOptions = {
        from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM_ADDRESS || EMAIL_USER}>`,
        to: email.trim().toLowerCase(),
        subject: "🤖 Verify Your GenBot Account",
        text: `Your GenBot verification OTP is: ${otp}. It will expire in 10 minutes.`,
        html: htmlContent
    };

    try {
        return await transporter.sendMail(mailOptions);
    } catch (smtpError) {
        console.error("SMTP delivery failed:", smtpError);
        // If we were using port 587, try auto-healing on port 2525
        if (EMAIL_PORT === 587) {
            console.log("Attempting auto-heal SMTP recovery on port 2525...");
            try {
                const backupTransporter = nodemailer.createTransport({
                    host: EMAIL_HOST,
                    port: 2525,
                    secure: false,
                    auth: {
                        user: EMAIL_USER,
                        pass: EMAIL_PASS
                    }
                });
                const backupResult = await backupTransporter.sendMail(mailOptions);
                console.log("SMTP backup delivery succeeded on port 2525!");
                return backupResult;
            } catch (backupError) {
                console.error("SMTP backup delivery on port 2525 also failed:", backupError);
            }
        }
        throw smtpError;
    }
};

module.exports = { sendVerificationEmail };
