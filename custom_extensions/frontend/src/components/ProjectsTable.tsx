// custom_extensions/frontend/src/components/ProjectsTable.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Link as LinkIcon
} from 'lucide-react';

interface Project {
  id: number;
  title: string;
  imageUrl: string;
  lastViewed: string;
  createdAt: string;
  createdBy: string;
  isPrivate: boolean;
  isGamma?: boolean;
}

const ProjectCard: React.FC<{ project: Project; onDelete: (id: number) => void }> = ({ project, onDelete }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
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

    const handleOpenDeleteConfirm = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setMenuOpen(false);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setDeleteConfirmOpen(false);
        onDelete(project.id);
    };

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
    
    const bgColor = stringToColor(project.title);
    const avatarColor = stringToColor(project.createdBy);

    return (
        <div className="bg-white rounded-xl shadow-sm group transition-all duration-200 hover:shadow-lg border border-gray-200 relative">
            <Link href={`/projects/view/${project.id}`} className="block">
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
                            <h3 className="font-bold text-lg text-center">{project.title}</h3>
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 truncate text-sm">{project.title}</h3>
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
                    <div className="absolute bottom-0 left-full ml-2 w-60 bg-white rounded-lg shadow-2xl z-10 border border-gray-100 p-1">
                        <div className="px-3 py-2 border-b border-gray-100">
                            <p className="font-semibold text-sm text-gray-900 truncate">{project.title}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Created {formatDate(project.createdAt)}
                                <br/>
                                by Mykola Volynets
                            </p>
                        </div>
                        <div className="py-1">
                            <button className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                <Share2 size={16} className="text-gray-500" />
                                <span>Share...</span>
                            </button>
                            <button className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
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
                                onClick={handleOpenDeleteConfirm}
                                className="flex items-center gap-3 w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md"
                            >
                                <Trash2 size={14} />
                                <span>Send to trash</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {deleteConfirmOpen && (
                <div 
                    className="absolute inset-0 bg-black/40 flex items-center justify-center z-30 rounded-xl"
                    onClick={() => setDeleteConfirmOpen(false)}
                >
                    <div 
                        className="bg-white p-6 rounded-lg shadow-xl text-center w-80"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                           <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mt-4">Delete Project</h3>
                        <p className="text-sm text-gray-500 mt-2">
                            Are you sure you want to delete this project? This action cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-center gap-4">
                            <button
                                onClick={() => setDeleteConfirmOpen(false)}
                                className="px-4 py-2 bg-white text-gray-700 rounded-md font-semibold border border-gray-300 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ProjectsTable = () => {
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

    const handleDeleteProject = async (projectId: number) => {
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
                body: JSON.stringify({ project_ids: [projectId] })
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
        }
    };

    useEffect(() => {
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
            const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
    const projectsApiUrl = `${CUSTOM_BACKEND_URL}/projects`;
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
                }));
                setProjects(mappedProjects);
    } catch (e: any) {
                setError(e.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

    fetchProjects();
  }, []);

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
      <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Link href="/create">
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                            <Plus size={16} />
                            Create new AI
                        </button>
                    </Link>
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors shadow-sm">
                        <Plus size={16} />
                        New from blank
                        <ChevronsUpDown size={16} className="text-gray-500" />
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors shadow-sm">
                        Import
                        <ChevronsUpDown size={16} className="text-gray-500" />
        </button>
      </div>
                        </div>

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

            {projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {projects.map((p: Project) => (
                       <ProjectCard key={p.id} project={p} onDelete={handleDeleteProject} />
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No products found.</p>
                            </div>
                          )}
        </div>
  );
}

export default ProjectsTable;
