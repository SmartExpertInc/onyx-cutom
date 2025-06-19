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
  Trash2
} from 'lucide-react';

interface Project {
  id: number;
  title: string;
  imageUrl: string;
  lastViewed: string;
  createdBy: string;
  isPrivate: boolean;
  isGamma?: boolean;
}

const ProjectCard: React.FC<{ project: Project; onDelete: (id: number) => void }> = ({ project, onDelete }) => {
    const [menuOpen, setMenuOpen] = useState(false);
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

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setMenuOpen(false);
        if (window.confirm('Are you sure you want to delete this project?')) {
            onDelete(project.id);
        }
    };
    
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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden group transition-all duration-200 hover:shadow-lg border border-gray-200 relative">
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
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{backgroundColor: avatarColor}}>
                                {project.createdBy.slice(0, 1).toUpperCase()}
                            </div>
                            <span>Created by you</span>
                            <span className="text-gray-400">•</span>
                            <span>{project.lastViewed}</span>
                        </div>
                    </div>
                </div>
            </Link>
            <div ref={menuRef}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setMenuOpen(prev => !prev);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full text-gray-500 invisible group-hover:visible hover:bg-gray-100 transition-colors"
                >
                    <MoreHorizontal size={16} />
                </button>
                {menuOpen && (
                    <div className="absolute top-10 right-2 w-40 bg-[#2C2C2C] rounded-lg shadow-xl z-10 py-1">
                        <button className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700/50">
                            <Share2 size={14} />
                            <span>Share</span>
                        </button>
                        <button 
                            onClick={handleDelete}
                            className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-700/50"
                        >
                            <Trash2 size={14} />
                            <span>Delete</span>
                        </button>
                    </div>
                )}
            </div>
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
        const deleteApiUrl = `${CUSTOM_BACKEND_URL}/projects/${projectId}`;
        
        const originalProjects = [...projects];
        
        // Optimistically update UI
        setProjects(currentProjects => currentProjects.filter(p => p.id !== projectId));

        try {
            const headers: HeadersInit = {};
            const devUserId = "dummy-onyx-user-id-for-testing";
            if (devUserId && process.env.NODE_ENV === 'development') {
                headers['X-Dev-Onyx-User-ID'] = devUserId;
            }
            const response = await fetch(deleteApiUrl, { method: 'DELETE', headers });
            
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
