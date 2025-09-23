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

type IndexingState = Record<string, { status: 'pending' | 'done' | 'unknown'; etaPct: number; onyxFileId?: number | string }>;

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
	const [previewPath, setPreviewPath] = useState<string | null>(null);
	const [mkdirOpen, setMkdirOpen] = useState(false);
	const [mkdirName, setMkdirName] = useState('');

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
			setLastIndex(null);
			return;
		}
		// toggle selection on row click (multi-select)
		toggle(it.path);
		setLastIndex(idx);
		// no preview on row click
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
			const data = await res.json();
			// Initialize indexing tracking for uploaded files using response mapping (onyx_file_id when present)
			if (data && Array.isArray(data.results)) {
				const next: IndexingState = { ...indexing };
				for (const r of data.results) {
					const p = `${currentPath.endsWith('/') ? currentPath : currentPath + '/'}${r.file}`;
					next[p] = { status: 'pending', etaPct: 5, onyxFileId: r.onyx_file_id };
				}
				setIndexing(next);
				// Start polling indexing status
				pollIndexingStatus(Object.keys(next));
			}
			await fetchList(currentPath);
		} catch (e) {
			alert('Upload failed');
		} finally {
			setUploading([]);
			setBusy(false);
		}
	};

	const pollIndexingStatus = async (paths: string[]) => {
		if (!paths || paths.length === 0) return;
		try {
			const params = new URLSearchParams();
			for (const p of paths) params.append('paths', p);
			const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/indexing-status?${params.toString()}`, { credentials: 'same-origin' });
			if (!res.ok) return;
			const data = await res.json();
			const statuses = data?.statuses || {};
			let nextRemaining = 0;
			setIndexing(prev => {
				const out: IndexingState = { ...prev };
				for (const p of Object.keys(out)) {
					// Support encoded/decoded mapping
					const done = statuses[p] === true || statuses[encodeURI(p)] === true || statuses[decodeURIComponent(p)] === true;
					out[p] = { ...(out[p] || { status: 'unknown', etaPct: 0 }), status: done ? 'done' : 'pending', etaPct: done ? 100 : Math.min(95, (out[p]?.etaPct ?? 5) + 10) };
					if (!done) nextRemaining += 1;
				}
				return out;
			});
			// Continue polling until all done
			if (nextRemaining > 0) {
				setTimeout(() => pollIndexingStatus(paths), 1500);
			}
		} catch {}
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

	const canRename = selected.size === 1;
	const canDelete = selected.size > 0;
	const canMoveCopy = selected.size > 0;
	const canDownload = Array.from(selected).some(p => items.find(i => i.path === p && i.type === 'file'));

	const previewItem = useMemo(() => {
		if (!previewPath) return null;
		return items.find(i => i.path === previewPath) || null;
	}, [previewPath, items]);

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
					<>
						{previewItem ? (
							<div className="grid grid-cols-12 min-h-0 flex-1">
								<div className="col-span-12 lg:col-span-7 divide-y divide-slate-200 flex flex-col min-h-0">
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
									<div className="flex-1 overflow-y-auto">
										{filtered.map((it, idx) => {
											const handleMenuAction = (action: 'rename' | 'move' | 'copy' | 'delete' | 'download') => {
												setSelected(new Set([it.path]));
												switch(action) {
													case 'rename': rename(); break;
													case 'move': doMoveCopy('move'); break;
													case 'copy': doMoveCopy('copy'); break;
													case 'delete': del(); break;
													case 'download': download(); break;
												}
											};
											
											return (
											<div key={it.path} className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50/50 cursor-pointer border-b border-slate-100 last:border-0" onClick={(e)=>onRowClick(idx, it, e)}>
												<div className="w-8">
													<Checkbox checked={selected.has(it.path)} onCheckedChange={() => toggle(it.path)} />
												</div>
												<div className="w-5 h-5" onClick={(e)=>{e.stopPropagation(); setPreviewPath(it.type==='file'? it.path : null);}}>
													{it.type === 'directory' ? <Folder className="w-5 h-5 text-blue-500"/> : <File className="w-5 h-5 text-slate-500"/>}
												</div>
												<div className="flex-1">
													<div className="font-medium text-slate-800">{(() => { try { return decodeURIComponent(it.name); } catch { return it.name; } })()}</div>
													<div className="text-xs text-slate-500">{it.type === 'file' ? formatSize(it.size) : 'Folder' }{it.modified ? ` • ${new Date(it.modified).toLocaleString()}` : ''}</div>
													{it.type === 'file' && (() => { const s = indexing[it.path] || indexing[(() => { try { return decodeURIComponent(it.path); } catch { return it.path; } })()] || indexing[encodeURI(it.path)]; return s && s.status !== 'done'; })() && (
														<div className="mt-1" title="We are indexing this file so it can be searched and used by AI. This usually takes a short moment.">
															{(() => { const s = indexing[it.path] || indexing[(() => { try { return decodeURIComponent(it.path); } catch { return it.path; } })()] || indexing[encodeURI(it.path)]; return <Progress value={s?.etaPct ?? 10} className="h-1.5" />; })()}
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
								<div className="hidden lg:block col-span-5 border-l border-slate-200 bg-gradient-to-b from-white/90 to-slate-50 flex flex-col min-h-0">
									<div className="p-4 space-y-2">
										<div className="text-sm text-slate-500 font-medium">Preview</div>
										<div className="font-semibold text-slate-800">{previewItem?.name}</div>
										<div className="rounded-lg border border-slate-200 overflow-hidden shadow-sm flex-1">
											{previewItem && renderPreview(previewItem)}
										</div>
									</div>
								</div>
							</div>
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
												case 'rename': rename(); break;
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
												<div className="w-5 h-5" onClick={(e)=>{e.stopPropagation(); setPreviewPath(it.type==='file'? it.path : null);}}>
													{it.type === 'directory' ? <Folder className="w-5 h-5 text-blue-500"/> : <File className="w-5 h-5 text-slate-500"/>}
												</div>
												<div className="flex-1">
													<div className="font-medium text-slate-800">{(() => { try { return decodeURIComponent(it.name); } catch { return it.name; } })()}</div>
													<div className="text-xs text-slate-500">{it.type === 'file' ? formatSize(it.size) : 'Folder' }{it.modified ? ` • ${new Date(it.modified).toLocaleString()}` : ''}</div>
													{it.type === 'file' && (() => { const s = indexing[it.path] || indexing[(() => { try { return decodeURIComponent(it.path); } catch { return it.path; } })()] || indexing[encodeURI(it.path)]; return s && s.status !== 'done'; })() && (
														<div className="mt-1" title="We are indexing this file so it can be searched and used by AI. This usually takes a short moment.">
															{(() => { const s = indexing[it.path] || indexing[(() => { try { return decodeURIComponent(it.path); } catch { return it.path; } })()] || indexing[encodeURI(it.path)]; return <Progress value={s?.etaPct ?? 10} className="h-1.5" />; })()}
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
					</>
				)}
			</div>

			{/* Footer buttons removed in select mode; selection is communicated live via onFilesSelected */}
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
		return <img src={`${CUSTOM_BACKEND_URL}/smartdrive/download?path=${encodeURIComponent(item.path)}`} alt={item.name} className="max-h-[380px] w-full object-contain bg-gray-50" />;
	}
	if (name.endsWith('.pdf')) {
		return <iframe src={`${CUSTOM_BACKEND_URL}/smartdrive/download?path=${encodeURIComponent(item.path)}`} className="w-full h-[380px] bg-gray-50" />;
	}
	return <div className="p-6 text-center text-gray-700 text-sm">No inline preview.</div>;
}

export default SmartDriveBrowser; 