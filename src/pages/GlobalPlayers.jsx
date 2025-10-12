import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deletePlayer, getAllTeams } from '../services/db'
import useAuth from '../contexts/useAuth'
import CreatePlayerModal from '../components/CreatePlayerModal'

export default function GlobalPlayers() {
  const { user, loading } = useAuth()
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [playerToDelete, setPlayerToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTeam, setFilterTeam] = useState('')

  // Role-based access control
  const hasPlayerAccess = user?.role === 'coach' || user?.role === 'superadmin' || user?.role === 'parent'

  useEffect(() => {
    if (!user || !hasPlayerAccess) return
    
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Load all players or user-specific players based on role
        let playerData = []
        if (user.role === 'parent') {
          // Parents only see their assigned players
          const { getPlayersByUser } = await import('../services/db')
          playerData = await getPlayersByUser(user.uid)
        } else if (user.role === 'superadmin') {
          // Superadmins see all players
          const { getAllPlayers } = await import('../services/db')
          playerData = await getAllPlayers()
        } else {
          // Coaches see players from their teams
          const { getPlayersByCoach } = await import('../services/db')
          playerData = await getPlayersByCoach(user.uid)
        }
        
        setPlayers(playerData)
        
        // Load teams for filtering (only if not parent)
        if (user.role !== 'parent') {
          const teamData = await getAllTeams()
          setTeams(teamData)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, hasPlayerAccess])

  const handleCreatePlayer = async (playerData) => {
    try {
      const { createPlayer } = await import('../services/db')
      
      // For parent role, automatically assign to their account
      if (user.role === 'parent') {
        playerData.userId = user.uid
        // Remove parent info fields since they're assigned to user account
        delete playerData.parentName
        delete playerData.parentEmail
      }
      
      const newPlayer = await createPlayer(playerData)
      console.log('Player created successfully:', newPlayer)
      
      // Refresh players list
      const loadData = async () => {
        let refreshedPlayerData = []
        if (user.role === 'parent') {
          const { getPlayersByUser } = await import('../services/db')
          refreshedPlayerData = await getPlayersByUser(user.uid)
        } else if (user.role === 'superadmin') {
          const { getAllPlayers } = await import('../services/db')
          refreshedPlayerData = await getAllPlayers()
        } else {
          const { getPlayersByCoach } = await import('../services/db')
          refreshedPlayerData = await getPlayersByCoach(user.uid)
        }
        setPlayers(refreshedPlayerData)
      }
      
      await loadData()
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating player:', error)
    }
  }

  const handleDeletePlayer = async () => {
    if (!playerToDelete) return
    
    try {
      setIsDeleting(true)
      await deletePlayer(playerToDelete.id)
      setPlayers(prev => prev.filter(p => p.id !== playerToDelete.id))
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

  // Filter players based on search and team
  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.surname.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTeam = !filterTeam || player.teamIds?.includes(filterTeam)
    return matchesSearch && matchesTeam
  })

  const calculateAge = (birthDate) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
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

  if (!hasPlayerAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-gray-50 to-blue-100 dark:from-gray-900 dark:via-primary-900/10 dark:to-gray-800 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="h-16 w-16 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
            <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L5.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Δεν έχετε πρόσβαση</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Δεν έχετε δικαιώματα για προβολή παικτών.</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Επιστροφή στο Dashboard
          </Link>
        </div>
      </div>
    )
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-700 dark:from-white dark:to-primary-300 bg-clip-text text-transparent">
                  {user.role === 'parent' ? 'Οι Παίκτες μου' : 'Παίκτες'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.role === 'parent' ? 'Διαχείριση των παιδιών σας' : 'Διαχείριση όλων των παικτών'}
                </p>
              </div>
            </div>
            
            {/* Create Player Button - Role-based visibility */}
            {(user.role === 'coach' || user.role === 'superadmin' || user.role === 'parent') && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 dark:from-primary-500 dark:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:focus:ring-offset-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 animate-slideUp"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {user.role === 'parent' ? 'Προσθήκη Παιδιού' : 'Νέος Παίκτης'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Search and Filter Bar */}
      {user.role !== 'parent' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Αναζήτηση παίκτη..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={filterTeam}
                  onChange={(e) => setFilterTeam(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Όλες οι ομάδες</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Players Grid */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-24 w-24 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4">
              <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm || filterTeam ? 'Δεν βρέθηκαν παίκτες' : 'Δεν υπάρχουν παίκτες'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || filterTeam 
                ? 'Δοκιμάστε να αλλάξετε τα κριτήρια αναζήτησης.'
                : 'Δημιουργήστε τον πρώτο παίκτη για να ξεκινήσετε.'
              }
            </p>
            {!searchTerm && !filterTeam && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {user.role === 'parent' ? 'Προσθήκη Παιδιού' : 'Νέος Παίκτης'}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slideUp">
            {filteredPlayers.map((player) => (
              <div key={player.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {player.name} {player.surname}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {calculateAge(player.birthDate)} ετών
                      </p>
                    </div>
                    
                    {/* Delete button - Role-based visibility */}
                    {(user.role === 'coach' || user.role === 'superadmin') && (
                      <button
                        onClick={() => setPlayerToDelete(player)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(player.birthDate).toLocaleDateString('el-GR')}
                    </div>
                    
                    {player.parentName && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {player.parentName}
                      </div>
                    )}

                    {player.teamIds && player.teamIds.length > 0 && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {player.teamIds.length} ομάδα{player.teamIds.length > 1 ? 'ες' : ''}
                      </div>
                    )}
                  </div>

                  {player.userId && (
                    <div className="mt-4 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded-full inline-block">
                      Συνδεδεμένος με λογαριασμό
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Player Modal */}
      {showCreateForm && (
        <CreatePlayerModal
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreatePlayer}
          teams={teams}
          isGlobalMode={true}
          userRole={user.role}
        />
      )}

      {/* Delete Confirmation Modal */}
      {playerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full animate-slideDown">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mr-4">
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L5.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Διαγραφή Παίκτη</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Αυτή η ενέργεια δεν μπορεί να αναιρεθεί</p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Είστε σίγουροι ότι θέλετε να διαγράψετε τον παίκτη <strong>{playerToDelete.name} {playerToDelete.surname}</strong>;
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  Ακύρωση
                </button>
                <button
                  onClick={handleDeletePlayer}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isDeleting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    'Διαγραφή'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}