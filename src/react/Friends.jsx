import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/friends.css";
import useFriends from './hooks/useFriends';
import { auth, firestore } from '../firebase';
import { signOut } from "firebase/auth";
import FriendRequests from './FriendRequests';
import { useAuth } from './hooks/useAuth';
import useNotifications from './hooks/useNotifications';
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function Friends() {
  const navigate = useNavigate();
  const { friends, loading, error } = useFriends();
  const { user, userProfile } = useAuth();
  const { requestPermission } = useNotifications();
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    if (!user || friends.length === 0) {
      return;
    }

    const unsubscribes = friends.map(friend => {
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

  const handleChatClick = (friendId) => {
    navigate(`/app/messages`);
  };

  const handleSignOut = () => {
    signOut(auth).then(() => {
      navigate('/'); 
    }).catch((error) => {
      console.error("Sign out error:", error);
    });
  };

  const handleAddFriend = () => {
    navigate('/app/add-friend');
  };

  if (loading) {
    return <div>Loading friends...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="container">
      {/* Sidebar (Direct Messages Only) */}
      <div className="sidebar">
        <h2>Direct Messages</h2>

        <div className="dm-list">
          {friends.map((friend) => (
            <div
              className="dm"
              key={friend.id}
              onClick={() => handleChatClick(friend.id)}
            >
              <img src={friend.avatar || '/images/default-avatar.png'} alt={friend.name} />
              <span>{friend.name}</span>
              {unreadCounts[friend.id] > 0 && (
                <span className="unread-count">{unreadCounts[friend.id]}</span>
              )}
            </div>
          ))}
        </div>

        <div className="bottom-section">
          <div className="settings-btn" onClick={() => navigate("/app/settings")}>
            <img src="src/assets/Settings.svg" alt="Settings" />
          </div>
          {user && userProfile && (
            <div className="user" onClick={() => navigate("/app/account")}>
              <img src={userProfile.avatar || '/images/Default PFP.jpg'} alt="User" />
              <span>{user.displayName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Area */}
      <div className="main">
        <div className="main-header">
          <h1>Friends</h1>
          <button onClick={handleAddFriend} className="add-friend">Add Friend</button>
          <button onClick={handleSignOut} className="sign-out-btn">Sign Out</button>
        </div>
        
        <FriendRequests />

        <div className="friends-container">
          {friends.length === 0 ? (
                <div className="no-friends-message">
                    <p>You haven't added any friends yet. Use the "Add Friend" button to connect with others.</p>
                </div>
            ) : (
                friends.map((friend) => (
                    <div className="friend-card" key={friend.id}>
                        <img src={friend.avatar || '/images/default-avatar.png'} alt={friend.name} />
                        <div className="friend-info">
                            <span>{friend.name}</span>
                            {unreadCounts[friend.id] > 0 && (
                                <span className="unread-count">{unreadCounts[friend.id]}</span>
                            )}
                        </div>
                        <div className="friend-actions">
                            <button className="chat-btn" onClick={() => handleChatClick(friend.id)}>
                            💬
                            </button>
                            <button className="options-btn">⋮</button>
                        </div>
                    </div>
                 ))
            )
          }
        </div>
      </div>
    </div>
  );
}
