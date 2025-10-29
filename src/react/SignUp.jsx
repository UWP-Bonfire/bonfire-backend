import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/login.css';
import { useAuthentication } from './hooks/useAuth';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const { signUp, error, loading, verificationSent } = useAuthentication();

  const handleSignUp = async (e) => {
    e.preventDefault();
    await signUp(email, password, username);
  };

  return (
    <div className="auth-body">
      <div className="auth-container">
        <h1>Sign Up</h1>
        {error && <p className={`error-message ${verificationSent ? 'verification-sent' : ''}`}>{error}</p>}
        {!verificationSent ? (
          <form onSubmit={handleSignUp}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
        ) : null}

        {verificationSent ? (
          <p className="switch-auth">Please verify your email, then head to the <Link to="/auth">Login Page</Link></p>
        ) : (
          <p className="switch-auth">
            Already have an account? <Link to="/auth">Log In</Link>
          </p>
        )}
      </div>
    </div>
  );
}
