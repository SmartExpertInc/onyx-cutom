// custom_extensions/frontend/src/app/admin/design-templates/page.tsx
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
 

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DesignTemplate } from '@/types/designTemplates';
import { fetchDesignTemplates } from '@/lib/designTemplateApi'; // Will add deleteDesignTemplate here later
import { Plus, Edit3, Trash2 } from 'lucide-react'; // Added Edit3, Trash2
import { useRouter } from 'next/navigation'; // For navigation

// Assume deleteDesignTemplate will be added to lib/designTemplateApi.ts
async function deleteDesignTemplateAPI(templateId: number): Promise<{ detail: string }> {
    const API_BASE_URL = '/api/custom-projects-backend'; // Should be consistent
    const response = await fetch(`${API_BASE_URL}/design_templates/delete/${templateId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to delete design template' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    if (response.status === 204) return { detail: "Successfully deleted" }; // Handle 204 No Content
    return response.json();
}


const DesignTemplatesListPageComponent = () => {
  const [templates, setTemplates] = useState<DesignTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDesignTemplates();
      setTemplates(data);
    } catch (err: any) {
      setError(err.message || "Could not load design templates.");
      console.error("Failed to load design templates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleEdit = (templateId: number) => {
    router.push(`/admin/design-templates/edit/${templateId}`);
  };

  const handleDelete = async (templateId: number, templateName: string) => {
    if (window.confirm(`Are you sure you want to delete the template "${templateName}"? This will also delete its associated image.`)) {
      try {
        await deleteDesignTemplateAPI(templateId); // Use the new API lib function
        alert('Template deleted successfully!');
        loadTemplates(); // Refresh the list
      } catch (err: any) {
        console.error("Failed to delete template:", err);
        setError(err.message || "Could not delete template.");
        alert(`Error: ${err.message || "Could not delete template."}`);
      }
    }
  };


  if (loading) {
    return <div className="p-8 text-center font-['Inter',_sans-serif] text-black">Loading Design Templates...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500 font-['Inter',_sans-serif]">Error: {error}</div>;
  }

  return (
    <main className="p-4 md:p-8 bg-gray-50 min-h-screen font-['Inter',_sans-serif]">
      <div className="max-w-7xl mx-auto bg-white p-6 md:p-8 shadow-lg rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black">Design Templates</h1>
          <Link href="/admin/design-templates/new" legacyBehavior>
            <a className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <Plus size={18} className="mr-2" /> Add New Design Template
            </a>
          </Link>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">{error}</div>}


        {templates.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No design templates configured yet. Click &quot;Add New Design Template&quot; to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Image
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Template Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Microproduct Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Component Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4 align-middle"> {/* Ensure consistent alignment */}
                      {template.design_image_path ? (
                        <div className="w-28 h-28 flex items-center justify-center relative"> {/* Added relative for potential absolute positioned scaled image */}
                          <Image
                            src={template.design_image_path}
                            alt={template.template_name || 'Design Template Image'}
                            width={112} 
                            height={112}
                            className="object-contain rounded-md 
                                       transform transition-transform duration-300 ease-in-out 
                                       group-hover:scale-[3.5] group-hover:z-20 cursor-pointer" // Increased scale to 3.5x, higher z-index, using group-hover
                            unoptimized={true} // As requested
                          />
                        </div>
                      ) : (
                        <div className="w-28 h-28 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black align-middle">
                      {template.template_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black align-middle">
                      {template.microproduct_type}
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-black align-middle">
                      {template.component_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center space-x-2 align-middle">
                        <button
                            onClick={() => handleEdit(template.id)}
                            className="text-indigo-600 hover:text-indigo-900 inline-flex items-center text-xs p-1"
                            title="Edit Template"
                            aria-label={`Edit template ${template.template_name}`}
                        >
                            <Edit3 size={16} />
                        </button>
                        <button
                            onClick={() => handleDelete(template.id, template.template_name)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center text-xs p-1"
                            title="Delete Template"
                            aria-label={`Delete template ${template.template_name}`}
                        >
                            <Trash2 size={16} />
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
};

export default function DesignTemplatesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-['Inter',_sans-serif]">Loading Design Templates...</div>}>
      <DesignTemplatesListPageComponent />
    </Suspense>
  );
}
