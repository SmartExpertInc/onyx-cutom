import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Folder, FolderOpen, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Folder {
  id: number;
  name: string;
  project_count: number;
  parent_id?: number | null;
}

interface FolderSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFolder: (folderId: number | null) => void;
  folders: Folder[];
  currentFolderId?: number | null;
  title?: string;
}

export const FolderSelectionModal: React.FC<FolderSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectFolder,
  folders,
  currentFolderId,
  title = "Move to folder"
}) => {
  const { t } = useLanguage();
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'suggested' | 'starred' | 'all'>('suggested');

  const handleSelectFolder = (folderId: number | null) => {
    setSelectedFolderId(folderId);
  };

  const handleConfirm = () => {
    onSelectFolder(selectedFolderId);
    onClose();
  };

  const handleCancel = () => {
    setSelectedFolderId(null);
    onClose();
  };

  // Get suggested folders (recently used or popular)
  const getSuggestedFolders = () => {
    return folders
      .sort((a, b) => (b.project_count || 0) - (a.project_count || 0))
      .slice(0, 8);
  };

  const getStarredFolders = () => {
    // For now, return empty array - could be implemented with starred folders
    return [];
  };

  const getCurrentFolders = () => {
    return folders;
  };

  const getFoldersToShow = () => {
    switch (activeTab) {
      case 'suggested':
        return getSuggestedFolders();
      case 'starred':
        return getStarredFolders();
      case 'all':
        return getCurrentFolders();
      default:
        return getSuggestedFolders();
    }
  };

  const getCurrentFolderName = () => {
    if (currentFolderId === null) return t('interface.noFolder', 'No folder');
    const folder = folders.find(f => f.id === currentFolderId);
    return folder ? folder.name : t('interface.noFolder', 'No folder');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {t('interface.selectDestinationFolder', 'Select a destination folder for this item.')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t('interface.currentLocation', 'Current location:')}
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md border">
              <Folder size={16} className="text-gray-500" />
              <span className="text-sm text-gray-700">{getCurrentFolderName()}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('suggested')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'suggested'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('interface.suggested', 'Suggested')}
            </button>
            <button
              onClick={() => setActiveTab('starred')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'starred'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('interface.starred', 'Starred')}
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'all'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('interface.allLocations', 'All locations')}
            </button>
          </div>

          {/* Folder list */}
          <ScrollArea className="h-64">
            <div className="space-y-1">
              {/* No folder option */}
              <button
                onClick={() => handleSelectFolder(null)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                  selectedFolderId === null
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <FolderOpen size={16} className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {t('interface.noFolder', 'No folder')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t('interface.moveToRoot', 'Move to root level')}
                  </div>
                </div>
                {selectedFolderId === null && (
                  <Check size={16} className="text-blue-600" />
                )}
              </button>

              {/* Folder options */}
              {getFoldersToShow().map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleSelectFolder(folder.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                    selectedFolderId === folder.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Folder size={16} className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{folder.name}</div>
                    <div className="text-xs text-gray-500">
                      {folder.project_count || 0} {folder.project_count === 1 ? 'item' : 'items'}
                    </div>
                  </div>
                  {selectedFolderId === folder.id && (
                    <Check size={16} className="text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>

          {/* Info text */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xs text-blue-600">i</span>
            </div>
            <span>
              {t('interface.folderPathInfo', 'To show the path to the folder, select a location')}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {t('interface.cancel', 'Cancel')}
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={selectedFolderId === undefined}
            className="bg-blue-600 text-white rounded-full hover:bg-gray-700"
          >
            {t('interface.move', 'Move')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FolderSelectionModal;
