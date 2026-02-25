import React from 'react';
import useBlockUser from './hooks/useBlockUser';
import "../css/friends.css";

const BlockedUsers = () => {
    const { blockedUsers, unblockUser } = useBlockUser();

    if (blockedUsers.length === 0) {
        return <p>No blocked users.</p>;
    }

    return (
        <div className="blocked-users-container">
            <h2>Blocked Users</h2>
            <div className="friends-container">
                {blockedUsers.map(userId => (
                    <div className="friend-card" key={userId}>
                        <div className="friend-info">
                            <span className="friend-name">{userId}</span>
                        </div>
                        <div className="friend-actions">
                            <button onClick={() => unblockUser(userId)}>Unblock</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BlockedUsers;
