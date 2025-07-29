// Utility for updating slide content via API

interface SlideUpdateRequest {
  projectId: number;
  slideId: string;
  fieldPath: string[];
  value: string | string[];
}

export const updateSlideField = async (request: SlideUpdateRequest): Promise<boolean> => {
  try {
    const response = await fetch(`/api/custom-projects-backend/projects/${request.projectId}/slide-update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slideId: request.slideId,
        fieldPath: request.fieldPath,
        value: request.value
      }),
    });

    if (!response.ok) {
      console.error('Failed to update slide field:', response.status, response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating slide field:', error);
    return false;
  }
};

// Alternative: Update entire project content
export const updateProjectContent = async (projectId: number, content: any): Promise<boolean> => {
  try {
    const response = await fetch(`/api/custom-projects-backend/projects/update/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        microProductContent: content
      }),
    });

    if (!response.ok) {
      console.error('Failed to update project content:', response.status, response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating project content:', error);
    return false;
  }
}; 