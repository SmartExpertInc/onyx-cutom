"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Plus, Search, Filter, MoreHorizontal, UserPlus, Mail, Shield,
  RefreshCw, CheckCircle, XCircle, Clock, Trash2, Edit, ChevronDown, Users,
  Settings, Palette, FolderPlus, Tag
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import workspaceService, { 
  WorkspaceRole, WorkspaceMember, WorkspaceMemberCreate, 
  WorkspaceRoleCreate, WorkspaceRoleUpdate, Workspace
} from '../services/workspaceService';

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

interface WorkspaceMembersProps {
  workspaceId?: number;
}

const WorkspaceMembers: React.FC<WorkspaceMembersProps> = ({ workspaceId }) => {
  const { t } = useLanguage();

  // State for real data
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [targetWorkspaceId, setTargetWorkspaceId] = useState<number | null>(null);
  const [roles, setRoles] = useState<WorkspaceRole[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<number | ''>('');
  const [newMemberStatus, setNewMemberStatus] = useState<'pending' | 'active' | 'suspended'>('pending');

  // Workspace creation state
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');

  // Role management state
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleColor, setNewRoleColor] = useState(ROLE_COLORS[0].bg);
  const [newRoleTextColor, setNewRoleTextColor] = useState(ROLE_COLORS[0].text);
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
  const [showColorPalette, setShowColorPalette] = useState(false);

  // Load user's workspaces
  useEffect(() => {
    loadUserWorkspaces();
  }, []);

  // Set target workspace ID and load data when workspaceId changes or workspace is selected
  useEffect(() => {
    const newTargetWorkspaceId = workspaceId || selectedWorkspace?.id || null;
    setTargetWorkspaceId(newTargetWorkspaceId);
    
    if (newTargetWorkspaceId) {
      loadWorkspaceData(newTargetWorkspaceId);
    }
  }, [workspaceId, selectedWorkspace]);

  const loadUserWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const userWorkspaces = await workspaceService.getWorkspaces();
      setWorkspaces(userWorkspaces);

      if (userWorkspaces.length === 1 && !workspaceId) {
        setSelectedWorkspace(userWorkspaces[0]);
      }
    } catch (err) {
      console.error('Failed to load workspaces:', err);
      setError('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkspaceData = async (targetWorkspaceId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const [workspaceRoles, workspaceMembers] = await Promise.all([
        workspaceService.getWorkspaceRoles(targetWorkspaceId),
        workspaceService.getWorkspaceMembers(targetWorkspaceId)
      ]);
      
      setRoles(workspaceRoles);
      setMembers(workspaceMembers);
    } catch (err) {
      console.error('Failed to load workspace data:', err);
      setError('Failed to load workspace data');
    } finally {
      setLoading(false);
    }
  };

  // Handle member actions
  const handleDeleteMember = useCallback(async (memberId: number) => {
    if (!targetWorkspaceId) return;
    
    try {
      await workspaceService.removeMember(targetWorkspaceId, memberId.toString());
      setMembers(prev => prev.filter(member => member.id !== memberId));
    } catch (err) {
      console.error('Failed to delete member:', err);
    }
  }, [targetWorkspaceId]);

  const handleSuspendMember = useCallback(async (memberId: number) => {
    if (!targetWorkspaceId) return;
    
    try {
      const updatedMember = await workspaceService.updateMember(
        targetWorkspaceId, 
        memberId.toString(), 
        { status: 'suspended' }
      );
      setMembers(prev => prev.map(member =>
        member.id === memberId ? updatedMember : member
      ));
    } catch (err) {
      console.error('Failed to suspend member:', err);
    }
  }, [targetWorkspaceId]);

  const handleActivateMember = useCallback(async (memberId: number) => {
    if (!targetWorkspaceId) return;
    
    try {
      const updatedMember = await workspaceService.updateMember(
        targetWorkspaceId, 
        memberId.toString(), 
        { status: 'active' }
      );
      setMembers(prev => prev.map(member =>
        member.id === memberId ? updatedMember : member
      ));
    } catch (err) {
      console.error('Failed to activate member:', err);
    }
  }, [targetWorkspaceId]);

  // Handle add member
  const handleAddMember = useCallback(async () => {
    if (!targetWorkspaceId || !newMemberEmail.trim() || !newMemberRole) return;
    
    try {
      const newMember: Omit<WorkspaceMemberCreate, 'workspace_id'> = {
        user_id: newMemberEmail.trim(),
        role_id: newMemberRole as number,
        status: newMemberStatus
      };
      
      const addedMember = await workspaceService.addMember(targetWorkspaceId, newMember);
      setMembers(prev => [...prev, addedMember]);
      
      // Reset form
      setNewMemberEmail('');
      setNewMemberRole('');
      setNewMemberStatus('pending');
      setShowAddMember(false);
    } catch (err) {
      console.error('Failed to add member:', err);
    }
  }, [newMemberEmail, newMemberRole, newMemberStatus, targetWorkspaceId]);

  // Role management functions
  const handleAddRole = useCallback(async () => {
    if (!targetWorkspaceId || !newRoleName.trim()) return;
    
    try {
      const newRole: Omit<WorkspaceRoleCreate, 'workspace_id'> = {
        name: newRoleName.trim(),
        color: newRoleColor,
        text_color: newRoleTextColor,
        permissions: newRolePermissions
      };
      
      const addedRole = await workspaceService.createRole(targetWorkspaceId, newRole);
      setRoles(prev => [...prev, addedRole]);
      
      // Reset form
      setNewRoleName('');
      setNewRoleColor(ROLE_COLORS[0].bg);
      setNewRoleTextColor(ROLE_COLORS[0].text);
      setNewRolePermissions([]);
    } catch (err) {
      console.error('Failed to add role:', err);
    }
  }, [newRoleName, newRoleColor, newRoleTextColor, newRolePermissions, targetWorkspaceId]);

  const handleDeleteRole = useCallback(async (roleId: number) => {
    if (!targetWorkspaceId) return;
    
    try {
      await workspaceService.deleteRole(targetWorkspaceId, roleId);
      setRoles(prev => prev.filter(role => role.id !== roleId));
    } catch (err) {
      console.error('Failed to delete role:', err);
    }
  }, [targetWorkspaceId]);

  const handleRoleChange = async (memberId: number, newRoleId: number) => {
    if (!targetWorkspaceId) return;
    
    try {
      const updatedMember = await workspaceService.updateMember(
        targetWorkspaceId, 
        memberId.toString(), 
        { role_id: newRoleId }
      );
      setMembers(prev =>
        prev.map(m => m.id === memberId ? updatedMember : m)
      );
    } catch (err) {
      console.error('Failed to update member role:', err);
    }
  };

  // Get role by ID
  const getRoleById = useCallback((roleId: number) => {
    return roles.find((role) => role.id === roleId);
  }, [roles]);

  // Get role color
  const getRoleColor = useCallback((roleId: number) => {
    const role = getRoleById(roleId);
    return role?.color || '#F9FAFB';
  }, [getRoleById]);

  // Get role text color
  const getRoleTextColor = useCallback((roleId: number) => {
    const role = getRoleById(roleId);
    return role?.text_color || '#374151';
  }, [getRoleById]);

  // Filter members based on search term and status filter
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch = (member.user_name || member.user_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.user_email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === '' || member.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [members, searchTerm, statusFilter]);

  const formatDate = (dateInput: string): string => {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return dateInput;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'suspended': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading workspace data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <XCircle className="h-8 w-8 text-red-600" />
        <span className="ml-2 text-red-600">Error: {error}</span>
        <button
          onClick={() => {
            if (targetWorkspaceId) {
              loadWorkspaceData(targetWorkspaceId);
            } else {
              loadUserWorkspaces();
            }
          }}
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Don't render workspace content if no target workspace ID (following project pattern)
  if (!targetWorkspaceId) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Workspace Selected</h3>
          <p className="text-gray-600">Please select a workspace to view its members.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workspace Header and Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedWorkspace?.name || `Workspace ${targetWorkspaceId}`}
            </h2>
            {selectedWorkspace?.description && (
              <p className="text-gray-600">{selectedWorkspace.description}</p>
            )}
          </div>
          
          {/* Workspace Selector (only show if no specific workspaceId provided) */}
          {!workspaceId && workspaces.length > 1 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                {t('interface.workspace.switch', 'Switch Workspace:')}
              </label>
              <select
                value={targetWorkspaceId || ''}
                onChange={(e) => {
                  const workspace = workspaces.find(w => w.id === parseInt(e.target.value));
                  if (workspace) {
                    setSelectedWorkspace(workspace);
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Header with Search, Filter, and Create Button */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search and Filter Row */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('interface.workspace.searchMembers', 'Search members...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="">{t('interface.workspace.allStatuses', 'All Statuses')}</option>
                <option value="active">{t('interface.workspace.active', 'Active')}</option>
                <option value="pending">{t('interface.workspace.pending', 'Pending')}</option>
                <option value="suspended">{t('interface.workspace.suspended', 'Suspended')}</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              {t('interface.workspace.addMember', 'Add Member')}
            </button>
            <button
              onClick={() => setShowRoleManager(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Settings className="h-4 w-4" />
              {t('interface.workspace.manageRoles', 'Manage Roles')}
            </button>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('interface.workspace.members', 'Members')} ({filteredMembers.length})
          </h3>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">{t('interface.workspace.noMembers', 'No members found')}</p>
            <p className="text-sm text-gray-400">
              {searchTerm || statusFilter 
                ? t('interface.workspace.tryDifferentFilter', 'Try adjusting your search or filter')
                : t('interface.workspace.addFirstMember', 'Add your first member to get started')
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredMembers.map((member) => {
              const role = getRoleById(member.role_id);
              return (
                <div key={member.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Member Avatar */}
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {(member.user_name || member.user_id).charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Member Info */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {member.user_name || member.user_id}
                        </h4>
                        {member.user_email && (
                          <p className="text-sm text-gray-500">{member.user_email}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {/* Role Badge */}
                          {role && (
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: role.color,
                                color: role.text_color
                              }}
                            >
                              {role.name}
                            </span>
                          )}
                          {/* Status Badge */}
                          <span className="flex items-center gap-1 text-xs">
                            <span className={`h-2 w-2 rounded-full ${getStatusColor(member.status)}`} />
                            {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Member Actions */}
                    <div className="flex items-center gap-2">
                      {/* Role Selector */}
                      <select
                        value={member.role_id}
                        onChange={(e) => handleRoleChange(member.id, parseInt(e.target.value))}
                        className="text-sm border border-gray-300 rounded px-2 py-1 text-black"
                      >
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        {member.status === 'suspended' ? (
                          <button
                            onClick={() => handleActivateMember(member.id)}
                            className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                            title={t('interface.workspace.activate', 'Activate')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSuspendMember(member.id)}
                            className="p-1 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded"
                            title={t('interface.workspace.suspend', 'Suspend')}
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                          title={t('interface.workspace.remove', 'Remove')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Member Metadata */}
                  <div className="mt-2 text-xs text-gray-500 flex gap-4">
                    <span>{t('interface.workspace.joined', 'Joined')}: {formatDate(member.invited_at)}</span>
                    {member.joined_at && (
                      <span>{t('interface.workspace.lastActive', 'Last Active')}: {formatDate(member.joined_at)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('interface.workspace.addNewMember', 'Add New Member')}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('interface.workspace.emailAddress', 'Email Address')}
                </label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('interface.workspace.role', 'Role')}
                </label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="">{t('interface.workspace.selectRole', 'Select a role')}</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('interface.workspace.status', 'Status')}
                </label>
                <select
                  value={newMemberStatus}
                  onChange={(e) => setNewMemberStatus(e.target.value as 'pending' | 'active' | 'suspended')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="pending">{t('interface.workspace.pending', 'Pending')}</option>
                  <option value="active">{t('interface.workspace.active', 'Active')}</option>
                  <option value="suspended">{t('interface.workspace.suspended', 'Suspended')}</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddMember}
                disabled={!newMemberEmail.trim() || !newMemberRole}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {t('interface.workspace.addMember', 'Add Member')}
              </button>
              <button
                onClick={() => {
                  setShowAddMember(false);
                  setNewMemberEmail('');
                  setNewMemberRole('');
                  setNewMemberStatus('pending');
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                {t('interface.workspace.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Manager Modal */}
      {showRoleManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('interface.roleManager.title', 'Role Manager')}
            </h3>
            
            {/* Existing Roles */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-3">
                {t('interface.roleManager.existingRoles', 'Existing Roles')}
              </h4>
              <div className="space-y-2">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: role.color,
                          color: role.text_color
                        }}
                      >
                        {role.name}
                      </span>
                      {role.is_default && (
                        <span className="text-xs text-gray-500">
                          ({t('interface.roleManager.default', 'Default')})
                        </span>
                      )}
                    </div>
                    {!role.is_default && (
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="text-red-600 hover:text-red-700 p-1 rounded"
                        title={t('interface.roleManager.deleteRole', 'Delete Role')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Role */}
            <div className="border-t pt-4">
              <h4 className="text-md font-medium text-gray-700 mb-3">
                {t('interface.roleManager.addNewRole', 'Add New Role')}
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('interface.roleManager.roleName', 'Role Name')}
                  </label>
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('interface.roleManager.roleNamePlaceholder', 'e.g., Project Manager')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('interface.roleManager.backgroundColor', 'Background Color')}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newRoleColor}
                        onChange={(e) => setNewRoleColor(e.target.value)}
                        className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                      />
                      <span className="text-sm text-gray-600">{newRoleColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('interface.roleManager.textColor', 'Text Color')}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newRoleTextColor}
                        onChange={(e) => setNewRoleTextColor(e.target.value)}
                        className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                      />
                      <span className="text-sm text-gray-600">{newRoleTextColor}</span>
                    </div>
                  </div>
                </div>

                {/* Color Presets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('interface.roleManager.colorPresets', 'Color Presets')}
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {ROLE_COLORS.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setNewRoleColor(preset.bg);
                          setNewRoleTextColor(preset.text);
                        }}
                        className="h-8 rounded border border-gray-300 hover:border-gray-400 transition-colors"
                        style={{
                          backgroundColor: preset.bg,
                          color: preset.text
                        }}
                        title={`Background: ${preset.bg}, Text: ${preset.text}`}
                      >
                        Aa
                      </button>
                    ))}
                  </div>
                </div>

                {/* Role Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('interface.roleManager.preview', 'Preview')}
                  </label>
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: newRoleColor,
                      color: newRoleTextColor
                    }}
                  >
                    {newRoleName || t('interface.roleManager.roleNamePlaceholder', 'New Role')}
                  </span>
                </div>

                <button
                  onClick={handleAddRole}
                  disabled={!newRoleName.trim()}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {t('interface.roleManager.createRole', 'Create Role')}
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowRoleManager(false)}
                className="px-4 py-2 bg-slate-400 text-white rounded-md hover:bg-slate-500 transition-colors"
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