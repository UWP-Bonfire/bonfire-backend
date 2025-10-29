import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { firestore } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getAuth, updateProfile } from 'firebase/auth';
import '../css/Profile.css';

function Profile() {
    const { user, userProfile } = useAuth();
    const [selectedIcon, setSelectedIcon] = useState(null);
    const [newDisplayName, setNewDisplayName] = useState('');
    const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
    const [aboutMe, setAboutMe] = useState('');
    const [isEditingAboutMe, setIsEditingAboutMe] = useState(false);
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate('/app/friends');
    };

    useEffect(() => {
        if (user) {
            setNewDisplayName(user.displayName || '');
        }
        if (userProfile) {
            setAboutMe(userProfile.aboutMe || '');
        }
    }, [user, userProfile]);

    const icons = Array.from({ length: 15 }, (_, i) => `/images/icon${i + 1}.png`);

    const handleIconSelect = async (icon) => {
        if (user) {
            const userRef = doc(firestore, 'users', user.uid);
            await updateDoc(userRef, {
                avatar: icon
            });
            setSelectedIcon(icon);
        }
    };

    const handleDisplayNameChange = (e) => {
        setNewDisplayName(e.target.value);
    };

    const handleDisplayNameSave = async () => {
        if (user && newDisplayName.trim() !== '') {
            const auth = getAuth();
            await updateProfile(auth.currentUser, {
                displayName: newDisplayName
            });

            const userRef = doc(firestore, 'users', user.uid);
            await updateDoc(userRef, {
                displayName: newDisplayName
            });

            setIsEditingDisplayName(false);
        }
    };

    const handleAboutMeChange = (e) => {
        if (e.target.value.length <= 150) {
            setAboutMe(e.target.value);
        }
    };

    const handleAboutMeSave = async () => {
        if (user) {
            const userRef = doc(firestore, 'users', user.uid);
            await updateDoc(userRef, {
                aboutMe: aboutMe
            });
            setIsEditingAboutMe(false);
        }
    };

    return (
        <div className="profile-container">
            {user && userProfile ? (
                <div className="profile-card">
                    <button onClick={handleGoBack} className="back-button">
                        &larr; Back to Friends
                    </button>
                    <img src={selectedIcon || userProfile.avatar || '/images/Default PFP.jpg'} alt="Profile" className="profile-avatar" />
                    <div className="username-section">
                        {isEditingDisplayName ? (
                            <div className="edit-username">
                                <input
                                    type="text"
                                    value={newDisplayName}
                                    onChange={handleDisplayNameChange}
                                    className="username-input"
                                />
                                <button onClick={handleDisplayNameSave} className="save-button">Save</button>
                            </div>
                        ) : (
                            <div onClick={() => setIsEditingDisplayName(true)} style={{cursor: 'pointer'}}>
                                <h2 className="profile-display-name">
                                    {user.displayName || 'Anonymous'} &#x270E;
                                </h2>
                                <p className="profile-username">@{userProfile.name}</p>
                            </div>
                        )}
                    </div>
                    <p className="profile-email">{user.email}</p>
                    <div className="about-me-section">
                        {isEditingAboutMe ? (
                            <div className="edit-about-me">
                                <textarea
                                    value={aboutMe}
                                    onChange={handleAboutMeChange}
                                    className="about-me-textarea"
                                    maxLength="150"
                                />
                                <div className="char-counter">{aboutMe.length}/150</div>
                                <button onClick={handleAboutMeSave} className="save-button">Save</button>
                            </div>
                        ) : (
                            <p className="profile-about-me" onClick={() => setIsEditingAboutMe(true)}>
                                {aboutMe || 'Add an "about me"'} &#x270E;
                            </p>
                        )}
                    </div>
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
