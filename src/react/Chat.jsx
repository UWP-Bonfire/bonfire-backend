import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import useChat from './hooks/useChat';
import '../css/chat.css';

const Message = ({ message, isSent, userProfile }) => (
    <div className={`message ${isSent ? 'sent' : 'received'}`}>
        <div className="message-bubble">
            <div className="message-info">
                <span className="display-name">
                    {userProfile ? userProfile.name : (message.displayName || 'Anonymous')}
                </span>
            </div>
            <p>{message.text}</p>
        </div>
    </div>
);

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
    const { messages, loading, sendMessage, userProfiles } = useChat(friendId);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (loading && messages.length === 0) {
        return <div>Loading messages...</div>;
    }

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>{friendId ? `Chat with ${userProfiles[friendId]?.name || '...'}` : 'Global Chat Room'}</h2>
            </div>
            <div className="chat-messages">
                {messages.map((message) => (
                    <Message
                        key={message.id}
                        message={message}
                        isSent={message.uid === user.uid}
                        userProfile={userProfiles[message.uid]}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <MessageInput onSendMessage={sendMessage} />
        </div>
    );
}

export default Chat;
