import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import useChat from './hooks/useChat';
import '../css/chat.css';

// Message component
const Message = ({ message, isSent }) => (
    <div className={`message ${isSent ? 'sent' : 'received'}`}>
        <div className="message-bubble">
            <div className="message-info">
                <span className="display-name">{message.displayName}</span>
            </div>
            <p>{message.text}</p>
        </div>
    </div>
);

// MessageInput component
const MessageInput = ({ onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSendMessage(newMessage);
        setNewMessage('');
    };

    return (
        <form className="chat-input" onSubmit={handleSubmit}>
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
            />
            <button type="submit">Send</button>
        </form>
    );
};

function Chat() {
    const { user } = useAuth();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const friendId = queryParams.get('friendId');
    const { messages, loading, sendMessage } = useChat(friendId);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (loading) {
        return <div>Loading messages...</div>;
    }

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>{friendId ? 'Chat with friend' : 'Global Chat Room'}</h2>
            </div>
            <div className="chat-messages">
                {messages.map((message) => (
                    <Message key={message.id} message={message} isSent={message.uid === user.uid} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <MessageInput onSendMessage={sendMessage} />
        </div>
    );
}

export default Chat;
