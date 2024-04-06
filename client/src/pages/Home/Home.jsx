import React from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Home = ({ username, setUsername, room, setRoom, socket }) => {
    const navigate = useNavigate();

    const joinRoom = (e) => {
        e.preventDefault();

        if (username.trim() === '' || room.trim() === '') {
            toast.error('Please enter both username and room');
            return;
        }

        socket.emit('join_room', { username, room });
        navigate(`/chat/${room}`, { replace: true });
    }

    return (
        <div className='Container'>
            <h2>DevRooms</h2>
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
        </div>
    );
};

export default Home;
