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
      {/* Page Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('interface.offers', 'Offers')}</h1>
          <p className="text-gray-600 mt-1">{t('interface.manageYourOffers', 'Manage and track your client offers')}</p>
        </div>
        <button
          onClick={() => {
            // Dispatch event to open create offer modal in parent component
            window.dispatchEvent(new CustomEvent('openCreateOfferModal', {
              detail: { folder: null }
            }));
          }}
          className="flex items-center gap-2 pl-4 pr-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#002864] via-[#003EA8] to-[#63A2FF] hover:opacity-90 active:scale-95 transition-all duration-200 shadow-lg"
        >
          <Plus size={16} className="text-white" />
          {t('interface.createOffer', 'Create Offer')}
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Section */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('interface.searchOffers', 'Search Offers')}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t('interface.searchPlaceholder', 'Search by offer name, company, or manager...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-colors"
              />
            </div>
          </div>

          {/* Filter Section */}
          <div className="lg:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('interface.filterByStatus', 'Filter by Status')}
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white appearance-none cursor-pointer transition-colors"
              >
                <option value="">{t('interface.allStatuses', 'All Statuses')}</option>
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
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {offers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {t('interface.showingResults', 'Showing')} <span className="font-medium text-gray-900">{offers.length}</span> {offers.length === 1 ? t('interface.offer', 'offer') : t('interface.offers', 'offers')}
              {statusFilter && (
                <span> {t('interface.withStatus', 'with status')} <span className="font-medium text-gray-900">"{statusFilter}"</span></span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('offer_name')}
                    className="flex items-center gap-2 hover:text-gray-900 transition-colors group"
                  >
                    <FileText className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                    {t('interface.offerName', 'Offer Name')}
                    <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('created_on')}
                    className="flex items-center gap-2 hover:text-gray-900 transition-colors group"
                  >
                    <Calendar className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                    {t('interface.createdOn', 'Created On')}
                    <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('manager')}
                    className="flex items-center gap-2 hover:text-gray-900 transition-colors group"
                  >
                    <User className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                    {t('interface.manager', 'Manager')}
                    <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-2 hover:text-gray-900 transition-colors group"
                  >
                    <CheckCircle className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                    {t('interface.status', 'Status')}
                    <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('total_hours')}
                    className="flex items-center gap-2 hover:text-gray-900 transition-colors group"
                  >
                    <Clock className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                    {t('interface.totalHours', 'Total Hours')}
                    <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                    {t('interface.link', 'Link')}
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center justify-end gap-2">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    {t('interface.actions', 'Actions')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedOffers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t('interface.noOffers', 'No offers found')}
                      </h3>
                      <p className="text-sm text-gray-500 mb-6">
                        {t('interface.createYourFirstOffer', 'Create your first offer to get started')}
                      </p>
                      <button
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('openCreateOfferModal', {
                            detail: { folder: null }
                          }));
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150"
                      >
                        <Plus className="h-4 w-4" />
                        {t('interface.createOffer', 'Create Offer')}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedOffers.map((offer) => {
                  const statusInfo = getStatusInfo(offer.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr key={offer.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{offer.offer_name}</div>
                            <div className="text-sm text-gray-500">{offer.company_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {formatDate(offer.created_on)}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          {offer.manager}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.color} border`}>
                          <StatusIcon className="h-3 w-3 mr-1.5" />
                          {offer.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-medium">{offer.total_hours}</span>
                          <span className="text-gray-500 ml-1">{t('interface.hours', 'hours')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
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
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-150"
                            >
                              <ExternalLink className="h-4 w-4" />
                              {t('interface.view', 'View')}
                            </a>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEditOffer(offer)}
                            className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                            title={t('interface.editOffer', 'Edit Offer')}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(offer.id)}
                            className="inline-flex items-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                            title={t('interface.deleteOffer', 'Delete Offer')}
                          >
                            <Trash2 className="h-4 w-4" />
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