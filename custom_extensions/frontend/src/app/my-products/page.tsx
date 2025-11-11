"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export const dynamic = "force-dynamic";
import {
  FolderPlus,
  Plus,
  FileText,
  Bell,
  Coins,
  Home,
  Users,
  HardDrive,
  Upload,
  ClipboardCheck,
  Search,
  ChevronRight,
  Trash2,
  Presentation
} from 'lucide-react';
import { UserDropdown } from '../../components/UserDropdown';
import LanguageDropdown from '../../components/LanguageDropdown';
import { useLanguage } from '../../contexts/LanguageContext';
import TariffPlanModal from '@/components/ui/tariff-plan-modal';
import AddOnsModal from '../../components/AddOnsModal';
import RegistrationSurveyModal from "../../components/ui/registration-survey-modal";
import MyProductsTable from '../../components/MyProductsTable';
import FolderModal from '../projects/FolderModal';
import { Button } from '@/components/ui/button';
import useFeaturePermission from '../../hooks/useFeaturePermission';

interface User {
  id: string;
  email: string;
}

// Authentication check function
const checkAuthentication = async (): Promise<User | null> => {
  try {
    const response = await fetch('/api/me', {
      credentials: 'same-origin',
    });
    if (!response.ok) {
      return null;
    }
    const userData = await response.json();

    if (!userData || !userData.id || !userData.email) {
      return null;
    }

    return {
      id: userData.id,
      email: userData.email,
    };
  } catch (error) {
    console.error('Authentication check failed:', error);
    return null;
  }
};

// Check if user completed the questionnaire
const checkQuestionnaireCompletion = async (userId: string): Promise<boolean> => {
  try {
    if (!userId) {
      return true; // Default to true if no user ID
    }
    const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
    const response = await fetch(`${CUSTOM_BACKEND_URL}/questionnaires/${userId}/completion`, { credentials: 'same-origin' });
    if (!response.ok) {
      return true; // Default to true if request fails
    }
    const data = await response.json();
    return !!data.completed;
  } catch (error) {
    console.error('Questionnaire check failed:', error);
    return true; // Default to true to avoid blocking access on error
  }
};

// Helper function to redirect to main app's auth endpoint
const redirectToMainAuth = (path: string) => {
  // Get the current domain and protocol
  const protocol = window.location.protocol;
  const host = window.location.host;
  const mainAppUrl = `${protocol}//${host}${path}`;
  window.location.href = mainAppUrl;
};

// Fetch folders function
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

// Helper function to build folder tree from flat list
const buildFolderTree = (folders: any[]): Folder[] => {
  if (!folders || !Array.isArray(folders)) {
    return [];
  }

  const folderMap = new Map<number, Folder>();
  const rootFolders: Folder[] = [];

  // First pass: create folder objects
  folders.forEach(folder => {
    if (folder && folder.id) {
      folderMap.set(folder.id, {
        ...folder,
        children: []
      });
    }
  });

  // Second pass: build tree structure
  folders.forEach(folder => {
    if (folder && folder.id) {
      const folderObj = folderMap.get(folder.id);
      if (folderObj) {
        if (folder.parent_id === null || folder.parent_id === undefined) {
          rootFolders.push(folderObj);
        } else {
          const parent = folderMap.get(folder.parent_id);
          if (parent) {
            parent.children!.push(folderObj);
          }
        }
      }
    }
  });

  return rootFolders;
};

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
  allFolders: Folder[];
}> = ({ folder, level, selectedFolderId, onFolderSelect, allFolders }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = folder.children && folder.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-all duration-200 border border-transparent ${selectedFolderId === folder.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-800'}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onFolderSelect(selectedFolderId === folder.id ? null : folder.id)}
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
              className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            />
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        <span className="text-orange-500">
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
              allFolders={allFolders}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SidebarProps {
  onFolderSelect: (folderId: number | null) => void;
  selectedFolderId: number | null;
  folders: any[];
}

const Sidebar: React.FC<SidebarProps> = ({ onFolderSelect, selectedFolderId, folders }) => {
  const router = useRouter();
  const { t } = useLanguage();
  const [folderSearch, setFolderSearch] = useState('');
  const { isEnabled: aiAuditEnabled } = useFeaturePermission('ai_audit_templates');
  const { isEnabled: deloitteBannerEnabled } = useFeaturePermission('deloitte_banner');
  const { isEnabled: offersTabEnabled } = useFeaturePermission('offers_tab');
  const { isEnabled: workspaceTabEnabled } = useFeaturePermission('workspace_tab');
  const { isEnabled: exportToLMSEnabled } = useFeaturePermission('export_to_lms');
  const { isEnabled: eventPostersEnabled } = useFeaturePermission('event_posters');

  // Get the 5 newest folders
  const getNewestFolders = (folders: any[]) => {
    if (!folders || !Array.isArray(folders)) {
      return [];
    }
    return folders
      .filter(folder => folder && folder.created_at)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  };

  // Filter folders based on search
  const getFilteredFolders = (folders: any[]) => {
    if (!folders || !Array.isArray(folders)) {
      return [];
    }
    if (!folderSearch.trim()) {
      return getNewestFolders(folders);
    }
    
    const searchTerm = folderSearch.toLowerCase();
    return folders.filter(folder => 
      folder && folder.name && folder.name.toLowerCase().includes(searchTerm)
    );
  };

  const filteredFolders = getFilteredFolders(folders);
  const isSearching = folderSearch.trim().length > 0;

  return (
    <aside className="w-64 bg-[#EEEEEE] p-4 flex flex-col fixed h-full border-r border-gray-200 text-sm z-40">
      <div className="relative mb-6">
        {deloitteBannerEnabled ? (
          <div className="w-full rounded-lg shadow-sm border border-gray-200 px-4 py-2 gap-2 flex items-center justify-center">
            <svg height="20" viewBox="17.086 17.192 885.828 165.617" width="163" xmlns="http://www.w3.org/2000/svg">
              <path d="m855.963 159.337c0-12.962 10.524-23.478 23.479-23.478 12.962 0 23.472 10.516 23.472 23.478s-10.51 23.472-23.472 23.472c-12.955 0-23.479-10.51-23.479-23.472" fill="#86bc24" />
              <path d="m107.195 97.16c0-14.871-2.873-25.904-8.62-33.092-5.755-7.18-14.47-10.767-26.19-10.767h-12.465v90.938h9.538c13.016 0 22.554-3.86 28.628-11.604 6.066-7.73 9.11-19.558 9.11-35.475m44.456-1.55c0 27.093-7.282 47.97-21.848 62.623-14.565 14.66-35.04 21.99-61.434 21.99h-51.284v-162.343h54.865c25.448 0 45.095 6.665 58.94 19.987 13.839 13.329 20.761 32.568 20.761 57.745m142.058 84.61h40.808v-163.024h-40.808zm98.137-60.809c0 10.394 1.358 18.322 4.07 23.77 2.717 5.456 7.268 8.18 13.667 8.18 6.332 0 10.809-2.724 13.418-8.18 2.608-5.448 3.906-13.376 3.906-23.77 0-10.34-1.318-18.139-3.96-23.403-2.65-5.28-7.168-7.922-13.574-7.922-6.264 0-10.74 2.63-13.458 7.86-2.71 5.238-4.07 13.057-4.07 23.465m76.597 0c0 19.803-5.19 35.252-15.598 46.325-10.4 11.08-24.959 16.624-43.675 16.624-17.948 0-32.235-5.666-42.84-16.998-10.618-11.331-15.924-26.644-15.924-45.95 0-19.743 5.198-35.083 15.605-46.02 10.407-10.938 25-16.406 43.79-16.406 11.611 0 21.883 2.534 30.782 7.595 8.906 5.06 15.782 12.31 20.612 21.753 4.837 9.429 7.248 20.462 7.248 33.077m16.207 60.809h40.815v-121.094h-40.815zm-.002-135.742h40.816v-27.288h-40.816zm123.507 104.856c5.51 0 12.072-1.4 19.728-4.178v30.469c-5.503 2.418-10.734 4.15-15.707 5.176-4.972 1.04-10.808 1.556-17.486 1.556-13.703 0-23.58-3.444-29.647-10.32-6.04-6.874-9.069-17.431-9.069-31.677v-49.92h-14.294v-31.303h14.294v-30.925l41.128-7.153v38.077h26.04v31.305h-26.04v47.133c0 7.84 3.689 11.76 11.053 11.76m94.461 0c5.51 0 12.073-1.4 19.729-4.178v30.469c-5.496 2.418-10.734 4.15-15.707 5.176-4.98 1.04-10.794 1.556-17.486 1.556-13.702 0-23.58-3.444-29.634-10.32-6.052-6.874-9.082-17.431-9.082-31.677v-49.92h-14.294v-31.303h14.294v-31.393l41.12-6.685v38.077h26.054v31.305h-26.053v47.133c0 7.84 3.689 11.76 11.06 11.76m71.227-44.675c.557-6.63 2.453-11.488 5.686-14.592 3.248-3.098 7.256-4.647 12.052-4.647 5.231 0 9.389 1.739 12.473 5.244 3.104 3.485 4.721 8.153 4.85 13.995zm57.555-33.397c-9.702-9.51-23.465-14.273-41.27-14.273-18.717 0-33.12 5.469-43.215 16.406-10.088 10.938-15.135 26.63-15.135 47.08 0 19.802 5.455 35.074 16.338 45.794 10.89 10.72 26.182 16.087 45.876 16.087 9.457 0 17.596-.645 24.416-1.929 6.78-1.27 13.343-3.567 19.709-6.882l-6.271-27.29c-4.626 1.89-9.028 3.343-13.186 4.3-6.005 1.394-12.595 2.093-19.77 2.093-7.866 0-14.075-1.922-18.627-5.767-4.552-3.852-6.977-9.165-7.255-15.931h72.948v-18.594c0-17.887-4.85-31.59-14.558-41.094m-625.583 33.397c.557-6.63 2.453-11.488 5.686-14.592 3.24-3.098 7.255-4.647 12.059-4.647 5.217 0 9.375 1.739 12.466 5.244 3.104 3.485 4.714 8.153 4.857 13.995zm57.561-33.397c-9.708-9.51-23.465-14.273-41.277-14.273-18.723 0-33.118 5.469-43.207 16.406-10.088 10.938-15.142 26.63-15.142 47.08 0 19.802 5.448 35.074 16.345 45.794 10.883 10.72 26.175 16.087 45.87 16.087 9.456 0 17.595-.645 24.415-1.929 6.78-1.27 13.343-3.567 19.715-6.882l-6.277-27.29c-4.627 1.89-9.029 3.343-13.18 4.3-6.018 1.394-12.601 2.093-19.776 2.093-7.86 0-14.075-1.922-18.627-5.767-4.559-3.852-6.977-9.165-7.255-15.931h72.948v-18.594c0-17.887-4.85-31.59-14.552-41.094" fill="#0f0b0b" />
            </svg>
          </div>
        ) : (
          <div className="rounded-lg shadow-sm border border-gray-200 px-4 py-2 gap-2 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 16 20" fill="none">
            <path d="M12.6963 11.831L10.5205 10.4425C10.7998 9.65925 10.7368 8.78439 10.3321 8.04194L12.1168 6.47327C13.0972 7.07503 14.4037 6.95757 15.256 6.11902C16.248 5.143 16.248 3.56044 15.256 2.58438C14.2639 1.60832 12.6553 1.60832 11.6633 2.58438C10.8818 3.35329 10.7164 4.4981 11.1659 5.42681L9.38103 6.99572C8.52665 6.41397 7.43676 6.31227 6.50015 6.69182L4.44195 3.90514C5.18026 2.95143 5.10743 1.58407 4.22185 0.712658C3.25607 -0.237553 1.69021 -0.237553 0.724374 0.712658C-0.241458 1.66292 -0.241458 3.20358 0.724374 4.15379C1.41786 4.8361 2.42044 5.02835 3.28829 4.73105L5.34675 7.51798C4.33025 8.69104 4.38442 10.4545 5.5115 11.5633C5.53315 11.5846 5.55541 11.6046 5.57772 11.6252L3.58345 15.0689C2.75458 14.8761 1.84648 15.0971 1.20005 15.7332C0.207993 16.7093 0.207993 18.292 1.20005 19.268C2.1921 20.244 3.80065 20.244 4.79266 19.268C5.77434 18.3022 5.78405 16.7428 4.82279 15.7645L6.81691 12.3211C7.81832 12.604 8.93798 12.37 9.74277 11.6194L11.9207 13.0089C11.7816 13.6442 11.9624 14.3339 12.4642 14.8276C13.2504 15.601 14.5247 15.601 15.3107 14.8276C16.0968 14.0542 16.0968 12.8004 15.3107 12.027C14.598 11.326 13.4839 11.2606 12.6963 11.831ZM2.06068 16.9455C2.01235 16.9994 1.96687 17.0503 1.92225 17.0941C1.86665 17.1488 1.79068 17.2154 1.69641 17.244C1.57799 17.28 1.45699 17.2483 1.36425 17.1571C1.12173 16.9185 1.21448 16.4671 1.58003 16.1076C1.94568 15.7479 2.40428 15.6566 2.64689 15.8953C2.73958 15.9864 2.77175 16.1055 2.73516 16.2221C2.70609 16.3148 2.6384 16.3898 2.58286 16.4443C2.53824 16.4881 2.4865 16.5328 2.43167 16.5804C2.3684 16.6352 2.30284 16.6918 2.2383 16.7552C2.17381 16.8187 2.11633 16.8832 2.06068 16.9455ZM12.0433 2.95853C12.4088 2.59888 12.8675 2.50753 13.11 2.74618C13.2027 2.83733 13.235 2.95643 13.1983 3.07303C13.1692 3.16583 13.1015 3.24073 13.046 3.29534C13.0015 3.33909 12.9498 3.38384 12.8949 3.43134C12.8315 3.48619 12.7661 3.54279 12.7015 3.60624C12.6369 3.66979 12.5794 3.73434 12.5236 3.79664C12.4755 3.85044 12.4298 3.90149 12.3854 3.94529C12.3299 3.99994 12.2537 4.06654 12.1595 4.09519C12.0409 4.13114 11.92 4.09949 11.8273 4.00824C11.5849 3.76959 11.6777 3.31814 12.0433 2.95853ZM1.56229 1.89272C1.51513 1.94522 1.47087 1.99482 1.42772 2.03747C1.3737 2.09062 1.2996 2.15537 1.20772 2.18342C1.09241 2.21832 0.974611 2.18757 0.884304 2.09887C0.648195 1.86652 0.738654 1.42707 1.0946 1.07696C1.45049 0.726758 1.89694 0.637857 2.13315 0.870209C2.22341 0.95901 2.25486 1.07496 2.21914 1.18836C2.19063 1.27871 2.12492 1.35161 2.07085 1.40466C2.02745 1.44737 1.97703 1.49102 1.92367 1.53707C1.86203 1.59037 1.7982 1.64557 1.73543 1.70737C1.67257 1.76922 1.61641 1.83212 1.56229 1.89272ZM5.96558 7.78808C6.40227 7.35838 6.95001 7.24938 7.23979 7.53443C7.35057 7.64348 7.38904 7.78563 7.34539 7.92493C7.31042 8.03584 7.22967 8.12519 7.1633 8.19054C7.11009 8.24289 7.04819 8.29614 6.98274 8.35294C6.90722 8.41849 6.82896 8.48604 6.75181 8.56189C6.67467 8.63784 6.60596 8.71479 6.53949 8.78924C6.48176 8.85359 6.42743 8.91449 6.37427 8.96674C6.3079 9.03224 6.21709 9.11155 6.10437 9.14585C5.96289 9.1888 5.81835 9.15105 5.70741 9.042C5.41784 8.75669 5.52888 8.21779 5.96558 7.78808ZM13.0368 13.1053C12.9927 13.1486 12.9323 13.2014 12.8577 13.2241C12.7639 13.2525 12.6682 13.2275 12.5946 13.1552C12.4023 12.9662 12.4758 12.6086 12.7656 12.3236C13.0551 12.0386 13.4186 11.9663 13.6108 12.1555C13.6841 12.2276 13.7097 12.322 13.6807 12.4144C13.6577 12.488 13.604 12.5472 13.56 12.5905C13.5248 12.6251 13.4838 12.6606 13.4404 12.6982C13.3904 12.7415 13.3383 12.7865 13.2872 12.8368C13.2361 12.8871 13.1903 12.9381 13.1464 12.9876C13.1081 13.0303 13.072 13.0706 13.0368 13.1053Z" fill="#0F58F9"/>
            </svg>
            <span className="font-black text-[#0F58F9] text-base">ContentBuilder</span>
          </div>
        )}
      </div>
      <nav className="flex flex-col gap-1">
        <Link
          href="/projects"
          className="flex text-sm font-semibold items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-900"
        >
          <Home size={18} strokeWidth={1.5} className='font-normal' />
          <span>Home</span>
        </Link>
        <Link
          href="/my-products"
          className="flex text-sm font-semibold items-center gap-3 p-2 rounded-lg bg-[#CCDBFC] text-[#0F58F9]"
        >
          <FileText size={18} strokeWidth={1.5} className='font-normal' />
          <span>My products</span>
        </Link>
        <Link
          href="/projects?tab=smart-drive"
          className="flex text-sm font-semibold items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-900"
        >
          <HardDrive size={18} strokeWidth={1.5} className='font-normal' />
          <span>{t('interface.smartDrive', 'Smart Drive')}</span>
        </Link>
        {offersTabEnabled && (
          <Link
            href="/projects?tab=offers"
            className="flex text-sm font-semibold items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-900"
          >
            <FileText size={18} strokeWidth={1.5} className='font-normal' />
            <span>{t('interface.offers', 'Offers')}</span>
          </Link>
        )}
        {aiAuditEnabled && (
          <Link
            href="/projects?tab=audits"
            className="flex text-sm font-semibold items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-900"
          >
            <ClipboardCheck size={18} strokeWidth={1.5} className='font-normal' />
            <span>{t('interface.audits', 'Audits')}</span>
          </Link>
        )}
        {workspaceTabEnabled && (
          <Link
            href="/projects?tab=workspace"
            className="flex text-sm font-semibold items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-900"
          >
            <Users size={18} strokeWidth={1.5} className='font-normal' />
            <span>{t('interface.workspace', 'Workspace')}</span>
          </Link>
        )}
        {exportToLMSEnabled && (
          <Link
            href="/projects?tab=export-lms"
            className="flex text-sm font-semibold items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-900"
          >
            <Upload size={18} strokeWidth={1.5} className='font-normal' />
            <span>{t('interface.exportToLMS', 'Export to LMS')}</span>
          </Link>
        )}
      </nav>
      <div className="mt-4">
        <div className="flex justify-between items-center text-gray-500 font-semibold mb-2">
          <span>{isSearching ? t('interface.searchResults', 'Search Results') : t('interface.recentFolders', 'Recent Folders')}</span>
          <FolderPlus size={18} className="cursor-pointer hover:text-gray-800" onClick={() => window.dispatchEvent(new CustomEvent('openFolderModal'))} />
        </div>
        
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
          <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg text-center transition-shadow duration-200">
            <p className="mb-2 text-gray-700 leading-relaxed">{t('interface.organizeCourses', 'Organize your courses into folders, keep them structured and work more efficiently')}</p>
            <button className="inline-flex text-blue-600 items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 hover:underline" onClick={() => window.dispatchEvent(new CustomEvent('openFolderModal'))}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              {t('interface.createFirstFolder', 'Create First Folder')}
            </button>
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
                allFolders={folders}
              />
            ))}
          </div>
        )}
      </div>
      <nav className="flex flex-col gap-1 mt-auto">
        {eventPostersEnabled && (
          <Link href="/create/event-poster/questionnaire" className="flex text-sm font-semibold items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-900">
            <Presentation size={18} strokeWidth={1.5} className='font-normal' />
            <span>{t('interface.eventPoster', 'Event Poster')}</span>
          </Link>
        )}
        <Link href="/projects?tab=trash" className="flex text-sm font-semibold items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-900">
          <Trash2 size={18} strokeWidth={1.5} className='font-normal' />
          <span>{t('interface.trash', 'Trash')}</span>
        </Link>
      </nav>
    </aside>
  );
};

const Header = ({ onTariffModalOpen, onAddOnsModalOpen }: { onTariffModalOpen: () => void; onAddOnsModalOpen: () => void;}) => {
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
      <h1 className="text-3xl font-semibold text-gray-900">My products</h1>
      <div className="flex items-center gap-4">
        <button 
          onClick={onTariffModalOpen}
          className="flex items-center gap-2 bg-[#F2CCFA] hover:bg-[#EBD5F0]/90 text-sm font-bold text-[#8808A2] px-3 py-3 rounded-full transition-all duration-200 cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_1699_24379)">
            <path d="M11.5423 11.39C11.1071 11.5565 10.8704 11.7944 10.702 12.2289C10.5353 11.7944 10.297 11.5581 9.86183 11.39C10.297 11.2236 10.5337 10.9873 10.702 10.5512C10.8688 10.9857 11.1071 11.2219 11.5423 11.39ZM10.7628 4.58894C11.1399 3.18676 11.6552 2.6712 13.0612 2.29423C11.6568 1.91776 11.1404 1.40327 10.7628 -0.000488281C10.3858 1.40169 9.87044 1.91725 8.46442 2.29423C9.86886 2.67069 10.3852 3.18518 10.7628 4.58894ZM11.1732 7.48307C11.1732 7.35096 11.1044 7.19146 10.9118 7.13776C9.33637 6.69793 8.34932 6.19579 7.61233 5.46062C6.8754 4.72487 6.37139 3.73934 5.93249 2.16641C5.8787 1.97415 5.71894 1.90541 5.58662 1.90541C5.4543 1.90541 5.29454 1.97415 5.24076 2.16641C4.80022 3.73934 4.29727 4.72481 3.56092 5.46062C2.82291 6.19744 1.83688 6.69956 0.261415 7.13776C0.0688515 7.19146 0 7.35097 0 7.48307C0 7.61518 0.0688515 7.77469 0.261415 7.82839C1.83688 8.26822 2.82393 8.77036 3.56092 9.50553C4.29892 10.2424 4.80186 11.2268 5.24076 12.7997C5.29455 12.992 5.45431 13.0607 5.58662 13.0607C5.71895 13.0607 5.87871 12.992 5.93249 12.7997C6.37303 11.2268 6.87598 10.2413 7.61233 9.50553C8.35034 8.76871 9.33637 8.26658 10.9118 7.82839C11.1044 7.77468 11.1732 7.61518 11.1732 7.48307Z" fill="#7B0792"/>
            </g>
            <defs>
            <clipPath id="clip0_1699_24379">
            <rect width="14.6939" height="14.6939" fill="white"/>
            </clipPath>
            </defs>
          </svg>
          Upgrade Plan
        </button>
        <button 
          // onClick={onAddOnsModalOpen}
          className="flex items-center gap-2 text-sm font-medium text-[#4D4D4D] px-3 py-2 rounded-md transition-all duration-200 cursor-pointer"
        >
          <Coins strokeWidth={1.5} size={16} className="font-normal text-[#4D4D4D]" />
          {userCredits !== null ? `${userCredits} ${t('interface.courseOutline.credits', 'Credits')}` : t('interface.loading', 'Loading...')}
        </button>
        <Bell size={20} className="text-gray-600 cursor-pointer" />
        <LanguageDropdown />
        <UserDropdown />
      </div>
    </header>
  );
};

// --- Main component ---
const MyProductsPageInner: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [currentUser, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isQuestionnaireCompleted, setQuestionnaireCompleted] = useState<boolean | null>(null);
  const [tariffModalOpen, setTariffModalOpen] = useState(false);
  const [addOnsModalOpen, setAddOnsModalOpen] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isEmbedded = searchParams?.get('embedded') === 'modal';

  // Check questionnaire completion on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completed = sessionStorage.getItem('questionnaireCompleted') === 'true';
      setQuestionnaireCompleted(completed);
    }
  }, []);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await checkAuthentication();
        if (user) {
          setUser(user);
          setIsAuthenticated(true);
          // Check questionnaire completion
          const completed = await checkQuestionnaireCompletion(user.id);
          setQuestionnaireCompleted(completed);
        } else {
          setIsAuthenticated(false);
          // Redirect to main app's login page
          redirectToMainAuth('/auth/login');
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
        // Redirect to main app's login page
        redirectToMainAuth('/auth/login');
      }
    };

    checkAuth();
  }, []);

  // Load folders on component mount
  useEffect(() => {
    const loadFolders = async () => {
      try {
        const foldersData = await fetchFolders();
        setFolders(foldersData);
      } catch (error) {
        console.error('Failed to load folders:', error);
        if (error instanceof Error && error.message === 'UNAUTHORIZED') {
          // Handle authentication error - redirect to main app login
          const protocol = window.location.protocol;
          const host = window.location.host;
          const currentUrl = window.location.pathname + window.location.search;
          const mainAppUrl = `${protocol}//${host}/auth/login?next=${encodeURIComponent(currentUrl)}`;
          window.location.href = mainAppUrl;
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadFolders();
    }
  }, [isAuthenticated]);

  // Listen for folder modal events
  useEffect(() => {
    const handleOpenFolderModal = () => setShowFolderModal(true);
    const handleCloseFolderModal = () => setShowFolderModal(false);

    window.addEventListener('openFolderModal', handleOpenFolderModal);
    window.addEventListener('closeFolderModal', handleCloseFolderModal);

    return () => {
      window.removeEventListener('openFolderModal', handleOpenFolderModal);
      window.removeEventListener('closeFolderModal', handleCloseFolderModal);
    };
  }, []);

  // Listen for folder creation events
  useEffect(() => {
    const handleFolderCreated = () => {
      // Reload folders when a new one is created
      const loadFolders = async () => {
        try {
          const foldersData = await fetchFolders();
          setFolders(foldersData);
        } catch (error) {
          console.error('Failed to reload folders:', error);
        }
      };
      loadFolders();
    };

    window.addEventListener('folderCreated', handleFolderCreated);
    return () => window.removeEventListener('folderCreated', handleFolderCreated);
  }, []);

  const handleFolderSelect = (folderId: number | null) => {
    setSelectedFolderId(folderId);
  };

  const handleFolderCreated = () => {
    // Reload folders when a new one is created
    const loadFolders = async () => {
      try {
        const foldersData = await fetchFolders();
        setFolders(foldersData);
      } catch (error) {
        console.error('Failed to reload folders:', error);
      }
    };
    loadFolders();
  };

  const handleSurveyComplete = async (answers: any) => {
    try {
      if (!currentUser?.id) {
        console.error('No current user found');
        return;
      }
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
      const payload = {
        user_id: currentUser.id,
        answers: answers || {},
        completed_at: new Date().toISOString()
      };
      const res = await fetch(`${CUSTOM_BACKEND_URL}/questionnaires/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('questionnaireCompleted', 'true');
        }
        setQuestionnaireCompleted(true);
        console.log('Survey answers saved successfully');
      } else {
        console.error('Failed to save survey answers:', await res.text());
      }
    } catch (err) {
      console.error('Error sending survey answers:', err);
    }
  };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className={`flex items-center justify-center ${isEmbedded ? 'h-full' : 'h-screen'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">{t('interface.loading', 'Loading...')}</span>
      </div>
    );
  }

  // Show authentication error
  if (isAuthenticated === false) {
    return (
      <div className={`flex items-center justify-center ${isEmbedded ? 'h-full' : 'h-screen'}`}>
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t('interface.authenticationRequired', 'Authentication Required')}</h2>
          <p className="text-gray-600 mb-4">{t('interface.pleaseLogin', 'Please log in to access this page.')}</p>
          <Button onClick={() => redirectToMainAuth('/auth/login')}>
            {t('interface.login', 'Login')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isEmbedded ? 'h-full bg-white w-full' : 'h-screen bg-gray-50'}`}>
      {!isEmbedded && (
        <Sidebar
          onFolderSelect={handleFolderSelect}
          selectedFolderId={selectedFolderId}
          folders={folders}
        />
      )}
      <div className={`${isEmbedded ? 'flex flex-col h-full w-full' : 'ml-64 flex flex-col h-screen'}`}>
        {!isEmbedded && (
          <Header onTariffModalOpen={() => setTariffModalOpen(true)} onAddOnsModalOpen={() => setAddOnsModalOpen(true)}/>
        )}
        <main className={`flex-1 overflow-y-auto ${isEmbedded ? 'p-6 bg-white' : 'p-8 bg-[#FFFFFF]'}`}>
          {!isQuestionnaireCompleted ? (
            <RegistrationSurveyModal onComplete={handleSurveyComplete} />
          ) : (
            <MyProductsTable folderId={selectedFolderId} />
          )}
        </main>
      </div>
      {!isEmbedded && (
        <>
          <FolderModal 
            open={showFolderModal} 
            onClose={() => setShowFolderModal(false)} 
            onFolderCreated={handleFolderCreated} 
            existingFolders={folders} 
          />
          <TariffPlanModal
            open={tariffModalOpen}
            onOpenChange={setTariffModalOpen}
          />
          <AddOnsModal
            isOpen={addOnsModalOpen}
            onClose={() => setAddOnsModalOpen(false)}
          />
        </>
      )}
    </div>
  );
};

// --- Wrapper component for Suspense ---
const MyProductsPage: React.FC = () => {
  return (
    <MyProductsPageInner />
  );
};

export default MyProductsPage;