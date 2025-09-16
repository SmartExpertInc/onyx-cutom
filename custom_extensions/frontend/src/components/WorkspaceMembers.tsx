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
  WorkspaceRoleCreate, WorkspaceRoleUpdate, Workspace, WorkspaceCreate
} from '../services/workspaceService';
import { getCurrentUserId, getCurrentUser, initializeUser } from '../services/userService';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { HeadTextCustom } from './ui/head-text-custom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
// Import test utilities for development
import '../utils/testUserIds';
import { Button } from './ui/button';

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

const UserIcon: React.FC<{ size?: number }> = ({ size = 30 }) => (
  <svg fill="#878787" height={size} width={size} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 508 508" xmlSpace="preserve" stroke="#878787"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
    <g id="SVGRepo_iconCarrier"> 
      <g> 
        <g> 
          <path d="M406.95,266.9c-16.7-6-34.1-11.1-51.7-15.2c-6.6-1.5-13.4,1.9-16.1,8.2l-42.5,99l-9.7-38.7l16.5-16.6 c5.5-5.5,5.5-14.4,0-20l-39.4-39.2c-5.5-5.5-14.4-5.5-20,0l-39.5,39.5c-5.5,5.5-5.5,14.4,0,20l16.5,16.5l-9.9,38.1l-42.3-98.4 c-2.7-6.3-9.5-9.7-16.1-8.2c-17.6,4.1-35,9.2-51.6,15.2c-24.4,8.8-40.8,31.9-40.8,57.5v169.3c0,7.8,6.3,14.1,14.1,14.1h179.6h0.1 h179.4c7.8,0,14.1-6.3,14.1-14.1V324.5C447.75,298.9,431.35,275.8,406.95,266.9z M254.05,274.3l19.5,19.5l-8.1,8.1h-22.9l-8.1-8.1 L254.05,274.3z M88.65,479.7v-29.5h28.2c7.8,0,14.1-6.3,14.1-14.1c0-7.8-6.3-14.1-14.1-14.1h-28.2v-28.2h56.4 c7.8,0,14.1-6.3,14.1-14.1c0-7.8-6.3-14.1-14.1-14.1h-56.4v-41.1c0-13.7,8.9-26.2,22.1-31c12-4.3,24.4-8.1,37-11.4l84.9,197.6 H88.65z M254.05,458l-24.6-57.3l18.2-70.6h12.6l17.9,71.7L254.05,458z M419.45,479.7h-144l84.9-197.6c12.6,3.3,25,7.1,37,11.4 c13.2,4.8,22.1,17.2,22.1,31V479.7z"></path> </g> </g> <g> <g> <path d="M254.05,0c-55.2,0-100,44.9-100,100c0,55.1,44.8,100,100,100s100-44.9,100-100C354.05,44.8,309.15,0,254.05,0z M254.05,171.7c-39.6,0-71.8-32.2-71.8-71.8s32.2-71.8,71.8-71.8c39.6,0,71.8,32.2,71.8,71.8S293.65,171.7,254.05,171.7z"></path> 
        </g> 
      </g> 
    </g>
  </svg>
);

const StatusIcon: React.FC<{ size?: number }> = ({ size }) => (
  <svg height={size} width={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#6A7282" fill-rule="evenodd" d="M14.1026,4.43011 C14.6139,4.22135 15.1977,4.46661 15.4064,4.97792 C17.0765,9.06841 15.1143,13.7383 11.0239,15.4083 C8.66289,16.3723 6.10818,16.1252 4.05194,14.9602 C3.57143,14.6879 3.40261,14.0776 3.67487,13.5971 C3.94713,13.1166 4.55737,12.9478 5.03789,13.2201 C6.58414,14.0962 8.49796,14.2793 10.2679,13.5567 C13.3357,12.3042 14.8073,8.80177 13.5548,5.73391 C13.346,5.2226 13.5913,4.63886 14.1026,4.43011 Z M2.19544,9.52389 C2.26141,9.77396 2.3444,10.023 2.44513,10.2698 C2.54587,10.5165 2.66092,10.7525 2.78882,10.9773 C3.06197,11.4573 2.89426,12.0678 2.41425,12.341 C1.93424,12.6141 1.32368,12.4464 1.05054,11.9664 C0.879967,11.6666 0.727034,11.3528 0.593515,11.0257 C0.459996,10.6987 0.349566,10.3675 0.261594,10.034 C0.120724,9.50001 0.439434,8.9529 0.973451,8.81203 C1.50747,8.67116 2.05457,8.98987 2.19544,9.52389 Z M2.45915,3.60703 C2.93624,3.88526 3.09744,4.49756 2.81922,4.97464 C2.55491,5.42786 2.35056,5.91419 2.21184,6.42018 C2.06582,6.95281 1.51566,7.26622 0.983026,7.12019 C0.450396,6.97416 0.136992,6.424 0.283019,5.89137 C0.467702,5.21774 0.739666,4.57047 1.09154,3.96709 C1.36977,3.49001 1.98207,3.3288 2.45915,3.60703 Z M10.1104,0.28485 C10.7841,0.469533 11.4313,0.741497 12.0347,1.09338 C12.5118,1.3716 12.673,1.9839 12.3948,2.46098 C12.1166,2.93807 11.5043,3.09927 11.0272,2.82105 C10.574,2.55674 10.0876,2.3524 9.58163,2.21367 C9.049,2.06765 8.7356,1.51749 8.88162,0.984857 C9.02765,0.452227 9.57781,0.138823 10.1104,0.28485 Z M7.18978,0.975282 C7.33065,1.5093 7.01194,2.0564 6.47792,2.19727 C6.22785,2.26324 5.97878,2.34623 5.73205,2.44696 C5.48531,2.5477 5.24933,2.66275 5.02455,2.79066 C4.54454,3.0638 3.93398,2.89609 3.66084,2.41608 C3.3877,1.93607 3.55541,1.32551 4.03542,1.05237 C4.33519,0.881798 4.64904,0.728865 4.97607,0.595346 C5.30309,0.461827 5.6343,0.351397 5.96779,0.263425 C6.50181,0.122556 7.04891,0.441265 7.18978,0.975282 Z"></path> </g></svg>
);

const NamesIcon: React.FC<{ size?: number }> = ({ size }) => (
  <svg height={size} width={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="User / Users"> <path id="Vector" d="M21 19.9999C21 18.2583 19.3304 16.7767 17 16.2275M15 20C15 17.7909 12.3137 16 9 16C5.68629 16 3 17.7909 3 20M15 13C17.2091 13 19 11.2091 19 9C19 6.79086 17.2091 5 15 5M9 13C6.79086 13 5 11.2091 5 9C5 6.79086 6.79086 5 9 5C11.2091 5 13 6.79086 13 9C13 11.2091 11.2091 13 9 13Z" stroke="#6A7282" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg>
);

const RoleIcon: React.FC<{ size?: number }> = ({ size }) => (
  <svg height={size} width={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M11 15C10.1183 15 9.28093 14.8098 8.52682 14.4682C8.00429 14.2315 7.74302 14.1131 7.59797 14.0722C7.4472 14.0297 7.35983 14.0143 7.20361 14.0026C7.05331 13.9914 6.94079 14 6.71575 14.0172C6.6237 14.0242 6.5425 14.0341 6.46558 14.048C5.23442 14.2709 4.27087 15.2344 4.04798 16.4656C4 16.7306 4 17.0485 4 17.6841V19.4C4 19.9601 4 20.2401 4.10899 20.454C4.20487 20.6422 4.35785 20.7951 4.54601 20.891C4.75992 21 5.03995 21 5.6 21H8.4M15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7ZM12.5898 21L14.6148 20.595C14.7914 20.5597 14.8797 20.542 14.962 20.5097C15.0351 20.4811 15.1045 20.4439 15.1689 20.399C15.2414 20.3484 15.3051 20.2848 15.4324 20.1574L19.5898 16C20.1421 15.4477 20.1421 14.5523 19.5898 14C19.0376 13.4477 18.1421 13.4477 17.5898 14L13.4324 18.1574C13.3051 18.2848 13.2414 18.3484 13.1908 18.421C13.1459 18.4853 13.1088 18.5548 13.0801 18.6279C13.0478 18.7102 13.0302 18.7985 12.9948 18.975L12.5898 21Z" stroke="#6A7282" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
);

const DateIcon: React.FC<{ size?: number }> = ({ size }) => (
  <svg height={size} width={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 9H21M17 13.0014L7 13M10.3333 17.0005L7 17M7 3V5M17 3V5M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z" stroke="#6A7282" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
);

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
  

  // UI State
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<number | ''>('');
  const [newMemberStatus, setNewMemberStatus] = useState<'pending' | 'active' | 'suspended'>('active');

  // Workspace creation state
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');

  // Role management state
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleColor, setNewRoleColor] = useState(ROLE_COLORS[0].bg);
  const [newRoleTextColor, setNewRoleTextColor] = useState(ROLE_COLORS[0].text);
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
  const [showColorPalette, setShowColorPalette] = useState(false);


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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading workspace data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12">
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
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12">
            <div className="text-center">
              <FolderPlus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Workspaces Found</h3>
              <p className="text-gray-600 mb-6">Create your first workspace to start collaborating with your team.</p>
                          <Button
                          variant="download"
              onClick={() => {
                console.log('🔘 Create Workspace button clicked!');
                setShowCreateWorkspace(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full transition-colors"
            >
                <Plus size={20} />
                Create Your First Workspace
              </Button>
            </div>
          </div>

          {/* Create Workspace Modal */}
          <Dialog open={showCreateWorkspace} onOpenChange={setShowCreateWorkspace}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {t('interface.createWorkspace.title', 'Create New Workspace')}
                </DialogTitle>
              </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('interface.createWorkspace.nameLabel', 'Workspace Name')} *
                        </label>
                        <Input
                          type="text"
                          variant="shadow"
                          value={newWorkspaceName}
                          onChange={(e) => setNewWorkspaceName(e.target.value)}
                          placeholder={t('interface.createWorkspace.namePlaceholder', 'Enter workspace name')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                          required
                        />
                      </div>
                    </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateWorkspace(false)}
                  className="text-gray-600 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
                >
                  {t('interface.createWorkspace.cancel', 'Cancel')}
                </Button>
                <Button
                  variant="download"
                  onClick={handleCreateWorkspace}
                  disabled={!newWorkspaceName.trim()}
                  className="flex items-center gap-2 rounded-full"
                >
                  <Plus size={16} />
                  {t('interface.createWorkspace.create', 'Create Workspace')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    }
    
    // If user has workspaces but none selected
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Workspace Selected</h3>
          <p className="text-gray-600">Please select a workspace to view its members.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 space-y-3">
      {/* Workspace Header and Selector */}
      <div className="rounded-lg p-4">
        <div className="flex flex-col gap-4">
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
          
          {/* Search, Filter, and Create Button Row */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search and Filter Row */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 z-10" size={16} />
              <Input
                type="text"
                variant="shadow"
                placeholder={t('interface.searchPlaceholder', 'Search members...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
              <SelectTrigger variant="filter" className="whitespace-nowrap rounded-full border border-gray-300 bg-white/90 text-sm">
                <SelectValue placeholder={t('interface.filters.allStatuses', 'All Statuses')} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                <SelectItem value="all">{t('interface.filters.allStatuses', 'All Statuses')}</SelectItem>
                <SelectItem value="active">{t('interface.statuses.active', 'Active')}</SelectItem>
                <SelectItem value="suspended">{t('interface.statuses.suspended', 'Suspended')}</SelectItem>
                <SelectItem value="pending">{t('interface.statuses.pending', 'Pending')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="download"
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              size="sm"
            >
              <UserPlus size={15} />
              {t('interface.addMember', 'Add Member')}
            </Button>
            <Button
              variant="blueGradient"
              size="sm"
              onClick={() => setShowRoleManager(true)}
              className="group flex items-center gap-2 px-2 py-2 hover:px-4 rounded-full transition-all duration-200 overflow-hidden"
            >
              <Settings size={15} />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {t('interface.manageRoles', 'Manage Roles')}
              </span>
            </Button>
          </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">
                  <div className="flex items-center gap-2">
                    <NamesIcon size={15} />
                    {t('interface.memberName', 'Name')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                  <div className="flex items-center gap-2">
                    <RoleIcon size={15} />
                    {t('interface.memberRole', 'Role')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                  <div className="flex items-center gap-2">
                    <StatusIcon size={15} />
                    {t('interface.memberStatus', 'Status')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                  <div className="flex items-center gap-2">
                    <DateIcon size={15} />
                    {t('interface.memberInvitationDate', 'Invitation Date')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-20">
                  {/* {t('interface.memberActions', 'Actions')} */}
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
                      <Select 
                        value={member.role_id.toString()} 
                        onValueChange={(value) => handleRoleChange(member.id, parseInt(value))}
                      >
                        <SelectTrigger 
                          className="w-24 shadow-none bg-transparent px-1 border-1 rounded-lg"
                          style={{
                            backgroundColor: getRoleColor(member.role_id),
                            color: getRoleTextColor(member.role_id),
                            borderColor: getRoleTextColor(member.role_id),
                            height: '15px',
                            minHeight: '16px'
                          }}
                        >
                          <SelectValue 
                            className="text-xs font-medium"
                            style={{ color: getRoleTextColor(member.role_id) }}
                          />
                        </SelectTrigger>
                        <SelectContent className='border border-gray-200 shadow-lg'>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              <div 
                                className="flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium"
                                style={{
                                  // backgroundColor: role.color,
                                  color: role.text_color
                                }}
                              >
                                {getRoleDisplayName(role.name)}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(member.status)} mr-2`}></div>
                        <span className="text-sm text-gray-600">
                          {t(`interface.statuses.${member.status}`, member.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(member.invited_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium w-20">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-500 hover:text-gray-600 p-1">
                            <MoreHorizontal size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg">
                          {member.status === 'active' && (
                            <DropdownMenuItem
                              onClick={() => handleSuspendMember(member.id)}
                              className="cursor-pointer text-gray-600 hover:bg-gray-50 focus:bg-gray-50"
                            >
                              {t('interface.workspaceActions.suspend', 'Suspend')}
                            </DropdownMenuItem>
                          )}
                          {member.status === 'suspended' && (
                            <DropdownMenuItem
                              onClick={() => handleActivateMember(member.id)}
                              className="cursor-pointer text-gray-600 hover:bg-gray-50 focus:bg-gray-50"
                            >
                              {t('interface.workspaceActions.activate', 'Activate')}
                            </DropdownMenuItem>
                          )}
                          {member.status === 'pending' && (
                            <DropdownMenuItem
                              onClick={() => handleActivateMember(member.id)}
                              className="cursor-pointer text-gray-600 hover:bg-gray-50 focus:bg-gray-50"
                            >
                              {t('interface.workspaceActions.resendInvitation', 'Resend Invitation')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteMember(member.id)}
                            variant="destructive"
                            className="cursor-pointer"
                          >
                            {t('interface.workspaceActions.delete', 'Delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('interface.addMemberModal.title', 'Add Member')}
            </DialogTitle>
            <DialogDescription>
              {t('interface.addMemberModal.description', 'Invite a new member to the workspace')}
            </DialogDescription>
          </DialogHeader>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('interface.addMemberModal.emailLabel', 'Email')}
                </label>
                <Input
                  variant="shadow"
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder={t('interface.addMemberModal.emailPlaceholder', 'Enter email address')}
                  className="w-full px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('interface.addMemberModal.roleLabel', 'Role')}
                </label>
                <Select
                  value={newMemberRole ? newMemberRole.toString() : ''}
                  onValueChange={(value) => setNewMemberRole(value ? parseInt(value) : '')}
                >
                  <SelectTrigger variant="filter" className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className='border border-gray-200 shadow-lg'>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {getRoleDisplayName(role.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

          <DialogFooter className="flex gap-3">
            <Button
              variant="filter"
              onClick={() => setShowAddMember(false)}
              className="flex-1 px-4 py-2 rounded-full"
            >
              {t('interface.addMemberModal.cancel', 'Cancel')}
            </Button>
            <Button
              variant="download"
              onClick={handleAddMember}
              disabled={!newMemberEmail.trim() || !newMemberRole}
              className="flex-1 px-4 py-2 rounded-full"
            >
              {t('interface.addMemberModal.sendInvitation', 'Send Invitation')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Manager Modal */}
      <Dialog open={showRoleManager} onOpenChange={setShowRoleManager}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-200">
          <DialogHeader>
            <DialogTitle>
              {t('interface.roleManager.title', 'Manage Custom Roles')}
            </DialogTitle>
            <DialogDescription>
              {t('interface.roleManager.description', 'Create custom roles with specific permissions and colors')}
            </DialogDescription>
          </DialogHeader>

            <div className="space-y-6">
              {/* Add New Role */}
              <Card className="backdrop-blur-sm border border-gray-200/50 shadow-sm"
              style={{
                backgroundColor: 'white',
                background: `linear-gradient(to top right, white, white, #E8F0FE)`,
                borderWidth: '1px',
              }}>
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-gray-900">
                    {t('interface.roleManager.addNewRole', 'Add New Role')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      type="text"
                      variant="shadow"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      placeholder={t('interface.roleManager.roleNamePlaceholder', 'Enter role name')}
                      className="flex-1"
                    />
                    <div className="relative">
                      <Button
                        type="button"
                        variant="blueGradient"
                        size="icon"
                        onClick={() => setShowColorPalette(!showColorPalette)}
                        className="w-10 h-10 bg-white rounded-full"
                        style={{ backgroundColor: newRoleColor }}
                      >
                        <Palette size={16} className="text-gray-600" />
                      </Button>
                      {showColorPalette && (
                        <div className="absolute top-0 right-full mr-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1 w-48 z-50">
                          {ROLE_COLORS.map((colorOption) => (
                            <Button
                              key={colorOption.bg}
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setNewRoleColor(colorOption.bg);
                                setNewRoleTextColor(colorOption.text);
                                setShowColorPalette(false);
                              }}
                              className="w-8 h-8 rounded-full border border-gray-200 shadow-lg hover:scale-110 transition-transform"
                              style={{ backgroundColor: colorOption.bg }}
                            >
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorOption.text }}></div>
                            </Button>
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
                        <div key={permission} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission}
                            checked={newRolePermissions.includes(permission)}
                            onCheckedChange={() => handleTogglePermission(permission)}
                          />
                          <label htmlFor={permission} className="text-sm text-gray-700 cursor-pointer">
                            {permission}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleAddRole}
                    disabled={!newRoleName.trim()}
                    variant="download"
                    className="flex items-center gap-2 rounded-full"
                  >
                    <Tag size={16} />
                    {t('interface.roleManager.addRole', 'Add Role')}
                  </Button>
                </div>
                </CardContent>
              </Card>

              {/* Existing Roles */}
              <Card className="backdrop-blur-sm border border-gray-200/50 shadow-sm"
              style={{
                backgroundColor: 'white',
                background: `linear-gradient(to top left, white, white, #E8F0FE)`,
                borderWidth: '1px',
              }}>
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-gray-900">
                    {t('interface.roleManager.existingRoles', 'Existing Roles')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roles.map((role) => (
                    <Card key={role.id} className="bg-white backdrop-blur-sm border border-gray-200/30 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRole(role.id)}
                              className="text-red-600 hover:text-red-800 h-auto p-1"
                            >
                              <Trash2 size={14} />
                            </Button>
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
                </CardContent>
              </Card>
            </div>

          <DialogFooter>
            <Button
              variant="blueGradient"
              onClick={() => setShowRoleManager(false)}
              className="rounded-full"
            >
              {t('interface.roleManager.close', 'Close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkspaceMembers; 