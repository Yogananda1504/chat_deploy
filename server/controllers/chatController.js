const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const ActiveUser = require("../models/ActiveUser");
const jwt = require("jsonwebtoken"); // Corrected import name
const JWT_SECRET = "secret";

exports.getRoomdata = async (req, res) => {
    const room = req.query.room;
    
    try {
        const token = req.headers.authorization.split("Bearer ")[1];
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const token_room = decodedToken.room;
        if (token_room !== room) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        
        const messages = await Message.find({ room })
            .sort({ createdAt: -1 })
            .exec();
        const activeUsersInRoom = await ActiveUser.find({ room });
        res.json({ Messages: messages, users: activeUsersInRoom });
    } catch (error) {
        console.error("Error fetching data for room:", room, "Error:", error);
        res.status(500).json({
            error: "An error occurred while fetching data for room: " + room,
        });
    }
};



// const express = require("express");
// const router = express.Router();
// const Message = require("../models/Message");
// const ActiveUser = require("../models/ActiveUser");
// const JWT_SECRET = "secret";
// exports.getRoomdata = async (req, res) => {
// 	const room = req.query.room;
    
// 	try {
// 		const messages = await Message.find({ room })
// 			.sort({ createdAt: -1 })
// 			.exec();
// 		const activeUsersInRoom = await ActiveUser.find({ room });
// 		res.json({ Messages: messages, users: activeUsersInRoom });
// 	} catch (error) {
// 		console.error("Error fetching data for room:", room, "Error:", error);
// 		res.status(500).json({
// 			error: "An error occurred while fetching data for room: " + room,
// 		});
// 	}
// };