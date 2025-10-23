import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import useChat from "./hooks/useChat";
import useFriends from "./hooks/useFriends";
import "../css/messages.css";

const MessageInput = ({ onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newMessage.trim() !== '') {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    return (
        <form className="chat-input" onSubmit={handleSubmit}>
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
            />
            <button type="submit" className="icon-btn send-btn" aria-label="Send message">
                <img src="/images/arrow.png" alt="Send" />
            </button>
        </form>
    );
};

export default function Messages() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { friends, loading: friendsLoading } = useFriends();
  const [selectedFriend, setSelectedFriend] = useState(null);
  const { messages, loading: messagesLoading, sendMessage, userProfiles } = useChat(selectedFriend ? selectedFriend.id : null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleBack = () => {
    navigate("/app");
  };

  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
  };

  return (
    <div className="messages-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <button className="back-btn" onClick={handleBack} aria-label="Go back">
            <img src="/images/right-arrow.png" alt="Back" />
          </button>
          <h2>Messages</h2>
        </div>
        <div className="sidebar-icons">
          <div className="dm-list">
            {friendsLoading ? (
              <div className="loading-friends">Loading friends...</div>
            ) : (
              friends.map((friend) => (
                <div
                  className={`dm ${selectedFriend?.id === friend.id ? "active" : ""}`}
                  key={friend.id}
                  onClick={() => handleFriendClick(friend)}
                >
                  <img src={friend.avatar || '/images/default-avatar.png'} alt={friend.name} />
                  <span>{friend.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
        <button className="create-group">+ Create Group Chat</button>
      </aside>
      <main className="chat-area">
        {selectedFriend ? (
          <>
            <div className="chat-header">
              <img
                src={selectedFriend.avatar || '/images/default-avatar.png'}
                alt={selectedFriend.name}
                className="chat-header-avatar"
              />
              <span>Chat with {selectedFriend.name}</span>
            </div>
            <div className="chat-body">
              {messagesLoading && messages.length === 0 ? (
                <div className="loading-messages">Loading messages...</div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message-row ${message.senderId === user.uid ? "sent" : "received"}`}>
                     <img
                       src={userProfiles[message.senderId]?.avatar || '/images/default-avatar.png'}
                       alt={userProfiles[message.senderId]?.name || 'Anonymous'}
                       className="msg-avatar"
                     />
                     <div className="message-bubble">
                       <span className="msg-name">{userProfiles[message.senderId]?.name || 'Anonymous'}</span>
                       <div className="message-text">{message.text}</div>
                     </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="input-box">
              <MessageInput onSendMessage={sendMessage} />
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <h2>Select a friend to start a conversation</h2>
          </div>
        )}
      </main>
    </div>
  );
}
