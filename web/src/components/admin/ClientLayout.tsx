// web/src/components/admin/ClientLayout.tsx
"use client";

import { AdminSidebar } from "@/components/admin/connectors/AdminSidebar";
import {
  ClipboardIcon,
  NotebookIconSkeleton,
  ConnectorIconSkeleton,
  ThumbsUpIconSkeleton,
  ToolIconSkeleton,
  CpuIconSkeleton,
  UsersIconSkeleton,
  GroupsIconSkeleton,
  KeyIconSkeleton,
  ShieldIconSkeleton,
  DatabaseIconSkeleton,
  SettingsIconSkeleton,
  PaintingIconSkeleton,
  ZoomInIconSkeleton,
  SlackIconSkeleton,
  DocumentSetIconSkeleton,
  AssistantsIconSkeleton, // Ensure this is imported if you use it for the button icon
  SearchIcon,
  DocumentIcon2,
} from "@/components/icons/icons";
import { UserRole } from "@/lib/types";
import { FiActivity, FiBarChart2, FiSliders } from "react-icons/fi";
import { UserDropdown } from "../UserDropdown";
import { User } from "@/lib/types";
import { usePathname } from "next/navigation";
import { SettingsContext } from "../settings/SettingsProvider";
import { useContext, useState } from "react"; // Added useState
import { MdOutlineCreditCard } from "react-icons/md";
import { UserSettingsModal } from "@/app/chat/modal/UserSettingsModal";
import { usePopup } from "./connectors/Popup";
import { useChatContext } from "../context/ChatContext";
import { ApplicationStatus } from "@/app/admin/settings/interfaces";
import Link from "next/link";
import { Button } from "../ui/button";

// TODO: Import your AssistantsModal component
// import { AssistantsModal } from "@/app/chat/modal/AssistantsModal"; // Example path

export function ClientLayout({
  user,
  children,
  enableEnterprise,
  enableCloud,
}: {
  user: User | null;
  children: React.ReactNode;
  enableEnterprise: boolean;
  enableCloud: boolean;
}) {
  const isCurator =
    user?.role === UserRole.CURATOR || user?.role === UserRole.GLOBAL_CURATOR;
  const pathname = usePathname();
  const settings = useContext(SettingsContext);
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);
  const [showAssistantsModal, setShowAssistantsModal] = useState(false); // New state for Assistants Modal
  const toggleUserSettings = () => {
    setUserSettingsOpen(!userSettingsOpen);
  };
  const { llmProviders } = useChatContext();
  const { popup, setPopup } = usePopup();
  
  if (
    (pathname && pathname.startsWith("/admin/connectors")) ||
    (pathname && pathname.startsWith("/admin/embeddings"))
  ) {
    return <>{children}</>;
  }

  const contentBuilderAdminItems = [];

  // Products
  contentBuilderAdminItems.push({
    name: (
      <a href="/custom-projects-ui/pipelines" target="_blank" rel="noopener noreferrer" className="flex items-center w-full text-sm hover:bg-accent-hovered rounded-md py-1.5 px-2">
        <FiSliders size={18} className="flex-none opacity-80 mr-1.5" />
        Products
      </a>
    ),
    link: "/custom-projects-ui/pipelines",
  });

  // Templates (Designs)
  contentBuilderAdminItems.push({
    name: (
      <a href="/custom-projects-ui/admin/design-templates" target="_blank" rel="noopener noreferrer" className="flex items-center w-full text-sm hover:bg-accent-hovered rounded-md py-1.5 px-2">
        <SettingsIconSkeleton className="opacity-80 mr-1.5" size={18} />
        Templates (Designs)
      </a>
    ),
    link: "/custom-projects-ui/admin/design-templates",
  });
  
  if (user?.preferences?.shortcut_enabled) {
    contentBuilderAdminItems.push({
      name: (
        <div className="flex">
          <DocumentIcon2 className="text-text-700" size={18} />
          <div className="ml-1">Prompt Shortcuts</div>
        </div>
      ),
      link: "/chat/input-prompts",
    });
  }

  // Explore Assistants Button
  contentBuilderAdminItems.push({
    name: (
      <button
        onClick={() => setShowAssistantsModal(true)}
        className="flex items-center w-full text-sm hover:bg-accent-hovered rounded-md py-1.5 px-2 text-left"
      >
        {/* Optional: You can add an icon here, e.g.,
        <AssistantsIconSkeleton size={18} className="flex-none opacity-80 mr-1.5" /> 
        */}
        Explore Assistants
      </button>
    ),
    link: "#",
  });

  // Admin Dashboard
  contentBuilderAdminItems.push({
    name: (
      <a href="/custom-projects-ui/admin/main" target="_blank" rel="noopener noreferrer" className="flex items-center w-full text-sm hover:bg-accent-hovered rounded-md py-1.5 px-2">
        <FiBarChart2 size={18} className="flex-none opacity-80 mr-1.5" />
        Admin Dashboard
      </a>
    ),
    link: "/custom-projects-ui/admin/main",
  });

  const sidebarCollections = [
    {
      name: "Connectors",
      items: [
          {
            name: (
              <div className="flex">
                <NotebookIconSkeleton
                  className="text-text-700"
                  size={18}
                />
                <div className="ml-1">Existing Connectors</div>
              </div>
            ),
            link: "/admin/indexing/status",
          },
          {
            name: (
              <div className="flex">
                <ConnectorIconSkeleton
                  className="text-text-700"
                  size={18}
                />
                <div className="ml-1.5">Add Connector</div>
              </div>
            ),
            link: "/admin/add-connector",
          },
      ],
    },
    {
      name: "Document Management",
      items: [
          {
            name: (
              <div className="flex">
                <DocumentSetIconSkeleton
                  className="text-text-700"
                  size={18}
                />
                <div className="ml-1">Document Sets</div>
              </div>
            ),
            link: "/admin/documents/sets",
          },
          {
            name: (
              <div className="flex">
                <ZoomInIconSkeleton
                  className="text-text-700"
                  size={18}
                />
                <div className="ml-1">Explorer</div>
              </div>
            ),
            link: "/admin/documents/explorer",
          },
          {
            name: (
              <div className="flex">
                <ThumbsUpIconSkeleton
                  className="text-text-700"
                  size={18}
                />
                <div className="ml-1">Feedback</div>
              </div>
            ),
            link: "/admin/documents/feedback",
          },
      ],
    },
    ...(contentBuilderAdminItems.length > 0 ? [{
        name: "ContentBuilder Admin",
        items: contentBuilderAdminItems,
    }] : []),
    {
      name: "Custom Assistants",
      items: [
          {
            name: (
              <div className="flex">
                <AssistantsIconSkeleton
                  className="text-text-700"
                  size={18}
                />
                <div className="ml-1">Assistants</div>
              </div>
            ),
            link: "/admin/assistants",
          },
          ...(!isCurator
            ? [
                {
                  name: (
                    <div className="flex">
                      <SlackIconSkeleton className="text-text-700" />
                      <div className="ml-1">Slack Bots</div>
                    </div>
                  ),
                  link: "/admin/bots",
                },
                {
                  name: (
                    <div className="flex">
                      <ToolIconSkeleton
                        className="text-text-700"
                        size={18}
                      />
                      <div className="ml-1">Actions</div>
                    </div>
                  ),
                  link: "/admin/actions",
                },
              ]
            : []),
          ...(enableEnterprise
            ? [
                {
                  name: (
                    <div className="flex">
                      <ClipboardIcon
                        className="text-text-700"
                        size={18}
                      />
                      <div className="ml-1">Standard Answers</div>
                    </div>
                  ),
                  link: "/admin/standard-answer",
                },
              ]
            : []),
      ],
    },
      ...(isCurator
        ? [
            {
              name: "User Management",
              items: [
                {
                  name: (
                    <div className="flex">
                      <GroupsIconSkeleton
                        className="text-text-700"
                        size={18}
                      />
                      <div className="ml-1">Groups</div>
                    </div>
                  ),
                  link: "/admin/groups",
                },
              ],
            },
          ]
        : []),
        ...(!isCurator
        ? [
            {
              name: "Configuration",
              items: [
                {
                  name: (
                    <div className="flex">
                      <CpuIconSkeleton
                        className="text-text-700"
                        size={18}
                      />
                      <div className="ml-1">LLM</div>
                    </div>
                  ),
                  link: "/admin/configuration/llm",
                },
                {
                  error: settings?.settings.needs_reindexing,
                  name: (
                    <div className="flex">
                      <SearchIcon className="text-text-700" />
                      <div className="ml-1">Search Settings</div>
                    </div>
                  ),
                  link: "/admin/configuration/search",
                },
                {
                  name: (
                    <div className="flex">
                      <DocumentIcon2 className="text-text-700" />
                      <div className="ml-1">Document Processing</div>
                    </div>
                  ),
                  link: "/admin/configuration/document-processing",
                },
              ],
            },
            {
              name: "User Management",
              items: [
                {
                  name: (
                    <div className="flex">
                      <UsersIconSkeleton
                        className="text-text-700"
                        size={18}
                      />
                      <div className="ml-1">Users</div>
                    </div>
                  ),
                  link: "/admin/users",
                },
                ...(enableEnterprise
                  ? [
                      {
                        name: (
                          <div className="flex">
                            <GroupsIconSkeleton
                              className="text-text-700"
                              size={18}
                            />
                            <div className="ml-1">Groups</div>
                          </div>
                        ),
                        link: "/admin/groups",
                      },
                    ]
                  : []),
                {
                  name: (
                    <div className="flex">
                      <KeyIconSkeleton
                        className="text-text-700"
                        size={18}
                      />
                      <div className="ml-1">API Keys</div>
                    </div>
                  ),
                  link: "/admin/api-key",
                },
                {
                  name: (
                    <div className="flex">
                      <ShieldIconSkeleton
                        className="text-text-700"
                        size={18}
                      />
                      <div className="ml-1">Token Rate Limits</div>
                    </div>
                  ),
                  link: "/admin/token-rate-limits",
                },
              ],
            },
            ...(enableEnterprise
              ? [
                  {
                    name: "Performance",
                    items: [
                      {
                        name: (
                          <div className="flex">
                            <FiActivity
                              className="text-text-700"
                              size={18}
                            />
                            <div className="ml-1">Usage Statistics</div>
                          </div>
                        ),
                        link: "/admin/performance/usage",
                      },
                      ...(settings?.settings.query_history_type !==
                      "disabled"
                        ? [
                            {
                              name: (
                                <div className="flex">
                                  <DatabaseIconSkeleton
                                    className="text-text-700"
                                    size={18}
                                  />
                                  <div className="ml-1">
                                    Query History
                                  </div>
                                </div>
                              ),
                              link: "/admin/performance/query-history",
                            },
                          ]
                        : []),
                      ...(!enableCloud
                        ? [
                            {
                              name: (
                                <div className="flex">
                                  <FiBarChart2
                                    className="text-text-700"
                                    size={18}
                                  />
                                  <div className="ml-1">
                                    Custom Analytics
                                  </div>
                                </div>
                              ),
                              link: "/admin/performance/custom-analytics",
                            },
                          ]
                        : []),
                    ],
                  },
                ]
              : []),
            {
              name: "Settings",
              items: [
                {
                  name: (
                    <div className="flex">
                      <SettingsIconSkeleton
                        className="text-text-700"
                        size={18}
                      />
                      <div className="ml-1">Workspace Settings</div>
                    </div>
                  ),
                  link: "/admin/settings",
                },
                ...(enableEnterprise
                  ? [
                      {
                        name: (
                          <div className="flex">
                            <PaintingIconSkeleton
                              className="text-text-700"
                              size={18}
                            />
                            <div className="ml-1">Whitelabeling</div>
                          </div>
                        ),
                        link: "/admin/whitelabeling",
                      },
                    ]
                  : []),
                ...(enableCloud
                  ? [
                      {
                        name: (
                          <div className="flex">
                            <MdOutlineCreditCard
                              className="text-text-700"
                              size={18}
                            />
                            <div className="ml-1">Billing</div>
                          </div>
                        ),
                        link: "/admin/billing",
                      },
                    ]
                  : []),
              ],
            },
          ]
        : []),
  ];

  return (
    <div className="h-screen overflow-y-hidden">
      {popup}
      <div className="flex h-full">
        {userSettingsOpen && (
          <UserSettingsModal
            llmProviders={llmProviders}
            setPopup={setPopup}
            onClose={() => setUserSettingsOpen(false)}
            defaultModel={user?.preferences?.default_model!}
          />
        )}

        {/* TODO: Implement and render your AssistantsModal here */}
        {/* Example:
        {showAssistantsModal && (
          <AssistantsModal
            onClose={() => setShowAssistantsModal(false)}
            // Pass any other necessary props
          />
        )}
        */}
        {showAssistantsModal && (
            <div 
                style={{ 
                    position: 'fixed', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    background: 'white', 
                    padding: '20px', 
                    zIndex: 100,
                    border: '1px solid black'
                }}
            >
                <p>Assistants Modal Placeholder</p>
                <button onClick={() => setShowAssistantsModal(false)}>Close</button>
            </div>
        )}


        {settings?.settings.application_status ===
          ApplicationStatus.PAYMENT_REMINDER && (
            <div className="fixed top-2 left-1/2 transform -translate-x-1/2 bg-amber-400 dark:bg-amber-500 text-gray-900 dark:text-gray-100 p-4 rounded-lg shadow-lg z-50 max-w-md text-center">
              <strong className="font-bold">Warning:</strong> Your trial ends in
              less than 5 days and no payment method has been added.
              <div className="mt-2">
                <Link href="/admin/billing">
                  <Button
                    variant="default"
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Update Billing Information
                  </Button>
                </Link>
              </div>
            </div>
        )}

        <div className="default-scrollbar flex-none text-text-settings-sidebar bg-background-sidebar dark:bg-[#000] w-[250px] overflow-x-hidden z-20 pt-2 pb-8 h-full border-r border-border dark:border-none miniscroll overflow-auto">
          <AdminSidebar
            collections={sidebarCollections}  
          />
        </div>
        <div className="relative h-full overflow-y-hidden w-full">
          <div className="fixed left-0 gap-x-4 px-4 top-4 h-8 px-0 mb-auto w-full items-start flex justify-end">
            <UserDropdown toggleUserSettings={toggleUserSettings} />
          </div>
          <div className="pt-20 pb-4 flex w-full overflow-y-auto overflow-x-hidden h-full px-4 md:px-12">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}