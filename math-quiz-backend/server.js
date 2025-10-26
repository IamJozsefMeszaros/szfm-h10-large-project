const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: 'Túl sok kérés érkezett, próbáld újra később.'
});

app.use(cors({
    origin: 'http://localhost',
    credentials: true
}));
app.use(express.json());
app.use(limiter);
app.use(helmet());

const privateKey = fs.readFileSync('certs/key.pem', 'utf8');
const certificate = fs.readFileSync('certs/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/quiz', require('./routes/quiz'));

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        https.createServer(credentials, app).listen(443, () => {
            console.log('HTTPS szerver fut a 443-as porton');
        });
    })
    .catch(err => console.error('Adatbázis hiba: ', err));