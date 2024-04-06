import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './Chat.css'; // Import CSS file for styling

function Chat({ username, socket }) {
    const [message, setMessage] = useState(''); 
    const [receivedMessages, setReceivedMessages] = useState([]); 
    const [users, setUsers] = useState([]);
    const { room } = useParams();
    const navigate = useNavigate();

    const fetchdata = async () => {
        try {
            console.log('Fetching data...');
            const res = await axios.get(`http://localhost:4000/api/chat/${room}`);
            if (res.data) {
                setReceivedMessages(res.data.Messages);
                setUsers(res.data.users);
                console.log('Data fetched successfully');
            } else {
                console.log('No data received from the server');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    useEffect(() => {
        fetchdata();
    },[]);

    useEffect(() => {
       
    
        // Listen for incoming messages from the socket
        socket.on('receive_message', (data) => {
            console.log('Received message:', data);
            // Update the state with the received message
            setReceivedMessages((prevMessages) => [...prevMessages, data]);
        });
    
        // Cleanup function to remove event listener when component unmounts
        return () => {
            socket.off('receive_message');
            
        };
    }, [socket,receivedMessages]); // Include socket in the dependency array

    useEffect(() => {
        // Check if socket is connected before setting up event listeners
        if (socket.connected) {
            // Listen for incoming messages from the socket
            socket.on('chatroom_users', (data) => {
                console.log('Received updated user list:', data);
                setUsers(data); // Update the list of users in the room
            });
            socket.on('welcome_message', (data) => {
                console.log('Received welcome message:', data);
                setReceivedMessages((prevMessages) => [...prevMessages, data]); // Display welcome message
            });
            socket.on('system_message', (data) => {
                console.log('Received system message:', data);
                setReceivedMessages((prevMessages) => [...prevMessages, data]); // Display system message
            });
            socket.on('left_room', (data) => {
                console.log('Received user left message:', data);
                // Update the list of users after removing the user who left the room
                setUsers((prevUsers) => prevUsers.filter(user => user.username !== data.username));
                // Update the received messages to display the leaving message
                setReceivedMessages((prevMessages) => [...prevMessages, data]);
            });
        }

        // Cleanup function to remove event listeners when component unmounts
        return () => {
            socket.off('chatroom_users');
            socket.off('welcome_message');
            socket.off('system_message');
            socket.off('left_room');
        };
    }, [socket,users,receivedMessages]); // Include socket in the dependency array

    const handleMessageSend = () => {
        // Logic to send message
        socket.emit('send_message', {
            username: username,
            message: message,
            room: room
        });
        // Clear the message input after sending
        setMessage('');
    };

    const handleLeave = () => {
        socket.emit('leave_room', { username, room }); // Send leave_room event to the server
        // Navigate to the home page
        navigate('/');
    };

    return (
        <div className='ChatContainer'>
            <div className='UsersList'>
                <h3>Users in {room}</h3>
                <ul>
                    {users.map((user, index) => (
                        <li key={index}>{user.username}</li>
                    ))}
                </ul>
                <button className='Leave' onClick={handleLeave}>Leave</button>
            </div>

            <div className='ActivitySection'>
                <div className='MessageDisplay'>
                    {/* Display received messages */}
                    {receivedMessages.map((msg, index) => (
                        <div key={index} className={msg.username === username ? 'sentMessage' : 'receivedMessage'}>
                            <span>{msg.username}: </span>
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
                    />
                    <button onClick={handleMessageSend}>Send</button>
                </div>
            </div>
        </div>
    );
}

export default Chat;
