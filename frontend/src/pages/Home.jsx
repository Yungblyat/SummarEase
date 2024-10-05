import React, { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ACCESS_TOKEN, USER_NAME } from '../constants'
import UploadSection from '../components/UploadSection'
import LoginModal from '../components/LoginModal'

// Custom function to decode JWT because for some reason the built in function kept crashing the app in this specific file, you're welcome to try your luck
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
  const [username, setUsername] = useState(localStorage.getItem(USER_NAME) || '')
  const [isLoginOpen, setIsLoginOpen] = useState(false)
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
        localStorage.removeItem(ACCESS_TOKEN)
      }
    }
  }, [])

  const handleLoginSuccess = (token) => {
    const decodedToken = decodeJWT(token)
    if (decodedToken) {
      setUser(decodedToken)
      const newUsername = localStorage.getItem(USER_NAME) || decodedToken.username
      setUsername(newUsername)
      localStorage.setItem(USER_NAME, newUsername)
      setIsLoginOpen(false)
    }
  }

  const handleSignOut = () => {
    localStorage.clear()
    setUser(null)
    setIsDropdownOpen(false)
  }

  const handleLoginRequired = () => {
    setIsLoginOpen(true)
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
                  <span>{localStorage.getItem(USER_NAME)}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg">

                    <a
                      href=""
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

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <UploadSection isLoggedIn={!!user} onLoginRequired={handleLoginRequired} />
    </div>
  )
}