import { useState } from 'react'
import { createTeam } from '../services/db'

export default function CreateTeamModal({ isOpen, onClose, onTeamCreated, userId }) {
  const [teamName, setTeamName] = useState('')
  const [description, setDescription] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!teamName.trim()) {
      setError('Team name is required')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      
      const teamData = {
        name: teamName.trim(),
        description: description.trim(),
        ageGroup: ageGroup || 'Open',
        coachIds: [userId],
        createdBy: userId
      }
      
      const newTeam = await createTeam(teamData)
      
      // Reset form
      setTeamName('')
      setDescription('')
      setAgeGroup('')
      
      // Notify parent component
      onTeamCreated(newTeam)
      onClose()
      
    } catch (error) {
      console.error('Error creating team:', error)
      setError('Failed to create team. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setTeamName('')
    setDescription('')
    setAgeGroup('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-slideDown">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-primary-700 dark:from-white dark:to-primary-300 bg-clip-text text-transparent">
            Create New Team
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
          <div>
            <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Team Name *
            </label>
            <input
              id="teamName"
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
              placeholder="π.χ. Κ12 Αετοί, Ανδρική Ομάδα"
            />
          </div>

          <div>
            <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Age Group
            </label>
            <select
              id="ageGroup"
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
            >
              <option value="">Επιλέξτε ηλικιακή κατηγορία</option>
              <option value="U6">Κάτω των 6</option>
              <option value="U8">Κάτω των 8</option>
              <option value="U10">Κάτω των 10</option>
              <option value="U12">Κάτω των 12</option>
              <option value="U14">Κάτω των 14</option>
              <option value="U16">Κάτω των 16</option>
              <option value="U18">Κάτω των 18</option>
              <option value="Senior">Ανδρική/Γυναικεία</option>
              <option value="Open">Ανοιχτή</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 resize-none"
              placeholder="Σύντομη περιγραφή της ομάδας..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isSubmitting ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}