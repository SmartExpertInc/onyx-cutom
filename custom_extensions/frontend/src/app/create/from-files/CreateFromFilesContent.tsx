"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  FolderOpen,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  CheckCircle2,
  X,
  ChevronRight,
  Home as HomeIcon,
} from "lucide-react";
import Link from "next/link";
import {
  useDocumentsContext,
  FolderResponse,
} from "../../../components/documents/DocumentsContext";
import { useLanguage } from "../../../contexts/LanguageContext";

enum SortType {
  TimeCreated = "Time Created",
  Alphabetical = "Alphabetical",
  Tokens = "Tokens",
}

enum SortDirection {
  Ascending = "asc",
  Descending = "desc",
}

const SkeletonLoader = () => {
  const { t } = useLanguage();

  return (
    <div className="flex justify-center items-center w-full h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
        <p className="text-gray-700 font-semibold text-lg">
          {t("interface.fromFiles.loadingFolders", "Loading folders...")}
        </p>
        <p className="text-gray-600 text-sm mt-2">
          {t(
            "interface.fromFiles.fetchingDocuments",
            "Fetching your documents"
          )}
        </p>
      </div>
    </div>
  );
};

// Enhanced folder item component for creation workflow
interface CreateFolderItemProps {
  folder: FolderResponse & { tokens: number };
  onClick: (id: number) => void;
  description: string;
  lastUpdated: string;
  isSelected: boolean;
  onToggleSelect: () => void;
}

const CreateFolderItem: React.FC<CreateFolderItemProps> = ({
  folder,
  onClick,
  description,
  lastUpdated,
  isSelected,
  onToggleSelect,
}) => {
  const { t } = useLanguage();

  return (
    <div
      className={`flex items-center justify-between py-3 px-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
        isSelected ? "bg-blue-50 border-blue-200" : ""
      }`}
    >
      <div
        className="flex items-center gap-3 flex-1"
        onClick={() => onClick(folder.id)}
      >
        <FolderOpen className="h-5 w-5 text-orange-400" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">{folder.name}</h3>
            <span className="text-sm text-gray-500">
              {folder.files.length}{" "}
              {folder.files.length !== 1
                ? t("interface.fromFiles.files", "files")
                : t("interface.fromFiles.file", "file")}
            </span>
          </div>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {t("interface.fromFiles.created", "Created")}:{" "}
            {new Date(lastUpdated).toLocaleDateString()}
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
              ? "bg-blue-100 text-blue-700 border border-blue-300"
              : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
          }`}
        >
          {isSelected ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              {t("interface.fromFiles.selected", "Selected")}
            </>
          ) : (
            t("interface.fromFiles.select", "Select")
          )}
        </button>
      </div>
    </div>
  );
};

// Modal component for creating new folders
const CreateFolderModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(name.trim(), description.trim());
      setName("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Failed to create folder:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setName("");
    setDescription("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("interface.fromFiles.createNewFolder", "Create New Folder")}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="folder-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("interface.fromFiles.folderName", "Folder Name *")}
            </label>
            <input
              id="folder-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              placeholder={t(
                "interface.fromFiles.enterFolderName",
                "Enter folder name"
              )}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="folder-description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("interface.fromFiles.description", "Description (optional)")}
            </label>
            <textarea
              id="folder-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              placeholder={t(
                "interface.fromFiles.enterFolderDescription",
                "Enter folder description"
              )}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 placeholder-gray-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
            >
              {t("interface.fromFiles.cancel", "Cancel")}
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t("interface.fromFiles.creating", "Creating...")}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {t("interface.fromFiles.createFolder", "Create Folder")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function CreateFromFilesContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const { folders, selectedFolders, addSelectedFolder, removeSelectedFolder, clearSelectedItems, isLoading, refreshFolders, createFolder, error, createFileFromLink } = useDocumentsContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState<SortType>(SortType.TimeCreated);
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    SortDirection.Descending
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [hoveredColumn, setHoveredColumn] = useState<SortType | null>(null);
  // URL add state
  const [fileUrl, setFileUrl] = useState("");
  const [isCreatingFromUrl, setIsCreatingFromUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    refreshFolders();
  }, [refreshFolders]);

  const validateUrl = (url: string) => {
    try {
      // Allow missing scheme, backend will normalize; basic check for a dot
      new URL(url.includes("://") ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddUrl = async () => {
    if (!fileUrl.trim()) return;
    if (!validateUrl(fileUrl.trim())) {
      setUrlError(t('interface.fromFiles.invalidUrl', 'Please enter a valid URL (e.g., https://example.com)'));
      return;
    }
    setUrlError(null);
    setIsCreatingFromUrl(true);
    try {
      await createFileFromLink(fileUrl.trim(), null);
      setFileUrl("");
    } catch (e) {
      setUrlError(t('interface.fromFiles.failedToCreateFromUrl', 'Failed to create from URL'));
    } finally {
      setIsCreatingFromUrl(false);
    }
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddUrl();
    }
  };

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
    router.push(`/create/from-files/${id}`);
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

  const totalSelectedFiles = selectedFolders.reduce(
    (acc, folder) => acc + folder.files.length,
    0
  );

  const renderSortIndicator = (columnType: SortType) => {
    if (sortType !== columnType) return null;
    return sortDirection === SortDirection.Ascending ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    );
  };

  const renderHoverIndicator = (columnType: SortType) => {
    if (hoveredColumn !== columnType || sortType === columnType) return null;
    return <ArrowDown className="h-3 w-3 ml-1 opacity-30" />;
  };

  const handleCreateFromSelected = () => {
    if (selectedFolders.length === 0) return;

    const params = new URLSearchParams();
    params.set("fromFiles", "true");
    params.set("folderIds", selectedFolders.map((f) => f.id).join(","));

    // Check if we have lesson context to pass along
    try {
      const lessonContextData = sessionStorage.getItem("lessonContext");
      if (lessonContextData) {
        const lessonContext = JSON.parse(lessonContextData);
        // Check if data is recent (within 1 hour)
        if (
          lessonContext.timestamp &&
          Date.now() - lessonContext.timestamp < 3600000
        ) {
          Object.entries(lessonContext).forEach(([key, value]) => {
            if (key !== "timestamp") {
              params.set(key, String(value));
            }
          });
        }
      }
    } catch (error) {
      console.error("Error handling lesson context:", error);
    }

    router.push(`/create/generate?${params.toString()}`);
  };

  const handleCreateFolder = async (name: string, description: string) => {
    await createFolder(name, description);
  };

  if (isLoading) {
    return (
      <main
        className="min-h-screen flex flex-col"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,249,245,1) 0%, rgba(236,236,255,1) 30%, rgba(191,215,255,1) 60%, rgba(204,232,255,1) 100%)",
        }}
      >
        <div className="flex justify-center items-center flex-1">
          <SkeletonLoader />
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
            <p className="text-red-600 font-medium">
              {t("interface.error", "Error")}: {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,249,245,1) 0%, rgba(236,236,255,1) 30%, rgba(191,215,255,1) 60%, rgba(204,232,255,1) 100%)",
      }}
    >
      {/* Header */}
      <div className="p-6 pb-0">
        {/* Back button - absolute positioned */}
        <Link
          href="/create"
          className="absolute top-6 left-6 flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary-hover rounded-full px-3 py-1 border border-gray-300 bg-white"
        >
          <ArrowLeft size={14} /> {t("interface.generate.back", "Back")}
        </Link>

        {/* Header Content - positioned below Back button */}
        <div className="pt-16">
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t("interface.fromFiles.browseYourFiles", "Browse Your Files")}
            </h1>
            <p className="text-gray-600">
              {t(
                "interface.fromFiles.browseDescription",
                "Select folders containing the documents you want to use for creating educational content"
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6">
        {/* Search bar and Create Folder button */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder={t(
                "interface.fromFiles.searchFolders",
                "Search folders..."
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white text-gray-900 placeholder-gray-600"
            />
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="ml-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            {t("interface.fromFiles.newFolder", "New Folder")}
          </button>
        </div>

        {/* Selected items summary and action */}
        {selectedFolders.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">
                  {selectedFolders.length}{" "}
                  {selectedFolders.length !== 1
                    ? t("interface.fromFiles.files", "files")
                    : t("interface.fromFiles.file", "file")}{" "}
                  {t("interface.generate.selected", "selected")}
                </p>
                <p className="text-sm text-blue-700">
                  {totalSelectedFiles}{" "}
                  {totalSelectedFiles !== 1
                    ? t("interface.fromFiles.files", "files")
                    : t("interface.fromFiles.file", "file")}{" "}
                  {t("interface.total", "total")}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearSelectedItems}
                  className="px-3 py-1 text-sm border border-blue-300 text-blue-700 rounded-md hover:bg-blue-100"
                >
                  {t("interface.fromFiles.clearSelection", "Clear Selection")}
                </button>
                <button
                  onClick={handleCreateFromSelected}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Sparkles className="h-4 w-4" />
                  {t(
                    "interface.fromFiles.createFromFiles",
                    "Create from these files"
                  )}
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
              {t("interface.fromFiles.name", "Name")}
              {renderSortIndicator(SortType.Alphabetical)}
              {renderHoverIndicator(SortType.Alphabetical)}
            </button>
            <button
              onClick={() => handleSortChange(SortType.TimeCreated)}
              onMouseEnter={() => setHoveredColumn(SortType.TimeCreated)}
              onMouseLeave={() => setHoveredColumn(null)}
              className="flex items-center hover:text-gray-900"
            >
              {t("interface.fromFiles.created", "Created")}
              {renderSortIndicator(SortType.TimeCreated)}
              {renderHoverIndicator(SortType.TimeCreated)}
            </button>
            <button
              onClick={() => handleSortChange(SortType.Tokens)}
              onMouseEnter={() => setHoveredColumn(SortType.Tokens)}
              onMouseLeave={() => setHoveredColumn(null)}
              className="flex items-center hover:text-gray-900"
            >
              {t("interface.fromFiles.files", "Files")}
              {renderSortIndicator(SortType.Tokens)}
              {renderHoverIndicator(SortType.Tokens)}
            </button>
          </div>
        </div>

        <div className="flex-grow">
          {filteredFolders.length > 0 ? (
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
                    isSelected={selectedFolders.some((f) => f.id === folder.id)}
                    onToggleSelect={() => {
                      if (selectedFolders.some((f) => f.id === folder.id)) {
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
                {t("interface.fromFiles.noFoldersFound", "No folders found")}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {t(
                  "interface.fromFiles.noFoldersDescription",
                  "Create a folder and upload documents to get started"
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create folder modal */}
      {isCreatingFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {t("interface.fromFiles.createNewFolder", "Create New Folder")}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get("name") as string;
                if (name.trim()) {
                  handleCreateFolder(name.trim(), "");
                  setIsCreatingFolder(false);
                }
              }}
            >
              <input
                name="name"
                type="text"
                placeholder={t(
                  "interface.fromFiles.enterFolderName",
                  "Folder name"
                )}
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingFolder(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {t("interface.fromFiles.cancel", "Cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {t("interface.fromFiles.createFolder", "Create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New create folder modal */}
      <CreateFolderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateFolder}
      />
    </main>
  );
}
