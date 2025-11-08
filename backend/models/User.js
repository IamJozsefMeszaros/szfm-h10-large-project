const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	userId: { type: String, required: true, unique: true},
	username: { type: String, required: true, unique: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	bio: { type: String, default: '' },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
	resetToken: { type: String },
	resetTokenExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);