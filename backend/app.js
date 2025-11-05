const express = require('express');
const app = express();
const PORT = 11000;

app.listen(PORT, (req, res) => {
    res.send(`Server is running on ${PORT} port`);
})