import React, { useState, useEffect } from "react";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { useAuth } from "./hooks/useAuth";
import "../css/personalization.css";

export default function Personalization() {
  const { user, userProfile, loading } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [usernameColor, setUsernameColor] = useState("");
  const [bgColor, setBgColor] = useState("");

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || "User12");
      setBio(userProfile.bio || "Welcome to Bonfire!");
      setAvatar(userProfile.avatar || "/images/IMG_1843.png");
      setUsernameColor(userProfile.usernameColor || "#c84848");
      setBgColor(userProfile.bgColor || "#ffd9ba");
    }
  }, [userProfile]);

  const presetAvatars = [
    "/images/IMG_1843.png",
    "/images/IMG_1844.png",
    "/images/IMG_1845.png",
    "/images/IMG_1846.png",
    "/images/IMG_1847.png",
    "/images/IMG_1848.png",
    "/images/IMG_1849.png",
    "/images/IMG_1850.png",
    "/images/IMG_1851.png",
    "/images/IMG_1852.png",
    "/images/IMG_1853.png",
    "/images/IMG_1854.png",
    "/images/IMG_1855.png",
    "/images/IMG_1856.png",
    "/images/IMG_1857.png",
  ];

  const handleSave = async () => {
    if (!user) return;

    const db = getFirestore();
    const userRef = doc(db, "users", user.uid);

    try {
      await setDoc(userRef, {
        ...userProfile, // Preserve existing data
        displayName,
        bio,
        avatar,
        usernameColor,
        bgColor,
      }, { merge: true }); // Use merge to avoid overwriting other fields
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
      </div>
    </div>
  );
}
