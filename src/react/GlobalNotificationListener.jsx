import { useEffect, useState, useRef } from 'react';
import { useAuth } from './hooks/useAuth';
import useFriends from './hooks/useFriends';
import useFavicon from './hooks/useFavicon';
import useNotifications from './hooks/useNotifications';
import { firestore } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

const GlobalNotificationListener = () => {
    const { user } = useAuth();
    const { friends } = useFriends();
    const { updateFavicon } = useFavicon('/images/Logo.png');
    const { showNotification } = useNotifications();
    const [unreadCounts, setUnreadCounts] = useState({});

    const getChatId = (uid1, uid2) => {
        return [uid1, uid2].sort().join('_');
    };

    // --- State for Notification Logic ---
    const notifiedUsersRef = useRef(new Set());
    const lastTimestampRef = useRef(new Date().toISOString());

    const notifiedUsersKey = `notifiedUsers_${user?.uid}`;
    const lastTimestampKey = `lastTimestamp_${user?.uid}`;


    // --- On Mount: Load state from sessionStorage ---
    useEffect(() => {
        if (!user) return;
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


    // --- Effect for handling favicon count --- 
    useEffect(() => {
        if (!user || friends.length === 0) {
            updateFavicon(0);
            return;
        }

        const unsubscribes = friends.map(friend => {
            const chatId = getChatId(user.uid, friend.id);
            const messagesRef = collection(firestore, 'chats', chatId, 'messages');
            const q = query(messagesRef, where('read', '==', false), where('senderId', '==', friend.id));

            return onSnapshot(q, snapshot => {
                setUnreadCounts(prevCounts => ({
                    ...prevCounts,
                    [friend.id]: snapshot.size,
                }));
            });
        });

        return () => unsubscribes.forEach(unsub => unsub());
    }, [friends, user]);


    // --- Effect for handling new message notifications ---
    useEffect(() => {
        if (!user || friends.length === 0) {
            return;
        }

        const unsubscribes = friends.map(friend => {
            const chatId = getChatId(user.uid, friend.id);
            const messagesRef = collection(firestore, 'chats', chatId, 'messages');

            const q = query(
                messagesRef,
                where('timestamp', '>', new Date(lastTimestampRef.current)),
                orderBy('timestamp')
            );

            return onSnapshot(q, (snapshot) => {
                const newMessagesFromFriend = [];
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added' && !change.doc.metadata.hasPendingWrites) {
                        const message = change.doc.data();
                        if (message.senderId === friend.id) {
                            newMessagesFromFriend.push(message);
                        }
                    }
                });

                if (newMessagesFromFriend.length > 0 && !notifiedUsersRef.current.has(friend.id)) {
                    showNotification(
                        `New message from ${friend.name || 'Someone'}`,
                        {
                            body: newMessagesFromFriend[newMessagesFromFriend.length - 1].text,
                            icon: friend.avatar || '/images/Default PFP.jpg'
                        }
                    );

                    notifiedUsersRef.current.add(friend.id);
                    sessionStorage.setItem(notifiedUsersKey, JSON.stringify(Array.from(notifiedUsersRef.current)));
                }

                if (!snapshot.empty) {
                    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
                    const newTimestamp = lastDoc.data().timestamp.toDate().toISOString();
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

    }, [user, friends, showNotification, notifiedUsersKey, lastTimestampKey]);

    // --- Effect to update favicon AND reset notification status ---
    useEffect(() => {
        const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
        updateFavicon(totalUnread);

        if (user) {
            let changed = false;
            const notifiedUsers = notifiedUsersRef.current;
            
            Object.entries(unreadCounts).forEach(([friendId, count]) => {
                if (count === 0 && notifiedUsers.has(friendId)) {
                    notifiedUsers.delete(friendId);
                    changed = true;
                }
            });

            if (changed) {
                sessionStorage.setItem(notifiedUsersKey, JSON.stringify(Array.from(notifiedUsers)));
            }
        }
    }, [unreadCounts, updateFavicon, user, notifiedUsersKey]);

    return null;
};

export default GlobalNotificationListener;
