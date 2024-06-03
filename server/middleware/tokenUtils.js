const jwt = require("jsonwebtoken");
const JWT_SECRET = "secret";

const generateToken = async (req, res, next) => {
	try {
		let payload;
		if (req.user) {
			payload = { username: req.user.username, room: req.user.room };
		} else {
			payload = {
				username: req.query.username || req.params.username,
				room: req.query.room || req.params.room,
			};
		}

		const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
		console.log(token);
		req.token = token;
		next(); // Call the next middleware in the chain
	} catch (error) {
		console.error("Failed to generate token:", error);
		return res.status(500).json({ error: error.message });
	}
};

const verifyToken = async (req, res, next) => {
	const authorizationHeader = req.headers.authorization;

	if (!authorizationHeader) {
		return res.status(401).json({ message: "No token provided" });
	}

	const token = authorizationHeader.split("Bearer ")[1];

	if (!token) {
		return res.status(401).json({ message: "No token provided" });
	}

	try {
		const decodedToken = jwt.verify(token, JWT_SECRET);
		const tokenRoom = decodedToken.room;

		// Check if the room matches
		const { username, room } = req.params;
		if (tokenRoom !== room) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		// Attach user info to the request object
		req.user = decodedToken;
		next();//call next middleware in the chain
	} catch (error) {
		return res.status(403).json({ message: "Failed to authenticate token" });
	}
};

module.exports = { generateToken, verifyToken };
