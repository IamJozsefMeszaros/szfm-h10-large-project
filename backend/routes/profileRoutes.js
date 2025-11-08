const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const UserInformation = require('../models/UserInformation');
const router = express.Router();
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * /api/profile/{userId}:
 *   get:
 *     summary: Bejelentkezett felhasználó profiljának lekérdezése
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: A felhasználó MongoDB ObjectId-ja
 *     responses:
 *       200:
 *         description: Felhasználói profil adatok
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInformation'
 *       404:
 *         description: Nincs információ a felhasználóról
 *       500:
 *         description: Szerverhiba
 */


router.get('/profile/:userId', auth, async (req, res) => {
    try
    {
        const profile = await UserInformation.findOne({ userId: req.userId });
        if (!info) return res.status(404).json({ error: 'Nincs információ a felhasználóról' });
        res.json(info);
    }
    catch (err)
    {
        res.status(500).json({ error: 'Szerverhiba', details: err.message });
    }
});

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Új felhasználói profil létrehozása
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstname
 *               - lastname
 *               - gender
 *               - birthOfDate
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               gender:
 *                 type: string
 *               birthOfDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Profil sikeresen létrehozva
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInformation'
 *       400:
 *         description: Az információ már létezik
 *       500:
 *         description: Mentési hiba
 */


router.post('/profile', auth, async (req, res) => {
    const { firstname, lastname, gender, birthOfDate } = req.body;
    try
    {
        const existing = await UserInformation.findOne({ userId: req.userId });
        if (existing) return res.status(400).json({ error: 'Az információ már létezik' });

        const info = new UserInformation({
            userId: req.userId,
            firstname,
            lastname,
            gender,
            birthOfDate
        });

        await info.save();
        res.status(201).json(info);
    }
    catch (err)
    {
        res.status(500).json({ error: 'Mentési hiba', details: err.message });
    }
});

/**
 * @swagger
 * /api/profile/info:
 *   put:
 *     summary: Felhasználói profil frissítése
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               gender:
 *                 type: string
 *               birthOfDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Profil sikeresen frissítve
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInformation'
 *       404:
 *         description: Nincs frissíthető információ
 *       500:
 *         description: Frissítési hiba
 */


router.put('/info', auth, (req, res) => {
    const { firstname, lastname, gender, birthOfDate } = req.body;
    try
    {
        const updated = UserInformation.findOneAndUpdate(
            { userId: req.userId },
            { firstname, lastname, gender, birthOfDate },
            { updatedAt: Date.now },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Nincs frissíthető információ' });
        res.json(updated);
    }
    catch (err)
    {
        res.status(500).json({ error: 'Frissítési hiba', details: err.message });
    }
})

module.exports = {
    router,
    auth
};