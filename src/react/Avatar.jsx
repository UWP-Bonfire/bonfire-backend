import React from 'react';

const DEFAULT_AVATAR_URL = 'https://firebasestorage.googleapis.com/v0/b/bonfire-d8db1.firebasestorage.app/o/Profile_Pictures%2Flogo.png?alt=media&token=15ac7dfc-d970-49f2-a9c6-429dd0656f0a';

const Avatar = ({ src, alt, className, onClick }) => {
  return (
    <img
      src={src || DEFAULT_AVATAR_URL}
      alt={alt || 'Avatar'}
      className={className}
      onClick={onClick}
    />
  );
};

export default Avatar;