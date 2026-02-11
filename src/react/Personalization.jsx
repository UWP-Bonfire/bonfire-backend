import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { useAuth } from "./hooks/useAuth";
import "../css/personalization.css";

export default function Personalization() {
  const navigate = useNavigate();
  const { user, userProfile, loading } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null); // Initialize with null
  const [usernameColor, setUsernameColor] = useState("");
  const [bgColor, setBgColor] = useState("");
  const [presetAvatars, setPresetAvatars] = useState([]);

  useEffect(() => {
    const fetchAvatars = async () => {
      const storage = getStorage();
      const avatarsRef = ref(storage, 'Profile_Pictures');
      try {
        const res = await listAll(avatarsRef);
        const urls = await Promise.all(
          res.items.map((itemRef) => getDownloadURL(itemRef))
        );
        setPresetAvatars(urls);
        if (userProfile && userProfile.avatar) {
          setAvatar(userProfile.avatar);
        } else if (urls.length > 0) {
          setAvatar(urls[0]); // Set default avatar from storage
        }
      } catch (error) {
        console.error("Error fetching avatars from storage: ", error);
      }
    };

    fetchAvatars();
  }, [userProfile]);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || "User12");
      setBio(userProfile.bio || "Welcome to Bonfire!");
      setUsernameColor(userProfile.usernameColor || "#c84848");
      setBgColor(userProfile.bgColor || "#ffd9ba");
    }
  }, [userProfile]);

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
        {avatar && <img src={avatar} alt="Avatar" className="top-avatar" />}
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
