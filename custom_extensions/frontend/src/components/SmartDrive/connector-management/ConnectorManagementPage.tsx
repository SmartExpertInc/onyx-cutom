"use client";

import React, { useState, useEffect, useRef } from "react";
import { CCPairFullInfo, ConnectorCredentialPairStatus, statusIsNotCurrentlyActive } from "./types";
import { buildCCPairInfoUrl, triggerIndexing, getTooltipMessage } from "./lib";
import { PlayIcon, PauseIcon, Trash2Icon, RefreshCwIcon, AlertCircle, X, Settings } from "lucide-react";

// Global counter to track component instances
let componentInstanceCounter = 0;

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
  const isLoadingRef = useRef(false);
  const lastFetchTime = useRef<number>(0);
  const componentId = useRef(Math.random().toString(36).substr(2, 9));
  const instanceNumber = useRef(++componentInstanceCounter);
  
  console.log('[MANAGEMENT_DEBUG] ConnectorManagementPage rendered for ccPairId:', ccPairId, 'componentId:', componentId.current, 'instanceNumber:', instanceNumber.current, 'totalInstances:', componentInstanceCounter);

  // Fetch connector data
  useEffect(() => {
    const fetchConnectorData = async () => {
      // Prevent multiple simultaneous requests and rapid fetches
      const now = Date.now();
      if (isLoadingRef.current || (now - lastFetchTime.current < 1000)) {
        console.log('[MANAGEMENT_DEBUG] Skipping fetch - already loading:', isLoadingRef.current, 'or too recent:', (now - lastFetchTime.current < 1000), 'componentId:', componentId.current);
        return;
      }

      try {
        console.log('[MANAGEMENT_DEBUG] Starting fetch for ccPairId:', ccPairId, 'componentId:', componentId.current);
        lastFetchTime.current = now;
        isLoadingRef.current = true;
        setLoading(true);
        const response = await fetch(buildCCPairInfoUrl(ccPairId));
        console.log('[MANAGEMENT_DEBUG] Fetch response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[MANAGEMENT_DEBUG] Received data:', data);
          setCcPair(data);
        } else {
          console.error('[MANAGEMENT_DEBUG] Failed to load connector data, status:', response.status);
          setError('Failed to load connector data');
        }
      } catch (err) {
        console.error('[MANAGEMENT_DEBUG] Error loading connector data:', err);
        setError('Failed to load connector data');
      } finally {
        console.log('[MANAGEMENT_DEBUG] Fetch completed for ccPairId:', ccPairId, 'componentId:', componentId.current);
        setLoading(false);
        isLoadingRef.current = false;
      }
    };

    fetchConnectorData();
  }, [ccPairId]);

  // Cleanup effect to track component unmounting
  useEffect(() => {
    return () => {
      componentInstanceCounter--;
      console.log('[MANAGEMENT_DEBUG] ConnectorManagementPage unmounting, instanceNumber:', instanceNumber.current, 'remaining instances:', componentInstanceCounter);
    };
  }, []);

  // Refresh data
  const refreshData = async () => {
    // Prevent multiple simultaneous refresh requests
    if (isLoadingRef.current) {
      console.log('[MANAGEMENT_DEBUG] Already loading, skipping refresh for ccPairId:', ccPairId);
      return;
    }

    try {
      console.log('[MANAGEMENT_DEBUG] Starting refresh for ccPairId:', ccPairId);
      isLoadingRef.current = true;
      const response = await fetch(buildCCPairInfoUrl(ccPairId));
      console.log('[MANAGEMENT_DEBUG] Refresh response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[MANAGEMENT_DEBUG] Refreshed data:', data);
        setCcPair(data);
      }
    } catch (err) {
      console.error('[MANAGEMENT_DEBUG] Failed to refresh data:', err);
    } finally {
      console.log('[MANAGEMENT_DEBUG] Refresh completed for ccPairId:', ccPairId);
      isLoadingRef.current = false;
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
        // Commented out to prevent excessive API calls - setTimeout(refreshData, 1000);
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
        // Immediate close instead of delayed - setTimeout(() => {
        onConnectorDeleted?.();
        onClose();
        // }, 1500);
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
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{ccPair.name}</h2>
              <p className="text-gray-900 text-lg">
                {ccPair.connector.source} • {ccPair.credential.name}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Popup */}
          {popup && (
            <div className={`mb-6 p-4 rounded-lg border ${
              popup.type === 'success' 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200' 
                : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {popup.type === 'success' ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span className="font-medium">{popup.message}</span>
              </div>
            </div>
          )}

          {/* Status and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-gray-900">Status</div>
                <div className={`w-3 h-3 rounded-full ${
                  isActive ? 'bg-green-500' : 
                  isPaused ? 'bg-yellow-500' : 
                  isInvalid ? 'bg-red-500' : 'bg-gray-500'
                }`}></div>
              </div>
              <div className={`text-2xl font-bold ${
                isActive ? 'text-green-600' : 
                isPaused ? 'text-yellow-600' : 
                isInvalid ? 'text-red-600' : 'text-gray-600'
              }`}>
                {ccPair.status}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <div className="text-sm font-semibold text-gray-900 mb-2">Documents Indexed</div>
              <div className="text-2xl font-bold text-blue-600">{ccPair.num_docs_indexed.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
              <div className="text-sm font-semibold text-gray-900 mb-2">Last Indexed</div>
              <div className="text-2xl font-bold text-purple-600">
                {ccPair.last_indexed ? new Date(ccPair.last_indexed).toLocaleDateString() : 'Never'}
              </div>
            </div>
          </div>

          {/* Error State */}
          {isInvalid && (
            <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Connector is in an invalid state</h3>
                  <p className="text-red-700 text-sm mt-1">Please check your configuration and try again.</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            {/* Index Button */}
            <button
              onClick={() => handleIndexing(false)}
              disabled={!!tooltipMessage}
              title={tooltipMessage}
              className={`px-6 py-3 rounded-lg flex items-center gap-3 font-medium transition-all duration-200 ${
                tooltipMessage 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
              }`}
            >
              <RefreshCwIcon className="w-5 h-5" />
              Index
            </button>

            {/* Full Re-index Button */}
            <button
              onClick={() => handleIndexing(true)}
              disabled={!!tooltipMessage}
              title={tooltipMessage}
              className={`px-6 py-3 rounded-lg flex items-center gap-3 font-medium transition-all duration-200 ${
                tooltipMessage 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 shadow-md hover:shadow-lg'
              }`}
            >
              <RefreshCwIcon className="w-5 h-5" />
              Full Re-index
            </button>

            {/* Pause/Resume Button */}
            <button
              onClick={handleStatusChange}
              disabled={isDeleting || isIndexing}
              className={`px-6 py-3 rounded-lg flex items-center gap-3 font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white hover:from-yellow-700 hover:to-orange-700 shadow-md hover:shadow-lg' 
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg'
              }`}
            >
              {isActive ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
              {isActive ? 'Pause' : 'Resume'}
            </button>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              disabled={isDeleting || isIndexing || !isPaused}
              title={!isPaused ? "Connector must be paused before deletion" : ""}
              className={`px-6 py-3 rounded-lg flex items-center gap-3 font-medium transition-all duration-200 ${
                isDeleting || isIndexing || !isPaused
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 shadow-md hover:shadow-lg'
              }`}
            >
              <Trash2Icon className="w-5 h-5" />
              Delete
            </button>
          </div>

          {/* Configuration Display */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <span className="font-semibold text-gray-900">Connector Name:</span>
                <span className="text-gray-900 ml-2">{ccPair.connector.name}</span>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <span className="font-semibold text-gray-900">Source:</span>
                <span className="text-gray-900 ml-2">{ccPair.connector.source}</span>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <span className="font-semibold text-gray-900">Credential:</span>
                <span className="text-gray-900 ml-2">{ccPair.credential.name}</span>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <span className="font-semibold text-gray-900">Access Type:</span>
                <span className="text-gray-900 ml-2">{ccPair.access_type}</span>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <span className="font-semibold text-gray-900">Refresh Frequency:</span>
                <span className="text-gray-900 ml-2">{ccPair.connector.refresh_freq}s</span>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <span className="font-semibold text-gray-900">Prune Frequency:</span>
                <span className="text-gray-900 ml-2">{ccPair.connector.prune_freq}s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 