const mongoose = require('mongoose');

const QuizResultSchema = new mongoose.Schema({
    quizId: { type: String, required: true },
    userId: { type: moongose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true },
    date: { type: Date, dafault: Date.now },
    answers: [{ 
        question: String,
        options: [String],
        correctAnswerIndex: Number,
        selectedAnswerIndex: Number,
        correct: Boolean
     }]
});

module.exports = mongoose.model('QuizResult', QuizResultSchema);