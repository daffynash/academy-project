import { useState, useEffect } from 'react'
import { createPlayer, getAllUsers } from '../services/db'

export default function CreatePlayerModal({ 
  isOpen, 
  onClose, 
  onSubmit, // Changed from onPlayerCreated to onSubmit for flexibility
  teamId = null, // Optional team ID for team-specific mode
  teams = [], // Available teams for global mode
  isGlobalMode = false, // Whether this is global player creation
  userRole = 'coach', // User role for conditional rendering
  userId 
}) {
  const [playerName, setPlayerName] = useState('')
  const [playerSurname, setPlayerSurname] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [position, setPosition] = useState('')
  const [jerseyNumber, setJerseyNumber] = useState('')
  const [parentName, setParentName] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [assignToUser, setAssignToUser] = useState(userRole === 'parent') // Auto-assign for parents
  const [selectedUserId, setSelectedUserId] = useState(userRole === 'parent' ? userId : '')
  const [selectedTeams, setSelectedTeams] = useState(teamId ? [teamId] : [])
  const [availableUsers, setAvailableUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Load available users when modal opens (only if not parent role)
  useEffect(() => {
    if (isOpen && userRole !== 'parent') {
      const loadUsers = async () => {
        try {
          setLoadingUsers(true)
          const users = await getAllUsers(userId) // Exclude current user
          setAvailableUsers(users)
        } catch (error) {
          console.error('Error loading users:', error)
          setAvailableUsers([])
        } finally {
          setLoadingUsers(false)
        }
      }
      loadUsers()
    }
  }, [isOpen, userId, userRole])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!playerName.trim()) {
      setError('Το όνομα του παίκτη είναι υποχρεωτικό')
      return
    }

    if (userRole !== 'parent' && !playerSurname.trim()) {
      setError('Το επίθετο του παίκτη είναι υποχρεωτικό')
      return
    }

    if (!dateOfBirth) {
      setError('Η ημερομηνία γέννησης είναι υποχρεωτική')
      return
    }

    // For global mode, at least one team should be selected (unless parent)
    if (isGlobalMode && userRole !== 'parent' && selectedTeams.length === 0) {
      setError('Παρακαλώ επιλέξτε τουλάχιστον μία ομάδα')
      return
    }

    // Validate parent info if not assigning to user (and not parent role)
    if (userRole !== 'parent' && !assignToUser && (!parentName.trim() || !parentEmail.trim())) {
      setError('Τα στοιχεία γονέα είναι υποχρεωτικά αν δεν υπάρχει συνδεδεμένος λογαριασμός')
      return
    }

    // Validate user selection if assigning to user (and not parent role)
    if (userRole !== 'parent' && assignToUser && !selectedUserId) {
      setError('Παρακαλώ επιλέξτε έναν χρήστη για σύνδεση')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      
      const playerData = {
        name: playerName.trim(),
        surname: userRole === 'parent' ? '' : playerSurname.trim(),
        birthDate: dateOfBirth, // Changed from dateOfBirth to birthDate for consistency
        teamIds: isGlobalMode ? selectedTeams : [teamId].filter(Boolean),
        userId: assignToUser ? selectedUserId : null,
        parentName: assignToUser ? null : parentName.trim(),
        parentEmail: assignToUser ? null : parentEmail.trim(),
        jersey_number: jerseyNumber ? parseInt(jerseyNumber) : null,
        position: position.trim() || null,
        createdBy: userId
      }
      
      await onSubmit(playerData) // Use the passed onSubmit function
      
      // Reset form
      resetForm()
      onClose()
      
    } catch (error) {
      console.error('Error creating player:', error)
      setError('Αποτυχία δημιουργίας παίκτη. Παρακαλώ δοκιμάστε ξανά.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setPlayerName('')
    setPlayerSurname('')
    setDateOfBirth('')
    setPosition('')
    setJerseyNumber('')
    setParentName('')
    setParentEmail('')
    setAssignToUser(userRole === 'parent')
    setSelectedUserId(userRole === 'parent' ? userId : '')
    setSelectedTeams(teamId ? [teamId] : [])
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleTeamToggle = (teamIdToToggle) => {
    setSelectedTeams(prev => 
      prev.includes(teamIdToToggle)
        ? prev.filter(id => id !== teamIdToToggle)
        : [...prev, teamIdToToggle]
    )
  }

  if (!isOpen) return null

  // Simplified interface for parents
  const isParentMode = userRole === 'parent'

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6 animate-slideDown max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-primary-700 dark:from-white dark:to-primary-300 bg-clip-text text-transparent">
            {isParentMode ? 'Προσθήκη Παιδιού' : 'Προσθήκη Νέου Παίκτη'}
          </h3>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/50 p-4 border-l-4 border-red-400 dark:border-red-500">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="ml-3 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={isParentMode ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isParentMode ? 'Όνομα Παιδιού *' : 'Όνομα Παίκτη *'}
              </label>
              <input
                id="playerName"
                type="text"
                required
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
                placeholder={isParentMode ? "π.χ. Γιάννης" : "π.χ. Γιάννης"}
              />
            </div>

            {!isParentMode && (
              <div>
                <label htmlFor="playerSurname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Επίθετο Παίκτη *
                </label>
                <input
                  id="playerSurname"
                  type="text"
                  required={!isParentMode}
                  value={playerSurname}
                  onChange={(e) => setPlayerSurname(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
                  placeholder="π.χ. Παπαδόπουλος"
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ημερομηνία Γέννησης *
            </label>
            <input
              id="dateOfBirth"
              type="date"
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
            />
          </div>

          {/* Team Selection for Global Mode */}
          {isGlobalMode && !isParentMode && teams.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ομάδες
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                {teams.map(team => (
                  <label key={team.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTeams.includes(team.id)}
                      onChange={() => handleTeamToggle(team.id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900 dark:text-white">{team.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Additional fields for coaches/superadmins */}
          {!isParentMode && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Θέση
                </label>
                <select
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                >
                  <option value="">Επιλέξτε θέση</option>
                  <option value="Τερματοφύλακας">Τερματοφύλακας</option>
                  <option value="Αμυντικός">Αμυντικός</option>
                  <option value="Μέσος">Μέσος</option>
                  <option value="Επιθετικός">Επιθετικός</option>
                </select>
              </div>

              <div>
                <label htmlFor="jerseyNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Αριθμός Φανέλας
                </label>
                <input
                  id="jerseyNumber"
                  type="number"
                  min="1"
                  max="99"
                  value={jerseyNumber}
                  onChange={(e) => setJerseyNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
                  placeholder="π.χ. 10"
                />
              </div>
            </div>
          )}

          {/* User Assignment Toggle - Only for coaches/superadmins */}
          {!isParentMode && (
            <>
              <div className="flex items-center">
                <input
                  id="assignToUser"
                  type="checkbox"
                  checked={assignToUser}
                  onChange={(e) => setAssignToUser(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="assignToUser" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Σύνδεση με λογαριασμό χρήστη
                </label>
              </div>

              {/* User Selection - Only show if assigning to user */}
              {assignToUser && (
                <div className="space-y-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Επιλογή Χρήστη</h4>
                  
                  <div>
                    <label htmlFor="selectedUser" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Χρήστης *
                    </label>
                    {loadingUsers ? (
                      <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                        Φόρτωση χρηστών...
                      </div>
                    ) : (
                      <select
                        id="selectedUser"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        required={assignToUser}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
                      >
                        <option value="">Επιλέξτε χρήστη</option>
                        <option value={userId}>👤 Ο δικός μου λογαριασμός</option>
                        {availableUsers.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )}

              {/* Parent Info - Only show if not assigning to user */}
              {!assignToUser && (
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Στοιχεία Γονέα</h4>
                  
                  <div>
                    <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Όνομα Γονέα *
                    </label>
                    <input
                      id="parentName"
                      type="text"
                      required={!assignToUser}
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
                      placeholder="π.χ. Μαρία Παπαδοπούλου"
                    />
                  </div>

                  <div>
                    <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Γονέα *
                    </label>
                    <input
                      id="parentEmail"
                      type="email"
                      required={!assignToUser}
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
                      placeholder="π.χ. maria@example.com"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Ακύρωση
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isSubmitting ? 'Δημιουργία...' : isParentMode ? 'Προσθήκη Παιδιού' : 'Δημιουργία Παίκτη'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}