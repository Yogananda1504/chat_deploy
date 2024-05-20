
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import io from 'socket.io-client';
import Chat from './pages/Chat/Chat';
import Home from './pages/Home/Home';
import E_401 from './error/E_401';
import E_404 from './error/E_404';
import E_500 from './error/E_500';

//creation of the socket connection 
const socket = io.connect('http://localhost:4000');

function App() {
    const [username, setUsername] = useState(localStorage.getItem('username') || '');
    const [room, setRoom] = useState(localStorage.getItem('room') || '');
    const [joinRoom, setJoinRoom] = useState(false);

    useEffect(() => {
        localStorage.setItem('username', username);
    }, [username]);

    useEffect(() => {
        localStorage.setItem('room', room);
    }, [room]);

    return (
        <Router>
            <div className='App'>
                <Routes>
                    <Route
                        exact path='/'
                        element={<Home username={username} setUsername={setUsername} room={room} setRoom={setRoom} socket={socket} />}
                    />
                    <Route
                        exact path='/chat/:room'
                        element={<Chat username={username} socket={socket} joinRoom={joinRoom} />}
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
                        exact path='*' element={<E_404 />}
                    />



                </Routes>
            </div>
        </Router>
    );
}

export default App;
