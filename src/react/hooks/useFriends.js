import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../firebase';

const useFriends = () => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const friendsRef = ref(db, 'users'); // Assuming 'users' is the path to friends
        const unsubscribe = onValue(friendsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const friendsList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
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
