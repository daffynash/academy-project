import { db } from '../firebase'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'

if (!db) {
  console.warn('Firestore not initialized — db functions will throw if called')
}

export async function createTeam(data) {
  if (!db) throw new Error('Firestore not initialized')
  const col = collection(db, 'teams')
  const ref = await addDoc(col, data)
  return { id: ref.id, ...data }
}

export async function getTeamsByCoach(coachId) {
  if (!db) throw new Error('Firestore not initialized')
  const col = collection(db, 'teams')
  const q = query(col, where('coachIds', 'array-contains', coachId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
