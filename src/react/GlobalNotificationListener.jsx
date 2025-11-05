import { useEffect, useState } from 'react';
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

    // Effect for handling favicon count
    useEffect(() => {
        if (!user || friends.length === 0) {
            updateFavicon(0);
            return;
        }

        const unsubscribes = friends.map(friend => {
            const chatId = getChatId(user.uid, friend.id);
            const messagesRef = collection(firestore, 'chats', chatId, 'messages');
            const q = query(messagesRef, where('read', '==', false), where('senderId', '==', friend.id));

            const unsubscribe = onSnapshot(q, snapshot => {
                setUnreadCounts(prevCounts => ({
                    ...prevCounts,
                    [friend.id]: snapshot.size,
                }));
            });
            return unsubscribe;
        });

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [friends, user]);

    // Effect for handling new message notifications
    useEffect(() => {
        if (!user || friends.length === 0) {
            return;
        }

        const sessionStartTime = new Date();

        const unsubscribes = friends.map(friend => {
            const chatId = getChatId(user.uid, friend.id);
            const messagesRef = collection(firestore, 'chats', chatId, 'messages');
            const q = query(
                messagesRef,
                where('timestamp', '>', sessionStartTime),
                orderBy('timestamp')
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                snapshot.docChanges().forEach(change => {
                    const message = change.doc.data();
                    if (change.type === 'added' && !change.doc.metadata.hasPendingWrites && message.senderId === friend.id) {
                        showNotification(
                            `New message from ${friend.name || 'Someone'}`,
                            {
                                body: message.text,
                                icon: friend.avatar || '/images/Default PFP.jpg'
                            }
                        );
                    }
                });
            }, (error) => {
                console.error(`Error in notification listener for chat with ${friend.name}:`, error);
            });
            return unsubscribe;
        });

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [user, friends, showNotification]);

    // Effect to update the favicon
    useEffect(() => {
        const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
        updateFavicon(totalUnread);
    }, [unreadCounts, updateFavicon]);

    return null;
};

export default GlobalNotificationListener;
