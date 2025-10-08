
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, firestore } from '../firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import '../css/Auth.css';

const useAuthentication = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const getFriendlyErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'Invalid credentials. Please try again.';
            case 'auth/email-already-in-use':
                return 'An account with this email already exists.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters long.';
            default:
                return 'An unexpected error occurred. Please try again.';
        }
    };

    const signUp = async (email, password) => {
        setLoading(true);
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (userCredential && userCredential.user) {
                const user = userCredential.user;
                const userRef = doc(firestore, 'users', user.uid);
                await setDoc(userRef, {
                    email: user.email,
                    createdAt: serverTimestamp(),
                    name: email.split('@')[0], // Add a default name
                    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email}` // Add a default avatar
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

const AuthForm = ({ isSignUp, onSubmit, error, loading }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(email, password);
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form-fields">
            <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Email"
                required
                className="auth-input"
            />
            <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Password"
                required
                className="auth-input"
            />
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
        </form>
    );
};

function Auth() {
    const [isSignUp, setIsSignUp] = useState(false);
    const { signUp, signIn, error, loading } = useAuthentication();

    const handleFormSubmit = (email, password) => {
        if (isSignUp) {
            signUp(email, password);
        } else {
            signIn(email, password);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <Link to="/" className="back-to-home">
                    &larr; Back to Home
                </Link>
                <img src="/images/logo.png" alt="Bonfire" className="auth-logo" />
                <h2>{isSignUp ? 'Create an Account' : 'Welcome Back'}</h2>
                <p>{isSignUp ? 'Join the community!' : 'Sign in to continue'}</p>
                <AuthForm 
                    isSignUp={isSignUp}
                    onSubmit={handleFormSubmit}
                    error={error}
                    loading={loading}
                />
                <button 
                    onClick={() => setIsSignUp(!isSignUp)} 
                    className="toggle-auth-mode"
                    disabled={loading}
                >
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
            </div>
        </div>
    );
}

export default Auth;
