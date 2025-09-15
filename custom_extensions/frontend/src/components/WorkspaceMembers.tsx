"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus, Search, Filter, MoreHorizontal, UserPlus, Mail, Shield,
  RefreshCw, CheckCircle, XCircle, Clock, Trash2, Edit, ChevronDown, Users,
  Settings, Palette, FolderPlus, Tag
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import workspaceService, { 
  WorkspaceRole, WorkspaceMember, WorkspaceMemberCreate, 
  WorkspaceRoleCreate, WorkspaceRoleUpdate, Workspace, WorkspaceCreate
} from '../services/workspaceService';
import { getCurrentUserId, getCurrentUser, initializeUser } from '../services/userService';
// Import test utilities for development
import '../utils/testUserIds';
import { trackAddMember } from '@/lib/mixpanelClient'

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
  
  // User role state
  const [currentUserRole, setCurrentUserRole] = useState<WorkspaceRole | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Function to map backend role names to display names
  const getRoleDisplayName = (roleName: string): string => {
    switch (roleName.toLowerCase()) {
      case 'learning_architect':
      case 'moderator':
        return 'Learning Architect';
      case 'learning_designer':
      case 'member':
        return 'Learning Designer';
      case 'admin':
        return 'Admin';
      default:
        return roleName;
    }
  };
  
  // Portal container for modals
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

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

  // Set up portal container
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPortalContainer(document.body);
    }
  }, []);

  // Load user's workspaces and initialize user data
  useEffect(() => {
    const initializeAndLoad = async () => {
      // Initialize user data first
      await initializeUser();
      // Then load workspaces
      loadUserWorkspaces();
    };
    
    initializeAndLoad();
  }, []);

  // Set target workspace ID and load data when workspaceId changes or workspace is selected
  useEffect(() => {
    const newTargetWorkspaceId = workspaceId || selectedWorkspace?.id || null;
    setTargetWorkspaceId(newTargetWorkspaceId);
    
    if (newTargetWorkspaceId) {
      loadWorkspaceData(newTargetWorkspaceId);
    }
  }, [workspaceId, selectedWorkspace]);

  // Debug logging for admin state
  useEffect(() => {
    console.log('🔍 [WORKSPACE DEBUG] Admin state changed:', {
      isAdmin,
      currentUserRole: currentUserRole?.name,
      targetWorkspaceId
    });
  }, [isAdmin, currentUserRole, targetWorkspaceId]);

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
      
      // Determine current user's role and permissions
      await determineCurrentUserRole(targetWorkspaceId, workspaceMembers, workspaceRoles);
    } catch (err) {
      console.error('Failed to load workspace data:', err);
      setError('Failed to load workspace data');
    } finally {
      setLoading(false);
    }
  };



  const determineCurrentUserRole = async (workspaceId: number, members: WorkspaceMember[], workspaceRoles: WorkspaceRole[]) => {
    try {
      // Get current user (both id and email available)
      const currentUser = await getCurrentUser();
      const currentUserId = currentUser?.id || getCurrentUserId();
      const currentUserEmail = (currentUser?.email || '').toLowerCase();

      // Match by user_id OR email
      const currentMember = members.find(member => {
        const memberId = (member.user_id || '').toLowerCase();
        const memberEmail = (member.user_email || '').toLowerCase();
        return memberId === currentUserId.toLowerCase() || (currentUserEmail && memberEmail === currentUserEmail);
      });
      if (currentMember) {
        const userRole = workspaceRoles.find(role => role.id === currentMember.role_id);
        setCurrentUserRole(userRole || null);
        // Temporarily allow all members to manage workspace
        setIsAdmin(true);
        console.log('Current user role determined:', {
          userId: currentUserId,
          email: currentUserEmail,
          memberId: currentMember.id,
          roleId: currentMember.role_id,
          roleName: userRole?.name,
          isAdmin: true // Temporarily always true
        });
      } else {
        setCurrentUserRole(null);
        setIsAdmin(false);
        console.log('Current user is not a member of this workspace:', {
          userId: currentUserId,
          email: currentUserEmail
        });
      }
    } catch (err) {
      console.error('Failed to determine user role:', err);
      setCurrentUserRole(null);
      setIsAdmin(false);
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
      await trackAddMember("Completed", getRoleById(newMemberRole)?.name);

      // Reset form
      setNewMemberEmail('');
      setNewMemberRole('');
      setNewMemberStatus('pending');
      setShowAddMember(false);
    } catch (err) {
      await trackAddMember("Failed", getRoleById(newMemberRole)?.name);
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
    } catch (error) {
      console.error('Failed to add role:', error);
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

  const handleTogglePermission = useCallback((permission: string) => {
    setNewRolePermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  }, []);

  // Handle create workspace
  const handleCreateWorkspace = useCallback(async () => {
    if (!newWorkspaceName.trim()) return;
    
    try {
      const newWorkspace: WorkspaceCreate = {
        name: newWorkspaceName.trim(),
        description: newWorkspaceDescription.trim() || undefined,
        is_active: true
      };
      
      const createdWorkspace = await workspaceService.createWorkspace(newWorkspace);
      
      // Add to workspaces list and select it
      setWorkspaces(prev => [...prev, createdWorkspace]);
      setSelectedWorkspace(createdWorkspace);
      
      // Reset form and close modal
      setNewWorkspaceName('');
      setNewWorkspaceDescription('');
      setShowCreateWorkspace(false);
      
      // Reload workspaces to get updated data
      await loadUserWorkspaces();
    } catch (err) {
      console.error('Failed to create workspace:', err);
      setError('Failed to create workspace');
    }
  }, [newWorkspaceName, newWorkspaceDescription]);

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
    // If user has no workspaces at all, show create workspace option
    if (workspaces.length === 0) {
      return (
        <>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <FolderPlus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Workspaces Found</h3>
              <p className="text-gray-600 mb-6">Create your first workspace to start collaborating with your team.</p>
                          <button
              onClick={() => {
                console.log('🔘 Create Workspace button clicked!');
                console.log('🔘 Current state:', { showCreateWorkspace, portalContainer: !!portalContainer });
                setShowCreateWorkspace(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                <Plus size={20} />
                Create Your First Workspace
              </button>
            </div>
          </div>

          {/* Create Workspace Modal */}
          {showCreateWorkspace && portalContainer && (() => {
            console.log('🔘 Modal render check:', { 
              showCreateWorkspace, 
              portalContainer: !!portalContainer,
              shouldRender: true
            });
            return createPortal(
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowCreateWorkspace(false);
                  }
                }}
              >
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t('interface.createWorkspace.title', 'Create New Workspace')}
                      </h3>
                      <button
                        onClick={() => setShowCreateWorkspace(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XCircle size={24} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('interface.createWorkspace.nameLabel', 'Workspace Name')} *
                        </label>
                        <input
                          type="text"
                          value={newWorkspaceName}
                          onChange={(e) => setNewWorkspaceName(e.target.value)}
                          placeholder={t('interface.createWorkspace.namePlaceholder', 'Enter workspace name')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('interface.createWorkspace.descriptionLabel', 'Description')}
                        </label>
                        <textarea
                          value={newWorkspaceDescription}
                          onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                          placeholder={t('interface.createWorkspace.descriptionPlaceholder', 'Optional description')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => setShowCreateWorkspace(false)}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        {t('interface.createWorkspace.cancel', 'Cancel')}
                      </button>
                      <button
                        onClick={handleCreateWorkspace}
                        disabled={!newWorkspaceName.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        <Plus size={16} />
                        {t('interface.createWorkspace.create', 'Create Workspace')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>,
              portalContainer!
            );
          })()}
        </>
      );
    }
    
    // If user has workspaces but none selected
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
              <option value="active" className="text-black">{t('interface.statuses.active', 'Active')}</option>
              <option value="suspended" className="text-black">{t('interface.statuses.suspended', 'Suspended')}</option>
              <option value="pending" className="text-black">{t('interface.statuses.pending', 'Pending')}</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowRoleManager(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-400 text-white rounded-md hover:bg-slate-500 transition-colors whitespace-nowrap"
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
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
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
                          {(member.user_name || member.user_id).charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{member.user_name || member.user_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: getRoleColor(member.role_id),
                          color: getRoleTextColor(member.role_id)
                        }}
                      >
                        <select
                          value={member.role_id}
                          onChange={(e) => handleRoleChange(member.id, parseInt(e.target.value))}
                          className="px-1 border border-none rounded-md focus:ring-2 focus:ring-blue-200 focus:border-blue-200 text-black whitespace-nowrap"
                          required
                        >
                          {roles.map((role) => (
                            <option key={role.id} value={role.id} style={{ color: role.text_color }}>
                              {getRoleDisplayName(role.name)}
                            </option>
                          ))}
                        </select>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(member.status)} mr-2`}></div>
                        <span className="text-sm text-gray-900">
                          {t(`interface.statuses.${member.status}`, member.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(member.invited_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="relative group">
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal size={16} />
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                          <div className="py-1">
                            {member.status === 'active' && (
                              <button
                                onClick={() => handleSuspendMember(member.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {t('interface.workspaceActions.suspend', 'Suspend')}
                              </button>
                            )}
                            {member.status === 'suspended' && (
                              <button
                                onClick={() => handleActivateMember(member.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {t('interface.workspaceActions.activate', 'Activate')}
                              </button>
                            )}
                            {member.status === 'pending' && (
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
      {showAddMember && portalContainer && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center backdrop-blur-sm bg-black/20" onClick={() => setShowAddMember(false)}>
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
                  onChange={(e) => setNewMemberRole(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="">Select a role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {getRoleDisplayName(role.name)}
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
                  onChange={(e) => setNewMemberStatus(e.target.value as 'pending' | 'active' | 'suspended')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="pending">{t('interface.statuses.pending', 'Pending')}</option>
                  <option value="active">{t('interface.statuses.active', 'Active')}</option>
                  <option value="suspended">{t('interface.statuses.suspended', 'Suspended')}</option>
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
                disabled={!newMemberEmail.trim() || !newMemberRole}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('interface.addMemberModal.sendInvitation', 'Send Invitation')}
              </button>
            </div>
          </div>
        </div>,
        portalContainer!
      )}

      {/* Role Manager Modal */}
      {showRoleManager && portalContainer && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center backdrop-blur-sm bg-black/20" onClick={() => setShowRoleManager(false)}>
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
                        <div className="absolute top-0 right-full mr-2 bg-white border border-gray-200 rounded-md shadow-lg p-2 grid grid-cols-5 gap-1 w-48 z-50">
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
                        'manage_workspace',
                        'manage_members',
                        'manage_roles',
                        'view_content',
                        'edit_content',
                        'delete_content',
                        'manage_product_access'
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
                  {roles.map((role) => (
                    <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: role.color,
                            color: role.text_color
                          }}
                        >
                          {role.name}
                        </span>
                        {isAdmin && !role.is_default && (
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
                className="px-4 py-2 bg-slate-400 text-white rounded-md hover:bg-slate-500 transition-colors"
              >
                {t('interface.roleManager.close', 'Close')}
              </button>
            </div>
          </div>
        </div>,
        portalContainer!
      )}
    </div>
  );
};

export default WorkspaceMembers; 