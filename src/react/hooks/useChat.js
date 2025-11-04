import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { firestore } from '../../firebase';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    getDocs,
    where,
    doc,
    updateDoc,
} from 'firebase/firestore';

const useChat = (friendId) => {
    const { user, userProfile } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfiles, setUserProfiles] = useState({});
    const profilesRef = useRef({});

    useEffect(() => {
        profilesRef.current = userProfiles;
    }, [userProfiles]);

    const getChatId = (uid1, uid2) => {
        return [uid1, uid2].sort().join('_');
    };

    const fetchUserProfiles = useCallback(async (uids) => {
        const uidsToFetch = uids.filter(uid => !profilesRef.current[uid]);
        if (uidsToFetch.length === 0) return;

        const newUserProfiles = {};
        const chunks = [];
        for (let i = 0; i < uidsToFetch.length; i += 30) {
            chunks.push(uidsToFetch.slice(i, i + 30));
        }

        for (const chunk of chunks) {
            const usersQuery = query(collection(firestore, 'users'), where('__name__', 'in', chunk));
            const usersSnapshot = await getDocs(usersQuery);
            usersSnapshot.forEach(doc => {
                newUserProfiles[doc.id] = doc.data();
            });
        }

        setUserProfiles(prevProfiles => ({ ...prevProfiles, ...newUserProfiles }));
    }, []);

    useEffect(() => {
        if (!user || !friendId) {
            setMessages([]);
            setLoading(false);
            return;
        }

        setMessages([]);
        setLoading(true);

        const isGlobalChat = friendId === 'global';
        const messagesPath = isGlobalChat ? 'messages' : `chats/${getChatId(user.uid, friendId)}/messages`;

        const messagesRef = collection(firestore, messagesPath);
        const q = query(messagesRef, orderBy("timestamp"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const allMessages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(allMessages);

            const uids = [...new Set(allMessages.map(msg => msg.senderId).filter(Boolean))];
            if (uids.length > 0) {
                fetchUserProfiles(uids);
            }

            setLoading(false);
        }, (err) => {
            console.error("Error fetching messages: ", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, friendId, fetchUserProfiles]);

    const sendMessage = useCallback(async (text) => {
        if (text.trim() === "" || !user || !userProfile || !friendId) return;

        const isGlobalChat = friendId === 'global';
        const messagesPath = isGlobalChat ? 'messages' : `chats/${getChatId(user.uid, friendId)}/messages`;
        
        const messagesRef = collection(firestore, messagesPath);

        try {
            await addDoc(messagesRef, {
                text,
                timestamp: serverTimestamp(),
                senderId: user.uid,
                displayName: userProfile.name || 'Anonymous',
                photoURL: userProfile.avatar,
                read: false,
            });
        } catch (err) {
            console.error("Error sending message: ", err);
        }
    }, [user, userProfile, friendId]);

    const markMessageAsRead = useCallback(async (messageId) => {
        if (!user || !friendId || friendId === 'global') return;
        
        const chatId = getChatId(user.uid, friendId);
        const messagesPath = `chats/${chatId}/messages`;
        const messageRef = doc(firestore, messagesPath, messageId);

        try {
            await updateDoc(messageRef, {
                read: true,
            });
        } catch (err) {
            console.error("Error marking message as read: ", err);
        }
    }, [user, friendId]);

    return { messages, loading, sendMessage, userProfiles, markMessageAsRead };
};

export default useChat;
