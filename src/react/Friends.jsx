import React from 'react';
import '../css/friends.css';
import { useNavigate } from 'react-router-dom';
import useFriends from './hooks/useFriends';

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
    navigate(`/chat?friendId=${friendId}`);
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
            <img src="/images/logo.png" alt="Logo" className="logo" />
            <h1>Friends</h1>
            <button className="add-friend">Add Friend</button>
      </div>
      {friends.length === 0 ? (
        <div className="no-friends-message">
            <h2>No friends yet!</h2>
            <p>Click the "Add Friend" button to start connecting with people.</p>
        </div>
      ) : (
        <div className="friends-container">
            {friends.map(friend => (
                <FriendCard key={friend.id} friend={friend} onChatClick={handleChatClick} />
            ))}
        </div>
      )}
    </div>
  );
}

export default Friends;
