import { db } from '../firebase'
import { collection, getDocs, query, where, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'

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
  const teamDoc = doc(db, 'teams', teamId)
  await deleteDoc(teamDoc)
  return { id: teamId }
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