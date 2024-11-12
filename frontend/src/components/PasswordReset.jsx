// PasswordResetRequest.js
import React, { useState } from 'react';
import axios from 'axios';

const PasswordResetRequest = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleResetRequest = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/password-reset-request/', { email });
            setMessage(response.data.message);
        } catch (error) {
            setMessage('Error: Email not found.');
        }
    };

    return (
        <div>
            <h2>Password Reset Request</h2>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
            <button onClick={handleResetRequest}>Send Reset Link</button>
            <p>{message}</p>
        </div>
    );
};

export default PasswordResetRequest;
