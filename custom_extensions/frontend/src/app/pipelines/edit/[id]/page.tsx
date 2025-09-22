// custom_extensions/frontend/src/app/pipelines/edit/[id]/page.tsx
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
 

import React, { useState, useEffect, Suspense, ChangeEvent, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link'; // Make sure Link is imported
import { PipelineFormData, PipelineGetResponse } from '@/types/pipelines';
import { DesignTemplate } from '@/types/designTemplates';
import { fetchDesignTemplates } from '@/lib/designTemplateApi';
import { PlusCircle, Trash2, Save, ArrowUpCircle, ArrowDownCircle, BookOpen, Image as ImageIcon } from 'lucide-react';
import NextImage from 'next/image'; // Using NextImage alias for clarity with HTMLImageElement

const EditPipelinePageComponent = () => {
  const router = useRouter();
  const params = useParams();
  const pipelineId = params?.id ? parseInt(params.id as string) : null;

  // --- Base Class Definitions ---
  const inputBaseClasses = "block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black";
  const labelBaseClasses = "block text-sm font-medium text-black mb-1";
  const buttonBaseClasses = "p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50";
  // --- End of Base Class Definitions ---

  const [formData, setFormData] = useState<PipelineFormData>({
    pipeline_name: '',
    pipeline_description: '',
    is_discovery_prompts: false,
    is_structuring_prompts: false,
    discovery_prompts_list: [''],
    structuring_prompts_list: [],
  });
  
  const [availableDesignTemplates, setAvailableDesignTemplates] = useState<DesignTemplate[]>([]);
  const [loadingDesignTemplates, setLoadingDesignTemplates] = useState(true);
  const [selectedStructuringTemplateDetails, setSelectedStructuringTemplateDetails] = useState<(DesignTemplate | null)[]>([]);
  
  const [initialPipelineName, setInitialPipelineName] = useState<string>(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true); 
  const [error, setError] = useState<string | null>(null);

  // Fetch available design templates once on mount
  useEffect(() => {
    const loadDesignTemplates = async () => {
      setLoadingDesignTemplates(true);
      try {
        const templates = await fetchDesignTemplates();
        setAvailableDesignTemplates(templates);
      } catch (err) {
        console.error("Failed to load design templates:", err);
        // Not setting global error, as this might only affect structuring prompt selection
        // You could set a specific error for the structuring prompt section if needed
      } finally {
        setLoadingDesignTemplates(false);
      }
    };
    loadDesignTemplates();
  }, []);

  // Fetch pipeline data to edit
  useEffect(() => {
    if (pipelineId) {
      const fetchPipelineData = async () => {
        setIsLoadingPage(true);
        setError(null);
        try {
          const response = await fetch(`/api/custom-projects-backend/pipelines/${pipelineId}`);
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: "Failed to fetch product data" }));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
          }
          const data: PipelineGetResponse = await response.json();
          setFormData({
            id: data.id,
            pipeline_name: data.pipeline_name,
            pipeline_description: data.pipeline_description || '',
            is_discovery_prompts: data.is_discovery_prompts,
            is_structuring_prompts: data.is_structuring_prompts,
            discovery_prompts_list: data.discovery_prompts_list && data.discovery_prompts_list.length > 0 ? data.discovery_prompts_list : [''],
            structuring_prompts_list: data.structuring_prompts_list || [],
          });
          setInitialPipelineName(data.pipeline_name);
        } catch (err: any) {
          console.error("Failed to fetch product data:", err);
          setError(err.message || "Could not load product data.");
        } finally {
          setIsLoadingPage(false);
        }
      };
      fetchPipelineData();
    } else {
      setError("Product ID not found.");
      setIsLoadingPage(false);
    }
  }, [pipelineId]);

  // Effect to initialize selectedStructuringTemplateDetails when formData and availableDesignTemplates are ready
  useEffect(() => {
    if (formData.structuring_prompts_list.length > 0 && availableDesignTemplates.length > 0) {
      const initialDetails = formData.structuring_prompts_list.map(promptText => {
        return availableDesignTemplates.find(t => t.template_structuring_prompt === promptText) || null;
      });
      setSelectedStructuringTemplateDetails(initialDetails);
    } else if (formData.structuring_prompts_list.length === 0) {
        setSelectedStructuringTemplateDetails([]); // Ensure it's empty if no prompts
    }
    // Add a dependency on isLoadingPage to ensure this runs after initial data is loaded
  }, [formData.structuring_prompts_list, availableDesignTemplates, isLoadingPage]);


  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDiscoveryPromptChange = (index: number, value: string) => { 
    setFormData(prev => { 
      const newList = [...prev.discovery_prompts_list]; 
      newList[index] = value; 
      return { ...prev, discovery_prompts_list: newList }; 
    });
  };
  const addDiscoveryPromptInput = () => { 
    setFormData(prev => ({ ...prev, discovery_prompts_list: [...prev.discovery_prompts_list, ''] }));
  };
  const removeDiscoveryPromptInput = (index: number) => { 
    setFormData(prev => ({ ...prev, discovery_prompts_list: prev.discovery_prompts_list.filter((_, i) => i !== index) }));
  };
  const moveDiscoveryPrompt = (index: number, direction: 'up' | 'down') => { 
    setFormData(prev => { 
      const newList = [...prev.discovery_prompts_list]; 
      const item = newList[index]; 
      if (direction === 'up' && index > 0) { 
        newList.splice(index, 1); 
        newList.splice(index - 1, 0, item); 
      } else if (direction === 'down' && index < newList.length - 1) { 
        newList.splice(index, 1); 
        newList.splice(index + 1, 0, item); 
      } 
      return { ...prev, discovery_prompts_list: newList }; 
    });
  };

  const handleStructuringTemplateSelect = (slotIndex: number, selectedTemplateId: string) => { 
    const selectedTemplate = availableDesignTemplates.find(t => t.id.toString() === selectedTemplateId);
    setFormData(prev => { 
      const newStructuringPromptTexts = [...prev.structuring_prompts_list]; 
      newStructuringPromptTexts[slotIndex] = selectedTemplate ? selectedTemplate.template_structuring_prompt : ''; 
      return { ...prev, structuring_prompts_list: newStructuringPromptTexts }; 
    });
    setSelectedStructuringTemplateDetails(prevSelectedDetails => { 
      const newSelectedDetails = [...prevSelectedDetails]; 
      newSelectedDetails[slotIndex] = selectedTemplate || null; 
      return newSelectedDetails; 
    });
  };
  const addStructuringPromptSlot = () => { 
    setFormData(prev => ({ ...prev, structuring_prompts_list: [...prev.structuring_prompts_list, ''] }));
    setSelectedStructuringTemplateDetails(prev => [...prev, null]);
  };
  const removeStructuringPromptSlot = (slotIndex: number) => { 
    setFormData(prev => ({ ...prev, structuring_prompts_list: prev.structuring_prompts_list.filter((_, i) => i !== slotIndex) }));
    setSelectedStructuringTemplateDetails(prev => prev.filter((_, i) => i !== slotIndex));
  };
  const moveStructuringPromptSlot = (slotIndex: number, direction: 'up' | 'down') => { 
    const newTextList = [...formData.structuring_prompts_list]; 
    const newDetailsList = [...selectedStructuringTemplateDetails];
    const textItem = newTextList[slotIndex]; 
    const detailItem = newDetailsList[slotIndex];
    if (direction === 'up' && slotIndex > 0) { 
      newTextList.splice(slotIndex, 1); newTextList.splice(slotIndex - 1, 0, textItem); 
      newDetailsList.splice(slotIndex, 1); newDetailsList.splice(slotIndex - 1, 0, detailItem); 
    } else if (direction === 'down' && slotIndex < newTextList.length - 1) { 
      newTextList.splice(slotIndex, 1); newTextList.splice(slotIndex + 1, 0, textItem); 
      newDetailsList.splice(slotIndex, 1); newDetailsList.splice(slotIndex + 1, 0, detailItem); 
    }
    setFormData(prev => ({ ...prev, structuring_prompts_list: newTextList })); 
    setSelectedStructuringTemplateDetails(newDetailsList);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pipelineId) { 
      setError("Cannot update product without an ID."); 
      return; 
    }
    setIsSubmitting(true); 
    setError(null);

    const payload: PipelineFormData = {
      ...formData, 
      id: pipelineId,
      discovery_prompts_list: formData.discovery_prompts_list.filter(p => p.trim() !== ''),
      structuring_prompts_list: formData.structuring_prompts_list.filter(p => p.trim() !== ''),
    };

    try {
      const response = await fetch(`/api/custom-projects-backend/pipelines/update/${pipelineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to update product (pipeline)" }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      alert('Product (Pipeline) updated successfully!');
      router.push('/pipelines'); 
    } catch (err: any) {
      console.error("Failed to submit product (pipeline) update:", err);
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderDiscoveryPromptInputs = () => (
    <div className="pl-6 space-y-3 border-l-2 border-indigo-200 py-2">
      <label className={`${labelBaseClasses} text-sm font-semibold`}>Discovery Prompts:</label>
      {formData.discovery_prompts_list.map((prompt, index) => ( 
        <div key={`discovery-${index}`} className="space-y-1 p-2 border border-gray-200 rounded-md"> 
          <div className="flex items-start space-x-2"> 
            <span className="text-black text-sm font-medium pt-2">{index + 1}.</span> 
            <textarea 
              value={prompt} 
              onChange={(e) => handleDiscoveryPromptChange(index, e.target.value)} 
              placeholder="Enter discovery prompt text" 
              className={`${inputBaseClasses} flex-grow min-h-[80px]`} 
              rows={3}
            /> 
            <div className="flex flex-col space-y-1 items-center pt-1"> 
              <button type="button" onClick={() => moveDiscoveryPrompt(index, 'up')} disabled={index === 0} className={buttonBaseClasses} title="Move Up">
                <ArrowUpCircle size={18} />
              </button> 
              <button type="button" onClick={() => moveDiscoveryPrompt(index, 'down')} disabled={index === formData.discovery_prompts_list.length - 1} className={buttonBaseClasses} title="Move Down">
                <ArrowDownCircle size={18} />
              </button> 
              <button type="button" onClick={() => removeDiscoveryPromptInput(index)} className={`${buttonBaseClasses} text-red-500 hover:text-red-700`} title="Remove Prompt">
                <Trash2 size={18} />
              </button> 
            </div> 
          </div> 
        </div> 
      ))}
      <button type="button" onClick={addDiscoveryPromptInput} className="mt-1 flex items-center text-xs text-blue-600 hover:text-blue-800"> 
        <PlusCircle size={14} className="mr-1"/> Add Discovery Prompt 
      </button>
    </div>
  );

  const renderStructuringPromptInputs = () => { 
    if (loadingDesignTemplates && availableDesignTemplates.length === 0) { 
      return <div className="pl-6 py-2 text-sm text-gray-500">Loading structuring templates...</div>; 
    }
    return (
      <div className="pl-6 space-y-3 border-l-2 border-teal-200 py-2">
        <label className={`${labelBaseClasses} text-sm font-semibold`}>Structuring Prompts (select from Design Templates):</label>
        {formData.structuring_prompts_list.map((promptText, index) => {
          const currentSelectedDetail = selectedStructuringTemplateDetails[index];
          // The value for the select should be the ID of the template if currentSelectedDetail is available
          // Otherwise, if no detail but text exists, it means it's custom or unmatched, so no value for select.
          const selectedValue = currentSelectedDetail ? currentSelectedDetail.id.toString() : "";
          
          return (
            <div key={`structuring-${index}`} className="space-y-2 p-3 border border-gray-200 rounded-md bg-gray-50">
              <div className="flex items-start space-x-3">
                <span className="text-black text-sm font-medium pt-2">{index + 1}.</span>
                <div className="flex-grow space-y-2">
                  <div className="flex items-center space-x-2">
                    <BookOpen size={16} className="text-gray-500 flex-shrink-0" />
                    <select 
                      value={selectedValue} 
                      onChange={(e) => handleStructuringTemplateSelect(index, e.target.value)} 
                      className="flex-grow text-sm p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-black bg-white"
                    >
                      <option value="" disabled>Select a Design Template...</option>
                      {availableDesignTemplates.map(template => (
                        <option key={template.id} value={template.id.toString()}>
                          {template.template_name} ({template.microproduct_type})
                        </option>
                      ))}
                    </select>
                  </div>
                  {currentSelectedDetail ? (
                    <div className="p-2 border rounded-md bg-white flex items-start gap-3">
                      {currentSelectedDetail.design_image_path ? (
                        <NextImage 
                          src={currentSelectedDetail.design_image_path} 
                          alt={currentSelectedDetail.template_name} 
                          width={64} 
                          height={64} 
                          className="rounded object-contain w-16 h-16 flex-shrink-0" 
                          unoptimized={true} 
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded flex-shrink-0">
                          <ImageIcon size={24} className="text-gray-400"/>
                        </div>
                      )}
                      <div> 
                        <p className="text-xs text-gray-700 font-semibold">{currentSelectedDetail.template_name}</p> 
                        <p className="text-xs text-gray-500 mt-1 break-all" title={currentSelectedDetail.template_structuring_prompt}> 
                          Prompt: &quot;{currentSelectedDetail.template_structuring_prompt.substring(0,100)}{currentSelectedDetail.template_structuring_prompt.length > 100 ? "..." : ""}&quot;
                        </p> 
                      </div>
                    </div>
                  ) : (
                    promptText && 
                    <div className="p-2 text-xs text-gray-600">
                      Saved prompt text: &quot;{promptText.substring(0,100)}{promptText.length > 100 ? "..." : ""}&quot; (Current template details not found or text was custom)
                    </div>
                  )}
                </div>
                <div className="flex flex-col space-y-1 items-center pt-1"> 
                  <button type="button" onClick={() => moveStructuringPromptSlot(index, 'up')} disabled={index === 0} className={buttonBaseClasses} title="Move Up"><ArrowUpCircle size={18} /></button> 
                  <button type="button" onClick={() => moveStructuringPromptSlot(index, 'down')} disabled={index === formData.structuring_prompts_list.length - 1} className={buttonBaseClasses} title="Move Down"><ArrowDownCircle size={18} /></button> 
                  <button type="button" onClick={() => removeStructuringPromptSlot(index)} className={`${buttonBaseClasses} text-red-500 hover:text-red-700`} title="Remove Slot"><Trash2 size={18} /></button> 
                </div>
              </div>
            </div>
          );
        })}
        <button type="button" onClick={addStructuringPromptSlot} className="mt-1 flex items-center text-xs text-teal-600 hover:text-teal-800"> 
          <PlusCircle size={14} className="mr-1"/> Add Structuring Prompt Slot 
        </button>
      </div>
    );
  };

  if (isLoadingPage) { 
    return <div className="p-8 text-center font-['Inter',_sans-serif] text-black">Loading product data...</div>; 
  }
  if (error && !initialPipelineName && !isLoadingPage) { // Check isLoadingPage to avoid showing error during initial load
    return <div className="p-8 text-center text-red-500 font-['Inter',_sans-serif]">Error: {error}</div>; 
  }

  return (
    <main className="p-4 md:p-8 bg-gray-50 min-h-screen font-['Inter',_sans-serif]">
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 shadow-lg rounded-lg border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-black">Edit Product (Pipeline): {initialPipelineName || "..."}</h1>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div> 
            <label htmlFor="pipeline_name" className={labelBaseClasses}>Product Name <span className="text-red-500">*</span></label> 
            <input type="text" name="pipeline_name" id="pipeline_name" value={formData.pipeline_name} onChange={handleInputChange} required className={inputBaseClasses}/> 
          </div>
          <div> 
            <label htmlFor="pipeline_description" className={labelBaseClasses}>Product Description</label> 
            <textarea name="pipeline_description" id="pipeline_description" value={formData.pipeline_description || ''} onChange={handleInputChange} rows={3} className={inputBaseClasses}/> 
          </div>
          
          <div className="flex items-center"> 
            <input type="checkbox" name="is_discovery_prompts" id="is_discovery_prompts" checked={formData.is_discovery_prompts} onChange={handleInputChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2"/> 
            <label htmlFor="is_discovery_prompts" className="text-sm text-black">Enable Discovery Prompts?</label> 
          </div>
          {formData.is_discovery_prompts && renderDiscoveryPromptInputs()}

          <div className="flex items-center"> 
            <input type="checkbox" name="is_structuring_prompts" id="is_structuring_prompts" checked={formData.is_structuring_prompts} onChange={handleInputChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2"/> 
            <label htmlFor="is_structuring_prompts" className="text-sm text-black">Enable Structuring Prompts (from Design Templates)?</label> 
          </div>
          {formData.is_structuring_prompts && renderStructuringPromptInputs()}

          <div className="flex justify-end gap-3 pt-4">
            <Link href="/pipelines" legacyBehavior>
              <a className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                Cancel
              </a>
            </Link>
            <button 
              type="submit" 
              disabled={isSubmitting || isLoadingPage || !formData.pipeline_name} 
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <Save size={16} className="mr-2 inline-block" /> 
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default function EditPipelinePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-['Inter',_sans-serif]">Loading Edit Product page...</div>}>
      <EditPipelinePageComponent />
    </Suspense>
  );
}
