import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { submitAttendanceDeclaration, updateAttendanceDeclaration, getAttendanceDeclarations, ATTENDANCE_STATUS } from '../services/events'
import useAuth from '../contexts/useAuth'

export default function AttendanceModal({ isOpen, onClose, event, userPlayers, onAttendanceSubmitted }) {
  const { user } = useAuth()
  const [attendanceDeclarations, setAttendanceDeclarations] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Load existing attendance declarations when modal opens
  useEffect(() => {
    const loadAttendanceDeclarations = async () => {
      if (!event) return

      try {
        const declarations = await getAttendanceDeclarations(event.id)
        
        // Convert Timestamp objects to Date objects for compatibility
        const processedDeclarations = {}
        Object.entries(declarations).forEach(([playerId, declaration]) => {
          processedDeclarations[playerId] = {
            ...declaration,
            timestamp: declaration.timestamp && typeof declaration.timestamp.toDate === 'function'
              ? declaration.timestamp.toDate()
              : new Date(declaration.timestamp)
          }
        })
        
        setAttendanceDeclarations(processedDeclarations)
      } catch (error) {
        console.error('Error loading attendance declarations:', error)
      }
    }

    if (isOpen && event) {
      loadAttendanceDeclarations()
    }
  }, [isOpen, event])

  const handleAttendanceChange = async (playerId, status, notes = '') => {
    setError('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      const existingDeclaration = attendanceDeclarations[playerId]

      if (existingDeclaration) {
        // Update existing declaration
        await updateAttendanceDeclaration(event.id, playerId, status, notes)
        setAttendanceDeclarations(prev => ({
          ...prev,
          [playerId]: {
            ...prev[playerId],
            status,
            notes,
            timestamp: new Date()
          }
        }))
      } else {
        // Create new declaration
        const result = await submitAttendanceDeclaration(event.id, playerId, user.uid, status, notes)
        setAttendanceDeclarations(prev => ({
          ...prev,
          [playerId]: {
            parentId: user.uid,
            status,
            notes,
            timestamp: result.timestamp.toDate()
          }
        }))
      }

      setSuccessMessage('Η δήλωση παρουσίας αποθηκεύτηκε επιτυχώς!')
      onAttendanceSubmitted && onAttendanceSubmitted()
    } catch (error) {
      console.error('Error saving attendance declaration:', error)
      setError('Σφάλμα κατά την αποθήκευση της δήλωσης παρουσίας')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'absent':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      case 'maybe':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  if (!isOpen) return null

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn pointer-events-auto" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] animate-scaleIn border border-gray-200 dark:border-gray-700 pointer-events-auto flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Δήλωση Παρουσίας
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {event?.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Players List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Τα Παιδιά μου
            </h3>

            {event?.status !== 'scheduled' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  ℹ️ Δεν μπορείτε να δηλώσετε παρουσία για αυτό το event γιατί δεν είναι προγραμματισμένο.
                </p>
              </div>
            )}

            {userPlayers.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Δεν υπάρχουν παιδιά που συμμετέχουν σε αυτό το event
              </p>
            ) : (
              <div className="space-y-3">
                {userPlayers.map(player => {
                  const declaration = attendanceDeclarations[player.id]
                  const currentStatus = declaration?.status || null
                  const isScheduled = event?.status === 'scheduled'

                  return (
                    <div
                      key={player.id}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {player.name}
                          </h4>
                          {declaration && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Τελευταία ενημέρωση: {declaration.timestamp.toLocaleDateString('el-GR')} {declaration.timestamp.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                        {currentStatus && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>
                            {ATTENDANCE_STATUS[currentStatus]}
                          </span>
                        )}
                      </div>

                      {/* Status Buttons */}
                      {isScheduled ? (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {Object.entries(ATTENDANCE_STATUS).map(([key, label]) => (
                            <button
                              key={key}
                              onClick={() => handleAttendanceChange(player.id, key)}
                              disabled={isLoading}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                currentStatus === key
                                  ? getStatusColor(key)
                                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                              } disabled:opacity-50`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="mb-3 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-sm text-gray-700 dark:text-gray-300">
                          Δεν διατίθεται δήλωση παρουσίας
                        </div>
                      )}

                      {/* Notes */}
                      {isScheduled && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Σημειώσεις (προαιρετικό)
                          </label>
                          <textarea
                            value={declaration?.notes || ''}
                            onChange={(e) => handleAttendanceChange(player.id, currentStatus, e.target.value)}
                            placeholder="π.χ. Αρρώστια, ταξίδι κτλ."
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
          >
            Κλείσιμο
          </button>
        </div>
      </div>
      </div>
    </>,
    document.body
  )
}