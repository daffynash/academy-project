import { useEffect, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPlayersByTeam, deletePlayer, getTeamById, getTeamsByCoach } from '../services/db'
import useAuth from '../contexts/useAuth'
import CreatePlayerModal from '../components/CreatePlayerModal'
import AssignExistingPlayerModal from '../components/AssignExistingPlayerModal'

export default function Players() {
  const { teamId } = useParams()
  const { user, loading } = useAuth()
  const [players, setPlayers] = useState([])
  const [team, setTeam] = useState(null)
  const [allTeams, setAllTeams] = useState([]) // For edit modal team selection
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [playerToDelete, setPlayerToDelete] = useState(null)
  const [playerToEdit, setPlayerToEdit] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadPlayers = useCallback(async () => {
    try {
      setIsLoading(true)
      const [teamPlayers, teamData] = await Promise.all([
        getPlayersByTeam(teamId),
        getTeamById(teamId)
      ])
      setPlayers(teamPlayers)
      setTeam(teamData)
    } catch (error) {
      console.error('Error loading data:', error)
      setPlayers([])
      setTeam(null)
    } finally {
      setIsLoading(false)
    }
  }, [teamId])

  useEffect(() => {
    if (!user || !teamId) return
    loadPlayers()
  }, [user, teamId, loadPlayers])

  // Load all teams for edit modal
  useEffect(() => {
    const loadAllTeams = async () => {
      try {
        const teams = await getTeamsByCoach(user.uid)
        setAllTeams(teams)
      } catch (error) {
        console.error('Error loading teams:', error)
        setAllTeams([])
      }
    }

    if (user) {
      loadAllTeams()
    }
  }, [user])

  const handlePlayerCreated = (newPlayer) => {
    setPlayers(prevPlayers => [...prevPlayers, newPlayer])
  }

  const handleDeleteClick = (player) => {
    setPlayerToDelete(player)
  }

  const handleDeleteConfirm = async () => {
    if (!playerToDelete) return
    
    try {
      setIsDeleting(true)
      await deletePlayer(playerToDelete.id)
      setPlayers(prevPlayers => prevPlayers.filter(player => player.id !== playerToDelete.id))
      setPlayerToDelete(null)
    } catch (error) {
      console.error('Error deleting player:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setPlayerToDelete(null)
  }

  const handleEditClick = (player) => {
    setPlayerToEdit(player)
  }

  const handleEditSubmit = async (playerData) => {
    if (!playerToEdit) return
    
    try {
      const { updatePlayer } = await import('../services/db')
      await updatePlayer(playerToEdit.id, playerData)
      
      // Refresh players list
      await loadPlayers()
      setPlayerToEdit(null)
    } catch (error) {
      console.error('Error updating player:', error)
    }
  }

  const handleEditCancel = () => {
    setPlayerToEdit(null)
  }

  const calculateAge = (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-gray-50 to-blue-100 dark:from-gray-900 dark:via-primary-900/10 dark:to-gray-800 animate-fadeIn" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'none' }}>
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-b border-primary-100 dark:border-primary-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 animate-slideDown">
              <Link 
                to="/teams" 
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <svg className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 shadow-lg">
                <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-700 dark:from-white dark:to-primary-300 bg-clip-text text-transparent">Παίκτες</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Διαχείριση παικτών ομάδας: {team?.name || teamId}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 dark:from-primary-500 dark:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:focus:ring-offset-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 animate-slideUp"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Νέος Παίκτης
              </button>
              <button
                onClick={() => setShowAssignForm(true)}
                className="inline-flex items-center px-4 py-2 border border-primary-300 dark:border-primary-600 text-sm font-medium rounded-xl text-primary-700 dark:text-primary-300 bg-white dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:focus:ring-offset-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 animate-slideUp"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Προσθήκη Υπάρχοντος
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-120px)]">
        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slideUp">
          {players.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                <svg className="h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Δεν βρέθηκαν παίκτες</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Ξεκινήστε προσθέτοντας τον πρώτο παίκτη στην ομάδα.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Προσθήκη Πρώτου Παίκτη
              </button>
            </div>
          ) : (
            players.map(player => {
              const isMainTeam = player.mainTeamId === teamId
              return (
                <div 
                  key={player.id} 
                  className={`bg-white dark:bg-gray-800 overflow-hidden shadow-sm hover:shadow-md rounded-lg border transition-all duration-300 ${
                    isMainTeam 
                      ? 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500' 
                      : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 opacity-75 hover:opacity-90'
                  }`}
                >
                  <div className="p-4">
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${
                          isMainTeam 
                            ? 'bg-gradient-to-br from-secondary-100 to-secondary-200 dark:from-secondary-900/30 dark:to-secondary-800/30' 
                            : 'bg-gray-100 dark:bg-gray-700/50'
                        }`}>
                          <svg className={`w-4 h-4 ${
                            isMainTeam 
                              ? 'text-secondary-600 dark:text-secondary-400' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className={`font-semibold truncate ${
                              isMainTeam 
                                ? 'text-gray-900 dark:text-white' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {player.name}
                            </h3>
                            {isMainTeam && (
                              <svg className="w-3 h-3 text-primary-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <p className={`text-xs truncate ${
                            isMainTeam 
                              ? 'text-gray-500 dark:text-gray-400' 
                              : 'text-gray-400 dark:text-gray-500'
                          }`}>
                            {calculateAge(player.dateOfBirth)} ετών
                            {player.position && ` • ${player.position}`}
                            {player.jersey_number && ` • #${player.jersey_number}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {player.userId ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            isMainTeam 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                              : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                            <svg className="h-2.5 w-2.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Συνδεδεμένος
                          </span>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            isMainTeam 
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' 
                              : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                          }`}>
                            <svg className="h-2.5 w-2.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {player.parentName || 'Μη συνδεδεμένος'}
                          </span>
                        )}
                        
                        {!isMainTeam && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400">
                            <svg className="h-2.5 w-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Δευτερεύουσα ομάδα
                          </span>
                        )}
                      </div>
                      
                      {/* Action Buttons - moved to bottom right */}
                      {(user?.role === 'coach' || user?.role === 'superadmin') && (
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditClick(player)
                            }}
                            className={`p-1.5 rounded-lg transition-all duration-200 ${
                              isMainTeam 
                                ? 'text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20' 
                                : 'text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                            }`}
                            title="Επεξεργασία παίκτη"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteClick(player)
                            }}
                            className={`p-1.5 rounded-lg transition-all duration-200 ${
                              isMainTeam 
                                ? 'text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' 
                                : 'text-gray-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                            }`}
                            title="Διαγραφή παίκτη"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>

      {/* Create Player Modal */}
      <CreatePlayerModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onPlayerCreated={handlePlayerCreated}
        teamId={teamId}
        userId={user?.uid}
      />

      {/* Delete Confirmation Modal */}
      {playerToDelete && (
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
                Διαγραφή Παίκτη
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Είστε σίγουρος ότι θέλετε να διαγράψετε τον παίκτη <span className="font-medium text-gray-900 dark:text-white">"{playerToDelete.name}"</span>; 
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

      {/* Edit Player Modal */}
      {playerToEdit && (
        <CreatePlayerModal
          isOpen={!!playerToEdit}
          onClose={handleEditCancel}
          onSubmit={handleEditSubmit}
          teamId={teamId}
          teams={allTeams} // Pass all teams for full selection capability
          isGlobalMode={true} // Enable full team selection in edit mode
          userRole={user.role}
          userId={user.uid}
          playerData={playerToEdit} // Pass existing player data for editing
        />
      )}

      {/* Assign Existing Player Modal */}
      <AssignExistingPlayerModal
        isOpen={showAssignForm}
        onClose={() => setShowAssignForm(false)}
        teamId={teamId}
        onPlayerAssigned={loadPlayers}
      />
    </div>
  )
}