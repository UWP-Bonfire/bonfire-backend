import React from 'react';
import { useAuth } from './hooks/useAuth'; 
import useFriends from './hooks/useFriends';
import '../css/Sidebar.css';

const DM = ({ friend }) => (
    <div className="dm">
        <img src={friend.avatar || '/images/default-avatar.png'} alt={friend.name} />
        <span>{friend.name}</span>
    </div>
);

function Sidebar() {
    const { user } = useAuth();
    const { friends, loading, error } = useFriends();

    return (
        <div className="sidebar">
            <h2>Direct Messages</h2>
            <div className="dm-list">
                {loading && <div>Loading...</div>}
                {error && <div className="error-message">{error}</div>}
                {friends.map(friend => (
                    <DM key={friend.id} friend={friend} />
                ))}
            </div>
            <div className="user">
                {user && (
                    <>
                        <img src={user.photoURL || '/images/default-avatar.png'} alt="User" />
                        <span>{user.displayName || 'Anonymous'}</span>
                    </>
                )}
            </div>
        </div>
    );
}

export default Sidebar;
