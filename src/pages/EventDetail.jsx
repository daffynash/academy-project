import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getEventWithParticipants, EVENT_TYPES, EVENT_STATUS, updateEvent } from '../services/events'
import { getAllTeams } from '../services/db'
import useAuth from '../contexts/useAuth'

export default function EventDetail() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [event, setEvent] = useState(null)
  const [teams, setTeams] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Edit form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'training',
    status: 'scheduled',
    startDate: '',
    startTime: '',
    endTime: '',
    location: '',
    opponent: ''
  })

  useEffect(() => {
    if (!user) return
    if (user.role === 'parent') {
      // Parents should not access this page
      navigate('/events')
      return
    }

    const loadEventData = async () => {
      try {
        setIsLoading(true)
        const [eventData, allTeams] = await Promise.all([
          getEventWithParticipants(eventId),
          getAllTeams()
        ])

        if (!eventData) {
          setError('Event δεν βρέθηκε')
          return
        }

        setEvent(eventData)
        setTeams(allTeams)
        
        // Initialize form data from event
        const startDate = eventData.startDate instanceof Date ? eventData.startDate : new Date(eventData.startDate)
        const endDate = eventData.endDate instanceof Date ? eventData.endDate : new Date(eventData.endDate)
        
        setFormData({
          title: eventData.title,
          description: eventData.description || '',
          type: eventData.type,
          status: eventData.status,
          startDate: startDate.toISOString().split('T')[0],
          startTime: startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
          endTime: endDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
          location: eventData.location || '',
          opponent: eventData.opponent || ''
        })
      } catch (err) {
        console.error('Error loading event:', err)
        setError('Σφάλμα κατά τη φόρτωση του event')
      } finally {
        setIsLoading(false)
      }
    }

    loadEventData()
  }, [eventId, user, navigate])

  const handleSaveEvent = async () => {
    try {
      setIsSaving(true)
      
      // Parse date and time
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      const endDateTime = new Date(`${formData.startDate}T${formData.endTime}`)
      
      const updateData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        startDate: startDateTime,
        endDate: endDateTime,
        location: formData.location,
        opponent: formData.opponent
      }
      
      await updateEvent(eventId, updateData)
      
      // Update local state
      setEvent(prev => ({
        ...prev,
        ...updateData
      }))
      
      setIsEditMode(false)
    } catch (err) {
      console.error('Error saving event:', err)
      setError('Σφάλμα κατά την αποθήκευση του event')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (event) {
      // Revert form data to event state
      const startDate = event.startDate instanceof Date ? event.startDate : new Date(event.startDate)
      const endDate = event.endDate instanceof Date ? event.endDate : new Date(event.endDate)
      
      setFormData({
        title: event.title,
        description: event.description || '',
        type: event.type,
        status: event.status,
        startDate: startDate.toISOString().split('T')[0],
        startTime: startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
        endTime: endDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
        location: event.location || '',
        opponent: event.opponent || ''
      })
    }
    setIsEditMode(false)
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-gray-50 to-blue-100 dark:from-gray-900 dark:via-primary-900/10 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-gray-50 to-blue-100 dark:from-gray-900 dark:via-primary-900/10 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/events"
            className="inline-flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-6"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Πίσω στα Events</span>
          </Link>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-red-900 dark:text-red-100">{error}</h2>
          </div>
        </div>
      </div>
    )
  }

  const team = teams.find(t => t.id === event.teamIds[0])
  const presentCount = event.participants?.filter(p => p.attendanceStatus?.status === 'present').length || 0
  const absentCount = event.participants?.filter(p => p.attendanceStatus?.status === 'absent').length || 0
  const maybeCount = event.participants?.filter(p => p.attendanceStatus?.status === 'maybe').length || 0
  const undeclaredCount = (event.participants?.length || 0) - presentCount - absentCount - maybeCount

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-gray-50 to-blue-100 dark:from-gray-900 dark:via-primary-900/10 dark:to-gray-800 animate-fadeIn">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-b border-primary-100 dark:border-primary-800/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <Link
              to="/events"
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 group relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-primary-500/20 dark:bg-primary-400/20 scale-0 group-hover:scale-100 rounded-xl transition-transform duration-300"></span>
              <svg className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-all duration-200 group-hover:-translate-x-0.5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-700 dark:from-white dark:to-primary-300 bg-clip-text text-transparent">
                {isEditMode ? 'Επεξεργασία Event' : 'Λεπτομέρειες Event'}
              </h1>
            </div>
            {!isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="h-10 px-4 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 rounded-xl transition-transform duration-300"></span>
                <svg className="h-5 w-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEditMode ? (
          // Edit Form
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSaveEvent() }}>
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Τίτλος *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Περιγραφή</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              {/* Type and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Τύπος *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    {Object.entries(EVENT_TYPES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Κατάσταση *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    {Object.entries(EVENT_STATUS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Ημερομηνία *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Ώρα Έναρξης *</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Ώρα Λήξης *</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Τοποθεσία</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              {/* Opponent (for matches) */}
              {formData.type === 'match' && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Αντίπαλος</label>
                  <input
                    type="text"
                    value={formData.opponent}
                    onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors disabled:opacity-50"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Αποθήκευση...</span>
                    </>
                  ) : (
                    <span>Αποθήκευση</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          // View Mode
          <>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="space-y-6">
            {/* Title & Type */}
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  event.type === 'training'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : event.type === 'match'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                }`}>
                  {EVENT_TYPES[event.type]}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  event.status === 'scheduled'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : event.status === 'in-progress'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : event.status === 'completed'
                    ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {EVENT_STATUS[event.status]}
                </span>
                {team && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    {team.name}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h2>
              {event.description && (
                <p className="text-gray-600 dark:text-gray-400">{event.description}</p>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Date & Time */}
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Ημερομηνία & Ώρα</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {event.startDate.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  {event.startDate.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  {event.endDate && ` - ${event.endDate.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit', hour12: false })}`}
                </p>
              </div>

              {/* Location */}
              {event.location && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Τοποθεσία</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                    <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.location}</span>
                  </p>
                </div>
              )}

              {/* Opponent (for matches) */}
              {event.opponent && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Αντίπαλος</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{event.opponent}</p>
                </div>
              )}

              {/* Participants Summary */}
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Δηλώσεις Παρουσίας</p>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{presentCount}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Παρών</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">{absentCount}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Απουσία</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{maybeCount}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Ίσως</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-600 dark:text-gray-400">{undeclaredCount}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Χωρίς δήλωση</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Participants List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Συμμετέχοντες ({event.participants?.length || 0})</span>
          </h3>

          {event.participants && event.participants.length > 0 ? (
            <div className="space-y-2">
              {event.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {participant.name}
                    </p>
                    {participant.teamIds && participant.teamIds.length > 0 && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {teams
                          .filter(t => participant.teamIds.includes(t.id))
                          .map(t => t.name)
                          .join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Attendance Status */}
                  <div className="ml-4">
                    {participant.attendanceStatus ? (
                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                        participant.attendanceStatus.status === 'present'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : participant.attendanceStatus.status === 'absent'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        <span>{
                          participant.attendanceStatus.status === 'present'
                            ? '✓ Παρών'
                            : participant.attendanceStatus.status === 'absent'
                            ? '✗ Απουσία'
                            : '? Ίσως'
                        }</span>
                      </div>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                        Χωρίς δήλωση
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">Δεν υπάρχουν συμμετέχοντες σε αυτό το event</p>
            </div>
          )}
        </div>
        </>
        )}
      </main>
    </div>
  )
}