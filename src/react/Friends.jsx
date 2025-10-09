import React from 'react';
import '../css/friends.css';
import { useNavigate } from 'react-router-dom';
import useFriends from './hooks/useFriends';
import { auth } from '../firebase';
import { signOut } from "firebase/auth";
import FriendRequests from './FriendRequests'; // Import FriendRequests

// FriendCard component
const FriendCard = ({ friend, onChatClick }) => (
  <div className="friend-card">
    <img src={friend.avatar || '/images/default-avatar.png'} alt={friend.name} />
    <span>{friend.name}</span>
    <button className="chat-btn" onClick={() => onChatClick(friend.id)}>💬</button>
    <button className="options-btn">⚙️</button>
  </div>
);

function Friends() {
  const { friends, loading, error } = useFriends();
  const navigate = useNavigate();

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
    <div className="main">
        <div className="main-header">
            <img src="/images/Logo.png" alt="Logo" className="logo" />
            <h1>Friends</h1>
            <button onClick={handleAddFriend} className="add-friend">Add Friend</button>
            <button onClick={handleSignOut} className="sign-out-btn">Sign Out</button>
      </div>
      <div className="friends-content">
        <FriendRequests />
        <div className="friends-list-container">
            <h3>Your Friends</h3>
            {friends.length === 0 ? (
                <div className="no-friends-message">
                    <p>You haven't added any friends yet. Use the "Add Friend" button to connect with others.</p>
                </div>
            ) : (
                <div className="friends-container">
                    {friends.map(friend => (
                        <FriendCard key={friend.id} friend={friend} onChatClick={handleChatClick} />
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default Friends;
