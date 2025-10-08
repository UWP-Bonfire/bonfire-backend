import React, { useState } from 'react';
import { db } from '../firebase';
import { ref, set, get, serverTimestamp } from 'firebase/database'; // Updated imports for Realtime Database
import { useAuth } from './hooks/useAuth';
import '../css/add-friend.css';

function AddFriend() {
    const { user: currentUser } = useAuth();
    const [recipientId, setRecipientId] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSendRequest = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const trimmedId = recipientId.trim();

        if (!trimmedId) {
            setError('Please enter a user ID.');
            return;
        }

        if (trimmedId === currentUser.uid) {
            setError('You cannot send a friend request to yourself.');
            return;
        }

        try {
            // Check if the user exists in the Realtime Database
            const userRef = ref(db, 'users/' + trimmedId);
            const userSnapshot = await get(userRef);
            if (!userSnapshot.exists()) {
                setError('A user with this ID does not exist.');
                return;
            }

            // Create a new friend request in the Realtime Database
            const requestId = `${currentUser.uid}_${trimmedId}`;
            const requestRef = ref(db, 'friendRequests/' + requestId);

            await set(requestRef, {
                from: currentUser.uid,
                to: trimmedId,
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            setMessage('Friend request sent successfully!');
            setRecipientId('');
        } catch (err) {
            console.error('Error sending friend request:', err);
            setError('Failed to send friend request. Please check the user ID and try again.');
        }
    };

    return (
        <div className="add-friend-container">
            <h2>Add a Friend</h2>
            <p>Enter the user ID of the person you want to add.</p>
            <form onSubmit={handleSendRequest} className="add-friend-form">
                <input
                    type="text"
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    placeholder="Enter friend\'s User ID"
                    className="add-friend-input"
                    aria-label="Friend\'s User ID"
                />
                <button type="submit" className="add-friend-button">Send Request</button>
            </form>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
}

export default AddFriend;
