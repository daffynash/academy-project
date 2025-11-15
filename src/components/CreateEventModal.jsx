import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { createEvent, updateEvent, EVENT_TYPES, EVENT_STATUS } from '../services/events'
import { getAllTeams, getPlayersByTeam } from '../services/db'
import useAuth from '../contexts/useAuth'

export default function CreateEventModal({ isOpen, onClose, onEventCreated, eventToEdit = null }) {
  const { user } = useAuth()
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEditMode] = useState(!!eventToEdit)

  // Form state
  const [formData, setFormData] = useState({
    description: '',
    type: 'training',
    startDate: '',
    startTime: '',
    duration: '90',
    location: '',
    teamIds: [],
    opponent: '',
    status: 'scheduled'
  })

  // Participants state
  const [includeAllPlayers, setIncludeAllPlayers] = useState(true)
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([])

  // Load teams
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const allTeams = await getAllTeams()
        setTeams(allTeams)
      } catch (error) {
        console.error('Error loading teams:', error)
      }
    }
    loadTeams()
  }, [])

  // Load players when team selection changes
  useEffect(() => {
    const loadPlayers = async () => {
      if (formData.teamIds.length === 0) {
        setPlayers([])
        return
      }

      try {
        // Load players for all selected teams
        const allPlayers = []
        for (const teamId of formData.teamIds) {
          const teamPlayers = await getPlayersByTeam(teamId)
          allPlayers.push(...teamPlayers)
        }
        // Filter out players without names
        const validPlayers = allPlayers.filter(player => player.name && player.name.trim())
        setPlayers(validPlayers)

        // If including all players, select all of them
        if (includeAllPlayers) {
          setSelectedPlayerIds(validPlayers.map(player => player.id))
        }
      } catch (error) {
        console.error('Error loading players:', error)
        setPlayers([])
      }
    }

    loadPlayers()
  }, [formData.teamIds, includeAllPlayers])

  // Populate form when editing
  useEffect(() => {
    if (eventToEdit) {
      // Calculate duration from start and end dates in minutes
      let calculatedDuration = '90'
      if (eventToEdit.startDate && eventToEdit.endDate) {
        const diffMs = eventToEdit.endDate - eventToEdit.startDate
        const totalMinutes = Math.floor(diffMs / (1000 * 60))
        calculatedDuration = String(totalMinutes)
      }

      setFormData({
        description: eventToEdit.description || '',
        type: eventToEdit.type || 'training',
        startDate: eventToEdit.startDate ? eventToEdit.startDate.toISOString().split('T')[0] : '',
        startTime: eventToEdit.startDate ? eventToEdit.startDate.toTimeString().slice(0, 5) : '',
        duration: calculatedDuration,
        location: eventToEdit.location || '',
        teamIds: eventToEdit.teamIds || [],
        opponent: eventToEdit.opponent || '',
        status: eventToEdit.status || 'scheduled'
      })

      // Set participants state
      setIncludeAllPlayers(eventToEdit.participantIds ? eventToEdit.participantIds.length === 0 : true)
      setSelectedPlayerIds(eventToEdit.participantIds || [])
    }
  }, [eventToEdit])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTeamToggle = (teamId) => {
    setFormData(prev => ({
      ...prev,
      teamIds: prev.teamIds.includes(teamId)
        ? prev.teamIds.filter(id => id !== teamId)
        : [...prev.teamIds, teamId]
    }))
  }

  const handlePlayerToggle = (playerId) => {
    setSelectedPlayerIds(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    )
  }

  const handleIncludeAllPlayersChange = (checked) => {
    setIncludeAllPlayers(checked)
    if (checked) {
      // Select all players
      setSelectedPlayerIds(players.map(player => player.id))
    } else {
      // Clear selection
      setSelectedPlayerIds([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.startDate || !formData.startTime) {
      setError('Η ημερομηνία και η ώρα έναρξης είναι υποχρεωτικές')
      return
    }

    if (formData.teamIds.length === 0) {
      setError('Παρακαλώ επιλέξτε τουλάχιστον μία ομάδα')
      return
    }

    if (!formData.duration) {
      setError('Η διάρκεια είναι υποχρεωτική')
      return
    }

    // Validate participants
    if (!includeAllPlayers && selectedPlayerIds.length === 0) {
      setError('Παρακαλώ επιλέξτε τουλάχιστον έναν συμμετέχοντα')
      return
    }

    try {
      setIsLoading(true)

      // Combine date and time into Date objects
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)

      // Calculate end time from duration (in minutes)
      const durationMinutes = parseInt(formData.duration, 10)
      const endDateTime = new Date(startDateTime)
      endDateTime.setMinutes(endDateTime.getMinutes() + durationMinutes)

      // Create event for each selected team
      const createdEvents = []

      for (const teamId of formData.teamIds) {
        const team = teams.find(t => t.id === teamId)
        if (!team) continue

        // Generate title: {Τυπος event} - {ομάδα} - {Ημέρα, Ημερομηνία, ώρα}
        const eventTypeLabel = EVENT_TYPES[formData.type]
        const dayName = startDateTime.toLocaleDateString('el-GR', { weekday: 'long' })
        const dateStr = startDateTime.toLocaleDateString('el-GR', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric'
        })
        const timeStr = startDateTime.toLocaleTimeString('el-GR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
        const title = `${eventTypeLabel} - ${team.name} - ${dayName}, ${dateStr}, ${timeStr}`

        // Generate description if empty
        let description = formData.description.trim()
        if (!description) {
          const dayNameForDescription = startDateTime.toLocaleDateString('el-GR', { weekday: 'long' })
          const dateForDescription = startDateTime.toLocaleDateString('el-GR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })
          // Convert minutes to hours and minutes for display
          const durationMins = parseInt(formData.duration, 10)
          const hours = Math.floor(durationMins / 60)
          const mins = durationMins % 60
          let durationStr = ''
          if (hours > 0 && mins > 0) {
            durationStr = `${hours} ${hours === 1 ? 'ώρα' : 'ώρες'} και ${mins} λεπτά`
          } else if (hours > 0) {
            durationStr = `${hours} ${hours === 1 ? 'ώρα' : 'ώρες'}`
          } else {
            durationStr = `${mins} λεπτά`
          }
          const locationStr = formData.location.trim() || 'τον χώρο προπόνησης'

          description = `${eventTypeLabel} του τμήματος ${team.name} την ${dayNameForDescription} ${dateForDescription} στις ${timeStr} διάρκειας ${durationStr} στο ${locationStr}.`
        }

        // Determine participant IDs
        let participantIds = []
        if (includeAllPlayers) {
          // Include all players from this team
          participantIds = players
            .filter(player => player.teamIds && player.teamIds.includes(teamId))
            .map(player => player.id)
        } else {
          // Use selected players that belong to this team
          participantIds = selectedPlayerIds.filter(playerId => {
            const player = players.find(p => p.id === playerId)
            return player && player.teamIds && player.teamIds.includes(teamId)
          })
        }

        const eventData = {
          title,
          description,
          type: formData.type,
          startDate: startDateTime,
          endDate: endDateTime,
          location: formData.location.trim(),
          teamIds: [teamId], // Single team per event
          participantIds,
          opponent: formData.opponent.trim(),
          status: formData.status,
          createdBy: user.uid
        }

        let savedEvent
        if (isEditMode && formData.teamIds.length === 1) {
          // Only update if editing and single team
          savedEvent = await updateEvent(eventToEdit.id, eventData)
          savedEvent = { ...eventToEdit, ...savedEvent }
        } else {
          savedEvent = await createEvent(eventData)
        }

        // Convert Timestamp to Date for compatibility with Events.jsx
        if (savedEvent.startDate && typeof savedEvent.startDate.toDate === 'function') {
          savedEvent.startDate = savedEvent.startDate.toDate()
        }
        if (savedEvent.endDate && typeof savedEvent.endDate.toDate === 'function') {
          savedEvent.endDate = savedEvent.endDate.toDate()
        }
        if (savedEvent.createdAt && typeof savedEvent.createdAt.toDate === 'function') {
          savedEvent.createdAt = savedEvent.createdAt.toDate()
        }
        if (savedEvent.updatedAt && typeof savedEvent.updatedAt.toDate === 'function') {
          savedEvent.updatedAt = savedEvent.updatedAt.toDate()
        }

        createdEvents.push(savedEvent)
      }

      // Return all created events
      createdEvents.forEach(event => onEventCreated(event))
      handleClose()
    } catch (error) {
      console.error('Error saving event:', error)
      setError('Σφάλμα κατά την αποθήκευση του event')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      description: '',
      type: 'training',
      startDate: '',
      startTime: '',
      duration: '90',
      location: '',
      teamIds: [],
      opponent: '',
      status: 'scheduled'
    })
    setIncludeAllPlayers(true)
    setSelectedPlayerIds([])
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn pointer-events-auto" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] animate-scaleIn border border-gray-200 dark:border-gray-700 pointer-events-auto flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? 'Επεξεργασία Event' : 'Νέο Event'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Συμπληρώστε τα στοιχεία του event
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Τύπος *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {Object.entries(EVENT_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Κατάσταση
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {Object.entries(EVENT_STATUS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Περιγραφή <span className="text-gray-500 text-xs">(προαιρετικό - θα συμπληρωθεί αυτόματα αν αφεθεί κενό)</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Αν μείνει κενό, θα δημιουργηθεί αυτόματα βάσει των στοιχείων"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ημερομηνία *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Start Time - 24 hour format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ώρα Έναρξης *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Διάρκεια (λεπτά) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="480"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="π.χ. 90"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Τοποθεσία
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="π.χ. Γήπεδο Ακαδημίας"
              />
            </div>

            {/* Opponent (for matches) */}
            {formData.type === 'match' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Αντίπαλος
                </label>
                <input
                  type="text"
                  name="opponent"
                  value={formData.opponent}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Όνομα αντίπαλης ομάδας"
                />
              </div>
            )}

            {/* Team Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ομάδες *
              </label>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50 max-h-48 overflow-y-auto">
                {teams.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                    Δεν υπάρχουν διαθέσιμες ομάδες
                  </p>
                ) : (
                  <div className="space-y-2">
                    {teams.map(team => (
                      <label
                        key={team.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.teamIds.includes(team.id)}
                          onChange={() => handleTeamToggle(team.id)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">{team.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Participants Selection */}
            {formData.teamIds.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Συμμετέχοντες
                </label>

                {/* Include All Players Toggle */}
                <div className="mb-4">
                  <label className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeAllPlayers}
                      onChange={(e) => handleIncludeAllPlayersChange(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Συμπεριλαμβάνει όλα τα παιδιά της ομάδας
                      </span>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Όλα τα παιδιά της επιλεγμένης ομάδας θα προστεθούν αυτόματα ως συμμετέχοντες
                      </p>
                    </div>
                  </label>
                </div>

                {/* Individual Player Selection */}
                {!includeAllPlayers && (
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50 max-h-64 overflow-y-auto">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Επιλέξτε τα παιδιά που θα συμμετέχουν:
                    </p>
                    {players.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                        Δεν υπάρχουν παιδιά σε αυτή την ομάδα
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {players.map(player => (
                          <label
                            key={player.id}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPlayerIds.includes(player.id)}
                              onChange={() => handlePlayerToggle(player.id)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                            />
                            <div className="flex-1">
                              <span className="text-sm text-gray-900 dark:text-white font-medium">
                                {player.name || `Παιδί ${player.id.slice(-4)}`}
                              </span>
                              {player.teamIds && player.teamIds.length > 1 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                  ({teams.find(t => t.id === player.teamIds.find(tid => formData.teamIds.includes(tid)))?.name})
                                </span>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer - Inside Form */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 -mx-6 -mb-6 mt-6 p-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
            >
              Ακύρωση
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Αποθήκευση...</span>
                </>
              ) : (
                <span>{isEditMode ? 'Ενημέρωση' : 'Δημιουργία'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
      </div>
    </>,
    document.body
  )
}
