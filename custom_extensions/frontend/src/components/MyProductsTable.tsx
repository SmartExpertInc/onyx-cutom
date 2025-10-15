"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  MoreHorizontal,
  Home,
  Clock,
  User,
  Star,
  ListFilter ,
  LayoutGrid,
  List,
  Plus,
  ChevronsUpDown,
  ArrowUpDown,
  LucideIcon,
  Share2,
  Trash2,
  PenLine,
  Copy,
  Link as LinkIcon,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  CheckSquare,
  Square,
  ArrowDownToLine,
  Settings,
  Download,
  Presentation,
  Video,
  HelpCircle,
  FileText,
  ClipboardCheck,
  TableOfContents,
  Search,
  ArrowDownUp,
  Check,
  LayoutTemplate,
  BookOpen,
  MonitorPlay,
  FileQuestion,
  FileStack,
  ClipboardPenLine,
  Users,
  Calendar,
  FolderPlus
} from "lucide-react";
import ProjectSettingsModal from "../app/projects/ProjectSettingsModal";
import { useLanguage } from "../contexts/LanguageContext";
import { ProjectCard as CustomProjectCard } from "./ui/project-card";
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import useFeaturePermission from "../hooks/useFeaturePermission";
import { timeEvent } from "../lib/mixpanelClient"

// Helper function to render Lucide React icons based on designMicroproductType
const getDesignMicroproductIcon = (type: string): React.ReactElement => {
  const iconSize = 16;
  const iconClass = "text-black"; // Add black color class

  switch (type) {
    case "Training Plan":
      return <TableOfContents size={iconSize} className={iconClass} />;
    case "Quiz":
      return <HelpCircle size={iconSize} className={iconClass} />;
    case "Slide Deck":
      return <Presentation size={iconSize} className={iconClass} />;
    case "Video":
      return <Video size={iconSize} className={iconClass} />;
    case "Text Presentation":
      return <FileText size={iconSize} className={iconClass} />;
    default:
      // Default icon for unknown types
      return <FileText size={iconSize} className={iconClass} />;
  }
};

// Helper function to get display name for product types
const getProductTypeDisplayName = (type: string, t: (key: string, defaultValue?: string) => string): string => {
  switch (type) {
    case "Training Plan":
      return t("interface.course", "Course");
    case "Slide Deck":
      return t("interface.presentation", "Presentation");
    case "Text Presentation":
      return t("interface.onePager", "One-pager");
    case "Video Lesson Presentation":
      return t("interface.videoTable", "Video");
    default:
      return type;
  }
};

const TitleIcon: React.FC<{ size?: number }> = ({ size }) => (
  <svg height={size} width={size} viewBox="0 0 24 24" fill="#6A7282" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 12H20M4 8H20M4 16H12" stroke="#364153" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
);

const TypeIcon: React.FC<{ size?: number }> = ({ size }) => (
  <svg height={size} width={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" id="create-note" className="icon glyph" fill="#6A7282"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M20.71,3.29a2.91,2.91,0,0,0-2.2-.84,3.25,3.25,0,0,0-2.17,1L9.46,10.29s0,0,0,0a.62.62,0,0,0-.11.17,1,1,0,0,0-.1.18l0,0L8,14.72A1,1,0,0,0,9,16a.9.9,0,0,0,.28,0l4-1.17,0,0,.18-.1a.62.62,0,0,0,.17-.11l0,0,6.87-6.88a3.25,3.25,0,0,0,1-2.17A2.91,2.91,0,0,0,20.71,3.29Z"></path><path d="M20,22H4a2,2,0,0,1-2-2V4A2,2,0,0,1,4,2h8a1,1,0,0,1,0,2H4V20H20V12a1,1,0,0,1,2,0v8A2,2,0,0,1,20,22Z" style={{fill:"#6A728"}}></path></g></svg>
);

const CreatedIcon: React.FC<{ size?: number }> = ({ size }) => (
  <svg height={size} width={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 9H21M17 13.0014L7 13M10.3333 17.0005L7 17M7 3V5M17 3V5M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z" stroke="#6A7282" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
);

const CreatorIcon: React.FC<{ size?: number }> = ({ size }) => (
  <svg height={size} width={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5ZM7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8ZM7.45609 16.7264C6.40184 17.1946 6 17.7858 6 18.5C6 18.7236 6.03976 18.8502 6.09728 18.942C6.15483 19.0338 6.29214 19.1893 6.66219 19.3567C7.45312 19.7145 9.01609 20 12 20C14.9839 20 16.5469 19.7145 17.3378 19.3567C17.7079 19.1893 17.8452 19.0338 17.9027 18.942C17.9602 18.8502 18 18.7236 18 18.5C18 17.7858 17.5982 17.1946 16.5439 16.7264C15.4614 16.2458 13.8722 16 12 16C10.1278 16 8.53857 16.2458 7.45609 16.7264ZM6.64442 14.8986C8.09544 14.2542 10.0062 14 12 14C13.9938 14 15.9046 14.2542 17.3556 14.8986C18.8348 15.5554 20 16.7142 20 18.5C20 18.9667 19.9148 19.4978 19.5973 20.0043C19.2798 20.5106 18.7921 20.8939 18.1622 21.1789C16.9531 21.7259 15.0161 22 12 22C8.98391 22 7.04688 21.7259 5.83781 21.1789C5.20786 20.8939 4.72017 20.5106 4.40272 20.0043C4.08524 19.4978 4 18.9667 4 18.5C4 16.7142 5.16516 15.5554 6.64442 14.8986Z" fill="#364153"></path> </g></svg>
);

// Helper function to calculate dynamic text width based on column width
const calculateTextWidth = (
  columnWidthPercent: number,
  containerWidth: number = 1200
): number => {
  // Calculate the actual pixel width based on percentage
  const pixelWidth = (columnWidthPercent / 100) * containerWidth;

  // Account for padding, margins, and other elements in the cell
  // Subtract space for icons, padding, and other UI elements
  const availableWidth = pixelWidth - 120; // Account for icons, padding, etc.

  // Ensure minimum width for readability
  return Math.max(availableWidth, 50);
};

// Dynamic text component that adjusts width based on column width
const DynamicText: React.FC<{
  text: string;
  columnWidthPercent: number;
  className?: string;
  title?: string;
  href?: string;
  onClick?: () => void;
}> = ({ text, columnWidthPercent, className = "", title, href, onClick }) => {
  const [containerWidth, setContainerWidth] = useState(1200);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const tableContainer = containerRef.current.closest(".overflow-x-auto");
        if (tableContainer) {
          setContainerWidth(tableContainer.clientWidth);
        }
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const textWidth = calculateTextWidth(columnWidthPercent, containerWidth);

  const content = (
    <div
      ref={containerRef}
      className={`truncate ${className}`}
      style={{ maxWidth: `${textWidth}px` }}
      title={title || text}
      onClick={onClick}
    >
      {text}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="text-blue-600 hover:text-blue-800 hover:underline">
        {content}
      </Link>
    );
  }

  return content;
};

interface Project {
  id: number;
  title: string;
  created_at: string;
  last_viewed?: string;
  onyx_user_id: string;
  design_microproduct_type: string;
  folder_id?: number;
  creator: boolean;
  creator_name?: string;
  creator_id?: number;
  quality_tier?: string;
  is_public?: boolean;
  thumbnail_url?: string;
  description?: string;
  status?: string;
  completion_percentage?: number;
  estimated_duration?: number;
  tags?: string[];
  last_modified?: string;
  view_count?: number;
  like_count?: number;
  share_count?: number;
  is_favorite?: boolean;
  is_archived?: boolean;
  is_deleted?: boolean;
  created_by?: string;
  updated_by?: string;
  version?: string;
  language?: string;
  category?: string;
  difficulty_level?: string;
  target_audience?: string;
  learning_objectives?: string[];
  prerequisites?: string[];
  resources?: string[];
  assessment_criteria?: string[];
  feedback?: string;
  rating?: number;
  reviews_count?: number;
  price?: number;
  currency?: string;
  availability?: string;
  license?: string;
  copyright?: string;
  attribution?: string;
  source?: string;
  references?: string[];
  related_projects?: number[];
  dependencies?: number[];
  metadata?: Record<string, any>;
}

interface MyProductsTableProps {
  folderId?: number | null;
}

const MyProductsTable: React.FC<MyProductsTableProps> = ({ folderId }) => {
  const { t } = useLanguage();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "created" | "lastViewed" | "creator">(
    "created"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProjects, setSelectedProjects] = useState<Set<number>>(new Set());
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsProject, setSettingsProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Column widths for list view
  const columnWidths = {
    title: 35,
    type: 15,
    created: 15,
    lastViewed: 15,
    creator: 15,
  };

  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

  // Get current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/me', {
          credentials: 'same-origin',
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch projects filtered by current user
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const devUserId = "dummy-onyx-user-id-for-testing";
      if (devUserId && process.env.NODE_ENV === 'development') {
        headers['X-Dev-Onyx-User-ID'] = devUserId;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (folderId) {
        params.append('folder_id', folderId.toString());
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      params.append('sort_by', sortBy);
      params.append('sort_order', sortOrder);
      // Filter by current user
      if (currentUser?.id) {
        params.append('onyx_user_id', currentUser.id);
      }

      const projectsApiUrl = `${CUSTOM_BACKEND_URL}/projects?${params}`;
      const response = await fetch(projectsApiUrl, {
        headers,
        cache: 'no-store',
        credentials: 'same-origin',
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Handle authentication error - redirect to main app login
          const protocol = window.location.protocol;
          const host = window.location.host;
          const currentUrl = window.location.pathname + window.location.search;
          const mainAppUrl = `${protocol}//${host}/auth/login?next=${encodeURIComponent(currentUrl)}`;
          window.location.href = mainAppUrl;
          return;
        }
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }

      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  }, [folderId, searchTerm, sortBy, sortOrder, currentUser?.id, CUSTOM_BACKEND_URL]);

  // Load projects when component mounts or dependencies change
  useEffect(() => {
    if (currentUser?.id) {
      fetchProjects();
    }
  }, [fetchProjects, currentUser?.id]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchProjects();
    };

    window.addEventListener('refreshProjects', handleRefresh);
    return () => window.removeEventListener('refreshProjects', handleRefresh);
  }, [fetchProjects]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentUser?.id) {
        fetchProjects();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchProjects, currentUser?.id]);

  const handleSort = (column: "title" | "created" | "lastViewed" | "creator") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const handleSelectProject = (projectId: number) => {
    setSelectedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedProjects.size === projects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(projects.map(p => p.id)));
    }
  };

  const handleSettings = (project: Project) => {
    setSettingsProject(project);
    setShowSettingsModal(true);
  };

  const handleDelete = async (projectId: number) => {
    if (!confirm(t('interface.confirmDelete', 'Are you sure you want to delete this project?'))) {
      return;
    }

    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });

      if (response.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setSelectedProjects(prev => {
          const newSet = new Set(prev);
          newSet.delete(projectId);
          return newSet;
        });
      } else {
        throw new Error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert(t('interface.deleteError', 'Failed to delete project'));
    }
  };

  const handleMoveToFolder = async (projectId: number, targetFolderId: number | null) => {
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/${projectId}/folder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ folder_id: targetFolderId })
      });

      if (response.ok) {
        // Update the project in the local state
        setProjects(prev => prev.map(p => 
          p.id === projectId ? { ...p, folder_id: targetFolderId || undefined } : p
        ));
      } else {
        throw new Error('Failed to move project');
      }
    } catch (error) {
      console.error('Error moving project:', error);
      alert(t('interface.moveError', 'Failed to move project'));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">{t('interface.loading', 'Loading...')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('interface.error', 'Error')}</h3>
        <p className="text-gray-600">{error}</p>
        <Button onClick={fetchProjects} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('interface.retry', 'Retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Folder button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-gray-900">My products</h2>
          <Button
            onClick={() => window.dispatchEvent(new CustomEvent('openFolderModal'))}
            className="flex items-center gap-2"
          >
            <FolderPlus size={16} />
            Add folder
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('interface.search', 'Search...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setSortBy("created")}
            className="flex items-center gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            {t('interface.sort', 'Sort')}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Projects Display */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
            <FileText className="h-full w-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('interface.noProducts', 'No products found')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('interface.noProductsDescription', 'You haven\'t created any products yet.')}
          </p>
          <Button onClick={() => router.push('/create')}>
            <Plus className="mr-2 h-4 w-4" />
            {t('interface.createProduct', 'Create Product')}
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <CustomProjectCard
              key={project.id}
              project={{
                ...project,
                createdBy: project.creator_name || 'You',
                createdAt: project.created_at
              }}
              onDelete={(id) => handleDelete(id)}
              onRestore={() => {}}
              onDeletePermanently={() => {}}
              isTrashMode={false}
              folderId={folderId}
              onTierChange={(tier) => {
                setProjects(prev => prev.map(p => 
                  p.id === project.id ? { ...p, quality_tier: tier } : p
                ));
              }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedProjects.size === projects.length && projects.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    style={{ width: `${columnWidths.title}%` }}
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-2">
                      <TitleIcon size={16} />
                      {t("interface.title", "Title")}
                      {sortBy === 'title' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    style={{ width: `${columnWidths.type}%` }}
                  >
                    <div className="flex items-center gap-2">
                      <TypeIcon size={16} />
                      {t("interface.type", "Type")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    style={{ width: `${columnWidths.created}%` }}
                    onClick={() => handleSort('created')}
                  >
                    <div className="flex items-center gap-2">
                      <CreatedIcon size={16} />
                      {t("interface.created", "Created")}
                      {sortBy === 'created' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    style={{ width: `${columnWidths.lastViewed}%` }}
                    onClick={() => handleSort('lastViewed')}
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      {t("interface.lastViewed", "Last Viewed")}
                      {sortBy === 'lastViewed' && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedProjects.has(project.id)}
                        onCheckedChange={() => handleSelectProject(project.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <DynamicText
                        text={project.title}
                        columnWidthPercent={columnWidths.title}
                        href={`/projects/${project.id}`}
                        title={project.title}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getDesignMicroproductIcon(project.design_microproduct_type)}
                        <span className="text-sm text-gray-600">
                          {getProductTypeDisplayName(project.design_microproduct_type, t)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatDate(project.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {project.last_viewed ? formatDateTime(project.last_viewed) : t('interface.never', 'Never')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)}>
                            <PenLine className="mr-2 h-4 w-4" />
                            {t('interface.edit', 'Edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSettings(project)}>
                            <Settings className="mr-2 h-4 w-4" />
                            {t('interface.settings', 'Settings')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(project.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('interface.delete', 'Delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && settingsProject && (
        <ProjectSettingsModal
          open={showSettingsModal}
          projectId={settingsProject.id}
          projectName={settingsProject.title}
          currentTier={settingsProject.quality_tier}
          onClose={() => {
            setShowSettingsModal(false);
            setSettingsProject(null);
          }}
          onTierChange={(tier) => {
            setProjects(prev => prev.map(p => 
              p.id === settingsProject.id ? { ...p, quality_tier: tier } : p
            ));
          }}
        />
      )}
    </div>
  );
};

export default MyProductsTable;
