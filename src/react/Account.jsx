import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import "../css/account.css";

export default function Account() {
  const navigate = useNavigate();
  const { userProfile, loading } = useAuth(); // Use userProfile for custom data

  if (loading) {
    return <div>Loading Profile...</div>;
  }

  if (!userProfile) {
    return <div>Could not load user profile. Please try again.</div>;
  }

  // Use Firestore data from userProfile with fallbacks
  const displayName = userProfile.displayName || "User12";
  const bio = userProfile.bio || "Welcome to Bonfire!";
  const avatar = userProfile.avatar || "https://firebasestorage.googleapis.com/v0/b/bonfire-d8db1.firebasestorage.app/o/Profile_Pictures%2Flogo.png?alt=media&token=15ac7dfc-d970-49f2-a9c6-429dd0656f0a";
  const usernameColor = userProfile.usernameColor || "#c84848";
  const bgColor = userProfile.bgColor || "#ffd9ba";

  return (
    <div className="account-container">
      <h1 className="title">User Account</h1>

      <div className="account-card">
        <div className="left-section">
          <img src={avatar} alt="Profile" className="account-avatar" />
        </div>

        <div className="right-section">
          <label>Username</label>
          <input type="text" value={displayName} readOnly />

          <label>Email</label>
          <input type="text" value={userProfile.email} readOnly />

          <label>Bio</label>
          <textarea value={bio} readOnly />
        </div>
      </div>

      <div className="account-buttons">
        <button className="back-btn" onClick={() => navigate("/app/friends")}>
          ← Back to Friends
        </button>
        <button className="edit-btn" onClick={() => navigate("/app/personalization")}>
          ✎ Edit Profile
        </button>
      </div>
    </div>
  );
}