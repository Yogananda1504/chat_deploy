const mongoose = require("mongoose");

const Rooms = mongoose.model("Rooms", {
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now ,expires: '2d'},
});

module.exports = Rooms;