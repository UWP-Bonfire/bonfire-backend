import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "firebase/auth";
import '../css/Auth.css';

// Custom hook for authentication
const useAuthentication = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuthAction = async (action, email, password) => {
        setLoading(true);
        setError('');
        try {
            await action(auth, email, password);
        } catch (error) {
            setError(getFriendlyErrorMessage(error.code));
        }
        setLoading(false);
    };

    const signUp = (email, password) => handleAuthAction(createUserWithEmailAndPassword, email, password);
    const signIn = (email, password) => handleAuthAction(signInWithEmailAndPassword, email, password);

    // Translate Firebase error codes into user-friendly messages
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

    return { signUp, signIn, error, loading };
};


// AuthForm component
const AuthForm = ({ isSignUp, onSubmit, error }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(email, password);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Email"
                required
            />
            <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Password"
                required
            />
            {error && <p className="error-message">{error}</p>}
            <div className="button-group">
                <button type="submit">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
            </div>
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
            <div className="auth-form">
                <h2>{isSignUp ? 'Create an Account' : 'Welcome Back'}</h2>
                <AuthForm 
                    isSignUp={isSignUp}
                    onSubmit={handleFormSubmit}
                    error={error}
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
