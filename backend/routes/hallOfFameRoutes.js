const express = require('express');
const router = express.Router();
const QuizResult = require('../models/QuizResult');
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * /api/hall-of-fame/me:
 *   get:
 *     summary: Bejelentkezett felhasználó saját eredményei szintenként csoportosítva
 *     tags:
 *       - Hall of Fame
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Eredmények szintenként csoportosítva
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/QuizResult'
 *       500:
 *         description: Szerverhiba
 */


router.get('/me', auth, async (req, res) => {
    try
    {
        const userId = req.userId;
        const results = (await QuizResult.find({ userId })).sort({ score: -1 });

        const grouped = results.reduce((acc, result) => {
            const level = result.level || 'Unknown';
            acc[level] = acc[level] || [];
            acc[level].push(result);
            return acc;
        }, {});

        res.json(grouped);
    }
    catch (err)
    {
        res.status(500).json({ error: 'Nem sikerült lekérni a saját eredményeket' });
    }
});

/**
 * @swagger
 * /api/hall-of-fame/global:
 *   get:
 *     summary: Minden felhasználó toplistás eredményei pontszám szerint
 *     tags:
 *       - Hall of Fame
 *     responses:
 *       200:
 *         description: Top 100 eredmény
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/QuizResult'
 *       500:
 *         description: Szerverhiba
 */


router.get('/global', async (req, res) => {
    try
    {
        const results = await QuizResult.find()
            .populate('userId', 'username email')
            .sort({ score: -1})
            .limit(100);

        res.json(results);
    }
    catch (err)
    {
        res.status(500).json({ error: 'Nem sikerült lekérni a toplistát' });
    }
});

module.exports = { router, auth };