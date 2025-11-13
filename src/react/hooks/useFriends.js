import { useState, useEffect } from 'react';
import { firestore } from '../../firebase';
import { collection, doc, onSnapshot, getDocs, query, where, documentId, updateDoc, arrayRemove, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';

const useFriends = () => {
    const { user } = useAuth();
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
                        setFriends(friendsData);
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
    }, [user]);

    const unfriend = async (friendId) => {
        if (!user) return;

        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            const friendDocRef = doc(firestore, 'users', friendId);

            await updateDoc(userDocRef, {
                friends: arrayRemove(friendId)
            });

            await updateDoc(friendDocRef, {
                friends: arrayRemove(user.uid)
            });

        } catch (err) {
            console.error("Error unfriending user: ", err);
            setError("Error unfriending user.");
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
