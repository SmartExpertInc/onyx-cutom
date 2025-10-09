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
        query: "Enter channels to index:",
        label: "Channels",
        name: "channels",
        description: "Specify 0 or more channels to index from.",
        optional: true,
      },
      {
        type: "checkbox",
        query: "Enable channel regex?",
        label: "Enable Channel Regex",
        name: "channel_regex_enabled",
        description: `If enabled, we will treat the "channels" specified above as regular expressions. A channel's messages will be pulled in by the connector if the name of the channel fully matches any of the specified regular expressions. For example, specifying .*-support.* as a "channel" will cause the connector to include any channels with "-support" in the name.`,
        optional: true,
      },
    ],
    advanced_values: [
      {
        type: "text",
        query: "Enter the Start Date:",
        label: "Indexing Start Date",
        name: "indexing_start",
        description: `Only messages after this date will be indexed. Format: YYYY-MM-DD`,
        optional: true,
      },
    ],
  },
  confluence: {
    description: "Configure Confluence connector",
    values: [
      {
        type: "checkbox",
        query: "Is this a Confluence Cloud instance?",
        label: "Is Cloud",
        name: "is_cloud",
        optional: false,
        default: true,
        description: "Check if this is a Confluence Cloud instance, uncheck for Confluence Server/Data Center",
      },
      {
        type: "text",
        query: "Enter the wiki base URL:",
        label: "Wiki Base URL",
        name: "wiki_base",
        optional: false,
        description: "The base URL of your Confluence instance (e.g., https://your-domain.atlassian.net/wiki)",
      },
      {
        type: "tab",
        name: "indexing_scope",
        label: "How Should We Index Your Confluence?",
        optional: true,
        tabs: [
          {
            value: "everything",
            label: "Everything",
            fields: [
              {
                type: "string_tab",
                label: "Everything",
                name: "everything",
                description: "This connector will index all pages the provided credentials have access to!",
              },
            ],
          },
          {
            value: "space",
            label: "Space",
            fields: [
              {
                type: "text",
                query: "Enter the space:",
                label: "Space Key",
                name: "space",
                default: "",
                description: "The Confluence space key to index (e.g. `KB`).",
              },
            ],
          },
          {
            value: "page",
            label: "Page",
            fields: [
              {
                type: "text",
                query: "Enter the page ID:",
                label: "Page ID",
                name: "page_id",
                default: "",
                description: "Specific page ID to index (e.g. `131368`)",
              },
              {
                type: "checkbox",
                query: "Should index pages recursively?",
                label: "Index Recursively",
                name: "index_recursively",
                description: "If this is set, we will index the page indicated by the Page ID as well as all of its children.",
                optional: false,
                default: true,
              },
            ],
          },
          {
            value: "cql",
            label: "CQL Query",
            fields: [
              {
                type: "text",
                query: "Enter the CQL query (optional):",
                label: "CQL Query",
                name: "cql_query",
                default: "",
                description: "IMPORTANT: We currently only support CQL queries that return objects of type 'page'. This means all CQL queries must contain 'type=page' as the only type filter. It is also important that no filters for 'lastModified' are used as it will cause issues with our connector polling logic. We will still get all attachments and comments for the pages returned by the CQL query. Any 'lastmodified' filters will be overwritten. See https://developer.atlassian.com/server/confluence/advanced-searching-using-cql/ for more details.",
              },
            ],
          },
        ],
        defaultTab: "space",
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
        type: "list",
        query: "Enter shared folder URLs (optional):",
        label: "Shared Folder URLs",
        name: "shared_folder_urls",
        description: "Specify folder URLs to index. Leave empty to index based on the checkboxes below.",
        optional: true,
      },
      {
        type: "checkbox",
        query: "Include files shared with me?",
        label: "Include Files Shared With Me",
        name: "include_files_shared_with_me",
        description: "Index files shared directly with you",
        optional: true,
        default: true,
      },
      {
        type: "checkbox",
        query: "Include my drives?",
        label: "Include My Drives",
        name: "include_my_drives",
        description: "Index files in your personal Google Drive",
        optional: true,
        default: true,
      },
      {
        type: "checkbox",
        query: "Include shared drives?",
        label: "Include Shared Drives",
        name: "include_shared_drives",
        description: "Index shared team drives",
        optional: true,
        default: false,
      },
    ],
    advanced_values: [],
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
        type: "text",
        query: "Enter your Asana workspace ID:",
        label: "Workspace ID",
        name: "asana_workspace_id",
        optional: false,
        description:
          "The ID of the Asana workspace to index. You can find this at https://app.asana.com/api/1.0/workspaces. It's a number that looks like 1234567890123456.",
      },
      {
        type: "text",
        query: "Enter project IDs to index (optional):",
        label: "Project IDs",
        name: "asana_project_ids",
        description:
          "IDs of specific Asana projects to index, separated by commas. Leave empty to index all projects in the workspace. Example: 1234567890123456,2345678901234567",
        optional: true,
      },
      {
        type: "text",
        query: "Enter the Team ID (optional):",
        label: "Team ID",
        name: "asana_team_id",
        optional: true,
        description:
          "ID of a team to use for accessing team-visible tasks. This allows indexing of team-visible tasks in addition to public tasks. Leave empty if you don't want to use this feature.",
      },
    ],
    advanced_values: [
      {
        type: "text",
        query: "Enter the Start Date:",
        label: "Indexing Start Date",
        name: "indexing_start",
        description: `Only documents after this date will be indexed. Format: YYYY-MM-DD`,
        optional: true,
      },
    ],
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
    values: [
      {
        type: "tab",
        name: "highspot_scope",
        label: "What should we index from Highspot?",
        optional: true,
        tabs: [
          {
            value: "spots",
            label: "Specific Spots",
            fields: [
              {
                type: "list",
                query: "Enter the spot name(s):",
                label: "Spot Name(s)",
                name: "spot_names",
                optional: false,
                description: "For multiple spots, enter your spot one by one.",
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
                  "This connector will index all spots the provided credentials have access to!",
              },
            ],
          },
        ],
      },
    ],
    advanced_values: [],
  },
  discord: {
    description: "Configure Discord connector",
    values: [],
    advanced_values: [
      {
        type: "list",
        query: "Enter Server IDs to include:",
        label: "Server IDs",
        name: "server_ids",
        description: `Specify 0 or more server ids to include. Only channels inside them will be used for indexing`,
        optional: true,
      },
      {
        type: "list",
        query: "Enter channel names to include:",
        label: "Channels",
        name: "channel_names",
        description: `Specify 0 or more channels to index. For example, specifying the channel "support" will cause us to only index all content within the "#support" channel. If no channels are specified, all channels the bot has access to will be indexed.`,
        optional: true,
      },
      {
        type: "text",
        query: "Enter the Start Date:",
        label: "Start Date",
        name: "start_date",
        description: `Only messages after this date will be indexed. Format: YYYY-MM-DD`,
        optional: true,
      },
    ],
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
  dropbox: {
    description: "Configure Dropbox connector",
    values: [],
    advanced_values: [],
  },
  s3: {
    description: "Configure S3 connector",
    values: [
      {
        type: "text",
        query: "Enter the bucket name:",
        label: "Bucket Name",
        name: "bucket_name",
        optional: false,
      },
      {
        type: "text",
        query: "Enter the prefix:",
        label: "Prefix",
        name: "prefix",
        optional: true,
      },
      {
        type: "text",
        label: "Bucket Type",
        name: "bucket_type",
        optional: false,
        default: "s3",
        hidden: true,
      },
    ],
    advanced_values: [],
    overrideDefaultFreq: 60 * 60 * 24,
  },
  r2: {
    description: "Configure R2 connector",
    values: [
      {
        type: "text",
        query: "Enter the bucket name:",
        label: "Bucket Name",
        name: "bucket_name",
        optional: false,
      },
      {
        type: "text",
        query: "Enter the prefix:",
        label: "Prefix",
        name: "prefix",
        optional: true,
      },
      {
        type: "text",
        label: "Bucket Type",
        name: "bucket_type",
        optional: false,
        default: "r2",
        hidden: true,
      },
    ],
    advanced_values: [],
    overrideDefaultFreq: 60 * 60 * 24,
  },
  google_cloud_storage: {
    description: "Configure Google Cloud Storage connector",
    values: [
      {
        type: "text",
        query: "Enter the bucket name:",
        label: "Bucket Name",
        name: "bucket_name",
        optional: false,
        description: "Name of the GCS bucket to index, e.g. my-gcs-bucket",
      },
      {
        type: "text",
        query: "Enter the prefix:",
        label: "Path Prefix",
        name: "prefix",
        optional: true,
      },
      {
        type: "text",
        label: "Bucket Type",
        name: "bucket_type",
        optional: false,
        default: "google_cloud_storage",
        hidden: true,
      },
    ],
    advanced_values: [],
    overrideDefaultFreq: 60 * 60 * 24,
  },
  oci_storage: {
    description: "Configure OCI Storage connector",
    values: [
      {
        type: "text",
        query: "Enter the bucket name:",
        label: "Bucket Name",
        name: "bucket_name",
        optional: false,
      },
      {
        type: "text",
        query: "Enter the prefix:",
        label: "Prefix",
        name: "prefix",
        optional: true,
      },
      {
        type: "text",
        label: "Bucket Type",
        name: "bucket_type",
        optional: false,
        default: "oci_storage",
        hidden: true,
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
  egnyte: {
    description: "Configure Egnyte connector",
    values: [
      {
        type: "text",
        query: "Enter folder path to index:",
        label: "Folder Path",
        name: "folder_path",
        optional: true,
        description:
          "The folder path to index (e.g., '/Shared/Documents'). Leave empty to index everything.",
      },
    ],
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
  zulip: {
    description: "Configure Zulip connector",
    values: [
      {
        type: "text",
        query: "Enter the realm name",
        label: "Realm Name",
        name: "realm_name",
        optional: false,
      },
      {
        type: "text",
        query: "Enter the realm URL",
        label: "Realm URL",
        name: "realm_url",
        optional: false,
      },
    ],
    advanced_values: [],
  },
  slab: {
    description: "Configure Slab connector",
    values: [
      {
        type: "text",
        query: "Enter the base URL:",
        label: "Base URL",
        name: "base_url",
        optional: false,
        description: `Specify the base URL for your Slab team. This will look something like: https://onyx.slab.com/`,
      },
    ],
    advanced_values: [],
  },
  guru: {
    description: "Configure Guru connector",
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
        description:
          "Specify 0 or more workspaces to index. Provide the workspace ID or the EXACT workspace name from Gong. If no workspaces are specified, transcripts from all workspaces will be indexed.",
      },
    ],
    advanced_values: [],
  },
  loopio: {
    description: "Configure Loopio connector",
    values: [
      {
        type: "text",
        query: "Enter the Loopio stack name",
        label: "Loopio Stack Name",
        name: "loopio_stack_name",
        description:
          "Must be exact match to the name in Library Management, leave this blank if you want to index all Stacks",
        optional: true,
      },
    ],
    advanced_values: [],
    overrideDefaultFreq: 60 * 60 * 24,
  },
  file: {
    description: "Configure File connector",
    values: [
      {
        type: "file",
        query: "Enter file locations:",
        label: "File Locations",
        name: "file_locations",
        optional: false,
      },
    ],
    advanced_values: [],
  },
  wikipedia: {
    description: "Configure Wikipedia connector",
    values: [
      {
        type: "text",
        query: "Enter the language code:",
        label: "Language Code",
        name: "language_code",
        optional: false,
        description: "Input a valid Wikipedia language code (e.g. 'en', 'es')",
      },
      {
        type: "list",
        query: "Enter categories to include:",
        label: "Categories to index",
        name: "categories",
        description:
          "Specify 0 or more names of categories to index. For most Wikipedia sites, these are pages with a name of the form 'Category: XYZ', that are lists of other pages/categories. Only specify the name of the category, not its url.",
        optional: true,
      },
      {
        type: "list",
        query: "Enter pages to include:",
        label: "Pages",
        name: "pages",
        optional: true,
        description: "Specify 0 or more names of pages to index.",
      },
      {
        type: "number",
        query: "Enter the recursion depth:",
        label: "Recursion Depth",
        name: "recurse_depth",
        description:
          "When indexing categories that have sub-categories, this will determine how may levels to index. Specify 0 to only index the category itself (i.e. no recursion). Specify -1 for unlimited recursion depth. Note, that in some rare instances, a category might contain itself in its dependencies, which will cause an infinite loop. Only use -1 if you confident that this will not happen.",
        optional: false,
      },
    ],
    advanced_values: [],
  },
  mediawiki: {
    description: "Configure MediaWiki connector",
    values: [
      {
        type: "text",
        query: "Enter the language code:",
        label: "Language Code",
        name: "language_code",
        optional: false,
        description: "Input a valid MediaWiki language code (e.g. 'en', 'es')",
      },
      {
        type: "text",
        query: "Enter the MediaWiki Site URL",
        label: "MediaWiki Site URL",
        name: "hostname",
        optional: false,
      },
      {
        type: "list",
        query: "Enter categories to include:",
        label: "Categories to index",
        name: "categories",
        description:
          "Specify 0 or more names of categories to index. For most MediaWiki sites, these are pages with a name of the form 'Category: XYZ', that are lists of other pages/categories. Only specify the name of the category, not its url.",
        optional: true,
      },
      {
        type: "list",
        query: "Enter pages to include:",
        label: "Pages",
        name: "pages",
        optional: true,
        description:
          "Specify 0 or more names of pages to index. Only specify the name of the page, not its url.",
      },
      {
        type: "number",
        query: "Enter the recursion depth:",
        label: "Recursion Depth",
        name: "recurse_depth",
        description:
          "When indexing categories that have sub-categories, this will determine how may levels to index. Specify 0 to only index the category itself (i.e. no recursion). Specify -1 for unlimited recursion depth. Note, that in some rare instances, a category might contain itself in its dependencies, which will cause an infinite loop. Only use -1 if you confident that this will not happen.",
        optional: true,
      },
    ],
    advanced_values: [],
  },
  xenforo: {
    description: "Configure Xenforo connector",
    values: [
      {
        type: "text",
        query: "Enter forum or thread URL:",
        label: "URL",
        name: "base_url",
        optional: false,
        description:
          "The XenForo v2.2 forum URL to index. Can be board or thread.",
      },
    ],
    advanced_values: [],
  },
  gmail: {
    description: "Configure Gmail connector",
    values: [],
    advanced_values: [],
  },
  bookstack: {
    description: "Configure Bookstack connector",
    values: [],
    advanced_values: [],
  },
  // Add more connectors as needed...
}; 