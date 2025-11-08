const mongoose = require('mongoose');

const UserInformationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true},
    firstname: { type: String, required: true},
    lastname: { type: String, required: true },
    gender: { type: String, required: true },
    birthOfDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('UserInformation', UserInformationSchema);