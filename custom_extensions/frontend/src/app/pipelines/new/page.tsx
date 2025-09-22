// custom_extensions/frontend/src/app/pipelines/new/page.tsx
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
 

import React, { useState, useEffect, Suspense, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { PipelineFormData } from '@/types/pipelines';
import { DesignTemplate } from '@/types/designTemplates'; // Import DesignTemplate type
import { fetchDesignTemplates } from '@/lib/designTemplateApi'; // To fetch our new templates
import { PlusCircle, Trash2, ArrowUpCircle, ArrowDownCircle, BookOpen, Image as ImageIcon } from 'lucide-react';
import NextImage from 'next/image'; // Use NextImage alias

const AddPipelinePageComponent = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<PipelineFormData>({
    pipeline_name: '',
    pipeline_description: '',
    is_discovery_prompts: false,
    is_structuring_prompts: false,
    discovery_prompts_list: [''], // Discovery prompts still allow one initial empty custom input
    structuring_prompts_list: [], // Structuring prompts will be texts from selected design templates
  });

  const [availableDesignTemplates, setAvailableDesignTemplates] = useState<DesignTemplate[]>([]);
  const [loadingDesignTemplates, setLoadingDesignTemplates] = useState(true);
  
  // To keep track of which design template is selected for each structuring prompt slot for UI display
  const [selectedStructuringTemplateDetails, setSelectedStructuringTemplateDetails] = useState<(DesignTemplate | null)[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDesignTemplates = async () => {
      setLoadingDesignTemplates(true);
      try {
        const templates = await fetchDesignTemplates();
        setAvailableDesignTemplates(templates);
      } catch (err) {
        console.error("Failed to load design templates for structuring prompts:", err);
        setError("Could not load structuring prompt templates."); // Set an error if needed
      } finally {
        setLoadingDesignTemplates(false);
      }
    };
    loadDesignTemplates();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // --- Discovery Prompts Handlers (no change from before) ---
  const handleDiscoveryPromptChange = (index: number, value: string) => {
    setFormData(prev => {
      const newList = [...prev.discovery_prompts_list]; newList[index] = value;
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
      const newList = [...prev.discovery_prompts_list]; const item = newList[index];
      if (direction === 'up' && index > 0) { newList.splice(index, 1); newList.splice(index - 1, 0, item); }
      else if (direction === 'down' && index < newList.length - 1) { newList.splice(index, 1); newList.splice(index + 1, 0, item); }
      return { ...prev, discovery_prompts_list: newList };
    });
  };

  // --- Structuring Prompts Handlers (UPDATED) ---
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
    // Add an empty string to prompt texts, user must select a template.
    // Add a null to selected details, indicating no template selected yet for this new slot.
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
    setIsSubmitting(true);
    setError(null);

    const payload: PipelineFormData = {
      ...formData,
      discovery_prompts_list: formData.discovery_prompts_list.filter(p => p.trim() !== ''),
      structuring_prompts_list: formData.structuring_prompts_list.filter(p => p.trim() !== ''), // Ensure no empty selections go through
    };
    delete payload.id; // Ensure no ID for create

    try {
      // API endpoint for adding a pipeline is /api/custom-projects-backend/pipelines/add
      const response = await fetch('/api/custom-projects-backend/pipelines/add', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to create product (pipeline)" }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      alert('Product (Pipeline) created successfully!');
      router.push('/pipelines');
    } catch (err: any) {
      console.error("Failed to submit product (pipeline):", err);
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBaseClasses = "block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black";
  const labelBaseClasses = "block text-sm font-medium text-black mb-1";
  const buttonBaseClasses = "p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50";

  const renderDiscoveryPromptInputs = () => (
    // ... (This function remains the same as before, handling custom text for discovery_prompts_list)
    <div className="pl-6 space-y-3 border-l-2 border-indigo-200 py-2">
      <label className={`${labelBaseClasses} text-sm font-semibold`}>Discovery Prompts:</label>
      {formData.discovery_prompts_list.map((prompt, index) => (
        <div key={`discovery-${index}`} className="space-y-1 p-2 border border-gray-200 rounded-md">
          <div className="flex items-start space-x-2">
            <span className="text-black text-sm font-medium pt-2">{index + 1}.</span>
            <textarea value={prompt} onChange={(e) => handleDiscoveryPromptChange(index, e.target.value)} placeholder="Enter discovery prompt text" className={`${inputBaseClasses} flex-grow min-h-[80px]`} rows={3}/>
            <div className="flex flex-col space-y-1 items-center pt-1">
              <button type="button" onClick={() => moveDiscoveryPrompt(index, 'up')} disabled={index === 0} className={buttonBaseClasses} title="Move Up"><ArrowUpCircle size={18} /></button>
              <button type="button" onClick={() => moveDiscoveryPrompt(index, 'down')} disabled={index === formData.discovery_prompts_list.length - 1} className={buttonBaseClasses} title="Move Down"><ArrowDownCircle size={18} /></button>
              <button type="button" onClick={() => removeDiscoveryPromptInput(index)} className={`${buttonBaseClasses} text-red-500 hover:text-red-700`} title="Remove Prompt"><Trash2 size={18} /></button>
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
    if (loadingDesignTemplates) {
      return <div className="pl-6 py-2 text-sm text-gray-500">Loading structuring templates...</div>;
    }
    return (
      <div className="pl-6 space-y-3 border-l-2 border-teal-200 py-2">
        <label className={`${labelBaseClasses} text-sm font-semibold`}>Structuring Prompts (select from Design Templates):</label>
        {formData.structuring_prompts_list.map((promptText, index) => {
          const currentSelectedDetail = selectedStructuringTemplateDetails[index];
          // Determine selected value for dropdown: use template ID if detail is available
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
                        <option key={template.id} value={template.id.toString()}>{template.template_name} ({template.microproduct_type})</option>
                      ))}
                    </select>
                  </div>
                  {currentSelectedDetail && (
                    <div className="p-2 border rounded-md bg-white flex items-start gap-3">
                      {currentSelectedDetail.design_image_path ? (
                        <NextImage src={currentSelectedDetail.design_image_path} alt={currentSelectedDetail.template_name} width={64} height={64} className="rounded object-contain w-16 h-16 flex-shrink-0" unoptimized={true} />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded flex-shrink-0"><ImageIcon size={24} className="text-gray-400"/></div>
                      )}
                      <div>
                        <p className="text-xs text-gray-700 font-semibold">{currentSelectedDetail.template_name}</p>
                        <p className="text-xs text-gray-500 mt-1 break-all" title={currentSelectedDetail.template_structuring_prompt}>
                          Prompt: &quot;{currentSelectedDetail.template_structuring_prompt.substring(0,100)}{currentSelectedDetail.template_structuring_prompt.length > 100 ? "..." : ""}&quot;
                        </p>
                      </div>
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

  return (
    <main className="p-4 md:p-8 bg-gray-50 min-h-screen font-['Inter',_sans-serif]">
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 shadow-lg rounded-lg border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-black">Create New Product (Pipeline)</h1>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name, Description */}
          <div>
            <label htmlFor="pipeline_name" className={labelBaseClasses}>Product Name <span className="text-red-500">*</span></label>
            <input type="text" name="pipeline_name" id="pipeline_name" value={formData.pipeline_name} onChange={handleInputChange} required className={inputBaseClasses}/>
          </div>
          <div>
            <label htmlFor="pipeline_description" className={labelBaseClasses}>Product Description</label>
            <textarea name="pipeline_description" id="pipeline_description" value={formData.pipeline_description || ''} onChange={handleInputChange} rows={3} className={inputBaseClasses}/>
          </div>

          {/* Discovery Prompts Section */}
          <div className="flex items-center">
            <input type="checkbox" name="is_discovery_prompts" id="is_discovery_prompts" checked={formData.is_discovery_prompts} onChange={handleInputChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2"/>
            <label htmlFor="is_discovery_prompts" className="text-sm text-black">Enable Discovery Prompts?</label>
          </div>
          {formData.is_discovery_prompts && renderDiscoveryPromptInputs()}

          {/* Structuring Prompts Section */}
          <div className="flex items-center">
            <input type="checkbox" name="is_structuring_prompts" id="is_structuring_prompts" checked={formData.is_structuring_prompts} onChange={handleInputChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2"/>
            <label htmlFor="is_structuring_prompts" className="text-sm text-black">Enable Structuring Prompts (from Design Templates)?</label>
          </div>
          {formData.is_structuring_prompts && renderStructuringPromptInputs()}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => router.push('/pipelines')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || !formData.pipeline_name} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default function AddPipelinePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-['Inter',_sans-serif]">Loading New Product page...</div>}>
      <AddPipelinePageComponent />
    </Suspense>
  );
}
