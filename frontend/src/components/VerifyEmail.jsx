// VerifyEmail.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
    const { token } = useParams();
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/auth/verify-email/${token}/`);
                setMessage(response.data.message);
            } catch (error) {
                setError(true);
                setMessage('Verification failed. Invalid or expired token.');
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div>
            <h2>Email Verification</h2>
            <p>{message}</p>
            {error && <p>Please request a new verification link.</p>}
        </div>
    );
};

export default VerifyEmail;
