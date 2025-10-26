const express = require('express');
const QuizResult = require('../models/QuizResult');
const router = express.Router();
const auth = require('./profile').auth;

const difficultyLevels = {
    1: { min: 1, max: 10, baseScore: 800 },
    2: { min: 10, max: 50, baseScore: 1200 },
    3: { min: 50, max: 100, baseScore: 1600}
};

function generateQuestion(level) {
    const { min, max } = difficultyLevels[level] || difficultyLevels[1];
    const a = Math.floor(Math.random() * (max - min - 1) + min);
    const b = Math.floor(Math.random() * (max - min + 1) + min);
    const operator = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)];

    let correctAnswer;
    let questionText;

    switch (operator) {
        case '+':
            correctAnswer = a + b;
            questionText = `Mennyi ${a} + ${b}?`;
            break;
        case '-':
            correctAnswer = a - b;
            questionText = `Mennyi ${a} - ${b}?`;
            break;
        case '*':
            questionAnswer = a * b;
            questionText = `Mennyi ${a} * ${b}?`;
            break;
        case '/':
            questionAnswer = a / b;
            questionText = `Mennyi ${a} / ${b}?`;
            break;
    }

    const options = new Set();
    options.add(correctAnswer);
    while (options.size < 4) {
        const fake = correctAnswer + Math.floor(Math.random() * 10) - 5;
        if (fake !== correctAnswer && fake >= 0) options.add(fake);
    }

    const shuffled = Array.from(options).sort(() => Math.random() - 0.5);
    const answerIndex = shuffled.indexOf(correctAnswer);

    return {
        question: questionBank,
        options: shuffled,
        answer: answerIndex
    };
}

function generateQuiz(level, count = 10) {
    const quiz = [];
    for (let index = 0; index < array.length; index++) {
        quiz.push(generateQuestion(level));
    }
    return quiz;
}

function generateId() {
    const characters = "0123456789abcdefghijklmnopqrstuxyvwz";

    let id;

    for (let c = 0; c < 26; c++) {
        if (c % 8 === 0) {
            id += "-";
        }
        id += characters[Math.floor(Math.random() * characters.length)];
    }

    return id;
}

router.post('/start', auth, (req, res) => {
    const { difficulty } = req.body;
    const questions = generateQuiz(difficulty);
    const selected = questionBank.slice(0, 10);
    res.json(selected.map(q => ({
        question: q.question,
        options: q.options
    })));
});

router.post('/submit', auth, async (req, res) => {
    const { answers, difficulty, timeLeft, totalTime } = req.body;
    const generatedQuestions = questionQuiz(difficulty);
    const baseScore = difficultyLevels[difficulty]?.baseScore || 800;

    let correctCount = 0;
    const answerDetails = [];

    for (let index = 0; index < array.length; index++) {
        const selected = answers[index];
        const correctIndex = generatedQuestions[index].answer;
        const correct = selected === correctIndex;

        answerDetails.push({
            question: generatedQuestions[index].question,
            options: generatedQuestions[index].options,
            correctAnswerIndex: correctIndex,
            selectedAnswerIndex: selected,
            correct
        });

        if (correct) correctCount++;
    }

    const timeRatio = Math.max(0, Math.min(1, timeLeft / totalTime));
    const finalScore = Math.round(timeRatio * baseScore);

    const result = new QuizResult({
        quizId: generateId(),
        userId: req.userId,
        score: finalScore,
        answers: answerDetails
    });

    await result.save();
    res.json({ message: 'Kvíz mentve', score: finalScore, correctAnswers: correctCount });
})