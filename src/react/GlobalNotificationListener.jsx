import { useEffect, useRef } from 'react';
import { useAuth } from './hooks/useAuth';
import useFriends from './hooks/useFriends';
import useNotifications from './hooks/useNotifications';
import { firestore } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const GlobalNotificationListener = () => {
    const { user } = useAuth();
    const { friends } = useFriends();
    const { showNotification } = useNotifications();
    const listenerAttachedTime = useRef(new Date());

    const getChatId = (uid1, uid2) => {
        return [uid1, uid2].sort().join('_');
    };

    useEffect(() => {
        if (!user || !friends) return;

        // Combine friends and global chat for setting up listeners
        const allChats = [...friends, { id: 'global', name: 'Global Chat' }];

        const unsubscribes = allChats.map(chat => {
            const isGlobal = chat.id === 'global';
            const messagesPath = isGlobal 
                ? 'messages' 
                : `chats/${getChatId(user.uid, chat.id)}/messages`;

            const messagesRef = collection(firestore, messagesPath);
            const q = query(messagesRef, where('timestamp', '>', listenerAttachedTime.current));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                snapshot.docChanges().forEach(change => {
                    // We only care about new documents added
                    if (change.type === 'added') {
                        const message = change.doc.data();
                        
                        // Make sure it's not the user's own message
                        if (message.senderId && message.senderId !== user.uid) {
                            const senderName = isGlobal ? message.displayName : chat.name;
                            const senderAvatar = isGlobal ? message.photoURL : chat.avatar;

                            showNotification(
                                `New message from ${senderName || 'Someone'}`,
                                {
                                    body: message.text,
                                    icon: senderAvatar || '/images/Default PFP.jpg'
                                }
                            );
                        }
                    }
                });
            });

            return unsubscribe;
        });

        // Cleanup function to unsubscribe from all listeners
        return () => {
            unsubscribes.forEach(unsub => unsub());
        };

    }, [user, friends, showNotification]);

    // This component does not render anything
    return null;
};

export default GlobalNotificationListener;
