// Exact Onyx connector configurations copied from web/src/lib/connectors/connectors.tsx

export interface ConnectorField {
  type: "text" | "select" | "checkbox" | "number" | "list" | "file" | "tab" | "string_tab";
  label: string | ((currentCredential: any) => string);
  name: string;
  query?: string;
  optional?: boolean;
  description?: string | ((currentCredential: any) => string);
  options?: Array<{ name: string; value: string; description?: string }>;
  default?: any;
  isTextArea?: boolean;
  hidden?: boolean;
  visibleCondition?: (values: any, currentCredential: any) => boolean;
  tabs?: Array<{
    value: string;
    label: string;
    fields: ConnectorField[];
  }>;
  defaultTab?: string;
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
        defaultTab: "general",
        tabs: [
          {
            value: "general",
            label: "General",
            fields: [
              {
                type: "checkbox",
                label: (currentCredential: any) => currentCredential?.credential_json?.google_tokens ? "Include shared drives?" : "Include shared drives?",
                description: (currentCredential: any) => currentCredential?.credential_json?.google_tokens ? "This will allow contentbuilder to index everything in the shared drives you have access to." : "This will allow contentbuilder to index everything in your Organization's shared drives.",
                name: "include_shared_drives",
                default: false,
              },
              {
                type: "checkbox",
                label: (currentCredential: any) => currentCredential?.credential_json?.google_tokens ? "Include My Drive?" : "Include Everyone's My Drive?",
                description: (currentCredential: any) => currentCredential?.credential_json?.google_tokens ? "This will allow contentbuilder to index everything in your My Drive." : "This will allow contentbuilder to index everything in everyone's My Drives.",
                name: "include_my_drives",
                default: false,
              },
              {
                type: "checkbox",
                description: "This will allow contentbuilder to index all files shared with you.",
                label: "Include All Files Shared With You?",
                name: "include_files_shared_with_me",
                visibleCondition: (values: any, currentCredential: any) => !!currentCredential?.credential_json?.google_tokens,
                default: false,
              },
            ],
          },
          {
            value: "specific",
            label: "Specific",
            fields: [
              {
                type: "text",
                description: (currentCredential: any) => currentCredential?.credential_json?.google_tokens ? "Enter a comma separated list of the URLs for the shared drive you would like to index. You must have access to these shared drives." : "Enter a comma separated list of the URLs for the shared drive you would like to index.",
                label: "Shared Drive URLs",
                name: "shared_drive_urls",
                default: "",
                isTextArea: true,
              },
              {
                type: "text",
                description: "Enter a comma separated list of the URLs of any folders you would like to index. The files located in these folders (and all subfolders) will be indexed.",
                label: "Folder URLs",
                name: "shared_folder_urls",
                default: "",
                isTextArea: true,
              },
              {
                type: "text",
                description: "Enter a comma separated list of the emails of the users whose MyDrive you want to index.",
                label: "My Drive Emails",
                name: "my_drive_emails",
                visibleCondition: (values: any, currentCredential: any) => !currentCredential?.credential_json?.google_tokens,
                default: "",
                isTextArea: true,
              },
            ],
          },
        ],
      },
    ],
    advanced_values: [
      {
        type: "text",
        description: "Enter a comma separated list of specific user emails to index. This will only index files accessible to these users.",
        label: "Specific User Emails",
        name: "specific_user_emails",
        optional: true,
        default: "",
        isTextArea: true,
      },
    ],
    advancedValuesVisibleCondition: (values: any, currentCredential: any) => !currentCredential?.credential_json?.google_tokens,
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
        description: "If no sites are specified, all sites in your organization may be indexed (requires adequate permissions). You can specify full site or subfolder URLs.",
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
        description: "Specify 0 or more Teams to index. If none specified, all Teams in your organization may be indexed.",
      },
    ],
    advanced_values: [],
  },
  discourse: {
    description: "Configure Discourse connector",
    values: [
      { type: "text", query: "Enter the base URL:", label: "Base URL", name: "base_url", optional: false },
      { type: "list", query: "Enter categories to include:", label: "Categories", name: "categories", optional: true },
    ],
    advanced_values: [],
  },
  axero: {
    description: "Configure Axero connector",
    values: [
      { type: "list", query: "Enter spaces to include:", label: "Spaces", name: "spaces", optional: true, description: "Specify zero or more Space IDs to index. If none specified, all Spaces will be indexed." },
    ],
    advanced_values: [],
    overrideDefaultFreq: 60 * 60 * 24,
  },
  productboard: { description: "Configure Productboard connector", values: [], advanced_values: [] },
  guru: { description: "Configure Guru connector", values: [], advanced_values: [] },
  slab: {
    description: "Configure Slab connector",
    values: [ { type: "text", query: "Enter the base URL:", label: "Base URL", name: "base_url", optional: false, description: "Specify the base URL for your Slab team (e.g., https://example.slab.com/)." } ],
    advanced_values: [],
  },
  salesforce: {
    description: "Configure Salesforce connector",
    values: [ { type: "list", query: "Enter requested objects:", label: "Requested Objects", name: "requested_objects", optional: true, description: "Specify object types to index (singular form), or leave blank to index default objects." } ],
    advanced_values: [],
  },
  google_cloud_storage: {
    description: "Configure Google Cloud Storage connector",
    values: [
      { type: "text", query: "Enter the bucket name:", label: "Bucket Name", name: "bucket_name", optional: false, description: "Name of the GCS bucket to index." },
      { type: "text", query: "Enter the prefix:", label: "Path Prefix", name: "prefix", optional: true },
      { type: "text", label: "Bucket Type", name: "bucket_type", optional: false, default: "google_cloud_storage", hidden: true },
    ],
    advanced_values: [],
    overrideDefaultFreq: 60 * 60 * 24,
  },
  oci_storage: {
    description: "Configure OCI Storage connector",
    values: [
      { type: "text", query: "Enter the bucket name:", label: "Bucket Name", name: "bucket_name", optional: false },
      { type: "text", query: "Enter the prefix:", label: "Prefix", name: "prefix", optional: true },
      { type: "text", label: "Bucket Type", name: "bucket_type", optional: false, default: "oci_storage", hidden: true },
    ],
    advanced_values: [],
  },
  s3: {
    description: "Configure S3 connector",
    values: [
      { type: "text", query: "Enter the bucket name:", label: "Bucket Name", name: "bucket_name", optional: false },
      { type: "text", query: "Enter the prefix:", label: "Prefix", name: "prefix", optional: true },
      { type: "text", label: "Bucket Type", name: "bucket_type", optional: false, default: "s3", hidden: true },
    ],
    advanced_values: [],
    overrideDefaultFreq: 60 * 60 * 24,
  },
  r2: {
    description: "Configure R2 connector",
    values: [
      { type: "text", query: "Enter the bucket name:", label: "Bucket Name", name: "bucket_name", optional: false },
      { type: "text", query: "Enter the prefix:", label: "Prefix", name: "prefix", optional: true },
      { type: "text", label: "Bucket Type", name: "bucket_type", optional: false, default: "r2", hidden: true },
    ],
    advanced_values: [],
    overrideDefaultFreq: 60 * 60 * 24,
  },
  wikipedia: {
    description: "Configure Wikipedia connector",
    values: [
      { type: "text", query: "Enter the language code:", label: "Language Code", name: "language_code", optional: false, description: "Valid Wikipedia language code (e.g., 'en', 'es')." },
      { type: "list", query: "Enter categories to include:", label: "Categories to index", name: "categories", optional: true, description: "Specify names of categories to index (not URLs)." },
      { type: "list", query: "Enter pages to include:", label: "Pages", name: "pages", optional: true, description: "Specify 0 or more page names to index." },
      { type: "number", query: "Enter the recursion depth:", label: "Recursion Depth", name: "recurse_depth", optional: false, description: "0 to index the category only; -1 for unlimited recursion (use with caution)." },
    ],
    advanced_values: [],
  },
  xenforo: {
    description: "Configure Xenforo connector",
    values: [ { type: "text", query: "Enter forum or thread URL:", label: "URL", name: "base_url", optional: false, description: "The XenForo v2.2 forum URL to index. Can be board or thread." } ],
    advanced_values: [],
  },
  highspot: {
    description: "Configure Highspot connector",
    values: [
      { type: "tab", name: "highspot_scope", label: "What should we index from Highspot?", optional: true, tabs: [
        { value: "spots", label: "Specific Spots", fields: [ { type: "list", query: "Enter the spot name(s):", label: "Spot Name(s)", name: "spot_names", optional: false, description: "For multiple spots, enter one by one." } ] },
        { value: "everything", label: "Everything", fields: [ { type: "string_tab", label: "Everything", name: "everything", description: "This will index all spots the provided credentials have access to!" } ] }
      ]}
    ],
    advanced_values: [],
  },
  egnyte: {
    description: "Configure Egnyte connector",
    values: [
      {
        type: "text",
        query: "Enter folder path to index:",
        label: "Folder Path",
        name: "folder_path",
        optional: true,
        description: "The folder path to index (e.g., '/Shared/Documents'). Leave empty to index everything.",
      },
    ],
    advanced_values: [],
  },
  freshdesk: {
    description: "Configure Freshdesk connector",
    values: [],
    advanced_values: [],
  },
  fireflies: {
    description: "Configure Fireflies connector",
    values: [],
    advanced_values: [],
  },
  gmail: {
    description: "Configure Gmail connector",
    values: [],
    advanced_values: [],
  },
  hubspot: {
    description: "Configure HubSpot connector",
    values: [],
    advanced_values: [],
  },
  linear: {
    description: "Configure Linear connector",
    values: [],
    advanced_values: [],
  },
  gong: {
    description: "Configure Gong connector",
    values: [
      {
        type: "list",
        query: "Enter workspaces to include:",
        label: "Workspaces",
        name: "workspaces",
        optional: true,
        description: "Specify 0 or more workspaces to index by ID or EXACT name. If none specified, all accessible workspaces will be indexed.",
      },
    ],
    advanced_values: [],
  },
  zulip: {
    description: "Configure Zulip connector",
    values: [],
    advanced_values: [],
  },
}; 