import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './hooks/useAuth';
import '../css/addfriends.css';

function AddFriends() {
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
        <div className="addfriends-container">
            <h1 className="page-title">Connect with Others</h1>
            <div className="search-bar">
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Enter a username"
                        aria-label="Username search"
                    />
                </form>
            </div>
            {message && <p className="no-results">{message}</p>}
            {error && <p className="no-results">{error}</p>}

            <div className="friends-list">
                {searchResults.map(user => (
                    <div key={user.id} className="friend-card">
                        <img src={user.avatar || '/images/default-avatar.png'} alt={user.name} className="friend-avatar" />
                        <span className="friend-name">{user.name}</span>
                        <button onClick={() => handleSendRequest(user)} className="add-btn">Send Request</button>
                    </div>
                ))}
            </div>
            <button onClick={handleGoBack} className="back-btn">
                <span>&larr;</span>
                <span>Back to Friends</span>
            </button>
        </div>
    );
}

export default AddFriends;
