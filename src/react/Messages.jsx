import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import useChat from "./hooks/useChat";
import useFriends from "./hooks/useFriends";
import "../css/messages.css";
import { firestore } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import arrowIcon from "../assets/images/arrow.png";
import rightArrowIcon from "../assets/images/right-arrow.png";

const MessageInput = ({ message, setMessage, onSendMessage }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() !== '') {
            onSendMessage(message);
        }
    };

    return (
        <form className="chat-input" onSubmit={handleSubmit}>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
            />
            <button type="submit" className="icon-btn send-btn" aria-label="Send message">
                <img src={arrowIcon} alt="Send" />
            </button>
        </form>
    );
};

const MessageRow = ({ message, user, userProfiles, isLast, isGlobalChat }) => {
    const isSent = message.senderId === user.uid;

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`message-row ${isSent ? "sent" : "received"}`}>
            <img
                src={userProfiles[message.senderId]?.avatar || 'https://firebasestorage.googleapis.com/v0/b/bonfire-d8db1.firebasestorage.app/o/Profile_Pictures%2Flogo.png?alt=media&token=15ac7dfc-d970-49f2-a9c6-429dd0656f0a'}
                alt={userProfiles[message.senderId]?.name || 'Anonymous'}
                className="msg-avatar"
            />
            <div className="message-bubble">
                <span className="msg-name">{userProfiles[message.senderId]?.name || 'Anonymous'}</span>
                <div className="message-text">{message.text}</div>
                <div className="message-meta">
                    <span className="timestamp">{formatTimestamp(message.timestamp)}</span>
                    {!isGlobalChat && isSent && isLast && (
                        <div className={`read-receipt ${message.read ? 'read' : 'unread'}`}>
                            {message.read ? '✓✓' : '✓'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ChatView = ({ friend, isGlobalChat }) => {
    const { user } = useAuth();
    const { messages, loading: messagesLoading, sendMessage, userProfiles, markMessageAsRead } = useChat(friend.id);
    const messagesEndRef = useRef(null);
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = (message) => {
        sendMessage(message);
        setNewMessage('');
    };

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    };

    useEffect(() => {
        scrollToBottom();
        if (messages.length > 0) {
            messages.forEach(message => {
                if (user && message.senderId !== user.uid && !message.read) {
                    markMessageAsRead(message.id);
                }
            });
        }
    }, [messages, user, markMessageAsRead]);

    return (
      <>
        <div className="chat-header">
          <img
            src={friend.avatar || 'https://firebasestorage.googleapis.com/v0/b/bonfire-d8db1.firebasestorage.app/o/Profile_Pictures%2Flogo.png?alt=media&token=15ac7dfc-d970-49f2-a9c6-429dd0656f0a'}
            alt={friend.name}
            className="chat-header-avatar"
          />
          <span>Chat with {friend.name}</span>
        </div>
        <div className="chat-body">
          {messagesLoading && messages.length === 0 ? (
            <div className="loading-messages">Loading messages...</div>
          ) : (
            messages.map((message, index) => (
              <MessageRow
                key={message.id}
                message={message}
                user={user}
                userProfiles={userProfiles}
                isLast={index === messages.length - 1}
                isGlobalChat={isGlobalChat}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="input-box">
          <MessageInput
            message={newMessage}
            setMessage={setNewMessage}
            onSendMessage={handleSendMessage}
          />
        </div>
      </>
    );
  };

export default function Messages() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { friends, loading: friendsLoading } = useFriends();
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    const friendId = location.state?.friendId;
    if (friendId && friends.length > 0) {
        const friendToSelect = friends.find(f => f.id === friendId);
        if (friendToSelect) {
            setSelectedFriend(friendToSelect);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }
  }, [location.state, friends, navigate, location.pathname]);

  useEffect(() => {
    if (!user || friends.length === 0) {
      return;
    }

    const unsubscribes = friends.map(friend => {
        if (friend.isMuted) {
            setUnreadCounts(prevCounts => {
                const newCounts = { ...prevCounts };
                delete newCounts[friend.id];
                return newCounts;
            });
            return () => {};
        }

        const chatId = [user.uid, friend.id].sort().join('_');
        const messagesRef = collection(firestore, 'chats', chatId, 'messages');
        const q = query(messagesRef, where('read', '==', false), where('senderId', '==', friend.id));

        const unsubscribe = onSnapshot(q, snapshot => {
            setUnreadCounts(prevCounts => ({
                ...prevCounts,
                [friend.id]: snapshot.size,
            }));
        });
        return unsubscribe;
    });

    return () => {
        unsubscribes.forEach(unsub => unsub());
    };
}, [friends, user]);
  
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
            <img src={rightArrowIcon} alt="Back" />
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
                  <img src={friend.avatar || 'https://firebasestorage.googleapis.com/v0/b/bonfire-d8db1.firebasestorage.app/o/Profile_Pictures%2Flogo.png?alt=media&token=15ac7dfc-d970-49f2-a9c6-429dd0656f0a'} alt={friend.name} />
                  <span>{friend.name}</span>
                  {unreadCounts[friend.id] > 0 && !friend.isMuted && (
                    <span className="unread-count">{unreadCounts[friend.id]}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        <div className="sidebar-bottom-buttons">
            <button className="create-group" onClick={() => handleFriendClick({ id: 'global', name: 'Global Chat', avatar: '/images/icon11.png' })}>'''
            Global Chat Room
            </button>
            <button className="create-group">+ Create Group Chat</button>
        </div>
      </aside>
      <main className="chat-area">
        {selectedFriend ? (
          <ChatView key={selectedFriend.id} friend={selectedFriend} isGlobalChat={selectedFriend.id === 'global'} />
        ) : (
          <div className="no-chat-selected">
            <h2>Select a friend to start a conversation</h2>
          </div>
        )}
      </main>
    </div>
  );
}
