const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIO = require("socket.io");
const mongoose = require("mongoose");
const redisAdapter = require("socket.io-redis");
const path = require("path");

// Require routers
const chatRouter = require("./routes/chatRouter");

// Require socket controller
const { handleSocketEvents } = require("./controllers/socketController");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
	cors: {
		origin: "http://localhost:5173", // Replace with your React app's origin if needed.
		methods: ["GET", "POST"],
	},
});

app.use(cors());
app.use(express.json());

// MongoDB connection
const localhost = "127.0.0.1";
mongoose.connect(`mongodb://${localhost}:27017/chat`, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => {
	console.error("MongoDB connection error:", error);
});
db.once("open", () => {
	console.log("Successfully connected to the Database");
});

// Mount routers
app.use("/api", chatRouter);

// Serve static files from the React app's build directory
const buildPath = path.join(
	"C:",
	"workspace",
	"WebD",
	"chat_deploy",
	"client",
	"dist"
);
app.use(express.static(buildPath));

// Redirect any non-API routes to the front end's index.html
app.get("*", (req, res) => {
	res.sendFile(path.join(buildPath, "index.html"));
});

// Configure Redis adapter for Socket.IO
io.adapter(redisAdapter({ host: "localhost", port: 6379 }));

// Initialize socket controller
handleSocketEvents(io);

// Start the server on a worker process
server.listen(process.env.PORT || 4000, () => {
	const PORT = server.address().port;
	console.log(`Worker ${process.pid} started on port ${PORT}`);
});
