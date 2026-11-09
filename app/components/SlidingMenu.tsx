'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiX, 
  FiLogOut, 
  FiUser, 
  FiMessageSquare, 
  FiClock, 
  FiCalendar, 
  FiTool,
  FiUsers,
  FiBriefcase,
  FiSettings
} from 'react-icons/fi';
import { useUser } from '../contexts/UserContext';
import { useRouter } from 'next/navigation';

interface SlidingMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SlidingMenu({ isOpen, onClose }: SlidingMenuProps) {
  const [feedback, setFeedback] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const { userProfile, logout, userRole } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      onClose();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const emailSubject = encodeURIComponent('Feedback');
    const emailBody = encodeURIComponent(feedback);
    const mailtoLink = `mailto:radhika.tendulkar@xaviers.edu?subject=${emailSubject}&body=${emailBody}`;
    window.location.href = mailtoLink;
    setFeedback('');
    setShowFeedback(false);
  };

  const navigateTo = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <motion.div
      className="fixed top-0 left-0 bottom-0 w-64 bg-gradient-to-b from-purple-500 to-pink-500 shadow-lg z-20 overflow-y-auto"
      initial={{ x: '-100%' }}
      animate={{ x: isOpen ? 0 : '-100%' }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-200"
        >
          <FiX size={24} />
        </button>

        <div className="mt-8 space-y-4">
          {/* Profile Section */}
          <button
            onClick={() => setShowUserDetails(!showUserDetails)}
            className="flex items-center space-x-2 text-white hover:text-gray-200 w-full"
          >
            <FiUser size={20} />
            <span>Profile</span>
          </button>

          {/* Calendar Section */}
          <button
            onClick={() => navigateTo('/calendar')}
            className="flex items-center space-x-2 text-white hover:text-gray-200 w-full"
          >
            <FiCalendar size={20} />
            <span>Calendar</span>
          </button>

          {/* Tools Section */}
          <button
            onClick={() => navigateTo('/tools')}
            className="flex items-center space-x-2 text-white hover:text-gray-200 w-full"
          >
            <FiTool size={20} />
            <span>Productivity Tools</span>
          </button>

          {/* Admin Section */}
          {userRole === 'admin' && (
            <>
              <div className="border-t border-white border-opacity-20 my-4"></div>
              <div className="font-semibold mb-2">Admin Dashboard</div>
              <button
                onClick={() => navigateTo('/admin')}
                className="flex items-center space-x-2 text-white hover:text-gray-200 w-full pl-4"
              >
                <FiSettings size={20} />
                <span>Overview</span>
              </button>
              <button
                onClick={() => navigateTo('/admin?tab=companies')}
                className="flex items-center space-x-2 text-white hover:text-gray-200 w-full pl-4"
              >
                <FiBriefcase size={20} />
                <span>Companies</span>
              </button>
              <button
                onClick={() => navigateTo('/admin?tab=calendar')}
                className="flex items-center space-x-2 text-white hover:text-gray-200 w-full pl-4"
              >
                <FiCalendar size={20} />
                <span>Calendar</span>
              </button>
              <button
                onClick={() => navigateTo('/admin?tab=roles')}
                className="flex items-center space-x-2 text-white hover:text-gray-200 w-full pl-4"
              >
                <FiUsers size={20} />
                <span>Roles</span>
              </button>
            </>
          )}

          {/* History Section */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center space-x-2 text-white hover:text-gray-200 w-full"
          >
            <FiClock size={20} />
            <span>History</span>
          </button>

          {/* Feedback Section */}
          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className="flex items-center space-x-2 text-white hover:text-gray-200 w-full"
          >
            <FiMessageSquare size={20} />
            <span>Send Feedback</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-white hover:text-gray-200 w-full"
          >
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>

        {/* Feedback Form */}
        {showFeedback && (
          <form onSubmit={handleSendFeedback} className="mt-4">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full p-2 text-gray-800 rounded"
              rows={4}
              placeholder="Your feedback..."
            />
            <button
              type="submit"
              className="mt-2 px-4 py-2 bg-white text-purple-500 rounded hover:bg-gray-100"
            >
              Send
            </button>
          </form>
        )}

        {/* User Details */}
        {showUserDetails && userProfile && (
          <div className="mt-4 p-4 bg-white bg-opacity-10 rounded">
            <p>Name: {userProfile.name}</p>
            <p>Course: {userProfile.course}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
