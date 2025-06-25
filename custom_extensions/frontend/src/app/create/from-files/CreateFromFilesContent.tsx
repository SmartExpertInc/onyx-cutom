"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  FolderOpen,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useDocumentsContext, FolderResponse } from "../../../components/documents/DocumentsContext";

enum SortType {
  TimeCreated = "Time Created",
  Alphabetical = "Alphabetical",
  Tokens = "Tokens",
}

enum SortDirection {
  Ascending = "asc",
  Descending = "desc",
}

const SkeletonLoader = () => (
  <div className="flex justify-center items-center w-full h-64">
    <div className="animate-pulse flex flex-col items-center gap-5 w-full">
      <div className="h-28 w-28 rounded-full from-primary/20 to-primary/30 dark:from-neutral-700 dark:to-neutral-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-r-0 border-l-0 border-primary dark:border-neutral-300"></div>
      </div>
      <div className="space-y-3">
        <div className="h-5 w-56 bg-gradient-to-r from-primary/20 to-primary/30 dark:from-neutral-700 dark:to-neutral-600 rounded-md"></div>
        <div className="h-4 w-40 bg-gradient-to-r from-primary/20 to-primary/30 dark:from-neutral-700 dark:to-neutral-600 rounded-md"></div>
        <div className="h-3 w-32 bg-gradient-to-r from-primary/20 to-primary/30 dark:from-neutral-700 dark:to-neutral-600 rounded-md"></div>
      </div>
    </div>
  </div>
);

// Enhanced folder item component for creation workflow
interface CreateFolderItemProps {
  folder: FolderResponse & { tokens: number };
  onClick: (id: number) => void;
  description: string;
  lastUpdated: string;
  onDelete: () => void;
  isSelected: boolean;
  onToggleSelect: () => void;
}

const CreateFolderItem: React.FC<CreateFolderItemProps> = ({
  folder,
  onClick,
  description,
  lastUpdated,
  onDelete,
  isSelected,
  onToggleSelect,
}) => {
  return (
    <div 
      className={`flex items-center justify-between py-3 px-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-blue-200' : ''
      }`}
    >
      <div className="flex items-center gap-3 flex-1" onClick={() => onClick(folder.id)}>
        <FolderOpen className="h-5 w-5 text-orange-400" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">{folder.name}</h3>
            <span className="text-sm text-gray-500">
              {folder.files.length} file{folder.files.length !== 1 ? 's' : ''}
            </span>
          </div>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Created: {new Date(lastUpdated).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
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
    </div>
  );
};

export default function CreateFromFilesContent() {
  const {
    folders,
    currentFolder,
    searchQuery,
    page,
    refreshFolders,
    createFolder,
    deleteItem,
    isLoading,
    setCurrentFolder,
    setSearchQuery,
    setPage,
    selectedFolders,
    addSelectedFolder,
    removeSelectedFolder,
    clearSelectedItems,
  } = useDocumentsContext();

  const [sortType, setSortType] = useState<SortType>(SortType.TimeCreated);
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SortDirection.Descending
  );

  const searchParams = useSearchParams();
  const router = useRouter();
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [hoveredColumn, setHoveredColumn] = useState<SortType | null>(null);

  const handleSortChange = (newSortType: SortType) => {
    if (sortType === newSortType) {
      setSortDirection(
        sortDirection === SortDirection.Ascending
          ? SortDirection.Descending
          : SortDirection.Ascending
      );
    } else {
      setSortType(newSortType);
      setSortDirection(SortDirection.Descending);
    }
  };

  const handleFolderClick = (id: number) => {
    startTransition(() => {
      router.push(`/create/from-files/${id}`);
      setPage(1);
      setCurrentFolder(id);
    });
  };

  const handleCreateFolder = async (folderName: string) => {
    try {
      await createFolder(folderName);
      setIsCreatingFolder(false);
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  };

  const handleDeleteItem = async (itemId: number, isFolder: boolean) => {
    if (confirm(`Are you sure you want to delete this ${isFolder ? 'folder' : 'file'}?`)) {
      try {
        await deleteItem(itemId, isFolder);
      } catch (error) {
        console.error("Failed to delete item:", error);
      }
    }
  };

  const filteredFolders = useMemo(() => {
    return folders
      .filter(
        (folder) =>
          folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          folder.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        let comparison = 0;

        if (sortType === SortType.TimeCreated) {
          comparison =
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else if (sortType === SortType.Alphabetical) {
          comparison = a.name.localeCompare(b.name);
        } else if (sortType === SortType.Tokens) {
          const aTokens = a.files.reduce(
            (acc, file) => acc + (file.token_count || 0),
            0
          );
          const bTokens = b.files.reduce(
            (acc, file) => acc + (file.token_count || 0),
            0
          );
          comparison = bTokens - aTokens;
        }

        return sortDirection === SortDirection.Ascending
          ? -comparison
          : comparison;
      });
  }, [folders, searchQuery, sortType, sortDirection]);

  const renderSortIndicator = (columnType: SortType) => {
    if (sortType !== columnType) return null;

    return sortDirection === SortDirection.Ascending ? (
      <ArrowUp className="ml-1 h-3 w-3 inline" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 inline" />
    );
  };

  const renderHoverIndicator = (columnType: SortType) => {
    if (sortType === columnType || hoveredColumn !== columnType) return null;

    return <ArrowDown className="ml-1 h-3 w-3 inline opacity-70" />;
  };

  const handleCreateFromSelected = () => {
    if (selectedFolders.length === 0) return;
    
    // Create URL with selected folder IDs
    const folderIds = selectedFolders.map(f => f.id).join(',');
    const params = new URLSearchParams({
      fromFiles: 'true',
      folderIds: folderIds,
    });
    
    router.push(`/create/generate?${params.toString()}`);
  };

  const totalSelectedFiles = selectedFolders.reduce((acc, folder) => acc + folder.files.length, 0);

  return (
    <div className="min-h-full pt-20 w-full min-w-0 flex-1 mx-auto w-full max-w-[90rem] flex-1 px-4 pb-20 md:pl-8 md:pr-8 2xl:pr-14">
      {/* Back button */}
      <div className="absolute top-4 left-4">
        <Link
          href="/create"
          className="flex items-center gap-1 text-sm font-medium bg-white/70 hover:bg-white text-gray-900 backdrop-blur rounded-full px-3 py-1 shadow border border-gray-200"
        >
          <ArrowLeft size={14} />
          Back to Create
        </Link>
      </div>

      <header className="flex w-full items-center justify-between gap-4 -translate-y-px">
        <div>
          <h1 className="flex items-center gap-1.5 text-lg font-medium leading-tight tracking-tight max-md:hidden">
            Create from Files
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Select folders containing documents to create content from
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="inline-flex items-center justify-center relative shrink-0 h-9 px-4 py-2 rounded-lg min-w-[5rem] active:scale-[0.985] whitespace-nowrap pl-2 pr-3 gap-1 bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            New Folder
          </button>
        </div>
      </header>

      <main className="mt-8">
        {/* Search bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Selected items summary and action */}
        {selectedFolders.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">
                  {selectedFolders.length} folder{selectedFolders.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-blue-700">
                  {totalSelectedFiles} file{totalSelectedFiles !== 1 ? 's' : ''} total
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
                  Create from these files
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sorting header */}
        <div className="border-b border-gray-200 mb-4">
          <div className="flex items-center gap-4 py-2 text-sm font-medium text-gray-600">
            <button
              onClick={() => handleSortChange(SortType.Alphabetical)}
              onMouseEnter={() => setHoveredColumn(SortType.Alphabetical)}
              onMouseLeave={() => setHoveredColumn(null)}
              className="flex items-center hover:text-gray-900"
            >
              Name
              {renderSortIndicator(SortType.Alphabetical)}
              {renderHoverIndicator(SortType.Alphabetical)}
            </button>
            <button
              onClick={() => handleSortChange(SortType.TimeCreated)}
              onMouseEnter={() => setHoveredColumn(SortType.TimeCreated)}
              onMouseLeave={() => setHoveredColumn(null)}
              className="flex items-center hover:text-gray-900"
            >
              Created
              {renderSortIndicator(SortType.TimeCreated)}
              {renderHoverIndicator(SortType.TimeCreated)}
            </button>
            <button
              onClick={() => handleSortChange(SortType.Tokens)}
              onMouseEnter={() => setHoveredColumn(SortType.Tokens)}
              onMouseLeave={() => setHoveredColumn(null)}
              className="flex items-center hover:text-gray-900"
            >
              Files
              {renderSortIndicator(SortType.Tokens)}
              {renderHoverIndicator(SortType.Tokens)}
            </button>
          </div>
        </div>

        <div className="flex-grow">
          {isLoading ? (
            <SkeletonLoader />
          ) : filteredFolders.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex flex-col">
                {filteredFolders.map((folder) => (
                  <CreateFolderItem
                    key={folder.id}
                    folder={{
                      ...folder,
                      tokens: folder.files.reduce(
                        (acc, file) => acc + (file.token_count || 0),
                        0
                      ),
                    }}
                    onClick={handleFolderClick}
                    description={folder.description}
                    lastUpdated={folder.created_at}
                    onDelete={() => handleDeleteItem(folder.id, true)}
                    isSelected={selectedFolders.some(f => f.id === folder.id)}
                    onToggleSelect={() => {
                      if (selectedFolders.some(f => f.id === folder.id)) {
                        removeSelectedFolder(folder.id);
                      } else {
                        addSelectedFolder(folder);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <FolderOpen
                className="w-20 h-20 text-orange-400 dark:text-orange-300 mb-4"
                strokeWidth={1.5}
              />
              <p className="text-gray-500 text-lg font-normal">
                No folders found
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Create a folder and upload documents to get started
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Create folder modal */}
      {isCreatingFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Create New Folder</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                if (name.trim()) {
                  handleCreateFolder(name.trim());
                }
              }}
            >
              <input
                name="name"
                type="text"
                placeholder="Folder name"
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingFolder(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 