// custom_extensions/frontend/src/app/admin/design-templates/new/page.tsx
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
 

import React, { useState, useEffect, Suspense, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { DesignTemplateFormData } from '@/types/designTemplates';
import { uploadDesignImage, addDesignTemplate, fetchMicroproductTypes } from '@/lib/designTemplateApi';
import { UploadCloud, X } from 'lucide-react';

const AddDesignTemplatePageComponent = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<Omit<DesignTemplateFormData, 'design_image_path'>>({
    template_name: '',
    template_structuring_prompt: '',
    microproduct_type: '',
    component_name: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [microproductTypes, setMicroproductTypes] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMicroproductTypes = async () => {
      try {
        const types = await fetchMicroproductTypes();
        setMicroproductTypes(types);
        if (types.length > 0) {
          setFormData(prev => ({ ...prev, microproduct_type: types[0] })); // Default to first type
        }
      } catch (err: any) {
        console.error("Failed to load microproduct types:", err);
        setError("Could not load microproduct types for selection.");
      }
    };
    loadMicroproductTypes();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Basic client-side validation (optional, backend validation is key)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please select a JPG, PNG, GIF or WEBP image.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert('File is too large. Maximum size is 5MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // Also clear the file input if possible, or user has to re-select
    const fileInput = document.getElementById('design_image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.microproduct_type) {
        setError("Please select a Microproduct Type.");
        return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      let imagePath = '';
      if (imageFile) {
        const uploadResponse = await uploadDesignImage(imageFile);
        imagePath = uploadResponse.file_path;
      } else {
        // Handle case where image is optional - or make it required
        // For now, let's assume it's optional, or add validation if it's required
        // alert("Design image is required.");
        // setIsSubmitting(false);
        // return;
      }

      const completeFormData: DesignTemplateFormData = {
        ...formData,
        design_image_path: imagePath,
      };

      await addDesignTemplate(completeFormData);
      alert('Design Template created successfully!');
      router.push('/admin/design-templates');
    } catch (err: any) {
      console.error("Failed to submit design template:", err);
      setError(err.message || "An unknown error occurred while creating the template.");
      // alert(`Error: ${err.message || "Could not create design template."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBaseClasses = "block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black";
  const labelBaseClasses = "block text-sm font-medium text-black mb-1";

  return (
    <main className="p-4 md:p-8 bg-gray-50 min-h-screen font-['Inter',_sans-serif]">
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 shadow-lg rounded-lg border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-black">Add New Design Template</h1>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="template_name" className={labelBaseClasses}>Template Name <span className="text-red-500">*</span></label>
            <input type="text" name="template_name" id="template_name" value={formData.template_name} onChange={handleInputChange} required className={inputBaseClasses}/>
          </div>

          <div>
            <label htmlFor="template_structuring_prompt" className={labelBaseClasses}>Structuring Prompt Text <span className="text-red-500">*</span></label>
            <textarea name="template_structuring_prompt" id="template_structuring_prompt" value={formData.template_structuring_prompt} onChange={handleInputChange} required rows={4} className={inputBaseClasses}/>
          </div>
          
          <div>
            <label htmlFor="design_image" className={labelBaseClasses}>Design Image</label>
            {imagePreview && (
              <div className="mb-2 relative w-40 h-40 border p-1 rounded-md">
                <Image src={imagePreview} alt="Image Preview" layout="fill" objectFit="contain" />
                <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                  <X size={14}/>
                </button>
              </div>
            )}
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${error && !imageFile ? 'border-red-400' : 'border-gray-300'} border-dashed rounded-md`}>
                <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                        <label htmlFor="design_image" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>Upload a file</span>
                            <input id="design_image" name="design_image" type="file" className="sr-only" onChange={handleImageChange} accept="image/png, image/jpeg, image/gif, image/webp" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP up to 5MB</p>
                </div>
            </div>
          </div>

          <div>
            <label htmlFor="microproduct_type" className={labelBaseClasses}>Microproduct Type <span className="text-red-500">*</span></label>
            <select name="microproduct_type" id="microproduct_type" value={formData.microproduct_type} onChange={handleInputChange} required className={inputBaseClasses}>
              {microproductTypes.length === 0 && <option value="" disabled>Loading types...</option>}
              {microproductTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="component_name" className={labelBaseClasses}>Component Name <span className="text-red-500">*</span></label>
            <input type="text" name="component_name" id="component_name" value={formData.component_name} onChange={handleInputChange} required className={inputBaseClasses}/>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link href="/admin/design-templates" legacyBehavior>
                <a className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                Cancel
                </a>
            </Link>
            <button type="submit" disabled={isSubmitting || !formData.template_name || !formData.microproduct_type} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Design Template'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default function AddDesignTemplatePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-['Inter',_sans-serif]">Loading New Design Template page...</div>}>
      <AddDesignTemplatePageComponent />
    </Suspense>
  );
}
