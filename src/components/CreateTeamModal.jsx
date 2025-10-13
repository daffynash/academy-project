import { useState, useEffect } from 'react'
import { createTeam, updateTeam } from '../services/db'

export default function CreateTeamModal({ isOpen, onClose, onTeamCreated, userId, teamToEdit = null }) {
  const [ageGroup, setAgeGroup] = useState('')
  const [groupName, setGroupName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isEditMode = !!teamToEdit

  // Populate form when editing
  useEffect(() => {
    if (teamToEdit) {
      setAgeGroup(teamToEdit.ageGroup || '')
      setGroupName(teamToEdit.groupName || '')
      setDescription(teamToEdit.description || '')
    } else {
      setAgeGroup('')
      setGroupName('')
      setDescription('')
    }
  }, [teamToEdit])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!ageGroup) {
      setError('Το ηλικιακό γκρουπ είναι υποχρεωτικό')
      return
    }

    if (!groupName.trim()) {
      setError('Το όνομα γκρουπ είναι υποχρεωτικό')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      
      // Create team name by combining age group and group name
      const teamName = `${ageGroup}-${groupName.trim()}`
      
      const teamData = {
        name: teamName,
        description: description.trim(),
        ageGroup: ageGroup,
        groupName: groupName.trim(),
      }

      if (isEditMode) {
        // Update existing team
        await updateTeam(teamToEdit.id, teamData)
        const updatedTeam = { ...teamToEdit, ...teamData }
        onTeamCreated(updatedTeam)
      } else {
        // Create new team
        teamData.coachIds = [userId]
        teamData.createdBy = userId
        const newTeam = await createTeam(teamData)
        onTeamCreated(newTeam)
      }
      
      // Reset form
      setAgeGroup('')
      setGroupName('')
      setDescription('')
      
      onClose()
      
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} team:`, error)
      setError(`Αποτυχία ${isEditMode ? 'ενημέρωσης' : 'δημιουργίας'} ομάδας. Παρακαλώ δοκιμάστε ξανά.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setAgeGroup('')
    setGroupName('')
    setDescription('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-slideDown">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-primary-700 dark:from-white dark:to-primary-300 bg-clip-text text-transparent">
            {isEditMode ? 'Επεξεργασία Ομάδας' : 'Δημιουργία Νέας Ομάδας'}
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
            <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ηλικιακό Γκρουπ *
            </label>
            <select
              id="ageGroup"
              required
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              disabled={isEditMode}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 ${
                isEditMode ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''
              }`}
            >
              <option value="">Επιλέξτε ηλικιακό γκρουπ</option>
              <option value="Κ6">Κ6</option>
              <option value="Κ8">Κ8</option>
              <option value="Κ10">Κ10</option>
              <option value="Κ12">Κ12</option>
              <option value="Κ14">Κ14</option>
              <option value="Κ16">Κ16</option>
              <option value="Κ18">Κ18</option>
              <option value="Ανδρική Ομάδα">Ανδρική Ομάδα</option>
              <option value="Unassigned">Unassigned</option>
            </select>
            {isEditMode && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 flex items-center">
                <svg className="h-3.5 w-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Το ηλικιακό γκρουπ δεν μπορεί να αλλάξει (συνδέεται με το ID της ομάδας)
              </p>
            )}
          </div>

          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Όνομα Γκρουπ *
            </label>
            <input
              id="groupName"
              type="text"
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              disabled={isEditMode}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 ${
                isEditMode ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''
              }`}
              placeholder="π.χ. Α, Β, Γ"
            />
            {isEditMode ? (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 flex items-center">
                <svg className="h-3.5 w-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Το όνομα γκρουπ δεν μπορεί να αλλάξει (συνδέεται με το ID της ομάδας)
              </p>
            ) : (
              <>
                <p className="mt-1 text-xs text-gray-800 dark:text-gray-400">
                  Εισάγετε το όνομα του γκρουπ <span className="italic text-gray-500 dark:text-gray-300">(συνήθως Α, Β, Γ).</span>
                </p>
                <p className="text-red-500 text-sm underline">Το ηλικιακό γκρουπ θα προστεθεί αυτόματα</p>
              </>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Περιγραφή/Σχόλια
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
              Ακύρωση
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isSubmitting 
                ? (isEditMode ? 'Αποθήκευση...' : 'Δημιουργία...') 
                : (isEditMode ? 'Αποθήκευση Αλλαγών' : 'Δημιουργία Ομάδας')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}