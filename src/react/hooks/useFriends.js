import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, query, where, documentId } from 'firebase/firestore';
import { firestore, auth } from '../../firebase';

const useFriends = () => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let unsubscribeFromFriends;
        const unsubscribeFromAuth = auth.onAuthStateChanged(user => {
            if (user) {
                const userDocRef = doc(firestore, 'users', user.uid);
                const unsubscribeFromUser = onSnapshot(userDocRef, (userDoc) => {
                    if (unsubscribeFromFriends) {
                        unsubscribeFromFriends();
                    }
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const friendUids = userData.friends || [];

                        if (friendUids.length > 0) {
                            const usersCollection = collection(firestore, 'users');
                            const friendsQuery = query(usersCollection, where(documentId(), 'in', friendUids));
                            unsubscribeFromFriends = onSnapshot(friendsQuery, (snapshot) => {
                                const friendsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                                setFriends(friendsData);
                                setLoading(false);
                            }, (err) => {
                                console.error(err);
                                setError("Couldn't fetch friends.");
                                setLoading(false);
                            });
                        } else {
                            setFriends([]);
                            setLoading(false);
                        }
                    } else {
                        setLoading(false);
                    }
                }, (err) => {
                    console.error(err);
                    setError("Couldn't fetch user data.");
                    setLoading(false);
                });
                return () => unsubscribeFromUser();
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
