"use client";

import React, { useState, useMemo, useCallback } from 'react';
import {
  Plus, Search, Filter, MoreHorizontal, UserPlus, Mail, Shield,
  RefreshCw, CheckCircle, XCircle, Clock, Trash2, Edit, ChevronDown, Users,
  Settings, Tag, FolderPlus
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface WorkspaceMember {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Member' | 'Viewer';
  status: string;
  invitationDate: string;
}

interface CustomStatus {
  id: string;
  name: string;
  color: string;
  categoryId: string;
}

interface CustomStatusCategory {
  id: string;
  name: string;
  description?: string;
  statuses: CustomStatus[];
}

const WorkspaceMembers: React.FC = () => {
  const { t } = useLanguage();

  // Custom status management state
  const [customStatusCategories, setCustomStatusCategories] = useState<CustomStatusCategory[]>([
    {
      id: 'default',
      name: 'Default Statuses',
      description: 'Built-in workspace member statuses',
      statuses: [
        { id: 'active', name: 'Active', color: '#10B981', categoryId: 'default' },
        { id: 'suspended', name: 'Suspended', color: '#EF4444', categoryId: 'default' },
        { id: 'blocked', name: 'Blocked', color: '#6B7280', categoryId: 'default' },
        { id: 'pending', name: 'Pending', color: '#F59E0B', categoryId: 'default' }
      ]
    }
  ]);

  const [showStatusManagement, setShowStatusManagement] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddStatus, setShowAddStatus] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CustomStatusCategory | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#6B7280');
  const [editingStatus, setEditingStatus] = useState<CustomStatus | null>(null);

  const formatDate = (dateInput: string): string => {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return dateInput;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const [members, setMembers] = useState<WorkspaceMember[]>([
    { id: 1, name: "Olivia Bennett", email: "olivia@company.com", role: "Admin", status: "Active", invitationDate: "2025-08-10" },
    { id: 2, name: "Lucas Harrison", email: "lucas@company.com", role: "Member", status: "Suspended", invitationDate: "2025-08-12" },
    { id: 3, name: "Chloe Morgan", email: "chloe@company.com", role: "Viewer", status: "Blocked", invitationDate: "2025-08-09" },
    { id: 4, name: "James Whitaker", email: "james@company.com", role: "Member", status: "Active", invitationDate: "2025-08-05" }
  ]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'Admin' | 'Member' | 'Viewer'>('Member');

  // Get all available statuses from all categories
  const allStatuses = useMemo(() => {
    return customStatusCategories.flatMap((category: CustomStatusCategory) => category.statuses);
  }, [customStatusCategories]);

  // Filter members based on search term and status filter
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === '' || member.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [members, searchTerm, statusFilter]);

  // Get status color
  const getStatusColor = (status: string) => {
    const statusObj = allStatuses.find((s: CustomStatus) => s.name === status);
    return statusObj ? statusObj.color : '#6B7280';
  };

  // Custom status management functions
  const handleAddCategory = useCallback(() => {
    if (newCategoryName.trim()) {
      const newCategory: CustomStatusCategory = {
        id: `category-${Date.now()}`,
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
        statuses: []
      };
      setCustomStatusCategories((prev: CustomStatusCategory[]) => [...prev, newCategory]);
      setNewCategoryName('');
      setNewCategoryDescription('');
      setShowAddCategory(false);
    }
  }, [newCategoryName, newCategoryDescription]);

  const handleAddStatus = useCallback(() => {
    if (newStatusName.trim() && selectedCategory) {
      const newStatus: CustomStatus = {
        id: `status-${Date.now()}`,
        name: newStatusName.trim(),
        color: newStatusColor,
        categoryId: selectedCategory.id
      };

      setCustomStatusCategories(prev => prev.map(category =>
        category.id === selectedCategory.id
          ? { ...category, statuses: [...category.statuses, newStatus] }
          : category
      ));

      setNewStatusName('');
      setNewStatusColor('#6B7280');
      setShowAddStatus(false);
    }
  }, [newStatusName, newStatusColor, selectedCategory]);

  const handleEditStatus = useCallback(() => {
    if (editingStatus && newStatusName.trim()) {
      setCustomStatusCategories(prev => prev.map(category =>
        category.id === editingStatus.categoryId
          ? {
            ...category,
            statuses: category.statuses.map(status =>
              status.id === editingStatus.id
                ? { ...status, name: newStatusName.trim(), color: newStatusColor }
                : status
            )
          }
          : category
      ));

      setEditingStatus(null);
      setNewStatusName('');
      setNewStatusColor('#6B7280');
    }
  }, [editingStatus, newStatusName, newStatusColor]);

  const handleDeleteStatus = useCallback((statusId: string, categoryId: string) => {
    setCustomStatusCategories(prev => prev.map(category =>
      category.id === categoryId
        ? { ...category, statuses: category.statuses.filter(status => status.id !== statusId) }
        : category
    ));
  }, []);

  const handleDeleteCategory = useCallback((categoryId: string) => {
    setCustomStatusCategories(prev => prev.filter(category => category.id !== categoryId));
  }, []);

  // Handle member actions
  const handleDeleteMember = useCallback((memberId: number) => {
    setMembers(prev => prev.filter(member => member.id !== memberId));
  }, []);

  const handleSuspendMember = useCallback((memberId: number) => {
    setMembers(prev => prev.map(member =>
      member.id === memberId ? { ...member, status: 'Suspended' as const } : member
    ));
  }, []);

  const handleActivateMember = useCallback((memberId: number) => {
    setMembers(prev => prev.map(member =>
      member.id === memberId ? { ...member, status: 'Active' as const } : member
    ));
  }, []);

  const handleUnblockMember = useCallback((memberId: number) => {
    setMembers(prev => prev.map(member =>
      member.id === memberId ? { ...member, status: 'Active' as const } : member
    ));
  }, []);

  // Handle add member
  const handleAddMember = useCallback(() => {
    if (newMemberEmail.trim()) {
      const newMember: WorkspaceMember = {
        id: Math.max(...members.map(m => m.id)) + 1,
        name: newMemberEmail.split('@')[0], // Simple name generation
        email: newMemberEmail.trim(),
        role: newMemberRole,
        status: 'Pending',
        invitationDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      setMembers(prev => [...prev, newMember]);
      setNewMemberEmail('');
      setNewMemberRole('Member');
      setShowAddMember(false);
    }
  }, [newMemberEmail, newMemberRole, members]);

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
            <div className="flex gap-2">
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
              <button
                onClick={() => setShowStatusManagement(true)}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                title={t('interface.manageStatuses', 'Manage Statuses')}
              >
                <Settings size={16} />
              </button>
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={() => setShowAddMember(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <UserPlus size={16} />
            {t('interface.addMember', 'Add Member')}
          </button>
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
                          style={{ backgroundColor: getStatusColor(member.status) }}
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
                            {member.status === 'Active' && (
                              <button
                                onClick={() => handleSuspendMember(member.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {t('interface.workspaceActions.suspend', 'Suspend')}
                              </button>
                            )}
                            {member.status === 'Suspended' && (
                              <button
                                onClick={() => handleActivateMember(member.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {t('interface.workspaceActions.activate', 'Activate')}
                              </button>
                            )}
                            {member.status === 'Blocked' && (
                              <button
                                onClick={() => handleUnblockMember(member.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {t('interface.workspaceActions.unblock', 'Unblock')}
                              </button>
                            )}
                            {member.status === 'Pending' && (
                              <button
                                onClick={() => handleActivateMember(member.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {t('interface.workspaceActions.resendInvitation', 'Resend Invitation')}
                              </button>
                            )}
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

      {/* Status Management Modal */}
      {showStatusManagement && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-black/20" onClick={() => setShowStatusManagement(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 relative mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              onClick={() => setShowStatusManagement(false)}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('interface.statusManagement.title', 'Manage Statuses')}
              </h3>
              <p className="text-gray-600">
                {t('interface.statusManagement.description', 'Customize default statuses and create custom status categories for workspace members')}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Categories Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900">Status Categories</h4>
                  <button
                    onClick={() => setShowAddCategory(true)}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    <FolderPlus size={14} />
                    Add Category
                  </button>
                </div>

                <div className="space-y-3">
                  {customStatusCategories.map((category) => (
                    <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h5 className="font-medium text-gray-900">{category.name}</h5>
                          {category.description && (
                            <p className="text-sm text-gray-500">{category.description}</p>
                          )}
                        </div>
                        {category.id !== 'default' && (
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {category.statuses.map((status) => (
                          <div key={status.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <div className={`h-3 w-3 rounded-full`} style={{ backgroundColor: status.color }}></div>
                              <span className="text-sm text-gray-900">{status.name}</span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setEditingStatus(status);
                                  setNewStatusName(status.name);
                                  setNewStatusColor(status.color);
                                }}
                                className="text-gray-600 hover:text-gray-800 transition-colors"
                              >
                                <Edit size={14} />
                              </button>
                              {category.id !== 'default' && (
                                <button
                                  onClick={() => handleDeleteStatus(status.id, category.id)}
                                  className="text-red-600 hover:text-red-800 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {category.id !== 'default' && (
                        <button
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowAddStatus(true);
                          }}
                          className="mt-3 w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                        >
                          + Add Status
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Status Preview</h4>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="space-y-3">
                    {allStatuses.map((status) => (
                      <div key={status.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: status.color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-900">{status.name}</span>
                        <span className="text-xs text-gray-500">
                          {customStatusCategories.find((cat: CustomStatusCategory) => cat.id === status.categoryId)?.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center backdrop-blur-sm bg-black/20">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative mx-4">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              onClick={() => setShowAddCategory(false)}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Add Status Category</h3>
              <p className="text-gray-600">Create a new category to organize your custom statuses</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  placeholder="Enter category description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddCategory(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Status Modal */}
      {(showAddStatus || editingStatus) && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center backdrop-blur-sm bg-black/20">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative mx-4">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              onClick={() => {
                setShowAddStatus(false);
                setEditingStatus(null);
                setNewStatusName('');
                setNewStatusColor('#6B7280');
              }}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {editingStatus ? 'Edit Status' : 'Add Status'}
              </h3>
              <p className="text-gray-600">
                {editingStatus ? 'Update the status details' : `Add a new status to "${selectedCategory?.name}"`}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Name</label>
                <input
                  type="text"
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  placeholder="Enter status name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newStatusColor}
                    onChange={(e) => setNewStatusColor(e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newStatusColor}
                    onChange={(e) => setNewStatusColor(e.target.value)}
                    placeholder="#6B7280"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddStatus(false);
                  setEditingStatus(null);
                  setNewStatusName('');
                  setNewStatusColor('#6B7280');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingStatus ? handleEditStatus : handleAddStatus}
                disabled={!newStatusName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editingStatus ? 'Update Status' : 'Add Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceMembers; 