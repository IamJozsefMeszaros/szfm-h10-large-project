const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

function auth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Hiányzó token'});

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch {
        res.status(401).json({ error: 'Érvénytelen token' });
    }
}

router.get('/', auth, async (req, res) => {
    const user = await User.findbyId(req.userId).select('-password');
    req.json(user);
})

router.put('/', auth, async (req, res) => {
    const { username, bio } = req.body;
    const user = await User.findByIdAndUpdate(
        req.userId,
        { username, bio },
        { new: true }
    ).select('-password');
    res.json(user);
});

module.exports = router;