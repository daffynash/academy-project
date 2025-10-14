import { useState, useEffect } from 'react'
import { createEvent, updateEvent, EVENT_TYPES, EVENT_STATUS } from '../services/events'
import { getAllTeams } from '../services/db'
import useAuth from '../contexts/useAuth'

export default function CreateEventModal({ isOpen, onClose, onEventCreated, eventToEdit = null }) {
  const { user } = useAuth()
  const [teams, setTeams] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEditMode] = useState(!!eventToEdit)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'training',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    teamIds: [],
    opponent: '',
    status: 'scheduled'
  })

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

  // Populate form when editing
  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        title: eventToEdit.title || '',
        description: eventToEdit.description || '',
        type: eventToEdit.type || 'training',
        startDate: eventToEdit.startDate ? eventToEdit.startDate.toISOString().split('T')[0] : '',
        startTime: eventToEdit.startDate ? eventToEdit.startDate.toTimeString().slice(0, 5) : '',
        endDate: eventToEdit.endDate ? eventToEdit.endDate.toISOString().split('T')[0] : '',
        endTime: eventToEdit.endDate ? eventToEdit.endDate.toTimeString().slice(0, 5) : '',
        location: eventToEdit.location || '',
        teamIds: eventToEdit.teamIds || [],
        opponent: eventToEdit.opponent || '',
        status: eventToEdit.status || 'scheduled'
      })
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.title.trim()) {
      setError('Το όνομα είναι υποχρεωτικό')
      return
    }

    if (!formData.startDate || !formData.startTime) {
      setError('Η ημερομηνία και η ώρα έναρξης είναι υποχρεωτικές')
      return
    }

    try {
      setIsLoading(true)

      // Combine date and time into Date objects
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      let endDateTime = null
      if (formData.endDate && formData.endTime) {
        endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)
      }

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        startDate: startDateTime,
        endDate: endDateTime,
        location: formData.location.trim(),
        teamIds: formData.teamIds,
        opponent: formData.opponent.trim(),
        status: formData.status,
        createdBy: user.uid
      }

      let savedEvent
      if (isEditMode) {
        savedEvent = await updateEvent(eventToEdit.id, eventData)
        savedEvent = { ...eventToEdit, ...savedEvent }
      } else {
        savedEvent = await createEvent(eventData)
      }

      onEventCreated(savedEvent)
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
      title: '',
      description: '',
      type: 'training',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      location: '',
      teamIds: [],
      opponent: '',
      status: 'scheduled'
    })
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-scaleIn border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
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
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Τίτλος *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="π.χ. Προπόνηση U16"
                />
              </div>

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
                Περιγραφή
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Προαιρετική περιγραφή του event"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ημερομηνία Έναρξης *
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

              {/* Start Time */}
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

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ημερομηνία Λήξης
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ώρα Λήξης
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
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
                Ομάδες
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
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors disabled:opacity-50"
          >
            Ακύρωση
          </button>
          <button
            onClick={handleSubmit}
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
      </div>
    </div>
  )
}
