// custom_extensions/frontend/src/app/admin/design-templates/edit/[id]/page.tsx
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect, Suspense, ChangeEvent, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
// Import DesignTemplate and DesignTemplateUpdateData from the types file
import { 
  DesignTemplate, // Used when fetching the template by ID
  DesignTemplateUpdateData // Used for the form state and update payload
} from '@/types/designTemplates'; 
// Import only functions from the API library
import {
    fetchMicroproductTypes, 
    fetchDesignTemplateById, 
    updateDesignTemplate
    // DesignTemplateUpdateData is NOT imported from here anymore
} from '@/lib/designTemplateApi';
import { Save, AlertCircle } from 'lucide-react';

const EditDesignTemplatePageComponent = () => {
  const router = useRouter();
  const params = useParams();
  const templateId = params?.id ? parseInt(params.id as string) : null;

  const [formData, setFormData] = useState<Partial<DesignTemplateUpdateData>>({ // Use partial for initial state
    template_name: '',
    template_structuring_prompt: '',
    microproduct_type: '',
    component_name: '',
  });
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [initialTemplateName, setInitialTemplateName] = useState<string>("");
  const [microproductTypes, setMicroproductTypes] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMicroproductTypes = async () => {
      try {
        const types = await fetchMicroproductTypes();
        setMicroproductTypes(types);
      } catch (err: any) {
        console.error("Failed to load microproduct types:", err);
        // Not setting main error, just for types dropdown
      }
    };
    loadMicroproductTypes();
  }, []);

  useEffect(() => {
    if (templateId) {
      const loadTemplateData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const templateData = await fetchDesignTemplateById(templateId);
          setFormData({
            template_name: templateData.template_name,
            template_structuring_prompt: templateData.template_structuring_prompt,
            microproduct_type: templateData.microproduct_type,
            component_name: templateData.component_name,
          });
          setOriginalImagePreview(templateData.design_image_path);
          setInitialTemplateName(templateData.template_name);
        } catch (err: any) {
          console.error("Failed to load template data:", err);
          setError(err.message || "Could not load template data.");
        } finally {
          setIsLoading(false);
        }
      };
      loadTemplateData();
    } else {
      setError("Template ID not found.");
      setIsLoading(false);
    }
  }, [templateId]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!templateId) {
      setError("Template ID is missing, cannot update.");
      return;
    }
    if (!formData.microproduct_type) {
        setError("Please select a Microproduct Type.");
        return;
    }

    setIsSubmitting(true);
    setError(null);

    // Prepare only changed data, or ensure all required fields for DesignTemplateUpdateData are present
    const updatePayload: DesignTemplateUpdateData = {
        template_name: formData.template_name,
        template_structuring_prompt: formData.template_structuring_prompt,
        microproduct_type: formData.microproduct_type,
        component_name: formData.component_name,
    };

    try {
      await updateDesignTemplate(templateId, updatePayload);
      alert('Design Template updated successfully!');
      router.push('/admin/design-templates');
    } catch (err: any) {
      console.error("Failed to update design template:", err);
      setError(err.message || "An unknown error occurred while updating the template.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBaseClasses = "block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black";
  const labelBaseClasses = "block text-sm font-medium text-black mb-1";

  if (isLoading) {
    return <div className="p-8 text-center font-['Inter',_sans-serif] text-black">Loading template data...</div>;
  }

  if (error && !initialTemplateName) { // Show error prominently if initial load failed
    return <div className="p-8 text-center text-red-500 font-['Inter',_sans-serif]">{error}</div>;
  }


  return (
    <main className="p-4 md:p-8 bg-gray-50 min-h-screen font-['Inter',_sans-serif]">
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 shadow-lg rounded-lg border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-black">Edit Design Template: {initialTemplateName || "..."}</h1>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md flex items-center"><AlertCircle size={18} className="mr-2"/> {error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="template_name" className={labelBaseClasses}>Template Name <span className="text-red-500">*</span></label>
            <input type="text" name="template_name" id="template_name" value={formData.template_name || ''} onChange={handleInputChange} required className={inputBaseClasses}/>
          </div>

          <div>
            <label htmlFor="template_structuring_prompt" className={labelBaseClasses}>Structuring Prompt Text <span className="text-red-500">*</span></label>
            <textarea name="template_structuring_prompt" id="template_structuring_prompt" value={formData.template_structuring_prompt || ''} onChange={handleInputChange} required rows={4} className={inputBaseClasses}/>
          </div>
          
          <div>
            <label className={labelBaseClasses}>Design Image (Not changeable)</label>
            {originalImagePreview ? (
              <div className="mt-2 relative w-40 h-40 border p-1 rounded-md">
                <Image src={originalImagePreview} alt="Original Design Image" layout="fill" objectFit="contain" unoptimized={true} />
              </div>
            ) : (
                <p className="text-sm text-gray-500">No image associated with this template.</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Image cannot be changed during edit.</p>
          </div>

          <div>
            <label htmlFor="microproduct_type" className={labelBaseClasses}>Microproduct Type <span className="text-red-500">*</span></label>
            <select name="microproduct_type" id="microproduct_type" value={formData.microproduct_type || ''} onChange={handleInputChange} required className={inputBaseClasses}>
              <option value="" disabled>Select a type...</option>
              {microproductTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="component_name" className={labelBaseClasses}>Component Name <span className="text-red-500">*</span></label>
            <input type="text" name="component_name" id="component_name" value={formData.component_name || ''} onChange={handleInputChange} required className={inputBaseClasses}/>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link href="/admin/design-templates" legacyBehavior>
                <a className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                Cancel
                </a>
            </Link>
            <button type="submit" disabled={isSubmitting || isLoading || !formData.template_name || !formData.microproduct_type} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50">
              <Save size={16} className="mr-2 inline-block" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default function EditDesignTemplatePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-['Inter',_sans-serif]">Loading Edit Design Template page...</div>}>
      <EditDesignTemplatePageComponent />
    </Suspense>
  );
}
