import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../services/auth'
import useAuth from '../contexts/useAuth'

export default function Header() {
  const { user } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await logout()
      // The AuthContext will handle the redirect automatically
      if (!import.meta.env.VITE_DISABLE_AUTO_NAV) navigate('/login')
    } catch (error) {
      console.error('Sign out error:', error)
      setIsSigningOut(false)
    }
  }

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Academy Manager</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.displayName || user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </div>
    </header>
  )
}