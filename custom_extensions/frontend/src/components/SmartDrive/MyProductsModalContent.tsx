'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  LayoutGrid,
  List,
  Search,
  Clock,
  Folder as FolderIcon,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export interface ModalProduct {
  id: number;
  title: string;
  type?: string;
  createdAt?: string;
  folderId?: number | null;
  folderName?: string | null;
  url?: string;
}

interface ModalFolder {
  id: number;
  name: string;
  parent_id?: number | null;
}

interface MyProductsModalContentProps {
  onSelectionChange?: (ids: number[], products: ModalProduct[]) => void;
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

const computeDisplayTitle = (project: any): string => {
  try {
    const typeRaw: string = project?.design_microproduct_type || "";
    const type = String(typeRaw).toLowerCase();

    if (type === "training plan" || type === "course outline") {
      return (
        project?.projectName ||
        project?.microproduct_name ||
        project?.title ||
        "Untitled"
      );
    }

    const instanceName: string | undefined =
      project?.projectName?.trim() || project?.microproduct_name?.trim();
    const genericNames = new Set([
      "Slide Deck",
      "Quiz",
      "Video Lesson",
      "Text Presentation",
      "PDF Lesson",
      "Video",
    ]);
    if (instanceName && !genericNames.has(instanceName)) {
      return instanceName;
    }

    const content = project?.microproduct_content || {};
    if (content && typeof content === "object") {
      const candidates = [
        content.lessonTitle,
        content.title,
        content.quizTitle,
        content.name,
      ].filter(Boolean);
      if (candidates.length > 0) {
        const candidate = String(candidates[0]).trim();
        if (candidate.length > 0) {
          return candidate;
        }
      }
    }

    return (
      project?.projectName ||
      instanceName ||
      project?.title ||
      project?.name ||
      "Untitled"
    );
  } catch (error) {
    console.warn("[MyProductsModalContent] title resolution failed:", error);
    return (
      project?.projectName ||
      project?.microproduct_name ||
      project?.title ||
      project?.name ||
      "Untitled"
    );
  }
};

const redirectToMainAuth = (path: string) => {
  if (typeof window === "undefined") return;
  const protocol = window.location.protocol;
  const host = window.location.host;
  const mainAppUrl = `${protocol}//${host}${path}`;
  window.location.href = mainAppUrl;
};

const MyProductsModalContent: React.FC<MyProductsModalContentProps> = ({
  onSelectionChange,
  selectedIds,
  className = "",
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ModalProduct[]>([]);
  const [folders, setFolders] = useState<ModalFolder[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [activeFolderId, setActiveFolderId] = useState<number | null>(null);
  const [selectedSet, setSelectedSet] = useState<Set<number>>(
    () => new Set(selectedIds || [])
  );

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

      if (projectsResponse.status === 401 || projectsResponse.status === 403) {
        redirectToMainAuth("/auth/login");
        return;
      }

      if (!projectsResponse.ok) {
        throw new Error(
          `Failed to load products (${projectsResponse.status})`
        );
      }

      if (foldersResponse && (foldersResponse.status === 401 || foldersResponse.status === 403)) {
        redirectToMainAuth("/auth/login");
        return;
      }

      const projectsJson = await projectsResponse.json();
      const foldersJson =
        foldersResponse && foldersResponse.ok
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
              (folder: any): ModalFolder => ({
                id: folder.id,
                name:
                  folder.name || t("interface.untitledFolder", "Untitled"),
                parent_id:
                  typeof folder.parent_id === "number"
                    ? folder.parent_id
                    : null,
              })
            )
        );
      } else {
        setFolders([]);
      }

      const mappedProducts: ModalProduct[] = Array.isArray(projectsJson)
        ? projectsJson
            .filter((project) => typeof project?.id === "number")
            .map(
              (project): ModalProduct => ({
                id: project.id,
                title: computeDisplayTitle(project),
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
                url:
                  typeof project?.id === "number"
                    ? `/projects/${project.id}`
                    : undefined,
              })
            )
        : [];

      setProducts(mappedProducts);
    } catch (err: any) {
      console.error("[MyProductsModalContent] load error:", err);
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
          const selectedProducts = products.filter((product) =>
            next.has(product.id)
          );
          onSelectionChange(Array.from(next), selectedProducts);
        }
        return next;
      });
    },
    [products, onSelectionChange]
  );

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (
          activeFolderId !== null &&
          product.folderId !== activeFolderId
        ) {
          return false;
        }
        if (!search.trim()) return true;
        const term = search.toLowerCase();
        return (
          product.title.toLowerCase().includes(term) ||
          (product.type ? product.type.toLowerCase().includes(term) : false)
        );
      })
      .sort((a, b) => {
        const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return createdB - createdA;
      });
  }, [products, search, activeFolderId]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 text-sm text-gray-500 ${className}`}>
        {t("interface.loading", "Loading...")}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 text-sm text-red-500 ${className}`}>
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

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-sm text-gray-500">
          <p>{t("interface.noProductsFound", "No products found")}</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => {
            const isSelected = selectedSet.has(product.id);
            return (
              <Card
                key={product.id}
                className={`cursor-pointer transition-shadow ${
                  isSelected
                    ? "border-blue-500 shadow-lg"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
                onClick={() => toggleSelection(product.id)}
              >
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-gray-900 line-clamp-2">
                      {product.title}
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="text-blue-500" size={20} />
                    ) : (
                      <Circle className="text-gray-300" size={20} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={14} />
                    <span>{formatDate(product.createdAt)}</span>
                  </div>
                  {product.folderName && (
                    <div className="text-xs text-gray-500">
                      {t("interface.folderLabel", "Folder")}: {product.folderName}
                    </div>
                  )}
                  {product.type && (
                    <div className="text-xs font-medium text-blue-600">
                      {product.type}
                    </div>
                  )}
                  {product.url && (
                    <div className="text-right">
                      <Link
                        href={product.url}
                        target="_blank"
                        className="text-xs text-blue-600 hover:underline"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {t("interface.open", "Open")}
                      </Link>
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
              <TableHead className="text-right">
                {t("interface.open", "Open")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const isSelected = selectedSet.has(product.id);
              return (
                <TableRow
                  key={product.id}
                  className="cursor-pointer"
                  onClick={() => toggleSelection(product.id)}
                >
                  <TableCell className="w-12">
                    {isSelected ? (
                      <CheckCircle2 className="text-blue-500" size={18} />
                    ) : (
                      <Circle className="text-gray-300" size={18} />
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {product.title}
                  </TableCell>
                  <TableCell>{product.type || "--"}</TableCell>
                  <TableCell>{product.folderName || "--"}</TableCell>
                  <TableCell>{formatDate(product.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {product.url ? (
                      <Link
                        href={product.url}
                        target="_blank"
                        className="text-xs text-blue-600 hover:underline"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {t("interface.open", "Open")}
                      </Link>
                    ) : (
                      "--"
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default MyProductsModalContent;

