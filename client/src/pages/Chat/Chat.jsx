import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Chat.css';
import ContextMenu from './ContextMenu';

const INACTIVITY_TIME_LIMIT = 15 * 60 * 1000; // 15 minutes

function Chat({ username, socket, joinRoom }) {
    const [message, setMessage] = useState('');
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState([]);
    const { room } = useParams();
    const navigate = useNavigate();
    const messageDisplayRef = useRef(null);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    const [isAtBottom, setIsAtBottom] = useState(true);
    const inactivityTimerRef = useRef(null);

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
        socket.on('messages_deleted', handleMessagesDeleted);

        return () => {
            socket.off('receive_message', handleMessage);
            socket.off('chatroom_users', handleUserList);
            socket.off('welcome_message', handleWelcomeMessage);
            socket.off('system_message', handleSystemMessage);
            socket.off('left_room', handleLeftRoom);
            socket.off('messages_deleted', handleMessagesDeleted);
        };
    }, [socket, username, room]);

    useEffect(() => {
        if (!room || !socket) return;

        const fetchData = async () => {
            try {
                const res = await axios.get(`http://localhost:4000/api/chat/messages?room=${room}&username=${username}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                setReceivedMessages(res.data.Messages);
                setUsers(res.data.users);
            } catch (error) {
                handleFetchError(error);
            }
        };

        fetchData();
    }, [room, socket, navigate]);

    useEffect(() => {
        const messageDisplay = messageDisplayRef.current;

        const handleScroll = () => {
            const atBottom = messageDisplay.scrollHeight - messageDisplay.scrollTop <= messageDisplay.clientHeight + 1;
            setShowScrollToBottom(!atBottom);
            setIsAtBottom(atBottom);
        };

        messageDisplay.addEventListener('scroll', handleScroll);

        return () => {
            messageDisplay.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (isAtBottom) {
            scrollToBottom();
        } else {
            setShowScrollToBottom(true);
        }
    }, [receivedMessages]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            renewToken();
        }, 10 * 60 * 1000); // 10 minutes

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const handleActivity = () => {
            resetInactivityTimer();
        };

        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('scroll', handleActivity);

        resetInactivityTimer();

        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('scroll', handleActivity);
            clearTimeout(inactivityTimerRef.current);
        };
    }, []);

    const renewToken = async () => {
        try {
            const response = await axios.post('http://localhost:4000/api/chat/renew-token', {username,room}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            localStorage.setItem('token', response.data.token);
            toast.success('Token renewed successfully');
        } catch (error) {
            console.error('Failed to renew token:', error);
            toast.error('Failed to renew token.');
            navigate('/');
        }
    };

    const resetInactivityTimer = () => {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = setTimeout(() => {
            handleLogout();
        }, INACTIVITY_TIME_LIMIT);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        socket.emit('leave_room', { username, room });
        navigate('/login');
        toast.warn('You have been logged out due to inactivity.');
    };

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

    const handleMessagesDeleted = ({ messageIds, username }) => {
        setReceivedMessages(prevMessages =>
            prevMessages.map(msg =>
                messageIds.includes(msg._id) ? { ...msg, deletedForEveryone: true, deletedBy: username } : msg
            )
        );
    };

    const handleMessageSend = () => {
        if (message.trim() === '') return;

        socket.emit('send_message', {
            username: username,
            message: message,
            room: room,
            token: localStorage.getItem('token')
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

    const scrollToBottom = () => {
        messageDisplayRef.current?.scrollTo({
            top: messageDisplayRef.current.scrollHeight,
            behavior: 'smooth',
        });
        setShowScrollToBottom(false);
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        setContextMenuVisible(true);
        const rect = e.target.getBoundingClientRect();
        setContextMenuPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const closeContextMenu = () => {
        setContextMenuVisible(false);
    };

    const toggleSelectionMode = () => {
        setSelectionMode(!selectionMode);
        setSelectedMessages([]);
    };

    const handleSelectMessage = (index) => {
        setSelectedMessages(prevSelected => {
            if (prevSelected.includes(index)) {
                return prevSelected.filter(i => i !== index);
            } else {
                return [...prevSelected, index];
            }
        });
    };

    const handleDeleteMessagesForMe = () => {
        if (selectedMessages.length === 0) return;

        const messagesToDelete = selectedMessages
            .map(i => receivedMessages[i]._id);

        const updatedMessages = receivedMessages.filter((msg, index) => !selectedMessages.includes(index));

        socket.emit('delete_for_me', { username, messageIds: messagesToDelete });

        setReceivedMessages(updatedMessages);
        setSelectedMessages([]);
        setSelectionMode(false);
    };

    const handleDeleteMessagesForEveryone = () => {
        if (selectedMessages.length === 0) return;

        const messagesToDelete = selectedMessages
            .map(i => receivedMessages[i]._id)
            .filter(i => receivedMessages.find(msg => msg._id === i).username === username);

        const updatedMessages = receivedMessages.filter((msg, index) => !selectedMessages.includes(index));

        socket.emit('delete_for_everyone', { username, messageIds: messagesToDelete });

        setReceivedMessages(updatedMessages);
        setSelectedMessages([]);
        setSelectionMode(false);
    };

    const handleFetchError = (error) => {
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

            <div className='ActivitySection' onContextMenu={handleContextMenu}>
                <div className='MessageDisplay' ref={messageDisplayRef}>
                    {receivedMessages.map((msg, index) => (
                        <div key={index} className={msg.username === username ? 'sentMessage' : 'receivedMessage'}>
                            {selectionMode && (
                                <input
                                    type="checkbox"
                                    className="messageCheckbox"
                                    checked={selectedMessages.includes(index)}
                                    onChange={() => handleSelectMessage(index)}
                                />
                            )}
                            <div className='sent_by'>{msg.username}</div>
                            {msg.deletedForEveryone ? (
                                <span>{msg.username === username ? 'You deleted this message' : `${msg.deletedBy} deleted this message`}</span>
                            ) : (
                                <span>{msg.message}</span>
                            )}
                        </div>
                    ))}
                </div>
                {contextMenuVisible && (
                    <ContextMenu
                        x={contextMenuPosition.x}
                        y={contextMenuPosition.y}
                        onClose={closeContextMenu}
                        onSelect={toggleSelectionMode}
                        onDeleteForMe={handleDeleteMessagesForMe}
                        onDeleteForEveryone={handleDeleteMessagesForEveryone}
                    />
                )}
                {showScrollToBottom && (
                    <button className='scrollToBottom' onClick={scrollToBottom}>↓</button>
                )}
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
                {selectionMode && (
                    <div className='OptionsBar'>
                        <button onClick={() => setSelectedMessages(receivedMessages.map((_, i) => i))}>Select All</button>
                        <button onClick={() => setSelectedMessages([])}>Deselect All</button>
                        <button onClick={handleDeleteMessagesForMe}>Delete For Me</button>
                        <button onClick={handleDeleteMessagesForEveryone}>Delete For Everyone</button>
                        <button onClick={toggleSelectionMode}>Exit Selection</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Chat;
