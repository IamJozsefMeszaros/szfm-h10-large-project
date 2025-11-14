require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = () => {
    mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(() => console.log("MongoDB connected"))
        .catch((err) => console.error("MongoDB error: ", err));
}

module.exports = connectDB;