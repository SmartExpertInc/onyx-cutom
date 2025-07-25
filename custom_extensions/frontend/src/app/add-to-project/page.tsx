// custom_extensions/frontend/src/app/add-to-project/page.tsx
"use client";

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DesignTemplateResponse } from '@/types/designTemplates';
import { useLanguage } from '../../contexts/LanguageContext';
// import { ProjectApiResponse } from '@/types/projectSpecificTypes'; // Not strictly needed if only fetching names as string[]

const CUSTOM_API_BASE_URL = '/api/custom-projects-backend';
const CUSTOM_BACKEND_ROOT_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_ROOT_URL || '';

// Helper to construct full image URL
const getFullImagePath = (imagePath?: string | null) => {
  if (!imagePath) {
    return '/images/placeholder-image.png'; // Provide a path to a default placeholder
  }
  if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
    return imagePath;
  }
  return `${CUSTOM_BACKEND_ROOT_URL}${imagePath}`;
};

const AddToProjectPageComponent = () => {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Product (Design Template) States
  const [designTemplates, setDesignTemplates] = useState<DesignTemplateResponse[]>([]);
  const [selectedDesignTemplateId, setSelectedDesignTemplateId] = useState<string>('');
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  // Project States
  const [existingProjectNames, setExistingProjectNames] = useState<string[]>([]);
  const [isLoadingProjectNames, setIsLoadingProjectNames] = useState(false);
  const [selectedProjectOption, setSelectedProjectOption] = useState<string>('');
  const [newProjectNameInput, setNewProjectNameInput] = useState('');

  // Instance States
  const [instanceNameInput, setInstanceNameInput] = useState(''); // Initialized as empty
  const [aiResponse, setAiResponse] = useState('');

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdvancedSectionOpen, setIsAdvancedSectionOpen] = useState(false); // For collapsible
  const [error, setError] = useState<string | null>(null);

  const selectedTemplate = useMemo(() => {
    return designTemplates.find(dt => dt.id.toString() === selectedDesignTemplateId);
  }, [selectedDesignTemplateId, designTemplates]);

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoadingTemplates(true);
      setError(null);
      try {
        const response = await fetch(`${CUSTOM_API_BASE_URL}/design_templates`);
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to fetch design templates: ${response.status} ${errorData}`);
        }
        const data: DesignTemplateResponse[] = await response.json();
        setDesignTemplates(data);
      } catch (err) {
        console.error("Error fetching design templates:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred while fetching templates.");
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedDesignTemplateId) {
      const fetchProjectNames = async () => {
        setIsLoadingProjectNames(true);
        setError(null);
        try {
          const headers: HeadersInit = { 'Content-Type': 'application/json' };
          const devUserId = "dummy-onyx-user-id-for-testing";
          if (devUserId && process.env.NODE_ENV === 'development') {
            headers['X-Dev-Onyx-User-ID'] = devUserId;
          }

          const response = await fetch(`${CUSTOM_API_BASE_URL}/projects/names`, { headers });
          if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Failed to fetch project names: ${response.status} ${errorData}`);
          }
          const data: string[] = await response.json();
          setExistingProjectNames(data);
        } catch (err) {
          console.error("Error fetching project names:", err);
          setError(err instanceof Error ? err.message : "An unknown error occurred while fetching project names.");
          setExistingProjectNames([]);
        } finally {
          setIsLoadingProjectNames(false);
        }
      };
      fetchProjectNames();
    } else {
      setExistingProjectNames([]);
      setSelectedProjectOption('');
      setNewProjectNameInput('');
    }
  }, [selectedDesignTemplateId]);

  useEffect(() => {
    const responseKey = searchParams?.get('responseKey');
    if (responseKey) {
      try {
        const storedResponse = sessionStorage.getItem(decodeURIComponent(responseKey));
        if (storedResponse !== null) {
          setAiResponse(storedResponse); // Store the full AI response

          // ---- MODIFIED LOGIC TO EXTRACT TITLE AND SET INSTANCE NAME ----
          if (storedResponse.trim() !== '') {
            const newlineIndex = storedResponse.indexOf('\n');
            if (newlineIndex !== -1) { // Check if a newline character exists
              const extractedTitle = storedResponse.substring(0, newlineIndex).trim();
              if (extractedTitle) { // Ensure the extracted title is not just whitespace
                setInstanceNameInput(extractedTitle);
              }
              // If extractedTitle is empty after trimming, instanceNameInput remains empty here (from its useState default or previous reset),
              // allowing it to fallback to product name later if user doesn't input anything.
            } else {
              // Optional: if no newline, you could decide to use the whole storedResponse as title.
              // For example:
              // const singleLineTitle = storedResponse.trim();
              // if (singleLineTitle) {
              //   setInstanceNameInput(singleLineTitle);
              // }
              // If you want to strictly adhere to "text before first newline", do nothing here.
            }
          }
          // ---- END OF MODIFIED LOGIC ----

        } else {
          console.warn("AI response key found, but no data in sessionStorage.");
          // setInstanceNameInput(''); // Explicitly clear if needed, though reset on template change might cover this
        }
      } catch (e) {
        console.error("Error reading from sessionStorage or parsing title:", e);
        setAiResponse("Error: Could not retrieve AI response.");
        // setInstanceNameInput(''); // Explicitly clear on error if needed
      }
    } else {
        // No responseKey found in URL, so no AI response to get a title from.
        // setInstanceNameInput(''); // Explicitly clear if needed
    }
  }, [searchParams]); // Dependency array correctly remains [searchParams]

  const handleSubmit = async () => {
    if (!selectedDesignTemplateId) {
      alert("Please select a Product first.");
      return;
    }

    let finalProjectName = '';
    if (selectedProjectOption === "CREATE_NEW_PROJECT") {
      if (!newProjectNameInput.trim()) {
        alert("Please enter a name for the new project.");
        return;
      }
      finalProjectName = newProjectNameInput.trim();
    } else if (selectedProjectOption) {
      finalProjectName = selectedProjectOption;
    } else {
      alert("Please select an existing project or create a new one.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const selectedTemplateName = selectedTemplate?.template_name || 'Default MicroProduct Name';
    // Logic for finalInstanceName: user input OR selected product name OR (if product name also blank) the project name.
    // This logic remains the same and correctly uses the pre-filled instanceNameInput if available.
    const finalInstanceName = instanceNameInput.trim() || selectedTemplateName || finalProjectName;


    const payload = {
      projectName: finalProjectName,
      design_template_id: parseInt(selectedDesignTemplateId, 10),
      microProductName: finalInstanceName,
      aiResponse, // The full AI response is sent
    };

    const API_ENDPOINT = `${CUSTOM_API_BASE_URL}/projects/add`;

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const devUserId = "dummy-onyx-user-id-for-testing";
      if (devUserId && process.env.NODE_ENV === 'development') {
        headers['X-Dev-Onyx-User-ID'] = devUserId;
      }

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Submission error details:', errorData);
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      await response.json(); // Assuming the successful response might also be JSON
      router.push('/projects'); // Navigate to projects page on success
    } catch (err) {
      console.error('Failed to submit project:', err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during submission.");
      alert(`Error while adding the Project: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = selectedDesignTemplateId &&
                    ( (selectedProjectOption && selectedProjectOption !== "CREATE_NEW_PROJECT") ||
                      (selectedProjectOption === "CREATE_NEW_PROJECT" && newProjectNameInput.trim() !== '') );

  return (
    <main className="p-4 md:p-8 bg-gray-100 min-h-screen font-['Inter',_sans-serif]">
      <div className="max-w-6xl mx-auto bg-white p-6 md:p-10 shadow-xl rounded-xl border border-gray-200">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">{t('interface.addToProject.title', 'Create New Product Instance')}</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">{t('interface.addToProject.error', 'Error')}: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">{t('interface.addToProject.selectProductType', '1. Select Product Type')}</h2>
          {isLoadingTemplates ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="bg-gray-200 h-48 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : designTemplates.length === 0 ? (
            <p className="text-gray-500">{t('interface.addToProject.noProductTypes', 'No product types available. Please add some design templates in the admin panel.')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {designTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedDesignTemplateId(template.id.toString());
                    setSelectedProjectOption('');
                    setNewProjectNameInput('');
                    setInstanceNameInput(''); // Reset instance name when product type changes
                  }}
                  className={`
                    relative border-2 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${selectedDesignTemplateId === template.id.toString()
                      ? 'border-blue-600 ring-2 ring-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400 bg-white'
                    }
                  `}
                >
                  <img
                    src={getFullImagePath(template.design_image_path)}
                    alt={template.template_name}
                    className="w-full h-32 object-contain mb-3 rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder-image.png';
                      (e.target as HTMLImageElement).alt = 'Placeholder Image';
                    }}
                  />
                  <h3 className="text-md font-semibold text-gray-800 text-center truncate" title={template.template_name}>
                    {template.template_name}
                  </h3>
                  
                  {selectedDesignTemplateId === template.id.toString() && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-0.5"> {/* Adjusted padding for smaller icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"> {/* Adjusted size */}
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {selectedDesignTemplateId && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">{t('interface.addToProject.configureProject', '2. Configure Project')}</h2>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
              <div>
                <label htmlFor="projectSelection" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('interface.addToProject.addToProject', 'Add to Project:')}
                </label>
                <select
                  id="projectSelection"
                  value={selectedProjectOption}
                  onChange={(e) => {
                    setSelectedProjectOption(e.target.value);
                    if (e.target.value !== "CREATE_NEW_PROJECT") {
                      setNewProjectNameInput('');
                    }
                  }}
                  className="block w-full p-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-900"
                  disabled={isLoadingProjectNames}
                >
                  <option value="">{t('interface.addToProject.selectOrCreateProject', '-- Select or Create Project --')}</option>
                  {isLoadingProjectNames ? (
                    <option disabled>{t('interface.addToProject.loadingProjects', 'Loading projects...')}</option>
                  ) : (
                    existingProjectNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))
                  )}
                  <option value="CREATE_NEW_PROJECT">{t('interface.addToProject.createNewProject', '--- Create New Project ---')}</option>
                </select>
              </div>

              {selectedProjectOption === "CREATE_NEW_PROJECT" && (
                <div>
                  <label htmlFor="newProjectName" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('interface.addToProject.newProjectName', 'New Project Name:')}
                  </label>
                  <input
                    type="text"
                    id="newProjectName"
                    value={newProjectNameInput}
                    onChange={(e) => setNewProjectNameInput(e.target.value)}
                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                    placeholder={t('interface.addToProject.enterNewProjectName', 'Enter name for the new project')}
                  />
                </div>
              )}

              {/* Simple Collapsible Section for Advanced Options */}
              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => setIsAdvancedSectionOpen(!isAdvancedSectionOpen)}
                  className="flex justify-between items-center w-full text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none"
                >
                  <span>{t('interface.addToProject.advancedOptions', 'Advanced Options')}</span>
                  <svg
                    className={`w-5 h-5 transform transition-transform duration-200 ${
                      isAdvancedSectionOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {isAdvancedSectionOpen && (
                  <div className="mt-3 p-4 bg-white border rounded-md shadow-sm">
                    <label htmlFor="instanceNameInput" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('interface.addToProject.instanceName', 'Instance Name (Optional):')}
                    </label>
                    <input
                      type="text"
                      id="instanceNameInput"
                      value={instanceNameInput} // Value is now managed by state, including auto-fill
                      onChange={(e) => setInstanceNameInput(e.target.value)}
                      className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                      placeholder={t('interface.addToProject.instanceNamePlaceholder', 'Defaults to "{name}" or AI response title').replace('{name}', selectedTemplate?.template_name || 'Product Name')}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {t('interface.addToProject.instanceNameHelp', 'If left blank, the Product\'s name (or AI title) will be used.')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {selectedDesignTemplateId && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('interface.addToProject.creating', 'Creating...')}
                </div>
              ) : t('interface.addToProject.createProductInstance', 'Create Product Instance')}
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default function AddToProjectPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="p-8 text-center font-['Inter',_sans-serif] text-lg">{t('interface.addToProject.loadingPageDetails', 'Loading page details...')}</div>}>
      <AddToProjectPageComponent />
    </Suspense>
  );
}
