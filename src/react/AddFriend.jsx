import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../firebase';
import { collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './hooks/useAuth';
import '../css/add-friend.css';

function AddFriend() {
    const { user: currentUser } = useAuth();
    const [recipientId, setRecipientId] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate('/');
    };

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
            // Check if the user exists in Firestore
            const userRef = doc(firestore, 'users', trimmedId);
            const userSnapshot = await getDoc(userRef);
            if (!userSnapshot.exists()) {
                setError('A user with this ID does not exist.');
                return;
            }

            // Create a new friend request in Firestore
            const requestId = `${currentUser.uid}_${trimmedId}`;
            const requestRef = doc(firestore, 'friendRequests', requestId);

            await setDoc(requestRef, {
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
            <button onClick={handleGoBack} className="back-button">
                &larr; Back
            </button>
            <h2>Add a Friend</h2>
            <p>Enter the user ID of the person you want to add.</p>
            <form onSubmit={handleSendRequest} className="add-friend-form">
                <input
                    type="text"
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    placeholder="Enter friend's User ID"
                    className="add-friend-input"
                    aria-label="Friend's User ID"
                />
                <button type="submit" className="add-friend-button">Send Request</button>
            </form>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
}

export default AddFriend;
