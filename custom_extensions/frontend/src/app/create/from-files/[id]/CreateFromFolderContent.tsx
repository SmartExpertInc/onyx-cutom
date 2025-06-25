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
  Plus,
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
}

const FileItem: React.FC<FileItemProps> = ({ file, isSelected, onToggleSelect }) => {
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
        <div className="flex-shrink-0">
          {isSelected ? (
            <CheckCircle2 className="h-5 w-5 text-blue-500" />
          ) : (
            <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced upload progress component
const UploadProgressDisplay: React.FC<{ 
  fileCount: number;
  completedCount: number;
  currentFileName: string;
  percentage: number;
}> = ({ fileCount, completedCount, currentFileName, percentage }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-3">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Upload className="h-7 w-7 text-blue-600 animate-pulse" />
          </div>
        </div>
        <div className="text-left">
          <p className="text-xl font-semibold text-gray-900">Uploading Files</p>
          <p className="text-sm text-gray-600">
            Processing: {currentFileName}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {completedCount} of {fileCount} files completed
          </p>
        </div>
      </div>
      
      {/* Animated progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
      
      <div className="text-center">
        <span className="text-lg font-medium text-blue-600">{percentage}%</span>
        <p className="text-sm text-gray-600 mt-1">
          {percentage === 100 ? 'Finalizing upload...' : 'Indexing and processing documents'}
        </p>
      </div>
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
  const { folders, files, isLoading, error, refreshFolders, getFolderDetails, folderDetails, handleUpload, uploadProgress } = useDocumentsContext();
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentFolder = folderDetails || folders?.find(f => f.id === folderId);
  const folderFiles = currentFolder?.files || files?.filter(f => f.folder_id === folderId) || [];

  useEffect(() => {
    refreshFolders();
    getFolderDetails(folderId);
  }, [refreshFolders, getFolderDetails, folderId]);

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

  // File upload functions
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
      try {
        await handleUpload(allowedFiles);
      } catch (error) {
        console.error('Upload error:', error);
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
    if (e.currentTarget === e.target) {
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

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      await processFiles(droppedFiles);
    }
  };

  if (isLoading && !folderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-purple-50 to-blue-100">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Loading folder...</p>
            <p className="text-gray-600 text-sm mt-1">Preparing your documents</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-purple-50 to-blue-100">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-600 font-medium">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentFolder) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-purple-50 to-blue-100">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-gray-600 font-medium">Folder not found</p>
          </div>
        </div>
      </div>
    );
  }

  const readyFiles = folderFiles.filter(f => f.status === 'indexed' || f.indexed === true);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-purple-50 to-blue-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link href="/create" className="hover:text-gray-900">Create</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/create/from-files" className="hover:text-gray-900">From Files</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900">{currentFolder.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentFolder.name}</h1>
              {currentFolder.description && (
                <p className="text-gray-600 mt-1">{currentFolder.description}</p>
              )}
            </div>
            <Link
              href="/create/from-files"
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
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
            {uploadProgress ? (
              <UploadProgressDisplay 
                fileCount={uploadProgress.fileCount}
                completedCount={uploadProgress.completedCount}
                currentFileName={uploadProgress.currentFileName}
                percentage={uploadProgress.percentage}
              />
            ) : (
              <>
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Documents</h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop files here, or click to select files
                </p>
                <button
                  onClick={handleFileSelect}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Select Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept={ALLOWED_FILE_TYPES.join(',')}
                />
              </>
            )}
          </div>
        </div>

        {/* Files Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Files in this folder</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {folderFiles.length} total files, {readyFiles.length} ready for content creation
                </p>
              </div>
              {readyFiles.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {folderFiles.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No files in this folder yet</p>
                <p className="text-sm text-gray-500 mt-1">Upload some documents to get started</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {folderFiles.map((file) => (
                  <FileItem
                    key={file.id}
                    file={file}
                    isSelected={selectedFileIds.includes(file.id)}
                    onToggleSelect={() => handleToggleFile(file.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Files Actions */}
        {selectedFileIds.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">
                  {selectedFileIds.length} file{selectedFileIds.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-blue-700">
                  Ready to create content from these documents
                </p>
              </div>
              <button
                onClick={handleCreateFromFiles}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                <Sparkles className="h-4 w-4" />
                Create Content
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateFromFolderContent; 