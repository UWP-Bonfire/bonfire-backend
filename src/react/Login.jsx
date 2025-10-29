import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/login.css';
import { useAuthentication } from './hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, error, loading } = useAuthentication();

  const handleLogin = async (e) => {
    e.preventDefault();
    await signIn(email, password);
  };

  return (
    <div className="auth-body">
      <div className="auth-container">
        <h1>Log In</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
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
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p className="switch-auth">
          Don’t have an account? <Link to="/signin">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
