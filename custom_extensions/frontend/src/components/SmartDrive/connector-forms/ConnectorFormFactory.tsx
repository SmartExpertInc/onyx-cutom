"use client";

import React from 'react';
import { ConnectorFormProps } from './ConnectorFormTypes';
import BaseConnectorForm from './BaseConnectorForm';

// Import all connector configurations
import { NotionConfig } from './connector-configs/NotionConfig';
import { GoogleDriveConfig } from './connector-configs/GoogleDriveConfig';
import { SlackConfig } from './connector-configs/SlackConfig';

// Map of connector IDs to their configurations
const connectorConfigs: Record<string, any> = {
  'notion': NotionConfig,
  'google_drive': GoogleDriveConfig,
  'slack': SlackConfig,
  // Add more configurations as needed
  'github': {
    connectorId: 'github',
    connectorName: 'GitHub',
    submitEndpoint: '/api/custom/smartdrive/connectors/create',
    oauthSupported: true,
    fields: [
      {
        name: 'name',
        label: 'Connector Name',
        type: 'text',
        required: true,
        placeholder: 'My GitHub Repository',
        description: 'A descriptive name for this GitHub connection'
      },
      {
        name: 'github_access_token',
        label: 'GitHub Access Token',
        type: 'password',
        required: true,
        placeholder: 'ghp_...',
        description: 'Your GitHub personal access token',
        validation: {
          pattern: '^ghp_[a-zA-Z0-9]+$',
          message: 'GitHub token should start with "ghp_"'
        }
      },
      {
        name: 'repository',
        label: 'Repository',
        type: 'text',
        required: true,
        placeholder: 'owner/repository',
        description: 'Repository in format owner/repository'
      },
      {
        name: 'include_issues',
        label: 'Include Issues',
        type: 'boolean',
        defaultValue: true,
        description: 'Whether to include issues in the index'
      },
      {
        name: 'include_pull_requests',
        label: 'Include Pull Requests',
        type: 'boolean',
        defaultValue: true,
        description: 'Whether to include pull requests in the index'
      },
      {
        name: 'include_wiki',
        label: 'Include Wiki',
        type: 'boolean',
        defaultValue: false,
        description: 'Whether to include wiki pages in the index'
      }
    ]
  },
  'confluence': {
    connectorId: 'confluence',
    connectorName: 'Confluence',
    submitEndpoint: '/api/custom/smartdrive/connectors/create',
    oauthSupported: true,
    fields: [
      {
        name: 'name',
        label: 'Connector Name',
        type: 'text',
        required: true,
        placeholder: 'My Confluence Space',
        description: 'A descriptive name for this Confluence connection'
      },
      {
        name: 'base_url',
        label: 'Confluence URL',
        type: 'text',
        required: true,
        placeholder: 'https://your-domain.atlassian.net',
        description: 'Your Confluence instance URL',
        validation: {
          pattern: '^https://.*',
          message: 'URL must start with https://'
        }
      },
      {
        name: 'space_keys',
        label: 'Space Keys',
        type: 'textarea',
        placeholder: 'Enter space keys, one per line',
        description: 'Specific space keys to index (leave empty to index all accessible spaces)'
      },
      {
        name: 'include_attachments',
        label: 'Include Attachments',
        type: 'boolean',
        defaultValue: true,
        description: 'Whether to include file attachments in the index'
      }
    ]
  },
  'jira': {
    connectorId: 'jira',
    connectorName: 'Jira',
    submitEndpoint: '/api/custom/smartdrive/connectors/create',
    oauthSupported: true,
    fields: [
      {
        name: 'name',
        label: 'Connector Name',
        type: 'text',
        required: true,
        placeholder: 'My Jira Project',
        description: 'A descriptive name for this Jira connection'
      },
      {
        name: 'base_url',
        label: 'Jira URL',
        type: 'text',
        required: true,
        placeholder: 'https://your-domain.atlassian.net',
        description: 'Your Jira instance URL',
        validation: {
          pattern: '^https://.*',
          message: 'URL must start with https://'
        }
      },
      {
        name: 'project_keys',
        label: 'Project Keys',
        type: 'textarea',
        placeholder: 'Enter project keys, one per line',
        description: 'Specific project keys to index (leave empty to index all accessible projects)'
      },
      {
        name: 'include_issues',
        label: 'Include Issues',
        type: 'boolean',
        defaultValue: true,
        description: 'Whether to include issues in the index'
      },
      {
        name: 'include_comments',
        label: 'Include Comments',
        type: 'boolean',
        defaultValue: true,
        description: 'Whether to include issue comments in the index'
      }
    ]
  },
  'dropbox': {
    connectorId: 'dropbox',
    connectorName: 'Dropbox',
    submitEndpoint: '/api/custom/smartdrive/connectors/create',
    oauthSupported: true,
    fields: [
      {
        name: 'name',
        label: 'Connector Name',
        type: 'text',
        required: true,
        placeholder: 'My Dropbox',
        description: 'A descriptive name for this Dropbox connection'
      },
      {
        name: 'folder_paths',
        label: 'Folder Paths',
        type: 'textarea',
        placeholder: 'Enter folder paths, one per line',
        description: 'Specific folder paths to index (leave empty to index all accessible folders)'
      },
      {
        name: 'include_shared',
        label: 'Include Shared Folders',
        type: 'boolean',
        defaultValue: true,
        description: 'Whether to include folders shared with you'
      }
    ]
  },
  'discord': {
    connectorId: 'discord',
    connectorName: 'Discord',
    submitEndpoint: '/api/custom/smartdrive/connectors/create',
    oauthSupported: true,
    fields: [
      {
        name: 'name',
        label: 'Connector Name',
        type: 'text',
        required: true,
        placeholder: 'My Discord Server',
        description: 'A descriptive name for this Discord connection'
      },
      {
        name: 'server_id',
        label: 'Server ID',
        type: 'text',
        required: true,
        placeholder: 'Server ID',
        description: 'The Discord server ID to index'
      },
      {
        name: 'channel_ids',
        label: 'Channel IDs',
        type: 'textarea',
        placeholder: 'Enter channel IDs, one per line',
        description: 'Specific channel IDs to index (leave empty to index all accessible channels)'
      },
      {
        name: 'include_dms',
        label: 'Include Direct Messages',
        type: 'boolean',
        defaultValue: false,
        description: 'Whether to include direct messages'
      }
    ]
  },
  'zendesk': {
    connectorId: 'zendesk',
    connectorName: 'Zendesk',
    submitEndpoint: '/api/custom/smartdrive/connectors/create',
    oauthSupported: true,
    fields: [
      {
        name: 'name',
        label: 'Connector Name',
        type: 'text',
        required: true,
        placeholder: 'My Zendesk',
        description: 'A descriptive name for this Zendesk connection'
      },
      {
        name: 'zendesk_subdomain',
        label: 'Subdomain',
        type: 'text',
        required: true,
        placeholder: 'your-subdomain',
        description: 'Your Zendesk subdomain (without .zendesk.com)'
      },
      {
        name: 'zendesk_email',
        label: 'Email',
        type: 'text',
        required: true,
        placeholder: 'your-email@company.com',
        description: 'Your Zendesk account email'
      },
      {
        name: 'zendesk_token',
        label: 'API Token',
        type: 'password',
        required: true,
        placeholder: 'Your API token',
        description: 'Your Zendesk API token'
      },
      {
        name: 'include_tickets',
        label: 'Include Tickets',
        type: 'boolean',
        defaultValue: true,
        description: 'Whether to include tickets in the index'
      },
      {
        name: 'include_articles',
        label: 'Include Articles',
        type: 'boolean',
        defaultValue: true,
        description: 'Whether to include help center articles in the index'
      }
    ]
  },
  'asana': {
    connectorId: 'asana',
    connectorName: 'Asana',
    submitEndpoint: '/api/custom/smartdrive/connectors/create',
    oauthSupported: true,
    fields: [
      {
        name: 'name',
        label: 'Connector Name',
        type: 'text',
        required: true,
        placeholder: 'My Asana Workspace',
        description: 'A descriptive name for this Asana connection'
      },
      {
        name: 'asana_api_token_secret',
        label: 'API Token',
        type: 'password',
        required: true,
        placeholder: 'Your Asana API token',
        description: 'Your personal access token from Asana'
      },
      {
        name: 'project_ids',
        label: 'Project IDs',
        type: 'textarea',
        placeholder: 'Enter project IDs, one per line',
        description: 'Specific project IDs to index (leave empty to index all accessible projects)'
      },
      {
        name: 'include_tasks',
        label: 'Include Tasks',
        type: 'boolean',
        defaultValue: true,
        description: 'Whether to include tasks in the index'
      },
      {
        name: 'include_comments',
        label: 'Include Comments',
        type: 'boolean',
        defaultValue: true,
        description: 'Whether to include task comments in the index'
      }
    ]
  },
  'airtable': {
    connectorId: 'airtable',
    connectorName: 'Airtable',
    submitEndpoint: '/api/custom/smartdrive/connectors/create',
    oauthSupported: true,
    fields: [
      {
        name: 'name',
        label: 'Connector Name',
        type: 'text',
        required: true,
        placeholder: 'My Airtable Base',
        description: 'A descriptive name for this Airtable connection'
      },
      {
        name: 'base_id',
        label: 'Base ID',
        type: 'text',
        required: true,
        placeholder: 'Base ID',
        description: 'The Airtable base ID to index'
      },
      {
        name: 'table_ids',
        label: 'Table IDs',
        type: 'textarea',
        placeholder: 'Enter table IDs, one per line',
        description: 'Specific table IDs to index (leave empty to index all tables)'
      }
    ]
  }
};

interface ConnectorFormFactoryProps extends ConnectorFormProps {
  connectorId: string;
}

const ConnectorFormFactory: React.FC<ConnectorFormFactoryProps> = ({
  connectorId,
  connectorName,
  onSuccess,
  onCancel,
  initialData
}) => {
  const config = connectorConfigs[connectorId];

  if (!config) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Connector Not Supported
          </h2>
          <p className="text-gray-600 mb-6">
            The connector "{connectorName}" is not yet supported in the custom form system.
          </p>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <BaseConnectorForm
      config={config}
      connectorId={connectorId}
      connectorName={connectorName}
      onSuccess={onSuccess}
      onCancel={onCancel}
      initialData={initialData}
    />
  );
};

export default ConnectorFormFactory; 