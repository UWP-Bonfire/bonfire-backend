import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../firebase';

const useFriends = () => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const friendsCollection = collection(firestore, 'users');
        const unsubscribe = onSnapshot(friendsCollection, (snapshot) => {
            if (!snapshot.empty) {
                const friendsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setFriends(friendsList);
            } else {
                setFriends([]);
            }
            setLoading(false);
        }, (err) => {
            setError("Couldn't fetch friends. Please try again later.");
            setLoading(false);
            console.error(err);
        });

        return () => unsubscribe();
    }, []);

    return { friends, loading, error };
};

export default useFriends;
