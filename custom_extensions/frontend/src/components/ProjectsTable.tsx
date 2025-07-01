// custom_extensions/frontend/src/components/ProjectsTable.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock, 
  MoreHorizontal, 
  Home, 
  Clock, 
  User, 
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
  Settings
} from 'lucide-react';
import FolderSettingsModal from '../app/projects/FolderSettingsModal';

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
  folders.forEach(folder => {
    folderMap.set(folder.id, {
      ...folder,
      children: []
    });
  });

  // Second pass: build tree structure
  folders.forEach(folder => {
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

// Helper function to count total items in a folder (projects + subfolders recursively)
const getTotalItemsInFolder = (folder: Folder, folderProjects: Record<number, Project[]>): number => {
  const projectCount = folderProjects[folder.id]?.length || 0;
  
  // Recursively count items in all subfolders
  const subfolderItemsCount = folder.children?.reduce((total, childFolder) => {
    return total + getTotalItemsInFolder(childFolder, folderProjects);
  }, 0) || 0;
  
  return projectCount + subfolderItemsCount;
};

// Helper function to get total lessons in a folder (including subfolders)
const getTotalLessonsInFolder = (folder: Folder): number => {
  const directLessons = folder.total_lessons || 0;
  
  // Recursively sum lessons from all subfolders
  const subfolderLessons = folder.children?.reduce((total, childFolder) => {
    return total + getTotalLessonsInFolder(childFolder);
  }, 0) || 0;
  
  return directLessons + subfolderLessons;
};

// Helper function to get total hours in a folder (including subfolders)
const getTotalHoursInFolder = (folder: Folder): number => {
  const directHours = folder.total_hours || 0;
  
  // Recursively sum hours from all subfolders
  const subfolderHours = folder.children?.reduce((total, childFolder) => {
    return total + getTotalHoursInFolder(childFolder);
  }, 0) || 0;
  
  return directHours + subfolderHours;
};

// Helper function to get total completion time in a folder (including subfolders)
const getTotalCompletionTimeInFolder = (folder: Folder): number => {
  const directCompletionTime = folder.total_completion_time || 0;
  
  // Recursively sum completion time from all subfolders
  const subfolderCompletionTime = folder.children?.reduce((total, childFolder) => {
    return total + getTotalCompletionTimeInFolder(childFolder);
  }, 0) || 0;
  
  return directCompletionTime + subfolderCompletionTime;
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
  children?: Folder[];
}

interface ProjectsTableProps {
    /** If true – table displays items from Trash and hides create/filter toolbars */
    trashMode?: boolean;
    folderId?: number | null;
}

interface ColumnVisibility {
    title: boolean;
    created: boolean;
    creator: boolean;
    numberOfLessons: boolean;
    estCreationTime: boolean;
    estCompletionTime: boolean;
}

// Recursive folder row component for nested display in list view
const FolderRow: React.FC<{
    folder: Folder;
    level: number;
    index: number;
    trashMode: boolean;
    columnVisibility: ColumnVisibility;
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
}> = ({ 
    folder, 
    level, 
    index, 
    trashMode, 
    columnVisibility, 
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
    handleDeleteFolder
}) => {

    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const folderProjectsList = folderProjects[folder.id] || [];

    return (
        <>
            {/* Folder row */}
            <tr 
                className={`hover:bg-gray-50 transition cursor-pointer group cursor-grab active:cursor-grabbing ${
                    dragOverIndex === index ? 'bg-blue-50 border-t-2 border-blue-300' : ''
                } ${draggedFolder?.id === folder.id ? 'opacity-50' : ''} ${level > 0 ? 'bg-gray-50' : ''}`}
                onClick={(e) => {
                    if (!isDragging) {
                        toggleFolder(folder.id);
                    }
                }}
                draggable={!trashMode}
                data-folder-id={folder.id}
                onDragStart={(e) => handleDragStart(e, folder, 'folder')}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    handleDragOver(e, index);
                    e.currentTarget.classList.add('bg-blue-50', 'border-2', 'border-blue-300');
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    handleDragLeave(e);
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        e.currentTarget.classList.remove('bg-blue-50', 'border-2', 'border-blue-300');
                    }
                }}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
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
                            <Folder size={16} className="text-blue-600 mr-2" />
                            <span className="font-semibold text-blue-700 truncate max-w-[200px]" title={folder.name}>{folder.name}</span>
                            <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {getTotalItemsInFolder(folder, folderProjects)} {getTotalItemsInFolder(folder, folderProjects) === 1 ? 'item' : 'items'}
                            </span>
                        </span>
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
                            return totalCompletionTime > 0 ? formatCompletionTime(totalCompletionTime) : '-';
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
                        className={`hover:bg-gray-50 transition group cursor-grab active:cursor-grabbing bg-gray-50 ${
                            dragOverIndex === projectIndex ? 'bg-blue-50 border-t-2 border-blue-300' : ''
                        } ${draggedProject?.id === p.id ? 'opacity-50' : ''}`}
                        draggable={!trashMode}
                        onDragStart={(e) => handleDragStart(e, p, 'project')}
                        onDragOver={(e) => handleDragOver(e, projectIndex)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, projectIndex)}
                        onDragEnd={handleDragEnd}
                    >
                        {columnVisibility.title && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                <span className="inline-flex items-center" style={{ paddingLeft: `${(level + 1) * 20}px` }}>
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
                                    <div className="w-4 h-4 border-l-2 border-blue-200 mr-3"></div>
                                    <Star size={16} className="text-gray-300 mr-2" />
                                    <Link href={trashMode ? '#' : `/projects/view/${p.id}` } className="hover:underline cursor-pointer text-gray-900 truncate max-w-[200px]" title={p.title}>
                                        {p.title}
                                    </Link>
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
                                    return lessonData ? formatCompletionTime(lessonData.completionTime) : '-';
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
                    expandedFolders={expandedFolders}
                    folderProjects={folderProjects}
                    lessonDataCache={lessonDataCache}
                    draggedFolder={draggedFolder}
                    draggedProject={draggedProject}
                    dragOverIndex={dragOverIndex}
                    isDragging={isDragging}
                    isReordering={isReordering}
                    formatDate={formatDate}
                    formatCompletionTime={formatCompletionTime}
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
                />
            ))}
        </>
    );
};

const ProjectCard: React.FC<{ 
    project: Project;
    onDelete: (id: number, scope: 'self' | 'all') => void;
    onRestore: (id: number) => void;
    onDeletePermanently: (id: number) => void;
    isTrashMode: boolean;
    folderId?: number | null;
}> = ({ project, onDelete, onRestore, onDeletePermanently, isTrashMode, folderId }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [permanentDeleteConfirmOpen, setPermanentDeleteConfirmOpen] = useState(false);
    const [trashConfirmOpen, setTrashConfirmOpen] = useState(false);
    const [showRestorePrompt, setShowRestorePrompt] = useState(false);
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(project.designMicroproductType ? project.title : (project.instanceName || project.title));
    const [menuPosition, setMenuPosition] = useState<'above' | 'below'>('below');
    const menuRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    
    const isOutline = (project.designMicroproductType || "").toLowerCase() === "training plan";
    const displayTitle = isOutline ? project.title : (project.instanceName || project.title);
    
    const stringToColor = (str: string): string => {
        let hash = 0;
        if (!str) return '#CCCCCC';
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            let value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    };
    
    const bgColor = stringToColor(project.title);
    const avatarColor = stringToColor(project.createdBy);

    const handleRemoveFromFolder = async () => {
        try {
            const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            const devUserId = "dummy-onyx-user-id-for-testing";
            if (devUserId && process.env.NODE_ENV === 'development') {
                headers['X-Dev-Onyx-User-ID'] = devUserId;
            }
            
            const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/${project.id}/folder`, {
                method: 'PUT',
                headers,
                credentials: 'same-origin',
                body: JSON.stringify({ folder_id: null })
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    redirectToMainAuth('/auth/login');
                    return;
                }
                throw new Error(`Failed to remove from folder: ${response.status}`);
            }
            
            // Refresh the page to update the view
            window.location.reload();
        } catch (error) {
            console.error('Error removing from folder:', error);
            alert('Failed to remove project from folder');
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
            
            setMenuPosition(spaceBelow < menuHeight ? 'above' : 'below');
        }
        setMenuOpen(prev => !prev);
    };

    const handleDragStart = (e: React.DragEvent) => {
        // Add visual feedback to the dragged element
        const target = e.currentTarget as HTMLElement;
        target.style.opacity = '0.5';
        target.style.transform = 'rotate(5deg)';
        
        e.dataTransfer.setData('application/json', JSON.stringify({
            projectId: project.id,
            projectName: project.title,
            type: 'project'
        }));
        e.dataTransfer.effectAllowed = 'move';
        
        // Set a custom drag image (optional)
        const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
        dragImage.style.width = '200px';
        dragImage.style.height = 'auto';
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
        target.style.opacity = '1';
        target.style.transform = 'rotate(0deg)';
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                // Check if the click is on the portal modal
                const target = event.target as Element;
                if (target.closest('[data-modal-portal]')) {
                    return; // Don't close if clicking inside the modal
                }
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleTrashRequest = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setMenuOpen(false);
        if (project.designMicroproductType === 'Training Plan') {
            setTrashConfirmOpen(true);
        } else {
            onDelete(project.id, 'self');
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
    }

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
    
    return (
        <div 
            ref={cardRef} 
            className="bg-white rounded-xl shadow-sm group transition-all duration-200 hover:shadow-lg border border-gray-200 relative cursor-grab active:cursor-grabbing"
            draggable={!isTrashMode}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <Link href={isTrashMode ? '#' : `/projects/view/${project.id}`} onClick={handleCardClick} className="block">
                <div className="relative h-40 rounded-t-lg" style={{ backgroundColor: bgColor, backgroundImage: `linear-gradient(45deg, ${bgColor}99, ${stringToColor(project.title.split("").reverse().join(""))}99)`}}>
                    {project.isGamma ? (
                        <div className="p-4 text-white flex flex-col justify-between h-full">
                            <div>
                                <div className="text-xs font-semibold">GAMMA</div>
                                <h3 className="font-bold text-2xl mt-2">Tips and tricks ⚡️</h3>
                            </div>
                            <p className="text-xs">Ready to learn how to take your gammas to the next level?</p>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center p-4 text-white">
                            <h3 className="font-bold text-lg text-center truncate max-w-full" title={displayTitle}>{displayTitle}</h3>
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 truncate text-sm max-w-full" title={displayTitle}>{displayTitle}</h3>
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                        {project.isPrivate && (
                            <div className="flex items-center gap-1.5 bg-gray-100 rounded-md px-2 py-0.5">
                                <Lock size={12} />
                                <span className="text-gray-700">Private</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{backgroundColor: avatarColor}}>
                                {project.createdBy.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">Created by you</span>
                                <span className="text-xs text-gray-500">{formatDate(project.createdAt)}</span>
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
                    className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                >
                    <MoreHorizontal size={16} />
                </button>
                {menuOpen && (
                    <div 
                        data-modal-portal="true"
                        className={`fixed w-60 bg-white rounded-lg shadow-2xl z-[9999] border border-gray-100 p-1 ${
                            menuPosition === 'above' 
                                ? 'bottom-auto mb-2' 
                                : 'top-auto mt-2'
                        }`}
                        style={{
                            left: buttonRef.current ? buttonRef.current.getBoundingClientRect().right - 240 : 0,
                            top: buttonRef.current ? (menuPosition === 'above' 
                                ? buttonRef.current.getBoundingClientRect().top - 320
                                : buttonRef.current.getBoundingClientRect().bottom + 8) : 0
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-3 py-2 border-b border-gray-100">
                            <p className="font-semibold text-sm text-gray-900 truncate">{project.title}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Created {formatDate(project.createdAt)}
                            </p>
                        </div>
                        {isTrashMode ? (
                            <div className="py-1">
                                <button
                                    onClick={handleRestoreProject}
                                    className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
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
                                    className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md">
                                    <Trash2 size={14} />
                                    <span>Delete permanently</span>
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="py-1">
                                    <button className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                        <Share2 size={16} className="text-gray-500" />
                                        <span>Share...</span>
                                    </button>
                                    <button
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            e.preventDefault(); 
                                            setMenuOpen(false); 
                                            setRenameModalOpen(true); 
                                        }}
                                        className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                                    >
                                        <PenLine size={16} className="text-gray-500"/>
                                        <span>Rename...</span>
                                    </button>
                                    <button className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                        <Star size={16} className="text-gray-500"/>
                                        <span>Add to favorites</span>
                                    </button>
                                    <button className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                        <Copy size={16} className="text-gray-500"/>
                                        <span>Duplicate</span>
                                    </button>
                                    <button className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                        <LinkIcon size={16} className="text-gray-500"/>
                                        <span>Copy link</span>
                                    </button>
                                    {folderId && (
                                        <button 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                e.preventDefault(); 
                                                setMenuOpen(false); 
                                                handleRemoveFromFolder(); 
                                            }}
                                            className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-md"
                                        >
                                            <FolderMinus size={16} className="text-orange-500"/>
                                            <span>Remove from Folder</span>
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
                                        className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md"
                                    >
                                        <Trash2 size={14} />
                                        <span>Send to trash</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {permanentDeleteConfirmOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-40" onClick={() => setPermanentDeleteConfirmOpen(false)}>
                    <div className="bg-white rounded-lg shadow-xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <h4 className="font-semibold text-lg mb-2 text-gray-900">Are you sure?</h4>
                        <p className="text-sm text-gray-600 mb-4">This action is permanent and cannot be undone. The project will be deleted forever.</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setPermanentDeleteConfirmOpen(false)} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800">Cancel</button>
                            <button onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onDeletePermanently(project.id);
                                setPermanentDeleteConfirmOpen(false);
                            }} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700">Delete Permanently</button>
                        </div>
                    </div>
                </div>
            )}

            {trashConfirmOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-40" onClick={() => setTrashConfirmOpen(false)}>
                    <div className="bg-white rounded-lg shadow-xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <h4 className="font-semibold text-lg mb-2 text-gray-900">Move to Trash</h4>
                        <p className="text-sm text-gray-600 mb-4">This is a Course Outline. Do you want to move just the outline, or the outline and all its lessons?</p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setTrashConfirmOpen(false)} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800">Cancel</button>
                            <button onClick={() => { onDelete(project.id, 'self'); setTrashConfirmOpen(false); }} className="px-4 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200">Outline Only</button>
                            <button onClick={() => { onDelete(project.id, 'all'); setTrashConfirmOpen(false); }} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700">Move All</button>
                        </div>
                    </div>
                </div>
            )}
            
            {showRestorePrompt && (
                 <div className="fixed inset-0 bg-black/10 flex items-center justify-center p-4 z-40" onClick={() => setShowRestorePrompt(false)}>
                    <div 
                        className="bg-orange-100 border border-orange-200 rounded-lg py-3 px-4 shadow-lg flex items-center gap-3" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <AlertTriangle className="text-orange-500 flex-shrink-0" size={20} />
                        <p className="text-sm text-orange-900">
                            Want to edit this? It's in the trash.&nbsp;
                            <button
                                onClick={() => {
                                    onRestore(project.id);
                                    setShowRestorePrompt(false);
                                }}
                                className="font-semibold underline hover:text-orange-700"
                            >
                                Restore it
                            </button>
                        </p>
                    </div>
                </div>
            )}

            {/* ---------------- Rename Modal ---------------- */}
            {renameModalOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-40" onClick={() => { if (!isRenaming) setRenameModalOpen(false); }}>
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <h4 className="font-semibold text-lg mb-4 text-gray-900">Rename</h4>

                        <div className="mb-6">
                            <label htmlFor="newName" className="block text-sm font-medium text-gray-700 mb-1">New Name:</label>
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
                                onClick={() => { if (!isRenaming) setRenameModalOpen(false); }}
                                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800"
                                disabled={isRenaming}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    setIsRenaming(true);
                                    try {
                                        const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
                                        const headers: HeadersInit = { 'Content-Type': 'application/json' };
                                        const devUserId = "dummy-onyx-user-id-for-testing";
                                        if (devUserId && process.env.NODE_ENV === 'development') {
                                            headers['X-Dev-Onyx-User-ID'] = devUserId;
                                        }

                                        const updateProject = async (id: number, bodyPayload: any) => {
                                            const resp = await fetch(`${CUSTOM_BACKEND_URL}/projects/update/${id}`, {
                                                method: 'PUT',
                                                headers,
                                                credentials: 'same-origin',
                                                body: JSON.stringify(bodyPayload)
                                            });
                                            if (!resp.ok) {
                                                if (resp.status === 401 || resp.status === 403) {
                                                    redirectToMainAuth('/auth/login');
                                                    return;
                                                }
                                                const errTxt = await resp.text();
                                                throw new Error(`Failed to update project ${id}: ${resp.status} ${errTxt}`);
                                            }
                                        };

                                        const tasks: Promise<void>[] = [];
                                        const oldProjectName = project.title;

                                        if (isOutline) {
                                            tasks.push(updateProject(project.id, { projectName: newName }));
                                            const listResp = await fetch(`${CUSTOM_BACKEND_URL}/projects`, { headers, cache: 'no-store', credentials: 'same-origin' });
                                            if (listResp.ok) {
                                                const listData: any[] = await listResp.json();
                                                listData
                                                    .filter((p) => p.projectName === oldProjectName && p.id !== project.id)
                                                    .forEach((p) => tasks.push(updateProject(p.id, { projectName: newName })));
                                            } else if (listResp.status === 401 || listResp.status === 403) {
                                                redirectToMainAuth('/auth/login');
                                                return;
                                            }
                                        } else {
                                            tasks.push(updateProject(project.id, { microProductName: newName }));
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
                                {isRenaming ? 'Saving...' : 'Rename'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ProjectRowMenu: React.FC<{
    project: Project;
    formatDate: (date: string) => string;
    trashMode: boolean;
    onDelete: (id: number, scope: 'self' | 'all') => void;
    onRestore: (id: number) => void;
    onDeletePermanently: (id: number) => void;
    folderId?: number | null;
}> = ({ project, formatDate, trashMode, onDelete, onRestore, onDeletePermanently, folderId }) => {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [renameModalOpen, setRenameModalOpen] = React.useState(false);
    const [isRenaming, setIsRenaming] = React.useState(false);
    const [newName, setNewName] = React.useState(project.title);
    const [permanentDeleteConfirmOpen, setPermanentDeleteConfirmOpen] = React.useState(false);
    const [trashConfirmOpen, setTrashConfirmOpen] = React.useState(false);
    const [menuPosition, setMenuPosition] = React.useState<'above' | 'below'>('below');
    const menuRef = React.useRef<HTMLDivElement>(null);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const isOutline = (project.designMicroproductType || "").toLowerCase() === "training plan";
    
    const handleRemoveFromFolder = async () => {
        try {
            const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            const devUserId = "dummy-onyx-user-id-for-testing";
            if (devUserId && process.env.NODE_ENV === 'development') {
                headers['X-Dev-Onyx-User-ID'] = devUserId;
            }
            
            const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/${project.id}/folder`, {
                method: 'PUT',
                headers,
                credentials: 'same-origin',
                body: JSON.stringify({ folder_id: null })
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    redirectToMainAuth('/auth/login');
                    return;
                }
                throw new Error(`Failed to remove from folder: ${response.status}`);
            }
            
            // Refresh the page to update the view
            window.location.reload();
        } catch (error) {
            console.error('Error removing from folder:', error);
            alert('Failed to remove project from folder');
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
            
            setMenuPosition(spaceBelow < menuHeight ? 'above' : 'below');
        }
        setMenuOpen(prev => !prev);
    };
    
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                // Check if the click is on the portal modal
                const target = event.target as Element;
                if (target.closest('[data-modal-portal]')) {
                    return; // Don't close if clicking inside the modal
                }
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    React.useEffect(() => {
        if (typeof window !== 'undefined') (window as any).__modalOpen = menuOpen;
        return () => {
            if (typeof window !== 'undefined') (window as any).__modalOpen = false;
        };
    }, [menuOpen]);

    const handleTrashRequest = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setMenuOpen(false);
        if (project.designMicroproductType === 'Training Plan') {
            setTrashConfirmOpen(true);
        } else {
            onDelete(project.id, 'self');
        }
    };
    return (
        <div ref={menuRef} className="inline-block">
            <button 
                ref={buttonRef}
                className="text-gray-400 hover:text-gray-600" 
                onClick={handleMenuToggle}
            >
                <MoreHorizontal size={20} />
            </button>
            {menuOpen && createPortal(
                <div 
                    data-modal-portal="true"
                    className={`fixed w-60 bg-white rounded-lg shadow-2xl z-[9999] border border-gray-100 p-1 ${
                        menuPosition === 'above' 
                            ? 'bottom-auto mb-2' 
                            : 'top-auto mt-2'
                    }`}
                    style={{
                        left: buttonRef.current ? buttonRef.current.getBoundingClientRect().right - 240 : 0,
                        top: buttonRef.current ? (menuPosition === 'above' 
                            ? buttonRef.current.getBoundingClientRect().top - 320
                            : buttonRef.current.getBoundingClientRect().bottom + 8) : 0
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-3 py-2 border-b border-gray-100">
                        <p className="font-semibold text-sm text-gray-900 truncate">{project.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Created {formatDate(project.createdAt)}
                        </p>
                    </div>
                    {trashMode ? (
                        <div className="py-1">
                            <button
                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); setMenuOpen(false); onRestore(project.id); }}
                                className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                <RefreshCw size={14} />
                                <span>Restore</span>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); setMenuOpen(false); setPermanentDeleteConfirmOpen(true); }}
                                className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md">
                                <Trash2 size={14} />
                                <span>Delete permanently</span>
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="py-1">
                                <button className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                    <Share2 size={16} className="text-gray-500" />
                                    <span>Share...</span>
                                </button>
                                <button
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        e.preventDefault(); 
                                        setMenuOpen(false); 
                                        setRenameModalOpen(true); 
                                    }}
                                    className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                                >
                                    <PenLine size={16} className="text-gray-500"/>
                                    <span>Rename...</span>
                                </button>
                                <button className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                    <Star size={16} className="text-gray-500"/>
                                    <span>Add to favorites</span>
                                </button>
                                <button className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                    <Copy size={16} className="text-gray-500"/>
                                    <span>Duplicate</span>
                                </button>
                                <button className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                    <LinkIcon size={16} className="text-gray-500"/>
                                    <span>Copy link</span>
                                </button>
                                {folderId && (
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            e.preventDefault(); 
                                            setMenuOpen(false); 
                                            handleRemoveFromFolder(); 
                                        }}
                                        className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-md"
                                    >
                                        <FolderMinus size={16} className="text-orange-500"/>
                                        <span>Remove from Folder</span>
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
                                    className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md"
                                >
                                    <Trash2 size={14} />
                                    <span>Send to trash</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>,
                document.body
            )}
            {/* Permanent Delete Modal */}
            {permanentDeleteConfirmOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-40" onClick={() => setPermanentDeleteConfirmOpen(false)}>
                    <div className="bg-white rounded-lg shadow-xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <h4 className="font-semibold text-lg mb-2 text-gray-900">Are you sure?</h4>
                        <p className="text-sm text-gray-600 mb-4">This action is permanent and cannot be undone. The project will be deleted forever.</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setPermanentDeleteConfirmOpen(false)} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800">Cancel</button>
                            <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDeletePermanently(project.id); setPermanentDeleteConfirmOpen(false); }} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700">Delete Permanently</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Trash Confirm Modal */}
            {trashConfirmOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-40" onClick={() => setTrashConfirmOpen(false)}>
                    <div className="bg-white rounded-lg shadow-xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <h4 className="font-semibold text-lg mb-2 text-gray-900">Move to Trash</h4>
                        <p className="text-sm text-gray-600 mb-4">This is a Course Outline. Do you want to move just the outline, or the outline and all its lessons?</p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setTrashConfirmOpen(false)} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800">Cancel</button>
                            <button onClick={() => { onDelete(project.id, 'self'); setTrashConfirmOpen(false); }} className="px-4 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200">Outline Only</button>
                            <button onClick={() => { onDelete(project.id, 'all'); setTrashConfirmOpen(false); }} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700">Move All</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Rename Modal */}
            {renameModalOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-40" onClick={() => { if (!isRenaming) setRenameModalOpen(false); }}>
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <h4 className="font-semibold text-lg mb-4 text-gray-900">Rename</h4>
                        <div className="mb-6">
                            <label htmlFor="newName" className="block text-sm font-medium text-gray-700 mb-1">New Name:</label>
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
                                onClick={() => { if (!isRenaming) setRenameModalOpen(false); }}
                                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800"
                                disabled={isRenaming}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    setIsRenaming(true);
                                    try {
                                        const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
                                        const headers: HeadersInit = { 'Content-Type': 'application/json' };
                                        const devUserId = "dummy-onyx-user-id-for-testing";
                                        if (devUserId && process.env.NODE_ENV === 'development') {
                                            headers['X-Dev-Onyx-User-ID'] = devUserId;
                                        }
                                        const updateProject = async (id: number, bodyPayload: any) => {
                                            const resp = await fetch(`${CUSTOM_BACKEND_URL}/projects/update/${id}`, {
                                                method: 'PUT',
                                                headers,
                                                credentials: 'same-origin',
                                                body: JSON.stringify(bodyPayload)
                                            });
                                            if (!resp.ok) {
                                                if (resp.status === 401 || resp.status === 403) {
                                                    redirectToMainAuth('/auth/login');
                                                    return;
                                                }
                                                const errTxt = await resp.text();
                                                throw new Error(`Failed to update project ${id}: ${resp.status} ${errTxt}`);
                                            }
                                        };
                                        const tasks: Promise<void>[] = [];
                                        const oldProjectName = project.title;
                                        if (isOutline) {
                                            tasks.push(updateProject(project.id, { projectName: newName }));
                                            const listResp = await fetch(`${CUSTOM_BACKEND_URL}/projects`, { headers, cache: 'no-store', credentials: 'same-origin' });
                                            if (listResp.ok) {
                                                const listData: any[] = await listResp.json();
                                                listData
                                                    .filter((p) => p.projectName === oldProjectName && p.id !== project.id)
                                                    .forEach((p) => tasks.push(updateProject(p.id, { projectName: newName })));
                                            } else if (listResp.status === 401 || listResp.status === 403) {
                                                redirectToMainAuth('/auth/login');
                                                return;
                                            }
                                        } else {
                                            tasks.push(updateProject(project.id, { microProductName: newName }));
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
                                {isRenaming ? 'Saving...' : 'Rename'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const FolderRowMenu: React.FC<{
    folder: Folder;
    formatDate: (date: string) => string;
    trashMode: boolean;
    onDeleteFolder: (id: number) => void;
}> = ({ folder, formatDate, trashMode, onDeleteFolder }) => {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [menuPosition, setMenuPosition] = React.useState<'above' | 'below'>('below');
    const [showSettingsModal, setShowSettingsModal] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    
    const handleMenuToggle = () => {
        if (!menuOpen && buttonRef.current) {
            // Calculate if there's enough space below
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - buttonRect.bottom;
            const menuHeight = 200; // Approximate menu height
            
            setMenuPosition(spaceBelow < menuHeight ? 'above' : 'below');
        }
        setMenuOpen(prev => !prev);
    };
    
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                // Check if the click is on the portal modal
                const target = event.target as Element;
                if (target.closest('[data-modal-portal]')) {
                    return; // Don't close if clicking inside the modal
                }
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    React.useEffect(() => {
        if (typeof window !== 'undefined') (window as any).__modalOpen = menuOpen;
        return () => {
            if (typeof window !== 'undefined') (window as any).__modalOpen = false;
        };
    }, [menuOpen]);

    const handleDeleteFolder = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setMenuOpen(false);
        onDeleteFolder(folder.id);
    };

    const handleSettingsClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setMenuOpen(false);
        setShowSettingsModal(true);
    };

    return (
        <>
            <div ref={menuRef} className="inline-block">
                <button 
                    ref={buttonRef}
                    className="text-gray-400 hover:text-gray-600" 
                    onClick={handleMenuToggle}
                >
                    <MoreHorizontal size={20} />
                </button>
                {menuOpen && createPortal(
                    <div 
                        data-modal-portal="true"
                        className={`fixed w-60 bg-white rounded-lg shadow-2xl z-[9999] border border-gray-100 p-1 ${
                            menuPosition === 'above' 
                                ? 'bottom-auto mb-2' 
                                : 'top-auto mt-2'
                        }`}
                        style={{
                            left: buttonRef.current ? buttonRef.current.getBoundingClientRect().right - 240 : 0,
                            top: buttonRef.current ? (menuPosition === 'above' 
                                ? buttonRef.current.getBoundingClientRect().top - 220
                                : buttonRef.current.getBoundingClientRect().bottom + 8) : 0
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-3 py-2 border-b border-gray-100">
                            <p className="font-semibold text-sm text-gray-900 truncate">{folder.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Created {formatDate(folder.created_at)}
                            </p>
                        </div>
                        <div className="py-1">
                            <button className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                <Share2 size={16} className="text-gray-500" />
                                <span>Share</span>
                            </button>
                            <button className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                <PenLine size={16} className="text-gray-500" />
                                <span>Rename</span>
                            </button>
                            <button 
                                onClick={handleSettingsClick}
                                className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                            >
                                <Settings size={16} className="text-gray-500" />
                                <span>Settings</span>
                            </button>
                        </div>
                        <div className="py-1 border-t border-gray-100">
                            <button 
                                onClick={handleDeleteFolder}
                                className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md"
                            >
                                <Trash2 size={14} />
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
            <FolderSettingsModal
                open={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                folderName={folder.name}
                currentTier="starter"
                onTierChange={(tier) => {
                    console.log('Folder tier changed to:', tier);
                    // TODO: Implement API call to save folder tier
                }}
            />
        </>
    );
};

const ProjectsTable: React.FC<ProjectsTableProps> = ({ trashMode = false, folderId = null }) => {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'title' | 'created' | 'lastViewed'>('lastViewed');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedProjects, setSelectedProjects] = useState<Set<number>>(new Set());
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
    const [folderProjects, setFolderProjects] = useState<Record<number, Project[]>>({});
    const [lessonDataCache, setLessonDataCache] = useState<Record<number, { lessonCount: number | string, totalHours: number | string, completionTime: number | string }>>({});
    const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
        title: true,
        created: true,
        creator: true,
        numberOfLessons: true,
        estCreationTime: true,
        estCompletionTime: true,
    });
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
    
    // Drag and drop reordering state
    const [draggedProject, setDraggedProject] = useState<Project | null>(null);
    const [draggedFolder, setDraggedFolder] = useState<Folder | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [isReordering, setIsReordering] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Add a refresh function that can be called externally
    const refreshProjects = useCallback(async () => {
        setLoading(true);
        setError(null);
        const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
        
        // Always fetch all projects to calculate folder counts, but filter display based on folderId
        let projectsApiUrl = `${CUSTOM_BACKEND_URL}${trashMode ? '/projects/trash' : '/projects'}`;
        
        // If viewing a specific folder, we'll still fetch all projects but filter display
        // This allows us to calculate folder counts for the sidebar

        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            const devUserId = "dummy-onyx-user-id-for-testing";
            if (devUserId && process.env.NODE_ENV === 'development') {
                headers['X-Dev-Onyx-User-ID'] = devUserId;
            }

            const [projectsResponse, foldersResponse] = await Promise.all([
                fetch(projectsApiUrl, { headers, cache: 'no-store', credentials: 'same-origin' }),
                !trashMode ? fetch(`${CUSTOM_BACKEND_URL}/projects/folders`, { headers, cache: 'no-store', credentials: 'same-origin' }) : Promise.resolve(null)
            ]);

            if (!projectsResponse.ok) {
                if (projectsResponse.status === 401 || projectsResponse.status === 403) {
                    redirectToMainAuth('/auth/login');
                    return;
                }
                throw new Error(`Failed to fetch projects: ${projectsResponse.status}`);
            }

            const projectsData = await projectsResponse.json();
            const processedProjects = projectsData.map((p: any) => ({
                id: p.id,
                title: p.projectName || p.microproduct_name || 'Untitled',
                imageUrl: p.imageUrl || '',
                lastViewed: p.lastViewed || 'Never',
                createdAt: p.created_at,
                createdBy: p.createdBy || 'You',
                isPrivate: p.isPrivate || true,
                designMicroproductType: p.design_microproduct_type,
                isGamma: p.isGamma || false,
                instanceName: p.microproduct_name,
                folderId: p.folder_id,
                order: p.order || 0
            }));

            // Sort projects by order field
            const sortedProjects = processedProjects.sort((a: Project, b: Project) => (a.order || 0) - (b.order || 0));

            // ---- Filter lessons that belong to outlines from the main products page ----
            const deduplicateProjects = (projectsArr: Project[]): Project[] => {
                const outlineNames = new Set<string>();
                const filteredProjects: Project[] = [];
                const grouped: Record<string, { outline: Project | null; others: Project[] }> = {};

                // First pass: collect all outline names and group by title for legacy support
                projectsArr.forEach((proj) => {
                    const isOutline = (proj.designMicroproductType || "").toLowerCase() === "training plan";
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
                    const isOutline = (proj.designMicroproductType || "").toLowerCase() === "training plan";
                    
                    if (isOutline) {
                        // Always include outlines
                        filteredProjects.push(proj);
                    } else {
                        const projectTitle = proj.title.trim();
                        let belongsToOutline = false;

                        // Method 1: Legacy logic - check if there's an outline with the same exact title
                        const groupForThisTitle = grouped[proj.title];
                        if (groupForThisTitle && groupForThisTitle.outline) {
                            belongsToOutline = true;
                        }

                        // Method 2: New logic - check if this project follows the "Outline Name: Lesson Title" pattern
                        if (!belongsToOutline && projectTitle.includes(': ')) {
                            const outlinePart = projectTitle.split(': ')[0].trim();
                            if (outlineNames.has(outlinePart)) {
                                belongsToOutline = true;
                            }
                        }

                        // Only include projects that don't belong to an outline (either legacy or new pattern)
                        if (!belongsToOutline) {
                            filteredProjects.push(proj);
                        }
                    }
                });

                return filteredProjects;
            };

            const allProjects = deduplicateProjects(sortedProjects);
            setProjects(allProjects);

            // Calculate folder projects mapping for all folders
            const folderProjectsMap: Record<number, Project[]> = {};
            allProjects.forEach(project => {
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
                } else if (foldersResponse.status === 401 || foldersResponse.status === 403) {
                    redirectToMainAuth('/auth/login');
                    return;
                }
            } else {
                setFolders([]);
            }



        } catch (err) {
            console.error('Error fetching projects:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    }, [trashMode, folderId, router]);

    // Fetch projects for a specific folder
    const fetchFolderProjects = useCallback(async (folderId: number) => {
        const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        const devUserId = "dummy-onyx-user-id-for-testing";
        if (devUserId && process.env.NODE_ENV === 'development') {
            headers['X-Dev-Onyx-User-ID'] = devUserId;
        }

        try {
            const response = await fetch(`${CUSTOM_BACKEND_URL}/projects?folder_id=${folderId}`, { 
                headers, 
                cache: 'no-store',
                credentials: 'same-origin'
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    redirectToMainAuth('/auth/login');
                    return;
                }
                throw new Error(`Failed to fetch folder projects: ${response.status}`);
            }

            const projectsData = await response.json();
            const processedProjects = projectsData.map((p: any) => ({
                id: p.id,
                title: p.projectName || p.microproduct_name || 'Untitled',
                imageUrl: p.imageUrl || '',
                lastViewed: p.lastViewed || 'Never',
                createdAt: p.created_at,
                createdBy: p.createdBy || 'You',
                isPrivate: p.isPrivate || true,
                designMicroproductType: p.design_microproduct_type,
                isGamma: p.isGamma || false,
                instanceName: p.microproduct_name,
                folderId: p.folder_id,
                order: p.order || 0
            }));

            // Sort folder projects by order field
            const sortedProjects = processedProjects.sort((a: Project, b: Project) => (a.order || 0) - (b.order || 0));

            setFolderProjects(prev => ({
                ...prev,
                [folderId]: sortedProjects
            }));
        } catch (error) {
            console.error('Error fetching folder projects:', error);
        }
    }, [router]);

    // Toggle folder expansion
    const toggleFolder = useCallback((folderId: number) => {
        setExpandedFolders(prev => {
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
    }, [folderProjects, fetchFolderProjects]);

    // Helper function to get unassigned projects
const getUnassignedProjects = useCallback(() => {
    return projects.filter(p => p.folderId === null);
}, [projects]);

// Helper function to get projects for a specific folder (including subfolders)
const getProjectsForFolder = useCallback((targetFolderId: number | null) => {
    if (targetFolderId === null) {
        return projects;
    }
    
    // Get all projects that belong to this folder or any of its subfolders
    const getFolderAndSubfolderIds = (folderId: number): number[] => {
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return [folderId];
        
        const subfolderIds = folder.children?.flatMap(child => getFolderAndSubfolderIds(child.id)) || [];
        return [folderId, ...subfolderIds];
    };
    
    const folderIds = getFolderAndSubfolderIds(targetFolderId);
    return projects.filter(p => p.folderId && folderIds.includes(p.folderId));
}, [projects, folders]);

    // Helper function to calculate lesson data for a project
    const getLessonData = useCallback(async (project: Project) => {
        if (project.designMicroproductType !== 'Training Plan') {
            return { lessonCount: '-', totalHours: '-', completionTime: '-' };
        }
        
        try {
            const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            const devUserId = "dummy-onyx-user-id-for-testing";
            if (devUserId && process.env.NODE_ENV === 'development') {
                headers['X-Dev-Onyx-User-ID'] = devUserId;
            }
            
            const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/${project.id}/lesson-data`, {
                method: 'GET',
                headers,
                credentials: 'same-origin'
            });
            
            if (response.ok) {
                const data = await response.json();
                return { 
                    lessonCount: data.lessonCount || 0, 
                    totalHours: data.totalHours || 0,
                    completionTime: data.completionTime || 0
                };
            } else if (response.status === 401 || response.status === 403) {
                router.push('/auth/login');
                return { lessonCount: '?', totalHours: '?', completionTime: '?' };
            } else {
                console.error('Failed to fetch lesson data:', response.status);
                return { lessonCount: '?', totalHours: '?', completionTime: '?' };
            }
        } catch (error) {
            console.error('Error fetching lesson data:', error);
            return { lessonCount: '?', totalHours: '?', completionTime: '?' };
        }
    }, [router]);

    // Helper function to format completion time
    const formatCompletionTime = (minutes: number | string): string => {
        if (typeof minutes === 'string' || minutes === 0) {
            return minutes.toString();
        }
        
        if (minutes < 60) {
            return `${minutes}m`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            if (remainingMinutes === 0) {
                return `${hours}h`;
            } else {
                return `${hours}h ${remainingMinutes}m`;
            }
        }
    };

    // Load lesson data for all Training Plan projects on mount
    useEffect(() => {
        const loadLessonData = async () => {
            const trainingPlanProjects = projects.filter(p => p.designMicroproductType === 'Training Plan');
            const newCache: Record<number, { lessonCount: number | string, totalHours: number | string, completionTime: number | string }> = {};
            
            for (const project of trainingPlanProjects) {
                try {
                    const data = await getLessonData(project);
                    newCache[project.id] = data;
                } catch (error) {
                    console.error(`Error loading lesson data for project ${project.id}:`, error);
                    newCache[project.id] = { lessonCount: '?', totalHours: '?', completionTime: '?' };
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
        window.addEventListener('refreshProjects', handleRefresh);
        return () => window.removeEventListener('refreshProjects', handleRefresh);
    }, [refreshProjects]);

    // Handle clicking outside the columns dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('[data-columns-dropdown]')) {
                setShowColumnsDropdown(false);
            }
        };

        if (showColumnsDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showColumnsDropdown]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays <= 365) return `${Math.floor(diffDays / 30)} months ago`;
        return date.toLocaleDateString();
    };

    const handleDeleteProject = async (projectId: number, scope: 'self' | 'all' = 'self') => {
        const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
        const deleteApiUrl = `${CUSTOM_BACKEND_URL}/projects/delete-multiple`;
        
        const originalProjects = [...projects];
        
        // Optimistically update UI
        setProjects(currentProjects => currentProjects.filter(p => p.id !== projectId));

        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };
            const devUserId = "dummy-onyx-user-id-for-testing";
            if (devUserId && process.env.NODE_ENV === 'development') {
                headers['X-Dev-Onyx-User-ID'] = devUserId;
            }
            const response = await fetch(deleteApiUrl, { 
                method: 'POST', 
                headers,
                credentials: 'same-origin',
                body: JSON.stringify({ project_ids: [projectId], scope: scope })
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    router.push('/auth/login');
                    return;
                }
                // Revert if API call fails
                setProjects(originalProjects);
                const errorText = await response.text();
                throw new Error(`Failed to delete project: ${response.status} ${errorText}`);
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
        const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
        const restoreApiUrl = `${CUSTOM_BACKEND_URL}/projects/restore-multiple`;
        
        const originalProjects = [...projects];
        setProjects(currentProjects => currentProjects.filter(p => p.id !== projectId));

        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            const devUserId = "dummy-onyx-user-id-for-testing";
            if (devUserId && process.env.NODE_ENV === 'development') {
                headers['X-Dev-Onyx-User-ID'] = devUserId;
            }
            const response = await fetch(restoreApiUrl, { 
                method: 'POST', 
                headers,
                credentials: 'same-origin',
                body: JSON.stringify({ project_ids: [projectId], scope: (projects.find(p=>p.id===projectId)?.designMicroproductType?.toLowerCase().includes('plan') ? 'all' : 'self') })
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    router.push('/auth/login');
                    return;
                }
                setProjects(originalProjects);
                const errorText = await response.text();
                throw new Error(`Failed to restore project: ${response.status} ${errorText}`);
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
            const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            const devUserId = "dummy-onyx-user-id-for-testing";
            if (devUserId && process.env.NODE_ENV === 'development') {
                headers['X-Dev-Onyx-User-ID'] = devUserId;
            }
            
            const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/delete-permanently/${projectId}`, {
                method: 'DELETE',
                headers,
                credentials: 'same-origin'
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    router.push('/auth/login');
                    return;
                }
                throw new Error(`Failed to delete project: ${response.status}`);
            }
            
            // Refresh the projects list
            refreshProjects();
        } catch (error) {
            console.error('Error deleting project permanently:', error);
        }
    };

    const handleDeleteFolder = async (folderId: number) => {
        if (!confirm('Are you sure you want to delete this folder? This will also delete all projects inside it.')) {
            return;
        }
        
        try {
            const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            const devUserId = "dummy-onyx-user-id-for-testing";
            if (devUserId && process.env.NODE_ENV === 'development') {
                headers['X-Dev-Onyx-User-ID'] = devUserId;
            }
            
            const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/folders/${folderId}`, {
                method: 'DELETE',
                headers,
                credentials: 'same-origin'
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    redirectToMainAuth('/auth/login');
                    return;
                }
                throw new Error(`Failed to delete folder: ${response.status}`);
            }
            
            // Refresh the projects list
            refreshProjects();
        } catch (error) {
            console.error('Error deleting folder:', error);
            alert('Failed to delete folder');
        }
    };

    // Add event listener for drag-and-drop functionality
    useEffect(() => {
        const handleMoveProjectToFolder = async (event: Event) => {
            const customEvent = event as CustomEvent;
            const { projectId, folderId } = customEvent.detail;
            try {
                const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
                const headers: HeadersInit = { 'Content-Type': 'application/json' };
                const devUserId = "dummy-onyx-user-id-for-testing";
                if (devUserId && process.env.NODE_ENV === 'development') {
                    headers['X-Dev-Onyx-User-ID'] = devUserId;
                }
                
                const response = await fetch(`