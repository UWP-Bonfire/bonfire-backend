import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Auth';
import Home from './Home';
import Chat from './Chat';
import Friends from './Friends';
import AddFriend from './AddFriend';
import Layout from './Layout';
import { useAuth } from './hooks/useAuth';

const App = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Routes>
            <Route path="/auth" element={user ? <Navigate to="/app" /> : <Auth />} />
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
                <Route path="chat" element={<Chat />} />
                <Route path="add-friend" element={<AddFriend />} />
                <Route path="friends" element={<Friends />} /> {/* Add the friends route */}
            </Route>
        </Routes>
    );
};

const ProtectedRoute = ({ user, children }) => {
    if (!user) {
        return <Navigate to="/auth" replace />;
    }
    return children;
};

export default App;
