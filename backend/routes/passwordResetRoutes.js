const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/user');
const router = express.Router();

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