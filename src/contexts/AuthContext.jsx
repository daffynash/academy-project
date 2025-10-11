import { useEffect, useState } from 'react'
import AuthContext from './context'
import { auth, db } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore
        try {
          if (db) {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
            if (userDoc.exists()) {
              // Merge Firebase Auth user with Firestore data
              setUser({
                ...firebaseUser,
                ...userDoc.data()
              })
            } else {
              setUser(firebaseUser)
            }
          } else {
            setUser(firebaseUser)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUser(firebaseUser)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

