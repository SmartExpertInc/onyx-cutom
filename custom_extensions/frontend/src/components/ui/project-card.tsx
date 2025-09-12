import React from "react";
import Link from "next/link";
import { Card } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { cn } from "@/lib/utils";
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
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

interface ProjectCardProps {
  project: {
    id: number;
    title: string;
    instanceName?: string;
    designMicroproductType?: string;
    isPrivate?: boolean;
    createdBy: string;
    createdAt: string;
    isGamma?: boolean;
  };
  onDelete?: (id: number, scope: "self" | "all") => void;
  onRestore?: (id: number) => void;
  onDeletePermanently?: (id: number) => void;
  onDuplicate?: (id: number) => void;
  onRemoveFromFolder?: (id: number) => void;
  onRename?: (id: number) => void;
  onSettings?: (id: number) => void;
  isTrashMode?: boolean;
  folderId?: number | null;
  className?: string;
  t?: (key: string, fallback?: string) => string;
  language?: string;
}

// Helper function to get project type icon
const getProjectTypeIcon = (type: string) => {
  const iconSize = 16;
  const iconClass = "text-white";

  switch (type) {
    case "Training Plan":
      return <TableOfContents size={iconSize} className={iconClass} />;
    case "Quiz":
      return <HelpCircle size={iconSize} className={iconClass} />;
    case "Slide Deck":
      return <Presentation size={iconSize} className={iconClass} />;
    case "Video Lesson Presentation":
      return <Video size={iconSize} className={iconClass} />;
    default:
      return <FileText size={iconSize} className={iconClass} />;
  }
};

// Generate color from string
const stringToColor = (str: string): string => {
  let hash = 0;
  if (!str) return "#3B82F6";
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
  onDuplicate,
  onRemoveFromFolder,
  onRename,
  onSettings,
  isTrashMode = false,
  folderId,
  className,
  t = (key: string, fallback?: string) => fallback || key,
  language = "en",
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  
  const isOutline = (project.designMicroproductType || "").toLowerCase() === "training plan";
  const displayTitle = isOutline ? project.title : project.instanceName || project.title;
  
  // Generate colors
  const bgColor = stringToColor(project.title);
  const avatarColor = stringToColor(project.createdBy);
  
  // Create gradient colors (lighter version of bgColor)
  const gradientFrom = bgColor + "50"; // 25% opacity
  const gradientTo = bgColor + "80";

  const saturatedColor = bgColor;
  
  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleTrashRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuOpen(false);
    if (project.designMicroproductType === "Training Plan") {
      // Handle training plan specific logic
      onDelete?.(project.id, "self");
    } else {
      onDelete?.(project.id, "self");
    }
  };

  const handleRestoreProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuOpen(false);
    onRestore?.(project.id);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isTrashMode) {
      e.preventDefault();
      // Handle trash mode click
    }
  };

  const handleDuplicateProject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuOpen(false);
    onDuplicate?.(project.id);
  };

  const handleRemoveFromFolder = async () => {
    setMenuOpen(false);
    onRemoveFromFolder?.(project.id);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuOpen(false);
    onRename?.(project.id);
  };

  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuOpen(false);
    onSettings?.(project.id);
  };

  return (
    <Card className={cn(
      "group rounded-xl shadow-sm transition-all duration-200 hover:shadow-lg border border-gray-200 relative overflow-hidden",
      className
    )}>
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
            background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`
          }}
        >
          {/* Top row with icon and badge */}
          <div className="flex justify-between items-start">
            {/* List icon in top-left */}
            <div className="w-6 h-6 flex items-center justify-center">
              <List size={16} className="text-gray-500/60" />
            </div>
            
            {/* Private badge in top-right */}
            {project.isPrivate && (
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 border border-gray-200">
                <Lock size={10} className="text-gray-600" />
                <span className="text-xs font-medium text-gray-700">
                  {t("interface.private", "Private")}
                </span>
              </div>
            )}
          </div>
          
          {/* Project type icon overlay */}
          {project.designMicroproductType && (
            <div className="absolute top-3 left-3 w-6 h-6 bg-white/20 backdrop-blur-sm rounded-md flex items-center justify-center">
              {getProjectTypeIcon(project.designMicroproductType)}
            </div>
          )}
          
           {/* Truncated title in center */}
           <div className="flex items-center justify-center flex-1 px-2">
             <h3 
               className="font-semibold text-md text-center leading-tight line-clamp-2"
               style={{ color: saturatedColor }}
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
                  {formatDate(project.createdAt, language)}
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
                      formatDate(project.createdAt, language)
                    )}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isTrashMode ? (
                  <>
                    <DropdownMenuItem onClick={handleRestoreProject}>
                      <span>{t("actions.restore", "Restore")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setMenuOpen(false);
                        onDeletePermanently?.(project.id);
                      }}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <Trash2 size={14} />
                      <span>{t("actions.deletePermanently", "Delete permanently")}</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem>
                      <Share2 size={16} className="text-gray-500" />
                      <span>{t("actions.share", "Share...")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleRename}>
                      <PenLine size={16} className="text-gray-500" />
                      <span>{t("actions.rename", "Rename...")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Star size={16} className="text-gray-500" />
                      <span>{t("actions.addToFavorites", "Add to favorites")}</span>
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
                      <DropdownMenuItem onClick={handleSettings}>
                        <Settings size={16} className="text-gray-500" />
                        <span>{t("actions.settings", "Settings")}</span>
                      </DropdownMenuItem>
                    )}
                    {folderId && (
                      <DropdownMenuItem 
                        onClick={handleRemoveFromFolder}
                        className="text-orange-600 focus:text-orange-600 focus:bg-orange-50"
                      >
                        <FolderMinus size={16} className="text-orange-500" />
                        <span>{t("actions.removeFromFolder", "Remove from Folder")}</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleTrashRequest}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <Trash2 size={14} />
                      <span>{t("actions.sendToTrash", "Send to trash")}</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default ProjectCard;
