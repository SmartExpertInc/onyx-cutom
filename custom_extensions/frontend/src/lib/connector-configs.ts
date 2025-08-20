// Comprehensive connector configurations for native forms
// This replicates all Onyx connector functionality with proper typing

export interface ConnectorField {
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'list' | 'file' | 'number' | 'tab' | 'string_tab';
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  default?: any;
  options?: { name: string; value: string }[];
  isTextArea?: boolean;
  hidden?: boolean;
  disabled?: boolean;
  transform?: (value: any) => any;
  visibleCondition?: (values: any, credential: any) => boolean;
  tabs?: {
    value: string;
    label: string;
    fields: ConnectorField[];
  }[];
  defaultTab?: string;
}

export interface ConnectorConfig {
  description: string;
  subtext?: string;
  initialConnectorName?: string;
  values: ConnectorField[];
  advanced_values: ConnectorField[];
  overrideDefaultFreq?: number;
  advancedValuesVisibleCondition?: (values: any, credential: any) => boolean;
}

// All connector configurations
export const nativeConnectorConfigs: Record<string, ConnectorConfig> = {
  web: {
    description: "Configure Web connector",
    values: [
      {
        type: "text",
        name: "base_url",
        label: "Base URL",
        description: "Enter the website URL to scrape e.g. https://docs.onyx.app/",
        required: true,
        placeholder: "https://example.com"
      },
      {
        type: "select",
        name: "web_connector_type",
        label: "Scrape Method",
        description: "Select the web connector type",
        required: true,
        options: [
          { name: "Recursive", value: "recursive" },
          { name: "Single", value: "single" },
          { name: "Sitemap", value: "sitemap" }
        ]
      }
    ],
    advanced_values: [
      {
        type: "checkbox",
        name: "scroll_before_scraping",
        label: "Scroll before scraping",
        description: "Enable if the website requires scrolling for the desired content to load",
        default: false
      }
    ],
    overrideDefaultFreq: 60 * 60 * 24
  },

  github: {
    description: "Configure GitHub connector",
    values: [
      {
        type: "text",
        name: "repo_owner",
        label: "Repository Owner",
        description: "Enter the GitHub username or organization",
        required: true,
        placeholder: "username or organization"
      },
      {
        type: "tab",
        name: "github_mode",
        label: "What should we index from GitHub?",
        defaultTab: "repo",
        tabs: [
          {
            value: "repo",
            label: "Specific Repository",
            fields: [
              {
                type: "text",
                name: "repositories",
                label: "Repository Name(s)",
                description: "For multiple repositories, enter comma-separated names (e.g., repo1,repo2,repo3)",
                required: true,
                placeholder: "repo1,repo2,repo3"
              }
            ]
          },
          {
            value: "everything",
            label: "Everything",
            fields: [
              {
                type: "string_tab",
                name: "everything",
                label: "Everything",
                description: "This connector will index all repositories the provided credentials have access to!"
              }
            ]
          }
        ]
      },
      {
        type: "checkbox",
        name: "include_prs",
        label: "Include pull requests?",
        description: "Index pull requests from repositories",
        default: false
      },
      {
        type: "checkbox",
        name: "include_issues",
        label: "Include Issues?",
        description: "Index issues from repositories",
        default: false
      }
    ],
    advanced_values: []
  },

  gitlab: {
    description: "Configure GitLab connector",
    values: [
      {
        type: "text",
        name: "project_owner",
        label: "Project Owner",
        description: "Enter the project owner",
        required: true,
        placeholder: "username or group"
      },
      {
        type: "text",
        name: "project_name",
        label: "Project Name",
        description: "Enter the project name",
        required: true,
        placeholder: "project-name"
      }
    ],
    advanced_values: [
      {
        type: "checkbox",
        name: "include_mrs",
        label: "Include MRs",
        description: "Index merge requests from repositories",
        default: true
      },
      {
        type: "checkbox",
        name: "include_issues",
        label: "Include Issues",
        description: "Index issues from repositories",
        default: true
      }
    ]
  },

  gitbook: {
    description: "Configure GitBook connector",
    values: [
      {
        type: "text",
        name: "space_id",
        label: "Space ID",
        description: "The ID of the GitBook space to index. This can be found in the URL of a page in the space. For example, if your URL looks like `https://app.gitbook.com/o/ccLx08XZ5wZ54LwdP9QU/s/8JkzVx8QCIGRrmxhGHU8/`, then your space ID is `8JkzVx8QCIGRrmxhGHU8`.",
        required: true,
        placeholder: "space-id"
      }
    ],
    advanced_values: []
  },

  google_drive: {
    description: "Configure Google Drive connector",
    values: [
      {
        type: "tab",
        name: "indexing_scope",
        label: "How should we index your Google Drive?",
        defaultTab: "general",
        tabs: [
          {
            value: "general",
            label: "General",
            fields: [
              {
                type: "checkbox",
                name: "include_shared_drives",
                label: "Include shared drives?",
                description: "This will allow Onyx to index everything in the shared drives you have access to.",
                default: false
              },
              {
                type: "checkbox",
                name: "include_my_drives",
                label: "Include My Drive?",
                description: "This will allow Onyx to index everything in your My Drive.",
                default: false
              },
              {
                type: "checkbox",
                name: "include_files_shared_with_me",
                label: "Include All Files Shared With You?",
                description: "This will allow Onyx to index all files shared with you.",
                default: false,
                visibleCondition: (values, credential) => credential?.credential_json?.google_tokens
              }
            ]
          },
          {
            value: "specific",
            label: "Specific",
            fields: [
              {
                type: "textarea",
                name: "shared_drive_urls",
                label: "Shared Drive URLs",
                description: "Enter a comma separated list of the URLs for the shared drive you would like to index. You must have access to these shared drives.",
                placeholder: "https://drive.google.com/drive/folders/...",
                isTextArea: true
              },
              {
                type: "textarea",
                name: "shared_folder_urls",
                label: "Folder URLs",
                description: "Enter a comma separated list of the URLs of any folders you would like to index. The files located in these folders (and all subfolders) will be indexed.",
                placeholder: "https://drive.google.com/drive/folders/...",
                isTextArea: true
              },
              {
                type: "textarea",
                name: "my_drive_emails",
                label: "My Drive Emails",
                description: "Enter a comma separated list of the emails of the users whose MyDrive you want to index.",
                placeholder: "user1@example.com,user2@example.com",
                isTextArea: true,
                visibleCondition: (values, credential) => !credential?.credential_json?.google_tokens
              }
            ]
          }
        ]
      }
    ],
    advanced_values: [
      {
        type: "textarea",
        name: "specific_user_emails",
        label: "Specific User Emails",
        description: "Enter a comma separated list of specific user emails to index. This will only index files accessible to these users.",
        placeholder: "user1@example.com,user2@example.com",
        isTextArea: true,
        visibleCondition: (values, credential) => !credential?.credential_json?.google_tokens
      }
    ]
  },

  gmail: {
    description: "Configure Gmail connector",
    values: [],
    advanced_values: []
  },

  bookstack: {
    description: "Configure Bookstack connector",
    values: [],
    advanced_values: []
  },

  confluence: {
    description: "Configure Confluence connector",
    initialConnectorName: "cloud_name",
    values: [
      {
        type: "checkbox",
        name: "is_cloud",
        label: "Is Cloud",
        description: "Check if this is a Confluence Cloud instance, uncheck for Confluence Server/Data Center",
        required: true,
        default: true,
        disabled: (values, credential) => !!credential?.credential_json?.confluence_refresh_token
      },
      {
        type: "text",
        name: "wiki_base",
        label: "Wiki Base URL",
        description: "The base URL of your Confluence instance (e.g., https://your-domain.atlassian.net/wiki)",
        required: true,
        placeholder: "https://your-domain.atlassian.net/wiki",
        disabled: (values, credential) => !!credential?.credential_json?.confluence_refresh_token
      },
      {
        type: "tab",
        name: "indexing_scope",
        label: "How Should We Index Your Confluence?",
        defaultTab: "space",
        tabs: [
          {
            value: "everything",
            label: "Everything",
            fields: [
              {
                type: "string_tab",
                name: "everything",
                label: "Everything",
                description: "This connector will index all pages the provided credentials have access to!"
              }
            ]
          },
          {
            value: "space",
            label: "Space",
            fields: [
              {
                type: "text",
                name: "space",
                label: "Space Key",
                description: "The Confluence space key to index (e.g. `KB`)",
                placeholder: "KB"
              }
            ]
          },
          {
            value: "page",
            label: "Page",
            fields: [
              {
                type: "text",
                name: "page_id",
                label: "Page ID",
                description: "Specific page ID to index (e.g. `131368`)",
                placeholder: "131368"
              },
              {
                type: "checkbox",
                name: "index_recursively",
                label: "Index Recursively",
                description: "If this is set, we will index the page indicated by the Page ID as well as all of its children.",
                required: true,
                default: true
              }
            ]
          },
          {
            value: "cql",
            label: "CQL Query",
            fields: [
              {
                type: "text",
                name: "cql_query",
                label: "CQL Query",
                description: "IMPORTANT: We currently only support CQL queries that return objects of type 'page'. This means all CQL queries must contain 'type=page' as the only type filter. It is also important that no filters for 'lastModified' are used as it will cause issues with our connector polling logic. We will still get all attachments and comments for the pages returned by the CQL query. Any 'lastmodified' filters will be overwritten. See https://developer.atlassian.com/server/confluence/advanced-searching-using-cql/ for more details.",
                placeholder: "type=page AND space=KB"
              }
            ]
          }
        ]
      }
    ],
    advanced_values: []
  },

  jira: {
    description: "Configure Jira connector",
    subtext: "Configure which Jira content to index. You can index everything or specify a particular project.",
    values: [
      {
        type: "text",
        name: "jira_base_url",
        label: "Jira Base URL",
        description: "The base URL of your Jira instance (e.g., https://your-domain.atlassian.net)",
        required: true,
        placeholder: "https://your-domain.atlassian.net"
      },
      {
        type: "tab",
        name: "indexing_scope",
        label: "How Should We Index Your Jira?",
        defaultTab: "everything",
        tabs: [
          {
            value: "everything",
            label: "Everything",
            fields: [
              {
                type: "string_tab",
                name: "everything",
                label: "Everything",
                description: "This connector will index all issues the provided credentials have access to!"
              }
            ]
          },
          {
            value: "project",
            label: "Project",
            fields: [
              {
                type: "text",
                name: "project_key",
                label: "Project Key",
                description: "The key of a specific project to index (e.g., 'PROJ')",
                placeholder: "PROJ"
              }
            ]
          }
        ]
      },
      {
        type: "list",
        name: "comment_email_blacklist",
        label: "Comment Email Blacklist",
        description: "This is generally useful to ignore certain bots. Add user emails which comments should NOT be indexed.",
        placeholder: "bot@example.com"
      }
    ],
    advanced_values: []
  },

  salesforce: {
    description: "Configure Salesforce connector",
    values: [
      {
        type: "list",
        name: "requested_objects",
        label: "Requested Objects",
        description: "Specify the Salesforce object types you want us to index. If unsure, don't specify any objects and Onyx will default to indexing by 'Account'. Hint: Use the singular form of the object name (e.g., 'Opportunity' instead of 'Opportunities').",
        placeholder: "Account,Opportunity,Contact"
      }
    ],
    advanced_values: []
  },

  sharepoint: {
    description: "Configure SharePoint connector",
    values: [
      {
        type: "list",
        name: "sites",
        label: "Sites",
        description: "• If no sites are specified, all sites in your organization will be indexed (Sites.Read.All permission required). • Specifying 'https://onyxai.sharepoint.com/sites/support' for example will only index documents within this site. • Specifying 'https://onyxai.sharepoint.com/sites/support/subfolder' for example will only index documents within this folder.",
        placeholder: "https://company.sharepoint.com/sites/site-name"
      }
    ],
    advanced_values: []
  },

  teams: {
    description: "Configure Teams connector",
    values: [
      {
        type: "list",
        name: "teams",
        label: "Teams",
        description: "Specify 0 or more Teams to index. For example, specifying the Team 'Support' for the 'onyxai' Org will cause us to only index messages sent in channels belonging to the 'Support' Team. If no Teams are specified, all Teams in your organization will be indexed.",
        placeholder: "Support,Engineering"
      }
    ],
    advanced_values: []
  },

  discourse: {
    description: "Configure Discourse connector",
    values: [
      {
        type: "text",
        name: "base_url",
        label: "Base URL",
        description: "Enter the base URL",
        required: true,
        placeholder: "https://forum.example.com"
      },
      {
        type: "list",
        name: "categories",
        label: "Categories",
        description: "Enter categories to include",
        placeholder: "general,support"
      }
    ],
    advanced_values: []
  },

  axero: {
    description: "Configure Axero connector",
    values: [
      {
        type: "list",
        name: "spaces",
        label: "Spaces",
        description: "Specify zero or more Spaces to index (by the Space IDs). If no Space IDs are specified, all Spaces will be indexed.",
        placeholder: "space-id-1,space-id-2"
      }
    ],
    advanced_values: [],
    overrideDefaultFreq: 60 * 60 * 24
  },

  productboard: {
    description: "Configure Productboard connector",
    values: [],
    advanced_values: []
  },

  slack: {
    description: "Configure Slack connector",
    values: [],
    advanced_values: [
      {
        type: "list",
        name: "channels",
        label: "Channels",
        description: "Specify 0 or more channels to index. For example, specifying the channel \"support\" will cause us to only index all content within the \"#support\" channel. If no channels are specified, all channels in your workspace will be indexed.",
        placeholder: "support,general",
        transform: (values) => values.map((value: string) => value.toLowerCase())
      },
      {
        type: "checkbox",
        name: "channel_regex_enabled",
        label: "Enable Channel Regex",
        description: "If enabled, we will treat the \"channels\" specified above as regular expressions. A channel's messages will be pulled in by the connector if the name of the channel fully matches any of the specified regular expressions. For example, specifying .*-support.* as a \"channel\" will cause the connector to include any channels with \"-support\" in the name.",
        default: false
      }
    ]
  },

  slab: {
    description: "Configure Slab connector",
    values: [
      {
        type: "text",
        name: "base_url",
        label: "Base URL",
        description: "Specify the base URL for your Slab team. This will look something like: https://onyx.slab.com/",
        required: true,
        placeholder: "https://company.slab.com"
      }
    ],
    advanced_values: []
  },

  guru: {
    description: "Configure Guru connector",
    values: [],
    advanced_values: []
  },

  gong: {
    description: "Configure Gong connector",
    values: [
      {
        type: "list",
        name: "workspaces",
        label: "Workspaces",
        description: "Specify 0 or more workspaces to index. Provide the workspace ID or the EXACT workspace name from Gong. If no workspaces are specified, transcripts from all workspaces will be indexed.",
        placeholder: "workspace-id-1,workspace-id-2"
      }
    ],
    advanced_values: []
  },

  loopio: {
    description: "Configure Loopio connector",
    values: [
      {
        type: "text",
        name: "loopio_stack_name",
        label: "Loopio Stack Name",
        description: "Must be exact match to the name in Library Management, leave this blank if you want to index all Stacks",
        placeholder: "Stack Name"
      }
    ],
    advanced_values: [],
    overrideDefaultFreq: 60 * 60 * 24
  },

  file: {
    description: "Configure File connector",
    values: [
      {
        type: "file",
        name: "file_locations",
        label: "File Locations",
        description: "Upload files to index",
        required: true
      }
    ],
    advanced_values: []
  },

  zulip: {
    description: "Configure Zulip connector",
    values: [
      {
        type: "text",
        name: "realm_name",
        label: "Realm Name",
        description: "Enter the realm name",
        required: true,
        placeholder: "realm-name"
      },
      {
        type: "text",
        name: "realm_url",
        label: "Realm URL",
        description: "Enter the realm URL",
        required: true,
        placeholder: "https://realm.zulipchat.com"
      }
    ],
    advanced_values: []
  },

  notion: {
    description: "Configure Notion connector",
    values: [
      {
        type: "text",
        name: "root_page_id",
        label: "Root Page ID",
        description: "If specified, will only index the specified page + all of its child pages. If left blank, will index all pages the integration has been given access to.",
        placeholder: "page-id"
      }
    ],
    advanced_values: []
  },

  zendesk: {
    description: "Configure Zendesk connector",
    values: [
      {
        type: "select",
        name: "content_type",
        label: "Content Type",
        description: "Select the what content this connector will index",
        required: true,
        options: [
          { name: "Articles", value: "articles" },
          { name: "Tickets", value: "tickets" }
        ],
        default: "articles"
      }
    ],
    advanced_values: []
  },

  linear: {
    description: "Configure Linear connector",
    values: [],
    advanced_values: []
  },

  dropbox: {
    description: "Configure Dropbox connector",
    values: [],
    advanced_values: []
  },

  s3: {
    description: "Configure S3 connector",
    values: [
      {
        type: "text",
        name: "bucket_name",
        label: "Bucket Name",
        description: "Enter the bucket name",
        required: true,
        placeholder: "my-bucket"
      },
      {
        type: "text",
        name: "prefix",
        label: "Prefix",
        description: "Enter the prefix",
        placeholder: "folder/"
      },
      {
        type: "text",
        name: "bucket_type",
        label: "Bucket Type",
        default: "s3",
        hidden: true
      }
    ],
    advanced_values: [],
    overrideDefaultFreq: 60 * 60 * 24
  },

  r2: {
    description: "Configure R2 connector",
    values: [
      {
        type: "text",
        name: "bucket_name",
        label: "Bucket Name",
        description: "Enter the bucket name",
        required: true,
        placeholder: "my-bucket"
      },
      {
        type: "text",
        name: "prefix",
        label: "Prefix",
        description: "Enter the prefix",
        placeholder: "folder/"
      },
      {
        type: "text",
        name: "bucket_type",
        label: "Bucket Type",
        default: "r2",
        hidden: true
      }
    ],
    advanced_values: [],
    overrideDefaultFreq: 60 * 60 * 24
  },

  google_cloud_storage: {
    description: "Configure Google Cloud Storage connector",
    values: [
      {
        type: "text",
        name: "bucket_name",
        label: "Bucket Name",
        description: "Name of the GCS bucket to index, e.g. my-gcs-bucket",
        required: true,
        placeholder: "my-gcs-bucket"
      },
      {
        type: "text",
        name: "prefix",
        label: "Path Prefix",
        description: "Enter the prefix",
        placeholder: "folder/"
      },
      {
        type: "text",
        name: "bucket_type",
        label: "Bucket Type",
        default: "google_cloud_storage",
        hidden: true
      }
    ],
    advanced_values: [],
    overrideDefaultFreq: 60 * 60 * 24
  },

  oci_storage: {
    description: "Configure OCI Storage connector",
    values: [
      {
        type: "text",
        name: "bucket_name",
        label: "Bucket Name",
        description: "Enter the bucket name",
        required: true,
        placeholder: "my-bucket"
      },
      {
        type: "text",
        name: "prefix",
        label: "Prefix",
        description: "Enter the prefix",
        placeholder: "folder/"
      },
      {
        type: "text",
        name: "bucket_type",
        label: "Bucket Type",
        default: "oci_storage",
        hidden: true
      }
    ],
    advanced_values: []
  },

  wikipedia: {
    description: "Configure Wikipedia connector",
    values: [
      {
        type: "text",
        name: "language_code",
        label: "Language Code",
        description: "Input a valid Wikipedia language code (e.g. 'en', 'es')",
        required: true,
        placeholder: "en"
      },
      {
        type: "list",
        name: "categories",
        label: "Categories to index",
        description: "Specify 0 or more names of categories to index. For most Wikipedia sites, these are pages with a name of the form 'Category: XYZ', that are lists of other pages/categories. Only specify the name of the category, not its url.",
        placeholder: "Category:Technology"
      },
      {
        type: "list",
        name: "pages",
        label: "Pages",
        description: "Specify 0 or more names of pages to index.",
        placeholder: "Page Name"
      },
      {
        type: "number",
        name: "recurse_depth",
        label: "Recursion Depth",
        description: "When indexing categories that have sub-categories, this will determine how may levels to index. Specify 0 to only index the category itself (i.e. no recursion). Specify -1 for unlimited recursion depth. Note, that in some rare instances, a category might contain itself in its dependencies, which will cause an infinite loop. Only use -1 if you confident that this will not happen.",
        required: true,
        placeholder: "2"
      }
    ],
    advanced_values: []
  },

  xenforo: {
    description: "Configure Xenforo connector",
    values: [
      {
        type: "text",
        name: "base_url",
        label: "URL",
        description: "The XenForo v2.2 forum URL to index. Can be board or thread.",
        required: true,
        placeholder: "https://forum.example.com"
      }
    ],
    advanced_values: []
  },

  asana: {
    description: "Configure Asana connector",
    values: [
      {
        type: "text",
        name: "asana_workspace_id",
        label: "Workspace ID",
        description: "The ID of the Asana workspace to index. You can find this at https://app.asana.com/api/1.0/workspaces. It's a number that looks like 1234567890123456.",
        required: true,
        placeholder: "1234567890123456"
      },
      {
        type: "text",
        name: "asana_project_ids",
        label: "Project IDs",
        description: "IDs of specific Asana projects to index, separated by commas. Leave empty to index all projects in the workspace. Example: 1234567890123456,2345678901234567",
        placeholder: "1234567890123456,2345678901234567"
      },
      {
        type: "text",
        name: "asana_team_id",
        label: "Team ID",
        description: "ID of a team to use for accessing team-visible tasks. This allows indexing of team-visible tasks in addition to public tasks. Leave empty if you don't want to use this feature.",
        placeholder: "1234567890123456"
      }
    ],
    advanced_values: []
  },

  mediawiki: {
    description: "Configure MediaWiki connector",
    values: [
      {
        type: "text",
        name: "language_code",
        label: "Language Code",
        description: "Input a valid MediaWiki language code (e.g. 'en', 'es')",
        required: true,
        placeholder: "en"
      },
      {
        type: "text",
        name: "hostname",
        label: "MediaWiki Site URL",
        description: "Enter the MediaWiki Site URL",
        required: true,
        placeholder: "https://wiki.example.com"
      },
      {
        type: "list",
        name: "categories",
        label: "Categories to index",
        description: "Specify 0 or more names of categories to index. For most MediaWiki sites, these are pages with a name of the form 'Category: XYZ', that are lists of other pages/categories. Only specify the name of the category, not its url.",
        placeholder: "Category:Technology"
      },
      {
        type: "list",
        name: "pages",
        label: "Pages",
        description: "Specify 0 or more names of pages to index. Only specify the name of the page, not its url.",
        placeholder: "Page Name"
      },
      {
        type: "number",
        name: "recurse_depth",
        label: "Recursion Depth",
        description: "When indexing categories that have sub-categories, this will determine how may levels to index. Specify 0 to only index the category itself (i.e. no recursion). Specify -1 for unlimited recursion depth. Note, that in some rare instances, a category might contain itself in its dependencies, which will cause an infinite loop. Only use -1 if you confident that this will not happen.",
        placeholder: "2"
      }
    ],
    advanced_values: []
  },

  discord: {
    description: "Configure Discord connector",
    values: [],
    advanced_values: [
      {
        type: "list",
        name: "server_ids",
        label: "Server IDs",
        description: "Specify 0 or more server ids to include. Only channels inside them will be used for indexing",
        placeholder: "123456789012345678"
      },
      {
        type: "list",
        name: "channel_names",
        label: "Channels",
        description: "Specify 0 or more channels to index. For example, specifying the channel \"support\" will cause us to only index all content within the \"#support\" channel. If no channels are specified, all channels the bot has access to will be indexed.",
        placeholder: "support,general"
      },
      {
        type: "text",
        name: "start_date",
        label: "Start Date",
        description: "Only messages after this date will be indexed. Format: YYYY-MM-DD",
        placeholder: "2024-01-01"
      }
    ]
  },

  freshdesk: {
    description: "Configure Freshdesk connector",
    values: [],
    advanced_values: []
  },

  fireflies: {
    description: "Configure Fireflies connector",
    values: [],
    advanced_values: []
  },

  egnyte: {
    description: "Configure Egnyte connector",
    values: [],
    advanced_values: []
  },

  airtable: {
    description: "Configure Airtable connector",
    values: [
      {
        type: "text",
        name: "base_id",
        label: "Base ID",
        description: "The ID of the Airtable base to index.",
        required: true,
        placeholder: "appXXXXXXXXXXXXXX"
      },
      {
        type: "text",
        name: "table_name_or_id",
        label: "Table Name or Table ID",
        description: "Enter the table name or ID",
        required: true,
        placeholder: "Table Name or tblXXXXXXXXXXXXXX"
      },
      {
        type: "checkbox",
        name: "treat_all_non_attachment_fields_as_metadata",
        label: "Treat all fields except attachments as metadata",
        description: "Choose this if the primary content to index are attachments and all other columns are metadata for these attachments.",
        default: false
      }
    ],
    advanced_values: [
      {
        type: "text",
        name: "view_id",
        label: "View ID",
        description: "If you need to link to a specific View, put that ID here e.g. viwVUEJjWPd8XYjh8.",
        placeholder: "viwVUEJjWPd8XYjh8"
      },
      {
        type: "text",
        name: "share_id",
        label: "Share ID",
        description: "If you need to link to a specific Share, put that ID here e.g. shrkfjEzDmLaDtK83.",
        placeholder: "shrkfjEzDmLaDtK83"
      }
    ],
    overrideDefaultFreq: 60 * 60 * 24
  },

  highspot: {
    description: "Configure Highspot connector",
    values: [
      {
        type: "tab",
        name: "highspot_scope",
        label: "What should we index from Highspot?",
        defaultTab: "spots",
        tabs: [
          {
            value: "spots",
            label: "Specific Spots",
            fields: [
              {
                type: "list",
                name: "spot_names",
                label: "Spot Name(s)",
                description: "For multiple spots, enter your spot one by one.",
                required: true,
                placeholder: "Spot Name"
              }
            ]
          },
          {
            value: "everything",
            label: "Everything",
            fields: [
              {
                type: "string_tab",
                name: "everything",
                label: "Everything",
                description: "This connector will index all spots the provided credentials have access to!"
              }
            ]
          }
        ]
      }
    ],
    advanced_values: []
  },

  google_sites: {
    description: "Configure Google Sites connector",
    values: [
      {
        type: "file",
        name: "file_locations",
        label: "File Locations",
        description: "Upload a zip file containing the HTML of your Google Site",
        required: true
      },
      {
        type: "text",
        name: "base_url",
        label: "Base URL",
        description: "Enter the base URL",
        required: true,
        placeholder: "https://sites.google.com/view/site-name"
      }
    ],
    advanced_values: []
  },

  hubspot: {
    description: "Configure HubSpot connector",
    values: [],
    advanced_values: []
  },

  document360: {
    description: "Configure Document360 connector",
    values: [
      {
        type: "text",
        name: "workspace",
        label: "Workspace",
        description: "Enter the workspace",
        required: true,
        placeholder: "workspace-name"
      },
      {
        type: "list",
        name: "categories",
        label: "Categories",
        description: "Specify 0 or more categories to index. For instance, specifying the category 'Help' will cause us to only index all content within the 'Help' category. If no categories are specified, all categories in your workspace will be indexed.",
        placeholder: "Help,API"
      }
    ],
    advanced_values: []
  },

  clickup: {
    description: "Configure ClickUp connector",
    values: [
      {
        type: "select",
        name: "connector_type",
        label: "Connector Type",
        description: "Select the connector type",
        required: true,
        options: [
          { name: "List", value: "list" },
          { name: "Folder", value: "folder" },
          { name: "Space", value: "space" },
          { name: "Workspace", value: "workspace" }
        ]
      },
      {
        type: "list",
        name: "connector_ids",
        label: "Connector IDs",
        description: "Specify 0 or more id(s) to index from.",
        placeholder: "id1,id2"
      },
      {
        type: "checkbox",
        name: "retrieve_task_comments",
        label: "Retrieve Task Comments",
        description: "If checked, then all the comments for each task will also be retrieved and indexed.",
        default: false
      }
    ],
    advanced_values: []
  }
};

// Helper function to get connector configuration
export function getConnectorConfig(connectorId: string): ConnectorConfig | null {
  return nativeConnectorConfigs[connectorId] || null;
}

// Helper function to get all available connector IDs
export function getAvailableConnectorIds(): string[] {
  return Object.keys(nativeConnectorConfigs);
} 