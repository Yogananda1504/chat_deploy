const express = require("express");
const router = express.Router();
const { getRoomdata } = require("../controllers/chatController");
const { generateToken,verifyToken } = require("../middleware/tokenUtils");
const cors = require("cors");

router.use(cors());
// Route for fetching messages and active users in a room
router.use(express.json());

router.get("/chat/messages", getRoomdata);
//Generation of Token endpoint
router.post("/generate-token", generateToken, (req, res) => {
	try {
		const token = req.token;
		return res.status(200).json({ token });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});
// Renew token endpoint
router.post("/chat/renew-token", verifyToken, generateToken, (req, res) => {
	try {
		const token = req.token;
		return res.status(200).json({ token });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

module.exports = router;
