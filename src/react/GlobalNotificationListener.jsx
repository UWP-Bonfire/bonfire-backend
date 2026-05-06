import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import useFriends from './hooks/useFriends';
import useFavicon from './hooks/useFavicon';
import useNotifications from './hooks/useNotifications';
import { firestore } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, doc } from 'firebase/firestore';
import isEqual from 'lodash.isequal';

const getChatId = (uid1, uid2) => {
    return [uid1, uid2].sort().join('_');
};

const GlobalNotificationListener = () => {
    const { user } = useAuth();
    const { friends } = useFriends();
    const { updateFavicon } = useFavicon('src/assets/images/Logo.png');
    const { showNotification } = useNotifications();
    const [unreadCounts, setUnreadCounts] = useState({});
    const [chatLimits, setChatLimits] = useState({});

    const notifiedUsersRef = useRef(new Set());
    const lastTimestampRef = useRef(new Date().toISOString());
    const notifiedUsersKey = user ? `notifiedUsers_${user.uid}` : null;
    const lastTimestampKey = user ? `lastTimestamp_${user.uid}` : null;

    useEffect(() => {
        if (!user || !notifiedUsersKey || !lastTimestampKey) return;
        try {
            const storedNotifiedUsers = JSON.parse(sessionStorage.getItem(notifiedUsersKey) || '[]');
            notifiedUsersRef.current = new Set(storedNotifiedUsers);
            const storedTimestamp = sessionStorage.getItem(lastTimestampKey);
            lastTimestampRef.current = storedTimestamp || new Date().toISOString();
        } catch (e) {
            console.error("Failed to parse notification state from session storage", e);
            notifiedUsersRef.current = new Set();
            lastTimestampRef.current = new Date().toISOString();
        }
    }, [user, notifiedUsersKey, lastTimestampKey]);

    useEffect(() => {
        if (!user || friends.length === 0) return;

        const unsubscribes = friends.map(friend => {
            const chatId = getChatId(user.uid, friend.id);
            const chatRef = doc(firestore, 'chats', chatId);
            return onSnapshot(chatRef, (doc) => {
                const limit = doc.data()?.limitNotifications;
                setChatLimits(prev => {
                    if (prev[friend.id] !== limit) {
                        return { ...prev, [friend.id]: limit };
                    }
                    return prev;
                });
            });
        });

        return () => unsubscribes.forEach(unsub => unsub());
    }, [friends, user]);

    useEffect(() => {
        if (!user || friends.length === 0) {
            updateFavicon(0);
            return;
        }

        const unsubscribes = friends.map(friend => {
            if (friend.isMuted) {
                setUnreadCounts(prevCounts => {
                    if (prevCounts[friend.id]) {
                        const newCounts = { ...prevCounts };
                        delete newCounts[friend.id];
                        return newCounts;
                    }
                    return prevCounts;
                });
                return () => {};
            }

            const chatId = getChatId(user.uid, friend.id);
            const messagesRef = collection(firestore, 'chats', chatId, 'messages');
            const q = query(messagesRef, where('read', '==', false), where('senderId', '==', friend.id));

            return onSnapshot(q, snapshot => {
                const limitActive = chatLimits[friend.id];
                let displayCount = limitActive 
                    ? Math.min(snapshot.docs.filter(doc => !doc.data().isSilent).length, 3)
                    : snapshot.size;

                setUnreadCounts(prevCounts => {
                    if (prevCounts[friend.id] !== displayCount) {
                        return { ...prevCounts, [friend.id]: displayCount };
                    }
                    return prevCounts;
                });
            });
        });

        return () => unsubscribes.forEach(unsub => unsub());
    }, [friends, user, chatLimits, updateFavicon]);

    const showNotificationCallback = useCallback(showNotification, []);

    useEffect(() => {
        if (!user || friends.length === 0 || !notifiedUsersKey || !lastTimestampKey) {
            return;
        }

        const unsubscribes = friends.map(friend => {
            if (friend.isMuted) return () => {};
            const chatId = getChatId(user.uid, friend.id);
            const messagesRef = collection(firestore, 'chats', chatId, 'messages');
            const q = query(
                messagesRef,
                where('timestamp', '>', new Date(lastTimestampRef.current)),
                orderBy('timestamp')
            );

            return onSnapshot(q, (snapshot) => {
                const newMessages = snapshot.docChanges()
                    .filter(change => change.type === 'added' && !change.doc.metadata.hasPendingWrites)
                    .map(change => change.doc.data())
                    .filter(message => message.senderId === friend.id && !message.isSilent);

                if (newMessages.length > 0 && !notifiedUsersRef.current.has(friend.id)) {
                    showNotificationCallback(
                        `New message from ${friend.name || 'Someone'}`,
                        {
                            body: newMessages[newMessages.length - 1].text,
                            icon: friend.avatar || 'https://firebasestorage.googleapis.com/v0/b/bonfire-d8db1.firebasestorage.app/o/Profile_Pictures%2Flogo.png?alt=media&token=15ac7dfc-d970-49f2-a9c6-429dd0656f0a'
                        }
                    );
                    notifiedUsersRef.current.add(friend.id);
                    sessionStorage.setItem(notifiedUsersKey, JSON.stringify(Array.from(notifiedUsersRef.current)));
                }

                if (!snapshot.empty) {
                    const newTimestamp = snapshot.docs[snapshot.docs.length - 1].data().timestamp.toDate().toISOString();
                    if (newTimestamp > lastTimestampRef.current) {
                        lastTimestampRef.current = newTimestamp;
                        sessionStorage.setItem(lastTimestampKey, newTimestamp);
                    }
                }
            }, (error) => {
                console.error(`Error in notification listener for chat with ${friend.name}:`, error);
            });
        });

        return () => unsubscribes.forEach(unsub => unsub());
    }, [user, friends, showNotificationCallback, notifiedUsersKey, lastTimestampKey]);

    useEffect(() => {
        const mutedFriendIds = new Set(friends.filter(f => f.isMuted).map(f => f.id));
        const totalUnread = Object.entries(unreadCounts)
            .filter(([friendId]) => !mutedFriendIds.has(friendId))
            .reduce((sum, [, count]) => sum + count, 0);
    
        updateFavicon(totalUnread);
    
        if (user && notifiedUsersKey) {
            let changed = false;
            const notifiedUsers = new Set(notifiedUsersRef.current);
            
            Object.entries(unreadCounts).forEach(([friendId, count]) => {
                if ((count === 0 || mutedFriendIds.has(friendId)) && notifiedUsers.has(friendId)) {
                    notifiedUsers.delete(friendId);
                    changed = true;
                }
            });
    
            if (changed) {
                if (!isEqual(notifiedUsers, notifiedUsersRef.current)) {
                    notifiedUsersRef.current = notifiedUsers;
                    sessionStorage.setItem(notifiedUsersKey, JSON.stringify(Array.from(notifiedUsers)));
                }
            }
        }
    }, [unreadCounts, friends, updateFavicon, user, notifiedUsersKey]);

    return null;
};

export default GlobalNotificationListener;
