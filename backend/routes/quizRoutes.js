const express = require('express');
const QuizResult = require('../models/QuizResult');
const router = express.Router();
const { auth } = require('../middleware/auth');

const difficultyLevels = {
    1: { min: 1, max: 10, baseScore: 800, timeLimit: 60},
    2: { min: 10, max: 50, baseScore: 1200, timeLimit: 45},
    3: { min: 50, max: 100, baseScore: 1600, timeLimit: 30}
};

const levelNames = {
    1: 'Beginner',
    2: 'Intermediate',
    3: 'Expert'
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
        correctAnswer = a * b;
        questionText = `Mennyi ${a} * ${b}?`;
        break;
    case '/':
        correctAnswer = a / b;
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
        question: questionText,
        options: shuffled,
        answer: answerIndex
    };
}

function generateQuiz(level, count = 10) {
    let quiz = [];
    for (let index = 0; index < count; index++) {
        quiz.push(generateQuestion(level));
    }
    return quiz;
}

/**
 * @swagger
 * /api/quiz/start:
 *   post:
 *     summary: Kvíz indítása adott nehézségi szinten
 *     tags:
 *       - Quiz
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - difficulty
 *             properties:
 *               difficulty:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 description: A kvíz nehézségi szintje
 *     responses:
 *       200:
 *         description: Kérdések és időkorlát visszaadása
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timeLimit:
 *                   type: integer
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       question:
 *                         type: string
 *                       options:
 *                         type: array
 *                         items:
 *                           type: string
 *       401:
 *         description: Hitelesítés szükséges
 */


router.post('/start', auth, (req, res) => {
    const { difficulty } = req.body;
    const questions = generateQuiz(difficulty);
    const timeLimit = difficultyLevels[difficulty]?.timeLimit || 60;

    res.json({
        timeLimit,
        questions: questions.map(q => ({
            question: q.question,
            options: q.options
        }))
    });
});

/**
 * @swagger
 * /api/quiz/submit:
 *   post:
 *     summary: Kvíz eredmény beküldése és pontszám kiszámítása
 *     tags:
 *       - Quiz
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answers
 *               - difficulty
 *               - timeLeft
 *               - totalTime
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: integer
 *               difficulty:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *               timeLeft:
 *                 type: number
 *               totalTime:
 *                 type: number
 *     responses:
 *       200:
 *         description: Eredmény mentve
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 score:
 *                   type: number
 *                 correctAnswers:
 *                   type: integer
 *       401:
 *         description: Hitelesítés szükséges
 *       500:
 *         description: Szerverhiba
 */


router.post('/submit', auth, async (req, res) => {
    const { answers, difficulty, timeLeft, totalTime } = req.body;
    const generatedQuestions = generateQuiz(difficulty);
    const baseScore = difficultyLevels[difficulty]?.baseScore || 800;

    let correctCount = 0;
    const answerDetails = [];

    for (let index = 0; index < answers.length; index++) {
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
        quizId: (() => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        })),
        userId: req.userId,
        level: levelNames[difficulty] || 'Unknown',
        score: finalScore,
        answers: answerDetails
    });

    await result.save();
    res.json({ message: 'Kvíz mentve', score: finalScore, correctAnswers: correctCount });
});

module.exports = {
    router,
    auth
};