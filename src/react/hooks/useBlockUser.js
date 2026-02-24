
import { useState, useEffect } from 'react';
import { firestore } from '../../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { useAuth } from './useAuth';

const useBlockUser = () => {
    const { user } = useAuth();
    const [blockedUsers, setBlockedUsers] = useState([]);

    useEffect(() => {
        if (user) {
            const userRef = doc(firestore, 'users', user.uid);
            const unsubscribe = onSnapshot(userRef, (doc) => {
                if (doc.exists() && doc.data().blockedUsers) {
                    setBlockedUsers(doc.data().blockedUsers);
                } else {
                    setBlockedUsers([]);
                }
            });

            return () => unsubscribe();
        }
    }, [user]);

    const blockUser = async (userIdToBlock) => {
        if (user) {
            const userRef = doc(firestore, 'users', user.uid);
            await updateDoc(userRef, {
                blockedUsers: arrayUnion(userIdToBlock)
            });
        }
    };

    const unblockUser = async (userIdToUnblock) => {
        if (user) {
            const userRef = doc(firestore, 'users', user.uid);
            await updateDoc(userRef, {
                blockedUsers: arrayRemove(userIdToUnblock)
            });
        }
    };

    return { blockedUsers, blockUser, unblockUser };
};

export default useBlockUser;
