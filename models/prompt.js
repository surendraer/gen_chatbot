// Production Launch v1.0.0 - Optimized AI Chatbot
const mongoose = require("mongoose");

const promptSchema = new mongoose.Schema({
    textPrompt: {
        type: String,
        required: true
    },
    textAnswer: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    conversationId: {
        type: String,
        required: false
    }
}, { timestamps: true });

promptSchema.index({ userId: 1, conversationId: 1 });

const Prompt = mongoose.model("Prompt", promptSchema);
module.exports = Prompt;