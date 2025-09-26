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

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<{
    shareToken: string;
    publicUrl: string;
    expiresAt: string;
  } | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [selectedAuditForShare, setSelectedAuditForShare] = useState<Audit | null>(null);
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
      
      // Filter for audit projects only using dedicated microproduct_type
      const filterCriteria = {
        microproductType: 'AI Audit'
      };
      
      console.log('[Audits Tab] Filter Criteria:', filterCriteria);
      
      const auditProjects = data.filter((project: any) => {
        // Use the dedicated microproduct_type for audits
        const isAudit = project.microproduct_type === 'AI Audit';
        
        // Log individual filter decisions
        console.log(`[Audits Tab] Filter Decision for Project ${project.id} (${project.projectName}):`, {
          projectName: project.projectName,
          microproductType: project.microproduct_type,
          isAudit,
          finalDecision: isAudit,
          reason: isAudit ? 'Matches AI Audit microproduct_type' : 'Does not match audit criteria'
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
          
          // FALLBACK: Extract company name from project name for AI audit landing pages
          if (project.projectName && project.projectName.includes('AI-Аудит Landing Page:')) {
            const extractedCompanyName = project.projectName.replace('AI-Аудит Landing Page:', '').trim();
            if (extractedCompanyName && extractedCompanyName !== 'Company Name') {
              companyName = extractedCompanyName;
              companyNameSource = 'projectName.extracted';
              console.log(`[Audits Tab] Company Name Extracted from Project Name - Project ${project.id}:`, {
                originalProjectName: project.projectName,
                extractedCompanyName,
                companyNameSource
              });
            } else {
              console.log(`[Audits Tab] Company Name Extraction from Project Name Failed - Project ${project.id}:`, {
                originalProjectName: project.projectName,
                extractedCompanyName,
                reason: 'Extracted name is empty or placeholder'
              });
            }
          }
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

  // Share functionality - replicated from audit landing page
  const handleShareAudit = (audit: Audit) => {
    console.log('[Audits Tab] Share Audit Requested:', { audit });
    setSelectedAuditForShare(audit);
    setShowShareModal(true);
    setShareData(null);
    setShareError(null);
  };

  const handleShare = async () => {
    if (!selectedAuditForShare) return;
    
    setIsSharing(true);
    setShareError(null);
    
    try {
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";
      const response = await fetch(`${CUSTOM_BACKEND_URL}/audits/${selectedAuditForShare.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expires_in_days: 30 // Default 30 days
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Failed to share audit: ${response.status}`);
      }

      const data = await response.json();
      setShareData({
        shareToken: data.share_token,
        publicUrl: data.public_url,
        expiresAt: data.expires_at
      });
      
      console.log('✅ [Audits Tab] Successfully created share link:', data.public_url);
      
    } catch (error: any) {
      console.error('❌ [Audits Tab] Error sharing audit:', error);
      setShareError(error.message || 'Failed to create share link');
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('✅ [Audits Tab] Link copied to clipboard');
    } catch (error) {
      console.error('❌ [Audits Tab] Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      console.log('✅ [Audits Tab] Link copied to clipboard (fallback)');
    }
  };

  // Handle edit audit
  const handleEditAudit = (audit: Audit) => {
    console.log('[Audits Tab] Edit Audit Requested:', { audit });
    setEditingAudit(audit);
    setShowEditModal(true);
  };

  // Handle audit created/updated
  const handleAuditSaved = () => {
    setShowEditModal(false);
    setEditingAudit(null);
    fetchAudits(searchTerm);
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

      {/* Share Modal - Replicated from audit landing page */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            {/* Close button */}
            <button
              onClick={() => {
                setShowShareModal(false);
                setShareData(null);
                setShareError(null);
                setSelectedAuditForShare(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal content */}
            <div className="pr-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('interface.shareAudit', 'Share Audit')}
              </h3>

              {!shareData ? (
                <div>
                  <p className="text-gray-600 mb-6">
                    {t('interface.shareAuditDescription', 'Create a public link to share this audit with others. The link will expire in 30 days.')}
                  </p>

                  {shareError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                      <p className="text-red-800 text-sm">{shareError}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowShareModal(false);
                        setShareError(null);
                        setSelectedAuditForShare(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {t('interface.cancel', 'Cancel')}
                    </button>
                    <button
                      onClick={handleShare}
                      disabled={isSharing}
                      className="flex-1 px-4 py-2 bg-[#0F58F9] text-white rounded-md hover:bg-[#0F58F9]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {isSharing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('interface.creating', 'Creating...')}
                        </>
                      ) : (
                        t('interface.createShareLink', 'Create Share Link')
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={shareData.publicUrl}
                        readOnly
                        className="flex-1 bg-transparent text-sm text-gray-800 outline-none"
                      />
                      <button
                        onClick={() => copyToClipboard(shareData.publicUrl)}
                        className="px-3 py-1 text-xs bg-[#0F58F9] text-white rounded hover:bg-[#0F58F9]/90 transition-colors"
                        title={t('interface.copyToClipboard', 'Copy to clipboard')}
                      >
                        {t('interface.copy', 'Copy')}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mb-6">
                    {t('interface.linkExpiresOn', `Link expires on: ${new Date(shareData.expiresAt).toLocaleDateString()}`)}
                  </p>

                  <button
                    onClick={() => {
                      setShowShareModal(false);
                      setShareData(null);
                      setSelectedAuditForShare(null);
                    }}
                    className="w-full px-4 py-2 bg-[#0F58F9] text-white rounded-md hover:bg-[#0F58F9]/90 transition-colors"
                  >
                    {t('interface.close', 'Close')}
                  </button>
                </div>
              )}
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
          projectName: formData.name,
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
