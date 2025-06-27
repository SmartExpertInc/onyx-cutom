import React, { useState } from 'react';

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

  if (!open) return null;

  const handleCreate = async () => {
    if (!folderName.trim()) return;
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/custom-projects-backend/projects/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: folderName.trim() })
      });
      if (!res.ok) throw new Error('Failed to create folder');
      const data = await res.json();
      onFolderCreated(data);
      setFolderName('');
    } catch (e: any) {
      setError(e.message || 'Error creating folder');
    } finally {
      setCreating(false);
    }
  };

  const filteredFolders = existingFolders.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-2">Create or join a folder</h2>
        <p className="text-gray-600 mb-4">You can join a folder to keep track of what folks are working on.</p>
        <div className="flex items-center mb-4 gap-2">
          <input
            type="text"
            placeholder="Find or create a new folder"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={folderName}
            onChange={e => { setFolderName(e.target.value); setSearch(e.target.value); }}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
          />
          <button
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50"
            onClick={handleCreate}
            disabled={creating || !folderName.trim()}
          >
            Create folder
          </button>
        </div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">All folders</div>
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
            {filteredFolders.length === 0 && <div className="text-gray-400 text-sm">No folders found.</div>}
            {filteredFolders.map(folder => (
              <div key={folder.id} className="flex items-center gap-2 px-2 py-2 rounded border border-gray-200">
                <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">{folder.name[0]?.toUpperCase()}</span>
                <span className="font-medium text-gray-800">{folder.name}</span>
                <span className="text-xs text-gray-500 ml-auto">{folder.project_count} member{folder.project_count === 1 ? '' : 's'}, including you</span>
                {/* <button className="text-blue-600 text-xs ml-2">Leave</button> */}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <button className="px-5 py-2 bg-blue-700 text-white rounded-full font-semibold" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

export default FolderModal; 