// custom_extensions/frontend/src/components/ProjectsTable.tsx
"use client";

import React, { useState } from 'react';
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
  LucideIcon
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

// Hardcoded data based on the provided image
const projects: Project[] = [
  {
    id: 1,
    title: "MamaRika Speaks Out About Her Breakup with Stas Shurins",
    imageUrl: "/placeholder.png",
    lastViewed: "20 minutes ago",
    createdBy: "Vitaliy Tymoshenko",
    isPrivate: true,
  },
  {
    id: 2,
    title: "Strategic Session: A Powerful Tool for Organizational...",
    imageUrl: "/placeholder.png",
    lastViewed: "4 days ago",
    createdBy: "Vitaliy Tymoshenko",
    isPrivate: true,
  },
  {
    id: 3,
    title: "AI Trends 2025: The Accelerating Evolution",
    imageUrl: "/placeholder.png",
    lastViewed: "5 days ago",
    createdBy: "Vitaliy Tymoshenko",
    isPrivate: true,
  },
  {
    id: 4,
    title: "Smolinsk Uranium Mine Incident",
    imageUrl: "/placeholder.png",
    lastViewed: "5 days ago",
    createdBy: "Vitaliy Tymoshenko",
    isPrivate: true,
  },
  {
    id: 5,
    title: "Shaping Tomorrow's Workforce: AI in Corporate...",
    imageUrl: "/placeholder.png",
    lastViewed: "5 days ago",
    createdBy: "Vitaliy Tymoshenko",
    isPrivate: true,
  },
  {
    id: 6,
    title: "10 Trends in AI Corporate Employee Training For 2025",
    imageUrl: "/placeholder.png",
    lastViewed: "11 days ago",
    createdBy: "Vitaliy Tymoshenko",
    isPrivate: true,
  },
  {
    id: 7,
    title: "RevolutionEd: Transforming Corporate Learning",
    imageUrl: "/placeholder.png",
    lastViewed: "12 days ago",
    createdBy: "Vitaliy Tymoshenko",
    isPrivate: true,
  },
  {
    id: 8,
    title: "Результаты внедрения системы управления...",
    imageUrl: "/placeholder.png",
    lastViewed: "12 days ago",
    createdBy: "Vitaliy Tymoshenko",
    isPrivate: true,
  },
  {
    id: 9,
    title: "Gamma Tips & Tricks",
    imageUrl: "/placeholder.png",
    isGamma: true,
    lastViewed: "12 days ago",
    createdBy: "Vitaliy Tymoshenko",
    isPrivate: true,
  }
];

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden group transition-all duration-200 hover:shadow-lg border border-gray-200">
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
                                {project.createdBy.split(' ').map(n=>n[0]).join('')}
                            </div>
                            <span>Created by you</span>
                            <span className="text-gray-400">•</span>
                            <span>{project.lastViewed}</span>
                        </div>
                        <MoreHorizontal size={16} className="text-gray-500 invisible group-hover:visible" />
                    </div>
                </div>
            </Link>
        </div>
    );
};

const ProjectsTable = () => {
    const [activeFilter, setActiveFilter] = useState('Recently viewed');
    const [viewMode, setViewMode] = useState('Grid');

    const filters = ['All', 'Recently viewed', 'Created by you', 'Favorites'];
    const filterIcons: Record<string, LucideIcon> = {
        'All': Home,
        'Recently viewed': Clock,
        'Created by you': User,
        'Favorites': Star,
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                        <Plus size={16} />
                        Create new AI
                    </button>
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
                    <button className="flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-black">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((p: Project) => (
                   <ProjectCard key={p.id} project={p} />
                ))}
            </div>
        </div>
    );
}

export default ProjectsTable;
