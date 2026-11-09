'use client'

import { useState } from 'react'
import { Header } from './components/Header'
import { SlidingMenu } from './components/SlidingMenu'
import { UserProvider } from './contexts/UserContext'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <UserProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-900">
        <Header onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} />
        <SlidingMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <main className="pt-16">{children}</main>
      </div>
    </UserProvider>
  )
}