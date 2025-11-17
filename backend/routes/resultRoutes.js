const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const QuizResult = require('../models/QuizResult');

/**
 * @swagger
 * /quiz/all-games:
 *   get:
 *     summary: Összes játék lekérése
 *     responses:
 *       200:
 *         description: Sikeres lekérés
 *       404:
 *         description: Nincs rögzített kvíz
 *       500:
 *         description: Szerver hiba
 */

router.get('/my-games', auth, async (req, res) => {
    try {
        const userId = req.userId;
        const games = await QuizResult.find({ userId });
        if (!games || games.length === 0) return res.status(404).json({ error: 'Nincs játékod rögzítve' });

        const result = games.map(game => ({
            quizId: game.quizId,
            score: game.score,
            level: game.level,
            date: game.date
        }));

        res.json(result);
    }
    catch (err) { res.status(500).json({ error: 'Hiba történt a játékok lekérésekor' }); }
});

/**
 * @swagger
 * /quiz/all-games:
 *   get:
 *     summary: Összes játék lekérése
 *     responses:
 *       200:
 *         description: Sikeres lekérés
 *       404:
 *         description: Nincs rögzített kvíz
 *       500:
 *         description: Szerver hiba
 */

router.get('/all-games', async (req, res) => {
    try{
        const games = (await QuizResult.find()).populate('userId', 'username');
        if (!games || games.length === 0) return res.status(404).json({ error: 'Nincs rögzített kvíz' });

        const result = games.map(games => ({
            quizId: game.quizId,
            username: game.userId.username,
            score: game.score,
            level: game.level,
            date: game.date
        }));

        res.json(result);
    }
    catch (err) { res.status(500).json({ error: 'Hiba történt az összes játék lekérésekor' }); }
});

/**
 * @swagger
 * /quiz/{quizId}/questions:
 *   get:
 *     summary: Kvíz kérdéseinek lekérése
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sikeres lekérés
 *       404:
 *         description: Nincs ilyen kvíz
 *       500:
 *         description: Szerver hiba
 */

router.get('/quiz/:quizId/questions', async (req, res) => {
    try {
        const quizId = req.params.quizId;
        const quizResult = await QuizResult.findOne({ quizId });
        if (!quizResult) return res.status(404).json({ error: 'Nincs ilyen kvíz' });

        const questions = quizResult.answers.map(a => ({
            question: a.question,
            options: a.options
        }));

        res.json({
            quizId: quizResult.quizId,
            questions
        });
    }
    catch (err) { res.status(500).json({ error: 'Hiba történt a lekérés során' }); }
})

module.exports = {
    router,
    auth
};