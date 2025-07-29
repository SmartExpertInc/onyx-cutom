import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface FolderModalProps {
  open: boolean;
  onClose: () => void;
  onFolderCreated: (folder: any) => void;
  existingFolders: any[];
}

const FolderModal: React.FC<FolderModalProps> = ({ open, onClose, onFolderCreated, existingFolders }) => {
  const [folderName, setFolderName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
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
          parent_id: selectedParentId,
          quality_tier: 'interactive'
        })
      });
      if (!res.ok) throw new Error('Failed to create folder');
      const data = await res.json();
      onFolderCreated(data);
      setFolderName('');
      setSelectedParentId(null);
      if (typeof window !== 'undefined') (window as any).__modalOpen = false;
      
      // Reload the page to ensure all changes are visually applied
      setTimeout(() => {
        window.location.reload();
      }, 500); // Small delay to show success state
    } catch (e: any) {
      setError(e.message || 'Error creating folder');
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
      if (!res.ok) throw new Error('Failed to delete folder');
      
      // Refresh UI
      if (typeof window !== 'undefined') (window as any).__modalOpen = false;
      onClose();
      
      // Reload the page to ensure all changes are visually applied
      setTimeout(() => {
        window.location.reload();
      }, 500); // Small delay to show success state
    } catch (e: any) {
      setError(e.message || 'Error deleting folder');
    } finally {
      setDeletingFolderId(null);
    }
  };

  const filteredFolders = existingFolders.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-black/20" onClick={handleBackdropClick}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={() => { if (typeof window !== 'undefined') (window as any).__modalOpen = false; onClose(); }}>&times;</button>
        <h2 className="text-2xl font-bold mb-2 text-black">{t('interface.createFolder', 'Create or join a folder')}</h2>
        <p className="text-gray-600 mb-4">{t('interface.createFolderDescription', 'You can join a folder to keep track of what folks are working on.')}</p>
        <div className="flex flex-col mb-4 gap-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={t('interface.findOrCreateFolder', 'Find or create a new folder')}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              value={folderName}
              onChange={e => { setFolderName(e.target.value); setSearch(e.target.value); }}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
            />
            <button
              className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50"
              onClick={handleCreate}
              disabled={creating || !folderName.trim()}
            >
              {t('interface.createFolderButton', 'Create folder')}
            </button>
          </div>
          {existingFolders.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                className="w-full max-w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black truncate"
                value={selectedParentId || ''}
                onChange={(e) => setSelectedParentId(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">{t('interface.createAtTopLevel', 'Create at top level (no parent folder)')}</option>
                {existingFolders.map(folder => (
                  <option key={folder.id} value={folder.id} title={folder.name}>
                    {folder.name.length > 40 ? `${folder.name.substring(0, 40)}...` : folder.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">{t('interface.allFolders', 'All folders')}</div>
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
            {filteredFolders.length === 0 && <div className="text-gray-400 text-sm">{t('interface.noFoldersFound', 'No folders found.')}</div>}
            {filteredFolders.map(folder => (
              <div key={folder.id} className="flex items-center justify-between gap-2 px-2 py-2 rounded border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">{folder.name[0]?.toUpperCase()}</span>
                  <span className="font-medium text-gray-800">{folder.name}</span>
                </div>
                <button 
                  className="text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                  disabled={deletingFolderId === folder.id}
                  onClick={() => handleDeleteFolder(folder.id)}
                >
                  {deletingFolderId === folder.id ? t('interface.deleting', 'Deleting...') : t('interface.delete', 'Delete')}
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <button className="px-5 py-2 bg-blue-700 text-white rounded-full font-semibold" onClick={() => { if (typeof window !== 'undefined') (window as any).__modalOpen = false; onClose(); }}>{t('interface.done', 'Done')}</button>
        </div>
      </div>
    </div>
  );
};

export default FolderModal; 