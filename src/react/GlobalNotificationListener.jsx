import { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import useFriends from './hooks/useFriends';
import useNotifications from './hooks/useNotifications';
import { firestore } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const GlobalNotificationListener = () => {
    const { user } = useAuth();
    const { friends } = useFriends();
    const { showNotification } = useNotifications();

    const getChatId = (uid1, uid2) => {
        return [uid1, uid2].sort().join('_');
    };

    useEffect(() => {
        // If there's no user or no friends, we can't set up listeners.
        if (!user || !friends) return;

        // *** FIX: Create a fresh timestamp EVERY time the effect runs for a new user. ***
        // This ensures we only listen for messages created AFTER this session started.
        const sessionStartTime = new Date();
        const currentUserId = user.uid;

        // We only listen for notifications from private chats with friends.
        const friendChats = [...friends];

        const unsubscribes = friendChats.map(chat => {
            const chatId = getChatId(currentUserId, chat.id);
            const messagesPath = `chats/${chatId}/messages`;
            const messagesRef = collection(firestore, messagesPath);

            // Query for new messages added after the session started.
            const q = query(messagesRef, where('timestamp', '>', sessionStartTime));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                snapshot.docChanges().forEach(change => {
                    // Only process newly added messages.
                    if (change.type === 'added') {
                        const message = change.doc.data();

                        // Do not show notification if the message was sent by the current user,
                        // or if the change is from a local write that hasn't been committed yet.
                        if (message.senderId && message.senderId !== currentUserId && !change.doc.metadata.hasPendingWrites) {
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
                });
            }, (error) => {
                console.error("Error in notification listener for chat:", chatId, error);
            });

            return unsubscribe;
        });

        // Cleanup: Unsubscribe from all listeners when the component unmounts or dependencies change.
        return () => {
            unsubscribes.forEach(unsub => unsub());
        };

    }, [user, friends, showNotification]);

    // This component is for logic only and does not render any UI.
    return null;
};

export default GlobalNotificationListener;
