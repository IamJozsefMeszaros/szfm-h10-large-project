const express = require('express');
const app = express();
const PORT = process.env.port || 11000;

app.get('/', (req, res) => {
    res.send(`Server is running on ${PORT} port`);
});

app.listen(PORT, (req, res) => {
    console.log(`Server is running on ${PORT} port`);
});