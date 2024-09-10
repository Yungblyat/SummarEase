import React, { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { X, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { ACCESS_TOKEN} from '../constants'
import UploadSection from "../components/UploadSection"

// Custom function to decode JWT
function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding JWT', error)
    return null
  }
}

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN)
    if (token) {
      const decodedToken = decodeJWT(token)
      if (decodedToken) {
        setUser(decodedToken)
      } else {
        localStorage.clear()
      }
    }
  }, [])

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    const username = e.target.username.value
    const password = e.target.password.value
    try {
      const response = await api.post('/auth/user/token/', { username, password })
      console.log('Sign in successful', response.data)
      localStorage.setItem(ACCESS_TOKEN, response.data.access)
      const decodedToken = decodeJWT(response.data.access)
      if (decodedToken) {
        setUser(decodedToken)
        setIsLoginOpen(false)
      } else {
        setError('Invalid token received')
      }
    } catch (error) {
      setError('Sign in failed. Please check your credentials.')
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    const email = e.target.email.value
    const username = e.target.username.value
    const password = e.target.password.value
    try {
      const response = await api.post('/auth/user/create/', { email, username, password })
      console.log('Sign up successful', response.data)
      setIsSignUpOpen(false)
    } catch (error) {
      setError('Sign up failed. Please try again.')
    }
  }

  const handleSignOut = () => {
    localStorage.clear()
    setUser(null)
    setIsDropdownOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 text-white">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-16">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-white"></div>
              <span className="text-2xl font-bold">SummarEase</span>
            </div>
            <div className="hidden md:flex space-x-6">
              <a href="/" className="hover:text-purple-200">Home</a>
              <a href="#" className="hover:text-purple-200">Upload</a>
              <a href="/features" className="hover:text-purple-200">Features</a>
              <a href="/about" className="hover:text-purple-200">About</a>
            </div>
            {user ? (
              <div className="relative">
                <button
                  className="flex items-center space-x-2 rounded-full bg-white px-4 py-2 text-purple-900 hover:bg-purple-100"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span>{user.username}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg">
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setIsDropdownOpen(false)
                        navigate('/options')
                      }}
                    >
                      Options
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setIsDropdownOpen(false)
                        navigate('/history')
                      }}
                    >
                      History
                    </a>
                    <a
                      href="/"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleSignOut}
                    >
                      Sign out
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="rounded-full bg-white px-4 py-2 text-purple-900 hover:bg-purple-100"
                onClick={() => setIsLoginOpen(true)}
              >
                Login
              </button>
            )}
          </nav>
        </header>
        <main className="text-center">
          <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            Streamline Your Meetings
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-base sm:text-lg text-purple-200">
            Our meeting summarizer helps you upload meeting recordings and transforms them into concise, actionable
            insights. Perfect for busy professionals, it automatically extracts the key points from your meetings, ensuring you capture all vital information without sifting through hours of audio. With our tool, you can easily review what matters most, saving time and boosting productivity. Whether it's a team meeting, client call, or webinar, our service provides clear, easy-to-understand summaries that help you make informed decisions faster.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="flex items-center justify-center rounded-lg bg-white px-6 py-3 text-purple-900 hover:bg-purple-100">
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Get Started
            </button>
            <button className="rounded-lg border border-white px-6 py-3 hover:bg-white hover:text-purple-900">
              Learn More
            </button>
          </div>
        </main>
      </div>
      <div className="absolute bottom-0 right-0 h-64 w-64 rounded-tl-full bg-purple-700 opacity-50"></div>

      <Dialog open={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <div className="flex justify-end">
              <button onClick={() => setIsLoginOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="username"
                  placeholder="username"
                  className="w-full rounded-full border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full rounded-full border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div className="text-right">
                <a href="#" className="text-sm text-gray-600 hover:text-purple-600">Forgot Password?</a>
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-purple-600 py-2 text-white hover:bg-purple-700 focus:outline-none"
              >
                Sign In
              </button>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="text-center text-sm text-gray-600">
                Don't have an account? <button type="button" onClick={() => {setIsLoginOpen(false); setIsSignUpOpen(true);}} className="text-purple-600 hover:underline">Sign Up</button>
              </div>
              <button
                type="button"
                className="flex w-full items-center justify-center rounded-full border border-gray-300 bg-white py-2 text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      <Dialog open={isSignUpOpen} onClose={() => setIsSignUpOpen(false)}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <div className="flex justify-end">
              <button onClick={() => setIsSignUpOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full rounded-full border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  className="w-full rounded-full border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full rounded-full border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-purple-600 py-2 text-white hover:bg-purple-700 focus:outline-none"
              >
                Sign Up
              </button>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="text-center text-sm text-gray-600">
                Already have an account? <button type="button" onClick={() => {setIsSignUpOpen(false); setIsLoginOpen(true);}} className="text-purple-600 hover:underline">Sign In</button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
      <UploadSection/>
    </div>

  )
}