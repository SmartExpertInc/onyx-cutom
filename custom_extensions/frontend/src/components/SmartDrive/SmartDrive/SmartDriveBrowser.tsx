"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Folder, File, Upload, Plus, Trash2, MoveRight, Copy, Download, RotateCcw, Search, Link as LinkIcon, ExternalLink } from 'lucide-react';

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
		if (!term) return items;
		return items.filter(i => i.name.toLowerCase().includes(term));
	}, [items, search]);

	const toggle = (p: string) => {
		const next = new Set(selected);
		if (next.has(p)) next.delete(p); else next.add(p);
		setSelected(next);
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

	const uploadInput = useRef<HTMLInputElement | null>(null);
	const onUploadClick = () => uploadInput.current?.click();
	const onUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;
		const form = new FormData();
		for (const f of Array.from(files)) form.append('files', f);
		setBusy(true);
		try {
			const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/upload?path=${encodeURIComponent(currentPath)}` , {
				method: 'POST',
				credentials: 'same-origin',
				body: form,
			});
			if (!res.ok && res.status !== 207) throw new Error(await res.text());
			await fetchList(currentPath);
		} catch (e) {
			alert('Upload failed');
		} finally {
			setBusy(false);
			if (uploadInput.current) uploadInput.current.value = '';
		}
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

	const onItemClick = (it: SmartDriveItem, multi: boolean) => {
		if (it.type === 'directory') {
			setCurrentPath(it.path.endsWith('/') ? it.path : `${it.path}/`);
			clearSel();
			return;
		}
		if (mode === 'select' && !multi) {
			if (onFilesSelected) onFilesSelected([it.path]);
			return;
		}
		toggle(it.path);
	};

	const visible = filtered;

	return (
		<div className={className}>
			{/* Toolbar */}
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-2 text-sm text-gray-600">
					{breadcrumbs.map((b, idx) => (
						<button key={b.path} className="hover:text-gray-900" onClick={() => setCurrentPath(b.path)}>
							{idx > 0 ? ' / ' : ''}{b.label}
						</button>
					))}
				</div>
				<div className="flex items-center gap-2">
					<div className="relative">
						<Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search" className="pl-8 pr-2 py-1.5 border rounded" />
					</div>
					<button onClick={onUploadClick} disabled={busy} className="px-2 py-1 border rounded inline-flex items-center gap-1"><Upload className="w-4 h-4"/>Upload</button>
					<input ref={uploadInput} type="file" multiple className="hidden" onChange={onUploadChange} />
					<button onClick={mkdir} disabled={busy} className="px-2 py-1 border rounded inline-flex items-center gap-1"><Plus className="w-4 h-4"/>New Folder</button>
					<button onClick={del} disabled={busy || selected.size===0} className="px-2 py-1 border rounded inline-flex items-center gap-1"><Trash2 className="w-4 h-4"/>Delete</button>
					<button onClick={download} disabled={busy || selected.size===0} className="px-2 py-1 border rounded inline-flex items-center gap-1"><Download className="w-4 h-4"/>Download</button>
					<button onClick={openInNextcloud} className="px-2 py-1 border rounded inline-flex items-center gap-1"><ExternalLink className="w-4 h-4"/>Open in Nextcloud</button>
				</div>
			</div>

			{/* List */}
			<div className="border rounded">
				{loading ? (
					<div className="p-8 text-center text-gray-500">Loading…</div>
				) : error ? (
					<div className="p-8 text-center text-red-600">{error}</div>
				) : visible.length === 0 ? (
					<div className="p-8 text-center text-gray-500">This folder is empty</div>
				) : (
					<div className="divide-y">
						{visible.map(it => (
							<div key={it.path} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50">
								<input type="checkbox" checked={selected.has(it.path)} onChange={()=>toggle(it.path)} />
								<div className="w-5 h-5">
									{it.type === 'directory' ? <Folder className="w-5 h-5 text-blue-600"/> : <File className="w-5 h-5 text-gray-600"/>}
								</div>
								<button className="flex-1 text-left" onClick={(e)=>onItemClick(it, e.shiftKey)}>
									<div className="font-medium text-gray-900">{it.name}</div>
									<div className="text-xs text-gray-500">{it.type === 'file' ? `${(it.size ?? 0)} bytes` : 'Folder'}{it.modified ? ` • ${new Date(it.modified).toLocaleString()}` : ''}</div>
								</button>
							</div>
						))}
					</div>
				)}
			</div>

			{mode === 'select' && (
				<div className="flex justify-end gap-2 mt-3">
					<button onClick={clearSel} className="px-3 py-1 border rounded">Clear</button>
					<button onClick={()=>onFilesSelected && onFilesSelected(Array.from(selected))} disabled={selected.size===0} className="px-3 py-1 bg-blue-600 text-white rounded">Select {selected.size || ''}</button>
				</div>
			)}
		</div>
	);
};

export default SmartDriveBrowser; 