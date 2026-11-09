'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '../contexts/UserContext';
import CompanyManager from '../components/admin/CompanyManager';
import RoleManager from '../components/admin/RoleManager';
import Calendar from '../admin/calendar/page';

export default function AdminPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'companies';
  const [activeTab, setActiveTab] = useState(initialTab);
  const { userProfile } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not admin
    if (!userProfile?.isAdmin) {
      router.push('/');
    }
  }, [userProfile, router]);

  // Update active tab when URL parameter changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (!userProfile?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Admin Dashboard</h1>
        
        <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => {
                setActiveTab('companies');
                router.push('/admin?tab=companies');
              }}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'companies'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white bg-opacity-50 text-gray-800'
              }`}
            >
              Companies
            </button>
            <button
              onClick={() => {
                setActiveTab('calendar');
                router.push('/admin?tab=calendar');
              }}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'calendar'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white bg-opacity-50 text-gray-800'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => {
                setActiveTab('roles');
                router.push('/admin?tab=roles');
              }}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'roles'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white bg-opacity-50 text-gray-800'
              }`}
            >
              Roles
            </button>
          </div>

          {activeTab === 'companies' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-white mb-4">Manage Companies</h2>
              <CompanyManager />
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-white mb-4">Manage Calendar</h2>
              <Calendar />
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-white mb-4">Manage Roles</h2>
              <RoleManager />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
