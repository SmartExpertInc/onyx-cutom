"use client";

import React, { 
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  BackendChatSession,
  BackendMessage,
  ChatFileType,
  ChatSession,
  ChatSessionSharedStatus,
  FileDescriptor,
  FileChatDisplay,
  Message,
  MessageResponseIDInfo,
  RetrievalType,
  StreamingError,
  ToolCallMetadata,
  SubQuestionDetail,
  constructSubQuestions,
  DocumentsResponse,
  AgenticMessageResponseIDInfo,
  UserKnowledgeFilePacket,
} from "./interfaces";

import Prism from "prismjs";
import Cookies from "js-cookie";
import { HistorySidebar } from "./sessionSidebar/HistorySidebar";
import { Persona } from "../admin/assistants/interfaces";
import { HealthCheckBanner } from "@/components/health/healthcheck";
import { CgSpinner } from "react-icons/cg";

import {
  buildChatUrl,
  buildLatestMessageChain,
  createChatSession,
  getCitedDocumentsFromMessage,
  getHumanAndAIMessageFromMessageNumber,
  getLastSuccessfulMessageId,
  handleChatFeedback,
  nameChatSession,
  PacketType,
  personaIncludesRetrieval,
  processRawChatHistory,
  removeMessage,
  sendMessage,
  SendMessageParams,
  setMessageAsLatest,
  updateLlmOverrideForChatSession,
  updateParentChildren,
  uploadFilesForChat,
  useScrollonStream,
} from "./lib";
import { usePopup } from "@/components/admin/connectors/Popup";
import { SEARCH_PARAM_NAMES, shouldSubmitOnLoad } from "./searchParams";
import { LlmDescriptor, useFilters, useLlmManager } from "@/lib/hooks";
import { ChatState, FeedbackType, RegenerationState } from "./types";
import { DocumentResults } from "./documentSidebar/DocumentResults";
import { OnyxInitializingLoader } from "@/components/OnyxInitializingLoader";
import { FeedbackModal } from "./modal/FeedbackModal";
import { ShareChatSessionModal } from "./modal/ShareChatSessionModal";
import { FiArrowDown } from "react-icons/fi";
import { ChatIntro } from "./ChatIntro";
import { AIMessage, HumanMessage } from "./message/Messages";
import { StarterMessages } from "../../components/assistants/StarterMessage";
import MakeIntoProductModal from "@/components/chat/MakeIntoProductModal";
import {
  AnswerPiecePacket,
  OnyxDocument,
  DocumentInfoPacket,
  StreamStopInfo,
  StreamStopReason,
  SubQueryPiece,
  SubQuestionPiece,
  AgentAnswerPiece,
  RefinedAnswerImprovement,
  MinimalOnyxDocument,
} from "@/lib/search/interfaces";
import { buildFilters } from "@/lib/search/utils";
import { SettingsContext } from "@/components/settings/SettingsProvider";
import Dropzone from "react-dropzone";
import {
  getFinalLLM,
  modelSupportsImageInput,
  structureValue,
} from "@/lib/llm/utils";
import { ChatInputBar } from "./input/ChatInputBar";
import { useChatContext } from "@/components/context/ChatContext";
import { ChatPopup } from "./ChatPopup";
import FunctionalHeader from "@/components/chat/Header";
import { useSidebarVisibility } from "@/components/chat/hooks";
import {
  PRO_SEARCH_TOGGLED_COOKIE_NAME,
  SIDEBAR_TOGGLED_COOKIE_NAME,
} from "@/components/resizable/constants";
import FixedLogo from "@/components/logo/FixedLogo";
import ExceptionTraceModal from "@/components/modals/ExceptionTraceModal";
import { SEARCH_TOOL_ID, SEARCH_TOOL_NAME } from "./tools/constants";
import { useUser } from "@/components/user/UserProvider";
import { ApiKeyModal } from "@/components/llm/ApiKeyModal";
import BlurBackground from "../../components/chat/BlurBackground";
import { NoAssistantModal } from "@/components/modals/NoAssistantModal";
import { useAssistants } from "@/components/context/AssistantsContext";
import TextView from "@/components/chat/TextView";
import { Modal } from "@/components/Modal";
import { useSendMessageToParent } from "@/lib/extension/utils";
import {
  CHROME_MESSAGE,
  SUBMIT_MESSAGE_TYPES,
} from "@/lib/extension/constants";

import { getSourceMetadata } from "@/lib/sources";
import { UserSettingsModal } from "./modal/UserSettingsModal";
import { AgenticMessage } from "./message/AgenticMessage"; 
import AssistantModal from "../assistants/mine/AssistantModal";
import { useSidebarShortcut } from "@/lib/browserUtilities";
import { FilePickerModal } from "./my-documents/components/FilePicker";

import { SourceMetadata } from "@/lib/search/interfaces";
import { ValidSources } from "@/lib/types";
import {
  FileResponse,
  FolderResponse,
  useDocumentsContext,
} from "./my-documents/DocumentsContext";
import { ChatSearchModal } from "./chat_search/ChatSearchModal";
import { ErrorBanner } from "./message/Resubmit";
import MinimalMarkdown from "@/components/chat/MinimalMarkdown";

import { DesignTemplateResponse } from '@/types/designTemplates';
import { WelcomeModal } from "@/components/initialSetup/welcome/WelcomeModal";

const TEMP_USER_MESSAGE_ID = -1;
const TEMP_ASSISTANT_MESSAGE_ID = -2;
const SYSTEM_MESSAGE_ID = -3;

export enum UploadIntent {
  ATTACH_TO_MESSAGE,
  ADD_TO_DOCUMENTS,
}

export function ChatPage({
  toggle,
  documentSidebarInitialWidth,
  sidebarVisible,
  firstMessage,
  initialFolders,
  initialFiles,
}: {
  toggle: (toggled?: boolean) => void;
  documentSidebarInitialWidth?: number;
  sidebarVisible: boolean;
  firstMessage?: string;
  initialFolders?: any;
  initialFiles?: any;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [messageToSendOnLoad, setMessageToSendOnLoad] = useState<string | null>(null);
  const [designTemplates, setDesignTemplates] = useState<DesignTemplateResponse[]>([]);
  const [isLoadingDesignTemplates, setIsLoadingDesignTemplates] = useState<boolean>(false);
  const { popup, setPopup } = usePopup();

  const [isCreatingProduct, setIsCreatingProduct] = useState<boolean>(false);
  const [productCreationResult, setProductCreationResult] = useState<null | {
    success: boolean;
    message: string;
    projectId?: string;
  }>(null);

  const {
    chatSessions,
    ccPairs,
    tags,
    documentSets,
    llmProviders,
    folders,
    shouldShowWelcomeModal,
    refreshChatSessions,
    proSearchToggled,
  } = useChatContext();

  const {
    selectedFiles,
    selectedFolders,
    addSelectedFile,
    addSelectedFolder,
    clearSelectedItems,
    setSelectedFiles,
    folders: userFolders,
    files: allUserFiles, 
    uploadFile,
    currentMessageFiles,
    setCurrentMessageFiles,
  } = useDocumentsContext();

  const defaultAssistantIdRaw = searchParams?.get(
    SEARCH_PARAM_NAMES.PERSONA_ID
  );
  const defaultAssistantId = defaultAssistantIdRaw
    ? parseInt(defaultAssistantIdRaw)
    : undefined;

  const ensureDesignTemplatesFetched = async (): Promise<DesignTemplateResponse[]> => {
    if (designTemplates.length > 0 && !isLoadingDesignTemplates) { // Also check isLoading to prevent race conditions
      return designTemplates;
    }

    setIsLoadingDesignTemplates(true);
    try {
      const response = await fetch("/api/custom-projects-backend/design_templates");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to fetch design templates" }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      // Explicitly type the data from the JSON response
      const data: DesignTemplateResponse[] = await response.json();
      setDesignTemplates(data);
      setIsLoadingDesignTemplates(false);
      return data;
    } catch (error) {
      console.error("Error fetching design templates:", error);
      const errorMessage = error instanceof Error ? error.message : "Could not load product types.";
      setPopup({ type: "error", message: "Could not load product types to proceed: " + errorMessage });
      setIsLoadingDesignTemplates(false);
      setDesignTemplates([]); // Clear templates on error
      return []; // Return empty array on error
    }
  };  

  function useScreenSize() {
    const [screenSize, setScreenSize] = useState({
      width: typeof window !== "undefined" ? window.innerWidth : 0,
      height: typeof window !== "undefined" ? window.innerHeight : 0,
    });

    useEffect(() => {
      const handleResize = () => {
        setScreenSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return screenSize;
  }

  const settings = useContext(SettingsContext);
  const enterpriseSettings = settings?.enterpriseSettings;

  const [selectedDocuments, setSelectedDocuments] = useState<OnyxDocument[]>(
    []
  );
  const [selectedDocumentTokens, setSelectedDocumentTokens] = useState(0);


  const [toggleDocSelection, setToggleDocSelection] = useState(false);
  const [documentSidebarVisible, setDocumentSidebarVisible] = useState(false);
  const [proSearchEnabled, setProSearchEnabled] = useState(proSearchToggled);
  const toggleProSearch = () => {
    Cookies.set(
      PRO_SEARCH_TOGGLED_COOKIE_NAME,
      String(!proSearchEnabled).toLocaleLowerCase()
    );
    setProSearchEnabled(!proSearchEnabled);
  };

  const isInitialLoad = useRef(true);
  const [userSettingsToggled, setUserSettingsToggled] = useState(false);

  const { assistants: availableAssistants, pinnedAssistants } = useAssistants();

  const [showApiKeyModal, setShowApiKeyModal] = useState(
    !shouldShowWelcomeModal
  );

  const { user, isAdmin } = useUser();
  const slackChatId = searchParams?.get("slackChatId");
  const existingChatIdRaw = searchParams?.get("chatId");

  const [showHistorySidebar, setShowHistorySidebar] = useState(false);

  const existingChatSessionId = existingChatIdRaw ? existingChatIdRaw : null;

  const selectedChatSession = chatSessions.find(
    (chatSession) => chatSession.id === existingChatSessionId
  );

  const [showProductSelectionModal, setShowProductSelectionModal] = useState(false);

  useEffect(() => {
    if (user?.is_anonymous_user) {
      Cookies.set(
        SIDEBAR_TOGGLED_COOKIE_NAME,
        String(!sidebarVisible).toLocaleLowerCase()
      );
      toggle(false);
    }
  }, [user, toggle, sidebarVisible]);

  const chatSessionIdRef = useRef<string | null>(existingChatSessionId);
  const loadedIdSessionRef = useRef<string | null>(existingChatSessionId);

  const existingChatSessionAssistantId = selectedChatSession?.persona_id;
  const [selectedAssistant, setSelectedAssistant] = useState<
    Persona | undefined
  >(
    existingChatSessionAssistantId !== undefined
      ? availableAssistants.find(
        (assistant) => assistant.id === existingChatSessionAssistantId
      )
      : defaultAssistantId !== undefined
        ? availableAssistants.find(
          (assistant) => assistant.id === defaultAssistantId
        )
        : undefined
  );

  const setSelectedAssistantFromId = (assistantId: number) => {
    setSelectedAssistant(
      availableAssistants.find((assistant) => assistant.id === assistantId)
    );
  };

  const [alternativeAssistant, setAlternativeAssistant] =
    useState<Persona | null>(null);

  const [presentingDocument, setPresentingDocument] =
    useState<MinimalOnyxDocument | null>(null);

  const liveAssistant: Persona | undefined = useMemo(
    () =>
      alternativeAssistant ||
      selectedAssistant ||
      pinnedAssistants[0] ||
      availableAssistants[0],
    [
      alternativeAssistant,
      selectedAssistant,
      pinnedAssistants,
      availableAssistants,
    ]
  );

  const llmManager = useLlmManager(
    llmProviders,
    selectedChatSession,
    liveAssistant
  );

  const noAssistants = liveAssistant == null || liveAssistant == undefined;

  const availableSources: ValidSources[] = useMemo(() => {
    return ccPairs.map((ccPair) => ccPair.source);
  }, [ccPairs]);

  const sources: SourceMetadata[] = useMemo(() => {
    const uniqueSources = Array.from(new Set(availableSources));
    return uniqueSources.map((source) => getSourceMetadata(source));
  }, [availableSources]);

  const stopGenerating = () => {
    const currentSession = currentSessionId();
    const controller = abortControllers.get(currentSession);
    if (controller) {
      controller.abort();
      setAbortControllers((prev) => {
        const newControllers = new Map(prev);
        newControllers.delete(currentSession);
        return newControllers;
      });
    }

    const lastMessage = messageHistory[messageHistory.length - 1];
    if (
      lastMessage &&
      lastMessage.type === "assistant" &&
      lastMessage.toolCall &&
      lastMessage.toolCall.tool_result === undefined
    ) {
      const newCompleteMessageMap = new Map(
        currentMessageMap(completeMessageDetail)
      );
      const updatedMessage = { ...lastMessage, toolCall: null };
      newCompleteMessageMap.set(lastMessage.messageId, updatedMessage);
      updateCompleteMessageDetail(currentSession, newCompleteMessageMap);
    }

    updateChatState("input", currentSession);
  };

  const [alternativeGeneratingAssistant, setAlternativeGeneratingAssistant] =
    useState<Persona | null>(null);

  const submitOnLoadPerformed = useRef<boolean>(false);

  const [isFetchingChatMessages, setIsFetchingChatMessages] = useState(
    existingChatSessionId !== null
  );

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
    setIsReady(true);
  }, []);
  
  const clearSelectedDocuments = () => {
    setSelectedDocuments([]);
    setSelectedDocumentTokens(0);
    clearSelectedItems();
  };

  useEffect(() => {
    const priorChatSessionId = chatSessionIdRef.current;
    const loadedSessionId = loadedIdSessionRef.current;
    chatSessionIdRef.current = existingChatSessionId;
    loadedIdSessionRef.current = existingChatSessionId;

    textAreaRef.current?.focus();

    const isChatSessionSwitch = existingChatSessionId !== priorChatSessionId;
    if (isChatSessionSwitch) {
      filterManager.setSelectedDocumentSets([]);
      filterManager.setSelectedSources([]);
      filterManager.setSelectedTags([]);
      filterManager.setTimeRange(null);
      setCurrentMessageFiles([]);
      if (chatSessionIdRef.current !== null) {
        clearSelectedDocuments();
        setHasPerformedInitialScroll(false);
      }
    }


    async function initialSessionFetch() {
      if (existingChatSessionId === null) {
        setIsFetchingChatMessages(false);
        if (defaultAssistantId !== undefined) {
          setSelectedAssistantFromId(defaultAssistantId);
        } else {
          setSelectedAssistant(undefined);
        }
        updateCompleteMessageDetail(null, new Map());
        setChatSessionSharedStatus(ChatSessionSharedStatus.Private);

        if (!shouldSubmitOnLoad(searchParams) && !searchParams?.get(SEARCH_PARAM_NAMES.SEEDED)) {
          setShowProductSelectionModal(true);
        }

        if (
          shouldSubmitOnLoad(searchParams) &&
          !submitOnLoadPerformed.current
        ) {
          submitOnLoadPerformed.current = true;
          await onSubmit();
        }
        return;
      }

      setIsFetchingChatMessages(true);
      const response = await fetch(
        `/api/chat/get-chat-session/${existingChatSessionId}`
      );

      const session = await response.json();
      const chatSession = session as BackendChatSession;
      setSelectedAssistantFromId(chatSession.persona_id);

      const newMessageMap = processRawChatHistory(chatSession.messages);
      updateCompleteMessageDetail(chatSession.chat_session_id, newMessageMap);

      const newMessageHistory = buildLatestMessageChain(newMessageMap);

      if (
        (messageHistory[messageHistory.length - 1]?.type !== "error" ||
          loadedSessionId != null) &&
        !currentChatAnswering()
      ) {
        const latestMessageId =
          newMessageHistory[newMessageHistory.length - 1]?.messageId;
        setSelectedMessageForDocDisplay(
          latestMessageId !== undefined ? latestMessageId : null
        );
        updateCompleteMessageDetail(chatSession.chat_session_id, newMessageMap);
      }

      setChatSessionSharedStatus(chatSession.shared_status);
      scrollInitialized.current = false;

      if (!hasPerformedInitialScroll) {
        if (isInitialLoad.current) {
          setHasPerformedInitialScroll(true);
          isInitialLoad.current = false;
        }
        clientScrollToBottom();
        setTimeout(() => {
          setHasPerformedInitialScroll(true);
        }, 100);
      } else if (isChatSessionSwitch) {
        setHasPerformedInitialScroll(true);
        clientScrollToBottom(true);
      }

      setIsFetchingChatMessages(false);

      const shouldSendOnLoad = searchParams?.get(SEARCH_PARAM_NAMES.SEND_ON_LOAD) === "true";
      if (shouldSendOnLoad && !submitOnLoadPerformed.current) {
        submitOnLoadPerformed.current = true;
        
        const messageFromParams = searchParams?.get(SEARCH_PARAM_NAMES.USER_PROMPT);

        if (messageFromParams) {
          // Clean up the URL to prevent re-submission on page refresh
          const newSearchParams = new URLSearchParams(searchParams.toString());
          newSearchParams.delete(SEARCH_PARAM_NAMES.USER_PROMPT);
          newSearchParams.delete(SEARCH_PARAM_NAMES.SEND_ON_LOAD);
          router.replace(`?${newSearchParams.toString()}`, { scroll: false });
          
          // Set the state that will trigger the submission in the next render cycle
          setMessageToSendOnLoad(messageFromParams);
        }
      }

      if (
        newMessageHistory.length === 1 &&
        newMessageHistory[0] !== undefined &&
        !submitOnLoadPerformed.current &&
        searchParams?.get(SEARCH_PARAM_NAMES.SEEDED) === "true"
      ) {
        submitOnLoadPerformed.current = true;
        const seededMessage = newMessageHistory[0].message;
        await onSubmit({
          isSeededChat: true,
          messageOverride: seededMessage,
        });
        if (!chatSession.description) {
          await nameChatSession(existingChatSessionId);
          refreshChatSessions();
        }
      } else if (newMessageHistory.length === 2 && !chatSession.description) {
        await nameChatSession(existingChatSessionId);
        refreshChatSessions();
      }
    }

    initialSessionFetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingChatSessionId, searchParams?.get(SEARCH_PARAM_NAMES.PERSONA_ID)]);
  
  useEffect(() => {
    // This effect will run *after* the render cycle where `messageToSendOnLoad` is set.
    // At this point, the chat history from `initialSessionFetch` is guaranteed to be
    // in the component's state.
    if (messageToSendOnLoad && !currentChatAnswering()) {
      // Now the call to `onSubmit` will read the up-to-date chat history.
      onSubmit({ messageOverride: messageToSendOnLoad });
      
      // Reset the state to prevent this from running more than once
      setMessageToSendOnLoad(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageToSendOnLoad]);


  useEffect(() => {
    const userFolderId = searchParams?.get(SEARCH_PARAM_NAMES.USER_FOLDER_ID);
    const allMyDocuments = searchParams?.get(
      SEARCH_PARAM_NAMES.ALL_MY_DOCUMENTS
    );

    if (userFolderId) {
      const userFolder = userFolders.find(
        (folder) => folder.id === parseInt(userFolderId)
      );
      if (userFolder) {
        addSelectedFolder(userFolder);
      }
    } else if (allMyDocuments === "true" || allMyDocuments === "1") {
      clearSelectedItems();
      userFolders.forEach((folder) => {
        addSelectedFolder(folder);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ 
    userFolders, 
    searchParams 
  ]);

  const [message, setMessage] = useState(
    searchParams?.get(SEARCH_PARAM_NAMES.USER_PROMPT) || ""
  );

  const [completeMessageDetail, setCompleteMessageDetail] = useState<
    Map<string | null, Map<number, Message>>
  >(new Map());

  const updateCompleteMessageDetail = (
    sessionId: string | null,
    messageMap: Map<number, Message>
  ) => {
    setCompleteMessageDetail((prevState) => {
      const newState = new Map(prevState);
      newState.set(sessionId, messageMap);
      return newState;
    });
  };

  const currentMessageMap = (
    messageDetail: Map<string | null, Map<number, Message>>
  ) => {
    return (
      messageDetail.get(chatSessionIdRef.current) || new Map<number, Message>()
    );
  };
  const currentSessionId = (): string => {
    return chatSessionIdRef.current!;
  };

  const upsertToCompleteMessageMap = ({
    messages,
    completeMessageMapOverride,
    chatSessionId,
    replacementsMap = null,
    makeLatestChildMessage = false,
  }: {
    messages: Message[];
    completeMessageMapOverride?: Map<number, Message> | null;
    chatSessionId?: string;
    replacementsMap?: Map<number, number> | null;
    makeLatestChildMessage?: boolean;
  }) => {
    const frozenCompleteMessageMap =
      completeMessageMapOverride || currentMessageMap(completeMessageDetail);
    const newCompleteMessageMap = structuredClone(frozenCompleteMessageMap);

    if (messages[0] !== undefined && newCompleteMessageMap.size === 0) {
      const systemMessageId = messages[0].parentMessageId || SYSTEM_MESSAGE_ID;
      const firstMessageId = messages[0].messageId;
      const dummySystemMessage: Message = {
        messageId: systemMessageId,
        message: "",
        type: "system",
        files: [],
        toolCall: null,
        parentMessageId: null,
        childrenMessageIds: [firstMessageId],
        latestChildMessageId: firstMessageId,
      };
      newCompleteMessageMap.set(
        dummySystemMessage.messageId,
        dummySystemMessage
      );
      messages[0].parentMessageId = systemMessageId;
    }

    messages.forEach((message) => {
      const idToReplace = replacementsMap?.get(message.messageId);
      if (idToReplace) {
        removeMessage(idToReplace, newCompleteMessageMap);
      }

      if (
        !newCompleteMessageMap.has(message.messageId) &&
        message.parentMessageId !== null
      ) {
        updateParentChildren(message, newCompleteMessageMap, true);
      }
      newCompleteMessageMap.set(message.messageId, message);
    });
    if (makeLatestChildMessage && messages.length > 0) { 
      const currentMessageChain = buildLatestMessageChain(
        frozenCompleteMessageMap
      );
      const latestMessage = currentMessageChain[currentMessageChain.length - 1];
      if (messages[0] !== undefined && latestMessage) {
        newCompleteMessageMap.get(
          latestMessage.messageId
        )!.latestChildMessageId = messages[0].messageId;
      }
    }

    const newCompleteMessageDetail = {
      sessionId: chatSessionId || currentSessionId(),
      messageMap: newCompleteMessageMap,
    };

    updateCompleteMessageDetail(
      chatSessionId || currentSessionId(),
      newCompleteMessageMap
    );
    console.log(newCompleteMessageDetail);
    return newCompleteMessageDetail;
  };

  const messageHistory = buildLatestMessageChain(
    currentMessageMap(completeMessageDetail)
  );

  const [submittedMessage, setSubmittedMessage] = useState(firstMessage || "");

  const [chatState, setChatState] = useState<Map<string | null, ChatState>>(
    new Map([[chatSessionIdRef.current, firstMessage ? "loading" : "input"]])
  );

  const [regenerationState, setRegenerationState] = useState<
    Map<string | null, RegenerationState | null>
  >(new Map([[null, null]]));

  const [abortControllers, setAbortControllers] = useState<
    Map<string | null, AbortController>
  >(new Map());

  const updateStatesWithNewSessionId = (newSessionId: string) => {
    const updateState = (
      setState: Dispatch<SetStateAction<Map<string | null, any>>>,
      defaultValue?: any
    ) => {
      setState((prevState) => {
        const newState = new Map(prevState);
        const existingState = newState.get(null);
        if (existingState !== undefined) {
          newState.set(newSessionId, existingState);
          newState.delete(null);
        } else if (defaultValue !== undefined) {
          newState.set(newSessionId, defaultValue);
        }
        return newState;
      });
    };

    updateState(setRegenerationState);
    updateState(setChatState);
    updateState(setAbortControllers);

    setCompleteMessageDetail((prevState) => {
      const newState = new Map(prevState);
      const existingMessages = newState.get(null);
      if (existingMessages) {
        newState.set(newSessionId, existingMessages);
        newState.delete(null);
      }
      return newState;
    });
    chatSessionIdRef.current = newSessionId;
  };

  const updateChatState = (newState: ChatState, sessionId?: string | null) => {
    setChatState((prevState) => {
      const newChatState = new Map(prevState);
      newChatState.set(
        sessionId !== undefined ? sessionId : currentSessionId(),
        newState
      );
      return newChatState;
    });
  };

  const currentChatState = (): ChatState => {
    return chatState.get(currentSessionId()) || "input";
  };

  const currentChatAnswering = () => {
    return (
      currentChatState() == "toolBuilding" ||
      currentChatState() == "streaming" ||
      currentChatState() == "loading"
    );
  };

  const updateRegenerationState = (
    newState: RegenerationState | null,
    sessionId?: string | null
  ) => {
    const newRegenerationState = new Map(regenerationState);
    newRegenerationState.set(
      sessionId !== undefined && sessionId != null
        ? sessionId
        : currentSessionId(),
      newState
    );

    setRegenerationState((prevState) => {
      const newRegenerationState = new Map(prevState);
      newRegenerationState.set(
        sessionId !== undefined && sessionId != null
          ? sessionId
          : currentSessionId(),
        newState
      );
      return newRegenerationState;
    });
  };

  const resetRegenerationState = (sessionId?: string | null) => {
    updateRegenerationState(null, sessionId);
  };

  const currentRegenerationState = (): RegenerationState | null => {
    return regenerationState.get(currentSessionId()) || null;
  };

  const [canContinue, setCanContinue] = useState<Map<string | null, boolean>>(
    new Map([[null, false]])
  );

  const updateCanContinue = (newState: boolean, sessionId?: string | null) => {
    setCanContinue((prevState) => {
      const newCanContinueState = new Map(prevState);
      newCanContinueState.set(
        sessionId !== undefined ? sessionId : currentSessionId(),
        newState
      );
      return newCanContinueState;
    });
  };

  const currentCanContinue = (): boolean => {
    return canContinue.get(currentSessionId()) || false;
  };

  const currentSessionChatState = currentChatState();
  const currentSessionRegenerationState = currentRegenerationState();

  const [selectedMessageForDocDisplay, setSelectedMessageForDocDisplay] =
    useState<number | null>(null);

  const { aiMessage, humanMessage } = selectedMessageForDocDisplay
    ? getHumanAndAIMessageFromMessageNumber(
      messageHistory,
      selectedMessageForDocDisplay
    )
    : { aiMessage: null, humanMessage: null };

  const [chatSessionSharedStatus, setChatSessionSharedStatus] =
    useState<ChatSessionSharedStatus>(ChatSessionSharedStatus.Private);

  useEffect(() => {
    if (messageHistory.length === 0 && chatSessionIdRef.current === null) {
      setSelectedAssistant(
        availableAssistants.find((persona) => persona.id === defaultAssistantId)
      );
    }
  }, [defaultAssistantId, availableAssistants, messageHistory.length]);

  useEffect(() => {
    if (
      submittedMessage &&
      currentSessionChatState === "loading" &&
      messageHistory.length == 0
    ) {
      window.parent.postMessage(
        { type: CHROME_MESSAGE.LOAD_NEW_CHAT_PAGE },
        "*"
      );
    }
  }, [submittedMessage, currentSessionChatState, messageHistory.length]);

  const [maxTokens, setMaxTokens] = useState<number>(4096);

  useEffect(() => {
    async function fetchMaxTokens() {
      if (liveAssistant) { 
        const response = await fetch(
          `/api/chat/max-selected-document-tokens?persona_id=${liveAssistant.id}`
        );
        if (response.ok) {
          const maxTokensData = (await response.json()).max_tokens as number;
          setMaxTokens(maxTokensData);
        }
      }
    }
    fetchMaxTokens();
  }, [liveAssistant]);


  const filterManager = useFilters();
  const [isChatSearchModalOpen, setIsChatSearchModalOpen] = useState(false);

  const [currentFeedback, setCurrentFeedback] = useState<
    [FeedbackType, number] | null
  >(null);

  const [sharingModalVisible, setSharingModalVisible] =
    useState<boolean>(false);

  const [aboveHorizon, setAboveHorizon] = useState(false);

  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const endDivRef = useRef<HTMLDivElement>(null);
  const endPaddingRef = useRef<HTMLDivElement>(null);

  const previousHeight = useRef<number>(
    inputRef.current?.getBoundingClientRect().height!
  );
  const scrollDist = useRef<number>(0);

  const handleInputResize = () => {
    setTimeout(() => {
      if (
        inputRef.current &&
        lastMessageRef.current &&
        !waitForScrollRef.current
      ) {
        const newHeight: number =
          inputRef.current?.getBoundingClientRect().height!;
        const heightDifference = newHeight - previousHeight.current;
        if (
          previousHeight.current &&
          heightDifference != 0 &&
          endPaddingRef.current &&
          scrollableDivRef &&
          scrollableDivRef.current
        ) {
          endPaddingRef.current.style.transition = "height 0.3s ease-out";
          endPaddingRef.current.style.height = `${Math.max(
            newHeight - 50,
            0
          )}px`;

          if (autoScrollEnabled) {
            scrollableDivRef?.current.scrollBy({
              left: 0,
              top: Math.max(heightDifference, 0),
              behavior: "smooth",
            });
          }
        }
        previousHeight.current = newHeight;
      }
    }, 100);
  };

  const clientScrollToBottom = (fast?: boolean) => {
    waitForScrollRef.current = true;
    setTimeout(() => {
      if (!endDivRef.current || !scrollableDivRef.current) {
        console.error("endDivRef or scrollableDivRef not found");
        return;
      }
      const rect = endDivRef.current.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
      if (isVisible) return;
      endDivRef.current.scrollIntoView({
        behavior: fast ? "auto" : "smooth",
      });
      setHasPerformedInitialScroll(true);
    }, 50);
    setTimeout(() => {
      waitForScrollRef.current = false;
    }, 1500);
  };

  const debounceNumber = 100;

  const [hasPerformedInitialScroll, setHasPerformedInitialScroll] = useState(
    existingChatSessionId === null
  );

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    handleInputResize();
  }, [message]);

  const masterFlexboxRef = useRef<HTMLDivElement>(null);
  const [maxDocumentSidebarWidth, setMaxDocumentSidebarWidth] = useState<
    number | null
  >(null);
  const adjustDocumentSidebarWidth = () => {
    if (masterFlexboxRef.current && document.documentElement.clientWidth) {
      if (document.documentElement.clientWidth > 1700) {
        setMaxDocumentSidebarWidth(masterFlexboxRef.current.clientWidth - 950);
      } else if (document.documentElement.clientWidth > 1420) {
        setMaxDocumentSidebarWidth(masterFlexboxRef.current.clientWidth - 760);
      } else {
        setMaxDocumentSidebarWidth(masterFlexboxRef.current.clientWidth - 660);
      }
    }
  };

  // Corrected dependency array for this useEffect based on previous working version
  useEffect(() => {
    if (
      liveAssistant && // Ensure liveAssistant is defined before use
      !personaIncludesRetrieval(liveAssistant) &&
      (!selectedDocuments || selectedDocuments.length === 0) &&
      documentSidebarVisible
    ) {
      setDocumentSidebarVisible(false);
    }
    if (chatSessionIdRef.current !== null) {
        clientScrollToBottom();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatSessionIdRef.current]);


  const loadNewPageLogic = (event: MessageEvent) => {
    if (event.data.type === SUBMIT_MESSAGE_TYPES.PAGE_CHANGE) {
      try {
        const url = new URL(event.data.href);
        const newSearchParams = new URLSearchParams(url.searchParams.toString());
        const message = newSearchParams.get(SEARCH_PARAM_NAMES.USER_PROMPT);

        filterManager.buildFiltersFromQueryString(
          newSearchParams.toString(),
          availableSources,
          documentSets.map((ds) => ds.name),
          tags
        );
        const fileDescriptorString = newSearchParams.get(SEARCH_PARAM_NAMES.FILES);
        const overrideFileDescriptors: FileDescriptor[] = fileDescriptorString
          ? JSON.parse(decodeURIComponent(fileDescriptorString))
          : [];

        newSearchParams.delete(SEARCH_PARAM_NAMES.SEND_ON_LOAD);

        router.replace(`?${newSearchParams.toString()}`, { scroll: false });

        if (message) {
          setSubmittedMessage(message);
          onSubmit({ messageOverride: message, overrideFileDescriptors });
        }
      } catch (error) {
        console.error("Error parsing URL:", error);
      }
    }
  };

  useEffect(() => {
    adjustDocumentSidebarWidth();
    window.addEventListener("resize", adjustDocumentSidebarWidth);
    window.addEventListener("message", loadNewPageLogic);

    return () => {
      window.removeEventListener("message", loadNewPageLogic);
      window.removeEventListener("resize", adjustDocumentSidebarWidth);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!documentSidebarInitialWidth && maxDocumentSidebarWidth) {
    documentSidebarInitialWidth = Math.min(700, maxDocumentSidebarWidth);
  }
  class CurrentMessageFIFO {
    private stack: PacketType[] = [];
    isComplete: boolean = false;
    error: string | null = null;

    push(packetBunch: PacketType) {
      this.stack.push(packetBunch);
    }

    nextPacket(): PacketType | undefined {
      return this.stack.shift();
    }

    isEmpty(): boolean {
      return this.stack.length === 0;
    }
  }

  async function updateCurrentMessageFIFO(
    stack: CurrentMessageFIFO,
    params: SendMessageParams
  ) {
    try {
      for await (const packet of sendMessage(params)) {
        if (params.signal?.aborted) {
          throw new Error("AbortError");
        }
        stack.push(packet);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.debug("Stream aborted");
        } else {
          stack.error = error.message;
        }
      } else {
        stack.error = String(error);
      }
    } finally {
      stack.isComplete = true;
    }
  }

  const resetInputBar = () => {
    setMessage("");
    setCurrentMessageFiles([]);

    // Reset selectedFiles if they're under the context limit, but preserve selectedFolders.
    // If under the context limit, the files will be included in the chat history
    // so we don't need to keep them around.
    if (selectedDocumentTokens < maxTokens) {
      setSelectedFiles([]);
    }

    if (endPaddingRef.current) {
      endPaddingRef.current.style.height = `95px`;
    }
  };

  const continueGenerating = () => {
    onSubmit({
      messageOverride:
        "Continue Generating (pick up exactly where you left off)",
    });
  };
  const [uncaughtError, setUncaughtError] = useState<string | null>(null);
  const [agenticGenerating, setAgenticGenerating] = useState(false);

  const autoScrollEnabled =
    (user?.preferences?.auto_scroll && !agenticGenerating) ?? false;

  useScrollonStream({
    chatState: currentSessionChatState,
    scrollableDivRef,
    scrollDist,
    endDivRef,
    debounceNumber,
    mobile: settings?.isMobile,
    enableAutoScroll: autoScrollEnabled,
  });

  const [sessionHasSentLocalUserMessage, setSessionHasSentLocalUserMessage] =
    useState<Map<string | null, boolean>>(new Map());

  const markSessionMessageSent = (sessionId: string | null) => {
    setSessionHasSentLocalUserMessage((prev) => {
      const newMap = new Map(prev);
      newMap.set(sessionId, true);
      return newMap;
    });
  };
  const currentSessionHasSentLocalUserMessage = useMemo(
    () => (sessionId: string | null) => {
      return sessionHasSentLocalUserMessage.size === 0
        ? undefined
        : sessionHasSentLocalUserMessage.get(sessionId) || false;
    },
    [sessionHasSentLocalUserMessage]
  );

  const { height: screenHeight } = useScreenSize();

  const getContainerHeight = useMemo(() => {
    return () => {
      if (!currentSessionHasSentLocalUserMessage(chatSessionIdRef.current)) {
        return undefined;
      }
      if (autoScrollEnabled) return undefined;

      if (screenHeight < 600) return "40vh";
      if (screenHeight < 1200) return "50vh";
      return "60vh";
    };
  }, [autoScrollEnabled, screenHeight, currentSessionHasSentLocalUserMessage]);

  const reset = () => {
    setMessage("");
    setCurrentMessageFiles([]);
    clearSelectedItems();
    setLoadingError(null);
  };

  const handleProductSelectionFromModal = (productName: string) => {
    if (!productName) return;

    const message = productName;
  
    onSubmit({ messageOverride: message });

    setShowProductSelectionModal(false); // Close the modal after submitting
  };


  const handleApplyProductPrompts = async (fullAIMessage: string) => {
    // ADDED: Log the full AI message received
    console.log("AI_MESSAGE_DEBUG: Full AI message received:", JSON.stringify(fullAIMessage));

    setIsCreatingProduct(true);
    setProductCreationResult(null);

    if (!fullAIMessage || typeof fullAIMessage !== 'string') {
      // ADDED: Log invalid message content
      console.error("AI_MESSAGE_DEBUG: Invalid AI message content. Message:", fullAIMessage);
      setIsCreatingProduct(false);
      setProductCreationResult({ success: false, message: "Invalid AI message content for product creation." });
      return;
    }

    const lines = fullAIMessage.split('\n');
    const headerLine = lines[0];
    const strippedAiResponse = lines.slice(1).join('\n');

    // ADDED: Log the extracted header and the rest of the response
    console.log("AI_MESSAGE_DEBUG: Extracted Header Line:", JSON.stringify(headerLine));
    console.log("AI_MESSAGE_DEBUG: Stripped AI Response:", JSON.stringify(strippedAiResponse));
    
    // UPDATED: Regex is now less strict and allows for leading/trailing whitespace.
    const headerRegex = /^\s*\*\*(.*?)\*\* *: *\*\*(.*?)\*\* *: *\*\*(.*?)\*\*\s*$/;
    const match = headerLine ? headerLine.match(headerRegex) : null;

    // ADDED: Log the result of the regex match
    console.log("AI_MESSAGE_DEBUG: Regex match result:", match);

    if (!match || match.length < 4) {
      // ADDED: Log detailed parsing failure information
      console.error(
        "AI_MESSAGE_DEBUG: Header parsing failed. Expected format: **Project Name** : **Product** : **Instance Name**. Received Header:",
        JSON.stringify(headerLine),
        "Regex Match:", match
      );
      setIsCreatingProduct(false);
      setProductCreationResult({
        success: false,
        message: "AI message does not have the expected format for product creation. Expected: **Project Name** : **Product** : **Instance Name**",
      });
      return;
    }

    const parsedProjectName = (match[1] || "").trim();
    const parsedProductName = (match[2] || "").trim();
    let parsedInstanceName = (match[3] || "").trim();

    // ADDED: Log parsed values
    console.log("AI_MESSAGE_DEBUG: Parsed Project Name:", parsedProjectName);
    console.log("AI_MESSAGE_DEBUG: Parsed Product Name:", parsedProductName);
    console.log("AI_MESSAGE_DEBUG: Parsed Instance Name:", parsedInstanceName);


    if (!parsedProjectName || !parsedProductName) {
        // ADDED: Log failure to extract essential names
        console.error("AI_MESSAGE_DEBUG: Could not extract critical Project Name or Product from header after regex match. Header:", JSON.stringify(headerLine));
        setIsCreatingProduct(false);
        setProductCreationResult({
            success: false,
            message: "Could not extract Project Name or Product from the AI message.",
        });
        return;
    }
    
    const currentDesignTemplates: DesignTemplateResponse[] = await ensureDesignTemplatesFetched();

    if (isLoadingDesignTemplates){
        setPopup({type: "info", message: "Loading product types, please try again shortly."});
        setIsCreatingProduct(false);
        return;
    }
    
    if (currentDesignTemplates.length === 0 ) {
      console.error("AI_MESSAGE_DEBUG: No design templates available or fetch failed.");
      setIsCreatingProduct(false);
      setProductCreationResult({
        success: false,
        message: "No product types available. Please configure them or check for loading errors.",
      });
      return;
    }

    const matchedTemplate = currentDesignTemplates.find(
      (template: DesignTemplateResponse) => 
        template.template_name.trim().toLowerCase() === parsedProductName.toLowerCase()
    );

    // ADDED: Log template matching result
    console.log("AI_MESSAGE_DEBUG: Matched Template:", matchedTemplate);

    if (!matchedTemplate) {
      // ADDED: Log if no template was found
      console.error(`AI_MESSAGE_DEBUG: Product type "${parsedProductName}" not found in fetched templates. Available templates:`, currentDesignTemplates.map(t => t.template_name));
      setIsCreatingProduct(false);
      setProductCreationResult({
        success: false,
        message: `Product type "${parsedProductName}" not found. Please ensure it's a valid and existing product design.`,
      });
      return;
    }

    if (!parsedInstanceName) {
      parsedInstanceName = matchedTemplate.template_name;
      // ADDED: Log if instance name was defaulted
      console.log("AI_MESSAGE_DEBUG: Instance Name defaulted to product name:", parsedInstanceName);
    }

    const currentChatId = currentSessionId();
    if (!currentChatId) {
      setPopup({ type: "error", message: "Cannot create a product without an active chat session." });
      return;
    }

    const payload = {
      projectName: parsedProjectName,
      design_template_id: matchedTemplate.id,
      microProductName: parsedInstanceName,
      aiResponse: strippedAiResponse,
      chatSessionId: currentChatId, // Use the validated ID
    };

    console.log("AI_MESSAGE_DEBUG: Submitting to /api/custom-projects-backend/projects/add with payload:", payload);

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const devUserId = "dummy-onyx-user-id-for-testing"; 
      if (devUserId && process.env.NODE_ENV === 'development') {
        headers['X-Dev-Onyx-User-ID'] = devUserId;
      }

      const response = await fetch(`/api/custom-projects-backend/projects/add`, { // Ensure this path is correct for your setup
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `HTTP error! status: ${response.status}` }));
        // ADDED: Log API error response
        console.error("AI_MESSAGE_DEBUG: API Error Data:", errorData);
        throw new Error(errorData.detail || `Failed to create product instance.`);
      }
      
      const result = await response.json(); 
      // ADDED: Log API success response
      console.log("AI_MESSAGE_DEBUG: API Success Result:", result);
      setIsCreatingProduct(false);
      setProductCreationResult({
        success: true,
        message: `Successfully created product "${payload.microProductName}" in project "${payload.projectName}".`,
        projectId: result.id, // Assuming result.id is the new product's ID
      });
     

    } catch (err: any) {
      // ADDED: Log caught error during API call
      console.error('AI_MESSAGE_DEBUG: Failed to create product instance (catch block):', err);
      setIsCreatingProduct(false);
      setProductCreationResult({
        success: false,
        message: err.message || "An unknown error occurred during product creation.",
      });
    }
  };

  const onSubmit = async ({
    messageIdToResend,
    messageOverride,
    queryOverride,
    forceSearch,
    isSeededChat,
    alternativeAssistantOverride = null,
    modelOverride,
    regenerationRequest,
    overrideFileDescriptors,
  }: {
    messageIdToResend?: number;
    messageOverride?: string;
    queryOverride?: string;
    forceSearch?: boolean;
    isSeededChat?: boolean;
    alternativeAssistantOverride?: Persona | null;
    modelOverride?: LlmDescriptor;
    regenerationRequest?: RegenerationRequest | null;
    overrideFileDescriptors?: FileDescriptor[];
  } = {}) => {
    navigatingAway.current = false;
    let frozenSessionId = currentSessionId();
    updateCanContinue(false, frozenSessionId);
    setUncaughtError(null);
    setLoadingError(null);

    markSessionMessageSent(frozenSessionId);

    let currentMap = currentMessageMap(completeMessageDetail);
    let currentHistory = buildLatestMessageChain(currentMap);
    let lastMessage = currentHistory[currentHistory.length - 1];

    if (
      lastMessage &&
      lastMessage.type === "error" &&
      !messageIdToResend &&
      !regenerationRequest
    ) {
      const newMap = new Map(currentMap);
      const parentId = lastMessage.parentMessageId;

      newMap.delete(lastMessage.messageId);

      if (parentId !== null && parentId !== undefined) {
        const parentOfError = newMap.get(parentId);
        if (parentOfError) {
          const grandparentId = parentOfError.parentMessageId;
          if (grandparentId !== null && grandparentId !== undefined) {
            const grandparent = newMap.get(grandparentId);
            if (grandparent) {
              const updatedGrandparent = {
                ...grandparent,
                childrenMessageIds: (
                  grandparent.childrenMessageIds || []
                ).filter((id) => id !== parentId),
                latestChildMessageId:
                  grandparent.latestChildMessageId === parentId
                    ? null
                    : grandparent.latestChildMessageId,
              };
              newMap.set(grandparentId, updatedGrandparent);
            }
          }
          newMap.delete(parentId);
        }
      }
      updateCompleteMessageDetail(frozenSessionId, newMap);
      console.log("Removed previous error message ID:", lastMessage.messageId);
      currentHistory = buildLatestMessageChain(newMap);
      currentMap = newMap;
      lastMessage = currentHistory[currentHistory.length - 1];
    }

    if (currentChatState() != "input") {
      if (currentChatState() == "uploading") {
        setPopup({
          message: "Please wait for the content to upload",
          type: "error",
        });
      } else {
        if (!messageOverride) { 
          setPopup({
            message: "Please wait for the response to complete",
            type: "error",
          });
          return;
        }
      }
    }

    setAlternativeGeneratingAssistant(alternativeAssistantOverride);
    clientScrollToBottom();

    let currChatSessionId: string;
    const isNewSession = chatSessionIdRef.current === null;
    const searchParamBasedChatSessionName =
      searchParams?.get(SEARCH_PARAM_NAMES.TITLE) || null;

    if (isNewSession) {
      currChatSessionId = await createChatSession(
        liveAssistant?.id || 0, 
        searchParamBasedChatSessionName
      );
    } else {
      currChatSessionId = chatSessionIdRef.current as string;
    }
    frozenSessionId = currChatSessionId;
    let finalLLM = modelOverride || llmManager.currentLlm;
    updateLlmOverrideForChatSession(
      currChatSessionId,
      structureValue(
        finalLLM.name || "",
        finalLLM.provider || "",
        finalLLM.modelName || ""
      )
    );

    updateStatesWithNewSessionId(currChatSessionId);
    const controller = new AbortController();
    setAbortControllers((prev) =>
      new Map(prev).set(currChatSessionId, controller)
    );

    const messageToResendFromHistory = messageHistory.find( 
      (msg) => msg.messageId === messageIdToResend
    );
    if (messageIdToResend) {
      updateRegenerationState(
        { regenerating: true, finalMessageIndex: messageIdToResend },
        currentSessionId()
      );
    }
    const messageToResendParent =
      messageToResendFromHistory?.parentMessageId !== null &&
        messageToResendFromHistory?.parentMessageId !== undefined
        ? currentMap.get(messageToResendFromHistory.parentMessageId)
        : null;
    const messageToResendIndex = messageToResendFromHistory
      ? messageHistory.indexOf(messageToResendFromHistory)
      : null;

    if (!messageToResendFromHistory && messageIdToResend !== undefined) {
      setPopup({
        message:
          "Failed to re-send message - please refresh the page and try again.",
        type: "error",
      });
      resetRegenerationState(currentSessionId());
      updateChatState("input", frozenSessionId);
      return;
    }
    let currMessage = messageToResendFromHistory ? messageToResendFromHistory.message : message;
    if (messageOverride) {
      currMessage = messageOverride;
    }

    setSubmittedMessage(currMessage);
    updateChatState("loading");

    const currMessageHistory =
      messageToResendIndex !== null
        ? currentHistory.slice(0, messageToResendIndex)
        : currentHistory;

    let parentMessage =
      messageToResendParent ||
      (currMessageHistory.length > 0
        ? currMessageHistory[currMessageHistory.length - 1]
        : null) ||
      (currentMap.size === 1 ? Array.from(currentMap.values())[0] : null);

    let currentAssistantId;
    if (alternativeAssistantOverride) {
      currentAssistantId = alternativeAssistantOverride.id;
    } else if (alternativeAssistant) {
      currentAssistantId = alternativeAssistant.id;
    } else if (liveAssistant) { 
      currentAssistantId = liveAssistant.id;
    } else {
      console.error("No live assistant available for message submission.");
      setPopup({ type: "error", message: "No assistant selected." });
      updateChatState("input", frozenSessionId);
      return;
    }

    resetInputBar();
    
    let filesForCurrentSubmission: FileDescriptor[] = []; 
    
    if (overrideFileDescriptors) {
      filesForCurrentSubmission = overrideFileDescriptors;
    } else if (!messageIdToResend && !isSeededChat) {
      // Only use currentMessageFiles for new, user-initiated messages
      filesForCurrentSubmission = currentMessageFiles;
    }
    // This 'localFilesStream' variable is block-scoped to onSubmit and will hold files for the current submission.
    let localFilesStream = filesForCurrentSubmission;


    let messageUpdates: Message[] | null = null; 
    let answer = "";
    let second_level_answer = "";
    let currentStopReason: StreamStopReason | null = null; 
    let query: string | null = null;
    let retrievalType: RetrievalType =
      selectedDocuments.length > 0
        ? RetrievalType.SelectedDocs
        : RetrievalType.None;
    let documents: OnyxDocument[] = selectedDocuments;
    let aiMessageImages: FileDescriptor[] | null = null;
    let agenticDocs: OnyxDocument[] | null = null;
    let error: string | null = null;
    let stackTrace: string | null = null;
    let sub_questions: SubQuestionDetail[] = [];
    let is_generating: boolean = false;
    let second_level_generating: boolean = false;
    let finalMessage: BackendMessage | null = null;
    let toolCall: ToolCallMetadata | null = null;
    let isImprovement: boolean | undefined = undefined;
    let isStreamingQuestions = true;
    let includeAgentic = false;
    let secondLevelMessageId: number | null = null;
    let isAgentic: boolean = false;
    
    let initialFetchDetails: null | {
      user_message_id: number;
      assistant_message_id: number;
      frozenMessageMap: Map<number, Message>;
    } = null;
    try {
      const mapKeys = Array.from(currentMap.keys());
      const lastSuccessfulMessageId =
        getLastSuccessfulMessageId(currMessageHistory);
      const stack = new CurrentMessageFIFO();
      updateCurrentMessageFIFO(stack, {
        signal: controller.signal,
        message: currMessage,
        alternateAssistantId: currentAssistantId,
        fileDescriptors: filesForCurrentSubmission, 
        parentMessageId:
          regenerationRequest?.parentMessage.messageId ||
          lastSuccessfulMessageId,
        chatSessionId: currChatSessionId,
        filters: buildFilters(
          filterManager.selectedSources,
          filterManager.selectedDocumentSets,
          filterManager.timeRange,
          filterManager.selectedTags
        ),
        selectedDocumentIds: selectedDocuments
          .filter(
            (document) =>
              document.db_doc_id !== undefined && document.db_doc_id !== null
          )
          .map((document) => document.db_doc_id as number),
        queryOverride,
        forceSearch,
        userFolderIds: selectedFolders.map((folder) => folder.id),
        userFileIds: selectedFiles
          .filter((file) => file.id !== undefined && file.id !== null)
          .map((file) => file.id),
        regenerate: regenerationRequest !== undefined,
        modelProvider:
          modelOverride?.name || llmManager.currentLlm.name || undefined,
        modelVersion:
          modelOverride?.modelName ||
          llmManager.currentLlm.modelName ||
          searchParams?.get(SEARCH_PARAM_NAMES.MODEL_VERSION) ||
          undefined,
        temperature: llmManager.temperature || undefined,
        systemPromptOverride:
          searchParams?.get(SEARCH_PARAM_NAMES.SYSTEM_PROMPT) || undefined,
        useExistingUserMessage: isSeededChat,
        useLanggraph:
          settings?.settings.pro_search_enabled &&
          proSearchEnabled &&
          retrievalEnabled,
      });

      const delay = (ms: number) => {
        return new Promise((resolve) => setTimeout(resolve, ms));
      };

      await delay(50);
      while (!stack.isComplete || !stack.isEmpty()) {
        if (stack.isEmpty()) {
          await delay(0.5);
        }

        if (!stack.isEmpty() && !controller.signal.aborted) {
          const packet = stack.nextPacket();
          if (!packet) {
            continue;
          }
          console.log("Packet:", JSON.stringify(packet));

          if (!initialFetchDetails) {
            if (!Object.hasOwn(packet, "user_message_id")) {
              console.error(
                "First packet should contain message response info "
              );
              if (Object.hasOwn(packet, "error")) {
                const errorPacket = (packet as StreamingError).error;
                setLoadingError(errorPacket);
                updateChatState("input");
                return;
              }
              continue;
            }

            const messageResponseIDInfo = packet as MessageResponseIDInfo;
            const user_message_id = messageResponseIDInfo.user_message_id!;
            const assistant_message_id =
              messageResponseIDInfo.reserved_assistant_message_id;

            messageUpdates = [
              {
                messageId: regenerationRequest
                  ? regenerationRequest?.parentMessage?.messageId!
                  : user_message_id,
                message: currMessage,
                type: "user",
                files: filesForCurrentSubmission, 
                toolCall: null,
                parentMessageId: parentMessage?.messageId || SYSTEM_MESSAGE_ID,
              },
            ];

            if (parentMessage && !regenerationRequest) {
              messageUpdates.push({
                ...parentMessage,
                childrenMessageIds: (
                  parentMessage.childrenMessageIds || []
                ).concat([user_message_id]),
                latestChildMessageId: user_message_id,
              });
            }

            const { messageMap: currentFrozenMessageMap } =
              upsertToCompleteMessageMap({
                messages: messageUpdates,
                chatSessionId: currChatSessionId,
                completeMessageMapOverride: currentMap,
              });
            currentMap = currentFrozenMessageMap;

            initialFetchDetails = {
              frozenMessageMap: currentMap,
              assistant_message_id,
              user_message_id,
            };
            resetRegenerationState();
          } else {
            const { user_message_id, frozenMessageMap } = initialFetchDetails;
            if (Object.hasOwn(packet, "agentic_message_ids")) {
              const agenticMessageIds = (packet as AgenticMessageResponseIDInfo)
                .agentic_message_ids;
              const level1MessageId = agenticMessageIds.find(
                (item) => item.level === 1
              )?.message_id;
              if (level1MessageId) {
                secondLevelMessageId = level1MessageId;
                includeAgentic = true;
              }
            }

            setChatState((prevState) => {
              if (prevState.get(chatSessionIdRef.current!) === "loading") {
                return new Map(prevState).set(
                  chatSessionIdRef.current!,
                  "streaming"
                );
              }
              return prevState;
            });

            if (Object.hasOwn(packet, "level")) {
              if ((packet as any).level === 1) {
                second_level_generating = true;
              }
            }
            if (Object.hasOwn(packet, "user_files")) {
              const userFilesPacket = (packet as UserKnowledgeFilePacket).user_files;
              const newUserFiles = userFilesPacket.filter(
                (newFile) =>
                  !localFilesStream.some((existingFile) => existingFile.id === newFile.id) 
              );
              localFilesStream = localFilesStream.concat(newUserFiles); 
            }
            if (Object.hasOwn(packet, "is_agentic")) {
              isAgentic = (packet as any).is_agentic;
            }

            if (Object.hasOwn(packet, "refined_answer_improvement")) {
              isImprovement = (packet as RefinedAnswerImprovement)
                .refined_answer_improvement;
            }

            if (Object.hasOwn(packet, "stream_type")) {
              if ((packet as any).stream_type == "main_answer") {
                is_generating = false;
                second_level_generating = true;
              }
            }

            if (
              Object.hasOwn(packet, "stop_reason") &&
              Object.hasOwn(packet, "level_question_num")
            ) {
              if ((packet as StreamStopInfo).stream_type == "main_answer") {
                updateChatState("streaming", frozenSessionId);
              }
              if (
                (packet as StreamStopInfo).stream_type == "sub_questions" &&
                (packet as StreamStopInfo).level_question_num == undefined
              ) {
                isStreamingQuestions = false;
              }
              sub_questions = constructSubQuestions(
                sub_questions,
                packet as StreamStopInfo
              );
            } else if (Object.hasOwn(packet, "sub_question")) {
              updateChatState("toolBuilding", frozenSessionId);
              isAgentic = true;
              is_generating = true;
              sub_questions = constructSubQuestions(
                sub_questions,
                packet as SubQuestionPiece
              );
              setAgenticGenerating(true);
            } else if (Object.hasOwn(packet, "sub_query")) {
              sub_questions = constructSubQuestions(
                sub_questions,
                packet as SubQueryPiece
              );
            } else if (
              Object.hasOwn(packet, "answer_piece") &&
              Object.hasOwn(packet, "answer_type") &&
              (packet as AgentAnswerPiece).answer_type === "agent_sub_answer"
            ) {
              sub_questions = constructSubQuestions(
                sub_questions,
                packet as AgentAnswerPiece
              );
            } else if (Object.hasOwn(packet, "answer_piece")) {
              sub_questions = sub_questions.map((subQ) => ({
                ...subQ,
                is_generating: false,
              }));

              if (
                Object.hasOwn(packet, "level") &&
                (packet as any).level === 1
              ) {
                second_level_answer += (packet as AnswerPiecePacket)
                  .answer_piece;
              } else {
                answer += (packet as AnswerPiecePacket).answer_piece;
              }
            } else if (
              Object.hasOwn(packet, "top_documents") &&
              Object.hasOwn(packet, "level_question_num") &&
              (packet as DocumentsResponse).level_question_num != undefined
            ) {
              const documentsResponse = packet as DocumentsResponse;
              sub_questions = constructSubQuestions(
                sub_questions,
                documentsResponse
              );

              if (
                documentsResponse.level_question_num === 0 &&
                documentsResponse.level == 0
              ) {
                documents = (packet as DocumentsResponse).top_documents;
              } else if (
                documentsResponse.level_question_num === 0 &&
                documentsResponse.level == 1
              ) {
                agenticDocs = (packet as DocumentsResponse).top_documents;
              }
            } else if (Object.hasOwn(packet, "top_documents")) {
              documents = (packet as DocumentInfoPacket).top_documents;
              retrievalType = RetrievalType.Search;

              if (documents && documents.length > 0) {
                setSelectedMessageForDocDisplay(user_message_id);
              }
            } else if (Object.hasOwn(packet, "tool_name")) {
              toolCall = {
                tool_name: (packet as ToolCallMetadata).tool_name,
                tool_args: (packet as ToolCallMetadata).tool_args,
                tool_result: (packet as ToolCallMetadata).tool_result,
              };

              if (!toolCall.tool_name.includes("agent")) {
                if (
                  !toolCall.tool_result ||
                  toolCall.tool_result == undefined
                ) {
                  updateChatState("toolBuilding", frozenSessionId);
                } else {
                  updateChatState("streaming", frozenSessionId);
                }
                if (toolCall.tool_name == SEARCH_TOOL_NAME) {
                  query = toolCall.tool_args["query"];
                }
              } else {
                toolCall = null;
              }
            } else if (Object.hasOwn(packet, "file_ids")) {
              aiMessageImages = (packet as FileChatDisplay).file_ids.map(
                (fileId) => {
                  return {
                    id: fileId,
                    type: ChatFileType.IMAGE,
                  };
                }
              );
            } else if (
              Object.hasOwn(packet, "error") &&
              (packet as any).error != null
            ) {
              if (
                sub_questions.length > 0 &&
                sub_questions
                  .filter((q) => q.level === 0)
                  .every((q) => q.is_stopped === true)
              ) {
                setUncaughtError((packet as StreamingError).error);
                updateChatState("input");
                setAgenticGenerating(false);
                setAlternativeGeneratingAssistant(null);
                setSubmittedMessage("");
                throw new Error((packet as StreamingError).error);
              } else {
                error = (packet as StreamingError).error;
                stackTrace = (packet as StreamingError).stack_trace;
              }
            } else if (Object.hasOwn(packet, "message_id")) {
              finalMessage = packet as BackendMessage;
            } else if (Object.hasOwn(packet, "stop_reason")) {
              currentStopReason = (packet as StreamStopInfo).stop_reason; 
              if (currentStopReason === StreamStopReason.CONTEXT_LENGTH) {
                updateCanContinue(true, frozenSessionId);
              }
            }

            parentMessage =
              parentMessage || frozenMessageMap?.get(SYSTEM_MESSAGE_ID)!;

            const updateFn = (messagesToUpdate: Message[]) => { 
              const replacementsMap = regenerationRequest
                ? new Map([
                  [
                    regenerationRequest?.parentMessage?.messageId,
                    regenerationRequest?.parentMessage?.messageId,
                  ],
                  [
                    regenerationRequest?.messageId,
                    initialFetchDetails?.assistant_message_id,
                  ],
                ] as [number, number][])
                : null;

              const newMessageDetails = upsertToCompleteMessageMap({
                messages: messagesToUpdate,
                replacementsMap: replacementsMap,
                completeMessageMapOverride: currentMap,
                chatSessionId: frozenSessionId!,
              });
              currentMap = newMessageDetails.messageMap;
              return newMessageDetails;
            };

            const systemMessageId = Math.min(...mapKeys);
            updateFn([
              {
                messageId: regenerationRequest
                  ? regenerationRequest?.parentMessage?.messageId!
                  : initialFetchDetails.user_message_id!,
                message: currMessage,
                type: "user",
                files: localFilesStream, 
                toolCall: null,
                parentMessageId: lastSuccessfulMessageId ?? systemMessageId,
                childrenMessageIds: [
                  ...(regenerationRequest?.parentMessage?.childrenMessageIds ||
                    []),
                  initialFetchDetails.assistant_message_id!,
                ],
                latestChildMessageId: initialFetchDetails.assistant_message_id,
              },
              {
                isStreamingQuestions: isStreamingQuestions,
                is_generating: is_generating,
                isImprovement: isImprovement,
                messageId: initialFetchDetails.assistant_message_id!,
                message: error || answer,
                second_level_message: second_level_answer,
                type: error ? "error" : "assistant",
                retrievalType,
                query: finalMessage?.rephrased_query || query,
                documents: documents,
                citations: finalMessage?.citations || {},
                files: finalMessage?.files || aiMessageImages || [],
                toolCall: finalMessage?.tool_call || toolCall,
                parentMessageId: regenerationRequest
                  ? regenerationRequest?.parentMessage?.messageId!
                  : initialFetchDetails.user_message_id,
                alternateAssistantID: alternativeAssistant?.id,
                stackTrace: stackTrace,
                overridden_model: finalMessage?.overridden_model,
                stopReason: currentStopReason, 
                sub_questions: sub_questions,
                second_level_generating: second_level_generating,
                agentic_docs: agenticDocs,
                is_agentic: isAgentic,
              },
              ...(includeAgentic
                ? [
                  {
                    messageId: secondLevelMessageId!,
                    message: second_level_answer,
                    type: "assistant" as const,
                    files: [],
                    toolCall: null,
                    parentMessageId:
                      initialFetchDetails.assistant_message_id!,
                  },
                ]
                : []),
            ]);
          }
        }
      }
    } catch (e: any) {
      console.log("Error:", e);
      const errorMsg = e.message;
      const newMessageDetails = upsertToCompleteMessageMap({
        messages: [
          {
            messageId:
              initialFetchDetails?.user_message_id || TEMP_USER_MESSAGE_ID,
            message: currMessage,
            type: "user",
            files: localFilesStream, 
            toolCall: null,
            parentMessageId: parentMessage?.messageId || SYSTEM_MESSAGE_ID,
          },
          {
            messageId:
              initialFetchDetails?.assistant_message_id ||
              TEMP_ASSISTANT_MESSAGE_ID,
            message: errorMsg,
            type: "error",
            files: aiMessageImages || [],
            toolCall: null,
            parentMessageId:
              initialFetchDetails?.user_message_id || TEMP_USER_MESSAGE_ID,
          },
        ],
        completeMessageMapOverride: currentMap,
      });
      currentMap = newMessageDetails.messageMap;
    }
    console.log("Finished streaming");
    setAgenticGenerating(false);
    resetRegenerationState(currentSessionId());

    updateChatState("input"); 
    if (isNewSession) {
      console.log("Setting up new session");
      if (finalMessage) {
        setSelectedMessageForDocDisplay(finalMessage.message_id);
      }

      if (!searchParamBasedChatSessionName) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        await nameChatSession(currChatSessionId);
        refreshChatSessions();
      }

      if (
        currChatSessionId === chatSessionIdRef.current ||
        chatSessionIdRef.current === null
      ) {
        const newUrl = buildChatUrl(searchParams, currChatSessionId, null);
        if (pathname == "/chat" && !navigatingAway.current) {
          router.push(newUrl, { scroll: false });
        }
      }
    }
    if (
      finalMessage?.context_docs &&
      finalMessage.context_docs.top_documents.length > 0 &&
      retrievalType === RetrievalType.Search
    ) {
      setSelectedMessageForDocDisplay(finalMessage.message_id);
    }
    setAlternativeGeneratingAssistant(null);
    if (!messageOverride) { // Only clear user-typed messages
      setSubmittedMessage("");
    }
  };

  const onFeedback = async (
    messageId: number,
    feedbackType: FeedbackType,
    feedbackDetails: string,
    predefinedFeedback: string | undefined
  ) => {
    if (chatSessionIdRef.current === null) {
      return;
    }

    const response = await handleChatFeedback(
      messageId,
      feedbackType,
      feedbackDetails,
      predefinedFeedback
    );

    if (response.ok) {
      setPopup({
        message: "Thanks for your feedback!",
        type: "success",
      });
    } else {
      const responseJson = await response.json();
      const errorMsg = responseJson.detail || responseJson.message;
      setPopup({
        message: `Failed to submit feedback - ${errorMsg}`,
        type: "error",
      });
    }
  };

  const handleMessageSpecificFileUpload = async (acceptedFiles: File[]) => {
    const [_, llmModel] = getFinalLLM(
      llmProviders,
      liveAssistant ?? null,
      llmManager.currentLlm
    );
    const llmAcceptsImages = modelSupportsImageInput(llmProviders, llmModel);

    const imageFiles = acceptedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length > 0 && !llmAcceptsImages) {
      setPopup({
        type: "error",
        message:
          "The current model does not support image input. Please select a model with Vision support.",
      });
      return;
    }

    updateChatState("uploading", currentSessionId());

    for (let file of acceptedFiles) {
      const formData = new FormData();
      formData.append("files", file);
      const response: FileResponse[] = await uploadFile(formData, null);

      if (response.length > 0 && response[0] !== undefined) {
        const uploadedFile = response[0];

        const newFileDescriptor: FileDescriptor = {
          // Use file_id (storage ID) if available, otherwise fallback to DB id
          // Ensure it's a string as FileDescriptor expects
          id: uploadedFile.file_id
            ? String(uploadedFile.file_id)
            : String(uploadedFile.id),
          type: uploadedFile.chat_file_type
            ? uploadedFile.chat_file_type
            : ChatFileType.PLAIN_TEXT,
          name: uploadedFile.name,
          isUploading: false, // Mark as successfully uploaded
        };

        setCurrentMessageFiles((prev) => [...prev, newFileDescriptor]);
      } else {
        setPopup({
          type: "error",
          message: "Failed to upload file",
        });
      }
    }

    updateChatState("input", currentSessionId());
  };

  const [untoggled, setUntoggled] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const explicitlyUntoggle = () => {
    setShowHistorySidebar(false);
    setUntoggled(true);
    setTimeout(() => {
      setUntoggled(false);
    }, 200);
  };
  const toggleSidebar = () => {
    if (user?.is_anonymous_user) {
      return;
    }
    Cookies.set(
      SIDEBAR_TOGGLED_COOKIE_NAME,
      String(!sidebarVisible).toLocaleLowerCase()
    ),
    {
      path: "/",
    };
    toggle();
  };
  const removeToggle = () => {
    setShowHistorySidebar(false);
    toggle(false);
  };

  const waitForScrollRef = useRef(false);
  const sidebarElementRef = useRef<HTMLDivElement>(null);

  useSidebarVisibility({
    sidebarVisible,
    sidebarElementRef,
    showDocSidebar: showHistorySidebar,
    setShowDocSidebar: setShowHistorySidebar,
    setToggled: removeToggle,
    mobile: settings?.isMobile,
    isAnonymousUser: user?.is_anonymous_user,
  });

  const scrollInitialized = useRef(false);

  const imageFileInMessageHistory = useMemo(() => {
    return messageHistory
      .filter((message) => message.type === "user")
      .some((message) =>
        message.files.some((file) => file.type === ChatFileType.IMAGE)
      );
  }, [messageHistory]);

  useSendMessageToParent();

  useEffect(() => {
    if (liveAssistant) {
      const hasSearchTool = personaIncludesRetrieval(liveAssistant); 
      setRetrievalEnabled(hasSearchTool);
      if (!hasSearchTool) {
        filterManager.clearFilters();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveAssistant]);

  const [retrievalEnabled, setRetrievalEnabled] = useState(() => {
    if (liveAssistant) {
      return personaIncludesRetrieval(liveAssistant); 
    }
    return false;
  });

  useEffect(() => {
    if (!retrievalEnabled) {
      setDocumentSidebarVisible(false);
    }
  }, [retrievalEnabled]);

  const [stackTraceModalContent, setStackTraceModalContent] = useState<
    string | null
  >(null);

  const innerSidebarElementRef = useRef<HTMLDivElement>(null);
  const [settingsToggled, setSettingsToggled] = useState(false);


  const currentPersona = alternativeAssistant || liveAssistant;

  const HORIZON_DISTANCE = 800;
  const handleScroll = useCallback(() => {
    const scrollDistance =
      endDivRef?.current?.getBoundingClientRect()?.top! -
      inputRef?.current?.getBoundingClientRect()?.top!;
    scrollDist.current = scrollDistance;
    setAboveHorizon(scrollDist.current > HORIZON_DISTANCE);
  }, []);

  useEffect(() => {
    const handleSlackChatRedirect = async () => {
      if (!slackChatId) return;
      setIsReady(false);
      try {
        const response = await fetch("/api/chat/seed-chat-session-from-slack", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_session_id: slackChatId,
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to seed chat from Slack");
        }
        const data = await response.json();
        router.push(data.redirect_url);
      } catch (fetchError: any) { 
        console.error("Error seeding chat from Slack:", fetchError);
        setPopup({
          message: "Failed to load chat from Slack",
          type: "error",
        });
      }
    };
    handleSlackChatRedirect();
  }, [searchParams, router, setPopup]); 

  useEffect(() => {
    llmManager.updateImageFilesPresent(imageFileInMessageHistory);
  }, [imageFileInMessageHistory, llmManager]); 

  const pathname = usePathname();
  useEffect(() => {
    return () => {
      const currentSession = currentSessionId();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const controller = abortControllersRef.current.get(currentSession);
      if (controller) {
        controller.abort();
        navigatingAway.current = true;
        setAbortControllers((prev) => {
          const newControllers = new Map(prev);
          newControllers.delete(currentSession);
          return newControllers;
        });
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const navigatingAway = useRef(false);
  const abortControllersRef = useRef(abortControllers);
  useEffect(() => {
    abortControllersRef.current = abortControllers;
  }, [abortControllers]);
  useEffect(() => {
    const calculateTokensAndUpdateSearchMode = async () => {
      if (selectedFiles.length > 0 || selectedFolders.length > 0) {
        try {
          const fileIds = selectedFiles.map((file: FileResponse) => file.id);
          const folderIds = selectedFolders.map(
            (folder: FolderResponse) => folder.id
          );
          const queryParams = new URLSearchParams();
          fileIds.forEach((id) =>
            queryParams.append("file_ids", id.toString())
          );
          folderIds.forEach((id) =>
            queryParams.append("folder_ids", id.toString())
          );
          const response = await fetch(
            `/api/user/file/token-estimate?${queryParams.toString()}`
          );
          if (!response.ok) {
            console.error("Failed to fetch token estimate");
            return;
          }
        } catch (error) {
          console.error("Error calculating tokens:", error);
        }
      }
    };
    calculateTokensAndUpdateSearchMode();
  }, [selectedFiles, selectedFolders, llmManager.currentLlm]);

  useSidebarShortcut(router, toggleSidebar);

  const [sharedChatSession, setSharedChatSession] =
    useState<ChatSession | null>();

  const handleResubmitLastMessage = () => {
    const lastUserMsg = messageHistory
      .slice()
      .reverse()
      .find((m) => m.type === "user");
    if (!lastUserMsg) {
      setPopup({
        message: "No previously-submitted user message found.",
        type: "error",
      });
      return;
    }
    onSubmit({
      messageIdToResend: lastUserMsg.messageId,
      messageOverride: lastUserMsg.message,
    });
  };

  const showShareModal = (chatSession: ChatSession) => {
    setSharedChatSession(chatSession);
  };
  const [showAssistantsModal, setShowAssistantsModal] = useState(false);

  const toggleDocumentSidebar = () => {
    if (!documentSidebarVisible) {
      setDocumentSidebarVisible(true);
    } else {
      setDocumentSidebarVisible(false);
    }
  };

  interface RegenerationRequest {
    messageId: number;
    parentMessage: Message;
    forceSearch?: boolean;
  }

  function createRegenerator(regenerationRequest: RegenerationRequest) {
    return async function (modelOverride: LlmDescriptor) {
      return await onSubmit({
        modelOverride,
        messageIdToResend: regenerationRequest.parentMessage.messageId,
        regenerationRequest,
        forceSearch: regenerationRequest.forceSearch,
      });
    };
  }
  if (!user) {
    redirect("/auth/login");
  }

  if (noAssistants)
    return (
      <>
        <HealthCheckBanner />
        <NoAssistantModal isAdmin={isAdmin} />
      </>
    );

  const toggleDocumentSelection = (document: OnyxDocument) => {
    setSelectedDocuments((prev) =>
      prev.some((d) => d.document_id === document.document_id)
        ? prev.filter((d) => d.document_id !== document.document_id)
        : [...prev, document]
    );
  };

  return (
    <>
      <HealthCheckBanner />

      {isCreatingProduct && (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[10000]">
    <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-xl border border-border">
      <CgSpinner className="animate-spin h-10 w-10 text-blue-600 mb-4" />
      <p className="text-lg font-semibold text-text-800">
        Creating product, please wait...
      </p>
    </div>
  </div>
)}

      {/* Success/Error message with redirect button */}
      {productCreationResult && (
        <div
          className={`fixed bottom-20 right-4 p-4 rounded-lg shadow-xl z-[10000] flex flex-col items-start
            ${productCreationResult.success ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'}`}
          // Style to match existing popups
        >
          <div className="w-full flex justify-between items-start mb-2">
            <p className="text-sm font-medium">{productCreationResult.message}</p>
            <button
              onClick={() => setProductCreationResult(null)}
              className="ml-4 text-xl font-semibold leading-none hover:text-gray-900 opacity-70 hover:opacity-100"
              aria-label="Dismiss"
            >
              &times;
            </button>
          </div>
          {productCreationResult.success && productCreationResult.projectId && (
            <button
              onClick={() => {
                router.push(`/custom-projects-ui/projects/view/${productCreationResult.projectId}?from=create`);
                setProductCreationResult(null); // Dismiss after navigation
              }}
              className="mt-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1.5 px-3 rounded focus:outline-none focus:shadow-outline"
            >
              View Product
            </button>
          )}
        </div>
      )}

      <MakeIntoProductModal
        isOpen={showProductSelectionModal}
        onClose={() => setShowProductSelectionModal(false)}
        onApply={handleProductSelectionFromModal}
      />

      {showApiKeyModal && !shouldShowWelcomeModal && (
        <ApiKeyModal
          hide={() => setShowApiKeyModal(false)}
          setPopup={setPopup}
        />
      )}

      {shouldShowWelcomeModal && <WelcomeModal user={user} />}

      {/* ChatPopup is a custom popup that displays a admin-specified message on initial user visit. 
      Only used in the EE version of the app. */}
      {popup}

      <ChatPopup />

      {currentFeedback && (
        <FeedbackModal
          feedbackType={currentFeedback[0]}
          onClose={() => setCurrentFeedback(null)}
          onSubmit={({ message, predefinedFeedback }) => {
            onFeedback(
              currentFeedback[1],
              currentFeedback[0],
              message,
              predefinedFeedback
            );
            setCurrentFeedback(null);
          }}
        />
      )}

      {(settingsToggled || userSettingsToggled) && (
        <UserSettingsModal
          setPopup={setPopup}
          setCurrentLlm={(newLlm) => llmManager.updateCurrentLlm(newLlm)}
          defaultModel={user?.preferences.default_model!}
          llmProviders={llmProviders}
          onClose={() => {
            setUserSettingsToggled(false);
            setSettingsToggled(false);
          }}
        />
      )}

      {toggleDocSelection && (
        <FilePickerModal
          setPresentingDocument={setPresentingDocument}
          buttonContent="Set as Context"
          isOpen={true}
          onClose={() => setToggleDocSelection(false)}
          onSave={() => {
            setToggleDocSelection(false);
          }}
        />
      )}

      <ChatSearchModal
        open={isChatSearchModalOpen}
        onCloseModal={() => setIsChatSearchModalOpen(false)}
      />

      {retrievalEnabled && documentSidebarVisible && settings?.isMobile && (
        <div className="md:hidden">
          <Modal
            hideDividerForTitle
            onOutsideClick={() => setDocumentSidebarVisible(false)}
            title="Sources"
          >
            <DocumentResults
              agenticMessage={
                aiMessage?.sub_questions?.length! > 0 ||
                messageHistory.find(
                  (m) => m.messageId === aiMessage?.parentMessageId
                )?.sub_questions?.length! > 0
                  ? true
                  : false
              }
              humanMessage={humanMessage ?? null}
              setPresentingDocument={setPresentingDocument}
              modal={true}
              ref={innerSidebarElementRef}
              closeSidebar={() => {
                setDocumentSidebarVisible(false);
              }}
              selectedMessage={aiMessage ?? null}
              selectedDocuments={selectedDocuments}
              toggleDocumentSelection={toggleDocumentSelection}
              clearSelectedDocuments={clearSelectedDocuments}
              selectedDocumentTokens={selectedDocumentTokens}
              maxTokens={maxTokens}
              initialWidth={400}
              isOpen={true}
              removeHeader
            />
          </Modal>
        </div>
      )}

      {presentingDocument && (
        <TextView
          presentingDocument={presentingDocument}
          onClose={() => setPresentingDocument(null)}
        />
      )}

      {stackTraceModalContent && (
        <ExceptionTraceModal
          onOutsideClick={() => setStackTraceModalContent(null)}
          exceptionTrace={stackTraceModalContent}
        />
      )}

      {sharedChatSession && (
        <ShareChatSessionModal
          assistantId={liveAssistant?.id}
          message={message}
          modelOverride={llmManager.currentLlm}
          chatSessionId={sharedChatSession.id}
          existingSharedStatus={sharedChatSession.shared_status}
          onClose={() => setSharedChatSession(null)}
          onShare={(shared) =>
            setChatSessionSharedStatus(
              shared
                ? ChatSessionSharedStatus.Public
                : ChatSessionSharedStatus.Private
            )
          }
        />
      )}

      {sharingModalVisible && chatSessionIdRef.current !== null && (
        <ShareChatSessionModal
          message={message}
          assistantId={liveAssistant?.id}
          modelOverride={llmManager.currentLlm}
          chatSessionId={chatSessionIdRef.current}
          existingSharedStatus={chatSessionSharedStatus}
          onClose={() => setSharingModalVisible(false)}
        />
      )}

      {showAssistantsModal && (
        <AssistantModal hideModal={() => setShowAssistantsModal(false)} />
      )}

      <div className="fixed inset-0 flex flex-col text-text-dark">
        <div className="h-[100dvh] overflow-y-hidden">
          <div className="w-full">
            <div
              ref={sidebarElementRef}
              className={`
                flex-none
                fixed
                left-0
                z-40
                bg-neutral-200
                h-screen
                transition-all
                bg-opacity-80
                duration-300
                ease-in-out
                ${
                  !untoggled && (showHistorySidebar || sidebarVisible)
                    ? "opacity-100 w-[250px] translate-x-0"
                    : "opacity-0 w-[250px] pointer-events-none -translate-x-10"
                }`}
            >
              <div className="w-full relative">
                <HistorySidebar
                  toggleChatSessionSearchModal={() =>
                    setIsChatSearchModalOpen((open) => !open)
                  }
                  liveAssistant={liveAssistant}
                  explicitlyUntoggle={explicitlyUntoggle}
                  reset={reset}
                  page="chat"
                  ref={innerSidebarElementRef}
                  toggleSidebar={toggleSidebar}
                  toggled={sidebarVisible}
                  existingChats={chatSessions}
                  currentChatSession={selectedChatSession}
                  folders={folders}
                  removeToggle={removeToggle}
                  showShareModal={showShareModal}
                />
              </div>

              <div
                className={`
                flex-none
                fixed
                left-0
                z-40
                bg-background-100
                h-screen
                transition-all
                bg-opacity-80
                duration-300
                ease-in-out
                ${
                  documentSidebarVisible &&
                  !settings?.isMobile &&
                  "opacity-100 w-[350px]"
                }`}
              ></div>
            </div>
          </div>

          <div
            style={{ transition: "width 0.30s ease-out" }}
            className={`
              flex-none 
              fixed
              right-0
              z-[1000]
              h-screen
              transition-all
              duration-300
              ease-in-out
              bg-transparent
              transition-all
              duration-300
              ease-in-out
              h-full
              ${
                documentSidebarVisible && !settings?.isMobile
                  ? "w-[400px]"
                  : "w-[0px]"
              }
            `}
          >
            <DocumentResults
              humanMessage={humanMessage ?? null}
              agenticMessage={
                aiMessage?.sub_questions?.length! > 0 ||
                messageHistory.find(
                  (m) => m.messageId === aiMessage?.parentMessageId
                )?.sub_questions?.length! > 0
                  ? true
                  : false
              }
              setPresentingDocument={setPresentingDocument}
              modal={false}
              ref={innerSidebarElementRef}
              closeSidebar={() =>
                setTimeout(() => setDocumentSidebarVisible(false), 300)
              }
              selectedMessage={aiMessage ?? null}
              selectedDocuments={selectedDocuments}
              toggleDocumentSelection={toggleDocumentSelection}
              clearSelectedDocuments={clearSelectedDocuments}
              selectedDocumentTokens={selectedDocumentTokens}
              maxTokens={maxTokens}
              initialWidth={400}
              isOpen={documentSidebarVisible && !settings?.isMobile}
            />
          </div>

          <BlurBackground
            visible={!untoggled && (showHistorySidebar || sidebarVisible)}
            onClick={() => toggleSidebar()}
          />

          <div
            ref={masterFlexboxRef}
            className="flex h-full w-full overflow-x-hidden"
          >
            <div
              id="scrollableContainer"
              className="flex h-full relative px-2 flex-col w-full"
            >
              {liveAssistant && (
                <FunctionalHeader
                  toggleUserSettings={() => setUserSettingsToggled(true)}
                  sidebarToggled={sidebarVisible}
                  reset={() => setMessage("")}
                  page="chat"
                  setSharingModalVisible={
                    chatSessionIdRef.current !== null
                      ? setSharingModalVisible
                      : undefined
                  }
                  documentSidebarVisible={
                    documentSidebarVisible && !settings?.isMobile
                  }
                  toggleSidebar={toggleSidebar}
                  currentChatSession={selectedChatSession}
                  hideUserDropdown={user?.is_anonymous_user}
                />
              )}

              {documentSidebarInitialWidth !== undefined && isReady ? (
                <Dropzone
                  key={currentSessionId()}
                  onDrop={(acceptedFiles) =>
                    handleMessageSpecificFileUpload(acceptedFiles)
                  }
                  noClick
                >
                  {({ getRootProps }) => (
                    <div className="flex h-full w-full">
                      {!settings?.isMobile && (
                        <div
                          style={{ transition: "width 0.30s ease-out" }}
                          className={`
                          flex-none 
                          overflow-y-hidden 
                          bg-transparent
                          transition-all 
                          bg-opacity-80
                          duration-300 
                          ease-in-out
                          h-full
                          ${sidebarVisible ? "w-[200px]" : "w-[0px]"}
                        `}
                        ></div>
                      )}

                      <div
                        className={`h-full w-full relative flex-auto transition-margin duration-300 overflow-x-auto mobile:pb-12 desktop:pb-[100px]`}
                        {...getRootProps()}
                      >
                        <div
                          onScroll={handleScroll}
                          className={`w-full h-[calc(100vh-160px)] flex flex-col default-scrollbar overflow-y-auto overflow-x-hidden relative`}
                          ref={scrollableDivRef}
                        >
                          {liveAssistant && (
                            <div className="z-20 fixed top-0 pointer-events-none left-0 w-full flex justify-center overflow-visible">
                              {!settings?.isMobile && (
                                <div
                                  style={{ transition: "width 0.30s ease-out" }}
                                  className={`
                                  flex-none 
                                  overflow-y-hidden 
                                  transition-all 
                                  pointer-events-none
                                  duration-300 
                                  ease-in-out
                                  h-full
                                  ${sidebarVisible ? "w-[200px]" : "w-[0px]"}
                                `}
                                />
                              )}
                            </div>
                          )}
                          {messageHistory.length === 0 &&
                            !isFetchingChatMessages &&
                            currentSessionChatState == "input" &&
                            !loadingError &&
                            !submittedMessage && (
                              <div className="h-full  w-[95%] mx-auto flex flex-col justify-center items-center">
                                <ChatIntro selectedPersona={liveAssistant} />

                                {currentPersona && (
                                  <StarterMessages
                                    currentPersona={currentPersona}
                                    onSubmit={(messageOverride) =>
                                      onSubmit({
                                        messageOverride,
                                      })
                                    }
                                  />
                                )}
                              </div>
                            )}
                          <div
                            style={{ overflowAnchor: "none" }}
                            key={currentSessionId()}
                            className={
                              (hasPerformedInitialScroll ? "" : " hidden ") +
                              "desktop:-ml-4 w-full mx-auto " +
                              "absolute mobile:top-0 desktop:top-0 left-0 " +
                              (settings?.enterpriseSettings
                                ?.two_lines_for_chat_header
                                ? "pt-20 "
                                : "pt-4 ")
                            }
                          >
                            {messageHistory.map((message, i) => {
                              const messageMap = currentMessageMap(
                                completeMessageDetail
                              );

                              if (
                                currentRegenerationState()?.finalMessageIndex &&
                                currentRegenerationState()?.finalMessageIndex! <
                                message.messageId
                              ) {
                                return <React.Fragment key={`${i}-empty`}></React.Fragment>;
                              }

                              const messageReactComponentKey = `${i}-${currentSessionId()}`;
                              const parentMessage = message.parentMessageId
                                ? messageMap.get(message.parentMessageId)
                                : null;
                              if (message.type === "user") {
                                if (
                                  (currentSessionChatState == "loading" &&
                                    i == messageHistory.length - 1) ||
                                  (currentSessionRegenerationState?.regenerating &&
                                    message.messageId >=
                                    currentSessionRegenerationState?.finalMessageIndex!)
                                ) {
                                  return <React.Fragment key={`${i}-empty-user`}></React.Fragment>;
                                }
                                const nextMessage =
                                  messageHistory.length > i + 1
                                    ? messageHistory[i + 1]
                                    : null;
                                return (
                                  <div
                                    id={`message-${message.messageId}`}
                                    key={messageReactComponentKey}
                                  >
                                    <HumanMessage
                                      setPresentingDocument={
                                        setPresentingDocument
                                      }
                                      disableSwitchingForStreaming={
                                        (nextMessage &&
                                          nextMessage.is_generating) ||
                                        false
                                      }
                                      stopGenerating={stopGenerating}
                                      content={message.message}
                                      files={message.files}
                                      messageId={message.messageId}
                                      onEdit={(editedContent) => {
                                        const parentMessageId =
                                          message.parentMessageId!;
                                        const currentParentMessage = 
                                          messageMap.get(parentMessageId)!;
                                        upsertToCompleteMessageMap({
                                          messages: [
                                            {
                                              ...currentParentMessage,
                                              latestChildMessageId: null,
                                            },
                                          ],
                                        });
                                        onSubmit({
                                          messageIdToResend:
                                            message.messageId || undefined,
                                          messageOverride: editedContent,
                                        });
                                      }}
                                      otherMessagesCanSwitchTo={
                                        parentMessage?.childrenMessageIds || []
                                      }
                                      onMessageSelection={(messageId) => {
                                        const newCompleteMessageMap = new Map(
                                          messageMap
                                        );
                                        newCompleteMessageMap.get(
                                          message.parentMessageId!
                                        )!.latestChildMessageId = messageId;
                                        updateCompleteMessageDetail(
                                          currentSessionId(),
                                          newCompleteMessageMap
                                        );
                                        setSelectedMessageForDocDisplay(
                                          messageId
                                        );
                                        setMessageAsLatest(messageId);
                                      }}
                                    />
                                  </div>
                                );
                              } else if (message.type === "assistant") {
                                const previousMessage =
                                  i !== 0 ? messageHistory[i - 1] : null;
                                const currentAlternativeAssistant =
                                  message.alternateAssistantID != null
                                    ? availableAssistants.find(
                                      (persona) =>
                                        persona.id ==
                                        message.alternateAssistantID
                                    )
                                    : null;

                                if (
                                  (currentSessionChatState == "loading" &&
                                    i > messageHistory.length - 1) ||
                                  (currentSessionRegenerationState?.regenerating &&
                                    message.messageId >
                                    currentSessionRegenerationState?.finalMessageIndex!)
                                ) {
                                  return <React.Fragment key={`${i}-empty-assistant`}></React.Fragment>;
                                }
                                if (parentMessage?.type == "assistant") {
                                  return <React.Fragment key={`${i}-empty-parent-assistant`}></React.Fragment>;
                                }
                                const secondLevelMessage =
                                  messageHistory[i + 1]?.type === "assistant"
                                    ? messageHistory[i + 1]
                                    : undefined;
                                const secondLevelAssistantMessage =
                                  messageHistory[i + 1]?.type === "assistant"
                                    ? messageHistory[i + 1]?.message
                                    : undefined;
                                const agenticDocsFromHistory = 
                                  messageHistory[i + 1]?.type === "assistant"
                                    ? messageHistory[i + 1]?.documents
                                    : undefined;
                                const nextMessage =
                                  messageHistory[i + 1]?.type === "assistant"
                                    ? messageHistory[i + 1]
                                    : undefined;
                                const attachedFileDescriptors =
                                  previousMessage?.files.filter(
                                    (file) =>
                                      file.type == ChatFileType.USER_KNOWLEDGE
                                  );
                                const userFiles = allUserFiles?.filter((file) =>
                                  attachedFileDescriptors?.some(
                                    (descriptor) =>
                                      descriptor.id === file.file_id
                                  )
                                );
                                
                                if (message.is_agentic) { 
                                  return (
                                    <div
                                      className="text-text"
                                      id={`message-${message.messageId}`}
                                      key={messageReactComponentKey}
                                      ref={
                                        i == messageHistory.length - 1
                                          ? lastMessageRef
                                          : null
                                      }
                                    >
                                      <AgenticMessage
                                        resubmit={handleResubmitLastMessage}
                                        error={uncaughtError}
                                        isStreamingQuestions={
                                          message.isStreamingQuestions ?? false
                                        }
                                        isGenerating={
                                          message.is_generating ?? false
                                        }
                                        docSidebarToggled={
                                          documentSidebarVisible &&
                                          (selectedMessageForDocDisplay ==
                                            message.messageId ||
                                            selectedMessageForDocDisplay ==
                                            secondLevelMessage?.messageId)
                                        }
                                        secondLevelGenerating={
                                          (message.second_level_generating &&
                                            currentSessionChatState !==
                                            "input") ||
                                          false
                                        }
                                        secondLevelSubquestions={message.sub_questions?.filter(
                                          (subQuestion) =>
                                            subQuestion.level === 1
                                        )}
                                        secondLevelAssistantMessage={
                                          (message.second_level_message &&
                                            message.second_level_message.length >
                                            0
                                            ? message.second_level_message
                                            : secondLevelAssistantMessage) ||
                                          undefined
                                        }
                                        subQuestions={
                                          message.sub_questions?.filter(
                                            (subQuestion) =>
                                              subQuestion.level === 0
                                          ) || []
                                        }
                                        agenticDocs={
                                          message.agentic_docs || agenticDocsFromHistory
                                        }
                                        docs={
                                          message?.documents &&
                                            message?.documents.length > 0
                                            ? message?.documents
                                            : parentMessage?.documents
                                        }
                                        setPresentingDocument={
                                          setPresentingDocument
                                        }
                                        continueGenerating={
                                          i == messageHistory.length - 1 &&
                                            currentCanContinue()
                                            ? continueGenerating
                                            : undefined
                                        }
                                        overriddenModel={
                                          message.overridden_model
                                        }
                                        regenerate={createRegenerator({
                                          messageId: message.messageId,
                                          parentMessage: parentMessage!,
                                        })}
                                        otherMessagesCanSwitchTo={
                                          parentMessage?.childrenMessageIds ||
                                          []
                                        }
                                        onMessageSelection={(messageId) => {
                                          const newCompleteMessageMap = new Map(
                                            messageMap
                                          );
                                          newCompleteMessageMap.get(
                                            message.parentMessageId!
                                          )!.latestChildMessageId = messageId;
                                          updateCompleteMessageDetail(
                                            currentSessionId(),
                                            newCompleteMessageMap
                                          );
                                          setSelectedMessageForDocDisplay(
                                            messageId
                                          );
                                          setMessageAsLatest(messageId);
                                        }}
                                        isActive={
                                          messageHistory.length - 1 == i ||
                                          messageHistory.length - 2 == i
                                        }
                                        toggleDocumentSelection={(
                                          second: boolean
                                        ) => {
                                          if (
                                            (!second &&
                                              !documentSidebarVisible) ||
                                            (documentSidebarVisible &&
                                              selectedMessageForDocDisplay ===
                                              message.messageId)
                                          ) {
                                            toggleDocumentSidebar();
                                          }
                                          if (
                                            (second &&
                                              !documentSidebarVisible) ||
                                            (documentSidebarVisible &&
                                              selectedMessageForDocDisplay ===
                                              secondLevelMessage?.messageId)
                                          ) {
                                            toggleDocumentSidebar();
                                          }
                                          setSelectedMessageForDocDisplay(
                                            second
                                              ? secondLevelMessage?.messageId ||
                                              null
                                              : message.messageId
                                          );
                                        }}
                                        currentPersona={liveAssistant}
                                        alternativeAssistant={
                                          currentAlternativeAssistant
                                        }
                                        messageId={message.messageId}
                                        content={message.message}
                                        files={message.files}
                                        query={
                                          messageHistory[i]?.query || undefined
                                        }
                                        citedDocuments={getCitedDocumentsFromMessage(
                                          message
                                        )}
                                        toolCall={message.toolCall}
                                        isComplete={
                                          i !== messageHistory.length - 1 ||
                                          (currentSessionChatState !=
                                            "streaming" &&
                                            currentSessionChatState !=
                                            "toolBuilding")
                                        }
                                        handleFeedback={
                                          i === messageHistory.length - 1 &&
                                            currentSessionChatState != "input"
                                            ? undefined
                                            : (feedbackType) =>
                                              setCurrentFeedback([
                                                feedbackType,
                                                message.messageId as number,
                                              ])
                                        }
                                      />
                                    </div>
                                  );
                                } else {
                                  // Regular AIMessage
                                  return (
                                    <div
                                      className="text-text"
                                      id={`message-${message.messageId}`}
                                      key={messageReactComponentKey}
                                      ref={
                                        i == messageHistory.length - 1
                                          ? lastMessageRef
                                          : null
                                      }
                                    >
                                      <AIMessage
                                        onApplyProductPrompts={(messageContent) => handleApplyProductPrompts(messageContent)}
                                        userKnowledgeFiles={userFiles}
                                        docs={
                                          message?.documents &&
                                            message?.documents.length > 0
                                            ? message?.documents
                                            : parentMessage?.documents
                                        }
                                        setPresentingDocument={
                                          setPresentingDocument
                                        }
                                        index={i}
                                        continueGenerating={
                                          i == messageHistory.length - 1 &&
                                            currentCanContinue()
                                            ? continueGenerating
                                            : undefined
                                        }
                                        overriddenModel={
                                          message.overridden_model
                                        }
                                        regenerate={createRegenerator({
                                          messageId: message.messageId,
                                          parentMessage: parentMessage!,
                                        })}
                                        otherMessagesCanSwitchTo={
                                          parentMessage?.childrenMessageIds ||
                                          []
                                        }
                                        onMessageSelection={(messageId) => {
                                          const newCompleteMessageMap = new Map(
                                            messageMap
                                          );
                                          newCompleteMessageMap.get(
                                            message.parentMessageId!
                                          )!.latestChildMessageId = messageId;
                                          updateCompleteMessageDetail(
                                            currentSessionId(),
                                            newCompleteMessageMap
                                          );
                                          setSelectedMessageForDocDisplay(
                                            messageId
                                          );
                                          setMessageAsLatest(messageId);
                                        }}
                                        isActive={
                                          messageHistory.length - 1 == i
                                        }
                                        selectedDocuments={selectedDocuments}
                                        toggleDocumentSelection={() => { 
                                          if (
                                            !documentSidebarVisible ||
                                            (documentSidebarVisible &&
                                              selectedMessageForDocDisplay ===
                                              message.messageId)
                                          ) {
                                            toggleDocumentSidebar();
                                          }
                                          setSelectedMessageForDocDisplay(
                                            message.messageId
                                          );
                                        }}
                                        currentPersona={liveAssistant}
                                        alternativeAssistant={
                                          currentAlternativeAssistant
                                        }
                                        messageId={message.messageId}
                                        content={message.message}
                                        files={message.files}
                                        query={
                                          messageHistory[i]?.query || undefined
                                        }
                                        citedDocuments={getCitedDocumentsFromMessage(
                                          message
                                        )}
                                        toolCall={message.toolCall}
                                        isComplete={
                                          i !== messageHistory.length - 1 ||
                                          (currentSessionChatState !=
                                            "streaming" &&
                                            currentSessionChatState !=
                                            "toolBuilding")
                                        }
                                        hasDocs={ 
                                          (message.documents &&
                                            message.documents.length > 0) ===
                                          true
                                        }
                                        handleFeedback={
                                          i === messageHistory.length - 1 &&
                                            currentSessionChatState != "input"
                                            ? undefined
                                            : (feedbackType) =>
                                              setCurrentFeedback([
                                                feedbackType,
                                                message.messageId as number,
                                              ])
                                        }
                                        handleSearchQueryEdit={
                                          i === messageHistory.length - 1 &&
                                            currentSessionChatState == "input"
                                            ? (newQuery) => {
                                              if (!previousMessage) {
                                                setPopup({
                                                  type: "error",
                                                  message:
                                                    "Cannot edit query of first message - please refresh the page and try again.",
                                                });
                                                return;
                                              }
                                              if (
                                                previousMessage.messageId ===
                                                null
                                              ) {
                                                setPopup({
                                                  type: "error",
                                                  message:
                                                    "Cannot edit query of a pending message - please wait a few seconds and try again.",
                                                });
                                                return;
                                              }
                                              onSubmit({
                                                messageIdToResend:
                                                  previousMessage.messageId,
                                                queryOverride: newQuery,
                                                alternativeAssistantOverride:
                                                  currentAlternativeAssistant,
                                              });
                                            }
                                            : undefined
                                        }
                                        handleForceSearch={() => {
                                          if (
                                            previousMessage &&
                                            previousMessage.messageId
                                          ) {
                                            createRegenerator({
                                              messageId: message.messageId,
                                              parentMessage: parentMessage!,
                                              forceSearch: true,
                                            })(llmManager.currentLlm);
                                          } else {
                                            setPopup({
                                              type: "error",
                                              message:
                                                "Failed to force search - please refresh the page and try again.",
                                            });
                                          }
                                        }}
                                        retrievalDisabled={
                                          currentAlternativeAssistant
                                            ? !personaIncludesRetrieval(
                                              currentAlternativeAssistant!
                                            )
                                            : !retrievalEnabled
                                        }
                                      />
                                    </div>
                                  );
                                }

                              } else { // Error message type
                                return (
                                  <div key={messageReactComponentKey}>
                                    <AIMessage
                                      onApplyProductPrompts={(messageContent) => handleApplyProductPrompts(messageContent)} 
                                      setPresentingDocument={
                                        setPresentingDocument
                                      }
                                      currentPersona={liveAssistant}
                                      messageId={message.messageId}
                                      content={
                                        <ErrorBanner
                                          resubmit={handleResubmitLastMessage}
                                          error={message.message}
                                          showStackTrace={
                                            message.stackTrace
                                              ? () =>
                                                setStackTraceModalContent(
                                                  message.stackTrace!
                                                )
                                              : undefined
                                          }
                                        />
                                      }
                                    />
                                  </div>
                                );
                              }
                            })}

                            {(currentSessionChatState == "loading" ||
                              (loadingError &&
                                !currentSessionRegenerationState?.regenerating &&
                                messageHistory[messageHistory.length - 1]
                                  ?.type != "user")) && (
                                <HumanMessage
                                  setPresentingDocument={setPresentingDocument}
                                  key={-2}
                                  messageId={-1}
                                  content={submittedMessage}
                                />
                              )}

                            {currentSessionChatState == "loading" && (
                              <div
                                key={`${messageHistory.length}-${chatSessionIdRef.current}`}
                              >
                                <AIMessage
                                  onApplyProductPrompts={(messageContent) => handleApplyProductPrompts(messageContent)}
                                  setPresentingDocument={setPresentingDocument}
                                  key={-3}
                                  currentPersona={liveAssistant}
                                  alternativeAssistant={
                                    alternativeGeneratingAssistant ??
                                    alternativeAssistant
                                  }
                                  messageId={null}
                                  content={
                                    <div
                                      key={"Generating"}
                                      className="mr-auto relative inline-block"
                                    >
                                      <span className="text-sm loading-text">
                                        Thinking...
                                      </span>
                                    </div>
                                  }
                                />
                              </div>
                            )}

                            {loadingError && (
                              <div key={-1}>
                                <AIMessage
                                  onApplyProductPrompts={(messageContent) => handleApplyProductPrompts(messageContent)}
                                  setPresentingDocument={setPresentingDocument}
                                  currentPersona={liveAssistant}
                                  messageId={-1}
                                  content={
                                    <p className="text-red-700 text-sm my-auto">
                                      {loadingError}
                                    </p>
                                  }
                                />
                              </div>
                            )}
                            {messageHistory.length > 0 && (
                              <div
                                style={{
                                  height: !autoScrollEnabled
                                    ? getContainerHeight()
                                    : undefined,
                                }}
                              />
                            )}

                            <div ref={endPaddingRef} className="h-[95px]" />
                            <div ref={endDivRef} />
                          </div>
                        </div>
                        <div
                          ref={inputRef}
                          className="absolute pointer-events-none bottom-0 z-10 w-full"
                        >
                          {aboveHorizon && (
                            <div className="mx-auto w-fit !pointer-events-none flex sticky justify-center">
                              <button
                                onClick={() => clientScrollToBottom()}
                                className="p-1 pointer-events-auto text-neutral-700 dark:text-neutral-800 rounded-2xl bg-neutral-200 border border-border  mx-auto "
                              >
                                <FiArrowDown size={18} />
                              </button>
                            </div>
                          )}

                          <div className="pointer-events-auto w-[95%] mx-auto relative mb-8">
                            <ChatInputBar
                              proSearchEnabled={proSearchEnabled}
                              setProSearchEnabled={() => toggleProSearch()}
                              toggleDocumentSidebar={toggleDocumentSidebar}
                              availableSources={sources}
                              availableDocumentSets={documentSets}
                              availableTags={tags}
                              filterManager={filterManager}
                              llmManager={llmManager}
                              removeDocs={() => {
                                clearSelectedDocuments();
                              }}
                              retrievalEnabled={retrievalEnabled}
                              toggleDocSelection={() =>
                                setToggleDocSelection(true)
                              }
                              showConfigureAPIKey={() =>
                                setShowApiKeyModal(true)
                              }
                              selectedDocuments={selectedDocuments}
                              message={message}
                              setMessage={setMessage}
                              stopGenerating={stopGenerating}
                              onSubmit={onSubmit}
                              chatState={currentSessionChatState}
                              alternativeAssistant={alternativeAssistant}
                              selectedAssistant={
                                selectedAssistant || liveAssistant
                              }
                              setAlternativeAssistant={setAlternativeAssistant}
                              setFiles={setCurrentMessageFiles}
                              handleFileUpload={handleMessageSpecificFileUpload}
                              textAreaRef={textAreaRef}
                            />
                            {enterpriseSettings &&
                              enterpriseSettings.custom_lower_disclaimer_content && (
                                <div className="mobile:hidden mt-4 flex items-center justify-center relative w-[95%] mx-auto">
                                  <div className="text-sm text-text-500 max-w-searchbar-max px-4 text-center">
                                    <MinimalMarkdown
                                      content={
                                        enterpriseSettings.custom_lower_disclaimer_content
                                      }
                                    />
                                  </div>
                                </div>
                              )}
                            {enterpriseSettings &&
                              enterpriseSettings.use_custom_logotype && (
                                <div className="hidden lg:block absolute right-0 bottom-0">
                                  <img
                                    src="/api/enterprise-settings/logotype"
                                    alt="logotype"
                                    style={{ objectFit: "contain" }}
                                    className="w-fit h-8"
                                  />
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{ transition: "width 0.30s ease-out" }}
                        className={`
                          flex-none 
                          overflow-y-hidden 
                          transition-all 
                          bg-opacity-80
                          duration-300 
                          ease-in-out
                          h-full
                          ${
                            documentSidebarVisible && !settings?.isMobile
                              ? "w-[350px]"
                              : "w-[0px]"
                          }
                        `}
                      />
                    </div>
                  )}
                </Dropzone>
              ) : (
                <div className="mx-auto h-full flex">
                  <div
                    style={{ transition: "width 0.30s ease-out" }}
                    className={`flex-none bg-transparent transition-all bg-opacity-80 duration-300 ease-in-out h-full
                            ${
                              sidebarVisible && !settings?.isMobile
                                ? "w-[250px] "
                                : "w-[0px]"
                            }`}
                  />
                  <div className="my-auto">
                    <OnyxInitializingLoader />
                  </div>
                </div>
              )}
            </div>
          </div>
          <FixedLogo backgroundToggled={sidebarVisible || showHistorySidebar} />
        </div>
      </div>
    </>
  );
}
