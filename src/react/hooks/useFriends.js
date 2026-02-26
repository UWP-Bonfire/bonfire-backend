import { useState, useEffect } from 'react';
import { firestore } from '../../firebase';
import { collection, doc, onSnapshot, getDocs, query, where, documentId, updateDoc, arrayRemove, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';
import useBlockUser from './useBlockUser';

const useFriends = () => {
    const { user } = useAuth();
    const { blockedUsers } = useBlockUser();
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            setFriends([]);
            setLoading(false);
            return;
        }

        const userDocRef = doc(firestore, 'users', user.uid);

        const unsubscribe = onSnapshot(userDocRef, async (userDocSnap) => {
            if (userDocSnap.exists()) {
                const friendIds = userDocSnap.data().friends;
                if (friendIds && friendIds.length > 0) {
                    const friendsQuery = query(collection(firestore, 'users'), where(documentId(), 'in', friendIds));
                    try {
                        const querySnapshot = await getDocs(friendsQuery);
                        const friendsData = await Promise.all(querySnapshot.docs.map(async (doc) => {
                            const friend = { id: doc.id, ...doc.data() };
                            const muteDocRef = collection(firestore, 'muted');
                            const muteQuery = query(muteDocRef, where('muterId', '==', user.uid), where('mutedId', '==', friend.id));
                            const muteSnapshot = await getDocs(muteQuery);
                            friend.isMuted = !muteSnapshot.empty;
                            return friend;
                        }));
                        const nonBlockedFriends = friendsData.filter(friend => !blockedUsers.includes(friend.id));
                        setFriends(nonBlockedFriends);
                    } catch (err) {
                         console.error("Error fetching friends data: ", err);
                         setError("Failed to fetch friends list.");
                    }
                } else {
                    setFriends([]);
                }
            }
            setLoading(false);
        }, (err) => {
            console.error("Error listening to user document: ", err);
            setError("Failed to listen for friend updates.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, blockedUsers]);

    const unfriend = async (friendId) => {
        if (!user) {
            setError("You must be logged in to unfriend a user.");
            return;
        }

        try {
            // 1. Remove friend from both users' friend lists
            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, {
                friends: arrayRemove(friendId)
            });

            const friendDocRef = doc(firestore, 'users', friendId);
            await updateDoc(friendDocRef, {
                friends: arrayRemove(user.uid)
            });

            // 2. Delete the chat history
            const chatId = [user.uid, friendId].sort().join('_');
            const chatDocRef = doc(firestore, 'chats', chatId);
            const messagesCollectionRef = collection(chatDocRef, 'messages');

            // Get all messages and delete them
            const messagesSnapshot = await getDocs(messagesCollectionRef);
            const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            // Delete the chat document itself
            await deleteDoc(chatDocRef);

            // 3. Update local state to remove the friend from the UI
            setFriends(prevFriends => prevFriends.filter(friend => friend.id !== friendId));

        } catch (err) {
            console.error("Error unfriending user: ", err);
            setError("Failed to unfriend user. Please try again.");
        }
    };

    const muteUser = async (friendId) => {
        if(!user) return;
        const muteDocRef = doc(firestore, 'muted', `${user.uid}_${friendId}`);
        try {
            await setDoc(muteDocRef, { muterId: user.uid, mutedId: friendId });
            setFriends(friends.map(f => f.id === friendId ? { ...f, isMuted: true } : f));
        } catch (err) {
            console.error("Error muting user: ", err);
            setError("Error muting user.");
        }
    };

    const unmuteUser = async (friendId) => {
        if(!user) return;
        const muteDocRef = doc(firestore, 'muted', `${user.uid}_${friendId}`);
        try {
            await deleteDoc(muteDocRef);
            setFriends(friends.map(f => f.id === friendId ? { ...f, isMuted: false } : f));
        } catch (err) {
            console.error("Error unmuting user: ", err);
            setError("Error unmuting user.");
        }
    };

    return { friends, loading, error, unfriend, muteUser, unmuteUser };
};

export default useFriends;
