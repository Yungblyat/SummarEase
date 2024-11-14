import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import "../styles/ResetPassword.css";
import { Eye, EyeClosed } from 'lucide-react';

export default function PasswordResetConfirm() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Password validation criteria
  const isPasswordValid = () => {
    const isLengthValid = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return isLengthValid && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  };

  const handlePasswordReset = async () => {
    setHasSubmitted(true);
    setError('');
    setMessage('');

    // Validate password
    if (!isPasswordValid()) {
      setError(
        'Password must be at least 8 characters long, include uppercase and lowercase letters, a number, and a special character.'
      );
      return;
    }

    // Check if confirm password field is empty
    if (!confirmPassword) {
      setError('Confirm password field cannot be empty.');
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // If all checks pass, proceed with password reset
    try {
      const response = await axios.post(`http://127.0.0.1:8000/auth/password-reset-confirm/${token}/`, { password });
      setMessage(response.data.message);
      navigate('/');
    } catch (error) {
      setMessage('Error: Invalid or expired token.');
    }
  };

  return (
    <div className="reset-pass">
      <div className="reset-pass-container">
        <h2 className="text-2xl font-bold mb-4 text-white text-center">Set New Password</h2>
        <p className="text-white mb-6">Enter your new password below to reset your account.</p>
        <div className="space-y-4">
          {/* Password Input */}
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
              {showPassword ? <Eye /> : <EyeClosed />}
            </button>
          </div>

          {/* Confirm Password Input */}
          <div className="relative mt-4">
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
              {showConfirmPassword ? <Eye /> : <EyeClosed />}
            </button>
          </div>

          {/* Display error message */}
          {hasSubmitted && error && (
            <div className="text-red-500 text-sm mt-4">{error}</div>
          )}
        </div>

        {/* Reset Password Button */}
        <button
          onClick={handlePasswordReset}
          className="w-full bg-purple-950 text-white py-2 px-4 rounded-lg cursor-pointer mt-6 hover:bg-purple-600 transition duration-300"
        >
          Reset Password
        </button>

        {/* Display success or error message */}
        {message && (
          <div className={`mt-4 p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}