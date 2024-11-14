import React, { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { X, Eye, EyeClosed } from 'lucide-react'
import api from '../api'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants'
import GoogleSignIn from './GoogleLogin'
import "../styles/Login.css"
import "../styles/ForgotPassword.css"
import { ArrowLeft } from 'lucide-react'
import PasswordResetRequest from './PasswordReset'
import PasswordResetConfirm from './PasswordResetConfirm'

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (formData) => {
    const errors = {}
    if (isSignUp) {
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Invalid email format'
      }
      if (!usernameRegex.test(formData.username)) {
        errors.username = 'Username must be 3-20 characters long and can only contain letters, numbers, and underscores'
      }
      if (!passwordRegex.test(formData.password)) {
        errors.password = 'Password must be at least 8 characters long, include uppercase and lowercase letters, a number, and a special character'
      }
    }
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFormErrors({})

    if (isForgotPassword) {
      const email = e.target.email.value
      if (!emailRegex.test(email)) {
        setFormErrors({ email: 'Invalid email format' })
        return
      }
      try {
        // Replace this with your actual API call for password reset
        let response = await api.post('/auth/password-reset-request/', { email })
        if (response) {
          setError('Password reset email sent. Please check your inbox.');
          setIsForgotPassword(false);
        }
      } catch (error) {
        setError('Failed to send password reset email. Please try again.')
      }
      return
    }

    const formData = {
      username: e.target.username.value,
      password: e.target.password.value,
      email: e.target.email?.value
    }

    if (isSignUp) {
      const validationErrors = validateForm(formData)
      if (Object.keys(validationErrors).length > 0) {
        setFormErrors(validationErrors)
        return
      }
    }

    try {
      let response
      if (isSignUp) {
        try {
          response = await api.post('/auth/user/create/', formData)
          setIsSignUp(false)
          setMessage("Verify your email to login.")
          return
        } catch (error) {
          setMessage("Error while sending verification email.")
        }
      } else {
        response = await api.post('/auth/user/token/', formData)
        console.log('Sign in successful')
        localStorage.setItem(ACCESS_TOKEN, response.data.access)
        localStorage.setItem(REFRESH_TOKEN, response.data.refresh)
        onLoginSuccess(response.data.access)
        onClose()
      }
    } catch (error) {
      console.log(response.data);
      setError(isSignUp ? 'Sign up failed. Please try again.' : 'Sign in failed. Please check your credentials.')
    }
  }

  const handleForgotPassword = () => {
    setIsForgotPassword(true)
  }

  const handleBackToLogin = () => {
    setIsForgotPassword(false)
  }

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="login-popup" />
      <div className="login-container">
        <Dialog.Panel className="login">
          <div className="flex justify-end">
            <button onClick={onClose} className="close">
              <X className="cross" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isForgotPassword ? (
              <>
                
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full rounded-full border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
                    required
                  />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>
                <button
                  type="submit"
                  className="submit w-full"
                >
                  Reset Password
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="flex items-center justify-center mx-auto text-white text-pretty hover:underline font-bold"
                    style={{
                      textShadow: '1px 1px 0 rgba(0, 0, 0, 0.1), -1px -1px 0 rgba(0, 0, 0, 0.1), 1px -1px 0 rgba(0, 0, 0, 0.1), -1px 1px 0 rgba(0, 0, 0, 0.1)'
                    }}
                    >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </button>
                </div>
              </>
            ) : (
              <>
                {isSignUp && (
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      className="w-full rounded-full border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
                      required
                    />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>
                )}
                <div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="w-full rounded-full border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
                    required
                  />
                  {isSignUp && formErrors.username && <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>}
                </div>
                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full rounded-full border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
                    required
                  />
                  {isSignUp && formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                </div>
                {!isSignUp && (
                  <div className="text-right">
                    <button type="button" onClick={handleForgotPassword} className="forgot text-white text-pretty hover:underline font-bold"
                      style={{
                        textShadow: '1px 1px 0 rgba(0, 0, 0, 0.1), -1px -1px 0 rgba(0, 0, 0, 0.1), 1px -1px 0 rgba(0, 0, 0, 0.1), -1px 1px 0 rgba(0, 0, 0, 0.1)'
                      }}>
                      Forgot Password?
                    </button>
                  </div>
                )}
                <button
                  type="submit"
                  className="submit w-full"
                >
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </button>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="text-center text-sm text-gray-600">
                  {isSignUp ? (
                    <>
                      <span className="already">Already have an account? </span>
                      <button type="button" onClick={() => setIsSignUp(false)} className="text-white text-pretty hover:underline"
                      style={{
                        textShadow: '1px 1px 0 rgba(0, 0, 0, 0.1), -1px -1px 0 rgba(0, 0, 0, 0.1), 1px -1px 0 rgba(0, 0, 0, 0.1), -1px 1px 0 rgba(0, 0, 0, 0.1)'
                      }}>
                        Sign In
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="already">Don't have an account? </span>
                      <button type="button" onClick={() => setIsSignUp(true)} className="text-white text-pretty hover:underline"
                      style={{
                        textShadow: '1px 1px 0 rgba(0, 0, 0, 0.1), -1px -1px 0 rgba(0, 0, 0, 0.1), 1px -1px 0 rgba(0, 0, 0, 0.1), -1px 1px 0 rgba(0, 0, 0, 0.1)'
                      }}>
                        Sign Up
                      </button>
                    </>
                  )}
                </div>
                {!isSignUp && (
                  <div className="mt-4">
                    <GoogleSignIn onLoginSuccess={onLoginSuccess} onClose={onClose} />
                  </div>
                )}
              </>
            )}
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}