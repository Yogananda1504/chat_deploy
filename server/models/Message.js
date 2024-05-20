const mongoose = require("mongoose"); //// Define message model

const Message = mongoose.model("Message", {
	username: String,
	message: String,
	room: String,
});

module.exports = Message;
