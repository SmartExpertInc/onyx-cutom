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
  ArrowDownToLine
} from 'lucide-react';

// Helper function to redirect to main app's auth endpoint
const redirectToMainAuth = (path: string) => {
  // Get the current domain and protocol
  const protocol = window.location.protocol;
  const host = window.location.host;
  const mainAppUrl = `${protocol}//${host}${path}`;
  window.location.href = mainAppUrl;
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
                            <h3 className="font-bold text-lg text-center">{displayTitle}</h3>
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 truncate text-sm">{displayTitle}</h3>
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
        let projectsApiUrl = `${CUSTOM_BACKEND_URL}${trashMode ? '/projects/trash' : '/projects'}`;
        if (!trashMode && folderId !== null && folderId !== undefined) {
            projectsApiUrl += `?folder_id=${folderId}`;
        }

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

            setProjects(deduplicateProjects(sortedProjects));

            // Fetch folders if not in trash mode and not viewing a specific folder
            if (!trashMode && folderId === null && foldersResponse) {
                if (foldersResponse.ok) {
                    const foldersData = await foldersResponse.json();
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
                
                const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/update/${projectId}`, {
                    method: 'PUT',
                    headers,
                    credentials: 'same-origin',
                    body: JSON.stringify({ folderId })
                });
                
                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        router.push('/auth/login');
                        return;
                    }
                    throw new Error(`Failed to move project to folder: ${response.status}`);
                }
                
                // Refresh the projects list
                refreshProjects();
            } catch (error) {
                console.error('Error moving project to folder:', error);
            }
        };

        window.addEventListener('moveProjectToFolder', handleMoveProjectToFolder);
        return () => window.removeEventListener('moveProjectToFolder', handleMoveProjectToFolder);
    }, [refreshProjects, router]);

    // Drag and drop reordering functions
    const handleDragStart = useCallback((e: React.DragEvent, item: Project | Folder, type: 'project' | 'folder') => {
        e.dataTransfer.setData('application/json', JSON.stringify({
            id: item.id,
            type: type === 'project' ? 'project' : 'reorder',
            itemType: type,
            projectId: type === 'project' ? item.id : undefined
        }));
        e.dataTransfer.effectAllowed = 'move';
        if (type === 'project') {
            setDraggedProject(item as Project);
        } else {
            setDraggedFolder(item as Folder);
        }
        setIsReordering(true);
        setIsDragging(true);
        
        // Add visual feedback to dragged element
        const target = e.currentTarget as HTMLElement;
        target.style.opacity = '0.5';
        target.style.transform = 'rotate(2deg)';
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(index);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        // Only clear if we're leaving the entire row
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOverIndex(null);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            
            // Check if we're dropping a project
            if (data.type === 'project' && data.projectId) {
                // Check if we're dropping on a folder row (move to folder)
                const targetElement = e.currentTarget as HTMLElement;
                const folderRow = targetElement.closest('tr');
                if (folderRow && folderRow.getAttribute('data-folder-id')) {
                    const folderId = parseInt(folderRow.getAttribute('data-folder-id') || '0');
                    if (folderId > 0) {
                        // Move project to folder
                        window.dispatchEvent(new CustomEvent('moveProjectToFolder', {
                            detail: { projectId: data.projectId, folderId }
                        }));
                        
                        // Reset drag state
                        setDraggedProject(null);
                        setDraggedFolder(null);
                        setDragOverIndex(null);
                        setIsReordering(false);
                        setIsDragging(false);
                        
                        // Reset visual feedback
                        const target = e.currentTarget as HTMLElement;
                        target.style.opacity = '1';
                        target.style.transform = 'rotate(0deg)';
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
                    const expandedFolderId = Array.from(expandedFolders).find(folderId => 
                        folderProjects[folderId]?.some(p => p.id === draggedProject.id)
                    );
                    
                    if (expandedFolderId) {
                        // Reordering within an expanded folder
                        currentProjects = [...(folderProjects[expandedFolderId] || [])];
                        updateFunction = (newProjects: Project[]) => {
                            setFolderProjects(prev => ({
                                ...prev,
                                [expandedFolderId]: newProjects
                            }));
                        };
                    } else {
                        // Reordering unassigned projects
                        currentProjects = getUnassignedProjects();
                        updateFunction = (newProjects: Project[]) => {
                            const assignedProjects = projects.filter(p => p.folderId !== null);
                            setProjects([...newProjects, ...assignedProjects]);
                        };
                    }
                }
                
                // Find the current index of the dragged project
                const currentIndex = currentProjects.findIndex(p => p.id === draggedProject.id);
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
                        const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
                        const headers: HeadersInit = { 'Content-Type': 'application/json' };
                        const devUserId = "dummy-onyx-user-id-for-testing";
                        if (devUserId && process.env.NODE_ENV === 'development') {
                            headers['X-Dev-Onyx-User-ID'] = devUserId;
                        }
                        
                        // Update orders for all projects in the new order
                        const orderUpdates = newProjects.map((project, index) => ({
                            projectId: project.id,
                            order: index
                        }));
                        
                        const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/update-order`, {
                            method: 'PUT',
                            headers,
                            body: JSON.stringify({ orders: orderUpdates })
                        });
                        
                        if (!response.ok) {
                            console.error('Failed to save project order:', response.status);
                        }
                    } catch (error) {
                        console.error('Error saving project order:', error);
                    }
                };
                
                // Call the backend asynchronously
                saveOrderToBackend();
            }
            
            // Handle folder reordering
            if (data.type === 'reorder' && data.itemType === 'folder') {
                if (!draggedFolder) return;
                
                const currentFolders = [...folders];
                const currentIndex = currentFolders.findIndex(f => f.id === draggedFolder.id);
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
                        const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
                        const headers: HeadersInit = { 'Content-Type': 'application/json' };
                        const devUserId = "dummy-onyx-user-id-for-testing";
                        if (devUserId && process.env.NODE_ENV === 'development') {
                            headers['X-Dev-Onyx-User-ID'] = devUserId;
                        }
                        
                        // Update orders for all folders in the new order
                        const orderUpdates = newFolders.map((folder, index) => ({
                            folderId: folder.id,
                            order: index
                        }));
                        
                        const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/folders/update-order`, {
                            method: 'PUT',
                            headers,
                            body: JSON.stringify(orderUpdates)
                        });
                        
                        if (!response.ok) {
                            console.error('Failed to save folder order:', response.status);
                        }
                    } catch (error) {
                        console.error('Error saving folder order:', error);
                    }
                };
                
                // Call the backend asynchronously
                saveFolderOrderToBackend();
            }
        } catch (error) {
            console.error('Error handling drop:', error);
        }
        
        // Reset drag state
        setDraggedProject(null);
        setDraggedFolder(null);
        setDragOverIndex(null);
        setIsReordering(false);
        setIsDragging(false);
        
        // Reset visual feedback
        const target = e.currentTarget as HTMLElement;
        target.style.opacity = '1';
        target.style.transform = 'rotate(0deg)';
    }, [draggedProject, draggedFolder, folderId, projects, expandedFolders, folderProjects, getUnassignedProjects, folders]);

    const handleDragEnd = useCallback((e: React.DragEvent) => {
        // Reset drag state
        setDraggedProject(null);
        setDraggedFolder(null);
        setDragOverIndex(null);
        setIsReordering(false);
        setIsDragging(false);
        
        // Reset visual feedback
        const target = e.currentTarget as HTMLElement;
        target.style.opacity = '1';
        target.style.transform = 'rotate(0deg)';
    }, []);

    const filters = ['All', 'Recently viewed', 'Created by you', 'Favorites'];
    const filterIcons: Record<string, LucideIcon> = {
        'All': Home,
        'Recently viewed': Clock,
        'Created by you': User,
        'Favorites': Star,
    };

    // Add PDF download function
    const handlePdfDownload = () => {
        const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        
        // Add folder_id if viewing a specific folder
        if (folderId !== null) {
            queryParams.append('folder_id', folderId.toString());
        }
        
        // Add column visibility settings
        queryParams.append('column_visibility', JSON.stringify(columnVisibility));
        
        // Build the PDF URL
        let pdfUrl = `${CUSTOM_BACKEND_URL}/pdf/projects-list`;
        if (queryParams.toString()) {
            pdfUrl += `?${queryParams.toString()}`;
        }
        
        // Open PDF in new tab
        window.open(pdfUrl, '_blank');
    };

    if (loading) {
        return <div className="text-center p-8">Loading projects...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Error: {error}</div>;
    }

    return (
        <div>
            { !trashMode && (
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Link href="/create">
                        <button
                            className="flex items-center gap-2 pl-4 pr-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#002864] via-[#003EA8] to-[#63A2FF] hover:opacity-90 active:scale-95 transition-shadow shadow-lg"
                        >
                            <Plus size={16} className="text-white" />
                            Create new
                            <span
                                className="ml-1.5 rounded-full bg-[#D7E7FF] text-[#003EA8] px-1.5 py-0.5 text-[10px] leading-none font-bold tracking-wide"
                            >
                                AI
                            </span>
                        </button>
                    </Link>
                    <button
                        className="flex items-center gap-2 pl-4 pr-4 py-2 rounded-full text-sm font-semibold text-gray-800 bg-white border border-gray-300 hover:bg-gray-50 active:scale-95 transition-shadow shadow-sm"
                    >
                        <Plus size={16} />
                        New from blank
                        <ChevronsUpDown size={16} className="text-gray-500" />
                    </button>
                    <button
                        className="flex items-center gap-2 pl-4 pr-4 py-2 rounded-full text-sm font-semibold text-gray-800 bg-white border border-gray-300 hover:bg-gray-50 active:scale-95 transition-shadow shadow-sm"
                    >
                        Import
                        <ChevronsUpDown size={16} className="text-gray-500" />
                    </button>
                </div>
            </div>
            ) }

            { !trashMode && (
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    {filters.map(filter => {
                        const Icon = filterIcons[filter];
                        return (
                            <button 
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${activeFilter === filter ? 'bg-white shadow-sm border border-gray-200 text-black' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <Icon size={16} />
                                {filter}
                            </button>
                        )
                    })}
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-sm font-semibold text-black hover:text-gray-700">
                        <ArrowUpDown size={16} className="text-gray-800" />
                        Sort
                    </button>
                    
                    {/* Columns Dropdown */}
                    <div className="relative" data-columns-dropdown>
                        <button 
                            onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
                            className="flex items-center gap-2 text-sm font-semibold text-black hover:text-gray-700"
                        >
                            <List size={16} className="text-gray-800" />
                            Columns
                            <ChevronDown size={14} className="text-gray-600" />
                        </button>
                        
                        {showColumnsDropdown && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                <div className="p-2">
                                    <div className="text-xs font-semibold text-gray-700 mb-2 px-2">Show columns</div>
                                    {[
                                        { key: 'title', label: 'Title' },
                                        { key: 'created', label: 'Created' },
                                        { key: 'creator', label: 'Creator' },
                                        { key: 'numberOfLessons', label: 'Number of lessons' },
                                        { key: 'estCreationTime', label: 'Est. creation time' },
                                        { key: 'estCompletionTime', label: 'Est. completion time' }
                                    ].map((column) => (
                                        <label key={column.key} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer">
                                            {columnVisibility[column.key as keyof ColumnVisibility] ? (
                                                <CheckSquare size={16} className="text-blue-600" />
                                            ) : (
                                                <Square size={16} className="text-gray-400" />
                                            )}
                                            <span className="text-sm text-gray-700">{column.label}</span>
                                            <input
                                                type="checkbox"
                                                checked={columnVisibility[column.key as keyof ColumnVisibility]}
                                                onChange={(e) => {
                                                    setColumnVisibility(prev => ({
                                                        ...prev,
                                                        [column.key]: e.target.checked
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
                    
                    {/* PDF Download Button - only show in list view */}
                    {viewMode === 'list' && (
                        <button
                            onClick={handlePdfDownload}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                            title="Download projects list as PDF"
                        >
                            <ArrowDownToLine size={16} />
                            Download PDF
                        </button>
                    )}
                    
                    <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <LayoutGrid size={16} className="text-gray-800" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <List size={16} className="text-gray-800" />
                        </button>
                    </div>
                </div>
            </div>
            ) }

            {projects.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {projects.map((p: Project) => (
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
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {columnVisibility.title && (
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                                    )}
                                    {columnVisibility.created && (
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created</th>
                                    )}
                                    {columnVisibility.creator && (
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Creator</th>
                                    )}
                                    {columnVisibility.numberOfLessons && (
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Number of lessons</th>
                                    )}
                                    {columnVisibility.estCreationTime && (
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Est. creation time</th>
                                    )}
                                    {columnVisibility.estCompletionTime && (
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Est. completion time</th>
                                    )}
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {/* Show folders as expandable rows when not viewing a specific folder */}
                                {!trashMode && folderId === null && folders.map((folder, folderIndex) => (
                                    <React.Fragment key={`folder-${folder.id}`}>
                                        {/* Folder row */}
                                        <tr 
                                            className={`hover:bg-gray-50 transition cursor-pointer group cursor-grab active:cursor-grabbing ${
                                                dragOverIndex === folderIndex ? 'bg-blue-50 border-t-2 border-blue-300' : ''
                                            } ${draggedFolder?.id === folder.id ? 'opacity-50' : ''}`}
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
                                                handleDragOver(e, folderIndex);
                                                e.currentTarget.classList.add('bg-blue-50', 'border-2', 'border-blue-300');
                                            }}
                                            onDragLeave={(e) => {
                                                e.preventDefault();
                                                handleDragLeave(e);
                                                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                                    e.currentTarget.classList.remove('bg-blue-50', 'border-2', 'border-blue-300');
                                                }
                                            }}
                                            onDrop={(e) => handleDrop(e, folderIndex)}
                                            onDragEnd={handleDragEnd}
                                        >
                                            {columnVisibility.title && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    <span className="inline-flex items-center">
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
                                                                    expandedFolders.has(folder.id) ? 'rotate-90' : ''
                                                                }`}
                                                            />
                                                        </button>
                                                        <Folder size={16} className="text-blue-600 mr-2" />
                                                        <span className="font-semibold text-blue-700">{folder.name}</span>
                                                        <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                            {folder.project_count} {folder.project_count === 1 ? 'item' : 'items'}
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
                                                    {folder.total_lessons > 0 ? folder.total_lessons : '-'}
                                                </td>
                                            )}
                                            {columnVisibility.estCreationTime && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {folder.total_hours > 0 ? `${folder.total_hours}h` : '-'}
                                                </td>
                                            )}
                                            {columnVisibility.estCompletionTime && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {folder.total_completion_time > 0 ? formatCompletionTime(folder.total_completion_time) : '-'}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {/* Empty cell for folder rows */}
                                            </td>
                                        </tr>
                                        
                                        {/* Expanded folder content */}
                                        {expandedFolders.has(folder.id) && (
                                            <>
                                                {folderProjects[folder.id] ? (
                                                    folderProjects[folder.id].map((p: Project, index: number) => (
                                                        <tr 
                                                            key={`folder-project-${p.id}`} 
                                                            className={`hover:bg-gray-50 transition group cursor-grab active:cursor-grabbing bg-gray-50 ${
                                                                dragOverIndex === index ? 'bg-blue-50 border-t-2 border-blue-300' : ''
                                                            } ${draggedProject?.id === p.id ? 'opacity-50' : ''}`}
                                                            draggable={!trashMode}
                                                            onDragStart={(e) => handleDragStart(e, p, 'project')}
                                                            onDragOver={(e) => handleDragOver(e, index)}
                                                            onDragLeave={handleDragLeave}
                                                            onDrop={(e) => handleDrop(e, index)}
                                                            onDragEnd={handleDragEnd}
                                                        >
                                                            {columnVisibility.title && (
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    <span className="inline-flex items-center">
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
                                                                        <Link href={trashMode ? '#' : `/projects/view/${p.id}` } className="hover:underline cursor-pointer text-gray-900">
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
                                                ) : (
                                                    <tr>
                                                        <td colSpan={Object.values(columnVisibility).filter(Boolean).length + 1} className="px-6 py-4 text-sm text-gray-500 text-center bg-gray-50">
                                                            Loading projects...
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        )}
                                    </React.Fragment>
                                ))}
                                
                                {/* Show unassigned projects when not viewing a specific folder */}
                                {!trashMode && folderId === null && getUnassignedProjects().map((p: Project, index: number) => (
                                    <tr 
                                        key={p.id} 
                                        className={`hover:bg-gray-50 transition group cursor-grab active:cursor-grabbing ${
                                            dragOverIndex === index ? 'bg-blue-50 border-t-2 border-blue-300' : ''
                                        } ${draggedProject?.id === p.id ? 'opacity-50' : ''}`}
                                        draggable={!trashMode}
                                        onDragStart={(e) => handleDragStart(e, p, 'project')}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, index)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        {columnVisibility.title && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <span className="inline-flex items-center">
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
                                                    <Star size={16} className="text-gray-300 mr-2" />
                                                    <Link href={trashMode ? '#' : `/projects/view/${p.id}` } className="hover:underline cursor-pointer text-gray-900">
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
                                                folderId={folderId}
                                            />
                                        </td>
                                    </tr>
                                ))}
                                
                                {/* Show all projects when viewing a specific folder or in trash mode */}
                                {(trashMode || folderId !== null) && projects.map((p: Project, index: number) => (
                                    <tr 
                                        key={p.id} 
                                        className={`hover:bg-gray-50 transition group cursor-grab active:cursor-grabbing ${
                                            dragOverIndex === index ? 'bg-blue-50 border-t-2 border-blue-300' : ''
                                        } ${draggedProject?.id === p.id ? 'opacity-50' : ''}`}
                                        draggable={!trashMode}
                                        onDragStart={(e) => handleDragStart(e, p, 'project')}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, index)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        {columnVisibility.title && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <span className="inline-flex items-center">
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
                                                    <Star size={16} className="text-gray-300 mr-2" />
                                                    <Link href={trashMode ? '#' : `/projects/view/${p.id}` } className="hover:underline cursor-pointer text-gray-900">
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
                <div className="text-center p-8 text-gray-500">No projects found.</div>
            )}
        </div>
    );
}

export default ProjectsTable;