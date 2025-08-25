// custom_extensions/frontend/src/components/ProjectsTable.tsx
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
  Users,
  Star, 
  ArrowUpDown, 
  LayoutGrid, 
  List, 
  Plus, 
  ChevronsUpDown,
  LucideIcon,
  Share2,
  Trash2,
  PenLine,
  Copy,
  Link as LinkIcon,
  RefreshCw,
  AlertTriangle,
  FolderMinus,
  Folder,
  ChevronRight,
  ChevronDown,
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
  TableOfContents
} from "lucide-react";
import FolderSettingsModal from "../app/projects/FolderSettingsModal";
import ProjectSettingsModal from "../app/projects/ProjectSettingsModal";
import { useLanguage } from "../contexts/LanguageContext";

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
    case "Video Lesson Presentation":
      return <Video size={iconSize} className={iconClass} />;
    case "Text Presentation":
      return <FileText size={iconSize} className={iconClass} />;
    default:
      // Default icon for unknown types
      return <FileText size={iconSize} className={iconClass} />;
  }
};

// Helper function to get localized type name
const getLocalizedTypeName = (type: string, t: any): string => {
  switch (type) {
    case "Training Plan":
      return t("interface.trainingPlans", "Training Plan");
    case "Quiz":
      return t("interface.quizzes", "Quiz");
    case "Slide Deck":
      return t("interface.slideDeck", "Slide Deck");
    case "Video Lesson Presentation":
      return t("interface.videoLessons", "Video Lesson");
    case "Text Presentation":
      return t("interface.textPresentations", "Text Presentation");
    default:
      return type || "Unknown";
  }
};

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

  const dynamicWidth = calculateTextWidth(columnWidthPercent, containerWidth);

  const textElement = (
    <span
      className={`truncate block ${className}`}
      style={{
        maxWidth: `${dynamicWidth}px`,
        width: `${dynamicWidth}px`,
      }}
      title={title || text}
    >
      {text}
    </span>
  );

  if (href) {
    return (
      <div ref={containerRef}>
        <Link
          href={href}
          className="hover:underline cursor-pointer text-gray-900"
          onClick={onClick}
        >
          {textElement}
        </Link>
      </div>
    );
  }

  return <div ref={containerRef}>{textElement}</div>;
};

// Loading Modal Component for Folder Export
const FolderExportLoadingModal: React.FC<{
  isOpen: boolean;
  folderName: string;
}> = ({ isOpen, folderName }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center backdrop-blur-sm bg-black/20">
      <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center max-w-md mx-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-6"></div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {t("actions.generatingPdf", "Generating PDF")}
        </h3>
        <p className="text-gray-600 text-center mb-4">
          {t("actions.creatingPdfExport", "Creating PDF export for folder")}{" "}
          <span className="font-semibold text-blue-600">"{folderName}"</span>
        </p>
        <p className="text-sm text-gray-500 text-center">
          {t(
            "modals.folderExport.description",
            "This may take a few moments depending on the number of files..."
          )}
        </p>
      </div>
    </div>,
    document.body
  );
};

// Client Name Modal Component
const ClientNameModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    clientName: string | null,
    selectedFolders: number[],
    selectedProjects: number[]
  ) => void;
  folders: Folder[];
  folderProjects: Record<number, Project[]>;
  unassignedProjects: Project[];
}> = ({
  isOpen,
  onClose,
  onConfirm,
  folders,
  folderProjects,
  unassignedProjects,
}) => {
  const { t } = useLanguage();
  const [clientName, setClientName] = useState("");
  const [selectedFolders, setSelectedFolders] = useState<Set<number>>(
    new Set()
  );
  const [selectedProjects, setSelectedProjects] = useState<Set<number>>(
    new Set()
  );
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(
    new Set()
  );

  // Helper function to get all project IDs in a folder (including subfolders)
  const getAllProjectIdsInFolder = (folderId: number): number[] => {
    const projectIds: number[] = [];

    // Add direct projects in this folder
    const directProjects = folderProjects[folderId] || [];
    projectIds.push(...directProjects.map((p) => p.id));

    // Add projects from subfolders recursively
    const folder = folders.find((f) => f.id === folderId);
    if (folder?.children) {
      for (const child of folder.children) {
        projectIds.push(...getAllProjectIdsInFolder(child.id));
      }
    }

    return projectIds;
  };

  // Handle folder selection with auto-selection of projects
  const handleFolderSelection = (folderId: number, isChecked: boolean) => {
    if (isChecked) {
      // Select folder and all its projects
      setSelectedFolders((prev) => new Set([...prev, folderId]));
      const projectIds = getAllProjectIdsInFolder(folderId);
      setSelectedProjects((prev) => new Set([...prev, ...projectIds]));
    } else {
      // Deselect folder and all its projects
      setSelectedFolders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(folderId);
        return newSet;
      });
      const projectIds = getAllProjectIdsInFolder(folderId);
      setSelectedProjects((prev) => {
        const newSet = new Set(prev);
        projectIds.forEach((id) => newSet.delete(id));
        return newSet;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(
      clientName.trim() || null,
      Array.from(selectedFolders),
      Array.from(selectedProjects)
    );
    setClientName("");
    setSelectedFolders(new Set());
    setSelectedProjects(new Set());
  };

  const handleCancel = () => {
    // Reset all state to initial values
    setClientName("");
    setSelectedFolders(new Set());
    setSelectedProjects(new Set());
    setExpandedFolders(new Set());
    // Close the modal
    onClose();
  };

  // Calculate total selectable items (folders + projects)
  const getAllSelectableItems = () => {
    const allProjectIds: number[] = [];
    
    // Add all project IDs from folders
    folders.forEach(folder => {
      allProjectIds.push(...getAllProjectIdsInFolder(folder.id));
    });
    
    // Add unassigned project IDs
    allProjectIds.push(...unassignedProjects.map(p => p.id));
    
    return {
      folderIds: folders.map(f => f.id),
      projectIds: allProjectIds
    };
  };

  // Check if all items are selected
  const { folderIds: allFolderIds, projectIds: allProjectIds } = getAllSelectableItems();
  const isAllSelected = allFolderIds.length > 0 && 
    allFolderIds.every(id => selectedFolders.has(id)) && 
    allProjectIds.every(id => selectedProjects.has(id));

  // Handle select all functionality
  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      // Select all folders and their projects
      setSelectedFolders(new Set(allFolderIds));
      setSelectedProjects(new Set(allProjectIds));
    } else {
      // Deselect all
      setSelectedFolders(new Set());
      setSelectedProjects(new Set());
    }
  };

  // Check if any items are selected (folders or projects)
  const hasAnySelection = selectedFolders.size > 0 || selectedProjects.size > 0;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-black/30"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative border border-gray-100">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
          onClick={onClose}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">
            {t("interface.customizePDF", "Customize PDF")}
          </h2>
          <p className="text-gray-600">
            {t(
              "interface.customizePDFDescription",
              "Enter a client name and select which folders/products to include in the PDF."
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="client-name"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {t("interface.clientNameOptional", "Client Name (optional)")}
            </label>
            <input
              id="client-name"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
              placeholder={t("interface.enterClientName", "Enter client name")}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all duration-200 bg-white hover:border-gray-300 cursor-text"
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                {t(
                  "interface.selectFoldersAndProducts",
                  "Select Folders & Products"
                )}
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {selectedProjects.size} {t("interface.selected", "selected")}
                </span>
                {(folders.length > 0 || unassignedProjects.length > 0) && (
                  <label className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all duration-200 cursor-pointer"
                    />
                    <span className="text-xs font-medium">
                      {t("interface.selectAll", "Select all")}
                    </span>
                  </label>
                )}
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50/50 shadow-inner">
              {/* Folders */}
              {folders.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                    {t("interface.pdfFolders", "Folders")}
                  </div>
                  {folders.map((folder) => (
                    <div key={folder.id} className="mb-2">
                      <label className="flex items-center gap-3 py-2 px-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-all duration-200 group">
                        <input
                          type="checkbox"
                          checked={selectedFolders.has(folder.id)}
                          onChange={(e) =>
                            handleFolderSelection(folder.id, e.target.checked)
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all duration-200 cursor-pointer"
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="text-blue-500 group-hover:text-blue-600 transition-colors"
                          >
                            <path
                              d="M3 7a2 2 0 0 1 2-2h3.172a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 12.828 7H19a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                            {folder.name}
                          </span>
                          <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {getTotalItemsInFolder(folder, folderProjects)}{" "}
                            {getTotalItemsInFolder(folder, folderProjects) === 1
                              ? t("interface.item", "item")
                              : t("interface.items", "items")}
                          </span>
                        </div>
                      </label>

                      {/* Projects in this folder */}
                      {folderProjects[folder.id] &&
                        folderProjects[folder.id].length > 0 && (
                          <div className="ml-8 mt-2 space-y-1">
                            {folderProjects[folder.id].map((project) => (
                              <label
                                key={project.id}
                                className="flex items-center gap-3 py-1.5 px-3 hover:bg-gray-50 rounded-md cursor-pointer transition-all duration-200 group"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedProjects.has(project.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedProjects(
                                        (prev) => new Set([...prev, project.id])
                                      );
                                    } else {
                                      setSelectedProjects((prev) => {
                                        const newSet = new Set(prev);
                                        newSet.delete(project.id);
                                        return newSet;
                                      });
                                    }
                                  }}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all duration-200 cursor-pointer"
                                />
                                <span className="text-sm text-gray-600 group-hover:text-gray-800 flex-1">
                                  {project.title}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}

              {/* Unassigned Projects */}
              {unassignedProjects.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                    {t(
                      "interface.pdfUnassignedProducts",
                      "Unassigned Products"
                    )}
                  </div>
                  <div className="space-y-1">
                    {unassignedProjects.map((project) => (
                      <label
                        key={project.id}
                        className="flex items-center gap-3 py-1.5 px-3 hover:bg-gray-50 rounded-md cursor-pointer transition-all duration-200 group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedProjects.has(project.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProjects(
                                (prev) => new Set([...prev, project.id])
                              );
                            } else {
                              setSelectedProjects((prev) => {
                                const newSet = new Set(prev);
                                newSet.delete(project.id);
                                return newSet;
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all duration-200 cursor-pointer"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-gray-800 flex-1">
                          {project.title}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {folders.length === 0 && unassignedProjects.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-8">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="mx-auto mb-3 text-gray-300"
                  >
                    <path
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {t(
                    "interface.noFoldersOrProductsAvailable",
                    "No folders or products available"
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium border border-gray-200 hover:border-gray-300 cursor-pointer"
            >
              {t("common.cancel", "Cancel")}
            </button>
            <button
              type="submit"
              disabled={!hasAnySelection}
              className={`px-6 py-2.5 rounded-lg transition-all duration-200 font-semibold shadow-sm ${
                hasAnySelection
                  ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {t("common.downloadPdf", "Download PDF")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
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
    '[role="dialog"]',
    '[aria-modal="true"]',
  ];

  return modalSelectors.some((selector) => {
    try {
      return document.querySelector(selector) !== null;
    } catch {
      return false;
    }
  });
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

// Helper function to build folder tree from flat list
const buildFolderTree = (folders: Folder[]): Folder[] => {
  const folderMap = new Map<number, Folder>();
  const rootFolders: Folder[] = [];

  // First pass: create folder objects
  folders.forEach((folder) => {
    folderMap.set(folder.id, {
      ...folder,
      children: [],
    });
  });

  // Second pass: build tree structure
  folders.forEach((folder) => {
    const folderObj = folderMap.get(folder.id)!;
    if (folder.parent_id === null || folder.parent_id === undefined) {
      rootFolders.push(folderObj);
    } else {
      const parent = folderMap.get(folder.parent_id);
      if (parent) {
        parent.children!.push(folderObj);
      }
    }
  });

  return rootFolders;
};

// Helper function to get tier color for folder icons
const getTierColor = (tier?: string): string => {
  switch (tier) {
    case "basic":
      return "#22c55e"; // green-500
    case "interactive":
      return "#f97316"; // orange-500
    case "advanced":
      return "#a855f7"; // purple-500
    case "immersive":
      return "#3b82f6"; // blue-500
    // Legacy tier support
    case "starter":
      return "#22c55e"; // green-500 (mapped to basic)
    case "medium":
      return "#f97316"; // orange-500 (mapped to interactive)
    case "professional":
      return "#3b82f6"; // blue-500 (mapped to immersive)
    default:
      return "#f97316"; // orange-500 (interactive as default)
  }
};

// Helper function to get tier color for folder icons (inherited from parent)
const getFolderTierColor = (folder: Folder, folders: Folder[]): string => {
  // If folder has its own tier, use it
  if (folder.quality_tier) {
    return getTierColor(folder.quality_tier);
  }

  // Otherwise, inherit from parent folder
  if (folder.parent_id) {
    const parentFolder = folders.find((f) => f.id === folder.parent_id);
    if (parentFolder) {
      return getFolderTierColor(parentFolder, folders);
    }
  }

  // Default to interactive tier
  return getTierColor("interactive");
};

// Helper function to count total items in a folder (projects + subfolders recursively)
const getTotalItemsInFolder = (
  folder: Folder,
  folderProjects: Record<number, Project[]>
): number => {
  const projectCount = folderProjects[folder.id]?.length || 0;

  // Recursively count items in all subfolders
  const subfolderItemsCount =
    folder.children?.reduce((total, childFolder) => {
      return total + getTotalItemsInFolder(childFolder, folderProjects);
    }, 0) || 0;

  return projectCount + subfolderItemsCount;
};

// Helper function to get total lessons in a folder (including subfolders)
const getTotalLessonsInFolder = (folder: Folder): number => {
  const directLessons = folder.total_lessons || 0;

  // Recursively sum lessons from all subfolders
  const subfolderLessons =
    folder.children?.reduce((total, childFolder) => {
      return total + getTotalLessonsInFolder(childFolder);
    }, 0) || 0;

  return directLessons + subfolderLessons;
};

// Helper function to get total hours in a folder (including subfolders)
const getTotalHoursInFolder = (folder: Folder): number => {
  const directHours = folder.total_hours || 0;

  // Recursively sum hours from all subfolders
  const subfolderHours =
    folder.children?.reduce((total, childFolder) => {
      return total + getTotalHoursInFolder(childFolder);
    }, 0) || 0;

  return directHours + subfolderHours;
};

// Helper function to get total completion time in a folder (including subfolders)
const getTotalCompletionTimeInFolder = (folder: Folder): number => {
  const directCompletionTime = folder.total_completion_time || 0;

  // Recursively sum completion time from all subfolders
  const subfolderCompletionTime =
    folder.children?.reduce((total, childFolder) => {
      return total + getTotalCompletionTimeInFolder(childFolder);
    }, 0) || 0;

  return directCompletionTime + subfolderCompletionTime;
};

// Localized completion time formatting
const timeUnits = {
  ru: { minuteUnit: "м" },
  en: { minuteUnit: "m" },
  uk: { minuteUnit: "хв" },
};

const formatCompletionTimeLocalized = (
  completionTime: string | number,
  language?: "ru" | "en" | "uk"
): string => {
  if (typeof completionTime === "string" || completionTime === 0) {
    return completionTime.toString();
  }

  const minutes = Number(completionTime);
  if (isNaN(minutes)) return "-";

  // Default to English if no language specified
  const lang = language || "en";

  if (minutes < 60) {
    return `${minutes}${timeUnits[lang].minuteUnit}`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}${timeUnits[lang].minuteUnit}`;
    }
  }
};

interface Project {
  id: number;
  title: string;
  imageUrl: string;
  lastViewed: string;
  createdAt: string;
  createdBy: string;
  isPrivate: boolean;
  /** Micro-product type returned from backend design template (e.g. "Training Plan", "PDF Lesson") */
  designMicroproductType?: string;
  isGamma?: boolean;
  instanceName?: string;
  folderId?: number | null;
  order?: number;
}

interface Folder {
  id: number;
  name: string;
  created_at: string;
  project_count: number;
  offer_count?: number;
  order: number;
  total_lessons: number;
  total_hours: number;
  total_completion_time: number;
  parent_id?: number | null;
  quality_tier?: string;
  children?: Folder[];
}

interface ProjectsTableProps {
  /** If true – table displays items from Trash and hides create/filter toolbars */
  trashMode?: boolean;
  folderId?: number | null;
}

interface ColumnVisibility {
  title: boolean;
  type: boolean;
  offers: boolean;
  created: boolean;
  creator: boolean;
  numberOfLessons: boolean;
  estCreationTime: boolean;
  estCompletionTime: boolean;
}

interface ColumnWidths {
    title: number;
    type: number;
    offers: number;
    created: number;
    creator: number;
    numberOfLessons: number;
    estCreationTime: number;
    estCompletionTime: number;
}

// Recursive folder row component for nested display in list view
const FolderRow: React.FC<{
  folder: Folder;
  level: number;
  index: number;
  trashMode: boolean;
  columnVisibility: ColumnVisibility;
  columnWidths: ColumnWidths;
  expandedFolders: Set<number>;
  folderProjects: Record<number, Project[]>;
  lessonDataCache: Record<
    number,
    {
      lessonCount: number | string;
      totalHours: number | string;
      completionTime: number | string;
    }
  >;
  draggedFolder: Folder | null;
  draggedProject: Project | null;
  dragOverIndex: number | null;
  isDragging: boolean;
  isReordering: boolean;
  formatDate: (date: string) => string;
  formatCompletionTime: (minutes: number | string) => string;
  toggleFolder: (folderId: number) => void;
  handleDragStart: (
    e: React.DragEvent,
    item: Folder | Project,
    type: "folder" | "project"
  ) => void;
  handleDragOver: (e: React.DragEvent, index: number) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, index: number) => void;
  handleDragEnd: (e: React.DragEvent) => void;
  handleDeleteProject: (projectId: number, scope: "self" | "all") => void;
  handleRestoreProject: (projectId: number) => void;
  handleDeletePermanently: (projectId: number) => void;
  handleDeleteFolder: (folderId: number) => void;
  handleOffersClick: (client: Folder, event: React.MouseEvent) => void;
  allFolders: Folder[];
}> = ({
  folder,
  level,
  index,
  trashMode,
  columnVisibility,
  columnWidths,
  expandedFolders,
  folderProjects,
  lessonDataCache,
  draggedFolder,
  draggedProject,
  dragOverIndex,
  isDragging,
  isReordering,
  formatDate,
  formatCompletionTime,
  toggleFolder,
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleDragEnd,
  handleDeleteProject,
  handleRestoreProject,
  handleDeletePermanently,
  handleDeleteFolder,
  handleOffersClick,
  allFolders,
}) => {
  const { t } = useLanguage();

  const hasChildren = folder.children && folder.children.length > 0;
  const isExpanded = expandedFolders.has(folder.id);
  const folderProjectsList = folderProjects[folder.id] || [];

    return (
        <>
            {/* Folder row */}
            <tr 
                key={`folder-${folder.id}`}
                data-folder-id={folder.id}
                                  className={`hover:bg-gray-50 transition group ${
                     !getModalState() 
                          ? 'cursor-grab active:cursor-grabbing' 
                          : 'cursor-default'
                  } ${
                      dragOverIndex === index ? 'bg-blue-50 border-t-2 border-blue-300' : ''
                  } ${draggedFolder?.id === folder.id ? 'opacity-50' : ''}`}
                draggable={!trashMode && !getModalState()}
                onDragStart={(e) => {
                    if (getModalState()) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                    handleDragStart(e, folder, 'folder');
                }}
                onDragOver={(e) => {
                    if (getModalState()) {
                        e.preventDefault();
                        return;
                    }
                    handleDragOver(e, index);
                }}
                onDragLeave={(e) => {
                    if (getModalState()) {
                        e.preventDefault();
                        return;
                    }
                    handleDragLeave(e);
                }}
                onDrop={(e) => {
                    if (getModalState()) {
                        e.preventDefault();
                        return;
                    }
                    handleDrop(e, index);
                }}
                onDragEnd={(e) => {
                    if (getModalState()) {
                        e.preventDefault();
                        return;
                    }
                    handleDragEnd(e);
                }}
                onClick={() => toggleFolder(folder.id)}
            >
                {columnVisibility.title && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <span className="inline-flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
                            <div className="mr-3 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing group-hover:text-gray-600 transition-colors">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-60 group-hover:opacity-100">
                                    <circle cx="9" cy="5" r="2"/>
                                    <circle cx="9" cy="12" r="2"/>
                                    <circle cx="9" cy="19" r="2"/>
                                    <circle cx="15" cy="5" r="2"/>
                                    <circle cx="15" cy="12" r="2"/>
                                    <circle cx="15" cy="19" r="2"/>
                                </svg>
                            </div>
                            <button className="mr-2 text-blue-600 hover:text-blue-800 transition-transform duration-200">
                                <ChevronRight 
                                    size={16} 
                                    className={`transition-transform duration-200 ${
                                        isExpanded ? 'rotate-90' : ''
                                    }`}
                                />
                            </button>
                            <Folder size={16} style={{ color: getFolderTierColor(folder, allFolders) }} className="mr-2" />
                            <DynamicText 
                                text={folder.name}
                                columnWidthPercent={columnWidths.title}
                                className="font-semibold text-blue-700"
                                title={folder.name}
                            />
                            <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {getTotalItemsInFolder(folder, folderProjects)} {getTotalItemsInFolder(folder, folderProjects) === 1 ? t('interface.item', 'item') : t('interface.items', 'items')}
                            </span>
                        </span>
                    </td>
                )}
                {columnVisibility.type && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        -
                    </td>
                )}
                {columnVisibility.offers && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button
                                    onClick={(e) => handleOffersClick(folder, e)}
                                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                >
                                    {folder.offer_count || 0} {t("interface.offers", "Offers")}
                                </button>
                            </td>
                        )}
                        {columnVisibility.created && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(folder.created_at)}</td>
                        )}
                {columnVisibility.creator && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center">
                            <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                <span className="text-xs font-bold text-gray-700">Y</span>
                            </span>
                            You
                        </span>
                    </td>
                )}
                {columnVisibility.numberOfLessons && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(() => {
                            const totalLessons = getTotalLessonsInFolder(folder);
                            return totalLessons > 0 ? totalLessons : '-';
                        })()}
                    </td>
                )}
                {columnVisibility.estCreationTime && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(() => {
                            const totalHours = getTotalHoursInFolder(folder);
                            return totalHours > 0 ? `${totalHours}h` : '-';
                        })()}
                    </td>
                )}
                {columnVisibility.estCompletionTime && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(() => {
                            const totalCompletionTime = getTotalCompletionTimeInFolder(folder);
                            return totalCompletionTime > 0 ? formatCompletionTimeLocalized(totalCompletionTime) : '-';
                        })()}
                    </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative" onClick={e => e.stopPropagation()}>
                    <FolderRowMenu 
                        folder={folder} 
                        formatDate={formatDate} 
                        trashMode={trashMode}
                        onDeleteFolder={handleDeleteFolder}
                    />
                </td>
            </tr>
            
            {/* Expanded folder content - projects */}
            {isExpanded && folderProjectsList.length > 0 && (
                folderProjectsList.map((p: Project, projectIndex: number) => (
                    <tr 
                        key={`folder-project-${p.id}`} 
                                                  className={`hover:bg-gray-50 transition group bg-gray-50 ${
                             !getModalState() 
                                  ? 'cursor-grab active:cursor-grabbing' 
                                  : 'cursor-default'
                          } ${
                            dragOverIndex === projectIndex ? 'bg-blue-50 border-t-2 border-blue-300' : ''
                        } ${draggedProject?.id === p.id ? 'opacity-50' : ''}`}
                        draggable={!trashMode && !getModalState()}
                        onDragStart={(e) => {
                            if (getModalState()) {
                                e.preventDefault();
                                e.stopPropagation();
                                return;
                            }
                            handleDragStart(e, p, 'project');
                        }}
                        onDragOver={(e) => {
                            if (getModalState()) {
                                e.preventDefault();
                                return;
                            }
                            handleDragOver(e, projectIndex);
                        }}
                        onDragLeave={(e) => {
                            if (getModalState()) {
                                e.preventDefault();
                                return;
                            }
                            handleDragLeave(e);
                        }}
                        onDrop={(e) => {
                            if (getModalState()) {
                                e.preventDefault();
                                return;
                            }
                            handleDrop(e, projectIndex);
                        }}
                        onDragEnd={(e) => {
                            if (getModalState()) {
                                e.preventDefault();
                                return;
                            }
                            handleDragEnd(e);
                        }}
                    >
                        {columnVisibility.title && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                <span className="inline-flex items-center" style={{ paddingLeft: `${(level + 1) * 20}px` }}>
                                    <div className={`mr-3 text-gray-400 hover:text-gray-600 group-hover:text-gray-600 transition-colors ${
                                        getModalState() 
                                            ? 'cursor-grab active:cursor-grabbing' 
                                            : 'cursor-default opacity-30'
                                    }`}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-60 group-hover:opacity-100">
                                            <circle cx="9" cy="5" r="2"/>
                                            <circle cx="9" cy="12" r="2"/>
                                            <circle cx="9" cy="19" r="2"/>
                                            <circle cx="15" cy="5" r="2"/>
                                            <circle cx="15" cy="12" r="2"/>
                                            <circle cx="15" cy="19" r="2"/>
                                        </svg>
                                    </div>
                                    <div className="w-4 h-4 border-l-2 border-blue-200 mr-3"></div>
                                    <Star size={16} className="text-gray-300 mr-2" />
                                    <DynamicText 
                                        text={p.title}
                                        columnWidthPercent={columnWidths.title}
                                        href={trashMode ? '#' : `/projects/view/${p.id}`}
                                        title={p.title}
                                    />
                                </span>
                            </td>
                        )}
                        {columnVisibility.type && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    {getDesignMicroproductIcon(p.designMicroproductType || "")}
                                    <span>{getLocalizedTypeName(p.designMicroproductType || "", t)}</span>
                                </div>
                            </td>
                        )}
                        {columnVisibility.offers && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                -
                            </td>
                        )}
                        {columnVisibility.created && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(p.createdAt)}</td>
                        )}
                        {columnVisibility.creator && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className="inline-flex items-center">
                                    <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                        <span className="text-xs font-bold text-gray-700">Y</span>
                                    </span>
                                    You
                                </span>
                            </td>
                        )}
                        {columnVisibility.numberOfLessons && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {(() => {
                                    const lessonData = lessonDataCache[p.id];
                                    return lessonData ? lessonData.lessonCount : '-';
                                })()}
                            </td>
                        )}
                        {columnVisibility.estCreationTime && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {(() => {
                                    const lessonData = lessonDataCache[p.id];
                                    return lessonData && lessonData.totalHours ? `${lessonData.totalHours}h` : '-';
                                })()}
                            </td>
                        )}
                        {columnVisibility.estCompletionTime && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {(() => {
                                    const lessonData = lessonDataCache[p.id];
                                    return lessonData ? formatCompletionTimeLocalized(lessonData.completionTime) : '-';
                                })()}
                            </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative" onClick={e => e.stopPropagation()}>
                            <ProjectRowMenu 
                                project={p} 
                                formatDate={formatDate} 
                                trashMode={trashMode}
                                onDelete={handleDeleteProject}
                                onRestore={handleRestoreProject}
                                onDeletePermanently={handleDeletePermanently}
                                folderId={folder.id}
                            />
                        </td>
                    </tr>
                ))
            )}
            
            {/* Loading state for folder projects */}
            {isExpanded && folderProjectsList.length === 0 && !hasChildren && (
                <tr>
                    <td colSpan={Object.values(columnVisibility).filter(Boolean).length + 1} className="px-6 py-4 text-sm text-gray-500 text-center bg-gray-50" style={{ paddingLeft: `${(level + 1) * 20}px` }}>
                        Loading projects...
                    </td>
                </tr>
            )}
            
            {/* Recursively render child folders */}
            {isExpanded && hasChildren && folder.children!.map((childFolder, childIndex) => (
                <FolderRow
                    key={`child-folder-${childFolder.id}`}
                    folder={childFolder}
                    level={level + 1}
                    index={childIndex}
                    trashMode={trashMode}
                    columnVisibility={columnVisibility}
                    columnWidths={columnWidths}
                    expandedFolders={expandedFolders}
                    folderProjects={folderProjects}
                    lessonDataCache={lessonDataCache}
                    draggedFolder={draggedFolder}
                    draggedProject={draggedProject}
                    dragOverIndex={dragOverIndex}
                    isDragging={isDragging}
                    isReordering={isReordering}
                    formatDate={formatDate}
                    formatCompletionTime={formatCompletionTimeLocalized}
                    toggleFolder={toggleFolder}
                    handleDragStart={handleDragStart}
                    handleDragOver={handleDragOver}
                    handleDragLeave={handleDragLeave}
                    handleDrop={handleDrop}
                    handleDragEnd={handleDragEnd}
                    handleDeleteProject={handleDeleteProject}
                    handleRestoreProject={handleRestoreProject}
                    handleDeletePermanently={handleDeletePermanently}
                    handleDeleteFolder={handleDeleteFolder}
                    handleOffersClick={handleOffersClick}
                    allFolders={allFolders}
                />
            ))}
        </>
    );
};

// Client row component for displaying folders as "Clients" in list view
const ClientRow: React.FC<{
    folder: Folder;
    level: number;
    index: number;
    trashMode: boolean;
    columnVisibility: ColumnVisibility;
    columnWidths: ColumnWidths;
    expandedFolders: Set<number>;
    folderProjects: Record<number, Project[]>;
    lessonDataCache: Record<number, { lessonCount: number | string, totalHours: number | string, completionTime: number | string }>;
    draggedFolder: Folder | null;
    draggedProject: Project | null;
    dragOverIndex: number | null;
    isDragging: boolean;
    isReordering: boolean;
    formatDate: (date: string) => string;
    formatCompletionTime: (minutes: number | string) => string;
    toggleFolder: (folderId: number) => void;
    handleDragStart: (e: React.DragEvent, item: Folder | Project, type: 'folder' | 'project') => void;
    handleDragOver: (e: React.DragEvent, index: number) => void;
    handleDragLeave: (e: React.DragEvent) => void;
    handleDrop: (e: React.DragEvent, index: number) => void;
    handleDragEnd: (e: React.DragEvent) => void;
    handleDeleteProject: (projectId: number, scope: 'self' | 'all') => void;
    handleRestoreProject: (projectId: number) => void;
    handleDeletePermanently: (projectId: number) => void;
    handleDeleteFolder: (folderId: number) => void;
    allFolders: Folder[];
    isOtherSection?: boolean;
    handleClientPdfDownload: (folderId: number, clientName: string, projects: Project[]) => void;
}> = ({ 
    folder, 
    level, 
    index, 
    trashMode, 
    columnVisibility, 
    columnWidths,
    expandedFolders, 
    folderProjects, 
    lessonDataCache,
    draggedFolder,
    draggedProject,
    dragOverIndex,
    isDragging,
    isReordering,
    formatDate, 
    formatCompletionTime,
    toggleFolder,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    handleDeleteProject,
    handleRestoreProject,
    handleDeletePermanently,
    handleDeleteFolder,
    allFolders,
    isOtherSection = false,
    handleClientPdfDownload
}) => {
    const { t } = useLanguage();

    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const folderProjectsList = folderProjects[folder.id] || [];

    return (
        <>
            {/* Client row */}
            <tr 
                key={`client-${folder.id}`}
                data-folder-id={folder.id}
                className={`hover:bg-gray-50 transition group ${
                    !getModalState() 
                        ? 'cursor-grab active:cursor-grabbing' 
                        : 'cursor-default'
                } ${
                    dragOverIndex === index ? 'bg-blue-50 border-t-2 border-blue-300' : ''
                } ${draggedFolder?.id === folder.id ? 'opacity-50' : ''}`}
                draggable={!trashMode && !getModalState()}
                onDragStart={(e) => {
                    if (getModalState()) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                    handleDragStart(e, folder, 'folder');
                }}
                onDragOver={(e) => {
                    if (getModalState()) {
                        e.preventDefault();
                        return;
                    }
                    handleDragOver(e, index);
                }}
                onDragLeave={(e) => {
                    if (getModalState()) {
                        e.preventDefault();
                        return;
                    }
                    handleDragLeave(e);
                }}
                onDrop={(e) => {
                    if (getModalState()) {
                        e.preventDefault();
                        return;
                    }
                    handleDrop(e, index);
                }}
                onDragEnd={(e) => {
                    if (getModalState()) {
                        e.preventDefault();
                        return;
                    }
                    handleDragEnd(e);
                }}
                onClick={() => toggleFolder(folder.id)}
            >
                {columnVisibility.title && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <span className="inline-flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
                            <div className="mr-3 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing group-hover:text-gray-600 transition-colors">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-60 group-hover:opacity-100">
                                    <circle cx="9" cy="5" r="2"/>
                                    <circle cx="9" cy="12" r="2"/>
                                    <circle cx="9" cy="19" r="2"/>
                                    <circle cx="15" cy="5" r="2"/>
                                    <circle cx="15" cy="12" r="2"/>
                                    <circle cx="15" cy="19" r="2"/>
                                </svg>
                            </div>
                            <button className="mr-2 text-blue-600 hover:text-blue-800 transition-transform duration-200">
                                <ChevronRight 
                                    size={16} 
                                    className={`transition-transform duration-200 ${
                                        isExpanded ? 'rotate-90' : ''
                                    }`}
                                />
                            </button>
                            <Users size={16} className="mr-2 text-blue-600" />
                            <DynamicText 
                                text={isOtherSection ? t('interface.other', 'Other') : folder.name}
                                columnWidthPercent={columnWidths.title}
                                className="font-semibold text-blue-700"
                                title={isOtherSection ? t('interface.other', 'Other') : folder.name}
                            />
                            <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {getTotalItemsInFolder(folder, folderProjects)} {getTotalItemsInFolder(folder, folderProjects) === 1 ? t('interface.item', 'item') : t('interface.items', 'items')}
                            </span>
                        </span>
                    </td>
                )}
                {columnVisibility.created && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isOtherSection ? '-' : formatDate(folder.created_at)}
                    </td>
                )}
                {columnVisibility.creator && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center">
                            <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                <span className="text-xs font-bold text-gray-700">Y</span>
                            </span>
                            You
                        </span>
                    </td>
                )}
                {columnVisibility.numberOfLessons && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(() => {
                            const totalLessons = getTotalLessonsInFolder(folder);
                            return totalLessons > 0 ? totalLessons : '-';
                        })()}
                    </td>
                )}
                {columnVisibility.estCreationTime && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(() => {
                            const totalHours = getTotalHoursInFolder(folder);
                            return totalHours > 0 ? `${totalHours}h` : '-';
                        })()}
                    </td>
                )}
                {columnVisibility.estCompletionTime && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(() => {
                            const totalCompletionTime = getTotalCompletionTimeInFolder(folder);
                            return totalCompletionTime > 0 ? formatCompletionTimeLocalized(totalCompletionTime) : '-';
                        })()}
                    </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative" onClick={e => e.stopPropagation()}>
                    <FolderRowMenu 
                        folder={folder} 
                        formatDate={formatDate} 
                        trashMode={trashMode}
                        onDeleteFolder={handleDeleteFolder}
                    />
                </td>
            </tr>
            
            {/* Expanded client content - projects */}
            {isExpanded && folderProjectsList.length > 0 && (
                folderProjectsList.map((p: Project, projectIndex: number) => (
                    <tr 
                        key={`client-project-${p.id}`} 
                        className={`hover:bg-gray-50 transition group bg-gray-50 ${
                            !getModalState() 
                                ? 'cursor-grab active:cursor-grabbing' 
                                : 'cursor-default'
                        } ${
                            dragOverIndex === projectIndex ? 'bg-blue-50 border-t-2 border-blue-300' : ''
                        } ${draggedProject?.id === p.id ? 'opacity-50' : ''}`}
                        draggable={!trashMode && !getModalState()}
                        onDragStart={(e) => {
                            if (getModalState()) {
                                e.preventDefault();
                                e.stopPropagation();
                                return;
                            }
                            handleDragStart(e, p, 'project');
                        }}
                        onDragOver={(e) => {
                            if (getModalState()) {
                                e.preventDefault();
                                return;
                            }
                            handleDragOver(e, projectIndex);
                        }}
                        onDragLeave={(e) => {
                            if (getModalState()) {
                                e.preventDefault();
                                return;
                            }
                            handleDragLeave(e);
                        }}
                        onDrop={(e) => {
                            if (getModalState()) {
                                e.preventDefault();
                                return;
                            }
                            handleDrop(e, projectIndex);
                        }}
                        onDragEnd={(e) => {
                            if (getModalState()) {
                                e.preventDefault();
                                return;
                            }
                            handleDragEnd(e);
                        }}
                    >
                        {columnVisibility.title && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                <span className="inline-flex items-center" style={{ paddingLeft: `${(level + 1) * 20}px` }}>
                                    <div className={`mr-3 text-gray-400 hover:text-gray-600 group-hover:text-gray-600 transition-colors ${
                                        getModalState() 
                                            ? 'cursor-grab active:cursor-grabbing' 
                                            : 'cursor-default opacity-30'
                                    }`}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-60 group-hover:opacity-100">
                                            <circle cx="9" cy="5" r="2"/>
                                            <circle cx="9" cy="12" r="2"/>
                                            <circle cx="9" cy="19" r="2"/>
                                            <circle cx="15" cy="5" r="2"/>
                                            <circle cx="15" cy="12" r="2"/>
                                            <circle cx="15" cy="19" r="2"/>
                                        </svg>
                                    </div>
                                    <div className="w-4 h-4 border-l-2 border-green-200 mr-3"></div>
                                    <Star size={16} className="text-gray-300 mr-2" />
                                    <DynamicText 
                                        text={p.title}
                                        columnWidthPercent={columnWidths.title}
                                        href={trashMode ? '#' : `/projects/view/${p.id}`}
                                        title={p.title}
                                    />
                                </span>
                            </td>
                        )}
                        {columnVisibility.created && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(p.createdAt)}</td>
                        )}
                        {columnVisibility.creator && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className="inline-flex items-center">
                                    <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                        <span className="text-xs font-bold text-gray-700">Y</span>
                                    </span>
                                    You
                                </span>
                            </td>
                        )}
                        {columnVisibility.numberOfLessons && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {(() => {
                                    const lessonData = lessonDataCache[p.id];
                                    return lessonData ? lessonData.lessonCount : '-';
                                })()}
                            </td>
                        )}
                        {columnVisibility.estCreationTime && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {(() => {
                                    const lessonData = lessonDataCache[p.id];
                                    return lessonData && lessonData.totalHours ? `${lessonData.totalHours}h` : '-';
                                })()}
                            </td>
                        )}
                        {columnVisibility.estCompletionTime && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {(() => {
                                    const lessonData = lessonDataCache[p.id];
                                    return lessonData ? formatCompletionTimeLocalized(lessonData.completionTime) : '-';
                                })()}
                            </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative" onClick={e => e.stopPropagation()}>
                            <ProjectRowMenu 
                                project={p} 
                                formatDate={formatDate} 
                                trashMode={trashMode}
                                onDelete={handleDeleteProject}
                                onRestore={handleRestoreProject}
                                onDeletePermanently={handleDeletePermanently}
                                folderId={folder.id}
                            />
                        </td>
                    </tr>
                ))
            )}
            
            {/* Loading state for client projects */}
            {isExpanded && folderProjectsList.length === 0 && !hasChildren && (
                <tr>
                    <td colSpan={Object.values(columnVisibility).filter(Boolean).length + 2} className="px-6 py-4 text-sm text-gray-500 text-center bg-gray-50" style={{ paddingLeft: `${(level + 1) * 20}px` }}>
                        Loading projects...
                    </td>
                </tr>
            )}
            
            {/* Recursively render child folders */}
            {isExpanded && hasChildren && folder.children!.map((childFolder, childIndex) => (
                <ClientRow
                    key={`child-client-${childFolder.id}`}
                    folder={childFolder}
                    level={level + 1}
                    index={childIndex}
                    trashMode={trashMode}
                    columnVisibility={columnVisibility}
                    columnWidths={columnWidths}
                    expandedFolders={expandedFolders}
                    folderProjects={folderProjects}
                    lessonDataCache={lessonDataCache}
                    draggedFolder={draggedFolder}
                    draggedProject={draggedProject}
                    dragOverIndex={dragOverIndex}
                    isDragging={isDragging}
                    isReordering={isReordering}
                    formatDate={formatDate}
                    formatCompletionTime={formatCompletionTimeLocalized}
                    toggleFolder={toggleFolder}
                    handleDragStart={handleDragStart}
                    handleDragOver={handleDragOver}
                    handleDragLeave={handleDragLeave}
                    handleDrop={handleDrop}
                    handleDragEnd={handleDragEnd}
                    handleDeleteProject={handleDeleteProject}
                    handleRestoreProject={handleRestoreProject}
                    handleDeletePermanently={handleDeletePermanently}
                    handleDeleteFolder={handleDeleteFolder}
                    allFolders={allFolders}
                    handleClientPdfDownload={handleClientPdfDownload}
                />
            ))}
        </>
    );
};

const ProjectCard: React.FC<{
  project: Project;
  onDelete: (id: number, scope: "self" | "all") => void;
  onRestore: (id: number) => void;
  onDeletePermanently: (id: number) => void;
  isTrashMode: boolean;
  folderId?: number | null;
}> = ({
  project,
  onDelete,
  onRestore,
  onDeletePermanently,
  isTrashMode,
  folderId,
}) => {
  const { t, language } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [permanentDeleteConfirmOpen, setPermanentDeleteConfirmOpen] =
    useState(false);
  const [trashConfirmOpen, setTrashConfirmOpen] = useState(false);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(
    project.designMicroproductType
      ? project.title
      : project.instanceName || project.title
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
    //console.log("Duplicating project", project.id);
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

  return (
    <div
      ref={cardRef}
      className={`bg-white rounded-xl shadow-sm group transition-all duration-200 hover:shadow-lg border border-gray-200 relative ${
        !getModalState()
          ? "cursor-grab active:cursor-grabbing"
          : "cursor-default"
      }`}
      draggable={!isTrashMode && !getModalState()}
      onDragStart={(e) => {
        if (getModalState()) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        handleDragStart(e);
      }}
      onDragEnd={(e) => {
        if (getModalState()) {
          e.preventDefault();
          return;
        }
        handleDragEnd(e);
      }}
    >
      <Link
        href={isTrashMode ? "#" : `/projects/view/${project.id}`}
        onClick={handleCardClick}
        className="block"
      >
        <div
          className="relative h-40 rounded-t-lg"
          style={{
            backgroundColor: bgColor,
            backgroundImage: `linear-gradient(45deg, ${bgColor}99, ${stringToColor(
              project.title.split("").reverse().join("")
            )}99)`,
          }}
        >
          {project.designMicroproductType && (
            <div
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                background: "#fff",
                borderRadius: "6px",
                padding: "4px",
                zIndex: 2,
                backdropFilter: "blur(2px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {getDesignMicroproductIcon(project.designMicroproductType)}
            </div>
          )}
          {project.isGamma ? (
            <div className="p-4 text-white flex flex-col justify-between h-full">
              <div>
                <div className="text-xs font-semibold">GAMMA</div>
                <h3 className="font-bold text-2xl mt-2">Tips and tricks ⚡️</h3>
              </div>
              <p className="text-xs">
                Ready to learn how to take your gammas to the next level?
              </p>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-white">
              <h3
                className="font-bold text-lg text-center truncate max-w-full"
                title={displayTitle}
              >
                {displayTitle}
              </h3>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3
            className="font-semibold text-gray-800 mb-2 truncate text-sm max-w-full"
            title={displayTitle}
          >
            {displayTitle}
          </h3>
          <div className="flex items-center text-xs text-gray-500 mb-3">
            {project.isPrivate && (
              <div className="flex items-center gap-1.5 bg-gray-100 rounded-md px-2 py-0.5">
                <Lock size={12} />
                <span className="text-gray-700">
                  {t("interface.private", "Private")}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: avatarColor }}
              >
                {project.createdBy.slice(0, 1).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {t("interface.createdByYou", "Created by you")}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(project.createdAt)}
                </span>
              </div>
            </div>
            <div className="w-7 h-7" />
          </div>
        </div>
      </Link>
      <div className="absolute bottom-4 right-3" ref={menuRef}>
        <button
          ref={buttonRef}
          onClick={handleMenuToggle}
          className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <MoreHorizontal size={16} />
        </button>
        {menuOpen && (
          <div
            data-modal-portal="true"
            className={`fixed w-60 bg-white rounded-lg shadow-2xl z-[9999] border border-gray-100 p-1 ${
              menuPosition === "above" ? "bottom-auto mb-2" : "top-auto mt-2"
            }`}
            style={{
              left: buttonRef.current
                ? buttonRef.current.getBoundingClientRect().right - 240
                : 0,
              top: buttonRef.current
                ? menuPosition === "above"
                  ? buttonRef.current.getBoundingClientRect().top - 320
                  : buttonRef.current.getBoundingClientRect().bottom + 8
                : 0,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="font-semibold text-sm text-gray-900 truncate">
                {project.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {t("actions.created", "Created {date}").replace(
                  "{date}",
                  formatDate(project.createdAt)
                )}
              </p>
            </div>
            {isTrashMode ? (
              <div className="py-1">
                <button
                  onClick={handleRestoreProject}
                  className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>{t("actions.restore", "Restore")}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setMenuOpen(false);
                    setPermanentDeleteConfirmOpen(true);
                  }}
                  className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>
                    {t("actions.deletePermanently", "Delete permanently")}
                  </span>
                </button>
              </div>
            ) : (
              <>
                <div className="py-1">
                  <button className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                    <Share2 size={16} className="text-gray-500" />
                    <span>{t("actions.share", "Share...")}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setMenuOpen(false);
                      setRenameModalOpen(true);
                    }}
                    className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                  >
                    <PenLine size={16} className="text-gray-500" />
                    <span>{t("actions.rename", "Rename...")}</span>
                  </button>
                  <button className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                    <Star size={16} className="text-gray-500" />
                    <span>
                      {t("actions.addToFavorites", "Add to favorites")}
                    </span>
                  </button>
                  <button
                    onClick={handleDuplicateProject}
                    className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                  >
                    <Copy size={16} className="text-gray-500" />
                    <span>{t("actions.duplicate", "Duplicate")}</span>
                  </button>
                  <button className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                    <LinkIcon size={16} className="text-gray-500" />
                    <span>{t("actions.copyLink", "Copy link")}</span>
                  </button>
                  {isOutline && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setMenuOpen(false);
                        setShowSettingsModal(true);
                      }}
                      className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                    >
                      <Settings size={16} className="text-gray-500" />
                      <span>{t("actions.settings", "Settings")}</span>
                    </button>
                  )}
                  {folderId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setMenuOpen(false);
                        handleRemoveFromFolder();
                      }}
                      className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-md cursor-pointer"
                    >
                      <FolderMinus size={16} className="text-orange-500" />
                      <span>
                        {t("actions.removeFromFolder", "Remove from Folder")}
                      </span>
                    </button>
                  )}
                </div>
                <div className="py-1 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setMenuOpen(false);
                      handleTrashRequest(e);
                    }}
                    className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>{t("actions.sendToTrash", "Send to trash")}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {permanentDeleteConfirmOpen && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-40"
          onClick={() => setPermanentDeleteConfirmOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-semibold text-lg mb-2 text-gray-900">
              {t("actions.areYouSure", "Are you sure?")}
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              {t(
                "actions.actionPermanent",
                "This action is permanent and cannot be undone. The project will be deleted forever."
              )}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setPermanentDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 cursor-pointer"
              >
                {t("actions.cancel", "Cancel")}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDeletePermanently(project.id);
                  setPermanentDeleteConfirmOpen(false);
                }}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 cursor-pointer"
              >
                {t("actions.deletePermanentlyButton", "Delete Permanently")}
              </button>
            </div>
          </div>
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
              <button
                onClick={() => setTrashConfirmOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 cursor-pointer"
              >
                {t("actions.cancel", "Cancel")}
              </button>
              <button
                onClick={() => {
                  onDelete(project.id, "self");
                  setTrashConfirmOpen(false);
                }}
                className="px-4 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
              >
                {t("actions.outlineOnly", "Outline Only")}
              </button>
              <button
                onClick={() => {
                  onDelete(project.id, "all");
                  setTrashConfirmOpen(false);
                }}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 cursor-pointer"
              >
                {t("actions.moveAll", "Move All")}
              </button>
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
              <button
                onClick={() => {
                  onRestore(project.id);
                  setShowRestorePrompt(false);
                }}
                className="font-semibold underline hover:text-orange-700 cursor-pointer"
              >
                {t("actions.restoreIt", "Restore it")}
              </button>
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
              <label
                htmlFor="newName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("actions.newName", "New Name:")}
              </label>
              <input
                id="newName"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            <div className="flex justify-start gap-3">
              <button
                onClick={() => {
                  if (!isRenaming) setRenameModalOpen(false);
                }}
                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 cursor-pointer"
                disabled={isRenaming}
              >
                {t("actions.cancel", "Cancel")}
              </button>
              <button
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
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                disabled={isRenaming || !newName.trim()}
              >
                {isRenaming
                  ? t("actions.saving", "Saving...")
                  : t("actions.rename", "Rename")}
              </button>
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
          onTierChange={(tier) => {
            console.log("Project tier changed to:", tier);
          }}
        />
      )}
    </div>
  );
};

const ProjectRowMenu: React.FC<{
  project: Project;
  formatDate: (date: string) => string;
  trashMode: boolean;
  onDelete: (id: number, scope: "self" | "all") => void;
  onRestore: (id: number) => void;
  onDeletePermanently: (id: number) => void;
  folderId?: number | null;
}> = ({
  project,
  formatDate,
  trashMode,
  onDelete,
  onRestore,
  onDeletePermanently,
  folderId,
}) => {
  const { t, language } = useLanguage();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [renameModalOpen, setRenameModalOpen] = React.useState(false);
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [newName, setNewName] = React.useState(project.title);
  const [permanentDeleteConfirmOpen, setPermanentDeleteConfirmOpen] =
    React.useState(false);
  const [trashConfirmOpen, setTrashConfirmOpen] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState<"above" | "below">(
    "below"
  );
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const isOutline =
    (project.designMicroproductType || "").toLowerCase() === "training plan";

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

  React.useEffect(() => {
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

  return (
    <div ref={menuRef} className="inline-block">
      <button
        ref={buttonRef}
        className="text-gray-400 hover:text-gray-600 cursor-pointer"
        onClick={handleMenuToggle}
      >
        <MoreHorizontal size={20} />
      </button>
      {menuOpen &&
        createPortal(
          <div
            data-modal-portal="true"
            className={`fixed w-60 bg-white rounded-lg shadow-2xl z-[9999] border border-gray-100 p-1 ${
              menuPosition === "above" ? "bottom-auto mb-2" : "top-auto mt-2"
            }`}
            style={{
              left: buttonRef.current
                ? buttonRef.current.getBoundingClientRect().right - 240
                : 0,
              top: buttonRef.current
                ? menuPosition === "above"
                  ? buttonRef.current.getBoundingClientRect().top - 320
                  : buttonRef.current.getBoundingClientRect().bottom + 8
                : 0,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="font-semibold text-sm text-gray-900 truncate">
                {project.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Created {formatDate(project.createdAt)}
              </p>
            </div>
            {trashMode ? (
              <div className="py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setMenuOpen(false);
                    onRestore(project.id);
                  }}
                  className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>Restore</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setMenuOpen(false);
                    setPermanentDeleteConfirmOpen(true);
                  }}
                  className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Delete permanently</span>
                </button>
              </div>
            ) : (
              <>
                <div className="py-1">
                  <button className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                    <Share2 size={16} className="text-gray-500" />
                    <span>{t("actions.share", "Share...")}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setMenuOpen(false);
                      setRenameModalOpen(true);
                    }}
                    className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                  >
                    <PenLine size={16} className="text-gray-500" />
                    <span>{t("actions.rename", "Rename...")}</span>
                  </button>
                  <button className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                    <Star size={16} className="text-gray-500" />
                    <span>
                      {t("actions.addToFavorites", "Add to favorites")}
                    </span>
                  </button>
                  <button
                    onClick={handleDuplicateProject}
                    className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                  >
                    <Copy size={16} className="text-gray-500" />
                    <span>{t("actions.duplicate", "Duplicate")}</span>
                  </button>
                  <button className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                    <LinkIcon size={16} className="text-gray-500" />
                    <span>{t("actions.copyLink", "Copy link")}</span>
                  </button>
                  {isOutline && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setMenuOpen(false);
                        setShowSettingsModal(true);
                      }}
                      className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                    >
                      <Settings size={16} className="text-gray-500" />
                      <span>{t("actions.settings", "Settings")}</span>
                    </button>
                  )}
                  {folderId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setMenuOpen(false);
                        handleRemoveFromFolder();
                      }}
                      className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-md cursor-pointer"
                    >
                      <FolderMinus size={16} className="text-orange-500" />
                      <span>
                        {t("actions.removeFromFolder", "Remove from Folder")}
                      </span>
                    </button>
                  )}
                </div>
                <div className="py-1 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setMenuOpen(false);
                      handleTrashRequest(e);
                    }}
                    className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>{t("actions.sendToTrash", "Send to trash")}</span>
                  </button>
                </div>
              </>
            )}
          </div>,
          document.body
        )}
      {/* Permanent Delete Modal */}
      {permanentDeleteConfirmOpen && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-40"
          onClick={() => setPermanentDeleteConfirmOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-semibold text-lg mb-2 text-gray-900">
              Are you sure?
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              This action is permanent and cannot be undone. The project will be
              deleted forever.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setPermanentDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 cursor-pointer"
              >
                {t("actions.cancel", "Cancel")}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDeletePermanently(project.id);
                  setPermanentDeleteConfirmOpen(false);
                }}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 cursor-pointer"
              >
                {t("actions.deletePermanentlyButton", "Delete Permanently")}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Trash Confirm Modal */}
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
              <button
                onClick={() => setTrashConfirmOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 cursor-pointer"
              >
                {t("actions.cancel", "Cancel")}
              </button>
              <button
                onClick={() => {
                  onDelete(project.id, "self");
                  setTrashConfirmOpen(false);
                }}
                className="px-4 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
              >
                {t("actions.outlineOnly", "Outline Only")}
              </button>
              <button
                onClick={() => {
                  onDelete(project.id, "all");
                  setTrashConfirmOpen(false);
                }}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 cursor-pointer"
              >
                {t("actions.moveAll", "Move All")}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Rename Modal */}
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
            <h4 className="font-semibold text-lg mb-4 text-gray-900">Rename</h4>
            <div className="mb-6">
              <label
                htmlFor="newName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Name:
              </label>
              <input
                id="newName"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  if (!isRenaming) setRenameModalOpen(false);
                }}
                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 cursor-pointer"
                disabled={isRenaming}
              >
                Cancel
              </button>
              <button
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
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                disabled={isRenaming || !newName.trim()}
              >
                {isRenaming
                  ? t("actions.saving", "Saving...")
                  : t("actions.rename", "Rename")}
              </button>
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
          onTierChange={(tier) => {
            console.log("Project tier changed to:", tier);
          }}
        />
      )}
    </div>
  );
};

const FolderRowMenu: React.FC<{
  folder: Folder;
  formatDate: (date: string) => string;
  trashMode: boolean;
  onDeleteFolder: (folderId: number) => void;
}> = ({ folder, formatDate, trashMode, onDeleteFolder }) => {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [renameModalOpen, setRenameModalOpen] = React.useState(false);
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [newName, setNewName] = React.useState(folder.name);
  const [menuPosition, setMenuPosition] = React.useState<"above" | "below">(
    "below"
  );
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const handleMenuToggle = () => {
    if (!menuOpen && buttonRef.current) {
      // Calculate if there's enough space below
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const menuHeight = 200; // Approximate menu height

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

  React.useEffect(() => {
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

  const handleDeleteFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuOpen(false);
    if (typeof window !== "undefined") (window as any).__modalOpen = false;
    onDeleteFolder(folder.id);
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuOpen(false);
    if (typeof window !== "undefined") (window as any).__modalOpen = false;
    setNewName(folder.name);
    setRenameModalOpen(true);
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuOpen(false);
    if (typeof window !== "undefined") (window as any).__modalOpen = false;
    setShowSettingsModal(true);
  };

  const handleExportFolder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuOpen(false);
    if (typeof window !== "undefined") (window as any).__modalOpen = false;

    // Show loading modal
    setIsExporting(true);

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
        `${CUSTOM_BACKEND_URL}/pdf/folder/${folder.id}`,
        {
          method: "GET",
          headers,
          credentials: "same-origin",
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Handle authentication error
          console.error("Authentication error during export");
          return;
        }
        throw new Error(`Export failed: ${response.status}`);
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${folder.name}_export_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting folder:", error);
      // You could show a toast notification here
    } finally {
      // Hide loading modal
      setIsExporting(false);
    }
  };

  return (
    <>
      <div ref={menuRef} className="inline-block">
        <button
          ref={buttonRef}
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
          onClick={handleMenuToggle}
        >
          <MoreHorizontal size={20} />
        </button>
        {menuOpen &&
          createPortal(
            <div
              data-modal-portal="true"
              className={`fixed w-60 bg-white rounded-lg shadow-2xl z-[9999] border border-gray-100 p-1 ${
                menuPosition === "above" ? "bottom-auto mb-2" : "top-auto mt-2"
              }`}
              style={{
                left: buttonRef.current
                  ? buttonRef.current.getBoundingClientRect().right - 240
                  : 0,
                top: buttonRef.current
                  ? menuPosition === "above"
                    ? buttonRef.current.getBoundingClientRect().top - 220
                    : buttonRef.current.getBoundingClientRect().bottom + 8
                  : 0,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="font-semibold text-sm text-gray-900 truncate">
                  {folder.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t("actions.created", "Created")}{" "}
                  {formatDate(folder.created_at)}
                </p>
              </div>
              <div className="py-1">
                <button className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                  <Share2 size={16} className="text-gray-500" />
                  <span>{t("actions.share", "Share")}</span>
                </button>
                <button
                  onClick={handleRenameClick}
                  className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                >
                  <PenLine size={16} className="text-gray-500" />
                  <span>{t("actions.rename", "Rename")}</span>
                </button>
                <button
                  onClick={handleSettingsClick}
                  className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                >
                  <Settings size={16} className="text-gray-500" />
                  <span>{t("actions.settings", "Settings")}</span>
                </button>
                <button
                  onClick={handleExportFolder}
                  className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                >
                  <Download size={16} className="text-gray-500" />
                  <span>{t("actions.exportAsFile", "Export as file")}</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    if (typeof window !== "undefined") (window as any).__modalOpen = false;
                    // Dispatch event to open create offer modal
                    window.dispatchEvent(new CustomEvent('openCreateOfferModal', {
                      detail: { folder }
                    }));
                  }}
                  className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                >
                  <FileText size={16} className="text-gray-500" />
                  <span>{t("interface.createOffer", "Create Offer")}</span>
                </button>
              </div>
              <div className="py-1 border-t border-gray-100">
                <button
                  onClick={handleDeleteFolder}
                  className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>{t("actions.delete", "Delete")}</span>
                </button>
              </div>
            </div>,
            document.body
          )}
      </div>

      {/* ---------------- Rename Modal ---------------- */}
      {renameModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-black/20 p-4"
          onClick={() => {
            if (!isRenaming) setRenameModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-semibold text-lg mb-4 text-gray-900">
              {t("actions.renameFolder", "Rename Folder")}
            </h4>

            <div className="mb-6">
              <label
                htmlFor="newFolderName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("actions.newName", "New Name:")}
              </label>
              <input
                id="newFolderName"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            <div className="flex justify-start gap-3">
              <button
                onClick={() => {
                  if (!isRenaming) setRenameModalOpen(false);
                }}
                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 cursor-pointer"
                disabled={isRenaming}
              >
                {t("actions.cancel", "Cancel")}
              </button>
              <button
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

                    const response = await fetch(
                      `${CUSTOM_BACKEND_URL}/projects/folders/${folder.id}`,
                      {
                        method: "PATCH",
                        headers,
                        credentials: "same-origin",
                        body: JSON.stringify({ name: newName }),
                      }
                    );

                    if (!response.ok) {
                      if (response.status === 401 || response.status === 403) {
                        // Handle authentication error - redirect to main app login
                        const protocol = window.location.protocol;
                        const host = window.location.host;
                        const currentUrl =
                          window.location.pathname + window.location.search;
                        const mainAppUrl = `${protocol}//${host}/auth/login?next=${encodeURIComponent(
                          currentUrl
                        )}`;
                        window.location.href = mainAppUrl;
                        return;
                      }
                      const errorText = await response.text();
                      throw new Error(
                        `Failed to rename folder: ${response.status} ${errorText}`
                      );
                    }

                    setRenameModalOpen(false);
                    window.location.reload();
                  } catch (error) {
                    console.error(error);
                    alert((error as Error).message);
                  } finally {
                    setIsRenaming(false);
                  }
                }}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                disabled={isRenaming || !newName.trim()}
              >
                {isRenaming
                  ? t("actions.saving", "Saving...")
                  : t("actions.rename", "Rename")}
              </button>
            </div>
          </div>
        </div>
      )}

      <FolderSettingsModal
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        folderName={folder.name}
        folderId={folder.id}
        currentTier={folder.quality_tier || "medium"}
        onTierChange={(tier) => {
          console.log("Folder tier changed to:", tier);
        }}
      />

      {/* Loading Modal for Folder Export */}
      <FolderExportLoadingModal isOpen={isExporting} folderName={folder.name} />
    </>
  );
};

const ProjectsTable: React.FC<ProjectsTableProps> = ({
  trashMode = false,
  folderId = null,
}) => {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "created" | "lastViewed">(
    "lastViewed"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    if (typeof window === "undefined") return "grid";

    const saved = localStorage.getItem("projectsViewMode");
    if (saved === "grid" || saved === "list") {
      return saved;
    }
    return "grid";
  });
  const [selectedProjects, setSelectedProjects] = useState<Set<number>>(
    new Set()
  );
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(
    new Set()
  );
  const [folderProjects, setFolderProjects] = useState<
    Record<number, Project[]>
  >({});
  const [lessonDataCache, setLessonDataCache] = useState<
    Record<
      number,
      {
        lessonCount: number | string;
        totalHours: number | string;
        completionTime: number | string;
      }
    >
  >({});
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    title: true,
    type: true,
    offers: true,
    created: false,
    creator: false,
    numberOfLessons: true,
    estCreationTime: true,
    estCompletionTime: true,
  });
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({
    title: 40,
    type: 15,
    offers: 12,
    created: 15,
    creator: 15,
    numberOfLessons: 13,
    estCreationTime: 13.5,
    estCompletionTime: 13.5,
  });
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);

  // Drag and drop reordering state
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);
  const [draggedFolder, setDraggedFolder] = useState<Folder | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Client name modal state
  const [showClientNameModal, setShowClientNameModal] = useState(false);
  
  // Offers popup state
  const [showOffersPopup, setShowOffersPopup] = useState(false);
  const [selectedClientForOffers, setSelectedClientForOffers] = useState<Folder | null>(null);
  const [clientOffers, setClientOffers] = useState<any[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  // Column resizing functionality
  const handleColumnResize = (columnKey: string, newWidth: number) => {
    setColumnWidths((prev) => ({
      ...prev,
      [columnKey]: Math.max(10, Math.min(80, newWidth)), // Min 10%, Max 80%
    }));
  };

  const handleResizeStart = (e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    setResizingColumn(columnKey);

    const startX = e.clientX;
    const startWidth = columnWidths[columnKey as keyof ColumnWidths];

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const containerWidth =
        (e.target as Element).closest("table")?.clientWidth || 1000;
      const deltaPercent = (deltaX / containerWidth) * 100;
      const newWidth = startWidth + deltaPercent;
      handleColumnResize(columnKey, newWidth);
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Function to fetch offers for a client
  const fetchClientOffers = useCallback(async (clientId: number) => {
    setLoadingOffers(true);
    try {
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";
      const headers: HeadersInit = { "Content-Type": "application/json" };
      const devUserId = "dummy-onyx-user-id-for-testing";
      if (devUserId && process.env.NODE_ENV === "development") {
        headers["X-Dev-Onyx-User-ID"] = devUserId;
      }

      const response = await fetch(`${CUSTOM_BACKEND_URL}/offers?client_id=${clientId}`, {
        headers,
        cache: "no-store",
        credentials: "same-origin",
      });

      if (response.ok) {
        const data = await response.json();
        setClientOffers(data.offers || []);
      } else {
        console.error("Failed to fetch offers:", response.status);
        setClientOffers([]);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      setClientOffers([]);
    } finally {
      setLoadingOffers(false);
    }
  }, []);

  // Function to handle offers click
  const handleOffersClick = useCallback((client: Folder, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedClientForOffers(client);
    setShowOffersPopup(true);
    fetchClientOffers(client.id);
  }, [fetchClientOffers]);

  // Add a refresh function that can be called externally
  const refreshProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    const CUSTOM_BACKEND_URL =
      process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL ||
      "/api/custom-projects-backend";

    // Always fetch all projects to calculate folder counts, but filter display based on folderId
    let projectsApiUrl = `${CUSTOM_BACKEND_URL}${
      trashMode ? "/projects/trash" : "/projects"
    }`;

    // If viewing a specific folder, we'll still fetch all projects but filter display
    // This allows us to calculate folder counts for the sidebar

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      const devUserId = "dummy-onyx-user-id-for-testing";
      if (devUserId && process.env.NODE_ENV === "development") {
        headers["X-Dev-Onyx-User-ID"] = devUserId;
      }

      const [projectsResponse, foldersResponse] = await Promise.all([
        fetch(projectsApiUrl, {
          headers,
          cache: "no-store",
          credentials: "same-origin",
        }),
        !trashMode
          ? fetch(`${CUSTOM_BACKEND_URL}/projects/folders`, {
              headers,
              cache: "no-store",
              credentials: "same-origin",
            })
          : Promise.resolve(null),
      ]);

      if (!projectsResponse.ok) {
        if (
          projectsResponse.status === 401 ||
          projectsResponse.status === 403
        ) {
          redirectToMainAuth("/auth/login");
          return;
        }
        throw new Error(`Failed to fetch projects: ${projectsResponse.status}`);
      }

      const projectsData = await projectsResponse.json();
      const processedProjects = projectsData.map((p: any) => ({
        id: p.id,
        title: p.projectName || p.microproduct_name || "Untitled",
        imageUrl: p.imageUrl || "",
        lastViewed: p.lastViewed || "Never",
        createdAt: p.created_at,
        createdBy: p.createdBy || "You",
        isPrivate: p.isPrivate || true,
        designMicroproductType: p.design_microproduct_type,
        isGamma: p.isGamma || false,
        instanceName: p.microproduct_name,
        folderId: p.folder_id,
        order: p.order || 0,
        is_standalone: p.is_standalone,
        source_chat_session_id: p.source_chat_session_id,
      }));

      // Sort projects by order field
      const sortedProjects = processedProjects.sort(
        (a: Project, b: Project) => (a.order || 0) - (b.order || 0)
      );

      // ---- Filter lessons that belong to outlines from the main products page ----
      const deduplicateProjects = (projectsArr: Project[]): Project[] => {
        const outlineNames = new Set<string>();
        const filteredProjects: Project[] = [];
        const grouped: Record<
          string,
          { outline: Project | null; others: Project[] }
        > = {};

        // First pass: collect all outline names and group by title for legacy support
        projectsArr.forEach((proj) => {
          const isOutline =
            (proj.designMicroproductType || "").toLowerCase() ===
            "training plan";
          if (isOutline) {
            outlineNames.add(proj.title.trim());
          }

          // Legacy grouping logic - group projects by exact title match
          if (!grouped[proj.title]) {
            grouped[proj.title] = { outline: null, others: [] };
          }

          if (isOutline) {
            // Keep the first outline we encounter for this project title
            if (!grouped[proj.title].outline) {
              grouped[proj.title].outline = proj;
            }
          } else {
            grouped[proj.title].others.push(proj);
          }
        });

        // Second pass: filter projects using both legacy and new logic
        projectsArr.forEach((proj) => {
          const isOutline =
            (proj.designMicroproductType || "").toLowerCase() ===
            "training plan";
          if (isOutline) {
            // Always include outlines
            filteredProjects.push(proj);
          } else {
            const projectTitle = proj.title.trim();
            let belongsToOutline = false;

            // Method 2: New logic - check if this project follows the "Outline Name: Lesson Title" pattern
            if (!belongsToOutline && projectTitle.includes(": ")) {
              const outlinePart = projectTitle.split(": ")[0].trim();
              if (outlineNames.has(outlinePart)) {
                belongsToOutline = true;
              }
            }

            // Method 3: Content-specific patterns - check if this content belongs to an outline
            if (!belongsToOutline) {
              const contentType = (
                proj.designMicroproductType || ""
              ).toLowerCase();
              const isQuiz = contentType === "quiz";
              const isTextPresentation = contentType === "text presentation";
              const isVideoLesson = contentType === "video lesson";
              const isPdfLesson = contentType === "pdf lesson";

              // NEW: Check if product has explicit is_standalone field
              const hasStandaloneFlag =
                (proj as any).is_standalone !== undefined &&
                (proj as any).is_standalone !== null;

              // If product has explicit standalone flag, use it to determine visibility
              if (hasStandaloneFlag) {
                // For products with explicit standalone flag: show only if standalone=true
                if ((proj as any).is_standalone === false) {
                  belongsToOutline = true;
                  console.log(
                    `🔍 [FILTER] ${contentType} "${projectTitle}" filtered out (Explicit standalone=false)`
                  );
                }
              } else if (isQuiz) {
                // NEW: Only apply legacy filtering to quizzes - show all One-pagers (text presentations, PDF lessons) by default
                // This ensures all One-pagers are visible on the main products page
                // Pattern 1: "Content Type - Outline Name: Lesson Title" (e.g., "Quiz - Outline Name: Lesson Title") - Legacy pattern
                if (
                  projectTitle.includes(" - ") &&
                  projectTitle.includes(": ")
                ) {
                  const parts = projectTitle.split(" - ");
                  if (parts.length >= 2) {
                    const outlinePart = parts[1].split(": ")[0].trim();
                    if (outlineNames.has(outlinePart)) {
                      belongsToOutline = true;
                      console.log(
                        `🔍 [FILTER] ${contentType} "${projectTitle}" filtered out (Pattern 1: Legacy Content Type - Outline)`
                      );
                    }
                  }
                }
                // Pattern 2: "Outline Name: Lesson Title" (for any content type)
                else if (projectTitle.includes(": ")) {
                  const outlinePart = projectTitle.split(": ")[0].trim();
                  if (outlineNames.has(outlinePart)) {
                    belongsToOutline = true;
                    console.log(
                      `🔍 [FILTER] ${contentType} "${projectTitle}" filtered out (Pattern 2: Outline: Lesson)`
                    );
                  }
                }
                // Pattern 3: Legacy pattern - check if project name matches outline name
                else {
                  // Check if there's an outline with the same project name
                  const matchingOutline = projectsArr.find(
                    (p) =>
                      (p.designMicroproductType || "").toLowerCase() ===
                        "training plan" && p.title.trim() === proj.title.trim()
                  );
                  if (matchingOutline) {
                    belongsToOutline = true;
                    console.log(
                      `🔍 [FILTER] ${contentType} "${projectTitle}" filtered out (Pattern 3: Legacy match)`
                    );
                  }
                }

                // Pattern 6: Check if quiz and outline share the same chat session (indicating they were created together)
                if (!belongsToOutline) {
                  const quizChatSessionId = (proj as any)
                    .source_chat_session_id;
                  if (quizChatSessionId) {
                    const outlineWithSameChatSession = projectsArr.find(
                      (p) =>
                        (p.designMicroproductType || "").toLowerCase() ===
                          "training plan" &&
                        (p as any).source_chat_session_id === quizChatSessionId
                    );
                    if (outlineWithSameChatSession) {
                      belongsToOutline = true;
                      console.log(
                        `🔍 [FILTER] Quiz "${projectTitle}" filtered out (Pattern 6: Same chat session as outline "${outlineWithSameChatSession.title}")`
                      );
                    }
                  }
                }
              }
            }

            // Only include projects that don't belong to an outline (either legacy or new pattern)
            if (!belongsToOutline) {
              filteredProjects.push(proj);
              console.log(
                `✅ [FILTER] "${projectTitle}" (${proj.designMicroproductType}) included - standalone content`
              );
            } else {
              console.log(
                `❌ [FILTER] "${projectTitle}" (${proj.designMicroproductType}) excluded - belongs to outline`
              );
            }
          }
        });

        return filteredProjects;
      };

      const allProjects = deduplicateProjects(sortedProjects);
      setProjects(allProjects);

      // Calculate folder projects mapping for all folders
      const folderProjectsMap: Record<number, Project[]> = {};
      allProjects.forEach((project) => {
        if (project.folderId) {
          if (!folderProjectsMap[project.folderId]) {
            folderProjectsMap[project.folderId] = [];
          }
          folderProjectsMap[project.folderId].push(project);
        }
      });
      setFolderProjects(folderProjectsMap);

      // Fetch folders if not in trash mode
      let foldersData: any[] = [];
      if (!trashMode && foldersResponse) {
        if (foldersResponse.ok) {
          foldersData = await foldersResponse.json();
          setFolders(foldersData);
        } else if (
          foldersResponse.status === 401 ||
          foldersResponse.status === 403
        ) {
          redirectToMainAuth("/auth/login");
          return;
        }
      } else {
        setFolders([]);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  }, [trashMode, folderId, router]);

  // Fetch projects for a specific folder
  const fetchFolderProjects = useCallback(
    async (folderId: number) => {
      const CUSTOM_BACKEND_URL =
        process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL ||
        "/api/custom-projects-backend";
      const headers: HeadersInit = { "Content-Type": "application/json" };
      const devUserId = "dummy-onyx-user-id-for-testing";
      if (devUserId && process.env.NODE_ENV === "development") {
        headers["X-Dev-Onyx-User-ID"] = devUserId;
      }

      try {
        const response = await fetch(
          `${CUSTOM_BACKEND_URL}/projects?folder_id=${folderId}`,
          {
            headers,
            cache: "no-store",
            credentials: "same-origin",
          }
        );

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            redirectToMainAuth("/auth/login");
            return;
          }
          throw new Error(
            `Failed to fetch folder projects: ${response.status}`
          );
        }

        const projectsData = await response.json();
        const processedProjects = projectsData.map((p: any) => ({
          id: p.id,
          title: p.projectName || p.microproduct_name || "Untitled",
          imageUrl: p.imageUrl || "",
          lastViewed: p.lastViewed || "Never",
          createdAt: p.created_at,
          createdBy: p.createdBy || "You",
          isPrivate: p.isPrivate || true,
          designMicroproductType: p.design_microproduct_type,
          isGamma: p.isGamma || false,
          instanceName: p.microproduct_name,
          folderId: p.folder_id,
          order: p.order || 0,
          is_standalone: p.is_standalone,
          source_chat_session_id: p.source_chat_session_id,
        }));

        // Sort folder projects by order field
        const sortedProjects = processedProjects.sort(
          (a: Project, b: Project) => (a.order || 0) - (b.order || 0)
        );

        setFolderProjects((prev) => ({
          ...prev,
          [folderId]: sortedProjects,
        }));
      } catch (error) {
        console.error("Error fetching folder projects:", error);
      }
    },
    [router]
  );

  // Toggle folder expansion - ensure only one client can be expanded at a time
  const toggleFolder = useCallback(
    (folderId: number) => {
      setExpandedFolders((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(folderId)) {
          // If the folder is already expanded, collapse it
          newSet.delete(folderId);
        } else {
          // If expanding a new folder, clear all other expanded folders first
          newSet.clear();
          newSet.add(folderId);
          // Fetch projects for this folder if not already loaded
          if (!folderProjects[folderId]) {
            fetchFolderProjects(folderId);
          }
        }
        return newSet;
      });
    },
    [folderProjects, fetchFolderProjects]
  );

  // Helper function to get unassigned projects
  const getUnassignedProjects = useCallback(() => {
    return projects.filter((p) => p.folderId === null);
  }, [projects]);

  // Helper function to get projects for a specific folder (including subfolders)
  const getProjectsForFolder = useCallback(
    (targetFolderId: number | null) => {
      if (targetFolderId === null) {
        return projects;
      }

      // Get all projects that belong to this folder or any of its subfolders
      const getFolderAndSubfolderIds = (folderId: number): number[] => {
        const folder = folders.find((f) => f.id === folderId);
        if (!folder) return [folderId];

        const subfolderIds =
          folder.children?.flatMap((child) =>
            getFolderAndSubfolderIds(child.id)
          ) || [];
        return [folderId, ...subfolderIds];
      };

      const folderIds = getFolderAndSubfolderIds(targetFolderId);
      return projects.filter(
        (p) => p.folderId && folderIds.includes(p.folderId)
      );
    },
    [projects, folders]
  );

  // Helper function to calculate lesson data for a project
  const getLessonData = useCallback(
    async (project: Project) => {
      if (project.designMicroproductType !== "Training Plan") {
        return { lessonCount: "-", totalHours: "-", completionTime: "-" };
      }

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
          `${CUSTOM_BACKEND_URL}/projects/${project.id}/lesson-data`,
          {
            method: "GET",
            headers,
            credentials: "same-origin",
          }
        );

        if (response.ok) {
          const data = await response.json();
          return {
            lessonCount: data.lessonCount || 0,
            totalHours: data.totalHours || 0,
            completionTime: data.completionTime || 0,
          };
        } else if (response.status === 401 || response.status === 403) {
          router.push("/auth/login");
          return { lessonCount: "?", totalHours: "?", completionTime: "?" };
        } else {
          console.error("Failed to fetch lesson data:", response.status);
          return { lessonCount: "?", totalHours: "?", completionTime: "?" };
        }
      } catch (error) {
        console.error("Error fetching lesson data:", error);
        return { lessonCount: "?", totalHours: "?", completionTime: "?" };
      }
    },
    [router]
  );

  // Helper function to format completion time (legacy, kept for backward compatibility)
  const formatCompletionTime = (minutes: number | string): string => {
    return formatCompletionTimeLocalized(minutes);
  };

  // Load lesson data for all Training Plan projects on mount
  useEffect(() => {
    const loadLessonData = async () => {
      const trainingPlanProjects = projects.filter(
        (p) => p.designMicroproductType === "Training Plan"
      );
      const newCache: Record<
        number,
        {
          lessonCount: number | string;
          totalHours: number | string;
          completionTime: number | string;
        }
      > = {};

      for (const project of trainingPlanProjects) {
        try {
          const data = await getLessonData(project);
          newCache[project.id] = data;
        } catch (error) {
          console.error(
            `Error loading lesson data for project ${project.id}:`,
            error
          );
          newCache[project.id] = {
            lessonCount: "?",
            totalHours: "?",
            completionTime: "?",
          };
        }
      }

      setLessonDataCache(newCache);
    };

    if (projects.length > 0) {
      loadLessonData();
    }
  }, [projects, getLessonData]);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  useEffect(() => {
    const handleRefresh = () => {
      refreshProjects();
    };
    window.addEventListener("refreshProjects", handleRefresh);
    return () => window.removeEventListener("refreshProjects", handleRefresh);
  }, [refreshProjects]);

  // Handle clicking outside the columns dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-columns-dropdown]")) {
        setShowColumnsDropdown(false);
      }
    };

    if (showColumnsDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColumnsDropdown]);

  useEffect(() => {
    localStorage.setItem("projectsViewMode", viewMode);
  }, [viewMode]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return t("interface.today", "Today");
    if (diffDays === 2) return t("interface.yesterday", "Yesterday");
    if (diffDays <= 7)
      return t("interface.daysAgo", "{days} days ago").replace(
        "{days}",
        (diffDays - 1).toString()
      );
    if (diffDays <= 30)
      return t("interface.weeksAgo", "{weeks} weeks ago").replace(
        "{weeks}",
        Math.floor(diffDays / 7).toString()
      );
    if (diffDays <= 365)
      return t("interface.monthsAgo", "{months} months ago").replace(
        "{months}",
        Math.floor(diffDays / 30).toString()
      );

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

  const handleDeleteProject = async (
    projectId: number,
    scope: "self" | "all" = "self"
  ) => {
    const CUSTOM_BACKEND_URL =
      process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL ||
      "/api/custom-projects-backend";
    const deleteApiUrl = `${CUSTOM_BACKEND_URL}/projects/delete-multiple`;

    const originalProjects = [...projects];

    // Optimistically update UI
    setProjects((currentProjects) =>
      currentProjects.filter((p) => p.id !== projectId)
    );

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      const devUserId = "dummy-onyx-user-id-for-testing";
      if (devUserId && process.env.NODE_ENV === "development") {
        headers["X-Dev-Onyx-User-ID"] = devUserId;
      }
      const response = await fetch(deleteApiUrl, {
        method: "POST",
        headers,
        credentials: "same-origin",
        body: JSON.stringify({ project_ids: [projectId], scope: scope }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push("/auth/login");
          return;
        }
        // Revert if API call fails
        setProjects(originalProjects);
        const errorText = await response.text();
        throw new Error(
          `Failed to delete project: ${response.status} ${errorText}`
        );
      }
    } catch (error) {
      console.error(error);
      // Optionally show an error message to the user
      alert((error as Error).message);
      setProjects(originalProjects);
    } finally {
      window.location.reload();
    }
  };

  const handleRestoreProject = async (projectId: number) => {
    const CUSTOM_BACKEND_URL =
      process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL ||
      "/api/custom-projects-backend";
    const restoreApiUrl = `${CUSTOM_BACKEND_URL}/projects/restore-multiple`;

    const originalProjects = [...projects];
    setProjects((currentProjects) =>
      currentProjects.filter((p) => p.id !== projectId)
    );

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      const devUserId = "dummy-onyx-user-id-for-testing";
      if (devUserId && process.env.NODE_ENV === "development") {
        headers["X-Dev-Onyx-User-ID"] = devUserId;
      }
      const response = await fetch(restoreApiUrl, {
        method: "POST",
        headers,
        credentials: "same-origin",
        body: JSON.stringify({
          project_ids: [projectId],
          scope: projects
            .find((p) => p.id === projectId)
            ?.designMicroproductType?.toLowerCase()
            .includes("plan")
            ? "all"
            : "self",
        }),
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push("/auth/login");
          return;
        }
        setProjects(originalProjects);
        const errorText = await response.text();
        throw new Error(
          `Failed to restore project: ${response.status} ${errorText}`
        );
      }
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
      setProjects(originalProjects);
    } finally {
      window.location.reload();
    }
  };

  const handleDeletePermanently = async (projectId: number) => {
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
        `${CUSTOM_BACKEND_URL}/projects/delete-permanently/${projectId}`,
        {
          method: "DELETE",
          headers,
          credentials: "same-origin",
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push("/auth/login");
          return;
        }
        throw new Error(`Failed to delete project: ${response.status}`);
      }

      // Refresh the projects list
      refreshProjects();
    } catch (error) {
      console.error("Error deleting project permanently:", error);
    }
  };

  const handleDeleteFolder = async (folderId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this folder? This will also delete all projects inside it."
      )
    ) {
      return;
    }

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
        `${CUSTOM_BACKEND_URL}/projects/folders/${folderId}`,
        {
          method: "DELETE",
          headers,
          credentials: "same-origin",
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          redirectToMainAuth("/auth/login");
          return;
        }
        throw new Error(`Failed to delete folder: ${response.status}`);
      }

      // Refresh the projects list
      refreshProjects();

      // Reload the page to ensure all changes are visually applied
      setTimeout(() => {
        window.location.reload();
      }, 500); // Small delay to show success state
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert("Failed to delete folder");
    }
  };

  // Add event listener for drag-and-drop functionality
  useEffect(() => {
    const handleMoveProjectToFolder = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { projectId, folderId } = customEvent.detail;
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
          `${CUSTOM_BACKEND_URL}/projects/${projectId}/folder`,
          {
            method: "PUT",
            headers,
            credentials: "same-origin",
            body: JSON.stringify({ folder_id: folderId }),
          }
        );

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            router.push("/auth/login");
            return;
          }
          throw new Error(
            `Failed to move project to folder: ${response.status}`
          );
        }

        // Refresh the projects list
        refreshProjects();
      } catch (error) {
        console.error("Error moving project to folder:", error);
      }
    };

    window.addEventListener("moveProjectToFolder", handleMoveProjectToFolder);
    return () =>
      window.removeEventListener(
        "moveProjectToFolder",
        handleMoveProjectToFolder
      );
  }, [refreshProjects, router]);

  // Drag and drop reordering functions
  const handleDragStart = useCallback(
    (
      e: React.DragEvent,
      item: Project | Folder,
      type: "project" | "folder"
    ) => {
      // Check if any modal is open - prevent dragging completely
      const isModalOpen = getModalState();
      if (isModalOpen) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({
          id: item.id,
          type: type === "project" ? "project" : "reorder",
          itemType: type,
          projectId: type === "project" ? item.id : undefined,
        })
      );
      e.dataTransfer.effectAllowed = "move";
      if (type === "project") {
        setDraggedProject(item as Project);
      } else {
        setDraggedFolder(item as Folder);
      }
      setIsReordering(true);
      setIsDragging(true);

      // Add visual feedback to dragged element
      const target = e.currentTarget as HTMLElement;
      target.style.opacity = "0.5";
      target.style.transform = "rotate(2deg)";
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    // Check if any modal is open - prevent drag over
    const isModalOpen = getModalState();
    if (isModalOpen) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Check if any modal is open - prevent drag leave
    const isModalOpen = getModalState();
    if (isModalOpen) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    // Only clear if we're leaving the entire row
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      // Check if any modal is open - prevent drop
      const isModalOpen = getModalState();
      if (isModalOpen) {
        e.preventDefault();
        return;
      }

      e.preventDefault();

      try {
        const data = JSON.parse(e.dataTransfer.getData("application/json"));

        // Check if we're dropping a project
        if (data.type === "project" && data.projectId) {
          // Check if we're dropping on a folder row (move to folder)
          const targetElement = e.currentTarget as HTMLElement;
          const folderRow = targetElement.closest("tr");
          if (folderRow && folderRow.getAttribute("data-folder-id")) {
            const folderId = parseInt(
              folderRow.getAttribute("data-folder-id") || "0"
            );
            if (folderId > 0) {
              // Move project to folder
              window.dispatchEvent(
                new CustomEvent("moveProjectToFolder", {
                  detail: { projectId: data.projectId, folderId },
                })
              );

              // Reset drag state
              setDraggedProject(null);
              setDraggedFolder(null);
              setDragOverIndex(null);
              setIsReordering(false);
              setIsDragging(false);

              // Reset visual feedback
              const target = e.currentTarget as HTMLElement;
              target.style.opacity = "1";
              target.style.transform = "rotate(0deg)";
              return;
            }
          }

          // If not dropping on a folder, handle as project reordering
          if (!draggedProject) return;

          // Get the current list of projects to reorder
          let currentProjects: Project[];
          let updateFunction: (newProjects: Project[]) => void;

          if (folderId !== null) {
            // Reordering within a specific folder
            currentProjects = [...projects];
            updateFunction = setProjects;
          } else {
            // Check if we're reordering within an expanded folder
            const expandedFolderId = Array.from(expandedFolders).find(
              (folderId) =>
                folderProjects[folderId]?.some(
                  (p) => p.id === draggedProject.id
                )
            );

            if (expandedFolderId) {
              // Reordering within an expanded folder
              currentProjects = [...(folderProjects[expandedFolderId] || [])];
              updateFunction = (newProjects: Project[]) => {
                setFolderProjects((prev) => ({
                  ...prev,
                  [expandedFolderId]: newProjects,
                }));
              };
            } else {
              // Reordering unassigned projects
              currentProjects = getUnassignedProjects();
              updateFunction = (newProjects: Project[]) => {
                const assignedProjects = projects.filter(
                  (p) => p.folderId !== null
                );
                setProjects([...newProjects, ...assignedProjects]);
              };
            }
          }

          // Find the current index of the dragged project
          const currentIndex = currentProjects.findIndex(
            (p) => p.id === draggedProject.id
          );
          if (currentIndex === -1) return;

          // Don't reorder if dropping on itself
          if (currentIndex === dropIndex) return;

          // Create new array with reordered projects
          const newProjects = [...currentProjects];
          const [movedProject] = newProjects.splice(currentIndex, 1);
          newProjects.splice(dropIndex, 0, movedProject);

          // Update the appropriate state
          updateFunction(newProjects);

          // Save the new order to the backend
          const saveOrderToBackend = async () => {
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

              // Update orders for all projects in the new order
              const orderUpdates = newProjects.map((project, index) => ({
                projectId: project.id,
                order: index,
              }));

              const response = await fetch(
                `${CUSTOM_BACKEND_URL}/projects/update-order`,
                {
                  method: "PUT",
                  headers,
                  body: JSON.stringify({ orders: orderUpdates }),
                }
              );

              if (!response.ok) {
                console.error("Failed to save project order:", response.status);
              }
            } catch (error) {
              console.error("Error saving project order:", error);
            }
          };

          // Call the backend asynchronously
          saveOrderToBackend();
        }

        // Handle folder reordering
        if (data.type === "reorder" && data.itemType === "folder") {
          if (!draggedFolder) return;

          const currentFolders = [...folders];
          const currentIndex = currentFolders.findIndex(
            (f) => f.id === draggedFolder.id
          );
          if (currentIndex === -1) return;

          // Don't reorder if dropping on itself
          if (currentIndex === dropIndex) return;

          // Create new array with reordered folders
          const newFolders = [...currentFolders];
          const [movedFolder] = newFolders.splice(currentIndex, 1);
          newFolders.splice(dropIndex, 0, movedFolder);

          // Update folders state
          setFolders(newFolders);

          // Save the new order to the backend
          const saveFolderOrderToBackend = async () => {
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

              // Update orders for all folders in the new order
              const orderUpdates = newFolders.map((folder, index) => ({
                folderId: folder.id,
                order: index,
              }));

              const response = await fetch(
                `${CUSTOM_BACKEND_URL}/projects/folders/update-order`,
                {
                  method: "PUT",
                  headers,
                  body: JSON.stringify({ orders: orderUpdates }),
                }
              );

              if (!response.ok) {
                console.error("Failed to save folder order:", response.status);
              }
            } catch (error) {
              console.error("Error saving folder order:", error);
            }
          };

          // Call the backend asynchronously
          saveFolderOrderToBackend();
        }
      } catch (error) {
        console.error("Error handling drop:", error);
      }

      // Reset drag state
      setDraggedProject(null);
      setDraggedFolder(null);
      setDragOverIndex(null);
      setIsReordering(false);
      setIsDragging(false);

      // Reset visual feedback
      const target = e.currentTarget as HTMLElement;
      target.style.opacity = "1";
      target.style.transform = "rotate(0deg)";
    },
    [
      draggedProject,
      draggedFolder,
      folderId,
      projects,
      expandedFolders,
      folderProjects,
      getUnassignedProjects,
      folders,
    ]
  );

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    // Reset drag state
    setDraggedProject(null);
    setDraggedFolder(null);
    setDragOverIndex(null);
    setIsReordering(false);
    setIsDragging(false);

    // Reset visual feedback
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "1";
    target.style.transform = "rotate(0deg)";
  }, []);

  const filters = [
    t("interface.all", "All"),
    t("interface.recentlyViewed", "Recently viewed"),
    t("interface.createdByYou", "Created by you"),
    t("interface.favorites", "Favorites"),
  ];
  const filterIcons: Record<string, LucideIcon> = {
    [t("interface.all", "All")]: Home,
    [t("interface.recentlyViewed", "Recently viewed")]: Clock,
    [t("interface.createdByYou", "Created by you")]: User,
    [t("interface.favorites", "Favorites")]: Star,
  };

    // Add PDF download function
    const handlePdfDownload = () => {
        setShowClientNameModal(true);
    };

    // Handle client-specific PDF download
    const handleClientPdfDownload = (folderId: number, clientName: string, projects: Project[]) => {
        const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        
        // Add folder_id
        queryParams.append('folder_id', folderId.toString());
        
        // Add column visibility settings
        queryParams.append('column_visibility', JSON.stringify(columnVisibility));
        
        // Add column widths settings
        queryParams.append('column_widths', JSON.stringify(columnWidths));
        
        // Add client name
        queryParams.append('client_name', clientName);
        
        // Add project IDs for this client
        const projectIds = projects.map(p => p.id);
        queryParams.append('selected_projects', JSON.stringify(projectIds));
        
        // Build the PDF URL
        let pdfUrl = `${CUSTOM_BACKEND_URL}/pdf/projects-list`;
        if (queryParams.toString()) {
            pdfUrl += `?${queryParams.toString()}`;
        }
        
        // Open PDF in new tab
        window.open(pdfUrl, '_blank');
    };

  // Handle client name confirmation
  const handleClientNameConfirm = (
    clientName: string | null,
    selectedFolders: number[],
    selectedProjects: number[]
  ) => {
    setShowClientNameModal(false);

    const CUSTOM_BACKEND_URL =
      process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL ||
      "/api/custom-projects-backend";

    // Build query parameters
    const queryParams = new URLSearchParams();

    // Add folder_id if viewing a specific folder
    if (folderId !== null) {
      queryParams.append("folder_id", folderId.toString());
    }

    // Add column visibility settings
    queryParams.append("column_visibility", JSON.stringify(columnVisibility));

    // Add column widths settings
    queryParams.append("column_widths", JSON.stringify(columnWidths));

    // Add client name if provided
    if (clientName) {
      queryParams.append("client_name", clientName);
    }

    // Add selected folders and projects if any are selected
    if (selectedFolders.length > 0) {
      queryParams.append("selected_folders", JSON.stringify(selectedFolders));
    }

    if (selectedProjects.length > 0) {
      queryParams.append("selected_projects", JSON.stringify(selectedProjects));
    }

    // Build the PDF URL
    let pdfUrl = `${CUSTOM_BACKEND_URL}/pdf/projects-list`;
    if (queryParams.toString()) {
      pdfUrl += `?${queryParams.toString()}`;
    }

    // Open PDF in new tab
    window.open(pdfUrl, "_blank");
  };

  // Add these just before the render block
  const visibleProjects =
    viewMode === "list"
      ? getProjectsForFolder(folderId).filter(
          (p) => (p.designMicroproductType || "").toLowerCase() !== "quiz"
        )
      : getProjectsForFolder(folderId);

  const visibleUnassignedProjects =
    viewMode === "list"
      ? getUnassignedProjects().filter(
          (p) => (p.designMicroproductType || "").toLowerCase() !== "quiz"
        )
      : getUnassignedProjects();

  const filteredFolderProjects =
    viewMode === "list"
      ? Object.fromEntries(
          Object.entries(folderProjects).map(([fid, projs]) => [
            fid,
            projs.filter(
              (p) => (p.designMicroproductType || "").toLowerCase() !== "quiz"
            ),
          ])
        )
      : folderProjects;

  if (loading) {
    return <div className="text-center p-8">Loading projects...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      {!trashMode && (
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Link href={folderId ? `/create?folderId=${folderId}` : "/create"}>
              <button className="flex items-center gap-2 pl-4 pr-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#002864] via-[#003EA8] to-[#63A2FF] hover:opacity-90 active:scale-95 transition-shadow shadow-lg cursor-pointer">
                <Plus size={16} className="text-white" />
                {t("interface.createNew", "Create new")}
                <span className="ml-1.5 rounded-full bg-[#D7E7FF] text-[#003EA8] px-1.5 py-0.5 text-[10px] leading-none font-bold tracking-wide">
                  AI
                </span>
              </button>
            </Link>
            <button className="flex items-center gap-2 pl-4 pr-4 py-2 rounded-full text-sm font-semibold text-gray-800 bg-white border border-gray-300 hover:bg-gray-50 active:scale-95 transition-shadow shadow-sm cursor-pointer">
              {t("interface.import", "Import")}
              <ChevronsUpDown size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {!trashMode && (
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            {filters.map((filter) => {
              const Icon = filterIcons[filter];
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                    activeFilter === filter
                      ? "bg-white shadow-sm border border-gray-200 text-black"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={16} />
                  {filter}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-sm font-semibold text-black hover:text-gray-700 cursor-pointer">
              <ArrowUpDown size={16} className="text-gray-800" />
              {t("interface.sort", "Sort")}
            </button>

            {/* Columns Dropdown - only show in list view */}
            {viewMode === "list" && (
              <div className="relative" data-columns-dropdown>
                <button
                  onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
                  className="flex items-center gap-2 text-sm font-semibold text-black hover:text-gray-700 cursor-pointer"
                >
                  <List size={16} className="text-gray-800" />
                  {t("interface.columns", "Columns")}
                  <ChevronDown size={14} className="text-gray-600" />
                </button>

                {showColumnsDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-2">
                      <div className="text-xs font-semibold text-gray-700 mb-2 px-2">
                        {t("interface.showColumns", "Show columns")}
                      </div>
                      {[
                        { key: "title", label: t("interface.title", "Title") },
                        {
                          key: "type",
                          label: t("interface.type", "Type"),
                        },
                        {
                          key: "offers",
                          label: t("interface.offers", "Offers"),
                        },
                        {
                          key: "created",
                          label: t("interface.created", "Created"),
                        },
                        {
                          key: "creator",
                          label: t("interface.creator", "Creator"),
                        },
                        {
                          key: "numberOfLessons",
                          label: t(
                            "interface.numberOfLessonsShort",
                            "Number of lessons"
                          ),
                        },
                        {
                          key: "estCreationTime",
                          label: t(
                            "interface.estCreationTimeShort",
                            "Est. creation time"
                          ),
                        },
                        {
                          key: "estCompletionTime",
                          label: t(
                            "interface.estCompletionTimeShort",
                            "Est. completion time"
                          ),
                        },
                      ].map((column) => (
                        <label
                          key={column.key}
                          className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          {columnVisibility[
                            column.key as keyof ColumnVisibility
                          ] ? (
                            <CheckSquare size={16} className="text-blue-600" />
                          ) : (
                            <Square size={16} className="text-gray-400" />
                          )}
                          <span className="text-sm text-gray-700">
                            {column.label}
                          </span>
                          <input
                            type="checkbox"
                            checked={
                              columnVisibility[
                                column.key as keyof ColumnVisibility
                              ]
                            }
                            onChange={(e) => {
                              setColumnVisibility((prev) => ({
                                ...prev,
                                [column.key]: e.target.checked,
                              }));
                            }}
                            className="sr-only"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Add Client Button - only show in list view */}
            {viewMode === "list" && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openFolderModal'))}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
                title={t(
                  "interface.addClient",
                  "Add Client"
                )}
              >
                <Plus size={16} />
                {t("interface.addClient", "Add Client")}
              </button>
            )}

            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md cursor-pointer ${
                  viewMode === "grid" ? "bg-white shadow-sm" : ""
                }`}
              >
                <LayoutGrid size={16} className="text-gray-800" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md cursor-pointer ${
                  viewMode === "list" ? "bg-white shadow-sm" : ""
                }`}
              >
                <List size={16} className="text-gray-800" />
              </button>
            </div>
          </div>
        </div>
      )}

            {projects.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {getProjectsForFolder(folderId).map((p: Project) => (
                            <ProjectCard
                                key={p.id}
                                project={p}
                                onDelete={handleDeleteProject}
                                onRestore={handleRestoreProject}
                                onDeletePermanently={handleDeletePermanently}
                                isTrashMode={trashMode}
                                folderId={folderId}
                            />
                        ))}
                    </div>
                ) : (
                    // List view (table/row style)
                    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto ${isReordering ? 'ring-2 ring-blue-200' : ''}`}>
                        <style jsx>{`
                            .cursor-col-resize {
                                cursor: col-resize !important;
                            }
                            .cursor-col-resize:hover {
                                background-color: #3b82f6 !important;
                            }
                            .resizing {
                                user-select: none;
                            }
                        `}</style>
                        <table className={`min-w-full divide-y divide-gray-200 ${resizingColumn ? 'resizing' : ''}`}>
                            <thead className="bg-gray-50">
                                <tr>
                                    {columnVisibility.title && (
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider relative"
                                            style={{ width: `${columnWidths.title}%` }}
                                        >
                                            {t('interface.title', 'Title')}
                                            <div 
                                                className="absolute right-0 top-2 bottom-2 w-0.5 cursor-col-resize bg-gray-200 hover:bg-blue-400 hover:w-1 rounded-full transition-all duration-200"
                                                onMouseDown={(e) => handleResizeStart(e, 'title')}
                                            />
                                        </th>
                                    )}
                                    {columnVisibility.type && (
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider relative"
                                            style={{ width: `${columnWidths.type}%` }}
                                        >
                                            {t('interface.type', 'Type')}
                                            <div 
                                                className="absolute right-0 top-2 bottom-2 w-0.5 cursor-col-resize bg-gray-200 hover:bg-blue-400 hover:w-1 rounded-full transition-all duration-200"
                                                onMouseDown={(e) => handleResizeStart(e, 'type')}
                                            />
                                        </th>
                                    )}
                                    {columnVisibility.offers && (
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider relative"
                                            style={{ width: `${columnWidths.offers}%` }}
                                        >
                                            {t('interface.offers', 'Offers')}
                                            <div 
                                                className="absolute right-0 top-2 bottom-2 w-0.5 cursor-col-resize bg-gray-200 hover:bg-blue-400 hover:w-1 rounded-full transition-all duration-200"
                                                onMouseDown={(e) => handleResizeStart(e, 'offers')}
                                            />
                                        </th>
                                    )}
                                    {columnVisibility.created && (
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider relative"
                                            style={{ width: `${columnWidths.created}%` }}
                                        >
                                            {t('interface.created', 'Created')}
                                            <div 
                                                className="absolute right-0 top-2 bottom-2 w-0.5 cursor-col-resize bg-gray-200 hover:bg-blue-400 hover:w-1 rounded-full transition-all duration-200"
                                                onMouseDown={(e) => handleResizeStart(e, 'created')}
                                            />
                                        </th>
                                    )}
                                    {columnVisibility.creator && (
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider relative"
                                            style={{ width: `${columnWidths.creator}%` }}
                                        >
                                            {t('interface.creator', 'Creator')}
                                            <div 
                                                className="absolute right-0 top-2 bottom-2 w-0.5 cursor-col-resize bg-gray-200 hover:bg-blue-400 hover:w-1 rounded-full transition-all duration-200"
                                                onMouseDown={(e) => handleResizeStart(e, 'creator')}
                                            />
                                        </th>
                                    )}
                                    {columnVisibility.numberOfLessons && (
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider relative"
                                            style={{ width: `${columnWidths.numberOfLessons}%` }}
                                        >
                                            {t('interface.numberOfLessons', 'Number of Lessons')}
                                            <div 
                                                className="absolute right-0 top-2 bottom-2 w-0.5 cursor-col-resize bg-gray-200 hover:bg-blue-400 hover:w-1 rounded-full transition-all duration-200"
                                                onMouseDown={(e) => handleResizeStart(e, 'numberOfLessons')}
                                            />
                                        </th>
                                    )}
                                    {columnVisibility.estCreationTime && (
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider relative"
                                            style={{ width: `${columnWidths.estCreationTime}%` }}
                                        >
                                            {t('interface.estCreationTime', 'Est. Creation Time')}
                                            <div 
                                                className="absolute right-0 top-2 bottom-2 w-0.5 cursor-col-resize bg-gray-200 hover:bg-blue-400 hover:w-1 rounded-full transition-all duration-200"
                                                onMouseDown={(e) => handleResizeStart(e, 'estCreationTime')}
                                            />
                                        </th>
                                    )}
                                    {columnVisibility.estCompletionTime && (
                                        <th 
                                            className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider relative"
                                            style={{ width: `${columnWidths.estCompletionTime}%` }}
                                        >
                                            {t('interface.estCompletionTime', 'Est. Completion Time')}
                                            <div 
                                                className="absolute right-0 top-2 bottom-2 w-0.5 cursor-col-resize bg-gray-200 hover:bg-blue-400 hover:w-1 rounded-full transition-all duration-200"
                                                onMouseDown={(e) => handleResizeStart(e, 'estCompletionTime')}
                                            />
                                        </th>
                                    )}
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50" style={{ width: '80px' }}>&nbsp;</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {/* Show folders as "Clients" when not viewing a specific folder */}
                                {!trashMode && folderId === null && buildFolderTree(folders).map((folder, folderIndex) => (
                                                                    <ClientRow
                                    key={`client-${folder.id}`}
                                        folder={folder}
                                        level={0}
                                        index={folderIndex}
                                        trashMode={trashMode}
                                        columnVisibility={columnVisibility}
                                        columnWidths={columnWidths}
                                        expandedFolders={expandedFolders}
                                        folderProjects={filteredFolderProjects}
                                        lessonDataCache={lessonDataCache}
                                        draggedFolder={draggedFolder}
                                        draggedProject={draggedProject}
                                        dragOverIndex={dragOverIndex}
                                        isDragging={isDragging}
                                        isReordering={isReordering}
                                        formatDate={formatDate}
                                        formatCompletionTime={formatCompletionTimeLocalized}
                                        toggleFolder={toggleFolder}
                                        handleDragStart={handleDragStart}
                                        handleDragOver={handleDragOver}
                                        handleDragLeave={handleDragLeave}
                                        handleDrop={handleDrop}
                                        handleDragEnd={handleDragEnd}
                                        handleDeleteProject={handleDeleteProject}
                                        handleRestoreProject={handleRestoreProject}
                                        handleDeletePermanently={handleDeletePermanently}
                                        handleDeleteFolder={handleDeleteFolder}
                                        allFolders={folders}
                                    handleClientPdfDownload={handleClientPdfDownload}
                                    />
                                ))}
                                
                                {/* Show "Other" section for unassigned projects when not viewing a specific folder */}
                                {!trashMode && folderId === null && visibleUnassignedProjects.length > 0 && (
                                    <ClientRow
                                        key="client-other"
                                        folder={{ 
                                            id: -1, 
                                            name: t('interface.other', 'Other'), 
                                            created_at: "", 
                                            project_count: visibleUnassignedProjects.length,
                                            order: 0,
                                            total_lessons: 0,
                                            total_hours: 0,
                                            total_completion_time: 0,
                                            children: [] 
                                        }}
                                        level={0}
                                        index={buildFolderTree(folders).length}
                                                trashMode={trashMode}
                                        columnVisibility={columnVisibility}
                                        columnWidths={columnWidths}
                                        expandedFolders={expandedFolders}
                                        folderProjects={{ [-1]: visibleUnassignedProjects }}
                                        lessonDataCache={lessonDataCache}
                                        draggedFolder={draggedFolder}
                                        draggedProject={draggedProject}
                                        dragOverIndex={dragOverIndex}
                                        isDragging={isDragging}
                                        isReordering={isReordering}
                                        formatDate={formatDate}
                                        formatCompletionTime={formatCompletionTimeLocalized}
                                        toggleFolder={toggleFolder}
                                        handleDragStart={handleDragStart}
                                        handleDragOver={handleDragOver}
                                        handleDragLeave={handleDragLeave}
                                        handleDrop={handleDrop}
                                        handleDragEnd={handleDragEnd}
                                        handleDeleteProject={handleDeleteProject}
                                        handleRestoreProject={handleRestoreProject}
                                        handleDeletePermanently={handleDeletePermanently}
                                        handleDeleteFolder={handleDeleteFolder}
                                        allFolders={folders}
                                        isOtherSection={true}
                                        handleClientPdfDownload={handleClientPdfDownload}
                                    />
                                )}
                                

                                
                                {/* Show projects for specific folder or all projects in trash mode */}
                                {(trashMode || folderId !== null) && visibleProjects.map((p: Project, index: number) => (
                                    <tr 
                                        key={p.id} 
                                        className={`hover:bg-gray-50 transition group ${
                                            !getModalState() 
                                                ? 'cursor-grab active:cursor-grabbing' 
                                                : 'cursor-default'
                                        } ${
                                            dragOverIndex === index ? 'bg-blue-50 border-t-2 border-blue-300' : ''
                                        } ${draggedProject?.id === p.id ? 'opacity-50' : ''}`}
                                        draggable={!trashMode && !getModalState()}
                                        onDragStart={(e) => {
                                            if (getModalState()) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                return;
                                            }
                                            handleDragStart(e, p, 'project');
                                        }}
                                        onDragOver={(e) => {
                                            if (getModalState()) {
                                                e.preventDefault();
                                                return;
                                            }
                                            handleDragOver(e, index);
                                        }}
                                        onDragLeave={(e) => {
                                            if (getModalState()) {
                                                e.preventDefault();
                                                return;
                                            }
                                            handleDragLeave(e);
                                        }}
                                        onDrop={(e) => {
                                            if (getModalState()) {
                                                e.preventDefault();
                                                return;
                                            }
                                            handleDrop(e, index);
                                        }}
                                        onDragEnd={(e) => {
                                            if (getModalState()) {
                                                e.preventDefault();
                                                return;
                                            }
                                            handleDragEnd(e);
                                        }}
                                    >
                                        {columnVisibility.title && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <span className="inline-flex items-center">
                                                    <div className={`mr-3 text-gray-400 hover:text-gray-600 group-hover:text-gray-600 transition-colors ${
                                                        getModalState() 
                                                            ? 'cursor-grab active:cursor-grabbing' 
                                                            : 'cursor-default opacity-30'
                                                    }`}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-60 group-hover:opacity-100">
                                                            <circle cx="9" cy="5" r="2"/>
                                                            <circle cx="9" cy="12" r="2"/>
                                                            <circle cx="9" cy="19" r="2"/>
                                                            <circle cx="15" cy="5" r="2"/>
                                                            <circle cx="15" cy="12" r="2"/>
                                                            <circle cx="15" cy="19" r="2"/>
                                                        </svg>
                                                    </div>
                                                    <Star size={16} className="text-gray-300 mr-2" />
                                                    <DynamicText 
                                                        text={p.title}
                                                        columnWidthPercent={columnWidths.title}
                                                        href={trashMode ? '#' : `/projects/view/${p.id}`}
                                                        title={p.title}
                                                    />
                                                </span>
                                            </td>
                                        )}
                                        {columnVisibility.created && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(p.createdAt)}</td>
                                        )}
                                        {columnVisibility.creator && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className="inline-flex items-center">
                                                    <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                                        <span className="text-xs font-bold text-gray-700">Y</span>
                                                    </span>
                                                    You
                                                </span>
                                            </td>
                                        )}
                                        {columnVisibility.numberOfLessons && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {(() => {
                                                    const lessonData = lessonDataCache[p.id];
                                                    return lessonData ? lessonData.lessonCount : '-';
                                                })()}
                                            </td>
                                        )}
                                        {columnVisibility.estCreationTime && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {(() => {
                                                    const lessonData = lessonDataCache[p.id];
                                                    return lessonData && lessonData.totalHours ? `${lessonData.totalHours}h` : '-';
                                                })()}
                                            </td>
                                        )}
                                        {columnVisibility.estCompletionTime && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {(() => {
                                                    const lessonData = lessonDataCache[p.id];
                                                    return lessonData ? formatCompletionTimeLocalized(lessonData.completionTime) : '-';
                                                })()}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative" onClick={e => e.stopPropagation()}>
                                            <ProjectRowMenu 
                                                project={p} 
                                                formatDate={formatDate} 
                                                trashMode={trashMode}
                                                onDelete={handleDeleteProject}
                                                onRestore={handleRestoreProject}
                                                onDeletePermanently={handleDeletePermanently}
                                                folderId={folderId}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="text-center p-8 text-gray-500">{t('interface.noProjectsFound', 'No projects found.')}</div>
            )}
            
            {/* Client Name Modal */}
            <ClientNameModal
                isOpen={showClientNameModal}
                onClose={() => setShowClientNameModal(false)}
                onConfirm={handleClientNameConfirm}
                folders={folders}
                folderProjects={folderProjects}
                unassignedProjects={getProjectsForFolder(null).filter(p => !p.folderId)}
            />
            
            {/* Offers Popup */}
            <OffersPopup
                isOpen={showOffersPopup}
                onClose={() => setShowOffersPopup(false)}
                client={selectedClientForOffers}
                offers={clientOffers}
                loading={loadingOffers}
                onSelectOffer={(offer) => {
                    // TODO: Navigate to offer or show offer details
                    console.log('Selected offer:', offer);
                    setShowOffersPopup(false);
                }}
            />
        </div>
    );
}

// Offers Popup Component
const OffersPopup: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  client: Folder | null;
  offers: any[];
  loading: boolean;
  onSelectOffer: (offer: any) => void;
}> = ({ isOpen, onClose, client, offers, loading, onSelectOffer }) => {
  const { t } = useLanguage();

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {t("interface.offers", "Offers")} - {client.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t("interface.loading", "Loading offers...")}</p>
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">{t("interface.noOffers", "No offers found for this client.")}</p>
            </div>
          ) : (
            offers.map((offer) => (
              <button
                key={offer.id}
                onClick={() => onSelectOffer(offer)}
                className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{offer.title || `Offer #${offer.id}`}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {offer.status || "Draft"} • {offer.total_hours || 0}h
                    </p>
                  </div>
                  <div className="text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            {t("actions.close", "Close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectsTable;
