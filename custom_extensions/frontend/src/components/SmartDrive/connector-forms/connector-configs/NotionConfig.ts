import { ConnectorFormConfig } from '../ConnectorFormTypes';

export const NotionConfig: ConnectorFormConfig = {
  connectorId: 'notion',
  connectorName: 'Notion',
  submitEndpoint: '/api/custom/smartdrive/connectors/create',
  oauthSupported: true,
  oauthConfig: {
    clientId: process.env.NEXT_PUBLIC_NOTION_CLIENT_ID || '',
    redirectUri: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/oauth/notion/callback`,
    scopes: ['read']
  },
  fields: [
    {
      name: 'name',
      label: 'Connector Name',
      type: 'text',
      required: true,
      placeholder: 'My Notion Workspace',
      description: 'A descriptive name for this Notion connection'
    },
    {
      name: 'notion_integration_token',
      label: 'Integration Token',
      type: 'password',
      required: true,
      placeholder: 'secret_...',
      description: 'Your Notion integration access token (from Notion integration settings)',
      validation: {
        pattern: '^secret_[a-zA-Z0-9]+$',
        message: 'Integration token should start with "secret_"'
      }
    },
    {
      name: 'include_comments',
      label: 'Include Comments',
      type: 'boolean',
      defaultValue: false,
      description: 'Whether to include comments in the indexed content'
    },
    {
      name: 'include_archived',
      label: 'Include Archived Pages',
      type: 'boolean',
      defaultValue: false,
      description: 'Whether to include archived pages in the index'
    }
  ],
  sections: [
    {
      title: 'Basic Configuration',
      description: 'Set up the basic connection to your Notion workspace',
      fields: ['name', 'notion_integration_token']
    },
    {
      title: 'Content Options',
      description: 'Configure what content to include in the index',
      fields: ['include_comments', 'include_archived']
    }
  ]
}; 