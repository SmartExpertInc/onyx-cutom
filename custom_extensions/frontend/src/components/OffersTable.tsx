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
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

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

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
    <div className="space-y-6">
      {/* Header with Title and Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('interface.offers', 'Offers')}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {offers.length} {offers.length === 1 ? t('interface.offer', 'offer') : t('interface.offers', 'offers')}
          </p>
        </div>
        <button
          onClick={() => {
            // Dispatch event to open create offer modal in parent component
            window.dispatchEvent(new CustomEvent('openCreateOfferModal', {
              detail: { folder: null }
            }));
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          {t('interface.createOffer', 'Create Offer')}
        </button>
      </div>

      {/* Search, Filter, and Actions Row */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={t('interface.searchOffers', 'Search offers...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-900"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex-shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            >
              <option value="" className="text-gray-900">{t('interface.allStatuses', 'All Statuses')}</option>
              <option value="Draft" className="text-gray-900">{t('interface.draft', 'Draft')}</option>
              <option value="Internal Review" className="text-gray-900">{t('interface.internalReview', 'Internal Review')}</option>
              <option value="Approved" className="text-gray-900">{t('interface.approved', 'Approved')}</option>
              <option value="Sent to Client" className="text-gray-900">{t('interface.sentToClient', 'Sent to Client')}</option>
              <option value="Viewed by Client" className="text-gray-900">{t('interface.viewedByClient', 'Viewed by Client')}</option>
              <option value="Negotiation" className="text-gray-900">{t('interface.negotiation', 'Negotiation')}</option>
              <option value="Accepted" className="text-gray-900">{t('interface.accepted', 'Accepted')}</option>
              <option value="Rejected" className="text-gray-900">{t('interface.rejected', 'Rejected')}</option>
              <option value="Archived" className="text-gray-900">{t('interface.archived', 'Archived')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('offer_name')}
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                  >
                    {t('interface.offerName', 'Offer Name')}
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('created_on')}
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                  >
                    {t('interface.createdOn', 'Created On')}
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('manager')}
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                  >
                    {t('interface.manager', 'Manager')}
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                  >
                    {t('interface.status', 'Status')}
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('total_hours')}
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                  >
                    {t('interface.totalHours', 'Total Hours')}
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {t('interface.link', 'Link')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
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
                    <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{offer.offer_name}</div>
                            <div className="text-sm text-gray-500">{offer.company_name}</div>
                          </div>
                        </div>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {offer.status}
                        </span>
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
    total_hours: offer.total_hours,
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
          total_hours: formData.total_hours,
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
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('interface.editOffer', 'Edit Offer')}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company field (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('interface.company', 'Company')}
              </label>
              <input
                type="text"
                value={offer.company_name}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>
            
            {/* Offer Name field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('interface.offerName', 'Offer Name')} *
              </label>
              <input
                type="text"
                value={formData.offer_name}
                onChange={(e) => setFormData({...formData, offer_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            {/* Manager field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('interface.manager', 'Manager')} *
              </label>
              <input
                type="text"
                value={formData.manager}
                onChange={(e) => setFormData({...formData, manager: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            {/* Status dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('interface.status', 'Status')} *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            </div>
            
            {/* Total Hours field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('interface.totalHours', 'Total Hours')}
              </label>
              <input
                type="number"
                min="0"
                value={formData.total_hours}
                onChange={(e) => setFormData({...formData, total_hours: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Link is auto-generated */}
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <p className="text-sm text-gray-700">
                <strong>📎 {t('interface.autoGeneratedLink', 'Auto-generated Link')}</strong>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {t('interface.linkIsAutoGenerated', 'The link to the offer details page is automatically managed.')}
              </p>
              {formData.link && (
                <a
                  href={formData.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline mt-2 block"
                >
                  {formData.link}
                </a>
              )}
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            
            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {t('interface.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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