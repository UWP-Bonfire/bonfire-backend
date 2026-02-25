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
    getDoc,
    setDoc,
    increment,
} from 'firebase/firestore';
import useBlockUser from './useBlockUser';

const useChat = (friendId) => {
    const { user, userProfile } = useAuth();
    const { blockedUsers } = useBlockUser();
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
            const filteredMessages = allMessages.filter(msg => !blockedUsers.includes(msg.senderId));
            setMessages(filteredMessages);

            const uids = [...new Set(filteredMessages.map(msg => msg.senderId).filter(Boolean))];
            if (uids.length > 0) {
                fetchUserProfiles(uids);
            }

            setLoading(false);
        }, (err) => {
            console.error("Error fetching messages: ", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, friendId, fetchUserProfiles, blockedUsers]);

    const sendMessage = useCallback(async (text) => {
        if (text.trim() === "" || !user || !userProfile || !friendId) return;
        if (blockedUsers.includes(friendId)) {
            console.log("You cannot send messages to a blocked user.");
            return;
        }

        const isGlobalChat = friendId === 'global';
        const messagesPath = isGlobalChat ? 'messages' : `chats/${getChatId(user.uid, friendId)}/messages`;
        const messagesRef = collection(firestore, messagesPath);

        try {
            let messagePayload = {
                text,
                timestamp: serverTimestamp(),
                senderId: user.uid,
                displayName: userProfile.name || 'Anonymous',
                photoURL: userProfile.avatar,
                read: false,
            };

            if (!isGlobalChat) {
                const chatId = getChatId(user.uid, friendId);
                const chatRef = doc(firestore, 'chats', chatId);
                const chatSnap = await getDoc(chatRef);
                let chatData;

                if (!chatSnap.exists()) {
                    chatData = {
                        limitNotifications: false,
                        consecutiveUnread: { [user.uid]: 0, [friendId]: 0 },
                        users: [user.uid, friendId],
                    };
                    await setDoc(chatRef, chatData);
                } else {
                    chatData = chatSnap.data();
                }

                if (chatData.limitNotifications) {
                    if (chatData.consecutiveUnread[friendId] >= 3) {
                        messagePayload.isSilent = true;
                    }
                    await updateDoc(chatRef, {
                        [`consecutiveUnread.${friendId}`]: increment(1),
                        [`consecutiveUnread.${user.uid}`]: 0
                    });
                }
            }
            
            await addDoc(messagesRef, messagePayload);

        } catch (err) {
            console.error("Error sending message: ", err);
        }
    }, [user, userProfile, friendId, blockedUsers]);

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