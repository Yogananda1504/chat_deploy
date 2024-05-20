const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIO = require("socket.io");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Require routers
const chatRouter = require("./routes/chatRouter");
// const join_router = require("./routers/join_router");
// Require socket controller
const { handleSocketEvents } = require("./controllers/socketController");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
	cors: {
		origin: "http://localhost:5173", // Replace with your React app's origin.
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

// Initialize socket controller
handleSocketEvents(io);

const PORT = 4000;
server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
