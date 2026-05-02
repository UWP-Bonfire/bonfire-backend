import { useState, useEffect } from 'react';
import { firestore } from '../../firebase';
import { collection, doc, onSnapshot, getDocs, query, where, updateDoc, arrayRemove, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';
import useBlockUser from './useBlockUser';
import useUserManagement from './useUserManagement';

const useFriends = () => {
    const { user } = useAuth();
    const { blockedUsers } = useBlockUser();
    const [friendIds, setFriendIds] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { userProfiles, loading: profilesLoading } = useUserManagement(friendIds);

    useEffect(() => {
        if (!user) {
            setFriendIds([]);
            setLoading(false);
            return;
        }

        const userDocRef = doc(firestore, 'users', user.uid);

        const unsubscribe = onSnapshot(userDocRef, (userDocSnap) => {
            if (userDocSnap.exists()) {
                const ids = userDocSnap.data().friends || [];
                setFriendIds(ids);
            }
            setLoading(false);
        }, (err) => {
            console.error("Error listening to user document: ", err);
            setError("Failed to listen for friend updates.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        if (profilesLoading || loading) return;

        const getMutedStatus = async (friendId) => {
            const muteDocRef = collection(firestore, 'muted');
            const muteQuery = query(muteDocRef, where('muterId', '==', user.uid), where('mutedId', '==', friendId));
            const muteSnapshot = await getDocs(muteQuery);
            return !muteSnapshot.empty;
        };

        const fetchFriendsData = async () => {
            const friendsData = await Promise.all(
                friendIds.map(async (id) => {
                    if (blockedUsers.includes(id) || !userProfiles[id]) return null;
                    const isMuted = await getMutedStatus(id);
                    return { ...userProfiles[id], isMuted };
                })
            );
            setFriends(friendsData.filter(Boolean));
        };

        fetchFriendsData();

    }, [friendIds, profilesLoading, loading, blockedUsers, user, userProfiles]);

    const unfriend = async (friendId) => {
        if (!user) {
            setError("You must be logged in to unfriend a user.");
            return;
        }

        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, { friends: arrayRemove(friendId) });

            const friendDocRef = doc(firestore, 'users', friendId);
            await updateDoc(friendDocRef, { friends: arrayRemove(user.uid) });

            const chatId = [user.uid, friendId].sort().join('_');
            const chatDocRef = doc(firestore, 'chats', chatId);
            const messagesCollectionRef = collection(chatDocRef, 'messages');

            const messagesSnapshot = await getDocs(messagesCollectionRef);
            const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            await deleteDoc(chatDocRef);

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

    return { friends, loading: loading || profilesLoading, error, unfriend, muteUser, unmuteUser };
};

export default useFriends;
