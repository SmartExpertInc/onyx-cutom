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
  Home as HomeIcon,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import { useDocumentsContext, FileResponse } from "../../../../components/documents/DocumentsContext";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CreateFromFolderContentProps {
  folderId: number;
}

interface FileItemProps {
  file: FileResponse;
  isSelected: boolean;
  onToggleSelect: () => void;
}

// Component for file status badge with spinner for indexing
const FileStatusBadge: React.FC<{ file: FileResponse }> = ({ file }) => {
  const { t } = useLanguage();
  // Determine display status based on backend status
  const status = file.status?.toUpperCase();
  const isReady = status === 'INDEXED' || file.indexed === true;
  const isProcessing = status === 'INDEXING' || status === 'REINDEXING' || status === 'PROCESSING';
  const isFailed = status === 'FAILED';

  return (
    <Badge 
      variant={isReady ? "default" : isFailed ? "destructive" : "secondary"}
      className="inline-flex items-center gap-1"
    >
      {isProcessing && (
        <div className="w-3 h-3 border border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
      )}
      {isReady
        ? t('actions.ready', 'Ready')
        : isFailed
        ? t('actions.failed', 'Failed')
        : t('actions.processing', 'Processing')}
    </Badge>
  );
};

const FileItem: React.FC<FileItemProps> = ({ file, isSelected, onToggleSelect }) => {
  const { t } = useLanguage();
  const getFileIcon = (file: FileResponse) => {
    // Special icon for link-based files
    if (file.link_url) {
      return '🔗';
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
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

  const isFileReady = file.status?.toUpperCase() === 'INDEXED' || file.indexed === true;
  const isFileProcessing = ['INDEXING', 'REINDEXING', 'PROCESSING'].includes(file.status?.toUpperCase() || '');

  return (
    <Card 
      className={`transition-all cursor-pointer ${
        isFileReady 
          ? (isSelected 
              ? 'border-blue-500 bg-blue-50' 
              : 'hover:border-gray-300')
          : 'cursor-not-allowed opacity-75'
      }`}
      onClick={isFileReady ? onToggleSelect : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-2xl">{getFileIcon(file)}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{file.name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                {file.token_count && file.token_count > 0 && <span>{file.token_count.toLocaleString()} {t('actions.tokens', 'tokens')}</span>}
                <FileStatusBadge file={file} />
                {isFileProcessing && <span className="text-xs text-gray-400">{t('actions.pleaseWait', 'Please wait...')}</span>}
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            {isFileReady ? (
              isSelected ? (
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
              ) : (
                <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
              )
            ) : (
              <div className="h-5 w-5 border-2 border-gray-200 rounded-full bg-gray-100" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced upload progress component
const UploadProgressDisplay: React.FC<{ 
  fileCount: number;
  completedCount: number;
  currentFileName: string;
  percentage: number;
}> = ({ fileCount, completedCount, currentFileName, percentage }) => {
  const { t } = useLanguage();
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
          <p className="text-xl font-semibold text-gray-900">{t('actions.processingFiles', 'Processing Files')}</p>
          <p className="text-sm text-gray-600">
            {t('actions.uploadingAndIndexing', 'Uploading & indexing: {fileName}').replace('{fileName}', currentFileName)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {t('actions.filesCompleted', '{completed} of {total} files completed').replace('{completed}', completedCount.toString()).replace('{total}', fileCount.toString())}
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
          {percentage === 100 ? t('actions.processingComplete', 'Processing complete! Files are ready.') : t('actions.uploadingAndIndexingDocuments', 'Uploading and indexing documents...')}
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
  const { t } = useLanguage();
  const { folders, files, isLoading, error, getFolderDetails, folderDetails, handleUpload, uploadProgress, setCurrentFolder, createFileFromLink } = useDocumentsContext();
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [isCreatingFromUrl, setIsCreatingFromUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
   
  const currentFolder = folderDetails;
  const folderFiles = currentFolder?.files || [];

  console.log('Current folder:', currentFolder?.name, 'Files count:', folderFiles.length);
  console.log('Folder files status:', folderFiles.map(f => ({ name: f.name, status: f.status, indexed: f.indexed })));

  // Auto-refresh folder details when files are processing
  useEffect(() => {
    const processingFiles = folderFiles.filter(f => {
      const status = f.status?.toUpperCase();
      return status === 'INDEXING' || status === 'REINDEXING' || status === 'PROCESSING';
    });

    console.log('Processing files found:', processingFiles.length, processingFiles.map(f => ({ name: f.name, status: f.status })));

    if (processingFiles.length > 0) {
      console.log('Starting polling for processing files...');
      const interval = setInterval(async () => {
        try {
          console.log('Polling for folder updates...');
          await getFolderDetails(folderId);
        } catch (error) {
          console.error('Error refreshing folder details:', error);
        }
      }, 3000); // Check every 3 seconds

      return () => {
        console.log('Stopping polling for processing files');
        clearInterval(interval);
      };
    } else {
      console.log('No processing files, not starting polling');
    }
  }, [folderFiles, folderId, getFolderDetails]);

  useEffect(() => {
    if (folderId && (!folderDetails || folderDetails.id !== folderId)) {
      setCurrentFolder(folderId);
      getFolderDetails(folderId);
    }
  }, [folderId, setCurrentFolder, getFolderDetails, folderDetails]);

  const handleToggleFile = (fileId: number) => {
    const file = folderFiles.find(f => f.id === fileId);
    const status = file?.status?.toUpperCase();
    const isFileReady = file && (status === 'INDEXED' || file.indexed === true);
    
    if (!isFileReady) return; // Don't allow selection of non-ready files
    
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

  const validateUrl = (url: string) => {
    try {
      new URL(url.includes("://") ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleCreateFromWebsite = async () => {
    const trimmed = linkUrl.trim();
    if (!trimmed) return;
    if (!validateUrl(trimmed)) {
      setUrlError(t('actions.invalidUrl', 'Please enter a valid URL (e.g., https://example.com)'));
      return;
    }
    setUrlError(null);
    setIsCreatingFromUrl(true);
    try {
      await createFileFromLink(trimmed, folderId);
      setLinkUrl("");
      await getFolderDetails(folderId);
    } catch (e) {
      setUrlError(t('actions.failedToCreateFromUrl', 'Failed to create from URL'));
    } finally {
      setIsCreatingFromUrl(false);
    }
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreateFromWebsite();
    }
  };

  if (isLoading && !folderDetails) {
    return (
      <main
        className="min-h-screen flex flex-col"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,249,245,1) 0%, rgba(236,236,255,1) 30%, rgba(191,215,255,1) 60%, rgba(204,232,255,1) 100%)",
        }}
      >
        <div className="flex justify-center items-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <p className="text-gray-700 font-semibold text-lg">{t('actions.loadingFolder', 'Loading folder...')}</p>
            <p className="text-gray-600 text-sm mt-2">{t('actions.fetchingDocuments', 'Fetching your documents')}</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main
        className="min-h-screen flex flex-col"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,249,245,1) 0%, rgba(236,236,255,1) 30%, rgba(191,215,255,1) 60%, rgba(204,232,255,1) 100%)",
        }}
      >
        <div className="flex justify-center items-center flex-1">
          <div className="text-center">
            <p className="text-red-600 font-medium">Error: {error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!currentFolder) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-purple-50 to-blue-100">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-gray-600 font-medium">{t('actions.folderNotFound', 'Folder not found')}</p>
          </div>
        </div>
      </div>
    );
  }

  const readyFiles = folderFiles.filter(f => 
    f.status?.toUpperCase() === 'INDEXED' || f.indexed === true
  );

  return (
    <main
      className="min-h-screen flex flex-col relative"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,249,245,1) 0%, rgba(236,236,255,1) 30%, rgba(191,215,255,1) 60%, rgba(204,232,255,1) 100%)",
      }}
    >
      {/* Upload Progress Overlay */}
      {uploadProgress && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
            <UploadProgressDisplay {...uploadProgress} />
          </div>
        </div>
      )}

      {/* Header - removed white background */}
      <div className="p-6 pb-0">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/projects" className="flex items-center">
                  <HomeIcon className="h-4 w-4" />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/create">Create</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/create/from-files">Browse Files</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {currentFolder?.name || "Folder"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header Content */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/create/from-files"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              {t('actions.backToFolders', 'Back to Folders')}
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              {currentFolder?.name || "Folder"}
            </h1>
            <Button
              onClick={() => getFolderDetails(folderId)}
              variant="outline"
              size="sm"
            >
              {t('actions.refresh', 'Refresh')}
            </Button>
          </div>
          <p className="text-gray-600">
            {t('actions.selectFilesToCreate', 'Select files to create educational content from your documents')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6" style={{ paddingBottom: selectedFileIds.length > 0 ? '100px' : '24px' }}>
        {/* Add Website + File Upload Side-by-Side */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Website Section */}
          <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 text-center transition-all">
            <CardContent className="p-6">
              <LinkIcon className="h-10 w-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('actions.addWebsite', 'Add a website')}</h3>
              <p className="text-gray-600 mb-4">{t('actions.addWebsiteHelp', 'Paste a URL to include the page content in this folder')}</p>
            <div className="mt-1 flex items-center gap-2 max-w-lg mx-auto">
              <Input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={handleUrlKeyDown}
                placeholder={t('actions.enterUrl', 'Enter URL (e.g., https://example.com/article)')}
                className="flex-1"
              />
              <Button
                onClick={handleCreateFromWebsite}
                disabled={isCreatingFromUrl || !linkUrl.trim()}
                variant="download"
                className="inline-flex items-center gap-2"
              >
                {isCreatingFromUrl ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('actions.adding', 'Adding...')}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    {t('actions.addUrl', 'Add URL')}
                  </>
                )}
              </Button>
            </div>
            {urlError && <p className="text-sm text-red-600 mt-2">{urlError}</p>}
            {isCreatingFromUrl && (
              <div className="mt-3 max-w-lg mx-auto">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-500 h-2 animate-pulse w-3/4" />
                </div>
                <p className="text-xs text-gray-500 mt-2">{t('actions.fetchingAndIndexing', 'Fetching and indexing content...')}</p>
              </div>
            )}
            </CardContent>
          </Card>

          {/* File Upload Section */}
          <Card 
            className={`border-2 border-dashed text-center transition-all ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <CardContent className="p-6">
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('actions.uploadDocuments', 'Upload Documents')}</h3>
                  <p className="text-gray-600 mb-4">
                    {t('actions.dragAndDropFiles', 'Drag and drop files here, or click to select files')}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    {t('actions.filesWillBeProcessed', 'Files will be automatically processed and indexed for content creation')}
                  </p>
                  <Button
                    onClick={handleFileSelect}
                    variant="download"
                    className="inline-flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {t('actions.selectFiles', 'Select Files')}
                  </Button>
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
            </CardContent>
          </Card>
        </div>

        {/* Files Section */}
        <Card className="shadow-sm">
          <CardContent className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{t('actions.filesInThisFolder', 'Files in this folder')}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {t('actions.totalFilesReady', '{total} total files, {ready} ready for content creation').replace('{total}', folderFiles.length.toString()).replace('{ready}', readyFiles.length.toString())}
                  {folderFiles.length > readyFiles.length && (
                    <span className="text-yellow-600 ml-1">
                      {t('actions.stillProcessing', '({processing} still processing)').replace('{processing}', (folderFiles.length - readyFiles.length).toString())}
                    </span>
                  )}
                </p>
              </div>
              {readyFiles.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSelectAll}
                    variant="outline"
                    size="sm"
                  >
                    {t('actions.selectAll', 'Select All')}
                  </Button>
                  <Button
                    onClick={handleDeselectAll}
                    variant="outline"
                    size="sm"
                  >
                    {t('actions.clear', 'Clear')}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>

          <CardContent className="p-6">
            {folderFiles.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t('actions.noFilesInFolder', 'No files in this folder yet')}</p>
                <p className="text-sm text-gray-500 mt-1">{t('actions.uploadSomeDocuments', 'Upload some documents to get started')}</p>
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
          </CardContent>
        </Card>
      </div>

      {/* Fixed Bottom Action Bar */}
      {selectedFileIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {t('actions.filesSelected', '{count} file{plural} selected').replace('{count}', selectedFileIds.length.toString()).replace('{plural}', selectedFileIds.length !== 1 ? 's' : '')}
                </p>
                <p className="text-sm text-gray-600">
                  {t('actions.readyToCreateContent', 'Ready to create content from these documents')}
                </p>
              </div>
              <Button
                onClick={handleCreateFromFiles}
                variant="download"
                className="inline-flex items-center gap-2 font-medium"
              >
                <Sparkles className="h-4 w-4" />
                {t('actions.createContent', 'Create Content')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default CreateFromFolderContent; 