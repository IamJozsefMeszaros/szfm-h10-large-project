const mongoose = require('mongoose');

const UserInformationSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true},
    firstname: { type: String, required: true},
    lastname: { type: String, required: true },
    gender: { type: String, required: true },
    birthOfDate: { type: Date, required: true }
});

module.exports = mongoose.model('UserInformation', UserInformationSchema);