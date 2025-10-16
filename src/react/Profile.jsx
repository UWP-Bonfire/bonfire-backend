import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { firestore } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import '../css/Profile.css';

function Profile() {
    const { user, userProfile } = useAuth();
    const [selectedIcon, setSelectedIcon] = useState(null);

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

    return (
        <div className="profile-container">
            {user && userProfile ? (
                <div className="profile-card">
                    <img src={selectedIcon || userProfile.avatar || '/images/Default PFP.jpg'} alt="Profile" className="profile-avatar" />
                    <h2 className="profile-name">{userProfile.name || 'Anonymous'}</h2>
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
