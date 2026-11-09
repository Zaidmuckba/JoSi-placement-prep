import { FiMenu } from 'react-icons/fi'
import { useUser } from '../contexts/UserContext'

interface HeaderProps {
  onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { userProfile } = useUser()

  return (
    <header className="fixed top-0 left-0 right-0 bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg z-10">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <button 
          onClick={onMenuToggle} 
          className="text-white hover:text-gray-200 transition-colors duration-200"
          aria-label="Toggle menu"
        >
          <FiMenu size={24} />
        </button>
        <div className="text-white text-2xl font-bold">JoSi</div>
        {userProfile && (
          <div className="text-white">
            {userProfile.name || userProfile.email}
          </div>
        )}
      </div>
    </header>
  )
}
