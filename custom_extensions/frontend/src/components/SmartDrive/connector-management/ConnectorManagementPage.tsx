"use client";

import React, { useState, useEffect } from "react";
import { CCPairFullInfo, ConnectorCredentialPairStatus, statusIsNotCurrentlyActive } from "./types";
import { buildCCPairInfoUrl, triggerIndexing, getTooltipMessage } from "./lib";
import { PlayIcon, PauseIcon, Trash2Icon, RefreshCwIcon, AlertCircle, X } from "lucide-react";

interface ConnectorManagementPageProps {
  ccPairId: number;
  onClose: () => void;
  onConnectorDeleted?: () => void;
}

export default function ConnectorManagementPage({ 
  ccPairId, 
  onClose, 
  onConnectorDeleted 
}: ConnectorManagementPageProps) {
  const [ccPair, setCcPair] = useState<CCPairFullInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [popup, setPopup] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch connector data
  useEffect(() => {
    const fetchConnectorData = async () => {
      try {
        setLoading(true);
        const response = await fetch(buildCCPairInfoUrl(ccPairId));
        if (response.ok) {
          const data = await response.json();
          setCcPair(data);
        } else {
          setError('Failed to load connector data');
        }
      } catch (err) {
        setError('Failed to load connector data');
      } finally {
        setLoading(false);
      }
    };

    fetchConnectorData();
  }, [ccPairId]);

  // Refresh data
  const refreshData = async () => {
    try {
      const response = await fetch(buildCCPairInfoUrl(ccPairId));
      if (response.ok) {
        const data = await response.json();
        setCcPair(data);
      }
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  };

  // Handle indexing
  const handleIndexing = async (fromBeginning: boolean = false) => {
    if (!ccPair) return;

    try {
      const result = await triggerIndexing(
        fromBeginning,
        ccPair.connector.id,
        ccPair.credential.id,
        ccPair.id
      );

      if (result.success) {
        setPopup({ message: result.message, type: 'success' });
        // Refresh data after a short delay
        setTimeout(refreshData, 1000);
      } else {
        setPopup({ message: result.message, type: 'error' });
      }
    } catch (err) {
      setPopup({ message: 'Failed to trigger indexing', type: 'error' });
    }
  };

  // Handle status change (pause/resume)
  const handleStatusChange = async () => {
    if (!ccPair) return;

    try {
      const newStatus = ccPair.status === ConnectorCredentialPairStatus.ACTIVE 
        ? ConnectorCredentialPairStatus.PAUSED 
        : ConnectorCredentialPairStatus.ACTIVE;

      const response = await fetch(`/api/manage/admin/cc-pair/${ccPair.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setPopup({ 
          message: `Connector ${newStatus === ConnectorCredentialPairStatus.ACTIVE ? 'resumed' : 'paused'}`, 
          type: 'success' 
        });
        refreshData();
      } else {
        setPopup({ message: 'Failed to update connector status', type: 'error' });
      }
    } catch (err) {
      setPopup({ message: 'Failed to update connector status', type: 'error' });
    }
  };

  // Handle deletion
  const handleDelete = async () => {
    if (!ccPair || !confirm('Are you sure you want to delete this connector? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/manage/admin/cc-pair/${ccPair.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPopup({ message: 'Connector deleted successfully', type: 'success' });
        setTimeout(() => {
          onConnectorDeleted?.();
          onClose();
        }, 1500);
      } else {
        setPopup({ message: 'Failed to delete connector', type: 'error' });
      }
    } catch (err) {
      setPopup({ message: 'Failed to delete connector', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ccPair) {
    return (
      <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Connector Management</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="text-center text-red-600">
              {error || 'Connector not found'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isActive = ccPair.status === ConnectorCredentialPairStatus.ACTIVE;
  const isPaused = ccPair.status === ConnectorCredentialPairStatus.PAUSED;
  const isInvalid = ccPair.status === ConnectorCredentialPairStatus.INVALID;
  const isDeleting = ccPair.status === ConnectorCredentialPairStatus.DELETING;
  const isIndexing = ccPair.indexing;

  const tooltipMessage = getTooltipMessage(isInvalid, isDeleting, isIndexing, !isActive);

  return (
    <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{ccPair.name}</h2>
              <p className="text-sm text-gray-500">
                {ccPair.connector.source} • {ccPair.credential.name}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Popup */}
          {popup && (
            <div className={`mb-4 p-3 rounded-md ${
              popup.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {popup.message}
            </div>
          )}

          {/* Status and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Status</div>
              <div className={`text-lg font-semibold ${
                isActive ? 'text-green-600' : 
                isPaused ? 'text-yellow-600' : 
                isInvalid ? 'text-red-600' : 'text-gray-600'
              }`}>
                {ccPair.status}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Documents Indexed</div>
              <div className="text-lg font-semibold">{ccPair.num_docs_indexed.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Last Indexed</div>
              <div className="text-lg font-semibold">
                {ccPair.last_indexed ? new Date(ccPair.last_indexed).toLocaleDateString() : 'Never'}
              </div>
            </div>
          </div>

          {/* Error State */}
          {isInvalid && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800">Connector is in an invalid state</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            {/* Index Button */}
            <button
              onClick={() => handleIndexing(false)}
              disabled={!!tooltipMessage}
              title={tooltipMessage}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                tooltipMessage 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <RefreshCwIcon className="w-4 h-4" />
              Index
            </button>

            {/* Full Re-index Button */}
            <button
              onClick={() => handleIndexing(true)}
              disabled={!!tooltipMessage}
              title={tooltipMessage}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                tooltipMessage 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              <RefreshCwIcon className="w-4 h-4" />
              Full Re-index
            </button>

            {/* Pause/Resume Button */}
            <button
              onClick={handleStatusChange}
              disabled={isDeleting || isIndexing}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                isActive 
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isActive ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              {isActive ? 'Pause' : 'Resume'}
            </button>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              disabled={isDeleting || isIndexing}
              className="px-4 py-2 rounded-md flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500"
            >
              <Trash2Icon className="w-4 h-4" />
              Delete
            </button>
          </div>

          {/* Configuration Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Connector Name:</span> {ccPair.connector.name}
              </div>
              <div>
                <span className="font-medium">Source:</span> {ccPair.connector.source}
              </div>
              <div>
                <span className="font-medium">Credential:</span> {ccPair.credential.name}
              </div>
              <div>
                <span className="font-medium">Access Type:</span> {ccPair.access_type}
              </div>
              <div>
                <span className="font-medium">Refresh Frequency:</span> {ccPair.connector.refresh_freq}s
              </div>
              <div>
                <span className="font-medium">Prune Frequency:</span> {ccPair.connector.prune_freq}s
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 