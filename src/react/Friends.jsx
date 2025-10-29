import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/friends.css";
import useFriends from './hooks/useFriends';
import { auth } from '../firebase';
import { signOut } from "firebase/auth";
import FriendRequests from './FriendRequests';

export default function Friends() {
  const navigate = useNavigate();
  const { friends, loading, error } = useFriends();

  const handleChatClick = (friendId) => {
    navigate(`/app/chat?friendId=${friendId}`);
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
            </div>
          ))}
        </div>

        <div className="bottom-section">
          <div className="settings-btn" onClick={() => navigate("/settings")}>
            <img src="src/assets/Settings.svg" alt="Settings" />
          </div>
          <div className="user" onClick={() => navigate("/app/profile")}>
            <img src="/icons/User.svg" alt="User" />
            <span>User123</span>
          </div>
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
                        <span>{friend.name}</span>
                        <button className="chat-btn" onClick={() => handleChatClick(friend.id)}>
                        💬
                        </button>
                        <button className="options-btn">⋮</button>
                    </div>
                 ))
            )
          }
        </div>
      </div>
    </div>
  );
}
