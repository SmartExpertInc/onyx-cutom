import { ConnectorFormConfig } from '../ConnectorFormTypes';

export const SlackConfig: ConnectorFormConfig = {
  connectorId: 'slack',
  connectorName: 'Slack',
  submitEndpoint: '/api/custom/smartdrive/connectors/create',
  oauthSupported: true,
  oauthConfig: {
    clientId: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID || '',
    redirectUri: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/oauth/slack/callback`,
    scopes: ['channels:history', 'groups:history', 'im:history', 'mpim:history', 'users:read']
  },
  fields: [
    {
      name: 'name',
      label: 'Connector Name',
      type: 'text',
      required: true,
      placeholder: 'My Slack Workspace',
      description: 'A descriptive name for this Slack connection'
    },
    {
      name: 'slack_bot_token',
      label: 'Bot Token',
      type: 'password',
      required: true,
      placeholder: 'xoxb-...',
      description: 'Your Slack bot token (from Slack app settings)',
      validation: {
        pattern: '^xoxb-[a-zA-Z0-9-]+$',
        message: 'Bot token should start with "xoxb-"'
      }
    },
    {
      name: 'channels',
      label: 'Channels',
      type: 'textarea',
      placeholder: 'Enter channels, one per line',
      description: 'Specific channels to index (leave empty to index all accessible channels)',
      validation: {
        pattern: '^[a-z0-9\\s\\n]*$',
        message: 'Channels should contain only lowercase letters and numbers'
      }
    },
    {
      name: 'include_public_channels',
      label: 'Include Public Channels',
      type: 'boolean',
      defaultValue: true,
      description: 'Whether to include public channels'
    },
    {
      name: 'include_private_channels',
      label: 'Include Private Channels',
      type: 'boolean',
      defaultValue: false,
      description: 'Whether to include private channels you\'re a member of'
    },
    {
      name: 'include_direct_messages',
      label: 'Include Direct Messages',
      type: 'boolean',
      defaultValue: false,
      description: 'Whether to include direct messages'
    },
    {
      name: 'include_threads',
      label: 'Include Threads',
      type: 'boolean',
      defaultValue: true,
      description: 'Whether to include thread replies'
    },
    {
      name: 'message_limit',
      label: 'Message Limit',
      type: 'number',
      defaultValue: 1000,
      description: 'Maximum number of messages to index per channel',
      validation: {
        min: 1,
        max: 10000,
        message: 'Message limit should be between 1 and 10,000'
      }
    }
  ],
  sections: [
    {
      title: 'Basic Configuration',
      description: 'Set up the basic connection to your Slack workspace',
      fields: ['name', 'slack_bot_token']
    },
    {
      title: 'Channel Selection',
      description: 'Configure which channels to include in the index',
      fields: ['channels', 'include_public_channels', 'include_private_channels', 'include_direct_messages']
    },
    {
      title: 'Content Options',
      description: 'Configure what content to include in the index',
      fields: ['include_threads', 'message_limit']
    }
  ]
}; 