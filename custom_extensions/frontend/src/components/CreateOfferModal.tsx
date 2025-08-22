"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface Folder {
  id: number;
  name: string;
  project_count?: number;
}

interface CreateOfferModalProps {
  onClose: () => void;
  onOfferCreated: () => void;
  selectedClient?: Folder;
}

const CreateOfferModal: React.FC<CreateOfferModalProps> = ({ onClose, onOfferCreated, selectedClient }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    company_id: selectedClient?.id || '',
    offer_name: '',
    manager: '',
    status: 'Draft',
    total_hours: 0,
    link: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

  // Fetch folders when modal opens
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/folders`, {
          credentials: 'same-origin',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch folders');
        }

        const foldersData = await response.json();
        setFolders(foldersData);
        setDataLoaded(true);
      } catch (error) {
        console.error('Error fetching folders:', error);
        setError('Failed to load clients');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFolders();
  }, [CUSTOM_BACKEND_URL]);

  // Update form data when selectedClient changes
  useEffect(() => {
    if (selectedClient?.id) {
      setFormData(prev => ({ ...prev, company_id: selectedClient.id }));
    }
  }, [selectedClient]);

  // Auto-calculate total hours when company is selected
  useEffect(() => {
    const calculateTotalHours = async () => {
      if (!formData.company_id) {
        setFormData(prev => ({ ...prev, total_hours: 0 }));
        return;
      }

      try {
        // Fetch projects for the selected company to calculate total hours
        const response = await fetch(`${CUSTOM_BACKEND_URL}/projects?folder_id=${formData.company_id}`, {
          credentials: 'same-origin',
        });

        if (response.ok) {
          const projects = await response.json();
          // Calculate total hours from all projects based on microproduct content
          const totalHours = projects.reduce((sum: number, project: any) => {
            let projectHours = 0;
            
            // Calculate hours from microproduct_content
            if (project.microproduct_content && project.microproduct_content.sections) {
              for (const section of project.microproduct_content.sections) {
                if (section.lessons) {
                  for (const lesson of section.lessons) {
                    // Add lesson hours if available
                    if (lesson.hours) {
                      projectHours += lesson.hours;
                    }
                  }
                }
              }
            }
            
            return sum + projectHours;
          }, 0);
          
          setFormData(prev => ({ ...prev, total_hours: totalHours }));
        }
      } catch (error) {
        console.error('Error calculating total hours:', error);
        // Don't show error for this optional calculation
      }
    };

    if (dataLoaded && formData.company_id) {
      calculateTotalHours();
    }
  }, [formData.company_id, dataLoaded, CUSTOM_BACKEND_URL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

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

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = e.target.value ? parseInt(e.target.value) : '';
    setFormData(prev => ({ ...prev, company_id: companyId }));
  };

  // Close modal on outside click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('interface.createOffer', 'Create Offer')}
          </h2>
          
          {isLoading && !dataLoaded ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">{t('interface.loadingClients', 'Loading clients...')}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Company dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('interface.company', 'Company')} *
                </label>
                {selectedClient ? (
                  <input
                    type="text"
                    value={selectedClient.name}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                ) : (
                  <select
                    value={formData.company_id}
                    onChange={handleCompanyChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">{t('interface.selectClient', 'Select a client...')}</option>
                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name} {folder.project_count ? `(${folder.project_count} projects)` : ''}
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
              
              {/* Total Hours field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('interface.totalHours', 'Total Hours')}
                  {formData.company_id && (
                    <span className="text-xs text-blue-600 ml-1">
                      ({t('interface.autoCalculated', 'auto-calculated')})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.total_hours}
                  onChange={(e) => setFormData({...formData, total_hours: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                {formData.company_id && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t('interface.totalHoursHelp', 'Total hours are automatically calculated based on projects in the selected client folder')}
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
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
                  {error}
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  {t('interface.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t('interface.creating', 'Creating...') : t('interface.create', 'Create')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateOfferModal; 