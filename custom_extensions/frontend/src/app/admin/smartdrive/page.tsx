"use client";

import React, { useEffect, useState } from 'react';

interface BootstrapResponse {
  success: boolean;
  has_credentials: boolean;
  setup_required: boolean;
}

export default function SmartDriveSettingsPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [baseUrl, setBaseUrl] = useState("http://nc1.contentbuilder.ai:8080");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [hasCredentials, setHasCredentials] = useState<boolean | null>(null);
  const [usage, setUsage] = useState<{
    connectorsUsed: number;
    connectorsLimit: number;
    storageUsedBytes: number;
    storageLimitBytes: number;
  } | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const resp = await fetch("/api/custom-projects-backend/smartdrive/session", { method: "POST" });
        if (!resp.ok) throw new Error(`Bootstrap failed: ${resp.status}`);
        const data: BootstrapResponse = await resp.json();
        setHasCredentials(data.has_credentials);
        // Fetch current usage
        const usageResp = await fetch("/api/custom-projects-backend/smartdrive/usage");
        if (usageResp.ok) {
          const usageData = await usageResp.json();
          setUsage(usageData);
        }
      } catch (e: any) {
        console.error(e);
      }
    };
    init();
  }, []);

  const save = async () => {
    if (!username || !password) {
      setStatus("error");
      setMessage("Username and password are required");
      return;
    }
    setSaving(true);
    setStatus("idle");
    setMessage("");
    try {
      const resp = await fetch("/api/custom-projects-backend/smartdrive/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nextcloud_username: username,
          nextcloud_password: password,
          nextcloud_base_url: baseUrl,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data?.success) {
        throw new Error(data?.detail || data?.message || `Save failed: ${resp.status}`);
      }
      setStatus("ok");
      setMessage("Credentials saved successfully.");
      setHasCredentials(true);
    } catch (e: any) {
      setStatus("error");
      setMessage(e?.message || "Failed to save credentials");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-2">SmartDrive Settings</h1>
      <p className="text-sm text-gray-600 mb-6">
        Configure your Nextcloud account. These credentials are used to upload LMS exports to your SmartDrive.
      </p>

      {usage && (
        <div className="mb-6 space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">Connectors</span>
              <span className="text-gray-700">{usage.connectorsUsed} / {usage.connectorsLimit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2"
                style={{ width: `${Math.min(100, Math.round((usage.connectorsUsed / Math.max(usage.connectorsLimit || 1, 1)) * 100))}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">Storage</span>
              <span className="text-gray-700">
                {Math.round(usage.storageUsedBytes / (1024 * 1024))} MB / {Math.round(usage.storageLimitBytes / (1024 * 1024 * 1024))} GB
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
              <div
                className="bg-green-600 h-2"
                style={{ width: `${Math.min(100, Math.round((usage.storageUsedBytes / Math.max(usage.storageLimitBytes || 1, 1)) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {hasCredentials === false && (
        <div className="mb-4 p-3 rounded bg-yellow-50 text-yellow-800 text-sm">
          No credentials found. Please add them below.
        </div>
      )}

      {status !== "idle" && (
        <div
          className={`mb-4 p-3 rounded text-sm ${
            status === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nextcloud Base URL</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="http://nc1.contentbuilder.ai:8080"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your.nextcloud.user"
            autoComplete="username"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        <div className="pt-2">
          <button
            onClick={save}
            disabled={saving}
            className={`px-4 py-2 rounded text-white ${saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
} 