const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();
const { auth } = require('../middleware/auth');

/**
 * @swagger
 * /api/users/:
 *   get:
 *     summary: Bejelentkezett felhasználó adatainak lekérdezése
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Felhasználói adatok (jelszó nélkül)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Szerverhiba
 */


// GET / → Authenticated felhasználó lekérdezése
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba' });
    }
});

/**
 * @swagger
 * /api/users/:
 *   put:
 *     summary: Felhasználói adatok frissítése (pl. felhasználónév, bio)
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Frissített felhasználói adatok
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Frissítési hiba
 */


// PUT / → Felhasználó frissítése
router.put('/', auth, async (req, res) => {
    const { username, bio } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            req.userId,
            { username, bio },
            { updatedAt: Date.now },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Frissítési hiba' });
    }
});

/**
 * @swagger
 * /api/users/:
 *   delete:
 *     summary: Felhasználó törlése
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Felhasználó sikeresen törölve
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Felhasználó nem található
 *       500:
 *         description: Törlési hiba
 */


// DELETE / → Felhasználó törlése
router.delete('/', auth, (req, res) => {
    try{
        const deletedUser = User.findByIdAndDelete(req.userId);
        if (!deletedUser) { return res.status(404).json({ error: 'Felhasználó nem található' }); }
        res.json({ message: 'Felhasználó sikeresen törölve' });
    }
    catch (err) { res.status(500).json({ error: 'Törlési hiba', details: err.message }); }
});

/**
 * @swagger
 * /api/users/password:
 *   put:
 *     summary: Felhasználó jelszavának módosítása
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Jelszó sikeresen módosítva
 *       400:
 *         description: Hiányzó mezők
 *       401:
 *         description: Hibás régi jelszó
 *       404:
 *         description: Felhasználó nem található
 *       500:
 *         description: Jelszómódosítási hiba
 */


//PUT /password → Felhasználó jelszavának frissítése
router.put('/password', auth, async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Mindkét jelszó szükséges' });

    try
    {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'Felhasználó nem található' });

        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) return res.status(401).json({ error: 'Hibás régi jelszó' });

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        res.json({ message: 'Jelszó sikeresen módosítva' });
    }
    catch (err)
    {
        res.status(500).json({ error: 'Jelszómódosítási hiba', details: err.message });
    }
})

module.exports = {
    router,
    auth
};
