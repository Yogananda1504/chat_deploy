import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Chat.css';

function Chat({ username, socket, joinRoom }) {
    const [message, setMessage] = useState('');
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const { room } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!socket || !room) return;

        socket.emit('pseudo_join', { username, room });

        return () => {
            // Cleanup function if needed
        };
    }, [socket, room, joinRoom, username]);

    useEffect(() => {
        if (!socket) return;

        socket.on('receive_message', handleMessage);
        socket.on('chatroom_users', handleUserList);
        socket.on('welcome_message', handleWelcomeMessage);
        socket.on('system_message', handleSystemMessage);
        socket.on('left_room', handleLeftRoom);

        return () => {
            socket.off('receive_message', handleMessage);
            socket.off('chatroom_users', handleUserList);
            socket.off('welcome_message', handleWelcomeMessage);
            socket.off('system_message', handleSystemMessage);
            socket.off('left_room', handleLeftRoom);
        };
    }, [socket, username, room]);

    useEffect(() => {
        if (!room || !socket) return;

        const fetchData = async () => {
            try {
                const res = await axios.get(`http://localhost:4000/api/chat/messages?room=${room}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                setReceivedMessages(res.data.Messages);
                setUsers(res.data.users);
            } catch (error) {
                if (error.response) {
                    const status = error.response.status;
                    if (status === 401) {
                        navigate('/Forbidden');
                    } else if (status === 404) {
                        navigate('/Not-found');
                    } else if (status === 500) {
                        navigate('/Internal-error');
                    } else {
                        console.error('Error fetching data:', error);
                        toast.error('Failed to fetch chat data');
                    }
                } else {
                    console.error('Error fetching data:', error);
                    toast.error('Failed to fetch chat data');
                }
            }
        };

        fetchData();

        return () => {
            // No cleanup needed for fetchData
        };
    }, [room, socket, navigate]);

    const handleMessage = (data) => {
        setReceivedMessages(prevMessages => [...prevMessages, data]);
    };

    const handleUserList = (data) => {
        setUsers(data);
    };

    const handleWelcomeMessage = (data) => {
        console.log(`Welcome ${username}`);
        toast.success(`Welcome ${username}`);
    };

    const handleSystemMessage = (data) => {
        setReceivedMessages(prevMessages => [...prevMessages, data]);
    };

    const handleLeftRoom = (data) => {
        setUsers(prevUsers => prevUsers.filter(user => user.username !== data.username));
        setReceivedMessages(prevMessages => [...prevMessages, data]);
    };

    const handleMessageSend = () => {
        if (message.trim() === '') return;

        socket.emit('send_message', {
            username: username,
            message: message,
            room: room
        });

        setMessage('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleMessageSend();
        }
    };

    const handleLeave = () => {
        socket.emit('leave_room', { username, room });
        navigate('/');
    };

    return (
        <div className='ChatContainer'>
            <ToastContainer />
            <div className='UsersList'>
                <h3>Users in {room}</h3>
                <ul>
                    {users.map((user, index) => (
                        <li className='USER' style={{ listStyle: 'none' }} key={index}>{user.username}</li>
                    ))}
                </ul>
                <button className='Leave' onClick={handleLeave}>Leave</button>
            </div>

            <div className='ActivitySection'>
                <div className='MessageDisplay'>
                    {receivedMessages.map((msg, index) => (
                        <div key={index} className={msg.username === username ? 'sentMessage' : 'receivedMessage'}>
                            <div className='sent_by'>{msg.username} </div>
                            <span>{msg.message}</span>
                        </div>
                    ))}
                </div>
                <div className='InputSection'>
                    <input
                        type='text'
                        placeholder='Type your message...'
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                    />
                    <button onClick={handleMessageSend}>Send</button>
                </div>
            </div>
        </div>
    );
}

export default Chat;
