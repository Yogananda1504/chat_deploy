import './App.css';
import { useState, useEffect } from 'react'; // Import useEffect
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import io from 'socket.io-client';
import Chat from './pages/Chat/Chat';
import Home from './pages/Home/Home';

const socket = io.connect('http://localhost:4000');

function App() {
    const [username, setUsername] = useState(localStorage.getItem('username') || ''); // Get username from localStorage
    const [room, setRoom] = useState(localStorage.getItem('room') || ''); // Get room from localStorage


    

    useEffect(() => {
        // Save username to localStorage when it changes
        localStorage.setItem('username', username);
    }, [username]);

    useEffect(() => {
        // Save room to localStorage when it changes
        localStorage.setItem('room', room);
    }, [room]);

    return (
        <Router>
            <div className='App'>
                <Routes>
                    <Route
                        exact path='/'
                        element={
                            <Home
                                username={username}
                                setUsername={setUsername}
                                room={room}
                                setRoom={setRoom}
                                socket={socket}
                            />
                        }
                    />
                    <Route
                        exact path='/chat/:room'
                        element={
                            <Chat
                                username={username}
                                socket={socket}
                            />
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
