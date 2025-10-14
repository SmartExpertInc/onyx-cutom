import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { cn } from "@/lib/utils";
import ProjectSettingsModal from "../../app/projects/ProjectSettingsModal";
import useFeaturePermission from "../../hooks/useFeaturePermission";
import { 
  MoreHorizontal, 
  Lock, 
  List,
  Presentation,
  Video,
  HelpCircle,
  TableOfContents,
  FileText,
  FileQuestion,
  Share2,
  PenLine,
  Star,
  Copy,
  Link as LinkIcon,
  Settings,
  FolderMinus,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Users,
  LayoutTemplate,
  BookOpen,
  MonitorPlay
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
  const { isEnabled: qualityTierEnabled } = useFeaturePermission('col_quality_tier');
  const { isEnabled: courseTableEnabled } = useFeaturePermission('course_table');
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

  const getProductTypeDisplayName = (type: string): string => {
    switch (type) {
      case "Training Plan":
        return "Course";
      case "Slide Deck":
        return "Presentation";
      case "Text Presentation":
        return "Onepager";
      case "Video Lesson Presentation":
        return "Video Lesson";
      default:
        return type;
    }
  };

  return (
    <Card className={`group rounded-md shadow-sm transition-all duration-200 hover:shadow-lg border border-gray-200 relative overflow-hidden ${
      !getModalState()
        ? "cursor-grab active:cursor-grabbing"
        : "cursor-default"
    }`}>
      <Link
        href={isTrashMode ? "#" : (
          project.designMicroproductType === "Video Lesson Presentation" 
            ? `/projects-2/view/${project.id}`
            : (project.designMicroproductType === "Training Plan"
              ? (courseTableEnabled ? `/projects/view/${project.id}` : `/projects/view-new-2/${project.id}`)
              : `/projects/view/${project.id}`)
        )}
        onClick={handleCardClick}
        className="block h-full"
      >
        <div 
          className="relative h-40 flex"
        >
          {/* Left side - Only gradient */}
          <div className="w-[45%] h-full" style={{
            backgroundColor: bgColor,
            backgroundImage: `linear-gradient(45deg, ${bgColor}99, ${stringToColor(
              displayTitle.split("").reverse().join("")
            )}99)`,
          }} />
          {/* Top row with badge positioned absolutely */}
          
          {/* Right side - Title text with icon */}
          <div className="w-[55%] h-full relative flex flex-col p-4" style={{ backgroundColor: `${bgColor}20` }}>
            {/* Lock/Users icon positioned absolutely in top-right */}
            {project.isPrivate ? (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-sm px-1.5 py-1.5 border border-gray-200">
                <Lock size={18} strokeWidth={1.5} className="text-gray-600" />
              </div>
            ) : (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-sm px-1.5 py-1.5 border border-gray-200">
                <Users size={18} strokeWidth={1.5} className="text-gray-600" />
              </div>
            )}
            
            {/* Title text */}
            <div className="flex items-center justify-center flex-1 mt-8">
              <h3 
                className="font-semibold text-md text-left leading-tight line-clamp-5"
                  style={{ color: "black" }}
              >
                {displayTitle}
              </h3>
            </div>
          </div>
        </div>
        
        {/* Lower section with white background (25-30% of height) */}
        <div className="bg-white px-4 py-3 flex flex-col justify-between gap-2">
        {project.designMicroproductType && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center">
                {project.designMicroproductType === "Slide Deck" && (
                  <LayoutTemplate size={19} strokeWidth={1} className="font-light text-[#EFB4FB]" />
                )}
                {project.designMicroproductType === "Training Plan" && (
                  <BookOpen size={19} strokeWidth={1} className="font-light text-[#719AF5]" />
                )}
                {project.designMicroproductType === "Video Lesson Presentation" && (
                  <MonitorPlay size={19} strokeWidth={1} className="font-light text-[#06A294]" />
                )}
                {project.designMicroproductType === "Text Presentation" && (
                  <FileText size={19} strokeWidth={1} className="font-light text-purple-300" />
                )}
                {project.designMicroproductType === "Quiz" && (
                  <FileQuestion size={19} strokeWidth={1} className="font-light text-[#FBEC9E]" />
                )}
              </div>
              <span className="text-sm text-gray-500 font-normal">
                {getProductTypeDisplayName(project.designMicroproductType)}
              </span>
            </div>
          )}
          <div className="h-1 w-full border-b border-[#E0E0E0]" />
          {/* Project title */}
          <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-1" title={displayTitle}>
            {displayTitle}
          </h3>
          
          {/* Creator info and options */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm bg-[#E1E1E1]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="100%" viewBox="0 0 288 288" enableBackground="new 0 0 288 288" xmlSpace="preserve">
                <path fill="#6C6C6C" opacity="1.000000" stroke="none" d=" M126.764687,243.325195   C129.743134,252.333206 134.648621,260.277374 136.916687,270.400635   C128.787888,268.256714 124.842384,262.069458 118.092896,258.664429   C119.308434,262.129517 120.328094,264.713470 121.101715,267.369141   C121.528847,268.835388 122.829292,270.669861 120.802452,271.840027   C119.127396,272.807129 118.008667,271.188202 116.981483,270.234497   C108.673660,262.520996 100.574516,254.570007 93.602295,245.621414   C88.185638,238.669373 83.379593,231.244629 78.121811,224.163879   C76.570457,222.074600 74.951332,219.858124 71.795006,218.364532   C68.604797,223.381012 67.569160,229.950348 62.030056,233.435074   C57.042271,236.572968 52.403023,240.231232 48.189892,244.138397   C45.385746,241.875366 46.767834,240.212723 47.577496,238.707336   C49.391239,235.335022 51.005894,231.772644 53.326328,228.770523   C62.297386,217.164062 61.618809,203.921829 60.225838,190.532364   C59.637970,184.881699 58.121010,179.383667 56.273403,174.050064   C50.275124,156.734436 50.554508,139.405197 55.733799,122.029739   C62.114437,100.624023 71.474792,81.173080 89.520638,66.695068   C119.857658,42.355949 155.847946,46.867363 183.390152,65.028984   C195.984482,73.333817 202.778366,86.450531 207.319687,100.443886   C220.159134,140.006592 218.619019,179.070526 202.323807,217.448044   C200.306015,222.200226 198.362686,226.984711 196.286087,231.710846   C195.603226,233.264999 195.330215,235.434372 192.021210,235.111679   C191.544830,225.995117 195.513290,217.500610 196.057571,208.130676   C186.909927,218.816956 176.217575,226.728729 162.932022,230.703110   C149.899185,234.601883 136.731003,234.265442 123.138283,230.953323   C123.345345,235.782639 125.523560,239.224625 126.764687,243.325195  M185.937988,124.180367   C182.732666,120.860306 179.360062,117.776848 175.175842,116.061447   C174.700089,116.430336 174.488876,116.507607 174.448608,116.637764   C172.698914,122.294319 164.988434,125.525246 167.817322,133.128540   C168.200027,134.157150 166.720673,135.102341 165.533051,135.391510   C163.605209,135.860962 161.647766,136.208862 159.377701,136.674805   C161.062805,138.449005 158.214310,139.753845 159.124908,141.856583   C161.031693,146.259705 159.627502,149.741455 155.057053,151.480652   C150.993805,153.026840 148.155334,151.062866 145.905991,145.527100   C145.726746,145.085938 145.432755,144.691406 144.954224,143.863846   C137.083755,146.571548 128.703262,146.706116 120.616859,148.478226   C113.820236,149.967682 110.196198,154.742355 110.369339,161.682526   C110.497734,166.829453 110.875473,171.978714 111.357933,177.106628   C112.634392,190.673721 114.232536,204.188416 118.169258,217.317474   C119.010086,220.121689 120.495758,221.867783 123.294586,222.868378   C133.616211,226.558395 144.297134,227.233017 154.796295,224.977173   C188.680298,217.696838 208.119064,187.382095 201.187790,153.323090   C200.214066,148.538284 199.843994,143.435669 195.424133,139.194107   C196.030853,141.250153 196.680496,142.586060 196.783371,143.962845   C197.089066,148.054352 194.487030,151.278244 190.663040,151.840393   C187.177460,152.352798 183.730301,149.776413 182.993546,146.178833   C182.302444,142.804062 185.592300,139.810059 183.053772,136.266769   C182.079926,136.181213 180.250900,136.130341 178.463898,135.829727   C176.965042,135.577560 175.410370,134.980118 175.073807,133.291550   C174.670563,131.268509 176.178680,130.222519 177.756851,129.593262   C179.907227,128.735870 182.201141,128.237198 184.347412,127.371315   C185.434494,126.932739 187.927521,127.160950 185.937988,124.180367  z"/>
                <path fill="#6C6C6C" opacity="1.000000" stroke="none" d=" M184.497925,205.505127   C177.387009,214.158386 168.161636,212.015427 159.502716,210.813339   C153.161850,209.933029 147.837357,205.318619 141.258728,204.622986   C140.498917,204.542648 139.769547,203.878281 139.995148,202.334045   C142.825668,200.859970 146.206512,201.612762 149.324982,201.480194   C158.448822,201.092361 166.947464,196.727951 176.287842,197.627457   C179.712128,197.957230 182.802567,198.591614 185.588547,200.581680   C188.543945,202.692780 187.912109,204.213242 184.497925,205.505127  M159.784851,207.163208   C165.244186,209.836899 170.631027,207.250763 176.056244,206.667542   C170.672363,206.667542 165.288498,206.667542 159.784851,207.163208  M165.001892,203.486176   C170.099594,203.086731 175.197296,202.687271 180.294998,202.287827   C175.071182,203.026901 169.459641,199.147293 165.001892,203.486176  z"/>
                <path fill="#6C6C6C" opacity="1.000000" stroke="none" d=" M173.344406,161.090042   C180.438629,158.990570 189.808182,167.157059 188.872223,176.054337   C188.152618,182.894730 178.548767,187.131531 172.244995,183.602051   C172.711761,181.630249 174.450790,182.014267 175.808838,181.629318   C179.330368,180.631119 183.150757,179.894424 183.894775,175.375717   C184.567642,171.289154 181.416046,165.869278 177.394379,163.900024   C175.949905,163.192734 174.040115,163.263535 173.344406,161.090042  z"/>
                </svg>
              </div>
              
              {/* Creator info */}
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-700 leading-tight">
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
                    {t("actions.created", "Created")} {formatDate(project.createdAt)}
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
                    {/* <DropdownMenuItem>
                      <Star size={16} className="text-gray-500" />
                      <span>
                        {t("actions.addToFavorites", "Add to favorites")}
                      </span>
                    </DropdownMenuItem> */}
                    <DropdownMenuItem onClick={handleDuplicateProject}>
                      <Copy size={16} className="text-gray-500" />
                      <span>{t("actions.duplicate", "Duplicate")}</span>
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem>
                      <LinkIcon size={16} className="text-gray-500" />
                      <span>{t("actions.copyLink", "Copy link")}</span>
                    </DropdownMenuItem> */}
                    {isOutline && qualityTierEnabled && (
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
                      <span className="text-red-500">{t("actions.sendToTrash", "Send to trash")}</span>
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
              >
                {t("actions.cancel", "Cancel")}
              </Button>
              <Button
                onClick={() => {
                  onDelete(project.id, "self");
                  setTrashConfirmOpen(false);
                }}
                variant="outline"
                className="bg-white hover:bg-gray-50"
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
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
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
