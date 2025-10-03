import React from 'react';
import { NavLink } from 'react-router-dom';

const Icon = ({ to, imgSrc, alt }) => (
    <NavLink to={to} className="icon-link" activeClassName="active">
        <img src={imgSrc} alt={alt} />
    </NavLink>
);

function IconBar() {
    return (
        <div className="icon-bar">
            <div className="icons-top">
                <Icon to="/search" imgSrc="/images/search.png" alt="Search" />
                <Icon to="/settings" imgSrc="/images/settings.png" alt="Settings" />
                <Icon to="/groups" imgSrc="/images/groups.png" alt="Groups" />
                <Icon to="/" imgSrc="/images/messages.png" alt="Messages" />
            </div>
            <div className="icons-bottom">
                <Icon to="/profile" imgSrc="/images/profile.png" alt="Profile" />
            </div>
        </div>
    );
}

export default IconBar;
