"use client";

import React, { useState, useEffect } from 'react';
import { X, Folder, File, CheckSquare, Square, ArrowLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDocumentsContext } from '../documents/DocumentsContext';

interface SmartDriveFile {
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  modified?: string;
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
  const { t } = useLanguage();
  const { listSmartDrive } = useDocumentsContext();
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState<SmartDriveFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pathHistory, setPathHistory] = useState<string[]>(['/']);

  // Load files when path changes
  useEffect(() => {
    if (isOpen) {
      loadFiles(currentPath);
    }
  }, [currentPath, isOpen]);

  const loadFiles = async (path: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listSmartDrive(path);
      setFiles(result || []);
    } catch (err) {
      setError(t('smartdrive.loadError', 'Failed to load files'));
      console.error('Smart Drive load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderClick = (folder: SmartDriveFile) => {
    const newPath = folder.path;
    setCurrentPath(newPath);
    setPathHistory(prev => [...prev, newPath]);
  };

  const handleBackClick = () => {
    if (pathHistory.length > 1) {
      const newHistory = [...pathHistory];
      newHistory.pop();
      const previousPath = newHistory[newHistory.length - 1];
      setCurrentPath(previousPath);
      setPathHistory(newHistory);
    }
  };

  const handleFileToggle = (file: SmartDriveFile) => {
    if (file.type === 'file') {
      const newSelected = new Set(selectedFiles);
      if (newSelected.has(file.path)) {
        newSelected.delete(file.path);
      } else {
        newSelected.add(file.path);
      }
      setSelectedFiles(newSelected);
    }
  };

  const handleSelectAll = () => {
    const fileItems = files.filter(f => f.type === 'file');
    const allSelected = fileItems.every(f => selectedFiles.has(f.path));
    
    if (allSelected) {
      // Deselect all files in current folder
      const newSelected = new Set(selectedFiles);
      fileItems.forEach(f => newSelected.delete(f.path));
      setSelectedFiles(newSelected);
    } else {
      // Select all files in current folder
      const newSelected = new Set(selectedFiles);
      fileItems.forEach(f => newSelected.add(f.path));
      setSelectedFiles(newSelected);
    }
  };

  const handleDone = () => {
    onFilesSelected(Array.from(selectedFiles));
    setSelectedFiles(new Set());
    onClose();
  };

  const handleClose = () => {
    setSelectedFiles(new Set());
    setCurrentPath('/');
    setPathHistory(['/']);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const getPathBreadcrumbs = () => {
    if (currentPath === '/') return [{ name: 'Home', path: '/' }];
    
    const segments = currentPath.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', path: '/' }];
    
    let currentBuildPath = '';
    segments.forEach(segment => {
      currentBuildPath += '/' + segment;
      breadcrumbs.push({ name: segment, path: currentBuildPath });
    });
    
    return breadcrumbs;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('smartdrive.selectFiles', 'Select Files from Smart Drive')}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 text-sm">
            {getPathBreadcrumbs().map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
                <button
                  onClick={() => {
                    setCurrentPath(crumb.path);
                    setPathHistory(pathHistory.slice(0, index + 1));
                  }}
                  className={`px-2 py-1 rounded hover:bg-gray-200 transition-colors ${
                    crumb.path === currentPath ? 'text-blue-600 font-medium' : 'text-gray-600'
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackClick}
              disabled={pathHistory.length <= 1}
              className="inline-flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('smartdrive.back', 'Back')}
            </button>
            {files.some(f => f.type === 'file') && (
              <button
                onClick={handleSelectAll}
                className="inline-flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {files.filter(f => f.type === 'file').every(f => selectedFiles.has(f.path)) ? (
                  <>
                    <CheckSquare className="h-4 w-4" />
                    {t('smartdrive.deselectAll', 'Deselect All')}
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4" />
                    {t('smartdrive.selectAll', 'Select All')}
                  </>
                )}
              </button>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {selectedFiles.size > 0 && (
              <span>
                {t('smartdrive.selectedCount', '{count} file(s) selected').replace('{count}', selectedFiles.size.toString())}
              </span>
            )}
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-gray-600">{t('smartdrive.loading', 'Loading files...')}</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-600 mb-2">{error}</p>
                <button
                  onClick={() => loadFiles(currentPath)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {t('smartdrive.retry', 'Retry')}
                </button>
              </div>
            </div>
          ) : files.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-600">{t('smartdrive.noFiles', 'No files found in this folder')}</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {files.map((file) => (
                <div
                  key={file.path}
                  onClick={() => file.type === 'folder' ? handleFolderClick(file) : handleFileToggle(file)}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    file.type === 'file' && selectedFiles.has(file.path)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {file.type === 'folder' ? (
                      <Folder className="h-5 w-5 text-blue-600" />
                    ) : selectedFiles.has(file.path) ? (
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{file.name}</p>
                    {file.type === 'file' && (
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {file.size && <span>{formatFileSize(file.size)}</span>}
                        {file.modified && <span>{new Date(file.modified).toLocaleDateString()}</span>}
                      </div>
                    )}
                  </div>
                  {file.type === 'file' && (
                    <File className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {t('smartdrive.cancel', 'Cancel')}
          </button>
          <button
            onClick={handleDone}
            disabled={selectedFiles.size === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('smartdrive.done', 'Done')} {selectedFiles.size > 0 && `(${selectedFiles.size})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartDrivePickerModal; 