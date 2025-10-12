import { db } from '../firebase'
import { collection, getDocs, query, where, doc, setDoc, updateDoc, deleteDoc, addDoc, getDoc } from 'firebase/firestore'

if (!db) {
  console.warn('Firestore not initialized — db functions will throw if called')
}

// Utility function to normalize team names for use as document IDs
function normalizeTeamName(name) {
  // Greek to Latin character mapping
  const greekToLatin = {
    'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z', 'η': 'i', 'θ': 'th',
    'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p',
    'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'y', 'φ': 'f', 'χ': 'ch', 'ψ': 'ps', 'ω': 'o',
    'Α': 'A', 'Β': 'B', 'Γ': 'G', 'Δ': 'D', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'I', 'Θ': 'TH',
    'Ι': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M', 'Ν': 'N', 'Ξ': 'X', 'Ο': 'O', 'Π': 'P',
    'Ρ': 'R', 'Σ': 'S', 'Τ': 'T', 'Υ': 'Y', 'Φ': 'F', 'Χ': 'CH', 'Ψ': 'PS', 'Ω': 'O'
  }
  
  return name
    .trim()
    // Replace Greek characters with Latin equivalents
    .replace(/[α-ωΑ-Ω]/g, (char) => greekToLatin[char] || char)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and dashes
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-|-$/g, '') // Remove leading/trailing dashes
}

export async function createTeam(data) {
  if (!db) throw new Error('Firestore not initialized')
  
  // Generate document ID from team name
  const teamId = normalizeTeamName(data.name)
  if (!teamId) {
    throw new Error('Team name is required and must contain valid characters')
  }
  
  const teamData = {
    ...data,
    createdAt: new Date().toISOString(),
    members: [],
    players: []
  }
  
  // Use setDoc with custom ID instead of addDoc
  const teamDoc = doc(db, 'teams', teamId)
  await setDoc(teamDoc, teamData)
  return { id: teamId, ...teamData }
}

export async function updateTeam(teamId, data) {
  if (!db) throw new Error('Firestore not initialized')
  const teamDoc = doc(db, 'teams', teamId)
  const updateData = {
    ...data,
    updatedAt: new Date().toISOString()
  }
  await updateDoc(teamDoc, updateData)
  return { id: teamId, ...updateData }
}

export async function deleteTeam(teamId) {
  if (!db) throw new Error('Firestore not initialized')
  
  try {
    // First, get all players that belong to this team
    const playersInTeam = await getPlayersByTeam(teamId)
    
    // Update each player to remove this teamId from their teamIds array
    const updatePromises = playersInTeam.map(player => {
      const updatedTeamIds = player.teamIds.filter(id => id !== teamId)
      return updatePlayer(player.id, { teamIds: updatedTeamIds })
    })
    
    // Wait for all player updates to complete
    await Promise.all(updatePromises)
    
    // Finally, delete the team document
    const teamDoc = doc(db, 'teams', teamId)
    await deleteDoc(teamDoc)
    
    return { id: teamId, playersUpdated: playersInTeam.length }
  } catch (error) {
    console.error('Error deleting team and updating players:', error)
    throw error
  }
}

export async function getTeamsByCoach(coachId) {
  if (!db) throw new Error('Firestore not initialized')
  const col = collection(db, 'teams')
  const q = query(col, where('coachIds', 'array-contains', coachId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function createUserDocument(userId, userData) {
  if (!db) throw new Error('Firestore not initialized')
  const userDoc = doc(db, 'users', userId)
  await setDoc(userDoc, userData)
  return { id: userId, ...userData }
}

/**
 * Get all users (for user assignment dropdown)
 * @param {string} excludeUserId - User ID to exclude from results (optional)
 */
export async function getAllUsers(excludeUserId = null) {
  if (!db) throw new Error('Firestore not initialized')
  
  const col = collection(db, 'users')
  const snap = await getDocs(col)
  const users = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  
  // Filter out the excluded user if provided
  return excludeUserId ? users.filter(user => user.id !== excludeUserId) : users
}

// ==========================================
// PLAYER MANAGEMENT FUNCTIONS
// ==========================================

/**
 * Create a new player
 * @param {Object} data - Player data
 * @param {string} data.name - Player name
 * @param {string} data.dateOfBirth - Birth date (YYYY-MM-DD)
 * @param {string[]} data.teamIds - Array of team IDs
 * @param {string|null} data.userId - Assigned user ID (nullable)
 * @param {string} data.parentName - Parent name (if userId is null)
 * @param {string} data.parentEmail - Parent email (if userId is null)
 * @param {number|null} data.jersey_number - Jersey number (nullable)
 * @param {string|null} data.position - Player position (nullable)
 * @param {string} data.createdBy - Coach user ID who created the player
 */
export async function createPlayer(data) {
  if (!db) throw new Error('Firestore not initialized')
  
  const playerData = {
    name: data.name,
    dateOfBirth: data.dateOfBirth,
    teamIds: data.teamIds || [],
    userId: data.userId || null,
    parentName: data.parentName || null,
    parentEmail: data.parentEmail || null,
    jersey_number: data.jersey_number || null,
    position: data.position || null,
    createdBy: data.createdBy,
    createdAt: new Date().toISOString()
  }
  
  const col = collection(db, 'players')
  const ref = await addDoc(col, playerData)
  return { id: ref.id, ...playerData }
}

/**
 * Update an existing player
 * @param {string} playerId - Player document ID
 * @param {Object} data - Updated player data
 */
export async function updatePlayer(playerId, data) {
  if (!db) throw new Error('Firestore not initialized')
  
  const playerDoc = doc(db, 'players', playerId)
  const updateData = {
    ...data,
    updatedAt: new Date().toISOString()
  }
  
  await updateDoc(playerDoc, updateData)
  return { id: playerId, ...updateData }
}

/**
 * Delete a player
 * @param {string} playerId - Player document ID
 */
export async function deletePlayer(playerId) {
  if (!db) throw new Error('Firestore not initialized')
  
  const playerDoc = doc(db, 'players', playerId)
  await deleteDoc(playerDoc)
  return { id: playerId }
}

/**
 * Get all players for a specific team
 * @param {string} teamId - Team ID
 */
export async function getPlayersByTeam(teamId) {
  if (!db) throw new Error('Firestore not initialized')
  
  const col = collection(db, 'players')
  const q = query(col, where('teamIds', 'array-contains', teamId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/**
 * Get all players assigned to a specific user account (for parent dashboard)
 * @param {string} userId - User account ID
 */
export async function getPlayersByUser(userId) {
  if (!db) throw new Error('Firestore not initialized')
  
  const col = collection(db, 'players')
  const q = query(col, where('userId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/**
 * Get all players created by a specific coach
 * @param {string} coachId - Coach user ID
 */
export async function getPlayersByCoach(coachId) {
  if (!db) throw new Error('Firestore not initialized')
  
  const col = collection(db, 'players')
  const q = query(col, where('createdBy', '==', coachId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/**
 * Assign a player to a user account
 * @param {string} playerId - Player document ID
 * @param {string} userId - User account ID to assign
 */
export async function assignPlayerToUser(playerId, userId) {
  if (!db) throw new Error('Firestore not initialized')
  
  return updatePlayer(playerId, {
    userId: userId,
    parentName: null, // Clear parent info when assigned to user
    parentEmail: null
  })
}

/**
 * Unassign a player from user account (convert back to parent info)
 * @param {string} playerId - Player document ID
 * @param {string} parentName - Parent name
 * @param {string} parentEmail - Parent email
 */
export async function unassignPlayerFromUser(playerId, parentName, parentEmail) {
  if (!db) throw new Error('Firestore not initialized')
  
  return updatePlayer(playerId, {
    userId: null,
    parentName: parentName,
    parentEmail: parentEmail
  })
}

/**
 * Get all players from the database
 * @returns {Promise<Array>} Array of all players
 */
export async function getAllPlayers() {
  if (!db) throw new Error('Firestore not initialized')
  
  const playersRef = collection(db, 'players')
  const snapshot = await getDocs(playersRef)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

/**
 * Get all teams from the database
 * @returns {Promise<Array>} Array of all teams
 */
export async function getAllTeams() {
  if (!db) throw new Error('Firestore not initialized')
  
  const teamsRef = collection(db, 'teams')
  const snapshot = await getDocs(teamsRef)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

/**
 * Get a specific team by ID
 * @param {string} teamId - The team ID
 * @returns {Promise<Object|null>} Team data or null if not found
 */
export async function getTeamById(teamId) {
  if (!db) throw new Error('Firestore not initialized')
  
  const teamRef = doc(db, 'teams', teamId)
  const teamDoc = await getDoc(teamRef)
  
  if (teamDoc.exists()) {
    return {
      id: teamDoc.id,
      ...teamDoc.data()
    }
  }
  return null
}

/**
 * Get teams visible to a parent (teams where they have assigned players)
 * @param {string} parentUserId - The parent's user ID
 * @returns {Promise<Array>} Array of teams where parent has players
 */
export async function getTeamsForParent(parentUserId) {
  if (!db) throw new Error('Firestore not initialized')
  
  // First get all players assigned to this parent
  const players = await getPlayersByUser(parentUserId)
  
  // Get unique team IDs from all their players
  const teamIds = new Set()
  players.forEach(player => {
    if (player.teamIds && Array.isArray(player.teamIds)) {
      player.teamIds.forEach(teamId => teamIds.add(teamId))
    }
  })
  
  // If no teams found, return empty array
  if (teamIds.size === 0) {
    return []
  }
  
  // Get team details for each team ID
  const teams = []
  const teamsRef = collection(db, 'teams')
  
  for (const teamId of teamIds) {
    const teamQuery = query(teamsRef, where('__name__', '==', teamId))
    const snapshot = await getDocs(teamQuery)
    snapshot.docs.forEach(doc => {
      teams.push({
        id: doc.id,
        ...doc.data()
      })
    })
  }
  
  return teams
}