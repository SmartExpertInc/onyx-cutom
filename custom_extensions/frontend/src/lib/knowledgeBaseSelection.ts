export interface KnowledgeBaseConnector {
  id: number;
  name?: string;
  source: string;
}

export interface KnowledgeBaseSelection {
  filePaths: string[];
  connectors: KnowledgeBaseConnector[];
}

export interface KnowledgeBaseContextResult {
  combinedContext: Record<string, any>;
  searchParams: URLSearchParams;
  connectorIds: number[];
  connectorSources: string[];
  selectedFiles: string[];
}

const uniqueBy = <T, K>(items: T[], getKey: (item: T) => K): T[] => {
  const seen = new Set<K>();
  const result: T[] = [];

  for (const item of items) {
    const key = getKey(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
};

export const buildKnowledgeBaseContext = (
  selection: KnowledgeBaseSelection
): KnowledgeBaseContextResult => {
  const uniqueFilePaths = uniqueBy(selection.filePaths || [], (path) => path.trim()).filter(
    (path) => typeof path === "string" && path.trim().length > 0
  );

  const uniqueConnectors = uniqueBy(selection.connectors || [], (connector) => connector.id).filter(
    (connector) =>
      connector &&
      typeof connector.id === "number" &&
      Number.isFinite(connector.id) &&
      connector.source &&
      connector.source.length > 0
  );

  const connectorIds = uniqueConnectors.map((connector) => connector.id);
  const connectorSources = uniqueConnectors.map((connector) => connector.source || "unknown");

  const hasConnectors = connectorIds.length > 0;
  const hasFiles = uniqueFilePaths.length > 0;

  const combinedContext: Record<string, any> = {
    timestamp: Date.now(),
  };

  const searchParams = new URLSearchParams();

  if (hasConnectors && hasFiles) {
    combinedContext.fromConnectors = true;
    combinedContext.connectorIds = connectorIds;
    combinedContext.connectorSources = connectorSources;
    combinedContext.selectedFiles = uniqueFilePaths;

    searchParams.set("fromConnectors", "true");
    searchParams.set("connectorIds", connectorIds.join(","));
    searchParams.set("connectorSources", connectorSources.join(","));
    searchParams.set("selectedFiles", uniqueFilePaths.join(","));
  } else if (hasConnectors) {
    combinedContext.fromConnectors = true;
    combinedContext.connectorIds = connectorIds;
    combinedContext.connectorSources = connectorSources;

    searchParams.set("fromConnectors", "true");
    searchParams.set("connectorIds", connectorIds.join(","));
    searchParams.set("connectorSources", connectorSources.join(","));
  } else if (hasFiles) {
    combinedContext.fromConnectors = true;
    combinedContext.selectedFiles = uniqueFilePaths;
    combinedContext.connectorIds = [];
    combinedContext.connectorSources = [];

    searchParams.set("fromConnectors", "true");
    searchParams.set("selectedFiles", uniqueFilePaths.join(","));
  }

  return {
    combinedContext,
    searchParams,
    connectorIds,
    connectorSources,
    selectedFiles: uniqueFilePaths,
  };
};

