import { useState, useEffect } from 'react';
import { firestore } from '../../firebase';
import { collection, doc, onSnapshot, getDocs, query, where, documentId, updateDoc, arrayRemove } from 'firebase/firestore';
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
                        const friendsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

    return { friends, loading, error, unfriend };
};

export default useFriends;
