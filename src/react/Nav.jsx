import React from 'react';
import { NavLink } from 'react-router-dom';
import '../css/Nav.css'; // Assuming you have a CSS file for the navigation bar

const Nav = () => {
    return (
        <nav className="nav-bar">
            <NavLink to="/app" className="nav-item" end>
                <span className="nav-icon">🏠</span>
                <span className="nav-text">Home</span>
            </NavLink>
            <NavLink to="/app/chat" className="nav-item">
                <span className="nav-icon">💬</span>
                <span className="nav-text">Chat</span>
            </NavLink>
            <NavLink to="/app/friends" className="nav-item">
                <span className="nav-icon">👥</span>
                <span className="nav-text">Friends</span>
            </NavLink>
            <NavLink to="/app/add-friend" className="nav-item">
                <span className="nav-icon">➕</span>
                <span className="nav-text">Add</span>
            </NavLink>
            <NavLink to="/app/profile" className="nav-item">
                <span className="nav-icon">👤</span>
                <span className="nav-text">Profile</span>
            </NavLink>
        </nav>
    );
};

export default Nav;
