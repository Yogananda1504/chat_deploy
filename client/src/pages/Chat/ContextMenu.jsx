import React from 'react';
import './ContextMenu.css';

const ContextMenu = ({
    x,
    y,
    onClose,
    onSelect,
    handleSelectAll,
    handleDeselectAll,
    handleDeleteMessagesForEveryone,
    handleDeleteMessagesForMe,
    
}) => {
    const handleItemClick = (action) => {
        console.log(`Action selected: ${action}`);
        switch (action) {
            case 'Select':
                onSelect();
                break;
            case 'Select All':
                handleSelectAll();
                break;
            case 'Deselect All':
                handleDeselectAll();
                break;
            case 'Delete for me':
                handleDeleteMessagesForMe();
                break;
           
           
            default:
                console.log(`Unhandled action: ${action}`);
        }
        onClose();
    };

    return (
        <div className="contextMenu" style={{ top: y, left: x }}>
            <ul>
                <li onClick={() => handleItemClick('Select')}>Select</li>
                <li onClick={() => handleItemClick('Select All')}>Select All</li>
                <li onClick={() => handleItemClick('Deselect All')}>Deselect All</li>
                <li onClick={() => handleItemClick('Delete for me')}>Delete for me</li>
               
               
            </ul>
        </div>
    );
};

export default ContextMenu;