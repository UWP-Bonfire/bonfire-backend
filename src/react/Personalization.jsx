import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { useAuth } from "./hooks/useAuth";
import "../css/personalization.css";
import icon1 from "../assets/icons/icon1.png";
import icon2 from "../assets/icons/icon2.png";
import icon3 from "../assets/icons/icon3.png";
import icon4 from "../assets/icons/icon4.png";
import icon5 from "../assets/icons/icon5.png";
import icon6 from "../assets/icons/icon6.png";
import icon7 from "../assets/icons/icon7.png";
import icon8 from "../assets/icons/icon8.png";
import icon9 from "../assets/icons/icon9.png";
import icon10 from "../assets/icons/icon10.png";
import icon11 from "../assets/icons/icon11.png";
import icon12 from "../assets/icons/icon12.png";
import icon13 from "../assets/icons/icon13.png";
import icon14 from "../assets/icons/icon14.png";
import icon15 from "../assets/icons/icon15.png";

export default function Personalization() {
  const navigate = useNavigate();
  const { user, userProfile, loading } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(icon1); // Initialize with a default value
  const [usernameColor, setUsernameColor] = useState("");
  const [bgColor, setBgColor] = useState("");

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || "User12");
      setBio(userProfile.bio || "Welcome to Bonfire!");
      setAvatar(userProfile.avatar || icon1);
      setUsernameColor(userProfile.usernameColor || "#c84848");
      setBgColor(userProfile.bgColor || "#ffd9ba");
    }
  }, [userProfile]);

  const presetAvatars = [
    icon1,
    icon2,
    icon3,
    icon4,
    icon5,
    icon6,
    icon7,
    icon8,
    icon9,
    icon10,
    icon11,
    icon12,
    icon13,
    icon14,
    icon15,
  ];

  const handleSave = async () => {
    if (!user) return;

    const db = getFirestore();
    const userRef = doc(db, "users", user.uid);

    try {
      await setDoc(
        userRef,
        {
          ...userProfile, // Preserve existing data
          displayName,
          bio,
          avatar,
          usernameColor,
          bgColor,
        },
        { merge: true }
      ); // Use merge to avoid overwriting other fields
      alert("Your customizations have been saved!");
    } catch (error) {
      console.error("Error saving customizations: ", error);
      alert("Could not save changes. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="personalization-container">
      <h1 className="personalization-title">Account Personalization</h1>

      {/* Live Preview */}
      <div className="top-preview-card" style={{ backgroundColor: bgColor }}>
        <img src={avatar} alt="Avatar" className="top-avatar" />
        <h3 style={{ color: usernameColor }}>{displayName}</h3>
        <p>{bio}</p>
      </div>

      {/* Customization Options */}
      <div className="personalization-card">
        <div className="section">
          <h2>Choose Your Profile Picture</h2>
          <div className="avatar-options">
            {presetAvatars.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Avatar ${index + 1}`}
                className={`avatar-choice ${
                  avatar === img ? "selected-avatar" : ""
                }`}
                onClick={() => setAvatar(img)}
              />
            ))}
          </div>
        </div>

        <div className="section">
          <h2>Display Name</h2>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{ color: usernameColor }}
          />
        </div>

        <div className="section">
          <h2>Username Color</h2>
          <input
            type="color"
            value={usernameColor}
            onChange={(e) => setUsernameColor(e.target.value)}
          />
        </div>

        <div className="section">
          <h2>Profile Background Color</h2>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
          />
        </div>

        <div className="section">
          <h2>Bio</h2>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write something about yourself..."
          />
        </div>

        <button className="save-btn" onClick={handleSave}>
          Save Changes
        </button>
        <button className="back-btn" onClick={() => navigate("/app/account")}>
          ← Back to Account
        </button>
      </div>
    </div>
  );
}
