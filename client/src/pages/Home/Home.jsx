import React, { useState, useEffect, useCallback } from 'react';
import './Home.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Home = ({ username, setUsername, room, setRoom, socket, activitystatus, setActivitystatus, leftstatus, setLeftstatus }) => {
    const navigate = useNavigate();
    const apiUrl = 'http://localhost:4000';
    const [isJoining, setIsJoining] = useState(false);
    const [isCustomRoom, setIsCustomRoom] = useState(false);
    const [isJoiningExistingRoom, setIsJoiningExistingRoom] = useState(false);

    const generateTokenAndJoinRoom = useCallback(async () => {
        try {
            const res = await axios.post(`${apiUrl}/api/generate-token?room=${room}&username=${username}`);
            const token = res.data.token;
            sessionStorage.setItem('token', token);
            socket.emit('join_room', { username, room });
            navigate(`/chat/${room}`);
        } catch (error) {
            console.error('Error generating token:', error);
            toast.error(error.response?.data?.message || 'Error generating token');
        } finally {
            setIsJoining(false);
        }
    }, [apiUrl, navigate, room, socket, username]);

    const checkRoomExists = useCallback(() => {
        return new Promise((resolve) => {
            socket.emit("check_room_exists", room);
            socket.once("room_exists", (exists) => {
                resolve(exists);
            });
        });
    }, [socket, room]);

    const joinRoom = async (e) => {
        e.preventDefault();
        if (isJoining) return;

        if (username.trim() === '' || room.trim() === '') {
            toast.error('Please enter both username and room');
            return;
        }

        setIsJoining(true);

        if (isCustomRoom && isJoiningExistingRoom) {
            const roomExists = await checkRoomExists();
            if (!roomExists) {
                toast.error('The room does not exist');
                setIsJoining(false);
                return;
            }
        }

        socket.emit('check_username', { username, room });
    };

    useEffect(() => {
        const handleUsernameTaken = (isTaken) => {
            if (isTaken) {
                toast.error('Username is already taken');
                setIsJoining(false);
            } else {
                generateTokenAndJoinRoom();
            }
        };

        socket.on('username_taken', handleUsernameTaken);

        return () => {
            socket.off('username_taken', handleUsernameTaken);
        };
    }, [socket, generateTokenAndJoinRoom]);

    useEffect(() => {
        if (!activitystatus) {
            toast.warn('Logged out due to inactivity');
            setActivitystatus(true);
            setTimeout(() => {
                window.location.reload();
            }, 5000);
        }
    }, [activitystatus, setActivitystatus]);

    useEffect(() => {
        if (leftstatus) {
            window.location.reload();
            setLeftstatus(false);
        }
    }, [leftstatus, setLeftstatus]);

    const handleRoomChange = (e) => {
        const selectedRoom = e.target.value;
        if (selectedRoom === 'custom') {
            setIsCustomRoom(true);
            setIsJoiningExistingRoom(false);
            setRoom('');
        } else if (selectedRoom === 'join_existing') {
            setIsCustomRoom(true);
            setIsJoiningExistingRoom(true);
            setRoom('');
        } else {
            setIsCustomRoom(false);
            setIsJoiningExistingRoom(false);
            setRoom(selectedRoom);
        }
    };

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
                    value={isCustomRoom ? (isJoiningExistingRoom ? 'join_existing' : 'custom') : room}
                    onChange={handleRoomChange}
                    required
                >
                    <option value="" hidden disabled>Select Room</option>
                    <option value="custom">Create Custom Room</option>
                    <option value="join_existing">Join Existing Room</option>
                    <option value="MongoDB">MongoDB</option>
                    <option value="NodeJs">NodeJs</option>
                    <option value="ReactJs">ReactJs</option>
                    <option value="JavaScript">JavaScript</option>
                </select>
                {isCustomRoom && (
                    <input
                        className='Devrooms_input'
                        type='text'
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        placeholder={isJoiningExistingRoom ? 'Enter existing room name...' : 'Enter new room name...'}
                        required
                    />
                )}

                <button className='DevRooms_button' type="submit" disabled={isJoining}>
                    {isJoining ? 'Joining...' : 'Join Room'}
                </button>
            </form>
            <ToastContainer />
        </div>
    );
};

export default Home;
