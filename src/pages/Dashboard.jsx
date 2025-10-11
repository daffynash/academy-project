import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getTeamsByCoach } from '../services/db'
import { signOut } from '../services/auth'
import useAuth from '../contexts/useAuth'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [teams, setTeams] = useState([])
  const [isSigningOut, setIsSigningOut] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    // load teams for coach using uid
    getTeamsByCoach(user.uid).then(setTeams).catch(() => setTeams([]))
  }, [user])

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut()
      // The AuthContext will handle the redirect automatically
      // But we can also manually navigate if needed
      if (!import.meta.env.VITE_DISABLE_AUTO_NAV) navigate('/login')
    } catch (error) {
      console.error('Sign out error:', error)
      setIsSigningOut(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please login</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-gray-50 to-blue-100 dark:from-gray-900 dark:via-primary-900/10 dark:to-gray-800 animate-fadeIn" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'none' }}>
      {/* Header with SignOut */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-b border-primary-100 dark:border-primary-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 animate-slideDown">
              <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 shadow-lg">
                <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-700 dark:from-white dark:to-primary-300 bg-clip-text text-transparent">Dashboard</h1>
                <p className="text-lg font-medium bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent">
                  {user?.name || user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-danger-600 to-danger-700 hover:from-danger-700 hover:to-danger-800 dark:from-danger-500 dark:to-danger-600 dark:hover:from-danger-600 dark:hover:to-danger-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger-500 dark:focus:ring-danger-400 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 animate-slideUp"
            >
              <svg className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-120px)]">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-slideUp">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-primary-100 dark:border-primary-800/30 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Teams</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{teams.length}</p>
              </div>
              <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 group-hover:from-primary-200 group-hover:to-primary-300 dark:group-hover:from-primary-800/40 dark:group-hover:to-primary-700/40 transition-all duration-300 shadow-lg">
                <svg className="h-6 w-6 text-primary-600 dark:text-primary-400 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-secondary-100 dark:border-secondary-800/30 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Members</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {teams.reduce((total, team) => total + (team.members || []).length, 0)}
                </p>
              </div>
              <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-secondary-100 to-secondary-200 dark:from-secondary-900/30 dark:to-secondary-800/30 group-hover:from-secondary-200 group-hover:to-secondary-300 dark:group-hover:from-secondary-800/40 dark:group-hover:to-secondary-700/40 transition-all duration-300 shadow-lg">
                <svg className="h-6 w-6 text-secondary-600 dark:text-secondary-400 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-success-100 dark:border-success-800/30 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Events</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
              <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-success-100 to-success-200 dark:from-success-900/30 dark:to-success-800/30 group-hover:from-success-200 group-hover:to-success-300 dark:group-hover:from-success-800/40 dark:group-hover:to-success-700/40 transition-all duration-300 shadow-lg">
                <svg className="h-6 w-6 text-success-600 dark:text-success-400 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="py-6">
          <div className="flex items-center justify-between mb-6 animate-slideDown">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-primary-700 dark:from-white dark:to-primary-300 bg-clip-text text-transparent flex items-center">
              <svg className="h-5 w-5 text-secondary-600 dark:text-secondary-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Your Teams
            </h2>
            <div className="flex items-center space-x-3">
              {teams.length > 0 && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-secondary-100 to-secondary-200 text-secondary-800 dark:from-secondary-900/30 dark:to-secondary-800/30 dark:text-secondary-300 shadow-sm">
                    {teams.length} team{teams.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
              <Link
                to="/teams"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg text-primary-700 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:shadow-md"
              >
                Manage Teams
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="space-y-4 min-h-[40vh] flex flex-col">
            {teams.length === 0 && (
              <div className="text-center py-16 flex-grow flex flex-col justify-center">
                <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                  <svg className="h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No teams found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't been assigned to any teams yet.</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Contact your academy administrator to get started.</p>
                {/* Add some extra space to prevent scroll bounce */}
                <div className="h-32"></div>
              </div>
            )}
            {teams.map(t => (
              <Link key={t.id} to="/teams" className="block">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-md hover:shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 group animate-slideUp">
                  <div className="px-6 py-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 group-hover:from-primary-200 group-hover:to-primary-300 dark:group-hover:from-primary-800/40 dark:group-hover:to-primary-700/40 transition-all duration-300 shadow-lg">
                          <svg className="h-6 w-6 text-primary-600 dark:text-primary-400 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg leading-6 font-medium bg-gradient-to-r from-gray-900 to-primary-700 dark:from-white dark:to-primary-300 bg-clip-text text-transparent">{t.name}</h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Team ID: {t.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg">
                          <svg className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
