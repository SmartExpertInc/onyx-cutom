"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Sparkles,
  ArrowLeft,
  FileText,
  CheckCircle2,
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
    if (!bytes) return "Unknown size";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`flex items-center justify-between py-3 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
      isSelected ? 'bg-blue-50 border-blue-200' : ''
    }`}>
      <div className="flex items-center gap-3 flex-1">
        <FileText className="h-5 w-5 text-blue-400" />
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{file.name}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
            <span>{formatFileSize(file.size)}</span>
            <span>{file.token_count ? `${file.token_count} tokens` : 'Not indexed'}</span>
            <span>Modified: {formatDate(file.lastModified)}</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={onToggleSelect}
        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
          isSelected 
            ? 'bg-blue-100 text-blue-700 border border-blue-300' 
            : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
        }`}
      >
        {isSelected ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Selected
          </>
        ) : (
          'Select'
        )}
      </button>
    </div>
  );
};

export default function CreateFromFolderContent({ folderId }: CreateFromFolderContentProps) {
  const router = useRouter();
  const {
    folderDetails,
    getFolderDetails,
    isLoading,
    selectedFiles,
    addSelectedFile,
    removeSelectedFile,
    clearSelectedItems,
  } = useDocumentsContext();

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getFolderDetails(folderId);
  }, [folderId, getFolderDetails]);

  const handleBack = () => {
    router.push("/create/from-files");
  };

  const handleCreateFromSelected = () => {
    if (selectedFiles.length === 0) return;
    
    // Create URL with selected file IDs
    const fileIds = selectedFiles.map(f => f.id).join(',');
    const params = new URLSearchParams({
      fromFiles: 'true',
      fileIds: fileIds,
    });
    
    router.push(`/create/generate?${params.toString()}`);
  };

  const handleCreateFromFolder = () => {
    if (!folderDetails) return;
    
    const params = new URLSearchParams({
      fromFiles: 'true',
      folderIds: folderDetails.id.toString(),
    });
    
    router.push(`/create/generate?${params.toString()}`);
  };

  const filteredFiles = folderDetails?.files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading || !folderDetails) {
    return (
      <div className="min-h-full w-full min-w-0 flex-1 mx-auto max-w-5xl px-4 pb-20 md:pl-8 mt-6 md:pr-8 2xl:pr-14">
        <div className="text-left space-y-4">
          <h2 className="flex items-center gap-1.5 text-lg font-medium leading-tight tracking-tight max-md:hidden">
            Loading...
          </h2>
        </div>
      </div>
    );
  }

  const totalTokens = folderDetails.files.reduce(
    (acc, file) => acc + (file.token_count || 0),
    0
  );

  return (
    <div className="min-h-full pt-20 w-full min-w-0 flex-1 mx-auto w-full max-w-[90rem] flex-1 px-4 pb-20 md:pl-8 md:pr-8 2xl:pr-14">
      {/* Back button */}
      <div className="absolute top-4 left-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm font-medium bg-white/70 hover:bg-white text-gray-900 backdrop-blur rounded-full px-3 py-1 shadow border border-gray-200"
        >
          <ArrowLeft size={14} />
          Back to Folders
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center mb-3">
        <nav className="flex text-base md:text-lg gap-x-1 items-center">
          <Link
            href="/create/from-files"
            className="font-medium leading-tight tracking-tight text-neutral-800 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer flex items-center"
          >
            Create from Files
          </Link>
          <span className="text-neutral-800 dark:text-neutral-700 flex items-center">
            <ChevronRight className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
          </span>
          <span className="font-medium leading-tight tracking-tight text-neutral-800 dark:text-neutral-300">
            {folderDetails.name}
          </span>
        </nav>
      </div>

      {/* Folder description */}
      {folderDetails.description && (
        <p className="text-gray-600 mb-4">{folderDetails.description}</p>
      )}

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative w-full max-w-xl">
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full pl-4 pr-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCreateFromFolder}
            className="flex items-center gap-2 p-4 bg-black rounded-full !text-xs text-white hover:bg-neutral-800"
          >
            <Sparkles className="w-3 h-3" />
            Create from entire folder
          </button>
          <div className="text-sm text-gray-600">
            {folderDetails.files.length} file{folderDetails.files.length !== 1 ? 's' : ''} • {totalTokens} tokens
          </div>
        </div>
      </div>

      {/* Selected files summary */}
      {selectedFiles.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">
                {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
              </p>
              <p className="text-sm text-blue-700">
                {selectedFiles.reduce((acc, file) => acc + (file.token_count || 0), 0)} tokens total
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearSelectedItems}
                className="px-3 py-1 text-sm border border-blue-300 text-blue-700 rounded-md hover:bg-blue-100"
              >
                Clear Selection
              </button>
              <button
                onClick={handleCreateFromSelected}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Sparkles className="h-4 w-4" />
                Create from selected files
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Files list */}
      <div className="flex-grow">
        {filteredFiles.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex flex-col">
              {filteredFiles.map((file) => (
                <FileItem
                  key={file.id}
                  file={file}
                  isSelected={selectedFiles.some(f => f.id === file.id)}
                  onToggleSelect={() => {
                    if (selectedFiles.some(f => f.id === file.id)) {
                      removeSelectedFile(file.id);
                    } else {
                      addSelectedFile(file);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <FileText
              className="w-20 h-20 text-gray-400 mb-4"
              strokeWidth={1.5}
            />
            <p className="text-gray-500 text-lg font-normal">
              No documents found
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Upload documents to this folder to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 