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
  ClipboardCheck,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

interface Audit {
  id: number;
  name: string;
  company_name: string;
  created_at: string;
  updated_at: string;
  status: string;
  link: string | null;
}

interface AuditsTableProps {
  companyId?: number | null;
}

const AuditsTable: React.FC<AuditsTableProps> = ({ companyId }) => {
  const { t } = useLanguage();
  const router = useRouter();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "company_name" | "created_at" | "status">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAudit, setEditingAudit] = useState<Audit | null>(null);
  const [shareModalAudit, setShareModalAudit] = useState<Audit | null>(null);
  const [shareLink, setShareLink] = useState<string>("");
  const [generatingShareLink, setGeneratingShareLink] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

  // Fetch audits - using the same endpoint as ProjectsTable with auditMode
  const fetchAudits = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (companyId) {
        params.append('company_id', companyId.toString());
      }
      if (search) {
        params.append('search', search);
      }

      // Use the same projects endpoint but we'll filter for audit-related data
      const response = await fetch(`${CUSTOM_BACKEND_URL}/projects?${params}`, {
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
      
      // [Audits Tab] API Response Logging
      console.log('[Audits Tab] API Response:', {
        url: `${CUSTOM_BACKEND_URL}/projects?${params}`,
        status: response.status,
        totalProjects: data.length,
        rawData: JSON.stringify(data, null, 2),
        searchParams: {
          companyId,
          search,
          params: params.toString()
        }
      });
      
      // Log individual project details for debugging
      console.log('[Audits Tab] Individual Project Details:', data.map((project: any, index: number) => ({
        index,
        id: project.id,
        projectName: project.projectName,
        designMicroproductType: project.designMicroproductType,
        microproductContent: project.microproduct_content,
        hasCompanyName: !!(project.microproduct_content?.companyName),
        companyName: project.microproduct_content?.companyName
      })));
      
      // Filter for audit projects only (same logic as ProjectsTable with auditMode)
      const filterCriteria = {
        aiAuditPatterns: ['AI-Аудит', 'AI-Audit'],
        textPresentationTypes: ['Text Presentation', 'TextPresentationDisplay']
      };
      
      console.log('[Audits Tab] Filter Criteria:', filterCriteria);
      
      const auditProjects = data.filter((project: any) => {
        // Check if it's an AI audit by project name pattern
        const isAIAudit = project.projectName && (
          project.projectName.includes('AI-Аудит') || 
          project.projectName.includes('AI-Audit')
        );
        
        // Check if it's a Text Presentation (which includes audits)
        const isTextPresentation = project.designMicroproductType === 'Text Presentation' || 
                                 project.designMicroproductType === 'TextPresentationDisplay';
        
        const isAudit = isAIAudit || isTextPresentation;
        
        // Log individual filter decisions
        console.log(`[Audits Tab] Filter Decision for Project ${project.id} (${project.projectName}):`, {
          projectName: project.projectName,
          designMicroproductType: project.designMicroproductType,
          isAIAudit,
          isTextPresentation,
          finalDecision: isAudit,
          reason: isAudit ? 
            (isAIAudit ? 'Matches AI audit pattern' : 'Matches text presentation type') : 
            'Does not match audit criteria'
        });
        
        return isAudit;
      });
      
      // [Audits Tab] Filter Results Logging
      console.log('[Audits Tab] Filter Applied:', {
        before: data.length,
        after: auditProjects.length,
        filteredOut: data.length - auditProjects.length,
        filterCriteria,
        auditProjects: auditProjects.map((p: any) => ({
          id: p.id,
          name: p.projectName,
          type: p.designMicroproductType
        }))
      });
      
      // Transform the filtered audit projects data
      console.log('[Audits Tab] Starting Data Transformation:', {
        auditProjectsCount: auditProjects.length,
        auditProjects: auditProjects.map((p: any) => ({
          id: p.id,
          name: p.projectName,
          microproductContent: p.microproduct_content
        }))
      });
      
      const transformedAudits: Audit[] = auditProjects.map((project: any, index: number) => {
        // Extract company name from microproduct_content for audit projects
        let companyName = 'Unknown Company';
        let companyNameSource = 'default';
        
        console.log(`[Audits Tab] Processing Project ${project.id} (${index + 1}/${auditProjects.length}):`, {
          projectId: project.id,
          projectName: project.projectName,
          hasMicroproductContent: !!project.microproduct_content,
          microproductContentType: typeof project.microproduct_content,
          microproductContentKeys: project.microproduct_content ? Object.keys(project.microproduct_content) : [],
          rawMicroproductContent: project.microproduct_content
        });
        
        if (project.microproduct_content && typeof project.microproduct_content === 'object') {
          if (project.microproduct_content.companyName) {
            companyName = project.microproduct_content.companyName;
            companyNameSource = 'microproduct_content.companyName';
          } else {
            console.log(`[Audits Tab] Company Name Extraction - Project ${project.id}:`, {
              microproductContent: project.microproduct_content,
              availableKeys: Object.keys(project.microproduct_content),
              companyNameField: project.microproduct_content.companyName,
              reason: 'No companyName field found in microproduct_content'
            });
          }
        } else {
          console.log(`[Audits Tab] Company Name Extraction - Project ${project.id}:`, {
            microproductContent: project.microproduct_content,
            reason: 'No microproduct_content or not an object'
          });
        }
        
        const transformedAudit = {
          id: project.id,
          name: project.projectName || project.name || `Audit ${project.id}`,
          company_name: companyName,
          created_at: project.created_at || project.createdAt || new Date().toISOString(),
          updated_at: project.updated_at || project.updatedAt || new Date().toISOString(),
          status: 'Active', // Default status
          link: `/projects/view/${project.id}`,
        };
        
        console.log(`[Audits Tab] Transformed Audit ${project.id}:`, {
          original: {
            id: project.id,
            projectName: project.projectName,
            microproductContent: project.microproduct_content
          },
          transformed: transformedAudit,
          companyNameSource
        });
        
        return transformedAudit;
      });
      
      // [Audits Tab] Final Data Passed to Table Logging
      console.log('[Audits Tab] Final Data Passed to Table:', {
        totalAudits: transformedAudits.length,
        audits: transformedAudits.map(audit => ({
          id: audit.id,
          name: audit.name,
          company_name: audit.company_name,
          created_at: audit.created_at,
          link: audit.link
        })),
        summary: {
          totalProjects: data.length,
          auditProjects: auditProjects.length,
          finalAudits: transformedAudits.length,
          companiesWithNames: transformedAudits.filter(a => a.company_name !== 'Unknown Company').length,
          unknownCompanies: transformedAudits.filter(a => a.company_name === 'Unknown Company').length
        }
      });
      
      setAudits(transformedAudits);
    } catch (error) {
      console.error('Error fetching audits:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch audits');
    } finally {
      setLoading(false);
    }
  }, [companyId, CUSTOM_BACKEND_URL]);

  // Debounced search effect
  useEffect(() => {
    console.log('[Audits Tab] Search Effect Triggered:', {
      searchTerm,
      companyId,
      timestamp: new Date().toISOString()
    });
    
    const timeoutId = setTimeout(() => {
      console.log('[Audits Tab] Executing Debounced Search:', {
        searchTerm,
        companyId,
        timeoutMs: 300
      });
      fetchAudits(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchAudits]);

  // Initial load
  useEffect(() => {
    console.log('[Audits Tab] Initial Load Effect Triggered:', {
      companyId,
      searchTerm,
      timestamp: new Date().toISOString()
    });
    fetchAudits(searchTerm);
  }, [companyId]);

  // Sort audits
  const sortedAudits = useMemo(() => {
    console.log('[Audits Tab] Sorting Audits:', {
      totalAudits: audits.length,
      sortBy,
      sortOrder,
      audits: audits.map(a => ({
        id: a.id,
        name: a.name,
        company_name: a.company_name,
        created_at: a.created_at,
        status: a.status
      }))
    });
    
    const sorted = [...audits].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'company_name':
          aValue = a.company_name.toLowerCase();
          bValue = b.company_name.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    console.log('[Audits Tab] Sorting Complete:', {
      sortedCount: sorted.length,
      firstFew: sorted.slice(0, 3).map(a => ({
        id: a.id,
        name: a.name,
        company_name: a.company_name
      }))
    });
    
    return sorted;
  }, [audits, sortBy, sortOrder]);

  // Handle sorting
  const handleSort = (column: "name" | "company_name" | "created_at" | "status") => {
    console.log('[Audits Tab] Sort Requested:', {
      column,
      currentSortBy: sortBy,
      currentSortOrder: sortOrder,
      willToggle: sortBy === column,
      newSortOrder: sortBy === column ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'
    });
    
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
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
      const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/delete-multiple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ project_ids: [auditId], scope: 'self' }),
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

  // Handle audit created/updated
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
      // For audits, we'll use the project view link as the share link
      const shareUrl = `${window.location.origin}${audit.link}`;
      setShareLink(shareUrl);
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

  // Handle row click navigation
  const handleRowClick = (audit: Audit) => {
    router.push(`/create/audit-2-dynamic/${audit.id}`);
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
      {/* Header with Search and Create Button */}
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search Row */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
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
              // Navigate to create audit page
              window.location.href = 'https://dev4.contentbuilder.ai/custom-projects-ui/create/ai-audit/questionnaire';
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
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    {t('interface.name', 'Name')}
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('company_name')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    {t('interface.companyName', 'Company Name')}
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
                  {t('interface.actions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAudits.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <ClipboardCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium">{t('interface.noAudits', 'No audits found')}</p>
                    <p className="text-sm">{t('interface.createYourFirstAudit', 'Create your first audit to get started')}</p>
                  </td>
                </tr>
              ) : (
                sortedAudits.map((audit) => (
                  <tr 
                    key={audit.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(audit)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ClipboardCheck className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900">{audit.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(() => {
                        // [Audits Tab] Company Name Column Rendering Logging
                        console.log(`[Audits Tab] Rendering Company Name for Audit ${audit.id}:`, {
                          auditId: audit.id,
                          auditName: audit.name,
                          companyName: audit.company_name,
                          companyNameType: typeof audit.company_name,
                          isUnknownCompany: audit.company_name === 'Unknown Company',
                          fullAuditObject: audit
                        });
                        return audit.company_name;
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(audit.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Audit Modal */}
      {showEditModal && editingAudit && (
        <EditAuditModal
          audit={editingAudit}
          onClose={() => setShowEditModal(false)}
          onAuditUpdated={handleAuditSaved}
        />
      )}

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
                      {shareModalAudit.name}
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
                      <ClipboardCheck className="h-5 w-5 text-blue-600 mt-0.5" />
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

// Edit Audit Modal Component
interface EditAuditModalProps {
  audit: Audit;
  onClose: () => void;
  onAuditUpdated: () => void;
}

const EditAuditModal: React.FC<EditAuditModalProps> = ({ audit, onClose, onAuditUpdated }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: audit.name,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // For now, we'll just update the project name
      const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/update/${audit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          project_name: formData.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update audit');
      }

      onAuditUpdated();
    } catch (error) {
      console.error('Error updating audit:', error);
      setError(error instanceof Error ? error.message : 'Failed to update audit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('interface.editAudit', 'Edit Audit')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company field (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('interface.company', 'Company')}
              </label>
              <input
                type="text"
                value={audit.company_name}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            {/* Audit Name field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('interface.auditName', 'Audit Name')} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-sm font-medium">!</span>
                    </div>
                  </div>
                  <div className="text-sm text-red-800">
                    {error}
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {t('interface.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? t('interface.updating', 'Updating...') : t('interface.update', 'Update')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuditsTable;
