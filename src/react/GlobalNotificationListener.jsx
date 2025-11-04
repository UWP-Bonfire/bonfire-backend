import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './hooks/useAuth';
import useFriends from './hooks/useFriends';
import useNotifications from './hooks/useNotifications';
import useFavicon from './hooks/useFavicon';
import { firestore } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const GlobalNotificationListener = () => {
    const { user } = useAuth();
    const { friends } = useFriends();
    const { showNotification } = useNotifications();
    const { updateFavicon } = useFavicon('/images/Logo.png');
    
    const notifiedSendersRef = useRef(new Set());
    const [notificationCount, setNotificationCount] = useState(0);


    const getChatId = (uid1, uid2) => {
        return [uid1, uid2].sort().join('_');
    };

    const resetNotifications = useCallback(() => {
        notifiedSendersRef.current.clear();
        setNotificationCount(0);
    }, []);

    useEffect(() => {
        updateFavicon(notificationCount);
    }, [notificationCount, updateFavicon]);

    useEffect(() => {
        if (!user || !friends) return;
        
        resetNotifications();

        const sessionStartTime = new Date();
        const currentUserId = user.uid;

        const unsubscribes = friends.map(chat => {
            const chatId = getChatId(currentUserId, chat.id);
            const messagesPath = `chats/${chatId}/messages`;
            const messagesRef = collection(firestore, messagesPath);

            const q = query(messagesRef, where('timestamp', '>', sessionStartTime));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const message = change.doc.data();
                        const senderId = message.senderId;

                        if (senderId && senderId !== currentUserId && !change.doc.metadata.hasPendingWrites) {
                            if (!notifiedSendersRef.current.has(senderId)) {
                                notifiedSendersRef.current.add(senderId);
                                setNotificationCount(notifiedSendersRef.current.size);

                                const senderName = chat.name;
                                const senderAvatar = chat.avatar;

                                showNotification(
                                    `New message from ${senderName || 'Someone'}`,
                                    {
                                        body: message.text,
                                        icon: senderAvatar || '/images/Default PFP.jpg'
                                    }
                                );
                            }
                        }
                    }
                });
            }, (error) => {
                console.error("Error in notification listener for chat:", chatId, error);
            });

            return unsubscribe;
        });

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };

    }, [user, friends, showNotification, resetNotifications]);
    
    useEffect(() => {
        window.addEventListener('focus', resetNotifications);
        return () => {
            window.removeEventListener('focus', resetNotifications)
        }
    }, [resetNotifications]);


    return null;
};

export default GlobalNotificationListener;
