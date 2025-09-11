"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Folder, 
  File, 
  Image, 
  FileText, 
  Video, 
  Music, 
  Archive,
  Code,
  Download,
  Search,
  ChevronRight,
  Home,
  Check,
  Minus,
  RefreshCw,
  ArrowUp
} from 'lucide-react';

interface SmartDriveFile {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified: string;
  mime_type?: string;
  etag?: string;
}

interface NextcloudFileBrowserProps {
  onFilesSelected: (selectedFiles: string[]) => void;
  selectedFiles?: string[];
  className?: string;
}

const NextcloudFileBrowser: React.FC<NextcloudFileBrowserProps> = ({
  onFilesSelected,
  selectedFiles = [],
  className = ''
}) => {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [files, setFiles] = useState<SmartDriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [internalSelectedFiles, setInternalSelectedFiles] = useState<Set<string>>(new Set(selectedFiles));
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'size'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Load files for current path
  const loadFiles = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/custom-projects-backend/smartdrive/list?path=${encodeURIComponent(path)}`,
        {
          credentials: 'same-origin',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load files: ${response.statusText}`);
      }

      const data = await response.json();
      setFiles(data.files || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
      console.error('Failed to load files:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load files when path changes
  useEffect(() => {
    loadFiles(currentPath);
  }, [currentPath, loadFiles]);

  // Update internal selection when props change
  useEffect(() => {
    setInternalSelectedFiles(new Set(selectedFiles));
  }, [selectedFiles]);

  // Notify parent when selection changes
  useEffect(() => {
    onFilesSelected(Array.from(internalSelectedFiles));
  }, [internalSelectedFiles, onFilesSelected]);

  // Get file icon based on mime type or extension
  const getFileIcon = (file: SmartDriveFile) => {
    if (file.type === 'directory') {
      return <Folder className="w-4 h-4 text-blue-500" />;
    }

    const mimeType = file.mime_type || '';
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return <Image className="w-4 h-4 text-green-500" />;
    }
    if (mimeType.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension)) {
      return <Video className="w-4 h-4 text-red-500" />;
    }
    if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'flac', 'ogg'].includes(extension)) {
      return <Music className="w-4 h-4 text-purple-500" />;
    }
    if (mimeType.startsWith('text/') || ['txt', 'md', 'rtf'].includes(extension)) {
      return <FileText className="w-4 h-4 text-gray-500" />;
    }
    if (['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(extension)) {
      return <FileText className="w-4 h-4 text-orange-500" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return <Archive className="w-4 h-4 text-yellow-500" />;
    }
    if (['js', 'ts', 'html', 'css', 'py', 'java', 'cpp', 'c'].includes(extension)) {
      return <Code className="w-4 h-4 text-indigo-500" />;
    }

    return <File className="w-4 h-4 text-gray-400" />;
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Handle file/folder click
  const handleItemClick = (file: SmartDriveFile) => {
    if (file.type === 'directory') {
      setCurrentPath(file.path);
    }
  };

  // Handle file selection
  const handleFileSelect = (file: SmartDriveFile, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (file.type === 'directory') return; // Don't select directories
    
    const newSelection = new Set(internalSelectedFiles);
    if (newSelection.has(file.path)) {
      newSelection.delete(file.path);
    } else {
      newSelection.add(file.path);
    }
    setInternalSelectedFiles(newSelection);
  };

  // Select all files (not directories)
  const handleSelectAll = () => {
    const fileList = filteredAndSortedFiles.filter(f => f.type === 'file');
    const allSelected = fileList.every(f => internalSelectedFiles.has(f.path));
    
    const newSelection = new Set(internalSelectedFiles);
    fileList.forEach(file => {
      if (allSelected) {
        newSelection.delete(file.path);
      } else {
        newSelection.add(file.path);
      }
    });
    setInternalSelectedFiles(newSelection);
  };

  // Navigate up one level
  const navigateUp = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      pathParts.pop();
      const newPath = '/' + pathParts.join('/');
      setCurrentPath(newPath === '/' ? '/' : newPath + '/');
    }
  };

  // Navigate to specific breadcrumb
  const navigateToBreadcrumb = (index: number) => {
    const pathParts = currentPath.split('/').filter(Boolean);
    if (index === -1) {
      setCurrentPath('/');
    } else {
      const newPathParts = pathParts.slice(0, index + 1);
      setCurrentPath('/' + newPathParts.join('/') + '/');
    }
  };

  // Filter and sort files
  const filteredAndSortedFiles = files
    .filter(file => 
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Directories first
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }

      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'modified':
          comparison = new Date(a.modified).getTime() - new Date(b.modified).getTime();
          break;
        case 'size':
          comparison = (a.size || 0) - (b.size || 0);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Generate breadcrumbs
  const breadcrumbs = currentPath === '/' 
    ? [] 
    : currentPath.split('/').filter(Boolean);

  const selectedFileCount = internalSelectedFiles.size;
  const allFilesSelected = filteredAndSortedFiles
    .filter(f => f.type === 'file')
    .every(f => internalSelectedFiles.has(f.path));

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadFiles(currentPath)}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            {currentPath !== '/' && (
              <button
                onClick={navigateUp}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                title="Up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}

            <div className="text-sm text-gray-600">
              {selectedFileCount > 0 && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {selectedFileCount} selected
                </span>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center px-3 py-2 text-sm">
          <button
            onClick={() => navigateToBreadcrumb(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
          >
            <Home className="w-4 h-4 mr-1" />
            Home
          </button>
          
          {breadcrumbs.map((part, index) => (
            <React.Fragment key={index}>
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              <button
                onClick={() => navigateToBreadcrumb(index)}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
              >
                {part}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* File list */}
      <div className="overflow-hidden">
        {/* Table header */}
        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2">
          <div className="grid grid-cols-12 gap-3 items-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-1 flex items-center">
              <button
                onClick={handleSelectAll}
                className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center hover:border-blue-500 transition-colors"
              >
                {allFilesSelected && filteredAndSortedFiles.some(f => f.type === 'file') ? (
                  <Check className="w-3 h-3 text-blue-600" />
                ) : internalSelectedFiles.size > 0 ? (
                  <Minus className="w-3 h-3 text-blue-600" />
                ) : null}
              </button>
            </div>
            <div className="col-span-6">
              <button
                onClick={() => {
                  setSortBy('name');
                  setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                }}
                className="hover:text-gray-700 transition-colors"
              >
                Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
            <div className="col-span-3">
              <button
                onClick={() => {
                  setSortBy('modified');
                  setSortOrder(sortBy === 'modified' && sortOrder === 'asc' ? 'desc' : 'asc');
                }}
                className="hover:text-gray-700 transition-colors"
              >
                Modified {sortBy === 'modified' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
            <div className="col-span-2">
              <button
                onClick={() => {
                  setSortBy('size');
                  setSortOrder(sortBy === 'size' && sortOrder === 'asc' ? 'desc' : 'asc');
                }}
                className="hover:text-gray-700 transition-colors"
              >
                Size {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading files...</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-500 mb-2">Failed to load files</div>
              <div className="text-sm text-gray-500 mb-4">{error}</div>
              <button
                onClick={() => loadFiles(currentPath)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* File list */}
        {!loading && !error && (
          <div className="max-h-96 overflow-y-auto">
            {filteredAndSortedFiles.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchTerm ? 'No files match your search.' : 'This folder is empty.'}
              </div>
            ) : (
              filteredAndSortedFiles.map((file, index) => (
                <div
                  key={file.path}
                  className={`grid grid-cols-12 gap-3 items-center px-3 py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    internalSelectedFiles.has(file.path) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleItemClick(file)}
                >
                  {/* Selection checkbox */}
                  <div className="col-span-1">
                    {file.type === 'file' && (
                      <button
                        onClick={(e) => handleFileSelect(file, e)}
                        className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center hover:border-blue-500 transition-colors"
                      >
                        {internalSelectedFiles.has(file.path) && (
                          <Check className="w-3 h-3 text-blue-600" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* File name and icon */}
                  <div className="col-span-6 flex items-center gap-2 min-w-0">
                    {getFileIcon(file)}
                    <span className="truncate text-sm" title={file.name}>
                      {file.name}
                    </span>
                    {file.type === 'directory' && (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  {/* Modified date */}
                  <div className="col-span-3 text-xs text-gray-500">
                    {formatDate(file.modified)}
                  </div>

                  {/* File size */}
                  <div className="col-span-2 text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer with selection info */}
      {selectedFileCount > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedFileCount} file{selectedFileCount !== 1 ? 's' : ''} selected
            </div>
            <button
              onClick={() => setInternalSelectedFiles(new Set())}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NextcloudFileBrowser; 