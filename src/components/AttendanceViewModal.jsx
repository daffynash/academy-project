import { useState, useEffect } from 'react'
import { getAttendanceDeclarations, ATTENDANCE_STATUS } from '../services/events'
import { getPlayersByIds } from '../services/db'

export default function AttendanceViewModal({ isOpen, onClose, event }) {
  const [attendanceDeclarations, setAttendanceDeclarations] = useState({})
  const [players, setPlayers] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Load attendance declarations and players when modal opens
  useEffect(() => {
    const loadData = async () => {
      if (!event) return

      setIsLoading(true)
      try {
        const [declarations, playersData] = await Promise.all([
          getAttendanceDeclarations(event.id),
          getPlayersByIds(event.participantIds || [])
        ])

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
        setPlayers(playersData)
      } catch (error) {
        console.error('Error loading attendance data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen && event) {
      loadData()
    }
  }, [isOpen, event])

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

  const getAttendanceStats = () => {
    const declarations = Object.values(attendanceDeclarations)
    const total = declarations.length
    const present = declarations.filter(d => d.status === 'present').length
    const absent = declarations.filter(d => d.status === 'absent').length
    const maybe = declarations.filter(d => d.status === 'maybe').length

    return { total, present, absent, maybe }
  }

  const stats = getAttendanceStats()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scaleIn border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Δηλώσεις Παρουσίας
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

        {/* Stats */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Σύνολο Δηλώσεων</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.present}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Παρόντες</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.absent}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Απόντες</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.maybe}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ίσως</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : players.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Δεν υπάρχουν συμμετέχοντες σε αυτό το event
            </p>
          ) : (
            <div className="space-y-3">
              {players.map(player => {
                const declaration = attendanceDeclarations[player.id]

                return (
                  <div
                    key={player.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {player.name}
                        </h4>
                        {player.teamIds && player.teamIds.length > 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Ομάδες: {player.teamIds.length}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        {declaration ? (
                          <div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(declaration.status)}`}>
                              {ATTENDANCE_STATUS[declaration.status]}
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {declaration.timestamp.toLocaleDateString('el-GR')} {declaration.timestamp.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                            Δεν έχει δηλωθεί
                          </span>
                        )}
                      </div>
                    </div>

                    {declaration?.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Σημειώσεις:</span> {declaration.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
          >
            Κλείσιμο
          </button>
        </div>
      </div>
    </div>
  )
}