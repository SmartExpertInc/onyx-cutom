"use client";

import React, { useState } from 'react';
import { Users, BarChart3, Settings, ChevronRight } from 'lucide-react';
import CreditsTab from './components/CreditsTab';
import AnalyticsTab from './components/AnalyticsTab';
import FeaturesTab from './components/FeaturesTab';

type TabType = 'credits' | 'analytics' | 'features';

const AdminMainPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('credits');

  const tabs = [
    {
      id: 'credits' as TabType,
      name: 'Credits',
      icon: Users,
      description: 'Manage user credits and monitor usage'
    },
    {
      id: 'analytics' as TabType,
      name: 'Analytics',
      icon: BarChart3,
      description: 'View system analytics and performance metrics'
    },
    {
      id: 'features' as TabType,
      name: 'Features',
      icon: Settings,
      description: 'Manage user feature flags and permissions'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'credits':
        return <CreditsTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'features':
        return <FeaturesTab />;
      default:
        return <CreditsTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <span>Admin</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Main Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage user credits, view analytics, and control feature access
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                      ${isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminMainPage; 