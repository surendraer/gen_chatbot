const mongoose = require("mongoose");

const promptSchema = new mongoose.Schema({
    textPrompt: {
        type: String,
        required: true
    },
    textAnswer: {
        type: String,
        required: true
    }

});

const Prompt = mongoose.model("Prompt", promptSchema);
module.exports = Prompt;