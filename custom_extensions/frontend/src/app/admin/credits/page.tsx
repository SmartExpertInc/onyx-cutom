"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Minus, Users, Search, RefreshCw } from 'lucide-react';
import CreditsAdministrationTable from '../../../components/CreditsAdministrationTable';
import CreditUsagePieChart from '../../../components/CreditUsagePieChart';
import UserActivityTimeline from '../../../components/UserActivityTimeline';

interface UserCredits {
  id: number;
  onyx_user_id: string;
  name: string;
  credits_balance: number;
  total_credits_used: number;
  credits_purchased: number;
  last_purchase_date: string | null;
  subscription_tier: string;
  created_at: string;
  updated_at: string;
}

interface CreditTransaction {
  user_email: string;
  amount: number;
  action: 'add' | 'remove';
  reason: string;
}



const AdminCreditsPage: React.FC = () => {
  const [users, setUsers] = useState<UserCredits[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserCredits | null>(null);
  const [transaction, setTransaction] = useState<CreditTransaction>({
    user_email: '',
    amount: 0,
    action: 'add',
    reason: 'Admin adjustment'
  });
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);

  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${CUSTOM_BACKEND_URL}/admin/credits/users`, {
        credentials: 'same-origin',
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. You must be logged in as an admin in Onyx to access this page.');
        }
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const userData = await response.json();
      setUsers(userData);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.onyx_user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openTransactionModal = (user: UserCredits, action: 'add' | 'remove') => {
    setSelectedUser(user);
    setTransaction({
      user_email: user.onyx_user_id,
      amount: 0,
      action,
      reason: action === 'add' ? 'Credit purchase' : 'Admin adjustment'
    });
    setShowTransactionModal(true);
  };

  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    setSelectedUser(null);
    setTransaction({
      user_email: '',
      amount: 0,
      action: 'add',
      reason: 'Admin adjustment'
    });
  };

  const handleTransaction = async () => {
    if (!transaction.user_email || transaction.amount <= 0) {
      alert('Please enter a valid email and amount');
      return;
    }

    // Add confirmation for remove operations
    if (transaction.action === 'remove') {
      const confirmMessage = selectedUser 
        ? `Are you sure you want to remove ${transaction.amount} credits from ${selectedUser.name}? Current balance: ${selectedUser.credits_balance} credits.`
        : `Are you sure you want to remove ${transaction.amount} credits from ${transaction.user_email}?`;
      
      if (!confirm(confirmMessage)) {
        return;
      }
    }

    try {
      setTransactionLoading(true);
      const response = await fetch(`${CUSTOM_BACKEND_URL}/admin/credits/modify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(transaction),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to modify credits: ${response.status}`);
      }

      const result = await response.json();
      alert(result.message);
      
      // Refresh the users list
      await fetchUsers();
      closeTransactionModal();
    } catch (err) {
      console.error('Error modifying credits:', err);
      alert(err instanceof Error ? err.message : 'Failed to modify credits');
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleMigrateUsers = async () => {
    try {
      setMigrating(true);
      const response = await fetch(`${CUSTOM_BACKEND_URL}/admin/credits/migrate-users`, {
        method: 'POST',
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Migration failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Refresh users list to show migrated users
      await fetchUsers();
      
      alert(result.message || 'User migration completed successfully');
    } catch (err) {
      console.error('Migration error:', err);
      alert(err instanceof Error ? err.message : 'Migration failed');
    } finally {
      setMigrating(false);
    }
  };

  const addNewUser = () => {
    setSelectedUser(null);
    setTransaction({
      user_email: '',
      amount: 0,
      action: 'add',
      reason: 'Initial credits'
    });
    setShowTransactionModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            {error.includes('No users found') && (
              <div className="mt-3 text-sm">
                <p><strong>Note:</strong> The migration should have automatically populated all Onyx users with 100 credits each.</p>
                <p>If users are still not showing, the backend may need to be restarted to run the migration.</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchUsers}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={handleMigrateUsers}
              disabled={migrating}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {migrating ? 'Migrating...' : 'Migrate Users Now'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="w-8 h-8 mr-3 text-blue-600" />
            Credits Administration
          </h1>
          <p className="mt-2 text-gray-600">
            Manage user credits and monitor usage across the platform
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
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
                  onClick={fetchUsers}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
                <button
                  onClick={handleMigrateUsers}
                  disabled={migrating}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Users className="w-4 h-4 mr-2" />
                  {migrating ? 'Migrating...' : 'Migrate Users'}
                </button>
              </div>
              <button
                onClick={addNewUser}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </button>
            </div>
          </div>
        </div>

        {/* Credit Usage and Timeline Section */}
        <div className="flex gap-6 mb-6">
          {/* Credit Usage NIVO Pie Chart */}
          <div className={selectedUser ? "w-1/2" : "w-full"}>
            <CreditUsagePieChart selectedUser={selectedUser} />
          </div>
          
          {/* User Activity Timeline - Only show when user is selected */}
          {selectedUser && (
            <div className="w-1/2">
              <UserActivityTimeline selectedUser={selectedUser} />
            </div>
          )}
        </div>

        {/* MUI Table */}
        <div className="mt-8">
          <CreditsAdministrationTable 
            users={filteredUsers}
            selectedUser={selectedUser}
            onUserSelect={(user: UserCredits | null) => setSelectedUser(user)}
            onAddCredits={(user: UserCredits) => openTransactionModal(user, 'add')}
            onRemoveCredits={(user: UserCredits) => openTransactionModal(user, 'remove')}
          />
        </div>

        {/* Transaction Modal */}
        {showTransactionModal && (
          <div 
            className="fixed inset-0 backdrop-blur-md bg-white bg-opacity-10 flex items-center justify-center p-4 z-50"
            onClick={closeTransactionModal}
          >
            <div 
              className="bg-white rounded-lg max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-black">
                  {transaction.action === 'add' ? 'Add Credits' : 'Remove Credits'}
                </h3>
                {selectedUser && (
                  <p className="text-sm text-black mt-1">
                    Current balance: {selectedUser.credits_balance} credits
                    {transaction.action === 'remove' && transaction.amount > selectedUser.credits_balance && (
                      <span className="block text-red-600 mt-1">
                        Warning: Removing {transaction.amount} credits will reduce balance to 0
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    User ID
                  </label>
                  <input
                    type="email"
                    value={transaction.user_email}
                    onChange={(e) => setTransaction(prev => ({ ...prev, user_email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-400"
                    placeholder="user@example.com"
                    disabled={!!selectedUser}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={transaction.amount}
                    onChange={(e) => setTransaction(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-400"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Reason
                  </label>
                  <input
                    type="text"
                    value={transaction.reason}
                    onChange={(e) => setTransaction(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-400"
                    placeholder="Reason for this transaction"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={closeTransactionModal}
                  className="px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={transactionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransaction}
                  disabled={transactionLoading || !transaction.user_email || transaction.amount <= 0}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                    transaction.action === 'add'
                      ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                      : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                  }`}
                >
                  {transactionLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    `${transaction.action === 'add' ? 'Add' : 'Remove'} Credits`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCreditsPage; 