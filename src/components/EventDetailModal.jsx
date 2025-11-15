import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getEventWithParticipants, EVENT_TYPES, submitAttendanceDeclaration } from '../services/events'
import { getAllTeams, getPlayersByUser } from '../services/db'
import useAuth from '../contexts/useAuth'

export default function EventDetailModal({ isOpen, onClose, event: initialEvent }) {
  const { user } = useAuth()
  const [event, setEvent] = useState(null)
  const [userPlayers, setUserPlayers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen || !initialEvent?.id || !user) return

    const loadData = async () => {
      try {
        setIsLoading(true)
        const [eventData, , parentPlayers] = await Promise.all([
          getEventWithParticipants(initialEvent.id),
          getAllTeams(),
          getPlayersByUser(user.uid)
        ])

        if (!eventData) {
          setError('Event δεν βρέθηκε')
          return
        }

        setEvent(eventData)
        setUserPlayers(parentPlayers)
      } catch (err) {
        console.error('Error loading event:', err)
        setError('Σφάλμα κατά τη φόρτωση του event')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [isOpen, initialEvent?.id, user])

  const handleAttendanceDeclaration = async (playerId, status) => {
    try {
      setIsSubmitting(true)
      await submitAttendanceDeclaration(event.id, playerId, user.uid, status)

      // Update local state
      setEvent(prev => ({
        ...prev,
        attendanceDeclarations: {
          ...prev.attendanceDeclarations,
          [playerId]: {
            parentId: user.uid,
            status,
            timestamp: new Date()
          }
        },
        participants: prev.participants.map(p =>
          p.id === playerId
            ? { ...p, attendanceStatus: { parentId: user.uid, status, timestamp: new Date() } }
            : p
        )
      }))
    } catch (err) {
      console.error('Error declaring attendance:', err)
      setError('Σφάλμα κατά τη δήλωση παρουσίας')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn pointer-events-auto" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] animate-scaleIn border border-gray-200 dark:border-gray-700 pointer-events-auto flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-700 flex-shrink-0">
          <div className="flex-1">
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            ) : event ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{event.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {event.startDate.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} •{' '}
                  {event.startDate.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  {event.location && ` • ${event.location}`}
                </p>
              </>
            ) : null}
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
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          ) : event ? (
            <div className="p-6 space-y-6">
              {/* Event Details */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                {/* Type and Status */}
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    event.type === 'training'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : event.type === 'match'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                  }`}>
                    {EVENT_TYPES[event.type]}
                  </span>
                </div>

                {/* Description */}
                {event.description && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">{event.description}</p>
                )}

                {/* Time and Location */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-600 dark:text-gray-400">Ημερομηνία & Ώρα</p>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {event.startDate.toLocaleDateString('el-GR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {event.startDate.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </p>
                  </div>
                  {event.location && (
                    <div>
                      <p className="font-medium text-gray-600 dark:text-gray-400">Τοποθεσία</p>
                      <p className="text-gray-900 dark:text-white mt-1">{event.location}</p>
                    </div>
                  )}
                </div>

                {/* Opponent for matches */}
                {event.opponent && (
                  <div>
                    <p className="font-medium text-gray-600 dark:text-gray-400 text-sm">Αντίπαλος</p>
                    <p className="text-gray-900 dark:text-white mt-1">{event.opponent}</p>
                  </div>
                )}
              </div>

              {/* Participants List */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                  <svg className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Συμμετέχοντες ({event.participants?.length || 0})</span>
                </h3>

                {/* Info message for non-scheduled events */}
                {event.status !== 'scheduled' && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      ℹ️ Δεν μπορείτε να δηλώσετε παρουσία για αυτό το event γιατί δεν είναι προγραμματισμένο.
                    </p>
                  </div>
                )}

                {event.participants && event.participants.length > 0 ? (
                  <div className="space-y-2">
                    {event.participants.map((participant) => {
                      const isUserChild = userPlayers.some(p => p.id === participant.id)
                      return (
                        <div
                          key={participant.id}
                          className={`p-4 rounded-lg border transition-colors ${
                            isUserChild
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                              : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                                              <p className={`font-medium ${
                                                isUserChild
                                                  ? 'text-blue-900 dark:text-blue-100'
                                                  : 'text-gray-900 dark:text-white'
                                              }`}>
                                                {participant.name}
                                                {isUserChild && <span className="ml-2 text-xs font-semibold text-blue-600 dark:text-blue-400">(Δικό σας παιδί)</span>}
                                              </p>
                            </div>

                            {/* Attendance Controls */}
                            {isUserChild ? (
                              <div className="ml-4">
                                {event.status === 'scheduled' ? (
                                  <>
                                    {participant.attendanceStatus ? (
                                      <div className="flex items-center space-x-2">
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                          participant.attendanceStatus.status === 'present'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                            : participant.attendanceStatus.status === 'absent'
                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                        }`}>
                                          {participant.attendanceStatus.status === 'present'
                                            ? '✓ Παρών'
                                            : participant.attendanceStatus.status === 'absent'
                                            ? '✗ Απών'
                                            : '? Ίσως'}
                                        </div>
                                        <button
                                          onClick={() => handleAttendanceDeclaration(participant.id, 'present')}
                                          disabled={isSubmitting}
                                          className={`text-xs px-2 py-1 rounded transition-colors ${
                                            participant.attendanceStatus.status === 'present'
                                              ? 'bg-green-600 text-white'
                                              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-green-500 hover:text-white'
                                          }`}
                                          title="Δήλωση Παρουσίας"
                                        >
                                          Παρών
                                        </button>
                                        <button
                                          onClick={() => handleAttendanceDeclaration(participant.id, 'maybe')}
                                          disabled={isSubmitting}
                                          className={`text-xs px-2 py-1 rounded transition-colors ${
                                            participant.attendanceStatus.status === 'maybe'
                                              ? 'bg-yellow-600 text-white'
                                              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-yellow-500 hover:text-white'
                                          }`}
                                          title="Ίσως"
                                        >
                                          Ίσως
                                        </button>
                                        <button
                                          onClick={() => handleAttendanceDeclaration(participant.id, 'absent')}
                                          disabled={isSubmitting}
                                          className={`text-xs px-2 py-1 rounded transition-colors ${
                                            participant.attendanceStatus.status === 'absent'
                                              ? 'bg-red-600 text-white'
                                              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-red-500 hover:text-white'
                                          }`}
                                          title="Δήλωση Απουσίας"
                                        >
                                          Απών
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => handleAttendanceDeclaration(participant.id, 'present')}
                                        disabled={isSubmitting || event.status !== 'scheduled'}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Δήλωσε παρουσία</span>
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  <div className="text-xs px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                                    Δεν διατίθεται
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                participant.attendanceStatus
                                  ? (participant.attendanceStatus.status === 'present'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                    : participant.attendanceStatus.status === 'absent'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300')
                                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                              }`}>
                                {participant.attendanceStatus
                                  ? (participant.attendanceStatus.status === 'present'
                                    ? '✓ Παρών'
                                    : participant.attendanceStatus.status === 'absent'
                                    ? '✗ Απών'
                                    : '? Ίσως')
                                  : 'Χωρίς δήλωση'}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">Δεν υπάρχουν συμμετέχοντες σε αυτό το event</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer - Fixed */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 flex justify-end flex-shrink-0">
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