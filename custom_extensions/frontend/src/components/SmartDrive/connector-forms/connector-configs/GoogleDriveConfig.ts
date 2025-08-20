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
      name: 'folder_ids',
      label: 'Folder IDs',
      type: 'textarea',
      placeholder: 'Enter folder IDs, one per line',
      description: 'Specific folder IDs to index (leave empty to index all accessible folders)',
      validation: {
        pattern: '^[a-zA-Z0-9-_\\s\\n]*$',
        message: 'Folder IDs should contain only letters, numbers, hyphens, and underscores'
      }
    },
    {
      name: 'include_shared',
      label: 'Include Shared Folders',
      type: 'boolean',
      defaultValue: true,
      description: 'Whether to include folders shared with you'
    },
    {
      name: 'include_my_drive',
      label: 'Include My Drive',
      type: 'boolean',
      defaultValue: true,
      description: 'Whether to include files in your personal Google Drive'
    },
    {
      name: 'file_types',
      label: 'File Types to Index',
      type: 'multiselect',
      defaultValue: ['document', 'spreadsheet', 'presentation', 'pdf'],
      options: [
        { value: 'document', label: 'Google Docs' },
        { value: 'spreadsheet', label: 'Google Sheets' },
        { value: 'presentation', label: 'Google Slides' },
        { value: 'pdf', label: 'PDF Files' },
        { value: 'image', label: 'Images' },
        { value: 'video', label: 'Videos' }
      ],
      description: 'Select which file types to include in the index'
    }
  ],
  sections: [
    {
      title: 'Basic Configuration',
      description: 'Set up the basic connection to your Google Drive',
      fields: ['name']
    },
    {
      title: 'Content Selection',
      description: 'Configure what content to include in the index',
      fields: ['folder_ids', 'include_shared', 'include_my_drive', 'file_types']
    }
  ]
}; 