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
	MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input as UiInput } from '@/components/ui/input';

export type SmartDriveItem = {
	name: string;
	path: string;
	type: 'file' | 'directory';
	size?: number | null;
	modified?: string | null;
	mime_type?: string | null;
	etag?: string | null;
};

interface SmartDriveBrowserProps {
	mode?: 'manage' | 'select';
	className?: string;
	onFilesSelected?: (paths: string[]) => void;
	initialPath?: string;
}

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

type SortKey = 'name' | 'modified' | 'size' | 'type';

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
}) => {
	const [currentPath, setCurrentPath] = useState<string>(initialPath);
	const [items, setItems] = useState<SmartDriveItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [search, setSearch] = useState('');
	const [busy, setBusy] = useState(false);
	const [sortKey, setSortKey] = useState<SortKey>('name');
	const [sortAsc, setSortAsc] = useState<boolean>(true);
	const [lastIndex, setLastIndex] = useState<number | null>(null);
	const [uploading, setUploading] = useState<UploadProgress[]>([]);
	const [indexing, setIndexing] = useState<IndexingState>({});
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

	const containerRef = useRef<HTMLDivElement | null>(null);
	const uploadInput = useRef<HTMLInputElement | null>(null);

	const fetchList = useCallback(async (path: string) => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/list?path=${encodeURIComponent(path)}`, { credentials: 'same-origin' });
			if (!res.ok) throw new Error(`List failed: ${res.status}`);
			const data = await res.json();
			setItems(Array.isArray(data.files) ? data.files : []);
		} catch (e: any) {
			setError(e?.message || 'Failed to load');
			setItems([]);
		} finally {
			setLoading(false);
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

	const filtered = useMemo(() => {
		const term = search.trim().toLowerCase();
		let list = items;
		if (term) {
			list = list.filter(i => i.name.toLowerCase().includes(term));
		}
		const dirFirst = (a: SmartDriveItem, b: SmartDriveItem) => {
			if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
			return 0;
		};
		const cmp = (a: SmartDriveItem, b: SmartDriveItem) => {
			let base = 0;
			if (sortKey === 'name') base = a.name.localeCompare(b.name);
			else if (sortKey === 'size') base = (a.size ?? 0) - (b.size ?? 0);
			else if (sortKey === 'modified') base = new Date(a.modified || 0).getTime() - new Date(b.modified || 0).getTime();
			else if (sortKey === 'type') base = a.type.localeCompare(b.type);
			return sortAsc ? base : -base;
		};
		return [...list].sort((a, b) => dirFirst(a, b) || cmp(a, b));
	}, [items, search, sortKey, sortAsc]);

	const toggle = (p: string) => {
		const next = new Set(selected);
		if (next.has(p)) next.delete(p); else next.add(p);
		setSelected(next);
	};

	const onRowClick = (idx: number, it: SmartDriveItem, e: React.MouseEvent) => {
		if (it.type === 'directory') {
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
			setMkdirOpen(false);
			setMkdirName('');
			await fetchList(currentPath);
		} catch (e) {
			alert('Failed to create folder');
		} finally {
			setBusy(false);
		}
	};

	const del = async () => {
		if (selected.size === 0) return;
		if (!confirm(`Delete ${selected.size} item(s)?`)) return;
		setBusy(true);
		try {
			const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/delete`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify({ paths: Array.from(selected) })
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

	const doMoveCopy = (op: 'move' | 'copy') => {
		if (selected.size === 0) return;
		setPickerOp(op);
		setPickerPath(currentPath || '/');
		setPickerSelected(Array.from(selected));
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

	const submitRename = async () => {
		if (!renameFromPath) return;
		const base = renameFromPath.split('/').slice(0, -1).join('/') || '/';
		const old = renameFromPath.split('/').pop() || '';
		const name = renameNewName.trim();
		if (!name || name === old) { setRenameOpen(false); return; }
		setRenameSaving(true);
		try {
			const to = `${base}${base.endsWith('/') ? '' : '/'}${name}`;
			const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/move`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify({ from: renameFromPath, to })
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
			const dirs = (data.files || []).filter((i: SmartDriveItem) => i.type === 'directory');
			setPickerDirs(dirs);
			setPickerPath(data.path || path);
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
				const to = `${destBase}${p.split('/').pop()}`.replace(/\/+/, '/');
				console.log(`[SmartDrive] ${pickerOp}: from=${p} to=${to}`);
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

	const onUploadClick = () => uploadInput.current?.click();
	const onUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;
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
		console.log('[SmartDrive] Starting upload:', { filesCount: files.length, currentPath, fileNames: files.map(f => f.name) });
		
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
					
					if (r.onyx_file_id) {
						next[p] = { 
							status: 'not_started', 
							etaPct: 5, 
							onyxFileId: r.onyx_file_id,
							timeStarted: undefined,
							timeUpdated: undefined,
							estimatedTokens: undefined,
							estimatedDuration: undefined
						};
						pathsToTrack.push(p);
						console.log(`[SmartDrive] Added to indexing tracking:`, { path: p, onyxFileId: r.onyx_file_id });
					} else {
						console.warn(`[SmartDrive] No onyx_file_id for ${filename}:`, r);
					}
				}
				
				console.log('[SmartDrive] New indexing state:', next);
				console.log('[SmartDrive] Paths to track:', pathsToTrack);
				
				setIndexing(next);
				
				// Start polling for real progress data
				if (pathsToTrack.length > 0) {
					await pollIndexingProgress(pathsToTrack);
				}
			} else {
				console.warn('[SmartDrive] No results array in upload response:', data);
			}
			
			await fetchList(currentPath);
		} catch (e) {
			console.error('[SmartDrive] Upload error:', e);
			alert('Upload failed');
		} finally {
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
		e.preventDefault();
		if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
		await uploadFiles(Array.from(e.dataTransfer.files));
	};

	// Periodic polling driver: while there are any items not complete, poll every 1.5s
	useEffect(() => {
		const pathsNeedingPolling = Object.entries(indexing)
			.filter(([_, st]) => st && st.status !== 'success' && st.status !== 'done' && st.status !== 'failed')
			.map(([path]) => path);

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
	useEffect(() => {
		if (mode === 'select' && onFilesSelected) {
			onFilesSelected(Array.from(selected));
		}
	}, [mode, selected, onFilesSelected]);

	return (
		<div className={`space-y-3 text-gray-900 ${className}`}>
			{/* Toolbar */}
			<div className="flex items-center justify-between rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 p-3 shadow-sm">
				<div className="flex items-center gap-2 text-sm">
					{breadcrumbs.map((b, idx) => (
						<Button key={b.path} variant="link" className="px-0 h-auto text-slate-600 hover:text-blue-600" onClick={() => setCurrentPath(b.path)}>
							{idx > 0 ? ' / ' : ''}{b.label}
						</Button>
					))}
				</div>
				<div className="flex items-center gap-2">
					<div className="w-64">
						<Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search files..." className="border-slate-200 focus:border-blue-400" />
					</div>
					<Button variant="outline" onClick={onUploadClick} disabled={busy} className="border-slate-200 hover:border-blue-300 hover:bg-blue-50">
						<Upload className="w-4 h-4 mr-2"/>Upload
					</Button>
					<input ref={uploadInput} type="file" multiple className="hidden" onChange={onUploadChange} />
					<Button variant="outline" onClick={()=>{ setMkdirOpen(true); setMkdirName(''); }} disabled={busy} className="border-slate-200 hover:border-blue-300 hover:bg-blue-50">
						<Plus className="w-4 h-4 mr-2"/>New Folder
					</Button>
					{/* Per-row actions now handle the rest */}
				</div>
			</div>

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
						<Button onClick={createFolder} disabled={!mkdirName.trim() || busy}>Create</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<div ref={containerRef} onDrop={onDrop} onDragOver={onDragOver} className="border border-slate-200 rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 max-h-[600px] flex flex-col shadow-sm">
				{loading ? (
					<div className="p-10 text-center text-slate-600">Loading…</div>
				) : error ? (
					<div className="p-10 text-center text-red-500">{error}</div>
				) : filtered.length === 0 ? (
					<div className="p-10 text-center text-slate-600">This folder is empty</div>
				) : (
					<div className="flex flex-col min-h-0 flex-1">
						<div className="flex items-center px-3 py-2 text-xs uppercase text-slate-500 font-medium bg-slate-50/50 flex-shrink-0">
							<div className="w-8"/>
							<button className="flex-1 inline-flex items-center" onClick={()=>{setSortKey('name'); setSortAsc(k=>sortKey==='name'?!k:true);}}>
								Name <ArrowUpDown className="w-3 h-3 ml-1"/>
							</button>
							<button className="w-24 inline-flex items-center justify-end" onClick={()=>{setSortKey('size'); setSortAsc(k=>sortKey==='size'?!k:true);}}>
								Size <ArrowUpDown className="w-3 h-3 ml-1"/>
							</button>
							<button className="w-44 inline-flex items-center justify-end" onClick={()=>{setSortKey('modified'); setSortAsc(k=>sortKey==='modified'?!k:true);}}>
								Modified <ArrowUpDown className="w-3 h-3 ml-1"/>
							</button>
							<div className="w-8"/>
						</div>
						<div className="flex-1 overflow-y-auto divide-y divide-slate-100">
							{filtered.map((it, idx) => {
								const handleMenuAction = (action: 'rename' | 'move' | 'copy' | 'delete' | 'download') => {
									setSelected(new Set([it.path]));
                                    switch(action) {
                                        case 'rename': openRename(); break;
										case 'move': doMoveCopy('move'); break;
										case 'copy': doMoveCopy('copy'); break;
										case 'delete': del(); break;
										case 'download': download(); break;
									}
								};
								
								return (
									<div key={it.path} className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50/50 cursor-pointer" onClick={(e)=>onRowClick(idx, it, e)}>
										<div className="w-8">
											<Checkbox checked={selected.has(it.path)} onCheckedChange={() => toggle(it.path)} />
										</div>
										<div className="w-5 h-5">
											{it.type === 'directory' ? <Folder className="w-5 h-5 text-blue-500"/> : <File className="w-5 h-5 text-slate-500"/>}
										</div>
										<div className="flex-1">
									<div className="font-medium text-slate-800">{it.name}</div>
											<div className="text-xs text-slate-500">{it.type === 'file' ? formatSize(it.size) : 'Folder' }{it.modified ? ` • ${new Date(it.modified).toLocaleString()}` : ''}</div>
											{it.type === 'file' && (() => { 
											const s = indexing[it.path]; 
												const shouldShow = s && s.status !== 'done' && s.status !== 'success';
												console.log(`[SmartDrive] Progress bar check for '${it.path}':`, {
													indexingState: s,
													shouldShow,
													allIndexing: indexing
												});
												return shouldShow;
											})() && (
												<div className="mt-1" title="We are indexing this file so it can be searched and used by AI. This usually takes a short moment.">
													{(() => { 
												const s = indexing[it.path]; 
														const pct = s?.etaPct ?? 10; 
														return (
															<div className="h-1.5 w-56 md:w-64 bg-slate-200 rounded overflow-hidden">
																<div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
															</div>
														);
													})()}
												</div>
											)}
										</div>
										<div className="w-24 text-right text-sm text-slate-700">{it.type === 'file' ? formatSize(it.size) : ''}</div>
										<div className="w-44 text-right text-sm text-slate-700">{it.modified ? new Date(it.modified).toLocaleDateString() : ''}</div>
										<div className="w-8 flex justify-end">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" className="h-8 w-8 p-0 hover:bg-blue-100" onClick={(e: React.MouseEvent)=>e.stopPropagation()}>
														<MoreHorizontal className="w-4 h-4 text-slate-400 hover:text-slate-600" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem onSelect={() => handleMenuAction('rename')}><Pencil className="w-4 h-4 mr-2"/>Rename</DropdownMenuItem>
													<DropdownMenuItem onSelect={() => handleMenuAction('move')}><MoveRight className="w-4 h-4 mr-2"/>Move</DropdownMenuItem>
													<DropdownMenuItem onSelect={() => handleMenuAction('copy')}><Copy className="w-4 h-4 mr-2"/>Copy</DropdownMenuItem>
													<DropdownMenuItem onSelect={() => handleMenuAction('delete')}><Trash2 className="w-4 h-4 mr-2"/>Delete</DropdownMenuItem>
													<DropdownMenuItem disabled={it.type !== 'file'} onSelect={() => handleMenuAction('download')}><Download className="w-4 h-4 mr-2"/>Download</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</div>

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
						<div className="border rounded-md max-h-64 overflow-y-auto">
							{pickerLoading ? (
								<div className="p-4 text-center text-slate-600">Loading…</div>
							) : (
								<div className="divide-y">
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
		</div>
	);
};

function formatSize(bytes?: number | null): string {
	if (!bytes && bytes !== 0) return '';
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.min(sizes.length - 1, Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024)));
	return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export default SmartDriveBrowser; 