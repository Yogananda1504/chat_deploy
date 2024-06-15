import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Chat from './pages/Chat/Chat';
import Home from './pages/Home/Home';
import E_401 from './error/E_401';
import E_404 from './error/E_404';
import E_500 from './error/E_500';

// Get the domain from environment variables
const domain = 'http://localhost:4000';

// Creation of the socket connection
const socket = io.connect(domain);

function App() {
     const [leftstatus,setLeftstatus]=useState(false);
    const [activitystatus, setActivitystatus]=useState(true);
    const [username, setUsername] = useState(() => sessionStorage.getItem('username') || '');
    const [room, setRoom] = useState(() => sessionStorage.getItem('room') || '');
    const [joinRoom, setJoinRoom] = useState(false);

    // Effect to sync username with sessionStorage
    useEffect(() => {
        if (username) {
            sessionStorage.setItem('username', username);
        } else {
            sessionStorage.removeItem('username');
        }
    }, [username]);

    // Effect to sync room with sessionStorage
    useEffect(() => {
        if (room) {
            sessionStorage.setItem('room', room);
        } else {
            sessionStorage.removeItem('room');
        }
    }, [room]);

    return (
        <Router>
            <Routes>
                <Route
                    exact path='/'
                    element={<Home username={username} setUsername={setUsername} room={room} setRoom={setRoom} socket={socket} activitystatus={activitystatus} setActivitystatus={setActivitystatus}
                    leftstatus={leftstatus} setLeftstatus={setLeftstatus}/>}
                />
                <Route
                    exact path='/chat/:room'
                    element={<Chat username={username} socket={socket} joinRoom={joinRoom} activitystatus={activitystatus} setActivitystatus={setActivitystatus} leftstatus={leftstatus} setLeftstatus={setLeftstatus} />}
                />
                <Route
                    exact path='/Forbidden'
                    element={<E_401 />}
                />
                <Route
                    exact path='/Internal-error'
                    element={<E_500 />}
                />
                <Route
                    exact path='*'
                    element={<E_404 />}
                />
            </Routes>
        </Router>
    );
}

export default App;