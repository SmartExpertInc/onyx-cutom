"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  LayoutGrid,
  List,
  Search,
  Clock,
  Folder as FolderIcon,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

export interface PickerProduct {
  id: number;
  title: string;
  type?: string;
  createdAt?: string;
  folderId?: number | null;
  folderName?: string | null;
}

export interface PickerFolder {
  id: number;
  name: string;
  parent_id?: number | null;
}

interface MyProductsPickerProps {
  onSelectionChange?: (ids: number[], products: PickerProduct[]) => void;
  selectedIds?: number[];
  className?: string;
}

const formatDate = (value?: string) => {
  if (!value) return "--";
  try {
    const date = new Date(value);
    return date.toLocaleDateString();
  } catch {
    return value;
  }
};

const MyProductsPicker: React.FC<MyProductsPickerProps> = ({
  onSelectionChange,
  selectedIds,
  className = "",
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<PickerProduct[]>([]);
  const [folders, setFolders] = useState<PickerFolder[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [activeFolderId, setActiveFolderId] = useState<number | null>(null);
  const [selectedSet, setSelectedSet] = useState<Set<number>>(new Set());

  useEffect(() => {
    setSelectedSet(new Set(selectedIds || []));
  }, [selectedIds]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const CUSTOM_BACKEND_URL =
        process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL ||
        "/api/custom-projects-backend";
      const headers: HeadersInit = { "Content-Type": "application/json" };
      const devUserId = "dummy-onyx-user-id-for-testing";
      if (devUserId && process.env.NODE_ENV === "development") {
        headers["X-Dev-Onyx-User-ID"] = devUserId;
      }

      const [projectsResponse, foldersResponse] = await Promise.all([
        fetch(`${CUSTOM_BACKEND_URL}/projects`, {
          headers,
          cache: "no-store",
          credentials: "same-origin",
        }),
        fetch(`${CUSTOM_BACKEND_URL}/projects/folders`, {
          headers,
          cache: "no-store",
          credentials: "same-origin",
        }).catch(() => null),
      ]);

      if (!projectsResponse.ok) {
        throw new Error(
          `Failed to fetch products: ${projectsResponse.status}`
        );
      }

      const projectsJson = await projectsResponse.json();
      const foldersJson = foldersResponse && foldersResponse.ok
        ? await foldersResponse.json()
        : [];

      const foldersMap: Record<number, string> = {};
      if (Array.isArray(foldersJson)) {
        foldersJson.forEach((folder: any) => {
          if (folder && typeof folder.id === "number") {
            foldersMap[folder.id] = folder.name;
          }
        });
        setFolders(
          foldersJson
            .filter((folder: any) => folder && typeof folder.id === "number")
            .map(
              (folder: any): PickerFolder => ({
                id: folder.id,
                name: folder.name || t("interface.untitledFolder", "Untitled"),
                parent_id:
                  typeof folder.parent_id === "number"
                    ? folder.parent_id
                    : null,
              })
            )
        );
      }

      const mappedProjects: PickerProduct[] = Array.isArray(projectsJson)
        ? projectsJson
            .filter((project) => typeof project?.id === "number")
            .map(
              (project): PickerProduct => ({
                id: project.id,
                title:
                  project?.projectName ||
                  project?.microproduct_name ||
                  project?.microproduct_content?.lessonTitle ||
                  project?.microproduct_content?.title ||
                  project?.microproduct_content?.quizTitle ||
                  project?.name ||
                  t("interface.untitled", "Untitled"),
                type:
                  project?.design_microproduct_type ||
                  project?.microproduct_type ||
                  project?.type ||
                  undefined,
                createdAt: project?.created_at,
                folderId:
                  typeof project?.folder_id === "number"
                    ? project.folder_id
                    : null,
                folderName:
                  typeof project?.folder_id === "number"
                    ? foldersMap[project.folder_id] || null
                    : null,
              })
            )
        : [];

      setProjects(mappedProjects);
    } catch (err: any) {
      console.error("[MyProductsPicker] Failed to load data:", err);
      setError(
        err?.message ||
          t("interface.unknownError", "Something went wrong loading products.")
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleSelection = useCallback(
    (id: number) => {
      setSelectedSet((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        if (onSelectionChange) {
          const selectedProducts = projects.filter((project) =>
            next.has(project.id)
          );
          onSelectionChange(Array.from(next), selectedProducts);
        }
        return next;
      });
    },
    [projects, onSelectionChange]
  );

  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        if (
          activeFolderId !== null &&
          project.folderId !== activeFolderId
        ) {
          return false;
        }
        if (!search.trim()) return true;
        const term = search.toLowerCase();
        return (
          project.title.toLowerCase().includes(term) ||
          (project.type ? project.type.toLowerCase().includes(term) : false)
        );
      })
      .sort((a, b) => {
        const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return createdB - createdA;
      });
  }, [projects, search, activeFolderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-gray-500">
        {t("interface.loading", "Loading...")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-sm text-red-500">
        <p>{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            loadData();
          }}
        >
          {t("interface.retry", "Retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("interface.searchProducts", "Search products")}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            className="h-9 w-9"
          >
            <LayoutGrid size={16} />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
            className="h-9 w-9"
          >
            <List size={16} />
          </Button>
        </div>
      </div>

      {folders.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeFolderId === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFolderId(null)}
          >
            {t("interface.allProducts", "All products")}
          </Button>
          {folders.map((folder) => (
            <Button
              key={folder.id}
              variant={activeFolderId === folder.id ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setActiveFolderId(
                  activeFolderId === folder.id ? null : folder.id
                )
              }
              className="flex items-center gap-2"
            >
              <FolderIcon size={14} />
              {folder.name}
            </Button>
          ))}
        </div>
      )}

      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-sm text-gray-500">
          <p>{t("interface.noProductsFound", "No products found")}</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => {
            const isSelected = selectedSet.has(project.id);
            return (
              <Card
                key={project.id}
                className={`cursor-pointer transition-shadow ${
                  isSelected
                    ? "border-blue-500 shadow-lg"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
                onClick={() => toggleSelection(project.id)}
              >
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-gray-900 line-clamp-2">
                      {project.title}
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="text-blue-500" size={20} />
                    ) : (
                      <Circle className="text-gray-300" size={20} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={14} />
                    <span>{formatDate(project.createdAt)}</span>
                  </div>
                  {project.type && (
                    <div className="text-xs font-medium text-blue-600">
                      {project.type}
                    </div>
                  )}
                  {project.folderName && (
                    <div className="text-xs text-gray-500">
                      {t("interface.folderLabel", "Folder")}: {project.folderName}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>{t("interface.product", "Product")}</TableHead>
              <TableHead>{t("interface.type", "Type")}</TableHead>
              <TableHead>{t("interface.folder", "Folder")}</TableHead>
              <TableHead>{t("interface.created", "Created")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((project) => {
              const isSelected = selectedSet.has(project.id);
              return (
                <TableRow
                  key={project.id}
                  className="cursor-pointer"
                  onClick={() => toggleSelection(project.id)}
                >
                  <TableCell className="w-12">
                    {isSelected ? (
                      <CheckCircle2 className="text-blue-500" size={18} />
                    ) : (
                      <Circle className="text-gray-300" size={18} />
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {project.title}
                  </TableCell>
                  <TableCell>{project.type || "--"}</TableCell>
                  <TableCell>{project.folderName || "--"}</TableCell>
                  <TableCell>{formatDate(project.createdAt)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default MyProductsPicker;

