
import React, { useState, useEffect } from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'; // Import ToastContainer along with toast
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for toastify

const Home = ({ username, setUsername, room, setRoom, socket }) => {
    const navigate = useNavigate();
   
    const joinRoom = (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        if (username.trim() === '' || room.trim() === '') {
            // Show notification if either username or room is empty
            toast.error('Please enter both username and room');
            return; // Don't proceed further
        }
        else if(username.trim === '' )
        {
            toast.errot('Enter username');
        }
        else if(room.trim === '')
        {
            toast.error('Enter Room');
        }
       
        // Emit an event to check if the username is already taken
        socket.emit('check_username', { username, room });
    }

    // UseEffect to handle the response from the server
    useEffect(() => {
        const handleUsernameTaken = (usernameTaken) => {
            if (usernameTaken) {
                // If username is already taken, show an error toast
                toast.error('Username is already taken');
            } else {
                // If username is available, emit an event to join the room
                socket.emit('join_room', { username, room });
                // Navigate to the chat page
                navigate(`/chat/${room}`, { replace: true });
            }
        };

        // Listen for the response from the server
        socket.on('username_taken', handleUsernameTaken);

        // Cleanup the event listener when component unmounts
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