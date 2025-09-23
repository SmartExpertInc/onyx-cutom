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
	ExternalLink,
	ArrowUpDown,
	Pencil,
	MoveRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';

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
	const [previewPath, setPreviewPath] = useState<string | null>(null);

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
			setPreviewPath(null);
			setSelected(new Set());
			setLastIndex(null);
			return;
		}
		if (e.shiftKey && lastIndex !== null) {
			const range = [Math.min(lastIndex, idx), Math.max(lastIndex, idx)];
			const next = new Set(selected);
			for (let i = range[0]; i <= range[1]; i++) next.add(filtered[i].path);
			setSelected(next);
		} else if (e.metaKey || e.ctrlKey) {
			toggle(it.path);
			setLastIndex(idx);
		} else if (mode === 'select') {
			setSelected(new Set([it.path]));
			setLastIndex(idx);
			// no preview on row click
		} else {
			toggle(it.path);
			setLastIndex(idx);
			// no preview on row click
		}
	};

	const selectAll = () => setSelected(new Set(filtered.map(i => i.path)));
	const clearSel = () => setSelected(new Set());

	const mkdir = async () => {
		const name = prompt('New folder name');
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

	const doMoveCopy = async (op: 'move' | 'copy') => {
		if (selected.size === 0) return;
		const toPath = prompt(`Destination path for ${op}`);
		if (!toPath) return;
		setBusy(true);
		try {
			for (const p of Array.from(selected)) {
				const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/${op}`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'same-origin',
					body: JSON.stringify({ from: p, to: toPath.endsWith('/') ? `${toPath}${p.split('/').pop()}` : toPath })
				});
				if (!res.ok) throw new Error(await res.text());
			}
			clearSel();
			await fetchList(currentPath);
		} catch (e) {
			alert(`${op} failed`);
		} finally {
			setBusy(false);
		}
	};

	const rename = async () => {
		if (selected.size !== 1) return;
		const p = Array.from(selected)[0];
		const base = p.split('/').slice(0, -1).join('/') || '/';
		const old = p.split('/').pop() || '';
		const name = prompt('Rename to', old);
		if (!name || name === old) return;
		setBusy(true);
		try {
			const to = `${base}${base.endsWith('/') ? '' : '/'}${name}`;
			const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/move`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify({ from: p, to })
			});
			if (!res.ok) throw new Error(await res.text());
			clearSel();
			await fetchList(currentPath);
		} catch (e) {
			alert('Rename failed');
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

	const uploadFiles = async (files: File[]) => {
		if (files.length === 0) return;
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
			if (!res.ok && res.status !== 207) throw new Error(await res.text());
			await fetchList(currentPath);
		} catch (e) {
			alert('Upload failed');
		} finally {
			setUploading([]);
			setBusy(false);
		}
	};

	const onDrop = async (e: React.DragEvent) => {
		e.preventDefault();
		if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
		await uploadFiles(Array.from(e.dataTransfer.files));
	};

	const onDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const download = async () => {
		const filesOnly = Array.from(selected).filter(p => items.find(i => i.path === p && i.type === 'file'));
		for (const p of filesOnly) {
			const url = `${CUSTOM_BACKEND_URL}/smartdrive/download?path=${encodeURIComponent(p)}`;
			window.open(url, '_blank');
		}
	};

	const openInNextcloud = () => {
		window.open(`/smartdrive/`, '_blank');
	};

	const canRename = selected.size === 1;
	const canDelete = selected.size > 0;
	const canMoveCopy = selected.size > 0;
	const canDownload = Array.from(selected).some(p => items.find(i => i.path === p && i.type === 'file'));

	const previewItem = useMemo(() => {
		if (!previewPath) return null;
		return items.find(i => i.path === previewPath) || null;
	}, [previewPath, items]);

	return (
		<div className={`space-y-3 ${className}`}>
			{/* Toolbar */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					{breadcrumbs.map((b, idx) => (
						<Button key={b.path} variant="link" className="px-0 h-auto" onClick={() => setCurrentPath(b.path)}>
							{idx > 0 ? ' / ' : ''}{b.label}
						</Button>
					))}
				</div>
				<div className="flex items-center gap-2">
					<div className="w-64">
						<Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search" />
					</div>
					<Button variant="outline" onClick={onUploadClick} disabled={busy}>
						<Upload className="w-4 h-4 mr-2"/>Upload
					</Button>
					<input ref={uploadInput} type="file" multiple className="hidden" onChange={onUploadChange} />
					<Button variant="outline" onClick={mkdir} disabled={busy}>
						<Plus className="w-4 h-4 mr-2"/>New Folder
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">More</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem disabled={!canRename || busy} onClick={rename}><Pencil className="w-4 h-4 mr-2"/>Rename</DropdownMenuItem>
							<DropdownMenuItem disabled={!canMoveCopy || busy} onClick={()=>doMoveCopy('move')}><MoveRight className="w-4 h-4 mr-2"/>Move</DropdownMenuItem>
							<DropdownMenuItem disabled={!canMoveCopy || busy} onClick={()=>doMoveCopy('copy')}><Copy className="w-4 h-4 mr-2"/>Copy</DropdownMenuItem>
							<DropdownMenuItem disabled={!canDelete || busy} onClick={del}><Trash2 className="w-4 h-4 mr-2"/>Delete</DropdownMenuItem>
							<DropdownMenuItem disabled={!canDownload || busy} onClick={download}><Download className="w-4 h-4 mr-2"/>Download</DropdownMenuItem>
							<DropdownMenuItem onClick={openInNextcloud}><ExternalLink className="w-4 h-4 mr-2"/>Open in Nextcloud</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Upload progress */}
			{uploading.length > 0 && (
				<div className="space-y-2">
					{uploading.map(u => (
						<div key={u.filename} className="flex items-center gap-3">
							<div className="w-48 truncate text-sm text-muted-foreground">{u.filename}</div>
							<Progress value={u.progress} className="w-full" />
						</div>
					))}
				</div>
			)}

			<div ref={containerRef} onDrop={onDrop} onDragOver={onDragOver} className="border rounded-md overflow-hidden">
				{loading ? (
					<div className="p-10 text-center text-muted-foreground">Loading…</div>
				) : error ? (
					<div className="p-10 text-center text-destructive">{error}</div>
				) : filtered.length === 0 ? (
					<div className="p-10 text-center text-muted-foreground">This folder is empty</div>
				) : (
					<div className="grid grid-cols-12">
						<div className="col-span-12 lg:col-span-7 divide-y">
							<div className="flex items-center px-3 py-2 text-xs uppercase text-muted-foreground">
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
							</div>
							{filtered.map((it, idx) => (
								<div key={it.path} className="flex items-center gap-3 px-3 py-2 hover:bg-accent cursor-pointer" onClick={(e)=>onRowClick(idx, it, e)}>
									<div className="w-8">
										<Checkbox checked={selected.has(it.path)} onCheckedChange={()=>toggle(it.path)} />
									</div>
									<div className="w-5 h-5" onClick={(e)=>{e.stopPropagation(); setPreviewPath(it.type==='file'? it.path : null);}}>
										{it.type === 'directory' ? <Folder className="w-5 h-5 text-blue-600"/> : <File className="w-5 h-5 text-muted-foreground"/>}
									</div>
									<div className="flex-1">
										<div className="font-medium text-foreground">{it.name}</div>
										<div className="text-xs text-muted-foreground">{it.type === 'file' ? formatSize(it.size) : 'Folder' }{it.modified ? ` • ${new Date(it.modified).toLocaleString()}` : ''}</div>
									</div>
									<div className="w-24 text-right text-sm text-foreground">{it.type === 'file' ? formatSize(it.size) : ''}</div>
									<div className="w-44 text-right text-sm text-foreground">{it.modified ? new Date(it.modified).toLocaleDateString() : ''}</div>
								</div>
							))}
						</div>
						<div className="hidden lg:block col-span-5 border-l min-h-[420px] bg-white">
							{previewItem ? (
								<div className="p-4 space-y-2">
									<div className="text-sm text-muted-foreground">Preview</div>
									<div className="font-semibold">{previewItem.name}</div>
									<div className="rounded-md border overflow-hidden">
										{renderPreview(previewItem)}
									</div>
								</div>
							) : (
								<div className="h-full flex items-center justify-center text-muted-foreground">Select a file to preview</div>
							)}
						</div>
					</div>
				)}
			</div>

			{mode === 'select' && (
				<div className="flex justify-between items-center">
					<div className="text-sm text-muted-foreground">{selected.size > 0 ? `${selected.size} selected` : ''}</div>
					<div className="flex gap-2">
						<Button variant="outline" onClick={clearSel}>Clear</Button>
						<Button onClick={()=>onFilesSelected && onFilesSelected(Array.from(selected))} disabled={selected.size===0}>Select {selected.size || ''}</Button>
					</div>
				</div>
			)}
		</div>
	);
};

function formatSize(bytes?: number | null): string {
	if (!bytes && bytes !== 0) return '';
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.min(sizes.length - 1, Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024)));
	return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function renderPreview(item: SmartDriveItem) {
	const name = item.name.toLowerCase();
	if (/(\.png|\.jpg|\.jpeg|\.gif|\.webp)$/.test(name)) {
		return <img src={`${CUSTOM_BACKEND_URL}/smartdrive/download?path=${encodeURIComponent(item.path)}`} alt={item.name} className="max-h-[380px] w-full object-contain bg-muted" />;
	}
	if (name.endsWith('.pdf')) {
		return <iframe src={`${CUSTOM_BACKEND_URL}/smartdrive/download?path=${encodeURIComponent(item.path)}`} className="w-full h-[380px] bg-muted" />;
	}
	return <div className="p-6 text-center text-muted-foreground text-sm">No inline preview. Use “Open in Nextcloud”.</div>;
}

export default SmartDriveBrowser; 