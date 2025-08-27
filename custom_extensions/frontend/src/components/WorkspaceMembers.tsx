"use client";

import React, { useState, useMemo, useCallback } from 'react';
import {
  Plus, Search, Filter, MoreHorizontal, UserPlus, Mail, Shield,
  RefreshCw, CheckCircle, XCircle, Clock, Trash2, Edit, ChevronDown, Users,
  Settings, Palette, FolderPlus, Tag
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Types for custom role system
interface CustomRole {
  id: string;
  name: string;
  color: string;
  textColor: string;
  permissions: string[];
}

interface WorkspaceMember {
  id: number;
  name: string;
  email: string;
  role: string; // Now can be any custom role name
  roleId?: string; // Reference to custom role
  status: 'Active' | 'Suspended' | 'Blocked' | 'Pending';
  invitationDate: string;
}

// Predefined color options for roles (pale backgrounds with darker text)
const ROLE_COLORS = [
  { bg: '#EFF6FF', text: '#1E40AF' }, // Pale Blue
  { bg: '#ECFDF5', text: '#047857' }, // Pale Green
  { bg: '#FFFBEB', text: '#D97706' }, // Pale Yellow
  { bg: '#FEF2F2', text: '#DC2626' }, // Pale Red
  { bg: '#F3E8FF', text: '#7C3AED' }, // Pale Purple
  { bg: '#ECFEFF', text: '#0891B2' }, // Pale Cyan
  { bg: '#FFF7ED', text: '#EA580C' }, // Pale Orange
  { bg: '#FDF2F8', text: '#DB2777' }, // Pale Pink
  { bg: '#F9FAFB', text: '#374151' }, // Pale Gray
  { bg: '#F7FEE7', text: '#65A30D' }, // Pale Lime
];

const WorkspaceMembers: React.FC = () => {
  const { t } = useLanguage();

  // Mock data for custom roles
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([
    { id: 'admin', name: t('interface.roles.admin', 'Admin'), color: '#F3E8FF', textColor: '#7C3AED', permissions: [t('interface.permissions.fullAccess', 'Full Access'), t('interface.permissions.manageUsers', 'Manage Users'), t('interface.permissions.manageSettings', 'Manage Settings')] },
    { id: 'member', name: t('interface.roles.member', 'Member'), color: '#EFF6FF', textColor: '#1E40AF', permissions: [t('interface.permissions.viewProjects', 'View Projects'), t('interface.permissions.editOwnWork', 'Edit Own Work')] },
    { id: 'viewer', name: t('interface.roles.viewer', 'Viewer'), color: '#F9FAFB', textColor: '#374151', permissions: [t('interface.permissions.viewOnly', 'View Only')] },
    { id: 'manager', name: t('interface.roles.manager', 'Manager'), color: '#ECFDF5', textColor: '#047857', permissions: [t('interface.permissions.manageProjects', 'Manage Projects'), t('interface.permissions.assignTasks', 'Assign Tasks')] },
    { id: 'editor', name: t('interface.roles.editor', 'Editor'), color: '#FFFBEB', textColor: '#D97706', permissions: [t('interface.permissions.editContent', 'Edit Content'), t('interface.permissions.reviewWork', 'Review Work')] },
  ]);

  const [members, setMembers] = useState<WorkspaceMember[]>([
    { id: 1, name: "Olivia Bennett", email: "olivia@company.com", role: t('interface.roles.admin', 'Admin'), roleId: "admin", status: "Active", invitationDate: "2025-08-10" },
    { id: 2, name: "Lucas Harrison", email: "lucas@company.com", role: t('interface.roles.member', 'Member'), roleId: "member", status: "Suspended", invitationDate: "2025-08-12" },
    { id: 3, name: "Chloe Morgan", email: "chloe@company.com", role: t('interface.roles.viewer', 'Viewer'), roleId: "viewer", status: "Blocked", invitationDate: "2025-08-09" },
    { id: 4, name: "James Whitaker", email: "james@company.com", role: t('interface.roles.manager', 'Manager'), roleId: "manager", status: "Active", invitationDate: "2025-08-05" },
    { id: 5, name: "Emma Davis", email: "emma@company.com", role: t('interface.roles.editor', 'Editor'), roleId: "editor", status: "Active", invitationDate: "2025-08-08" },
  ]);

  // UI State
  const [showAddMember, setShowAddMember] = useState(false);
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<string>('member');
  const [newMemberStatus, setNewMemberStatus] = useState<'Active' | 'Suspended' | 'Blocked' | 'Pending'>('Pending');

  // Role management state
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleColor, setNewRoleColor] = useState(ROLE_COLORS[0].bg);
  const [newRoleTextColor, setNewRoleTextColor] = useState(ROLE_COLORS[0].text);
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
  const [showColorPalette, setShowColorPalette] = useState(false);

  const formatDate = (dateInput: string): string => {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return dateInput;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get role by ID
  const getRoleById = useCallback((roleId: string) => {
    return customRoles.find(role => role.id === roleId);
  }, [customRoles]);

  // Get role color
  const getRoleColor = useCallback((role: string, roleId?: string) => {
    if (roleId) {
      const foundRole = getRoleById(roleId);
      if (foundRole) return foundRole.color;
    }

    // Fallback to hardcoded colors for backward compatibility
    switch (role) {
      case 'Admin': return '#F3E8FF';
      case 'Member': return '#EFF6FF';
      case 'Viewer': return '#F9FAFB';
      default: return '#F9FAFB';
    }
  }, [getRoleById]);

  // Get role text color
  const getRoleTextColor = useCallback((role: string, roleId?: string) => {
    if (roleId) {
      const foundRole = getRoleById(roleId);
      if (foundRole) return foundRole.textColor;
    }

    // Fallback to hardcoded colors for backward compatibility
    switch (role) {
      case 'Admin': return '#7C3AED';
      case 'Member': return '#1E40AF';
      case 'Viewer': return '#374151';
      default: return '#374151';
    }
  }, [getRoleById]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500';
      case 'Suspended': return 'bg-red-500';
      case 'Blocked': return 'bg-gray-500';
      case 'Pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

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
      const selectedRole = getRoleById(newMemberRole);
      const newMember: WorkspaceMember = {
        id: Math.max(...members.map(m => m.id)) + 1,
        name: newMemberEmail.split('@')[0], // Simple name generation
        email: newMemberEmail.trim(),
        role: selectedRole?.name || 'Member',
        roleId: selectedRole?.id,
        status: newMemberStatus,
        invitationDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      setMembers(prev => [...prev, newMember]);
      setNewMemberEmail('');
      setNewMemberRole('member');
      setNewMemberStatus('Pending');
      setShowAddMember(false);
    }
  }, [newMemberEmail, newMemberRole, newMemberStatus, members, getRoleById]);

  // Role management functions
  const handleAddRole = useCallback(() => {
    if (newRoleName.trim()) {
      const newRole: CustomRole = {
        id: `role-${Date.now()}`,
        name: newRoleName.trim(),
        color: newRoleColor,
        textColor: newRoleTextColor,
        permissions: newRolePermissions
      };
      setCustomRoles(prev => [...prev, newRole]);
      setNewRoleName('');
      setNewRoleColor(ROLE_COLORS[0].bg);
      setNewRoleTextColor(ROLE_COLORS[0].text);
      setNewRolePermissions([]);
    }
  }, [newRoleName, newRoleColor, newRoleTextColor, newRolePermissions]);

  const handleDeleteRole = useCallback((roleId: string) => {
    if (roleId !== 'admin' && roleId !== 'member' && roleId !== 'viewer') {
      setCustomRoles(prev => prev.filter(role => role.id !== roleId));
    }
  }, []);

  const handleTogglePermission = useCallback((permission: string) => {
    setNewRolePermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
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
              <option value="Active" className="text-black">{t('interface.statuses.active', 'Active')}</option>
              <option value="Suspended" className="text-black">{t('interface.statuses.suspended', 'Suspended')}</option>
              <option value="Blocked" className="text-black">{t('interface.statuses.blocked', 'Blocked')}</option>
              <option value="Pending" className="text-black">{t('interface.statuses.pending', 'Pending')}</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowRoleManager(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors whitespace-nowrap"
            >
              <Settings size={16} />
              {t('interface.manageRoles', 'Manage Roles')}
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
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: getRoleColor(member.role, member.roleId),
                          color: getRoleTextColor(member.role, member.roleId)
                        }}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(member.status)} mr-2`}></div>
                        <span className="text-sm text-gray-900">
                          {t(`interface.statuses.${member.status.toLowerCase()}`, member.status)}
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
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  {customRoles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('interface.addMemberModal.statusLabel', 'Status')}
                </label>
                <select
                  value={newMemberStatus}
                  onChange={(e) => setNewMemberStatus(e.target.value as 'Active' | 'Suspended' | 'Blocked' | 'Pending')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="Pending">{t('interface.statuses.pending', 'Pending')}</option>
                  <option value="Active">{t('interface.statuses.active', 'Active')}</option>
                  <option value="Suspended">{t('interface.statuses.suspended', 'Suspended')}</option>
                  <option value="Blocked">{t('interface.statuses.blocked', 'Blocked')}</option>
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

      {/* Role Manager Modal */}
      {showRoleManager && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-black/20" onClick={() => setShowRoleManager(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 relative mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              onClick={() => setShowRoleManager(false)}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('interface.roleManager.title', 'Manage Custom Roles')}
              </h3>
              <p className="text-gray-600">
                {t('interface.roleManager.description', 'Create custom roles with specific permissions and colors')}
              </p>
            </div>

            <div className="space-y-6">
              {/* Add New Role */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">{t('interface.roleManager.addNewRole', 'Add New Role')}</h4>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      placeholder={t('interface.roleManager.roleNamePlaceholder', 'Enter role name')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    />
                    <div className="relative">
                      <button
                        onClick={() => setShowColorPalette(!showColorPalette)}
                        className="w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center"
                        style={{ backgroundColor: newRoleColor }}
                      >
                        <Palette size={16} className="text-gray-600" />
                      </button>
                      {showColorPalette && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2 z-[9999] grid grid-cols-5 gap-1 w-48">
                          {ROLE_COLORS.map((colorOption) => (
                            <button
                              key={colorOption.bg}
                              onClick={() => {
                                setNewRoleColor(colorOption.bg);
                                setNewRoleTextColor(colorOption.text);
                                setShowColorPalette(false);
                              }}
                              className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform flex items-center justify-center"
                              style={{ backgroundColor: colorOption.bg }}
                            >
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorOption.text }}></div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('interface.roleManager.permissions', 'Permissions')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        t('interface.permissions.fullAccess', 'Full Access'),
                        t('interface.permissions.manageUsers', 'Manage Users'),
                        t('interface.permissions.manageSettings', 'Manage Settings'),
                        t('interface.permissions.viewProjects', 'View Projects'),
                        t('interface.permissions.editOwnWork', 'Edit Own Work'),
                        t('interface.permissions.viewOnly', 'View Only'),
                        t('interface.permissions.manageProjects', 'Manage Projects'),
                        t('interface.permissions.assignTasks', 'Assign Tasks'),
                        t('interface.permissions.editContent', 'Edit Content'),
                        t('interface.permissions.reviewWork', 'Review Work')
                      ].map((permission) => (
                        <label key={permission} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newRolePermissions.includes(permission)}
                            onChange={() => handleTogglePermission(permission)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{permission}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleAddRole}
                    disabled={!newRoleName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Tag size={16} />
                    {t('interface.roleManager.addRole', 'Add Role')}
                  </button>
                </div>
              </div>

              {/* Existing Roles */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">{t('interface.roleManager.existingRoles', 'Existing Roles')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customRoles.map((role) => (
                    <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: role.color,
                            color: role.textColor
                          }}
                        >
                          {role.name}
                        </span>
                        {role.id !== 'admin' && role.id !== 'member' && role.id !== 'viewer' && (
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className="space-y-1">
                        {role.permissions.map((permission) => (
                          <div key={permission} className="text-xs text-gray-600 flex items-center">
                            <CheckCircle size={12} className="mr-1 text-green-500" />
                            {permission}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowRoleManager(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                {t('interface.roleManager.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceMembers; 