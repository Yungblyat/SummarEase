import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_NAME } from '../constants';

const GoogleSignIn = ({ onLoginSuccess, onClose }) => {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('http://127.0.0.1:8000/auth/user/google-login/', { token: credentialResponse.credential });
      const { access, refresh } = res.data;
      localStorage.clear()
      localStorage.setItem( ACCESS_TOKEN, access );
      localStorage.setItem( REFRESH_TOKEN, refresh );
      localStorage.setItem(USER_NAME, res.data.user.username)
      console.log(localStorage.getItem(USER_NAME))
      console.log('Google login successful');
      onLoginSuccess(access);
      onClose();
    } catch (err) {
      console.error('Google login failed:', err);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={() => console.error('Google Sign-In failed')}
      useOneTap
    />
  );
};

export default GoogleSignIn;