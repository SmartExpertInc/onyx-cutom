export interface ConnectorFormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'boolean' | 'file' | 'password';
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: Array<{ value: string; label: string; description?: string }>;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  conditional?: {
    field: string;
    value: any;
    operator: 'equals' | 'not_equals' | 'contains' | 'exists';
  };
}

export interface ConnectorFormConfig {
  connectorId: string;
  connectorName: string;
  fields: ConnectorFormField[];
  sections?: Array<{
    title: string;
    description?: string;
    fields: string[]; // field names
  }>;
  validationSchema?: any; // Yup schema
  submitEndpoint: string;
  oauthSupported?: boolean;
  oauthConfig?: {
    clientId: string;
    redirectUri: string;
    scopes: string[];
  };
}

export interface ConnectorFormData {
  [key: string]: any;
}

export interface ConnectorFormProps {
  connectorId: string;
  connectorName: string;
  onSuccess: (data: any) => void;
  onCancel: () => void;
  initialData?: ConnectorFormData;
} 