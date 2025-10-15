import { EVENT_TYPES, EVENT_STATUS } from '../services/events'
import { academyConfig } from '../config/academy'

export default function EventCard({
  event,
  teams,
  user,
  onAttendanceClick,
  onAttendanceViewClick,
  onDeleteClick,
  showDeleteButton = false,
  compact = false
}) {
  // Get event type color
  const getEventTypeColor = (type) => {
    switch (type) {
      case 'training':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'match':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      case 'event':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'completed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const team = teams.find(t => t.id === event.teamIds[0])
  const teamName = team?.name || 'Ομάδα'

  return (
    <div
      className={`group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700 overflow-hidden ${compact ? '' : ''}`}
    >
      <div className={`p-${compact ? '5' : '6'}`}>
        {/* Event Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                {EVENT_TYPES[event.type]}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                {EVENT_STATUS[event.status]}
              </span>
              {/* Team tag */}
              {event.teamIds.length > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  {teamName}
                </span>
              )}
            </div>
            <h3 className={`text-${compact ? 'lg' : 'lg'} font-bold text-gray-900 dark:text-white mb-1`}>
              {event.type === 'match' && event.opponent
                ? `${academyConfig.name} ${teamName} vs ${event.opponent}`
                : event.title
              }
            </h3>
          </div>
          {/* Show delete button only for coaches and superadmins */}
          {showDeleteButton && (user.role === 'coach' || user.role === 'superadmin') && (
            <button
              onClick={() => onDeleteClick(event)}
              className="ml-2 p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        {/* Event Details - Modern Compact Layout */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-${compact ? '2' : '3'} mt-4`}>
          {/* Date & Time - με πιο εμφανή ώρα */}
          <div className={`flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-${compact ? '2' : '3'} py-${compact ? '1.5' : '2'}`}>
            <svg className={`h-${compact ? '3.5' : '4'} w-${compact ? '3.5' : '4'} text-primary-600 dark:text-primary-400 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="min-w-0">
              <div className={`font-medium text-gray-900 dark:text-white ${compact ? 'text-xs' : ''}`}>
                {event.startDate.toLocaleDateString('el-GR', { weekday: 'long' })}
              </div>
              <div className={`${compact ? 'text-xs' : 'text-sm'} font-bold text-primary-600 dark:text-primary-400`}>
                {event.startDate.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>
              <div className={`${compact ? 'text-xs' : 'text-xs'} text-gray-500`}>
                {event.startDate.toLocaleDateString('el-GR', { day: 'numeric', month: 'short' })}
              </div>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className={`flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-${compact ? '2' : '3'} py-${compact ? '1.5' : '2'}`}>
              <svg className={`h-${compact ? '3.5' : '4'} w-${compact ? '3.5' : '4'} text-green-600 dark:text-green-400 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className={`truncate ${compact ? 'text-xs' : ''}`}>{event.location}</span>
            </div>
          )}

          {/* Participants Count */}
          <div className={`flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-${compact ? '2' : '3'} py-${compact ? '1.5' : '2'}`}>
            <svg className={`h-${compact ? '3.5' : '4'} w-${compact ? '3.5' : '4'} text-blue-600 dark:text-blue-400 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className={`${compact ? 'text-xs' : ''}`}>{event.participantIds?.length || 0} {event.participantIds?.length === 1 ? 'Παίκτης' : 'Παίκτες'}</span>
          </div>
        </div>

        {/* Attendance Actions */}
        <div className={`flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600`}>
          {user.role === 'parent' && (
            <button
              onClick={() => onAttendanceClick(event)}
              className={`px-${compact ? '3' : '4'} py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors ${compact ? 'text-sm' : ''} flex items-center space-x-${compact ? '1' : '2'}`}
            >
              <svg className={`h-${compact ? '3.5' : '4'} w-${compact ? '3.5' : '4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{compact ? 'Δήλωσε' : 'Δήλωσε Παρουσία'}</span>
            </button>
          )}
          {(user.role === 'coach' || user.role === 'superadmin') && (
            <button
              onClick={() => onAttendanceViewClick(event)}
              className={`px-${compact ? '3' : '4'} py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors ${compact ? 'text-sm' : ''} flex items-center space-x-${compact ? '1' : '2'}`}
            >
              <svg className={`h-${compact ? '3.5' : '4'} w-${compact ? '3.5' : '4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{compact ? 'Δηλώσεις' : 'Προβολή Δηλώσεων'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}