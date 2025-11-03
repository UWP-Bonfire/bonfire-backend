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
                <Icon to="/app/add-friend" imgSrc="/images/search.png" alt="Add Friend" />
                <Icon to="/app/personalization" imgSrc="/images/settings.png" alt="Settings" />
                <Icon to="/app/friends" imgSrc="/images/groups.png" alt="Friends" />
                <Icon to="/app/messages" imgSrc="/images/messages.png" alt="Messages" />
            </div>
            <div className="icons-bottom">
                <Icon to="/app/account" imgSrc="/images/profile.png" alt="Account" />
            </div>
        </div>
    );
}

export default IconBar;
