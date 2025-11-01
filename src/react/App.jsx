import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import SignUp from './SignUp';
import Home from './Home';
import Chat from './Chat'; //Keep me just in case
import Messages from './Messages';
import Friends from './Friends';
import AddFriends from './AddFriends';
import Profile from './Profile';
import Layout from './Layout';
import { useAuth } from './hooks/useAuth';

const ProtectedRoute = ({ user, children }) => {
    if (!user) {
        return <Navigate to="/auth" replace />;
    }
    return children;
};

const App = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Routes>
            <Route path="/auth" element={user ? <Navigate to="/app" /> : <Login />} />
            <Route path="/signup" element={user ? <Navigate to="/app" /> : <SignUp />} />
            <Route path="/" element={<Home />} />
            <Route 
                path="/app"
                element={
                    <ProtectedRoute user={user}>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Friends />} />
                <Route path="chat" element={<Messages />} />
                <Route path="add-friend" element={<AddFriends />} />
                <Route path="friends" element={<Friends />} />
                <Route path="profile" element={<Profile />} />
                <Route path="messages" element={<Messages />} />
            </Route>
        </Routes>
    );
};

export default App;
