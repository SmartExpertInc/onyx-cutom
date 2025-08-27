"use client";

import React, { useState, useMemo, useCallback } from 'react';
import {
  Plus, Search, Filter, MoreHorizontal, UserPlus, Mail, Shield,
  RefreshCw, CheckCircle, XCircle, Clock, Trash2, Edit, ChevronDown, Users,
  Settings, Palette, FolderPlus, Tag
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Types for custom status system
interface CustomStatus {
  id: string;
  name: string;
  color: string;
  categoryId: string;
}

interface StatusCategory {
  id: string;
  name: string;
  statuses: CustomStatus[];
}

interface WorkspaceMember {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Member' | 'Viewer';
  status: string; // Now can be any custom status name
  statusId?: string; // Reference to custom status
  invitationDate: string;
}

// Predefined color options for statuses
const STATUS_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#84CC16', // Lime
];

const WorkspaceMembers: React.FC = () => {
  const { t } = useLanguage();

  // Mock data for status categories and custom statuses
  const [statusCategories, setStatusCategories] = useState<StatusCategory[]>([
    {
      id: 'default',
      name: 'Default Statuses',
      statuses: [
        { id: 'active', name: 'Active', color: '#10B981', categoryId: 'default' },
        { id: 'suspended', name: 'Suspended', color: '#EF4444', categoryId: 'default' },
        { id: 'blocked', name: 'Blocked', color: '#6B7280', categoryId: 'default' },
        { id: 'pending', name: 'Pending', color: '#F59E0B', categoryId: 'default' },
      ]
    },
    {
      id: 'custom-1',
      name: 'Not Started',
      statuses: [
        { id: 'open', name: 'OPEN', color: '#F59E0B', categoryId: 'custom-1' },
      ]
    },
    {
      id: 'custom-2',
      name: 'Active',
      statuses: [
        { id: 'in-review', name: 'IN REVIEW', color: '#F59E0B', categoryId: 'custom-2' },
        { id: 'accepted', name: 'ACCEPTED', color: '#3B82F6', categoryId: 'custom-2' },
        { id: 'rejected', name: 'REJECTED', color: '#EF4444', categoryId: 'custom-2' },
        { id: 'in-progress', name: 'IN PROGRESS', color: '#EF4444', categoryId: 'custom-2' },
      ]
    },
    {
      id: 'custom-3',
      name: 'CLOSED',
      statuses: [
        { id: 'closed', name: 'CLOSED', color: '#10B981', categoryId: 'custom-3' },
      ]
    }
  ]);

  const [members, setMembers] = useState<WorkspaceMember[]>([
    { id: 1, name: "Olivia Bennett", email: "olivia@company.com", role: "Admin", status: "Active", statusId: "active", invitationDate: "2025-08-10" },
    { id: 2, name: "Lucas Harrison", email: "lucas@company.com", role: "Member", status: "Suspended", statusId: "suspended", invitationDate: "2025-08-12" },
    { id: 3, name: "Chloe Morgan", email: "chloe@company.com", role: "Viewer", status: "Blocked", statusId: "blocked", invitationDate: "2025-08-09" },
    { id: 4, name: "James Whitaker", email: "james@company.com", role: "Member", status: "OPEN", statusId: "open", invitationDate: "2025-08-05" },
    { id: 5, name: "Emma Davis", email: "emma@company.com", role: "Member", status: "IN REVIEW", statusId: "in-review", invitationDate: "2025-08-08" },
    { id: 6, name: "Michael Wilson", email: "michael@company.com", role: "Viewer", status: "ACCEPTED", statusId: "accepted", invitationDate: "2025-08-11" },
  ]);

  // UI State
  const [showAddMember, setShowAddMember] = useState(false);
  const [showStatusManager, setShowStatusManager] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'Admin' | 'Member' | 'Viewer'>('Member');
  const [newMemberStatus, setNewMemberStatus] = useState<string>('pending');

  // Status management state
  const [editingCategory, setEditingCategory] = useState<StatusCategory | null>(null);
  const [editingStatus, setEditingStatus] = useState<CustomStatus | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState(STATUS_COLORS[0]);

  const formatDate = (dateInput: string): string => {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return dateInput;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get all statuses from all categories
  const allStatuses = useMemo(() => {
    return statusCategories.flatMap((category: StatusCategory) => category.statuses);
  }, [statusCategories]);

  // Get status by ID
  const getStatusById = useCallback((statusId: string) => {
    return allStatuses.find((status: CustomStatus) => status.id === statusId);
  }, [allStatuses]);

  // Get status color
  const getStatusColor = useCallback((status: string, statusId?: string) => {
    if (statusId) {
      const foundStatus = getStatusById(statusId);
      if (foundStatus) return foundStatus.color;
    }

    // Fallback to hardcoded colors for backward compatibility
    switch (status) {
      case 'Active': return '#10B981';
      case 'Suspended': return '#EF4444';
      case 'Blocked': return '#6B7280';
      case 'Pending': return '#F59E0B';
      default: return '#6B7280';
    }
  }, [getStatusById]);

  // Filter members based on search term and status filter
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === '' || member.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [members, searchTerm, statusFilter]);

  // Handle member actions
  const handleDeleteMember = useCallback((memberId: number) => {
    setMembers(prev => prev.filter(member => member.id !== memberId));
  }, []);

  const handleUpdateMemberStatus = useCallback((memberId: number, newStatus: string, statusId?: string) => {
    setMembers(prev => prev.map(member =>
      member.id === memberId ? { ...member, status: newStatus, statusId } : member
    ));
  }, []);

  // Handle add member
  const handleAddMember = useCallback(() => {
    if (newMemberEmail.trim()) {
      const selectedStatus = getStatusById(newMemberStatus);
      const newMember: WorkspaceMember = {
        id: Math.max(...members.map((m: WorkspaceMember) => m.id)) + 1,
        name: newMemberEmail.split('@')[0], // Simple name generation
        email: newMemberEmail.trim(),
        role: newMemberRole,
        status: selectedStatus?.name || 'Pending',
        statusId: selectedStatus?.id,
        invitationDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      setMembers((prev: WorkspaceMember[]) => [...prev, newMember]);
      setNewMemberEmail('');
      setNewMemberRole('Member');
      setNewMemberStatus('pending');
      setShowAddMember(false);
    }
  }, [newMemberEmail, newMemberRole, newMemberStatus, members, getStatusById]);

  // Status management functions
  const handleAddCategory = useCallback(() => {
    if (newCategoryName.trim()) {
      const newCategory: StatusCategory = {
        id: `custom-${Date.now()}`,
        name: newCategoryName.trim(),
        statuses: []
      };
      setStatusCategories(prev => [...prev, newCategory]);
      setNewCategoryName('');
    }
  }, [newCategoryName]);

  const handleAddStatus = useCallback((categoryId: string) => {
    if (newStatusName.trim()) {
      const newStatus: CustomStatus = {
        id: `status-${Date.now()}`,
        name: newStatusName.trim(),
        color: newStatusColor,
        categoryId
      };
      setStatusCategories(prev => prev.map(category =>
        category.id === categoryId
          ? { ...category, statuses: [...category.statuses, newStatus] }
          : category
      ));
      setNewStatusName('');
      setNewStatusColor(STATUS_COLORS[0]);
    }
  }, [newStatusName, newStatusColor]);

  const handleDeleteStatus = useCallback((categoryId: string, statusId: string) => {
    setStatusCategories(prev => prev.map(category =>
      category.id === categoryId
        ? { ...category, statuses: category.statuses.filter(status => status.id !== statusId) }
        : category
    ));
  }, []);

  const handleDeleteCategory = useCallback((categoryId: string) => {
    if (categoryId !== 'default') {
      setStatusCategories(prev => prev.filter(category => category.id !== categoryId));
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with Search, Filter, and Create Button */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search and Filter Row */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder={t('interface.searchPlaceholder', 'Search members...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-black text-black"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black whitespace-nowrap"
            >
              <option value="" className="text-black">{t('interface.filters.allStatuses', 'All Statuses')}</option>
              {allStatuses.map(status => (
                <option key={status.id} value={status.name} className="text-black">
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowStatusManager(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors whitespace-nowrap"
            >
              <Settings size={16} />
              {t('interface.manageStatuses', 'Manage Statuses')}
            </button>
            <button
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <UserPlus size={16} />
              {t('interface.addMember', 'Add Member')}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('interface.memberName', 'Name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('interface.memberEmail', 'Email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('interface.memberRole', 'Role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('interface.memberStatus', 'Status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('interface.memberInvitationDate', 'Invitation Date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('interface.memberActions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium">{t('interface.noMembers', 'No workspace members found')}</p>
                    <p className="text-sm">{searchTerm || statusFilter ? 'Try adjusting your search or filter criteria.' : 'Get started by adding your first team member.'}</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                        member.role === 'Member' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {t(`interface.roles.${member.role.toLowerCase()}`, member.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="h-2 w-2 rounded-full mr-2"
                          style={{ backgroundColor: getStatusColor(member.status, member.statusId) }}
                        ></div>
                        <span className="text-sm text-gray-900">
                          {member.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(member.invitationDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="relative group">
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal size={16} />
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                          <div className="py-1">
                            {/* Status Change Options */}
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                              Change Status
                            </div>
                            {allStatuses.map(status => (
                              <button
                                key={status.id}
                                onClick={() => handleUpdateMemberStatus(member.id, status.name, status.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              >
                                <div
                                  className="h-2 w-2 rounded-full mr-2"
                                  style={{ backgroundColor: status.color }}
                                ></div>
                                {status.name}
                              </button>
                            ))}
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              {t('interface.workspaceActions.delete', 'Delete')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-black/20" onClick={() => setShowAddMember(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative mx-4" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              onClick={() => setShowAddMember(false)}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('interface.addMemberModal.title', 'Add Member')}
              </h3>
              <p className="text-gray-600">
                {t('interface.addMemberModal.description', 'Invite a new member to the workspace')}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('interface.addMemberModal.emailLabel', 'Email')}
                </label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder={t('interface.addMemberModal.emailPlaceholder', 'Enter email address')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('interface.addMemberModal.roleLabel', 'Role')}
                </label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as 'Admin' | 'Member' | 'Viewer')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="Admin">{t('interface.roles.admin', 'Admin')}</option>
                  <option value="Member">{t('interface.roles.member', 'Member')}</option>
                  <option value="Viewer">{t('interface.roles.viewer', 'Viewer')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('interface.addMemberModal.statusLabel', 'Status')}
                </label>
                <select
                  value={newMemberStatus}
                  onChange={(e) => setNewMemberStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  {allStatuses.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddMember(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                {t('interface.addMemberModal.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleAddMember}
                disabled={!newMemberEmail.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('interface.addMemberModal.sendInvitation', 'Send Invitation')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Manager Modal */}
      {showStatusManager && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-black/20" onClick={() => setShowStatusManager(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 relative mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              onClick={() => setShowStatusManager(false)}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Manage Status Categories & Statuses
              </h3>
              <p className="text-gray-600">
                Create custom status categories and statuses with custom colors
              </p>
            </div>

            <div className="space-y-6">
              {/* Add New Category */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Add New Category</h4>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                  <button
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <FolderPlus size={16} />
                    Add Category
                  </button>
                </div>
              </div>

              {/* Status Categories */}
              <div className="space-y-4">
                {statusCategories.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">{category.name}</h4>
                      {category.id !== 'default' && (
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete Category
                        </button>
                      )}
                    </div>

                    {/* Add New Status to Category */}
                    <div className="flex gap-3 mb-4">
                      <input
                        type="text"
                        value={newStatusName}
                        onChange={(e) => setNewStatusName(e.target.value)}
                        placeholder="Enter status name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      />
                      <div className="relative">
                        <button
                          onClick={() => setNewStatusColor(newStatusColor === STATUS_COLORS[0] ? STATUS_COLORS[1] : STATUS_COLORS[0])}
                          className="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center"
                          style={{ backgroundColor: newStatusColor }}
                        >
                          <Palette size={16} className="text-white" />
                        </button>
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2 z-20 grid grid-cols-5 gap-1 w-48">
                          {STATUS_COLORS.map((color) => (
                            <button
                              key={color}
                              onClick={() => setNewStatusColor(color)}
                              className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddStatus(category.id)}
                        disabled={!newStatusName.trim()}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        <Tag size={16} />
                        Add Status
                      </button>
                    </div>

                    {/* Statuses in Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {category.statuses.map((status) => (
                        <div key={status.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: status.color }}
                            ></div>
                            <span className="text-sm font-medium text-gray-900">{status.name}</span>
                          </div>
                          {category.id !== 'default' && (
                            <button
                              onClick={() => handleDeleteStatus(category.id, status.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowStatusManager(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceMembers; 