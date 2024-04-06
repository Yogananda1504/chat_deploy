const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

app.use(cors());

// CSP configuration
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "font-src 'self' data:; script-src 'self'; default-src 'self'; connect-src 'self' http://localhost:4000 ws://localhost:4000;"
    );
    next();
});

app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// Simple API endpoint
app.get('/', async (req, res) => {
    await res.send('Hello, this is your API endpoint!');
});

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', // Replace with your React app's origin
        methods: ['GET', 'POST'],
    },
});

const mongoose = require("mongoose");
const localhost = "127.0.0.1";

// Connection creation and creation in the new db
mongoose.connect(`mongodb://${localhost}:27017/chat`);
const db = mongoose.connection;
db.on('error', (error) => { console.error('MongoDB connection error:', error); });
db.once('open', () => { console.log('Successfully connected to the Database'); });

const Message = mongoose.model('Message', {
    username: String,
    message: String,
    createdAt: { type: Date, default: Date.now },
});

let CHAT_BOT = 'ChatBot :)';
let allUsers = {}; // Use an object for better user tracking

io.on('connection', (socket) => {
    console.log(`User connected ${socket.id}`);

    socket.on('join_room', (data) => {
        console.log('User Clicked join room');
        const { username, room } = data;
        socket.join(room);

        // Update the users in that room
        
        allUsers[socket.id] = { username, room };
        const chatRoomUsers = Object.values(allUsers).filter((user) => user.room === room);
        console.log(chatRoomUsers);

        // Store the current room in the allUsers object
        allUsers[socket.id].currentRoom = room;

        io.to(room).emit('chatroom_users', chatRoomUsers);

        // Send a welcome message or any other initial messages if needed
        const welcomeMessage = `${username} joined the room!`;
        io.to(room).emit('receive_message', {
            message: welcomeMessage,
            username: CHAT_BOT, // or any other identifier for the bot
            time: Date.now(),
        });
    });

    // To handle the event of sending a message to the room and save it to the database
    socket.on('send_message', async (data) => {
        const { message, username, room, time } = data;
        try {
            const newMessage = new Message({
                message,
                username,
                room,
                createdAt: time,
            });

            await newMessage.save();
            console.log(newMessage);
            // Broadcast the message to all users in the room
            io.to(room).emit('receive_message', {
                message,
                username,
                time,
            });
        } catch (error) {
            console.error('Error saving message to MongoDB:', error);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        // Remove the user from the list on disconnect
        delete allUsers[socket.id];

        // Get the current room from the allUsers object
        const currentRoom = allUsers[socket.id]?.currentRoom;

        if (currentRoom) {
            // Update users in the room after disconnect
            const chatRoomUsers = Object.values(allUsers).filter((user) => user.room === currentRoom);
            io.to(currentRoom).emit('chatroom_users', chatRoomUsers);
        }
    });
});

server.listen(4000, () => console.log('Server is running on port 4000'));
