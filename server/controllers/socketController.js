// controllers/socketController.js

const Message = require("../models/Message");
const ActiveUser = require("../models/ActiveUser");

// Socket controller for handling socket events
exports.handleSocketEvents = (io) => {
	io.on("connection", (socket) => {
		console.log("New client connected");

		socket.on("pseudo_join", async ({ room }) => {
			socket.join(room);
		});

		socket.on("check_username", async ({ username, room }) => {
			console.log(`Checking if username ${username} is taken in room ${room}`);
			try {
				// Check if the username is already taken in the room
				const user = await ActiveUser.findOne({ username, room });
				if (user) {
					// If the username is taken, emit an event to the client
					socket.emit("username_taken", true);
				} else {
					// If the username is not taken, emit an event to the client
					socket.emit("username_taken", false);
				}
			} catch (error) {
				console.error("Error checking username:", error);
			}
		});

		socket.on("join_room", async ({ username, room }) => {
			console.log(`${username} is trying to join the room ${room}`);
			try {
				// Join the specified room
				socket.join(room);

				// Save active user to MongoDB
				const activeUser = new ActiveUser({ username, room });
				await activeUser.save();
				console.log("Active user saved to database");

				socket.emit("welcome_message", {
					username: "Admin",
					message: `Welcome ${username} to the room ${room}`,
				});
				// Broadcast to all users in the room about the new user
				socket.to(room).emit("system_message", {
					username: "Admin",
					message: `${username} has joined the room`,
				});

				// Send updated user list to all users in the room
				const activeUsersInRoom = await ActiveUser.find({ room });
				io.to(room).emit("chatroom_users", activeUsersInRoom);
			} catch (error) {
				console.error("Error joining room:", error);
			}
		});

		socket.on("leave_room", async ({ username, room }) => {
			console.log(`${username} is trying to leave the room ${room}`);
			try {
				// Find the user in the ActiveUsers collection
				const user = await ActiveUser.findOne({ username, room });
				if (user) {
					// Remove the user from the ActiveUsers collection
					await ActiveUser.deleteOne({ username, room });
					// Unsubscribe the user from the room
					socket.leave(room);
					// Broadcast to all users in the room about the user leaving
					socket.to(room).emit("left_room", {
						username: "Admin",
						message: `${username} has left the room`,
					});
					// Fetch updated user list from ActiveUsers collection
					const activeUsersInRoom = await ActiveUser.find({ room });
					// Send updated user list to all users in the room
					io.to(room).emit("chatroom_users", activeUsersInRoom);
				}
			} catch (error) {
				console.error("Error leaving room:", error);
			}
		});

		socket.on("send_message", async ({ username, message, room }, callback) => {
			try {
				console.log(`${username} is sending a message in the room ${room}`);
				// Save message to MongoDB
				const newMessage = new Message({ username, message, room });
				await newMessage.save();

				// Broadcast the message to all users in the room
				io.to(room).emit("receive_message", { username, message });
			} catch (error) {
				console.error("Error sending message:", error);
				// Invoke the callback with the error to handle it on the client side
				callback(error.message);
			}
		});

		socket.on("disconnect", async () => {
			console.log("Client disconnected");
			try {
				// If the user was in a room, handle leaving the room
				const user = await ActiveUser.findOne({ socketId: socket.id });
				if (user) {
					const { username, room } = user;

					// Remove the user from the ActiveUsers collection
					await ActiveUser.deleteOne({ username, room });

					// Broadcast to all users in the room about the user leaving
					socket.to(room).emit("left_room", {
						username: "Admin",
						message: `${username} has left the room`,
					});

					// Fetch updated user list from ActiveUsers collection
					const activeUsersInRoom = await ActiveUser.find({ room });

					// Send updated user list to all users in the room
					io.to(room).emit("chatroom_users", activeUsersInRoom);
				}
			} catch (error) {
				console.error("Error disconnecting:", error);
			}
		});
	});
};