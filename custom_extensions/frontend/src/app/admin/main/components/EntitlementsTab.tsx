"use client";

import React, { useEffect, useState } from 'react';

type EntitlementRow = {
  onyx_user_id: string;
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

  const renderRow = (row: EntitlementRow) => {
    const [conn, setConn] = useState<string>(row.overrides.connectors_limit?.toString() ?? '');
    const [stor, setStor] = useState<string>(row.overrides.storage_gb?.toString() ?? '');
    const [slides, setSlides] = useState<string>(row.overrides.slides_max?.toString() ?? '');

    const onSave = () => {
      const payload: any = {};
      payload.connectors_limit = conn === '' ? null : Number(conn);
      payload.storage_gb = stor === '' ? null : Number(stor);
      payload.slides_max = slides === '' ? null : Number(slides);
      saveOverride(row.onyx_user_id, payload);
    };

    return (
      <tr key={row.onyx_user_id} className="border-b">
        <td className="px-4 py-2 text-sm">{row.onyx_user_id}</td>
        <td className="px-4 py-2 text-sm capitalize">{row.plan}</td>
        <td className="px-4 py-2 text-sm">{row.base.connectors_limit}</td>
        <td className="px-4 py-2 text-sm">{row.base.storage_gb} GB</td>
        <td className="px-4 py-2 text-sm">{row.base.slides_max}</td>
        <td className="px-4 py-2">
          <input className="w-20 border rounded px-2 py-1 text-sm" placeholder="auto" value={conn} onChange={e => setConn(e.target.value)} />
        </td>
        <td className="px-4 py-2">
          <input className="w-20 border rounded px-2 py-1 text-sm" placeholder="auto" value={stor} onChange={e => setStor(e.target.value)} />
        </td>
        <td className="px-4 py-2">
          <input className="w-20 border rounded px-2 py-1 text-sm" placeholder="auto" value={slides} onChange={e => setSlides(e.target.value)} />
        </td>
        <td className="px-4 py-2 text-sm font-medium">{row.effective.connectors_limit}</td>
        <td className="px-4 py-2 text-sm">{row.effective.storage_gb} GB</td>
        <td className="px-4 py-2 text-sm">{row.effective.slides_max}</td>
        <td className="px-4 py-2">
          <button onClick={onSave} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
        </td>
      </tr>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Entitlements</h2>
        <button onClick={fetchData} className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">Refresh</button>
      </div>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-2 text-xs font-medium text-gray-600">User ID</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-600">Plan</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-600">Base Conn</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-600">Base Storage</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-600">Base Slides</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-600">Override Conn</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-600">Override Storage</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-600">Override Slides</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-600">Eff Conn</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-600">Eff Storage</th>
              <th className="px-4 py-2 text-xs font-medium text-gray-600">Eff Slides</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={12} className="px-4 py-6 text-center text-sm text-gray-500">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={12} className="px-4 py-6 text-center text-sm text-gray-500">No data</td></tr>
            ) : (
              rows.map(r => (
                <React.Fragment key={r.onyx_user_id}>{renderRow(r)}</React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-gray-500">Leave override fields empty to use Stripe/Plan defaults.</p>
    </div>
  );
};

export default EntitlementsTab;


