import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../css/friends.css";
import "../css/optionsMenu.css";
import "../css/notifications.css";
import useFriends from './hooks/useFriends';
import { auth, firestore } from '../firebase';
import { signOut } from "firebase/auth";
import FriendRequests from './FriendRequests';
import { useAuth } from './hooks/useAuth';
import useNotifications from './hooks/useNotifications';
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import useFriendRequests from "./hooks/useFriendRequests";
import useChatSettings from "./hooks/useChatSettings";
import settingsIcon from '../assets/Settings.svg';
import bellIcon from '../assets/Bell.png';
import messageIcon from '../assets/images/message.png';

export default function Friends() {
  const navigate = useNavigate();
  const { friends, loading, error, unfriend, muteUser, unmuteUser } = useFriends();
  const { user, userProfile } = useAuth();
  const { requestPermission } = useNotifications();
  const [unreadCounts, setUnreadCounts] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const { requests: friendRequests, acceptRequest, declineRequest } = useFriendRequests();
  const [notifications, setNotifications] = useState([]);
  const [activeOptionsMenu, setActiveOptionsMenu] = useState(null);
  const { toggleLimit } = useChatSettings();
  const [chatLimits, setChatLimits] = useState({});
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeOptionsMenu && menuRef.current && !menuRef.current.contains(event.target)) {
        if (!event.target.closest('.options-btn')) {
            setActiveOptionsMenu(null);
        }
    }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeOptionsMenu]);

  useEffect(() => {
    if (!user || friends.length === 0) return;

    const unsubscribes = friends.map(friend => {
        const chatId = [user.uid, friend.id].sort().join('_');
        const chatRef = doc(firestore, 'chats', chatId);
        return onSnapshot(chatRef, (doc) => {
            setChatLimits(prev => ({ ...prev, [friend.id]: doc.data()?.limitNotifications }));
        });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [friends, user]);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    if (!user) return;

    const unreadMessages = Object.entries(unreadCounts)
        .filter(([, count]) => count > 0)
        .map(([friendId]) => {
            const friend = friends.find(f => f.id === friendId);
            if (friend?.isMuted) return null;
            return {
                id: `msg-${friendId}`,
                type: 'message',
                title: `New message from ${friend?.name}`,
                avatar: friend?.avatar
            };
        }).filter(Boolean);

    const newFriendRequests = friendRequests.map(req => ({
        id: req.id,
        from: req.from,
        type: 'friendRequest',
        title: `New friend request from ${req.fromName}`,
        avatar: req.fromAvatar
    }));

    setNotifications([...unreadMessages, ...newFriendRequests]);
}, [unreadCounts, friendRequests, friends, user]);

useEffect(() => {
  if (!user || friends.length === 0) {
      return;
  }

  const unsubscribes = friends.map(friend => {
      if (friend.isMuted) {
          setUnreadCounts(prevCounts => {
              const newCounts = { ...prevCounts };
              delete newCounts[friend.id];
              return newCounts;
          });
          return () => {};
      }

      const chatId = [user.uid, friend.id].sort().join('_');
      const messagesRef = collection(firestore, 'chats', chatId, 'messages');
      const q = query(messagesRef, where('read', '==', false), where('senderId', '==', friend.id));

      const unsubscribe = onSnapshot(q, snapshot => {
          const limitActive = chatLimits[friend.id];
          let displayCount;

          if (limitActive) {
              const unreadNonSilentCount = snapshot.docs.filter(doc => !doc.data().isSilent).length;
              displayCount = Math.min(unreadNonSilentCount, 3);
          } else {
              displayCount = snapshot.size;
          }

          setUnreadCounts(prevCounts => ({
              ...prevCounts,
              [friend.id]: displayCount,
          }));
      });
      return unsubscribe;
  });

  return () => {
      unsubscribes.forEach(unsub => unsub());
  };
}, [friends, user, chatLimits]);

  const handleChatClick = (friendId) => {
    navigate(`/app/chat`, { state: { friendId } });
  };

  const handleSignOut = () => {
    signOut(auth).then(() => {
      navigate('/'); 
    }).catch((error) => {
      console.error("Sign out error:", error);
    });
  };

  const handleAddFriend = () => {
    navigate('/app/add-friend');
  };

  const toggleOptionsMenu = (friendId) => {
    setActiveOptionsMenu(activeOptionsMenu === friendId ? null : friendId);
  };

  const handleUnfriend = (friendId) => {
    if (window.confirm("Are you sure you want to unfriend this user?")) {
      unfriend(friendId);
      setActiveOptionsMenu(null);
    }
  };

  const handleMuteToggle = (friend) => {
    if (friend.isMuted) {
      unmuteUser(friend.id);
    } else {
      muteUser(friend.id);
    }
    setActiveOptionsMenu(null);
  };

  const handleLimitToggle = (friendId) => {
    toggleLimit(friendId, chatLimits[friendId]);
    setActiveOptionsMenu(null);
  };


  if (loading) {
    return <div>Loading friends...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="container">
      {/* Sidebar (Direct Messages Only) */}
      <div className="sidebar">
        <h2>Direct Messages</h2>

        <div className="dm-list">
          {friends.map((friend) => (
            <div
              className="dm"
              key={friend.id}
              onClick={() => handleChatClick(friend.id)}
            >
              <img src={friend.avatar || 'https://firebasestorage.googleapis.com/v0/b/bonfire-d8db1.firebasestorage.app/o/Profile_Pictures%2Flogo.png?alt=media&token=15ac7dfc-d970-49f2-a9c6-429dd0656f0a'} alt={friend.name} />
              <span>{friend.name}</span>
              {unreadCounts[friend.id] > 0 && (
                <span className="unread-count">{unreadCounts[friend.id]}</span>
              )}
            </div>
          ))}
        </div>

        <div className="bottom-section">
          <div className="settings-btn" onClick={() => navigate("/app/settings")}>
            <img src={settingsIcon} alt="Settings" />
          </div>
          {user && userProfile && (
            <div className="user" onClick={() => navigate("/app/account")}>
              <img src={userProfile.avatar || 'https://firebasestorage.googleapis.com/v0/b/bonfire-d8db1.firebasestorage.app/o/Profile_Pictures%2Flogo.png?alt=media&token=15ac7dfc-d970-49f2-a9c6-429dd0656f0a'} alt="User" />
              <span>{user.displayName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Area */}
      <div className="main">
        <div className="main-header">
          <h1>Friends</h1>
          <button onClick={handleAddFriend} className="add-friend">Add Friend</button>
          <div 
            className="notification-container"
            onMouseEnter={() => setShowPopup(true)}
            onMouseLeave={() => setShowPopup(false)}
          >
            <img src={bellIcon} className="notification-bell" alt="Bell"/>
            {showPopup && (
              <div className="notification-popup">
                <p>Notifications</p>
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div key={notif.id} className="notification-item">
                      <img src={notif.avatar || 'https://firebasestorage.googleapis.com/v0/b/bonfire-d8db1.firebasestorage.app/o/Profile_Pictures%2Flogo.png?alt=media&token=15ac7dfc-d970-49f2-a9c6-429dd0656f0a'} alt="avatar" />
                      <span>{notif.title}</span>
                      {notif.type === 'friendRequest' && (
                        <div className="notification-actions">
                            <button onClick={() => acceptRequest(notif.id, notif.from)} className="accept-btn">✓</button>
                            <button onClick={() => declineRequest(notif.id)} className="decline-btn">X</button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No new notifications</p>
                )}
              </div>
            )}
          </div>
          <button onClick={handleSignOut} className="sign-out-btn">Sign Out</button>
        </div>
        
        <FriendRequests />

        <div className="friends-container">
          {friends.length === 0 ? (
                <div className="no-friends-message">
                    <p>You haven't added any friends yet. Use the "Add Friend" button to connect with others.</p>
                </div>
            ) : (
                friends.map((friend) => (
                    <div className="friend-card" key={friend.id}>
                        <img src={friend.avatar || 'https://firebasestorage.googleapis.com/v0/b/bonfire-d8db1.firebasestorage.app/o/Profile_Pictures%2Flogo.png?alt=media&token=15ac7dfc-d970-49f2-a9c6-429dd0656f0a'} alt={friend.name} />
                        <div className="friend-info">
                            <span className="friend-name">{friend.name}</span>
                            {unreadCounts[friend.id] > 0 && (
                                <span className="unread-count">{unreadCounts[friend.id]}</span>
                            )}
                        </div>
                        <div className="friend-actions">
                            <button className="chat-btn" onClick={() => handleChatClick(friend.id)}>
                              <img src={messageIcon} alt="Chat" />
                            </button>
                            <div className="options-menu-container">
                              <button className="options-btn" onClick={() => toggleOptionsMenu(friend.id)}>⋮</button>
                              {activeOptionsMenu === friend.id && (
                                <div className="options-menu" ref={menuRef}>
                                  <div className="options-menu-item" onClick={() => handleUnfriend(friend.id)}>Unfriend</div>
                                  <div className="options-menu-item" onClick={() => handleMuteToggle(friend)}>
                                    {friend.isMuted ? 'Unmute' : 'Mute'}
                                  </div>
                                  <div className="options-menu-item" onClick={() => handleLimitToggle(friend.id)}>
                                    {chatLimits[friend.id] ? 'Disable Limiting' : 'Limit Notifications'}
                                  </div>
                                </div>
                              )}
                            </div>
                        </div>
                    </div>
                 ))
            )
          }
        </div>
      </div>
    </div>
  );
}
