const express = require('express');
const dotenv = require('dotenv');


const app = express();
dotenv.config();


//API-k elérése
app.listen(process.env.PORT, (req, res) => {
    console.log(`Szerver fut a ${process.env.PORT} porton`);
});