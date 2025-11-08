const express = require('express');
const connectDB = require('./conn/db');

require('dotenv').config();

const userRoutes = require('./routes/authRoutes');

connectDB();

const app = express();
app.use(express.json());


app.use('/api/register', userRoutes);
app.use('/api/profile/:username', userRoutes);



app.get('/', (req, res) => {
    res.send(`Szerver fut a ${process.env.SERVER_PORT} porton`);
})


app.listen(process.env.SERVER_PORT, (req, res) => { 
    console.log(`Szerver fut a ${process.env.SERVER_PORT} porton`); 
});