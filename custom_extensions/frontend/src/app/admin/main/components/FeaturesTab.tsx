"use client";

import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, ToggleLeft, ToggleRight, Users, Settings, Check, X } from 'lucide-react';

interface FeatureDefinition {
  id: number;
  feature_name: string;
  display_name: string;
  description: string | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
}

interface UserFeature {
  feature_name: string;
  display_name: string;
  description: string | null;
  category: string | null;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface UserWithFeatures {
  user_id: string;
  features: UserFeature[];
}

const FeaturesTab: React.FC = () => {
  const [users, setUsers] = useState<UserWithFeatures[]>([]);
  const [featureDefinitions, setFeatureDefinitions] = useState<FeatureDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkFeature, setBulkFeature] = useState('');
  const [bulkEnabled, setBulkEnabled] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, definitionsResponse] = await Promise.all([
        fetch(`${CUSTOM_BACKEND_URL}/admin/features/users`, {
          credentials: 'same-origin',
        }),
        fetch(`${CUSTOM_BACKEND_URL}/admin/features/definitions`, {
          credentials: 'same-origin',
        })
      ]);

      if (!usersResponse.ok || !definitionsResponse.ok) {
        throw new Error('Failed to fetch feature data');
      }

      const [usersData, definitionsData] = await Promise.all([
        usersResponse.json(),
        definitionsResponse.json()
      ]);

      setUsers(usersData);
      setFeatureDefinitions(definitionsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching feature data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch feature data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = users.filter(user =>
    user.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleFeature = async (userId: string, featureName: string, isEnabled: boolean) => {
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/admin/features/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          user_id: userId,
          feature_name: featureName,
          is_enabled: isEnabled
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle feature');
      }

      // Refresh data
      await fetchData();
    } catch (err) {
      console.error('Error toggling feature:', err);
      alert('Failed to toggle feature');
    }
  };

  const handleBulkToggle = async () => {
    if (!bulkFeature || selectedUsers.size === 0) {
      alert('Please select a feature and at least one user');
      return;
    }

    try {
      setBulkLoading(true);
      const response = await fetch(`${CUSTOM_BACKEND_URL}/admin/features/bulk-toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          user_ids: Array.from(selectedUsers),
          feature_name: bulkFeature,
          is_enabled: bulkEnabled
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to bulk toggle features');
      }

      const result = await response.json();
      alert(result.message);
      
      // Refresh data and reset selection
      await fetchData();
      setSelectedUsers(new Set());
      setShowBulkModal(false);
    } catch (err) {
      console.error('Error bulk toggling features:', err);
      alert('Failed to bulk toggle features');
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const getFeatureStatus = (user: UserWithFeatures, featureName: string) => {
    const feature = user.features.find(f => f.feature_name === featureName);
    return feature?.is_enabled || false;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading feature data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <button
            onClick={fetchData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={fetchData}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
        
        {selectedUsers.size > 0 && (
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            <Settings className="w-4 h-4 mr-2" />
            Bulk Operations ({selectedUsers.size} users)
          </button>
        )}
      </div>

      {/* Feature Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers(new Set(filteredUsers.map(u => u.user_id)));
                    } else {
                      setSelectedUsers(new Set());
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User ID
              </th>
              {featureDefinitions.map((feature) => (
                <th key={feature.feature_name} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex flex-col">
                    <span>{feature.display_name}</span>
                    <span className="text-xs text-gray-400 font-normal">{feature.category}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.user_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.user_id)}
                    onChange={() => toggleUserSelection(user.user_id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    {user.user_id}
                  </div>
                </td>
                {featureDefinitions.map((feature) => {
                  const isEnabled = getFeatureStatus(user, feature.feature_name);
                  return (
                    <td key={feature.feature_name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => handleToggleFeature(user.user_id, feature.feature_name, !isEnabled)}
                        className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          isEnabled
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {isEnabled ? (
                          <>
                            <ToggleRight className="w-3 h-3" />
                            <span>Enabled</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-3 h-3" />
                            <span>Disabled</span>
                          </>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk Operations Modal */}
      {showBulkModal && (
        <div 
          className="fixed inset-0 backdrop-blur-md bg-white bg-opacity-10 flex items-center justify-center p-4 z-50"
          onClick={() => setShowBulkModal(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Bulk Feature Operations
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedUsers.size} users selected
              </p>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feature
                </label>
                <select
                  value={bulkFeature}
                  onChange={(e) => setBulkFeature(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a feature...</option>
                  {featureDefinitions.map((feature) => (
                    <option key={feature.feature_name} value={feature.feature_name}>
                      {feature.display_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={bulkEnabled}
                      onChange={() => setBulkEnabled(true)}
                      className="mr-2"
                    />
                    <span className="text-sm">Enable</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!bulkEnabled}
                      onChange={() => setBulkEnabled(false)}
                      className="mr-2"
                    />
                    <span className="text-sm">Disable</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={bulkLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkToggle}
                disabled={bulkLoading || !bulkFeature}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  `${bulkEnabled ? 'Enable' : 'Disable'} for ${selectedUsers.size} users`
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