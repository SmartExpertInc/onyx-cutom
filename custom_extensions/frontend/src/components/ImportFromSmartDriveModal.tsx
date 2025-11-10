"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { Search, Settings, Package, Upload } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import SmartDriveConnectors from "@/components/SmartDrive/SmartDriveConnectors";
import { Input } from "@/components/ui/input";
import { ConnectorCard } from "@/components/ui/connector-card";
import { Button } from "@/components/ui/button";
import { trackImportFiles } from "@/lib/mixpanelClient";
import LMSProductCard from "./LMSProductCard";

interface ImportFromSmartDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport?: () => void;
  selectedFiles?: any[]; // Files selected from SmartDrive (upload page legacy flow)
  enableKnowledgeBaseFlow?: boolean;
}

interface Connector {
  id: number;
  name: string;
  source: string;
  status: "active" | "paused" | "error" | "syncing" | "unknown";
  last_sync_at?: string;
  total_docs_indexed: number;
  last_error?: string;
  access_type: string;
}

const connectorIcons: Record<string, string> = {
  google_drive: "/GoogleDrive.png",
  dropbox: "/Dropbox.png",
  s3: "/S3.png",
  r2: "/r2.png",
  google_cloud_storage: "/GoogleCloudStorage.png",
  oci_storage: "/OCI.svg",
  sharepoint: "/Sharepoint.png",
  egnyte: "/Egnyte.png",
  slack: "/Slack.png",
  discord: "/discord.png",
  teams: "/Teams.png",
  gmail: "/Gmail.png",
  zulip: "/Zulip.png",
  notion: "/Notion.png",
  confluence: "/Confluence.svg",
  onedrive: "/OneDrive.png",
  google_site: "/GoogleSites.svg",
  slab: "/Slab.svg",
  github: "/Github.png",
  gitlab: "/Gitlab.png",
  jira: "/Jira.svg",
  linear: "/Linear.svg",
  clickup: "/Clickup.png",
  asana: "/Asana.svg",
  zendesk: "/Zendesk.svg",
  freshdesk: "/Freshdesk.png",
  intercom: "/Intercom.svg",
  salesforce: "/Salesforce.png",
  hubspot: "/HubSpot.png",
  guru: "/Guru.svg",
  document360: "/Document360.svg",
  gitbook: "/Gitbook.svg",
  bookstack: "/BookStack.svg",
  airtable: "/Airtable.svg",
  gong: "/Gong.png",
  fireflies: "/Fireflies.ai.svg",
  web: "/Web.svg",
  file: "/File.svg",
  axero: "/Axero.svg",
  discourse: "/Discourse.svg",
  mediawiki: "/MediaWiki.svg",
  requesttracker: "/RequestTracker.svg",
  xenforo: "/XenForo.svg",
  wikipedia: "/Wikipedia.svg",
  productboard: "/Productboard.svg",
  highspot: "/Highspot.svg",
  loopio: "/Loopio.png",
  default: "/file.svg",
};

const getConnectorGradient = (source: string) => {
  const gradients: Record<string, { from: string; to: string }> = {
    google_drive: { from: "orange-300", to: "amber-200" },
    dropbox: { from: "blue-300", to: "indigo-200" },
    notion: { from: "purple-300", to: "pink-200" },
    salesforce: { from: "cyan-300", to: "blue-200" },
    slack: { from: "violet-300", to: "purple-200" },
    github: { from: "gray-300", to: "slate-200" },
    confluence: { from: "green-300", to: "emerald-200" },
    sharepoint: { from: "teal-300", to: "cyan-200" },
    onedrive: { from: "indigo-300", to: "blue-200" },
    box: { from: "yellow-300", to: "orange-200" },
    gmail: { from: "red-300", to: "rose-200" },
    outlook: { from: "pink-300", to: "rose-200" },
  };

  const fallback = {
    from: ["blue-300", "purple-300", "green-300", "orange-300", "red-300", "teal-300"][
      source.length % 6
    ],
    to: ["indigo-200", "pink-200", "emerald-200", "amber-200", "rose-200", "cyan-200"][
      source.length % 6
    ],
  };

  return gradients[source] || fallback;
};

const getTextColorFromGradient = (from: string) => {
  const colorMap: Record<string, string> = {
    "orange-300": "orange-700",
    "blue-300": "blue-700",
    "purple-300": "purple-700",
    "cyan-300": "cyan-700",
    "violet-300": "violet-700",
    "gray-300": "gray-700",
    "green-300": "green-700",
    "teal-300": "teal-700",
    "indigo-300": "indigo-700",
    "yellow-300": "yellow-700",
    "red-300": "red-700",
    "pink-300": "pink-700",
  };

  return colorMap[from] || "gray-700";
};

export const ImportFromSmartDriveModal: React.FC<ImportFromSmartDriveModalProps> = ({
  isOpen,
  onClose,
  onImport,
  selectedFiles,
  enableKnowledgeBaseFlow = false,
}) => {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"smart-drive" | "connectors">("smart-drive");
  const [localSelectedFiles, setLocalSelectedFiles] = useState<any[]>([]);

  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [selectedConnectors, setSelectedConnectors] = useState<number[]>([]);
  const [connectorSearchTerm, setConnectorSearchTerm] = useState("");

  const [products, setProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [loadingConnectors, setLoadingConnectors] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedSmartDrivePaths, setSelectedSmartDrivePaths] = useState<string[]>([]);
  const [selectionValid, setSelectionValid] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileSelection = useCallback(
    (files: any[]) => {
      setLocalSelectedFiles(files);

      if (enableKnowledgeBaseFlow) {
        const paths = Array.from(
          new Set(
            files
              .map((file) => file?.path || file?.id || file?.name)
              .filter((value): value is string => Boolean(value))
          )
        );
        setSelectedSmartDrivePaths(paths);
      }
    },
    [enableKnowledgeBaseFlow]
  );

  const handleTabChange = useCallback((tab: "smart-drive" | "connectors") => {
    setActiveTab(tab);
  }, []);

  const resetKnowledgeBaseState = useCallback(() => {
    setSelectedConnectors([]);
    setConnectorSearchTerm("");
    setProducts([]);
    setSelectedProducts([]);
    setProductSearchTerm("");
    setSelectedSmartDrivePaths([]);
    setSelectionValid(false);
  }, []);

  const loadConnectors = useCallback(async () => {
    try {
      setLoadingConnectors(true);
      const response = await fetch("/api/manage/admin/connector/status", {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch connectors: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const privateConnectors: Connector[] = data
        .filter((connectorStatus: any) => connectorStatus.access_type === "private")
        .map((connectorStatus: any) => ({
          id: connectorStatus.cc_pair_id,
          name: connectorStatus.name || `Connector ${connectorStatus.cc_pair_id}`,
          source: connectorStatus.connector.source,
          status: connectorStatus.connector.status || "unknown",
          last_sync_at: connectorStatus.last_sync_at,
          total_docs_indexed: connectorStatus.total_docs_indexed || 0,
          last_error: connectorStatus.last_error,
          access_type: connectorStatus.access_type,
        }));

      setConnectors(privateConnectors);
    } catch (error) {
      console.error("Failed to load connectors:", error);
      setConnectors([]);
    } finally {
      setLoadingConnectors(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const CUSTOM_BACKEND_URL =
        process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";
      const res = await fetch(`${CUSTOM_BACKEND_URL}/projects`, {
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch products ${res.status}`);
      }

      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    if (!enableKnowledgeBaseFlow || !isOpen) {
      return;
    }

    resetKnowledgeBaseState();
    loadConnectors();
    loadProducts();
  }, [enableKnowledgeBaseFlow, isOpen, loadConnectors, loadProducts, resetKnowledgeBaseState]);

  useEffect(() => {
    if (!enableKnowledgeBaseFlow) {
      return;
    }

    setSelectionValid(
      selectedConnectors.length > 0 ||
        selectedSmartDrivePaths.length > 0 ||
        selectedProducts.length > 0
    );
  }, [enableKnowledgeBaseFlow, selectedConnectors, selectedSmartDrivePaths, selectedProducts]);

  const filteredConnectors = useMemo(() => {
    const term = connectorSearchTerm.toLowerCase();
    return connectors.filter(
      (connector) =>
        connector.name.toLowerCase().includes(term) ||
        connector.source.toLowerCase().includes(term)
    );
  }, [connectors, connectorSearchTerm]);

  const filteredProducts = useMemo(() => {
    const term = productSearchTerm.toLowerCase();
    return (products || []).filter((product: any) => {
      const name = (product.projectName || product.microproduct_name || "").toLowerCase();
      const type = (product.design_microproduct_type || "").toLowerCase();
      return name.includes(term) || type.includes(term);
    });
  }, [products, productSearchTerm]);

  const handleConnectorToggle = useCallback((connectorId: number) => {
    setSelectedConnectors((prev) => {
      if (prev.includes(connectorId)) {
        return prev.filter((id) => id !== connectorId);
      }
      return [...prev, connectorId];
    });
  }, []);

  const handleSelectAllConnectors = useCallback(() => {
    setSelectedConnectors((prev) => {
      if (prev.length === filteredConnectors.length) {
        return [];
      }
      return filteredConnectors.map((connector) => connector.id);
    });
  }, [filteredConnectors]);

  const handleSelectAllProducts = useCallback(() => {
    setSelectedProducts((prev) => {
      if (prev.length === filteredProducts.length) {
        return [];
      }
      return filteredProducts.map((product: any) => product.id);
    });
  }, [filteredProducts]);

  const handleProductToggle = useCallback((productId: number) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  }, []);

  const handleKnowledgeBaseImport = useCallback(async () => {
    if (!enableKnowledgeBaseFlow || isImporting) {
      return;
    }

    const hasConnectors = selectedConnectors.length > 0;
    const hasFiles = selectedSmartDrivePaths.length > 0;
    const hasProducts = selectedProducts.length > 0;

    if (!hasConnectors && !hasFiles && !hasProducts) {
      return;
    }

    setIsImporting(true);

    try {
      if (hasConnectors) {
        const connectorSourcesForTracking = Array.from(
          new Set(
            selectedConnectors
              .map((id) => connectors.find((connector) => connector.id === id)?.source)
              .filter((source): source is string => Boolean(source))
          )
        );
        trackImportFiles("Connectors", connectorSourcesForTracking);
      } else if (hasFiles) {
        const fileExtensionsForTracking = Array.from(
          new Set(
            selectedSmartDrivePaths
              .map((path) => {
                const name = (path.split("/").pop() || path).split("?")[0];
                const parts = name.split(".");
                return parts.length > 1 ? parts.pop()?.toLowerCase() : undefined;
              })
              .filter((ext): ext is string => Boolean(ext))
          )
        );
        trackImportFiles("Files", fileExtensionsForTracking);
      } else if (hasProducts) {
        const productTypesForTracking = Array.from(
          new Set(
            (products || [])
              .filter((product: any) => selectedProducts.includes(product?.id))
              .map((product: any) => product?.design_microproduct_type)
              .filter((type: any): type is string => typeof type === "string" && type.length > 0)
          )
        );
        trackImportFiles("Products", productTypesForTracking);
      }

      const combinedContext: Record<string, unknown> = {
        timestamp: Date.now(),
      };

      const searchParams = new URLSearchParams();

      let productOnyxIds: string[] = [];
      if (hasProducts) {
        const CUSTOM_BACKEND_URL =
          process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || "/api/custom-projects-backend";

        for (const productId of selectedProducts) {
          const product = (products || []).find((item: any) => item.id === productId);
          let onyxId: string | undefined = product?.product_json_onyx_id;

          if (!onyxId) {
            try {
              const ensureJsonResponse = await fetch(
                `${CUSTOM_BACKEND_URL}/products/${productId}/ensure-json`,
                {
                  method: "POST",
                  credentials: "same-origin",
                }
              );

              if (ensureJsonResponse.ok) {
                const responseData = await ensureJsonResponse.json();
                onyxId = responseData?.product_json_onyx_id;
              } else {
                const errorText = await ensureJsonResponse.text();
                console.error(
                  `[KnowledgeBaseImport] ensure-json failed for product ${productId}:`,
                  errorText
                );
              }
            } catch (error) {
              console.error(
                `[KnowledgeBaseImport] ensure-json exception for product ${productId}:`,
                error
              );
            }
          }

          if (onyxId) {
            productOnyxIds.push(String(onyxId));
          } else {
            console.warn(
              `[KnowledgeBaseImport] No Onyx ID available for product ${productId}, skipping`
            );
          }
        }
      }

      const mergedSelectedFiles = [...selectedSmartDrivePaths, ...productOnyxIds];

      if (hasConnectors && mergedSelectedFiles.length > 0) {
        combinedContext.fromConnectors = true;
        combinedContext.connectorIds = selectedConnectors;
        const sources = selectedConnectors.map(
          (id) => connectors.find((connector) => connector.id === id)?.source || "unknown"
        );
        combinedContext.connectorSources = sources;
        combinedContext.selectedFiles = mergedSelectedFiles;

        searchParams.set("fromConnectors", "true");
        searchParams.set("connectorIds", selectedConnectors.join(","));
        searchParams.set("connectorSources", sources.join(","));
        searchParams.set("selectedFiles", mergedSelectedFiles.join(","));
      } else if (hasConnectors) {
        combinedContext.fromConnectors = true;
        combinedContext.connectorIds = selectedConnectors;
        const sources = selectedConnectors.map(
          (id) => connectors.find((connector) => connector.id === id)?.source || "unknown"
        );
        combinedContext.connectorSources = sources;

        searchParams.set("fromConnectors", "true");
        searchParams.set("connectorIds", selectedConnectors.join(","));
        searchParams.set("connectorSources", sources.join(","));
      } else if (mergedSelectedFiles.length > 0) {
        combinedContext.fromConnectors = true;
        combinedContext.selectedFiles = mergedSelectedFiles;
        combinedContext.connectorIds = [];
        combinedContext.connectorSources = [];

        searchParams.set("fromConnectors", "true");
        searchParams.set("selectedFiles", mergedSelectedFiles.join(","));
      } else {
        console.error("[KnowledgeBaseImport] No valid selection after processing, aborting.");
        return;
      }

      try {
        sessionStorage.setItem("combinedContext", JSON.stringify(combinedContext));
      } catch (error) {
        console.error("[KnowledgeBaseImport] Failed to store combined context:", error);
      }

      if (onImport) {
        onImport();
      }

      onClose();
      router.push(`/create/generate?${searchParams.toString()}`);
    } catch (error) {
      console.error("[KnowledgeBaseImport] Import flow failed:", error);
    } finally {
      setIsImporting(false);
    }
  }, [
    connectors,
    enableKnowledgeBaseFlow,
    isImporting,
    onClose,
    onImport,
    products,
    router,
    selectedConnectors,
    selectedProducts,
    selectedSmartDrivePaths,
  ]);

  const handleLegacyImport = useCallback(() => {
    if (enableKnowledgeBaseFlow) {
      return;
    }

    if (onImport) {
      onImport();
    }

    const filesToImport = selectedFiles || localSelectedFiles;

    if (!filesToImport || filesToImport.length === 0) {
      onClose();
      return;
    }

    const smartDriveFiles = filesToImport.map((file: any) => {
      const nameParts = file.name ? file.name.split(".") : ["SmartDrive File"];
      const extension = nameParts.length > 1 ? "." + nameParts.pop() : ".smartdrive";
      const name = nameParts.join(".");

      return {
        id: file.id || Math.random().toString(36).substr(2, 9),
        name,
        extension,
        smartDriveFile: true,
        originalFile: file,
      };
    });

    localStorage.setItem("uploadedFiles", JSON.stringify(smartDriveFiles));

    if (typeof window !== "undefined") {
      (window as any).pendingUploadFiles = smartDriveFiles.map((file) => ({
        name: file.name + file.extension,
        size: file.originalFile?.size || 0,
        type: file.originalFile?.type || "application/octet-stream",
        lastModified: Date.now(),
        smartDriveFile: true,
        originalFile: file.originalFile,
      }));
    }

    onClose();
    router.push("/create/from-files-new/upload");
  }, [enableKnowledgeBaseFlow, localSelectedFiles, onClose, onImport, router, selectedFiles]);

  const getConnectorIcon = (source: string) => connectorIcons[source] || connectorIcons.default;

  if (!isOpen) return null;

  const disableKnowledgeBaseImport = !selectionValid || isImporting;
  const legacyHasSelection =
    (selectedFiles && selectedFiles.length > 0) || localSelectedFiles.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(0, 0, 0, 0.15)",
      }}
      onClick={onClose}
    >
      <div
        className="rounded-lg p-6 flex flex-col"
        style={{
          background: "linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)",
          boxShadow: "4px 4px 8px 0px #0000000D",
          border: "1px solid #E0E0E0",
          width: "95vw",
          height: "95vh",
          maxHeight: "95vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex-shrink-0">
          {activeTab === "connectors"
            ? t("interface.importFromSmartDrive.selectConnector", "Select a connector")
            : t("interface.importFromSmartDrive.selectFile", "Select a file")}
        </h2>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-6 pr-2">
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-600">
                    {t("interface.smartDriveBrowser", "Smart Drive Browser")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t(
                      "interface.browseAndSelectFiles",
                      "Browse and select files from your cloud storage"
                    )}
                  </p>
                </div>
              </div>
            </div>

            <SmartDriveConnectors
              mode="select"
              onTabChange={handleTabChange}
              hideStatsBar={true}
              onFileSelect={handleFileSelection}
            />
          </section>

          {enableKnowledgeBaseFlow && (
            <>
              <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Settings className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-600">
                        {t("interface.selectConnectors", "Select Connectors")}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {t(
                          "interface.chooseDataSources",
                          "Choose data sources to include in your content"
                        )}
                      </p>
                    </div>
                  </div>
                  {filteredConnectors.length > 0 && (
                    <Button
                      variant="ghost"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      onClick={handleSelectAllConnectors}
                    >
                      {selectedConnectors.length === filteredConnectors.length
                        ? t("interface.deselectAll", "Deselect All")
                        : t("interface.selectAll", "Select All")}
                    </Button>
                  )}
                </div>

                <div className="mb-4 max-w-md relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    type="text"
                    placeholder={t("interface.searchConnectors", "Search connectors...")}
                    value={connectorSearchTerm}
                    onChange={(event) => setConnectorSearchTerm(event.target.value)}
                    className="w-full pl-10 pr-4 py-3"
                  />
                </div>

                {loadingConnectors ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredConnectors.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg font-medium">
                      {connectorSearchTerm
                        ? t(
                            "interface.noConnectorsFound",
                            "No connectors found matching your search."
                          )
                        : t("interface.noConnectorsAvailable", "No connectors available.")}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      {connectorSearchTerm
                        ? t("interface.tryAdjustingSearch", "Try adjusting your search terms.")
                        : t(
                            "interface.connectFirstDataSource",
                            "Connect your first data source to get started."
                          )}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredConnectors.map((connector) => {
                      const gradient = getConnectorGradient(connector.source);
                      const textColor = getTextColorFromGradient(gradient.from);
                      return (
                        <ConnectorCard
                          key={connector.id}
                          title={connector.name}
                          value={connector.source}
                          iconSrc={getConnectorIcon(connector.source)}
                          gradientColors={gradient}
                          textColor={textColor}
                          iconColor="gray-600"
                          selectable
                          isSelected={selectedConnectors.includes(connector.id)}
                          onSelect={() => handleConnectorToggle(connector.id)}
                          showHoverEffect
                          hoverGradientColors={{ from: "blue-500", to: "purple-500" }}
                        />
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-600">
                        {t("interface.selectProducts", "Select Products")}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {t(
                          "interface.chooseProductsAsContext",
                          "Choose previously created products to include as context"
                        )}
                      </p>
                    </div>
                  </div>
                  {filteredProducts.length > 0 && (
                    <Button
                      variant="ghost"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      onClick={handleSelectAllProducts}
                    >
                      {selectedProducts.length === filteredProducts.length
                        ? t("interface.deselectAll", "Deselect All")
                        : t("interface.selectAll", "Select All")}
                    </Button>
                  )}
                </div>

                <div className="mb-4 max-w-md relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    type="text"
                    placeholder={t("interface.searchProducts", "Search products...")}
                    value={productSearchTerm}
                    onChange={(event) => setProductSearchTerm(event.target.value)}
                    className="w-full pl-10 pr-4 py-3"
                  />
                </div>

                {loadingProducts ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg font-medium">
                      {productSearchTerm
                        ? t("interface.noProductsFound", "No products found matching your search.")
                        : t("interface.noProductsAvailable", "No products available.")}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      {productSearchTerm
                        ? t("interface.tryAdjustingSearch", "Try adjusting your search terms.")
                        : t("interface.createFirstProduct", "Create your first product to get started.")}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[420px] overflow-y-auto pr-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {filteredProducts.map((product: any) => (
                        <LMSProductCard
                          key={product.id}
                          product={product}
                          isSelected={selectedProducts.includes(product.id)}
                          onToggleSelect={handleProductToggle}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{
              color: "#0F58F9",
              backgroundColor: "white",
              border: "1px solid #0F58F9",
            }}
          >
            {t("interface.importFromSmartDrive.cancel", "Cancel")}
          </button>
          {enableKnowledgeBaseFlow ? (
            <button
              onClick={handleKnowledgeBaseImport}
              disabled={disableKnowledgeBaseImport}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                disableKnowledgeBaseImport ? "opacity-60 cursor-not-allowed" : ""
              }`}
              style={{
                backgroundColor: "#0F58F9",
              }}
            >
              {isImporting
                ? t("interface.importInProgress", "Importing...")
                : t("interface.importFromSmartDrive.import", "Import")}
            </button>
          ) : (
            legacyHasSelection && (
              <button
                onClick={handleLegacyImport}
                className="px-4 py-2 rounded-md text-sm font-medium text-white"
                style={{
                  backgroundColor: "#0F58F9",
                }}
              >
                {t("interface.importFromSmartDrive.import", "Import")}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

*** End Patch
