import { useState, useEffect, useCallback } from 'react'
import { getAllPlayers, updatePlayer } from '../services/db'

export default function AssignExistingPlayerModal({ isOpen, onClose, teamId, onPlayerAssigned }) {
  const [availablePlayers, setAvailablePlayers] = useState([])
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([])
  const [mainTeamSelections, setMainTeamSelections] = useState({}) // Track which players should have this as main team
  const [isLoading, setIsLoading] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const loadAvailablePlayers = useCallback(async () => {
    setIsLoading(true)
    try {
      const allPlayers = await getAllPlayers()
      // Φιλτράρισμα παικτών που δεν είναι ήδη στην ομάδα
      const availablePlayers = allPlayers.filter(player => 
        !player.teamIds || !player.teamIds.includes(teamId)
      )
      setAvailablePlayers(availablePlayers)
    } catch (error) {
      console.error('Σφάλμα φόρτωσης παικτών:', error)
    } finally {
      setIsLoading(false)
    }
  }, [teamId])

  useEffect(() => {
    if (isOpen && teamId) {
      loadAvailablePlayers()
    }
  }, [isOpen, teamId, loadAvailablePlayers])

  const handlePlayerToggle = (playerId) => {
    setSelectedPlayerIds(prev => {
      const newSelection = prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
      
      // Clear main team selection if player is deselected
      if (!newSelection.includes(playerId)) {
        setMainTeamSelections(prev => {
          const updated = { ...prev }
          delete updated[playerId]
          return updated
        })
      }
      
      return newSelection
    })
  }

  const handleAssignPlayers = async () => {
    if (selectedPlayerIds.length === 0) return

    setIsAssigning(true)
    try {
      await Promise.all(
        selectedPlayerIds.map(playerId => {
          const player = availablePlayers.find(p => p.id === playerId)
          const updatedTeamIds = [...(player.teamIds || []), teamId]
          const isMainTeam = mainTeamSelections[playerId] === true
          
          // Prepare update data
          const updateData = { teamIds: updatedTeamIds }
          
          // Set main team if this should be the main team for this player
          if (isMainTeam) {
            updateData.mainTeamId = teamId
          } else if (!player.mainTeamId && updatedTeamIds.length === 1) {
            // If player has no main team and this is their first team, make it main
            updateData.mainTeamId = teamId
          }
          
          return updatePlayer(playerId, updateData)
        })
      )
      
      onPlayerAssigned?.()
      onClose()
      setSelectedPlayerIds([])
      setMainTeamSelections({})
    } catch (error) {
      console.error('Σφάλμα ανάθεσης παικτών:', error)
    } finally {
      setIsAssigning(false)
    }
  }

  const filteredPlayers = availablePlayers.filter(player =>
    player.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleMainTeamToggle = (playerId) => {
    setMainTeamSelections(prev => ({
      ...prev,
      [playerId]: !prev[playerId]
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Προσθήκη Υπάρχοντος Παίκτη
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Επιλέξτε παίκτες για να τους προσθέσετε στην ομάδα
          </p>
        </div>

        <div className="p-6">
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Αναζήτηση παίκτη..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          {/* Players List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Φόρτωση παικτών...
              </div>
            ) : filteredPlayers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {searchTerm ? 'Δεν βρέθηκαν παίκτες' : 'Δεν υπάρχουν διαθέσιμοι παίκτες'}
              </div>
            ) : (
              filteredPlayers.map(player => (
                <div
                  key={player.id}
                  className={`p-3 rounded-xl border transition-all duration-200 ${
                    selectedPlayerIds.includes(player.id)
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div 
                      onClick={() => handlePlayerToggle(player.id)}
                      className="flex-1 cursor-pointer"
                    >
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {player.name}
                      </h3>
                      {player.position && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {player.position}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      {/* Main team checkbox - only show if player is selected */}
                      {selectedPlayerIds.includes(player.id) && (
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mainTeamSelections[player.id] === true}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleMainTeamToggle(player.id)
                            }}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            Κύρια ομάδα
                          </span>
                        </label>
                      )}
                      
                      {/* Selection indicator */}
                      <div 
                        onClick={() => handlePlayerToggle(player.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                          selectedPlayerIds.includes(player.id)
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {selectedPlayerIds.includes(player.id) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Selected count */}
          {selectedPlayerIds.length > 0 && (
            <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <p className="text-sm text-primary-700 dark:text-primary-300">
                Επιλεγμένοι παίκτες: {selectedPlayerIds.length}
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Άκυρο
          </button>
          <button
            onClick={handleAssignPlayers}
            disabled={selectedPlayerIds.length === 0 || isAssigning}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:cursor-not-allowed"
          >
            {isAssigning ? 'Προσθήκη...' : `Προσθήκη (${selectedPlayerIds.length})`}
          </button>
        </div>
      </div>
    </div>
  )
}