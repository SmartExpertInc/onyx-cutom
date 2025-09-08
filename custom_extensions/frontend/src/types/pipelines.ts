// custom_extensions/frontend/src/types/pipelines.ts
// Removed disable-any; types below avoid any

export interface PromptTemplate {
  id: string;
  name: string;
  templateText: string;
  picture: string; // New field for image URL or path
}

// Base type for API responses (list view)
export interface Pipeline {
  id: number;
  pipeline_name: string;
  pipeline_description?: string | null;
  is_discovery_prompts: boolean;
  is_structuring_prompts: boolean;
  // This should now be the primary way to access discovery prompts
  discovery_prompts_list?: string[] | null; 
  structuring_prompts_list?: string[] | null;
  // Remove or mark as deprecated if the backend no longer sends these for the list endpoint
  discovery_prompts?: Record<string, string> | null; // Potentially remove if backend fully switched
  structuring_prompts?: Record<string, string> | null; // Potentially remove
  created_at: string; // Or Date
}
// For form data (Create)
export interface PipelineCreateFormData {
  id?: number; // Optional for create, present for edit state
  pipeline_name: string;
  pipeline_description?: string | null;
  is_discovery_prompts: boolean;    // Renamed
  is_structuring_prompts: boolean;  // Renamed
  discovery_prompts_list: string[];   // Renamed
  structuring_prompts_list: string[]; // Renamed - this will hold template *texts*
}

// Base type for API responses (list view - matches MicroproductPipelineDBResponse from backend)
export interface Pipeline {
  id: number;
  pipeline_name: string;
  pipeline_description?: string | null;
  is_discovery_prompts: boolean;
  is_structuring_prompts: boolean;
  discovery_prompts?: Record<string, string> | null; 
  structuring_prompts?: Record<string, string> | null;
  created_at: string; // Or Date
}

// For form data (Create and also shape of data for Edit form state)
export interface PipelineFormData { // Combined for simplicity, 'id' distinguishes create/edit
  id?: number; 
  pipeline_name: string;
  pipeline_description?: string | null;
  is_discovery_prompts: boolean;
  is_structuring_prompts: boolean;
  discovery_prompts_list: string[]; 
  structuring_prompts_list: string[]; // Will store the TEXT of selected templates
}

// For data returned specifically by GET /pipelines/{id} (backend's MicroproductPipelineGetResponse)
export interface PipelineGetResponse extends Pipeline { // Extends basic Pipeline info
  discovery_prompts_list: string[];  // Already a list from backend
  structuring_prompts_list: string[]; // Already a list from backend
}
