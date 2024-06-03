const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIO = require("socket.io");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// MongoDB connection
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
// Define message model
const Message = mongoose.model("Message", {
	username: { type: String, required: true },
	message: { type: String, required: true },
	room: { type: String, required: true },
	deletedForEveryone: { type: Boolean, default: false },
	deletedForMe: [{ type: String, default: [] }],
});

// Example ObjectIDs

const usernameToAdd = "exampleUser";

Message.updateOne(
	{ _id: "6652e13c7630a1c0ae1aa8fc" },
	{ $addToSet: { deletedForMe: usernameToAdd } }
)
	.then((result) => {
		if (result.nModified === 0) {
			console.log(
				"No documents were modified. Either the document was not found or the username was already present in the deleteForMe array."
			);
		} else {
			console.log("Update result:", result);
		}
	})
	.catch((error) => console.error("Error updating messages:", error));

const PORT = 4000;

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
