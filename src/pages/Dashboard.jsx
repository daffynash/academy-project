import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTeamsByCoach, getPlayersByUser, getTeamsForParent } from '../services/db'
import { getUpcomingEvents, EVENT_TYPES } from '../services/events'
import useAuth from '../contexts/useAuth'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])

  useEffect(() => {
    if (!user) return
    
    const loadDashboardData = async () => {
      try {
        if (user.role === 'parent') {
          // Load parent-specific data
          const [userPlayers, userTeams, events] = await Promise.all([
            getPlayersByUser(user.uid),
            getTeamsForParent(user.uid),
            getUpcomingEvents(3)
          ])
          setPlayers(userPlayers)
          setTeams(userTeams)
          setUpcomingEvents(events)
        } else {
          // Load coach/superadmin data (existing logic)
          const [userTeams, events] = await Promise.all([
            getTeamsByCoach(user.uid),
            getUpcomingEvents(3)
          ])
          setTeams(userTeams)
          setPlayers([]) // Coaches don't need global player count on dashboard
          setUpcomingEvents(events)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        setTeams([])
        setPlayers([])
        setUpcomingEvents([])
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
        {/* Quick Stats Cards - Compact Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-slideUp">
          {/* Teams Card */}
          <Link 
            to="/teams"
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-primary-100 dark:border-primary-800/30 p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 shadow-lg group-hover:scale-105 transition-transform">
                  <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {user.role === 'parent' ? 'Ομάδες Παιδιών' : 'Ομάδες'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{teams.length}</p>
                </div>
              </div>
              <svg className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Players Card */}
          <Link 
            to="/players"
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-secondary-100 dark:border-secondary-800/30 p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-secondary-100 to-secondary-200 dark:from-secondary-900/30 dark:to-secondary-800/30 shadow-lg group-hover:scale-105 transition-transform">
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
              <svg className="h-5 w-5 text-gray-400 group-hover:text-secondary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Events Card */}
          <Link 
            to="/events"
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-success-100 dark:border-success-800/30 p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-success-100 to-success-200 dark:from-success-900/30 dark:to-success-800/30 shadow-lg group-hover:scale-105 transition-transform">
                  <svg className="h-6 w-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Επόμενα Events</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingEvents.length}</p>
                </div>
              </div>
              <svg className="h-5 w-5 text-gray-400 group-hover:text-success-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Upcoming Events Widget */}
        {upcomingEvents.length > 0 && (
          <div className="mb-8 animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Επερχόμενα Events</span>
              </h2>
              <Link 
                to="/events"
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors flex items-center space-x-1"
              >
                <span>Προβολή όλων</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingEvents.map(event => {
                const eventTypeColor = event.type === 'training' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : event.type === 'match'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'

                return (
                  <div
                    key={event.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 p-5 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${eventTypeColor}`}>
                        {EVENT_TYPES[event.type]}
                      </span>
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                        <div className="font-semibold">
                          {event.startDate.toLocaleDateString('el-GR', { day: 'numeric', month: 'short' })}
                        </div>
                        <div>
                          {event.startDate.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {event.title}
                    </h3>
                    
                    {event.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      {event.location && (
                        <div className="flex items-center space-x-2">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      {event.teamIds.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>{event.teamIds.length} ομάδ{event.teamIds.length === 1 ? 'α' : 'ες'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}