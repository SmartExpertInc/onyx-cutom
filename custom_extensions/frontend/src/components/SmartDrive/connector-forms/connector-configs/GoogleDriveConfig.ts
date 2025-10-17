import { ConnectorFormConfig } from '../ConnectorFormTypes';

export const GoogleDriveConfig: ConnectorFormConfig = {
  connectorId: 'google_drive',
  connectorName: 'Google Drive',
  submitEndpoint: '/api/custom/smartdrive/connectors/create',
  oauthSupported: true,
  oauthConfig: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    redirectUri: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/oauth/google-drive/callback`,
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
  },
  fields: [
    {
      name: 'name',
      label: 'Connector Name',
      type: 'text',
      required: true,
      placeholder: 'My Google Drive',
      description: 'A descriptive name for this Google Drive connection'
    },
    {
      name: 'shared_folder_urls',
      label: 'Shared Folder URLs',
      type: 'textarea',
      placeholder: 'Enter folder URLs, one per line (optional)',
      description: 'Specific folder URLs to index (leave empty to index based on options below)',
      validation: {
        pattern: '^[a-zA-Z0-9-_/:\\.\\s\\n]*$',
        message: 'Folder URLs should contain valid URL characters'
      }
    },
    {
      name: 'include_files_shared_with_me',
      label: 'Include Files Shared With Me',
      type: 'boolean',
      defaultValue: true,
      description: 'Whether to include files shared directly with you'
    },
    {
      name: 'include_my_drives',
      label: 'Include My Drives',
      type: 'boolean',
      defaultValue: true,
      description: 'Whether to include files in your personal Google Drive'
    },
    {
      name: 'include_shared_drives',
      label: 'Include Shared Drives',
      type: 'boolean',
      defaultValue: false,
      description: 'Whether to include shared team drives'
    }
  ]
}; 