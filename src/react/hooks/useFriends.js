import { useState, useEffect } from 'react';
import { firestore } from '../../firebase';
import { collection, doc, getDoc, getDocs, query, where, documentId } from 'firebase/firestore';
import { useAuth } from './useAuth';

const useFriends = () => {
    const { user } = useAuth();
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFriends = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const userDocRef = doc(firestore, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const friendIds = userDocSnap.data().friends;
                    if (friendIds && friendIds.length > 0) {
                        const friendsQuery = query(collection(firestore, 'users'), where(documentId(), 'in', friendIds));
                        const querySnapshot = await getDocs(friendsQuery);
                        const friendsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        setFriends(friendsData);
                    } else {
                        setFriends([]);
                    }
                }
            } catch (error) {
                console.error("Error fetching friends: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, [user]);

    return { friends, loading };
};

export default useFriends;
