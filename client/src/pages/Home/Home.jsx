import React, { useState, useEffect } from 'react';
import './Home.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

const Home = ({ username, setUsername, room, setRoom, socket }) => {
    const navigate = useNavigate();

    const joinRoom = async (e) => {
        e.preventDefault();

        if (username.trim() === '' || room.trim() === '') {
            toast.error('Please enter both username and room');
            return;
        }

        // Emit an event to check if the username is already taken
        socket.emit('check_username', { username, room });
    };

    useEffect(() => {
        const handleUsernameTaken = (isTaken) => {
            if (isTaken) {
                toast.error('Username is already taken');
            } else {
                generateTokenAndJoinRoom();
            }
        };

        const generateTokenAndJoinRoom = async () => {
            try {
                const res = await axios.post(`http://localhost:4000/api/generate-token?room=${room}&username=${username}`);
                const token = res.data.token;
                localStorage.setItem('token', token);
                socket.emit('join_room', { username, room });
                navigate(`/chat/${room}`);
            } catch (error) {
                console.error('Error generating token:', error);
                toast.error('Error generating token');
            }
        };

        socket.on('username_taken', handleUsernameTaken);

        return () => {
            socket.off('username_taken', handleUsernameTaken);
        };
    }, [navigate, room, socket, username]);

    return (
        <div className='Container'>
            <h2>{'<>'}DevRooms{'</>'}</h2>
            <form onSubmit={joinRoom}>
                <input
                    className='Devrooms_input'
                    type='text'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder='Username...'
                    required
                />

                <select
                    className='DevRooms_options'
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    required
                >
                    <option value="" hidden disabled>Select Room</option>
                    <option value="MongoDB">MongoDB</option>
                    <option value="NodeJs">NodeJs</option>
                    <option value="ReactJs">ReactJs</option>
                    <option value="JavaScript">JavaScript</option>
                </select>
                <button className='DevRooms_button' type="submit"> Join Room </button>
            </form>
            <ToastContainer />
        </div>
    );
};

export default Home;