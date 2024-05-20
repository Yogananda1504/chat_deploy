import React from 'react';
import './E_401.css';
class E_401 extends React.Component {
    render() {
        return (
            <div className="error-container">
                <h1 className="error-title">401 Unauthorized</h1>
                <p className="error-message">You are not authorized to access this resource.</p>
            </div>
        );
    }
}

export default E_401;