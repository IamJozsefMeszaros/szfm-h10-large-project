const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/user');
const router = express.Router();

/**
 * @swagger
 * /auth/generate-token:
 *   post:
 *     summary: Token generálása jelszó visszaállításhoz
 *     description: A felhasználó email címe alapján generál egy egyszer használatos token-t, amely 5 percig érvényes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Token sikeresen generálva
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token generálva"
 *                 token:
 *                   type: string
 *                   example: "a1b2c3"
 *       404:
 *         description: Felhasználó nem található
 *       500:
 *         description: Token generálási hiba
 */

router.post('/generate-token', async (req, res) => {
    const { email } = req.body;
    try
    {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'Felhasználó nem található' });

        const token = crypto.randomBytes(3).toString('hex');
        const expires = Date.now() + 5 * 60 * 1000;

        user.resetToken = token;
        user.resetTokenExpires = expires;
        await user.save();

        res.json({ message: 'Token generálva', token });
    }
    catch (err)
    {
        res.status(500).json({ error: 'Token generálási hiba', details: err.message });
    }
});

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Jelszó visszaállítása
 *     description: A felhasználó email, token és új jelszó megadásával visszaállíthatja a jelszavát.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               token:
 *                 type: string
 *                 example: "a1b2c3"
 *               newPassword:
 *                 type: string
 *                 example: "newSecurePassword123"
 *     responses:
 *       200:
 *         description: Jelszó sikeresen módosítva
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Jelszó sikeresen módosítva"
 *       400:
 *         description: Érvénytelen vagy lejárt token
 *       500:
 *         description: Jelszómódosítási hiba
 */

router.post('/reset-password', async (req, res) => {
    const { email, token, newPassword } = req.body;
    try
    {
        const user = await User.findOne({ email });
        if (!user || user.resetToken !== token || user.resetTokenExpires < Date.now()) {
            return res.status(400).json({ error: 'Érvénytelen vagy lejárt token' });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        user.resetToken = undefined;
        user.resetTokenExpires = undefined;
        await user.save();

        res.json({ message: 'Jelszó sikeresen módosítva' });
    }
    catch (err)
    {
        res.status(500).json({ error: 'Jelszómódosítási hiba', details: err.message });
    }
})

module.exports = { router };