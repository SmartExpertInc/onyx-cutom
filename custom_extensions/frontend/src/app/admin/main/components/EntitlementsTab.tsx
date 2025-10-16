"use client";

import React, { useEffect, useState } from 'react';

type EntitlementRow = {
  onyx_user_id: string;
  user_email?: string;
  user_name?: string;
  email?: string;
  plan: string;
  base: { connectors_limit: number; storage_gb: number; slides_max: number };
  overrides: { connectors_limit?: number | null; storage_gb?: number | null; slides_max?: number | null };
  effective: { connectors_limit: number; storage_gb: number; slides_max: number; slides_options?: number[] };
};

const EntitlementsTab: React.FC = () => {
  const CUSTOM_BACKEND_URL =
    process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";
  const [rows, setRows] = useState<EntitlementRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showZeroConnectorsOnly, setShowZeroConnectorsOnly] = useState(false);
  const [batchConnectors, setBatchConnectors] = useState<string>("");
  const [batchStorage, setBatchStorage] = useState<string>("");
  const [batchSlides, setBatchSlides] = useState<string>("");
  const [batchLoading, setBatchLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${CUSTOM_BACKEND_URL}/admin/entitlements`, { credentials: 'include' });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRows(data || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load entitlements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveOverride = async (userId: string, payload: Partial<EntitlementRow["overrides"]>) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${CUSTOM_BACKEND_URL}/admin/entitlements/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchData();
    } catch (e: any) {
      setError(e?.message || 'Failed to save override');
    } finally {
      setLoading(false);
    }
  };

  const batchUpdate = async () => {
    if (selectedUsers.size === 0) {
      setError('Please select at least one user');
      return;
    }

    try {
      setBatchLoading(true);
      setError(null);
      
      const payload: any = {
        user_ids: Array.from(selectedUsers)
      };

      // Only include fields that have values
      if (batchConnectors.trim() !== "") {
        payload.connectors_limit = Number(batchConnectors);
      }
      if (batchStorage.trim() !== "") {
        payload.storage_gb = Number(batchStorage);
      }
      if (batchSlides.trim() !== "") {
        payload.slides_max = Number(batchSlides);
      }

      const res = await fetch(`${CUSTOM_BACKEND_URL}/admin/entitlements-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error(await res.text());
      
      const result = await res.json();
      await fetchData();
      
      // Clear batch form
      setBatchConnectors("");
      setBatchStorage("");
      setBatchSlides("");
      setSelectedUsers(new Set());
      
      alert(`Successfully updated ${result.updated_count} users`);
    } catch (e: any) {
      setError(e?.message || 'Failed to batch update');
    } finally {
      setBatchLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleAllUsers = () => {
    const filteredRows = getFilteredRows();
    if (selectedUsers.size === filteredRows.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredRows.map(r => r.onyx_user_id)));
    }
  };

  const getFilteredRows = () => {
    if (showZeroConnectorsOnly) {
      return rows.filter(row => row.effective.connectors_limit === 0);
    }
    return rows;
  };

  const EntRow: React.FC<{ row: EntitlementRow }> = ({ row }) => {
    const [conn, setConn] = useState<string>(row.overrides.connectors_limit?.toString() ?? "");
    const [stor, setStor] = useState<string>(row.overrides.storage_gb?.toString() ?? "");
    const [slides, setSlides] = useState<string>(row.overrides.slides_max?.toString() ?? "");

    // Reset state when row data changes (after save)
    React.useEffect(() => {
      setConn(row.overrides.connectors_limit?.toString() ?? "");
      setStor(row.overrides.storage_gb?.toString() ?? "");
      setSlides(row.overrides.slides_max?.toString() ?? "");
    }, [row.overrides.connectors_limit, row.overrides.storage_gb, row.overrides.slides_max]);

    const onSave = () => {
      const payload: any = {};
      // Empty string means use default (null), otherwise use the number
      payload.connectors_limit = conn.trim() === "" ? null : Number(conn);
      payload.storage_gb = stor.trim() === "" ? null : Number(stor);
      payload.slides_max = slides.trim() === "" ? null : Number(slides);
      saveOverride(row.onyx_user_id, payload);
    };

    return (
      <tr className="border-b">
        <td className="px-4 py-2">
          <input
            type="checkbox"
            checked={selectedUsers.has(row.onyx_user_id)}
            onChange={() => toggleUserSelection(row.onyx_user_id)}
            className="mr-2"
          />
          <span className="text-sm text-gray-800">{row.user_email || row.email || row.onyx_user_id}</span>
        </td>
        <td className="px-4 py-2 text-sm capitalize text-gray-800">{row.plan}</td>
        <td className="px-4 py-2">
          <input className="w-24 border rounded px-2 py-1 text-sm text-gray-800" placeholder="auto" value={conn} onChange={e => setConn(e.target.value)} />
        </td>
        <td className="px-4 py-2">
          <input className="w-24 border rounded px-2 py-1 text-sm text-gray-800" placeholder="auto" value={stor} onChange={e => setStor(e.target.value)} />
        </td>
        <td className="px-4 py-2">
          <input 
            className="w-24 border rounded px-2 py-1 text-sm text-gray-400 bg-gray-100" 
            placeholder="disabled" 
            value={slides} 
            onChange={e => setSlides(e.target.value)}
            disabled
            title="Slides max parameter is currently disabled"
          />
        </td>
        <td className="px-4 py-2 text-sm font-medium text-gray-900">{row.effective.connectors_limit}</td>
        <td className="px-4 py-2 text-sm text-gray-900">{row.effective.storage_gb} GB</td>
        <td className="px-4 py-2 text-sm text-gray-900">{row.effective.slides_max}</td>
        <td className="px-4 py-2">
          <button onClick={onSave} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
        </td>
      </tr>
    );
  };

  const filteredRows = getFilteredRows();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Entitlements</h2>
        <div className="flex gap-2">
          <button onClick={fetchData} className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">Refresh</button>
        </div>
      </div>

      {/* Filters and Batch Operations */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showZeroConnectorsOnly}
              onChange={(e) => setShowZeroConnectorsOnly(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Show only users with 0 connectors</span>
          </label>
          <span className="text-sm text-gray-600">
            {selectedUsers.size} of {filteredRows.length} users selected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Connectors</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Leave empty to skip"
              value={batchConnectors}
              onChange={(e) => setBatchConnectors(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Storage (GB)</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Leave empty to skip"
              value={batchStorage}
              onChange={(e) => setBatchStorage(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Slides (disabled)</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm bg-gray-100 text-gray-400"
              placeholder="Currently disabled"
              value={batchSlides}
              onChange={(e) => setBatchSlides(e.target.value)}
              disabled
              title="Slides max parameter is currently disabled"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={batchUpdate}
              disabled={batchLoading || selectedUsers.size === 0}
              className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {batchLoading ? 'Updating...' : `Update ${selectedUsers.size} Users`}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-2 text-xs font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={filteredRows.length > 0 && selectedUsers.size === filteredRows.length}
                  onChange={toggleAllUsers}
                  className="mr-2"
                />
                Email
              </th>
              <th className="px-4 py-2 text-xs font-medium text-gray-700">Plan</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-700">Override Conn</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-700">Override Storage</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-700">Override Slides (disabled)</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-700">Eff Conn</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-700">Eff Storage</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-700">Eff Slides</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-6 text-center text-sm text-gray-600">Loading…</td></tr>
            ) : filteredRows.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-6 text-center text-sm text-gray-600">No data</td></tr>
            ) : (
              filteredRows.map(r => (
                <EntRow key={r.onyx_user_id} row={r} />
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-gray-700">Leave override fields empty to use Stripe/Plan defaults.</p>
    </div>
  );
};

export default EntitlementsTab;


