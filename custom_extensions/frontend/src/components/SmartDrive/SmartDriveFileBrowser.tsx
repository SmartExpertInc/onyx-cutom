"use client";

import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  File, 
  ArrowLeft, 
  RefreshCw, 
  Check, 
  X,
  Search,
  Download,
  Eye
} from 'lucide-react';

interface SmartDriveFile {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified: string;
  mime_type?: string;
}

interface SmartDriveFileBrowserProps {
  onFilesSelected?: (files: string[]) => void;
  selectedFiles?: string[];
  className?: string;
}

const SmartDriveFileBrowser: React.FC<SmartDriveFileBrowserProps> = ({
  onFilesSelected,
  selectedFiles = [],
  className = ''
}) => {
  const [files, setFiles] = useState<SmartDriveFile[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [internalSelectedFiles, setInternalSelectedFiles] = useState<string[]>(selectedFiles);
  const [searchTerm, setSearchTerm] = useState('');

  // Sync with parent selected files
  useEffect(() => {
    setInternalSelectedFiles(selectedFiles);
  }, [selectedFiles]);

  // Notify parent when selection changes
  useEffect(() => {
    if (onFilesSelected) {
      onFilesSelected(internalSelectedFiles);
    }
  }, [internalSelectedFiles, onFilesSelected]);

  // Load files from current path
  const loadFiles = async (path: string = currentPath) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/custom-projects-backend/smartdrive/list?path=${encodeURIComponent(path)}`,
        {
          method: 'GET',
          credentials: 'same-origin',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load files: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setFiles(data.files || []);
      setCurrentPath(path);
    } catch (err) {
      console.error('Error loading files:', err);
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadFiles('/');
  }, []);

  // Handle file/folder click
  const handleItemClick = (file: SmartDriveFile) => {
    if (file.type === 'directory') {
      // Navigate to directory
      loadFiles(file.path);
    } else {
      // Toggle file selection
      const isSelected = internalSelectedFiles.includes(file.path);
      
      if (isSelected) {
        setInternalSelectedFiles(prev => prev.filter(path => path !== file.path));
      } else {
        setInternalSelectedFiles(prev => [...prev, file.path]);
      }
    }
  };

  // Navigate back
  const navigateBack = () => {
    if (currentPath === '/') return;
    
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    loadFiles(parentPath);
  };

  // Clear all selections
  const clearAllSelections = () => {
    setInternalSelectedFiles([]);
  };

  // Get file icon
  const getFileIcon = (file: SmartDriveFile) => {
    if (file.type === 'directory') {
      return <Folder className="w-5 h-5 text-blue-500" />;
    }
    
    // File type icons based on mime type or extension
    const mimeType = file.mime_type || '';
    if (mimeType.startsWith('image/')) {
      return <File className="w-5 h-5 text-green-500" />;
    } else if (mimeType.includes('pdf')) {
      return <File className="w-5 h-5 text-red-500" />;
    } else if (mimeType.includes('text') || mimeType.includes('document')) {
      return <File className="w-5 h-5 text-blue-500" />;
    }
    
    return <File className="w-5 h-5 text-gray-500" />;
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
  };

  // Filter files based on search term
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get breadcrumb path
  const getBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', path: '/' }];
    
    let currentFullPath = '';
    parts.forEach(part => {
      currentFullPath += `/${part}`;
      breadcrumbs.push({ name: part, path: currentFullPath });
    });
    
    return breadcrumbs;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={navigateBack}
              disabled={currentPath === '/'}
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => loadFiles(currentPath)}
              disabled={loading}
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {internalSelectedFiles.length} file{internalSelectedFiles.length !== 1 ? 's' : ''} selected
            </span>
            {internalSelectedFiles.length > 0 && (
              <button
                onClick={clearAllSelections}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-4">
          {getBreadcrumbs().map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              {index > 0 && <span className="text-gray-400">/</span>}
              <button
                onClick={() => loadFiles(crumb.path)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* File List */}
      <div className="overflow-auto" style={{ maxHeight: '400px' }}>
        {error ? (
          <div className="p-4 text-center">
            <div className="text-red-600 mb-2">{error}</div>
            <button
              onClick={() => loadFiles(currentPath)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Loading files...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-8 text-center">
            <Folder className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">
              {searchTerm ? 'No files match your search' : 'This folder is empty'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredFiles.map((file) => {
              const isSelected = internalSelectedFiles.includes(file.path);
              const isFile = file.type === 'file';
              
              return (
                <div
                  key={file.path}
                  onClick={() => handleItemClick(file)}
                  className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  {/* Selection indicator for files */}
                  {isFile && (
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                    }`}>
                      {isSelected && <Check size={12} className="text-white" />}
                    </div>
                  )}
                  
                  {/* File icon */}
                  {getFileIcon(file)}
                  
                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{file.name}</p>
                    {isFile && (
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {new Date(file.modified).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  {/* File type indicator */}
                  <div className="text-xs text-gray-400 uppercase">
                    {file.type === 'directory' ? 'Folder' : file.name.split('.').pop() || 'File'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartDriveFileBrowser; 