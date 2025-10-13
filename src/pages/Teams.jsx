import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTeamsByCoach, deleteTeam, getPlayersByTeam, getAllTeams, getTeamsForParent } from '../services/db'
import useAuth from '../contexts/useAuth'
import CreateTeamModal from '../components/CreateTeamModal'

export default function Teams() {
  const { user, loading } = useAuth()
  const [teams, setTeams] = useState([])
  const [teamPlayers, setTeamPlayers] = useState({}) // Store player counts by team
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [teamToEdit, setTeamToEdit] = useState(null)
  const [teamToDelete, setTeamToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Check if user has access to view teams (parents should NOT have access)
  const hasTeamAccess = user?.role === 'coach' || user?.role === 'superadmin'

  useEffect(() => {
    if (!user) return
    
    const loadTeamsAndPlayers = async () => {
      try {
        setIsLoading(true)
        
        // Load teams based on user role
        let userTeams = []
        if (user.role === 'superadmin') {
          userTeams = await getAllTeams()
        } else if (user.role === 'coach') {
          userTeams = await getTeamsByCoach(user.uid)
        } else if (user.role === 'parent') {
          userTeams = await getTeamsForParent(user.uid)
        }
        
        setTeams(userTeams)
        
        // Load player counts for each team
        const playerCounts = {}
        for (const team of userTeams) {
          try {
            const players = await getPlayersByTeam(team.id)
            playerCounts[team.id] = players.length
          } catch (error) {
            console.error(`Error loading players for team ${team.id}:`, error)
            playerCounts[team.id] = 0
          }
        }
        setTeamPlayers(playerCounts)
      } catch (error) {
        console.error('Error loading teams:', error)
        setTeams([])
        setTeamPlayers({})
      } finally {
        setIsLoading(false)
      }
    }

    loadTeamsAndPlayers()
  }, [user])

  const handleTeamCreated = (team) => {
    if (teamToEdit) {
      // Update existing team
      setTeams(prevTeams => prevTeams.map(t => t.id === team.id ? team : t))
    } else {
      // Add new team
      setTeams(prevTeams => [...prevTeams, team])
      setTeamPlayers(prevPlayers => ({ ...prevPlayers, [team.id]: 0 }))
    }
  }

  const handleEditClick = (team) => {
    setTeamToEdit(team)
    setShowCreateForm(true)
  }

  const handleModalClose = () => {
    setShowCreateForm(false)
    setTeamToEdit(null)
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
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 group relative overflow-hidden"
              >
                {/* Ripple effect background */}
                <span className="absolute inset-0 bg-primary-500/20 dark:bg-primary-400/20 scale-0 group-hover:scale-100 rounded-xl transition-transform duration-300"></span>
                
                <svg className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-all duration-200 group-hover:-translate-x-0.5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.role === 'parent' ? 'Οι ομάδες των παιδιών σας' : 'Manage your academy teams'}
                </p>
              </div>
            </div>
            {hasTeamAccess && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="group inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 dark:from-primary-500 dark:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:focus:ring-offset-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 animate-slideUp relative overflow-hidden"
              >
                {/* Shine effect */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                
                <svg className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="relative">Create Team</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slideUp">
          {teams.length === 0 ? (
            <div className="col-span-full text-center py-16 animate-fadeIn">
              <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 mb-6 animate-pulse-soft shadow-lg">
                <svg className="h-12 w-12 text-gray-400 dark:text-gray-500 animate-bounce-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2 animate-slideDown">
                {user?.role === 'parent' ? 'Δεν βρέθηκαν ομάδες' : 'No teams found'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 animate-slideUp max-w-md mx-auto">
                {user?.role === 'parent' 
                  ? 'Δεν έχετε παιδιά εγγεγραμμένα σε ομάδες ακόμα.' 
                  : 'Get started by creating your first team.'
                }
              </p>
              {hasTeamAccess && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="group inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 animate-scaleIn relative overflow-hidden"
                >
                  {/* Animated background */}
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  
                  <svg className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-90 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="relative z-10">Create Your First Team</span>
                </button>
              )}
            </div>
          ) : (
            teams.map(team => (
              <div key={team.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow-md hover:shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] group relative">
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-secondary-50/0 group-hover:from-primary-50/30 group-hover:to-secondary-50/30 dark:group-hover:from-primary-900/10 dark:group-hover:to-secondary-900/10 transition-all duration-300 rounded-xl pointer-events-none"></div>
                
                <div className="p-4 relative z-10">
                  {/* Header with icon and actions */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 group-hover:from-primary-200 group-hover:to-primary-300 dark:group-hover:from-primary-800/40 dark:group-hover:to-primary-700/40 transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:rotate-3">
                        <svg className="h-5 w-5 text-primary-600 dark:text-primary-400 transition-transform duration-300 group-hover:scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold bg-gradient-to-r from-gray-900 to-primary-700 dark:from-white dark:to-primary-300 bg-clip-text text-transparent">{team.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {teamPlayers[team.id] !== undefined ? `${teamPlayers[team.id]} παίκτες` : 'Φόρτωση...'}
                        </p>
                      </div>
                    </div>
                    {(user.role === 'coach' || user.role === 'superadmin') && (
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                          onClick={() => handleEditClick(team)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg hover:scale-110 active:scale-95"
                          title="Επεξεργασία ομάδας"
                        >
                          <svg className="h-4 w-4 transition-transform hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(team)}
                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg hover:scale-110 active:scale-95"
                          title="Διαγραφή ομάδας"
                        >
                          <svg className="h-4 w-4 transition-transform hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Footer with badge and link */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 group-hover:border-primary-200 dark:group-hover:border-primary-800/50 transition-colors duration-300">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-secondary-100 to-secondary-200 text-secondary-800 dark:from-secondary-900/30 dark:to-secondary-800/30 dark:text-secondary-300 group-hover:from-secondary-200 group-hover:to-secondary-300 dark:group-hover:from-secondary-800/40 dark:group-hover:to-secondary-700/40 transition-all duration-300">
                      Team
                    </span>
                    <Link 
                      to={`/teams/${team.id}/players`}
                      className="inline-flex items-center text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-all duration-200 hover:gap-2 group/link"
                    >
                      {user?.role === 'parent' ? 'Προβολή' : 'Διαχείριση'}
                      <svg className="ml-1 h-3.5 w-3.5 transition-all duration-200 group-hover/link:translate-x-1 group-hover/link:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Create/Edit Team Modal */}
      <CreateTeamModal
        isOpen={showCreateForm}
        onClose={handleModalClose}
        onTeamCreated={handleTeamCreated}
        userId={user?.uid}
        teamToEdit={teamToEdit}
      />

      {/* Delete Confirmation Modal */}
      {teamToDelete && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-scaleIn border border-red-200 dark:border-red-900/30">
            <div className="flex items-center justify-center mb-6">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 animate-pulse-soft shadow-lg">
                <svg className="h-7 w-7 text-red-600 dark:text-red-400 animate-bounce-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 hover:scale-105 active:scale-95"
                >
                  Ακύρωση
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="group px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl relative overflow-hidden"
                >
                  {/* Shine effect */}
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  
                  <span className="relative z-10">{isDeleting ? 'Διαγραφή...' : 'Διαγραφή'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}