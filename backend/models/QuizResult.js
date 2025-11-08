const mongoose = require('mongoose');

const QuizResultSchema = new mongoose.Schema({
    quizId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    level: { type: String, required: true },
    score: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    answers: [{ 
        question: String,
        options: [String],
        correctAnswerIndex: Number,
        selectedAnswerIndex: Number,
        correct: Boolean
     }]
}, { timestamps: true });

module.exports = mongoose.model('QuizResult', QuizResultSchema);