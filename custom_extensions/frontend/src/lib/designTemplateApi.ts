// custom_extensions/frontend/src/lib/designTemplateApi.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { 
  DesignTemplate, 
  DesignTemplateFormData, 
  ImageUploadResponse,
  DesignTemplateUpdateData 
} from '@/types/designTemplates';

const API_BASE_URL = '/api/custom-projects-backend'; // From your Nginx setup

export async function fetchDesignTemplates(): Promise<DesignTemplate[]> {
  const response = await fetch(`${API_BASE_URL}/design_templates`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch design templates' }));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function fetchMicroproductTypes(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/microproduct_types`);
   if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch microproduct types' }));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function uploadDesignImage(imageFile: File): Promise<ImageUploadResponse> {
  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await fetch(`${API_BASE_URL}/design_templates/upload_image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to upload image');
  }

  return response.json();
}

export async function uploadOnePagerImage(imageFile: File): Promise<ImageUploadResponse> {
  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await fetch(`${API_BASE_URL}/onepager/upload_image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to upload one-pager image');
  }

  return response.json();
}

export async function addDesignTemplate(templateData: DesignTemplateFormData): Promise<DesignTemplate> {
  const response = await fetch(`${API_BASE_URL}/design_templates/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(templateData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to add design template' }));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function fetchDesignTemplateById(templateId: number): Promise<DesignTemplate> {
  const response = await fetch(`${API_BASE_URL}/design_templates/${templateId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: `Failed to fetch design template with id ${templateId}` }));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function updateDesignTemplate(templateId: number, templateData: DesignTemplateUpdateData): Promise<DesignTemplate> {
  const response = await fetch(`${API_BASE_URL}/design_templates/update/${templateId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(templateData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: `Failed to update design template with id ${templateId}` }));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function deleteDesignTemplate(templateId: number): Promise<{ detail: string }> {
  const response = await fetch(`${API_BASE_URL}/design_templates/delete/${templateId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    if (response.status === 404) {
         throw new Error("Design template not found for deletion.");
    }
    const errorData = await response.json().catch(() => ({ detail: 'Failed to delete design template' }));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }
  if (response.status === 204) { 
    return { detail: "Successfully deleted" };
  }
  return response.json();
}
