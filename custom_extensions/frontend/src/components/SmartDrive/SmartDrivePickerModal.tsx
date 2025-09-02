"use client";

import React, { useState, useEffect } from 'react';
import { X, Folder, File, ChevronRight, Check, Search } from 'lucide-react';

interface SmartDriveFile {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified: string;
  mime_type?: string;
}

interface SmartDrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesSelected: (filePaths: string[]) => void;
}

const SmartDrivePickerModal: React.FC<SmartDrivePickerModalProps> = ({
  isOpen,
  onClose,
  onFilesSelected,
}) => {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [files, setFiles] = useState<SmartDriveFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadFiles(currentPath);
    }
  }, [isOpen, currentPath]);

  const loadFiles = async (path: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/custom-projects-backend/smartdrive/list?path=${encodeURIComponent(path)}`, {
        credentials: 'same-origin',
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      } else {
        console.error('Failed to load files:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (filePath: string, isSelected: boolean) => {
    const newSelection = new Set(selectedFiles);
    if (isSelected) {
      newSelection.add(filePath);
    } else {
      newSelection.delete(filePath);
    }
    setSelectedFiles(newSelection);
  };

  const handleFolderClick = (folderPath: string) => {
    setCurrentPath(folderPath);
  };

  const handleBackClick = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    setCurrentPath(parentPath);
  };

  const handleImport = () => {
    const selectedPaths = Array.from(selectedFiles);
    onFilesSelected(selectedPaths);
    onClose();
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileIcon = (file: SmartDriveFile) => {
    if (file.type === 'directory') {
      return <Folder className="w-5 h-5 text-blue-600" />;
    }
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    let iconColor = 'text-gray-600';
    
    if (['pdf'].includes(extension!)) iconColor = 'text-red-600';
    else if (['doc', 'docx'].includes(extension!)) iconColor = 'text-blue-600';
    else if (['xls', 'xlsx'].includes(extension!)) iconColor = 'text-green-600';
    else if (['ppt', 'pptx'].includes(extension!)) iconColor = 'text-orange-600';
    else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension!)) iconColor = 'text-purple-600';
    
    return <File className={`w-5 h-5 ${iconColor}`} />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Select Files from Smart Drive</h2>
            <p className="text-sm text-gray-600">Choose files to import into your Onyx knowledge base</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button
              onClick={() => setCurrentPath('/')}
              className="hover:text-gray-900"
            >
              Smart Drive
            </button>
            {currentPath !== '/' && (
              <>
                {currentPath.split('/').filter(Boolean).map((segment, index, array) => (
                  <React.Fragment key={index}>
                    <ChevronRight className="w-4 h-4" />
                    <button
                      onClick={() => {
                        const path = '/' + array.slice(0, index + 1).join('/');
                        setCurrentPath(path);
                      }}
                      className="hover:text-gray-900"
                    >
                      {segment}
                    </button>
                  </React.Fragment>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-200">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentPath !== '/' && (
            <div
              className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
              onClick={handleBackClick}
            >
              <Folder className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">.. (Go back)</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? 'No files match your search' : 'No files found'}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredFiles.map((file) => (
                <div
                  key={file.path}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => {
                    if (file.type === 'directory') {
                      handleFolderClick(file.path);
                    } else {
                      handleFileSelect(file.path, !selectedFiles.has(file.path));
                    }
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getFileIcon(file)}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{file.name}</div>
                      <div className="text-sm text-gray-500">
                        {file.type === 'file' && (
                          <>
                            {formatFileSize(file.size)} • Modified {new Date(file.modified).toLocaleDateString()}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {file.type === 'file' && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.path)}
                        onChange={(e) => handleFileSelect(file.path, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedFiles.size > 0 && (
              <span>{selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={selectedFiles.size === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Import {selectedFiles.size > 0 && `(${selectedFiles.size})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartDrivePickerModal; 