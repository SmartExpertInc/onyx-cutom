// custom_extensions/frontend/src/components/ProjectsTable.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
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
  AlertTriangle
} from 'lucide-react';

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
}

interface ProjectsTableProps {
    /** If true – table displays items from Trash and hides create/filter toolbars */
    trashMode?: boolean;
}

const ProjectCard: React.FC<{ 
    project: Project;
    onDelete: (id: number, scope: 'self' | 'all') => void;
    onRestore: (id: number) => void;
    onDeletePermanently: (id: number) => void;
    isTrashMode: boolean;
}> = ({ project, onDelete, onRestore, onDeletePermanently, isTrashMode }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [permanentDeleteConfirmOpen, setPermanentDeleteConfirmOpen] = useState(false);
    const [trashConfirmOpen, setTrashConfirmOpen] = useState(false);
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [alignLeft, setAlignLeft] = useState(false);
    const [showRestorePrompt, setShowRestorePrompt] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);

    const cardRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Re-compute alignment whenever the menu opens
    useEffect(() => {
        if (menuOpen && cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            const menuApproxWidth = 260; // ≈ w-60 in Tailwind (15rem)
            const spaceRight = window.innerWidth - rect.right;
            setAlignLeft(spaceRight < menuApproxWidth);
        }
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
    
    // A simple hash function to get a color from the title
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
    
    const displayTitle = (project.designMicroproductType && project.designMicroproductType.toLowerCase() !== 'training plan' && project.instanceName) ? `${project.title}: ${project.instanceName}` : project.title;
    const bgColor = stringToColor(displayTitle);
    const avatarColor = stringToColor(project.createdBy);

    const isOutline = (project.designMicroproductType || "").toLowerCase() === "training plan";
    const [newName, setNewName] = useState(isOutline ? project.title : (project.instanceName || ""));

    return (
        <div ref={cardRef} className="bg-white rounded-xl shadow-sm group transition-all duration-200 hover:shadow-lg border border-gray-200 relative">
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
                                <span className="text-xs text-gray-500">{project.lastViewed}</span>
                            </div>
                        </div>
                        <div className="w-7 h-7" />
                    </div>
                </div>
            </Link>
            <div className="absolute bottom-4 right-3" ref={menuRef}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setMenuOpen(prev => !prev);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                >
                    <MoreHorizontal size={16} />
                </button>
                {menuOpen && (
                    <div className={`absolute bottom-0 ${alignLeft ? 'right-full mr-2' : 'left-full ml-2'} w-60 bg-white rounded-lg shadow-2xl z-10 border border-gray-100 p-1`}>
                        <div className="px-3 py-2 border-b border-gray-100">
                            <p className="font-semibold text-sm text-gray-900 truncate">{project.title}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Created {formatDate(project.createdAt)}
                                <br/>
                                by Vitaliy Tymoshenko
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
                                </div>
                                <div className="py-1 border-t border-gray-100">
                                    <button 
                                        onClick={handleTrashRequest}
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
                                                body: JSON.stringify(bodyPayload)
                                            });
                                            if (!resp.ok) {
                                                const errTxt = await resp.text();
                                                throw new Error(`Failed to update project ${id}: ${resp.status} ${errTxt}`);
                                            }
                                        };

                                        const tasks: Promise<void>[] = [];
                                        const oldProjectName = project.title;

                                        if (isOutline) {
                                            // 1) Update outline itself
                                            tasks.push(updateProject(project.id, { projectName: newName }));

                                            // 2) Fetch all user projects to find ones with same old project name (lessons/tests)
                                            const listResp = await fetch(`${CUSTOM_BACKEND_URL}/projects`, { headers, cache: 'no-store' });
                                            if (listResp.ok) {
                                                const listData: any[] = await listResp.json();
                                                listData
                                                    .filter((p) => p.projectName === oldProjectName && p.id !== project.id)
                                                    .forEach((p) => tasks.push(updateProject(p.id, { projectName: newName })));
                                            }
                                        } else {
                                            // Stand-alone lesson/test
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

const ProjectsTable: React.FC<ProjectsTableProps> = ({ trashMode = false }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [viewMode, setViewMode] = useState('Grid');

    const timeAgo = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) {
            return Math.floor(interval) + " years ago";
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            return Math.floor(interval) + " months ago";
        }
        interval = seconds / 86400;
        if (interval > 1) {
            return Math.floor(interval) + " days ago";
        }
        interval = seconds / 3600;
        if (interval > 1) {
            return Math.floor(interval) + " hours ago";
        }
        interval = seconds / 60;
        if (interval > 1) {
            return Math.floor(interval) + " minutes ago";
        }
        return "just now";
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
                body: JSON.stringify({ project_ids: [projectId], scope: scope })
            });
            
            if (!response.ok) {
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
                body: JSON.stringify({ project_ids: [projectId], scope: (projects.find(p=>p.id===projectId)?.designMicroproductType?.toLowerCase().includes('plan') ? 'all' : 'self') })
            });
            if (!response.ok) {
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
        const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
        const deleteApiUrl = `${CUSTOM_BACKEND_URL}/projects/delete-permanently`;
        
        const originalProjects = [...projects];
        setProjects(currentProjects => currentProjects.filter(p => p.id !== projectId));

        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            const devUserId = "dummy-onyx-user-id-for-testing";
            if (devUserId && process.env.NODE_ENV === 'development') {
                headers['X-Dev-Onyx-User-ID'] = devUserId;
            }
            const response = await fetch(deleteApiUrl, { 
                method: 'POST', 
                headers,
                body: JSON.stringify({ project_ids: [projectId] })
            });
            if (!response.ok) {
                setProjects(originalProjects);
                const errorText = await response.text();
                throw new Error(`Failed to delete project permanently: ${response.status} ${errorText}`);
            }
        } catch (error) {
            console.error(error);
            alert((error as Error).message);
            setProjects(originalProjects);
        } finally {
            window.location.reload();
        }
    };

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            setError(null);
            const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
            const projectsApiUrl = `${CUSTOM_BACKEND_URL}${trashMode ? '/projects/trash' : '/projects'}`;
            try {
                const headers: HeadersInit = {};
                const devUserId = "dummy-onyx-user-id-for-testing";
                if (devUserId && process.env.NODE_ENV === 'development') {
                    headers['X-Dev-Onyx-User-ID'] = devUserId;
                }
                const response = await fetch(projectsApiUrl, { headers, cache: 'no-store' });
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status} - ${errorText.substring(0, 200)}`);
                }
                const data = await response.json();
                const mappedProjects: Project[] = data.map((p: any) => ({
                    id: p.id,
                    title: p.projectName,
                    imageUrl: "/placeholder.png", // Missing from DB
                    lastViewed: timeAgo(p.created_at),
                    createdAt: p.created_at,
                    createdBy: "you", // From DB context
                    isPrivate: true, // Missing from DB
                    designMicroproductType: p.design_microproduct_type,
                    instanceName: p.microproduct_name,
                }));

                // ---- Filter lessons that belong to outlines from the main products page ----
                const deduplicateProjects = (projectsArr: Project[]): Project[] => {
                    const outlineNames = new Set<string>();
                    const filteredProjects: Project[] = [];

                    // First pass: collect all outline names
                    projectsArr.forEach((proj) => {
                        const isOutline = (proj.designMicroproductType || "").toLowerCase() === "training plan";
                        if (isOutline) {
                            outlineNames.add(proj.title.trim());
                        }
                    });

                    // Second pass: filter projects
                    projectsArr.forEach((proj) => {
                        const isOutline = (proj.designMicroproductType || "").toLowerCase() === "training plan";
                        
                        if (isOutline) {
                            // Always include outlines
                            filteredProjects.push(proj);
                        } else {
                            // For non-outline projects, check if they belong to an outline
                            const projectTitle = proj.title.trim();
                            let belongsToOutline = false;

                            // Check if this project follows the "Outline Name: Lesson Title" pattern
                            // and if the outline name matches any existing outline
                            if (projectTitle.includes(': ')) {
                                const outlinePart = projectTitle.split(': ')[0].trim();
                                if (outlineNames.has(outlinePart)) {
                                    belongsToOutline = true;
                                }
                            }

                            // Only include projects that don't belong to an outline
                            if (!belongsToOutline) {
                                filteredProjects.push(proj);
                            }
                        }
                    });

                    return filteredProjects;
                };

                setProjects(deduplicateProjects(mappedProjects));
            } catch (e: any) {
                setError(e.message || "Failed to load projects.");
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [trashMode]);

    const filters = ['All', 'Recently viewed', 'Created by you', 'Favorites'];
    const filterIcons: Record<string, LucideIcon> = {
        'All': Home,
        'Recently viewed': Clock,
        'Created by you': User,
        'Favorites': Star,
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
                        <ArrowUpDown size={16} />
                        Sort
                    </button>
                    <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                        <button 
                            onClick={() => setViewMode('Grid')}
                            className={`p-1.5 rounded-md ${viewMode === 'Grid' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('List')}
                            className={`p-1.5 rounded-md ${viewMode === 'List' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>
            ) }

            {projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {projects.map((p: Project) => (
                        <ProjectCard 
                            key={p.id} 
                            project={p} 
                            onDelete={handleDeleteProject}
                            onRestore={handleRestoreProject}
                            onDeletePermanently={handleDeletePermanently}
                            isTrashMode={trashMode}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">{trashMode ? 'No items in trash.' : 'No projects to display.'}</p>
                </div>
            )}
        </div>
    );
}

export default ProjectsTable;