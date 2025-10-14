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
  Calendar
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
const getProductTypeDisplayName = (type: string): string => {
  switch (type) {
    case "Training Plan":
      return "Course";
    case "Slide Deck":
      return "Presentation";
    case "Text Presentation":
      return "One-pager";
    case "Video Lesson Presentation":
      return "Video";
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
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {t("actions.generatingPdf", "Generating PDF")}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-6"></div>
          <DialogDescription className="text-center mb-4">
            {t("actions.creatingPdfExport", "Creating PDF export for folder")}{" "}
            <span className="font-semibold text-blue-600">"{folderName}"</span>
          </DialogDescription>
          <p className="text-sm text-gray-500 text-center">
            {t(
              "modals.folderExport.description",
              "This may take a few moments depending on the number of files..."
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>,
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


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {t("interface.customizePDF", "Customize PDF")}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {t(
              "interface.customizePDFDescription",
              "Enter a client name and select which folders/products to include in the PDF."
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label
              htmlFor="client-name"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              {t("interface.clientNameOptional", "Client Name (optional)")}
            </Label>
            <Input
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
              className="border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 bg-white hover:border-gray-300"
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="block text-sm font-semibold text-gray-700">
                {t(
                  "interface.selectFoldersAndProducts",
                  "Select Folders & Products"
                )}
              </Label>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-blue-600 bg-blue-50">
                  {selectedProjects.size} {t("interface.selected", "selected")}
                </Badge>
                {(folders.length > 0 || unassignedProjects.length > 0) && (
                  <Label className="flex items-center justify-center gap-2 text-sm text-gray-800 hover:text-gray-900 cursor-pointer transition-colors">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                    />
                    <span className="text-xs font-medium">
                      {t("interface.selectAll", "Select all")}
                    </span>
                  </Label>
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
                      <Label className="flex items-center gap-3 py-2 px-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-all duration-200 group">
                        <Checkbox
                          checked={selectedFolders.has(folder.id)}
                          onCheckedChange={(checked) =>
                            handleFolderSelection(folder.id, checked as boolean)
                          }
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
                          <span className="text-sm font-medium text-gray-900 group-hover:text-black">
                            {folder.name}
                          </span>
                          <Badge variant="outline" className="ml-2 text-xs text-gray-700 bg-gray-100">
                            {getTotalItemsInFolder(folder, folderProjects)}{" "}
                            {getTotalItemsInFolder(folder, folderProjects) === 1
                              ? t("interface.item", "item")
                              : t("interface.items", "items")}
                          </Badge>
                        </div>
                      </Label>

                      {/* Projects in this folder */}
                      {folderProjects[folder.id] &&
                        folderProjects[folder.id].length > 0 && (
                          <div className="ml-8 mt-2 space-y-1">
                            {folderProjects[folder.id].map((project) => (
                              <Label
                                key={project.id}
                                className="flex items-center gap-3 py-1.5 px-3 hover:bg-gray-50 rounded-md cursor-pointer transition-all duration-200 group"
                              >
                                <Checkbox
                                  checked={selectedProjects.has(project.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
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
                                />
                                <span className="text-sm text-gray-800 group-hover:text-gray-900 flex-1">
                                  {project.title}
                                </span>
                              </Label>
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
                      <Label
                        key={project.id}
                        className="flex items-center gap-3 py-1.5 px-3 hover:bg-gray-50 rounded-md cursor-pointer transition-all duration-200 group"
                      >
                        <Checkbox
                          checked={selectedProjects.has(project.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
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
                        />
                        <span className="text-sm text-gray-800 group-hover:text-gray-900 flex-1">
                          {project.title}
                        </span>
                      </Label>
                    ))}
                  </div>
                </div>
              )}

              {folders.length === 0 && unassignedProjects.length === 0 && (
                <div className="text-sm text-gray-700 text-center py-8">
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
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="text-gray-600 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              type="submit"
              disabled={!hasAnySelection}
              className={hasAnySelection ? "rounded-full bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md cursor-pointer" : "bg-gray-300 rounded-full text-gray-500 cursor-not-allowed"}
            >
              {t("common.downloadPdf", "Download PDF")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
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
  /** If true – table displays only audit projects */
  auditMode?: boolean;
}

interface ColumnVisibility {
  title: boolean;
  created: boolean;
  creator: boolean;
  numberOfLessons: boolean;
  estCreationTime: boolean;
  estCompletionTime: boolean;
  type: boolean;
}

interface ColumnWidths {
  title: number;
  created: number;
  creator: number;
  numberOfLessons: number;
  estCreationTime: number;
  estCompletionTime: number;
  type: number;
}

// Recursive folder row component for nested display in list view
const FolderRow: React.FC<{
  folder: Folder;
  level: number;
  index: number;
  trashMode: boolean;
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
  allFolders: Folder[];
}> = ({
  folder,
  level,
  index,
  trashMode,
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
}) => {
  const { t } = useLanguage();
  const { isEnabled: courseTableEnabled } = useFeaturePermission('course_table');

  const hasChildren = folder.children && folder.children.length > 0;
  const isExpanded = expandedFolders.has(folder.id);
  const folderProjectsList = folderProjects[folder.id] || [];

  return (
    <>
      {/* Folder row */}
      <TableRow
        key={`folder-${folder.id}`}
        data-folder-id={folder.id}
        className={`hover:bg-gray-50 transition group ${
          !getModalState()
            ? "cursor-grab active:cursor-grabbing"
            : "cursor-default"
        } ${
          dragOverIndex === index ? "bg-blue-50 border-t-2 border-blue-300" : ""
        } ${draggedFolder?.id === folder.id ? "opacity-50" : ""}`}
        draggable={!trashMode && !getModalState()}
        onDragStart={(e) => {
          if (getModalState()) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          handleDragStart(e, folder, "folder");
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
          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            -
          </TableCell>
          <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            <span
              className="inline-flex items-center"
              style={{ paddingLeft: `${level * 20}px` }}
            >
              <Button 
                variant="ghost" 
                size="icon"
                className="mr-2 text-blue-600 hover:text-blue-800"
              >
                <ChevronRight
                  size={16}
                  className={`transition-transform duration-200 ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
              </Button>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ color: getFolderTierColor(folder, allFolders) }}
                className="mr-2"
              >
                <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
              </svg>
              <DynamicText
                text={folder.name}
                columnWidthPercent={columnWidths.title}
                className="font-semibold text-blue-700"
                title={folder.name}
              />
              <Badge variant="outline" className="ml-2 text-xs text-gray-700 bg-gray-100">
                {getTotalItemsInFolder(folder, folderProjects)}{" "}
                {getTotalItemsInFolder(folder, folderProjects) === 1
                  ? t("interface.item", "item")
                  : t("interface.items", "items")}
              </Badge>
            </span>
          </TableCell>
          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatDate(folder.created_at)}
          </TableCell>
          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            <span className="inline-flex items-center">
              <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                <span className="text-xs font-bold text-gray-700">Y</span>
              </span>
              You
            </span>
          </TableCell>
        <TableCell
          className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative"
          onClick={(e) => e.stopPropagation()}
        >
          <FolderRowMenu
            folder={folder}
            formatDate={formatDate}
            trashMode={trashMode}
            onDeleteFolder={handleDeleteFolder}
          />
        </TableCell>
      </TableRow>

      {/* Expanded folder content - projects */}
      {isExpanded &&
        folderProjectsList.length > 0 &&
        folderProjectsList.map((p: Project, projectIndex: number) => (
          <TableRow
            key={`folder-project-${p.id}`}
            className={`hover:bg-gray-50 transition group bg-gray-50 ${
              !getModalState()
                ? "cursor-grab active:cursor-grabbing"
                : "cursor-default"
            } ${
              dragOverIndex === projectIndex
                ? "bg-blue-50 border-t-2 border-blue-300"
                : ""
            } ${draggedProject?.id === p.id ? "opacity-50" : ""}`}
            draggable={!trashMode && !getModalState()}
            onDragStart={(e) => {
              if (getModalState()) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              handleDragStart(e, p, "project");
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
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {p.designMicroproductType ? (
                  <span className="text-gray-500 font-medium">
                    {getProductTypeDisplayName(p.designMicroproductType)}
                  </span>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <span
                  className="inline-flex items-center"
                  style={{ paddingLeft: `${(level + 1) * 20}px` }}
                >
                  <div className="w-4 h-4 border-l-2 border-blue-200 mr-3"></div>
                  {/* <Star size={16} className="text-gray-300 mr-2" /> */}
                  <DynamicText
                    text={p.title}
                    columnWidthPercent={columnWidths.title}
                    href={trashMode ? "#" : (
                      p.designMicroproductType === "Video" 
                        ? `/projects-2/view/${p.id}`
                        : (p.designMicroproductType === "Training Plan"
                          ? (courseTableEnabled ? `/projects/view/${p.id}` : `/projects/view-new-2/${p.id}`)
                          : `/projects/view/${p.id}`)
                    )}
                    title={p.title}
                  />
                </span>
              </TableCell>
            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {formatDate(p.createdAt)}
            </TableCell>
            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <span className="inline-flex items-center">
                <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                  <span className="text-xs font-bold text-gray-700">Y</span>
                </span>
                You
              </span>
            </TableCell>
            <TableCell
              className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative"
              onClick={(e) => e.stopPropagation()}
            >
              <ProjectRowMenu
                project={p}
                formatDate={formatDate}
                trashMode={trashMode}
                onDelete={handleDeleteProject}
                onRestore={handleRestoreProject}
                onDeletePermanently={handleDeletePermanently}
                folderId={folder.id}
              />
            </TableCell>
          </TableRow>
        ))}

      {/* Loading state for folder projects */}
      {isExpanded && folderProjectsList.length === 0 && !hasChildren && (
        <TableRow>
          <TableCell
            colSpan={4}
            className="px-6 py-4 text-sm text-gray-500 text-center bg-gray-50"
            style={{ paddingLeft: `${(level + 1) * 20}px` }}
          >
            Loading projects...
          </TableCell>
        </TableRow>
      )}

      {/* Recursively render child folders */}
      {isExpanded &&
        hasChildren &&
        folder.children!.map((childFolder, childIndex) => (
          <FolderRow
            key={`child-folder-${childFolder.id}`}
            folder={childFolder}
            level={level + 1}
            index={childIndex}
            trashMode={trashMode}
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
          />
        ))}
    </>
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
  const { isEnabled: qualityTierEnabled } = useFeaturePermission('col_quality_tier');
  const { isEnabled: courseTableEnabled } = useFeaturePermission('course_table');

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
      <Button
        ref={buttonRef}
        className="text-[#09090B] shadow-none border-none hover:text-gray-900 cursor-pointer"
        onClick={handleMenuToggle}
      >
        <MoreHorizontal strokeWidth={1.5} size={20} />
      </Button>
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
                  ? buttonRef.current.getBoundingClientRect().top - 200
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
                <Button
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
                </Button>
                <Button
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
                </Button>
              </div>
            ) : (
              <>
                <div className="py-1">
                  <Button className="flex items-center justify-start gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-none cursor-pointer border-0 shadow-none">
                    <Share2 size={16} className="text-gray-500" />
                    <span>{t("actions.share", "Share...")}</span>
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setMenuOpen(false);
                      setRenameModalOpen(true);
                    }}
                    className="flex items-center justify-start gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-none cursor-pointer border-0 shadow-none"
                  >
                    <PenLine size={16} className="text-gray-500" />
                    <span>{t("actions.rename", "Rename...")}</span>
                  </Button>
                  {/* <Button className="flex items-center justify-start gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-none cursor-pointer border-0 shadow-none">
                    <Star size={16} className="text-gray-500" />
                    <span>
                      {t("actions.addToFavorites", "Add to favorites")}
                    </span>
                  </Button> */}
                  <Button
                    onClick={handleDuplicateProject}
                    className="flex items-center justify-start gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-none cursor-pointer border-0 shadow-none"
                  >
                    <Copy size={16} className="text-gray-500" />
                    <span>{t("actions.duplicate", "Duplicate")}</span>
                  </Button>
                  {/* <Button className="flex items-center justify-start gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-none cursor-pointer border-0 shadow-none">
                    <LinkIcon size={16} className="text-gray-500" />
                    <span>{t("actions.copyLink", "Copy link")}</span>
                  </Button> */}
                  {isOutline && qualityTierEnabled && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setMenuOpen(false);
                        setShowSettingsModal(true);
                      }}
                      className="flex items-center justify-start gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-none cursor-pointer border-0 shadow-none"
                    >
                      <Settings size={16} className="text-gray-500" />
                      <span>{t("actions.settings", "Settings")}</span>
                    </Button>
                  )}
                  {folderId && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setMenuOpen(false);
                        handleRemoveFromFolder();
                      }}
                      className="flex items-center justify-start gap-2 w-full text-left px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-none cursor-pointer border-0 shadow-none"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-orange-500">
                        <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
                        <path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span>
                        {t("actions.removeFromFolder", "Remove from Folder")}
                      </span>
                    </Button>
                  )}
                </div>
                <div className="py-1">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setMenuOpen(false);
                      handleTrashRequest(e);
                    }}
                    className="flex items-center justify-start gap-2 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-none cursor-pointer border-0 shadow-none"
                  >
                    <Trash2 size={14} />
                    <span>{t("actions.sendToTrash", "Send to trash")}</span>
                  </Button>
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
              <Button
                onClick={() => setPermanentDeleteConfirmOpen(false)}
                variant="outline"
              >
                {t("actions.cancel", "Cancel")}
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDeletePermanently(project.id);
                  setPermanentDeleteConfirmOpen(false);
                }}
                variant="destructive"
              >
                {t("actions.deletePermanentlyButton", "Delete Permanently")}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Trash Confirm Modal */}
      {trashConfirmOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
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
                className="text-gray-600 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
              >
                {t("actions.cancel", "Cancel")}
              </Button>
              <Button
                onClick={() => {
                  onDelete(project.id, "self");
                  setTrashConfirmOpen(false);
                }}
                variant="outline"
                className="rounded-full bg-white hover:bg-gray-50"
              >
                {t("actions.outlineOnly", "Outline Only")}
              </Button>
              <Button
                onClick={() => {
                  onDelete(project.id, "all");
                  setTrashConfirmOpen(false);
                }}
                variant="download"
                className="rounded-full bg-red-300 hover:bg-red-400 border border-red-400 hover:border-red-500"
              >
                {t("actions.moveAll", "Move All")}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Rename Modal */}
      {renameModalOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => {
            if (!isRenaming) setRenameModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-semibold text-lg mb-4 text-gray-900 text-left">{t("actions.rename", "Rename")}</h4>
            <div className="mb-6">
              <Label
                htmlFor="newName"
                className="block text-sm font-medium text-gray-700 mb-1 text-left"
              >
                {t("actions.newName", "New Name:")}
              </Label>
              <Input
                id="newName"
                type="text"
                variant="shadow"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2"
              />
            </div>
            <div className="flex justify-start gap-3">
              <Button
                onClick={() => {
                  if (!isRenaming) setRenameModalOpen(false);
                }}
                variant="outline"
                disabled={isRenaming}
              >
                Cancel
              </Button>
              <Button
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
                variant="download"
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

  // Feature flag for quality tier (controls visibility of Settings in folder menu)
  const { isEnabled: qualityTierEnabled } = useFeaturePermission('col_quality_tier');

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
        <Button
          ref={buttonRef}
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
          onClick={handleMenuToggle}
        >
          <MoreHorizontal size={20} />
        </Button>
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
                    ? buttonRef.current.getBoundingClientRect().top - 200
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
                <Button className="flex items-center gap-3 w-full justify-start px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-none cursor-pointer border-0 shadow-none">
                  <Share2 size={16} className="text-gray-500" />
                  <span>{t("actions.share", "Share")}</span>
                </Button>
                <Button
                  onClick={handleRenameClick}
                  className="flex items-center gap-3 w-full justify-start px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-none cursor-pointer border-0 shadow-none"
                >
                  <PenLine size={16} className="text-gray-500" />
                  <span>{t("actions.rename", "Rename")}</span>
                </Button>
                {qualityTierEnabled && (
                  <Button
                    onClick={handleSettingsClick}
                    className="flex items-center gap-3 w-full justify-start px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-none cursor-pointer border-0 shadow-none"
                  >
                    <Settings size={16} className="text-gray-500" />
                    <span>{t("actions.settings", "Settings")}</span>
                  </Button>
                )}
                <Button
                  onClick={handleExportFolder}
                  className="flex items-center gap-3 w-full justify-start px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-none cursor-pointer border-0 shadow-none"
                >
                  <Download size={16} className="text-gray-500" />
                  <span>{t("actions.exportAsFile", "Export as file")}</span>
                </Button>
              </div>
              <div className="py-1 border-t border-gray-100">
                <Button
                  onClick={handleDeleteFolder}
                  className="flex items-center gap-3 w-full justify-start px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-none cursor-pointer border-0 shadow-none"
                >
                  <Trash2 size={14} />
                  <span>{t("actions.delete", "Delete")}</span>
                </Button>
              </div>
            </div>,
            document.body
          )}
      </div>

      {/* ---------------- Rename Modal ---------------- */}
      {renameModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm p-4"
          onClick={() => {
            if (!isRenaming) setRenameModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-semibold text-lg mb-4 text-gray-900 text-left">
              {t("actions.renameFolder", "Rename Folder")}
            </h4>

            <div className="mb-6">
              <Label
                htmlFor="newFolderName"
                className="block text-sm font-medium text-gray-700 mb-1 text-left"
              >
                {t("actions.newName", "New Name:")}
              </Label>
              <Input
                id="newFolderName"
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
                disabled={isRenaming}
              >
                {t("actions.cancel", "Cancel")}
              </Button>
              <Button
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
                variant="download"
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


      {/* Loading Modal for Folder Export */}
      <FolderExportLoadingModal isOpen={isExporting} folderName={folder.name} />
    </>
  );
};

const ProjectsTable: React.FC<ProjectsTableProps> = ({
  trashMode = false,
  folderId = null,
  auditMode = false,
}) => {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { isEnabled: courseTableEnabled } = useFeaturePermission('course_table');
  const [projects, setProjects] = useState<Project[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "created" | "lastViewed" | "creator">(
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
  const [contentTypeFilter, setContentTypeFilter] = useState("All");
  const [activeTab, setActiveTab] = useState<"all" | "created" | "shared" | "favorites">("all");
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(
    new Set()
  );
  const [folderProjects, setFolderProjects] = useState<
    Record<number, Project[]>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({
    title: 48,
    created: 15,
    creator: 15,
    numberOfLessons: 13,
    estCreationTime: 13.5,
    estCompletionTime: 13.5,
    type: 5,
  });
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);

  // Helper to compute a human-friendly display title for the products page
  // Prefer unique instance names for non-outline products; fall back to content-derived titles
  const computeDisplayTitleFromProjectApi = useCallback((p: any): string => {
    try {
      const typeRaw: string = p?.design_microproduct_type || '';
      const type = String(typeRaw).toLowerCase();

      // Treat outlines specially; keep the project name as the display name
      if (type === 'training plan' || type === 'course outline') {
        return p?.projectName || p?.microproduct_name || 'Untitled';
      }

      // 1) Prefer explicitly stored instance name if it's provided and not a generic template label
      const instanceName: string | undefined = p?.projectName?.trim() || p?.microproduct_name?.trim();
      const genericNames = new Set([
        'Slide Deck', 'Quiz', 'Video Lesson', 'Text Presentation', 'PDF Lesson', 'Video'
      ]);
      if (instanceName && !genericNames.has(instanceName)) {
        return instanceName;
      }

      // 2) Try to extract a meaningful title from the content payload
      const content = p?.microproduct_content || {};
      if (content && typeof content === 'object') {
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

      // 3) Fallbacks
      return p?.projectName || instanceName || 'Untitled';
    } catch (e) {
      console.warn('[PRODUCTS PAGE] computeDisplayTitleFromProjectApi error:', e);
      return p?.projectName || p?.microproduct_name || 'Untitled';
    }
  }, []);

  // Drag and drop reordering state
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);
  const [draggedFolder, setDraggedFolder] = useState<Folder | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Client name modal state
  const [showClientNameModal, setShowClientNameModal] = useState(false);

  // Handle sorting
  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Feature flag: enable outline-related filtering (hides products generated from course outlines)
  const ENABLE_OUTLINE_FILTERING = false;

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
      
      // 🔍 DEBUG: Log projects data for workspace access debugging
      console.log('🔍 [PROJECTS DEBUG] Raw projects data from API:', {
        totalProjects: projectsData.length,
        apiUrl: projectsApiUrl,
        projects: projectsData.map((p: any) => ({
          id: p.id,
          projectName: p.projectName,
          microproduct_name: p.microproduct_name,
          design_microproduct_type: p.design_microproduct_type,
          created_at: p.created_at,
          has_content: !!p.microproduct_content,
          content_keys: p?.microproduct_content ? Object.keys(p.microproduct_content) : []
        }))
      });
      
      // 📦 EXTRA DEBUG: Print full objects and computed display titles to find real name field
      try {
        projectsData.forEach((p: any) => {
          const computedTitle = computeDisplayTitleFromProjectApi(p);
          const nameCandidates = {
            projectName: p?.projectName,
            microproduct_name: p?.microproduct_name,
            content_title: p?.microproduct_content?.title,
            content_lessonTitle: p?.microproduct_content?.lessonTitle,
            content_quizTitle: p?.microproduct_content?.quizTitle,
          };
          console.groupCollapsed(`📄 [PRODUCT] #${p?.id} (${p?.design_microproduct_type || 'unknown'})`);
          console.log('Raw:', p);
          console.log('Name candidates:', nameCandidates);
          console.log('Computed displayTitle:', computedTitle);
          console.groupEnd();
        });
      } catch (e) {
        console.warn('[PRODUCTS PAGE] Error during debug logging:', e);
      }
      
      const processedProjects = projectsData.map((p: any) => ({
        id: p.id,
        title: computeDisplayTitleFromProjectApi(p),
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

      // Sort projects by order field (default sorting)
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

      const allProjects = ENABLE_OUTLINE_FILTERING
        ? deduplicateProjects(sortedProjects)
        : sortedProjects;
      setProjects(allProjects);

      // Calculate folder projects mapping for all folders
      const folderProjectsMap: Record<number, Project[]> = {};
      allProjects.forEach((project: Project) => {
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
  }, [trashMode, folderId, router, auditMode]);

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
          title: computeDisplayTitleFromProjectApi(p),
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

  // Toggle folder expansion
  const toggleFolder = useCallback(
    (folderId: number) => {
      setExpandedFolders((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(folderId)) {
          newSet.delete(folderId);
        } else {
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
    let filteredProjects = projects.filter((p) => p.folderId === null);

    // Apply content type filter
    if (contentTypeFilter !== "All") {
      filteredProjects = filteredProjects.filter((p) => {
        const designType = (p.designMicroproductType || "").toLowerCase();
        switch (contentTypeFilter) {
          case "Course":
            return designType === "training plan";
          case "Presentation":
            return designType === "slide deck";
          case "Quiz":
            return designType === "quiz";
          case "Video Lesson":
            return designType === "video lesson presentation";
          default:
            return true;
        }
      });
    }

    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filteredProjects = filteredProjects.filter((p) => {
        const title = (p.title || "").toLowerCase();
        const instanceName = (p.instanceName || "").toLowerCase();
        const designType = (p.designMicroproductType || "").toLowerCase();
        const createdBy = (p.createdBy || "").toLowerCase();
        
        return (
          title.includes(searchLower) ||
          instanceName.includes(searchLower) ||
          designType.includes(searchLower) ||
          createdBy.includes(searchLower)
        );
      });
    }

    return filteredProjects;
  }, [projects, searchTerm, contentTypeFilter]);

  // Helper function to get projects for a specific folder (including subfolders) with search
  const getProjectsForFolder = useCallback(
    (targetFolderId: number | null) => {
      let filteredProjects = projects;

      // Apply content type filter
      if (contentTypeFilter !== "All") {
        filteredProjects = filteredProjects.filter((p) => {
          const designType = (p.designMicroproductType || "").toLowerCase();
          switch (contentTypeFilter) {
            case "Course":
              return designType === "training plan";
            case "Presentation":
              return designType === "slide deck";
            case "Quiz":
              return designType === "quiz";
            case "Video Lesson":
              return designType === "video lesson presentation";
            default:
              return true;
          }
        });
      }

      // Apply search filter if search term exists
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        filteredProjects = filteredProjects.filter((p) => {
          const title = (p.title || "").toLowerCase();
          const instanceName = (p.instanceName || "").toLowerCase();
          const designType = (p.designMicroproductType || "").toLowerCase();
          const createdBy = (p.createdBy || "").toLowerCase();
          
          return (
            title.includes(searchLower) ||
            instanceName.includes(searchLower) ||
            designType.includes(searchLower) ||
            createdBy.includes(searchLower)
          );
        });
      }

      // Apply sorting to filtered projects
      const sortedFilteredProjects = filteredProjects.sort((a: Project, b: Project) => {
        let aValue: any;
        let bValue: any;

        switch (sortBy) {
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'created':
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          case 'lastViewed':
            aValue = a.lastViewed === "Never" ? new Date(0) : new Date(a.lastViewed);
            bValue = b.lastViewed === "Never" ? new Date(0) : new Date(b.lastViewed);
            break;
          case 'creator':
            aValue = a.createdBy.toLowerCase();
            bValue = b.createdBy.toLowerCase();
            break;
          default:
            aValue = a.order || 0;
            bValue = b.order || 0;
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      if (targetFolderId === null) {
        return sortedFilteredProjects;
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
      return sortedFilteredProjects.filter(
        (p) => p.folderId && folderIds.includes(p.folderId)
      );
    },
    [projects, folders, searchTerm, sortBy, sortOrder, lessonDataCache, contentTypeFilter]
  );

  // Helper function to calculate lesson data for a project with cancellation support
  const getLessonData = useCallback(
    async (project: Project, signal?: AbortSignal) => {
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
            signal, // Add AbortSignal support
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
        // Don't log errors if the request was cancelled
        if (error instanceof Error && error.name === 'AbortError') {
          return { lessonCount: "...", totalHours: "...", completionTime: "..." };
        }
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

  // Load lesson data for Training Plan projects in parallel (non-blocking)
  useEffect(() => {
    const trainingPlanProjects = projects.filter(
      (p) => p.designMicroproductType === "Training Plan"
    );

    if (trainingPlanProjects.length === 0) {
      return;
    }

    // Cancel any existing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    // Initialize cache with loading state
    const loadingCache: Record<number, any> = {};
    trainingPlanProjects.forEach(project => {
      loadingCache[project.id] = {
        lessonCount: "...",
        totalHours: "...",
        completionTime: "...",
      };
    });
    setLessonDataCache(prev => ({ ...prev, ...loadingCache }));

    // Load lesson data in parallel (non-blocking)
    const loadLessonDataParallel = async () => {
      try {
        // Process projects in batches of 3 to avoid overwhelming the server
        const batchSize = 3;
        
        for (let i = 0; i < trainingPlanProjects.length; i += batchSize) {
          const batch = trainingPlanProjects.slice(i, i + batchSize);
          
          const batchPromises = batch.map(async (project) => {
            try {
              const data = await getLessonData(project, currentController.signal);
              
              // Update cache immediately when each request completes
              if (!currentController.signal.aborted) {
                setLessonDataCache(prev => ({
                  ...prev,
                  [project.id]: data,
                }));
              }
              
              return { projectId: project.id, data };
            } catch (error) {
              if (!currentController.signal.aborted) {
                const errorData = {
                  lessonCount: "?",
                  totalHours: "?",
                  completionTime: "?",
                };
                setLessonDataCache(prev => ({
                  ...prev,
                  [project.id]: errorData,
                }));
              }
              return { projectId: project.id, data: null };
            }
          });

          // Wait for current batch before starting next batch
          await Promise.all(batchPromises);
          
          // Small delay between batches to be nice to the server
          if (i + batchSize < trainingPlanProjects.length && !currentController.signal.aborted) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      } catch (error) {
        if (!currentController.signal.aborted) {
          console.error('Error in parallel lesson data loading:', error);
        }
      }
    };

    // Start loading in background (don't await - non-blocking)
    loadLessonDataParallel();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
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
    if (diffDays <= 7) {
      const days = diffDays - 1;
      const unit = days === 1 ? "day" : "days";
      return t("interface.daysAgo", `{days} ${unit} ago`).replace("{days}", days.toString());
    }
    if (diffDays === 7 || diffDays === 8) {
      return t("interface.lastWeek", "Last week");
    }
    if (diffDays <= 30) {
      const weeks = Math.floor(diffDays / 7);
      const unit = weeks === 1 ? "week" : "weeks";
      return t("interface.weeksAgo", `{weeks} ${unit} ago`).replace("{weeks}", weeks.toString());
    }
    if (diffDays >= 28 && diffDays <= 31) {
      return t("interface.lastMonth", "Last month");
    }
    if (diffDays <= 365) {
      const months = Math.floor(diffDays / 30);
      const unit = months === 1 ? "month" : "months";
      return t("interface.monthsAgo", `{months} ${unit} ago`).replace("{months}", months.toString());
    }

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
        `${CUSTOM_BACKEND_URL}/projects/delete-permanently`,
        {
          method: "POST",
          headers,
          credentials: "same-origin",
          body: JSON.stringify({
            project_ids: [projectId],
            scope: "self"
          }),
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
    // t("interface.favorites", "Favorites"),
  ];
  const filterIcons: Record<string, LucideIcon> = {
    [t("interface.all", "All")]: Home,
    [t("interface.recentlyViewed", "Recently viewed")]: Clock,
    [t("interface.createdByYou", "Created by you")]: User,
    // [t("interface.favorites", "Favorites")]: Star,
  };

  // Content type filters for list view
  const contentTypeFilters = [
    "All",
    "Course", 
    "Presentation",
    "Quiz",
    "Video Lesson",
    "One-Pager",
  ];

  const AllIcon: React.FC<{ stroke?: string }> = ({ stroke }) => (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.3333 1.06689H1M13 5.06689H1M9.06667 9.00023H1" stroke={stroke} stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
  );

  const contentTypeFilterIcons: Record<string, LucideIcon | React.ComponentType<any>> = {
    "All": AllIcon,
    "Course": BookOpen,
    "Presentation": LayoutTemplate,
    "Quiz": FileQuestion,
    "Video Lesson": MonitorPlay,
    "One-Pager": FileText,
  };

  // Add PDF download function
  const handlePdfDownload = () => {
    setShowClientNameModal(true);
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

  const handleCreateProduct = () => {
    // Clear previous state of product creation
    if (sessionStorage.getItem('createProductFailed')) {
      sessionStorage.removeItem('createProductFailed');
    }
    // Start timer
    timeEvent('Create Product');
  };

  // Add these just before the render block
  const visibleProjects = ENABLE_OUTLINE_FILTERING
    ? viewMode === "list"
      ? getProjectsForFolder(folderId).filter(
          (p) => (p.designMicroproductType || "").toLowerCase() !== "quiz"
        )
      : getProjectsForFolder(folderId)
    : getProjectsForFolder(folderId);

  // Pagination logic
  const totalPages = Math.ceil(visibleProjects.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedProjects = visibleProjects.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, contentTypeFilter, folderId]);

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
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
              <Link href={auditMode ? "/create/ai-audit/questionnaire" : (folderId ? `/create?folderId=${folderId}` : "/create")}>
                <Button 
                  variant="download" 
                  className="rounded-full font-bold bg-[#0F58F9] font-medium"
                  onClick={handleCreateProduct}
                  asChild
                >
                  <div>
                  <Plus size={16} className="text-white" />
                  <span className="font-bold tracking-wider pr-2">{auditMode ? t("interface.createNewAudit", "Create new audit") : t("interface.createNew", "Create new")}</span>
                  <span className="ml-1.5 rounded-full bg-white text-[#0F58F9] px-1.5 py-0.5 text-[10px] leading-none font-bold tracking-wide">
                    AI
                  </span>
                  </div>
                </Button>
              </Link>
          </div>
        </div>
      )}

      {/* Navigation Panel */}

      {!trashMode && (
        <div className="flex justify-between gap-4 mb-4">
          <nav className="flex pb-1 h-8 pt-2 mt-2">
            <button
              className={`pb-2 px-3 text-sm flex items-center gap-2 font-medium border-b-1 transition-colors ${
                activeTab === "all" 
                  ? "border-b-3 border-[#719AF5] text-[#719AF5]" 
                  : "border-b-1 border-[#B8B8BC] text-[#8D8D95] hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("all")}
            >
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.7826 0.625H1.44922M13.4492 4.625H1.44922M9.51589 8.55833H1.44922" stroke={`${activeTab === "all" ? "#719AF5" : "#8D8D95"}`} stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              All
            </button>
            <button
              className={`pb-2 px-3 text-sm flex items-center gap-2 font-medium border-b-1 transition-colors ${
                activeTab === "created" 
                  ? "border-b-3 border-[#719AF5] text-[#719AF5]" 
                  : "border-b-1 border-[#B8B8BC] text-[#8D8D95] hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("created")}
            >
              <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.2492 13.541V12.0966C11.2492 11.3304 10.9542 10.5956 10.4291 10.0538C9.90402 9.51205 9.19182 9.20768 8.44922 9.20768H4.24922C3.50661 9.20768 2.79442 9.51205 2.26932 10.0538C1.74422 10.5956 1.44922 11.3304 1.44922 12.0966V13.541M15.4492 13.541V12.0966C15.4488 11.4565 15.2423 10.8347 14.8622 10.3288C14.4821 9.82291 13.9499 9.46159 13.3492 9.30157M11.2492 0.634905C11.8515 0.794011 12.3853 1.15541 12.7666 1.66213C13.1478 2.16885 13.3547 2.79206 13.3547 3.43352C13.3547 4.07497 13.1478 4.69818 12.7666 5.2049C12.3853 5.71162 11.8515 6.07302 11.2492 6.23213M9.14922 3.4299C9.14922 5.02539 7.89562 6.31879 6.34922 6.31879C4.80282 6.31879 3.54922 5.02539 3.54922 3.4299C3.54922 1.83442 4.80282 0.541016 6.34922 0.541016C7.89562 0.541016 9.14922 1.83442 9.14922 3.4299Z" stroke={`${activeTab === "created" ? "#719AF5" : "#8D8D95"}`} stroke-opacity="0.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Created by you
            </button>
            <button
              className={`pb-2 px-3 text-sm flex items-center gap-2 font-medium border-b-1 transition-colors ${
                activeTab === "shared" 
                  ? "border-b-3 border-[#719AF5] text-[#719AF5]" 
                  : "border-b-1 border-[#B8B8BC] text-[#8D8D95] hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("shared")}
            >
              <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.17589 8.80273L9.72922 11.4561M9.72255 4.13606L5.17589 6.78939M13.4492 3.12939C13.4492 4.23396 12.5538 5.12939 11.4492 5.12939C10.3446 5.12939 9.44922 4.23396 9.44922 3.12939C9.44922 2.02482 10.3446 1.12939 11.4492 1.12939C12.5538 1.12939 13.4492 2.02482 13.4492 3.12939ZM5.44922 7.79606C5.44922 8.90063 4.55379 9.79606 3.44922 9.79606C2.34465 9.79606 1.44922 8.90063 1.44922 7.79606C1.44922 6.69149 2.34465 5.79606 3.44922 5.79606C4.55379 5.79606 5.44922 6.69149 5.44922 7.79606ZM13.4492 12.4627C13.4492 13.5673 12.5538 14.4627 11.4492 14.4627C10.3446 14.4627 9.44922 13.5673 9.44922 12.4627C9.44922 11.3582 10.3446 10.4627 11.4492 10.4627C12.5538 10.4627 13.4492 11.3582 13.4492 12.4627Z" stroke={`${activeTab === "shared" ? "#719AF5" : "#8D8D95"}`} stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Shared with you
            </button>
            <button
              className={`pb-2 px-3 text-sm flex items-center gap-2 font-medium border-b-1 transition-colors ${
                activeTab === "favorites" 
                 ? "border-b-3 border-[#719AF5] text-[#719AF5]" 
                  : "border-b-1 border-[#B8B8BC] text-[#8D8D95] hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("favorites")}
            >
              <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.82013 1.41315C6.96675 0.961894 7.60516 0.961896 7.75178 1.41315L8.93544 5.0561C9.00102 5.25791 9.18908 5.39454 9.40127 5.39454H13.2317C13.7062 5.39454 13.9034 6.0017 13.5196 6.28059L10.4207 8.53206C10.249 8.65678 10.1772 8.87786 10.2428 9.07967L11.4264 12.7226C11.5731 13.1739 11.0566 13.5491 10.6727 13.2702L7.57385 11.0188C7.40218 10.894 7.16973 10.894 6.99806 11.0188L3.89918 13.2702C3.51532 13.5491 2.99884 13.1739 3.14546 12.7226L4.32913 9.07967C4.3947 8.87786 4.32287 8.65678 4.1512 8.53206L1.05232 6.28059C0.668457 6.0017 0.865736 5.39454 1.34021 5.39454H5.17064C5.38283 5.39454 5.57089 5.25791 5.63646 5.0561L6.82013 1.41315Z" stroke={`${activeTab === "favorites" ? "#719AF5" : "#8D8D95"}`} stroke-width="0.979592"/>
              </svg>
              Favorites
            </button>
          </nav>
          <div className="flex gap-2">
            <div className="relative w-75 h-9">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#71717A] z-10" size={16} />
              <Input
                type="text"
                variant="shadow"
                placeholder={t('interface.searchPlaceholderProjects', 'Search...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 placeholder:text-[#71717A] placeholder:text-sm"
              />
            </div>
            <div 
              className="flex items-center px-3 h-9 py-1 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                setSortBy('created');
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
              }}
              title="Sort by creation date"
            >
              <ArrowDownUp size={16} className="text-[#71717A]" />
            </div>
            <div className="flex items-center gap-2 -mt-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="sort" 
                    className="flex border border-gray-200 items-center gap-2 px-5 text-sm font-semibold"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.1328 9.03369C11.1811 9.03369 12.0569 9.77835 12.2568 10.7681L12.3438 11.1997L12.2568 11.6313C12.0569 12.6211 11.1812 13.3667 10.1328 13.3667C9.08455 13.3666 8.20964 12.621 8.00977 11.6313L7.92188 11.1997L8.00977 10.7681C8.20972 9.77847 9.08462 9.03382 10.1328 9.03369ZM10.1328 9.1001C8.97322 9.10024 8.03334 10.0401 8.0332 11.1997C8.0332 12.3594 8.97312 13.3002 10.1328 13.3003C11.2926 13.3003 12.2334 12.3595 12.2334 11.1997C12.2333 10.04 11.2925 9.1001 10.1328 9.1001ZM1.59961 11.1665H7.4707L7.80566 11.1997L7.4707 11.2329H1.59961C1.58129 11.2328 1.56641 11.2181 1.56641 11.1997C1.56655 11.1815 1.58138 11.1666 1.59961 11.1665ZM12.7959 11.1665H14.3994C14.4177 11.1665 14.4325 11.1815 14.4326 11.1997C14.4326 11.2181 14.4178 11.2329 14.3994 11.2329H12.7959L12.46 11.1997L12.7959 11.1665ZM5.86621 2.6333C6.91458 2.6333 7.79034 3.37885 7.99023 4.36865L8.07617 4.79932L7.99023 5.23193C7.79027 6.22164 6.91452 6.96631 5.86621 6.96631C4.81796 6.96622 3.94211 6.22162 3.74219 5.23193L3.65527 4.79932L3.74219 4.36865C3.94207 3.37891 4.81792 2.63339 5.86621 2.6333ZM5.86621 2.69971C4.7065 2.69981 3.7666 3.64056 3.7666 4.80029C3.76678 5.95988 4.70661 6.8998 5.86621 6.8999C7.0259 6.8999 7.96662 5.95994 7.9668 4.80029C7.9668 3.64049 7.02601 2.69971 5.86621 2.69971ZM1.59961 4.76709H3.2041L3.53906 4.79932L3.2041 4.8335H1.59961C1.58137 4.83343 1.56658 4.81851 1.56641 4.80029C1.56641 4.78193 1.58126 4.76716 1.59961 4.76709ZM8.5293 4.76709H14.3994C14.4178 4.76709 14.4326 4.78191 14.4326 4.80029C14.4324 4.81852 14.4177 4.8335 14.3994 4.8335H8.5293L8.19238 4.79932L8.5293 4.76709Z" fill="#09090B" stroke="#18181B"/>
                    </svg>
                    {contentTypeFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-white rounded-lg shadow-lg border border-[#E4E4E7]">
                  <DropdownMenuLabel className="px-3 py-2 border-b border-[#E4E4E7] bg-white">
                    <p className="font-semibold text-sm text-gray-900">
                      {t("interface.filterBy", "Filter by")}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="border-[#E4E4E7] text-[#E4E4E7] bg-[#E4E4E7]" />
                  {contentTypeFilters.map((filter) => {
                    const Icon = contentTypeFilterIcons[filter];
                    const isSelected = contentTypeFilter === filter;
                    return (
                      <DropdownMenuItem
                        key={filter}
                        onClick={() => setContentTypeFilter(filter)}
                        className={`flex items-center justify-between px-2 py-2 text-sm transition-colors bg-white ${
                          isSelected 
                            ? "!bg-[#CCDBFC] text-[#0F58F9] font-medium" 
                            : "text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <div className={`flex items-center gap-3 ${isSelected ? "text-[#0F58F9]" : "text-gray-900"}`}>
                          <Icon 
                            size={16} 
                            stroke={isSelected ? "#3366FF" : "#09090B"}
                            className={isSelected ? "text-[#3366FF]" : "text-gray-900"} 
                            strokeWidth={1.5}
                          />
                          <span className={isSelected ? "text-[#3366FF]" : "text-gray-900"}>{filter}</span>
                        </div>
                        {isSelected && (
                          <Check size={16} className="text-[#3366FF]" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Content Type Filter - only show in list view */}
              {/* {viewMode === "list" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                  <Button
                    variant="columns"
                    className="flex items-center gap-2 text-sm font-semibold"
                  >
                      <ListFilter size={16} className="text-gray-800" />
                      {contentTypeFilter}
                    <ChevronDown size={14} className="text-gray-600" />
                  </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    <DropdownMenuLabel className="px-3 py-2 border-b border-gray-100">
                      <p className="font-semibold text-sm text-gray-900">
                        {t("interface.filterBy", "Filter by")}
                      </p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {contentTypeFilters.map((filter) => {
                      const Icon = contentTypeFilterIcons[filter];
                      return (
                        <DropdownMenuItem
                          key={filter}
                          onClick={() => setContentTypeFilter(filter)}
                          className={`flex items-center gap-2 px-3 py-2 text-sm ${
                            contentTypeFilter === filter 
                              ? "bg-blue-50 text-blue-700 font-semibold" 
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <Icon size={16} />
                          {filter}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )} */}

              {/* PDF Download Button - only show in list view */}
              {/* {viewMode === "list" && (
                <Button
                  onClick={handlePdfDownload}
                  variant="download"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
                  title={t(
                    "interface.downloadPDF",
                    "Download projects list as PDF"
                  )}
                >
                  <ArrowDownToLine size={16} />
                  {t("common.downloadPdf", "Download PDF")}
                </Button>
              )} */}

              <div className="flex items-center bg-gray-100 rounded-full p-0.5 border border-gray-200">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-full p-2 w-9 h-9 flex items-center justify-center ${viewMode === "grid" ? "bg-[#ffffff] text-[#719AF5] border border-[#719AF5] shadow-lg" : "bg-gray-100 text-500"}`}
                >
                  <LayoutGrid strokeWidth={1} className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded-full p-2 w-9 h-9 flex items-center justify-center ${viewMode === "list" ? "bg-[#ffffff] text-[#719AF5] border border-[#719AF5] shadow-lg" : "bg-gray-100 text-gray-500"}`}
                >
                  <List strokeWidth={1.5} className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {projects.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {getProjectsForFolder(folderId).map((p: Project) => (
              <CustomProjectCard
                key={p.id}
                project={p}
                onDelete={handleDeleteProject}
                onRestore={handleRestoreProject}
                onDeletePermanently={handleDeletePermanently}
                isTrashMode={trashMode}
                folderId={folderId}
                t={t}
                language={language}
              />
            ))}
          </div>
        ) : (
          <>
          {/* List view (table/row style) */}
          <div
            className={`bg-white rounded-xl border border-[#E0E0E0] overflow-x-auto ${
              isReordering ? "ring-2 ring-blue-200" : ""
            }`}
          >
            <Table
              className="min-w-full divide-y divide-[#E0E0E0] rounded-md"
            >
              <TableHeader className="bg-white">
                <TableRow>
                    <TableHead
                      className="px-3 py-3 text-left text-xs font-normal text-gray-500 tracking-wider relative"
                      style={{ width: `${columnWidths.type}%` }}
                    >
                      <div className="flex items-center gap-2">
                        <FileStack strokeWidth={1} className="text-[#71717A]" size={15} />
                        {t("interface.type", "Type")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="px-3 py-3 text-left text-xs font-normal text-gray-500 tracking-wider relative cursor-pointer hover:bg-gray-50"
                      style={{ width: `${columnWidths.title}%` }}
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center gap-2">
                        <ClipboardPenLine strokeWidth={1} className="text-[#71717A]" size={15} />
                        {t("interface.title", "Title")}
                        {sortBy === 'title' && (
                          <ArrowUpDown size={12} className={sortOrder === 'asc' ? 'rotate-180' : ''} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="px-3 py-3 text-left text-xs font-normal text-gray-500 tracking-wider relative cursor-pointer hover:bg-gray-50"
                      style={{ width: `${columnWidths.creator}%` }}
                      onClick={() => handleSort('creator')}
                    >
                      <div className="flex items-center gap-2">
                        <Users strokeWidth={1} className="text-[#71717A]" size={15} />
                        {t("interface.creator", "Creator")}
                        {sortBy === 'creator' && (
                          <ArrowUpDown size={12} className={sortOrder === 'asc' ? 'rotate-180' : ''} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="px-3 py-3 text-left text-xs font-normal text-gray-500 tracking-wider relative cursor-pointer hover:bg-gray-50"
                      style={{ width: `${columnWidths.created}%` }}
                      onClick={() => handleSort('created')}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar strokeWidth={1} className="text-[#71717A]" size={15} />
                        {t("interface.created", "Created")}
                        {sortBy === 'created' && (
                          <ArrowUpDown size={12} className={sortOrder === 'asc' ? 'rotate-180' : ''} />
                        )}
                      </div>
                    </TableHead>
                  <TableHead
                    className="px-3 py-3 text-right text-xs text-uppercase font-normal text-gray-500 tracking-wider"
                    style={{ width: "80px" }}
                  >
                    {/* {t("interface.actions", "ACTIONS")} */}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-[#E0E0E0]">
                {/* Show filtered projects based on folder */}
                {paginatedProjects.map((p: Project, index: number) => (
                    <TableRow
                      key={p.id}
                      className={`hover:bg-gray-50 transition group ${
                        !getModalState()
                          ? "cursor-grab active:cursor-grabbing"
                          : "cursor-default"
                      } ${
                        dragOverIndex === index
                          ? "bg-blue-50 border-t-2 border-blue-300"
                          : ""
                      } ${draggedProject?.id === p.id ? "opacity-50" : ""}`}
                      draggable={!trashMode && !getModalState()}
                      onDragStart={(e) => {
                        if (getModalState()) {
                          e.preventDefault();
                          e.stopPropagation();
                          return;
                        }
                        handleDragStart(e, p, "project");
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
                        <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                          {p.designMicroproductType ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 flex items-center justify-center">
                                {p.designMicroproductType === "Slide Deck" && (
                                  <LayoutTemplate size={20} strokeWidth={1} className="font-light text-[#EFB4FB]" />
                                )}
                                {p.designMicroproductType === "Training Plan" && (
                                  <BookOpen size={20} strokeWidth={1} className="font-light text-[#719AF5]" />
                                )}
                                {(p.designMicroproductType === "Video" || p.designMicroproductType === "Video Lesson Presentation") && (
                                  <MonitorPlay size={20} strokeWidth={1} className="font-light text-[#06A294]" />
                                )}
                                {p.designMicroproductType === "Text Presentation" && (
                                  <FileText size={20} strokeWidth={1} className="font-light text-purple-300" />
                                )}
                                {p.designMicroproductType === "Quiz" && (
                                  <FileQuestion size={20} strokeWidth={1} className="font-light text-[#FBEC9E]" />
                                )}
                              </div>
                              <span className="text-sm text-gray-500 font-normal">
                                {getProductTypeDisplayName(p.designMicroproductType)}
                              </span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="px-2 py-2 whitespace-nowrap text-sm font-regular text-gray-900">
                          <span className="inline-flex items-center">
                            {/* <Star size={16} className="text-gray-300 mr-2" /> */}
                            <DynamicText
                              text={p.title}
                              columnWidthPercent={columnWidths.title}
                              href={trashMode ? "#" : (
                                p.designMicroproductType === "Video" 
                                  ? `/projects-2/view/${p.id}`
                                  : (p.designMicroproductType === "Training Plan"
                                    ? (courseTableEnabled ? `/projects/view/${p.id}` : `/projects/view-new-2/${p.id}`)
                                    : `/projects/view/${p.id}`)
                              )}
                              title={p.title}
                            />
                          </span>
                        </TableCell>
                        <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center text-[var(--main-text)] gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm bg-[#E1E1E1]"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="100%" viewBox="0 0 288 288" enableBackground="new 0 0 288 288" xmlSpace="preserve">
                              <path fill="#6C6C6C" opacity="1.000000" stroke="none" d=" M126.764687,243.325195   C129.743134,252.333206 134.648621,260.277374 136.916687,270.400635   C128.787888,268.256714 124.842384,262.069458 118.092896,258.664429   C119.308434,262.129517 120.328094,264.713470 121.101715,267.369141   C121.528847,268.835388 122.829292,270.669861 120.802452,271.840027   C119.127396,272.807129 118.008667,271.188202 116.981483,270.234497   C108.673660,262.520996 100.574516,254.570007 93.602295,245.621414   C88.185638,238.669373 83.379593,231.244629 78.121811,224.163879   C76.570457,222.074600 74.951332,219.858124 71.795006,218.364532   C68.604797,223.381012 67.569160,229.950348 62.030056,233.435074   C57.042271,236.572968 52.403023,240.231232 48.189892,244.138397   C45.385746,241.875366 46.767834,240.212723 47.577496,238.707336   C49.391239,235.335022 51.005894,231.772644 53.326328,228.770523   C62.297386,217.164062 61.618809,203.921829 60.225838,190.532364   C59.637970,184.881699 58.121010,179.383667 56.273403,174.050064   C50.275124,156.734436 50.554508,139.405197 55.733799,122.029739   C62.114437,100.624023 71.474792,81.173080 89.520638,66.695068   C119.857658,42.355949 155.847946,46.867363 183.390152,65.028984   C195.984482,73.333817 202.778366,86.450531 207.319687,100.443886   C220.159134,140.006592 218.619019,179.070526 202.323807,217.448044   C200.306015,222.200226 198.362686,226.984711 196.286087,231.710846   C195.603226,233.264999 195.330215,235.434372 192.021210,235.111679   C191.544830,225.995117 195.513290,217.500610 196.057571,208.130676   C186.909927,218.816956 176.217575,226.728729 162.932022,230.703110   C149.899185,234.601883 136.731003,234.265442 123.138283,230.953323   C123.345345,235.782639 125.523560,239.224625 126.764687,243.325195  M185.937988,124.180367   C182.732666,120.860306 179.360062,117.776848 175.175842,116.061447   C174.700089,116.430336 174.488876,116.507607 174.448608,116.637764   C172.698914,122.294319 164.988434,125.525246 167.817322,133.128540   C168.200027,134.157150 166.720673,135.102341 165.533051,135.391510   C163.605209,135.860962 161.647766,136.208862 159.377701,136.674805   C161.062805,138.449005 158.214310,139.753845 159.124908,141.856583   C161.031693,146.259705 159.627502,149.741455 155.057053,151.480652   C150.993805,153.026840 148.155334,151.062866 145.905991,145.527100   C145.726746,145.085938 145.432755,144.691406 144.954224,143.863846   C137.083755,146.571548 128.703262,146.706116 120.616859,148.478226   C113.820236,149.967682 110.196198,154.742355 110.369339,161.682526   C110.497734,166.829453 110.875473,171.978714 111.357933,177.106628   C112.634392,190.673721 114.232536,204.188416 118.169258,217.317474   C119.010086,220.121689 120.495758,221.867783 123.294586,222.868378   C133.616211,226.558395 144.297134,227.233017 154.796295,224.977173   C188.680298,217.696838 208.119064,187.382095 201.187790,153.323090   C200.214066,148.538284 199.843994,143.435669 195.424133,139.194107   C196.030853,141.250153 196.680496,142.586060 196.783371,143.962845   C197.089066,148.054352 194.487030,151.278244 190.663040,151.840393   C187.177460,152.352798 183.730301,149.776413 182.993546,146.178833   C182.302444,142.804062 185.592300,139.810059 183.053772,136.266769   C182.079926,136.181213 180.250900,136.130341 178.463898,135.829727   C176.965042,135.577560 175.410370,134.980118 175.073807,133.291550   C174.670563,131.268509 176.178680,130.222519 177.756851,129.593262   C179.907227,128.735870 182.201141,128.237198 184.347412,127.371315   C185.434494,126.932739 187.927521,127.160950 185.937988,124.180367  z"/>
                              <path fill="#6C6C6C" opacity="1.000000" stroke="none" d=" M184.497925,205.505127   C177.387009,214.158386 168.161636,212.015427 159.502716,210.813339   C153.161850,209.933029 147.837357,205.318619 141.258728,204.622986   C140.498917,204.542648 139.769547,203.878281 139.995148,202.334045   C142.825668,200.859970 146.206512,201.612762 149.324982,201.480194   C158.448822,201.092361 166.947464,196.727951 176.287842,197.627457   C179.712128,197.957230 182.802567,198.591614 185.588547,200.581680   C188.543945,202.692780 187.912109,204.213242 184.497925,205.505127  M159.784851,207.163208   C165.244186,209.836899 170.631027,207.250763 176.056244,206.667542   C170.672363,206.667542 165.288498,206.667542 159.784851,207.163208  M165.001892,203.486176   C170.099594,203.086731 175.197296,202.687271 180.294998,202.287827   C175.071182,203.026901 169.459641,199.147293 165.001892,203.486176  z"/>
                              <path fill="#6C6C6C" opacity="1.000000" stroke="none" d=" M173.344406,161.090042   C180.438629,158.990570 189.808182,167.157059 188.872223,176.054337   C188.152618,182.894730 178.548767,187.131531 172.244995,183.602051   C172.711761,181.630249 174.450790,182.014267 175.808838,181.629318   C179.330368,180.631119 183.150757,179.894424 183.894775,175.375717   C184.567642,171.289154 181.416046,165.869278 177.394379,163.900024   C175.949905,163.192734 174.040115,163.263535 173.344406,161.090042  z"/>
                              </svg>
                            </div>
                            You
                          </span>
                        </TableCell>
                        <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(p.createdAt)}
                        </TableCell>
                      <TableCell
                        className="px-2 pr-5 py-2 whitespace-nowrap text-right text-sm font-medium relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ProjectRowMenu
                          project={p}
                          formatDate={formatDate}
                          trashMode={trashMode}
                          onDelete={handleDeleteProject}
                          onRestore={handleRestoreProject}
                          onDeletePermanently={handleDeletePermanently}
                          folderId={folderId}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Controls */}
          {viewMode === "list" && visibleProjects.length > 0 && (
            <div className="flex items-center justify-end mt-4 px-4 py-3 bg-white rounded-lg">
              <div className="flex items-center gap-10">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--main-text)]">Rows per page:</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-8 w-[70px] border-[#E4E4E7] rounded-md bg-white shadow-sm justify-between text-[var(--main-text)]">
                        {rowsPerPage}
                        <ChevronsUpDown strokeWidth={1} className="ml-2 h-4 w-4 shrink-0 opacity-50 text-[var(--main-text)]" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="text-[var(--main-text)]" align="end">
                      <DropdownMenuItem onClick={() => { setRowsPerPage(5); setCurrentPage(1); }}>
                        5
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setRowsPerPage(10); setCurrentPage(1); }}>
                        10
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setRowsPerPage(25); setCurrentPage(1); }}>
                        25
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setRowsPerPage(50); setCurrentPage(1); }}>
                        50
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setRowsPerPage(100); setCurrentPage(1); }}>
                        100
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <span className="text-sm text-[var(--main-text)]">
                  Page {currentPage} of {totalPages}
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-2 py-2 border border-gray-300 shadow-sm rounded-md text-[var(--main-text)] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="First page"
                  >
                    <ChevronsLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 py-2 border border-gray-300 shadow-sm rounded-md text-[var(--main-text)] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-2 border border-gray-300 shadow-sm rounded-md text-[var(--main-text)] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-2 border border-gray-300 shadow-sm rounded-md text-[var(--main-text)] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Last page"
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
          </>
        )
      ) : (
        <div className="text-center p-8 text-gray-500">
          {t("interface.noProjectsFound", "No projects found.")}
        </div>
      )}

      {/* Client Name Modal */}
      <ClientNameModal
        isOpen={showClientNameModal}
        onClose={() => setShowClientNameModal(false)}
        onConfirm={handleClientNameConfirm}
        folders={folders}
        folderProjects={folderProjects}
        unassignedProjects={getProjectsForFolder(null).filter(
          (p) => !p.folderId
        )}
      />
    </div>
  );
};

export default ProjectsTable;