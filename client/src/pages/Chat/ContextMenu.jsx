import React from 'react';
import './ContextMenu.css';

const ContextMenu = ({ x, y, onClose, onSelect }) => {
    const handleItemClick = (action) => {
        console.log(action); // Add this line
        if (action === 'Select') {
            onSelect(); // Toggle selection mode
        }
        // Handle other actions here
        console.log(`Action selected: ${action}`);
        onClose(); // Close the context menu after action selection
    };
    return (
        <div className="contextMenu" style={{ top: y, left: x }}>
            <ul>
                <li onClick={() => handleItemClick('Select')}>Select</li>
                <li onClick={() => handleItemClick('Delete')}>Delete</li>
                <li onClick={() => handleItemClick('Analyze')}>Analyze</li>
            </ul>
        </div>
    );
};

export default ContextMenu;
