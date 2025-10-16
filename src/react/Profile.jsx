import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { firestore } from '../firebase';
import { doc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import '../css/Profile.css';

function Profile() {
    const { user, userProfile } = useAuth();
    const [selectedIcon, setSelectedIcon] = useState(null);
    const [newUsername, setNewUsername] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [isEditingUsername, setIsEditingUsername] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setNewUsername(userProfile.name || '');
        }
    }, [userProfile]);

    const icons = Array.from({ length: 10 }, (_, i) => `/images/icon${i + 1}.png`);

    const handleIconSelect = async (icon) => {
        if (user) {
            const userRef = doc(firestore, 'users', user.uid);
            await updateDoc(userRef, {
                avatar: icon
            });
            setSelectedIcon(icon);
        }
    };

    const handleUsernameChange = (e) => {
        setNewUsername(e.target.value);
        setUsernameError('');
    };

    const checkUsernameUniqueness = async (username) => {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('name', '==', username));
        const querySnapshot = await getDocs(q);
        return querySnapshot.empty;
    };

    const handleUsernameSave = async () => {
        if (user && newUsername.trim() !== '') {
            const isUnique = await checkUsernameUniqueness(newUsername);
            if (isUnique) {
                const userRef = doc(firestore, 'users', user.uid);
                await updateDoc(userRef, {
                    name: newUsername
                });
                setIsEditingUsername(false);
            } else {
                setUsernameError('Username is already taken.');
            }
        }
    };

    return (
        <div className="profile-container">
            {user && userProfile ? (
                <div className="profile-card">
                    <img src={selectedIcon || userProfile.avatar || '/images/Default PFP.jpg'} alt="Profile" className="profile-avatar" />
                    <div className="username-section">
                        {isEditingUsername ? (
                            <div className="edit-username">
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={handleUsernameChange}
                                    className="username-input"
                                />
                                <button onClick={handleUsernameSave} className="save-button">Save</button>
                                {usernameError && <p className="error-message">{usernameError}</p>}
                            </div>
                        ) : (
                            <h2 className="profile-name" onClick={() => setIsEditingUsername(true)}>
                                {userProfile.name || 'Anonymous'} &#x270E;
                            </h2>
                        )}
                    </div>
                    <p className="profile-email">{user.email}</p>
                    <div className="icon-selection">
                        <h3>Select a Profile Picture</h3>
                        <div className="icons-grid">
                            {icons.map((icon, index) => (
                                <img
                                    key={index}
                                    src={icon}
                                    alt={`icon ${index + 1}`}
                                    className={`icon-option ${selectedIcon === icon ? 'selected' : ''}`}
                                    onClick={() => handleIconSelect(icon)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <p>Please sign in to view your profile.</p>
            )}
        </div>
    );
}

export default Profile;
