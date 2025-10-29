import React from 'react';
import { Outlet } from 'react-router-dom';
import '../css/Layout.css';

const Layout = () => {
    return (
        <div className="layout">
            <main className="content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
