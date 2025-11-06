// custom_extensions/frontend/src/app/pipelines/page.tsx
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pipeline } from '@/types/pipelines'; // Use the updated type
import { Eye, XCircle, CheckCircle2, Plus, Edit3, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const PipelinesPageComponent = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]); // Uses updated Pipeline type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPipelines = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/custom-projects-backend/pipelines');
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: "Failed to fetch products" }));
        throw new Error(errData.detail || `HTTP error! status: ${response.status}`);
      }
      const data: Pipeline[] = await response.json(); // Expects new field names
      setPipelines(data);
    } catch (err: any) {
      console.error("Failed to fetch products:", err);
      setError(err.message || "Could not load products."); // Changed "prpjects" to "products"
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  const handleEdit = (pipelineId: number) => {
    router.push(`/pipelines/edit/${pipelineId}`);
  };

  const handleDelete = async (pipelineId: number, pipelineName: string) => {
    if (window.confirm(t('interface.pipelines.deleteConfirmation', 'Are you sure you want to delete the product "{name}"? This action cannot be undone.').replace('{name}', pipelineName))) {
      try {
        const response = await fetch(`/api/custom-projects-backend/pipelines/delete/${pipelineId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: "Failed to delete product" }));
          throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }
        alert(t('interface.pipelines.productDeleted', 'Product deleted successfully!'));
        fetchPipelines();
      } catch (err: any) {
        console.error("Failed to delete product:", err);
        setError(err.message || t('interface.pipelines.failedToDelete', 'Could not delete product.'));
        alert(`Error: ${err.message || t('interface.pipelines.failedToDelete', 'Could not delete product.')}`);
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center font-['Inter',_sans-serif] text-black">{t('interface.pipelines.loadingProducts', 'Loading products...')}</div>; // Changed "project" to "products"
  }

  if (error) {
    return <div className="p-8 text-center text-red-500 font-['Inter',_sans-serif]">{t('interface.pipelines.error', 'Error')}: {error}</div>;
  }

  return (
    <main className="p-4 md:p-8 bg-gray-50 min-h-screen font-['Inter',_sans-serif]">
      <div className="max-w-7xl mx-auto bg-white p-6 md:p-8 shadow-lg rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black">{t('interface.pipelines.title', 'Products')}</h1>
          <Link href="/pipelines/new" legacyBehavior>
            <a className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <Plus size={18} className="mr-2" /> {t('interface.pipelines.addNewProduct', 'Add New Product')}
            </a>
          </Link>
        </div>

        {pipelines.length === 0 && !loading ? (
          <div className="text-center text-gray-500 py-10">
            {t('interface.pipelines.noProductsConfigured', 'No products configured yet. Click "Add New Product" to get started.')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    {t('interface.pipelines.productName', 'Product Name')}
                  </th>
                  {/* Description column removed */}
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                    {t('interface.pipelines.discoveryPhase', 'Discovery Phase')} {/* Renamed */}
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                    {t('interface.pipelines.structuringPhase', 'Structuring Phase')} {/* Renamed */}
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                    {t('interface.pipelines.actions', 'Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pipelines.map((pipeline) => (
                  <tr key={pipeline.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                      {pipeline.pipeline_name}
                    </td>
                    {/* pipeline.pipeline_description TD removed */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                      {pipeline.is_discovery_prompts ? // Renamed field
                        <CheckCircle2 className="h-5 w-5 text-green-500 inline-block" aria-label="Yes" /> :
                        <XCircle className="h-5 w-5 text-red-500 inline-block" aria-label="No" />
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-center">
                      {pipeline.is_structuring_prompts ? // Renamed field
                        <CheckCircle2 className="h-5 w-5 text-green-500 inline-block" aria-label="Yes" /> :
                        <XCircle className="h-5 w-5 text-red-500 inline-block" aria-label="No" />
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center space-x-2">
                      <button
                        onClick={() => handleEdit(pipeline.id)}
                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center text-xs p-1"
                        title={t('interface.pipelines.editProduct', 'Edit Product')} // Changed "Project" to "Product"
                        aria-label={`${t('interface.pipelines.editProduct', 'Edit Product')} ${pipeline.pipeline_name}`} // Changed "project" to "product"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(pipeline.id, pipeline.pipeline_name)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center text-xs p-1"
                        title={t('interface.pipelines.deleteProduct', 'Delete Product')} // Changed "Project" to "Product"
                        aria-label={`${t('interface.pipelines.deleteProduct', 'Delete Product')} ${pipeline.pipeline_name}`} // Changed "project" to "product"
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

export default function PipelinesPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="p-8 text-center font-['Inter',_sans-serif]">{t('interface.pipelines.loadingProductsPage', 'Loading Products page...')}</div>}>
      <PipelinesPageComponent />
    </Suspense>
  );
}
