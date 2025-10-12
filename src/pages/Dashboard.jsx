import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTeamsByCoach, getPlayersByUser, getTeamsForParent } from '../services/db'
import useAuth from '../contexts/useAuth'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [expandedCard, setExpandedCard] = useState(null) // For expandable cards

  useEffect(() => {
    if (!user) return
    
    const loadDashboardData = async () => {
      try {
        if (user.role === 'parent') {
          // Load parent-specific data
          const [userPlayers, userTeams] = await Promise.all([
            getPlayersByUser(user.uid),
            getTeamsForParent(user.uid)
          ])
          setPlayers(userPlayers)
          setTeams(userTeams)
        } else {
          // Load coach/superadmin data (existing logic)
          const userTeams = await getTeamsByCoach(user.uid)
          setTeams(userTeams)
          setPlayers([]) // Coaches don't need global player count on dashboard
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        setTeams([])
        setPlayers([])
      }
    }
    
    loadDashboardData()
  }, [user])

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please login</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-gray-50 to-blue-100 dark:from-gray-900 dark:via-primary-900/10 dark:to-gray-800 animate-fadeIn" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'none' }}>
      {/* Header with User Info - Hidden on desktop, visible on mobile without logout */}
      <header className="lg:hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-b border-primary-100 dark:border-primary-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center space-x-4 animate-slideDown">
              <div>
                <p className="text-lg font-medium bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent">
                  {user?.name || user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-120px)]">
        {/* Quick Stats Cards with Expandable Content - Vertical layout to prevent expansion issues */}
        <div className="flex flex-col space-y-6 mb-8 animate-slideUp">
          {/* Teams Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-primary-100 dark:border-primary-800/30">
            <button
              onClick={() => setExpandedCard(expandedCard === 'teams' ? null : 'teams')}
              className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 shadow-lg">
                    <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {user.role === 'parent' ? 'Ομάδες των Παιδιών' : 'Ομάδες'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{teams.length}</p>
                  </div>
                </div>
                <svg 
                  className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${expandedCard === 'teams' ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            
            {expandedCard === 'teams' && (
              <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                <div className="pt-4 space-y-2 max-h-48 overflow-y-auto">
                  {teams.length > 0 ? (
                    teams.map((team) => (
                      <div key={team.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{team.name}</span>
                        {user.role !== 'parent' && (
                          <Link
                            to={`/teams/${team.id}/players`}
                            className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                          >
                            Παίκτες →
                          </Link>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                      {user.role === 'parent' ? 'Δεν έχετε παιδιά σε ομάδες ακόμα' : 'Δεν έχετε δημιουργήσει ομάδες ακόμα'}
                    </p>
                  )}
                </div>
                {user.role !== 'parent' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      to="/teams"
                      className="inline-flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                    >
                      Διαχείριση Ομάδων
                      <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Players Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-secondary-100 dark:border-secondary-800/30">
            <button
              onClick={() => setExpandedCard(expandedCard === 'players' ? null : 'players')}
              className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-secondary-100 to-secondary-200 dark:from-secondary-900/30 dark:to-secondary-800/30 shadow-lg">
                    <svg className="h-6 w-6 text-secondary-600 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {user.role === 'parent' ? 'Τα Παιδιά μου' : 'Παίκτες'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user.role === 'parent' 
                        ? players.length 
                        : teams.reduce((total, team) => total + (team.members || []).length, 0)
                      }
                    </p>
                  </div>
                </div>
                <svg 
                  className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${expandedCard === 'players' ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            
            {expandedCard === 'players' && (
              <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                <div className="pt-4 space-y-2 max-h-48 overflow-y-auto">
                  {user.role === 'parent' ? (
                    players.length > 0 ? (
                      players.map((player) => (
                        <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {player.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date().getFullYear() - new Date(player.dateOfBirth).getFullYear()} ετών
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                        Δεν έχετε προσθέσει παιδιά ακόμα
                      </p>
                    )
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                      Συνολικός αριθμός μελών από όλες τις ομάδες
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to="/players"
                    className="inline-flex items-center text-sm font-medium text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300"
                  >
                    {user.role === 'parent' ? 'Διαχείριση Παιδιών' : 'Διαχείριση Παικτών'}
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Events Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-success-100 dark:border-success-800/30">
            <button
              onClick={() => setExpandedCard(expandedCard === 'events' ? null : 'events')}
              className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-success-100 to-success-200 dark:from-success-900/30 dark:to-success-800/30 shadow-lg">
                    <svg className="h-6 w-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Events</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                  </div>
                </div>
                <svg 
                  className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${expandedCard === 'events' ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            
            {expandedCard === 'events' && (
              <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                <div className="pt-4 space-y-2 max-h-48 overflow-y-auto">
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                    Δεν υπάρχουν events ακόμα. Το σύστημα events θα προστεθεί σύντομα!
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    disabled
                    className="inline-flex items-center text-sm font-medium text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  >
                    Διαχείριση Events (Σύντομα)
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}