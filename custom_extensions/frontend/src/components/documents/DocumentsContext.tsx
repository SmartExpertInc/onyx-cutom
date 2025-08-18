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
  createFileFromLink: (url: string, folderId: number | null) => Promise<FileResponse[]>;
  // SmartDrive methods
  ensureSmartDriveSession: () => Promise<void>;
  listSmartDrive: (path?: string) => Promise<any[]>;
  importSmartDriveFiles: (paths: string[]) => Promise<{ fileIds: number[] }>;
  importSmartDriveNewSinceLastSync: () => Promise<void>;
  listUserConnectors: () => Promise<any[]>;
  createUserConnector: (provider: string, config: any) => Promise<any>;
  updateUserConnector: (id: number, config: any) => Promise<any>;
  deleteUserConnector: (id: number) => Promise<void>;
  syncUserConnector: (id: number) => Promise<void>;
}

// Optimized documents service
class DocumentsService {
  async fetchFolders(): Promise<FolderResponse[]> {
    const response = await fetch("/api/user/folder");
    if (!response.ok) {
      throw new Error("Failed to fetch folders");
    }
    return response.json();
  }

  async getFolderDetails(folderId: number): Promise<FolderResponse> {
    const response = await fetch(`/api/user/folder/${folderId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch folder details");
    }
    return response.json();
  }

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
  }

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
  }

  async deleteItem(itemId: number, isFolder: boolean): Promise<void> {
    const endpoint = isFolder
      ? `/api/user/folder/${itemId}`
      : `/api/user/file/${itemId}`;
    const response = await fetch(endpoint, { method: "DELETE" });
    if (!response.ok) {
      throw new Error(`Failed to delete ${isFolder ? "folder" : "file"}`);
    }
  }

  async uploadFile(formData: FormData, folderId: number | null): Promise<FileResponse[]> {
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
  }

  async createFileFromLink(url: string, folderId: number | null): Promise<FileResponse[]> {
    const response = await fetch("/api/user/file/create-from-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, folder_id: folderId }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to create file from link");
    }
    return response.json();
  }

  async getFilesIndexingStatus(fileIds: number[]): Promise<Record<number, boolean>> {
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
  }

  // SmartDrive methods
  async ensureSmartDriveSession(): Promise<void> {
    const response = await fetch("/api/custom-smartdrive/session", {
      method: "POST",
      credentials: "same-origin",
    });
    if (!response.ok) {
      throw new Error("Failed to initialize SmartDrive session");
    }
  }

  async listSmartDrive(path: string = "/"): Promise<any[]> {
    const response = await fetch(`/api/custom-smartdrive/list?path=${encodeURIComponent(path)}`, {
      credentials: "same-origin",
    });
    if (!response.ok) {
      throw new Error("Failed to list SmartDrive files");
    }
    return response.json();
  }

  async importSmartDriveFiles(paths: string[]): Promise<{ fileIds: number[] }> {
    const response = await fetch("/api/custom-smartdrive/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ paths }),
    });
    if (!response.ok) {
      throw new Error("Failed to import SmartDrive files");
    }
    return response.json();
  }

  async importSmartDriveNewSinceLastSync(): Promise<void> {
    const response = await fetch("/api/custom-smartdrive/import-new", {
      method: "POST",
      credentials: "same-origin",
    });
    if (!response.ok) {
      throw new Error("Failed to import new SmartDrive files");
    }
  }

  async listUserConnectors(): Promise<any[]> {
    const response = await fetch("/api/custom-smartdrive/connectors/", {
      credentials: "same-origin",
    });
    if (!response.ok) {
      throw new Error("Failed to list user connectors");
    }
    return response.json();
  }

  async createUserConnector(provider: string, config: any): Promise<any> {
    const response = await fetch("/api/custom-smartdrive/connectors/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ provider, config }),
    });
    if (!response.ok) {
      throw new Error("Failed to create user connector");
    }
    return response.json();
  }

  async updateUserConnector(id: number, config: any): Promise<any> {
    const response = await fetch(`/api/custom-smartdrive/connectors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ config }),
    });
    if (!response.ok) {
      throw new Error("Failed to update user connector");
    }
    return response.json();
  }

  async deleteUserConnector(id: number): Promise<void> {
    const response = await fetch(`/api/custom-smartdrive/connectors/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (!response.ok) {
      throw new Error("Failed to delete user connector");
    }
  }

  async syncUserConnector(id: number): Promise<void> {
    const response = await fetch(`/api/custom-smartdrive/connectors/${id}/sync`, {
      method: "POST",
      credentials: "same-origin",
    });
    if (!response.ok) {
      throw new Error("Failed to sync user connector");
    }
  }
}

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
      const data = await new DocumentsService().fetchFolders();
      setFolders(data);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch folders:", error);
      setError("Failed to fetch folders");
    }
  }, []);

  const getFolders = async (): Promise<FolderResponse[]> => {
    return new DocumentsService().fetchFolders();
  };

  const getFolderDetails = useCallback(async (folderId: number) => {
    try {
      console.log('Fetching folder details for:', folderId);
      const data = await new DocumentsService().getFolderDetails(folderId);
      console.log('Received folder data:', data.files?.map(f => ({ name: f.name, status: f.status })));
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
      await new DocumentsService().updateFolderDetails(folderId, name, description);
      const updated = await new DocumentsService().getFolderDetails(folderId);
      setFolderDetails(updated);
      await refreshFolders();
    } catch (error) {
      console.error("Failed to update folder details:", error);
      throw error;
    }
  };

  const createFolder = async (name: string, description: string = "") => {
    try {
      await new DocumentsService().createFolder(name, description);
      await refreshFolders();
    } catch (error) {
      console.error("Failed to create folder:", error);
      throw error;
    }
  };

  const deleteItem = async (itemId: number, isFolder: boolean) => {
    try {
      await new DocumentsService().deleteItem(itemId, isFolder);
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
    return await new DocumentsService().uploadFile(formData, folderId);
  };

  const handleUpload = async (files: File[]) => {
    const totalFiles = files.length;
    let completedFiles = 0;

    setUploadProgress({
      fileCount: totalFiles,
      completedCount: 0,
      currentFileName: files[0]?.name || "",
      percentage: 0,
    });

    try {
      // Upload all files in smaller batches for better progress feedback
      const batchSize = 3; // Process 3 files at a time
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        
        // Update progress for current batch
        setUploadProgress({
          fileCount: totalFiles,
          completedCount: completedFiles,
          currentFileName: batch[0]?.name || "",
          percentage: Math.round((i / totalFiles) * 100),
        });

        // Process batch in parallel
        const batchPromises = batch.map(async (file) => {
          const formData = new FormData();
          formData.append("files", file);
          const targetFolderId = folderDetails?.id || currentFolder;
          
          if (targetFolderId) {
            formData.append("folder_id", targetFolderId.toString());
          }

          return uploadFile(formData, targetFolderId);
        });

        await Promise.all(batchPromises);
        completedFiles += batch.length;

        // Update progress after batch completion
        setUploadProgress({
          fileCount: totalFiles,
          completedCount: completedFiles,
          currentFileName: batch[batch.length - 1]?.name || "",
          percentage: Math.round((completedFiles / totalFiles) * 100),
        });

        // Small delay to show progress update
        if (completedFiles < totalFiles) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      // Final progress update
      setUploadProgress({
        fileCount: totalFiles,
        completedCount: totalFiles,
        currentFileName: "All files processed",
        percentage: 100,
      });

      // Show completion state briefly
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Refresh data
      await refreshFolders();
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

  const createFileFromLink = useCallback(
    async (url: string, folderId: number | null): Promise<FileResponse[]> => {
      try {
        const data = await new DocumentsService().createFileFromLink(url, folderId);
        await refreshFolders();
        const targetFolderId = folderId ?? (folderDetails?.id || currentFolder);
        if (targetFolderId) {
          await getFolderDetails(targetFolderId);
        }
        return data;
      } catch (error) {
        console.error("Failed to create file from link:", error);
        throw error;
      }
    },
    [refreshFolders, folderDetails, currentFolder, getFolderDetails]
  );

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
        getFilesIndexingStatus: async (fileIds: number[]) => await new DocumentsService().getFilesIndexingStatus(fileIds),
        createFileFromLink,
        // SmartDrive methods
        ensureSmartDriveSession: async () => await new DocumentsService().ensureSmartDriveSession(),
        listSmartDrive: async (path?: string) => await new DocumentsService().listSmartDrive(path),
        importSmartDriveFiles: async (paths: string[]) => await new DocumentsService().importSmartDriveFiles(paths),
        importSmartDriveNewSinceLastSync: async () => await new DocumentsService().importSmartDriveNewSinceLastSync(),
        listUserConnectors: async () => await new DocumentsService().listUserConnectors(),
        createUserConnector: async (provider: string, config: any) => await new DocumentsService().createUserConnector(provider, config),
        updateUserConnector: async (id: number, config: any) => await new DocumentsService().updateUserConnector(id, config),
        deleteUserConnector: async (id: number) => await new DocumentsService().deleteUserConnector(id),
        syncUserConnector: async (id: number) => await new DocumentsService().syncUserConnector(id),
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