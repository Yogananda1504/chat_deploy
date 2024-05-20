const jwt = require("jsonwebtoken");
const JWT_SECRET = "secret";

exports.TokenGenerator = async (req, res) => {
	const payload = {
		username: req.query.user,
		room: req.query.room,
	}
	
	try {
		const token = jwt.sign(payload, JWT_SECRET);
		console.log(token);
		return res.status(200).json({ token });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};