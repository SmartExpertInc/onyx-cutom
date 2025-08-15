import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Plus, Search, Users, Trash2, X } from 'lucide-react';

interface FolderModalProps {
  open: boolean;
  onClose: () => void;
  onFolderCreated: (folder: any) => void;
  existingFolders: any[];
}

const FolderModal: React.FC<FolderModalProps> = ({ open, onClose, onFolderCreated, existingFolders }) => {
    const [folderName, setFolderName] = useState('');
  const [website, setWebsite] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
 
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [deletingFolderId, setDeletingFolderId] = useState<number | null>(null);
  const { t } = useLanguage();

  // Fetch all projects for folder content move
  const [allProjects, setAllProjects] = useState<any[]>([]);
  useEffect(() => {
    if (!open) return;
    fetch('/api/custom-projects-backend/projects', { credentials: 'same-origin' })
      .then(res => res.json())
      .then(setAllProjects)
      .catch(() => setAllProjects([]));
  }, [open]);

  if (!open) {
    if (typeof window !== 'undefined') (window as any).__modalOpen = false;
    return null;
  }

  // Set modal open flag
  if (typeof window !== 'undefined') (window as any).__modalOpen = true;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (typeof window !== 'undefined') (window as any).__modalOpen = false;
      onClose();
    }
  };

  const handleCreate = async () => {
    if (!folderName.trim()) return;
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/custom-projects-backend/projects/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: folderName.trim(),
          website: website.trim() || null,
          parent_id: selectedParentId,
          quality_tier: 'interactive'
        })
      });
      if (!res.ok) throw new Error('Failed to create client');
      const data = await res.json();
      onFolderCreated(data);
      setFolderName('');
      setWebsite('');
      setSelectedParentId(null);
      if (typeof window !== 'undefined') (window as any).__modalOpen = false;
      
      // Reload the page to ensure all changes are visually applied
      setTimeout(() => {
        window.location.reload();
      }, 500); // Small delay to show success state
    } catch (e: any) {
      setError(e.message || 'Error creating client');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteFolder = async (folderId: number) => {
    setDeletingFolderId(folderId);
    setError('');
    try {
      // Find the folder and its parent
      const folder = existingFolders.find(f => f.id === folderId);
      const parentId = folder?.parent_id ?? null;
      // Move all projects in this folder to the parent (or root)
      const projectsToMove = allProjects.filter(p => p.folder_id === folderId);
      for (const project of projectsToMove) {
        await fetch(`/api/custom-projects-backend/projects/${project.id}/folder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ folder_id: parentId })
        });
      }
      // Delete the folder
      const res = await fetch(`/api/custom-projects-backend/projects/folders/${folderId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      if (!res.ok) throw new Error('Failed to delete client');
      
      // Refresh UI
      if (typeof window !== 'undefined') (window as any).__modalOpen = false;
      onClose();
      
      // Reload the page to ensure all changes are visually applied
      setTimeout(() => {
        window.location.reload();
      }, 500); // Small delay to show success state
    } catch (e: any) {
      setError(e.message || 'Error deleting client');
    } finally {
      setDeletingFolderId(null);
    }
  };

  const filteredFolders = existingFolders;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-black/50" onClick={handleBackdropClick}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative border border-gray-100">
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors" 
          onClick={() => { if (typeof window !== 'undefined') (window as any).__modalOpen = false; onClose(); }}
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
            <Users size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('interface.createNewClient', 'Create New Client')}</h2>
            <p className="text-gray-600 text-sm">{t('interface.organizeProjectsByClient', 'Organize your projects by client for better management')}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Create New Client Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Plus size={16} className="text-green-600" />
              <h3 className="font-semibold text-gray-900">{t('interface.createNewClient', 'Create New Client')}</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label htmlFor="folder-name" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('interface.clientName', 'Client Name')} *
                </label>
                <input
                  id="folder-name"
                  type="text"
                  placeholder={t('interface.enterClientNamePlaceholder', 'Enter client name...')}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  value={folderName}
                  onChange={e => setFolderName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
                />
              </div>
              
              <div>
                <label htmlFor="website" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('interface.website', 'Website')} <span className="text-gray-500 font-normal">({t('interface.optional', 'optional')})</span>
                </label>
                <input
                  id="website"
                  type="url"
                  placeholder={t('interface.enterWebsitePlaceholder', 'https://example.com')}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                />
              </div>
              
              {existingFolders.length > 0 && (
                <div className="relative">
                  <select
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                    value={selectedParentId || ''}
                    onChange={(e) => setSelectedParentId(e.target.value ? parseInt(e.target.value) : null)}
                  >
                    <option value="">{t('interface.createAtTopLevel', 'Create at top level (no parent client)')}</option>
                    {existingFolders.map(folder => (
                      <option key={folder.id} value={folder.id} title={folder.name}>
                        {folder.name.length > 40 ? `${folder.name.substring(0, 40)}...` : folder.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <button
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl px-4 py-3 font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={handleCreate}
                disabled={creating || !folderName.trim()}
              >
                {creating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('interface.creatingClient', 'Creating Client...')}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Plus size={16} />
                    {t('interface.createClient', 'Create Client')}
                  </div>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          )}


        </div>

        <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
          <button 
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors" 
            onClick={() => { if (typeof window !== 'undefined') (window as any).__modalOpen = false; onClose(); }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderModal; 