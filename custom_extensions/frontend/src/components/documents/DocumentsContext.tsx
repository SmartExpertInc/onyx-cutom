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

  useEffect(() => {
    const fetchFolders = async () => {
      await refreshFolders();
      setIsLoading(false);
    };
    fetchFolders();
  }, []);

  const refreshFolders = async () => {
    try {
      console.log("fetching folders");
      const response = await fetch("/api/user/folder");
      if (!response.ok) {
        throw new Error("Failed to fetch folders");
      }
      const data = await response.json();
      setFolders(data);
    } catch (error) {
      console.error("Failed to fetch folders:", error);
      setError("Failed to fetch folders");
    }
  };

  const getFolders = async (): Promise<FolderResponse[]> => {
    const response = await fetch("/api/user/folder");
    if (!response.ok) {
      throw new Error("Failed to fetch folders");
    }
    return response.json();
  };

  const getFolderDetails = async (folderId: number) => {
    try {
      const response = await fetch(`/api/user/folder/${folderId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch folder details");
      }
      const data = await response.json();
      setFolderDetails(data);
    } catch (error) {
      console.error("Failed to fetch folder details:", error);
      setError("Failed to fetch folder details");
    }
  };

  const updateFolderDetails = async (
    folderId: number,
    name: string,
    description: string
  ) => {
    const response = await fetch(`/api/user/folder/${folderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    if (!response.ok) {
      throw new Error("Failed to update folder");
    }
    const updated = await response.json();
    setFolderDetails(updated);
  };

  const createFolder = async (name: string, description: string = "") => {
    const response = await fetch("/api/user/folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    if (!response.ok) {
      throw new Error("Failed to create folder");
    }
    await refreshFolders();
  };

  const deleteItem = async (itemId: number, isFolder: boolean) => {
    try {
      const endpoint = isFolder
        ? `/api/user/folder/${itemId}`
        : `/api/user/file/${itemId}`;
      const response = await fetch(endpoint, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(`Failed to delete ${isFolder ? "folder" : "file"}`);
      }
      await refreshFolders();
      if (folderDetails) {
        await getFolderDetails(folderDetails.id);
      }
    } catch (error) {
      console.error(`Failed to delete ${isFolder ? "folder" : "file"}:`, error);
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
    await refreshFolders();
  };

  const addSelectedFile = useCallback((file: FileResponse) => {
    setSelectedFiles((prev) => {
      if (prev.find((f) => f.id === file.id)) return prev;
      return [...prev, file];
    });
  }, []);

  const removeSelectedFile = useCallback((fileId: number) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const addSelectedFolder = useCallback((folder: FolderResponse) => {
    setSelectedFolders((prev) => {
      if (prev.find((f) => f.id === folder.id)) return prev;
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

  const uploadFile = async (formData: FormData, folderId: number | null): Promise<FileResponse[]> => {
    try {
      const url = folderId ? `/api/user/file/upload?folder_id=${folderId}` : '/api/user/file/upload';
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to upload file");
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to upload file:", error);
      throw error;
    }
  };

  const handleUpload = async (files: File[]) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      
      if (folderDetails && folderDetails.id !== -1) {
        formData.append("folder_id", folderDetails.id.toString());
      }

      const response = await fetch("/api/user/file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to upload files");
      }

      await refreshFolders();
      if (folderDetails) {
        await getFolderDetails(folderDetails.id);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  };

  const value: DocumentsContextType = {
    files: folders.map((folder) => folder.files).flat(),
    folders,
    currentFolder,
    searchQuery,
    page,
    isLoading,
    error,
    selectedFiles,
    selectedFolders,
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
    getFolderDetails,
    getFolders,
    folderDetails,
    updateFolderDetails,
    uploadFile,
    handleUpload,
  };

  return (
    <DocumentsContext.Provider value={value}>
      {children}
    </DocumentsContext.Provider>
  );
};

export const useDocumentsContext = () => {
  const context = useContext(DocumentsContext);
  if (context === undefined) {
    throw new Error(
      "useDocumentsContext must be used within a DocumentsProvider"
    );
  }
  return context;
}; 