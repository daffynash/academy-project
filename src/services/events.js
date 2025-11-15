import { db } from '../firebase'
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc, 
  deleteField,
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore'

if (!db) {
  console.warn('Firestore not initialized — event functions will throw if called')
}

/**
 * Event Types:
 * - training: Προπόνηση
 * - match: Αγώνας
 * - event: Εκδήλωση/Event
 */

/**
 * Event Schema:
 * {
 *   id: string (auto-generated)
 *   title: string (required)
 *   description: string
 *   type: 'training' | 'match' | 'event' (required)
 *   startDate: Timestamp (required)
 *   endDate: Timestamp (optional)
 *   location: string
 *   teamIds: string[] (array of team IDs)
 *   participantIds: string[] (array of player IDs)
 *   status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
 *   createdBy: string (user ID)
 *   createdAt: Timestamp
 *   updatedAt: Timestamp
 *   notes: string (additional notes)
 *   opponent: string (for matches only)
 *   score: { home: number, away: number } (for completed matches)
 *   attendanceDeclarations: {
 *     [playerId: string]: {
 *       parentId: string
 *       status: 'present' | 'absent' | 'maybe'
 *       timestamp: Timestamp
 *       notes?: string
 *     }
 *   }
 * }
 */

// Create a new event
export async function createEvent(eventData) {
  if (!db) throw new Error('Firestore not initialized')
  
  const event = {
    ...eventData,
    startDate: Timestamp.fromDate(new Date(eventData.startDate)),
    endDate: eventData.endDate ? Timestamp.fromDate(new Date(eventData.endDate)) : null,
    status: eventData.status || 'scheduled',
    teamIds: eventData.teamIds || [],
    participantIds: eventData.participantIds || [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
  
  const eventsCol = collection(db, 'events')
  const docRef = await addDoc(eventsCol, event)
  
  return { id: docRef.id, ...event }
}

// Get all events
export async function getAllEvents() {
  if (!db) throw new Error('Firestore not initialized')
  
  const eventsCol = collection(db, 'events')
  const q = query(eventsCol, orderBy('startDate', 'desc'))
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    startDate: doc.data().startDate?.toDate(),
    endDate: doc.data().endDate?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  }))
}

// Get event by ID
export async function getEventById(eventId) {
  if (!db) throw new Error('Firestore not initialized')
  
  const eventDoc = doc(db, 'events', eventId)
  const snapshot = await getDoc(eventDoc)
  
  if (!snapshot.exists()) {
    throw new Error('Event not found')
  }
  
  return {
    id: snapshot.id,
    ...snapshot.data(),
    startDate: snapshot.data().startDate?.toDate(),
    endDate: snapshot.data().endDate?.toDate(),
    createdAt: snapshot.data().createdAt?.toDate(),
    updatedAt: snapshot.data().updatedAt?.toDate()
  }
}

// Get events by team
export async function getEventsByTeam(teamId) {
  if (!db) throw new Error('Firestore not initialized')
  
  const eventsCol = collection(db, 'events')
  const q = query(
    eventsCol,
    where('teamIds', 'array-contains', teamId),
    orderBy('startDate', 'desc')
  )
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    startDate: doc.data().startDate?.toDate(),
    endDate: doc.data().endDate?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  }))
}

// Get events by type
export async function getEventsByType(eventType) {
  if (!db) throw new Error('Firestore not initialized')
  
  const eventsCol = collection(db, 'events')
  const q = query(
    eventsCol,
    where('type', '==', eventType),
    orderBy('startDate', 'desc')
  )
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    startDate: doc.data().startDate?.toDate(),
    endDate: doc.data().endDate?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  }))
}

// Get events by date range
export async function getEventsByDateRange(startDate, endDate) {
  if (!db) throw new Error('Firestore not initialized')
  
  const eventsCol = collection(db, 'events')
  const q = query(
    eventsCol,
    where('startDate', '>=', Timestamp.fromDate(new Date(startDate))),
    where('startDate', '<=', Timestamp.fromDate(new Date(endDate))),
    orderBy('startDate', 'asc')
  )
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    startDate: doc.data().startDate?.toDate(),
    endDate: doc.data().endDate?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  }))
}

// Get upcoming events (future events only)
export async function getUpcomingEvents(limit = 10) {
  if (!db) throw new Error('Firestore not initialized')
  
  const eventsCol = collection(db, 'events')
  const now = Timestamp.now()
  
  // Simple query with only one inequality filter to avoid composite index requirement
  const q = query(
    eventsCol,
    where('startDate', '>=', now),
    orderBy('startDate', 'asc')
  )
  const snapshot = await getDocs(q)
  
  // Filter out cancelled events client-side
  const events = snapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      endDate: doc.data().endDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }))
    .filter(event => event.status !== 'cancelled')
  
  return events.slice(0, limit)
}

// Update event
export async function updateEvent(eventId, eventData) {
  if (!db) throw new Error('Firestore not initialized')
  
  const eventDoc = doc(db, 'events', eventId)
  
  const updateData = {
    ...eventData,
    updatedAt: Timestamp.now()
  }
  
  // Convert dates to Timestamps if provided
  if (eventData.startDate) {
    updateData.startDate = Timestamp.fromDate(new Date(eventData.startDate))
  }
  if (eventData.endDate) {
    updateData.endDate = Timestamp.fromDate(new Date(eventData.endDate))
  }
  
  await updateDoc(eventDoc, updateData)
  
  return { id: eventId, ...updateData }
}

// Delete event
export async function deleteEvent(eventId) {
  if (!db) throw new Error('Firestore not initialized')
  
  const eventDoc = doc(db, 'events', eventId)
  await deleteDoc(eventDoc)
  
  return { id: eventId }
}

// Update event status
export async function updateEventStatus(eventId, status) {
  if (!db) throw new Error('Firestore not initialized')
  
  const eventDoc = doc(db, 'events', eventId)
  await updateDoc(eventDoc, {
    status,
    updatedAt: Timestamp.now()
  })
  
  return { id: eventId, status }
}

// Add participant to event
export async function addParticipantToEvent(eventId, participantId) {
  if (!db) throw new Error('Firestore not initialized')
  
  const event = await getEventById(eventId)
  const updatedParticipants = [...new Set([...event.participantIds, participantId])]
  
  await updateEvent(eventId, { participantIds: updatedParticipants })
  
  return { id: eventId, participantIds: updatedParticipants }
}

// Remove participant from event
export async function removeParticipantFromEvent(eventId, participantId) {
  if (!db) throw new Error('Firestore not initialized')
  
  const event = await getEventById(eventId)
  const updatedParticipants = event.participantIds.filter(id => id !== participantId)
  
  await updateEvent(eventId, { participantIds: updatedParticipants })
  
  return { id: eventId, participantIds: updatedParticipants }
}

// Event type translations
export const EVENT_TYPES = {
  training: 'Προπόνηση',
  match: 'Αγώνας',
  event: 'Εκδήλωση'
}

// Event status translations
export const EVENT_STATUS = {
  scheduled: 'Προγραμματισμένο',
  'in-progress': 'Σε Εξέλιξη',
  completed: 'Ολοκληρωμένο',
  cancelled: 'Ακυρωμένο'
}

// Attendance status translations
export const ATTENDANCE_STATUS = {
  present: 'Παρών',
  absent: 'Απών',
  maybe: 'Ίσως'
}

// Submit attendance declaration for a player
export async function submitAttendanceDeclaration(eventId, playerId, parentId, status, notes = '') {
  if (!db) throw new Error('Firestore not initialized')

  const eventDoc = doc(db, 'events', eventId)
  const declaration = {
    parentId,
    status,
    timestamp: Timestamp.now(),
    notes: notes.trim()
  }

  await updateDoc(eventDoc, {
    [`attendanceDeclarations.${playerId}`]: declaration,
    updatedAt: Timestamp.now()
  })

  return { playerId, ...declaration }
}

// Get attendance declarations for an event
export async function getAttendanceDeclarations(eventId) {
  if (!db) throw new Error('Firestore not initialized')

  const event = await getEventById(eventId)
  return event.attendanceDeclarations || {}
}

// Update attendance declaration
export async function updateAttendanceDeclaration(eventId, playerId, status, notes = '') {
  if (!db) throw new Error('Firestore not initialized')

  const eventDoc = doc(db, 'events', eventId)
  const updateData = {
    [`attendanceDeclarations.${playerId}.status`]: status,
    [`attendanceDeclarations.${playerId}.timestamp`]: Timestamp.now(),
    updatedAt: Timestamp.now()
  }

  if (notes !== undefined) {
    updateData[`attendanceDeclarations.${playerId}.notes`] = notes.trim()
  }

  await updateDoc(eventDoc, updateData)

  return { playerId, status, notes, timestamp: Timestamp.now() }
}

// Delete attendance declaration
export async function deleteAttendanceDeclaration(eventId, playerId) {
  if (!db) throw new Error('Firestore not initialized')

  const eventDoc = doc(db, 'events', eventId)
  await updateDoc(eventDoc, {
    [`attendanceDeclarations.${playerId}`]: deleteField(),
    updatedAt: Timestamp.now()
  })

  return { playerId }
}

/**
 * Get event details with participant information
 * @param {string} eventId - Event ID
 * @returns {Promise<Object>} Event object with participant details and attendance info
 */
export async function getEventWithParticipants(eventId) {
  if (!db) throw new Error('Firestore not initialized')

  const eventDoc = doc(db, 'events', eventId)
  const eventSnapshot = await getDoc(eventDoc)

  if (!eventSnapshot.exists()) {
    return null
  }

  const eventData = {
    id: eventSnapshot.id,
    ...eventSnapshot.data()
  }

  // Convert Timestamps to Date objects
  if (eventData.startDate && typeof eventData.startDate.toDate === 'function') {
    eventData.startDate = eventData.startDate.toDate()
  }
  if (eventData.endDate && typeof eventData.endDate.toDate === 'function') {
    eventData.endDate = eventData.endDate.toDate()
  }
  if (eventData.createdAt && typeof eventData.createdAt.toDate === 'function') {
    eventData.createdAt = eventData.createdAt.toDate()
  }
  if (eventData.updatedAt && typeof eventData.updatedAt.toDate === 'function') {
    eventData.updatedAt = eventData.updatedAt.toDate()
  }

  // Fetch participant details if participantIds exist
  if (eventData.participantIds && eventData.participantIds.length > 0) {
    const participantsData = []

    for (const playerId of eventData.participantIds) {
      try {
        const playerDoc = doc(db, 'players', playerId)
        const playerSnapshot = await getDoc(playerDoc)
        if (playerSnapshot.exists()) {
          const playerData = {
            id: playerSnapshot.id,
            ...playerSnapshot.data()
          }
          // Add attendance declaration for this player if exists
          playerData.attendanceStatus = eventData.attendanceDeclarations?.[playerId] || null
          participantsData.push(playerData)
        }
      } catch (error) {
        console.error(`Error fetching player ${playerId}:`, error)
      }
    }

    eventData.participants = participantsData
  } else {
    eventData.participants = []
  }

  return eventData
}
