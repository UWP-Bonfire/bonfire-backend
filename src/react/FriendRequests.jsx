import React, { useState, useEffect } from 'react';
import useFriendRequests from './hooks/useFriendRequests';
import { firestore } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import '../css/FriendRequests.css';

function FriendRequests() {
    const { requests, loading, error, acceptRequest, declineRequest } = useFriendRequests();
    const [requesterNames, setRequesterNames] = useState({});

    useEffect(() => {
        const fetchRequesterNames = async () => {
            const names = {};
            for (const request of requests) {
                const userRef = doc(firestore, 'users', request.from);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    names[request.from] = userSnap.data().name;
                }
            }
            setRequesterNames(names);
        };

        if (requests.length > 0) {
            fetchRequesterNames();
        }
    }, [requests]);

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
                            <span>{requesterNames[request.from] || 'Loading...'}</span>
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
