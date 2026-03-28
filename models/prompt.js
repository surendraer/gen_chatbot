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
    }

});

const Prompt = mongoose.model("Prompt", promptSchema);
module.exports = Prompt;