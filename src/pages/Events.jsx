import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllEvents, deleteEvent, EVENT_TYPES, EVENT_STATUS } from '../services/events'
import { getAllTeams, getPlayersByUser } from '../services/db'
import useAuth from '../contexts/useAuth'
import CreateEventModal from '../components/CreateEventModal'
import AttendanceModal from '../components/AttendanceModal'
import AttendanceViewModal from '../components/AttendanceViewModal'
import EventDetailModal from '../components/EventDetailModal'
import EventCard from '../components/EventCard'

export default function Events() {
  const { user, loading } = useAuth()
  const [events, setEvents] = useState([])
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEventDetailModal, setShowEventDetailModal] = useState(false)
  const [eventToDelete, setEventToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [showAttendanceViewModal, setShowAttendanceViewModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  
  // Filters
  const [filterType, setFilterType] = useState('all')
  const [filterTeam, setFilterTeam] = useState('all')
  const [filterStatus, setFilterStatus] = useState('active') // 'active' = scheduled+in-progress by default
  const [searchQuery, setSearchQuery] = useState('')
  const [displayCount, setDisplayCount] = useState(9) // For pagination

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Load all events and teams
        const [allEvents, allTeams] = await Promise.all([
          getAllEvents(),
          getAllTeams()
        ])
        
        setEvents(allEvents)
        setTeams(allTeams)

        // For parent users, also load their players to filter events by participantIds
        if (user.role === 'parent') {
          const userPlayers = await getPlayersByUser(user.uid)
          setPlayers(userPlayers)
        }
      } catch (error) {
        console.error('Error loading events:', error)
        setEvents([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user])

  // Filter events based on selected filters
  const filteredEvents = events.filter(event => {
    // For parent users, only show events where their children are participants
    if (user?.role === 'parent') {
      const childPlayerIds = players.map(player => player.id)
      const hasParticipatingChild = event.participantIds && 
        event.participantIds.some(participantId => childPlayerIds.includes(participantId))
      if (!hasParticipatingChild) return false
    }
    
    // Type filter
    if (filterType !== 'all' && event.type !== filterType) return false
    
    // Team filter
    if (filterTeam !== 'all' && !event.teamIds.includes(filterTeam)) return false
    
    // Status filter
    if (filterStatus === 'active') {
      // Show only scheduled and in-progress
      if (!['scheduled', 'in-progress'].includes(event.status)) return false
    } else if (filterStatus !== 'all') {
      // Show only selected status
      if (event.status !== filterStatus) return false
    }
    
    // Search query
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    
    return true
  })

  // Group events by week for list view (only show first 9-10)
  const paginatedEvents = filteredEvents.slice(0, displayCount)
  
  const getWeekStartDate = (date) => {
    const d = new Date(date)
    const day = d.getDay() // 0 = Sunday, 1 = Monday, etc.
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday
    return new Date(d.setDate(diff))
  }
  
  const formatWeekRange = (startDate) => {
    const start = getWeekStartDate(startDate)
    const end = new Date(start)
    end.setDate(end.getDate() + 6) // Sunday
    
    const startFormatted = start.toLocaleDateString('el-GR', { day: 'numeric', month: 'short' })
    const endFormatted = end.toLocaleDateString('el-GR', { day: 'numeric', month: 'short', year: 'numeric' })
    
    return `${startFormatted} - ${endFormatted}`
  }
  
  const groupedEvents = paginatedEvents.reduce((groups, event) => {
    const weekStart = getWeekStartDate(event.startDate)
    const weekKey = weekStart.toISOString().split('T')[0] // Use ISO date as key
    const weekLabel = formatWeekRange(event.startDate)
    
    if (!groups[weekKey]) {
      groups[weekKey] = {
        label: weekLabel,
        events: [],
        startDate: weekStart
      }
    }
    groups[weekKey].events.push(event)
    return groups
  }, {})

  const handleDeleteClick = (event) => {
    setEventToDelete(event)
  }

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return
    
    try {
      setIsDeleting(true)
      await deleteEvent(eventToDelete.id)
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventToDelete.id))
      setEventToDelete(null)
    } catch (error) {
      console.error('Error deleting event:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setEventToDelete(null)
  }

  const handleAttendanceClick = (event) => {
    setSelectedEvent(event)
    setShowAttendanceModal(true)
  }

  const handleAttendanceViewClick = (event) => {
    setSelectedEvent(event)
    setShowAttendanceViewModal(true)
  }

  const handleEventCardClick = (event) => {
    // This is for parent users to open the modal
    setSelectedEvent(event)
    setShowEventDetailModal(true)
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
                <span className="absolute inset-0 bg-primary-500/20 dark:bg-primary-400/20 scale-0 group-hover:scale-100 rounded-xl transition-transform duration-300"></span>
                <svg className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-all duration-200 group-hover:-translate-x-0.5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 shadow-lg">
                <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-700 dark:from-white dark:to-primary-300 bg-clip-text text-transparent">Events</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Προπονήσεις, αγώνες και εκδηλώσεις</p>
              </div>
            </div>
            {/* Show create button only for coaches and superadmins */}
            {(user.role === 'coach' || user.role === 'superadmin') && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 overflow-hidden animate-scaleIn"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center space-x-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Νέο Event</span>
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Search Bar */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Αναζήτηση events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Type Filter */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Τύπος</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Όλα</option>
              {Object.entries(EVENT_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Team Filter */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ομάδα</label>
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Όλες</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Κατάσταση</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="active">Σε εξέλιξη ή Προγραμματισμένα</option>
              <option value="all">Όλα</option>
              {Object.entries(EVENT_STATUS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {filteredEvents.length === 0 ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Κανένα Event</h3>
            <p className="text-gray-500 dark:text-gray-400">Δημιουργήστε το πρώτο σας event για να ξεκινήσετε</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedEvents).map(([weekKey, weekData]) => (
              <div key={weekKey} className="space-y-4">
                {/* Week Header */}
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <svg className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{weekData.label}</span>
                </h2>

                {/* Events for this week */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {weekData.events.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      teams={teams}
                      user={user}
                      onAttendanceClick={handleAttendanceClick}
                      onAttendanceViewClick={handleAttendanceViewClick}
                      onEventCardClick={handleEventCardClick}
                      onDeleteClick={handleDeleteClick}
                      showDeleteButton={true}
                      compact={false}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredEvents.length > displayCount && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setDisplayCount(prev => prev + 9)}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-colors"
            >
              Φόρτωση περισσότερων ({filteredEvents.length - displayCount} απομένουν)
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Διαγραφή Event</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Αυτή η ενέργεια δεν μπορεί να αναιρεθεί</p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Είστε σίγουροι ότι θέλετε να διαγράψετε το event <span className="font-semibold">"{eventToDelete.title}"</span>;
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors disabled:opacity-50"
              >
                Ακύρωση
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Διαγραφή...</span>
                  </>
                ) : (
                  <span>Διαγραφή</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={(newEvent) => {
          setEvents(prev => [newEvent, ...prev])
        }}
      />

      {/* Attendance Modal for Parents */}
      <AttendanceModal
        isOpen={showAttendanceModal}
        onClose={() => {
          setShowAttendanceModal(false)
          setSelectedEvent(null)
        }}
        event={selectedEvent}
        userPlayers={players.filter(player => 
          selectedEvent?.participantIds?.includes(player.id)
        )}
        onAttendanceSubmitted={() => {
          // Could refresh events or show success message
        }}
      />

      {/* Attendance View Modal for Coaches/Admins */}
      <AttendanceViewModal
        isOpen={showAttendanceViewModal}
        onClose={() => {
          setShowAttendanceViewModal(false)
          setSelectedEvent(null)
        }}
        event={selectedEvent}
      />

      {/* Event Detail Modal for Parents */}
      <EventDetailModal
        isOpen={showEventDetailModal}
        onClose={() => {
          setShowEventDetailModal(false)
          setSelectedEvent(null)
        }}
        event={selectedEvent}
      />
    </div>
  )
}