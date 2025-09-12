"use client";

import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  File, 
  FileText, 
  Image, 
  FileVideo, 
  FileAudio, 
  Archive, 
  Check, 
  Search, 
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: string;
  mimeType?: string;
  selected?: boolean;
}

interface WebDAVFileBrowserProps {
  onFilesSelected?: (files: string[]) => void;
  selectedFiles?: string[];
  className?: string;
}

const WebDAVFileBrowser: React.FC<WebDAVFileBrowserProps> = ({
  onFilesSelected,
  selectedFiles = [],
  className = ''
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [internalSelectedFiles, setInternalSelectedFiles] = useState<Set<string>>(
    new Set(selectedFiles)
  );

  // Initialize WebDAV credentials check
  useEffect(() => {
    checkCredentials();
  }, []);

  // Sync external selection changes
  useEffect(() => {
    setInternalSelectedFiles(new Set(selectedFiles));
  }, [selectedFiles]);

  // Notify parent of selection changes
  useEffect(() => {
    if (onFilesSelected) {
      onFilesSelected(Array.from(internalSelectedFiles));
    }
  }, [internalSelectedFiles, onFilesSelected]);

  const checkCredentials = async () => {
    try {
      const response = await fetch('/api/custom-projects-backend/smartdrive/session', {
        method: 'POST',
        credentials: 'same-origin',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.has_credentials) {
          loadDirectory('/');
        } else {
          setError('SmartDrive credentials not configured');
          setLoading(false);
        }
      }
    } catch (err) {
      setError('Failed to check credentials');
      setLoading(false);
    }
  };

  const loadDirectory = async (path: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/custom-projects-backend/smartdrive/browse', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      });

      if (!response.ok) {
        throw new Error(`Failed to load directory: ${response.status}`);
      }

      const data = await response.json();
      const fileItems: FileItem[] = data.files.map((file: any) => ({
        name: file.name,
        path: file.path,
        type: file.type,
        size: file.size,
        lastModified: file.modified,
        mimeType: file.mime_type,
        selected: internalSelectedFiles.has(file.path)
      }));

      setFiles(fileItems);
      setCurrentPath(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load directory');
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'directory') {
      loadDirectory(file.path);
    } else {
      toggleFileSelection(file.path);
    }
  };

  const toggleFileSelection = (filePath: string) => {
    setInternalSelectedFiles(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(filePath)) {
        newSelection.delete(filePath);
      } else {
        newSelection.add(filePath);
      }
      return newSelection;
    });
  };

  const navigateUp = () => {
    if (currentPath === '/') return;
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
    loadDirectory(parentPath);
  };

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'directory') {
      return <Folder className="w-5 h-5 text-blue-500" />;
    }

    const mimeType = file.mimeType || '';
    if (mimeType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-green-500" />;
    } else if (mimeType.startsWith('video/')) {
      return <FileVideo className="w-5 h-5 text-purple-500" />;
    } else if (mimeType.startsWith('audio/')) {
      return <FileAudio className="w-5 h-5 text-orange-500" />;
    } else if (mimeType.includes('archive') || mimeType.includes('zip')) {
      return <Archive className="w-5 h-5 text-yellow-500" />;
    } else if (mimeType.includes('text') || mimeType.includes('document')) {
      return <FileText className="w-5 h-5 text-gray-500" />;
    } else {
      return <File className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pathSegments = currentPath.split('/').filter(Boolean);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Smart Drive Files</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadDirectory(currentPath)}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button
            onClick={() => loadDirectory('/')}
            className="hover:text-blue-600"
          >
            Home
          </button>
          {pathSegments.map((segment, index) => (
            <React.Fragment key={index}>
              <ChevronRight className="w-4 h-4" />
              <button
                onClick={() => {
                  const path = '/' + pathSegments.slice(0, index + 1).join('/');
                  loadDirectory(path);
                }}
                className="hover:text-blue-600"
              >
                {segment}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* File List */}
      <div className="p-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600">Loading files...</span>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Up Navigation */}
            {currentPath !== '/' && (
              <div
                onClick={navigateUp}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer group"
              >
                <ChevronLeft className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 group-hover:text-gray-800">.. (Parent Directory)</span>
              </div>
            )}

            {filteredFiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No files found matching your search.' : 'This folder is empty.'}
              </div>
            ) : (
              filteredFiles.map((file) => {
                const isSelected = internalSelectedFiles.has(file.path);
                return (
                  <div
                    key={file.path}
                    onClick={() => handleFileClick(file)}
                    className={`flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer group relative ${
                      isSelected ? 'bg-blue-50 hover:bg-blue-100' : ''
                    }`}
                  >
                    {/* Selection Indicator */}
                    {file.type === 'file' && (
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300 group-hover:border-blue-400'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFileSelection(file.path);
                        }}
                      >
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                    )}

                    {/* File Icon */}
                    <div className="flex-shrink-0">
                      {getFileIcon(file)}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {file.name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-4">
                        {file.type === 'file' && file.size && (
                          <span>{formatFileSize(file.size)}</span>
                        )}
                        {file.lastModified && (
                          <span>{formatDate(file.lastModified)}</span>
                        )}
                      </div>
                    </div>

                    {/* Directory Indicator */}
                    {file.type === 'directory' && (
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Selection Summary */}
      {internalSelectedFiles.size > 0 && (
        <div className="p-4 border-t border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {internalSelectedFiles.size} file{internalSelectedFiles.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setInternalSelectedFiles(new Set())}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebDAVFileBrowser; 