"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import {
  MoreHorizontal,
  ArrowUpDown,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  ExternalLink,
  FileText,
  Calendar,
  User,
  Clock,
  Building,
  CheckCircle,
  AlertCircle,
  XCircle,
  Archive,
  Eye,
  Send,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  Share2,
  Copy,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface Audit {
  id: number;
  onyx_user_id: string;
  project_name: string;
  created_at: string;
  company_name: string;
  audit_type: string;
  status: string;
  total_modules: number;
  total_lessons: number;
  language: string;
  share_token?: string;
}

interface AuditsTableProps {
  companyId?: number | null;
}

const AuditsTable: React.FC<AuditsTableProps> = ({ companyId }) => {
  const { t } = useLanguage();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"project_name" | "created_at" | "company_name" | "audit_type" | "total_modules">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAudit, setEditingAudit] = useState<Audit | null>(null);
  const [shareModalAudit, setShareModalAudit] = useState<Audit | null>(null);
  const [shareLink, setShareLink] = useState<string>("");
  const [generatingShareLink, setGeneratingShareLink] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

  // Fetch audits
  const fetchAudits = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (companyId) {
        params.append('company_id', companyId.toString());
      }
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/custom/audits?${params}`, {
        credentials: 'same-origin',
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Handle authentication error - redirect to main app login
          const protocol = window.location.protocol;
          const host = window.location.host;
          const currentUrl = window.location.pathname + window.location.search;
          const mainAppUrl = `${protocol}//${host}/auth/login?next=${encodeURIComponent(currentUrl)}`;
          window.location.href = mainAppUrl;
          return;
        }
        throw new Error(`Failed to fetch audits: ${response.status}`);
      }

      const data = await response.json();
      setAudits(data);
    } catch (error) {
      console.error('Error fetching audits:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch audits');
    } finally {
      setLoading(false);
    }
  }, [companyId, statusFilter, CUSTOM_BACKEND_URL]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAudits(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchAudits]);

  // Initial load and filter changes
  useEffect(() => {
    fetchAudits(searchTerm);
  }, [companyId, statusFilter]);

  // Sort audits
  const sortedAudits = useMemo(() => {
    return [...audits].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'project_name':
          aValue = a.project_name.toLowerCase();
          bValue = b.project_name.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'company_name':
          aValue = a.company_name.toLowerCase();
          bValue = b.company_name.toLowerCase();
          break;
        case 'audit_type':
          aValue = a.audit_type.toLowerCase();
          bValue = b.audit_type.toLowerCase();
          break;
        case 'total_modules':
          aValue = a.total_modules;
          bValue = b.total_modules;
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [audits, sortBy, sortOrder]);

  // Handle sorting
  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Get localized status name
  const getLocalizedStatus = (status: string) => {
    switch (status) {
      case 'Draft':
        return t('interface.draft', 'Draft');
      case 'Completed':
        return t('interface.completed', 'Completed');
      case 'In Progress':
        return t('interface.inProgress', 'In Progress');
      case 'Published':
        return t('interface.published', 'Published');
      case 'Archived':
        return t('interface.archived', 'Archived');
      default:
        return status;
    }
  };

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Draft':
        return { icon: FileText, color: 'text-gray-500', bgColor: 'bg-gray-100' };
      case 'Completed':
        return { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-100' };
      case 'In Progress':
        return { icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-100' };
      case 'Published':
        return { icon: Eye, color: 'text-purple-500', bgColor: 'bg-purple-100' };
      case 'Archived':
        return { icon: Archive, color: 'text-gray-400', bgColor: 'bg-gray-100' };
      default:
        return { icon: AlertCircle, color: 'text-gray-500', bgColor: 'bg-gray-100' };
    }
  };

  // Format date with locale awareness
  const formatDate = (dateString: string) => {
    const locale = t('interface.locale', 'en-US');
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle delete audit
  const handleDeleteAudit = async (auditId: number) => {
    if (!confirm(t('interface.deleteAuditConfirmation', 'Are you sure you want to delete this audit? This action cannot be undone.'))) {
      return;
    }

    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/custom/audits/${auditId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete audit: ${response.status}`);
      }

      // Refresh audits
      fetchAudits(searchTerm);
    } catch (error) {
      console.error('Error deleting audit:', error);
      alert(t('interface.deleteAuditError', 'Failed to delete audit'));
    }
  };

  // Handle edit audit
  const handleEditAudit = (audit: Audit) => {
    setEditingAudit(audit);
    setShowEditModal(true);
  };

  // Handle audit saved/updated
  const handleAuditSaved = () => {
    setShowEditModal(false);
    setEditingAudit(null);
    fetchAudits(searchTerm);
  };

  // Handle share audit
  const handleShareAudit = async (audit: Audit) => {
    setShareModalAudit(audit);
    setGeneratingShareLink(true);
    setShareLink("");
    setCopySuccess(false);

    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/api/custom/audits/${audit.id}/generate-share-link`, {
        method: 'POST',
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error('Failed to generate share link');
      }

      const data = await response.json();
      setShareLink(data.share_url);
    } catch (error) {
      console.error('Error generating share link:', error);
      alert(t('interface.shareError', 'Failed to generate share link'));
    } finally {
      setGeneratingShareLink(false);
    }
  };

  // Handle copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
      alert(t('interface.copyError', 'Failed to copy link'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchAudits(searchTerm)}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {t('interface.retry', 'Retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header with Search, Filter, and Create Button */}
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search and Filter Row */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                variant="shadow"
                type="text"
                placeholder={t('interface.searchAudits', 'Search audits...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2"
              />
            </div>
          </div>

          {/* Create Button */}
          <Button
            variant="download"
            onClick={() => {
              // Navigate to audit creation page
              window.location.href = '/create/ai-audit/questionnaire';
            }}
            className="flex items-center gap-2 px-4 py-2 whitespace-nowrap"
          >
            <Plus size={16} />
            {t('interface.createAudit', 'Create Audit')}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('project_name')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    {t('interface.audit', 'Audit')}
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('company_name')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    {t('interface.company', 'Company')}
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('created_at')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    {t('interface.createdOn', 'Created On')}
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('audit_type')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    {t('interface.type', 'Type')}
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('total_modules')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    {t('interface.modules', 'Modules')}
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('interface.link', 'Link')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('interface.actions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAudits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium">{t('interface.noAudits', 'No audits found')}</p>
                    <p className="text-sm">{t('interface.createYourFirstAudit', 'Create your first audit to get started')}</p>
                  </td>
                </tr>
              ) : (
                sortedAudits.map((audit) => {
                  const statusInfo = getStatusInfo(audit.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={audit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building className="h-5 w-5 text-gray-400 mr-3" />
                          <div className="text-sm font-medium text-gray-900">{audit.project_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="text-sm text-gray-500">{audit.company_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(audit.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                          {audit.audit_type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          {audit.total_modules} {t('interface.modules', 'modules')} • {audit.total_lessons} {t('interface.lessons', 'lessons')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <a
                          href={`/projects/view/${audit.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          {t('interface.view', 'View')}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleShareAudit(audit)}
                            className="text-green-600 hover:text-green-900"
                            title={t('interface.shareAudit', 'Share Audit')}
                          >
                            <Share2 size={16} />
                          </button>
                          <button
                            onClick={() => handleEditAudit(audit)}
                            className="text-blue-600 hover:text-blue-900"
                            title={t('interface.editAudit', 'Edit Audit')}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteAudit(audit.id)}
                            className="text-red-600 hover:text-red-900"
                            title={t('interface.deleteAudit', 'Delete Audit')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Share Audit Modal */}
      {shareModalAudit && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShareModalAudit(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Share2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-black">
                      {t('interface.shareAudit', 'Share Audit')}
                    </h2>
                    <p className="text-sm text-black/70 mt-1">
                      {shareModalAudit.project_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShareModalAudit(null)}
                  className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2 hover:bg-gray-100 rounded-full group"
                >
                  <XCircle size={20} className="group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Building className="h-5 w-5 text-blue-600 mt-0.5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black">
                        {t('interface.shareAuditDescription', 'Share this audit with anyone, even those without an account')}
                      </p>
                      <p className="text-xs text-black/70 mt-1">
                        {t('interface.shareAuditSubtext', 'Recipients can view the full audit details without creating an account')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {generatingShareLink ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <span className="ml-3 text-black font-medium">
                    {t('interface.generatingLink', 'Generating link...')}
                  </span>
                </div>
              ) : shareLink ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-3">
                      {t('interface.shareableLink', 'Shareable Link')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={shareLink}
                        readOnly
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-gray-50 text-black text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        onClick={(e) => e.currentTarget.select()}
                      />
                      <button
                        onClick={handleCopyLink}
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-md transition-all duration-200 ${copySuccess
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        title={copySuccess ? t('interface.copied', 'Copied!') : t('interface.copyLink', 'Copy Link')}
                      >
                        {copySuccess ? (
                          <CheckCircle size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                    {copySuccess && (
                      <div className="flex items-center mt-2 text-green-600">
                        <CheckCircle size={16} className="mr-2" />
                        <span className="text-sm font-medium">
                          {t('interface.linkCopied', 'Link copied to clipboard!')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShareModalAudit(null)}
                  className="px-4 py-2 text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  {t('interface.close', 'Close')}
                </button>
                {shareLink && (
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${copySuccess
                      ? 'bg-green-600 text-white'
                      : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                  >
                    {copySuccess ? (
                      <span className="flex items-center">
                        <CheckCircle size={16} className="mr-2" />
                        {t('interface.copied', 'Copied!')}
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Copy size={16} className="mr-2" />
                        {t('interface.copyLink', 'Copy Link')}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditsTable;
