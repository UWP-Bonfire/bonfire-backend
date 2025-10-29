import { useState, useEffect } from 'react';
import { auth, firestore } from '../../firebase';
import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    signOut
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, getDocs, collection, query, where } from 'firebase/firestore';

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && user.emailVerified) {
                const userRef = doc(firestore, 'users', user.uid);
                const docSnap = await getDoc(userRef);
                
                let profileData;
                if (docSnap.exists()) {
                    profileData = docSnap.data();
                } else {
                    const newProfile = {
                        email: user.email,
                        createdAt: serverTimestamp(),
                        name: user.displayName, // Username stored during sign-up
                        displayName: user.displayName,
                        avatar: '/images/Logo.png'
                    };
                    await setDoc(userRef, newProfile);
                    const newDocSnap = await getDoc(userRef);
                    profileData = newDocSnap.data();
                }
                setUserProfile(profileData);
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
    const [verificationSent, setVerificationSent] = useState(false);

    const getFriendlyErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'Invalid email or password. Please try again.';
            case 'auth/email-already-in-use':
                return 'An account with this email already exists.';
            case 'auth/password-does-not-meet-requirements':
                return 'Password should contain 8-36 characters, a lower and uppercase character, a number, and a special character.';
            case 'auth/email-not-verified':
                return 'Please verify your email before logging in. A new verification email has been sent.';
            default:
                return 'An unexpected error occurred. Please try again.';
        }
    };

    const signUp = async (email, password, username) => {
        setLoading(true);
        setError('');
        setVerificationSent(false);
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
                await updateProfile(user, { displayName: username });
                await sendEmailVerification(user);
                await signOut(auth);

                setVerificationSent(true);
                setError('A verification email has been sent. Please check your inbox and verify your account before logging in.');
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
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (!userCredential.user.emailVerified) {
                await sendEmailVerification(userCredential.user);
                await signOut(auth);
                setError(getFriendlyErrorMessage('auth/email-not-verified'));
            }
        } catch (error) {
            if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                 setError('Invalid email or password. Please try again.');
            } else {
                 setError(getFriendlyErrorMessage(error.code));
            }
        }
        setLoading(false);
    };

    return { signUp, signIn, error, loading, verificationSent };
};

export { useAuth, useAuthentication };
