"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Minus, Users, Search, RefreshCw } from 'lucide-react';
import CreditsAdministrationTable from '../../../../components/CreditsAdministrationTable';
import CreditUsagePieChart from '../../../../components/CreditUsagePieChart';
import UserActivityTimeline from '../../../../components/UserActivityTimeline';

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

const CreditsTab: React.FC = () => {
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

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transaction.amount <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    setTransactionLoading(true);
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/admin/credits/modify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(transaction),
      });

      if (!response.ok) {
        throw new Error(`Failed to modify credits: ${response.status}`);
      }

      const result = await response.json();
      alert(result.message);
      closeTransactionModal();
      fetchUsers(); // Refresh the user list
    } catch (err) {
      console.error('Error modifying credits:', err);
      alert(err instanceof Error ? err.message : 'Failed to modify credits');
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleMigrateUsers = async () => {
    setMigrating(true);
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/admin/credits/migrate-users`, {
        method: 'POST',
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error(`Failed to migrate users: ${response.status}`);
      }

      const result = await response.json();
      alert(result.message);
      fetchUsers(); // Refresh the user list
    } catch (err) {
      console.error('Error migrating users:', err);
      alert(err instanceof Error ? err.message : 'Failed to migrate users');
    } finally {
      setMigrating(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchUsers}
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
          <h2 className="text-2xl font-bold text-gray-900">Credits Management</h2>
          <p className="text-gray-600">Manage user credits and transactions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleMigrateUsers}
            disabled={migrating}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            {migrating ? 'Migrating...' : 'Migrate Users'}
          </button>
          <button
            onClick={fetchUsers}
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

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users Table */}
        <div className="lg:col-span-2">
          <CreditsAdministrationTable
            users={filteredUsers}
            selectedUser={selectedUser}
            onUserSelect={setSelectedUser}
            onAddCredits={(user) => openTransactionModal(user, 'add')}
            onRemoveCredits={(user) => openTransactionModal(user, 'remove')}
          />
        </div>

        {/* Analytics Sidebar */}
        <div className="space-y-6">
          <CreditUsagePieChart selectedUser={selectedUser} />
          <UserActivityTimeline selectedUser={selectedUser} />
        </div>
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {transaction.action === 'add' ? 'Add' : 'Remove'} Credits
            </h3>
            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User
                </label>
                <input
                  type="text"
                  value={selectedUser?.name || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={transaction.amount}
                  onChange={(e) => setTransaction(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <input
                  type="text"
                  value={transaction.reason}
                  onChange={(e) => setTransaction(prev => ({ ...prev, reason: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={closeTransactionModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transactionLoading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {transactionLoading ? 'Processing...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditsTab; 