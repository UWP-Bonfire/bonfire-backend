import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { firestore } from '../../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

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
        const messagesRef = collection(firestore, messagesPath);
        const q = query(messagesRef, orderBy("timestamp"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messagesData = [];
            querySnapshot.forEach((doc) => {
                messagesData.push({ id: doc.id, ...doc.data() });
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
        const messagesRef = collection(firestore, messagesPath);

        try {
            await addDoc(messagesRef, {
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
