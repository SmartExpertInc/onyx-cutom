// custom_extensions/frontend/src/app/projects/page.tsx
"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
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
  Bell
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const Sidebar = ({ currentTab }: { currentTab: string }) => (
  <aside className="w-64 bg-white p-4 flex flex-col fixed h-full border-r border-gray-200 text-sm">
    <div className="flex items-center mb-6">
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm mr-2">V</div>
      <span className="font-semibold text-gray-800">Vitaliy Tymoshenko's ...</span>
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
      <Link href="/projects" className={`flex items-center gap-3 p-2 rounded-lg ${currentTab === 'products' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-600'}`}>
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
    </nav>
    <div className="mt-4">
      <div className="flex justify-between items-center text-gray-500 font-semibold mb-2">
        <span>Folders</span>
        <FolderPlus size={18} className="cursor-pointer hover:text-gray-800" />
      </div>
      <div className="bg-gray-100 p-4 rounded-lg text-center">
        <p className="mb-2 text-gray-700">Organize your products by topic and share them with your team</p>
        <button className="font-semibold text-blue-600 hover:underline">Create or join a folder</button>
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
    </nav>
  </aside>
);

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
      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">VT</div>
    </div>
  </header>
);

// --- Inner client component that can read search params ---
const ProjectsPageInner: React.FC = () => {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'products';
  const isTrash = currentTab === 'trash';

  return (
    <div className="bg-[#F7F7F7] min-h-screen font-sans">
      <Sidebar currentTab={currentTab} />
      <div className="ml-64 flex flex-col h-screen">
        <Header isTrash={isTrash} />
        <main className="flex-1 overflow-y-auto p-8">
          <ProjectsTable trashMode={isTrash} />
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
