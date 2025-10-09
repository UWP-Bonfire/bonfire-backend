import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { firestore, auth } from '../../firebase';

const useFriends = () => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let unsubscribeFromFriends;

        const unsubscribeFromAuth = auth.onAuthStateChanged(user => {
            if (user) {
                const usersCollection = collection(firestore, 'users');
                unsubscribeFromFriends = onSnapshot(usersCollection, (snapshot) => {
                    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    const otherUsers = users.filter(u => u.id !== user.uid);
                    setFriends(otherUsers);
                    setLoading(false);
                }, (err) => {
                    console.error(err);
                    setError("Couldn't fetch friends.");
                    setLoading(false);
                });
            } else {
                if (unsubscribeFromFriends) {
                    unsubscribeFromFriends();
                }
                setFriends([]);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeFromAuth();
            if (unsubscribeFromFriends) {
                unsubscribeFromFriends();
            }
        };
    }, []);

    return { friends, loading, error };
};

export default useFriends;
