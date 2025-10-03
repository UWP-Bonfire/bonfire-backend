import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { db } from '../../firebase';
import { ref, onValue, push, serverTimestamp, query, orderByChild } from 'firebase/database';

const useChat = (friendId) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    const getChatId = (uid1, uid2) => {
        return [uid1, uid2].sort().join('_');
    };

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const chatId = friendId ? getChatId(user.uid, friendId) : 'global';
        const messagesPath = friendId ? `chats/${chatId}/messages` : 'messages';
        const messagesRef = query(ref(db, messagesPath), orderByChild("timestamp"));

        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const messagesData = [];
            snapshot.forEach((childSnapshot) => {
                messagesData.push({ id: childSnapshot.key, ...childSnapshot.val() });
            });
            setMessages(messagesData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching messages: ", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, friendId]);

    const sendMessage = async (text) => {
        if (text.trim() === "" || !user) return;

        const chatId = friendId ? getChatId(user.uid, friendId) : 'global';
        const messagesPath = friendId ? `chats/${chatId}/messages` : 'messages';
        const messagesRef = ref(db, messagesPath);

        try {
            await push(messagesRef, {
                text,
                timestamp: serverTimestamp(),
                uid: user.uid,
                displayName: user.displayName || 'Anonymous',
                photoURL: user.photoURL,
            });
        } catch (err) {
            console.error("Error sending message: ", err);
        }
    };

    return { messages, loading, sendMessage };
};

export default useChat;
