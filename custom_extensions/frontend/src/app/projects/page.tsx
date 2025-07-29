// custom_extensions/frontend/src/app/projects/page.tsx 
"use client";

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import ProjectsTable from '../../components/ProjectsTable';
import { 
  Search, 
  ChevronsUpDown, 
  Home, 
  Users, 
  Globe, 
  ImageIcon,
  FolderPlus,
  LayoutTemplate,
  Sparkles,
  Palette,
  Type,
  Trash2,
  Plus,
  Bell,
  MessageSquare,
  ChevronRight,
  MoreHorizontal,
  PenLine,
  Settings,
  Download,
  Share2
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import FolderModal from './FolderModal';
import { UserDropdown } from '../../components/UserDropdown';
import LanguageDropdown from '../../components/LanguageDropdown';
import { useLanguage } from '../../contexts/LanguageContext';

// Authentication check function
const checkAuthentication = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/me', {
      credentials: 'same-origin',
    });
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
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<'above' | 'below'>('below');
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
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

  const handleMenuToggle = () => {
    if (!menuOpen && buttonRef.current) {
      // Calculate if there's enough space below
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const menuHeight = 200; // Approximate menu height
      
      setMenuPosition(spaceBelow < menuHeight ? 'above' : 'below');
    }
    setMenuOpen(prev => {
      if (!prev && typeof window !== 'undefined') (window as any).__modalOpen = true;
      if (prev && typeof window !== 'undefined') (window as any).__modalOpen = false;
      return !prev;
    });
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // Check if the click is on the portal modal
        const target = event.target as Element;
        if (target.closest('[data-modal-portal]')) {
          return; // Don't close if clicking inside the modal
        }
        setMenuOpen(false);
        if (typeof window !== 'undefined') (window as any).__modalOpen = false;
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (typeof window !== 'undefined') (window as any).__modalOpen = false;
    };
  }, []);

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuOpen(false);
    if (typeof window !== 'undefined') (window as any).__modalOpen = false;
    setRenameModalOpen(true);
  };

  const handleRename = async () => {
    if (!newName.trim()) {
      setRenameModalOpen(false);
      return;
    }

    setIsRenaming(true);
    try {
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const devUserId = "dummy-onyx-user-id-for-testing";
      if (devUserId && process.env.NODE_ENV === 'development') {
        headers['X-Dev-Onyx-User-ID'] = devUserId;
      }

      const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/folders/${folder.id}`, {
        method: 'PATCH',
        headers,
        credentials: 'same-origin',
        body: JSON.stringify({ name: newName.trim() })
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          redirectToMainAuth('/auth/login');
          return;
        }
        throw new Error(`Failed to rename folder: ${response.status}`);
      }

      setRenameModalOpen(false);
      // Refresh the page to update the view
      window.location.reload();
    } catch (error) {
      console.error('Error renaming folder:', error);
      alert('Failed to rename folder');
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <div>
      <div
        className={`group flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-all duration-200 border border-transparent ${
          !isModalOpen ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
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
              className={`transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        <span style={{ color: getFolderTierColor(folder, allFolders) }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M3 7a2 2 0 0 1 2-2h3.172a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 12.828 7H19a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span className="font-medium truncate flex-1" style={{ maxWidth: '120px' }} title={folder.name}>{folder.name}</span>
        <div ref={menuRef} className="inline-block">
          <button 
            ref={buttonRef}
            className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" 
            onClick={(e) => {
              e.stopPropagation();
              handleMenuToggle();
            }}
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && createPortal(
            <div 
              data-modal-portal="true"
              className={`fixed w-60 bg-white rounded-lg shadow-2xl z-[9999] border border-gray-100 p-1 ${
                menuPosition === 'above' 
                  ? 'bottom-auto mb-2' 
                  : 'top-auto mt-2'
              }`}
              style={{
                left: buttonRef.current ? buttonRef.current.getBoundingClientRect().right - 240 : 0,
                top: buttonRef.current ? (menuPosition === 'above' 
                  ? buttonRef.current.getBoundingClientRect().top - 220
                  : buttonRef.current.getBoundingClientRect().bottom + 8) : 0
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="font-semibold text-sm text-gray-900 truncate">{folder.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {getTotalItemsInFolder(folder, folderProjects)} items
                </p>
              </div>
              <div className="py-1">
                <button className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                  <Share2 size={16} className="text-gray-500" />
                  <span>{t('actions.share', 'Share')}</span>
                </button>
                <button 
                  onClick={handleRenameClick}
                  className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <PenLine size={16} className="text-gray-500" />
                  <span>{t('actions.rename', 'Rename')}</span>
                </button>
                <button className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                  <Settings size={16} className="text-gray-500" />
                  <span>{t('actions.settings', 'Settings')}</span>
                </button>
                <button className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                  <Download size={16} className="text-gray-500" />
                  <span>{t('actions.export', 'Export as file')}</span>
                </button>
              </div>
              <div className="py-1 border-t border-gray-100">
                <button className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md">
                  <Trash2 size={14} />
                  <span>{t('actions.delete', 'Delete')}</span>
                </button>
              </div>
            </div>,
            document.body
          )}
        </div>
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

      {/* ---------------- Rename Modal ---------------- */}
      {renameModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-40" onClick={() => { if (!isRenaming) setRenameModalOpen(false); }}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h4 className="font-semibold text-lg mb-4 text-gray-900">{t('actions.rename', 'Rename')}</h4>

            <div className="mb-6">
              <label htmlFor="newName" className="block text-sm font-medium text-gray-700 mb-1">{t('actions.newName', 'New Name:')}</label>
              <input
                id="newName"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => { if (!isRenaming) setRenameModalOpen(false); }}
                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800"
                disabled={isRenaming}
              >
                {t('actions.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleRename}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                disabled={isRenaming || !newName.trim()}
              >
                {isRenaming ? t('actions.saving', 'Saving...') : t('actions.rename', 'Rename')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentTab, onFolderSelect, selectedFolderId, folders, folderProjects }) => {
  const router = useRouter();
  const { t } = useLanguage();

  // Check if any modal is open
  const isModalOpen = getModalState();

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

  return (
    <aside className="w-64 bg-white p-4 flex flex-col fixed h-full border-r border-gray-200 text-sm">
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={t('interface.jumpTo', 'Jump to')}
          className="w-full bg-gray-100 rounded-md pl-8 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs border border-gray-300 rounded-sm px-1">{t('interface.keyboardShortcut', '⌘+K')}</div>
      </div>
      <nav className="flex flex-col gap-1">
        <Link 
          href="/projects" 
          className={`flex items-center gap-3 p-2 rounded-lg ${currentTab === 'products' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}`}
          onClick={() => onFolderSelect(null)}
        >
          <Home size={18} />
          <span>{t('interface.products', 'Products')}</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <Users size={18} />
          <span>{t('interface.sharedWithYou', 'Shared with you')}</span>
        </Link>
      </nav>
      <div className="mt-4">
        <div className="flex justify-between items-center text-gray-500 font-semibold mb-2">
          <span>{t('interface.folders', 'Folders')}</span>
          <FolderPlus size={18} className="cursor-pointer hover:text-gray-800" onClick={() => window.dispatchEvent(new CustomEvent('openFolderModal'))} />
        </div>
        {folders.length === 0 ? (
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <p className="mb-2 text-gray-700">{t('interface.organizeProducts', 'Organize your products by topic and share them with your team')}</p>
            <button className="font-semibold text-blue-600 hover:underline" onClick={() => window.dispatchEvent(new CustomEvent('openFolderModal'))}>{t('interface.createOrJoinFolder', 'Create or join a folder')}</button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {buildFolderTree(folders).map((folder) => (
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
         <Link href="/create/ai-audit/questionnaire" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <LayoutTemplate size={18} />
          <span>{t('interface.templates', 'Templates')}</span>
        </Link>
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

const Header = ({ isTrash }: { isTrash: boolean }) => {
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

  return (
    <header className="flex items-center justify-between p-4 px-8 border-b border-gray-200 bg-white sticky top-0 z-10">
      <h1 className="text-3xl font-bold text-gray-900">{isTrash ? t('interface.trash', 'Trash') : t('interface.products', 'Products')}</h1>
      <div className="flex items-center gap-4">
        <Link href="#" className="text-sm font-semibold flex items-center gap-1 text-purple-600">
          <Sparkles size={16} className="text-yellow-500" />
          {t('interface.getUnlimitedAI', 'Get unlimited AI')}
        </Link>
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
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folders, setFolders] = useState<any[]>([]);
  const [folderProjects, setFolderProjects] = useState<Record<number, any[]>>({});
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Clear lesson context when user visits the projects page
  useEffect(() => {
    try {
      // Clear lesson context from sessionStorage
      sessionStorage.removeItem('lessonContext');
      sessionStorage.removeItem('lessonContextForDropdowns');
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
          // Redirect to main app's login with return URL
          const currentUrl = window.location.pathname + window.location.search;
          redirectToMainAuth(`/auth/login?next=${encodeURIComponent(currentUrl)}`);
          return;
        }
      } catch (error) {
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

    window.addEventListener('moveProjectToFolder', handleMoveProject);
    window.addEventListener('moveFolderToFolder', handleMoveFolder);
    return () => {
      window.removeEventListener('moveProjectToFolder', handleMoveProject);
      window.removeEventListener('moveFolderToFolder', handleMoveFolder);
    };
  }, []);

  const handleFolderCreated = (newFolder: any) => {
    setFolders((prev) => [...prev, { ...newFolder, project_count: 0 }]);
    setShowFolderModal(false);
  };

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
        <Header isTrash={isTrash} />
        <main className="flex-1 overflow-y-auto p-8">
          <ProjectsTable trashMode={isTrash} folderId={selectedFolderId} />
        </main>
        <div className="fixed bottom-4 right-4">
          <button
            type="button"
            className="w-9 h-9 rounded-full border-[0.5px] border-[#63A2FF] text-[#000d4e] flex items-center justify-center select-none font-bold hover:bg-[#f0f7ff] active:scale-95 transition"
            aria-label="Help"
          >
            ?
          </button>
        </div>
      </div>
      <FolderModal open={showFolderModal} onClose={() => setShowFolderModal(false)} onFolderCreated={handleFolderCreated} existingFolders={folders} />
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