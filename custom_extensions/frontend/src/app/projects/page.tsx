// custom_extensions/frontend/src/app/projects/page.tsx 
"use client";

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProjectsTable from '../../components/ProjectsTable';
import OffersTable from '../../components/OffersTable';
import CreateOfferModal from '../../components/CreateOfferModal';
import {
  Search,
  ChevronsUpDown,
  Home,
  Users,
  Globe,
  ImageIcon,
  FolderPlus,
  Presentation,
  Sparkles,
  Palette,
  Type,
  Trash2,
  Plus,
  Bell,
  MessageSquare,
  ChevronRight,
  LayoutTemplate,
  HardDrive,
  FileText,
  Upload
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import FolderModal from './FolderModal';
import { UserDropdown } from '../../components/UserDropdown';
import LanguageDropdown from '../../components/LanguageDropdown';
import { useLanguage } from '../../contexts/LanguageContext';
import SmartDriveConnectors from '../../components/SmartDrive/SmartDriveConnectors';
import WorkspaceMembers from '../../components/WorkspaceMembers';
import useFeaturePermission from '../../hooks/useFeaturePermission';
import LMSAccountCheckModal from '../../components/LMSAccountCheckModal';
import LMSAccountSetupWaiting from '../../components/LMSAccountSetupWaiting';
import LMSProductSelector from '../../components/LMSProductSelector';
import { LMSAccountStatus } from '../../types/lmsTypes';
import { useUserback } from '@/contexts/UserbackContext';
import { identifyUser, resetUserIdentity, trackPageView } from '@/lib/mixpanelClient';

// Authentication check function
const checkAuthentication = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/me', {
      credentials: 'same-origin',
    });
    if (response.ok) {
      const user = await response.json();
      console.log(user); //TODO: Remove this
      identifyUser(user.id);
    }
    return response.ok;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
};

const fetchFolders = async () => {
  const res = await fetch('/api/custom-projects-backend/projects/folders', {
    credentials: 'same-origin',
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error('UNAUTHORIZED');
    }
    throw new Error('Failed to fetch folders');
  }
  return res.json();
};

// Helper function to check if any modal is present in the DOM
const isAnyModalPresent = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Check for various modal selectors that might be present
  const modalSelectors = [
    '[data-modal-portal="true"]',
    '.fixed.inset-0.z-\\[9999\\]', // FolderModal and FolderSettingsModal
    '.fixed.inset-0.z-50', // Generic modals
    '.fixed.inset-0.bg-neutral-950', // Modal component
    '.fixed.inset-0.overflow-hidden.z-50', // SlideOverModal
    '.fixed.inset-0.bg-black', // Various modal overlays
    '[role="dialog"]',
    '[aria-modal="true"]'
  ];

  return modalSelectors.some(selector => {
    try {
      return document.querySelector(selector) !== null;
    } catch {
      return false;
    }
  });
};

// Helper function to get modal state - combines window flag and DOM detection
const getModalState = (): boolean => {
  const windowFlag = (typeof window !== 'undefined') ? (window as any).__modalOpen : false;
  const domDetection = isAnyModalPresent();
  return windowFlag || domDetection;
};

// Helper function to redirect to main app's auth endpoint
const redirectToMainAuth = (path: string) => {
  // Get the current domain and protocol
  const protocol = window.location.protocol;
  const host = window.location.host;
  const mainAppUrl = `${protocol}//${host}${path}`;
  window.location.href = mainAppUrl;
};

// Helper function to build folder tree from flat list
const buildFolderTree = (folders: any[]): Folder[] => {
  const folderMap = new Map<number, Folder>();
  const rootFolders: Folder[] = [];

  // First pass: create folder objects
  folders.forEach(folder => {
    folderMap.set(folder.id, {
      ...folder,
      children: []
    });
  });

  // Second pass: build tree structure
  folders.forEach(folder => {
    const folderObj = folderMap.get(folder.id)!;
    if (folder.parent_id === null || folder.parent_id === undefined) {
      rootFolders.push(folderObj);
    } else {
      const parent = folderMap.get(folder.parent_id);
      if (parent) {
        parent.children!.push(folderObj);
      }
    }
  });

  return rootFolders;
};

// Helper function to get tier color for folder icons
const getTierColor = (tier?: string): string => {
  switch (tier) {
    case 'basic':
      return '#22c55e'; // green-500
    case 'interactive':
      return '#f97316'; // orange-500
    case 'advanced':
      return '#a855f7'; // purple-500
    case 'immersive':
      return '#3b82f6'; // blue-500
    // Legacy tier support
    case 'starter':
      return '#22c55e'; // green-500 (mapped to basic)
    case 'medium':
      return '#f97316'; // orange-500 (mapped to interactive)
    case 'professional':
      return '#3b82f6'; // blue-500 (mapped to immersive)
    default:
      return '#f97316'; // orange-500 (interactive as default)
  }
};

// Helper function to get tier color for folder icons (inherited from parent)
const getFolderTierColor = (folder: Folder, folders: Folder[]): string => {
  // If folder has its own tier, use it
  if (folder.quality_tier) {
    return getTierColor(folder.quality_tier);
  }

  // Otherwise, inherit from parent folder
  if (folder.parent_id) {
    const parentFolder = folders.find(f => f.id === folder.parent_id);
    if (parentFolder) {
      return getFolderTierColor(parentFolder, folders);
    }
  }

  // Default to interactive tier
  return getTierColor('interactive');
};

// Helper function to count total items in a folder (projects + subfolders recursively)
const getTotalItemsInFolder = (folder: Folder, folderProjects?: Record<number, any[]>): number => {
  // If we have folderProjects data, use it for accurate counting (like list view)
  if (folderProjects) {
    const projectCount = folderProjects[folder.id]?.length || 0;

    // Recursively count items in all subfolders
    const subfolderItemsCount = folder.children?.reduce((total, childFolder) => {
      return total + getTotalItemsInFolder(childFolder, folderProjects);
    }, 0) || 0;

    return projectCount + subfolderItemsCount;
  }

  // Fallback to using project_count from backend (less accurate)
  const projectCount = folder.project_count || 0;

  // Recursively count items in all subfolders
  const subfolderItemsCount = folder.children?.reduce((total, childFolder) => {
    return total + getTotalItemsInFolder(childFolder);
  }, 0) || 0;

  return projectCount + subfolderItemsCount;
};

interface SidebarProps {
  currentTab: string;
  onFolderSelect: (folderId: number | null) => void;
  selectedFolderId: number | null;
  folders: any[];
  folderProjects?: Record<number, any[]>;
}

interface Folder {
  id: number;
  name: string;
  parent_id?: number | null;
  project_count: number;
  quality_tier?: string;
  children?: Folder[];
}



// Recursive folder component for nested display
const FolderItem: React.FC<{
  folder: Folder;
  level: number;
  selectedFolderId: number | null;
  onFolderSelect: (folderId: number | null) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, folderId: number) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  folderProjects?: Record<number, any[]>;
  allFolders: Folder[];
}> = ({ folder, level, selectedFolderId, onFolderSelect, onDragOver, onDrop, onDragEnter, onDragLeave, folderProjects, allFolders }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = folder.children && folder.children.length > 0;

  // Check if any modal is open - prevent dragging completely
  const isModalOpen = getModalState();

  const handleDragStart = (e: React.DragEvent) => {
    // Prevent dragging if any modal is open
    if (isModalOpen) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    e.dataTransfer.setData('application/json', JSON.stringify({
      folderId: folder.id,
      folderName: folder.name,
      type: 'folder'
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-all duration-200 border border-transparent ${!isModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          } ${selectedFolderId === folder.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-800'}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onFolderSelect(selectedFolderId === folder.id ? null : folder.id)}
        draggable={!isModalOpen}
        onDragStart={(e) => {
          if (isModalOpen) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          handleDragStart(e);
        }}
        onDragOver={(e) => {
          if (isModalOpen) {
            e.preventDefault();
            return;
          }
          onDragOver(e);
        }}
        onDrop={(e) => {
          if (isModalOpen) {
            e.preventDefault();
            return;
          }
          onDrop(e, folder.id);
        }}
        onDragEnter={(e) => {
          if (isModalOpen) {
            e.preventDefault();
            return;
          }
          onDragEnter(e);
        }}
        onDragLeave={(e) => {
          if (isModalOpen) {
            e.preventDefault();
            return;
          }
          onDragLeave(e);
        }}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
          >
            <ChevronRight
              size={16}
              className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''
                }`}
            />
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        <span style={{ color: getFolderTierColor(folder, allFolders) }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M3 7a2 2 0 0 1 2-2h3.172a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 12.828 7H19a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="font-medium truncate" style={{ maxWidth: '120px' }} title={folder.name}>{folder.name}</span>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {folder.children!.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              level={level + 1}
              selectedFolderId={selectedFolderId}
              onFolderSelect={onFolderSelect}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              folderProjects={folderProjects}
              allFolders={allFolders}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentTab, onFolderSelect, selectedFolderId, folders, folderProjects }) => {
  const router = useRouter();
  const { t } = useLanguage();
  const [folderSearch, setFolderSearch] = useState('');
  const { isEnabled: aiAuditEnabled } = useFeaturePermission('ai_audit_templates');

  // Check if any modal is open
  const isModalOpen = getModalState();

  // Get the 5 newest folders
  const getNewestFolders = (folders: any[]) => {
    return folders
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  };

  // Filter folders based on search
  const getFilteredFolders = (folders: any[]) => {
    if (!folderSearch.trim()) {
      return getNewestFolders(folders);
    }
    
    const searchTerm = folderSearch.toLowerCase();
    return folders.filter(folder => 
      folder.name.toLowerCase().includes(searchTerm)
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isModalOpen) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, folderId: number) => {
    if (isModalOpen) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-100', 'border-2', 'border-blue-300', 'scale-105');
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'project') {
        window.dispatchEvent(new CustomEvent('moveProjectToFolder', {
          detail: { projectId: data.projectId, folderId }
        }));
      } else if (data.type === 'folder') {
        window.dispatchEvent(new CustomEvent('moveFolderToFolder', {
          detail: { folderId: data.folderId, targetParentId: folderId }
        }));
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    if (isModalOpen) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    e.currentTarget.classList.add('bg-blue-100', 'border-2', 'border-blue-300', 'scale-105', 'shadow-lg');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (isModalOpen) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      e.currentTarget.classList.remove('bg-blue-100', 'border-2', 'border-blue-300', 'scale-105', 'shadow-lg');
    }
  };

  const filteredFolders = getFilteredFolders(folders);
  const isSearching = folderSearch.trim().length > 0;

  return (
    <aside className="w-64 bg-white p-4 flex flex-col fixed h-full border-r border-gray-200 text-sm">
      <div className="relative mb-6">
        <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-center shadow-sm">
          <svg height="35" viewBox="17.086 17.192 885.828 165.617" width="163" xmlns="http://www.w3.org/2000/svg">
            <path d="m855.963 159.337c0-12.962 10.524-23.478 23.479-23.478 12.962 0 23.472 10.516 23.472 23.478s-10.51 23.472-23.472 23.472c-12.955 0-23.479-10.51-23.479-23.472" fill="#86bc24" />
            <path d="m107.195 97.16c0-14.871-2.873-25.904-8.62-33.092-5.755-7.18-14.47-10.767-26.19-10.767h-12.465v90.938h9.538c13.016 0 22.554-3.86 28.628-11.604 6.066-7.73 9.11-19.558 9.11-35.475m44.456-1.55c0 27.093-7.282 47.97-21.848 62.623-14.565 14.66-35.04 21.99-61.434 21.99h-51.284v-162.343h54.865c25.448 0 45.095 6.665 58.94 19.987 13.839 13.329 20.761 32.568 20.761 57.745m142.058 84.61h40.808v-163.024h-40.808zm98.137-60.809c0 10.394 1.358 18.322 4.07 23.77 2.717 5.456 7.268 8.18 13.667 8.18 6.332 0 10.809-2.724 13.418-8.18 2.608-5.448 3.906-13.376 3.906-23.77 0-10.34-1.318-18.139-3.96-23.403-2.65-5.28-7.168-7.922-13.574-7.922-6.264 0-10.74 2.63-13.458 7.86-2.71 5.238-4.07 13.057-4.07 23.465m76.597 0c0 19.803-5.19 35.252-15.598 46.325-10.4 11.08-24.959 16.624-43.675 16.624-17.948 0-32.235-5.666-42.84-16.998-10.618-11.331-15.924-26.644-15.924-45.95 0-19.743 5.198-35.083 15.605-46.02 10.407-10.938 25-16.406 43.79-16.406 11.611 0 21.883 2.534 30.782 7.595 8.906 5.06 15.782 12.31 20.612 21.753 4.837 9.429 7.248 20.462 7.248 33.077m16.207 60.809h40.815v-121.094h-40.815zm-.002-135.742h40.816v-27.288h-40.816zm123.507 104.856c5.51 0 12.072-1.4 19.728-4.178v30.469c-5.503 2.418-10.734 4.15-15.707 5.176-4.972 1.04-10.808 1.556-17.486 1.556-13.703 0-23.58-3.444-29.647-10.32-6.04-6.874-9.069-17.431-9.069-31.677v-49.92h-14.294v-31.303h14.294v-30.925l41.128-7.153v38.077h26.04v31.305h-26.04v47.133c0 7.84 3.689 11.76 11.053 11.76m94.461 0c5.51 0 12.073-1.4 19.729-4.178v30.469c-5.496 2.418-10.734 4.15-15.707 5.176-4.98 1.04-10.794 1.556-17.486 1.556-13.702 0-23.58-3.444-29.634-10.32-6.052-6.874-9.082-17.431-9.082-31.677v-49.92h-14.3v-31.303h14.3v-31.393l41.12-6.685v38.077h26.054v31.305h-26.053v47.133c0 7.84 3.689 11.76 11.06 11.76m71.227-44.675c.557-6.63 2.453-11.488 5.686-14.592 3.248-3.098 7.256-4.647 12.052-4.647 5.231 0 9.389 1.739 12.473 5.244 3.104 3.485 4.721 8.153 4.85 13.995zm57.555-33.397c-9.702-9.51-23.465-14.273-41.27-14.273-18.717 0-33.12 5.469-43.215 16.406-10.088 10.938-15.135 26.63-15.135 47.08 0 19.802 5.455 35.074 16.338 45.794 10.89 10.72 26.182 16.087 45.876 16.087 9.457 0 17.596-.645 24.416-1.929 6.78-1.27 13.343-3.567 19.709-6.882l-6.271-27.29c-4.626 1.89-9.028 3.343-13.186 4.3-6.005 1.394-12.595 2.093-19.77 2.093-7.866 0-14.075-1.922-18.627-5.767-4.552-3.852-6.977-9.165-7.255-15.931h72.948v-18.594c0-17.887-4.85-31.59-14.558-41.094m-625.583 33.397c.557-6.63 2.453-11.488 5.686-14.592 3.24-3.098 7.255-4.647 12.059-4.647 5.217 0 9.375 1.739 12.466 5.244 3.104 3.485 4.714 8.153 4.857 13.995zm57.561-33.397c-9.708-9.51-23.465-14.273-41.277-14.273-18.723 0-33.118 5.469-43.207 16.406-10.088 10.938-15.142 26.63-15.142 47.08 0 19.802 5.448 35.074 16.345 45.794 10.883 10.72 26.175 16.087 45.87 16.087 9.456 0 17.595-.645 24.415-1.929 6.78-1.27 13.343-3.567 19.715-6.882l-6.277-27.29c-4.627 1.89-9.029 3.343-13.18 4.3-6.018 1.394-12.601 2.093-19.776 2.093-7.86 0-14.075-1.922-18.627-5.767-4.559-3.852-6.977-9.165-7.255-15.931h72.948v-18.594c0-17.887-4.85-31.59-14.552-41.094" fill="#0f0b0b" />
          </svg>
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        <Link
          href="/projects"
          className={`flex items-center gap-3 p-2 rounded-lg ${currentTab === 'products' && selectedFolderId === null ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}`}
          onClick={() => onFolderSelect(null)}
        >
          <Home size={18} />
          <span>{t('interface.products', 'Products')}</span>
        </Link>
        <Link
          href="/projects?tab=smart-drive"
          className={`flex items-center gap-3 p-2 rounded-lg ${currentTab === 'smart-drive' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}`}
          onClick={() => {
            trackPageView("Smart Drive");
            onFolderSelect(null);
          }}
        >
          <HardDrive size={18} />
          <span>{t('interface.smartDrive', 'Smart Drive')}</span>
        </Link>
        <Link
          href="/projects?tab=offers"
          className={`flex items-center gap-3 p-2 rounded-lg ${currentTab === 'offers' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}`}
          onClick={() => {
            trackPageView("Offers");
            onFolderSelect(null);
          }}
        >
          <FileText size={18} />
          <span>{t('interface.offers', 'Offers')}</span>
        </Link>
        <Link
          href="/projects?tab=workspace"
          className={`flex items-center gap-3 p-2 rounded-lg ${currentTab === 'workspace' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}`}
          onClick={() => onFolderSelect(null)}
        >
          <Users size={18} />
          <span>{t('interface.workspace', 'Workspace')}</span>
        </Link>
        <Link
          href="/projects?tab=export-lms"
          className={`flex items-center gap-3 p-2 rounded-lg ${currentTab === 'export-lms' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}`}
          onClick={() => {
            trackPageView("Export to LMS");
            onFolderSelect(null);
          }}
        >
          <Upload size={18} />
          <span>{t('interface.exportToLMS', 'Export to LMS')}</span>
        </Link>
      </nav>
      <div className="mt-4">
        <div className="flex justify-between items-center text-gray-500 font-semibold mb-2">
          <span>{isSearching ? t('interface.searchResults', 'Search Results') : t('interface.recentFolders', 'Recent Folders')}</span>
          <FolderPlus size={18} className="cursor-pointer hover:text-gray-800" onClick={() => window.dispatchEvent(new CustomEvent('openFolderModal'))} />
        </div>
        
        {/* Folder Search Bar */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('interface.searchFolders', 'Search folders...')}
            value={folderSearch}
            onChange={(e) => setFolderSearch(e.target.value)}
            className="w-full bg-gray-50 rounded-md pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 border border-gray-200 text-gray-700 placeholder-gray-500"
          />
        </div>

        {folders.length === 0 ? (
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <p className="mb-2 text-gray-700">{t('interface.organizeProducts', 'Organize your products by topic and share them with your team')}</p>
            <button className="font-semibold text-blue-600 hover:underline" onClick={() => window.dispatchEvent(new CustomEvent('openFolderModal'))}>{t('interface.createOrJoinFolder', 'Create or join a folder')}</button>
          </div>
        ) : filteredFolders.length === 0 ? (
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-gray-500 text-xs">{t('interface.noFoldersFound', 'No folders found')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filteredFolders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                level={0}
                selectedFolderId={selectedFolderId}
                onFolderSelect={onFolderSelect}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                folderProjects={folderProjects}
                allFolders={folders}
              />
            ))}

          </div>
        )}
      </div>
      <nav className="flex flex-col gap-1 mt-auto">
        {aiAuditEnabled && (
          <Link href="/create/ai-audit/questionnaire" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <LayoutTemplate size={18} />
            <span>{t('interface.templates', 'Templates')}</span>
          </Link>
        )}
        <Link href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <Palette size={18} />
          <span>{t('interface.themes', 'Themes')}</span>
        </Link>
        <Link href="/projects?tab=trash" className={`flex items-center gap-3 p-2 rounded-lg ${currentTab === 'trash' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}`}>
          <Trash2 size={18} />
          <span>{t('interface.trash', 'Trash')}</span>
        </Link>
      </nav>
    </aside>
  );
};

const Header = ({ isTrash, isSmartDrive, isOffers, isWorkspace, isExportLMS }: { isTrash: boolean; isSmartDrive: boolean; isOffers: boolean; isWorkspace: boolean; isExportLMS: boolean }) => {
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const { t } = useLanguage();

  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

  // Fetch user credits on component mount
  useEffect(() => {
    const fetchUserCredits = async () => {
      try {
        const response = await fetch(`${CUSTOM_BACKEND_URL}/credits/me`, {
          credentials: 'same-origin',
        });
        if (response.ok) {
          const credits = await response.json();
          setUserCredits(credits.credits_balance);
        }
      } catch (error) {
        console.error('Failed to fetch user credits:', error);
        // Keep userCredits as null to show loading state
      }
    };

    fetchUserCredits();
  }, []);

  const getHeaderTitle = () => {
    if (isTrash) return t('interface.trash', 'Trash');
    if (isSmartDrive) return t('interface.smartDrive', 'Smart Drive');
    if (isOffers) return t('interface.offers', 'Offers');
    if (isWorkspace) return t('interface.workspace', 'Workspace');
    if (isExportLMS) return t('interface.exportToLMS', 'Export to LMS');
    return t('interface.products', 'Products');
  };

  return (
    <header className="flex items-center justify-between p-4 px-8 border-b border-gray-200 bg-white sticky top-0 z-10">
      <h1 className="text-3xl font-bold text-gray-900">{getHeaderTitle()}</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-gray-800">
          {userCredits !== null ? `${userCredits} ${t('interface.credits', 'credits')}` : t('interface.loading', 'Loading...')}
        </span>
        <Bell size={20} className="text-gray-600 cursor-pointer" />
        <LanguageDropdown />
        <UserDropdown />
      </div>
    </header>
  );
};

// --- Inner client component that can read search params ---
const ProjectsPageInner: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const currentTab = searchParams?.get('tab') || 'products';
  const isTrash = currentTab === 'trash';
  const isSmartDrive = currentTab === 'smart-drive';
  const isOffers = currentTab === 'offers';
  const isWorkspace = currentTab === 'workspace';
  const isExportLMS = currentTab === 'export-lms';
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folders, setFolders] = useState<any[]>([]);
  const [folderProjects, setFolderProjects] = useState<Record<number, any[]>>({});
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateOfferModal, setShowCreateOfferModal] = useState(false);
  const [selectedClientForOffer, setSelectedClientForOffer] = useState<any>(null);
  
  // LMS Export states
  const [lmsAccountStatus, setLmsAccountStatus] = useState<LMSAccountStatus>('unknown');
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [showAccountModal, setShowAccountModal] = useState(false);

  // Userback instance
  const { userback } = useUserback();

  // Clear lesson context when user visits the projects page
  useEffect(() => {
    try {
      // Clear lesson context from sessionStorage
      sessionStorage.removeItem('lessonContext');
      sessionStorage.removeItem('lessonContextForDropdowns');
      sessionStorage.removeItem('activeProductType');
    } catch (error) {
      console.error('Error clearing lesson context:', error);
    }
  }, []);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await checkAuthentication();
        setIsAuthenticated(authenticated);

        if (!authenticated) {
          resetUserIdentity();
          // Redirect to main app's login with return URL
          const currentUrl = window.location.pathname + window.location.search;
          redirectToMainAuth(`/auth/login?next=${encodeURIComponent(currentUrl)}`);
          return;
        }
      } catch (error) {
        resetUserIdentity();
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
        const currentUrl = window.location.pathname + window.location.search;
        redirectToMainAuth(`/auth/login?next=${encodeURIComponent(currentUrl)}`);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Load folders and projects after authentication is confirmed
  useEffect(() => {
    if (isAuthenticated === true) {
      const loadFoldersAndProjects = async () => {
        try {
          const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
          const headers: HeadersInit = { 'Content-Type': 'application/json' };
          const devUserId = "dummy-onyx-user-id-for-testing";
          if (devUserId && process.env.NODE_ENV === 'development') {
            headers['X-Dev-Onyx-User-ID'] = devUserId;
          }

          // Fetch both folders and all projects in parallel
          const [foldersResponse, projectsResponse] = await Promise.all([
            fetch(`${CUSTOM_BACKEND_URL}/projects/folders`, { headers, cache: 'no-store', credentials: 'same-origin' }),
            fetch(`${CUSTOM_BACKEND_URL}/projects`, { headers, cache: 'no-store', credentials: 'same-origin' })
          ]);

          if (!foldersResponse.ok) {
            if (foldersResponse.status === 401 || foldersResponse.status === 403) {
              redirectToMainAuth('/auth/login');
              return;
            }
            throw new Error('Failed to fetch folders');
          }

          if (!projectsResponse.ok) {
            if (projectsResponse.status === 401 || projectsResponse.status === 403) {
              redirectToMainAuth('/auth/login');
              return;
            }
            throw new Error('Failed to fetch projects');
          }

          const foldersData = await foldersResponse.json();
          const projectsData = await projectsResponse.json();

          // Process projects to get folder mappings
          const folderProjectsMap: Record<number, any[]> = {};
          projectsData.forEach((project: any) => {
            if (project.folder_id) {
              if (!folderProjectsMap[project.folder_id]) {
                folderProjectsMap[project.folder_id] = [];
              }
              folderProjectsMap[project.folder_id].push(project);
            }
          });

          // Update folders with accurate project counts
          const updatedFolders = foldersData.map((folder: any) => ({
            ...folder,
            project_count: folderProjectsMap[folder.id]?.length || 0
          }));

          setFolders(updatedFolders);
          setFolderProjects(folderProjectsMap);

          // Debug logging
          console.log('Folder Projects Map:', folderProjectsMap);
          console.log('Updated Folders:', updatedFolders);
          console.log('Folder Tree:', buildFolderTree(updatedFolders));
        } catch (error) {
          if (error instanceof Error && error.message === 'UNAUTHORIZED') {
            redirectToMainAuth('/auth/login');
            return;
          }
          console.error('Error loading folders and projects:', error);
          setFolders([]);
          setFolderProjects({});
        }
      };

      loadFoldersAndProjects();
    }
  }, [isAuthenticated]);

  // Event listeners
  useEffect(() => {
    const handleOpenModal = () => setShowFolderModal(true);
    window.addEventListener('openFolderModal', handleOpenModal);
    return () => window.removeEventListener('openFolderModal', handleOpenModal);
  }, []);

  useEffect(() => {
    const handleMoveProject = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { projectId, folderId } = customEvent.detail;
      try {
        const res = await fetch(`/api/custom-projects-backend/projects/${projectId}/folder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ folder_id: folderId })
        });
        if (res.ok) {
          // Refresh folders to update project counts
          try {
            const updatedFolders = await fetchFolders();
            setFolders(updatedFolders);
          } catch (error) {
            if (error instanceof Error && error.message === 'UNAUTHORIZED') {
              redirectToMainAuth('/auth/login');
              return;
            }
            console.error('Error refreshing folders:', error);
          }
          // Trigger a refresh of the projects table
          window.dispatchEvent(new CustomEvent('refreshProjects'));
          console.log(`Project moved to folder ${folderId} successfully`);
        } else if (res.status === 401 || res.status === 403) {
          redirectToMainAuth('/auth/login');
        }
      } catch (error) {
        console.error('Error moving project to folder:', error);
      }
    };

    const handleMoveFolder = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { folderId, targetParentId } = customEvent.detail;
      try {
        const res = await fetch(`/api/custom-projects-backend/projects/folders/${folderId}/move`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ parent_id: targetParentId })
        });
        if (res.ok) {
          // Refresh folders to update the tree structure
          try {
            const updatedFolders = await fetchFolders();
            setFolders(updatedFolders);
          } catch (error) {
            if (error instanceof Error && error.message === 'UNAUTHORIZED') {
              redirectToMainAuth('/auth/login');
              return;
            }
            console.error('Error refreshing folders:', error);
          }
          console.log(`Folder moved to parent ${targetParentId} successfully`);
        } else if (res.status === 401 || res.status === 403) {
          redirectToMainAuth('/auth/login');
        } else {
          const errorData = await res.json();
          alert(`Error moving folder: ${errorData.detail || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error moving folder:', error);
        alert('Failed to move folder');
      }
    };

    const handleOpenCreateOfferModal = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { folder } = customEvent.detail;
      setSelectedClientForOffer(folder);
      setShowCreateOfferModal(true);
    };

    window.addEventListener('moveProjectToFolder', handleMoveProject);
    window.addEventListener('moveFolderToFolder', handleMoveFolder);
    window.addEventListener('openCreateOfferModal', handleOpenCreateOfferModal);
    return () => {
      window.removeEventListener('moveProjectToFolder', handleMoveProject);
      window.removeEventListener('moveFolderToFolder', handleMoveFolder);
      window.removeEventListener('openCreateOfferModal', handleOpenCreateOfferModal);
    };
  }, []);

  const handleFolderCreated = (newFolder: any) => {
    setFolders((prev) => [...prev, { ...newFolder, project_count: 0 }]);
    setShowFolderModal(false);
  };

  const handleOfferCreated = () => {
    setShowCreateOfferModal(false);
    setSelectedClientForOffer(null);
    // Optionally refresh the offers if on offers tab
    if (isOffers) {
      // The OffersTable component will refresh itself
      window.location.reload();
    }
  };

  // LMS Export handlers
  const handleLMSAccountStatus = (status: LMSAccountStatus) => {
    setLmsAccountStatus(status);
  };

  const handleProductToggle = (productId: number) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleSelectAllProducts = () => {
    // This would need to be implemented with the actual products list
    // For now, it's a placeholder
  };

  const handleDeselectAllProducts = () => {
    setSelectedProducts(new Set());
  };

  // Show account modal when first visiting LMS tab
  useEffect(() => {
    if (isExportLMS && lmsAccountStatus === 'unknown') {
      setShowAccountModal(true);
    }
  }, [isExportLMS, lmsAccountStatus]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="bg-[#F7F7F7] min-h-screen font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('interface.checkingAuthentication', 'Checking authentication...')}</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (isAuthenticated === false) {
    return null;
  }

  return (
    <div className="bg-[#F7F7F7] min-h-screen font-sans">
      <Sidebar currentTab={currentTab} onFolderSelect={setSelectedFolderId} selectedFolderId={selectedFolderId} folders={folders} folderProjects={folderProjects} />
      <div className="ml-64 flex flex-col h-screen">
        <Header isTrash={isTrash} isSmartDrive={isSmartDrive} isOffers={isOffers} isWorkspace={isWorkspace} isExportLMS={isExportLMS} />
        <main className="flex-1 overflow-y-auto p-8">
          {isSmartDrive ? (
            <SmartDriveConnectors />
          ) : isOffers ? (
            <OffersTable companyId={selectedFolderId} />
          ) : isWorkspace ? (
            <WorkspaceMembers />
          ) : isExportLMS ? (
            <>
              {lmsAccountStatus === 'no-account' && (
                <LMSAccountSetupWaiting onSetupComplete={handleLMSAccountStatus} />
              )}
              {(lmsAccountStatus === 'has-account' || lmsAccountStatus === 'setup-complete') && (
                <LMSProductSelector
                  selectedProducts={selectedProducts}
                  onProductToggle={handleProductToggle}
                  onSelectAll={handleSelectAllProducts}
                  onDeselectAll={handleDeselectAllProducts}
                />
              )}
            </>
          ) : (
            <ProjectsTable trashMode={isTrash} folderId={selectedFolderId} />
          )}
        </main>
        <div className="fixed bottom-4 right-4">
          <button
            type="button"
            className="w-9 h-9 rounded-full border-[0.5px] border-[#63A2FF] text-[#000d4e] flex items-center justify-center select-none font-bold hover:bg-[#f0f7ff] active:scale-95 transition"
            aria-label="Help"
            onClick={() => userback?.openForm()}
          >
            ?
          </button>
        </div>
      </div>
      <FolderModal open={showFolderModal} onClose={() => setShowFolderModal(false)} onFolderCreated={handleFolderCreated} existingFolders={folders} />
      {showCreateOfferModal && (
        <CreateOfferModal
          onClose={() => setShowCreateOfferModal(false)}
          onOfferCreated={handleOfferCreated}
          selectedClient={selectedClientForOffer}
        />
      )}
      <LMSAccountCheckModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onAccountStatus={handleLMSAccountStatus}
      />
    </div>
  );
};

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading Projects...</div>}>
      <ProjectsPageInner />
    </Suspense>
  );
}