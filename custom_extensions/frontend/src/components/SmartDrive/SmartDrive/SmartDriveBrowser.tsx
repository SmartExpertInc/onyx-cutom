"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	Folder,
	File,
	Upload,
	Plus,
	Trash2,
	Copy,
	Download,
	Search,
	ArrowUpDown,
	Pencil,
	MoveRight,
	MoreHorizontal,
	MoreVertical,
	ArrowLeft,
	Image,
	FileText,
	FileStack,
	ClipboardPenLine,
	Users,
	CalendarDays,
	ChevronRight,
	FolderPlus,
	FilePlus,
	ChevronLeft,
	ChevronsLeft,
	ChevronsRight,
	ChevronDown,
	Files
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input as UiInput } from '@/components/ui/input';
import { trackSmartDrive } from '@/lib/mixpanelClient';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FolderSelectionModal } from '@/components/ui/folder-selection-modal';
import { useLanguage } from '../../../contexts/LanguageContext';
import { EmptySmartDrive } from '../../EmptySmartDrive';

// Utility function to format file sizes
const formatSize = (bytes: number | null | undefined): string => {
	if (!bytes) return '0 B';
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
};

// Utility function to get file icon based on mime type
const getFileIcon = (mimeType: string | null | undefined) => {
	if (!mimeType) return File;
	
	const type = mimeType.toLowerCase();
	
	if (type.startsWith('image/')) {
		return Image;
	} else if (type === 'application/pdf') {
		return Files;
	} else if (type.includes('document') || type.includes('text') || type.includes('word')) {
		return FileText;
	}
	
	return File;
};

export type SmartDriveItem = {
	name: string;
	path: string;
	type: 'file' | 'directory';
	size?: number | null;
	modified?: string | null;
	mime_type?: string | null;
	etag?: string | null;
	creator?: string | null;
};

interface SmartDriveBrowserProps {
	mode?: 'manage' | 'select';
	className?: string;
	onFilesSelected?: (paths: string[]) => void;
	initialPath?: string;
	viewMode?: 'grid' | 'list';
	contentTypeFilter?: string;
	searchQuery?: string;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
	onFilesLoaded?: (hasFiles: boolean) => void;
	emptyStateVariant?: 'smartdrive' | 'knowledgebase';
	externalIndexingState?: IndexingState; // Allow parent to pass indexing state
}

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

type SortKey = 'name' | 'modified' | 'size' | 'type' | 'creator';

type UploadProgress = {
	filename: string;
	progress: number; // 0-100
};

type IndexingState = Record<string, { 
	status: 'not_started' | 'in_progress' | 'success' | 'failed' | 'pending' | 'done' | 'unknown'; 
	etaPct: number; 
	onyxFileId?: number | string; 
	timeStarted?: number;
	timeUpdated?: number;
	estimatedTokens?: number;
	estimatedDuration?: number;
}>;

const SmartDriveBrowser: React.FC<SmartDriveBrowserProps> = ({
	mode = 'manage',
	className = '',
	onFilesSelected,
	initialPath = '/',
	viewMode = 'grid',
	contentTypeFilter = 'all',
	searchQuery = '',
	sortBy = 'name',
	sortOrder = 'asc',
	onFilesLoaded,
	emptyStateVariant = 'knowledgebase',
	externalIndexingState,
}) => {
	console.log('%c[SmartDriveBrowser] COMPONENT MOUNTED/RENDERED', 'background: #00ff00; color: #000; font-size: 14px; font-weight: bold');
	console.log('[SmartDriveBrowser] Props:', { mode, initialPath, viewMode, contentTypeFilter, hasExternalIndexing: !!externalIndexingState });
	
	const { t } = useLanguage();
	const [currentPath, setCurrentPath] = useState<string>(initialPath);
	const [items, setItems] = useState<SmartDriveItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [busy, setBusy] = useState(false);
	const [sortKey, setSortKey] = useState<SortKey>('name');
	const [sortAsc, setSortAsc] = useState<boolean>(true);
	const [lastIndex, setLastIndex] = useState<number | null>(null);
	const [uploading, setUploading] = useState<UploadProgress[]>([]);
	const [internalIndexing, setInternalIndexing] = useState<IndexingState>({});
	
	// Use external indexing state if provided, otherwise use internal state
	const indexing = externalIndexingState || internalIndexing;
	const setIndexing = externalIndexingState ? () => {} : setInternalIndexing;
	const [mkdirOpen, setMkdirOpen] = useState(false);
	const [mkdirName, setMkdirName] = useState('');
	// Rename modal state
	const [renameOpen, setRenameOpen] = useState(false);
	const [renameFromPath, setRenameFromPath] = useState<string | null>(null);
	const [renameNewName, setRenameNewName] = useState('');
	const [renameSaving, setRenameSaving] = useState(false);
	// Folder picker modal state for move/copy
	const [pickerOpen, setPickerOpen] = useState(false);
	const [pickerOp, setPickerOp] = useState<'move' | 'copy'>('move');
	const [pickerPath, setPickerPath] = useState<string>('/');
	const [pickerDirs, setPickerDirs] = useState<SmartDriveItem[]>([]);
	const [pickerLoading, setPickerLoading] = useState(false);
	const [pickerSelected, setPickerSelected] = useState<string[]>([]);
	const [dragOverPath, setDragOverPath] = useState<string | null>(null);
	const [renameModalOpen, setRenameModalOpen] = useState(false);
	const [itemToRename, setItemToRename] = useState<string | null>(null);
	const [newItemName, setNewItemName] = useState('');
	const [isRenaming, setIsRenaming] = useState(false);
	const [showFolderSelectionModal, setShowFolderSelectionModal] = useState(false);
	const [moveOperation, setMoveOperation] = useState<'move' | 'copy' | null>(null);
	const [expandedFolder, setExpandedFolder] = useState<string | null>(null);
	const [folderContents, setFolderContents] = useState<SmartDriveItem[]>([]);
	const [folderItemCounts, setFolderItemCounts] = useState<Record<string, number>>({});
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
	const [folderContentsMap, setFolderContentsMap] = useState<Record<string, SmartDriveItem[]>>({});
	const [selectedFolderForView, setSelectedFolderForView] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	const containerRef = useRef<HTMLDivElement | null>(null);
	const uploadInput = useRef<HTMLInputElement | null>(null);

	const fetchList = useCallback(async (path: string) => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/list?path=${encodeURIComponent(path)}`, { credentials: 'same-origin' });
			if (!res.ok) throw new Error(`List failed: ${res.status}`);
			const data = await res.json();
			const files = Array.isArray(data.files) ? data.files : [];
			setItems(files);
			
			// Fetch item counts for each folder (count only files, not subfolders)
			const folderCounts: Record<string, number> = {};
			for (const item of files) {
				if (item.type === 'directory') {
					try {
						const folderRes = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/list?path=${encodeURIComponent(item.path)}`, { credentials: 'same-origin' });
						if (folderRes.ok) {
							const folderData = await folderRes.json();
							// Count only files, not directories
							const fileCount = Array.isArray(folderData.files) 
								? folderData.files.filter((f: SmartDriveItem) => f.type === 'file').length 
								: 0;
							folderCounts[item.path] = fileCount;
						} else {
							folderCounts[item.path] = 0;
						}
					} catch {
						folderCounts[item.path] = 0;
					}
				}
			}
			setFolderItemCounts(folderCounts);
			
			// Notify parent if there are any files (not just folders)
			const hasFiles = files.some((item: SmartDriveItem) => item.type === 'file');
			if (onFilesLoaded) {
				onFilesLoaded(hasFiles);
			}
		} catch (e: any) {
			setError(e?.message || 'Failed to load');
			setItems([]);
			if (onFilesLoaded) {
				onFilesLoaded(false);
			}
		} finally {
			setLoading(false);
		}
	}, [onFilesLoaded]);

	const fetchFolderContents = useCallback(async (folderPath: string) => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/list?path=${encodeURIComponent(folderPath)}`, { credentials: 'same-origin' });
			if (!res.ok) throw new Error(`List failed: ${res.status}`);
			const data = await res.json();
			setFolderContents(Array.isArray(data.files) ? data.files : []);
		} catch (e: any) {
			setError(e?.message || 'Failed to load folder contents');
			setFolderContents([]);
		} finally {
			setLoading(false);
		}
	}, []);

	const handleFolderClick = async (folderPath: string) => {
		if (expandedFolder === folderPath) {
			// Collapse the folder
			setExpandedFolder(null);
			setFolderContents([]);
		} else {
			// Expand the folder
			setExpandedFolder(folderPath);
			await fetchFolderContents(folderPath);
		}
	};

	const toggleFolder = useCallback(async (folderPath: string) => {
		setExpandedFolders((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(folderPath)) {
				newSet.delete(folderPath);
			} else {
				newSet.add(folderPath);
				// Fetch contents for this folder if not already loaded
				if (!folderContentsMap[folderPath]) {
					fetchFolderContentsForExpansion(folderPath);
				}
			}
			return newSet;
		});
	}, [folderContentsMap]);

	const fetchFolderContentsForExpansion = useCallback(async (folderPath: string) => {
		try {
			const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/list?path=${encodeURIComponent(folderPath)}`, { credentials: 'same-origin' });
			if (!res.ok) throw new Error(`List failed: ${res.status}`);
			const data = await res.json();
			const contents = Array.isArray(data.files) ? data.files : [];
			setFolderContentsMap(prev => ({
				...prev,
				[folderPath]: contents
			}));
		} catch (e: any) {
			console.error('Failed to load folder contents:', e);
			setFolderContentsMap(prev => ({
				...prev,
				[folderPath]: []
			}));
		}
	}, []);

	useEffect(() => { fetchList(currentPath); }, [currentPath, fetchList]);

	const breadcrumbs = useMemo(() => {
		const parts = currentPath.split('/').filter(Boolean);
		const crumbs = [{ label: 'Smart Drive', path: '/' }];
		let acc = '';
		for (const p of parts) {
			acc += `/${p}`;
			crumbs.push({ label: p, path: acc });
		}
		return crumbs;
	}, [currentPath]);

	// Helper function to apply filters to any list of items
	const applyFilters = useCallback((list: SmartDriveItem[]) => {
		const term = searchQuery.trim().toLowerCase();
		let filteredList = [...list];
		
		// Filter by search term
		if (term) {
			filteredList = filteredList.filter(i => i.name.toLowerCase().includes(term));
		}
		
		// Filter by content type
		if (contentTypeFilter !== 'all') {
			filteredList = filteredList.filter(item => {
				// Always show directories
				if (item.type === 'directory') return true;
				
				const mimeType = item.mime_type?.toLowerCase() || '';
				
				if (contentTypeFilter === 'documents') {
					return mimeType.includes('pdf') || 
						mimeType.includes('document') || 
						mimeType.includes('word') || 
						mimeType.includes('text') || 
						mimeType.includes('spreadsheet') || 
						mimeType.includes('excel') || 
						mimeType.includes('presentation') || 
						mimeType.includes('powerpoint');
				} else if (contentTypeFilter === 'images') {
					return mimeType.startsWith('image/');
				} else if (contentTypeFilter === 'videos') {
					return mimeType.startsWith('video/');
				}
				
				// If doesn't match selected filter, don't show it
				return false;
			});
		}
		
		const dirFirst = (a: SmartDriveItem, b: SmartDriveItem) => {
			if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
			return 0;
		};
		const cmp = (a: SmartDriveItem, b: SmartDriveItem) => {
			let base = 0;
			if (sortBy === 'name') base = a.name.localeCompare(b.name);
			else if (sortBy === 'size') base = (a.size ?? 0) - (b.size ?? 0);
			else if (sortBy === 'modified') base = new Date(a.modified || 0).getTime() - new Date(b.modified || 0).getTime();
			else if (sortBy === 'created') base = new Date(a.modified || 0).getTime() - new Date(b.modified || 0).getTime(); // Use modified as created for now
			else if (sortBy === 'type') {
				const aType = a.type === 'directory' ? 'folder' : (a.mime_type?.split('/')[1] || 'file');
				const bType = b.type === 'directory' ? 'folder' : (b.mime_type?.split('/')[1] || 'file');
				base = aType.localeCompare(bType);
			}
			else if (sortBy === 'creator') {
				const aCreator = a.creator || 'Unknown';
				const bCreator = b.creator || 'Unknown';
				base = aCreator.localeCompare(bCreator);
			}
			return sortOrder === 'asc' ? base : -base;
		};
		return filteredList.sort((a, b) => dirFirst(a, b) || cmp(a, b));
	}, [searchQuery, sortBy, sortOrder, contentTypeFilter]);

	const filtered = useMemo(() => {
		return applyFilters(items);
	}, [items, applyFilters]);

	// Pagination calculations
	const totalPages = Math.ceil(filtered.length / rowsPerPage);
	const startIndex = (currentPage - 1) * rowsPerPage;
	const endIndex = startIndex + rowsPerPage;
	const paginatedItems = filtered.slice(startIndex, endIndex);

	// Reset to page 1 when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery, contentTypeFilter, currentPath]);

	const toggle = (p: string) => {
		const next = new Set(selected);
		if (next.has(p)) next.delete(p); else next.add(p);
		setSelected(next);
	};

	const onRowClick = (idx: number, it: SmartDriveItem, e: React.MouseEvent) => {
		// Ignore clicks originating from interactive controls inside the row
		const target = e.target as HTMLElement;
		if (target && target.closest('[data-sd-interactive]')) return;
		if (it.type === 'directory') {
			// For grid view, select folder to view its contents
			if (mode === 'manage' && viewMode === 'grid') {
				setSelectedFolderForView(it.path);
				// Fetch folder contents if not already loaded
				if (!folderContentsMap[it.path]) {
					fetchFolderContentsForExpansion(it.path);
				}
				return;
			}
			// For list view, toggle folder expansion like MyProductsTable
			if (mode === 'manage' && viewMode === 'list') {
				toggleFolder(it.path);
				return;
			}
			// For select mode, navigate to folder
			setCurrentPath(it.path.endsWith('/') ? it.path : `${it.path}/`);
			return;
		}
		// toggle selection on row click (multi-select)
		toggle(it.path);
		setLastIndex(idx);
	};

	const selectAll = () => setSelected(new Set(filtered.map(i => i.path)));
	const clearSel = () => setSelected(new Set());

	const createFolder = async () => {
		const name = mkdirName.trim();
		if (!name) return;
		setBusy(true);
		try {
			const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/mkdir`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify({ path: `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${name}` })
			});
			if (!res.ok) throw new Error(await res.text());
			// track successfully create folder event
			trackSmartDrive('Create Folder');
			setMkdirOpen(false);
			setMkdirName('');
			await fetchList(currentPath);
		} catch (e) {
			alert('Failed to create folder');
		} finally {
			setBusy(false);
		}
	};

	const del = async (pathsToDelete?: string[]) => {
		const paths = pathsToDelete || Array.from(selected);
		if (paths.length === 0) return;
		if (!confirm(`Delete ${paths.length} item(s)?`)) return;
		setBusy(true);
		try {
			const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/delete`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify({ paths })
			});
			if (!res.ok && res.status !== 207) throw new Error(await res.text());
			clearSel();
			await fetchList(currentPath);
		} catch (e) {
			alert('Delete failed');
		} finally {
			setBusy(false);
		}
	};

	// Delete specific paths (bypass selection)
	const delPaths = async (paths: string[]) => {
		if (!paths || paths.length === 0) return;
		if (!confirm(`Delete ${paths.length} item(s)?`)) return;
		setBusy(true);
		try {
			const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/delete`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify({ paths })
			});
			if (!res.ok && res.status !== 207) throw new Error(await res.text());
			await fetchList(currentPath);
		} catch (e) {
			alert('Delete failed');
		} finally {
			setBusy(false);
		}
	};

	const doMoveCopy = (op: 'move' | 'copy') => {
		if (selected.size === 0) return;
		setPickerOp(op);
		setPickerPath(currentPath || '/');
		setPickerSelected(Array.from(selected));
		setPickerOpen(true);
		void loadPickerDirs(currentPath || '/');
	};

	// Start move/copy for explicit paths
	const doMoveCopyForPaths = (op: 'move' | 'copy', paths: string[]) => {
		if (!paths || paths.length === 0) return;
		setPickerOp(op);
		setPickerPath(currentPath || '/');
		setPickerSelected(paths);
		setPickerOpen(true);
		void loadPickerDirs(currentPath || '/');
	};

	const openRename = () => {
		if (selected.size !== 1) return;
		const p = Array.from(selected)[0];
		setRenameFromPath(p);
		setRenameNewName(p.split('/').pop() || '');
		setRenameOpen(true);
	};

	// Open rename for a specific path (without relying on selection)
	const openRenameForPath = (p: string) => {
		if (!p) return;
		setRenameFromPath(p);
		setRenameNewName(p.split('/').pop() || '');
		setRenameOpen(true);
	};

	const submitRename = async () => {
		if (!renameFromPath) return;
		const base = renameFromPath.split('/').slice(0, -1).join('/') || '/';
		const old = renameFromPath.split('/').pop() || '';
		const name = renameNewName.trim();
		if (!name || name === old) { setRenameOpen(false); return; }
		setRenameSaving(true);
		try {
			const destinationPath = base === '/' ? `/${name}` : `${base}/${name}`;
			
			const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/move`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify({ from: renameFromPath, to: destinationPath })
			});
			if (!res.ok) throw new Error(await res.text());
			
			setRenameOpen(false);
			setRenameSaving(false);
			clearSel();
			await fetchList(currentPath);
		} catch (e) {
			setRenameSaving(false);
			alert('Rename failed');
		}
	};

	const loadPickerDirs = async (path: string) => {
		setPickerLoading(true);
		try {
			const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/list?path=${encodeURIComponent(path)}`, { credentials: 'same-origin' });
			if (!res.ok) throw new Error('Failed to load');
			const data = await res.json();
			const listingPath = (data.path || path || '/');
			const norm = (p: string) => {
				if (!p) return '/';
				let out = p.replace(/\\+/g, '/');
				if (!out.startsWith('/')) out = '/' + out;
				return out;
			};
			const selfA = norm(listingPath);
			const selfB = selfA.endsWith('/') ? selfA.slice(0, -1) : selfA + '/';
			const dirs = (data.files || [])
				.filter((i: SmartDriveItem) => i.type === 'directory')
				.filter((i: SmartDriveItem) => {
					const p = norm(i?.path || '');
					return p !== selfA && p !== selfB; // hide the folder from within itself
				});
			setPickerDirs(dirs);
			setPickerPath(listingPath);
		} catch {
			setPickerDirs([]);
		} finally {
			setPickerLoading(false);
		}
	};

	const submitPicker = async (targetFolder: string) => {
		if (!targetFolder) return;
		setBusy(true);
		try {
			for (const p of pickerSelected) {
				const destBase = targetFolder.endsWith('/') ? targetFolder : `${targetFolder}/`;
				const baseName = p.split('/').pop() || '';
				let to = `${destBase}${baseName}`.replace(/\/+?/g, '/');
				// Normalize trailing slash: files must not end with '/', folders must end with '/'
				const srcItem = items.find(i => i.path === p);
				if (srcItem && srcItem.type === 'file') {
					to = to.replace(/\/$/, '');
				} else if (srcItem && srcItem.type === 'directory') {
					to = to.endsWith('/') ? to : `${to}/`;
				}
				console.log(`[SmartDrive] ${pickerOp}: from=${p} to=${to}, URL=${CUSTOM_BACKEND_URL}/smartdrive/${pickerOp}`);
				const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/${pickerOp}`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'same-origin',
					body: JSON.stringify({ from: p, to })
				});
				if (!res.ok) {
					const errorText = await res.text();
					console.error(`[SmartDrive] ${pickerOp} failed:`, errorText);
					throw new Error(errorText);
				}
				console.log(`[SmartDrive] ${pickerOp} succeeded for ${p}`);
			}
			setPickerOpen(false);
			clearSel();
			await fetchList(currentPath);
		} catch (e) {
			console.error(`[SmartDrive] ${pickerOp} error:`, e);
			alert(`${pickerOp} failed: ${e}`);
		} finally {
			setBusy(false);
		}
	};

	const rename = async (path?: string) => {
		const targetPath = path || (selected.size === 1 ? Array.from(selected)[0] : null);
		if (!targetPath) return;
		const old = targetPath.split('/').pop() || '';
		setItemToRename(targetPath);
		setNewItemName(old);
		setRenameModalOpen(true);
	};

	const handleRenameSubmit = async () => {
		if (!itemToRename || !newItemName.trim()) return;
		const p = itemToRename;
		const pathParts = p.split('/').filter(part => part.length > 0);
		const base = pathParts.slice(0, -1).join('/');
		const old = pathParts[pathParts.length - 1] || '';
		
		if (newItemName === old) {
			setRenameModalOpen(false);
			return;
		}
		setIsRenaming(true);
		try {
			// Construct the target path more carefully
			const to = base ? `/${base}/${newItemName}` : `/${newItemName}`;
			
			// Debug logging
			console.log('Rename attempt:', { from: p, to, base, newName: newItemName, pathParts });
			
			// First, let's check if the target already exists by listing the directory
			try {
				const listRes = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/list?path=${encodeURIComponent(base || '/')}`, { 
					credentials: 'same-origin' 
				});
				if (listRes.ok) {
					const listData = await listRes.json();
					const existingItems = Array.isArray(listData.files) ? listData.files : [];
					const existingNames = existingItems.map((item: SmartDriveItem) => item.name);
					console.log('Existing items in directory:', existingNames);
					
					if (existingNames.includes(newItemName)) {
						alert(`A file or folder with the name "${newItemName}" already exists in this location. Please choose a different name.`);
						return;
					}
				}
			} catch (listError) {
				console.warn('Could not check existing files:', listError);
			}
			
			const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/move`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify({ from: p, to })
			});
			
			if (!res.ok) {
				const errorText = await res.text();
				console.error('Rename error response:', { status: res.status, statusText: res.statusText, body: errorText });
				
				if (res.status === 409) {
					alert(`A file or folder with the name "${newItemName}" already exists in this location. Please choose a different name.`);
				} else if (res.status === 400) {
					alert('Invalid folder name. Please use only letters, numbers, spaces, and common symbols.');
				} else if (res.status === 403) {
					alert('You do not have permission to rename this item.');
				} else {
					alert(`Rename failed: ${errorText || 'Unknown error'}`);
				}
				return;
			}
			
			clearSel();
			await fetchList(currentPath);
			setRenameModalOpen(false);
			setItemToRename(null);
			setNewItemName('');
		} catch (e) {
			console.error('Rename error:', e);
			alert('Rename failed: Network error. Please try again.');
		} finally {
			setIsRenaming(false);
		}
	};

	const onUploadClick = () => uploadInput.current?.click();
	const onUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
	console.log('%c[SmartDriveBrowser] FILE INPUT CHANGE EVENT', 'background: #ff0000; color: #fff; font-size: 14px; font-weight: bold');
	console.log('[SmartDriveBrowser] Files selected from input:', e.target.files);
	const files = e.target.files;
	if (!files || files.length === 0) {
		console.log('[SmartDriveBrowser] No files selected');
		return;
	}
	console.log('[SmartDriveBrowser] About to call uploadFiles with:', Array.from(files).map(f => f.name));
	await uploadFiles(Array.from(files));
	if (uploadInput.current) uploadInput.current.value = '';
};

	const INDEX_TOKENS_PER_SEC = 2500; // ~2500 tokens/s for duration estimation

	// Calculate progress based on status and time interpolation
	const calculateProgress = useCallback((status: string, timeStarted?: number, estimatedTokens?: number, currentProgress?: number): number => {
		if (status === 'not_started') {
			return 5;
		} else if (status === 'in_progress') {
			if (timeStarted && estimatedTokens) {
				// Use time-based interpolation if we have start time
				const elapsed = Date.now() - timeStarted;
				const estimatedDuration = (estimatedTokens / INDEX_TOKENS_PER_SEC) * 1000;
				const ratio = Math.min(elapsed / estimatedDuration, 1);
				return Math.min(95, 5 + (90 * ratio)); // 5% to 95%
			} else {
				// Fallback: gradually increase progress for in_progress without time data
				const baseProgress = currentProgress || 5;
				// Increment by 5-15% each time, but cap at 85%
				const increment = Math.random() * 10 + 5; // 5-15%
				return Math.min(85, baseProgress + increment);
			}
		} else if (status === 'success' || status === 'done') {
			return 100;
		} else if (status === 'failed') {
			return 0; // Show error state
		}
		return 5; // Default for pending/unknown
	}, [INDEX_TOKENS_PER_SEC]);

	const uploadFiles = async (files: File[]) => {
		if (files.length === 0) return;
		console.log('=== [SmartDrive] UPLOAD STARTED ===');
		console.log('[SmartDrive] Starting upload:', { filesCount: files.length, currentPath, fileNames: files.map(f => f.name) });
		console.log('[SmartDrive] Current indexing state BEFORE upload:', indexing);
		
		const progress: UploadProgress[] = files.map(f => ({ filename: f.name, progress: 0 }));
		setUploading(progress);
		setBusy(true);
		try {
			const form = new FormData();
			for (const f of files) form.append('files', f);
			// Note: Streaming handled server-side; we simulate per-file progress client-side
			const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/upload?path=${encodeURIComponent(currentPath)}`, {
				method: 'POST',
				credentials: 'same-origin',
				body: form,
			});
			
			console.log('[SmartDrive] Upload response status:', res.status);
			
			if (!res.ok && res.status !== 207) {
				const errorText = await res.text();
				console.error('[SmartDrive] Upload failed:', { status: res.status, error: errorText });
				throw new Error(errorText);
			}
			
			const data = await res.json();
			console.log('[SmartDrive] Upload response data:', data);
			console.log('[SmartDrive] Upload response type check:', {
				hasData: !!data,
				hasResults: !!data?.results,
				resultsIsArray: Array.isArray(data?.results),
				resultsLength: data?.results?.length,
				dataKeys: data ? Object.keys(data) : []
			});
			
			// Initialize indexing tracking for uploaded files using response mapping (onyx_file_id when present)
			if (data && Array.isArray(data.results)) {
				console.log('[SmartDrive] Processing upload results:', data.results);
				
				const next: IndexingState = { ...indexing };
				const pathsToTrack: string[] = [];
				
				for (const r of data.results) {
					console.log('[SmartDrive] Processing result:', r);
					
					const filename = r.filename || r.file;
					if (!filename) {
						console.warn('[SmartDrive] No filename found in result:', r);
						continue;
					}
					
					const p = `${currentPath.endsWith('/') ? currentPath : currentPath + '/'}${filename}`.replace(/\/+/g, '/');
					console.log(`[SmartDrive] Creating path: ${p} from currentPath=${currentPath}, filename=${filename}`);
					
					// Always add to tracking, even without onyx_file_id (we'll use pending state)
					next[p] = { 
						status: r.onyx_file_id ? 'pending' : 'pending', 
						etaPct: 10, 
						onyxFileId: r.onyx_file_id,
						timeStarted: Date.now(),
						timeUpdated: Date.now(),
						estimatedTokens: undefined,
						estimatedDuration: undefined
					};
					pathsToTrack.push(p);
					console.log(`[SmartDrive] Added to indexing tracking:`, { path: p, onyxFileId: r.onyx_file_id, state: next[p] });
				}
				
				console.log('[SmartDrive] New indexing state:', next);
				console.log('[SmartDrive] Paths to track:', pathsToTrack);
				console.log('[SmartDrive] About to call setIndexing with:', next);
				
				// Set indexing state BEFORE fetching list so the UI shows progress immediately
				setIndexing(next);
				console.log('[SmartDrive] setIndexing called');
				// Verify state will update
				setTimeout(() => {
					console.log('[SmartDrive] State check after 100ms - indexing keys:', Object.keys(indexing));
				}, 100);
				
				// Fetch the updated list to show new files
				await fetchList(currentPath);
				
				// Start polling for real progress data (non-blocking)
				if (pathsToTrack.length > 0) {
					pollIndexingProgress(pathsToTrack).catch(err => {
						console.error('[SmartDrive] pollIndexingProgress error:', err);
					});
				}
			} else {
				console.warn('[SmartDrive] No results array in upload response:', data);
				console.warn('[SmartDrive] Response structure:', JSON.stringify(data, null, 2));
				
				// Fallback: Try to initialize indexing for uploaded files based on file list
				// This ensures progress bars show even if backend response format is different
				const uploadedFileNames = files.map(f => f.name);
				console.log('[SmartDrive] Fallback: uploaded file names:', uploadedFileNames);
				
				const next: IndexingState = { ...indexing };
				const pathsToTrack: string[] = [];
				
				for (const fileName of uploadedFileNames) {
					const p = `${currentPath.endsWith('/') ? currentPath : currentPath + '/'}${fileName}`.replace(/\/+/g, '/');
					next[p] = {
						status: 'pending',
						etaPct: 10,
						timeStarted: Date.now(),
						timeUpdated: Date.now(),
						estimatedTokens: undefined,
						estimatedDuration: undefined
					};
					pathsToTrack.push(p);
					console.log(`[SmartDrive] Fallback: Added to indexing tracking:`, { path: p, state: next[p] });
				}
				
				console.log('[SmartDrive] Fallback indexing state:', next);
				console.log('[SmartDrive] Fallback - Object.keys(next):', Object.keys(next));
				console.log('[SmartDrive] Fallback - next has data?:', Object.keys(next).length > 0);
				setIndexing(next);
				console.log('[SmartDrive] Fallback setIndexing called');
				console.log('=== [SmartDrive] FALLBACK COMPLETE ===');
				
				await fetchList(currentPath);
				
				if (pathsToTrack.length > 0) {
					pollIndexingProgress(pathsToTrack).catch(err => {
						console.error('[SmartDrive] Fallback pollIndexingProgress error:', err);
					});
				}
			}
		} catch (e) {
			console.error('=== [SmartDrive] UPLOAD ERROR ===');
			console.error('[SmartDrive] Upload error:', e);
			alert('Upload failed');
		} finally {
			console.log('=== [SmartDrive] UPLOAD FINALLY BLOCK ===');
			console.log('[SmartDrive] Indexing state at end of upload:', indexing);
			setUploading([]);
			setBusy(false);
		}
	};

	const pollIndexingProgress = async (paths: string[], startTime?: number) => {
		if (!paths || paths.length === 0) {
			console.log('[SmartDrive] pollIndexingProgress: no paths provided');
			return;
		}
		
		const pollStartTime = startTime || Date.now();
		const MAX_POLL_TIME = 5 * 60 * 1000; // 5 minutes max polling
		
		console.log('[SmartDrive] pollIndexingProgress: starting poll for paths:', paths);
		
		try {
			const params = new URLSearchParams();
			for (const p of paths) {
				params.append('paths', p);
			}
			
			const url = `${CUSTOM_BACKEND_URL}/smartdrive/indexing-progress?${params.toString()}`;
			console.log('[SmartDrive] pollIndexingProgress: fetching URL:', url);
			
			const res = await fetch(url, { credentials: 'same-origin' });
			console.log('[SmartDrive] pollIndexingProgress: response status:', res.status);
			
			if (!res.ok) {
				console.error('[SmartDrive] pollIndexingProgress: request failed:', { status: res.status, statusText: res.statusText });
				// Fallback to old endpoint
				return pollIndexingStatusFallback(paths);
			}
			
			const data = await res.json();
			console.log('[SmartDrive] pollIndexingProgress: response data:', data);
			
			const progressData = data?.progress || {};
			console.log('[SmartDrive] pollIndexingProgress: extracted progress data:', progressData);
			
			let nextRemaining = 0;
			setIndexing(prev => {
				console.log('[SmartDrive] pollIndexingProgress: current indexing state:', prev);
				const out: IndexingState = { ...prev };
				
				// Track which paths we're actually polling for
				const pathsBeingPolled = new Set(paths);
				
				for (const p of Object.keys(out)) {
					// Only update paths that we're currently polling for
					if (!pathsBeingPolled.has(p)) {
						continue;
					}
					
					const progress = progressData[p];
					if (!progress) {
						console.log(`[SmartDrive] pollIndexingProgress: no progress data for path '${p}'`);
						// If we're polling for this path but have no data, keep it in pending state
						if (!out[p] || out[p].status === 'pending' || out[p].status === 'not_started') {
							nextRemaining += 1;
						}
						continue;
					}
					
					const oldState = out[p] || { status: 'unknown', etaPct: 0 };
					
					// Parse timestamps
					const timeStarted = progress.time_started ? new Date(progress.time_started).getTime() : undefined;
					const timeUpdated = progress.time_updated ? new Date(progress.time_updated).getTime() : undefined;
					
					// Calculate progress percentage, using current progress for gradual increase
					const etaPct = calculateProgress(
						progress.status, 
						timeStarted, 
						progress.estimated_tokens,
						oldState.etaPct
					);
					
					out[p] = { 
						...oldState, 
						status: progress.status,
						etaPct,
						timeStarted,
						timeUpdated,
						estimatedTokens: progress.estimated_tokens,
						estimatedDuration: progress.estimated_tokens ? (progress.estimated_tokens / INDEX_TOKENS_PER_SEC) * 1000 : undefined
					};
					
					console.log(`[SmartDrive] pollIndexingProgress: updated state for '${p}':`, { 
						old: oldState, 
						new: out[p],
						progressData: progress
					});
					
					// Continue polling if not complete
					if (!progress.is_complete) {
						nextRemaining += 1;
					}
				}
				
				console.log('[SmartDrive] pollIndexingProgress: final indexing state:', out);
				console.log('[SmartDrive] pollIndexingProgress: remaining files:', nextRemaining);
				return out;
			});
			
			// No direct scheduling here; periodic polling is driven by a component-level interval
			// which watches for any paths still in progress.
		} catch (error) {
			console.error('[SmartDrive] pollIndexingProgress: error:', error);
			// Fallback to old endpoint
			return pollIndexingStatusFallback(paths);
		}
	};

	// Fallback to old binary status check
	const pollIndexingStatusFallback = async (paths: string[]) => {
		if (!paths || paths.length === 0) return;
		
		console.log('[SmartDrive] pollIndexingStatusFallback: using fallback for paths:', paths);
		
		try {
			const params = new URLSearchParams();
			for (const p of paths) {
				params.append('paths', p);
			}
			
			const url = `${CUSTOM_BACKEND_URL}/smartdrive/indexing-status?${params.toString()}`;
			const res = await fetch(url, { credentials: 'same-origin' });
			
			if (!res.ok) return;
			
			const data = await res.json();
			const statuses = data?.statuses || {};
			
			let nextRemaining = 0;
			setIndexing(prev => {
				const out: IndexingState = { ...prev };
				
				for (const p of Object.keys(out)) {
					const done = statuses[p] === true || statuses[encodeURI(p)] === true || statuses[decodeURIComponent(p)] === true;
					const oldState = out[p] || { status: 'unknown', etaPct: 0 };
					
					out[p] = { 
						...oldState, 
						status: done ? 'done' : 'pending', 
						etaPct: done ? 100 : Math.min(95, (oldState.etaPct ?? 5) + 10) 
					};
					
					if (!done) nextRemaining += 1;
				}
				
				return out;
			});
			
			if (nextRemaining > 0) {
				setTimeout(() => pollIndexingStatusFallback(paths), 1500);
			}
		} catch (error) {
			console.error('[SmartDrive] pollIndexingStatusFallback: error:', error);
		}
	};

	const onDrop = async (e: React.DragEvent) => {
		console.log('%c[SmartDriveBrowser] FILE DROP EVENT', 'background: #ff0000; color: #fff; font-size: 14px; font-weight: bold');
		console.log('[SmartDriveBrowser] Files dropped:', e.dataTransfer.files);
		e.preventDefault();
		if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) {
			console.log('[SmartDriveBrowser] No files dropped');
			return;
		}
		console.log('[SmartDriveBrowser] About to call uploadFiles with:', Array.from(e.dataTransfer.files).map(f => f.name));
		await uploadFiles(Array.from(e.dataTransfer.files));
	};

	// Periodic polling driver: while there are any items not complete, poll every 1.5s
	useEffect(() => {
		console.log('[SmartDrive] useEffect - indexing state changed:', {
			indexingKeys: Object.keys(indexing),
			indexingState: indexing
		});
		
		const pathsNeedingPolling = Object.entries(indexing)
			.filter(([_, st]) => st && st.status !== 'success' && st.status !== 'done' && st.status !== 'failed')
			.map(([path]) => path);

		console.log('[SmartDrive] useEffect - paths needing polling:', pathsNeedingPolling);
		
		if (pathsNeedingPolling.length === 0) return;

		const interval = setInterval(() => {
			pollIndexingProgress(pathsNeedingPolling);
		}, 1500);

		return () => clearInterval(interval);
	}, [indexing]);

	// Cleanup completed indexing entries after a delay to prevent memory buildup
	useEffect(() => {
		const completedPaths = Object.entries(indexing)
			.filter(([_, st]) => st && (st.status === 'success' || st.status === 'done'))
			.map(([path]) => path);

		if (completedPaths.length === 0) return;

		// Remove completed entries after 3 seconds to allow users to see the completion
		const timeout = setTimeout(() => {
			setIndexing(prev => {
				const next = { ...prev };
				completedPaths.forEach(path => {
					delete next[path];
				});
				return next;
			});
		}, 3000);

		return () => clearTimeout(timeout);
	}, [indexing]);

	const onDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const download = async () => {
		const filesOnly = Array.from(selected).filter(p => items.find(i => i.path === p && i.type === 'file'));
		for (const p of filesOnly) {
			try {
				const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/download?path=${encodeURIComponent(p)}`, { 
					credentials: 'same-origin' 
				});
				if (!res.ok) throw new Error(`Download failed: ${res.status}`);
				const data = await res.json();
				if (data.downloadUrl) {
					window.open(data.downloadUrl, '_blank');
				}
			} catch (e) {
				console.error('[SmartDrive] Download error:', e);
				alert('Download failed');
			}
		}
	};

	// Download single path (bypass selection)
	const downloadPath = async (p: string) => {
		try {
			const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/download?path=${encodeURIComponent(p)}`, { 
				credentials: 'same-origin' 
			});
			if (!res.ok) throw new Error(`Download failed: ${res.status}`);
			const data = await res.json();
			if (data.downloadUrl) {
				window.open(data.downloadUrl, '_blank');
			}
		} catch (e) {
			console.error('[SmartDrive] Download error:', e);
			alert('Download failed');
		}
	};

	const canRename = selected.size === 1;
	const canDelete = selected.size > 0;
	const canMoveCopy = selected.size > 0;
	const canDownload = Array.from(selected).some(p => items.find(i => i.path === p && i.type === 'file'));
	
	// Check if picker destination is valid (not current path, not a selected item)
	const isValidPickerDestination = useMemo(() => {
		// Normalize paths for comparison
		const normPickerPath = pickerPath.endsWith('/') ? pickerPath : `${pickerPath}/`;
		const normCurrentPath = currentPath.endsWith('/') ? currentPath : `${currentPath}/`;
		
		// Can't move to the same folder
		if (normPickerPath === normCurrentPath) return false;
		
		// Can't move a folder into itself or its children
		for (const selPath of pickerSelected) {
			const normSelPath = selPath.endsWith('/') ? selPath : `${selPath}/`;
			// If picker path is the selected item or a child of it
			if (normPickerPath === normSelPath || normPickerPath.startsWith(normSelPath)) {
				return false;
			}
		}
		
		return true;
	}, [pickerPath, currentPath, pickerSelected]);

	// In select mode, notify parent on every selection change to enable downstream buttons immediately
	// Filter out folders - only allow file selection
	useEffect(() => {
		if (mode === 'select' && onFilesSelected) {
			// Filter to only include files (exclude folders)
			// We check against current items without adding to deps to avoid re-render loops
			const filesOnly = Array.from(selected).filter(path => {
				const item = items.find(i => i.path === path);
				return item && item.type === 'file';
			});
			onFilesSelected(filesOnly);
		}
		// Note: items and onFilesSelected are intentionally NOT in deps to avoid re-render loops
		// - items changes on every fetch but we only need current value when selected changes
		// - onFilesSelected may not be memoized by parent, causing infinite loops if included
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mode, selected]);

	return (
		<div className={`space-y-3 text-gray-900 ${className}`}>

			{/* Upload progress */}
			{uploading.length > 0 && (
				<div className="space-y-2">
					{uploading.map(u => (
						<div key={u.filename} className="flex items-center gap-3">
							<div className="w-48 truncate text-sm text-slate-600">{u.filename}</div>
							<Progress value={u.progress} className="w-full" />
						</div>
					))}
				</div>
			)}

			<Dialog open={mkdirOpen} onOpenChange={setMkdirOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create folder</DialogTitle>
						<DialogDescription>Enter a name for the new folder in the current directory.</DialogDescription>
					</DialogHeader>
					<div className="mt-2">
						<UiInput value={mkdirName} onChange={(e)=>setMkdirName(e.target.value)} placeholder="Folder name" autoFocus />
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={()=>setMkdirOpen(false)}>Cancel</Button>
						<Button onClick={createFolder} variant="download" disabled={!mkdirName.trim() || busy} className='rounded-full'>Create</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Grid View */}
			{viewMode === "grid" ? (
				<div ref={containerRef} onDrop={onDrop} onDragOver={onDragOver} className="min-h-[600px]">
					
					{loading ? (
						<div className="p-10 text-center text-slate-600">Loading…</div>
					) : error ? (
						<div className="p-10 text-center text-red-500">{error}</div>
					) : items.length === 0 || !items.some(item => item.type === 'file') ? (
						<EmptySmartDrive onUploadClick={onUploadClick} variant={emptyStateVariant} />
					) : filtered.length === 0 ? (
						<div className="p-10 text-center text-slate-600">No files match your search</div>
					) : (
						<div className="space-y-6">
							{/* Back Button - Show when a folder is selected or not at root */}
							{(selectedFolderForView || currentPath !== '/') && (
								<div className="mb-4">
									<Button
										variant="outline"
										onClick={() => {
											if (selectedFolderForView) {
												setSelectedFolderForView(null);
											} else {
												const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
												setCurrentPath(parentPath);
											}
										}}
										className="flex rounded-md items-center gap-2"
									>
										{`< Back`}
									</Button>
								</div>
							)}

							{/* Folders Section - Horizontal list at top */}
							{filtered.filter(item => item.type === 'directory').length > 0 && (
								<div>
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-5 gap-x-8">
										{filtered.filter(item => item.type === 'directory').map((it, idx) => {
											const handleMenuAction = (action: 'rename' | 'move' | 'copy' | 'delete' | 'download') => {
												setSelected(new Set([it.path]));
								switch(action) {
									case 'rename': rename(it.path); break;
									case 'move': 
										setMoveOperation('move');
										setShowFolderSelectionModal(true);
										break;
									case 'copy': 
										setMoveOperation('copy');
										setShowFolderSelectionModal(true);
										break;
									case 'delete': del([it.path]); break;
									case 'download': download(); break;
								}
											};
											
											return (
												<div
													key={it.path}
													className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer relative group ${
														selectedFolderForView === it.path 
															? 'border-blue-500 bg-blue-50 shadow-md' 
															: 'border-gray-200'
													}`}
													onClick={(e) => onRowClick(idx, it, e)}
												>
													<div className="flex items-start justify-between p-1">
														<div className="flex items-center gap-1 flex-1 min-w-0">
															<div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
																<svg width="25" height="25" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
																	<path d="M2.33333 12.3333H13C13.3536 12.3333 13.6928 12.1929 13.9428 11.9428C14.1929 11.6928 14.3333 11.3536 14.3333 11V4.33333C14.3333 3.97971 14.1929 3.64057 13.9428 3.39052C13.6928 3.14048 13.3536 3 13 3H7.71333C7.49372 2.99886 7.2778 2.9435 7.08473 2.83883C6.89167 2.73415 6.72745 2.58341 6.60667 2.4L6.06 1.6C5.93922 1.41659 5.775 1.26585 5.58193 1.16117C5.38887 1.0565 5.17294 1.00114 4.95333 1H2.33333C1.97971 1 1.64057 1.14048 1.39052 1.39052C1.14048 1.64057 1 1.97971 1 2.33333V11C1 11.7333 1.6 12.3333 2.33333 12.3333Z" stroke="#878787" strokeLinecap="round" strokeLinejoin="round"/>
																</svg>
															</div>
															<div className="flex-1 min-w-0">
																<h3 className="font-medium text-xs text-gray-900 truncate">
																	{(() => { try { return decodeURIComponent(it.name); } catch { return it.name; } })()}
																</h3>
																<p className="text-[11px] text-[#878787]">
																	{folderItemCounts[it.path] !== undefined 
																		? `${folderItemCounts[it.path]} ${folderItemCounts[it.path] === 1 ? 'file' : 'files'}`
																		: 'Folder'
																	}
																</p>
															</div>
														</div>
														<DropdownMenu>
															<DropdownMenuTrigger asChild disabled={mode === 'select'}>
																<Button 
																	variant="ghost" 
																	size="sm" 
																	className="h-6 w-6 pt-3"
																	onClick={(e) => e.stopPropagation()}
																	disabled={mode === 'select'}
																>
																	<MoreVertical size={14} className={mode === 'select' ? 'text-gray-300' : 'text-gray-500'} />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																<DropdownMenuItem onSelect={() => handleMenuAction('rename')}>
																	<Pencil size={16} className="text-gray-500" />
																	<span>Rename</span>
																</DropdownMenuItem>
																{/* <DropdownMenuItem onSelect={() => handleMenuAction('move')}>
																	<MoveRight size={16} className="text-gray-500" />
																	<span>Move</span>
																</DropdownMenuItem>
																<DropdownMenuItem onSelect={() => handleMenuAction('copy')}>
																	<Copy size={16} className="text-gray-500" />
																	<span>Copy</span>
																</DropdownMenuItem> */}
																<DropdownMenuItem onSelect={() => handleMenuAction('delete')}>
																	<Trash2 size={16} className="text-red-600" />
																	<span className="text-red-600">Delete</span>
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							)}
							
							
							{/* Files Section - Show unassigned files when no folder selected, or selected folder's contents */}
							{(() => {
								const filesToShow = selectedFolderForView && folderContentsMap[selectedFolderForView]
									? applyFilters(folderContentsMap[selectedFolderForView]).filter(item => item.type === 'file')
									: filtered.filter(item => item.type === 'file');
								
								if (filesToShow.length === 0) return null;
								
								return (
									<div className="mt-4">
										{selectedFolderForView && (
											<div className="mb-2 flex items-center gap-2 text-md font-semibold text-gray-700">
												<Folder className='w-8 h-8' strokeWidth={1.5} /> <span>{(() => { 
													const folderName = selectedFolderForView.split('/').pop() || 'Folder';
													try { return decodeURIComponent(folderName); } catch { return folderName; }
												})()} ({filesToShow.length} {filesToShow.length === 1 ? 'item' : 'items'} in this folder)</span>
											</div>
										)}
										<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-5">
											{filesToShow.map((folderItem, folderIdx) => {
											const handleFolderMenuAction = (action: 'rename' | 'move' | 'copy' | 'delete' | 'download') => {
												setSelected(new Set([folderItem.path]));
												switch(action) {
													case 'rename': rename(); break;
													case 'move': 
														setMoveOperation('move');
														setShowFolderSelectionModal(true);
														break;
													case 'copy': 
														setMoveOperation('copy');
														setShowFolderSelectionModal(true);
														break;
													case 'delete': del([folderItem.path]); break;
													case 'download': download(); break;
												}
											};
											
											const isSelected = selected.has(folderItem.path);
											
											return (
												<div
													key={folderItem.path}
													className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer relative group ${
														isSelected && mode === 'select' ? 'border-blue-500 border-2' : 'border-gray-200'
													}`}
													onClick={(e) => onRowClick(folderIdx, folderItem, e)}
												>
													{/* Content Preview Area */}
													<div className="h-40 bg-gradient-to-br from-blue-50 to-gray-50 rounded-t-lg flex items-center justify-center relative">
														{(() => {
															const FileIcon = getFileIcon(folderItem.mime_type);
															return (
																<div className="flex flex-col items-center text-gray-500">
																	<FileIcon strokeWidth={1.5} className="w-10 h-10" />
																	<span className="text-xs mt-1">{folderItem.mime_type?.split('/')[1]?.toUpperCase() || 'FILE'}</span>
																</div>
															);
														})()}
														
														{/* File type icon in top-left */}
														<div className="absolute top-2 left-2">
															{folderItem.type === 'directory' ? (
																<div className="w-6 h-6 bg-white rounded-sm border border-[#E0E0E0] flex items-center justify-center">
																	<svg width="16" height="16" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
																		<path d="M2.33333 12.3333H13C13.3536 12.3333 13.6928 12.1929 13.9428 11.9428C14.1929 11.6928 14.3333 11.3536 14.3333 11V4.33333C14.3333 3.97971 14.1929 3.64057 13.9428 3.39052C13.6928 3.14048 13.3536 3 13 3H7.71333C7.49372 2.99886 7.2778 2.9435 7.08473 2.83883C6.89167 2.73415 6.72745 2.58341 6.60667 2.4L6.06 1.6C5.93922 1.41659 5.775 1.26585 5.58193 1.16117C5.38887 1.0565 5.17294 1.00114 4.95333 1H2.33333C1.97971 1 1.64057 1.14048 1.39052 1.39052C1.14048 1.64057 1 1.97971 1 2.33333V11C1 11.7333 1.6 12.3333 2.33333 12.3333Z" stroke="#0F58F9" strokeLinecap="round" strokeLinejoin="round"/>
																	</svg>
																</div>
															) : (() => {
																const FileIcon = getFileIcon(folderItem.mime_type);
																return (
																	<div className="w-6 h-6 bg-white rounded-sm border-[#E0E0E0] flex items-center justify-center">
																		<FileIcon strokeWidth={1.5} className="w-4 h-4 text-[#0F58F9]" />
																	</div>
																);
															})()}
														</div>
														
													{/* Selection indicator - blue circle with checkmark in top-right (only in select mode) */}
													{mode === 'select' && (
														<div className="absolute top-2 right-2">
															<div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-sm ${
																isSelected 
																	? 'bg-blue-500 border-2 border-blue-500' 
																	: 'bg-white border-2 border-gray-300 hover:border-gray-400'
															}`}>
																{isSelected && (
																	<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
																		<path d="M11.6654 3.5L5.24873 9.91667L2.33203 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
																	</svg>
																)}
															</div>
														</div>
													)}
													</div>
													
													{/* Bottom Section - Title, Date, Actions */}
													<div className="p-3">
														<h3 className="font-semibold text-sm h-10 text-gray-900 truncate mb-1">
															{(() => { try { return decodeURIComponent(folderItem.name); } catch { return folderItem.name; } })()}
														</h3>
														
														{/* Progress bar for indexing files */}
														{folderItem.type === 'file' && (() => { 
															const s = indexing[folderItem.path] || indexing[(() => { try { return decodeURIComponent(folderItem.path); } catch { return folderItem.path; } })()] || indexing[encodeURI(folderItem.path)]; 
															const shouldShow = s && s.status !== 'done';
															console.log(`[SmartDrive] Grid progress bar check for '${folderItem.path}':`, {
																indexingState: s,
																shouldShow,
																allIndexingKeys: Object.keys(indexing),
																decodedPath: (() => { try { return decodeURIComponent(folderItem.path); } catch { return 'decode-error'; } })(),
																encodedPath: encodeURI(folderItem.path)
															});
															return shouldShow;
														})() && (
															<div className="mb-2" title="We are indexing this file so it can be searched and used by AI. This usually takes a short moment.">
																{(() => { 
																	const s = indexing[folderItem.path] || indexing[(() => { try { return decodeURIComponent(folderItem.path); } catch { return folderItem.path; } })()] || indexing[encodeURI(folderItem.path)]; 
																	const pct = s?.etaPct ?? 10; 
																	return (
																		<div className="space-y-1">
																			<div className="flex items-center justify-between">
																				<span className="text-xs text-blue-600 font-medium">Indexing...</span>
																				<span className="text-xs text-blue-600">{Math.round(pct)}%</span>
																			</div>
																			<div className="h-1.5 w-full bg-slate-200 rounded overflow-hidden">
																				<div 
																					className="h-full bg-blue-500 transition-all duration-300" 
																					style={{ width: `${pct}%` }} 
																				/>
																			</div>
																		</div>
																	);
																})()}
															</div>
														)}
														
														<div className="flex items-center justify-between">
															<p className="text-xs text-gray-500">
																{folderItem.modified ? new Date(folderItem.modified).toLocaleDateString('en-US', { 
																	month: 'long', 
																	day: 'numeric', 
																	year: 'numeric' 
																}) : 'No date'}
															</p>
															
															{/* More options button */}
															<DropdownMenu>
																<DropdownMenuTrigger asChild disabled={mode === 'select'}>
																	<Button 
																		variant="ghost" 
																		size="sm" 
																		className="h-6 w-6 p-0"
																		onClick={(e) => e.stopPropagation()}
																		disabled={mode === 'select'}
																	>
																		<MoreHorizontal size={14} className={mode === 'select' ? 'text-gray-300' : 'text-gray-500'} />
																	</Button>
																</DropdownMenuTrigger>
																<DropdownMenuContent align="end">
																	<DropdownMenuItem onSelect={() => handleFolderMenuAction('rename')}>
																		<Pencil size={16} className="text-gray-500" />
																		<span>Rename</span>
																	</DropdownMenuItem>
																	<DropdownMenuItem onSelect={() => handleFolderMenuAction('move')}>
																		<FolderPlus size={16} className="text-gray-500" />
																		<span>Move to folder...</span>
																	</DropdownMenuItem>
																	<DropdownMenuItem onSelect={() => handleFolderMenuAction('copy')}>
																		<Copy size={16} className="text-gray-500" />
																		<span>Copy</span>
																	</DropdownMenuItem>
																	<DropdownMenuItem onSelect={() => handleFolderMenuAction('delete')}>
																		<Trash2 size={16} className="text-red-600" />
																		<span className="text-red-600">Delete</span>
																	</DropdownMenuItem>
																	{folderItem.type === 'file' && (
																		<DropdownMenuItem onSelect={() => handleFolderMenuAction('download')}>
																			<Download size={16} className="text-gray-500" />
																			<span>Download</span>
																		</DropdownMenuItem>
																	)}
																</DropdownMenuContent>
															</DropdownMenu>
														</div>
													</div>
												</div>
											);
										})}
										</div>
									</div>
								);
							})()}
						</div>
					)}
				</div>
			) : (
				/* List View */
				<div ref={containerRef} onDrop={onDrop} onDragOver={onDragOver} className="max-h-[600px] flex flex-col">
					{loading ? (
						<div className="p-10 text-center text-slate-600">Loading…</div>
					) : error ? (
						<div className="p-10 text-center text-red-500">{error}</div>
					) : items.length === 0 || !items.some(item => item.type === 'file') ? (
						<EmptySmartDrive onUploadClick={onUploadClick} variant={emptyStateVariant} />
					) : filtered.length === 0 ? (
						<div className="p-10 text-center text-slate-600">No files match your search</div>
					) : (
						<div className="flex flex-col min-h-0 flex-1">
							{/* Back Button - Show when not at root */}
							{currentPath !== '/' && (
								<div className="p-3 bg-white border-b">
									<Button
										variant="outline"
										onClick={() => {
											const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
											setCurrentPath(parentPath);
										}}
										className="flex rounded-md items-center gap-2"
									>
										{`< Back`}
									</Button>
								</div>
							)}
							
							<div className="bg-white rounded-md border shadow-sm border-[#E0E0E0] flex-1">
								<Table className="min-w-full divide-y divide-[#E0E0E0]">
									<TableHeader className="bg-white divide-y divide-[#E0E0E0] [&_tr]:border-b-0">
										<TableRow className='divide-y divide-[#E0E0E0] border-b-0'>
											<TableHead 
												className="px-3 py-1 text-left text-xs font-normal text-[#71717A] tracking-wider"
												style={{ width: '100px' }}
											>
												<div className="flex items-center gap-2">
													<FileStack strokeWidth={1} className="text-[#71717A]" size={15} />
													Type
												</div>
											</TableHead>
											<TableHead 
												className="px-3 py-1 text-left text-xs font-normal text-[#71717A] tracking-wider cursor-pointer hover:bg-gray-50"
												onClick={()=>{setSortKey('name'); setSortAsc(k=>sortKey==='name'?!k:true);}}
											>
												<div className="flex items-center gap-2">
													<ClipboardPenLine strokeWidth={1} className="text-[#71717A]" size={15} />
													Title
													{sortKey === 'name' && <ArrowUpDown className="w-3 h-3 ml-1"/>}
												</div>
											</TableHead>
											<TableHead 
												className="px-3 py-1 text-left text-xs font-normal text-[#71717A] tracking-wider cursor-pointer hover:bg-gray-50"
												style={{ width: '150px' }}
												onClick={()=>{setSortKey('creator'); setSortAsc(k=>sortKey==='creator'?!k:true);}}
											>
												<div className="flex items-center gap-2">
													<Users strokeWidth={1} className="text-[#71717A]" size={15} />
													Creator
													{sortKey === 'creator' && <ArrowUpDown className="w-3 h-3 ml-1"/>}
												</div>
											</TableHead>
											<TableHead 
												className="px-3 py-1 text-left text-xs font-normal text-[#71717A] tracking-wider cursor-pointer hover:bg-gray-50"
												style={{ width: '160px' }}
												onClick={()=>{setSortKey('modified'); setSortAsc(k=>sortKey==='modified'?!k:true);}}
											>
												<div className="flex items-center gap-2">
													<CalendarDays strokeWidth={1} className="text-[#71717A]" size={15} />
													Edited
													{sortKey === 'modified' && <ArrowUpDown className="w-3 h-3 ml-1"/>}
												</div>
											</TableHead>
											<TableHead 
												className="px-3 py-1 text-right text-xs font-normal text-[#71717A]"
												style={{ width: '50px' }}
											>
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody className="bg-white divide-y divide-[#E0E0E0]">
								{(() => {
									// If any folder is expanded, show the folder with blue background and its contents
									const expandedFolder = Array.from(expandedFolders)[0]; // Get first expanded folder
									if (expandedFolder) {
										// Find the expanded folder in the main items list
										const expandedFolderItem = paginatedItems.find(item => item.path === expandedFolder);
										
										return (
											<>
												{/* Show the expanded folder with blue background */}
												{expandedFolderItem && (
													<React.Fragment key={expandedFolderItem.path}>
														<TableRow className={`hover:bg-gray-50 divide-y divide-gray-200 transition cursor-pointer ${
															expandedFolderItem.type === 'directory' ? 'group' : ''
														} ${
															expandedFolderItem.type === 'directory' && expandedFolders.has(expandedFolderItem.path) ? 'bg-blue-50' : ''
														}`} onClick={(e)=>onRowClick(paginatedItems.indexOf(expandedFolderItem), expandedFolderItem, e)}>
															{/* Type Column */}
															<TableCell className="px-3 py-2 whitespace-nowrap">
																<div className="flex items-center gap-2">
																<div className="w-5 h-5">
																	{expandedFolderItem.type === 'directory' ? (
																		<Folder strokeWidth={1.5} className="w-5 h-5 text-[#0F58F9]"/>
																	) : (() => {
																		const FileIcon = getFileIcon(expandedFolderItem.mime_type);
																		return <FileIcon strokeWidth={1.5} className="w-5 h-5 text-[#0F58F9]"/>;
																	})()}
																</div>
																<span className="ml-2 text-xs text-[#71717A]">
																	{expandedFolderItem.type === 'directory' ? 'Folder' : (expandedFolderItem.mime_type?.split('/')[1]?.toUpperCase() || 'FILE')}
																</span>
																</div>
															</TableCell>
															
															{/* Title Column - Main content with more width */}
															<TableCell className="px-3 py-2">
																<div className={`flex items-center gap-2 font-regular ${
																	expandedFolderItem.type === 'directory' && expandedFolders.has(expandedFolderItem.path) ? 'text-blue-900' : 'text-[#09090B]'
																}`}>
																	{
																		expandedFolderItem.type === 'directory' && expandedFolders.has(expandedFolderItem.path) ? 
																		(<span><ChevronLeft className="w-4 h-4 text-blue-900" /></span>) : ''
																	}
																	{(() => { try { return decodeURIComponent(expandedFolderItem.name); } catch { return expandedFolderItem.name; } })()}
																</div>
															<div className="text-xs text-slate-500">
																{expandedFolderItem.type === 'file' 
																	? '' 
																	: (expandedFolderItem.type === 'directory' && expandedFolders.has(expandedFolderItem.path) && folderItemCounts[expandedFolderItem.path] !== undefined 
																		? `${folderItemCounts[expandedFolderItem.path]} ${folderItemCounts[expandedFolderItem.path] === 1 ? 'item' : 'items'}`
																		: ''
																	)
																}
															</div>
															</TableCell>
															
															{/* Creator Column */}
															<TableCell className="px-3 py-2 whitespace-nowrap text-left text-sm text-slate-700">
																<span className="inline-flex items-start text-[var(--main-text)] gap-2">
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
															
															{/* Modified Column */}
															<TableCell className="px-3 py-2 whitespace-nowrap text-left text-sm text-slate-700">
																{expandedFolderItem.modified ? new Date(expandedFolderItem.modified).toLocaleDateString() : 'No date'}
															</TableCell>
															
															{/* Action Column */}
															<TableCell className="px-3 py-2 text-right divide-y divide-gray-200" onClick={(e) => e.stopPropagation()}>
															<div className="flex justify-end">
																<DropdownMenu>
																	<DropdownMenuTrigger asChild disabled={mode === 'select'}>
																		<Button variant="ghost" className="h-8 w-8 p-0" onClick={(e: React.MouseEvent)=>e.stopPropagation()} disabled={mode === 'select'}>
																			<MoreHorizontal className={mode === 'select' ? 'w-4 h-4 text-gray-300' : 'w-4 h-4 text-[#09090B] hover:text-slate-600'} />
																		</Button>
																	</DropdownMenuTrigger>
																	<DropdownMenuContent align="end">
																		<DropdownMenuItem onSelect={() => {
																			rename(expandedFolderItem.path);
																		}}><Pencil className="w-4 h-4 mr-2"/>Rename</DropdownMenuItem>
																		<DropdownMenuItem onSelect={() => {
																			setSelected(new Set([expandedFolderItem.path]));
																			setMoveOperation('move');
																			setShowFolderSelectionModal(true);
																		}}><FolderPlus className="w-4 h-4 mr-2"/>Move to folder...</DropdownMenuItem>
																		<DropdownMenuItem onSelect={() => {
																			setSelected(new Set([expandedFolderItem.path]));
																			setMoveOperation('copy');
																			setShowFolderSelectionModal(true);
																		}}><Copy className="w-4 h-4 mr-2"/>Copy</DropdownMenuItem>
																		<DropdownMenuItem onSelect={() => del([expandedFolderItem.path])}><Trash2 className="w-4 h-4 mr-2"/>Delete</DropdownMenuItem>
																		<DropdownMenuItem disabled={expandedFolderItem.type !== 'file'} onSelect={() => {
																			setSelected(new Set([expandedFolderItem.path]));
																			download();
																		}}><Download className="w-4 h-4 mr-2"/>Download</DropdownMenuItem>
																	</DropdownMenuContent>
																</DropdownMenu>
															</div>
															</TableCell>
														</TableRow>
													</React.Fragment>
												)}
												
												{/* Show the folder contents */}
												{folderContentsMap[expandedFolder] && applyFilters(folderContentsMap[expandedFolder])
													.filter(it => {
														// Filter out any items that have the same path as the expanded folder
														// to prevent duplicate folder entries
														return it.path !== expandedFolder;
													})
													.map((it, idx) => {
											const handleMenuAction = (action: 'rename' | 'move' | 'copy' | 'delete' | 'download') => {
												setSelected(new Set([it.path]));
												switch(action) {
													case 'rename': rename(it.path); break;
													case 'move': 
														setMoveOperation('move');
														setShowFolderSelectionModal(true);
														break;
													case 'copy': 
														setMoveOperation('copy');
														setShowFolderSelectionModal(true);
														break;
													case 'delete': del([it.path]); break;
													case 'download': download(); break;
												}
											};
											
											return (
												<TableRow key={it.path} className="hover:bg-gray-50 transition cursor-pointer" onClick={(e) => onRowClick(idx, it, e)}>
													{/* Type Column */}
													<TableCell className="px-3 py-2 whitespace-nowrap">
														<div className="flex items-center gap-2">
														<div className="w-5 h-5">
															{it.type === 'directory' ? (
																<Folder strokeWidth={1.5} className="w-5 h-5 text-[#0F58F9]"/>
															) : (() => {
																const FileIcon = getFileIcon(it.mime_type);
																return <FileIcon strokeWidth={1.5} className="w-5 h-5 text-[#0F58F9]"/>;
															})()}
														</div>
														<span className="ml-2 text-xs text-[#71717A]">
															{it.type === 'directory' ? 'Folder' : (it.mime_type?.split('/')[1]?.toUpperCase() || 'FILE')}
														</span>
														</div>
													</TableCell>
													
													{/* Title Column */}
													<TableCell className="px-3 py-2">
														<div className="font-medium text-slate-800 flex items-center gap-2">
															{(() => { try { return decodeURIComponent(it.name); } catch { return it.name; } })()}
														</div>
														<div className="text-xs text-[#09090B] ml-5">
															{it.type === 'file' 
																? ''
																: (it.type === 'directory' && expandedFolders.has(it.path) && folderItemCounts[it.path] !== undefined 
																	? `${folderItemCounts[it.path]} ${folderItemCounts[it.path] === 1 ? 'file' : 'files'}`
																	: ''
																)
															}
														</div>
														{it.type === 'file' && (() => { 
															const s = indexing[it.path] || indexing[(() => { try { return decodeURIComponent(it.path); } catch { return it.path; } })()] || indexing[encodeURI(it.path)]; 
															const shouldShow = s && s.status !== 'done';
															console.log(`[SmartDrive] Progress bar check for expanded folder item '${it.path}':`, {
																indexingState: s,
																shouldShow,
																allIndexing: indexing
															});
															return shouldShow;
														})() && (
															<div className="mt-1" title="We are indexing this file so it can be searched and used by AI. This usually takes a short moment.">
																{(() => { 
																	const s = indexing[it.path] || indexing[(() => { try { return decodeURIComponent(it.path); } catch { return it.path; } })()] || indexing[encodeURI(it.path)]; 
																	const pct = s?.etaPct ?? 10; 
																	return (
																		<div className="h-1.5 w-56 md:w-64 bg-slate-200 rounded overflow-hidden">
																			<div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
																		</div>
																	);
																})()}
															</div>
														)}
													</TableCell>
													
													{/* Creator Column */}
													<TableCell className="px-3 py-2 whitespace-nowrap text-sm text-slate-700">
														<span className="inline-flex items-center text-[var(--main-text)] gap-2">
															<div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm bg-[#E1E1E1]">
																<svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="100%" viewBox="0 0 288 288" enableBackground="new 0 0 288 288" xmlSpace="preserve">
																	<path fill="#6C6C6C" opacity="1.000000" stroke="none" d=" M126.764687,243.325195   C129.743134,252.333206 134.648621,260.277374 136.916687,270.400635   C128.787888,268.256714 124.842384,262.069458 118.092896,258.664429   C119.308434,262.129517 120.328094,264.713470 121.101715,267.369141   C121.528847,268.835388 122.829292,270.669861 120.802452,271.840027   C119.127396,272.807129 118.008667,271.188202 116.981483,270.234497   C108.673660,262.520996 100.574516,254.570007 93.602295,245.621414   C88.185638,238.669373 83.379593,231.244629 78.121811,224.163879   C76.570457,222.074600 74.951332,219.858124 71.795006,218.364532   C68.604797,223.381012 67.569160,229.950348 62.030056,233.435074   C57.042271,236.572968 52.403023,240.231232 48.189892,244.138397   C45.385746,241.875366 46.767834,240.212723 47.577496,238.707336   C49.391239,235.335022 51.005894,231.772644 53.326328,228.770523   C62.297386,217.164062 61.618809,203.921829 60.225838,190.532364   C59.637970,184.881699 58.121010,179.383667 56.273403,174.050064   C50.275124,156.734436 50.554508,139.405197 55.733799,122.029739   C62.114437,100.624023 71.474792,81.173080 89.520638,66.695068   C119.857658,42.355949 155.847946,46.867363 183.390152,65.028984   C195.984482,73.333817 202.778366,86.450531 207.319687,100.443886   C220.159134,140.006592 218.619019,179.070526 202.323807,217.448044   C200.306015,222.200226 198.362686,226.984711 196.286087,231.710846   C195.603226,233.264999 195.330215,235.434372 192.021210,235.111679   C191.544830,225.995117 195.513290,217.500610 196.057571,208.130676   C186.909927,218.816956 176.217575,226.728729 162.932022,230.703110   C149.899185,234.601883 136.731003,234.265442 123.138283,230.953323   C123.345345,235.782639 125.523560,239.224625 126.764687,243.325195  M185.937988,124.180367   C182.732666,120.860306 179.360062,117.776848 175.175842,116.061447   C174.700089,116.430336 174.488876,116.507607 174.448608,116.637764   C172.698914,122.294319 164.988434,125.525246 167.817322,133.128540   C168.200027,134.157150 166.720673,135.102341 165.533051,135.391510   C163.605209,135.860962 161.647766,136.208862 159.377701,136.674805   C161.062805,138.449005 158.214310,139.753845 159.124908,141.856583   C161.031693,146.259705 159.627502,149.741455 155.057053,151.480652   C150.993805,153.026840 148.155334,151.062866 145.905991,145.527100   C145.726746,145.085938 145.432755,144.691406 144.954224,143.863846   C137.083755,146.571548 128.703262,146.706116 120.616859,148.478226   C113.820236,149.967682 110.196198,154.742355 110.369339,161.682526   C110.497734,166.829453 110.875473,171.978714 111.357933,177.106628   C112.634392,190.673721 114.232536,204.188416 118.169258,217.317474   C119.010086,220.121689 120.495758,221.867783 123.294586,222.868378   C133.616211,226.558395 144.297134,227.233017 154.796295,224.977173   C188.680298,217.696838 208.119064,187.382095 201.187790,153.323090   C200.214066,148.538284 199.843994,143.435669 195.424133,139.194107   C196.030853,141.250153 196.680496,142.586060 196.783371,143.962845   C197.089066,148.054352 194.487030,151.278244 190.663040,151.840393   C187.177460,152.352798 183.730301,149.776413 182.993546,146.178833   C182.302444,142.804062 185.592300,139.810059 183.053772,136.266769   C182.079926,136.181213 180.250900,136.130341 178.463898,135.829727   C176.965042,135.577560 175.410370,134.980118 175.073807,133.291550   C174.670563,131.268509 176.178680,130.222519 177.756851,129.593262   C179.907227,128.735870 182.201141,128.237198 184.347412,127.371315   C185.434494,126.932739 187.927521,127.160950 185.937988,124.180367  z"/>
																	<path fill="#6C6C6C" opacity="1.000000" stroke="none" d=" M184.497925,205.505127   C177.387009,214.158386 168.161636,212.015427 159.502716,210.813339   C153.161850,209.933029 147.837357,205.318619 141.258728,204.622986   C140.498917,204.542648 139.769547,203.878281 139.995148,202.334045   C142.825668,200.859970 146.206512,201.612762 149.324982,201.480194   C158.448822,201.092361 166.947464,196.727951 176.287842,197.627457   C179.712128,197.957230 182.802567,198.591614 185.588547,200.581680   C188.543945,202.692780 187.912109,204.213242 184.497925,205.505127  M159.784851,207.163208   C165.244186,209.836899 170.631027,207.250763 176.056244,206.667542   C170.672363,206.667542 165.288498,206.667542 159.784851,207.163208  M165.001892,203.486176   C170.099594,203.086731 175.197296,202.687271 180.294998,202.287827   C175.071182,203.026901 169.459641,199.147293 165.001892,203.486176  z"/>
																	<path fill="#6C6C6C" opacity="1.000000" stroke="none" d=" M173.344406,161.090042   C180.438629,158.990570 189.808182,167.157059 188.872223,176.054337   C188.152618,182.894730 178.548767,187.131531 172.244995,183.602051   C172.711761,181.630249 174.450790,182.014267 175.808838,181.629318   C179.330368,180.631119 183.150757,179.894424 183.894775,175.375717   C184.567642,171.289154 181.416046,165.869278 177.394379,163.900024   C175.949905,163.192734 174.040115,163.263535 173.344406,161.090042  z"/>
																</svg>
															</div>
															You
														</span>
													</TableCell>
													
													{/* Edited Column */}
													<TableCell className="px-3 py-2 whitespace-nowrap text-left text-sm text-slate-700">
														{it.modified ? new Date(it.modified).toLocaleDateString() : 'No date'}
													</TableCell>
													
													{/* Action Column */}
													<TableCell className="px-3 py-2 text-right divide-y divide-gray-200" onClick={(e) => e.stopPropagation()}>
													<div className="flex justify-end">
														<DropdownMenu>
															<DropdownMenuTrigger asChild disabled={mode === 'select'}>
																<Button variant="ghost" className="h-8 w-8 p-0" onClick={(e: React.MouseEvent)=>e.stopPropagation()} disabled={mode === 'select'}>
																	<MoreHorizontal className={mode === 'select' ? 'w-4 h-4 text-gray-300' : 'w-4 h-4 text-[#09090B] hover:text-slate-600'} />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																<DropdownMenuItem onSelect={() => handleMenuAction('rename')}><Pencil className="w-4 h-4 mr-2"/>Rename</DropdownMenuItem>
																<DropdownMenuItem onSelect={() => handleMenuAction('move')}><FolderPlus className="w-4 h-4 mr-2"/>Move to folder...</DropdownMenuItem>
																<DropdownMenuItem onSelect={() => handleMenuAction('copy')}><Copy className="w-4 h-4 mr-2"/>Copy</DropdownMenuItem>
																<DropdownMenuItem onSelect={() => handleMenuAction('delete')}><Trash2 className="w-4 h-4 mr-2"/>Delete</DropdownMenuItem>
																<DropdownMenuItem disabled={it.type !== 'file'} onSelect={() => handleMenuAction('download')}><Download className="w-4 h-4 mr-2"/>Download</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</div>
													</TableCell>
												</TableRow>
											);
										})}
											</>
										);
									}
									
									// Otherwise show all items normally (excluding expanded folders)
									return <>{paginatedItems.filter(item => !expandedFolders.has(item.path)).map((it, idx) => {
									const handleMenuAction = (action: 'rename' | 'move' | 'copy' | 'delete' | 'download') => {
										setSelected(new Set([it.path]));
								switch(action) {
									case 'rename': rename(it.path); break;
									case 'move': 
										setMoveOperation('move');
										setShowFolderSelectionModal(true);
										break;
									case 'copy': 
										setMoveOperation('copy');
										setShowFolderSelectionModal(true);
										break;
									case 'delete': del([it.path]); break;
									case 'download': download(); break;
								}
									};
									
									
									return (
										<React.Fragment key={it.path}>
											<TableRow className={`hover:bg-gray-50 transition cursor-pointer ${
												it.type === 'directory' ? 'group' : ''
											} ${
												it.type === 'directory' && expandedFolders.has(it.path) ? 'bg-blue-50' : ''
											}`} onClick={(e)=>onRowClick(idx, it, e)}>
											{/* Type Column */}
											<TableCell className="px-3 py-2 whitespace-nowrap">
												<div className="flex items-center gap-2">
												<div className="w-5 h-5">
													{it.type === 'directory' ? (
														<Folder strokeWidth={1.5} className="w-5 h-5 text-[#0F58F9]"/>
													) : (() => {
														const FileIcon = getFileIcon(it.mime_type);
														return <FileIcon strokeWidth={1.5} className="w-5 h-5 text-[#0F58F9]"/>;
													})()}
												</div>
												<span className="ml-2 text-xs text-[#71717A]">
													{it.type === 'directory' ? 'Folder' : (it.mime_type?.split('/')[1]?.toUpperCase() || 'FILE')}
												</span>
												</div>
											</TableCell>
											
											{/* Title Column - Main content with more width */}
											<TableCell className="px-3 py-2">
												<div className={`flex items-center gap-2 font-regular ${
													it.type === 'directory' && expandedFolders.has(it.path) ? 'text-blue-900' : 'text-[#09090B]'
												}`}>
													{(() => { try { return decodeURIComponent(it.name); } catch { return it.name; } })()}
												</div>
											<div className="text-xs text-slate-500">
												{it.type === 'file' 
													? ''
													: (it.type === 'directory' && expandedFolders.has(it.path) && folderItemCounts[it.path] !== undefined 
														? `${folderItemCounts[it.path]} ${folderItemCounts[it.path] === 1 ? 'file' : 'files'}`
														: ''
													)
												}
											</div>
												{it.type === 'file' && (() => { 
													const s = indexing[it.path] || indexing[(() => { try { return decodeURIComponent(it.path); } catch { return it.path; } })()] || indexing[encodeURI(it.path)]; 
													const shouldShow = s && s.status !== 'done';
													console.log(`[SmartDrive] Progress bar check for '${it.path}':`, {
														indexingState: s,
														shouldShow,
														allIndexing: indexing
													});
													return shouldShow;
												})() && (
													<div className="mt-1" title="We are indexing this file so it can be searched and used by AI. This usually takes a short moment.">
														{(() => { 
															const s = indexing[it.path] || indexing[(() => { try { return decodeURIComponent(it.path); } catch { return it.path; } })()] || indexing[encodeURI(it.path)]; 
															const pct = s?.etaPct ?? 10; 
															return (
																<div className="h-1.5 w-56 md:w-64 bg-slate-200 rounded overflow-hidden">
																	<div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
																</div>
															);
														})()}
													</div>
												)}
											</TableCell>
											
											{/* Creator Column */}
											<TableCell className="px-3 py-2 whitespace-nowrap text-sm text-slate-700">
											<span className="inline-flex items-start text-[var(--main-text)] gap-2">
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
											
											{/* Edited Column */}
											<TableCell className="px-3 py-2 whitespace-nowrap text-left text-sm text-slate-700">
												{it.modified ? new Date(it.modified).toLocaleDateString() : 'No date'}
											</TableCell>
											
											{/* Action Column */}
											<TableCell className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
											<div className="flex justify-end">
												<DropdownMenu>
													<DropdownMenuTrigger asChild disabled={mode === 'select'}>
														<Button variant="ghost" className="h-8 w-8 p-0" onClick={(e: React.MouseEvent)=>e.stopPropagation()} disabled={mode === 'select'}>
															<MoreHorizontal className={mode === 'select' ? 'w-4 h-4 text-gray-300' : 'w-4 h-4 text-[#09090B] hover:text-slate-600'} />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem onSelect={() => handleMenuAction('rename')}><Pencil className="w-4 h-4 mr-2"/>Rename</DropdownMenuItem>
														<DropdownMenuItem onSelect={() => handleMenuAction('move')}><FilePlus className="w-4 h-4 mr-2"/>Move to folder...</DropdownMenuItem>
														<DropdownMenuItem onSelect={() => handleMenuAction('copy')}><Copy className="w-4 h-4 mr-2"/>Copy</DropdownMenuItem>
														<DropdownMenuItem onSelect={() => handleMenuAction('delete')}><Trash2 className="w-4 h-4 mr-2"/>Delete</DropdownMenuItem>
														<DropdownMenuItem disabled={it.type !== 'file'} onSelect={() => handleMenuAction('download')}><Download className="w-4 h-4 mr-2"/>Download</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
											</TableCell>
											</TableRow>
											
										</React.Fragment>
									);
								})}</>;
								})()}
									</TableBody>
								</Table>
							</div>
							
							{/* Pagination Controls */}
							{filtered.length > 0 && (
								<div className="flex items-center justify-end px-4 gap-8 py-3 bg-white border-t border-gray-200">
									<div className="flex items-center gap-4">
									<span className="text-sm text-[#878787]">{t("interface.rowsPerPage", "Rows per page:")}</span>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="outline" className="flex rounded-md bg-white items-center gap-2">
													<span className="text-sm text-[#878787]">{rowsPerPage}</span>
													<svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
														<mask id="path-1-inside-1_1814_879" fill="white">
														<path fill-rule="evenodd" clip-rule="evenodd" d="M0.140592 2.54059C-0.046864 2.72804 -0.046864 3.03196 0.140592 3.21941C0.328048 3.40686 0.631963 3.40686 0.819419 3.21941L2.88001 1.15882L4.94059 3.21941C5.12805 3.40686 5.43196 3.40686 5.61943 3.21941C5.80684 3.03196 5.80684 2.72804 5.61943 2.54059L3.21942 0.140587C3.12939 0.0505708 3.0073 0 2.88001 0C2.7527 0 2.63061 0.0505708 2.54059 0.140587L0.140592 2.54059ZM5.61943 6.95275C5.80684 6.76529 5.80684 6.46138 5.61943 6.27392C5.43196 6.08647 5.12805 6.08647 4.94059 6.27392L2.88001 8.33452L0.819419 6.27392C0.631963 6.08647 0.328048 6.08647 0.140592 6.27392C-0.046864 6.46138 -0.046864 6.76529 0.140592 6.95275L2.54059 9.35276C2.72805 9.54017 3.03196 9.54017 3.21942 9.35276L5.61943 6.95275Z"/>
														</mask>
														<path fill-rule="evenodd" clip-rule="evenodd" d="M0.140592 2.54059C-0.046864 2.72804 -0.046864 3.03196 0.140592 3.21941C0.328048 3.40686 0.631963 3.40686 0.819419 3.21941L2.88001 1.15882L4.94059 3.21941C5.12805 3.40686 5.43196 3.40686 5.61943 3.21941C5.80684 3.03196 5.80684 2.72804 5.61943 2.54059L3.21942 0.140587C3.12939 0.0505708 3.0073 0 2.88001 0C2.7527 0 2.63061 0.0505708 2.54059 0.140587L0.140592 2.54059ZM5.61943 6.95275C5.80684 6.76529 5.80684 6.46138 5.61943 6.27392C5.43196 6.08647 5.12805 6.08647 4.94059 6.27392L2.88001 8.33452L0.819419 6.27392C0.631963 6.08647 0.328048 6.08647 0.140592 6.27392C-0.046864 6.46138 -0.046864 6.76529 0.140592 6.95275L2.54059 9.35276C2.72805 9.54017 3.03196 9.54017 3.21942 9.35276L5.61943 6.95275Z" fill="#878787"/>
														<path d="M0.140592 2.54059L-0.566515 1.83348L0.140592 2.54059ZM0.140592 3.21941L-0.566515 3.92652L-0.566495 3.92654L0.140592 3.21941ZM0.819419 3.21941L1.52651 3.92654L1.52653 3.92652L0.819419 3.21941ZM2.88001 1.15882L3.58711 0.451711L2.88001 -0.255401L2.1729 0.451711L2.88001 1.15882ZM4.94059 3.21941L4.23348 3.92652L4.23351 3.92654L4.94059 3.21941ZM5.61943 3.21941L6.3265 3.92656L6.32662 3.92644L5.61943 3.21941ZM5.61943 2.54059L6.32662 1.83356L6.32653 1.83348L5.61943 2.54059ZM3.21942 0.140587L3.92652 -0.566522L3.92648 -0.566562L3.21942 0.140587ZM2.54059 0.140587L3.2477 0.847694L2.54059 0.140587ZM5.61943 6.95275L6.32654 7.65985L6.32662 7.65977L5.61943 6.95275ZM5.61943 6.27392L6.32662 5.56689L6.3265 5.56677L5.61943 6.27392ZM4.94059 6.27392L4.23351 5.56679L4.23348 5.56682L4.94059 6.27392ZM2.88001 8.33452L2.1729 9.04162L2.88001 9.74873L3.58711 9.04162L2.88001 8.33452ZM0.819419 6.27392L1.52653 5.56682L1.52651 5.56679L0.819419 6.27392ZM0.140592 6.27392L-0.566495 5.56679L-0.566515 5.56681L0.140592 6.27392ZM0.140592 6.95275L0.8477 6.24564L0.847699 6.24564L0.140592 6.95275ZM2.54059 9.35276L1.83348 10.0599L1.83357 10.0599L2.54059 9.35276ZM3.21942 9.35276L3.92645 10.0599L3.92653 10.0599L3.21942 9.35276ZM0.140592 2.54059L-0.566515 1.83348C-1.1445 2.41146 -1.1445 3.34854 -0.566515 3.92652L0.140592 3.21941L0.847699 2.51231C1.05077 2.71537 1.05077 3.04463 0.847699 3.24769L0.140592 2.54059ZM0.140592 3.21941L-0.566495 3.92654C0.011481 4.50448 0.94853 4.50448 1.52651 3.92654L0.819419 3.21941L0.112332 2.51229C0.315396 2.30923 0.644615 2.30923 0.847679 2.51229L0.140592 3.21941ZM0.819419 3.21941L1.52653 3.92652L3.58711 1.86592L2.88001 1.15882L2.1729 0.451711L0.11231 2.51231L0.819419 3.21941ZM2.88001 1.15882L2.1729 1.86592L4.23348 3.92652L4.94059 3.21941L5.6477 2.51231L3.58711 0.451711L2.88001 1.15882ZM4.94059 3.21941L4.23351 3.92654C4.81149 4.50449 5.74853 4.50447 6.3265 3.92656L5.61943 3.21941L4.91236 2.51227C5.1154 2.30925 5.4446 2.30922 5.64768 2.51229L4.94059 3.21941ZM5.61943 3.21941L6.32662 3.92644C6.90445 3.34848 6.90445 2.41152 6.32662 1.83356L5.61943 2.54059L4.91224 3.24761C4.70924 3.04456 4.70924 2.71544 4.91224 2.51239L5.61943 3.21941ZM5.61943 2.54059L6.32653 1.83348L3.92652 -0.566522L3.21942 0.140587L2.51231 0.847695L4.91232 3.24769L5.61943 2.54059ZM3.21942 0.140587L3.92648 -0.566562C3.64895 -0.844065 3.27253 -1 2.88001 -1V0V1C2.74207 1 2.60984 0.945207 2.51235 0.847736L3.21942 0.140587ZM2.88001 0V-1C2.48749 -1 2.11104 -0.844079 1.83349 -0.56652L2.54059 0.140587L3.2477 0.847694C3.15017 0.945221 3.01791 1 2.88001 1V0ZM2.54059 0.140587L1.83349 -0.56652L-0.566515 1.83348L0.140592 2.54059L0.847699 3.24769L3.2477 0.847694L2.54059 0.140587ZM5.61943 6.95275L6.32662 7.65977C6.90445 7.08181 6.90445 6.14486 6.32662 5.56689L5.61943 6.27392L4.91224 6.98095C4.70924 6.7779 4.70924 6.44877 4.91224 6.24572L5.61943 6.95275ZM5.61943 6.27392L6.3265 5.56677C5.74853 4.98887 4.81149 4.98884 4.23351 5.56679L4.94059 6.27392L5.64768 6.98105C5.4446 7.18411 5.1154 7.18408 4.91236 6.98107L5.61943 6.27392ZM4.94059 6.27392L4.23348 5.56682L2.1729 7.62741L2.88001 8.33452L3.58711 9.04162L5.6477 6.98103L4.94059 6.27392ZM2.88001 8.33452L3.58711 7.62741L1.52653 5.56682L0.819419 6.27392L0.11231 6.98103L2.1729 9.04162L2.88001 8.33452ZM0.819419 6.27392L1.52651 5.56679C0.94853 4.98885 0.011481 4.98885 -0.566495 5.56679L0.140592 6.27392L0.847679 6.98105C0.644615 7.1841 0.315396 7.1841 0.112332 6.98105L0.819419 6.27392ZM0.140592 6.27392L-0.566515 5.56681C-1.1445 6.14479 -1.1445 7.08187 -0.566515 7.65985L0.140592 6.95275L0.847699 6.24564C1.05077 6.44871 1.05077 6.77796 0.847699 6.98103L0.140592 6.27392ZM0.140592 6.95275L-0.566516 7.65985L1.83348 10.0599L2.54059 9.35276L3.2477 8.64565L0.8477 6.24564L0.140592 6.95275ZM2.54059 9.35276L1.83357 10.0599C2.41153 10.6378 3.34848 10.6378 3.92645 10.0599L3.21942 9.35276L2.51239 8.64557C2.71544 8.44257 3.04457 8.44257 3.24762 8.64557L2.54059 9.35276ZM3.21942 9.35276L3.92653 10.0599L6.32654 7.65985L5.61943 6.95275L4.91232 6.24564L2.51231 8.64565L3.21942 9.35276Z" fill="#878787" mask="url(#path-1-inside-1_1814_879)"/>
													</svg>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent>
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
									<span className="text-sm text-[#878787]">
										Page {currentPage} of {totalPages}
									</span>
									
									<div className="flex items-center gap-2">
										<button
											onClick={() => setCurrentPage(1)}
											disabled={currentPage === 1}
											className="px-2 py-2 border border-gray-300 shadow-sm rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
											title="First page"
										>
											<ChevronsLeft size={16} />
										</button>
										<button
											onClick={() => setCurrentPage(currentPage - 1)}
											disabled={currentPage === 1}
											className="px-2 py-2 border border-gray-300 shadow-sm rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
											title="Previous page"
										>
											<ChevronLeft size={16} />
										</button>
										<button
											onClick={() => setCurrentPage(currentPage + 1)}
											disabled={currentPage === totalPages}
											className="px-2 py-2 border border-gray-300 shadow-sm rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
											title="Next page"
										>
											<ChevronRight size={16} />
										</button>
										<button
											onClick={() => setCurrentPage(totalPages)}
											disabled={currentPage === totalPages}
											className="px-2 py-2 border border-gray-300 shadow-sm rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
											title="Last page"
										>
											<ChevronsRight size={16} />
										</button>
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			)}

			{/* Footer buttons removed in select mode; selection is communicated live via onFilesSelected */}
			
			{/* Rename Modal */}
			<Dialog open={renameOpen} onOpenChange={setRenameOpen}>
				<DialogContent onClick={(e: React.MouseEvent)=>e.stopPropagation()}>
					<DialogHeader>
						<DialogTitle>Rename item</DialogTitle>
						<DialogDescription>Enter a new name for the selected item.</DialogDescription>
					</DialogHeader>
					<div className="mt-2">
						<UiInput value={renameNewName} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setRenameNewName(e.target.value)} placeholder="New name" autoFocus />
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={()=>setRenameOpen(false)}>Cancel</Button>
						<Button onClick={submitRename} disabled={renameSaving || !renameNewName.trim()}>{renameSaving ? 'Renaming…' : 'Rename'}</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Folder Picker Modal */}
			<Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
				<DialogContent onClick={(e: React.MouseEvent)=>e.stopPropagation()} className="max-w-xl">
					<DialogHeader>
						<DialogTitle>{pickerOp === 'move' ? 'Move to folder' : 'Copy to folder'}</DialogTitle>
						<DialogDescription>Select a destination folder.</DialogDescription>
					</DialogHeader>
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm text-slate-600">
							<Button variant="link" className="px-0" onClick={()=>{ const parent = pickerPath.split('/').slice(0,-1).join('/') || '/'; loadPickerDirs(parent); }}>Up one level</Button>
							<span className="truncate">{pickerPath}</span>
						</div>
						<div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
							{pickerLoading ? (
								<div className="p-4 text-center text-slate-600">Loading…</div>
							) : (
								<div className="divide-y divide-gray-200">
									{pickerPath !== '/' && (
										<div className="px-3 py-2 hover:bg-blue-50 cursor-pointer" onClick={()=>{ const parent = pickerPath.split('/').slice(0,-1).join('/') || '/'; loadPickerDirs(parent); }}>..</div>
									)}
									{pickerDirs.map(d => (
										<div key={d.path} className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2" onClick={()=>loadPickerDirs(d.path)}>
											<Folder className="w-4 h-4 text-blue-500" />
											<span className="truncate">{d.name}</span>
										</div>
									))}
									{pickerDirs.length === 0 && (
										<div className="p-4 text-center text-slate-500">No subfolders</div>
									)}
								</div>
							)}
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={()=>setPickerOpen(false)}>Cancel</Button>
					<Button onClick={() => { console.log('[SmartDrive] Select folder clicked', { op: pickerOp, pickerPath, selected: Array.from(selected) }); submitPicker(pickerPath); }} disabled={pickerLoading || !isValidPickerDestination}>
						Select folder
					</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Rename Modal */}
			<Dialog open={renameModalOpen} onOpenChange={(open) => {
				if (!open) {
					setRenameModalOpen(false);
					setItemToRename(null);
					setNewItemName('');
				}
			}}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Rename Item</DialogTitle>
						<DialogDescription>
							Enter a new name for "{itemToRename?.split('/').pop() || ''}"
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="item-name">Name</Label>
							<Input
								id="item-name"
								value={newItemName}
								onChange={(e) => setNewItemName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter' && newItemName.trim()) {
										handleRenameSubmit();
									}
								}}
								placeholder="Enter new name"
								disabled={isRenaming}
								autoFocus
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setRenameModalOpen(false);
								setItemToRename(null);
								setNewItemName('');
							}}
							disabled={isRenaming}
						>
							Cancel
						</Button>
						<Button
							onClick={handleRenameSubmit}
							disabled={isRenaming || !newItemName.trim()}
							variant="download"
						>
							{isRenaming ? 'Renaming...' : 'Rename'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Folder Selection Modal for Move/Copy */}
			{showFolderSelectionModal && moveOperation && (() => {
				// Create folder list with numeric IDs and path mapping
				const foldersList = items.filter(item => item.type === 'directory');
				const foldersForModal = foldersList.map((folder, idx) => ({
					id: idx,
					name: (() => { try { return decodeURIComponent(folder.name); } catch { return folder.name; } })(),
					project_count: folderItemCounts[folder.path] || 0,
					parent_id: null
				}));
				
				// Create a map from ID to path
				const idToPathMap: Record<number, string> = {};
				foldersList.forEach((folder, idx) => {
					idToPathMap[idx] = folder.path;
				});
				
				// Determine current folder location of selected items
				let currentFolderId: number | null = null;
				if (selected.size > 0) {
					const selectedPaths = Array.from(selected);
					// Get the parent folder of the first selected item
					const firstSelectedPath = selectedPaths[0];
					const parentPath = firstSelectedPath.split('/').slice(0, -1).join('/') || '/';
					
					// Find the folder ID that matches this parent path
					const matchingFolder = foldersList.find(folder => folder.path === parentPath);
					if (matchingFolder) {
						const folderIndex = foldersList.indexOf(matchingFolder);
						currentFolderId = folderIndex;
					}
				}
				
				return (
					<FolderSelectionModal
						isOpen={showFolderSelectionModal}
						onClose={() => {
							setShowFolderSelectionModal(false);
							setMoveOperation(null);
						}}
					onSelectFolder={async (folderId) => {
						// folderId null means root folder (/)
						const targetPath = folderId === null ? '/' : idToPathMap[folderId] || '/';
						
						if (selected.size === 0) return;
						setBusy(true);
						try {
							if (moveOperation === 'move') {
								// For move operation
								for (const p of Array.from(selected)) {
									const fileName = p.split('/').pop() || '';
									const destinationPath = targetPath === '/' ? `/${fileName}` : (targetPath.endsWith('/') ? `${targetPath}${fileName}` : `${targetPath}/${fileName}`);
									const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/move`, {
										method: 'POST',
										headers: { 'Content-Type': 'application/json' },
										credentials: 'same-origin',
										body: JSON.stringify({ from: p, to: destinationPath })
									});
									if (!res.ok) throw new Error(await res.text());
								}
							} else {
								// For copy operation
								for (const p of Array.from(selected)) {
									const fileName = p.split('/').pop() || '';
									const destinationPath = targetPath === '/' ? `/${fileName}` : (targetPath.endsWith('/') ? `${targetPath}${fileName}` : `${targetPath}/${fileName}`);
									const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/copy`, {
										method: 'POST',
										headers: { 'Content-Type': 'application/json' },
										credentials: 'same-origin',
										body: JSON.stringify({ from: p, to: destinationPath })
									});
									if (!res.ok) throw new Error(await res.text());
								}
							}
							clearSel();
							await fetchList(currentPath);
						} catch (e) {
							alert(moveOperation === 'move' ? 'Move failed' : 'Copy failed');
						} finally {
							setBusy(false);
						}
						setShowFolderSelectionModal(false);
						setMoveOperation(null);
					}}
						folders={foldersForModal}
						currentFolderId={currentFolderId}
						title={moveOperation === 'move' ? 'Move to folder' : 'Copy to folder'}
					/>
				);
			})()}
		</div>
	);
};


export default SmartDriveBrowser; 
 
function formatDate(val?: string | null): string {
	if (!val) return '';
	try {
		const d = new Date(val);
		return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
	} catch {
		return '';
	}
}