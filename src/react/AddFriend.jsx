import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './hooks/useAuth';
import '../css/add-friend.css';

function AddFriend() {
    const { user: currentUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate('/app/friends');
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setSearchResults([]);

        const trimmedQuery = searchQuery.trim();

        if (!trimmedQuery) {
            setError('Please enter a username to search.');
            return;
        }

        try {
            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, where('name', '==', trimmedQuery));
            const querySnapshot = await getDocs(q);

            const users = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(user => user.id !== currentUser.uid);

            setSearchResults(users);
            if (users.length === 0) {
                setMessage('No users found with that exact username.');
            }
        } catch (err) {
            console.error('Error searching for users:', err);
            setError('Failed to search for users.');
        }
    };

    const handleSendRequest = async (recipient) => {
        setMessage('');
        setError('');

        try {
            const recipientId = recipient.id;
            const requestId = `${currentUser.uid}_${recipientId}`;
            const requestRef = doc(firestore, 'friendRequests', requestId);

            await setDoc(requestRef, {
                from: currentUser.uid,
                to: recipientId,
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            setMessage(`Friend request sent successfully to ${recipient.name}!`);
        } catch (err) {
            console.error('Error sending friend request:', err);
            setError('Failed to send friend request.');
        }
    };

    return (
        <div className="add-friend-container no-scrollbar">
            <div className="add-friend-card">
                <button onClick={handleGoBack} className="back-button">
                    &larr; Back to Friends
                </button>
                <h2>Connect with Others</h2>
                <p>Search for users by their username and send them a friend request.</p>
                <form onSubmit={handleSearch} className="add-friend-form">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Enter a username"
                        className="add-friend-input"
                        aria-label="Username search"
                    />
                    <button type="submit" className="add-friend-button">Search</button>
                </form>
                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}

                <div className="search-results">
                    {searchResults.map(user => (
                        <div key={user.id} className="search-result-item">
                            <span>{user.name}</span>
                            <button onClick={() => handleSendRequest(user)} className="add-friend-button">Send Request</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AddFriend;
