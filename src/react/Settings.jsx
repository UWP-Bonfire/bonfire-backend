import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Settings.css';
import BlockedUsers from './BlockedUsers';

const Settings = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/app/friends');
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <button onClick={handleBack} className="back-btn">
        <span>&larr;</span>
        <span>Back to Friends</span>
      </button>
      <BlockedUsers />
    </div>
  );
};

export default Settings;
