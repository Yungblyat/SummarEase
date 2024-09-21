import React, { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'
import api from '../api'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants'

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [formErrors, setFormErrors] = useState({})

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
        response = await api.post('/auth/user/create/', formData)
        console.log('Sign up successful', response.data)
        setIsSignUp(false)
        return
      } else {
        response = await api.post('/auth/user/token/', formData)
        console.log('Sign in successful', response.data)
        localStorage.setItem(ACCESS_TOKEN, response.data.access)
        localStorage.setItem(REFRESH_TOKEN, response.data.refresh)
        onLoginSuccess(response.data.access)
        onClose()
      }
    } catch (error) {
      setError(isSignUp ? 'Sign up failed. Please try again.' : 'Sign in failed. Please check your credentials.')
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
          <div className="flex justify-end">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <a href="#" className="text-sm text-gray-600 hover:text-purple-600">Forgot Password?</a>
              </div>
            )}
            <button
              type="submit"
              className="w-full rounded-full bg-purple-600 py-2 text-white hover:bg-purple-700 focus:outline-none"
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="text-center text-sm text-gray-600">
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={() => setIsSignUp(false)} className="text-purple-600 hover:underline">
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button type="button" onClick={() => setIsSignUp(true)} className="text-purple-600 hover:underline">
                    Sign Up
                  </button>
                </>
              )}
            </div>
            {!isSignUp && (
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
            )}
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
// import React, { useState } from 'react'
// import { Dialog } from '@headlessui/react'
// import { X } from 'lucide-react'
// import api from '../api'
// import { ACCESS_TOKEN } from '../constants'

// export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
//   const [error, setError] = useState('')
//   const [isSignUp, setIsSignUp] = useState(false)

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError('')
//     const username = e.target.username.value
//     const password = e.target.password.value
//     const email = e.target.email?.value

//     try {
//       let response
//       if (isSignUp) {
//         response = await api.post('/auth/user/create/', { email, username, password })
//         console.log('Sign up successful', response.data)
//         setIsSignUp(false)
//         return
//       } else {
//         response = await api.post('/auth/user/token/', { username, password })
//         console.log('Sign in successful', response.data)
//         localStorage.setItem(ACCESS_TOKEN, response.data.access)
//         onLoginSuccess(response.data.access)
//         onClose()
//       }
//     } catch (error) {
//       setError(isSignUp ? 'Sign up failed. Please try again.' : 'Sign in failed. Please check your credentials.')
//     }
//   }

//   return (
//     <Dialog open={isOpen} onClose={onClose}>
//       <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
//       <div className="fixed inset-0 flex items-center justify-center p-4">
//         <Dialog.Panel className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
//           <div className="flex justify-end">
//             <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//               <X className="h-6 w-6" />
//             </button>
//           </div>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             {isSignUp && (
//               <div>
//                 <input
//                   type="email"
//                   name="email"
//                   placeholder="Email"
//                   className="w-full rounded-full border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
//                   required
//                 />
//               </div>
//             )}
//             <div>
//               <input
//                 type="text"
//                 name="username"
//                 placeholder="Username"
//                 className="w-full rounded-full border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
//                 required
//               />
//             </div>
//             <div>
//               <input
//                 type="password"
//                 name="password"
//                 placeholder="Password"
//                 className="w-full rounded-full border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
//                 required
//               />
//             </div>
//             {!isSignUp && (
//               <div className="text-right">
//                 <a href="#" className="text-sm text-gray-600 hover:text-purple-600">Forgot Password?</a>
//               </div>
//             )}
//             <button
//               type="submit"
//               className="w-full rounded-full bg-purple-600 py-2 text-white hover:bg-purple-700 focus:outline-none"
//             >
//               {isSignUp ? 'Sign Up' : 'Sign In'}
//             </button>
//             {error && <p className="text-red-500 text-sm">{error}</p>}
//             <div className="text-center text-sm text-gray-600">
//               {isSignUp ? (
//                 <>
//                   Already have an account?{' '}
//                   <button type="button" onClick={() => setIsSignUp(false)} className="text-purple-600 hover:underline">
//                     Sign In
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   Don't have an account?{' '}
//                   <button type="button" onClick={() => setIsSignUp(true)} className="text-purple-600 hover:underline">
//                     Sign Up
//                   </button>
//                 </>
//               )}
//             </div>
//             {!isSignUp && (
//               <button
//                 type="button"
//                 className="flex w-full items-center justify-center rounded-full border border-gray-300 bg-white py-2 text-gray-700 hover:bg-gray-50 focus:outline-none"
//               >
//                 <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
//                   <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
//                   <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
//                   <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
//                 </svg>
//                 Sign in with Google
//               </button>
//             )}
//           </form>
//         </Dialog.Panel>
//       </div>
//     </Dialog>
//   )
// }