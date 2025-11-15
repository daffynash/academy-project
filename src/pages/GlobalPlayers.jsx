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
  const [expandedCards, setExpandedCards] = useState(new Set())
  const [playerToEdit, setPlayerToEdit] = useState(null)
  const [isUpdatingTeams, setIsUpdatingTeams] = useState(false)

  // Close expanded cards when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on a modal or inside a card
      if (event.target.closest('.player-card') || 
          event.target.closest('[role="dialog"]') ||
          showCreateForm || 
          playerToDelete || 
          playerToEdit) {
        return
      }
      // Close all expanded cards
      if (expandedCards.size > 0) {
        setExpandedCards(new Set())
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [expandedCards, showCreateForm, playerToDelete, playerToEdit])

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
        
        // Load teams for all users (needed for team name display)
        const teamData = await getAllTeams()
        setTeams(teamData)
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

  const handleUpdateTeams = async (playerId, newTeamIds, mainTeamId = null) => {
    try {
      setIsUpdatingTeams(true)
      const { updatePlayer } = await import('../services/db')
      
      // Prepare update data
      const updateData = { teamIds: newTeamIds }
      
      // Add mainTeamId if provided and valid
      if (mainTeamId && newTeamIds.includes(mainTeamId)) {
        updateData.mainTeamId = mainTeamId
      } else if (newTeamIds.length > 0) {
        // If no valid mainTeamId provided, use first team as main
        updateData.mainTeamId = newTeamIds[0]
      } else {
        // If no teams, clear main team
        updateData.mainTeamId = null
      }
      
      await updatePlayer(playerId, updateData)
      
      // Update local state
      setPlayers(prev => prev.map(player => 
        player.id === playerId 
          ? { ...player, teamIds: newTeamIds, mainTeamId: updateData.mainTeamId }
          : player
      ))
      
      setPlayerToEdit(null)
    } catch (error) {
      console.error('Error updating player teams:', error)
    } finally {
      setIsUpdatingTeams(false)
    }
  }

  // Filter players based on search and team
  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase())
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

  const toggleCardExpansion = (playerId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(playerId)) {
        newSet.delete(playerId)
      } else {
        newSet.add(playerId)
      }
      return newSet
    })
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                className="group inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 dark:from-primary-500 dark:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:focus:ring-offset-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 animate-slideUp relative overflow-hidden"
              >
                {/* Shine effect */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                
                <svg className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-90 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="relative z-10">{user.role === 'parent' ? 'Προσθήκη Παιδιού' : 'Νέος Παίκτης'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Search and Filter Bar */}
      {user.role !== 'parent' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 animate-slideDown">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative group">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Αναζήτηση παίκτη..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-300 hover:shadow-md focus:shadow-lg placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div className="sm:w-48 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <select
                  value={filterTeam}
                  onChange={(e) => setFilterTeam(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-300 hover:shadow-md focus:shadow-lg appearance-none cursor-pointer"
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
          <div className="text-center py-12 animate-fadeIn">
            <div className="h-24 w-24 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 mx-auto mb-6 animate-pulse-soft shadow-lg">
              <svg className="h-12 w-12 text-gray-400 dark:text-gray-500 animate-bounce-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2 animate-slideDown">
              {searchTerm || filterTeam ? 'Δεν βρέθηκαν παίκτες' : 'Δεν υπάρχουν παίκτες'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 animate-slideUp max-w-md mx-auto">
              {searchTerm || filterTeam 
                ? 'Δοκιμάστε να αλλάξετε τα κριτήρια αναζήτησης.'
                : 'Δημιουργήστε τον πρώτο παίκτη για να ξεκινήσετε.'
              }
            </p>
            {!searchTerm && !filterTeam && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 animate-scaleIn relative overflow-hidden"
              >
                {/* Animated background */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                
                <svg className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-90 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="relative z-10">{user.role === 'parent' ? 'Προσθήκη Παιδιού' : 'Νέος Παίκτης'}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2 animate-slideUp">
            {filteredPlayers.map((player) => {
              const isExpanded = expandedCards.has(player.id)
              return (
                <div key={player.id} className="player-card group/card bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:-translate-y-1">
                  {/* Compact Row */}
                  <div 
                    className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    onClick={() => toggleCardExpansion(player.id)}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-full flex items-center justify-center shadow-md group-hover/card:shadow-lg group-hover/card:scale-110 transition-all duration-300">
                          <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover/card:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {player.name}
                          {player.mainTeamId && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                              {teams.find(t => t.id === player.mainTeamId)?.name || player.mainTeamId}
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {calculateAge(player.dateOfBirth)} ετών • {player.teamIds?.length || 0} {(player.teamIds?.length || 0) === 1 ? 'ομάδα' : 'ομάδες'}
                        </p>
                      </div>
                      
                      {player.userId && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-green-500 rounded-full" title="Συνδεδεμένος με λογαριασμό"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Delete button - Role-based visibility */}
                      {(user.role === 'coach' || user.role === 'superadmin') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setPlayerToDelete(player)
                          }}
                          className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 md:opacity-0 md:group-hover/card:opacity-100"
                          title="Διαγραφή παίκτη"
                        >
                          <svg className="h-4 w-4 transition-transform hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                      
                      {/* Expand/Collapse button */}
                      <button className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200 hover:scale-110">
                        <svg 
                          className={`h-4 w-4 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium">Γέννηση:</span>
                            <span className="ml-1">{new Date(player.dateOfBirth).toLocaleDateString('el-GR')}</span>
                          </div>
                          
                          {player.position && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="font-medium">Θέση:</span>
                              <span className="ml-1">{player.position}</span>
                            </div>
                          )}
                          
                          {player.jersey_number && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              <span className="font-medium">Φανέλα:</span>
                              <span className="ml-1">#{player.jersey_number}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          {player.parentName && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="font-medium">Γονέας:</span>
                              <span className="ml-1">{player.parentName}</span>
                            </div>
                          )}
                          
                          {player.parentEmail && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.828 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="font-medium">Email:</span>
                              <span className="ml-1">{player.parentEmail}</span>
                            </div>
                          )}
                          
                          {player.teamIds && player.teamIds.length > 0 && (
                            <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                              <svg className="h-4 w-4 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <div className="flex-1">
                                <span className="font-medium">Ομάδες:</span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {player.teamIds.map(teamId => {
                                    const team = teams.find(t => t.id === teamId)
                                    const isMainTeam = player.mainTeamId === teamId
                                    return (
                                      <span 
                                        key={teamId} 
                                        className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                                          isMainTeam 
                                            ? 'bg-primary-200 dark:bg-primary-800 text-primary-900 dark:text-primary-100 font-medium' 
                                            : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                        }`}
                                      >
                                        {isMainTeam && (
                                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                          </svg>
                                        )}
                                        {team?.name || teamId}
                                      </span>
                                    )
                                  })}
                                </div>
                              </div>
                              {(user.role === 'coach' || user.role === 'superadmin') && (
                                <button
                                  onClick={() => setPlayerToEdit(player)}
                                  className="ml-2 px-2 py-1 text-xs bg-primary-100 hover:bg-primary-200 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded transition-colors"
                                >
                                  Επεξεργασία
                                </button>
                              )}
                            </div>
                          )}
                          
                          {(!player.teamIds || player.teamIds.length === 0) && (user.role === 'coach' || user.role === 'superadmin') && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span className="font-medium text-gray-500 dark:text-gray-400">Δεν ανήκει σε ομάδα</span>
                              <button
                                onClick={() => setPlayerToEdit(player)}
                                className="ml-2 px-2 py-1 text-xs bg-primary-100 hover:bg-primary-200 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded transition-colors"
                              >
                                Προσθήκη σε Ομάδα
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {player.userId && (
                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <div className="inline-flex items-center px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded-full">
                            <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Συνδεδεμένος με λογαριασμό
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
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
          userId={user.uid}
        />
      )}

      {/* Delete Confirmation Modal */}
      {playerToDelete && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full animate-scaleIn border border-red-200 dark:border-red-900/30">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-14 w-14 flex items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 mr-4 animate-pulse-soft shadow-lg">
                  <svg className="h-7 w-7 text-red-600 dark:text-red-400 animate-bounce-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L5.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Διαγραφή Παίκτη</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Αυτή η ενέργεια δεν μπορεί να αναιρεθεί</p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Είστε σίγουροι ότι θέλετε να διαγράψετε τον παίκτη <strong>{playerToDelete.name}</strong>;
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="flex-1 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95"
                >
                  Ακύρωση
                </button>
                <button
                  onClick={handleDeletePlayer}
                  disabled={isDeleting}
                  className="group flex-1 px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl relative overflow-hidden"
                >
                  {/* Shine effect */}
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  
                  {isDeleting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white relative z-10"></div>
                  ) : (
                    <span className="relative z-10">Διαγραφή</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Assignment Modal */}
      {playerToEdit && (
        <TeamAssignmentModal
          player={playerToEdit}
          teams={teams}
          onClose={() => setPlayerToEdit(null)}
          onUpdate={handleUpdateTeams}
          isLoading={isUpdatingTeams}
        />
      )}
    </div>
  )
}

// Team Assignment Modal Component
function TeamAssignmentModal({ player, teams, onClose, onUpdate, isLoading }) {
  const [selectedTeams, setSelectedTeams] = useState(player.teamIds || [])
  const [mainTeamId, setMainTeamId] = useState(player.mainTeamId || '')

  const handleTeamToggle = (teamId) => {
    setSelectedTeams(prev => {
      const newTeams = prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
      
      // Update main team selection
      if (!newTeams.includes(mainTeamId)) {
        // If current main team was removed, set first team as main
        setMainTeamId(newTeams.length > 0 ? newTeams[0] : '')
      } else if (newTeams.length === 1) {
        // If only one team selected, make it main
        setMainTeamId(newTeams[0])
      }
      
      return newTeams
    })
  }

  const handleSave = () => {
    onUpdate(player.id, selectedTeams, mainTeamId)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full animate-slideDown">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Επεξεργασία Ομάδων
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Παίκτης: <span className="font-medium text-gray-900 dark:text-white">{player.name}</span>
            </p>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Επιλέξτε ομάδες:
            </p>
            {teams.map(team => (
              <label key={team.id} className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={selectedTeams.includes(team.id)}
                  onChange={() => handleTeamToggle(team.id)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-900 dark:text-white font-medium">{team.name}</span>
              </label>
            ))}
          </div>

          {teams.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Δεν υπάρχουν διαθέσιμες ομάδες
            </p>
          )}

          {/* Main Team Selection - only show when multiple teams selected */}
          {selectedTeams.length > 1 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Κύρια Ομάδα
              </label>
              <select
                value={mainTeamId}
                onChange={(e) => setMainTeamId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Επιλέξτε κύρια ομάδα</option>
                {selectedTeams.map(teamId => {
                  const team = teams.find(t => t.id === teamId)
                  return (
                    <option key={teamId} value={teamId}>
                      {team?.name || teamId}
                    </option>
                  )
                })}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Η κύρια ομάδα θα εμφανίζεται περισσότερο εμφατικά
              </p>
            </div>
          )}

          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            >
              Ακύρωση
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Αποθήκευση'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}