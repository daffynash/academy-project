import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup } from '../services/auth'
import { createUserDocument } from '../services/db'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('Parent')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match')
    }
    
    if (password.length < 6) {
      return setError('Password must be at least 6 characters')
    }

    try {
      setError('')
      setLoading(true)
      
      const user = await signup(email, password)
      
      await createUserDocument(user.uid, {
        name: fullName,
        email,
        role: role.toLowerCase(),
        teamIds: [],
        createdAt: new Date().toISOString()
      })
      
      navigate('/dashboard')
    } catch (error) {
      setError('Failed to create account: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-gray-50 to-blue-100 dark:from-gray-900 dark:via-primary-900/20 dark:to-gray-800 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fadeIn">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 mb-6 animate-bounce-slow shadow-lg">
            <svg className="h-10 w-10 text-primary-600 dark:text-primary-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-primary-700 dark:from-white dark:to-primary-300 bg-clip-text text-transparent animate-slideDown">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 animate-slideUp">
            Or{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-all duration-300 hover:underline decoration-primary-500">
              sign in to existing account
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
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400">
                  <span className="flex items-center">
                    <svg className="h-4 w-4 text-gray-400 mr-2 group-focus-within:text-primary-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Full Name
                  </span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg transform focus:scale-[1.02]"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>

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

              <div className="relative group">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400">
                  <span className="flex items-center">
                    <svg className="h-4 w-4 text-gray-400 mr-2 group-focus-within:text-primary-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Confirm Password
                  </span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg transform focus:scale-[1.02]"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="relative group">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400">
                  <span className="flex items-center">
                    <svg className="h-4 w-4 text-gray-400 mr-2 group-focus-within:text-primary-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Role
                  </span>
                </label>
                <select
                  id="role"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg transform focus:scale-[1.02]"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option value="Parent">Parent (Γονέας)</option>
                  <option value="Coach">Coach (Προπονητής)</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 dark:from-primary-500 dark:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:focus:ring-offset-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-primary-300 group-hover:text-primary-200 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </span>
                <span className="relative">{loading ? 'Creating account...' : 'Create account'}</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white                User { id, name, email, passwordHash, role: ['parent','coach','superadmin'], teamIds: [] }via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
