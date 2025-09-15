import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { cn } from "@/lib/utils";
import ProjectSettingsModal from "../../app/projects/ProjectSettingsModal";
import { 
  MoreHorizontal, 
  Lock, 
  List,
  Presentation,
  Video,
  HelpCircle,
  TableOfContents,
  FileText,
  Share2,
  PenLine,
  Star,
  Copy,
  Link as LinkIcon,
  Settings,
  FolderMinus,
  Trash2,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

interface Project {
  id: number;
  title: string;
  instanceName?: string;
  designMicroproductType?: string;
  isPrivate?: boolean;
  createdBy: string;
  createdAt: string;
  isGamma?: boolean;
}

interface ProjectCardProps {
  project: Project;
  onDelete: (id: number, scope: "self" | "all") => void;
  onRestore: (id: number) => void;
  onDeletePermanently: (id: number) => void;
  isTrashMode: boolean;
  folderId?: number | null;
  t?: (key: string, fallback?: string) => string;
  language?: string;
  onTierChange?: (tier: string) => void;
  className?: string;
}

// Helper function to get project type icon
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
    case "Video Lesson Presentation":
      return <Video size={iconSize} className={iconClass} />;
    case "Text Presentation":
      return <FileText size={iconSize} className={iconClass} />;
    default:
      // Default icon for unknown types
      return <FileText size={iconSize} className={iconClass} />;
  }
};

// Helper function to check if any modal is present in the DOM
const isAnyModalPresent = (): boolean => {
  if (typeof window === "undefined") return false;

  // Check for various modal selectors that might be present
  const modalSelectors = [
    '[data-modal-portal="true"]',
    ".fixed.inset-0.z-\\[9999\\]", // FolderModal and FolderSettingsModal
    ".fixed.inset-0.z-50", // Generic modals
    ".fixed.inset-0.bg-neutral-950", // Modal component
    ".fixed.inset-0.overflow-hidden.z-50", // SlideOverModal
    ".fixed.inset-0.bg-black", // Various modal overlays
  ];

  for (const selector of modalSelectors) {
    if (document.querySelector(selector)) {
      return true;
    }
  }

  return false;
};

// Helper function to get modal state - combines window flag and DOM detection
const getModalState = (): boolean => {
  const windowFlag =
    typeof window !== "undefined" ? (window as any).__modalOpen : false;
  const domDetection = isAnyModalPresent();
  return windowFlag || domDetection;
};

// Helper function to redirect to main app's auth endpoint
const redirectToMainAuth = (path: string) => {
  // Get the current domain and protocol
  const protocol = window.location.protocol;
  const host = window.location.host;
  const mainAppUrl = `${protocol}//${host}${path}`;
  window.location.href = mainAppUrl;
};


// Generate color from string
const stringToColor = (str: string): string => {
  let hash = 0;
  if (!str) return "#CCCCCC";
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).substr(-2);
  }
  return color;
};

// Format date
const formatDate = (dateString: string, language: string = "en") => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString(
    language === "en"
      ? "en-US"
      : language === "es"
      ? "es-ES"
      : language === "ru"
      ? "ru-RU"
      : "uk-UA",
    options
  );
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onDelete,
  onRestore,
  onDeletePermanently,
  isTrashMode,
  folderId,
  t = (key: string, fallback?: string) => fallback || key,
  language = "en",
  onTierChange,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [permanentDeleteConfirmOpen, setPermanentDeleteConfirmOpen] = useState(false);
  const [trashConfirmOpen, setTrashConfirmOpen] = useState(false);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(
    project.title || project.instanceName || "Product"
  );
  const [menuPosition, setMenuPosition] = useState<"above" | "below">("below");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isOutline =
    (project.designMicroproductType || "").toLowerCase() === "training plan";
  const displayTitle = isOutline
    ? project.title
    : project.instanceName || project.title;

  const bgColor = stringToColor(project.title);
  const avatarColor = stringToColor(project.createdBy);

  const handleRemoveFromFolder = async () => {
    try {
      const CUSTOM_BACKEND_URL =
        process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL ||
        "/api/custom-projects-backend";
      const headers: HeadersInit = { "Content-Type": "application/json" };
      const devUserId = "dummy-onyx-user-id-for-testing";
      if (devUserId && process.env.NODE_ENV === "development") {
        headers["X-Dev-Onyx-User-ID"] = devUserId;
      }

      const response = await fetch(
        `${CUSTOM_BACKEND_URL}/projects/${project.id}/folder`,
        {
          method: "PUT",
          headers,
          credentials: "same-origin",
          body: JSON.stringify({ folder_id: null }),
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          redirectToMainAuth("/auth/login");
          return;
        }
        throw new Error(`Failed to remove from folder: ${response.status}`);
      }

      // Refresh the page to update the view
      window.location.reload();
    } catch (error) {
      console.error("Error removing from folder:", error);
      alert("Failed to remove project from folder");
    }
  };

  const handleMenuToggle = () => {
    if (!menuOpen && buttonRef.current) {
      // Calculate if there's enough space below
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const menuHeight = 300; // Approximate menu height

      // Also check if we're inside a folder (nested structure)
      const isInsideFolder = folderId !== null;

      setMenuPosition(spaceBelow < menuHeight ? "above" : "below");
    }
    setMenuOpen((prev) => {
      if (!prev && typeof window !== "undefined")
        (window as any).__modalOpen = true;
      if (prev && typeof window !== "undefined")
        (window as any).__modalOpen = false;
      return !prev;
    });
  };

  const handleDragStart = (e: React.DragEvent) => {
    // Check if any modal is open - prevent dragging completely
    const isModalOpen = getModalState();
    if (isModalOpen) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Add visual feedback to the dragged element
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "0.5";
    target.style.transform = "rotate(5deg)";

    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        projectId: project.id,
        projectName: project.title,
        type: "project",
      })
    );
    e.dataTransfer.effectAllowed = "move";

    // Set a custom drag image (optional)
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.width = "200px";
    dragImage.style.height = "auto";
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 100, 50);

    // Clean up the drag image after a short delay
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Reset visual feedback
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "1";
    target.style.transform = "rotate(0deg)";
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // Check if the click is on the portal modal
        const target = event.target as Element;
        if (target.closest("[data-modal-portal]")) {
          return; // Don't close if clicking inside the modal
        }
        setMenuOpen(false);
        if (typeof window !== "undefined") (window as any).__modalOpen = false;
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (typeof window !== "undefined") (window as any).__modalOpen = false;
    };
  }, []);

  const handleTrashRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuOpen(false);
    if (project.designMicroproductType === "Training Plan") {
      setTrashConfirmOpen(true);
    } else {
      onDelete(project.id, "self");
    }
  };

  const handleRestoreProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuOpen(false);
    onRestore(project.id);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isTrashMode) {
      e.preventDefault();
      setShowRestorePrompt(true);
    }
  };

  const handleDuplicateProject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuOpen(false);
    try {
      const resp = await fetch(
        `/api/custom-projects-backend/projects/duplicate/${project.id}`,
        { method: "POST" }
      );
      if (resp.ok) {
        window.location.reload();
      } else {
        const err = await resp.text();
        alert("Failed to duplicate project: " + err);
      }
    } catch (error) {
      alert("Failed to duplicate project: " + (error as Error).message);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(
      language === "en"
        ? "en-US"
        : language === "es"
        ? "es-ES"
        : language === "ru"
        ? "ru-RU"
        : "uk-UA",
      options
    );
  };

  const getProductTypeDisplayName = (type: string): string => {
    switch (type) {
      case "Training Plan":
        return "Course Outline";
      case "Slide Deck":
        return "Presentation";
      case "Text Presentation":
        return "Onepager";
      default:
        return type;
    }
  };

  return (
    <Card className={`group rounded-xl shadow-sm transition-all duration-200 hover:shadow-lg border border-gray-200 relative overflow-hidden ${
      !getModalState()
        ? "cursor-grab active:cursor-grabbing"
        : "cursor-default"
    }`}>
      <Link
        href={isTrashMode ? "#" : (
          project.designMicroproductType === "Video Lesson Presentation" 
            ? `/projects-2/view/${project.id}`
            : `/projects/view/${project.id}`
        )}
        onClick={handleCardClick}
        className="block h-full"
      >
        <div 
          className="relative h-40 bg-gradient-to-br from-blue-300 to-blue-500 shadow-md flex flex-col justify-between p-4"
          style={{
            backgroundColor: bgColor,
            backgroundImage: `linear-gradient(45deg, ${bgColor}99, ${stringToColor(
              displayTitle.split("").reverse().join("")
            )}99)`,
          }}
        >
          {/* Top row with icon and badge */}
          <div className="flex justify-between items-start">
            {/* List icon in top-left */}
            <div className="w-6 h-6 flex items-center justify-center">
              <List size={16} className="text-gray-500/60" />
            </div>
            
            {/* Badges in top-right */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Course type badge */}
              {project.designMicroproductType && (
                <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 border border-gray-200 flex-shrink-0">
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                    {getProductTypeDisplayName(project.designMicroproductType)}
                  </span>
                </div>
              )}
              
              {/* Private badge */}
              {project.isPrivate && (
                <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 border border-gray-200">
                  <Lock size={10} className="text-gray-600" />
                  <span className="text-xs font-medium text-gray-700">
                    {t("interface.private", "Private")}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Project type icon overlay */}
          {project.designMicroproductType && (
            <div className="absolute top-3 left-3 w-6 h-6 bg-white/20 backdrop-blur-sm rounded-md flex items-center justify-center">
              {getDesignMicroproductIcon(project.designMicroproductType)}
            </div>
          )}
          
           {/* Truncated title in center */}
           <div className="flex items-center justify-center flex-1 px-2">
             <h3 
               className="font-semibold text-md text-center leading-tight line-clamp-2"
                style={{ color: "white" }}
             >
               {displayTitle.length > 30 ? `${displayTitle.substring(0, 30)}...` : displayTitle}
             </h3>
           </div>
        </div>
        
        {/* Lower section with white background (25-30% of height) */}
        <div className="bg-white p-4 h-25 flex flex-col justify-between">
          {/* Full title */}
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1" title={displayTitle}>
            {displayTitle}
          </h3>
          
          {/* Creator info and options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Avatar */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: avatarColor }}
              >
                {project.createdBy.slice(0, 1).toUpperCase()}
              </div>
              
              {/* Creator info */}
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-900 leading-tight">
                  {t("interface.createdByYou", "Created by you")}
                </span>
                <span className="text-xs text-gray-500 leading-tight">
                  {formatDate(project.createdAt)}
                </span>
              </div>
            </div>
            
            {/* Options menu */}
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleMenuToggle();
                  }}
                >
                  <MoreHorizontal size={14} className="text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-56 bg-white border border-gray-100 shadow-lg text-gray-900" 
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuLabel className="px-3 py-2 border-b border-gray-100">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {project.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("actions.created", "Created {date}").replace(
                      "{date}",
                      formatDate(project.createdAt)
                    )}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isTrashMode ? (
                  <>
                    <DropdownMenuItem onClick={handleRestoreProject}>
                      <RefreshCw size={14} />
                      <span>{t("actions.restore", "Restore")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setMenuOpen(false);
                        setPermanentDeleteConfirmOpen(true);
                      }}
                      variant="destructive"
                    >
                      <Trash2 size={14} />
                      <span>
                        {t("actions.deletePermanently", "Delete permanently")}
                      </span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem>
                      <Share2 size={16} className="text-gray-500" />
                      <span>{t("actions.share", "Share...")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setMenuOpen(false);
                        setRenameModalOpen(true);
                      }}
                    >
                      <PenLine size={16} className="text-gray-500" />
                      <span>{t("actions.rename", "Rename...")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Star size={16} className="text-gray-500" />
                      <span>
                        {t("actions.addToFavorites", "Add to favorites")}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDuplicateProject}>
                      <Copy size={16} className="text-gray-500" />
                      <span>{t("actions.duplicate", "Duplicate")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <LinkIcon size={16} className="text-gray-500" />
                      <span>{t("actions.copyLink", "Copy link")}</span>
                    </DropdownMenuItem>
                    {isOutline && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setMenuOpen(false);
                          setShowSettingsModal(true);
                        }}
                      >
                        <Settings size={16} className="text-gray-500" />
                        <span>{t("actions.settings", "Settings")}</span>
                      </DropdownMenuItem>
                    )}
                    {folderId && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setMenuOpen(false);
                          handleRemoveFromFolder();
                        }}
                        className="text-orange-600 focus:text-orange-600 focus:bg-orange-50"
                      >
                        <FolderMinus size={16} className="text-orange-500" />
                        <span>
                          {t("actions.removeFromFolder", "Remove from Folder")}
                        </span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setMenuOpen(false);
                        handleTrashRequest(e);
                      }}
                      variant="destructive"
                    >
                      <Trash2 size={14} />
                      <span className="text-red-500 hover:bg-red-200">{t("actions.sendToTrash", "Send to trash")}</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Link>

      {permanentDeleteConfirmOpen && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-40"
          onClick={() => setPermanentDeleteConfirmOpen(false)}
        >
          <Card
            className="text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle className="text-lg">
                {t("actions.areYouSure", "Are you sure?")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {t(
                  "actions.actionPermanent",
                  "This action is permanent and cannot be undone. The project will be deleted forever."
                )}
              </CardDescription>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setPermanentDeleteConfirmOpen(false)}
              >
                {t("actions.cancel", "Cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDeletePermanently(project.id);
                  setPermanentDeleteConfirmOpen(false);
                }}
              >
                {t("actions.deletePermanentlyButton", "Delete Permanently")}
              </Button>
            </div>
            </CardContent>
          </Card>
        </div>
      )}

      {trashConfirmOpen && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-40"
          onClick={() => setTrashConfirmOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-semibold text-lg mb-2 text-gray-900">
              {t("actions.moveToTrash", "Move to Trash")}
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              {t(
                "actions.courseOutlineTrashMessage",
                "This is a Course Outline. Do you want to move just the outline, or the outline and all its lessons?"
              )}
            </p>
            <div className="flex justify-center gap-3">
              <Button
                onClick={() => setTrashConfirmOpen(false)}
                variant="outline"
              >
                {t("actions.cancel", "Cancel")}
              </Button>
              <Button
                onClick={() => {
                  onDelete(project.id, "self");
                  setTrashConfirmOpen(false);
                }}
                variant="secondary"
              >
                {t("actions.outlineOnly", "Outline Only")}
              </Button>
              <Button
                onClick={() => {
                  onDelete(project.id, "all");
                  setTrashConfirmOpen(false);
                }}
                variant="destructive"
              >
                {t("actions.moveAll", "Move All")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showRestorePrompt && (
        <div
          className="fixed inset-0 bg-black/10 flex items-center justify-center p-4 z-40"
          onClick={() => setShowRestorePrompt(false)}
        >
          <div
            className="bg-orange-100 border border-orange-200 rounded-lg py-3 px-4 shadow-lg flex items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <AlertTriangle
              className="text-orange-500 flex-shrink-0"
              size={20}
            />
            <p className="text-sm text-orange-900">
              {t(
                "actions.wantToEditInTrash",
                "Want to edit this? It's in the trash."
              )}
              &nbsp;
              <Button
                onClick={() => {
                  onRestore(project.id);
                  setShowRestorePrompt(false);
                }}
                className="font-semibold underline hover:text-orange-700 cursor-pointer"
              >
                {t("actions.restoreIt", "Restore it")}
              </Button>
            </p>
          </div>
        </div>
      )}

      {/* ---------------- Rename Modal ---------------- */}
      {renameModalOpen && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-40"
          onClick={() => {
            if (!isRenaming) setRenameModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-semibold text-lg mb-4 text-gray-900">
              {t("actions.rename", "Rename")}
            </h4>

            <div className="mb-6">
              <Label
                htmlFor="newName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("actions.newName", "New Name:")}
              </Label>
              <Input
                id="newName"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            <div className="flex justify-start gap-3">
              <Button
                onClick={() => {
                  if (!isRenaming) setRenameModalOpen(false);
                }}
                variant="outline"
                className="text-gray-600 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
                disabled={isRenaming}
              >
                {t("actions.cancel", "Cancel")}
              </Button>
              <Button
                variant="download"
                className="rounded-full"
                onClick={async () => {
                  setIsRenaming(true);
                  try {
                    const CUSTOM_BACKEND_URL =
                      process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL ||
                      "/api/custom-projects-backend";
                    const headers: HeadersInit = {
                      "Content-Type": "application/json",
                    };
                    const devUserId = "dummy-onyx-user-id-for-testing";
                    if (devUserId && process.env.NODE_ENV === "development") {
                      headers["X-Dev-Onyx-User-ID"] = devUserId;
                    }

                    const updateProject = async (
                      id: number,
                      bodyPayload: any
                    ) => {
                      const resp = await fetch(
                        `${CUSTOM_BACKEND_URL}/projects/update/${id}`,
                        {
                          method: "PUT",
                          headers,
                          credentials: "same-origin",
                          body: JSON.stringify(bodyPayload),
                        }
                      );
                      if (!resp.ok) {
                        if (resp.status === 401 || resp.status === 403) {
                          redirectToMainAuth("/auth/login");
                          return;
                        }
                        const errTxt = await resp.text();
                        throw new Error(
                          `Failed to update project ${id}: ${resp.status} ${errTxt}`
                        );
                      }
                    };

                    const tasks: Promise<void>[] = [];
                    const oldProjectName = project.title;

                    if (isOutline) {
                      tasks.push(
                        updateProject(project.id, { projectName: newName })
                      );
                      const listResp = await fetch(
                        `${CUSTOM_BACKEND_URL}/projects`,
                        {
                          headers,
                          cache: "no-store",
                          credentials: "same-origin",
                        }
                      );
                      if (listResp.ok) {
                        const listData: any[] = await listResp.json();
                        listData
                          .filter(
                            (p) =>
                              p.projectName === oldProjectName &&
                              p.id !== project.id
                          )
                          .forEach((p) =>
                            tasks.push(
                              updateProject(p.id, { projectName: newName })
                            )
                          );
                      } else if (
                        listResp.status === 401 ||
                        listResp.status === 403
                      ) {
                        redirectToMainAuth("/auth/login");
                        return;
                      }
                    } else {
                      tasks.push(
                        updateProject(project.id, { microProductName: newName })
                      );
                    }

                    await Promise.all(tasks);

                    setRenameModalOpen(false);
                    window.location.reload();
                  } catch (error) {
                    console.error(error);
                    alert((error as Error).message);
                  } finally {
                    setIsRenaming(false);
                  }
                }}
                disabled={isRenaming || !newName.trim()}
              >
                {isRenaming
                  ? t("actions.saving", "Saving...")
                  : t("actions.rename", "Rename")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Project Settings Modal */}
      {showSettingsModal && (
        <ProjectSettingsModal
          open={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          projectName={project.title}
          projectId={project.id}
          onTierChange={(tier: string) => {
            console.log("Project tier changed to:", tier);
          }}
        />
      )}
    </Card>
  );
};

export default ProjectCard;
