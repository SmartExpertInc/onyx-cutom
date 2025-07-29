// custom_extensions/frontend/src/types/products.ts
// This file might need to be renamed or its contents re-evaluated
// as "Product" and "MicroProduct" concepts have changed.

// Old structures - to be removed or refactored
// export interface MicroProduct {
//   name: string;
//   slug: string;
//   webLinkPath?: string;
//   pdfLinkPath?: string;
//   details?: any; // Kept as any for now, will be specific based on component
// }

// export interface Project {
//   id: number;
//   projectName: string;
//   projectSlug: string;
//   product: string; // This will be removed
//   productSlug: string; // This will be removed
//   microProduct: MicroProduct; // This structure will change
// }

// New structure for listing projects
export interface ProjectListItem {
  id: number;
  projectName: string;
  // projectSlug: string; // Frontend can derive this
  designTemplateName: string | null;
  design_microproduct_type: string | null;
  microProductName: string | null; // User-defined name for this instance
  createdAt: string; // Assuming ISO string date
  viewLinkPath: string;
  pdfLinkPath: string;
}

// New structure for viewing project details
export interface ProjectViewDetails {
  id: number;
  projectName: string;
  microProductName: string | null;
  designTemplateName: string | null;
  componentName: string | null; // Crucial for frontend component rendering
  microProductContent: any; // The parsed JSON content
  createdAt: string; // Assuming ISO string date
}

// For editing a project
export interface ProjectDetailForEdit {
  id: number;
  projectName:string;
  design_template_id: number | null;
  microProductName: string | null;
  aiResponse: string | null; // Raw AI response text
  createdAt?: string;
}

// If TrainingPlanDetails is still a common structure, keep its definition
// (It's also defined in TrainingPlanTable.tsx, consider a shared types file)
export interface StatusInfo {
  type: string;
  text: string;
}

export interface LessonDetail {
  title: string;
  check: StatusInfo;
  contentAvailable: StatusInfo;
  source: string;
  hours: number;
}

export interface SectionDetail {
  id: string;
  title: string;
  totalHours: number;
  lessons: LessonDetail[];
  autoCalculateHours?: boolean;
}

export interface TrainingPlanDetails {
  mainTitle?: string | null;
  sections: SectionDetail[];
  detectedLanguage?: string | null;
}
