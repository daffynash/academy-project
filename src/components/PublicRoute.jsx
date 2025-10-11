import { Navigate } from 'react-router-dom'
import useAuth from '../contexts/useAuth'

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  // Show loading while authentication state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative mx-auto h-16 w-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 dark:border-t-primary-400 animate-spin"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading Academy Manager</h3>
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">Please wait a moment...</p>
        </div>
      </div>
    )
  }

  // Redirect to dashboard if already authenticated
  if (user) {
    return <Navigate to="/" replace />
  }

  // Render the public content if not authenticated
  return children
}