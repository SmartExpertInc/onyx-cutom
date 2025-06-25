"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Sparkles,
  ArrowLeft,
  FileText,
  CheckCircle2,
  Upload,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useDocumentsContext, FileResponse } from "../../../../components/documents/DocumentsContext";

interface CreateFromFolderContentProps {
  folderId: number;
}

interface FileItemProps {
  file: FileResponse;
  isSelected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
}

const FileItem: React.FC<FileItemProps> = ({ file, isSelected, onToggleSelect, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📋';
      case 'xlsx':
      case 'xls':
        return '📊';
      case 'pptx':
      case 'ppt':
        return '📱';
      default:
        return '📄';
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
    setShowDeleteConfirm(false);
  };
  
  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  return (
    <div 
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
      onClick={onToggleSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-2xl">{getFileIcon(file.name)}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{file.name}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              {file.token_count && file.token_count > 0 && <span>{file.token_count.toLocaleString()} tokens</span>}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                file.status === 'indexed' || file.indexed === true
                  ? 'bg-green-100 text-green-800' 
                  : file.status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {file.status === 'indexed' || file.indexed === true
                  ? 'Ready' 
                  : file.status === 'failed'
                  ? 'Failed'
                  : file.status === 'processing' || file.status === 'indexing'
                  ? 'Processing'
                  : file.status || 'Processing'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1">
              <button
                onClick={confirmDelete}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={cancelDelete}
                className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete file"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              {isSelected ? (
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
              ) : (
                <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced upload progress component
const UploadProgress: React.FC<{ fileName: string; progress: number }> = ({ fileName, progress }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Upload className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="text-left">
          <p className="text-lg font-medium text-gray-900">Uploading files...</p>
          <p className="text-sm text-gray-600 truncate max-w-xs">Processing: {fileName}</p>
        </div>
      </div>
      
      {/* Enhanced progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out relative"
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">Upload progress</span>
        <span className="font-medium text-blue-600">{Math.round(progress)}%</span>
      </div>
      
      <p className="text-center text-xs text-gray-500 animate-pulse">
        Files are being processed and indexed for AI analysis
      </p>
    </div>
  );
};

// Define allowed file extensions
const ALLOWED_FILE_TYPES = [
  ".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt",
  ".csv", ".xls", ".xlsx", ".ods",
  ".ppt", ".pptx", ".odp",
  ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp",
  ".html", ".htm", ".xml", ".json", ".md", ".markdown",
  ".zip", ".rar", ".7z", ".tar", ".gz",
  ".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".c", ".cpp", ".cs", ".php", ".rb", ".go", ".swift", ".css", ".scss", ".sass", ".less",
];

const CreateFromFolderContent: React.FC<CreateFromFolderContentProps> = ({ folderId }) => {
  const router = useRouter();
  const { folders, files, isLoading, error, refreshFolders, getFolderDetails, folderDetails, handleUpload, deleteItem } = useDocumentsContext();
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadFile, setCurrentUploadFile] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentFolder = folderDetails || folders?.find(f => f.id === folderId);
  const folderFiles = currentFolder?.files || files?.filter(f => f.folder_id === folderId) || [];

  useEffect(() => {
    // Optimized loading - only refresh if we don't have the folder details
    if (!folderDetails || folderDetails.id !== folderId) {
      refreshFolders();
      getFolderDetails(folderId);
    }
  }, [folderId]);

  const handleToggleFile = (fileId: number) => {
    setSelectedFileIds(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    const readyFiles = folderFiles.filter(f => f.status === 'indexed' || f.indexed === true);
    setSelectedFileIds(readyFiles.map(f => f.id));
  };

  const handleDeselectAll = () => {
    setSelectedFileIds([]);
  };

  const handleCreateFromFiles = () => {
    if (selectedFileIds.length === 0) return;

    const params = new URLSearchParams();
    params.set('fromFiles', 'true');
    params.set('fileIds', selectedFileIds.join(','));
    
    router.push(`/create/generate?${params.toString()}`);
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
      await deleteItem(fileId, false);
      setSelectedFileIds(prev => prev.filter(id => id !== fileId));
    } catch (error) {
      console.error("Failed to delete file:", error);
      alert("Failed to delete file. Please try again.");
    }
  };

  // File upload functions with enhanced progress tracking
  const isFileTypeAllowed = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf("."));
    return ALLOWED_FILE_TYPES.includes(fileExtension);
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await processFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFiles = async (files: File[]) => {
    const allowedFiles = files.filter(isFileTypeAllowed);
    const rejectedFiles = files.filter(file => !isFileTypeAllowed(file));

    if (rejectedFiles.length > 0) {
      alert(`Some files were rejected: ${rejectedFiles.map(f => f.name).join(', ')}`);
    }

    if (allowedFiles.length > 0) {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate enhanced progress tracking
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) return prev;
          const increment = Math.random() * 15 + 5;
          return Math.min(prev + increment, 95);
        });
      }, 500);

      try {
        // Set current file being processed
        if (allowedFiles.length > 0) {
          setCurrentUploadFile(allowedFiles[0].name);
        }
        
        await handleUpload(allowedFiles);
        
        // Complete the progress
        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          setCurrentUploadFile("");
        }, 1000);
        
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Upload failed. Please try again.");
        setIsUploading(false);
        setUploadProgress(0);
        setCurrentUploadFile("");
      } finally {
        clearInterval(progressInterval);
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen"
           style={{ background: 'linear-gradient(180deg, rgba(255,249,245,1) 0%, rgba(236,236,255,1) 30%, rgba(191,215,255,1) 60%, rgba(204,232,255,1) 100%)' }}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium">Loading folder contents...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen"
           style={{ background: 'linear-gradient(180deg, rgba(255,249,245,1) 0%, rgba(236,236,255,1) 30%, rgba(191,215,255,1) 60%, rgba(204,232,255,1) 100%)' }}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center text-red-600">
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  const readyFiles = folderFiles.filter(f => f.status === 'indexed' || f.indexed === true);
  const selectedCount = selectedFileIds.length;

  return (
    <div className="min-h-screen"
         style={{ background: 'linear-gradient(180deg, rgba(255,249,245,1) 0%, rgba(236,236,255,1) 30%, rgba(191,215,255,1) 60%, rgba(204,232,255,1) 100%)' }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* File Upload Section */}
        <div className="mb-8">
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <UploadProgress fileName={currentUploadFile} progress={uploadProgress} />
            ) : (
              <>
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop files here or click to upload
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Supports PDF, Word, Excel, PowerPoint, Text files and more
                </p>
                <button
                  onClick={handleFileSelect}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Choose Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept={ALLOWED_FILE_TYPES.join(',')}
                />
              </>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2 mb-6">
          <Link 
            href="/create/from-files" 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Folders
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="text-gray-700 font-medium">{currentFolder?.name || 'Unknown Folder'}</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Select Files from "{currentFolder?.name}"
              </h1>
              <p className="text-gray-600">
                Choose files to use as source material for your content creation
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {folderFiles.length} total files
              </p>
              <p className="text-sm text-green-600">
                {readyFiles.length} ready for use
              </p>
            </div>
          </div>
        </div>

        {/* File Selection Controls */}
        {readyFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSelectAll}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Select All ({readyFiles.length})
                </button>
                {selectedCount > 0 && (
                  <button
                    onClick={handleDeselectAll}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Deselect All
                  </button>
                )}
              </div>
              {selectedCount > 0 && (
                <button
                  onClick={handleCreateFromFiles}
                  className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  Create from {selectedCount} file{selectedCount !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Files Grid */}
        {folderFiles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files in this folder</h3>
            <p className="text-gray-600">Upload some files to get started with content creation.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folderFiles.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                isSelected={selectedFileIds.includes(file.id)}
                onToggleSelect={() => handleToggleFile(file.id)}
                onDelete={() => handleDeleteFile(file.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateFromFolderContent; 