"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";

export interface FolderResponse {
  id: number;
  name: string;
  description: string;
  files: FileResponse[];
  assistant_ids?: number[];
  created_at: string;
}

export type FileResponse = {
  id: number;
  name: string;
  document_id: string;
  folder_id: number | null;
  size?: number;
  type?: string;
  lastModified?: string;
  token_count?: number;
  assistant_ids?: number[];
  indexed?: boolean;
  created_at?: string;
  file_id?: string;
  file_type?: string;
  link_url?: string | null;
  status: string;
  chat_file_type?: string;
  user_id?: string;
};

export interface UploadProgress {
  fileCount: number;
  completedCount: number;
  currentFileName: string;
  percentage: number;
}

export interface DocumentsContextType {
  files: FileResponse[];
  folders: FolderResponse[];
  currentFolder: number | null;
  searchQuery: string;
  page: number;
  isLoading: boolean;
  error: string | null;
  selectedFiles: FileResponse[];
  selectedFolders: FolderResponse[];
  uploadProgress: UploadProgress | null;
  addSelectedFile: (file: FileResponse) => void;
  removeSelectedFile: (fileId: number) => void;
  addSelectedFolder: (folder: FolderResponse) => void;
  removeSelectedFolder: (folderId: number) => void;
  clearSelectedItems: () => void;
  setSelectedFiles: Dispatch<SetStateAction<FileResponse[]>>;
  setSelectedFolders: Dispatch<SetStateAction<FolderResponse[]>>;
  refreshFolders: () => Promise<void>;
  createFolder: (name: string, description?: string) => Promise<void>;
  deleteItem: (itemId: number, isFolder: boolean) => Promise<void>;
  renameFile: (fileId: number, newName: string) => Promise<void>;
  renameFolder: (folderId: number, newName: string) => Promise<void>;
  setCurrentFolder: (folderId: number | null) => void;
  setSearchQuery: (query: string) => void;
  setPage: (page: number) => void;
  folderDetails: FolderResponse | null | undefined;
  getFolderDetails: (folderId: number) => Promise<void>;
  getFolders: () => Promise<FolderResponse[]>;
  updateFolderDetails: (
    folderId: number,
    name: string,
    description: string
  ) => Promise<void>;
  uploadFile: (formData: FormData, folderId: number | null) => Promise<FileResponse[]>;
  handleUpload: (files: File[]) => Promise<void>;
  getFilesIndexingStatus: (fileIds: number[]) => Promise<Record<number, boolean>>;
}

// Optimized documents service similar to Onyx's implementation
const documentsService = {
  async fetchFolders(): Promise<FolderResponse[]> {
    const response = await fetch("/api/user/folder");
    if (!response.ok) {
      throw new Error("Failed to fetch folders");
    }
    return response.json();
  },

  async getFolderDetails(folderId: number): Promise<FolderResponse> {
    const response = await fetch(`/api/user/folder/${folderId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch folder details");
    }
    return response.json();
  },

  async createFolder(name: string, description: string = ""): Promise<FolderResponse> {
    const response = await fetch("/api/user/folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to create folder");
    }
    return response.json();
  },

  async updateFolderDetails(
    folderId: number,
    name: string,
    description: string
  ): Promise<void> {
    const response = await fetch(`/api/user/folder/${folderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    if (!response.ok) {
      throw new Error("Failed to update folder details");
    }
  },

  async deleteItem(itemId: number, isFolder: boolean): Promise<void> {
    const endpoint = isFolder
      ? `/api/user/folder/${itemId}`
      : `/api/user/file/${itemId}`;
    const response = await fetch(endpoint, { method: "DELETE" });
    if (!response.ok) {
      throw new Error(`Failed to delete ${isFolder ? "folder" : "file"}`);
    }
  },
};

const DocumentsContext = createContext<DocumentsContextType | undefined>(
  undefined
);

interface DocumentsProviderProps {
  children: ReactNode;
  initialFolderDetails?: FolderResponse | null;
}

export const DocumentsProvider: React.FC<DocumentsProviderProps> = ({
  children,
  initialFolderDetails,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [folders, setFolders] = useState<FolderResponse[]>([]);
  const [currentFolder, setCurrentFolder] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<FileResponse[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<FolderResponse[]>([]);
  const [folderDetails, setFolderDetails] = useState<
    FolderResponse | undefined | null
  >(initialFolderDetails || null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  useEffect(() => {
    const fetchFolders = async () => {
      setIsLoading(true);
      try {
        await refreshFolders();
      } finally {
        setIsLoading(false);
      }
    };
    fetchFolders();
  }, []);

  const refreshFolders = useCallback(async () => {
    try {
      const data = await documentsService.fetchFolders();
      setFolders(data);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch folders:", error);
      setError("Failed to fetch folders");
    }
  }, []);

  const getFolders = async (): Promise<FolderResponse[]> => {
    return documentsService.fetchFolders();
  };

  const getFolderDetails = useCallback(async (folderId: number) => {
    try {
      const data = await documentsService.getFolderDetails(folderId);
      setFolderDetails(data);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch folder details:", error);
      setError("Failed to fetch folder details");
    }
  }, []);

  const updateFolderDetails = async (
    folderId: number,
    name: string,
    description: string
  ) => {
    try {
      await documentsService.updateFolderDetails(folderId, name, description);
      const updated = await documentsService.getFolderDetails(folderId);
      setFolderDetails(updated);
      await refreshFolders();
    } catch (error) {
      console.error("Failed to update folder details:", error);
      throw error;
    }
  };

  const createFolder = async (name: string, description: string = "") => {
    try {
      await documentsService.createFolder(name, description);
      await refreshFolders();
    } catch (error) {
      console.error("Failed to create folder:", error);
      throw error;
    }
  };

  const deleteItem = async (itemId: number, isFolder: boolean) => {
    try {
      await documentsService.deleteItem(itemId, isFolder);
      await refreshFolders();
    } catch (error) {
      console.error("Failed to delete item:", error);
      throw error;
    }
  };

  const renameFile = async (fileId: number, newName: string) => {
    const response = await fetch(`/api/user/file/${fileId}/rename?name=${encodeURIComponent(newName)}`, {
      method: "PUT",
    });
    if (!response.ok) {
      throw new Error("Failed to rename file");
    }
  };

  const renameFolder = async (folderId: number, newName: string) => {
    const response = await fetch(`/api/user/folder/${folderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (!response.ok) {
      throw new Error("Failed to rename folder");
    }
  };

  const uploadFile = async (formData: FormData, folderId: number | null): Promise<FileResponse[]> => {
    if (folderId) {
      formData.append("folder_id", folderId.toString());
    }

    const response = await fetch("/api/user/file/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to upload file");
    }

    const data = await response.json();
    return data;
  };

  const getFilesIndexingStatus = async (fileIds: number[]): Promise<Record<number, boolean>> => {
    try {
      const queryParams = fileIds.map((id) => `file_ids=${id}`).join("&");
      const response = await fetch(`/api/user/file/indexing-status?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch indexing status");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching indexing status:", error);
      return {};
    }
  };

  const waitForIndexing = async (fileIds: number[]): Promise<void> => {
    const maxAttempts = 60; // Wait up to 5 minutes (60 * 5 seconds)
    let attempts = 0;

    while (attempts < maxAttempts) {
      const indexingStatus = await getFilesIndexingStatus(fileIds);
      const allIndexed = fileIds.every(id => indexingStatus[id] === true);
      
      if (allIndexed) {
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      attempts++;
    }
  };

  const handleUpload = async (files: File[]) => {
    const totalFiles = files.length;
    let completedFiles = 0;
    const uploadedFileIds: number[] = [];

    setUploadProgress({
      fileCount: totalFiles,
      completedCount: 0,
      currentFileName: files[0]?.name || "",
      percentage: 0,
    });

    try {
      // Upload all files first
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        setUploadProgress({
          fileCount: totalFiles,
          completedCount: completedFiles,
          currentFileName: file.name,
          percentage: Math.round(((i / totalFiles) * 70)), // 70% for upload phase
        });

        const formData = new FormData();
        formData.append("files", file);
        const targetFolderId = folderDetails?.id || currentFolder;
        
        if (targetFolderId) {
          formData.append("folder_id", targetFolderId.toString());
        }

        const uploadedFiles = await uploadFile(formData, targetFolderId);
        uploadedFileIds.push(...uploadedFiles.map(f => f.id));
        completedFiles++;

        setUploadProgress({
          fileCount: totalFiles,
          completedCount: completedFiles,
          currentFileName: file.name,
          percentage: Math.round(((completedFiles / totalFiles) * 70)), // 70% for upload phase
        });
      }

      // Now wait for indexing to complete
      if (uploadedFileIds.length > 0) {
        setUploadProgress({
          fileCount: totalFiles,
          completedCount: totalFiles,
          currentFileName: "Indexing files...",
          percentage: 80,
        });

        await waitForIndexing(uploadedFileIds);

        setUploadProgress({
          fileCount: totalFiles,
          completedCount: totalFiles,
          currentFileName: "Finalizing...",
          percentage: 100,
        });
      }

      await refreshFolders();
      // Refresh the specific folder details if we have a folder ID
      const targetFolderId = folderDetails?.id || currentFolder;
      if (targetFolderId) {
        await getFolderDetails(targetFolderId);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(error instanceof Error ? error.message : "Upload failed");
      throw error;
    } finally {
      setUploadProgress(null);
    }
  };

  const addSelectedFile = useCallback((file: FileResponse) => {
    setSelectedFiles((prev) => {
      if (prev.find((f) => f.id === file.id)) {
        return prev;
      }
      return [...prev, file];
    });
  }, []);

  const removeSelectedFile = useCallback((fileId: number) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const addSelectedFolder = useCallback((folder: FolderResponse) => {
    setSelectedFolders((prev) => {
      if (prev.find((f) => f.id === folder.id)) {
        return prev;
      }
      return [...prev, folder];
    });
  }, []);

  const removeSelectedFolder = useCallback((folderId: number) => {
    setSelectedFolders((prev) => prev.filter((f) => f.id !== folderId));
  }, []);

  const clearSelectedItems = useCallback(() => {
    setSelectedFiles([]);
    setSelectedFolders([]);
  }, []);

  return (
    <DocumentsContext.Provider
      value={{
        files: folderDetails?.files || [],
        folders,
        currentFolder,
        searchQuery,
        page,
        isLoading,
        error,
        selectedFiles,
        selectedFolders,
        uploadProgress,
        addSelectedFile,
        removeSelectedFile,
        addSelectedFolder,
        removeSelectedFolder,
        clearSelectedItems,
        setSelectedFiles,
        setSelectedFolders,
        refreshFolders,
        createFolder,
        deleteItem,
        renameFile,
        renameFolder,
        setCurrentFolder,
        setSearchQuery,
        setPage,
        folderDetails,
        getFolderDetails,
        getFolders,
        updateFolderDetails,
        uploadFile,
        handleUpload,
        getFilesIndexingStatus,
      }}
    >
      {children}
    </DocumentsContext.Provider>
  );
};

export const useDocumentsContext = () => {
  const context = useContext(DocumentsContext);
  if (context === undefined) {
    throw new Error("useDocumentsContext must be used within a DocumentsProvider");
  }
  return context;
}; 