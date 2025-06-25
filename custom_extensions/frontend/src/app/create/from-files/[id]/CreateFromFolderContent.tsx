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
  X,
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
  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return "Size unknown";
    const kb = bytes / 1024;
    const mb = kb / 1024;
    const gb = mb / 1024;
    
    if (gb >= 1) return `${gb.toFixed(1)} GB`;
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    if (kb >= 1) return `${kb.toFixed(1)} KB`;
    return `${bytes} bytes`;
  };

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
              <span>{formatFileSize(file.size)}</span>
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
  const { folders, files, isLoading, error, refreshFolders, getFolderDetails, folderDetails, handleUpload } = useDocumentsContext();
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
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
    const indexedFiles = folderFiles.filter(f => f.status === 'indexed');
    setSelectedFileIds(indexedFiles.map(f => f.id));
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
      setIsUploading(true);
      try {
        await handleUpload(allowedFiles);
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        setIsUploading(false);
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

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  if (isLoading) {
    return (
      <main 
        className="min-h-screen relative overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,249,245,1) 0%, rgba(236,236,255,1) 30%, rgba(191,215,255,1) 60%, rgba(204,232,255,1) 100%)",
        }}
      >
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Loading folder contents...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main 
        className="min-h-screen relative overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,249,245,1) 0%, rgba(236,236,255,1) 30%, rgba(191,215,255,1) 60%, rgba(204,232,255,1) 100%)",
        }}
      >
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4 font-medium">Error loading folder: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!currentFolder) {
    return (
      <main 
        className="min-h-screen relative overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,249,245,1) 0%, rgba(236,236,255,1) 30%, rgba(191,215,255,1) 60%, rgba(204,232,255,1) 100%)",
        }}
      >
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-700 mb-4 font-medium">Folder not found</p>
            <Link 
              href="/create/from-files"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Folders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const indexedFiles = folderFiles.filter(f => f.status === 'indexed');
  const selectedCount = selectedFileIds.length;

  return (
    <main 
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,249,245,1) 0%, rgba(236,236,255,1) 30%, rgba(191,215,255,1) 60%, rgba(204,232,255,1) 100%)",
      }}
    >
      {/* Header */}
      <div className="bg-white/90 backdrop-blur border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link 
              href="/create/from-files"
              className="flex items-center gap-1 text-sm font-medium bg-white/70 hover:bg-white text-gray-900 backdrop-blur rounded-full px-3 py-1 shadow border border-gray-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to folders
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentFolder.name}</h1>
              <p className="text-gray-700 mt-1">{currentFolder.description}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>{indexedFiles.length} indexed files</span>
                <span>{folderFiles.length} total files</span>
              </div>
            </div>
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
            {isUploading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="relative">
                    <div className="h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Upload className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-medium text-gray-900">Uploading files...</p>
                    <p className="text-sm text-gray-600">Processing and indexing documents</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Documents</h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop files here, or click to select files
                </p>
                <button
                  onClick={handleFileSelect}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Choose Files
                </button>
                <p className="text-xs text-gray-500 mt-3">
                  Supported formats: PDF, DOC, TXT, CSV, PPT, Images, and more
                </p>
              </>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            accept={ALLOWED_FILE_TYPES.join(',')}
            className="hidden"
          />
        </div>

        {folderFiles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files in this folder yet</h3>
            <p className="text-gray-600">Upload documents using the area above to get started with content creation.</p>
          </div>
        ) : (
          <>
            {/* File selection controls */}
            <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSelectAll}
                  disabled={indexedFiles.length === 0}
                  className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                >
                  Select all indexed files
                </button>
                <button
                  onClick={handleDeselectAll}
                  disabled={selectedCount === 0}
                  className="text-sm text-gray-600 hover:text-gray-700 disabled:text-gray-400"
                >
                  Deselect all
                </button>
              </div>
              <span className="text-sm text-gray-600">
                {selectedCount} file{selectedCount !== 1 ? 's' : ''} selected
              </span>
            </div>

            {/* Files grid */}
            <div className="grid gap-4 mb-8">
              {folderFiles.map((file) => (
                <FileItem
                  key={file.id}
                  file={file}
                  isSelected={selectedFileIds.includes(file.id)}
                  onToggleSelect={() => handleToggleFile(file.id)}
                />
              ))}
            </div>

            {/* Create button */}
            <div className="sticky bottom-6 flex justify-center">
              <button
                onClick={handleCreateFromFiles}
                disabled={selectedCount === 0}
                className={`flex items-center gap-2 px-8 py-4 rounded-full font-medium text-lg transition-all ${
                  selectedCount > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Sparkles className="h-5 w-5" />
                Create from these files
                {selectedCount > 0 && (
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                    {selectedCount}
                  </span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default CreateFromFolderContent; 