import { auth } from '../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'

export async function signup(email, password) {
  if (!auth) throw new Error('Firebase not initialized')
  const userCred = await createUserWithEmailAndPassword(auth, email, password)
  return userCred.user
}

export async function login(email, password) {
  if (!auth) throw new Error('Firebase not initialized')
  const userCred = await signInWithEmailAndPassword(auth, email, password)
  return userCred.user
}

export async function logout() {
  if (!auth) throw new Error('Firebase not initialized')
  await firebaseSignOut(auth)
}

// Export signOut as an alias for logout for compatibility
export const signOut = logout
