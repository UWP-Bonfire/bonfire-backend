import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import useChat from './hooks/useChat';
import useBlockUser from './hooks/useBlockUser';
import useUserSettings from './hooks/useUserSettings';
import '../css/chat.css';
import { firestore } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const Message = ({ message, isSent, userProfile, settings }) => (
    <div className={`message ${isSent ? 'sent' : 'received'}`}>
        <div className="message-bubble">
            <div className="message-info">
                <span className="display-name">
                    {userProfile ? userProfile.name : (message.displayName || 'Anonymous')}
                </span>
            </div>
            {message.isFlagged && settings.moderationEnabled ? (
                <p><em>This message has been hidden due to community guidelines.</em></p>
            ) : (
                <p>{message.text}</p>
            )}
        </div>
    </div>
);

const MessageInput = ({ onSendMessage, disabled }) => {
    const [newMessage, setNewMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (disabled) return;
        onSendMessage(newMessage);
        setNewMessage('');
    };

    return (
        <form className="chat-input" onSubmit={handleSubmit}>
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={disabled ? "You cannot send messages to a blocked user" : "Type a message..."}
                disabled={disabled}
            />
            <button type="submit" disabled={disabled}>Send</button>
        </form>
    );
};

function Chat() {
    const { user } = useAuth();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const friendId = queryParams.get('friendId');
    const { messages, loading, sendMessage, userProfiles } = useChat(friendId);
    const { blockedUsers, blockUser, unblockUser } = useBlockUser();
    const { settings } = useUserSettings();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!user || !friendId || friendId === 'global') return;

        const getChatId = (uid1, uid2) => {
            return [uid1, uid2].sort().join('_');
        };

        const resetCounter = async () => {
            const chatId = getChatId(user.uid, friendId);
            const chatRef = doc(firestore, 'chats', chatId);
            try {
                await updateDoc(chatRef, {
                    [`consecutiveUnread.${user.uid}`]: 0
                });
            } catch (err) {
                console.log("Could not reset counter. This can happen if the chat document hasn't been created yet.", err);
            }
        };

        resetCounter();
    }, [user, friendId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleBlockToggle = () => {
        if (!friendId || friendId === 'global') return;

        if (blockedUsers.includes(friendId)) {
            unblockUser(friendId);
        } else {
            blockUser(friendId);
        }
    };

    if (loading && messages.length === 0) {
        return <div>Loading messages...</div>;
    }

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>{friendId ? `Chat with ${userProfiles[friendId]?.name || '...'}` : 'Global Chat Room'}</h2>
                {friendId && friendId !== 'global' && (
                    <button onClick={handleBlockToggle} className="block-button">
                        {blockedUsers.includes(friendId) ? 'Unblock User' : 'Block User'}
                    </button>
                )}
            </div>
            <div className="chat-messages">
                {messages.map((message) => (
                    <Message
                        key={message.id}
                        message={message}
                        isSent={message.senderId === user.uid}
                        userProfile={userProfiles[message.uid]}
                        settings={settings}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <MessageInput onSendMessage={sendMessage} disabled={blockedUsers.includes(friendId)} />
        </div>
    );
}

export default Chat;