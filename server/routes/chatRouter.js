const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { TokenGenerator } = require("../controllers/TokenGenerator");
const cors = require("cors");

router.use(cors());
// Route for fetching messages and active users in a room
router.use(express.json());

router.get("/chat/messages", chatController.getRoomdata);
router.post("/generate-token", TokenGenerator);

module.exports = router;
