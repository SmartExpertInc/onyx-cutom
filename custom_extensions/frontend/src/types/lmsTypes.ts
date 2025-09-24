export type LMSAccountStatus = 'unknown' | 'has-account' | 'no-account' | 'setup-complete';

export interface Product {
  id: number;
  // Field names from API response
  projectName?: string;
  projectSlug?: string;
  microproduct_name?: string;
  design_template_name?: string;
  design_microproduct_type?: string;
  design_template_id?: number;
  folder_id?: number | null;
  order?: number;
  source_chat_session_id?: string | null;
  is_standalone?: boolean;
  
  // Legacy field names for compatibility
  name?: string;
  title?: string;
  instanceName?: string;
  designMicroproductType?: string;
  quality_tier?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  user_id?: string;
  [key: string]: any;
}

export interface LMSExportState {
  lmsAccountStatus: LMSAccountStatus;
  selectedProducts: Set<number>;
  isExporting: boolean;
  showAccountModal: boolean;
} 