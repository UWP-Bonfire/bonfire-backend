import React from 'react';
import { useAuth } from './hooks/useAuth';
import '../css/Profile.css';

function Profile() {
    const { user, userProfile } = useAuth();

    return (
        <div className="profile-container">
            {user && userProfile ? (
                <div className="profile-card">
                    <img src={userProfile.avatar || '/images/Default PFP.jpg'} alt="Profile" className="profile-avatar" />
                    <h2 className="profile-name">{userProfile.name || 'Anonymous'}</h2>
                    <p className="profile-email">{user.email}</p>
                </div>
            ) : (
                <p>Please sign in to view your profile.</p>
            )}
        </div>
    );
}

export default Profile;
