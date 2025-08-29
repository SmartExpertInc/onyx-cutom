"use client";

import React, { useState, useEffect } from 'react';
import { Toggle, Users, Settings, Search, RefreshCw, Save } from 'lucide-react';

interface UserFeatureFlags {
  onyx_user_id: string;
  name: string;
  feature_flags: Record<string, boolean>;
  updated_at: string;
}

interface FeatureFlag {
  name: string;
  displayName: string;
  description: string;
}

const FeaturesTab: React.FC = () => {
  const [users, setUsers] = useState<UserFeatureFlags[]>([]);
  const [availableFeatures, setAvailableFeatures] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkUpdateModal, setBulkUpdateModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkEnabled, setBulkEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

  const featureDefinitions: FeatureFlag[] = [
    {
      name: 'settings_modal',
      displayName: 'Settings Modal',
      description: 'Allow users to access advanced settings and configuration options'
    },
    {
      name: 'quality_tier_display',
      displayName: 'Quality Tier Display',
      description: 'Show quality tier options in the user interface'
    },
    {
      name: 'ai_image_generation',
      displayName: 'AI Image Generation',
      description: 'Enable AI-powered image generation features'
    },
    {
      name: 'advanced_editing',
      displayName: 'Advanced Editing',
      description: 'Provide advanced editing capabilities and tools'
    },
    {
      name: 'analytics_dashboard',
      displayName: 'Analytics Dashboard',
      description: 'Show analytics and usage statistics to users'
    },
    {
      name: 'custom_rates',
      displayName: 'Custom Rates',
      description: 'Allow users to set custom pricing rates'
    },
    {
      name: 'folder_management',
      displayName: 'Folder Management',
      description: 'Enable folder organization and management features'
    },
    {
      name: 'bulk_operations',
      displayName: 'Bulk Operations',
      description: 'Allow users to perform bulk actions on multiple items'
    }
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch users and their feature flags
      const usersResponse = await fetch(`${CUSTOM_BACKEND_URL}/admin/users/feature-flags`, {
        credentials: 'same-origin',
      });

      if (!usersResponse.ok) {
        throw new Error(`Failed to fetch users: ${usersResponse.status}`);
      }

      const usersData = await usersResponse.json();
      setUsers(usersData);
      setAvailableFeatures(featureDefinitions);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.onyx_user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFeatureToggle = async (userId: string, featureName: string, enabled: boolean) => {
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/admin/users/${encodeURIComponent(userId)}/feature-flags`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          feature_name: featureName,
          is_enabled: enabled
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update feature flag: ${response.status}`);
      }

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.onyx_user_id === userId 
            ? {
                ...user,
                feature_flags: {
                  ...user.feature_flags,
                  [featureName]: enabled
                }
              }
            : user
        )
      );
    } catch (err) {
      console.error('Error updating feature flag:', err);
      alert(err instanceof Error ? err.message : 'Failed to update feature flag');
    }
  };

  const openBulkUpdateModal = () => {
    setBulkUpdateModal(true);
    setSelectedFeature('');
    setSelectedUsers([]);
    setBulkEnabled(true);
  };

  const closeBulkUpdateModal = () => {
    setBulkUpdateModal(false);
  };

  const handleBulkUpdate = async () => {
    if (!selectedFeature || selectedUsers.length === 0) {
      alert('Please select a feature and at least one user');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/admin/users/feature-flags/bulk`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          feature_name: selectedFeature,
          user_emails: selectedUsers,
          is_enabled: bulkEnabled
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to bulk update: ${response.status}`);
      }

      const result = await response.json();
      alert(result.message);
      closeBulkUpdateModal();
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Error bulk updating:', err);
      alert(err instanceof Error ? err.message : 'Failed to bulk update');
    } finally {
      setSaving(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading feature flags...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Feature Flags Management</h2>
          <p className="text-gray-600">Control feature access for individual users</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openBulkUpdateModal}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Bulk Update
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Feature Flags Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                {availableFeatures.map(feature => (
                  <th key={feature.name} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex flex-col">
                      <span>{feature.displayName}</span>
                      <span className="text-xs text-gray-400 font-normal">{feature.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.onyx_user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.onyx_user_id}</div>
                    </div>
                  </td>
                  {availableFeatures.map(feature => (
                    <td key={feature.name} className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleFeatureToggle(
                          user.onyx_user_id, 
                          feature.name, 
                          !user.feature_flags[feature.name]
                        )}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          user.feature_flags[feature.name] ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            user.feature_flags[feature.name] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Update Modal */}
      {bulkUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Bulk Update Feature Flags</h3>
            
            <div className="space-y-4">
              {/* Feature Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Feature
                </label>
                <select
                  value={selectedFeature}
                  onChange={(e) => setSelectedFeature(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a feature...</option>
                  {availableFeatures.map(feature => (
                    <option key={feature.name} value={feature.name}>
                      {feature.displayName} - {feature.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Users ({selectedUsers.length} selected)
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {filteredUsers.map(user => (
                    <label key={user.onyx_user_id} className="flex items-center space-x-2 p-1 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.onyx_user_id)}
                        onChange={() => toggleUserSelection(user.onyx_user_id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">
                        {user.name} ({user.onyx_user_id})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Enable/Disable Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={bulkEnabled}
                      onChange={() => setBulkEnabled(true)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Enable</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={!bulkEnabled}
                      onChange={() => setBulkEnabled(false)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Disable</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={closeBulkUpdateModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpdate}
                disabled={saving || !selectedFeature || selectedUsers.length === 0}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update {selectedUsers.length} Users
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturesTab; 