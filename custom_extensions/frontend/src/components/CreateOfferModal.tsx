"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";

interface CreateOfferModalProps {
  open: boolean;
  onClose: () => void;
  onOfferCreated: () => void;
  selectedClient?: any;
  folders?: any[];
}

const CreateOfferModal: React.FC<CreateOfferModalProps> = ({ 
  open,
  onClose, 
  onOfferCreated, 
  selectedClient,
  folders = []
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    company_id: 0,
    offer_name: '',
    manager: '',
    status: 'Draft',
    total_hours: 0,
    link: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientProjects, setClientProjects] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

  // Ensure component only renders after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render if not open or not mounted (prevents hydration errors)
  if (!open || !isMounted) return null;

  // Update form data when selectedClient changes
  useEffect(() => {
    if (selectedClient?.id) {
      setFormData(prev => ({ ...prev, company_id: selectedClient.id }));
      fetchClientProjects(selectedClient.id);
    }
  }, [selectedClient]);

  // Initialize company_id from selectedClient on mount
  useEffect(() => {
    if (selectedClient?.id && formData.company_id === 0) {
      setFormData(prev => ({ ...prev, company_id: selectedClient.id }));
    }
  }, [selectedClient, formData.company_id]);

  // Fetch client projects when company_id changes
  useEffect(() => {
    if (formData.company_id && !selectedClient) {
      fetchClientProjects(formData.company_id);
    }
  }, [formData.company_id, selectedClient]);

  const fetchClientProjects = async (clientId: number) => {
    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/projects?folder_id=${clientId}`, {
        credentials: 'same-origin',
      });

      if (response.ok) {
        const projects = await response.json();
        setClientProjects(projects);
        
        // Calculate total hours from projects
        const totalHours = projects.reduce((sum: number, project: any) => {
          if (project.microproduct_content && project.microproduct_content.sections) {
            return sum + project.microproduct_content.sections.reduce((sectionSum: number, section: any) => {
              return sectionSum + (section.totalHours || 0);
            }, 0);
          }
          return sum;
        }, 0);
        
        setFormData(prev => ({ ...prev, total_hours: totalHours }));
      }
    } catch (error) {
      console.error('Error fetching client projects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate required fields
    if (!formData.company_id || !formData.offer_name || !formData.manager) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${CUSTOM_BACKEND_URL}/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create offer');
      }

      onOfferCreated();
    } catch (error) {
      console.error('Error creating offer:', error);
      setError(error instanceof Error ? error.message : 'Failed to create offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompanyChange = (companyId: string) => {
    setFormData(prev => ({ ...prev, company_id: parseInt(companyId) }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('interface.createOffer', 'Create Offer')}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company field - dropdown if no selected client, otherwise pre-filled */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('interface.company', 'Company')} *
              </label>
              {selectedClient ? (
                              <input
                type="text"
                value={selectedClient.name}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-black"
              />
              ) : (
                <select
                  value={formData.company_id}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value={0}>{t('interface.selectCompany', 'Select company...')}</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              )}
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
                placeholder={t('interface.enterOfferName', 'Enter offer name...')}
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
                placeholder={t('interface.enterManager', 'Enter manager name...')}
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
            
            {/* Total Hours field - auto-calculated but editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('interface.totalHours', 'Total Hours')} (Auto-calculated)
              </label>
              <input
                type="number"
                min="0"
                value={formData.total_hours}
                onChange={(e) => setFormData({...formData, total_hours: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
              {clientProjects.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {t('interface.calculatedFromProjects', `Calculated from ${clientProjects.length} projects`)}
                </p>
              )}
            </div>
            
            {/* Link field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('interface.link', 'Link')}
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({...formData, link: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://..."
              />
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
                {isSubmitting ? t('interface.creating', 'Creating...') : t('interface.create', 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOfferModal; 