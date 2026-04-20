import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Settings.css';
import BlockedUsers from './BlockedUsers';
import useUserSettings from './hooks/useUserSettings';

const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, isLoading } = useUserSettings();

  const handleBack = () => {
    navigate('/app/friends');
  };

  const handleModerationToggle = () => {
    updateSettings({ ...settings, moderationEnabled: !settings.moderationEnabled });
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <button onClick={handleBack} className="back-btn">
        <span>&larr;</span>
        <span>Back to Friends</span>
      </button>
      
      <div className="settings-section">
        <h3>AI Moderation</h3>
        {isLoading ? (
          <p>Loading settings...</p>
        ) : (
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={settings.moderationEnabled}
              onChange={handleModerationToggle} 
            />
            <span className="slider"></span>
          </label>
        )}
        <p>Enable to automatically hide inappropriate messages.</p>
      </div>

      <BlockedUsers />
    </div>
  );
};

export default Settings;
