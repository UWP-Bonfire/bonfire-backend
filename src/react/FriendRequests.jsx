import React from 'react';
import useFriendRequests from './hooks/useFriendRequests';
import '../css/FriendRequests.css';

function FriendRequests() {
    const { requests, loading, error, acceptRequest, declineRequest } = useFriendRequests();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="friend-requests-container">
            <h3>Friend Requests</h3>
            {requests.length === 0 ? (
                <p>You have no pending friend requests.</p>
            ) : (
                <ul className="friend-requests-list">
                    {requests.map(request => (
                        <li key={request.id} className="friend-request-item">
                            <span>{request.from}</span>
                            <div className="request-buttons">
                                <button onClick={() => acceptRequest(request.id, request.from)} className="accept-btn">Accept</button>
                                <button onClick={() => declineRequest(request.id)} className="decline-btn">Decline</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default FriendRequests;
