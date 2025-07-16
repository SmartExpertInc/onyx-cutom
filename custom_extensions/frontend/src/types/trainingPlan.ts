// custom_extensions/frontend/src/types/trainingPlan.ts
// (or rename to a more general name like projectSpecificTypes.ts if it includes more than just training plans)

export interface StatusInfo {
  type: string;
  text: string;
}

export interface Lesson {
  id?: string; // Optional if dynamically generated on frontend before save
  title: string;
  check: StatusInfo;
  contentAvailable: StatusInfo;
  source: string;
  hours: number;
  completionTime: string; // Estimated completion time in minutes (e.g., "5m", "6m", "7m", "8m")
  custom_rate?: number; // Individual lesson-level custom rate override
  quality_tier?: string; // Individual lesson-level quality tier override
}

export interface Section {
  id: string; // Can be a unique string like "Module 1" or "S_123"
  title: string;
  totalHours: number;
  lessons: Lesson[];
  autoCalculateHours?: boolean; // Keep for TrainingPlanTable editor
  custom_rate?: number; // Module-level custom rate override
  quality_tier?: string; // Module-level quality tier override
}

export interface DisplayOptions {
  knowledgeCheck: boolean;
  contentAvailability: boolean;
  informationSource: boolean;
  estCreationTime: boolean;
  estCompletionTime: boolean;
  qualityTier: boolean;
}

export interface TrainingPlanData { // This can be the generic structure for microProductContent
  mainTitle?: string | null;
  sections: Section[];
  detectedLanguage?: string | null;
  displayOptions?: DisplayOptions; // NEW: column visibility settings chosen during creation
  theme?: string; // Theme selection for styling
}

// For fetching project details for the edit page
export interface ProjectDetailDataForEdit {
  id: number;
  projectName: string;
  // product?: string | null; // Removed from direct edit, derived from design
  // microProductType?: string | null; // Removed from direct edit, derived from design
  microProductName?: string | null;    // This is the specific name of the project instance
  design_template_id?: number | null; // ID of the selected design template
  microProductContent?: TrainingPlanData | null; // The actual content, structured as per design
  createdAt?: string | Date | null;

  // Information from the linked design template (read-only on edit page, for context)
  design_template_name?: string | null;
  design_component_name?: string | null;
  design_image_path?: string | null;
}

// Type for the project list API response (simplified)
export interface ProjectListItem {
  id: number;
  projectName: string;
  projectSlug: string; // Slug of the project name
  microproduct_name?: string | null; // Specific name for this instance of the design
  design_template_name?: string | null; // Name of the design template used
  design_microproduct_type?: string | null; // Category of the design template
  created_at: string | Date;
  design_template_id?: number | null;
}

// For the detailed view of a project instance (what was MicroProductDetail)
export interface ProjectInstanceDetail {
  name: string; // microproduct_name from ProjectDB, or project_name as fallback
  slug: string; // slug of the name
  project_id: number;
  design_template_id: number;
  component_name: string; // From DesignTemplate, determines how to render 'details'
  webLinkPath?: string | null;
  pdfLinkPath?: string | null;
  details?: TrainingPlanData | null; // The actual content
}
