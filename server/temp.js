const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIO = require("socket.io");
const mongoose = require("mongoose");
const redisAdapter = require("socket.io-redis");
const path = require("path");
require('dotenv').config();

// Require routers
const chatRouter = require("./routes/chatRouter");

// Require socket controller
const { handleSocketEvents } = require("./controllers/socketController");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: process.env.AZURE_DOMAIN || "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGO_DB_URI = process.env.MONGO_DB_URI || "mongodb://127.0.0.1:27017/chat";
mongoose.connect(MONGO_DB_URI, {
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
const buildPath = path.join(__dirname, "..", "client", "dist");
app.use(express.static(buildPath));

// Redirect any non-API routes to the front end's index.html
app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
});

// Configure Redis adapter for Socket.IO
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;
io.adapter(redisAdapter({ host: redisHost, port: redisPort }));

// Initialize socket controller
handleSocketEvents(io);

// Start the server on a worker process
const port = process.env.PORT || 4000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
