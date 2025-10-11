import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../services/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const trimmed = (email || '').trim() 
      if (!trimmed) throw new Error('Please provide an email')
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(trimmed)) throw new Error('Invalid email format')
      await login(trimmed, password)
      // navigate to dashboard after successful login
      if (!import.meta.env.VITE_DISABLE_AUTO_NAV) navigate('/')
    } catch (err) {
      console.error('Login error (handleSubmit):', err)
      const details = err?.message ?? String(err)
      setError(details)
    }
  }

  // quickLogin removed in cleaned UI

  // debugResult state removed in cleaned UI

  const navigate = useNavigate()

  // testRestSignIn removed in cleaned UI

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-gray-50 to-blue-100 dark:from-gray-900 dark:via-primary-900/20 dark:to-gray-800 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fadeIn">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 mb-6 animate-bounce-slow shadow-lg">
            <svg className="h-10 w-10 text-primary-600 dark:text-primary-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-primary-700 dark:from-white dark:to-primary-300 bg-clip-text text-transparent animate-slideDown">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 animate-slideUp">
            Or{' '}
            <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-all duration-300 hover:underline decoration-primary-500">
              create a new account
            </Link>
          </p>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-8 px-6 shadow-2xl rounded-2xl border border-primary-100 dark:border-primary-800/50 animate-slideUp">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/50 p-4 border-l-4 border-red-400 dark:border-red-500 animate-shake">
                <div className="flex">
                  <svg className="h-5 w-5 text-red-400 dark:text-red-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="ml-3 text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              <div className="relative group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400">
                  <span className="flex items-center">
                    <svg className="h-4 w-4 text-gray-400 mr-2 group-focus-within:text-primary-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    Email
                  </span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg transform focus:scale-[1.02]"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              
              <div className="relative group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400">
                  <span className="flex items-center">
                    <svg className="h-4 w-4 text-gray-400 mr-2 group-focus-within:text-primary-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Password
                  </span>
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg transform focus:scale-[1.02]"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 dark:from-primary-500 dark:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:focus:ring-offset-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-primary-300 group-hover:text-primary-200 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </span>
                <span className="relative">Sign in</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
