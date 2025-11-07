require('dotenv').config();
const express = require('express');
const app = express();


app.get('/', (req, res) => {
    res.send(`Szerver fut a ${process.env.SERVER_PORT} porton`);
})


app.listen(process.env.SERVER_PORT, (req, res) => { 
    console.log(`Szerver fut a ${process.env.SERVER_PORT} porton`); 
});