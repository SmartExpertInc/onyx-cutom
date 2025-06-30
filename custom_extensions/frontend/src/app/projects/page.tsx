// custom_extensions/frontend/src/app/projects/page.tsx
"use client";

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  MessageSquare
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import FolderModal from './FolderModal';

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

// Helper function to redirect to main app's auth endpoint
const redirectToMainAuth = (path: string) => {
  // Get the current domain and protocol
  const protocol = window.location.protocol;
  const host = window.location.host;
  const mainAppUrl = `${protocol}//${host}${path}`;
  window.location.href = mainAppUrl;
};

interface SidebarProps {
  currentTab: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTab }) => {
  const router = useRouter();

  return (
    <aside className="w-64 bg-white p-4 flex flex-col fixed h-full border-r border-gray-200 text-sm">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm mr-2">Z</div>
        <span className="font-semibold text-gray-800">Zhdan Shakirov</span>
        <ChevronsUpDown size={16} className="ml-auto text-gray-500 cursor-pointer" />
      </div>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Jump to"
          className="w-full bg-gray-100 rounded-md pl-8 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs border border-gray-300 rounded-sm px-1">⌘+K</div>
      </div>
      <nav className="flex flex-col gap-1">
        <Link 
          href="/projects" 
          className={`flex items-center gap-3 p-2 rounded-lg ${currentTab === 'products' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}`}
        >
          <Home size={18} />
          <span>Products</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <Users size={18} />
          <span>Shared with you</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <Globe size={18} />
          <span>Sites</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <ImageIcon size={18} />
          <span>AI Images</span>
        </Link>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('openFolderModal'))}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600 cursor-pointer"
        >
          <FolderPlus size={18} className="text-gray-600" />
          <span>Folders</span>
        </button>
      </nav>
      <div className="mt-4">
        <div className="flex justify-between items-center text-gray-500 font-semibold mb-2">
          <span>Projects</span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-2 py-1 rounded bg-blue-50 text-blue-700 font-semibold border border-transparent">
            <span className="text-blue-700"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h3.172a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 12.828 7H19a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
            <span className="font-medium">General</span>
          </div>
        </div>
      </div>
      <nav className="flex flex-col gap-1 mt-auto">
         <Link href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <LayoutTemplate size={18} />
          <span>Templates</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <Sparkles size={18} />
          <span>Inspiration</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <Palette size={18} />
          <span>Themes</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <Type size={18} />
          <span>Custom fonts</span>
        </Link>
        <Link href="/projects?tab=trash" className={`flex items-center gap-3 p-2 rounded-lg ${currentTab === 'trash' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}`}>
          <Trash2 size={18} />
          <span>Trash</span>
        </Link>
        <button
          type="button"
          onClick={() => { if (typeof window !== 'undefined') window.location.href = '/chat'; }}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600 cursor-pointer"
        >
          <MessageSquare size={18} />
          <span>Chats</span>
        </button>
      </nav>
    </aside>
  );
};

const Header = ({ isTrash }: { isTrash: boolean }) => (
  <header className="flex items-center justify-between p-4 px-8 border-b border-gray-200 bg-white sticky top-0 z-10">
    <h1 className="text-3xl font-bold text-gray-900">{isTrash ? 'Trash' : 'Products'}</h1>
    <div className="flex items-center gap-4">
      <Link href="#" className="text-sm font-semibold flex items-center gap-1 text-purple-600">
        <Sparkles size={16} className="text-yellow-500" />
        Get unlimited AI
      </Link>
      <span className="text-sm font-semibold text-gray-800">80 credits</span>
      <Bell size={20} className="text-gray-600 cursor-pointer" />
    </div>
  </header>
);

// --- Inner client component that can read search params ---
const ProjectsPageInner: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get('tab') || 'products';
  const isTrash = currentTab === 'trash';

  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folders, setFolders] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Load folders after authentication is confirmed
  useEffect(() => {
    if (isAuthenticated === true) {
      const loadFolders = async () => {
        try {
          const foldersData = await fetchFolders();
          setFolders(foldersData);
        } catch (error) {
          if (error instanceof Error && error.message === 'UNAUTHORIZED') {
            redirectToMainAuth('/auth/login');
            return;
          }
          console.error('Error loading folders:', error);
          setFolders([]);
        }
      };

      loadFolders();
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

    window.addEventListener('moveProjectToFolder', handleMoveProject);
    return () => window.removeEventListener('moveProjectToFolder', handleMoveProject);
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
          <p className="text-gray-600">Checking authentication...</p>
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
      <Sidebar currentTab={currentTab} />
      <div className="ml-64 flex flex-col h-screen">
        <Header isTrash={isTrash} />
        <main className="flex-1 overflow-y-auto p-8">
          <ProjectsTable trashMode={isTrash} folderId={null} />
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
