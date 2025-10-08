import React from 'react';
import { Outlet } from 'react-router-dom';
import Nav from './Nav';
import '../css/Layout.css';

const Layout = () => {
    return (
        <div className="layout">
            <Nav />
            <main className="content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
