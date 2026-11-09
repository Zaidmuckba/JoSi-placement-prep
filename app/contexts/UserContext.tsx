'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth, db } from '../firebase/config'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

interface UserProfile {
  name: string
  uid?: string
  course: string
  company?: string
  role: string
  email: string
  isAdmin?: boolean
}

interface UserContextType {
  user: any
  userProfile: UserProfile | null
  loading: boolean
  logout: () => Promise<void>
  userRole: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>
  getUserProfile: () => Promise<UserProfile | null>
  setCourseCompanyAndRole: (course: string, company: string, role: string) => Promise<void>
}

const UserContext = createContext<UserContextType>({
  user: null,
  userProfile: null,
  loading: true,
  logout: async () => {},
  userRole: null,
  login: async () => {},
  signup: async () => {},
  updateProfile: async () => {},
  getUserProfile: async () => null,
  setCourseCompanyAndRole: async () => {}
})

export const useUser = () => useContext(UserContext)

const ADMIN_EMAIL = 'admin@josi.com'

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile
            setUserProfile(userData)
            setUserRole(userData.isAdmin ? 'admin' : 'student')
          } else {
            // Create user document if it doesn't exist
            const newUserData = {
              email: user.email || '',
              name: '',
              course: '',
              company: '',
              role: '',
              isAdmin: user.email === ADMIN_EMAIL
            }
            await setDoc(doc(db, 'users', user.uid), newUserData)
            setUserProfile(newUserData)
            setUserRole(newUserData.isAdmin ? 'admin' : 'student')
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      } else {
        setUserProfile(null)
        setUserRole(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
      
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        const newUserData = {
          email,
          name: email === ADMIN_EMAIL ? 'Admin' : '',
          course: '',
          company: '',
          role: email === ADMIN_EMAIL ? 'admin' : '',
          isAdmin: email === ADMIN_EMAIL
        }
        await setDoc(doc(db, 'users', userCredential.user.uid), newUserData)
      } else {
        // Update admin status if needed
        if (email === ADMIN_EMAIL && !userDoc.data().isAdmin) {
          await updateDoc(doc(db, 'users', userCredential.user.uid), {
            isAdmin: true,
            role: 'admin',
            name: 'Admin'
          })
        }
      }
    } catch (error) {
      console.error('Error during login:', error)
      throw error
    }
  }

  const signup = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        role: email === ADMIN_EMAIL ? 'admin' : '',
        name: email === ADMIN_EMAIL ? 'Admin' : '',
        course: '',
        company: '',
        isAdmin: email === ADMIN_EMAIL
      })
    } catch (error) {
      console.error('Error during signup:', error)
      throw error
    }
  }

  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in')
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, profile)
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, ...profile } : null)
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const setCourseCompanyAndRole = async (course: string, company: string, role: string) => {
    if (!user) throw new Error('No user logged in')
    try {
      const userRef = doc(db, 'users', user.uid)
      const updates = { course, company, role }
      await updateDoc(userRef, updates)
      setUserProfile(prev => prev ? { ...prev, ...updates } : null)
    } catch (error) {
      console.error('Error setting course, company and role:', error)
      throw error
    }
  }

  const getUserProfile = async () => {
    if (!user) return null
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile
      }
      return null
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setUserProfile(null)
      setUserRole(null)
    } catch (error) {
      console.error('Error during logout:', error)
      throw error
    }
  }

  return (
    <UserContext.Provider value={{ 
      user,
      userProfile, 
      loading,
      logout,
      userRole,
      login,
      signup,
      updateProfile,
      getUserProfile,
      setCourseCompanyAndRole
    }}>
      {children}
    </UserContext.Provider>
  )
}
