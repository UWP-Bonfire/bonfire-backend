import React from 'react';
import '../css/chatCategoryTabs.css';

const ChatCategoryTabs = ({ activeCategory, setActiveCategory }) => {
    const categories = ['All', 'Group', '18+', 'Individual', 'Global'];

    return (
        <div className="chat-category-tabs-container">
            <ul className="chat-category-tabs">
                {categories.map(category => (
                    <li
                        key={category}
                        className={activeCategory === category ? 'active' : ''}
                        onClick={() => setActiveCategory(category)}
                    >
                        {category}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ChatCategoryTabs;
