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
import { doc, setDoc, serverTimestamp, getDocs, collection, query, where, onSnapshot } from 'firebase/firestore';

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUnderage, setIsUnderage] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setLoading(true);
            if (currentUser && currentUser.emailVerified) {
                setUser(currentUser);
            } else {
                setUser(null);
                setUserProfile(null);
                setIsUnderage(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            const userRef = doc(firestore, 'users', user.uid);
            const unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    const profileData = docSnap.data();
                    setUserProfile(profileData);

                    if (profileData.dob) {
                        const birthDate = new Date(profileData.dob);
                        const today = new Date();
                        let age = today.getFullYear() - birthDate.getFullYear();
                        const m = today.getMonth() - birthDate.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                            age--;
                        }
                        setIsUnderage(age < 18);
                    } else {
                        setIsUnderage(false); // Default to not underage if no DOB
                    }
                } else {
                    const newProfile = {
                        email: user.email,
                        createdAt: serverTimestamp(),
                        displayName: user.displayName,
                        name: user.displayName,
                        avatar: 'https://firebasestorage.googleapis.com/v0/b/bonfire-d8db1.firebasestorage.app/o/Profile_Pictures%2Flogo.png?alt=media&token=15ac7dfc-d970-49f2-a9c6-429dd0656f0a',
                        bio: 'Welcome to Bonfire!',
                        bgColor: '#ffd9ba',
                        usernameColor: '#c84848',
                        blockedUsers: []
                    };
                    setDoc(userRef, newProfile);
                    setUserProfile(newProfile);
                    setIsUnderage(false); // Default for new profiles
                }
                setLoading(false);
            }, (error) => {
                console.error("Error fetching user profile:", error);
                setUserProfile(null);
                setIsUnderage(null);
                setLoading(false);
            });

            return () => unsubscribeProfile();
        }
    }, [user]);

    return { user, userProfile, loading, isUnderage };
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

                const userRef = doc(firestore, 'users', user.uid);
                const newProfile = {
                    email: user.email,
                    createdAt: serverTimestamp(),
                    displayName: username,
                    name: username,
                    avatar: 'https://firebasestorage.googleapis.com/v0/b/bonfire-d8db1.firebasestorage.app/o/Profile_Pictures%2Flogo.png?alt=media&token=15ac7dfc-d970-49f2-a9c6-429dd0656f0a',
                    bio: 'Welcome to Bonfire!',
                    bgColor: '#ffd9ba',
                    usernameColor: '#c84848',
                    blockedUsers: []
                };
                await setDoc(userRef, newProfile);
                
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
