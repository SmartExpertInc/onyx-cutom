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

interface Offer {
  id: number;
  onyx_user_id: string;
  company_id: number;
  offer_name: string;
  created_on: string;
  manager: string;
  status: string;
  total_hours: number;
  link: string | null;
  created_at: string;
  updated_at: string;
  company_name: string;
}

interface OffersTableProps {
  companyId?: number | null;
}

const OffersTable: React.FC<OffersTableProps> = ({ companyId }) => {
  const { t } = useLanguage();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"offer_name" | "created_on" | "manager" | "status" | "total_hours">("created_on");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [editingStatus, setEditingStatus] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [shareModalOffer, setShareModalOffer] = useState<Offer | null>(null);
  const [shareLink, setShareLink] = useState<string>("");
  const [generatingShareLink, setGeneratingShareLink] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

  // Fetch offers
  const fetchOffers = useCallback(async (search?: string) => {
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

      const response = await fetch(`${CUSTOM_BACKEND_URL}/offers?${params}`, {
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
        throw new Error(`Failed to fetch offers: ${response.status}`);
      }

      const data = await response.json();
      setOffers(data);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  }, [companyId, statusFilter, CUSTOM_BACKEND_URL]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOffers(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchOffers]);

  // Initial load and filter changes
  useEffect(() => {
    fetchOffers(searchTerm);
  }, [companyId, statusFilter]);

  // Update offer status
  const updateOfferStatus = async (offerId: number, newStatus: string) => {
    try {
      setUpdatingStatus(offerId);

      const response = await fetch(`${CUSTOM_BACKEND_URL}/offers/${offerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          offer_name: offers.find(o => o.id === offerId)?.offer_name,
          manager: offers.find(o => o.id === offerId)?.manager,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update offer status: ${response.status}`);
      }

      // Update local state
      setOffers(prevOffers =>
        prevOffers.map(offer =>
          offer.id === offerId
            ? { ...offer, status: newStatus }
            : offer
        )
      );

      setEditingStatus(null);
    } catch (error) {
      console.error('Error updating offer status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update offer status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Sort offers
  const sortedOffers = useMemo(() => {
    return [...offers].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'offer_name':
          aValue = a.offer_name.toLowerCase();
          bValue = b.offer_name.toLowerCase();
          break;
        case 'created_on':
          aValue = new Date(a.created_on);
          bValue = new Date(b.created_on);
          break;
        case 'manager':
          aValue = a.manager.toLowerCase();
          bValue = b.manager.toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'total_hours':
          aValue = a.total_hours;
          bValue = b.total_hours;
          break;
        default:
          aValue = a.created_on;
          bValue = b.created_on;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [offers, sortBy, sortOrder]);

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
      case 'Internal Review':
        return t('interface.internalReview', 'Internal Review');
      case 'Approved':
        return t('interface.approved', 'Approved');
      case 'Sent to Client':
        return t('interface.sentToClient', 'Sent to Client');
      case 'Viewed by Client':
        return t('interface.viewedByClient', 'Viewed by Client');
      case 'Negotiation':
        return t('interface.negotiation', 'Negotiation');
      case 'Accepted':
        return t('interface.accepted', 'Accepted');
      case 'Rejected':
        return t('interface.rejected', 'Rejected');
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
      case 'Internal Review':
        return { icon: Eye, color: 'text-blue-500', bgColor: 'bg-blue-100' };
      case 'Approved':
        return { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-100' };
      case 'Sent to Client':
        return { icon: Send, color: 'text-purple-500', bgColor: 'bg-purple-100' };
      case 'Viewed by Client':
        return { icon: Eye, color: 'text-orange-500', bgColor: 'bg-orange-100' };
      case 'Negotiation':
        return { icon: MessageSquare, color: 'text-yellow-500', bgColor: 'bg-yellow-100' };
      case 'Accepted':
        return { icon: ThumbsUp, color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'Rejected':
        return { icon: ThumbsDown, color: 'text-red-500', bgColor: 'bg-red-100' };
      case 'Archived':
        return { icon: Archive, color: 'text-gray-400', bgColor: 'bg-gray-100' };
      default:
        return { icon: AlertCircle, color: 'text-gray-500', bgColor: 'bg-gray-100' };
    }
  };

  // Format date with locale awareness
  const formatDate = (dateString: string) => {
    // Get the current language from context
    const locale = t('interface.locale', 'en-US'); // Add locale to translations
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle delete offer
  const handleDeleteOffer = async (offerId: number) => {
    if (!confirm(t('interface.deleteOfferConfirmation', 'Are you sure you want to delete this offer? This action cannot be undone.'))) {
      return;
    }

    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/offers/${offerId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete offer: ${response.status}`);
      }

      // Refresh offers
      fetchOffers(searchTerm);
    } catch (error) {
      console.error('Error deleting offer:', error);
      alert(t('interface.deleteOfferError', 'Failed to delete offer'));
    }
  };

  // Handle edit offer
  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setShowEditModal(true);
  };

  // Handle offer created/updated
  const handleOfferSaved = () => {
    setShowEditModal(false);
    setEditingOffer(null);
    fetchOffers(searchTerm);
  };

  // Handle share offer
  const handleShareOffer = async (offer: Offer) => {
    setShareModalOffer(offer);
    setGeneratingShareLink(true);
    setShareLink("");
    setCopySuccess(false);

    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/offers/${offer.id}/generate-share-link`, {
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
            onClick={() => fetchOffers(searchTerm)}
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
      <div className="px-6 py-4">
        <div className="flex flex-col gap-4">
          {/* Search and Filter Row */}
          <div className="flex items-center gap-4 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                variant="shadow"
                type="text"
                placeholder={t('interface.searchOffers', 'Search offers...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
            </div>
          </div>

          {/* Create Button */}
          <Button
            variant="download"
            onClick={() => {
              // Dispatch event to open create offer modal in parent component
              window.dispatchEvent(new CustomEvent('openCreateOfferModal', {
                detail: { folder: null }
              }));
            }}
            className="flex items-center gap-2 px-4 py-2 whitespace-nowrap"
          >
            <Plus size={16} />
            {t('interface.createOffer', 'Create Offer')}
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
                    onClick={() => handleSort('offer_name')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    {t('interface.offer', 'Offer')}
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('offer_name')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    {t('interface.name', 'Name')}
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('created_on')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    {t('interface.createdOn', 'Created On')}
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('manager')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    {t('interface.manager', 'Manager')}
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    {t('interface.status', 'Status')}
                    <ArrowUpDown size={12} />
                  </button>
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('total_hours')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    {t('interface.totalHours', 'Total Hours')}
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
              {sortedOffers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium">{t('interface.noOffers', 'No offers found')}</p>
                    <p className="text-sm">{t('interface.createYourFirstOffer', 'Create your first offer to get started')}</p>
                  </td>
                </tr>
              ) : (
                sortedOffers.map((offer) => {
                  const statusInfo = getStatusInfo(offer.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={offer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building className="h-5 w-5 text-gray-400 mr-3" />
                          <div className="text-sm font-medium text-gray-900">{offer.offer_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="text-sm text-gray-500">{offer.company_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(offer.created_on)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          {offer.manager}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          {offer.total_hours} {t('interface.hours', 'hours')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(() => {
                          // Debug logging
                          console.log(`Offer ${offer.id} link:`, offer.link, 'Type:', typeof offer.link);

                          // Always show View link - use stored link or generate one
                          const viewLink = offer.link || `/custom-projects-ui/offer/${offer.id}`;

                          return (
                            <a
                              href={viewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              {t('interface.view', 'View')}
                            </a>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleShareOffer(offer)}
                            className="text-green-600 hover:text-green-900"
                            title={t('interface.shareOffer', 'Share Offer')}
                          >
                            <Share2 size={16} />
                          </button>
                          <button
                            onClick={() => handleEditOffer(offer)}
                            className="text-blue-600 hover:text-blue-900"
                            title={t('interface.editOffer', 'Edit Offer')}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(offer.id)}
                            className="text-red-600 hover:text-red-900"
                            title={t('interface.deleteOffer', 'Delete Offer')}
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



      {/* Edit Offer Modal */}
      {showEditModal && editingOffer && (
        <EditOfferModal
          offer={editingOffer}
          onClose={() => setShowEditModal(false)}
          onOfferUpdated={handleOfferSaved}
        />
      )}

      {/* Share Offer Modal */}
      {shareModalOffer && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShareModalOffer(null)}
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
                      {t('interface.shareOffer', 'Share Offer')}
                    </h2>
                    <p className="text-sm text-black/70 mt-1">
                      {shareModalOffer.offer_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShareModalOffer(null)}
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
                        {t('interface.shareOfferDescription', 'Share this offer with anyone, even those without an account')}
                      </p>
                      <p className="text-xs text-black/70 mt-1">
                        {t('interface.shareOfferSubtext', 'Recipients can view the full offer details without creating an account')}
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
                  onClick={() => setShareModalOffer(null)}
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



// Edit Offer Modal Component
interface EditOfferModalProps {
  offer: Offer;
  onClose: () => void;
  onOfferUpdated: () => void;
}

const EditOfferModal: React.FC<EditOfferModalProps> = ({ offer, onClose, onOfferUpdated }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    offer_name: offer.offer_name,
    manager: offer.manager,
    status: offer.status,
    created_on: offer.created_on,
    link: offer.link || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/offers/${offer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          offer_name: formData.offer_name,
          manager: formData.manager,
          status: formData.status,
          created_on: formData.created_on,
          // Don't include link as it's auto-generated
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update offer');
      }

      onOfferUpdated();
    } catch (error) {
      console.error('Error updating offer:', error);
      setError(error instanceof Error ? error.message : 'Failed to update offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('interface.editOffer', 'Edit Offer')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company field (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('interface.company', 'Company')}
              </label>
              <input
                type="text"
                value={offer.company_name}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            {/* Offer Name field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('interface.offerName', 'Offer Name')} *
              </label>
              <input
                type="text"
                value={formData.offer_name}
                onChange={(e) => setFormData({ ...formData, offer_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
              />
            </div>

            {/* Manager field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('interface.manager', 'Manager')} *
              </label>
              <input
                type="text"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
              />
            </div>

            {/* Date field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('interface.date', 'Date')} *
              </label>
              <input
                type="date"
                value={formData.created_on.split('T')[0]}
                onChange={(e) => setFormData({ ...formData, created_on: e.target.value + 'T00:00:00' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
              />
            </div>

            {/* Status dropdown */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('interface.status', 'Status')} *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                required
              >
                <option value="Draft">{t('interface.draft', 'Draft')}</option>
                <option value="Internal Review">{t('interface.internalReview', 'Internal Review')}</option>
                <option value="Approved">{t('interface.approved', 'Approved')}</option>
                <option value="Sent to Client">{t('interface.sentToClient', 'Sent to Client')}</option>
                <option value="Viewed by Client">{t('interface.viewedByClient', 'Viewed by Client')}</option>
                <option value="Negotiation">{t('interface.negotiation', 'Negotiation')}</option>
                <option value="Accepted">{t('interface.accepted', 'Accepted')}</option>
                <option value="Rejected">{t('interface.rejected', 'Rejected')}</option>
                <option value="Archived">{t('interface.archived', 'Archived')}</option>
              </select>
            </div> */}

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

export default OffersTable; 