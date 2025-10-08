import { useState, useEffect } from 'react';
import { firestore } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, deleteDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';

const useFriendRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const q = query(collection(firestore, 'friendRequests'), where('to', '==', user.uid), where('status', '==', 'pending'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const requestsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRequests(requestsData);
            setLoading(false);
        }, (err) => {
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const acceptRequest = async (requestId, fromId) => {
        if (!user) return;

        const userRef = doc(firestore, 'users', user.uid);
        const friendRef = doc(firestore, 'users', fromId);
        const requestRef = doc(firestore, 'friendRequests', requestId);

        try {
            await updateDoc(userRef, {
                friends: arrayUnion(fromId)
            });
            await updateDoc(friendRef, {
                friends: arrayUnion(user.uid)
            });
            await deleteDoc(requestRef);
        } catch (err) {
            setError(err.message);
        }
    };

    const declineRequest = async (requestId) => {
        const requestRef = doc(firestore, 'friendRequests', requestId);
        try {
            await deleteDoc(requestRef);
        } catch (err) {
            setError(err.message);
        }
    };

    return { requests, loading, error, acceptRequest, declineRequest };
};

export default useFriendRequests;