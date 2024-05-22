import React from 'react';
import './ContextMenu.css';

const ContextMenu = ({ x, y, onClose }) => {
    const handleItemClick = (action) => {
        // Handle the selected action here
        console.log(`Action selected: ${action}`);
        onClose(); // Close the context menu after action selection
    };

    return (
        <div className="contextMenu" style={{ top: y, left: x }}>
            <ul>
                <li onClick={() => handleItemClick('Action 1')}>Select</li>
                <li onClick={() => handleItemClick('Action 2')}>Delete</li>
                <li onClick={() => handleItemClick('Action 3')}>Analyze</li>
            </ul>
        </div>
    );
};

export default ContextMenu;
