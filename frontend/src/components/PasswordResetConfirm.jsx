import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function PasswordResetConfirm() {
  const { token } = useParams();  // Extract the token from the URL
  const navigate = useNavigate();  // To redirect after a successful password reset
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordReset = async () => {
    if (password !== confirmPassword) {
      setMessage('Error: Passwords do not match.');
      return;
    }

    try {
      const response = await axios.post(`http://127.0.0.1:8000/auth/password-reset-confirm/${token}/`, { password });
      setMessage(response.data.message);
      console.log(token)
      // Redirect to login or home after successful password reset
      navigate('/'); // or your desired redirect path
    } catch (error) {
      setMessage('Error: Invalid or expired token.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Set New Password</h2>
        <p className="text-gray-600 mb-6">Enter your new password below to reset your account.</p>
        <div className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-3 py-2 border rounded-md"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3 py-2 border rounded-md"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <button 
          onClick={handlePasswordReset} 
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md mt-6 hover:bg-blue-600 transition duration-300"
          disabled={!password || !confirmPassword || password !== confirmPassword}
        >
          Reset Password
        </button>
        {message && (
          <div className={`mt-4 p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
