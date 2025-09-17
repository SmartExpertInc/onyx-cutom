// Exact Onyx connector configurations copied from web/src/lib/connectors/connectors.tsx

export interface ConnectorField {
  type: "text" | "select" | "checkbox" | "number" | "list" | "file" | "tab" | "string_tab";
  label: string;
  name: string;
  query?: string;
  optional?: boolean;
  description?: string;
  options?: Array<{ name: string; value: string; description?: string }>;
  default?: any;
  isTextArea?: boolean;
  hidden?: boolean;
  tabs?: Array<{
    value: string;
    label: string;
    fields: ConnectorField[];
  }>;
}

export interface ConnectorConfig {
  description: string;
  values: ConnectorField[];
  advanced_values: ConnectorField[];
  overrideDefaultFreq?: number;
  initialConnectorName?: string;
  advancedValuesVisibleCondition?: (values: any, currentCredential: any) => boolean;
}

export const onyxConnectorConfigs: Record<string, ConnectorConfig> = {
  web: {
    description: "Configure Web connector",
    values: [
      {
        type: "text",
        query: "Enter the website URL to scrape e.g. https://docs.onyx.app/:",
        label: "Base URL",
        name: "base_url",
        optional: false,
      },
      {
        type: "select",
        query: "Select the web connector type:",
        label: "Scrape Method",
        name: "web_connector_type",
        options: [
          { name: "recursive", value: "recursive" },
          { name: "single", value: "single" },
          { name: "sitemap", value: "sitemap" },
        ],
      },
    ],
    advanced_values: [
      {
        type: "checkbox",
        query: "Scroll before scraping:",
        label: "Scroll before scraping",
        description:
          "Enable if the website requires scrolling for the desired content to load",
        name: "scroll_before_scraping",
        optional: true,
      },
    ],
    overrideDefaultFreq: 60 * 60 * 24,
  },
  github: {
    description: "Configure GitHub connector",
    values: [
      {
        type: "text",
        query: "Enter the GitHub username or organization:",
        label: "Repository Owner",
        name: "repo_owner",
        optional: false,
      },
      {
        type: "tab",
        name: "github_mode",
        label: "What should we index from GitHub?",
        optional: true,
        tabs: [
          {
            value: "repo",
            label: "Specific Repository",
            fields: [
              {
                type: "text",
                query: "Enter the repository name(s):",
                label: "Repository Name(s)",
                name: "repositories",
                optional: false,
                description:
                  "For multiple repositories, enter comma-separated names (e.g., repo1,repo2,repo3)",
              },
            ],
          },
          {
            value: "everything",
            label: "Everything",
            fields: [
              {
                type: "string_tab",
                label: "Everything",
                name: "everything",
                description:
                  "This connector will index all repositories the provided credentials have access to!",
              },
            ],
          },
        ],
      },
      {
        type: "checkbox",
        query: "Include pull requests?",
        label: "Include pull requests?",
        description: "Index pull requests from repositories",
        name: "include_prs",
        optional: true,
      },
      {
        type: "checkbox",
        query: "Include issues?",
        label: "Include Issues?",
        name: "include_issues",
        description: "Index issues from repositories",
        optional: true,
      },
    ],
    advanced_values: [],
  },
  gitlab: {
    description: "Configure GitLab connector",
    values: [
      {
        type: "text",
        query: "Enter the project owner:",
        label: "Project Owner",
        name: "project_owner",
        optional: false,
      },
      {
        type: "text",
        query: "Enter the project name:",
        label: "Project Name",
        name: "project_name",
        optional: false,
      },
    ],
    advanced_values: [
      {
        type: "checkbox",
        query: "Include merge requests?",
        label: "Include MRs",
        name: "include_mrs",
        description: "Index merge requests from repositories",
        default: true,
      },
      {
        type: "checkbox",
        query: "Include issues?",
        label: "Include Issues",
        name: "include_issues",
        description: "Index issues from repositories",
        default: true,
      },
    ],
  },
  gitbook: {
    description: "Configure GitBook connector",
    values: [
      {
        type: "text",
        query: "Enter the space ID:",
        label: "Space ID",
        name: "space_id",
        optional: false,
        description:
          "The ID of the GitBook space to index. This can be found in the URL " +
          "of a page in the space. For example, if your URL looks like " +
          "`https://app.gitbook.com/o/ccLx08XZ5wZ54LwdP9QU/s/8JkzVx8QCIGRrmxhGHU8/`, " +
          "then your space ID is `8JkzVx8QCIGRrmxhGHU8`.",
      },
    ],
    advanced_values: [],
  },
  notion: {
    description: "Configure Notion connector",
    values: [
      {
        type: "text",
        query: "Enter the root page ID",
        label: "Root Page ID",
        name: "root_page_id",
        optional: true,
        description:
          "If specified, will only index the specified page + all of its child pages. If left blank, will index all pages the integration has been given access to.",
      },
    ],
    advanced_values: [],
  },
  slack: {
    description: "Configure Slack connector",
    values: [
      {
        type: "list",
        query: "Enter channel IDs:",
        label: "Channel IDs",
        name: "channel_ids",
        description: "Specify 0 or more channel IDs to index from.",
        optional: true,
      },
      {
        type: "checkbox",
        query: "Include public channels?",
        label: "Include Public Channels",
        name: "include_public_channels",
        description: "Index all public channels in the workspace",
        optional: true,
        default: true,
      },
      {
        type: "checkbox",
        query: "Include private channels?",
        label: "Include Private Channels",
        name: "include_private_channels",
        description: "Index private channels you're a member of",
        optional: true,
        default: false,
      },
      {
        type: "checkbox",
        query: "Include direct messages?",
        label: "Include Direct Messages",
        name: "include_direct_messages",
        description: "Index direct messages",
        optional: true,
        default: false,
      },
      {
        type: "checkbox",
        query: "Include thread replies?",
        label: "Include Thread Replies",
        name: "include_thread_replies",
        description: "Index thread replies in addition to main messages",
        optional: true,
        default: true,
      },
    ],
    advanced_values: [
      {
        type: "number",
        query: "Message limit per channel:",
        label: "Message Limit",
        name: "message_limit",
        description: "Maximum number of messages to index per channel",
        optional: true,
        default: 1000,
      },
    ],
  },
  confluence: {
    description: "Configure Confluence connector",
    values: [
      {
        type: "text",
        query: "Enter the Confluence URL:",
        label: "Confluence URL",
        name: "confluence_url",
        optional: false,
        description: "The URL of your Confluence instance (e.g., https://your-domain.atlassian.net)",
      },
      {
        type: "list",
        query: "Enter space keys:",
        label: "Space Keys",
        name: "space_keys",
        description: "Specify 0 or more space keys to index from. If none specified, will index all accessible spaces.",
        optional: true,
      },
      {
        type: "checkbox",
        query: "Include attachments?",
        label: "Include Attachments",
        name: "include_attachments",
        description: "Index file attachments in addition to page content",
        optional: true,
        default: true,
      },
    ],
    advanced_values: [],
  },
  jira: {
    description: "Configure Jira connector",
    values: [
      {
        type: "text",
        query: "Enter the Jira URL:",
        label: "Jira URL",
        name: "jira_url",
        optional: false,
        description: "The URL of your Jira instance (e.g., https://your-domain.atlassian.net)",
      },
      {
        type: "list",
        query: "Enter project keys:",
        label: "Project Keys",
        name: "project_keys",
        description: "Specify 0 or more project keys to index from. If none specified, will index all accessible projects.",
        optional: true,
      },
      {
        type: "checkbox",
        query: "Include issues?",
        label: "Include Issues",
        name: "include_issues",
        description: "Index Jira issues",
        optional: true,
        default: true,
      },
      {
        type: "checkbox",
        query: "Include comments?",
        label: "Include Comments",
        name: "include_comments",
        description: "Index issue comments in addition to issue content",
        optional: true,
        default: true,
      },
    ],
    advanced_values: [],
  },
  clickup: {
    description: "Configure ClickUp connector",
    values: [
      {
        type: "select",
        query: "Select the connector type:",
        label: "Connector Type",
        name: "connector_type",
        optional: false,
        options: [
          { name: "list", value: "list" },
          { name: "folder", value: "folder" },
          { name: "space", value: "space" },
          { name: "workspace", value: "workspace" },
        ],
      },
      {
        type: "list",
        query: "Enter connector IDs:",
        label: "Connector IDs",
        name: "connector_ids",
        description: "Specify 0 or more id(s) to index from.",
        optional: true,
      },
      {
        type: "checkbox",
        query: "Retrieve task comments?",
        label: "Retrieve Task Comments",
        name: "retrieve_task_comments",
        description:
          "If checked, then all the comments for each task will also be retrieved and indexed.",
        optional: false,
      },
    ],
    advanced_values: [],
  },
  google_drive: {
    description: "Configure Google Drive connector",
    values: [
      {
        type: "tab",
        name: "indexing_scope",
        label: "How should we index your Google Drive?",
        optional: true,
        tabs: [
          {
            value: "specific_folders",
            label: "Specific Folders",
            fields: [
              {
                type: "list",
                query: "Enter folder IDs:",
                label: "Folder IDs",
                name: "folder_ids",
                description: "Specify 0 or more folder IDs to index from.",
                optional: true,
              },
            ],
          },
          {
            value: "everything",
            label: "Everything",
            fields: [
              {
                type: "string_tab",
                label: "Everything",
                name: "everything",
                description:
                  "This connector will index all files and folders the provided credentials have access to!",
              },
            ],
          },
        ],
      },
      {
        type: "checkbox",
        query: "Include shared folders?",
        label: "Include Shared Folders",
        name: "include_shared_folders",
        description: "Index folders shared with you",
        optional: true,
        default: true,
      },
      {
        type: "checkbox",
        query: "Include my drive?",
        label: "Include My Drive",
        name: "include_my_drive",
        description: "Index files in your personal Google Drive",
        optional: true,
        default: true,
      },
    ],
    advanced_values: [
      {
        type: "list",
        query: "File types to index:",
        label: "File Types",
        name: "file_types",
        description: "Specify which file types to include in the index",
        optional: true,
        default: ["document", "spreadsheet", "presentation", "pdf"],
      },
    ],
  },
  zendesk: {
    description: "Configure Zendesk connector",
    values: [
      {
        type: "text",
        query: "Enter the Zendesk subdomain:",
        label: "Subdomain",
        name: "zendesk_subdomain",
        optional: false,
        description: "Your Zendesk subdomain (without .zendesk.com)",
      },
      {
        type: "checkbox",
        query: "Include tickets?",
        label: "Include Tickets",
        name: "include_tickets",
        description: "Index Zendesk tickets",
        optional: true,
        default: true,
      },
      {
        type: "checkbox",
        query: "Include articles?",
        label: "Include Articles",
        name: "include_articles",
        description: "Index help center articles",
        optional: true,
        default: true,
      },
    ],
    advanced_values: [],
  },
  asana: {
    description: "Configure Asana connector",
    values: [
      {
        type: "list",
        query: "Enter project IDs:",
        label: "Project IDs",
        name: "project_ids",
        description: "Specify 0 or more project IDs to index from. If none specified, will index all accessible projects.",
        optional: true,
      },
      {
        type: "checkbox",
        query: "Include tasks?",
        label: "Include Tasks",
        name: "include_tasks",
        description: "Index Asana tasks",
        optional: true,
        default: true,
      },
      {
        type: "checkbox",
        query: "Include comments?",
        label: "Include Comments",
        name: "include_comments",
        description: "Index task comments in addition to task content",
        optional: true,
        default: true,
      },
    ],
    advanced_values: [],
  },
  airtable: {
    description: "Configure Airtable connector",
    values: [
      {
        type: "text",
        query: "Enter the base ID:",
        label: "Base ID",
        name: "base_id",
        optional: false,
        description: "The ID of the Airtable base to index.",
      },
      {
        type: "text",
        query: "Enter the table name or ID:",
        label: "Table Name or Table ID",
        name: "table_name_or_id",
        optional: false,
      },
      {
        type: "checkbox",
        label: "Treat all fields except attachments as metadata",
        name: "treat_all_non_attachment_fields_as_metadata",
        description:
          "Choose this if the primary content to index are attachments and all other columns are metadata for these attachments.",
        optional: false,
      },
    ],
    advanced_values: [
      {
        type: "text",
        label: "View ID",
        name: "view_id",
        optional: true,
        description:
          "If you need to link to a specific View, put that ID here e.g. viwVUEJjWPd8XYjh8.",
      },
      {
        type: "text",
        label: "Share ID",
        name: "share_id",
        optional: true,
        description:
          "If you need to link to a specific Share, put that ID here e.g. shrkfjEzDmLaDtK83.",
      },
    ],
    overrideDefaultFreq: 60 * 60 * 24,
  },
  sharepoint: {
    description: "Configure SharePoint connector",
    values: [
      {
        type: "list",
        query: "Enter SharePoint sites:",
        label: "Sites",
        name: "sites",
        optional: true,
        description: `• If no sites are specified, all sites in your organization will be indexed (Sites.Read.All permission required).\n\n• Specifying 'https://example.sharepoint.com/sites/support' will only index documents within this site.\n\n• Specifying 'https://example.sharepoint.com/sites/support/subfolder' will only index documents within this folder.`,
      },
    ],
    advanced_values: [],
  },
  teams: {
    description: "Configure Teams connector",
    values: [
      {
        type: "list",
        query: "Enter Teams to include:",
        label: "Teams",
        name: "teams",
        optional: true,
        description: `Specify 0 or more Teams to index. If no Teams are specified, all Teams in your organization will be indexed.`,
      },
    ],
    advanced_values: [],
  },
  discourse: {
    description: "Configure Discourse connector",
    values: [
      {
        type: "text",
        query: "Enter the base URL:",
        label: "Base URL",
        name: "base_url",
        optional: false,
      },
      {
        type: "list",
        query: "Enter categories to include:",
        label: "Categories",
        name: "categories",
        optional: true,
      },
    ],
    advanced_values: [],
  },
  axero: {
    description: "Configure Axero connector",
    values: [
      {
        type: "list",
        query: "Enter spaces to include:",
        label: "Spaces",
        name: "spaces",
        optional: true,
        description:
          "Specify zero or more Spaces to index (by the Space IDs). If no Space IDs are specified, all Spaces will be indexed.",
      },
    ],
    advanced_values: [],
    overrideDefaultFreq: 60 * 60 * 24,
  },
  productboard: {
    description: "Configure Productboard connector",
    values: [],
    advanced_values: [],
  },
  salesforce: {
    description: "Configure Salesforce connector",
    values: [
      {
        type: "list",
        query: "Enter requested objects:",
        label: "Requested Objects",
        name: "requested_objects",
        optional: true,
        description: `Specify the Salesforce object types you want to index. If unsure, leave blank to index Accounts by default.\n\nHint: Use the singular form (e.g., 'Opportunity' not 'Opportunities').`,
      },
    ],
    advanced_values: [],
  },
  highspot: {
    description: "Configure Highspot connector",
    values: [],
    advanced_values: [],
  },
  discord: {
    description: "Configure Discord connector",
    values: [
      {
        type: "text",
        query: "Enter the server ID:",
        label: "Server ID",
        name: "server_id",
        optional: false,
        description: "The ID of the Discord server to index",
      },
      {
        type: "list",
        query: "Enter channel IDs:",
        label: "Channel IDs",
        name: "channel_ids",
        description: "Specify 0 or more channel IDs to index from. If none specified, will index all accessible channels.",
        optional: true,
      },
      {
        type: "checkbox",
        query: "Include direct messages?",
        label: "Include Direct Messages",
        name: "include_direct_messages",
        description: "Index direct messages",
        optional: true,
        default: false,
      },
    ],
    advanced_values: [],
  },
  document360: {
    description: "Configure Document360 connector",
    values: [
      {
        type: "text",
        query: "Enter the workspace:",
        label: "Workspace",
        name: "workspace",
        optional: false,
      },
      {
        type: "list",
        query: "Enter categories to include:",
        label: "Categories",
        name: "categories",
        optional: true,
        description:
          "Specify 0 or more categories to index. For instance, specifying the category 'Help' will cause us to only index all content within the 'Help' category. If no categories are specified, all categories in your workspace will be indexed.",
      },
    ],
    advanced_values: [],
  },
  google_sites: {
    description: "Configure Google Sites connector",
    values: [
      {
        type: "file",
        query: "Enter the zip path:",
        label: "File Locations",
        name: "file_locations",
        optional: false,
        description:
          "Upload a zip file containing the HTML of your Google Site",
      },
      {
        type: "text",
        query: "Enter the base URL:",
        label: "Base URL",
        name: "base_url",
        optional: false,
      },
    ],
    advanced_values: [],
  },
  // Add more connectors as needed...
}; 