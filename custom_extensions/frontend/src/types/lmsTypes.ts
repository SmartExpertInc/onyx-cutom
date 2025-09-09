export type LMSAccountStatus = 'unknown' | 'has-account' | 'no-account' | 'setup-complete';

export interface Product {
  id: number;
  name: string;
  designMicroproductType: string;
  quality_tier?: string;
  created_at: string;
  updated_at?: string;
  folder_id?: number | null;
  user_id?: string;
  [key: string]: any;
}

export interface LMSExportState {
  lmsAccountStatus: LMSAccountStatus;
  selectedProducts: Set<number>;
  isExporting: boolean;
  showAccountModal: boolean;
} 