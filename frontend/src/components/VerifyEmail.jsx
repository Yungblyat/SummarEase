import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/auth/verify-email/${token}/`);
                setMessage(response.data.message);
            } catch (error) {
                setError(true);
                setMessage('Verification failed. Invalid or expired token.');
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-md rounded-lg w-full max-w-md p-8">
                <h2 className="text-2xl font-bold text-center mb-6">Email Verification</h2>
                {loading ? (
                    <div className="flex justify-center items-center h-24">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="mt-2 text-lg font-semibold text-gray-900">{message}</p>
                        <p className="mt-1 text-sm text-gray-500">Please request a new verification link.</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="mt-2 text-lg font-semibold text-gray-900">{message}</p>
                        <p className="mt-1 text-sm text-gray-500">You can now log in to your account.</p>
                    </div>
                )}
                <button 
                    className="mt-6 w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={() => navigate('/')}
                >
                    Go to Homepage
                </button>
            </div>
        </div>
    );
};

export default VerifyEmail;