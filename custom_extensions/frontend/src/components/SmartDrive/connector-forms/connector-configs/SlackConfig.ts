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
      name: 'channel_regex_enabled',
      label: 'Enable Channel Regex',
      type: 'boolean',
      defaultValue: false,
      description: 'If enabled, we will treat the "channels" specified above as regular expressions. A channel\'s messages will be pulled in by the connector if the name of the channel fully matches any of the specified regular expressions. For example, specifying .*-support.* as a "channel" will cause the connector to include any channels with "-support" in the name.'
    },
    {
      name: "indexing_start",
      label: "Start Date",
      type: "text",
      placeholder: "YYYY-MM-DD",
      description: `Only messages after this date will be indexed. Format: YYYY-MM-DD`,
    },
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
      fields: ['channels', 'channel_regex_enabled']
    },
    {
      title: 'Content Options',
      description: 'Configure what content to include in the index',
      fields: ['indexing_start']
    }
  ]
}; 