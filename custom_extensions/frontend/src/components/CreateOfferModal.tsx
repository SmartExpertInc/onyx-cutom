"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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

  // Helper function to calculate lesson data for a project (copied from ProjectsTable)
  const getLessonData = async (project: any) => {
    if (project.design_microproduct_type !== "Training Plan") {
      return { lessonCount: 0, totalHours: 0, completionTime: 0 };
    }

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      const devUserId = "dummy-onyx-user-id-for-testing";
      if (devUserId && process.env.NODE_ENV === "development") {
        headers["X-Dev-Onyx-User-ID"] = devUserId;
      }

      const response = await fetch(
        `${CUSTOM_BACKEND_URL}/projects/${project.id}/lesson-data`,
        {
          method: "GET",
          headers,
          credentials: "same-origin",
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          lessonCount: data.lessonCount || 0,
          totalHours: data.totalHours || 0,
          completionTime: data.completionTime || 0,
        };
      } else {
        console.error("Failed to fetch lesson data:", response.status);
        return { lessonCount: 0, totalHours: 0, completionTime: 0 };
      }
    } catch (error) {
      console.error("Error fetching lesson data:", error);
      return { lessonCount: 0, totalHours: 0, completionTime: 0 };
    }
  };

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
          // Calculate total hours using the same mechanism as ProjectsTable
          let totalHours = 0;

          for (const project of projects) {
            if (project.design_microproduct_type === "Training Plan") {
              const lessonData = await getLessonData(project);
              totalHours += lessonData.totalHours || 0;
            }
          }

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
              <span className="ml-2 text-black">{t('interface.loadingClients', 'Loading clients...')}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('interface.company', 'Company')} *
                </label>
                {selectedClient ? (
                  <Input
                    variant="shadow"
                    type="text"
                    value={selectedClient.name}
                    disabled
                    className="w-full px-4 py-3"
                  />
                ) : (
                  <Select
                    value={formData.company_id.toString()}
                    onValueChange={(value) => handleCompanyChange({ target: { value } } as any)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('interface.selectClient', 'Select a client...')} />
                    </SelectTrigger>
                    <SelectContent className='border border-gray-200 shadow-lg'>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id.toString()}>
                          {folder.name} {folder.project_count ? `(${folder.project_count} projects)` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Offer Name field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('interface.offerName', 'Offer Name')} *
                </label>
                <Input
                  variant="shadow"
                  type="text"
                  value={formData.offer_name}
                  onChange={(e) => setFormData({ ...formData, offer_name: e.target.value })}
                  className="w-full px-4 py-3"
                  placeholder={t('interface.enterOfferName', 'Enter offer name...')}
                  required
                />
              </div>

              {/* Manager field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('interface.manager', 'Manager')} *
                </label>
                <Input
                  variant="shadow"
                  type="text"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  className="w-full px-4 py-3"
                  placeholder={t('interface.enterManager', 'Enter manager name...')}
                  required
                />
              </div>

              {/* Status is always Draft for new offers - no dropdown needed */}

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
                <Button
                  variant="outline"
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3"
                  disabled={isSubmitting}
                >
                  {t('interface.cancel', 'Cancel')}
                </Button>
                <Button
                  variant="download"
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="flex-1 px-6 py-3"
                >
                  {isSubmitting ? t('interface.creating', 'Creating...') : t('interface.create', 'Create')}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateOfferModal; 