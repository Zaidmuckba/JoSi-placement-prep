'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '../contexts/UserContext'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { userProfile, loading } = useUser()

  useEffect(() => {
    if (!loading && (!userProfile || !userProfile.isAdmin)) {
      router.push('/')
    }
  }, [userProfile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  if (!userProfile?.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-900">
      {children}
    </div>
  )
}
