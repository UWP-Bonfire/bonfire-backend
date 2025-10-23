
import { useState, useEffect } from 'react';
import { auth, firestore } from '../../firebase';
import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, getDocs, collection, query, where } from 'firebase/firestore';


const useAuth = () => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = doc(firestore, 'users', user.uid);
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    setUserProfile(docSnap.data());
                }
                setUser(user);
            } else {
                setUser(null);
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { user, userProfile, loading };
};


const useAuthentication = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const getFriendlyErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'Invalid password. Please try again.';
            case 'auth/email-already-in-use':
                return 'An account with this email already exists.';
            case 'auth/password-does-not-meet-requirements':
                return 'Password should contain 8-36 characters, a lower and uppercase character, a number, and a special character.';
            default:
                return 'An unexpected error occurred. Please try again.';
        }
    };

    const signUp = async (email, password, username) => {
        setLoading(true);
        setError('');
        try {
            const usersCollectionRef = collection(firestore, 'users');
            const usernameQuery = query(usersCollectionRef, where("name", "==", username));
            const usernameQuerySnapshot = await getDocs(usernameQuery);

            if (!usernameQuerySnapshot.empty) {
                setError('This username is already taken. Please choose another one.');
                setLoading(false);
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (userCredential && userCredential.user) {
                const user = userCredential.user;
                const userRef = doc(firestore, 'users', user.uid);

                await setDoc(userRef, {
                    email: user.email,
                    createdAt: serverTimestamp(),
                    name: username,
                    avatar: '/images/Logo.png'
                });
            }
        } catch (error) {
            setError(getFriendlyErrorMessage(error.code));
        }
        setLoading(false);
    };

    const signIn = async (email, password) => {
        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setError(getFriendlyErrorMessage(error.code));
        }
        setLoading(false);
    };

    return { signUp, signIn, error, loading };
};

export { useAuth, useAuthentication };
