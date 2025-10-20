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
} from 'firebase/firestore';

const useChat = (friendId) => {
    const { user, userProfile } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfiles, setUserProfiles] = useState({});
    const profilesRef = useRef({});

    // Keep the ref in sync with the state to avoid dependency loop
    useEffect(() => {
        profilesRef.current = userProfiles;
    }, [userProfiles]);

    const getChatId = (uid1, uid2) => {
        return [uid1, uid2].sort().join('_');
    };

    const fetchUserProfiles = useCallback(async (uids) => {
        // Use the ref to get current profiles, breaking the dependency cycle
        const uidsToFetch = uids.filter(uid => !profilesRef.current[uid]);
        if (uidsToFetch.length === 0) return;

        const newUserProfiles = {};
        // Firestore 'in' queries are limited to 30 elements
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
    }, []); // Empty dependency array makes this function stable

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
            const messagesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(messagesData);

            // Get all unique sender IDs from the messages
            const uids = [...new Set(messagesData.map(msg => msg.senderId).filter(Boolean))];
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

    const sendMessage = async (text) => {
        if (text.trim() === "" || !user || !userProfile) return;

        const chatId = friendId ? getChatId(user.uid, friendId) : 'global';
        const messagesPath = friendId ? `chats/${chatId}/messages` : 'messages';
        const messagesRef = collection(firestore, messagesPath);

        try {
            await addDoc(messagesRef, {
                text,
                timestamp: serverTimestamp(),
                senderId: user.uid, // Persisting with senderId
                displayName: userProfile.name || 'Anonymous',
                photoURL: userProfile.avatar,
            });
        } catch (err) {
            console.error("Error sending message: ", err);
        }
    };

    return { messages, loading, sendMessage, userProfiles };
};

export default useChat;
