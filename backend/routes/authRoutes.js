const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Felhasználó regisztráció
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sikeres regisztráció
 *       400:
 *         description: Hiba a regisztráció során
 */


router.post('/register', async (req, res) => {
	const { username, email, password } = req.body;
	try {
		const hashed = await bcrypt.hash(password, 10);
		const user = new User({ userId, username, email, password: hashed });
		await user.save();
		res.status(201).json({ message: 'Sikeres regisztráció' });
	}
	catch (err) {
		res.status(400).json({ error: 'Hiba a regisztráció során' });
	}
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Felhasználó bejelentkezés
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sikeres bejelentkezés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Hibás email vagy jelszó
 *       500:
 *         description: Szerverhiba
 */


router.post('/login', async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) return res.status(400).json({ error: 'Hibás email vagy jelszó' });
		
		const match = await bcrypt.compare(password, user.password);
		if (!match) return res.status(400).json({ error: 'Hibás email vagy jelszó' });

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
		res.json({ token });
	}
	catch (err) {
		res.status(500).json({ error: 'Szerverhiba' });
	}
});

module.exports = router;