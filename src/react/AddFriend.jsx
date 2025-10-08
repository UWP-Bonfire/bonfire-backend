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
        navigate('/app/friends');
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
            const userRef = doc(firestore, 'users', trimmedId);
            const userSnapshot = await getDoc(userRef);
            if (!userSnapshot.exists()) {
                setError('A user with this ID does not exist.');
                return;
            }

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
            <div className="add-friend-card">
                <button onClick={handleGoBack} className="back-button">
                    &larr; Back to Friends
                </button>
                <h2>Connect with Others</h2>
                <p>Enter the user ID of the person you want to connect with. You can find your user ID in your profile.</p>
                <form onSubmit={handleSendRequest} className="add-friend-form">
                    <input
                        type="text"
                        value={recipientId}
                        onChange={(e) => setRecipientId(e.target.value)}
                        placeholder="Enter a User ID"
                        className="add-friend-input"
                        aria-label="Friend's User ID"
                    />
                    <button type="submit" className="add-friend-button">Send Friend Request</button>
                </form>
                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
}

export default AddFriend;
