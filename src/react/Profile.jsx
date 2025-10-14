import React from 'react';
import { useAuth } from './hooks/useAuth';
import '../css/Profile.css';

function Profile() {
    const { user } = useAuth();

    return (
        <div className="profile-container">
            {user ? (
                <div className="profile-card">
                    <img src={user.photoURL || '/images/Default PFP.jpg'} alt="Profile" className="profile-avatar" />
                    <h2 className="profile-name">{user.displayName || 'Anonymous'}</h2>
                    <p className="profile-email">{user.email}</p>
                </div>
            ) : (
                <p>Please sign in to view your profile.</p>
            )}
        </div>
    );
}

export default Profile;
