"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EventPoster from "../components/EventPoster";
import { useLanguage } from '../../../../contexts/LanguageContext';

function EventPosterResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  // State for event data
  const [eventData, setEventData] = useState({
    eventName: '',
    mainSpeaker: '',
    speakerDescription: '',
    date: '',
    topic: '',
    additionalSpeakers: '',
    ticketPrice: '',
    ticketType: '',
    freeAccessConditions: '',
    speakerImage: null as string | null
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Get session key from URL
    const sessionKey = searchParams?.get('sessionKey');
    
    if (!sessionKey) {
      console.error('No session key found in URL');
      router.push('/create/event-poster/questionnaire');
      return;
    }

    // Get data from localStorage using the session key
    const savedData = localStorage.getItem(sessionKey);
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log('Event poster data loaded:', parsedData);
        setEventData(parsedData);
        
        // Clean up localStorage after loading (with small delay to ensure data is used)
        setTimeout(() => {
          localStorage.removeItem(sessionKey);
        }, 1000);
        
      } catch (error) {
        console.error('Failed to parse event data from localStorage:', error);
        router.push('/create/event-poster/questionnaire');
      }
    } else {
      console.error('No data found for session key:', sessionKey);
      router.push('/create/event-poster/questionnaire');
    }
    
    setIsLoading(false);
  }, [router, searchParams]);

  const handleBackToQuestionnaire = () => {
    router.push('/create/event-poster/questionnaire');
  };

  const handleBackToProjects = () => {
    router.push('/projects');
  };

  const handleSuccess = (message: string) => {
    console.log('✅ Poster download success:', message);
  };

  const handleError = (error: string) => {
    console.error('❌ Poster download error:', error);
  };

  const handleSaveAsProduct = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
      const devUserId = "dummy-onyx-user-id-for-testing";
      
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (devUserId && process.env.NODE_ENV === 'development') {
        headers['X-Dev-Onyx-User-ID'] = devUserId;
      }

      // Get design template
      let templateId = null;
      
      try {
        // First try to get available templates
        const templatesResponse = await fetch(`${CUSTOM_BACKEND_URL}/design_templates`, {
          headers,
          credentials: 'same-origin',
        });
        
        if (templatesResponse.ok) {
          const templates = await templatesResponse.json();
          console.log('📋 Available templates:', templates);
          
          // First preference: Event Poster template
          const eventPosterTemplate = templates.find((t: any) => 
            t.template_name === 'Event Poster' || 
            t.component_name === 'EventPosterDisplay' ||
            t.template_name?.toLowerCase().includes('event poster')
          );
          
          if (eventPosterTemplate) {
            templateId = eventPosterTemplate.id;
            console.log('✅ Found Event Poster template:', templateId);
          } else {
            // Fallback: Use Text Presentation or any available template
            const fallbackTemplate = templates.find((t: any) => 
              t.template_name === 'Text Presentation Template' ||
              t.component_name === 'TextPresentationDisplay'
            ) || templates[0]; // Use first available template
            
            if (fallbackTemplate) {
              templateId = fallbackTemplate.id;
              console.log('📝 Using fallback template:', fallbackTemplate.template_name, 'ID:', templateId);
            }
          }
        } else {
          console.error('❌ Failed to fetch templates:', templatesResponse.status);
        }
      } catch (e) {
        console.error('❌ Error fetching templates:', e);
      }
      
      // Final fallback - this should not happen in a working system
      if (!templateId) {
        console.warn('⚠️ No templates found, this will likely fail');
        templateId = 1;
      }

      // Prepare event data without the large image for the main payload
      const eventDataForSaving = {
        ...eventData,
        speakerImage: eventData.speakerImage ? 'custom_image_provided' : null // Flag that image was provided
      };

      // Create the project data
      const projectData = {
        projectName: eventData.eventName || 'Event Poster',
        design_template_id: templateId,
        microProductName: 'Event Poster',
        aiResponse: JSON.stringify(eventDataForSaving), // Send data without large base64
        chatSessionId: null,
        outlineId: null,
        folder_id: null,
        theme: null,
        source_context_type: 'manual',
        source_context_data: { 
          type: 'event_poster',
          has_custom_image: !!eventData.speakerImage
        }
      };

      console.log('🚀 Saving poster with data (image size):', {
        ...projectData,
        aiResponse: `${projectData.aiResponse.length} characters`,
        imageSize: eventData.speakerImage ? `${eventData.speakerImage.length} characters` : 'No image'
      });

      const response = await fetch(`${CUSTOM_BACKEND_URL}/projects/add`, {
        method: 'POST',
        headers,
        body: JSON.stringify(projectData),
        credentials: 'same-origin',
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('❌ Response error (JSON):', errorData);
        } catch {
          errorData = await response.text();
          console.error('❌ Response error (Text):', errorData);
        }
        
        // Show detailed error for debugging
        const errorMessage = typeof errorData === 'object' && errorData.detail 
          ? errorData.detail 
          : typeof errorData === 'string' 
            ? errorData 
            : 'Unknown error';
            
        throw new Error(`Failed to save poster (${response.status}): ${errorMessage}`);
      }

      const result = await response.json();
      console.log('✅ Poster saved as product:', result);

      // If there's a custom image, store it separately for this project
      if (eventData.speakerImage && result.id) {
        try {
          localStorage.setItem(`poster_image_${result.id}`, eventData.speakerImage);
          console.log('📸 Custom image stored for project:', result.id);
        } catch (e) {
          console.warn('⚠️ Could not store custom image:', e);
        }
      }
      
      // Show success message and redirect to projects page
      alert(t('interface.eventPosterForm.savedSuccessfully', 'Event poster saved successfully! You can find it in your Products page.'));
      router.push('/projects');
      
    } catch (error) {
      console.error('❌ Failed to save poster as product:', error);
      alert(t('interface.eventPosterForm.saveError', 'Failed to save poster. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state while data is being loaded
  if (isLoading) {
    return (
      <div className="p-4 md:p-8 bg-gray-100 min-h-screen font-['Inter',_sans-serif] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event poster...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-8 bg-gray-100 min-h-screen font-['Inter',_sans-serif]">
      <div className="max-w-7xl mx-auto">
                  <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-x-4">
              <button
                onClick={handleBackToQuestionnaire}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                {t('interface.eventPosterForm.editQuestionnaire', 'Edit Questionnaire')}
              </button>
              
              <button
                onClick={handleBackToProjects}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                </svg>
                {t('interface.eventPosterForm.backToProjects', 'Back to Projects')}
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSaveAsProduct}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {isSaving ? t('interface.eventPosterForm.saving', 'Saving...') : t('interface.eventPosterForm.saveAsProduct', 'Save as Product')}
              </button>
            </div>
          </div>

        <div className="bg-white p-4 sm:p-6 md:p-8 shadow-xl rounded-xl border border-gray-200">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('interface.eventPosterForm.eventPosterTitle', 'Event Poster')}</h1>
            <p className="text-gray-600">{t('interface.eventPosterForm.posterGeneratedSuccessfully', 'Your event poster has been generated successfully')}</p>
          </div>

          {/* Event Poster Component with integrated download functionality */}
          <div className="flex justify-center">
            <EventPoster
              eventName={eventData.eventName}
              mainSpeaker={eventData.mainSpeaker}
              speakerDescription={eventData.speakerDescription}
              date={eventData.date}
              topic={eventData.topic}
              additionalSpeakers={eventData.additionalSpeakers}
              ticketPrice={eventData.ticketPrice}
              ticketType={eventData.ticketType}
              freeAccessConditions={eventData.freeAccessConditions}
              speakerImageSrc={eventData.speakerImage || undefined}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function EventPosterResults() {
  return (
    <Suspense fallback={
      <div className="p-4 md:p-8 bg-gray-100 min-h-screen font-['Inter',_sans-serif] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <EventPosterResultsContent />
    </Suspense>
  );
}
