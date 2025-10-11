import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTeamsByCoach, deleteTeam } from '../services/db'
import useAuth from '../contexts/useAuth'
import CreateTeamModal from '../components/CreateTeamModal'

export default function Teams() {
  const { user, loading } = useAuth()
  const [teams, setTeams] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [teamToDelete, setTeamToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!user) return
    
    const loadTeams = async () => {
      try {
        setIsLoading(true)
        const userTeams = await getTeamsByCoach(user.uid)
        setTeams(userTeams)
      } catch (error) {
        console.error('Error loading teams:', error)
        setTeams([])
      } finally {
        setIsLoading(false)
      }
    }

    loadTeams()
  }, [user])

  const handleTeamCreated = (newTeam) => {
    setTeams(prevTeams => [...prevTeams, newTeam])
  }

  const handleDeleteClick = (team) => {
    setTeamToDelete(team)
  }

  const handleDeleteConfirm = async () => {
    if (!teamToDelete) return
    
    try {
      setIsDeleting(true)
      await deleteTeam(teamToDelete.id)
      setTeams(prevTeams => prevTeams.filter(team => team.id !== teamToDelete.id))
      setTeamToDelete(null)
    } catch (error) {
      console.error('Error deleting team:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setTeamToDelete(null)
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-gray-50 to-blue-100 dark:from-gray-900 dark:via-primary-900/10 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <div>Please login</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-gray-50 to-blue-100 dark:from-gray-900 dark:via-primary-900/10 dark:to-gray-800 animate-fadeIn">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-b border-primary-100 dark:border-primary-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 animate-slideDown">
              <Link 
                to="/dashboard" 
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <svg className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 shadow-lg">
                <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-700 dark:from-white dark:to-primary-300 bg-clip-text text-transparent">Teams</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage your academy teams</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 dark:from-primary-500 dark:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:focus:ring-offset-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 animate-slideUp"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Team
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slideUp">
          {teams.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                <svg className="h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No teams found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Get started by creating your first team.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Team
              </button>
            </div>
          ) : (
            teams.map(team => (
              <div key={team.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow-md hover:shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 group">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 group-hover:from-primary-200 group-hover:to-primary-300 dark:group-hover:from-primary-800/40 dark:group-hover:to-primary-700/40 transition-all duration-300 shadow-lg">
                      <svg className="h-6 w-6 text-primary-600 dark:text-primary-400 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(team)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-primary-700 dark:from-white dark:to-primary-300 bg-clip-text text-transparent mb-2">{team.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {team.members ? `${team.members.length} members` : '0 members'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-secondary-100 to-secondary-200 text-secondary-800 dark:from-secondary-900/30 dark:to-secondary-800/30 dark:text-secondary-300">
                        Team
                      </span>
                      <button className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200">
                        View details
                        <svg className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onTeamCreated={handleTeamCreated}
        userId={user?.uid}
      />

      {/* Delete Confirmation Modal */}
      {teamToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-slideDown">
            <div className="flex items-center justify-center mb-6">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Διαγραφή Ομάδας
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Είστε σίγουρος ότι θέλετε να διαγράψετε την ομάδα <span className="font-medium text-gray-900 dark:text-white">"{teamToDelete.name}"</span>; 
                Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Ακύρωση
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {isDeleting ? 'Διαγραφή...' : 'Διαγραφή'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}