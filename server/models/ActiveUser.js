const mongoose = require("mongoose"); //// Define message model

const ActiveUser = mongoose.model("ActiveUser", {
	username: String,
	room: String,
});

module.exports = ActiveUser;
