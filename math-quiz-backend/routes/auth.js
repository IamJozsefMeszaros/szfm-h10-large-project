const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
	const { username, email, password } = req.body;
	try {
		const hashed = await bcrypt.hash(password, 10);
		const user = new User({ username, email, password: hashed });
		await user.save();
		res.status(201).json({ message: 'Sikeres regisztráció' });
	} catch (err) {
		res.status(400).json({ error: 'Hiba a regisztráció során' });
	}
});

router.post('/login', async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) return res.status(400).json({ error: 'Hibás email vagy jelszó' });
		
		const match = await bcrypt.compare(password, user.password);
		if (!match) return res.status(400).json({ error: 'Hibás email vagy jelszó' });

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
		res.json({ token });
	} catch (err) {
		res.status(500).json({ error: 'Szerverhiba' });
	}
	});

module.exports = router;