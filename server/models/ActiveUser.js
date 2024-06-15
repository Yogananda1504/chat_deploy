const mongoose = require("mongoose"); //// Define message model

const ActiveUser = mongoose.model("ActiveUser", {
	username: String,
	room: String,
	createdAt: { type: Date, default: Date.now, expires: '2d' },
});

module.exports = ActiveUser;

