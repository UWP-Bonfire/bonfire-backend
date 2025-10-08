import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Auth';
import Chat from './Chat';
import Friends from './Friends';
import AddFriend from './AddFriend'; // Import the AddFriend component
import Layout from './Layout';
import { useAuth } from './hooks/useAuth';

const App = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or a more sophisticated loading spinner
    }

    return (
        <Routes>
            <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth />} />
            <Route 
                path="/"
                element={
                    <ProtectedRoute user={user}>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                {/* Nested routes that use the Layout component */}
                <Route index element={<Friends />} />
                <Route path="chat" element={<Chat />} />
                <Route path="add-friend" element={<AddFriend />} /> {/* Add the route for AddFriend */}
            </Route>
        </Routes>
    );
};

// ProtectedRoute component
const ProtectedRoute = ({ user, children }) => {
    if (!user) {
        return <Navigate to="/auth" replace />;
    }
    return children;
};

export default App;
