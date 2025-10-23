
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthentication } from './hooks/useAuth';
import '../css/Auth.css';

const AuthForm = ({ isSignUp, onSubmit, error, loading }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSignUp) {
            onSubmit(email, password, username);
        } else {
            onSubmit(email, password);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {isSignUp && (
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                />
            )}
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
            <button type="submit" disabled={loading}>
                {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
        </form>
    );
};

function Login() {
    const [isSignUp, setIsSignUp] = useState(false);
    const { signUp, signIn, error, loading } = useAuthentication();

    const handleFormSubmit = (email, password, username) => {
        if (isSignUp) {
            signUp(email, password, username);
        } else {
            signIn(email, password);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <Link to="/" className="back-to-home">
                    &larr; Back to Home
                </Link>
                <img src="/images/Logo.png" alt="Bonfire" className="auth-logo" />
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
                    disabled={loading}>
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
            </div>
        </div>
    );
}

export default Login;
