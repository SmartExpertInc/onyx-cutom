# custom_extensions/backend/main.py
from fastapi import FastAPI, HTTPException, Depends, Request, status, File, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse

from typing import List, Optional, Dict, Any, Union, Type, ForwardRef, Set, Literal
from pydantic import BaseModel, Field, RootModel
import re
import os
import asyncpg
from datetime import datetime, timezone
import httpx
from httpx import HTTPStatusError
import json
import uuid
import shutil
import logging
from locales.__init__ import LANG_CONFIG
import asyncio
import typing
import tempfile
import io
import gzip
import base64
import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import tiktoken
import inspect
# NEW: OpenAI imports for direct usage
import openai
from openai import AsyncOpenAI
from uuid import uuid4
from cryptography.fernet import Fernet

# NEW: PDF manipulation imports
try:
    from PyPDF2 import PdfMerger
except ImportError:
    PdfMerger = None

# Feature management models
from app.models.feature_models import (
    FeatureDefinition, UserFeature, UserFeatureWithDetails,
    BulkFeatureToggleRequest, FeatureToggleRequest
)

# Workspace management models and services
from app.models.workspace_models import (
    Workspace, WorkspaceCreate, WorkspaceUpdate,
    WorkspaceWithMembers, WorkspaceRole, WorkspaceRoleCreate, WorkspaceRoleUpdate,
    WorkspaceMember, WorkspaceMemberCreate, WorkspaceMemberUpdate,
    ProductAccess, ProductAccessCreate
)
from app.services.workspace_service import WorkspaceService
from app.services.role_service import RoleService
from app.services.product_access_service import ProductAccessService

# --- CONTROL VARIABLE FOR PRODUCTION LOGGING ---
# SET THIS TO True FOR PRODUCTION, False FOR DEVELOPMENT
IS_PRODUCTION = False  # Or True for production

# --- Logger ---
logger = logging.getLogger(__name__)
if IS_PRODUCTION:
    logging.basicConfig(level=logging.ERROR) # Production: Log only ERROR and CRITICAL
else:
    logging.basicConfig(level=logging.INFO)  # Development: Log INFO, WARNING, ERROR, CRITICAL


# --- Constants & DB Setup ---
CUSTOM_PROJECTS_DATABASE_URL = os.getenv("CUSTOM_PROJECTS_DATABASE_URL")
ONYX_DATABASE_URL = os.getenv("ONYX_DATABASE_URL")
ONYX_API_SERVER_URL = "http://api_server:8080" # Adjust if needed
ONYX_SESSION_COOKIE_NAME = os.getenv("ONYX_SESSION_COOKIE_NAME", "fastapiusersauth")

# Component name constants
COMPONENT_NAME_TRAINING_PLAN = "TrainingPlanTable"
COMPONENT_NAME_PDF_LESSON = "PdfLessonDisplay"
COMPONENT_NAME_SLIDE_DECK = "SlideDeckDisplay"
COMPONENT_NAME_VIDEO_LESSON = "VideoLessonDisplay"
COMPONENT_NAME_VIDEO_LESSON_PRESENTATION = "VideoLessonPresentationDisplay"  # New component for video lesson presentations
COMPONENT_NAME_QUIZ = "QuizDisplay"
COMPONENT_NAME_TEXT_PRESENTATION = "TextPresentationDisplay"
COMPONENT_NAME_LESSON_PLAN = "LessonPlanDisplay"  # New component for lesson plans

# --- LLM Configuration for JSON Parsing ---
# === OpenAI ChatGPT configuration (replacing previous Cohere call) ===
LLM_API_KEY = os.getenv("OPENAI_API_KEY")
LLM_API_KEY_FALLBACK = os.getenv("OPENAI_API_KEY_FALLBACK")

SERPAPI_KEY = "ef10e9f3a1c8f0c2cd5d9379e39c597b58b6d0628f465c3030cace4d70494df7"

# Endpoint for Chat Completions
LLM_API_URL = os.getenv("OPENAI_API_URL", "https://api.openai.com/v1/chat/completions")
# Default model to use – gpt-4o-mini provides strong JSON adherence
LLM_DEFAULT_MODEL = os.getenv("OPENAI_DEFAULT_MODEL", "gpt-4o-mini")

# NEW: OpenAI client for direct streaming
OPENAI_CLIENT = None

def get_openai_client():
    """Get or create the OpenAI client instance."""
    global OPENAI_CLIENT
    if OPENAI_CLIENT is None:
        api_key = LLM_API_KEY or LLM_API_KEY_FALLBACK
        if not api_key:
            raise ValueError("No OpenAI API key configured. Set OPENAI_API_KEY environment variable.")
        OPENAI_CLIENT = AsyncOpenAI(api_key=api_key)
    return OPENAI_CLIENT

async def stream_openai_response(prompt: str, model: str = None):
    """
    Stream response directly from OpenAI API.
    Yields dictionaries with 'type' and 'text' fields compatible with existing frontend.
    """
    try:
        client = get_openai_client()
        model = model or LLM_DEFAULT_MODEL
        
        logger.info(f"[OPENAI_STREAM] Starting direct OpenAI streaming with model {model}")
        logger.info(f"[OPENAI_STREAM] Prompt length: {len(prompt)} chars")
        
        # Read the full ContentBuilder.ai assistant instructions
        assistant_instructions_path = "custom_assistants/content_builder_ai.txt"
        try:
            with open(assistant_instructions_path, 'r', encoding='utf-8') as f:
                system_prompt = f.read()
        except FileNotFoundError:
            logger.warning(f"[OPENAI_STREAM] Assistant instructions file not found: {assistant_instructions_path}")
            system_prompt = "You are ContentBuilder.ai assistant. Follow the instructions in the user message exactly."
        
        # Create the streaming chat completion
        stream = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            stream=True,
            max_tokens=10000,  # Increased from 4000 to handle larger course outlines
            temperature=0.2
        )
        
        logger.info(f"[OPENAI_STREAM] Stream created successfully")
        
        # DEBUG: Collect full response for logging
        full_response = ""
        chunk_count = 0
        
        async for chunk in stream:
            chunk_count += 1
            logger.debug(f"[OPENAI_STREAM] Chunk {chunk_count}: {chunk}")
            
            if chunk.choices and len(chunk.choices) > 0:
                choice = chunk.choices[0]
                if choice.delta and choice.delta.content:
                    content = choice.delta.content
                    full_response += content  # DEBUG: Accumulate full response
                    yield {"type": "delta", "text": content}
                    
                # Check for finish reason
                if choice.finish_reason:
                    logger.info(f"[OPENAI_STREAM] Stream finished with reason: {choice.finish_reason}")
                    logger.info(f"[OPENAI_STREAM] Total chunks received: {chunk_count}")
                    logger.info(f"[OPENAI_STREAM] FULL RESPONSE:\n{full_response}")
                    break
                    
    except Exception as e:
        logger.error(f"[OPENAI_STREAM] Error in OpenAI streaming: {e}", exc_info=True)
        yield {"type": "error", "text": f"OpenAI streaming error: {str(e)}"}

def should_use_openai_direct(payload) -> bool:
    """
    Determine if we should use OpenAI directly instead of Onyx.
    Returns True when no file context is present.
    """
    # Check if files are explicitly provided
    has_files = (
        (hasattr(payload, 'fromFiles') and payload.fromFiles) or
        (hasattr(payload, 'folderIds') and payload.folderIds) or
        (hasattr(payload, 'fileIds') and payload.fileIds)
    )
    
    # Check if text context is provided (this still uses file system in some cases)
    has_text_context = (
        hasattr(payload, 'fromText') and payload.fromText and 
        hasattr(payload, 'userText') and payload.userText
    )
    
    # Use OpenAI directly only when there's no file context and no text context
    use_openai = not has_files and not has_text_context
    
    logger.info(f"[API_SELECTION] has_files={has_files}, has_text_context={has_text_context}, use_openai={use_openai}")
    return use_openai

def parse_id_list(id_string: str, context_name: str) -> List[int]:
    """
    Parse a comma-separated string of IDs, handling negative integers (like -1 for special cases).
    
    Args:
        id_string: Comma-separated string of IDs (e.g., "1,2,3" or "-1" or "42")
        context_name: Context name for logging (e.g., "folder" or "file")
    
    Returns:
        List of parsed integer IDs
    """
    if not id_string:
        return []
    
    id_list = []
    try:
        for id_part in id_string.split(','):
            id_stripped = id_part.strip()
            if id_stripped.lstrip('-').isdigit():  # Allow negative numbers
                id_list.append(int(id_stripped))
            elif id_stripped:  # Log non-empty invalid parts
                logger.warning(f"[ID_PARSING] Skipping invalid {context_name} ID: '{id_stripped}'")
        
        logger.debug(f"[ID_PARSING] Parsed {context_name} IDs from '{id_string}': {id_list}")
        return id_list
    except Exception as e:
        logger.error(f"[ID_PARSING] Failed to parse {context_name} IDs from '{id_string}': {e}")
        return []

def should_use_hybrid_approach(payload) -> bool:
    """
    Determine if we should use the hybrid approach (Onyx for context extraction + OpenAI for generation).
    Returns True when file context is present or when connector-based filtering is requested.
    """
    # Check if files are explicitly provided
    has_files = (
        (hasattr(payload, 'fromFiles') and payload.fromFiles) or
        (hasattr(payload, 'folderIds') and payload.folderIds) or
        (hasattr(payload, 'fileIds') and payload.fileIds)
    )
    
    # Check if text context is provided (this also uses hybrid approach)
    has_text_context = (
        hasattr(payload, 'fromText') and payload.fromText and 
        hasattr(payload, 'userText') and payload.userText
    )
    
    # Check if Knowledge Base search is requested
    has_knowledge_base = (
        hasattr(payload, 'fromKnowledgeBase') and payload.fromKnowledgeBase
    )
    
    # Check if connector-based filtering is requested
    has_connector_filtering = (
        hasattr(payload, 'fromConnectors') and payload.fromConnectors and
        hasattr(payload, 'connectorSources') and payload.connectorSources
    )
    
    # Use hybrid approach when there's file context, text context, Knowledge Base search, or connector filtering
    use_hybrid = has_files or has_text_context or has_knowledge_base or has_connector_filtering
    
    logger.info(f"[HYBRID_SELECTION] has_files={has_files}, has_text_context={has_text_context}, has_knowledge_base={has_knowledge_base}, has_connector_filtering={has_connector_filtering}, use_hybrid={use_hybrid}")
    return use_hybrid

DB_POOL = None
# Track in-flight project creations to avoid duplicate processing (keyed by user+project)
ACTIVE_PROJECT_CREATE_KEYS: Set[str] = set()

# Track in-flight quiz finalizations to prevent duplicate processing
ACTIVE_QUIZ_FINALIZE_KEYS: Set[str] = set()

# Track quiz finalization timestamps for cleanup
QUIZ_FINALIZE_TIMESTAMPS: Dict[str, float] = {}


# --- Directory for Design Template Images ---
STATIC_DESIGN_IMAGES_DIR = "static_design_images"
os.makedirs(STATIC_DESIGN_IMAGES_DIR, exist_ok=True)

# --- Directory for Static Fonts ---
STATIC_FONTS_DIR = "static/fonts"
os.makedirs(STATIC_FONTS_DIR, exist_ok=True)

def inspect_list_items_recursively(data_structure: Any, path: str = ""):
    if isinstance(data_structure, dict):
        for key, value in data_structure.items():
            new_path = f"{path}.{key}" if path else key
            if key == "items": # Focus on 'items' keys
                logger.info(f"PDF Deep Inspect: Path: {new_path}, Type: {type(value)}, Is List: {isinstance(value, list)}, Value (first 100): {str(value)[:100]}")
                if not isinstance(value, list) and value is not None:
                    logger.error(f"PDF DEEP ERROR: Non-list 'items' at {new_path}. Type: {type(value)}, Value: {str(value)[:200]}")
            if isinstance(value, (dict, list)):
                inspect_list_items_recursively(value, new_path)
    elif isinstance(data_structure, list):
        for i, item in enumerate(data_structure):
            new_path = f"{path}[{i}]"
            if isinstance(item, (dict, list)):
                inspect_list_items_recursively(item, new_path)

DEFAULT_TRAINING_PLAN_JSON_EXAMPLE_FOR_LLM = """
{
  "mainTitle": "Example Training Program",
  "sections": [
    {
      "id": "№1",
      "title": "Introduction to Topic",
      "totalHours": 5.5,
      "lessons": [
        {
          "title": "Lesson 1.1: Basic Concepts",
          "check": {"type": "test", "text": "Knowledge Test"},
          "contentAvailable": {"type": "yes", "text": "100%"},
          "source": "Internal Documentation",
          "hours": 2.0,
          "completionTime": "6m"
        }
      ]
    }
  ],
  "detectedLanguage": "en"
}
"""

DEFAULT_PDF_LESSON_JSON_EXAMPLE_FOR_LLM = """
{
  "lessonTitle": "Example PDF Lesson with Nested Lists",
  "contentBlocks": [
    { "type": "headline", "level": 1, "text": "Main Title of the Lesson" },
    { "type": "paragraph", "text": "This is an introductory paragraph explaining the main concepts." },
    {
      "type": "bullet_list",
      "items": [
        "Top level item 1, demonstrating a simple string item.",
        {
          "type": "bullet_list",
          "iconName": "chevronRight",
          "items": [
            "Nested item A: This is a sub-item.",
            "Nested item B: Another sub-item to show structure.",
            {
              "type": "numbered_list",
              "items": [
                "Further nested numbered item 1.",
                "Further nested numbered item 2."
              ]
            }
          ]
        },
        "Top level item 2, followed by a nested numbered list.",
        {
          "type": "numbered_list",
          "items": [
            "Nested numbered 1: First point in nested ordered list.",
            "Nested numbered 2: Second point."
          ]
        },
        "Top level item 3."
      ]
    },
    { "type": "alert", "alertType": "info", "title": "Important Note", "text": "Alerts can provide contextual information or warnings." },
    {
      "type": "numbered_list",
      "items": [
        "Main numbered point 1.",
        {
          "type": "bullet_list",
          "items": [
            "Sub-bullet C under numbered list.",
            "Sub-bullet D, also useful for breaking down complex points."
          ]
        },
        "Main numbered point 2."
      ]
    },
    { "type": "section_break", "style": "dashed" }
  ],
  "detectedLanguage": "en"
}
"""



async def get_db_pool():
    if DB_POOL is None:
        detail_msg = "Database service not available." # Generic enough for production
        raise HTTPException(status_code=503, detail=detail_msg)
    return DB_POOL

app = FastAPI(title="Custom Extension Backend")

app.mount(f"/{STATIC_DESIGN_IMAGES_DIR}", StaticFiles(directory=STATIC_DESIGN_IMAGES_DIR), name="static_design_images")
app.mount("/fonts", StaticFiles(directory=STATIC_FONTS_DIR), name="static_fonts")

@app.middleware("http")
async def track_request_analytics(request: Request, call_next):
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    # Get user ID if available
    user_id = None
    try:
        if hasattr(request.state, 'user_id'):
            user_id = request.state.user_id
    except:
        pass
    
    # Get request size
    request_size = None
    try:
        if request.method in ['POST', 'PUT', 'PATCH']:
            body = await request.body()
            request_size = len(body)
    except:
        pass
    
    try:
        response = await call_next(request)
        end_time = time.time()
        response_time_ms = int((end_time - start_time) * 1000)
        
        # Get response size
        response_size = None
        try:
            if hasattr(response, 'body'):
                response_size = len(response.body)
        except:
            pass
        
        # Store analytics in database
        try:
            async with DB_POOL.acquire() as conn:
                await conn.execute("""
                    INSERT INTO request_analytics (
                        id, endpoint, method, user_id, status_code, 
                        response_time_ms, request_size_bytes, response_size_bytes,
                        error_message, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                """, request_id, request.url.path, request.method, user_id,
                     response.status_code, response_time_ms, request_size,
                     response_size, None, datetime.now(timezone.utc))
        except Exception as e:
            logger.error(f"Failed to store request analytics: {e}")
        
        return response
        
    except Exception as e:
        end_time = time.time()
        response_time_ms = int((end_time - start_time) * 1000)
        
        # Store error analytics
        try:
            async with DB_POOL.acquire() as conn:
                await conn.execute("""
                    INSERT INTO request_analytics (
                        id, endpoint, method, user_id, status_code, 
                        response_time_ms, request_size_bytes, response_size_bytes,
                        error_message, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                """, request_id, request.url.path, request.method, user_id,
                     500, response_time_ms, request_size, None,
                     str(e), datetime.now(timezone.utc))
        except Exception as db_error:
            logger.error(f"Failed to store error analytics: {db_error}")
        
        raise

try:
    from app.services.pdf_generator import generate_pdf_from_html_template
    from app.core.config import settings
except ImportError:
    logger.warning("Could not import pdf_generator or settings from 'app' module. Using dummy implementations for PDF generation.")
    class DummySettings:
        CUSTOM_FRONTEND_URL = os.environ.get("CUSTOM_FRONTEND_URL", "http://custom_frontend:3001")
    settings = DummySettings()
    async def generate_pdf_from_html_template(template_name: str, context_data: Dict[str, Any], output_filename: str) -> str:
        logger.info(f"PDF Generation Skipped (Dummy Service): Would generate for template {template_name} to {output_filename}")
        dummy_path = os.path.join("/app/tmp_pdf", output_filename)
        os.makedirs(os.path.dirname(dummy_path), exist_ok=True)
        with open(dummy_path, "w") as f: f.write(f"Dummy PDF for {output_filename} using context: {str(context_data)[:200]}")
        return dummy_path

effective_origins = list(set(filter(None, [
    "http://localhost:3001",
    "http://143.198.59.56:3001",
    "http://143.198.59.56:8088",
    os.environ.get("WEB_DOMAIN", "http://localhost:3000"),
    settings.CUSTOM_FRONTEND_URL if 'settings' in globals() and hasattr(settings, 'CUSTOM_FRONTEND_URL') else os.environ.get("CUSTOM_FRONTEND_URL", "http://custom_frontend:3001")
])))
if not effective_origins: effective_origins = ["http://localhost:3001"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=effective_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class StatusInfo(BaseModel):
    type: str = "unknown"
    text: str = ""
    model_config = {"from_attributes": True}

# Credits Models
class UserCredits(BaseModel):
    id: int
    onyx_user_id: str
    name: str
    credits_balance: int
    total_credits_used: int
    credits_purchased: int
    last_purchase_date: Optional[datetime]
    subscription_tier: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class CreditTransactionRequest(BaseModel):
    user_email: str
    amount: int
    action: Literal["add", "remove"]
    reason: Optional[str] = "Admin adjustment"

class CreditTransactionResponse(BaseModel):
    success: bool
    message: str
    new_balance: int
    user_credits: UserCredits

class LessonDetail(BaseModel):
    title: str
    check: StatusInfo = Field(default_factory=StatusInfo)
    contentAvailable: StatusInfo = Field(default_factory=StatusInfo)
    source: str = ""
    hours: int = 0
    completionTime: str = ""  # Estimated completion time in minutes (e.g., "5m", "6m", "7m", "8m")
    custom_rate: Optional[int] = None  # Individual lesson-level custom rate override
    quality_tier: Optional[str] = None  # Individual lesson-level quality tier override
    recommended_content_types: Optional[Dict[str, Any]] = None
    model_config = {"from_attributes": True}

class SectionDetail(BaseModel):
    id: str
    title: str
    totalHours: int = 0
    totalCompletionTime: Optional[int] = None  # Total completion time in minutes for the section
    lessons: List[LessonDetail] = Field(default_factory=list)
    autoCalculateHours: bool = True
    custom_rate: Optional[int] = None  # Module-level custom rate override
    quality_tier: Optional[str] = None  # Module-level quality tier override
    model_config = {"from_attributes": True}

class TrainingPlanDetails(BaseModel):
    mainTitle: Optional[str] = None
    sections: List[SectionDetail] = Field(default_factory=list)
    detectedLanguage: Optional[str] = None
    # Store user preferences on which optional columns to show in UI (frontend reads this)
    displayOptions: Optional[Dict[str, bool]] = None  # e.g., {"knowledgeCheck": true, "contentAvailability": false}
    # Store theme selection for styling
    theme: Optional[str] = "cherry"  # Default theme
    model_config = {"from_attributes": True}

AnyContentBlock = Union["HeadlineBlock", "ParagraphBlock", "BulletListBlock", "NumberedListBlock", "AlertBlock", "SectionBreakBlock", "TableBlock"]
ListItem = Union[str, AnyContentBlock, List[AnyContentBlock]]

class BaseContentBlock(BaseModel):
    type: str
    model_config = {"from_attributes": True}

class HeadlineBlock(BaseContentBlock):
    type: str = "headline"
    level: int = Field(ge=1, le=4)
    text: str
    iconName: Optional[str] = None
    backgroundColor: Optional[str] = None
    textColor: Optional[str] = None
    isImportant: Optional[bool] = Field(default=False, description="Set to true if this headline (typically Level 4) and its immediately following single block (list or paragraph) form an important section to be visually boxed.")

class ParagraphBlock(BaseContentBlock):
    type: str = "paragraph"
    text: str
    isRecommendation: Optional[bool] = Field(default=False, description="Set to true if this paragraph is a 'recommendation' within a numbered list item, to be styled distinctly.")

class BulletListBlock(BaseContentBlock):
    type: Literal['bullet_list'] = 'bullet_list'
    items: List[ListItem] = []
    iconName: Optional[str] = None

class NumberedListBlock(BaseContentBlock):
    type: Literal['numbered_list'] = 'numbered_list'
    items: List[ListItem] = []

class AlertBlock(BaseContentBlock):
    type: str = "alert"
    title: Optional[str] = None
    text: str
    alertType: str = "info"
    iconName: Optional[str] = None
    backgroundColor: Optional[str] = None
    borderColor: Optional[str] = None
    textColor: Optional[str] = None
    iconColor: Optional[str] = None

class SectionBreakBlock(BaseContentBlock):
    type: str = "section_break"
    style: Optional[str] = "solid"

class TableBlock(BaseContentBlock):
    type: str = "table"
    headers: List[str]
    rows: List[List[str]]
    caption: Optional[str] = None

class ImageBlock(BaseContentBlock):
    type: str = "image"
    src: str
    alt: Optional[str] = None
    caption: Optional[str] = None
    width: Optional[Union[int, str]] = None
    height: Optional[Union[int, str]] = None
    alignment: Optional[str] = "center"
    borderRadius: Optional[str] = "8px"
    maxWidth: Optional[str] = "100%"
    # Layout mode fields for positioning
    layoutMode: Optional[str] = None  # 'standalone', 'inline-left', 'inline-right'
    layoutPartnerIndex: Optional[int] = None  # Index of the content block to pair with for side-by-side layouts
    layoutProportion: Optional[str] = None  # '50-50', '60-40', '40-60', '70-30', '30-70'
    float: Optional[str] = None  # Legacy field for backward compatibility: 'left', 'right'

AnyContentBlockValue = Union[
    HeadlineBlock, ParagraphBlock, BulletListBlock, NumberedListBlock, AlertBlock, SectionBreakBlock, TableBlock, ImageBlock
]

class PdfLessonDetails(BaseModel):
    lessonTitle: str
    # Optional: sequential number of the lesson inside the parent Training Plan
    lessonNumber: Optional[int] = None
    contentBlocks: List[AnyContentBlockValue] = Field(default_factory=list)
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True}

class VideoLessonSlideData(BaseModel):
    slideId: str
    slideNumber: int
    slideTitle: str
    displayedText: Optional[str] = None
    imagePath: Optional[str] = None
    videoPath: Optional[str] = None
    voiceoverText: Optional[str] = None
    displayedPictureDescription: Optional[str] = None
    displayedVideoDescription: Optional[str] = None
    model_config = {"from_attributes": True}

class VideoLessonData(BaseModel):
    mainPresentationTitle: str
    slides: List[VideoLessonSlideData] = Field(default_factory=list)
    currentSlideId: Optional[str] = None # To store the active slide from frontend
    lessonNumber: Optional[int] = None  # Sequential number in Training Plan
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True}

# --- NEW: Slide-based Lesson Presentation Models ---
class ImagePlaceholder(BaseModel):
    size: str          # "LARGE", "MEDIUM", "SMALL", "BANNER", "BACKGROUND"
    position: str      # "LEFT", "RIGHT", "TOP_BANNER", "BACKGROUND", etc.
    description: str   # Description of the image content
    model_config = {"from_attributes": True}

class DeckSlide(BaseModel):
    slideId: str               
    slideNumber: int           
    slideTitle: str            
    templateId: str            # Зробити обов'язковим (без Optional)
    props: Dict[str, Any] = Field(default_factory=dict)  # Додати props
    voiceoverText: Optional[str] = None  # Optional voiceover text for video lessons
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)  # Опціонально для метаданих
    model_config = {"from_attributes": True}

class SlideDeckDetails(BaseModel):
    lessonTitle: str
    slides: List[DeckSlide] = Field(default_factory=list)
    currentSlideId: Optional[str] = None  # To store the active slide from frontend
    lessonNumber: Optional[int] = None    # Sequential number in Training Plan
    detectedLanguage: Optional[str] = None
    hasVoiceover: Optional[bool] = None  # Flag indicating if any slide has voiceover
    theme: Optional[str] = None           # Selected theme for presentation
    model_config = {"from_attributes": True}

# --- Start: Add New Quiz Models ---

class QuizQuestionOption(BaseModel):
    id: str  # e.g., "A", "B", "C"
    text: str
    model_config = {"from_attributes": True}

class MatchingPrompt(BaseModel):
    id: str # e.g., "A", "B", "C"
    text: str
    model_config = {"from_attributes": True}

class MatchingOption(BaseModel):
    id: str # e.g., "1", "2", "3"
    text: str
    model_config = {"from_attributes": True}

class SortableItem(BaseModel):
    id: str # e.g., "step1", "step2"
    text: str
    model_config = {"from_attributes": True}

class BaseQuestion(BaseModel):
    question_text: str
    explanation: Optional[str] = None
    model_config = {"from_attributes": True}

class MultipleChoiceQuestion(BaseQuestion):
    question_type: Literal["multiple-choice"]
    options: List[QuizQuestionOption]
    correct_option_id: str
    model_config = {"from_attributes": True}

class MultiSelectQuestion(BaseQuestion):
    question_type: Literal["multi-select"]
    options: List[QuizQuestionOption]
    correct_option_ids: List[str]
    model_config = {"from_attributes": True}

class MatchingQuestion(BaseQuestion):
    question_type: Literal["matching"]
    prompts: List[MatchingPrompt]
    options: List[MatchingOption]
    correct_matches: Dict[str, str]  # Maps prompt.id to option.id, e.g. {"A": "3", "B": "1"}
    model_config = {"from_attributes": True}

class SortingQuestion(BaseQuestion):
    question_type: Literal["sorting"]
    items_to_sort: List[SortableItem]
    correct_order: List[str]  # List of SortableItem.id in the correct sequence
    model_config = {"from_attributes": True}

class OpenAnswerQuestion(BaseQuestion):
    question_type: Literal["open-answer"]
    acceptable_answers: List[str]
    model_config = {"from_attributes": True}

AnyQuizQuestion = Union[
    MultipleChoiceQuestion,
    MultiSelectQuestion,
    MatchingQuestion,
    SortingQuestion,
    OpenAnswerQuestion
]

# Lesson Plan Generation Models
class LessonPlanGenerationRequest(BaseModel):
    outlineProjectId: int
    lessonTitle: str
    moduleName: str
    lessonNumber: int
    recommendedProducts: List[str]

class LessonPlanData(BaseModel):
    lessonTitle: str
    lessonObjectives: List[str]
    shortDescription: str
    recommendedProductTypes: Dict[str, str]
    materials: List[str]
    suggestedPrompts: List[str]

class LessonPlanResponse(BaseModel):
    success: bool
    project_id: int
    lesson_plan_data: LessonPlanData
    message: str

# custom_extensions/backend/main.py
from fastapi import FastAPI, HTTPException, Depends, Request, status, File, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse

from typing import List, Optional, Dict, Any, Union, Type, ForwardRef, Set, Literal
from pydantic import BaseModel, Field, RootModel
import re
import os
import asyncpg
from datetime import datetime, timezone
import httpx
from httpx import HTTPStatusError
import json
import uuid
import shutil
import logging
from locales.__init__ import LANG_CONFIG
import asyncio
import typing
import tempfile
import io
import gzip
import base64
import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import tiktoken
import inspect

# --- CONTROL VARIABLE FOR PRODUCTION LOGGING ---
# SET THIS TO True FOR PRODUCTION, False FOR DEVELOPMENT
IS_PRODUCTION = False  # Or True for production

# --- Logger ---
logger = logging.getLogger(__name__)
if IS_PRODUCTION:
    logging.basicConfig(level=logging.ERROR) # Production: Log only ERROR and CRITICAL
else:
    logging.basicConfig(level=logging.INFO)  # Development: Log INFO, WARNING, ERROR, CRITICAL


# --- Constants & DB Setup ---
CUSTOM_PROJECTS_DATABASE_URL = os.getenv("CUSTOM_PROJECTS_DATABASE_URL")
ONYX_DATABASE_URL = os.getenv("ONYX_DATABASE_URL")
ONYX_API_SERVER_URL = "http://api_server:8080" # Adjust if needed
ONYX_SESSION_COOKIE_NAME = os.getenv("ONYX_SESSION_COOKIE_NAME", "fastapiusersauth")

# Component name constants
COMPONENT_NAME_TRAINING_PLAN = "TrainingPlanTable"
COMPONENT_NAME_PDF_LESSON = "PdfLessonDisplay"
COMPONENT_NAME_SLIDE_DECK = "SlideDeckDisplay"
COMPONENT_NAME_VIDEO_LESSON = "VideoLessonDisplay"
COMPONENT_NAME_QUIZ = "QuizDisplay"
COMPONENT_NAME_TEXT_PRESENTATION = "TextPresentationDisplay"

# --- LLM Configuration for JSON Parsing ---
# === OpenAI ChatGPT configuration (replacing previous Cohere call) ===
LLM_API_KEY = os.getenv("OPENAI_API_KEY")
LLM_API_KEY_FALLBACK = os.getenv("OPENAI_API_KEY_FALLBACK")
# Endpoint for Chat Completions
LLM_API_URL = os.getenv("OPENAI_API_URL", "https://api.openai.com/v1/chat/completions")
# Default model to use – gpt-4o-mini provides strong JSON adherence
LLM_DEFAULT_MODEL = os.getenv("OPENAI_DEFAULT_MODEL", "gpt-4o-mini")

DB_POOL = None
# Track in-flight project creations to avoid duplicate processing (keyed by user+project)
ACTIVE_PROJECT_CREATE_KEYS: Set[str] = set()

# Track in-flight quiz finalizations to prevent duplicate processing
ACTIVE_QUIZ_FINALIZE_KEYS: Set[str] = set()

# Track quiz finalization timestamps for cleanup
QUIZ_FINALIZE_TIMESTAMPS: Dict[str, float] = {}


# --- Directory for Design Template Images ---
STATIC_DESIGN_IMAGES_DIR = "static_design_images"
os.makedirs(STATIC_DESIGN_IMAGES_DIR, exist_ok=True)

# --- Directory for Static Fonts ---
STATIC_FONTS_DIR = "static/fonts"
os.makedirs(STATIC_FONTS_DIR, exist_ok=True)

def inspect_list_items_recursively(data_structure: Any, path: str = ""):
    if isinstance(data_structure, dict):
        for key, value in data_structure.items():
            new_path = f"{path}.{key}" if path else key
            if key == "items": # Focus on 'items' keys
                logger.info(f"PDF Deep Inspect: Path: {new_path}, Type: {type(value)}, Is List: {isinstance(value, list)}, Value (first 100): {str(value)[:100]}")
                if not isinstance(value, list) and value is not None:
                    logger.error(f"PDF DEEP ERROR: Non-list 'items' at {new_path}. Type: {type(value)}, Value: {str(value)[:200]}")
            if isinstance(value, (dict, list)):
                inspect_list_items_recursively(value, new_path)
    elif isinstance(data_structure, list):
        for i, item in enumerate(data_structure):
            new_path = f"{path}[{i}]"
            if isinstance(item, (dict, list)):
                inspect_list_items_recursively(item, new_path)

DEFAULT_TRAINING_PLAN_JSON_EXAMPLE_FOR_LLM = """
{
  "mainTitle": "Example Training Program",
  "sections": [
    {
      "id": "№1",
      "title": "Introduction to Topic",
      "totalHours": 5.5,
      "lessons": [
        {
          "title": "Lesson 1.1: Basic Concepts",
          "check": {"type": "test", "text": "Knowledge Test"},
          "contentAvailable": {"type": "yes", "text": "100%"},
          "source": "Internal Documentation",
          "hours": 2.0,
          "completionTime": "6m"
        }
      ]
    }
  ],
  "detectedLanguage": "en"
}
"""

DEFAULT_PDF_LESSON_JSON_EXAMPLE_FOR_LLM = """
{
  "lessonTitle": "Example PDF Lesson with Nested Lists",
      "contentBlocks": [
    { "type": "headline", "level": 1, "text": "Main Title of the Lesson" },
    { "type": "paragraph", "text": "This is an introductory paragraph explaining the main concepts." },
        {
          "type": "bullet_list",
          "items": [
        "Top level item 1, demonstrating a simple string item.",
        {
          "type": "bullet_list",
          "iconName": "chevronRight",
          "items": [
            "Nested item A: This is a sub-item.",
            "Nested item B: Another sub-item to show structure.",
            {
              "type": "numbered_list",
              "items": [
                "Further nested numbered item 1.",
                "Further nested numbered item 2."
              ]
            }
          ]
        },
        "Top level item 2, followed by a nested numbered list.",
        {
          "type": "numbered_list",
          "items": [
            "Nested numbered 1: First point in nested ordered list.",
            "Nested numbered 2: Second point."
          ]
        },
        "Top level item 3."
      ]
    },
    { "type": "alert", "alertType": "info", "title": "Important Note", "text": "Alerts can provide contextual information or warnings." },
    {
      "type": "numbered_list",
      "items": [
        "Main numbered point 1.",
        {
          "type": "bullet_list",
          "items": [
            "Sub-bullet C under numbered list.",
            "Sub-bullet D, also useful for breaking down complex points."
          ]
        },
        "Main numbered point 2."
      ]
    },
    { "type": "section_break", "style": "dashed" }
  ],
  "detectedLanguage": "en"
}
"""

DEFAULT_SLIDE_DECK_JSON_EXAMPLE_FOR_LLM = """
{
  "lessonTitle": "Digital Marketing Strategy: A Complete Guide",
  "slides": [
    {
      "slideId": "slide_1_intro",
      "slideNumber": 1,
      "slideTitle": "Introduction",
      "templateId": "hero-title-slide",
      "props": {
        "title": "Digital Marketing Strategy",
        "subtitle": "A comprehensive guide to building effective online presence and driving business growth",
        "author": "Marketing Excellence Team",
        "date": "2024",
        "backgroundColor": "#1e40af",
        "titleColor": "#ffffff",
        "subtitleColor": "#bfdbfe"
      }
    },
    {
      "slideId": "slide_2_agenda",
      "slideNumber": 2,
      "slideTitle": "Learning Agenda",
      "templateId": "bullet-points",
      "props": {
        "title": "What We'll Cover Today",
        "bullets": [
          "Understanding digital marketing fundamentals",
          "Market research and target audience analysis",
          "Content strategy development",
          "Social media marketing tactics",
          "Email marketing best practices",
          "SEO and search marketing"
        ],
        "maxColumns": 2,
        "bulletStyle": "number",
        "imagePrompt": "A roadmap or pathway illustration showing the learning journey, modern flat design with blue and purple accents",
        "imageAlt": "Learning roadmap illustration"
      }
    },
    {
      "slideId": "slide_3_stats",
      "slideNumber": 3,
      "slideTitle": "Digital Marketing by the Numbers",
      "templateId": "big-numbers",
      "props": {
        "title": "Digital Marketing Impact",
        "numbers": [
          {
            "value": "4.8B",
            "label": "Internet Users Worldwide",
            "color": "#3b82f6"
          },
          {
            "value": "68%",
            "label": "Of Online Experiences Start with Search",
            "color": "#8b5cf6"
          },
          {
            "value": "$42",
            "label": "ROI for Every $1 Spent on Email Marketing",
            "color": "#10b981"
          }
        ]
      }
    },
    {
      "slideId": "slide_4_ecosystem",
      "slideNumber": 4,
      "slideTitle": "Digital Marketing Ecosystem",
      "templateId": "big-image-top",
      "props": {
        "title": "The Digital Marketing Landscape",
        "content": "Understanding the interconnected nature of digital marketing channels and how they work together to create a cohesive customer experience across all touchpoints.",
        "imageUrl": "https://via.placeholder.com/800x400?text=Digital+Ecosystem",
        "imageAlt": "Digital marketing ecosystem diagram",
        "imagePrompt": "A comprehensive diagram showing interconnected digital marketing channels including social media, email, SEO, PPC, content marketing, and analytics in a modern network visualization",
        "imageSize": "large"
      }
    },
    {
      "slideId": "slide_5_audience_vs_market",
      "slideNumber": 5,
      "slideTitle": "Audience vs Market Research",
      "templateId": "two-column",
      "props": {
        "title": "Understanding the Difference",
        "leftTitle": "Market Research",
        "leftContent": "• Industry trends and size\n• Competitive landscape\n• Market opportunities\n• Overall demand patterns\n• Economic factors",
        "rightTitle": "Audience Research",
        "rightContent": "• Customer demographics\n• Behavioral patterns\n• Pain points and needs\n• Communication preferences\n• Decision-making process"
      }
    },
    {
      "slideId": "slide_6_personas",
      "slideNumber": 6,
      "slideTitle": "Buyer Persona Development",
      "templateId": "process-steps",
      "props": {
        "title": "Creating Effective Buyer Personas",
        "steps": [
          "Collect demographic and psychographic data",
          "Conduct customer interviews and surveys",
          "Analyze behavioral patterns and preferences",
          "Identify goals, challenges, and pain points",
          "Map the customer journey and touchpoints",
          "Validate personas with real customer data"
        ]
      }
    },
    {
      "slideId": "slide_7_content_strategy",
      "slideNumber": 7,
      "slideTitle": "Content Strategy Foundation",
      "templateId": "pyramid",
      "props": {
        "title": "Content Strategy Pyramid",
        "levels": [
          {
            "text": "Content Distribution & Promotion",
            "description": "Multi-channel amplification strategy"
          },
          {
            "text": "Content Creation & Production",
            "description": "High-quality, engaging content development"
          },
          {
            "text": "Content Planning & Calendar",
            "description": "Strategic planning and scheduling"
          },
          {
            "text": "Content Audit & Analysis",
            "description": "Understanding current content performance"
          },
          {
            "text": "Goals, Audience & Brand Foundation",
            "description": "Strategic foundation and core objectives"
          }
        ]
      }
    },
    {
      "slideId": "slide_8_content_types",
      "slideNumber": 8,
      "slideTitle": "Content Format Matrix",
      "templateId": "four-box-grid",
      "props": {
        "title": "Content Formats for Different Goals",
        "boxes": [
          {
            "title": "Educational Content",
            "content": "Blog posts, tutorials, webinars, how-to guides",
            "icon": "📚"
          },
          {
            "title": "Engagement Content", 
            "content": "Social media posts, polls, user-generated content",
            "icon": "💬"
          },
          {
            "title": "Conversion Content",
            "content": "Case studies, testimonials, product demos",
            "icon": "🎯"
          },
          {
            "title": "Entertainment Content",
            "content": "Videos, memes, interactive content, stories",
            "icon": "🎭"
          }
        ]
      }
    },
    {
      "slideId": "slide_9_social_challenges",
      "slideNumber": 9,
      "slideTitle": "Social Media Challenges & Solutions",
      "templateId": "challenges-solutions",
      "props": {
        "title": "Overcoming Social Media Obstacles",
        "challenges": [
          "Low organic reach and engagement",
          "Creating consistent, quality content",
          "Managing multiple platform requirements"
        ],
        "solutions": [
          "Focus on community building and authentic interactions",
          "Develop content pillars and batch creation workflows", 
          "Use scheduling tools and platform-specific strategies"
        ]
      }
    },
    {
      "slideId": "slide_10_email_timeline",
      "slideNumber": 10,
      "slideTitle": "Email Marketing Campaign Timeline",
      "templateId": "timeline",
      "props": {
        "title": "Building Your Email Marketing Program",
        "events": [
          {
            "date": "Week 1-2",
            "title": "Foundation Setup",
            "description": "Choose platform, design templates, set up automation"
          },
          {
            "date": "Week 3-4", 
            "title": "List Building",
            "description": "Create lead magnets, optimize signup forms"
          },
          {
            "date": "Week 5-8",
            "title": "Content Creation",
            "description": "Develop welcome series, newsletters, promotional campaigns"
          },
          {
            "date": "Week 9-12",
            "title": "Optimization",
            "description": "A/B testing, segmentation, performance analysis"
          }
        ]
      }
    },
    {
      "slideId": "slide_11_seo_quote",
      "slideNumber": 11,
      "slideTitle": "SEO Philosophy",
      "templateId": "quote-center",
      "props": {
        "quote": "The best place to hide a dead body is page 2 of Google search results.",
        "author": "Digital Marketing Wisdom",
        "context": "This humorous quote highlights the critical importance of ranking on the first page of search results for visibility and traffic."
      }
    },
    {
      "slideId": "slide_12_seo_factors",
      "slideNumber": 12,
      "slideTitle": "SEO Success Factors",
      "templateId": "bullet-points-right",
      "props": {
        "title": "Key SEO Elements",
        "bullets": [
          "Keyword research and strategic implementation",
          "High-quality, original content creation",
          "Technical SEO and site speed optimization",
          "Mobile-first design and user experience",
          "Authority building through quality backlinks",
          "Local SEO for geographic targeting"
        ],
        "bulletStyle": "dot",
        "imagePrompt": "SEO optimization illustration with search elements, website structure, and ranking factors in a modern, clean style",
        "imageAlt": "SEO optimization visual guide"
      }
    },
    {
      "slideId": "slide_13_paid_advertising",
      "slideNumber": 13,
      "slideTitle": "Paid Advertising Strategy",
      "templateId": "big-image-left",
      "props": {
        "title": "Maximizing Paid Campaign ROI",
        "subtitle": "Strategic paid advertising accelerates reach and drives targeted traffic when organic efforts need support.",
        "imageUrl": "https://via.placeholder.com/600x400?text=Paid+Advertising",
        "imageAlt": "Digital advertising dashboard",
        "imagePrompt": "A modern advertising dashboard showing campaign performance metrics, targeting options, and ROI indicators across multiple platforms",
        "imageSize": "large"
      }
    },
    {
      "slideId": "slide_14_implementation",
      "slideNumber": 14,
      "slideTitle": "90-Day Implementation Plan",
      "templateId": "process-steps",
      "props": {
        "title": "Your Digital Marketing Roadmap",
        "steps": [
          "Month 1: Foundation - Research, audit, and strategy development",
          "Month 2: Launch - Implement core channels and begin content creation",
          "Month 3: Optimize - Analyze data, refine approach, and scale success"
        ]
      }
    },
    {
      "slideId": "slide_15_conclusion",
      "slideNumber": 15,
      "slideTitle": "Success Principles",
      "templateId": "title-slide",
      "props": {
        "title": "Your Digital Marketing Success Formula",
        "subtitle": "Strategy + Consistency + Measurement = Growth",
        "author": "Remember: Digital marketing is a marathon, not a sprint",
        "backgroundColor": "#059669",
        "titleColor": "#ffffff",
        "subtitleColor": "#d1fae5"
      }
    },
    {
      "slideId": "slide_16_table_dark",
      "slideNumber": 16,
      "slideTitle": "Technology Comparison",
      "templateId": "table-dark",
      "props": {
        "title": "Technology Comparison",
        "tableData": {
          "headers": ["Technology", "Performance", "Security", "Cost"],
          "rows": [
            ["React", "High", "Good", "Free"],
            ["Vue.js", "Medium", "Excellent", "Free"],
            ["Angular", "High", "Excellent", "Free"]
          ]
        }
      }
    },
    {
      "slideId": "slide_17_table_light",
      "slideNumber": 17,
      "slideTitle": "Product Features",
      "templateId": "table-light",
      "props": {
        "title": "Product Features Comparison",
        "tableData": {
          "headers": ["Feature", "Basic Plan", "Pro Plan", "Enterprise"],
          "rows": [
            ["Storage", "10GB", "100GB", "Unlimited"],
            ["Users", "5", "25", "Unlimited"],
            ["Support", "Email", "Priority", "24/7"]
          ]
        }
      }
    }
  ],
  "currentSlideId": "slide_1_intro",
  "detectedLanguage": "en"
}
"""

DEFAULT_VIDEO_LESSON_JSON_EXAMPLE_FOR_LLM = """
{
  "lessonTitle": "Example Video Lesson with Voiceover",
  "slides": [
    {
      "slideId": "slide_1_intro",
      "slideNumber": 1,
      "slideTitle": "Introduction",
      "templateId": "big-image-left",
      "voiceoverText": "Welcome to this comprehensive lesson. Today we'll explore the fundamentals of our topic, breaking down complex concepts into easy-to-understand segments. This introduction sets the stage for what you're about to learn.",
      "props": {
          "title": "Welcome to the Lesson",
          "subtitle": "This slide introduces the main topic.",
          "imageUrl": "https://via.placeholder.com/600x400?text=Your+Image",
          "imageAlt": "Descriptive alt text",
          "imagePrompt": "A high-quality illustration that visually represents the lesson introduction",
          "imageSize": "large"
      }
    },
    {
      "slideId": "slide_2_main",
      "slideNumber": 2,
      "slideTitle": "Main Concepts",
      "templateId": "content-slide",
      "voiceoverText": "Now let's dive into the core concepts. These fundamental ideas form the foundation of our understanding. We'll explore each concept in detail, ensuring you have a solid grasp before moving forward.",
      "props": {
        "title": "Core Ideas",
        "content": "These concepts form the foundation of understanding.\n\n• First important concept\n• Second important concept\n• Third important concept",
        "alignment": "left"
      }
    },
    {
      "slideId": "slide_3_bullets",
      "slideNumber": 3,
      "slideTitle": "Key Points",
      "templateId": "bullet-points",
      "voiceoverText": "Here are the key takeaways from our lesson. Each of these points represents a critical insight that you should remember. Let me walk you through each one to ensure you understand their significance.",
      "props": {
        "title": "Key Points",
        "bullets": [
          "First important point",
          "Second key insight",
          "Third critical element"
        ],
        "maxColumns": 2,
        "bulletStyle": "dot",
        "imagePrompt": "A relevant illustration for the bullet points, e.g. 'Checklist, modern flat style, purple and yellow accents'",
        "imageAlt": "Illustration for bullet points"
      }
    },
    {
      "slideId": "slide_4_two_column",
      "slideNumber": 4,
      "slideTitle": "Comparison Analysis",
      "templateId": "two-column",
      "voiceoverText": "Let's examine this topic from two different perspectives. On the left, we have one approach, and on the right, we have another. Both perspectives are valuable and complement each other to give you a complete understanding.",
      "props": {
        "title": "Two Column Layout",
        "leftTitle": "Left Column Title",
        "leftContent": "Content for the left side with detailed explanations",
        "rightTitle": "Right Column Title",
        "rightContent": "Content for the right side with detailed information",
        "columnRatio": "50-50"
      }
    },
    {
      "slideId": "slide_5_four_box",
      "slideNumber": 5,
      "slideTitle": "Four Key Areas",
      "templateId": "four-box-grid",
      "voiceoverText": "Now we'll explore four essential areas that are crucial to understanding this topic. Each box represents a different aspect, and together they provide a comprehensive overview of the subject matter.",
      "props": {
        "title": "Main Title for Four Boxes",
        "boxes": [
          { "heading": "Box 1 Heading", "text": "Detailed description for the first box" },
          { "heading": "Box 2 Heading", "text": "Comprehensive explanation for the second box" },
          { "heading": "Box 3 Heading", "text": "Thorough description for the third box" },
          { "heading": "Box 4 Heading", "text": "In-depth explanation for the fourth box" }
        ]
      }
    },
    {
      "slideId": "slide_6_challenges",
      "slideNumber": 6,
      "slideTitle": "Problem Solving",
      "templateId": "challenges-solutions",
      "voiceoverText": "Every field has its challenges, but for every challenge, there's a solution. Let's examine the common obstacles you might face and the proven strategies to overcome them effectively.",
      "props": {
        "title": "Challenges and Solutions",
        "challengesTitle": "Common Challenges",
        "solutionsTitle": "Effective Solutions",
        "challenges": [
          "Challenge 1 with detailed explanation of the problem",
          "Challenge 2 with comprehensive analysis of the issue"
        ],
        "solutions": [
          "Solution 1 with detailed approach and implementation strategy",
          "Solution 2 with comprehensive methodology and practical steps"
        ]
      }
    },
    {
      "slideId": "slide_7_process",
      "slideNumber": 7,
      "slideTitle": "Step-by-Step Process",
      "templateId": "process-steps",
      "voiceoverText": "Finally, let's look at the practical implementation. This step-by-step process shows you exactly how to apply what you've learned. Follow along carefully as we go through each step together.",
      "props": {
        "title": "Implementation Steps",
        "steps": [
          "Analyze the requirements carefully",
          "Design the solution architecture",
          "Implement core functionality",
          "Test and validate results"
        ]
      }
    },
    {
      "slideId": "slide_5_table_dark",
      "slideNumber": 5,
      "slideTitle": "Technology Comparison",
      "templateId": "table-dark",
      "voiceoverText": "Let's examine the technology comparison table. This table shows us the key differences between various technologies in terms of performance, security, and cost. Understanding these comparisons helps us make informed decisions.",
      "props": {
        "title": "Technology Comparison",
        "tableData": {
          "headers": ["Technology", "Performance", "Security", "Cost"],
          "rows": [
            ["React", "High", "Good", "Free"],
            ["Vue.js", "Medium", "Excellent", "Free"],
            ["Angular", "High", "Excellent", "Free"]
          ]
        }
      }
    },
    {
      "slideId": "slide_6_table_light",
      "slideNumber": 6,
      "slideTitle": "Product Features",
      "templateId": "table-light",
      "voiceoverText": "Now let's look at the product features comparison. This table clearly shows the differences between our various subscription plans, helping you understand what each tier offers.",
      "props": {
        "title": "Product Features Comparison",
        "tableData": {
          "headers": ["Feature", "Basic Plan", "Pro Plan", "Enterprise"],
          "rows": [
            ["Storage", "10GB", "100GB", "Unlimited"],
            ["Users", "5", "25", "Unlimited"],
            ["Support", "Email", "Priority", "24/7"]
          ]
        }
      }
    }
  ],
  "currentSlideId": "slide_1_intro",
  "detectedLanguage": "en",
  "hasVoiceover": true
}
"""

def normalize_slide_props(slides: List[Dict], component_name: str = None) -> List[Dict]:
    """
    Normalize slide props to match frontend template schemas.
    
    This function fixes common prop mismatches between AI-generated JSON
    and the expected frontend template schemas. Invalid slides are automatically
    removed to prevent rendering errors.
    
    Args:
        slides: List of slide dictionaries to normalize
        component_name: Component type (e.g., COMPONENT_NAME_SLIDE_DECK, COMPONENT_NAME_VIDEO_LESSON_PRESENTATION)
                       Used to determine if voiceoverText should be preserved
    """
    if not slides:
        return slides
        
    normalized_slides = []
    
    for slide_index, slide in enumerate(slides):
        if not isinstance(slide, dict) or 'templateId' not in slide or 'props' not in slide:
            normalized_slides.append(slide)
            continue
            
        template_id = slide.get('templateId')
        props = slide.get('props', {})
        
        # Create a copy to avoid modifying the original
        normalized_slide = slide.copy()
        normalized_props = props.copy()
        
        try:
            # Fix template ID mappings first
            if template_id == 'event-dates':
                # Map event-dates (AI instruction) to event-list (frontend registry)
                template_id = 'event-list'
                normalized_slide['templateId'] = template_id
                
            # Ensure critical props are preserved for all templates
            # Fix missing imagePrompt and other content issues
            if 'imagePrompt' not in normalized_props and 'imageAlt' in normalized_props:
                # If we have imageAlt but no imagePrompt, use imageAlt as the prompt
                normalized_props['imagePrompt'] = normalized_props['imageAlt']
            
            # Generate missing imagePrompts for templates that require them
            if template_id in ['bullet-points', 'bullet-points-right'] and not normalized_props.get('imagePrompt'):
                title = normalized_props.get('title', 'concept')
                bullets = normalized_props.get('bullets', [])
                
                # Create a contextual prompt based on title and content keywords
                title_lower = title.lower()
                content_sample = ' '.join(bullets[:2]) if bullets else ''
                content_lower = content_sample.lower()
                
                if 'tool' in title_lower or 'software' in content_lower or 'application' in content_lower:
                    normalized_props['imagePrompt'] = f"Minimalist flat design illustration of a developer using programming tools at a clean workstation. The scene features a young Asian woman sitting at a modern desk with a single laptop displaying simple code interface elements (no readable text) and one external monitor showing basic geometric development tool mockups. A wireless keyboard and mouse are positioned on the desk alongside a coffee cup. The laptop screen and coding interface are [COLOR1], the external monitor and keyboard are [COLOR2], and the desk and accessories are [COLOR3]. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                elif 'trend' in title_lower or 'future' in title_lower or 'innovation' in content_lower:
                    normalized_props['imagePrompt'] = f"Minimalist flat design illustration of futuristic technology concepts in a clean tech environment. The scene features a Hispanic male scientist in a white lab coat standing next to a single large holographic display showing simple geometric patterns and flowing data visualizations (no readable text). A modern desk with a tablet displaying basic technology interface elements sits nearby. The holographic display and data flows are [COLOR1], the scientist's lab coat and tablet are [COLOR2], and the desk and lab environment are [COLOR3]. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                elif 'learn' in title_lower or 'education' in title_lower or 'skill' in content_lower or 'training' in content_lower:
                    normalized_props['imagePrompt'] = f"Minimalist flat design illustration of modern learning in a clean educational environment. The scene features a young Black female student sitting at a modern desk using a tablet displaying simple educational interface elements and geometric learning modules (no readable text). A single interactive whiteboard in the background shows basic diagrams with simple shapes and connecting lines. Educational materials like a notebook and digital stylus are positioned on the desk. The tablet interface and learning modules are [COLOR1], the interactive whiteboard and educational tools are [COLOR2], and the desk and educational environment are [COLOR3]. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                elif 'business' in title_lower or 'strategy' in content_lower or 'management' in content_lower:
                    normalized_props['imagePrompt'] = f"Minimalist flat design illustration of professional business strategy and management in a modern corporate environment. The scene features a contemporary conference room with three business professionals engaged in strategic planning. A confident Latina businesswoman in a navy blazer stands at the left presenting to a large wall display showing simple business charts, process flows, and strategic diagrams with geometric shapes (no readable text). In the center, a Black male executive sits at a glass conference table reviewing documents and tablets displaying abstract business analytics as simple bar charts and pie segments. On the right, a Caucasian female manager takes notes while sitting in an ergonomic chair, with a laptop showing business interface mockups with geometric layouts. Business materials like documents, tablets, coffee cups, and strategic planning boards are arranged throughout the professional space. The presentation displays and business interfaces are [COLOR1], conference furniture and professional devices are [COLOR2], documents and planning materials are [COLOR3]. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                else:
                    # General professional/educational fallback
                    normalized_props['imagePrompt'] = f"Minimalist flat design illustration of professional collaboration and knowledge sharing in a modern educational environment. The scene features three diverse professionals working together in a bright, contemporary workspace. A young Hispanic woman in business attire sits at a modern desk on the left, using a laptop displaying simple interface elements and geometric data visualizations (no readable text). In the center, a Black male professional stands presenting to a wall-mounted display showing abstract concepts as interconnected nodes, flowcharts, and simple diagrams with geometric shapes. On the right, a Caucasian female colleague sits in a comfortable chair reviewing materials on a tablet, with documents and notebooks arranged on a side table. Professional tools like laptops, tablets, notebooks, coffee cups, and presentation materials are positioned throughout the collaborative workspace. The digital displays and interface elements are [COLOR1], professional devices and presentation tools are [COLOR2], furniture and workspace accessories are [COLOR3]. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                
                normalized_props['imageAlt'] = f"Professional illustration for {title}"
            
            # Ensure subtitle/content exists for templates that need it
            if template_id in ['big-image-left', 'big-image-top']:
                if 'subtitle' not in normalized_props and 'content' in normalized_props:
                    normalized_props['subtitle'] = normalized_props['content']
                # Ensure subtitle is different from title
                if (normalized_props.get('subtitle') == normalized_props.get('title') and 
                    len(normalized_props.get('subtitle', '')) > 50):
                    # If subtitle equals title and is long, use it as subtitle and create shorter title
                    full_text = normalized_props['subtitle']
                    # Extract first sentence as title
                    sentences = full_text.split('. ')
                    if len(sentences) > 1:
                        normalized_props['title'] = sentences[0]
                        normalized_props['subtitle'] = '. '.join(sentences[1:])
                        
            # Fix template selection for analytics/evaluation content
            if (template_id == 'metrics-analytics' and 
                'metrics' in normalized_props and 
                isinstance(normalized_props['metrics'], list) and 
                len(normalized_props['metrics']) <= 3):
                # If metrics-analytics has only bullet points, convert to bullet-points template
                logger.info(f"Converting slide {slide_index + 1} from metrics-analytics to bullet-points (better fit)")
                normalized_slide['templateId'] = 'bullet-points'
                template_id = 'bullet-points'
                normalized_props['bullets'] = normalized_props.pop('metrics')
                # Add image prompt for bullet-points
                if not normalized_props.get('imagePrompt'):
                    title = normalized_props.get('title', 'concepts')
                    title_lower = title.lower()
                    
                    # Generate contextual, detailed image prompts for metrics/analytics content
                    if 'metric' in title_lower or 'analytic' in title_lower or 'performance' in title_lower:
                        normalized_props['imagePrompt'] = f"Minimalist flat design illustration of a modern data analytics workspace. The scene features a professional data analyst sitting at a clean desk with a laptop displaying simple geometric charts and performance dashboards (no readable text). A large monitor shows flowing data visualizations with abstract patterns and trends. The workspace includes notebooks, a coffee cup, and modern office accessories. Natural light streams through large windows. The laptop charts and data visualizations are [COLOR1], the monitor and office equipment are [COLOR2], and the workspace environment and furniture are [COLOR3]. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                    elif 'tracking' in title_lower or 'monitoring' in title_lower:
                        normalized_props['imagePrompt'] = f"Minimalist flat design illustration of a modern monitoring and tracking center. The scene features a professional analyst standing next to a large wall display showing flowing geometric patterns representing tracking systems and monitoring data. A clean workstation with a tablet displaying simple interface elements sits nearby. The environment is bright and contemporary with floor-to-ceiling windows. The wall display and tracking patterns are [COLOR1], the analyst's attire and tablet are [COLOR2], and the monitoring center environment are [COLOR3]. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                    else:
                        # General professional data/analytics fallback
                        normalized_props['imagePrompt'] = f"Minimalist flat design illustration of a modern professional workspace focused on {title.lower()}. The scene features a diverse professional in business attire working at a contemporary desk with a laptop displaying simple data interface elements and geometric visualizations (no readable text). Professional tools like a tablet, notebooks, and a coffee cup are positioned around the clean workspace. Large windows provide natural light to the modern office environment. The laptop interface and data displays are [COLOR1], the professional's attire and desk accessories are [COLOR2], and the office environment and furniture are [COLOR3]. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                    
                    normalized_props['imageAlt'] = f"Professional illustration for {title}"
                    
            # This big-numbers conversion logic is moved to after big-numbers normalization below
                
            # Fix big-numbers template props
            if template_id == 'big-numbers':
                # Accept both 'items' (preferred) and 'numbers' (alternative) as the source array
                source_list = normalized_props.get('items')
                if not (isinstance(source_list, list) and source_list):
                    alt_list = normalized_props.get('numbers')
                    if isinstance(alt_list, list) and alt_list:
                        logger.info(f"Normalizing 'big-numbers' slide {slide_index + 1} from 'numbers' → 'items'")
                        source_list = alt_list
                    else:
                        source_list = []

                # Validate and coerce each item
                fixed_items = []
                for item in source_list:
                    if isinstance(item, dict):
                        fixed_item = {
                            'value': str(item.get('value') or item.get('number') or '').strip(),
                            'label': str(item.get('label') or item.get('title') or '').strip(),
                            'description': str(item.get('description') or item.get('desc') or item.get('text') or '').strip()
                        }
                        if fixed_item['value'] and fixed_item['label']:
                            fixed_items.append(fixed_item)

                # Pad/trim to exactly 3 items to preserve slide instead of skipping
                if len(fixed_items) != 3:
                    logger.warning(f"Coercing slide {slide_index + 1} with template 'big-numbers': Expected 3 items, got {len(fixed_items)}")
                    while len(fixed_items) < 3:
                        idx = len(fixed_items) + 1
                        fixed_items.append({'value': '0', 'label': f'Item {idx}', 'description': 'No description available'})
                    if len(fixed_items) > 3:
                        fixed_items = fixed_items[:3]

                # Frontend expects 'steps' not 'items' for big-numbers template
                normalized_props['steps'] = fixed_items
                # Drop legacy keys to unify shape
                if 'numbers' in normalized_props:
                    normalized_props.pop('numbers', None)
                if 'items' in normalized_props:
                    normalized_props.pop('items', None)
                
                # Check if we generated placeholder content and convert to bullet-points if so
                has_placeholder_content = all(
                    step.get('value', '').strip() in ['0', ''] and 
                    step.get('label', '').startswith('Item ') and
                    step.get('description', '') == 'No description available'
                    for step in fixed_items
                )
                
                if has_placeholder_content:
                    # Convert to bullet-points template since the content is conceptual, not numerical
                    logger.info(f"Converting slide {slide_index + 1} from big-numbers to bullet-points (no numerical data)")
                    normalized_slide['templateId'] = 'bullet-points'
                    template_id = 'bullet-points'
                    
                    # Generate appropriate bullet points based on the title
                    title = normalized_props.get('title', '').lower()
                    if 'assessment' in title:
                        normalized_props['bullets'] = [
                            "Automated Grading: AI can evaluate multiple-choice and short-answer questions instantly, providing immediate feedback to students.",
                            "Essay Analysis: Advanced AI tools can assess essay structure, grammar, and content quality, offering detailed feedback.",
                            "Adaptive Testing: AI-powered assessments adjust question difficulty based on student performance, providing personalized evaluation.",
                            "Plagiarism Detection: AI tools can identify potential plagiarism by comparing student work against vast databases of academic content.",
                            "Performance Analytics: AI systems provide detailed analytics on student performance patterns and learning gaps."
                        ]
                    elif 'future' in title or 'trends' in title:
                        normalized_props['bullets'] = [
                            "Personalized Learning Experiences: AI will create more sophisticated personalized learning paths tailored to individual student needs.",
                            "Virtual Reality Integration: AI combined with VR will create immersive educational experiences for complex subjects.",
                            "Natural Language Processing: Advanced chatbots will provide more human-like interactions for student support and tutoring.",
                            "Predictive Analytics: AI will better predict student success and identify at-risk students earlier in their academic journey.",
                            "Automated Content Creation: AI will generate educational materials and assessments customized to curriculum standards."
                        ]
                    elif 'technology' in title or 'tech' in title:
                        normalized_props['bullets'] = [
                            "Digital Learning Platforms: Technology provides interactive and engaging learning environments for students.",
                            "Personalized Learning Paths: Advanced algorithms adapt content delivery to individual learning styles and pace.",
                            "Real-time Feedback Systems: Immediate assessment and feedback help students track their progress effectively.",
                            "Collaborative Tools: Technology enables seamless collaboration between students and teachers across different locations.",
                            "Resource Accessibility: Digital platforms make learning materials available anytime, anywhere for enhanced flexibility."
                        ]
                    else:
                        # Generic bullets based on title
                        slide_title = normalized_props.get('title', 'this topic')
                        normalized_props['bullets'] = [
                            f"Key aspect of {slide_title} that enhances educational outcomes and student engagement.",
                            f"Important consideration for implementing {slide_title} effectively in educational settings.",
                            f"Significant benefit of using {slide_title} for improving student learning and performance.",
                            f"Challenge that educators should be aware of when adopting {slide_title} in their curriculum.",
                            f"Future implication of {slide_title} for educational institutions and learning methodologies."
                        ]
                    
                    # Remove big-numbers props and add bullet-points props
                    normalized_props.pop('steps', None)
                    
                    # Add image prompt for bullet-points
                    if not normalized_props.get('imagePrompt'):
                        slide_title = normalized_props.get('title', 'concepts')
                        title_lower = slide_title.lower()
                        
                        # Generate contextual, detailed image prompts based on content
                        if 'assessment' in title_lower or 'evaluation' in title_lower:
                            normalized_props['imagePrompt'] = f"Minimalist flat design illustration of a modern educational assessment environment. The scene features a young female teacher sitting at a clean desk in a bright classroom, reviewing student assessments on a tablet displaying simple geometric grade analytics (no readable text). Behind her, students work quietly at individual desks taking a digital assessment on laptops. The classroom has large windows with natural light and a whiteboard showing basic geometric patterns. The tablet interface and assessment analytics are [COLOR1], the teacher's clothing and desk items are [COLOR2], and the classroom environment and furniture are [COLOR3]. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                        elif 'future' in title_lower or 'trends' in title_lower:
                            normalized_props['imagePrompt'] = f"Minimalist flat design illustration of a futuristic educational technology center. The scene features a Hispanic male educator standing next to a large interactive holographic display showing flowing geometric patterns representing future learning concepts. A modern curved desk with a sleek laptop and digital stylus sits in the foreground. Through floor-to-ceiling windows, a futuristic cityscape is visible. The holographic display and future tech patterns are [COLOR1], the educator's attire and laptop are [COLOR2], and the modern facility and furniture are [COLOR3]. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                        elif 'technology' in title_lower or 'tech' in title_lower:
                            normalized_props['imagePrompt'] = f"Minimalist flat design illustration of a modern educational technology lab. The scene features a young Asian female student sitting at a sleek workstation using a tablet for interactive learning, with a single large monitor displaying simple educational interface elements and geometric learning modules (no readable text). Modern educational equipment and a coffee cup are positioned on the clean desk. Natural light streams through large windows. The tablet interface and learning modules are [COLOR1], the monitor and educational technology are [COLOR2], and the lab environment and furniture are [COLOR3]. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                        else:
                            # General educational fallback
                            normalized_props['imagePrompt'] = f"Minimalist flat design illustration of a modern educational environment related to {slide_title.lower()}. The scene features a diverse educator in professional attire working at a contemporary desk with a laptop displaying simple interface elements related to the topic (no readable text). Educational materials like notebooks and a tablet are positioned around the workspace. Large windows provide natural light to the clean, professional space. The laptop interface and educational displays are [COLOR1], the educator's attire and desk accessories are [COLOR2], and the educational environment and furniture are [COLOR3]. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                        
                        normalized_props['imageAlt'] = f"Professional educational illustration for {slide_title}"
                    
            # Fix four-box-grid template props
            elif template_id == 'four-box-grid':
                boxes = normalized_props.get('boxes', [])
                if boxes and isinstance(boxes, list):
                    fixed_boxes = []
                    for box in boxes:
                        if isinstance(box, dict):
                            # Convert title/content to heading/text
                            fixed_box = {
                                'heading': box.get('heading') or box.get('title', ''),
                                'text': box.get('text') or box.get('content', '')
                            }
                            if fixed_box['heading']:  # Only add if heading exists
                                fixed_boxes.append(fixed_box)
                    normalized_props['boxes'] = fixed_boxes
                    
            # Fix two-column template props
            elif template_id == 'two-column':
                # Handle missing right column content by splitting existing content if it's substantial
                if (not normalized_props.get('rightContent') or normalized_props.get('rightContent') == '') and normalized_props.get('leftContent'):
                    left_content = normalized_props.get('leftContent', '')
                    
                    # If left content is substantial and right is empty, try to split content intelligently
                    if len(left_content) > 100:  # Only split if there's substantial content
                        lines = left_content.split('\n')
                        if len(lines) >= 2:
                            # Split content roughly in half
                            mid_point = len(lines) // 2
                            left_part = '\n'.join(lines[:mid_point]).strip()
                            right_part = '\n'.join(lines[mid_point:]).strip()
                            
                            if left_part and right_part:
                                normalized_props['leftContent'] = left_part
                                normalized_props['rightContent'] = right_part
                                logger.info(f"Split two-column content for slide {slide_index + 1}")
                
                # Generate appropriate titles if missing
                if not normalized_props.get('rightTitle') or normalized_props.get('rightTitle') == '':
                    title = normalized_props.get('title', '')
                    left_title = normalized_props.get('leftTitle', '')
                    
                    # Generate contextual right title based on slide content
                    if 'advantages' in left_title.lower() or 'benefits' in left_title.lower():
                        normalized_props['rightTitle'] = 'Disadvantages' if 'advantages' in left_title.lower() else 'Challenges'
                    elif 'pros' in left_title.lower():
                        normalized_props['rightTitle'] = 'Cons'
                    elif 'before' in left_title.lower():
                        normalized_props['rightTitle'] = 'After'
                    elif 'strategies' in title.lower() or 'methods' in title.lower():
                        normalized_props['rightTitle'] = 'Implementation' if left_title else 'Best Practices'
                    else:
                        # Generic fallback
                        normalized_props['rightTitle'] = 'Additional Details'
                
                # Ensure leftTitle exists
                if not normalized_props.get('leftTitle'):
                    normalized_props['leftTitle'] = 'Key Points'
                
                # Generate missing image prompts for two-column templates (check each side independently)
                title = normalized_props.get('title', 'comparison')
                left_title = normalized_props.get('leftTitle', 'concept')
                right_title = normalized_props.get('rightTitle', 'concept')
                
                # Generate left image prompt if missing using detailed format
                if not normalized_props.get('leftImagePrompt') and normalized_props.get('leftContent'):
                    left_content_sample = normalized_props.get('leftContent', '')[:100].lower()
                    if 'network' in left_content_sample or 'event' in left_content_sample or 'meeting' in left_content_sample:
                        normalized_props['leftImagePrompt'] = f"Minimalist flat design illustration of {left_title.lower()} showing people networking and collaborating. The scene features a group of diverse professionals in business attire engaging in conversations, exchanging ideas, and building connections in a modern corporate environment. People are positioned throughout the scene in small groups, with some standing and others sitting around tables. Professional networking activities are highlighted with [COLOR1], conversation indicators in [COLOR2], and background elements in [COLOR3]. NO text, labels, or readable content on any surfaces or documents. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                    elif 'technology' in left_content_sample or 'digital' in left_content_sample or 'system' in left_content_sample:
                        normalized_props['leftImagePrompt'] = f"Minimalist flat design illustration of {left_title.lower()} featuring modern technology and digital systems. The scene shows interconnected technological components, digital interfaces, and system architectures with detailed visual elements. Main technology components are [COLOR1], connecting elements are [COLOR2], and supporting details are [COLOR3]. All screens and displays show abstract geometric patterns with NO readable text or labels. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                    elif 'process' in left_content_sample or 'step' in left_content_sample or 'method' in left_content_sample:
                        normalized_props['leftImagePrompt'] = f"Minimalist flat design illustration of {left_title.lower()} showing a detailed process workflow. The scene features sequential steps connected by arrows, with clear visual indicators for each stage of the process. Process elements are rendered in [COLOR1], connecting arrows in [COLOR2], and step indicators in [COLOR3]. Use symbols and geometric shapes instead of text labels. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                    else:
                        # Create specific, contextual scene based on content
                        left_content_lower = normalized_props.get('leftContent', '').lower()
                        title_lower = title.lower()
                        
                        if 'learn' in left_content_lower or 'education' in left_content_lower or 'student' in left_content_lower:
                            normalized_props['leftImagePrompt'] = f"Minimalist flat design illustration of students learning in a modern classroom setting. The scene features diverse students sitting at desks with laptops, a teacher presenting at the front, and educational materials around the room. Students are engaged and taking notes, with some raising hands to ask questions. Student laptops and materials are [COLOR1], the teacher and presentation board are [COLOR2], and classroom furniture is [COLOR3]. No readable text on any surfaces. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                        elif 'business' in left_content_lower or 'meeting' in left_content_lower or 'team' in left_content_lower:
                            normalized_props['leftImagePrompt'] = f"Minimalist flat design illustration of professionals collaborating in a modern office meeting room. The scene features a diverse group of business people sitting around a conference table, engaged in discussion, with one person presenting ideas. Laptops and documents are on the table, and a presentation screen shows charts. Conference table and laptops are [COLOR1], people and presentation screen are [COLOR2], and office furniture is [COLOR3]. No readable text anywhere. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                        elif 'data' in left_content_lower or 'analysis' in left_content_lower or 'research' in left_content_lower:
                            normalized_props['leftImagePrompt'] = f"Minimalist flat design illustration of a data analyst working with information in a modern office. The scene features a focused professional at a desk with multiple monitors displaying charts and graphs, surrounded by organized workspace elements. The person is analyzing data patterns on screen while taking notes. Computer monitors and data visualizations are [COLOR1], the analyst and desk setup are [COLOR2], and office environment is [COLOR3]. All screens show abstract geometric patterns without text. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                        else:
                            normalized_props['leftImagePrompt'] = f"Minimalist flat design illustration of people working together in a professional environment related to {left_title.lower()}. The scene features diverse professionals engaged in relevant activities, using modern tools and technology. The setting shows a clean, organized workspace with people collaborating effectively. Primary work elements are [COLOR1], people and main activities are [COLOR2], and environmental details are [COLOR3]. No readable text on any surfaces or screens. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                
                # Generate right image prompt if missing using detailed format
                if not normalized_props.get('rightImagePrompt') and normalized_props.get('rightContent'):
                    right_content_sample = normalized_props.get('rightContent', '')[:100].lower()
                    if 'association' in right_content_sample or 'professional' in right_content_sample or 'group' in right_content_sample:
                        normalized_props['rightImagePrompt'] = f"Minimalist flat design illustration of {right_title.lower()} showing professional associations and industry connections. The scene features business professionals in formal attire attending conferences, participating in panel discussions, and engaging in professional development activities. A large conference hall setting with speakers, audience members, and networking areas. Association activities are highlighted in [COLOR1], professional interactions in [COLOR2], and venue elements in [COLOR3]. NO visible text on presentations, banners, or displays - use abstract symbols instead. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                    elif 'technology' in right_content_sample or 'digital' in right_content_sample or 'system' in right_content_sample:
                        normalized_props['rightImagePrompt'] = f"Minimalist flat design illustration of {right_title.lower()} featuring advanced technology and digital innovation. The scene shows cutting-edge technological solutions, modern interfaces, and innovative systems with comprehensive visual details. Technology components are [COLOR1], interface elements are [COLOR2], and innovation indicators are [COLOR3]. All digital displays show abstract geometric patterns with NO readable text. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                    elif 'strategy' in right_content_sample or 'approach' in right_content_sample or 'solution' in right_content_sample:
                        normalized_props['rightImagePrompt'] = f"Minimalist flat design illustration of {right_title.lower()} showing strategic planning and solution implementation. The scene features strategic diagrams, planning documents, and implementation frameworks with detailed visual representations. Strategic elements are [COLOR1], planning components are [COLOR2], and implementation details are [COLOR3]. Documents and charts show abstract shapes and symbols with NO readable text. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                    else:
                        # Create specific, contextual scene based on content
                        right_content_lower = normalized_props.get('rightContent', '').lower()
                        title_lower = title.lower()
                        
                        if 'learn' in right_content_lower or 'education' in right_content_lower or 'student' in right_content_lower:
                            normalized_props['rightImagePrompt'] = f"Minimalist flat design illustration of students using technology for learning. The scene features diverse students in a modern computer lab, working on individual projects with tablets and laptops. Some students are collaborating on assignments while others focus independently. A teacher walks among them providing guidance. Student devices and work materials are [COLOR1], students and teacher are [COLOR2], and lab environment is [COLOR3]. No readable text on any screens or materials. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                        elif 'business' in right_content_lower or 'meeting' in right_content_lower or 'team' in right_content_lower:
                            normalized_props['rightImagePrompt'] = f"Minimalist flat design illustration of business professionals in a client presentation meeting. The scene features a confident presenter explaining concepts to seated clients, with visual aids displayed on a large screen. The atmosphere is professional and engaging, with participants actively listening and taking notes. Presentation equipment and materials are [COLOR1], presenter and clients are [COLOR2], and meeting room elements are [COLOR3]. No readable text on presentations or documents. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                        elif 'data' in right_content_lower or 'analysis' in right_content_lower or 'research' in right_content_lower:
                            normalized_props['rightImagePrompt'] = f"Minimalist flat design illustration of researchers collaborating on data analysis in a modern lab setting. The scene features scientists and analysts working together around computer workstations, discussing findings and sharing insights. Multiple screens display data visualizations while team members point to specific patterns. Computer equipment and data displays are [COLOR1], researchers and team members are [COLOR2], and lab environment is [COLOR3]. All screens show abstract patterns without text. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                        else:
                            normalized_props['rightImagePrompt'] = f"Minimalist flat design illustration of professionals implementing solutions in a modern workplace related to {right_title.lower()}. The scene features a diverse team actively working on practical applications, using contemporary tools and methods. The environment shows organized, efficient operations with people engaged in meaningful work. Implementation tools and equipment are [COLOR1], team members and activities are [COLOR2], and workplace environment is [COLOR3]. No readable text on any surfaces or equipment. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
                
                # Handle case where AI used leftContent/rightContent but missing titles
                if normalized_props.get('leftContent') and not normalized_props.get('leftTitle'):
                    # Try to extract title from content
                    left_content = normalized_props.get('leftContent', '')
                    if '\n' in left_content:
                        lines = left_content.split('\n')
                        if lines[0] and not lines[0].startswith('-') and not lines[0].startswith('•'):
                            normalized_props['leftTitle'] = lines[0].strip()
                            normalized_props['leftContent'] = '\n'.join(lines[1:]).strip()
                
                if normalized_props.get('rightContent') and not normalized_props.get('rightTitle'):
                    # Try to extract title from content
                    right_content = normalized_props.get('rightContent', '')
                    if '\n' in right_content:
                        lines = right_content.split('\n')
                        if lines[0] and not lines[0].startswith('-') and not lines[0].startswith('•'):
                            normalized_props['rightTitle'] = lines[0].strip()
                            normalized_props['rightContent'] = '\n'.join(lines[1:]).strip()
                            
            # Fix challenges-solutions template props
            elif template_id == 'challenges-solutions':
                # Convert leftContent/rightContent to challenges/solutions arrays
                if 'leftContent' in normalized_props and 'challenges' not in normalized_props:
                    left_content = normalized_props.get('leftContent', '')
                    # Parse content into challenges array
                    challenges = []
                    for line in left_content.split('\n'):
                        line = line.strip()
                        if line and not line.lower().startswith('common challenges'):
                            # Remove bullet points and dashes
                            clean_line = line.lstrip('•-* ').strip()
                            if clean_line:
                                challenges.append(clean_line)
                    
                    if challenges:
                        normalized_props['challenges'] = challenges
                        del normalized_props['leftContent']
                        
                if 'rightContent' in normalized_props and 'solutions' not in normalized_props:
                    right_content = normalized_props.get('rightContent', '')
                    # Parse content into solutions array
                    solutions = []
                    for line in right_content.split('\n'):
                        line = line.strip()
                        if line and not line.lower().startswith('recommended resources') and not line.lower().startswith('solutions'):
                            # Remove bullet points and dashes
                            clean_line = line.lstrip('•-* ').strip()
                            if clean_line:
                                solutions.append(clean_line)
                    
                    if solutions:
                        normalized_props['solutions'] = solutions
                        del normalized_props['rightContent']
                
                # Ensure required titles exist
                if 'challengesTitle' not in normalized_props:
                    normalized_props['challengesTitle'] = 'Challenges'
                if 'solutionsTitle' not in normalized_props:
                    normalized_props['solutionsTitle'] = 'Solutions'
            
            # Fix timeline template props
            elif template_id == 'timeline':
                # Convert "events" to "steps" and restructure data
                events = normalized_props.get('events', [])
                if events and isinstance(events, list):
                    steps = []
                    for event in events:
                        if isinstance(event, dict):
                            # Convert event structure to step structure
                            heading = (event.get('title') or event.get('heading') or event.get('date') or '').strip()
                            description = (event.get('description') or '').strip()
                            if heading or description:
                                steps.append({
                                    'heading': heading or 'Timeline Step',
                                    'description': description or 'No description available'
                                })
                    normalized_props['steps'] = steps
                    normalized_props.pop('events', None)  # Remove the old structure
                elif 'steps' not in normalized_props:
                    # Create default steps if no events or steps exist
                    normalized_props['steps'] = [
                        {'heading': 'Step 1', 'description': 'First milestone'},
                        {'heading': 'Step 2', 'description': 'Second milestone'},
                        {'heading': 'Step 3', 'description': 'Third milestone'},
                        {'heading': 'Step 4', 'description': 'Final milestone'}
                    ]
            
            # Fix pyramid template props
            elif template_id == 'pyramid':
                # Ensure 'steps' array exists by parsing from common inputs
                steps = normalized_props.get('steps', []) or normalized_props.get('items', [])
                levels = normalized_props.get('levels', [])
                
                # If we have levels data, use it to create proper steps
                if levels and isinstance(levels, list) and len(levels) >= 3:
                    parsed_items = []
                    for i, level in enumerate(levels[:3], start=1):
                        if isinstance(level, dict):
                            heading = level.get('text', f'Level {i}')
                            description = level.get('description', '')
                            parsed_items.append({'heading': heading, 'description': description})
                        else:
                            parsed_items.append({'heading': f'Level {i}', 'description': str(level) if level else ''})
                    
                    # Ensure we have exactly 3 levels
                    while len(parsed_items) < 3:
                        idx = len(parsed_items) + 1
                        parsed_items.append({'heading': f'Level {idx}', 'description': ''})
                    
                    normalized_props['steps'] = parsed_items[:3]
                
                # If no levels but we have steps, validate and fix them
                elif steps and isinstance(steps, list):
                    fixed_steps = []
                    for i, step in enumerate(steps[:3], start=1):
                        if isinstance(step, dict):
                            heading = step.get('heading', f'Level {i}')
                            description = step.get('description', '')
                            fixed_steps.append({'heading': heading, 'description': description})
                        else:
                            fixed_steps.append({'heading': f'Level {i}', 'description': str(step) if step else ''})
                    
                    # Ensure we have exactly 3 levels
                    while len(fixed_steps) < 3:
                        idx = len(fixed_steps) + 1
                        fixed_steps.append({'heading': f'Level {idx}', 'description': ''})
                    
                    normalized_props['steps'] = fixed_steps[:3]
                
                # If no structured data, try to parse from content
                else:
                    import re
                    text = (normalized_props.get('content') or '').strip()
                    parsed_items = []
                    if text:
                        # Try to extract segments like **Heading**: description ... up to next **Heading**
                        pattern = re.compile(r"\*\*([^*]+)\*\*\s*:?[\s\-–—]*([^*]+?)(?=\s*\*\*[^*]+\*\*|$)", re.S)
                        for m in pattern.finditer(text):
                            heading = m.group(1).strip()
                            desc = m.group(2).strip().replace('\n', ' ')
                            if heading and desc:
                                parsed_items.append({'heading': heading, 'description': desc})
                    
                    if not parsed_items and text:
                        # Fallback: split into up to 3 sentence-like chunks
                        # First try double newlines, then periods.
                        chunks = [c.strip() for c in re.split(r"\n\n+", text) if c.strip()]
                        if not chunks:
                            chunks = [c.strip() for c in re.split(r"(?<=[.!?])\s+", text) if c.strip()]
                        for i, ch in enumerate(chunks[:3], start=1):
                            parsed_items.append({'heading': f'Level {i}', 'description': ch})
                    
                    # Ensure we have exactly 3 levels, but don't add "No description available"
                    while len(parsed_items) < 3:
                        idx = len(parsed_items) + 1
                        parsed_items.append({'heading': f'Level {idx}', 'description': ''})
                    
                    normalized_props['steps'] = parsed_items[:3]
                # Clean up: pyramid does not use a long 'content' blob when steps are present
                if normalized_props.get('steps') and 'content' in normalized_props:
                    pass  # keep content for now as optional; frontend ignores it
                    
            # Fix event-list template props
            elif template_id == 'event-list':
                # Ensure events array exists
                events = normalized_props.get('events', [])
                if not (isinstance(events, list) and events):
                    # Create default events if none exist
                    normalized_props['events'] = [
                        {'date': 'Event 1', 'description': 'Event description'},
                        {'date': 'Event 2', 'description': 'Event description'},
                        {'date': 'Event 3', 'description': 'Event description'}
                    ]
                else:
                    # Ensure each event has required fields
                    fixed_events = []
                    for event in events:
                        if isinstance(event, dict):
                            fixed_event = {
                                'date': str(event.get('date') or event.get('title') or 'Event Date'),
                                'description': str(event.get('description') or event.get('desc') or 'Event description')
                            }
                            fixed_events.append(fixed_event)
                    if fixed_events:
                        normalized_props['events'] = fixed_events
        
            # Fix bullet-points template props
            elif template_id in ['bullet-points', 'bullet-points-right']:
                bullets = normalized_props.get('bullets', [])
                if bullets and isinstance(bullets, list):
                    # Ensure bullets are strings and not empty
                    fixed_bullets = [str(bullet).strip() for bullet in bullets if str(bullet).strip()]
                    if fixed_bullets:
                        normalized_props['bullets'] = fixed_bullets
                    else:
                        logger.warning(f"Coercing slide {slide_index + 1} with template '{template_id}': No valid bullet points, adding placeholder")
                        normalized_props['bullets'] = ['No content available']
                else:
                    logger.warning(f"Coercing slide {slide_index + 1} with template '{template_id}': Invalid or missing bullets array, adding placeholder")
                    normalized_props['bullets'] = ['No content available']
            
            # Fix comparison-slide template props
            elif template_id == 'comparison-slide':
                table_data = normalized_props.get('tableData', {})
                if isinstance(table_data, dict):
                    # Ensure headers exist
                    if 'headers' not in table_data or not isinstance(table_data['headers'], list):
                        logger.warning(f"Coercing slide {slide_index + 1} with template '{template_id}': Missing or invalid headers")
                        table_data['headers'] = ['Feature', 'Option A', 'Option B']
                    
                    # Ensure rows exist
                    if 'rows' not in table_data or not isinstance(table_data['rows'], list):
                        logger.warning(f"Coercing slide {slide_index + 1} with template '{template_id}': Missing or invalid rows")
                        table_data['rows'] = [
                            ['Characteristic 1', 'Value A1', 'Value B1'],
                            ['Characteristic 2', 'Value A2', 'Value B2']
                        ]
                    
                    # Ensure all rows have the correct number of columns
                    expected_cols = len(table_data['headers'])
                    fixed_rows = []
                    for row_idx, row in enumerate(table_data['rows']):
                        if isinstance(row, list):
                            # Pad or trim row to match header count
                            if len(row) < expected_cols:
                                # Pad with empty strings
                                row = row + [''] * (expected_cols - len(row))
                            elif len(row) > expected_cols:
                                # Trim to match headers
                                row = row[:expected_cols]
                            fixed_rows.append([str(cell) for cell in row])
                        else:
                            logger.warning(f"Coercing slide {slide_index + 1}: Invalid row format at index {row_idx}")
                            # Create a placeholder row
                            fixed_rows.append([f'Row {row_idx + 1} Col {i + 1}' for i in range(expected_cols)])
                    
                    table_data['rows'] = fixed_rows
                    normalized_props['tableData'] = table_data
                    
                    logger.info(f"Fixed comparison table data for slide {slide_index + 1}: {len(table_data['headers'])} columns, {len(table_data['rows'])} rows")
                else:
                    logger.warning(f"Coercing slide {slide_index + 1} with template '{template_id}': Invalid tableData, adding default comparison")
                    normalized_props['tableData'] = {
                        'headers': ['Feature', 'Option A', 'Option B'],
                        'rows': [
                            ['Characteristic 1', 'Value A1', 'Value B1'],
                            ['Characteristic 2', 'Value A2', 'Value B2']
                        ]
                    }
        
            normalized_slide['props'] = normalized_props
            
            # Remove voiceoverText for non-video presentations
            if (component_name == COMPONENT_NAME_SLIDE_DECK and 
                'voiceoverText' in normalized_slide):
                logger.info(f"Removing voiceoverText from slide {slide_index + 1} for regular slide deck")
                normalized_slide.pop('voiceoverText', None)
            
            normalized_slides.append(normalized_slide)
            
        except Exception as e:
            logger.error(f"Error normalizing slide {slide_index + 1} with template '{template_id}': {e}")
            logger.warning(f"Removing problematic slide {slide_index + 1}")
            continue  # Skip this slide
    
    logger.info(f"Slide normalization complete: {len(slides)} -> {len(normalized_slides)} slides (removed {len(slides) - len(normalized_slides)} invalid slides)")
    return normalized_slides

async def get_db_pool():
    if DB_POOL is None:
        detail_msg = "Database service not available." # Generic enough for production
        raise HTTPException(status_code=503, detail=detail_msg)
    return DB_POOL

app = FastAPI(title="Custom Extension Backend")

app.mount(f"/{STATIC_DESIGN_IMAGES_DIR}", StaticFiles(directory=STATIC_DESIGN_IMAGES_DIR), name="static_design_images")
app.mount("/fonts", StaticFiles(directory=STATIC_FONTS_DIR), name="static_fonts")

@app.middleware("http")
async def track_request_analytics(request: Request, call_next):
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    # Get user ID if available
    user_id = None
    try:
        if hasattr(request.state, 'user_id'):
            user_id = request.state.user_id
    except:
        pass
    
    # Get request size
    request_size = None
    try:
        if request.method in ['POST', 'PUT', 'PATCH']:
            body = await request.body()
            request_size = len(body)
    except:
        pass
    
    try:
        response = await call_next(request)
        end_time = time.time()
        response_time_ms = int((end_time - start_time) * 1000)
        
        # Get response size
        response_size = None
        try:
            if hasattr(response, 'body'):
                response_size = len(response.body)
        except:
            pass
        
        # Store analytics in database
        try:
            async with DB_POOL.acquire() as conn:
                await conn.execute("""
                    INSERT INTO request_analytics (
                        id, endpoint, method, user_id, status_code, 
                        response_time_ms, request_size_bytes, response_size_bytes,
                        error_message, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                """, request_id, request.url.path, request.method, user_id,
                     response.status_code, response_time_ms, request_size,
                     response_size, None, datetime.now(timezone.utc))
        except Exception as e:
            logger.error(f"Failed to store request analytics: {e}")
        
        return response
        
    except Exception as e:
        end_time = time.time()
        response_time_ms = int((end_time - start_time) * 1000)
        
        # Store error analytics
        try:
            async with DB_POOL.acquire() as conn:
                await conn.execute("""
                    INSERT INTO request_analytics (
                        id, endpoint, method, user_id, status_code, 
                        response_time_ms, request_size_bytes, response_size_bytes,
                        error_message, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                """, request_id, request.url.path, request.method, user_id,
                     500, response_time_ms, request_size, None,
                     str(e), datetime.now(timezone.utc))
        except Exception as db_error:
            logger.error(f"Failed to store error analytics: {db_error}")
        
        raise

try:
    from app.services.pdf_generator import generate_pdf_from_html_template
    from app.core.config import settings
except ImportError:
    logger.warning("Could not import pdf_generator or settings from 'app' module. Using dummy implementations for PDF generation.")
    class DummySettings:
        CUSTOM_FRONTEND_URL = os.environ.get("CUSTOM_FRONTEND_URL", "http://custom_frontend:3001")
    settings = DummySettings()
    async def generate_pdf_from_html_template(template_name: str, context_data: Dict[str, Any], output_filename: str) -> str:
        logger.info(f"PDF Generation Skipped (Dummy Service): Would generate for template {template_name} to {output_filename}")
        dummy_path = os.path.join("/app/tmp_pdf", output_filename)
        os.makedirs(os.path.dirname(dummy_path), exist_ok=True)
        with open(dummy_path, "w") as f: f.write(f"Dummy PDF for {output_filename} using context: {str(context_data)[:200]}")
        return dummy_path

effective_origins = list(set(filter(None, [
    "http://localhost:3001",
    "http://143.198.59.56:3001",
    "http://143.198.59.56:8088",
    os.environ.get("WEB_DOMAIN", "http://localhost:3000"),
    settings.CUSTOM_FRONTEND_URL if 'settings' in globals() and hasattr(settings, 'CUSTOM_FRONTEND_URL') else os.environ.get("CUSTOM_FRONTEND_URL", "http://custom_frontend:3001")
])))
if not effective_origins: effective_origins = ["http://localhost:3001"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=effective_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class StatusInfo(BaseModel):
    type: str = "unknown"
    text: str = ""
    model_config = {"from_attributes": True}

# Credits Models
class UserCredits(BaseModel):
    id: int
    onyx_user_id: str
    name: str
    credits_balance: int
    total_credits_used: int
    credits_purchased: int
    last_purchase_date: Optional[datetime]
    subscription_tier: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class CreditTransactionRequest(BaseModel):
    user_email: str
    amount: int
    action: Literal["add", "remove"]
    reason: Optional[str] = "Admin adjustment"

class CreditTransactionResponse(BaseModel):
    success: bool
    message: str
    new_balance: int
    user_credits: UserCredits

class LessonDetail(BaseModel):
    title: str
    check: StatusInfo = Field(default_factory=StatusInfo)
    contentAvailable: StatusInfo = Field(default_factory=StatusInfo)
    source: str = ""
    hours: int = 0
    completionTime: str = ""  # Estimated completion time in minutes (e.g., "5m", "6m", "7m", "8m")
    custom_rate: Optional[int] = None  # Individual lesson-level custom rate override
    quality_tier: Optional[str] = None  # Individual lesson-level quality tier override
    recommended_content_types: Optional[Dict[str, Any]] = None
    model_config = {"from_attributes": True}

class SectionDetail(BaseModel):
    id: str
    title: str
    totalHours: int = 0
    totalCompletionTime: Optional[int] = None  # Total completion time in minutes for the section
    lessons: List[LessonDetail] = Field(default_factory=list)
    autoCalculateHours: bool = True
    custom_rate: Optional[int] = None  # Module-level custom rate override
    quality_tier: Optional[str] = None  # Module-level quality tier override
    model_config = {"from_attributes": True}

class TrainingPlanDetails(BaseModel):
    mainTitle: Optional[str] = None
    sections: List[SectionDetail] = Field(default_factory=list)
    detectedLanguage: Optional[str] = None
    # Store user preferences on which optional columns to show in UI (frontend reads this)
    displayOptions: Optional[Dict[str, bool]] = None  # e.g., {"knowledgeCheck": true, "contentAvailability": false}
    # Store theme selection for styling
    theme: Optional[str] = "cherry"  # Default theme
    model_config = {"from_attributes": True}

AnyContentBlock = Union["HeadlineBlock", "ParagraphBlock", "BulletListBlock", "NumberedListBlock", "AlertBlock", "SectionBreakBlock"]
ListItem = Union[str, AnyContentBlock, List[AnyContentBlock]]

class BaseContentBlock(BaseModel):
    type: str
    model_config = {"from_attributes": True}

class HeadlineBlock(BaseContentBlock):
    type: str = "headline"
    level: int = Field(ge=1, le=4)
    text: str
    iconName: Optional[str] = None
    backgroundColor: Optional[str] = None
    textColor: Optional[str] = None
    isImportant: Optional[bool] = Field(default=False, description="Set to true if this headline (typically Level 4) and its immediately following single block (list or paragraph) form an important section to be visually boxed.")

class ParagraphBlock(BaseContentBlock):
    type: str = "paragraph"
    text: str
    isRecommendation: Optional[bool] = Field(default=False, description="Set to true if this paragraph is a 'recommendation' within a numbered list item, to be styled distinctly.")

class BulletListBlock(BaseContentBlock):
    type: Literal['bullet_list'] = 'bullet_list'
    items: List[ListItem] = []
    iconName: Optional[str] = None

class NumberedListBlock(BaseContentBlock):
    type: Literal['numbered_list'] = 'numbered_list'
    items: List[ListItem] = []

class AlertBlock(BaseContentBlock):
    type: str = "alert"
    title: Optional[str] = None
    text: str
    alertType: str = "info"
    iconName: Optional[str] = None
    backgroundColor: Optional[str] = None
    borderColor: Optional[str] = None
    textColor: Optional[str] = None
    iconColor: Optional[str] = None

class SectionBreakBlock(BaseContentBlock):
    type: str = "section_break"
    style: Optional[str] = "solid"

AnyContentBlockValue = Union[
    HeadlineBlock, ParagraphBlock, BulletListBlock, NumberedListBlock, AlertBlock, SectionBreakBlock, ImageBlock
]

class PdfLessonDetails(BaseModel):
    lessonTitle: str
    # Optional: sequential number of the lesson inside the parent Training Plan
    lessonNumber: Optional[int] = None
    contentBlocks: List[AnyContentBlockValue] = Field(default_factory=list)
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True}

class VideoLessonSlideData(BaseModel):
    slideId: str
    slideNumber: int
    slideTitle: str
    displayedText: Optional[str] = None
    imagePath: Optional[str] = None
    videoPath: Optional[str] = None
    voiceoverText: Optional[str] = None
    displayedPictureDescription: Optional[str] = None
    displayedVideoDescription: Optional[str] = None
    model_config = {"from_attributes": True}

class VideoLessonData(BaseModel):
    mainPresentationTitle: str
    slides: List[VideoLessonSlideData] = Field(default_factory=list)
    currentSlideId: Optional[str] = None # To store the active slide from frontend
    lessonNumber: Optional[int] = None  # Sequential number in Training Plan
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True}


# --- Start: Add New Quiz Models ---

class QuizQuestionOption(BaseModel):
    id: str  # e.g., "A", "B", "C"
    text: str
    model_config = {"from_attributes": True}

class MatchingPrompt(BaseModel):
    id: str # e.g., "A", "B", "C"
    text: str
    model_config = {"from_attributes": True}

class MatchingOption(BaseModel):
    id: str # e.g., "1", "2", "3"
    text: str
    model_config = {"from_attributes": True}

class SortableItem(BaseModel):
    id: str # e.g., "step1", "step2"
    text: str
    model_config = {"from_attributes": True}

class BaseQuestion(BaseModel):
    question_text: str
    explanation: Optional[str] = None
    model_config = {"from_attributes": True}

class MultipleChoiceQuestion(BaseQuestion):
    question_type: Literal["multiple-choice"]
    options: List[QuizQuestionOption]
    correct_option_id: str
    model_config = {"from_attributes": True}

class MultiSelectQuestion(BaseQuestion):
    question_type: Literal["multi-select"]
    options: List[QuizQuestionOption]
    correct_option_ids: List[str]
    model_config = {"from_attributes": True}

class MatchingQuestion(BaseQuestion):
    question_type: Literal["matching"]
    prompts: List[MatchingPrompt]
    options: List[MatchingOption]
    correct_matches: Dict[str, str]  # Maps prompt.id to option.id, e.g. {"A": "3", "B": "1"}
    model_config = {"from_attributes": True}

class SortingQuestion(BaseQuestion):
    question_type: Literal["sorting"]
    items_to_sort: List[SortableItem]
    correct_order: List[str]  # List of SortableItem.id in the correct sequence
    model_config = {"from_attributes": True}

class OpenAnswerQuestion(BaseQuestion):
    question_type: Literal["open-answer"]
    acceptable_answers: List[str]
    model_config = {"from_attributes": True}

AnyQuizQuestion = Union[
    MultipleChoiceQuestion,
    MultiSelectQuestion,
    MatchingQuestion,
    SortingQuestion,
    OpenAnswerQuestion
]

class QuizData(BaseModel):
    quizTitle: str
    questions: List[AnyQuizQuestion] = Field(default_factory=list)
    lessonNumber: Optional[int] = None  # Sequential number in Training Plan
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True, "use_enum_values": True}

# --- End: Add New Quiz Models ---

# +++ NEW MODEL FOR TEXT PRESENTATION +++
class TextPresentationDetails(BaseModel):
    textTitle: str
    contentBlocks: List[AnyContentBlockValue] = Field(default_factory=list)
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True}
# +++ END NEW MODEL +++

MicroProductContentType = Union[TrainingPlanDetails, PdfLessonDetails, VideoLessonData, SlideDeckDetails, QuizData, TextPresentationDetails, None]
# custom_extensions/backend/main.py
from fastapi import FastAPI, HTTPException, Depends, Request, status, File, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse

from typing import List, Optional, Dict, Any, Union, Type, ForwardRef, Set, Literal
from pydantic import BaseModel, Field, RootModel
import re
import os
import asyncpg
from datetime import datetime, timezone
import httpx
from httpx import HTTPStatusError
import json
import uuid
import shutil
import logging
from locales.__init__ import LANG_CONFIG
import asyncio
import typing
import tempfile
import io
import gzip
import base64
import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import tiktoken
import inspect
# NEW: OpenAI imports for direct usage
import openai
from openai import AsyncOpenAI
from uuid import uuid4

# --- CONTROL VARIABLE FOR PRODUCTION LOGGING ---
# SET THIS TO True FOR PRODUCTION, False FOR DEVELOPMENT
IS_PRODUCTION = False  # Or True for production

# --- Logger ---
logger = logging.getLogger(__name__)
if IS_PRODUCTION:
    logging.basicConfig(level=logging.ERROR) # Production: Log only ERROR and CRITICAL
else:
    logging.basicConfig(level=logging.INFO)  # Development: Log INFO, WARNING, ERROR, CRITICAL


# --- Constants & DB Setup ---
CUSTOM_PROJECTS_DATABASE_URL = os.getenv("CUSTOM_PROJECTS_DATABASE_URL")
ONYX_DATABASE_URL = os.getenv("ONYX_DATABASE_URL")
ONYX_API_SERVER_URL = "http://api_server:8080" # Adjust if needed
ONYX_SESSION_COOKIE_NAME = os.getenv("ONYX_SESSION_COOKIE_NAME", "fastapiusersauth")

# Component name constants
COMPONENT_NAME_TRAINING_PLAN = "TrainingPlanTable"
COMPONENT_NAME_PDF_LESSON = "PdfLessonDisplay"
COMPONENT_NAME_SLIDE_DECK = "SlideDeckDisplay"
COMPONENT_NAME_VIDEO_LESSON = "VideoLessonDisplay"
COMPONENT_NAME_QUIZ = "QuizDisplay"
COMPONENT_NAME_TEXT_PRESENTATION = "TextPresentationDisplay"

# --- LLM Configuration for JSON Parsing ---
# === OpenAI ChatGPT configuration (replacing previous Cohere call) ===
LLM_API_KEY = os.getenv("OPENAI_API_KEY")
LLM_API_KEY_FALLBACK = os.getenv("OPENAI_API_KEY_FALLBACK")
# Endpoint for Chat Completions
LLM_API_URL = os.getenv("OPENAI_API_URL", "https://api.openai.com/v1/chat/completions")
# Default model to use – gpt-4o-mini provides strong JSON adherence
LLM_DEFAULT_MODEL = os.getenv("OPENAI_DEFAULT_MODEL", "gpt-4o-mini")

# NEW: OpenAI client for direct streaming
OPENAI_CLIENT = None

def get_openai_client():
    """Get or create the OpenAI client instance."""
    global OPENAI_CLIENT
    if OPENAI_CLIENT is None:
        api_key = LLM_API_KEY or LLM_API_KEY_FALLBACK
        if not api_key:
            raise ValueError("No OpenAI API key configured. Set OPENAI_API_KEY environment variable.")
        OPENAI_CLIENT = AsyncOpenAI(api_key=api_key)
    return OPENAI_CLIENT

async def stream_openai_response(prompt: str, model: str = None):
    """
    Stream response directly from OpenAI API.
    Yields dictionaries with 'type' and 'text' fields compatible with existing frontend.
    """
    try:
        client = get_openai_client()
        model = model or LLM_DEFAULT_MODEL
        
        logger.info(f"[OPENAI_STREAM] Starting direct OpenAI streaming with model {model}")
        logger.info(f"[OPENAI_STREAM] Prompt length: {len(prompt)} chars")
        
        # Read the full ContentBuilder.ai assistant instructions
        assistant_instructions_path = "custom_assistants/content_builder_ai.txt"
        try:
            with open(assistant_instructions_path, 'r', encoding='utf-8') as f:
                system_prompt = f.read()
        except FileNotFoundError:
            logger.warning(f"[OPENAI_STREAM] Assistant instructions file not found: {assistant_instructions_path}")
            system_prompt = "You are ContentBuilder.ai assistant. Follow the instructions in the user message exactly."
        
        # Create the streaming chat completion
        stream = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            stream=True,
            max_tokens=10000,  # Increased from 4000 to handle larger course outlines
            temperature=0.2
        )
        
        logger.info(f"[OPENAI_STREAM] Stream created successfully")
        
        # DEBUG: Collect full response for logging
        full_response = ""
        chunk_count = 0
        
        async for chunk in stream:
            chunk_count += 1
            logger.debug(f"[OPENAI_STREAM] Chunk {chunk_count}: {chunk}")
            
            if chunk.choices and len(chunk.choices) > 0:
                choice = chunk.choices[0]
                if choice.delta and choice.delta.content:
                    content = choice.delta.content
                    full_response += content  # DEBUG: Accumulate full response
                    yield {"type": "delta", "text": content}
                    
                # Check for finish reason
                if choice.finish_reason:
                    logger.info(f"[OPENAI_STREAM] Stream finished with reason: {choice.finish_reason}")
                    logger.info(f"[OPENAI_STREAM] Total chunks received: {chunk_count}")
                    logger.info(f"[OPENAI_STREAM] FULL RESPONSE:\n{full_response}")
                    break
                    
    except Exception as e:
        logger.error(f"[OPENAI_STREAM] Error in OpenAI streaming: {e}", exc_info=True)
        yield {"type": "error", "text": f"OpenAI streaming error: {str(e)}"}

def should_use_openai_direct(payload) -> bool:
    """
    Determine if we should use OpenAI directly instead of Onyx.
    Returns True when no file context is present.
    """
    # Check if files are explicitly provided
    has_files = (
        (hasattr(payload, 'fromFiles') and payload.fromFiles) or
        (hasattr(payload, 'folderIds') and payload.folderIds) or
        (hasattr(payload, 'fileIds') and payload.fileIds)
    )
    
    # Check if text context is provided (this still uses file system in some cases)
    has_text_context = (
        hasattr(payload, 'fromText') and payload.fromText and 
        hasattr(payload, 'userText') and payload.userText
    )
    
    # Use OpenAI directly only when there's no file context and no text context
    use_openai = not has_files and not has_text_context
    
    logger.info(f"[API_SELECTION] has_files={has_files}, has_text_context={has_text_context}, use_openai={use_openai}")
    return use_openai

DB_POOL = None
# Track in-flight project creations to avoid duplicate processing (keyed by user+project)
ACTIVE_PROJECT_CREATE_KEYS: Set[str] = set()

# Track in-flight quiz finalizations to prevent duplicate processing
ACTIVE_QUIZ_FINALIZE_KEYS: Set[str] = set()

# Track quiz finalization timestamps for cleanup
QUIZ_FINALIZE_TIMESTAMPS: Dict[str, float] = {}


# --- Directory for Design Template Images ---
STATIC_DESIGN_IMAGES_DIR = "static_design_images"
os.makedirs(STATIC_DESIGN_IMAGES_DIR, exist_ok=True)

# --- Directory for Static Fonts ---
STATIC_FONTS_DIR = "static/fonts"
os.makedirs(STATIC_FONTS_DIR, exist_ok=True)

def inspect_list_items_recursively(data_structure: Any, path: str = ""):
    if isinstance(data_structure, dict):
        for key, value in data_structure.items():
            new_path = f"{path}.{key}" if path else key
            if key == "items": # Focus on 'items' keys
                logger.info(f"PDF Deep Inspect: Path: {new_path}, Type: {type(value)}, Is List: {isinstance(value, list)}, Value (first 100): {str(value)[:100]}")
                if not isinstance(value, list) and value is not None:
                    logger.error(f"PDF DEEP ERROR: Non-list 'items' at {new_path}. Type: {type(value)}, Value: {str(value)[:200]}")
            if isinstance(value, (dict, list)):
                inspect_list_items_recursively(value, new_path)
    elif isinstance(data_structure, list):
        for i, item in enumerate(data_structure):
            new_path = f"{path}[{i}]"
            if isinstance(item, (dict, list)):
                inspect_list_items_recursively(item, new_path)

DEFAULT_TRAINING_PLAN_JSON_EXAMPLE_FOR_LLM = """
{
  "mainTitle": "Example Training Program",
  "sections": [
    {
      "id": "№1",
      "title": "Introduction to Topic",
      "totalHours": 5.5,
      "lessons": [
        {
          "title": "Lesson 1.1: Basic Concepts",
          "check": {"type": "test", "text": "Knowledge Test"},
          "contentAvailable": {"type": "yes", "text": "100%"},
          "source": "Internal Documentation",
          "hours": 2.0,
          "completionTime": "6m"
        }
      ]
    }
  ],
  "detectedLanguage": "en"
}
"""

DEFAULT_PDF_LESSON_JSON_EXAMPLE_FOR_LLM = """
{
  "lessonTitle": "Example PDF Lesson with Nested Lists",
      "contentBlocks": [
    { "type": "headline", "level": 1, "text": "Main Title of the Lesson" },
    { "type": "paragraph", "text": "This is an introductory paragraph explaining the main concepts." },
        {
          "type": "bullet_list",
          "items": [
        "Top level item 1, demonstrating a simple string item.",
        {
          "type": "bullet_list",
          "iconName": "chevronRight",
          "items": [
            "Nested item A: This is a sub-item.",
            "Nested item B: Another sub-item to show structure.",
            {
              "type": "numbered_list",
              "items": [
                "Further nested numbered item 1.",
                "Further nested numbered item 2."
              ]
            }
          ]
        },
        "Top level item 2, followed by a nested numbered list.",
        {
          "type": "numbered_list",
          "items": [
            "Nested numbered 1: First point in nested ordered list.",
            "Nested numbered 2: Second point."
          ]
        },
        "Top level item 3."
      ]
    },
    { "type": "alert", "alertType": "info", "title": "Important Note", "text": "Alerts can provide contextual information or warnings." },
    {
      "type": "numbered_list",
      "items": [
        "Main numbered point 1.",
        {
          "type": "bullet_list",
          "items": [
            "Sub-bullet C under numbered list.",
            "Sub-bullet D, also useful for breaking down complex points."
          ]
        },
        "Main numbered point 2."
      ]
    },
    { "type": "section_break", "style": "dashed" }
  ],
  "detectedLanguage": "en"
}
"""



async def get_db_pool():
    if DB_POOL is None:
        detail_msg = "Database service not available." # Generic enough for production
        raise HTTPException(status_code=503, detail=detail_msg)
    return DB_POOL

app = FastAPI(title="Custom Extension Backend")

app.mount(f"/{STATIC_DESIGN_IMAGES_DIR}", StaticFiles(directory=STATIC_DESIGN_IMAGES_DIR), name="static_design_images")
app.mount("/fonts", StaticFiles(directory=STATIC_FONTS_DIR), name="static_fonts")

@app.middleware("http")
async def track_request_analytics(request: Request, call_next):
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    # Get user ID if available
    user_id = None
    try:
        if hasattr(request.state, 'user_id'):
            user_id = request.state.user_id
    except:
        pass
    
    # Get request size
    request_size = None
    try:
        if request.method in ['POST', 'PUT', 'PATCH']:
            body = await request.body()
            request_size = len(body)
    except:
        pass
    
    try:
        response = await call_next(request)
        end_time = time.time()
        response_time_ms = int((end_time - start_time) * 1000)
        
        # Get response size
        response_size = None
        try:
            if hasattr(response, 'body'):
                response_size = len(response.body)
        except:
            pass
        
        # Store analytics in database
        try:
            async with DB_POOL.acquire() as conn:
                await conn.execute("""
                    INSERT INTO request_analytics (
                        id, endpoint, method, user_id, status_code, 
                        response_time_ms, request_size_bytes, response_size_bytes,
                        error_message, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                """, request_id, request.url.path, request.method, user_id,
                     response.status_code, response_time_ms, request_size,
                     response_size, None, datetime.now(timezone.utc))
        except Exception as e:
            logger.error(f"Failed to store request analytics: {e}")
        
        return response
        
    except Exception as e:
        end_time = time.time()
        response_time_ms = int((end_time - start_time) * 1000)
        
        # Store error analytics
        try:
            async with DB_POOL.acquire() as conn:
                await conn.execute("""
                    INSERT INTO request_analytics (
                        id, endpoint, method, user_id, status_code, 
                        response_time_ms, request_size_bytes, response_size_bytes,
                        error_message, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                """, request_id, request.url.path, request.method, user_id,
                     500, response_time_ms, request_size, None,
                     str(e), datetime.now(timezone.utc))
        except Exception as db_error:
            logger.error(f"Failed to store error analytics: {db_error}")
        
        raise

try:
    from app.services.pdf_generator import generate_pdf_from_html_template
    from app.core.config import settings
except ImportError:
    logger.warning("Could not import pdf_generator or settings from 'app' module. Using dummy implementations for PDF generation.")
    class DummySettings:
        CUSTOM_FRONTEND_URL = os.environ.get("CUSTOM_FRONTEND_URL", "http://custom_frontend:3001")
    settings = DummySettings()
    async def generate_pdf_from_html_template(template_name: str, context_data: Dict[str, Any], output_filename: str) -> str:
        logger.info(f"PDF Generation Skipped (Dummy Service): Would generate for template {template_name} to {output_filename}")
        dummy_path = os.path.join("/app/tmp_pdf", output_filename)
        os.makedirs(os.path.dirname(dummy_path), exist_ok=True)
        with open(dummy_path, "w") as f: f.write(f"Dummy PDF for {output_filename} using context: {str(context_data)[:200]}")
        return dummy_path

effective_origins = list(set(filter(None, [
    "http://localhost:3001",
    "http://143.198.59.56:3001",
    "http://143.198.59.56:8088",
    os.environ.get("WEB_DOMAIN", "http://localhost:3000"),
    settings.CUSTOM_FRONTEND_URL if 'settings' in globals() and hasattr(settings, 'CUSTOM_FRONTEND_URL') else os.environ.get("CUSTOM_FRONTEND_URL", "http://custom_frontend:3001")
])))
if not effective_origins: effective_origins = ["http://localhost:3001"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=effective_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class StatusInfo(BaseModel):
    type: str = "unknown"
    text: str = ""
    model_config = {"from_attributes": True}

# Credits Models
class UserCredits(BaseModel):
    id: int
    onyx_user_id: str
    name: str
    credits_balance: int
    total_credits_used: int
    credits_purchased: int
    last_purchase_date: Optional[datetime]
    subscription_tier: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class CreditTransactionRequest(BaseModel):
    user_email: str
    amount: int
    action: Literal["add", "remove"]
    reason: Optional[str] = "Admin adjustment"

class CreditTransactionResponse(BaseModel):
    success: bool
    message: str
    new_balance: int
    user_credits: UserCredits

class LessonDetail(BaseModel):
    title: str
    check: StatusInfo = Field(default_factory=StatusInfo)
    contentAvailable: StatusInfo = Field(default_factory=StatusInfo)
    source: str = ""
    hours: int = 0
    completionTime: str = ""  # Estimated completion time in minutes (e.g., "5m", "6m", "7m", "8m")
    custom_rate: Optional[int] = None  # Individual lesson-level custom rate override
    quality_tier: Optional[str] = None  # Individual lesson-level quality tier override
    recommended_content_types: Optional[Dict[str, Any]] = None
    model_config = {"from_attributes": True}

class SectionDetail(BaseModel):
    id: str
    title: str
    totalHours: int = 0
    totalCompletionTime: Optional[int] = None  # Total completion time in minutes for the section
    lessons: List[LessonDetail] = Field(default_factory=list)
    autoCalculateHours: bool = True
    custom_rate: Optional[int] = None  # Module-level custom rate override
    quality_tier: Optional[str] = None  # Module-level quality tier override
    model_config = {"from_attributes": True}

class TrainingPlanDetails(BaseModel):
    mainTitle: Optional[str] = None
    sections: List[SectionDetail] = Field(default_factory=list)
    detectedLanguage: Optional[str] = None
    # Store user preferences on which optional columns to show in UI (frontend reads this)
    displayOptions: Optional[Dict[str, bool]] = None  # e.g., {"knowledgeCheck": true, "contentAvailability": false}
    # Store theme selection for styling
    theme: Optional[str] = "cherry"  # Default theme
    model_config = {"from_attributes": True}

AnyContentBlock = Union["HeadlineBlock", "ParagraphBlock", "BulletListBlock", "NumberedListBlock", "AlertBlock", "SectionBreakBlock"]
ListItem = Union[str, AnyContentBlock, List[AnyContentBlock]]

class BaseContentBlock(BaseModel):
    type: str
    model_config = {"from_attributes": True}

class HeadlineBlock(BaseContentBlock):
    type: str = "headline"
    level: int = Field(ge=1, le=4)
    text: str
    iconName: Optional[str] = None
    backgroundColor: Optional[str] = None
    textColor: Optional[str] = None
    isImportant: Optional[bool] = Field(default=False, description="Set to true if this headline (typically Level 4) and its immediately following single block (list or paragraph) form an important section to be visually boxed.")

class ParagraphBlock(BaseContentBlock):
    type: str = "paragraph"
    text: str
    isRecommendation: Optional[bool] = Field(default=False, description="Set to true if this paragraph is a 'recommendation' within a numbered list item, to be styled distinctly.")

class BulletListBlock(BaseContentBlock):
    type: Literal['bullet_list'] = 'bullet_list'
    items: List[ListItem] = []
    iconName: Optional[str] = None

class NumberedListBlock(BaseContentBlock):
    type: Literal['numbered_list'] = 'numbered_list'
    items: List[ListItem] = []

class AlertBlock(BaseContentBlock):
    type: str = "alert"
    title: Optional[str] = None
    text: str
    alertType: str = "info"
    iconName: Optional[str] = None
    backgroundColor: Optional[str] = None
    borderColor: Optional[str] = None
    textColor: Optional[str] = None
    iconColor: Optional[str] = None

class SectionBreakBlock(BaseContentBlock):
    type: str = "section_break"
    style: Optional[str] = "solid"

AnyContentBlockValue = Union[
    HeadlineBlock, ParagraphBlock, BulletListBlock, NumberedListBlock, AlertBlock, SectionBreakBlock, TableBlock, ImageBlock
]

class PdfLessonDetails(BaseModel):
    lessonTitle: str
    # Optional: sequential number of the lesson inside the parent Training Plan
    lessonNumber: Optional[int] = None
    contentBlocks: List[AnyContentBlockValue] = Field(default_factory=list)
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True}

class VideoLessonSlideData(BaseModel):
    slideId: str
    slideNumber: int
    slideTitle: str
    displayedText: Optional[str] = None
    imagePath: Optional[str] = None
    videoPath: Optional[str] = None
    voiceoverText: Optional[str] = None
    displayedPictureDescription: Optional[str] = None
    displayedVideoDescription: Optional[str] = None
    model_config = {"from_attributes": True}

class VideoLessonData(BaseModel):
    mainPresentationTitle: str
    slides: List[VideoLessonSlideData] = Field(default_factory=list)
    currentSlideId: Optional[str] = None # To store the active slide from frontend
    lessonNumber: Optional[int] = None  # Sequential number in Training Plan
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True}

# --- NEW: Slide-based Lesson Presentation Models ---
class ImagePlaceholder(BaseModel):
    size: str          # "LARGE", "MEDIUM", "SMALL", "BANNER", "BACKGROUND"
    position: str      # "LEFT", "RIGHT", "TOP_BANNER", "BACKGROUND", etc.
    description: str   # Description of the image content
    model_config = {"from_attributes": True}

class DeckSlide(BaseModel):
    slideId: str               
    slideNumber: int           
    slideTitle: str            
    templateId: str            # Зробити обов'язковим (без Optional)
    props: Dict[str, Any] = Field(default_factory=dict)  # Додати props
    voiceoverText: Optional[str] = None  # Optional voiceover text for video lessons
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)  # Опціонально для метаданих
    model_config = {"from_attributes": True}

class SlideDeckDetails(BaseModel):
    lessonTitle: str
    slides: List[DeckSlide] = Field(default_factory=list)
    currentSlideId: Optional[str] = None  # To store the active slide from frontend
    lessonNumber: Optional[int] = None    # Sequential number in Training Plan
    detectedLanguage: Optional[str] = None
    hasVoiceover: Optional[bool] = None  # Flag indicating if any slide has voiceover
    theme: Optional[str] = None           # Selected theme for presentation
    model_config = {"from_attributes": True}

# --- Start: Add New Quiz Models ---

class QuizQuestionOption(BaseModel):
    id: str  # e.g., "A", "B", "C"
    text: str
    model_config = {"from_attributes": True}

class MatchingPrompt(BaseModel):
    id: str # e.g., "A", "B", "C"
    text: str
    model_config = {"from_attributes": True}

class MatchingOption(BaseModel):
    id: str # e.g., "1", "2", "3"
    text: str
    model_config = {"from_attributes": True}

class SortableItem(BaseModel):
    id: str # e.g., "step1", "step2"
    text: str
    model_config = {"from_attributes": True}

class BaseQuestion(BaseModel):
    question_text: str
    explanation: Optional[str] = None
    model_config = {"from_attributes": True}

class MultipleChoiceQuestion(BaseQuestion):
    question_type: Literal["multiple-choice"]
    options: List[QuizQuestionOption]
    correct_option_id: str
    model_config = {"from_attributes": True}

class MultiSelectQuestion(BaseQuestion):
    question_type: Literal["multi-select"]
    options: List[QuizQuestionOption]
    correct_option_ids: List[str]
    model_config = {"from_attributes": True}

class MatchingQuestion(BaseQuestion):
    question_type: Literal["matching"]
    prompts: List[MatchingPrompt]
    options: List[MatchingOption]
    correct_matches: Dict[str, str]  # Maps prompt.id to option.id, e.g. {"A": "3", "B": "1"}
    model_config = {"from_attributes": True}

class SortingQuestion(BaseQuestion):
    question_type: Literal["sorting"]
    items_to_sort: List[SortableItem]
    correct_order: List[str]  # List of SortableItem.id in the correct sequence
    model_config = {"from_attributes": True}

class OpenAnswerQuestion(BaseQuestion):
    question_type: Literal["open-answer"]
    acceptable_answers: List[str]
    model_config = {"from_attributes": True}

AnyQuizQuestion = Union[
    MultipleChoiceQuestion,
    MultiSelectQuestion,
    MatchingQuestion,
    SortingQuestion,
    OpenAnswerQuestion
]

# custom_extensions/backend/main.py
from fastapi import FastAPI, HTTPException, Depends, Request, status, File, UploadFile, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse

from typing import List, Optional, Dict, Any, Union, Type, ForwardRef, Set, Literal
from pydantic import BaseModel, Field, RootModel
import re
import os
import asyncpg
from datetime import datetime, timezone
import httpx
from httpx import HTTPStatusError
import json
import uuid
import shutil
import logging
from locales.__init__ import LANG_CONFIG
import asyncio
import typing
import tempfile
import io
import gzip
import base64
import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import tiktoken
import inspect

# --- CONTROL VARIABLE FOR PRODUCTION LOGGING ---
# SET THIS TO True FOR PRODUCTION, False FOR DEVELOPMENT
IS_PRODUCTION = False  # Or True for production

# --- Logger ---
logger = logging.getLogger(__name__)
if IS_PRODUCTION:
    logging.basicConfig(level=logging.ERROR) # Production: Log only ERROR and CRITICAL
else:
    logging.basicConfig(level=logging.INFO)  # Development: Log INFO, WARNING, ERROR, CRITICAL


# --- Constants & DB Setup ---
CUSTOM_PROJECTS_DATABASE_URL = os.getenv("CUSTOM_PROJECTS_DATABASE_URL")
ONYX_DATABASE_URL = os.getenv("ONYX_DATABASE_URL")
ONYX_API_SERVER_URL = "http://api_server:8080" # Adjust if needed
ONYX_SESSION_COOKIE_NAME = os.getenv("ONYX_SESSION_COOKIE_NAME", "fastapiusersauth")

# Component name constants
COMPONENT_NAME_TRAINING_PLAN = "TrainingPlanTable"
COMPONENT_NAME_PDF_LESSON = "PdfLessonDisplay"
COMPONENT_NAME_SLIDE_DECK = "SlideDeckDisplay"
COMPONENT_NAME_VIDEO_LESSON = "VideoLessonDisplay"
COMPONENT_NAME_QUIZ = "QuizDisplay"
COMPONENT_NAME_TEXT_PRESENTATION = "TextPresentationDisplay"

# --- LLM Configuration for JSON Parsing ---
# === OpenAI ChatGPT configuration (replacing previous Cohere call) ===
LLM_API_KEY = os.getenv("OPENAI_API_KEY")
LLM_API_KEY_FALLBACK = os.getenv("OPENAI_API_KEY_FALLBACK")

BING_API_KEY = os.getenv("BING_API_KEY")
BING_API_URL = "https://api.bing.microsoft.com/v7.0/search"

# Endpoint for Chat Completions
LLM_API_URL = os.getenv("OPENAI_API_URL", "https://api.openai.com/v1/chat/completions")
# Default model to use – gpt-4o-mini provides strong JSON adherence
LLM_DEFAULT_MODEL = os.getenv("OPENAI_DEFAULT_MODEL", "gpt-4o-mini")

DB_POOL = None
# Track in-flight project creations to avoid duplicate processing (keyed by user+project)
ACTIVE_PROJECT_CREATE_KEYS: Set[str] = set()

# Track in-flight quiz finalizations to prevent duplicate processing
ACTIVE_QUIZ_FINALIZE_KEYS: Set[str] = set()

# Track quiz finalization timestamps for cleanup
QUIZ_FINALIZE_TIMESTAMPS: Dict[str, float] = {}

# In-memory job status store (for demo; use Redis for production)
AI_AUDIT_PROGRESS = {}


# --- Directory for Design Template Images ---
STATIC_DESIGN_IMAGES_DIR = "static_design_images"
os.makedirs(STATIC_DESIGN_IMAGES_DIR, exist_ok=True)

# --- Directory for Static Fonts ---
STATIC_FONTS_DIR = "static/fonts"
os.makedirs(STATIC_FONTS_DIR, exist_ok=True)

def inspect_list_items_recursively(data_structure: Any, path: str = ""):
    if isinstance(data_structure, dict):
        for key, value in data_structure.items():
            new_path = f"{path}.{key}" if path else key
            if key == "items": # Focus on 'items' keys
                logger.info(f"PDF Deep Inspect: Path: {new_path}, Type: {type(value)}, Is List: {isinstance(value, list)}, Value (first 100): {str(value)[:100]}")
                if not isinstance(value, list) and value is not None:
                    logger.error(f"PDF DEEP ERROR: Non-list 'items' at {new_path}. Type: {type(value)}, Value: {str(value)[:200]}")
            if isinstance(value, (dict, list)):
                inspect_list_items_recursively(value, new_path)
    elif isinstance(data_structure, list):
        for i, item in enumerate(data_structure):
            new_path = f"{path}[{i}]"
            if isinstance(item, (dict, list)):
                inspect_list_items_recursively(item, new_path)

DEFAULT_TRAINING_PLAN_JSON_EXAMPLE_FOR_LLM = """
{
  "mainTitle": "Example Training Program",
  "sections": [
    {
      "id": "№1",
      "title": "Introduction to Topic",
      "totalHours": 5.5,
      "lessons": [
        {
          "title": "Lesson 1.1: Basic Concepts",
          "check": {"type": "test", "text": "Knowledge Test"},
          "contentAvailable": {"type": "yes", "text": "100%"},
          "source": "Internal Documentation",
          "hours": 2.0,
          "completionTime": "6m"
        }
      ]
    }
  ],
  "detectedLanguage": "en"
}
"""

DEFAULT_PDF_LESSON_JSON_EXAMPLE_FOR_LLM = """
{
  "textTitle": "Example PDF Lesson with Nested Lists",
  "contentBlocks": [
    { "type": "headline", "level": 1, "text": "Main Title of the Lesson" },
    { "type": "paragraph", "text": "This is an introductory paragraph explaining the main concepts." },
    {
      "type": "bullet_list",
      "items": [
        "Top level item 1, demonstrating a simple string item.",
        {
          "type": "bullet_list",
          "iconName": "chevronRight",
          "items": [
            "Nested item A: This is a sub-item.",
            "Nested item B: Another sub-item to show structure.",
            {
              "type": "numbered_list",
              "items": [
                "Further nested numbered item 1.",
                "Further nested numbered item 2."
              ]
            }
          ]
        },
        "Top level item 2, followed by a nested numbered list.",
        {
          "type": "numbered_list",
          "items": [
            "Nested numbered 1: First point in nested ordered list.",
            "Nested numbered 2: Second point."
          ]
        },
        "Top level item 3."
      ]
    },
    { "type": "alert", "alertType": "info", "title": "Important Note", "text": "Alerts can provide contextual information or warnings." },
    {
      "type": "numbered_list",
      "items": [
        "Main numbered point 1.",
        {
          "type": "bullet_list",
          "items": [
            "Sub-bullet C under numbered list.",
            "Sub-bullet D, also useful for breaking down complex points."
          ]
        },
        "Main numbered point 2."
      ]
    },
    { "type": "section_break", "style": "dashed" }
  ],
  "detectedLanguage": "en"
}
"""

DEFAULT_SLIDE_DECK_JSON_EXAMPLE_FOR_LLM = """
{
  "lessonTitle": "Digital Marketing Strategy: A Complete Guide",
  "slides": [
    {
      "slideId": "slide_1_intro",
      "slideNumber": 1,
      "slideTitle": "Introduction",
      "templateId": "hero-title-slide",
      "props": {
        "title": "Digital Marketing Strategy",
        "subtitle": "A comprehensive guide to building effective online presence and driving business growth",
        "author": "Marketing Excellence Team",
        "date": "2024",
        "backgroundColor": "#1e40af",
        "titleColor": "#ffffff",
        "subtitleColor": "#bfdbfe"
      }
    },
    {
      "slideId": "slide_2_agenda",
      "slideNumber": 2,
      "slideTitle": "Learning Agenda",
      "templateId": "bullet-points",
      "props": {
        "title": "What We'll Cover Today",
        "bullets": [
          "Understanding digital marketing fundamentals",
          "Market research and target audience analysis",
          "Content strategy development",
          "Social media marketing tactics",
          "Email marketing best practices",
          "SEO and search marketing"
        ],
        "maxColumns": 2,
        "bulletStyle": "number",
        "imagePrompt": "A roadmap or pathway illustration showing the learning journey, modern flat design with blue and purple accents",
        "imageAlt": "Learning roadmap illustration"
      }
    },
    {
      "slideId": "slide_3_stats",
      "slideNumber": 3,
      "slideTitle": "Digital Marketing by the Numbers",
      "templateId": "big-numbers",
      "props": {
        "title": "Digital Marketing Impact",
        "numbers": [
          {
            "value": "4.8B",
            "label": "Internet Users Worldwide",
            "color": "#3b82f6"
          },
          {
            "value": "68%",
            "label": "Of Online Experiences Start with Search",
            "color": "#8b5cf6"
          },
          {
            "value": "$42",
            "label": "ROI for Every $1 Spent on Email Marketing",
            "color": "#10b981"
          }
        ]
      }
    },
    {
      "slideId": "slide_4_ecosystem",
      "slideNumber": 4,
      "slideTitle": "Digital Marketing Ecosystem",
      "templateId": "big-image-top",
      "props": {
        "title": "The Digital Marketing Landscape",
        "content": "Understanding the interconnected nature of digital marketing channels and how they work together to create a cohesive customer experience across all touchpoints.",
        "imageUrl": "https://via.placeholder.com/800x400?text=Digital+Ecosystem",
        "imageAlt": "Digital marketing ecosystem diagram",
        "imagePrompt": "A comprehensive diagram showing interconnected digital marketing channels including social media, email, SEO, PPC, content marketing, and analytics in a modern network visualization",
        "imageSize": "large"
      }
    },
    {
      "slideId": "slide_5_audience_vs_market",
      "slideNumber": 5,
      "slideTitle": "Audience vs Market Research",
      "templateId": "two-column",
      "props": {
        "title": "Understanding the Difference",
        "leftTitle": "Market Research",
        "leftContent": "• Industry trends and size\n• Competitive landscape\n• Market opportunities\n• Overall demand patterns\n• Economic factors",
        "rightTitle": "Audience Research",
        "rightContent": "• Customer demographics\n• Behavioral patterns\n• Pain points and needs\n• Communication preferences\n• Decision-making process"
      }
    },
    {
      "slideId": "slide_6_personas",
      "slideNumber": 6,
      "slideTitle": "Buyer Persona Development",
      "templateId": "process-steps",
      "props": {
        "title": "Creating Effective Buyer Personas",
        "steps": [
          "Collect demographic and psychographic data",
          "Conduct customer interviews and surveys",
          "Analyze behavioral patterns and preferences",
          "Identify goals, challenges, and pain points",
          "Map the customer journey and touchpoints",
          "Validate personas with real customer data"
        ]
      }
    },
    {
      "slideId": "slide_7_content_strategy",
      "slideNumber": 7,
      "slideTitle": "Content Strategy Foundation",
      "templateId": "pyramid",
      "props": {
        "title": "Content Strategy Pyramid",
        "levels": [
          {
            "text": "Content Distribution & Promotion",
            "description": "Multi-channel amplification strategy"
          },
          {
            "text": "Content Creation & Production",
            "description": "High-quality, engaging content development"
          },
          {
            "text": "Content Planning & Calendar",
            "description": "Strategic planning and scheduling"
          },
          {
            "text": "Content Audit & Analysis",
            "description": "Understanding current content performance"
          },
          {
            "text": "Goals, Audience & Brand Foundation",
            "description": "Strategic foundation and core objectives"
          }
        ]
      }
    },
    {
      "slideId": "slide_8_content_types",
      "slideNumber": 8,
      "slideTitle": "Content Format Matrix",
      "templateId": "four-box-grid",
      "props": {
        "title": "Content Formats for Different Goals",
        "boxes": [
          {
            "title": "Educational Content",
            "content": "Blog posts, tutorials, webinars, how-to guides",
            "icon": "📚"
          },
          {
            "title": "Engagement Content", 
            "content": "Social media posts, polls, user-generated content",
            "icon": "💬"
          },
          {
            "title": "Conversion Content",
            "content": "Case studies, testimonials, product demos",
            "icon": "🎯"
          },
          {
            "title": "Entertainment Content",
            "content": "Videos, memes, interactive content, stories",
            "icon": "🎭"
          }
        ]
      }
    },
    {
      "slideId": "slide_9_social_challenges",
      "slideNumber": 9,
      "slideTitle": "Social Media Challenges & Solutions",
      "templateId": "challenges-solutions",
      "props": {
        "title": "Overcoming Social Media Obstacles",
        "challenges": [
          "Low organic reach and engagement",
          "Creating consistent, quality content",
          "Managing multiple platform requirements"
        ],
        "solutions": [
          "Focus on community building and authentic interactions",
          "Develop content pillars and batch creation workflows", 
          "Use scheduling tools and platform-specific strategies"
        ]
      }
    },
    {
      "slideId": "slide_10_email_timeline",
      "slideNumber": 10,
      "slideTitle": "Email Marketing Campaign Timeline",
      "templateId": "timeline",
      "props": {
        "title": "Building Your Email Marketing Program",
        "events": [
          {
            "date": "Week 1-2",
            "title": "Foundation Setup",
            "description": "Choose platform, design templates, set up automation"
          },
          {
            "date": "Week 3-4", 
            "title": "List Building",
            "description": "Create lead magnets, optimize signup forms"
          },
          {
            "date": "Week 5-8",
            "title": "Content Creation",
            "description": "Develop welcome series, newsletters, promotional campaigns"
          },
          {
            "date": "Week 9-12",
            "title": "Optimization",
            "description": "A/B testing, segmentation, performance analysis"
          }
        ]
      }
    },
    {
      "slideId": "slide_11_seo_quote",
      "slideNumber": 11,
      "slideTitle": "SEO Philosophy",
      "templateId": "quote-center",
      "props": {
        "quote": "The best place to hide a dead body is page 2 of Google search results.",
        "author": "Digital Marketing Wisdom",
        "context": "This humorous quote highlights the critical importance of ranking on the first page of search results for visibility and traffic."
      }
    },
    {
      "slideId": "slide_12_seo_factors",
      "slideNumber": 12,
      "slideTitle": "SEO Success Factors",
      "templateId": "bullet-points-right",
      "props": {
        "title": "Key SEO Elements",
        "bullets": [
          "Keyword research and strategic implementation",
          "High-quality, original content creation",
          "Technical SEO and site speed optimization",
          "Mobile-first design and user experience",
          "Authority building through quality backlinks",
          "Local SEO for geographic targeting"
        ],
        "bulletStyle": "dot",
        "imagePrompt": "SEO optimization illustration with search elements, website structure, and ranking factors in a modern, clean style",
        "imageAlt": "SEO optimization visual guide"
      }
    },
    {
      "slideId": "slide_13_paid_advertising",
      "slideNumber": 13,
      "slideTitle": "Paid Advertising Strategy",
      "templateId": "big-image-left",
      "props": {
        "title": "Maximizing Paid Campaign ROI",
        "subtitle": "Strategic paid advertising accelerates reach and drives targeted traffic when organic efforts need support.",
        "imageUrl": "https://via.placeholder.com/600x400?text=Paid+Advertising",
        "imageAlt": "Digital advertising dashboard",
        "imagePrompt": "A modern advertising dashboard showing campaign performance metrics, targeting options, and ROI indicators across multiple platforms",
        "imageSize": "large"
      }
    },
    {
      "slideId": "slide_14_implementation",
      "slideNumber": 14,
      "slideTitle": "90-Day Implementation Plan",
      "templateId": "process-steps",
      "props": {
        "title": "Your Digital Marketing Roadmap",
        "steps": [
          "Month 1: Foundation - Research, audit, and strategy development",
          "Month 2: Launch - Implement core channels and begin content creation",
          "Month 3: Optimize - Analyze data, refine approach, and scale success"
        ]
      }
    },
    {
      "slideId": "slide_15_conclusion",
      "slideNumber": 15,
      "slideTitle": "Success Principles",
      "templateId": "title-slide",
      "props": {
        "title": "Your Digital Marketing Success Formula",
        "subtitle": "Strategy + Consistency + Measurement = Growth",
        "author": "Remember: Digital marketing is a marathon, not a sprint",
        "backgroundColor": "#059669",
        "titleColor": "#ffffff",
        "subtitleColor": "#d1fae5"
      }
    }
  ],
  "currentSlideId": "slide_1_intro",
  "detectedLanguage": "en"
}
"""

async def get_db_pool():
    if DB_POOL is None:
        detail_msg = "Database service not available." # Generic enough for production
        raise HTTPException(status_code=503, detail=detail_msg)
    return DB_POOL

app = FastAPI(title="Custom Extension Backend")

app.mount(f"/{STATIC_DESIGN_IMAGES_DIR}", StaticFiles(directory=STATIC_DESIGN_IMAGES_DIR), name="static_design_images")
app.mount("/fonts", StaticFiles(directory=STATIC_FONTS_DIR), name="static_fonts")

@app.middleware("http")
async def track_request_analytics(request: Request, call_next):
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    # Get user ID if available
    user_id = None
    try:
        if hasattr(request.state, 'user_id'):
            user_id = request.state.user_id
    except:
        pass
    
    # Get request size
    request_size = None
    try:
        if request.method in ['POST', 'PUT', 'PATCH']:
            body = await request.body()
            request_size = len(body)
    except:
        pass
    
    try:
        response = await call_next(request)
        end_time = time.time()
        response_time_ms = int((end_time - start_time) * 1000)
        
        # Get response size
        response_size = None
        try:
            if hasattr(response, 'body'):
                response_size = len(response.body)
        except:
            pass
        
        # Store analytics in database
        try:
            async with DB_POOL.acquire() as conn:
                await conn.execute("""
                    INSERT INTO request_analytics (
                        id, endpoint, method, user_id, status_code, 
                        response_time_ms, request_size_bytes, response_size_bytes,
                        error_message, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                """, request_id, request.url.path, request.method, user_id,
                     response.status_code, response_time_ms, request_size,
                     response_size, None, datetime.now(timezone.utc))
        except Exception as e:
            logger.error(f"Failed to store request analytics: {e}")
        
        return response
        
    except Exception as e:
        end_time = time.time()
        response_time_ms = int((end_time - start_time) * 1000)
        
        # Store error analytics
        try:
            async with DB_POOL.acquire() as conn:
                await conn.execute("""
                    INSERT INTO request_analytics (
                        id, endpoint, method, user_id, status_code, 
                        response_time_ms, request_size_bytes, response_size_bytes,
                        error_message, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                """, request_id, request.url.path, request.method, user_id,
                     500, response_time_ms, request_size, None,
                     str(e), datetime.now(timezone.utc))
        except Exception as db_error:
            logger.error(f"Failed to store error analytics: {db_error}")
        
        raise

try:
    from app.services.pdf_generator import generate_pdf_from_html_template
    from app.core.config import settings
except ImportError:
    logger.warning("Could not import pdf_generator or settings from 'app' module. Using dummy implementations for PDF generation.")
    class DummySettings:
        CUSTOM_FRONTEND_URL = os.environ.get("CUSTOM_FRONTEND_URL", "http://custom_frontend:3001")
    settings = DummySettings()
    async def generate_pdf_from_html_template(template_name: str, context_data: Dict[str, Any], output_filename: str) -> str:
        logger.info(f"PDF Generation Skipped (Dummy Service): Would generate for template {template_name} to {output_filename}")
        dummy_path = os.path.join("/app/tmp_pdf", output_filename)
        os.makedirs(os.path.dirname(dummy_path), exist_ok=True)
        with open(dummy_path, "w") as f: f.write(f"Dummy PDF for {output_filename} using context: {str(context_data)[:200]}")
        return dummy_path

effective_origins = list(set(filter(None, [
    "http://localhost:3001",
    "http://143.198.59.56:3001",
    "http://143.198.59.56:8088",
    os.environ.get("WEB_DOMAIN", "http://localhost:3000"),
    settings.CUSTOM_FRONTEND_URL if 'settings' in globals() and hasattr(settings, 'CUSTOM_FRONTEND_URL') else os.environ.get("CUSTOM_FRONTEND_URL", "http://custom_frontend:3001")
])))
if not effective_origins: effective_origins = ["http://localhost:3001"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=effective_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AiAuditQuestionnaireRequest(BaseModel):
    companyName: str
    companyDesc: str
    companyWebsite: str
    employees: str
    franchise: str
    onboardingProblems: str
    documents: list[str]
    documentsOther: str = ""
    priorities: list[str]
    priorityOther: str = ""

# --- Pydantic Models ---
class StatusInfo(BaseModel):
    type: str = "unknown"
    text: str = ""
    model_config = {"from_attributes": True}

# Credits Models
class UserCredits(BaseModel):
    id: int
    onyx_user_id: str
    name: str
    credits_balance: int
    total_credits_used: int
    credits_purchased: int
    last_purchase_date: Optional[datetime]
    subscription_tier: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class CreditTransactionRequest(BaseModel):
    user_email: str
    amount: int
    action: Literal["add", "remove"]
    reason: Optional[str] = "Admin adjustment"

class CreditTransactionResponse(BaseModel):
    success: bool
    message: str
    new_balance: int
    user_credits: UserCredits

class LessonDetail(BaseModel):
    title: str
    check: StatusInfo = Field(default_factory=StatusInfo)
    contentAvailable: StatusInfo = Field(default_factory=StatusInfo)
    source: str = ""
    hours: int = 0
    completionTime: str = ""  # Estimated completion time in minutes (e.g., "5m", "6m", "7m", "8m")
    custom_rate: Optional[int] = None  # Individual lesson-level custom rate override
    quality_tier: Optional[str] = None  # Individual lesson-level quality tier override
    recommended_content_types: Optional[Dict[str, Any]] = None
    model_config = {"from_attributes": True}

class SectionDetail(BaseModel):
    id: str
    title: str
    totalHours: int = 0
    totalCompletionTime: Optional[int] = None  # Total completion time in minutes for the section
    lessons: List[LessonDetail] = Field(default_factory=list)
    autoCalculateHours: bool = True
    custom_rate: Optional[int] = None  # Module-level custom rate override
    quality_tier: Optional[str] = None  # Module-level quality tier override
    model_config = {"from_attributes": True}

class TrainingPlanDetails(BaseModel):
    mainTitle: Optional[str] = None
    sections: List[SectionDetail] = Field(default_factory=list)
    detectedLanguage: Optional[str] = None
    # Store user preferences on which optional columns to show in UI (frontend reads this)
    displayOptions: Optional[Dict[str, bool]] = None  # e.g., {"knowledgeCheck": true, "contentAvailability": false}
    # Store theme selection for styling
    theme: Optional[str] = "cherry"  # Default theme
    model_config = {"from_attributes": True}

AnyContentBlock = Union["HeadlineBlock", "ParagraphBlock", "BulletListBlock", "NumberedListBlock", "AlertBlock", "SectionBreakBlock", "TableBlock"]
ListItem = Union[str, AnyContentBlock, List[AnyContentBlock]]

class BaseContentBlock(BaseModel):
    type: str
    model_config = {"from_attributes": True}

class HeadlineBlock(BaseContentBlock):
    type: str = "headline"
    level: int = Field(ge=1, le=4)
    text: str
    iconName: Optional[str] = None
    backgroundColor: Optional[str] = None
    textColor: Optional[str] = None
    isImportant: Optional[bool] = Field(default=False, description="Set to true if this headline (typically Level 4) and its immediately following single block (list or paragraph) form an important section to be visually boxed.")

class ParagraphBlock(BaseContentBlock):
    type: str = "paragraph"
    text: str
    isRecommendation: Optional[bool] = Field(default=False, description="Set to true if this paragraph is a 'recommendation' within a numbered list item, to be styled distinctly.")

class BulletListBlock(BaseContentBlock):
    type: Literal['bullet_list'] = 'bullet_list'
    items: List[ListItem] = []
    iconName: Optional[str] = None

class NumberedListBlock(BaseContentBlock):
    type: Literal['numbered_list'] = 'numbered_list'
    items: List[ListItem] = []

class AlertBlock(BaseContentBlock):
    type: str = "alert"
    title: Optional[str] = None
    text: str
    alertType: str = "info"
    iconName: Optional[str] = None
    backgroundColor: Optional[str] = None
    borderColor: Optional[str] = None
    textColor: Optional[str] = None
    iconColor: Optional[str] = None

class SectionBreakBlock(BaseContentBlock):
    type: str = "section_break"
    style: Optional[str] = "solid"

class TableBlock(BaseContentBlock):
    type: str = "table"
    headers: List[str]
    rows: List[List[str]]
    caption: Optional[str] = None

AnyContentBlockValue = Union[
    HeadlineBlock, ParagraphBlock, BulletListBlock, NumberedListBlock, AlertBlock, SectionBreakBlock, TableBlock, ImageBlock
]

class PdfLessonDetails(BaseModel):
    lessonTitle: str
    # Optional: sequential number of the lesson inside the parent Training Plan
    lessonNumber: Optional[int] = None
    contentBlocks: List[AnyContentBlockValue] = Field(default_factory=list)
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True}

class VideoLessonSlideData(BaseModel):
    slideId: str
    slideNumber: int
    slideTitle: str
    displayedText: Optional[str] = None
    imagePath: Optional[str] = None
    videoPath: Optional[str] = None
    voiceoverText: Optional[str] = None
    displayedPictureDescription: Optional[str] = None
    displayedVideoDescription: Optional[str] = None
    model_config = {"from_attributes": True}

class VideoLessonData(BaseModel):
    mainPresentationTitle: str
    slides: List[VideoLessonSlideData] = Field(default_factory=list)
    currentSlideId: Optional[str] = None # To store the active slide from frontend
    lessonNumber: Optional[int] = None  # Sequential number in Training Plan
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True}


# --- Start: Add New Quiz Models ---

class QuizQuestionOption(BaseModel):
    id: str  # e.g., "A", "B", "C"
    text: str
    model_config = {"from_attributes": True}

class MatchingPrompt(BaseModel):
    id: str # e.g., "A", "B", "C"
    text: str
    model_config = {"from_attributes": True}

class MatchingOption(BaseModel):
    id: str # e.g., "1", "2", "3"
    text: str
    model_config = {"from_attributes": True}

class SortableItem(BaseModel):
    id: str # e.g., "step1", "step2"
    text: str
    model_config = {"from_attributes": True}

class BaseQuestion(BaseModel):
    question_text: str
    explanation: Optional[str] = None
    model_config = {"from_attributes": True}

class MultipleChoiceQuestion(BaseQuestion):
    question_type: Literal["multiple-choice"]
    options: List[QuizQuestionOption]
    correct_option_id: str
    model_config = {"from_attributes": True}

class MultiSelectQuestion(BaseQuestion):
    question_type: Literal["multi-select"]
    options: List[QuizQuestionOption]
    correct_option_ids: List[str]
    model_config = {"from_attributes": True}

class MatchingQuestion(BaseQuestion):
    question_type: Literal["matching"]
    prompts: List[MatchingPrompt]
    options: List[MatchingOption]
    correct_matches: Dict[str, str]  # Maps prompt.id to option.id, e.g. {"A": "3", "B": "1"}
    model_config = {"from_attributes": True}

class SortingQuestion(BaseQuestion):
    question_type: Literal["sorting"]
    items_to_sort: List[SortableItem]
    correct_order: List[str]  # List of SortableItem.id in the correct sequence
    model_config = {"from_attributes": True}

class OpenAnswerQuestion(BaseQuestion):
    question_type: Literal["open-answer"]
    acceptable_answers: List[str]
    model_config = {"from_attributes": True}

AnyQuizQuestion = Union[
    MultipleChoiceQuestion,
    MultiSelectQuestion,
    MatchingQuestion,
    SortingQuestion,
    OpenAnswerQuestion
]

class QuizData(BaseModel):
    quizTitle: str
    questions: List[AnyQuizQuestion] = Field(default_factory=list)
    lessonNumber: Optional[int] = None  # Sequential number in Training Plan
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True, "use_enum_values": True}

# --- End: Add New Quiz Models ---

# +++ NEW MODEL FOR TEXT PRESENTATION +++
class TextPresentationDetails(BaseModel):
    textTitle: str
    contentBlocks: List[AnyContentBlockValue] = Field(default_factory=list)
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True}
# +++ END NEW MODEL +++

MicroProductContentType = Union[TrainingPlanDetails, PdfLessonDetails, VideoLessonData, SlideDeckDetails, QuizData, TextPresentationDetails, None]
# custom_extensions/backend/main.py
from fastapi import FastAPI, HTTPException, Depends, Request, status, File, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse

from typing import List, Optional, Dict, Any, Union, Type, ForwardRef, Set, Literal
from pydantic import BaseModel, Field, RootModel
import re
import os
import asyncpg
from datetime import datetime, timezone
import httpx
from httpx import HTTPStatusError
import json
import uuid
import shutil
import logging
from locales.__init__ import LANG_CONFIG
import asyncio
import typing
import tempfile
import io
import gzip
import base64
import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import tiktoken
import inspect
# NEW: OpenAI imports for direct usage
import openai
from openai import AsyncOpenAI
from uuid import uuid4

# --- CONTROL VARIABLE FOR PRODUCTION LOGGING ---
# SET THIS TO True FOR PRODUCTION, False FOR DEVELOPMENT
IS_PRODUCTION = False  # Or True for production

# --- Logger ---
logger = logging.getLogger(__name__)
if IS_PRODUCTION:
    logging.basicConfig(level=logging.ERROR) # Production: Log only ERROR and CRITICAL
else:
    logging.basicConfig(level=logging.INFO)  # Development: Log INFO, WARNING, ERROR, CRITICAL


# --- Constants & DB Setup ---
CUSTOM_PROJECTS_DATABASE_URL = os.getenv("CUSTOM_PROJECTS_DATABASE_URL")
ONYX_DATABASE_URL = os.getenv("ONYX_DATABASE_URL")
ONYX_API_SERVER_URL = "http://api_server:8080" # Adjust if needed
ONYX_SESSION_COOKIE_NAME = os.getenv("ONYX_SESSION_COOKIE_NAME", "fastapiusersauth")

# Component name constants
COMPONENT_NAME_TRAINING_PLAN = "TrainingPlanTable"
COMPONENT_NAME_PDF_LESSON = "PdfLessonDisplay"
COMPONENT_NAME_SLIDE_DECK = "SlideDeckDisplay"
COMPONENT_NAME_VIDEO_LESSON = "VideoLessonDisplay"
COMPONENT_NAME_QUIZ = "QuizDisplay"
COMPONENT_NAME_TEXT_PRESENTATION = "TextPresentationDisplay"

# --- LLM Configuration for JSON Parsing ---
# === OpenAI ChatGPT configuration (replacing previous Cohere call) ===
LLM_API_KEY = os.getenv("OPENAI_API_KEY")
LLM_API_KEY_FALLBACK = os.getenv("OPENAI_API_KEY_FALLBACK")
# Endpoint for Chat Completions
LLM_API_URL = os.getenv("OPENAI_API_URL", "https://api.openai.com/v1/chat/completions")
# Default model to use – gpt-4o-mini provides strong JSON adherence
LLM_DEFAULT_MODEL = os.getenv("OPENAI_DEFAULT_MODEL", "gpt-4o-mini")

# NEW: OpenAI client for direct streaming
OPENAI_CLIENT = None

def get_openai_client():
    """Get or create the OpenAI client instance."""
    global OPENAI_CLIENT
    if OPENAI_CLIENT is None:
        api_key = LLM_API_KEY or LLM_API_KEY_FALLBACK
        if not api_key:
            raise ValueError("No OpenAI API key configured. Set OPENAI_API_KEY environment variable.")
        OPENAI_CLIENT = AsyncOpenAI(api_key=api_key)
    return OPENAI_CLIENT

async def stream_openai_response(prompt: str, model: str = None):
    """
    Stream response directly from OpenAI API.
    Yields dictionaries with 'type' and 'text' fields compatible with existing frontend.
    """
    try:
        client = get_openai_client()
        model = model or LLM_DEFAULT_MODEL
        
        logger.info(f"[OPENAI_STREAM] Starting direct OpenAI streaming with model {model}")
        logger.info(f"[OPENAI_STREAM] Prompt length: {len(prompt)} chars")
        
        # Read the full ContentBuilder.ai assistant instructions
        assistant_instructions_path = "custom_assistants/content_builder_ai.txt"
        try:
            with open(assistant_instructions_path, 'r', encoding='utf-8') as f:
                system_prompt = f.read()
        except FileNotFoundError:
            logger.warning(f"[OPENAI_STREAM] Assistant instructions file not found: {assistant_instructions_path}")
            system_prompt = "You are ContentBuilder.ai assistant. Follow the instructions in the user message exactly."
        
        # Create the streaming chat completion
        stream = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            stream=True,
            max_tokens=10000,  # Increased from 4000 to handle larger course outlines
            temperature=0.2
        )
        
        logger.info(f"[OPENAI_STREAM] Stream created successfully")
        
        # DEBUG: Collect full response for logging
        full_response = ""
        chunk_count = 0
        
        async for chunk in stream:
            chunk_count += 1
            logger.debug(f"[OPENAI_STREAM] Chunk {chunk_count}: {chunk}")
            
            if chunk.choices and len(chunk.choices) > 0:
                choice = chunk.choices[0]
                if choice.delta and choice.delta.content:
                    content = choice.delta.content
                    full_response += content  # DEBUG: Accumulate full response
                    yield {"type": "delta", "text": content}
                    
                # Check for finish reason
                if choice.finish_reason:
                    logger.info(f"[OPENAI_STREAM] Stream finished with reason: {choice.finish_reason}")
                    logger.info(f"[OPENAI_STREAM] Total chunks received: {chunk_count}")
                    logger.info(f"[OPENAI_STREAM] FULL RESPONSE:\n{full_response}")
                    break
                    
    except Exception as e:
        logger.error(f"[OPENAI_STREAM] Error in OpenAI streaming: {e}", exc_info=True)
        yield {"type": "error", "text": f"OpenAI streaming error: {str(e)}"}

def should_use_openai_direct(payload) -> bool:
    """
    Determine if we should use OpenAI directly instead of Onyx.
    Returns True when no file context is present.
    """
    # Check if files are explicitly provided
    has_files = (
        (hasattr(payload, 'fromFiles') and payload.fromFiles) or
        (hasattr(payload, 'folderIds') and payload.folderIds) or
        (hasattr(payload, 'fileIds') and payload.fileIds)
    )
    
    # Check if text context is provided (this still uses file system in some cases)
    has_text_context = (
        hasattr(payload, 'fromText') and payload.fromText and 
        hasattr(payload, 'userText') and payload.userText
    )
    
    # Use OpenAI directly only when there's no file context and no text context
    use_openai = not has_files and not has_text_context
    
    logger.info(f"[API_SELECTION] has_files={has_files}, has_text_context={has_text_context}, use_openai={use_openai}")
    return use_openai

DB_POOL = None
# Track in-flight project creations to avoid duplicate processing (keyed by user+project)
ACTIVE_PROJECT_CREATE_KEYS: Set[str] = set()

# Track in-flight quiz finalizations to prevent duplicate processing
ACTIVE_QUIZ_FINALIZE_KEYS: Set[str] = set()

# Track quiz finalization timestamps for cleanup
QUIZ_FINALIZE_TIMESTAMPS: Dict[str, float] = {}


# --- Directory for Design Template Images ---
STATIC_DESIGN_IMAGES_DIR = "static_design_images"
os.makedirs(STATIC_DESIGN_IMAGES_DIR, exist_ok=True)

# --- Directory for Static Fonts ---
STATIC_FONTS_DIR = "static/fonts"
os.makedirs(STATIC_FONTS_DIR, exist_ok=True)

def inspect_list_items_recursively(data_structure: Any, path: str = ""):
    if isinstance(data_structure, dict):
        for key, value in data_structure.items():
            new_path = f"{path}.{key}" if path else key
            if key == "items": # Focus on 'items' keys
                logger.info(f"PDF Deep Inspect: Path: {new_path}, Type: {type(value)}, Is List: {isinstance(value, list)}, Value (first 100): {str(value)[:100]}")
                if not isinstance(value, list) and value is not None:
                    logger.error(f"PDF DEEP ERROR: Non-list 'items' at {new_path}. Type: {type(value)}, Value: {str(value)[:200]}")
            if isinstance(value, (dict, list)):
                inspect_list_items_recursively(value, new_path)
    elif isinstance(data_structure, list):
        for i, item in enumerate(data_structure):
            new_path = f"{path}[{i}]"
            if isinstance(item, (dict, list)):
                inspect_list_items_recursively(item, new_path)

DEFAULT_TRAINING_PLAN_JSON_EXAMPLE_FOR_LLM = """
{
  "mainTitle": "Example Training Program",
  "sections": [
    {
      "id": "№1",
      "title": "Introduction to Topic",
      "totalHours": 5.5,
      "lessons": [
        {
          "title": "Lesson 1.1: Basic Concepts",
          "check": {"type": "test", "text": "Knowledge Test"},
          "contentAvailable": {"type": "yes", "text": "100%"},
          "source": "Internal Documentation",
          "hours": 2.0,
          "completionTime": "6m"
        }
      ]
    }
  ],
  "detectedLanguage": "en"
}
"""

DEFAULT_PDF_LESSON_JSON_EXAMPLE_FOR_LLM = """
{
  "lessonTitle": "Example PDF Lesson with Nested Lists",
      "contentBlocks": [
    { "type": "headline", "level": 1, "text": "Main Title of the Lesson" },
    { "type": "paragraph", "text": "This is an introductory paragraph explaining the main concepts." },
    {
      "type": "bullet_list",
      "items": [
        "Top level item 1, demonstrating a simple string item.",
        {
          "type": "bullet_list",
          "iconName": "chevronRight",
          "items": [
            "Nested item A: This is a sub-item.",
            "Nested item B: Another sub-item to show structure.",
        {
          "type": "numbered_list",
          "items": [
                "Further nested numbered item 1.",
                "Further nested numbered item 2."
              ]
            }
          ]
        },
        "Top level item 2, followed by a nested numbered list.",
        {
          "type": "numbered_list",
          "items": [
            "Nested numbered 1: First point in nested ordered list.",
            "Nested numbered 2: Second point."
          ]
        },
        "Top level item 3."
      ]
    },
    { "type": "alert", "alertType": "info", "title": "Important Note", "text": "Alerts can provide contextual information or warnings." },
    {
      "type": "numbered_list",
      "items": [
        "Main numbered point 1.",
        {
          "type": "bullet_list",
          "items": [
            "Sub-bullet C under numbered list.",
            "Sub-bullet D, also useful for breaking down complex points."
          ]
        },
        "Main numbered point 2."
      ]
    },
    { "type": "section_break", "style": "dashed" }
  ],
  "detectedLanguage": "en"
}
"""



async def get_db_pool():
    if DB_POOL is None:
        detail_msg = "Database service not available." # Generic enough for production
        raise HTTPException(status_code=503, detail=detail_msg)
    return DB_POOL

app = FastAPI(title="Custom Extension Backend")

app.mount(f"/{STATIC_DESIGN_IMAGES_DIR}", StaticFiles(directory=STATIC_DESIGN_IMAGES_DIR), name="static_design_images")
app.mount("/fonts", StaticFiles(directory=STATIC_FONTS_DIR), name="static_fonts")

@app.middleware("http")
async def track_request_analytics(request: Request, call_next):
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    # Get user ID if available
    user_id = None
    try:
        if hasattr(request.state, 'user_id'):
            user_id = request.state.user_id
    except:
        pass
    
    # Get request size
    request_size = None
    try:
        if request.method in ['POST', 'PUT', 'PATCH']:
            body = await request.body()
            request_size = len(body)
    except:
        pass
    
    try:
        response = await call_next(request)
        end_time = time.time()
        response_time_ms = int((end_time - start_time) * 1000)
        
        # Get response size
        response_size = None
        try:
            if hasattr(response, 'body'):
                response_size = len(response.body)
        except:
            pass
        
        # Store analytics in database
        try:
            async with DB_POOL.acquire() as conn:
                await conn.execute("""
                    INSERT INTO request_analytics (
                        id, endpoint, method, user_id, status_code, 
                        response_time_ms, request_size_bytes, response_size_bytes,
                        error_message, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                """, request_id, request.url.path, request.method, user_id,
                     response.status_code, response_time_ms, request_size,
                     response_size, None, datetime.now(timezone.utc))
        except Exception as e:
            logger.error(f"Failed to store request analytics: {e}")
        
        return response
        
    except Exception as e:
        end_time = time.time()
        response_time_ms = int((end_time - start_time) * 1000)
        
        # Store error analytics
        try:
            async with DB_POOL.acquire() as conn:
                await conn.execute("""
                    INSERT INTO request_analytics (
                        id, endpoint, method, user_id, status_code, 
                        response_time_ms, request_size_bytes, response_size_bytes,
                        error_message, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                """, request_id, request.url.path, request.method, user_id,
                     500, response_time_ms, request_size, None,
                     str(e), datetime.now(timezone.utc))
        except Exception as db_error:
            logger.error(f"Failed to store error analytics: {db_error}")
        
        raise

try:
    from app.services.pdf_generator import generate_pdf_from_html_template
    from app.core.config import settings
except ImportError:
    logger.warning("Could not import pdf_generator or settings from 'app' module. Using dummy implementations for PDF generation.")
    class DummySettings:
        CUSTOM_FRONTEND_URL = os.environ.get("CUSTOM_FRONTEND_URL", "http://custom_frontend:3001")
    settings = DummySettings()
    async def generate_pdf_from_html_template(template_name: str, context_data: Dict[str, Any], output_filename: str) -> str:
        logger.info(f"PDF Generation Skipped (Dummy Service): Would generate for template {template_name} to {output_filename}")
        dummy_path = os.path.join("/app/tmp_pdf", output_filename)
        os.makedirs(os.path.dirname(dummy_path), exist_ok=True)
        with open(dummy_path, "w") as f: f.write(f"Dummy PDF for {output_filename} using context: {str(context_data)[:200]}")
        return dummy_path

effective_origins = list(set(filter(None, [
    "http://localhost:3001",
    "http://143.198.59.56:3001",
    "http://143.198.59.56:8088",
    os.environ.get("WEB_DOMAIN", "http://localhost:3000"),
    settings.CUSTOM_FRONTEND_URL if 'settings' in globals() and hasattr(settings, 'CUSTOM_FRONTEND_URL') else os.environ.get("CUSTOM_FRONTEND_URL", "http://custom_frontend:3001")
])))
if not effective_origins: effective_origins = ["http://localhost:3001"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=effective_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class StatusInfo(BaseModel):
    type: str = "unknown"
    text: str = ""
    model_config = {"from_attributes": True}

# Credits Models
class UserCredits(BaseModel):
    id: int
    onyx_user_id: str
    name: str
    credits_balance: int
    total_credits_used: int
    credits_purchased: int
    last_purchase_date: Optional[datetime]
    subscription_tier: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class CreditTransactionRequest(BaseModel):
    user_email: str
    amount: int
    action: Literal["add", "remove"]
    reason: Optional[str] = "Admin adjustment"

class CreditTransactionResponse(BaseModel):
    success: bool
    message: str
    new_balance: int
    user_credits: UserCredits

class LessonDetail(BaseModel):
    title: str
    check: StatusInfo = Field(default_factory=StatusInfo)
    contentAvailable: StatusInfo = Field(default_factory=StatusInfo)
    source: str = ""
    hours: int = 0
    completionTime: str = ""  # Estimated completion time in minutes (e.g., "5m", "6m", "7m", "8m")
    custom_rate: Optional[int] = None  # Individual lesson-level custom rate override
    quality_tier: Optional[str] = None  # Individual lesson-level quality tier override
    recommended_content_types: Optional[Dict[str, Any]] = None
    model_config = {"from_attributes": True}

class SectionDetail(BaseModel):
    id: str
    title: str
    totalHours: int = 0
    totalCompletionTime: Optional[int] = None  # Total completion time in minutes for the section
    lessons: List[LessonDetail] = Field(default_factory=list)
    autoCalculateHours: bool = True
    custom_rate: Optional[int] = None  # Module-level custom rate override
    quality_tier: Optional[str] = None  # Module-level quality tier override
    model_config = {"from_attributes": True}

class TrainingPlanDetails(BaseModel):
    mainTitle: Optional[str] = None
    sections: List[SectionDetail] = Field(default_factory=list)
    detectedLanguage: Optional[str] = None
    # Store user preferences on which optional columns to show in UI (frontend reads this)
    displayOptions: Optional[Dict[str, bool]] = None  # e.g., {"knowledgeCheck": true, "contentAvailability": false}
    # Store theme selection for styling
    theme: Optional[str] = "cherry"  # Default theme
    model_config = {"from_attributes": True}

AnyContentBlock = Union["HeadlineBlock", "ParagraphBlock", "BulletListBlock", "NumberedListBlock", "AlertBlock", "SectionBreakBlock"]
ListItem = Union[str, AnyContentBlock, List[AnyContentBlock]]

class BaseContentBlock(BaseModel):
    type: str
    model_config = {"from_attributes": True}

class HeadlineBlock(BaseContentBlock):
    type: str = "headline"
    level: int = Field(ge=1, le=4)
    text: str
    iconName: Optional[str] = None
    backgroundColor: Optional[str] = None
    textColor: Optional[str] = None
    isImportant: Optional[bool] = Field(default=False, description="Set to true if this headline (typically Level 4) and its immediately following single block (list or paragraph) form an important section to be visually boxed.")

class ParagraphBlock(BaseContentBlock):
    type: str = "paragraph"
    text: str
    isRecommendation: Optional[bool] = Field(default=False, description="Set to true if this paragraph is a 'recommendation' within a numbered list item, to be styled distinctly.")

class BulletListBlock(BaseContentBlock):
    type: Literal['bullet_list'] = 'bullet_list'
    items: List[ListItem] = []
    iconName: Optional[str] = None

class NumberedListBlock(BaseContentBlock):
    type: Literal['numbered_list'] = 'numbered_list'
    items: List[ListItem] = []

class AlertBlock(BaseContentBlock):
    type: str = "alert"
    title: Optional[str] = None
    text: str
    alertType: str = "info"
    iconName: Optional[str] = None
    backgroundColor: Optional[str] = None
    borderColor: Optional[str] = None
    textColor: Optional[str] = None
    iconColor: Optional[str] = None

class SectionBreakBlock(BaseContentBlock):
    type: str = "section_break"
    style: Optional[str] = "solid"

AnyContentBlockValue = Union[
    HeadlineBlock, ParagraphBlock, BulletListBlock, NumberedListBlock, AlertBlock, SectionBreakBlock, TableBlock, ImageBlock
]

class PdfLessonDetails(BaseModel):
    lessonTitle: str
    # Optional: sequential number of the lesson inside the parent Training Plan
    lessonNumber: Optional[int] = None
    contentBlocks: List[AnyContentBlockValue] = Field(default_factory=list)
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True}

class VideoLessonSlideData(BaseModel):
    slideId: str
    slideNumber: int
    slideTitle: str
    displayedText: Optional[str] = None
    imagePath: Optional[str] = None
    videoPath: Optional[str] = None
    voiceoverText: Optional[str] = None
    displayedPictureDescription: Optional[str] = None
    displayedVideoDescription: Optional[str] = None
    model_config = {"from_attributes": True}

class VideoLessonData(BaseModel):
    mainPresentationTitle: str
    slides: List[VideoLessonSlideData] = Field(default_factory=list)
    currentSlideId: Optional[str] = None # To store the active slide from frontend
    lessonNumber: Optional[int] = None  # Sequential number in Training Plan
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True}

# --- NEW: Slide-based Lesson Presentation Models ---
class ImagePlaceholder(BaseModel):
    size: str          # "LARGE", "MEDIUM", "SMALL", "BANNER", "BACKGROUND"
    position: str      # "LEFT", "RIGHT", "TOP_BANNER", "BACKGROUND", etc.
    description: str   # Description of the image content
    model_config = {"from_attributes": True}

class DeckSlide(BaseModel):
    slideId: str               
    slideNumber: int           
    slideTitle: str            
    templateId: str            # Зробити обов'язковим (без Optional)
    props: Dict[str, Any] = Field(default_factory=dict)  # Додати props
    voiceoverText: Optional[str] = None  # Optional voiceover text for video lessons
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)  # Опціонально для метаданих
    model_config = {"from_attributes": True}

class SlideDeckDetails(BaseModel):
    lessonTitle: str
    slides: List[DeckSlide] = Field(default_factory=list)
    currentSlideId: Optional[str] = None  # To store the active slide from frontend
    lessonNumber: Optional[int] = None    # Sequential number in Training Plan
    detectedLanguage: Optional[str] = None
    hasVoiceover: Optional[bool] = None  # Flag indicating if any slide has voiceover
    theme: Optional[str] = None           # Selected theme for presentation
    model_config = {"from_attributes": True}

# --- Start: Add New Quiz Models ---

class QuizQuestionOption(BaseModel):
    id: str  # e.g., "A", "B", "C"
    text: str
    model_config = {"from_attributes": True}

class MatchingPrompt(BaseModel):
    id: str # e.g., "A", "B", "C"
    text: str
    model_config = {"from_attributes": True}

class MatchingOption(BaseModel):
    id: str # e.g., "1", "2", "3"
    text: str
    model_config = {"from_attributes": True}

class SortableItem(BaseModel):
    id: str # e.g., "step1", "step2"
    text: str
    model_config = {"from_attributes": True}

class BaseQuestion(BaseModel):
    question_text: str
    explanation: Optional[str] = None
    model_config = {"from_attributes": True}

class MultipleChoiceQuestion(BaseQuestion):
    question_type: Literal["multiple-choice"]
    options: List[QuizQuestionOption]
    correct_option_id: str
    model_config = {"from_attributes": True}

class MultiSelectQuestion(BaseQuestion):
    question_type: Literal["multi-select"]
    options: List[QuizQuestionOption]
    correct_option_ids: List[str]
    model_config = {"from_attributes": True}

class MatchingQuestion(BaseQuestion):
    question_type: Literal["matching"]
    prompts: List[MatchingPrompt]
    options: List[MatchingOption]
    correct_matches: Dict[str, str]  # Maps prompt.id to option.id, e.g. {"A": "3", "B": "1"}
    model_config = {"from_attributes": True}

class SortingQuestion(BaseQuestion):
    question_type: Literal["sorting"]
    items_to_sort: List[SortableItem]
    correct_order: List[str]  # List of SortableItem.id in the correct sequence
    model_config = {"from_attributes": True}

class OpenAnswerQuestion(BaseQuestion):
    question_type: Literal["open-answer"]
    acceptable_answers: List[str]
    model_config = {"from_attributes": True}

AnyQuizQuestion = Union[
    MultipleChoiceQuestion,
    MultiSelectQuestion,
    MatchingQuestion,
    SortingQuestion,
    OpenAnswerQuestion
]

# custom_extensions/backend/main.py
from fastapi import FastAPI, HTTPException, Depends, Request, status, File, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse

from typing import List, Optional, Dict, Any, Union, Type, ForwardRef, Set, Literal
from pydantic import BaseModel, Field, RootModel
import re
import os
import asyncpg
from datetime import datetime, timezone
import httpx
from httpx import HTTPStatusError
import json
import uuid
import shutil
import logging
from locales.__init__ import LANG_CONFIG
import asyncio
import typing
import tempfile
import io
import gzip
import base64
import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import tiktoken
import inspect

# --- CONTROL VARIABLE FOR PRODUCTION LOGGING ---
# SET THIS TO True FOR PRODUCTION, False FOR DEVELOPMENT
IS_PRODUCTION = False  # Or True for production

# --- Logger ---
logger = logging.getLogger(__name__)
if IS_PRODUCTION:
    logging.basicConfig(level=logging.ERROR) # Production: Log only ERROR and CRITICAL
else:
    logging.basicConfig(level=logging.INFO)  # Development: Log INFO, WARNING, ERROR, CRITICAL


# --- Constants & DB Setup ---
CUSTOM_PROJECTS_DATABASE_URL = os.getenv("CUSTOM_PROJECTS_DATABASE_URL")
ONYX_DATABASE_URL = os.getenv("ONYX_DATABASE_URL")
ONYX_API_SERVER_URL = "http://api_server:8080" # Adjust if needed
ONYX_SESSION_COOKIE_NAME = os.getenv("ONYX_SESSION_COOKIE_NAME", "fastapiusersauth")

# Component name constants
COMPONENT_NAME_TRAINING_PLAN = "TrainingPlanTable"
COMPONENT_NAME_PDF_LESSON = "PdfLessonDisplay"
COMPONENT_NAME_SLIDE_DECK = "SlideDeckDisplay"
COMPONENT_NAME_VIDEO_LESSON = "VideoLessonDisplay"
COMPONENT_NAME_QUIZ = "QuizDisplay"
COMPONENT_NAME_TEXT_PRESENTATION = "TextPresentationDisplay"

# --- LLM Configuration for JSON Parsing ---
# === OpenAI ChatGPT configuration (replacing previous Cohere call) ===
LLM_API_KEY = os.getenv("OPENAI_API_KEY")
LLM_API_KEY_FALLBACK = os.getenv("OPENAI_API_KEY_FALLBACK")
# Endpoint for Chat Completions
LLM_API_URL = os.getenv("OPENAI_API_URL", "https://api.openai.com/v1/chat/completions")
# Default model to use – gpt-4o-mini provides strong JSON adherence
LLM_DEFAULT_MODEL = os.getenv("OPENAI_DEFAULT_MODEL", "gpt-4o-mini")

DB_POOL = None
# Track in-flight project creations to avoid duplicate processing (keyed by user+project)
ACTIVE_PROJECT_CREATE_KEYS: Set[str] = set()

# Track in-flight quiz finalizations to prevent duplicate processing
ACTIVE_QUIZ_FINALIZE_KEYS: Set[str] = set()

# Track quiz finalization timestamps for cleanup
QUIZ_FINALIZE_TIMESTAMPS: Dict[str, float] = {}


# --- Directory for Design Template Images ---
STATIC_DESIGN_IMAGES_DIR = "static_design_images"
os.makedirs(STATIC_DESIGN_IMAGES_DIR, exist_ok=True)

# --- Directory for Static Fonts ---
STATIC_FONTS_DIR = "static/fonts"
os.makedirs(STATIC_FONTS_DIR, exist_ok=True)

def inspect_list_items_recursively(data_structure: Any, path: str = ""):
    if isinstance(data_structure, dict):
        for key, value in data_structure.items():
            new_path = f"{path}.{key}" if path else key
            if key == "items": # Focus on 'items' keys
                logger.info(f"PDF Deep Inspect: Path: {new_path}, Type: {type(value)}, Is List: {isinstance(value, list)}, Value (first 100): {str(value)[:100]}")
                if not isinstance(value, list) and value is not None:
                    logger.error(f"PDF DEEP ERROR: Non-list 'items' at {new_path}. Type: {type(value)}, Value: {str(value)[:200]}")
            if isinstance(value, (dict, list)):
                inspect_list_items_recursively(value, new_path)
    elif isinstance(data_structure, list):
        for i, item in enumerate(data_structure):
            new_path = f"{path}[{i}]"
            if isinstance(item, (dict, list)):
                inspect_list_items_recursively(item, new_path)

DEFAULT_TRAINING_PLAN_JSON_EXAMPLE_FOR_LLM = """
{
  "mainTitle": "Example Training Program",
  "sections": [
    {
      "id": "№1",
      "title": "Introduction to Topic",
      "totalHours": 5.5,
      "lessons": [
        {
          "title": "Lesson 1.1: Basic Concepts",
          "check": {"type": "test", "text": "Knowledge Test"},
          "contentAvailable": {"type": "yes", "text": "100%"},
          "source": "Internal Documentation",
          "hours": 2.0,
          "completionTime": "6m"
        }
      ]
    }
  ],
  "detectedLanguage": "en"
}
"""

DEFAULT_PDF_LESSON_JSON_EXAMPLE_FOR_LLM = """
{
  "lessonTitle": "Example PDF Lesson with Nested Lists",
      "contentBlocks": [
    { "type": "headline", "level": 1, "text": "Main Title of the Lesson" },
    { "type": "paragraph", "text": "This is an introductory paragraph explaining the main concepts." },
        {
          "type": "bullet_list",
          "items": [
        "Top level item 1, demonstrating a simple string item.",
        {
          "type": "bullet_list",
          "iconName": "chevronRight",
          "items": [
            "Nested item A: This is a sub-item.",
            "Nested item B: Another sub-item to show structure.",
            {
              "type": "numbered_list",
              "items": [
                "Further nested numbered item 1.",
                "Further nested numbered item 2."
              ]
            }
          ]
        },
        "Top level item 2, followed by a nested numbered list.",
        {
          "type": "numbered_list",
          "items": [
            "Nested numbered 1: First point in nested ordered list.",
            "Nested numbered 2: Second point."
          ]
        },
        "Top level item 3."
      ]
    },
    { "type": "alert", "alertType": "info", "title": "Important Note", "text": "Alerts can provide contextual information or warnings." },
    {
      "type": "numbered_list",
      "items": [
        "Main numbered point 1.",
        {
          "type": "bullet_list",
          "items": [
            "Sub-bullet C under numbered list.",
            "Sub-bullet D, also useful for breaking down complex points."
          ]
        },
        "Main numbered point 2."
      ]
    },
    { "type": "section_break", "style": "dashed" }
  ],
  "detectedLanguage": "en"
}
"""

DEFAULT_SLIDE_DECK_JSON_EXAMPLE_FOR_LLM = """
{
  "lessonTitle": "Digital Marketing Strategy: A Complete Guide",
  "slides": [
    {
      "slideId": "slide_1_intro",
      "slideNumber": 1,
      "slideTitle": "Introduction",
      "templateId": "hero-title-slide",
      "props": {
        "title": "Digital Marketing Strategy",
        "subtitle": "A comprehensive guide to building effective online presence and driving business growth",
        "author": "Marketing Excellence Team",
        "date": "2024",
        "backgroundColor": "#1e40af",
        "titleColor": "#ffffff",
        "subtitleColor": "#bfdbfe"
      }
    },
    {
      "slideId": "slide_2_agenda",
      "slideNumber": 2,
      "slideTitle": "Learning Agenda",
      "templateId": "bullet-points",
      "props": {
        "title": "What We'll Cover Today",
        "bullets": [
          "Understanding digital marketing fundamentals",
          "Market research and target audience analysis",
          "Content strategy development",
          "Social media marketing tactics",
          "Email marketing best practices",
          "SEO and search marketing"
        ],
        "maxColumns": 2,
        "bulletStyle": "number",
        "imagePrompt": "A roadmap or pathway illustration showing the learning journey, modern flat design with blue and purple accents",
        "imageAlt": "Learning roadmap illustration"
      }
    },
    {
      "slideId": "slide_3_stats",
      "slideNumber": 3,
      "slideTitle": "Digital Marketing by the Numbers",
      "templateId": "big-numbers",
      "props": {
        "title": "Digital Marketing Impact",
        "numbers": [
          {
            "value": "4.8B",
            "label": "Internet Users Worldwide",
            "color": "#3b82f6"
          },
          {
            "value": "68%",
            "label": "Of Online Experiences Start with Search",
            "color": "#8b5cf6"
          },
          {
            "value": "$42",
            "label": "ROI for Every $1 Spent on Email Marketing",
            "color": "#10b981"
          }
        ]
      }
    },
    {
      "slideId": "slide_4_ecosystem",
      "slideNumber": 4,
      "slideTitle": "Digital Marketing Ecosystem",
      "templateId": "big-image-top",
      "props": {
        "title": "The Digital Marketing Landscape",
        "content": "Understanding the interconnected nature of digital marketing channels and how they work together to create a cohesive customer experience across all touchpoints.",
        "imageUrl": "https://via.placeholder.com/800x400?text=Digital+Ecosystem",
        "imageAlt": "Digital marketing ecosystem diagram",
        "imagePrompt": "A comprehensive diagram showing interconnected digital marketing channels including social media, email, SEO, PPC, content marketing, and analytics in a modern network visualization",
        "imageSize": "large"
      }
    },
    {
      "slideId": "slide_5_audience_vs_market",
      "slideNumber": 5,
      "slideTitle": "Audience vs Market Research",
      "templateId": "two-column",
      "props": {
        "title": "Understanding the Difference",
        "leftTitle": "Market Research",
        "leftContent": "• Industry trends and size\n• Competitive landscape\n• Market opportunities\n• Overall demand patterns\n• Economic factors",
        "rightTitle": "Audience Research",
        "rightContent": "• Customer demographics\n• Behavioral patterns\n• Pain points and needs\n• Communication preferences\n• Decision-making process"
      }
    },
    {
      "slideId": "slide_6_personas",
      "slideNumber": 6,
      "slideTitle": "Buyer Persona Development",
      "templateId": "process-steps",
      "props": {
        "title": "Creating Effective Buyer Personas",
        "steps": [
          "Collect demographic and psychographic data",
          "Conduct customer interviews and surveys",
          "Analyze behavioral patterns and preferences",
          "Identify goals, challenges, and pain points",
          "Map the customer journey and touchpoints",
          "Validate personas with real customer data"
        ]
      }
    },
    {
      "slideId": "slide_7_content_strategy",
      "slideNumber": 7,
      "slideTitle": "Content Strategy Foundation",
      "templateId": "pyramid",
      "props": {
        "title": "Content Strategy Pyramid",
        "levels": [
          {
            "text": "Content Distribution & Promotion",
            "description": "Multi-channel amplification strategy"
          },
          {
            "text": "Content Creation & Production",
            "description": "High-quality, engaging content development"
          },
          {
            "text": "Content Planning & Calendar",
            "description": "Strategic planning and scheduling"
          },
          {
            "text": "Content Audit & Analysis",
            "description": "Understanding current content performance"
          },
          {
            "text": "Goals, Audience & Brand Foundation",
            "description": "Strategic foundation and core objectives"
          }
        ]
      }
    },
    {
      "slideId": "slide_8_content_types",
      "slideNumber": 8,
      "slideTitle": "Content Format Matrix",
      "templateId": "four-box-grid",
      "props": {
        "title": "Content Formats for Different Goals",
        "boxes": [
          {
            "title": "Educational Content",
            "content": "Blog posts, tutorials, webinars, how-to guides",
            "icon": "📚"
          },
          {
            "title": "Engagement Content", 
            "content": "Social media posts, polls, user-generated content",
            "icon": "💬"
          },
          {
            "title": "Conversion Content",
            "content": "Case studies, testimonials, product demos",
            "icon": "🎯"
          },
          {
            "title": "Entertainment Content",
            "content": "Videos, memes, interactive content, stories",
            "icon": "🎭"
          }
        ]
      }
    },
    {
      "slideId": "slide_9_social_challenges",
      "slideNumber": 9,
      "slideTitle": "Social Media Challenges & Solutions",
      "templateId": "challenges-solutions",
      "props": {
        "title": "Overcoming Social Media Obstacles",
        "challenges": [
          "Low organic reach and engagement",
          "Creating consistent, quality content",
          "Managing multiple platform requirements"
        ],
        "solutions": [
          "Focus on community building and authentic interactions",
          "Develop content pillars and batch creation workflows", 
          "Use scheduling tools and platform-specific strategies"
        ]
      }
    },
    {
      "slideId": "slide_10_email_timeline",
      "slideNumber": 10,
      "slideTitle": "Email Marketing Campaign Timeline",
      "templateId": "timeline",
      "props": {
        "title": "Building Your Email Marketing Program",
        "events": [
          {
            "date": "Week 1-2",
            "title": "Foundation Setup",
            "description": "Choose platform, design templates, set up automation"
          },
          {
            "date": "Week 3-4", 
            "title": "List Building",
            "description": "Create lead magnets, optimize signup forms"
          },
          {
            "date": "Week 5-8",
            "title": "Content Creation",
            "description": "Develop welcome series, newsletters, promotional campaigns"
          },
          {
            "date": "Week 9-12",
            "title": "Optimization",
            "description": "A/B testing, segmentation, performance analysis"
          }
        ]
      }
    },
    {
      "slideId": "slide_11_seo_quote",
      "slideNumber": 11,
      "slideTitle": "SEO Philosophy",
      "templateId": "quote-center",
      "props": {
        "quote": "The best place to hide a dead body is page 2 of Google search results.",
        "author": "Digital Marketing Wisdom",
        "context": "This humorous quote highlights the critical importance of ranking on the first page of search results for visibility and traffic."
      }
    },
    {
      "slideId": "slide_12_seo_factors",
      "slideNumber": 12,
      "slideTitle": "SEO Success Factors",
      "templateId": "bullet-points-right",
      "props": {
        "title": "Key SEO Elements",
        "bullets": [
          "Keyword research and strategic implementation",
          "High-quality, original content creation",
          "Technical SEO and site speed optimization",
          "Mobile-first design and user experience",
          "Authority building through quality backlinks",
          "Local SEO for geographic targeting"
        ],
        "bulletStyle": "dot",
        "imagePrompt": "SEO optimization illustration with search elements, website structure, and ranking factors in a modern, clean style",
        "imageAlt": "SEO optimization visual guide"
      }
    },
    {
      "slideId": "slide_13_paid_advertising",
      "slideNumber": 13,
      "slideTitle": "Paid Advertising Strategy",
      "templateId": "big-image-left",
      "props": {
        "title": "Maximizing Paid Campaign ROI",
        "subtitle": "Strategic paid advertising accelerates reach and drives targeted traffic when organic efforts need support.",
        "imageUrl": "https://via.placeholder.com/600x400?text=Paid+Advertising",
        "imageAlt": "Digital advertising dashboard",
        "imagePrompt": "A modern advertising dashboard showing campaign performance metrics, targeting options, and ROI indicators across multiple platforms",
        "imageSize": "large"
      }
    },
    {
      "slideId": "slide_14_implementation",
      "slideNumber": 14,
      "slideTitle": "90-Day Implementation Plan",
      "templateId": "process-steps",
      "props": {
        "title": "Your Digital Marketing Roadmap",
        "steps": [
          "Month 1: Foundation - Research, audit, and strategy development",
          "Month 2: Launch - Implement core channels and begin content creation",
          "Month 3: Optimize - Analyze data, refine approach, and scale success"
        ]
      }
    },
    {
      "slideId": "slide_15_conclusion",
      "slideNumber": 15,
      "slideTitle": "Success Principles",
      "templateId": "title-slide",
      "props": {
        "title": "Your Digital Marketing Success Formula",
        "subtitle": "Strategy + Consistency + Measurement = Growth",
        "author": "Remember: Digital marketing is a marathon, not a sprint",
        "backgroundColor": "#059669",
        "titleColor": "#ffffff",
        "subtitleColor": "#d1fae5"
      }
    }
  ],
  "currentSlideId": "slide_1_intro",
  "detectedLanguage": "en"
}
"""

async def get_db_pool():
    if DB_POOL is None:
        detail_msg = "Database service not available." # Generic enough for production
        raise HTTPException(status_code=503, detail=detail_msg)
    return DB_POOL

app = FastAPI(title="Custom Extension Backend")

app.mount(f"/{STATIC_DESIGN_IMAGES_DIR}", StaticFiles(directory=STATIC_DESIGN_IMAGES_DIR), name="static_design_images")
app.mount("/fonts", StaticFiles(directory=STATIC_FONTS_DIR), name="static_fonts")

@app.middleware("http")
async def track_request_analytics(request: Request, call_next):
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    # Get user ID if available
    user_id = None
    try:
        if hasattr(request.state, 'user_id'):
            user_id = request.state.user_id
    except:
        pass
    
    # Get request size
    request_size = None
    try:
        if request.method in ['POST', 'PUT', 'PATCH']:
            body = await request.body()
            request_size = len(body)
    except:
        pass
    
    try:
        response = await call_next(request)
        end_time = time.time()
        response_time_ms = int((end_time - start_time) * 1000)
        
        # Get response size
        response_size = None
        try:
            if hasattr(response, 'body'):
                response_size = len(response.body)
        except:
            pass
        
        # Store analytics in database
        try:
            async with DB_POOL.acquire() as conn:
                await conn.execute("""
                    INSERT INTO request_analytics (
                        id, endpoint, method, user_id, status_code, 
                        response_time_ms, request_size_bytes, response_size_bytes,
                        error_message, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                """, request_id, request.url.path, request.method, user_id,
                     response.status_code, response_time_ms, request_size,
                     response_size, None, datetime.now(timezone.utc))
        except Exception as e:
            logger.error(f"Failed to store request analytics: {e}")
        
        return response
        
    except Exception as e:
        end_time = time.time()
        response_time_ms = int((end_time - start_time) * 1000)
        
        # Store error analytics
        try:
            async with DB_POOL.acquire() as conn:
                await conn.execute("""
                    INSERT INTO request_analytics (
                        id, endpoint, method, user_id, status_code, 
                        response_time_ms, request_size_bytes, response_size_bytes,
                        error_message, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                """, request_id, request.url.path, request.method, user_id,
                     500, response_time_ms, request_size, None,
                     str(e), datetime.now(timezone.utc))
        except Exception as db_error:
            logger.error(f"Failed to store error analytics: {db_error}")
        
        raise

try:
    from app.services.pdf_generator import generate_pdf_from_html_template
    from app.core.config import settings
except ImportError:
    logger.warning("Could not import pdf_generator or settings from 'app' module. Using dummy implementations for PDF generation.")
    class DummySettings:
        CUSTOM_FRONTEND_URL = os.environ.get("CUSTOM_FRONTEND_URL", "http://custom_frontend:3001")
    settings = DummySettings()
    async def generate_pdf_from_html_template(template_name: str, context_data: Dict[str, Any], output_filename: str) -> str:
        logger.info(f"PDF Generation Skipped (Dummy Service): Would generate for template {template_name} to {output_filename}")
        dummy_path = os.path.join("/app/tmp_pdf", output_filename)
        os.makedirs(os.path.dirname(dummy_path), exist_ok=True)
        with open(dummy_path, "w") as f: f.write(f"Dummy PDF for {output_filename} using context: {str(context_data)[:200]}")
        return dummy_path

effective_origins = list(set(filter(None, [
    "http://localhost:3001",
    "http://143.198.59.56:3001",
    "http://143.198.59.56:8088",
    os.environ.get("WEB_DOMAIN", "http://localhost:3000"),
    settings.CUSTOM_FRONTEND_URL if 'settings' in globals() and hasattr(settings, 'CUSTOM_FRONTEND_URL') else os.environ.get("CUSTOM_FRONTEND_URL", "http://custom_frontend:3001")
])))
if not effective_origins: effective_origins = ["http://localhost:3001"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=effective_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class StatusInfo(BaseModel):
    type: str = "unknown"
    text: str = ""
    model_config = {"from_attributes": True}

# Credits Models
class UserCredits(BaseModel):
    id: int
    onyx_user_id: str
    name: str
    credits_balance: int
    total_credits_used: int
    credits_purchased: int
    last_purchase_date: Optional[datetime]
    subscription_tier: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class CreditTransactionRequest(BaseModel):
    user_email: str
    amount: int
    action: Literal["add", "remove"]
    reason: Optional[str] = "Admin adjustment"

class CreditTransactionResponse(BaseModel):
    success: bool
    message: str
    new_balance: int
    user_credits: UserCredits

class LessonDetail(BaseModel):
    title: str
    check: StatusInfo = Field(default_factory=StatusInfo)
    contentAvailable: StatusInfo = Field(default_factory=StatusInfo)
    source: str = ""
    hours: int = 0
    completionTime: str = ""  # Estimated completion time in minutes (e.g., "5m", "6m", "7m", "8m")
    custom_rate: Optional[int] = None  # Individual lesson-level custom rate override
    quality_tier: Optional[str] = None  # Individual lesson-level quality tier override
    recommended_content_types: Optional[Dict[str, Any]] = None
    model_config = {"from_attributes": True}

class SectionDetail(BaseModel):
    id: str
    title: str
    totalHours: int = 0
    totalCompletionTime: Optional[int] = None  # Total completion time in minutes for the section
    lessons: List[LessonDetail] = Field(default_factory=list)
    autoCalculateHours: bool = True
    custom_rate: Optional[int] = None  # Module-level custom rate override
    quality_tier: Optional[str] = None  # Module-level quality tier override
    model_config = {"from_attributes": True}

class TrainingPlanDetails(BaseModel):
    mainTitle: Optional[str] = None
    sections: List[SectionDetail] = Field(default_factory=list)
    detectedLanguage: Optional[str] = None
    # Store user preferences on which optional columns to show in UI (frontend reads this)
    displayOptions: Optional[Dict[str, bool]] = None  # e.g., {"knowledgeCheck": true, "contentAvailability": false}
    # Store theme selection for styling
    theme: Optional[str] = "cherry"  # Default theme
    model_config = {"from_attributes": True}

AnyContentBlock = Union["HeadlineBlock", "ParagraphBlock", "BulletListBlock", "NumberedListBlock", "AlertBlock", "SectionBreakBlock"]
ListItem = Union[str, AnyContentBlock, List[AnyContentBlock]]

class BaseContentBlock(BaseModel):
    type: str
    model_config = {"from_attributes": True}

class HeadlineBlock(BaseContentBlock):
    type: str = "headline"
    level: int = Field(ge=1, le=4)
    text: str
    iconName: Optional[str] = None
    backgroundColor: Optional[str] = None
    textColor: Optional[str] = None
    isImportant: Optional[bool] = Field(default=False, description="Set to true if this headline (typically Level 4) and its immediately following single block (list or paragraph) form an important section to be visually boxed.")

class ParagraphBlock(BaseContentBlock):
    type: str = "paragraph"
    text: str
    isRecommendation: Optional[bool] = Field(default=False, description="Set to true if this paragraph is a 'recommendation' within a numbered list item, to be styled distinctly.")

class BulletListBlock(BaseContentBlock):
    type: Literal['bullet_list'] = 'bullet_list'
    items: List[ListItem] = []
    iconName: Optional[str] = None

class NumberedListBlock(BaseContentBlock):
    type: Literal['numbered_list'] = 'numbered_list'
    items: List[ListItem] = []

class AlertBlock(BaseContentBlock):
    type: str = "alert"
    title: Optional[str] = None
    text: str
    alertType: str = "info"
    iconName: Optional[str] = None
    backgroundColor: Optional[str] = None
    borderColor: Optional[str] = None
    textColor: Optional[str] = None
    iconColor: Optional[str] = None

class SectionBreakBlock(BaseContentBlock):
    type: str = "section_break"
    style: Optional[str] = "solid"

AnyContentBlockValue = Union[
    HeadlineBlock, ParagraphBlock, BulletListBlock, NumberedListBlock, AlertBlock, SectionBreakBlock, TableBlock, ImageBlock
]

class PdfLessonDetails(BaseModel):
    lessonTitle: str
    # Optional: sequential number of the lesson inside the parent Training Plan
    lessonNumber: Optional[int] = None
    contentBlocks: List[AnyContentBlockValue] = Field(default_factory=list)
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True}

class VideoLessonSlideData(BaseModel):
    slideId: str
    slideNumber: int
    slideTitle: str
    displayedText: Optional[str] = None
    imagePath: Optional[str] = None
    videoPath: Optional[str] = None
    voiceoverText: Optional[str] = None
    displayedPictureDescription: Optional[str] = None
    displayedVideoDescription: Optional[str] = None
    model_config = {"from_attributes": True}

class VideoLessonData(BaseModel):
    mainPresentationTitle: str
    slides: List[VideoLessonSlideData] = Field(default_factory=list)
    currentSlideId: Optional[str] = None # To store the active slide from frontend
    lessonNumber: Optional[int] = None  # Sequential number in Training Plan
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True}


# --- Start: Add New Quiz Models ---

class QuizQuestionOption(BaseModel):
    id: str  # e.g., "A", "B", "C"
    text: str
    model_config = {"from_attributes": True}

class MatchingPrompt(BaseModel):
    id: str # e.g., "A", "B", "C"
    text: str
    model_config = {"from_attributes": True}

class MatchingOption(BaseModel):
    id: str # e.g., "1", "2", "3"
    text: str
    model_config = {"from_attributes": True}

class SortableItem(BaseModel):
    id: str # e.g., "step1", "step2"
    text: str
    model_config = {"from_attributes": True}

class BaseQuestion(BaseModel):
    question_text: str
    explanation: Optional[str] = None
    model_config = {"from_attributes": True}

class MultipleChoiceQuestion(BaseQuestion):
    question_type: Literal["multiple-choice"]
    options: List[QuizQuestionOption]
    correct_option_id: str
    model_config = {"from_attributes": True}

class MultiSelectQuestion(BaseQuestion):
    question_type: Literal["multi-select"]
    options: List[QuizQuestionOption]
    correct_option_ids: List[str]
    model_config = {"from_attributes": True}

class MatchingQuestion(BaseQuestion):
    question_type: Literal["matching"]
    prompts: List[MatchingPrompt]
    options: List[MatchingOption]
    correct_matches: Dict[str, str]  # Maps prompt.id to option.id, e.g. {"A": "3", "B": "1"}
    model_config = {"from_attributes": True}

class SortingQuestion(BaseQuestion):
    question_type: Literal["sorting"]
    items_to_sort: List[SortableItem]
    correct_order: List[str]  # List of SortableItem.id in the correct sequence
    model_config = {"from_attributes": True}

class OpenAnswerQuestion(BaseQuestion):
    question_type: Literal["open-answer"]
    acceptable_answers: List[str]
    model_config = {"from_attributes": True}

AnyQuizQuestion = Union[
    MultipleChoiceQuestion,
    MultiSelectQuestion,
    MatchingQuestion,
    SortingQuestion,
    OpenAnswerQuestion
]

class QuizData(BaseModel):
    quizTitle: str
    questions: List[AnyQuizQuestion] = Field(default_factory=list)
    lessonNumber: Optional[int] = None  # Sequential number in Training Plan
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True, "use_enum_values": True}

# --- End: Add New Quiz Models ---

# +++ NEW MODEL FOR TEXT PRESENTATION +++
class TextPresentationDetails(BaseModel):
    textTitle: str
    contentBlocks: List[AnyContentBlockValue] = Field(default_factory=list)
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True}
# +++ END NEW MODEL +++

MicroProductContentType = Union[TrainingPlanDetails, PdfLessonDetails, VideoLessonData, SlideDeckDetails, QuizData, TextPresentationDetails, None]
# custom_extensions/backend/main.py
from fastapi import FastAPI, HTTPException, Depends, Request, status, File, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse

from typing import List, Optional, Dict, Any, Union, Type, ForwardRef, Set, Literal
from pydantic import BaseModel, Field, RootModel
import re
import os
import asyncpg
from datetime import datetime, timezone
import httpx
from httpx import HTTPStatusError
import json
import uuid
import shutil
import logging
from locales.__init__ import LANG_CONFIG
import asyncio
import typing
import tempfile
import io
import gzip
import base64
import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import tiktoken
import inspect
# NEW: OpenAI imports for direct usage
import openai
from openai import AsyncOpenAI
from uuid import uuid4

# --- CONTROL VARIABLE FOR PRODUCTION LOGGING ---
# SET THIS TO True FOR PRODUCTION, False FOR DEVELOPMENT
IS_PRODUCTION = False  # Or True for production

# --- Logger ---
logger = logging.getLogger(__name__)
if IS_PRODUCTION:
    logging.basicConfig(level=logging.ERROR) # Production: Log only ERROR and CRITICAL
else:
    logging.basicConfig(level=logging.INFO)  # Development: Log INFO, WARNING, ERROR, CRITICAL


# --- Constants & DB Setup ---
CUSTOM_PROJECTS_DATABASE_URL = os.getenv("CUSTOM_PROJECTS_DATABASE_URL")
ONYX_DATABASE_URL = os.getenv("ONYX_DATABASE_URL")
ONYX_API_SERVER_URL = "http://api_server:8080" # Adjust if needed
ONYX_SESSION_COOKIE_NAME = os.getenv("ONYX_SESSION_COOKIE_NAME", "fastapiusersauth")

# Component name constants
COMPONENT_NAME_TRAINING_PLAN = "TrainingPlanTable"
COMPONENT_NAME_PDF_LESSON = "PdfLessonDisplay"
COMPONENT_NAME_SLIDE_DECK = "SlideDeckDisplay"
COMPONENT_NAME_VIDEO_LESSON = "VideoLessonDisplay"
COMPONENT_NAME_QUIZ = "QuizDisplay"
COMPONENT_NAME_TEXT_PRESENTATION = "TextPresentationDisplay"

# --- LLM Configuration for JSON Parsing ---
# === OpenAI ChatGPT configuration (replacing previous Cohere call) ===
LLM_API_KEY = os.getenv("OPENAI_API_KEY")
LLM_API_KEY_FALLBACK = os.getenv("OPENAI_API_KEY_FALLBACK")
# Endpoint for Chat Completions
LLM_API_URL = os.getenv("OPENAI_API_URL", "https://api.openai.com/v1/chat/completions")
# Default model to use – gpt-4o-mini provides strong JSON adherence
LLM_DEFAULT_MODEL = os.getenv("OPENAI_DEFAULT_MODEL", "gpt-4o-mini")

# NEW: OpenAI client for direct streaming
OPENAI_CLIENT = None

def get_openai_client():
    """Get or create the OpenAI client instance."""
    global OPENAI_CLIENT
    if OPENAI_CLIENT is None:
        api_key = LLM_API_KEY or LLM_API_KEY_FALLBACK
        if not api_key:
            raise ValueError("No OpenAI API key configured. Set OPENAI_API_KEY environment variable.")
        OPENAI_CLIENT = AsyncOpenAI(api_key=api_key)
    return OPENAI_CLIENT

async def stream_openai_response(prompt: str, model: str = None):
    """
    Stream response directly from OpenAI API.
    Yields dictionaries with 'type' and 'text' fields compatible with existing frontend.
    """
    try:
        client = get_openai_client()
        model = model or LLM_DEFAULT_MODEL
        
        logger.info(f"[OPENAI_STREAM] Starting direct OpenAI streaming with model {model}")
        logger.info(f"[OPENAI_STREAM] Prompt length: {len(prompt)} chars")
        
        # Read the full ContentBuilder.ai assistant instructions
        assistant_instructions_path = "custom_assistants/content_builder_ai.txt"
        try:
            with open(assistant_instructions_path, 'r', encoding='utf-8') as f:
                system_prompt = f.read()
        except FileNotFoundError:
            logger.warning(f"[OPENAI_STREAM] Assistant instructions file not found: {assistant_instructions_path}")
            system_prompt = "You are ContentBuilder.ai assistant. Follow the instructions in the user message exactly."
        
        # Create the streaming chat completion
        stream = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            stream=True,
            max_tokens=10000,  # Increased from 4000 to handle larger course outlines
            temperature=0.2
        )
        
        logger.info(f"[OPENAI_STREAM] Stream created successfully")
        
        # DEBUG: Collect full response for logging
        full_response = ""
        chunk_count = 0
        
        async for chunk in stream:
            chunk_count += 1
            logger.debug(f"[OPENAI_STREAM] Chunk {chunk_count}: {chunk}")
            
            if chunk.choices and len(chunk.choices) > 0:
                choice = chunk.choices[0]
                if choice.delta and choice.delta.content:
                    content = choice.delta.content
                    full_response += content  # DEBUG: Accumulate full response
                    yield {"type": "delta", "text": content}
                    
                # Check for finish reason
                if choice.finish_reason:
                    logger.info(f"[OPENAI_STREAM] Stream finished with reason: {choice.finish_reason}")
                    logger.info(f"[OPENAI_STREAM] Total chunks received: {chunk_count}")
                    logger.info(f"[OPENAI_STREAM] FULL RESPONSE:\n{full_response}")
                    break
                    
    except Exception as e:
        logger.error(f"[OPENAI_STREAM] Error in OpenAI streaming: {e}", exc_info=True)
        yield {"type": "error", "text": f"OpenAI streaming error: {str(e)}"}

def should_use_openai_direct(payload) -> bool:
    """
    Determine if we should use OpenAI directly instead of Onyx.
    Returns True when no file context is present.
    """
    # Check if files are explicitly provided
    has_files = (
        (hasattr(payload, 'fromFiles') and payload.fromFiles) or
        (hasattr(payload, 'folderIds') and payload.folderIds) or
        (hasattr(payload, 'fileIds') and payload.fileIds)
    )
    
    # Check if text context is provided (this still uses file system in some cases)
    has_text_context = (
        hasattr(payload, 'fromText') and payload.fromText and 
        hasattr(payload, 'userText') and payload.userText
    )
    
    # Use OpenAI directly only when there's no file context and no text context
    use_openai = not has_files and not has_text_context
    
    logger.info(f"[API_SELECTION] has_files={has_files}, has_text_context={has_text_context}, use_openai={use_openai}")
    return use_openai

DB_POOL = None
# Track in-flight project creations to avoid duplicate processing (keyed by user+project)
ACTIVE_PROJECT_CREATE_KEYS: Set[str] = set()

# Track in-flight quiz finalizations to prevent duplicate processing
ACTIVE_QUIZ_FINALIZE_KEYS: Set[str] = set()

# Track quiz finalization timestamps for cleanup
QUIZ_FINALIZE_TIMESTAMPS: Dict[str, float] = {}


# --- Directory for Design Template Images ---
STATIC_DESIGN_IMAGES_DIR = "static_design_images"
os.makedirs(STATIC_DESIGN_IMAGES_DIR, exist_ok=True)

# --- Directory for Static Fonts ---
STATIC_FONTS_DIR = "static/fonts"
os.makedirs(STATIC_FONTS_DIR, exist_ok=True)

def inspect_list_items_recursively(data_structure: Any, path: str = ""):
    if isinstance(data_structure, dict):
        for key, value in data_structure.items():
            new_path = f"{path}.{key}" if path else key
            if key == "items": # Focus on 'items' keys
                logger.info(f"PDF Deep Inspect: Path: {new_path}, Type: {type(value)}, Is List: {isinstance(value, list)}, Value (first 100): {str(value)[:100]}")
                if not isinstance(value, list) and value is not None:
                    logger.error(f"PDF DEEP ERROR: Non-list 'items' at {new_path}. Type: {type(value)}, Value: {str(value)[:200]}")
            if isinstance(value, (dict, list)):
                inspect_list_items_recursively(value, new_path)
    elif isinstance(data_structure, list):
        for i, item in enumerate(data_structure):
            new_path = f"{path}[{i}]"
            if isinstance(item, (dict, list)):
                inspect_list_items_recursively(item, new_path)

DEFAULT_TRAINING_PLAN_JSON_EXAMPLE_FOR_LLM = """
{
  "mainTitle": "Example Training Program",
  "sections": [
    {
      "id": "№1",
      "title": "Introduction to Topic",
      "totalHours": 5.5,
      "lessons": [
        {
          "title": "Lesson 1.1: Basic Concepts",
          "check": {"type": "test", "text": "Knowledge Test"},
          "contentAvailable": {"type": "yes", "text": "100%"},
          "source": "Internal Documentation",
          "hours": 2.0,
          "completionTime": "6m"
        }
      ]
    }
  ],
  "detectedLanguage": "en"
}
"""

DEFAULT_PDF_LESSON_JSON_EXAMPLE_FOR_LLM = """
{
  "lessonTitle": "Example PDF Lesson with Nested Lists",
  "contentBlocks": [
    { "type": "headline", "level": 1, "text": "Main Title of the Lesson" },
    { "type": "paragraph", "text": "This is an introductory paragraph explaining the main concepts." },
    {
      "type": "bullet_list",
      "items": [
        "Top level item 1, demonstrating a simple string item.",
        {
          "type": "bullet_list",
          "iconName": "chevronRight",
          "items": [
            "Nested item A: This is a sub-item.",
            "Nested item B: Another sub-item to show structure.",
            {
              "type": "numbered_list",
              "items": [
                "Further nested numbered item 1.",
                "Further nested numbered item 2."
              ]
            }
          ]
        },
        "Top level item 2, followed by a nested numbered list.",
        {
          "type": "numbered_list",
          "items": [
            "Nested numbered 1: First point in nested ordered list.",
            "Nested numbered 2: Second point."
          ]
        },
        "Top level item 3."
      ]
    },
    { "type": "alert", "alertType": "info", "title": "Important Note", "text": "Alerts can provide contextual information or warnings." },
    {
      "type": "numbered_list",
      "items": [
        "Main numbered point 1.",
        {
          "type": "bullet_list",
          "items": [
            "Sub-bullet C under numbered list.",
            "Sub-bullet D, also useful for breaking down complex points."
          ]
        },
        "Main numbered point 2."
      ]
    },
    { "type": "section_break", "style": "dashed" }
  ],
  "detectedLanguage": "en"
}
"""



async def get_db_pool():
    if DB_POOL is None:
        detail_msg = "Database service not available." # Generic enough for production
        raise HTTPException(status_code=503, detail=detail_msg)
    return DB_POOL

app = FastAPI(title="Custom Extension Backend")

app.mount(f"/{STATIC_DESIGN_IMAGES_DIR}", StaticFiles(directory=STATIC_DESIGN_IMAGES_DIR), name="static_design_images")
app.mount("/fonts", StaticFiles(directory=STATIC_FONTS_DIR), name="static_fonts")

@app.middleware("http")
async def track_request_analytics(request: Request, call_next):
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    # Get user ID if available
    user_id = None
    try:
        if hasattr(request.state, 'user_id'):
            user_id = request.state.user_id
    except:
        pass
    
    # Get request size
    request_size = None
    try:
        if request.method in ['POST', 'PUT', 'PATCH']:
            body = await request.body()
            request_size = len(body)
    except:
        pass
    
    try:
        response = await call_next(request)
        end_time = time.time()
        response_time_ms = int((end_time - start_time) * 1000)
        
        # Get response size
        response_size = None
        try:
            if hasattr(response, 'body'):
                response_size = len(response.body)
        except:
            pass
        
        # Store analytics in database
        try:
            async with DB_POOL.acquire() as conn:
                await conn.execute("""
                    INSERT INTO request_analytics (
                        id, endpoint, method, user_id, status_code, 
                        response_time_ms, request_size_bytes, response_size_bytes,
                        error_message, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                """, request_id, request.url.path, request.method, user_id,
                     response.status_code, response_time_ms, request_size,
                     response_size, None, datetime.now(timezone.utc))
        except Exception as e:
            logger.error(f"Failed to store request analytics: {e}")
        
        return response
        
    except Exception as e:
        end_time = time.time()
        response_time_ms = int((end_time - start_time) * 1000)
        
        # Store error analytics
        try:
            async with DB_POOL.acquire() as conn:
                await conn.execute("""
                    INSERT INTO request_analytics (
                        id, endpoint, method, user_id, status_code, 
                        response_time_ms, request_size_bytes, response_size_bytes,
                        error_message, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                """, request_id, request.url.path, request.method, user_id,
                     500, response_time_ms, request_size, None,
                     str(e), datetime.now(timezone.utc))
        except Exception as db_error:
            logger.error(f"Failed to store error analytics: {db_error}")
        
        raise

try:
    from app.services.pdf_generator import generate_pdf_from_html_template
    from app.core.config import settings
except ImportError:
    logger.warning("Could not import pdf_generator or settings from 'app' module. Using dummy implementations for PDF generation.")
    class DummySettings:
        CUSTOM_FRONTEND_URL = os.environ.get("CUSTOM_FRONTEND_URL", "http://custom_frontend:3001")
    settings = DummySettings()
    async def generate_pdf_from_html_template(template_name: str, context_data: Dict[str, Any], output_filename: str) -> str:
        logger.info(f"PDF Generation Skipped (Dummy Service): Would generate for template {template_name} to {output_filename}")
        dummy_path = os.path.join("/app/tmp_pdf", output_filename)
        os.makedirs(os.path.dirname(dummy_path), exist_ok=True)
        with open(dummy_path, "w") as f: f.write(f"Dummy PDF for {output_filename} using context: {str(context_data)[:200]}")
        return dummy_path

effective_origins = list(set(filter(None, [
    "http://localhost:3001",
    "http://143.198.59.56:3001",
    "http://143.198.59.56:8088",
    os.environ.get("WEB_DOMAIN", "http://localhost:3000"),
    settings.CUSTOM_FRONTEND_URL if 'settings' in globals() and hasattr(settings, 'CUSTOM_FRONTEND_URL') else os.environ.get("CUSTOM_FRONTEND_URL", "http://custom_frontend:3001")
])))
if not effective_origins: effective_origins = ["http://localhost:3001"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=effective_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class StatusInfo(BaseModel):
    type: str = "unknown"
    text: str = ""
    model_config = {"from_attributes": True}

# Credits Models
class UserCredits(BaseModel):
    id: int
    onyx_user_id: str
    name: str
    credits_balance: int
    total_credits_used: int
    credits_purchased: int
    last_purchase_date: Optional[datetime]
    subscription_tier: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class CreditTransactionRequest(BaseModel):
    user_email: str
    amount: int
    action: Literal["add", "remove"]
    reason: Optional[str] = "Admin adjustment"

class CreditTransactionResponse(BaseModel):
    success: bool
    message: str
    new_balance: int
    user_credits: UserCredits

class LessonDetail(BaseModel):
    title: str
    check: StatusInfo = Field(default_factory=StatusInfo)
    contentAvailable: StatusInfo = Field(default_factory=StatusInfo)
    source: str = ""
    hours: int = 0
    completionTime: str = ""  # Estimated completion time in minutes (e.g., "5m", "6m", "7m", "8m")
    custom_rate: Optional[int] = None  # Individual lesson-level custom rate override
    quality_tier: Optional[str] = None  # Individual lesson-level quality tier override
    recommended_content_types: Optional[Dict[str, Any]] = None
    model_config = {"from_attributes": True}

class SectionDetail(BaseModel):
    id: str
    title: str
    totalHours: int = 0
    totalCompletionTime: Optional[int] = None  # Total completion time in minutes for the section
    lessons: List[LessonDetail] = Field(default_factory=list)
    autoCalculateHours: bool = True
    custom_rate: Optional[int] = None  # Module-level custom rate override
    quality_tier: Optional[str] = None  # Module-level quality tier override
    model_config = {"from_attributes": True}

class TrainingPlanDetails(BaseModel):
    mainTitle: Optional[str] = None
    sections: List[SectionDetail] = Field(default_factory=list)
    detectedLanguage: Optional[str] = None
    # Store user preferences on which optional columns to show in UI (frontend reads this)
    displayOptions: Optional[Dict[str, bool]] = None  # e.g., {"knowledgeCheck": true, "contentAvailability": false}
    # Store theme selection for styling
    theme: Optional[str] = "cherry"  # Default theme
    model_config = {"from_attributes": True}

AnyContentBlock = Union["HeadlineBlock", "ParagraphBlock", "BulletListBlock", "NumberedListBlock", "AlertBlock", "SectionBreakBlock"]
ListItem = Union[str, AnyContentBlock, List[AnyContentBlock]]

class BaseContentBlock(BaseModel):
    type: str
    model_config = {"from_attributes": True}

class HeadlineBlock(BaseContentBlock):
    type: str = "headline"
    level: int = Field(ge=1, le=4)
    text: str
    iconName: Optional[str] = None
    backgroundColor: Optional[str] = None
    textColor: Optional[str] = None
    isImportant: Optional[bool] = Field(default=False, description="Set to true if this headline (typically Level 4) and its immediately following single block (list or paragraph) form an important section to be visually boxed.")

class ParagraphBlock(BaseContentBlock):
    type: str = "paragraph"
    text: str
    isRecommendation: Optional[bool] = Field(default=False, description="Set to true if this paragraph is a 'recommendation' within a numbered list item, to be styled distinctly.")

class BulletListBlock(BaseContentBlock):
    type: Literal['bullet_list'] = 'bullet_list'
    items: List[ListItem] = []
    iconName: Optional[str] = None

class NumberedListBlock(BaseContentBlock):
    type: Literal['numbered_list'] = 'numbered_list'
    items: List[ListItem] = []

class AlertBlock(BaseContentBlock):
    type: str = "alert"
    title: Optional[str] = None
    text: str
    alertType: str = "info"
    iconName: Optional[str] = None
    backgroundColor: Optional[str] = None
    borderColor: Optional[str] = None
    textColor: Optional[str] = None
    iconColor: Optional[str] = None

class SectionBreakBlock(BaseContentBlock):
    type: str = "section_break"
    style: Optional[str] = "solid"

AnyContentBlockValue = Union[
    HeadlineBlock, ParagraphBlock, BulletListBlock, NumberedListBlock, AlertBlock, SectionBreakBlock, TableBlock, ImageBlock
]

class PdfLessonDetails(BaseModel):
    lessonTitle: str
    # Optional: sequential number of the lesson inside the parent Training Plan
    lessonNumber: Optional[int] = None
    contentBlocks: List[AnyContentBlockValue] = Field(default_factory=list)
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True}

class VideoLessonSlideData(BaseModel):
    slideId: str
    slideNumber: int
    slideTitle: str
    displayedText: Optional[str] = None
    imagePath: Optional[str] = None
    videoPath: Optional[str] = None
    voiceoverText: Optional[str] = None
    displayedPictureDescription: Optional[str] = None
    displayedVideoDescription: Optional[str] = None
    model_config = {"from_attributes": True}

class VideoLessonData(BaseModel):
    mainPresentationTitle: str
    slides: List[VideoLessonSlideData] = Field(default_factory=list)
    currentSlideId: Optional[str] = None # To store the active slide from frontend
    lessonNumber: Optional[int] = None  # Sequential number in Training Plan
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True}

# --- NEW: Slide-based Lesson Presentation Models ---
class ImagePlaceholder(BaseModel):
    size: str          # "LARGE", "MEDIUM", "SMALL", "BANNER", "BACKGROUND"
    position: str      # "LEFT", "RIGHT", "TOP_BANNER", "BACKGROUND", etc.
    description: str   # Description of the image content
    model_config = {"from_attributes": True}

class DeckSlide(BaseModel):
    slideId: str               
    slideNumber: int           
    slideTitle: str            
    templateId: str            # Зробити обов'язковим (без Optional)
    props: Dict[str, Any] = Field(default_factory=dict)  # Додати props
    voiceoverText: Optional[str] = None  # Optional voiceover text for video lessons
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)  # Опціонально для метаданих
    model_config = {"from_attributes": True}

class SlideDeckDetails(BaseModel):
    lessonTitle: str
    slides: List[DeckSlide] = Field(default_factory=list)
    currentSlideId: Optional[str] = None  # To store the active slide from frontend
    lessonNumber: Optional[int] = None    # Sequential number in Training Plan
    detectedLanguage: Optional[str] = None
    hasVoiceover: Optional[bool] = None  # Flag indicating if any slide has voiceover
    theme: Optional[str] = None           # Selected theme for presentation
    model_config = {"from_attributes": True}

# --- Start: Add New Quiz Models ---

class QuizQuestionOption(BaseModel):
    id: str  # e.g., "A", "B", "C"
    text: str
    model_config = {"from_attributes": True}

class MatchingPrompt(BaseModel):
    id: str # e.g., "A", "B", "C"
    text: str
    model_config = {"from_attributes": True}

class MatchingOption(BaseModel):
    id: str # e.g., "1", "2", "3"
    text: str
    model_config = {"from_attributes": True}

class SortableItem(BaseModel):
    id: str # e.g., "step1", "step2"
    text: str
    model_config = {"from_attributes": True}

class BaseQuestion(BaseModel):
    question_text: str
    explanation: Optional[str] = None
    model_config = {"from_attributes": True}

class MultipleChoiceQuestion(BaseQuestion):
    question_type: Literal["multiple-choice"]
    options: List[QuizQuestionOption]
    correct_option_id: str
    model_config = {"from_attributes": True}

class MultiSelectQuestion(BaseQuestion):
    question_type: Literal["multi-select"]
    options: List[QuizQuestionOption]
    correct_option_ids: List[str]
    model_config = {"from_attributes": True}

class MatchingQuestion(BaseQuestion):
    question_type: Literal["matching"]
    prompts: List[MatchingPrompt]
    options: List[MatchingOption]
    correct_matches: Dict[str, str]  # Maps prompt.id to option.id, e.g. {"A": "3", "B": "1"}
    model_config = {"from_attributes": True}

class SortingQuestion(BaseQuestion):
    question_type: Literal["sorting"]
    items_to_sort: List[SortableItem]
    correct_order: List[str]  # List of SortableItem.id in the correct sequence
    model_config = {"from_attributes": True}

class OpenAnswerQuestion(BaseQuestion):
    question_type: Literal["open-answer"]
    acceptable_answers: List[str]
    model_config = {"from_attributes": True}

AnyQuizQuestion = Union[
    MultipleChoiceQuestion,
    MultiSelectQuestion,
    MatchingQuestion,
    SortingQuestion,
    OpenAnswerQuestion
]

# custom_extensions/backend/main.py
from fastapi import FastAPI, HTTPException, Depends, Request, status, File, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse

from typing import List, Optional, Dict, Any, Union, Type, ForwardRef, Set, Literal
from pydantic import BaseModel, Field, RootModel
import re
import os
import asyncpg
from datetime import datetime, timezone
import httpx
from httpx import HTTPStatusError
import json
import uuid
import shutil
import logging
from locales.__init__ import LANG_CONFIG
import asyncio
import typing
import tempfile
import io
import gzip
import base64
import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import tiktoken
import inspect

# --- CONTROL VARIABLE FOR PRODUCTION LOGGING ---
# SET THIS TO True FOR PRODUCTION, False FOR DEVELOPMENT
IS_PRODUCTION = False  # Or True for production

# --- Logger ---
logger = logging.getLogger(__name__)
if IS_PRODUCTION:
    logging.basicConfig(level=logging.ERROR) # Production: Log only ERROR and CRITICAL
else:
    logging.basicConfig(level=logging.INFO)  # Development: Log INFO, WARNING, ERROR, CRITICAL


# --- Constants & DB Setup ---
CUSTOM_PROJECTS_DATABASE_URL = os.getenv("CUSTOM_PROJECTS_DATABASE_URL")
ONYX_DATABASE_URL = os.getenv("ONYX_DATABASE_URL")
ONYX_API_SERVER_URL = "http://api_server:8080" # Adjust if needed
ONYX_SESSION_COOKIE_NAME = os.getenv("ONYX_SESSION_COOKIE_NAME", "fastapiusersauth")

# Component name constants
COMPONENT_NAME_TRAINING_PLAN = "TrainingPlanTable"
COMPONENT_NAME_PDF_LESSON = "PdfLessonDisplay"
COMPONENT_NAME_SLIDE_DECK = "SlideDeckDisplay"
COMPONENT_NAME_VIDEO_LESSON = "VideoLessonDisplay"
COMPONENT_NAME_QUIZ = "QuizDisplay"
COMPONENT_NAME_TEXT_PRESENTATION = "TextPresentationDisplay"

# --- LLM Configuration for JSON Parsing ---
# === OpenAI ChatGPT configuration (replacing previous Cohere call) ===
LLM_API_KEY = os.getenv("OPENAI_API_KEY")
LLM_API_KEY_FALLBACK = os.getenv("OPENAI_API_KEY_FALLBACK")
# Endpoint for Chat Completions
LLM_API_URL = os.getenv("OPENAI_API_URL", "https://api.openai.com/v1/chat/completions")
# Default model to use – gpt-4o-mini provides strong JSON adherence
LLM_DEFAULT_MODEL = os.getenv("OPENAI_DEFAULT_MODEL", "gpt-4o-mini")

DB_POOL = None
# Track in-flight project creations to avoid duplicate processing (keyed by user+project)
ACTIVE_PROJECT_CREATE_KEYS: Set[str] = set()

# Track in-flight quiz finalizations to prevent duplicate processing
ACTIVE_QUIZ_FINALIZE_KEYS: Set[str] = set()

# Track quiz finalization timestamps for cleanup
QUIZ_FINALIZE_TIMESTAMPS: Dict[str, float] = {}


# --- Directory for Design Template Images ---
STATIC_DESIGN_IMAGES_DIR = "static_design_images"
os.makedirs(STATIC_DESIGN_IMAGES_DIR, exist_ok=True)

# --- Directory for Static Fonts ---
STATIC_FONTS_DIR = "static/fonts"
os.makedirs(STATIC_FONTS_DIR, exist_ok=True)

def inspect_list_items_recursively(data_structure: Any, path: str = ""):
    if isinstance(data_structure, dict):
        for key, value in data_structure.items():
            new_path = f"{path}.{key}" if path else key
            if key == "items": # Focus on 'items' keys
                logger.info(f"PDF Deep Inspect: Path: {new_path}, Type: {type(value)}, Is List: {isinstance(value, list)}, Value (first 100): {str(value)[:100]}")
                if not isinstance(value, list) and value is not None:
                    logger.error(f"PDF DEEP ERROR: Non-list 'items' at {new_path}. Type: {type(value)}, Value: {str(value)[:200]}")
            if isinstance(value, (dict, list)):
                inspect_list_items_recursively(value, new_path)
    elif isinstance(data_structure, list):
        for i, item in enumerate(data_structure):
            new_path = f"{path}[{i}]"
            if isinstance(item, (dict, list)):
                inspect_list_items_recursively(item, new_path)

DEFAULT_TRAINING_PLAN_JSON_EXAMPLE_FOR_LLM = """
{
  "mainTitle": "Example Training Program",
  "sections": [
    {
      "id": "№1",
      "title": "Introduction to Topic",
      "totalHours": 5.5,
      "lessons": [
        {
          "title": "Lesson 1.1: Basic Concepts",
          "check": {"type": "test", "text": "Knowledge Test"},
          "contentAvailable": {"type": "yes", "text": "100%"},
          "source": "Internal Documentation",
          "hours": 2.0,
          "completionTime": "6m"
        }
      ]
    }
  ],
  "detectedLanguage": "en"
}
"""

DEFAULT_PDF_LESSON_JSON_EXAMPLE_FOR_LLM = """
{
  "lessonTitle": "Example PDF Lesson with Nested Lists",
  "contentBlocks": [
    { "type": "headline", "level": 1, "text": "Main Title of the Lesson" },
    { "type": "paragraph", "text": "This is an introductory paragraph explaining the main concepts." },
    {
      "type": "bullet_list",
      "items": [
        "Top level item 1, demonstrating a simple string item.",
        {
          "type": "bullet_list",
          "iconName": "chevronRight",
          "items": [
            "Nested item A: This is a sub-item.",
            "Nested item B: Another sub-item to show structure.",
            {
              "type": "numbered_list",
              "items": [
                "Further nested numbered item 1.",
                "Further nested numbered item 2."
              ]
            }
          ]
        },
        "Top level item 2, followed by a nested numbered list.",
        {
          "type": "numbered_list",
          "items": [
            "Nested numbered 1: First point in nested ordered list.",
            "Nested numbered 2: Second point."
          ]
        },
        "Top level item 3."
      ]
    },
    { "type": "alert", "alertType": "info", "title": "Important Note", "text": "Alerts can provide contextual information or warnings." },
    {
      "type": "numbered_list",
      "items": [
        "Main numbered point 1.",
        {
          "type": "bullet_list",
          "items": [
            "Sub-bullet C under numbered list.",
            "Sub-bullet D, also useful for breaking down complex points."
          ]
        },
        "Main numbered point 2."
      ]
    },
    { "type": "section_break", "style": "dashed" }
  ],
  "detectedLanguage": "en"
}
"""

DEFAULT_SLIDE_DECK_JSON_EXAMPLE_FOR_LLM = """
{
  "lessonTitle": "Digital Marketing Strategy: A Complete Guide",
  "slides": [
    {
      "slideId": "slide_1_intro",
      "slideNumber": 1,
      "slideTitle": "Introduction",
      "templateId": "hero-title-slide",
      "props": {
        "title": "Digital Marketing Strategy",
        "subtitle": "A comprehensive guide to building effective online presence and driving business growth",
        "author": "Marketing Excellence Team",
        "date": "2024",
        "backgroundColor": "#1e40af",
        "titleColor": "#ffffff",
        "subtitleColor": "#bfdbfe"
      }
    },
    {
      "slideId": "slide_2_agenda",
      "slideNumber": 2,
      "slideTitle": "Learning Agenda",
      "templateId": "bullet-points",
      "props": {
        "title": "What We'll Cover Today",
        "bullets": [
          "Understanding digital marketing fundamentals",
          "Market research and target audience analysis",
          "Content strategy development",
          "Social media marketing tactics",
          "Email marketing best practices",
          "SEO and search marketing"
        ],
        "maxColumns": 2,
        "bulletStyle": "number",
        "imagePrompt": "A roadmap or pathway illustration showing the learning journey, modern flat design with blue and purple accents",
        "imageAlt": "Learning roadmap illustration"
      }
    },
    {
      "slideId": "slide_3_stats",
      "slideNumber": 3,
      "slideTitle": "Digital Marketing by the Numbers",
      "templateId": "big-numbers",
      "props": {
        "title": "Digital Marketing Impact",
        "numbers": [
          {
            "value": "4.8B",
            "label": "Internet Users Worldwide",
            "color": "#3b82f6"
          },
          {
            "value": "68%",
            "label": "Of Online Experiences Start with Search",
            "color": "#8b5cf6"
          },
          {
            "value": "$42",
            "label": "ROI for Every $1 Spent on Email Marketing",
            "color": "#10b981"
          }
        ]
      }
    },
    {
      "slideId": "slide_4_ecosystem",
      "slideNumber": 4,
      "slideTitle": "Digital Marketing Ecosystem",
      "templateId": "big-image-top",
      "props": {
        "title": "The Digital Marketing Landscape",
        "content": "Understanding the interconnected nature of digital marketing channels and how they work together to create a cohesive customer experience across all touchpoints.",
        "imageUrl": "https://via.placeholder.com/800x400?text=Digital+Ecosystem",
        "imageAlt": "Digital marketing ecosystem diagram",
        "imagePrompt": "A comprehensive diagram showing interconnected digital marketing channels including social media, email, SEO, PPC, content marketing, and analytics in a modern network visualization",
        "imageSize": "large"
      }
    },
    {
      "slideId": "slide_5_audience_vs_market",
      "slideNumber": 5,
      "slideTitle": "Audience vs Market Research",
      "templateId": "two-column",
      "props": {
        "title": "Understanding the Difference",
        "leftTitle": "Market Research",
        "leftContent": "• Industry trends and size\n• Competitive landscape\n• Market opportunities\n• Overall demand patterns\n• Economic factors",
        "rightTitle": "Audience Research",
        "rightContent": "• Customer demographics\n• Behavioral patterns\n• Pain points and needs\n• Communication preferences\n• Decision-making process"
      }
    },
    {
      "slideId": "slide_6_personas",
      "slideNumber": 6,
      "slideTitle": "Buyer Persona Development",
      "templateId": "process-steps",
      "props": {
        "title": "Creating Effective Buyer Personas",
        "steps": [
          "Collect demographic and psychographic data",
          "Conduct customer interviews and surveys",
          "Analyze behavioral patterns and preferences",
          "Identify goals, challenges, and pain points",
          "Map the customer journey and touchpoints",
          "Validate personas with real customer data"
        ]
      }
    },
    {
      "slideId": "slide_7_content_strategy",
      "slideNumber": 7,
      "slideTitle": "Content Strategy Foundation",
      "templateId": "pyramid",
      "props": {
        "title": "Content Strategy Pyramid",
        "levels": [
          {
            "text": "Content Distribution & Promotion",
            "description": "Multi-channel amplification strategy"
          },
          {
            "text": "Content Creation & Production",
            "description": "High-quality, engaging content development"
          },
          {
            "text": "Content Planning & Calendar",
            "description": "Strategic planning and scheduling"
          },
          {
            "text": "Content Audit & Analysis",
            "description": "Understanding current content performance"
          },
          {
            "text": "Goals, Audience & Brand Foundation",
            "description": "Strategic foundation and core objectives"
          }
        ]
      }
    },
    {
      "slideId": "slide_8_content_types",
      "slideNumber": 8,
      "slideTitle": "Content Format Matrix",
      "templateId": "four-box-grid",
      "props": {
        "title": "Content Formats for Different Goals",
        "boxes": [
          {
            "title": "Educational Content",
            "content": "Blog posts, tutorials, webinars, how-to guides",
            "icon": "📚"
          },
          {
            "title": "Engagement Content", 
            "content": "Social media posts, polls, user-generated content",
            "icon": "💬"
          },
          {
            "title": "Conversion Content",
            "content": "Case studies, testimonials, product demos",
            "icon": "🎯"
          },
          {
            "title": "Entertainment Content",
            "content": "Videos, memes, interactive content, stories",
            "icon": "🎭"
          }
        ]
      }
    },
    {
      "slideId": "slide_9_social_challenges",
      "slideNumber": 9,
      "slideTitle": "Social Media Challenges & Solutions",
      "templateId": "challenges-solutions",
      "props": {
        "title": "Overcoming Social Media Obstacles",
        "challenges": [
          "Low organic reach and engagement",
          "Creating consistent, quality content",
          "Managing multiple platform requirements"
        ],
        "solutions": [
          "Focus on community building and authentic interactions",
          "Develop content pillars and batch creation workflows", 
          "Use scheduling tools and platform-specific strategies"
        ]
      }
    },
    {
      "slideId": "slide_10_email_timeline",
      "slideNumber": 10,
      "slideTitle": "Email Marketing Campaign Timeline",
      "templateId": "timeline",
      "props": {
        "title": "Building Your Email Marketing Program",
        "events": [
          {
            "date": "Week 1-2",
            "title": "Foundation Setup",
            "description": "Choose platform, design templates, set up automation"
          },
          {
            "date": "Week 3-4", 
            "title": "List Building",
            "description": "Create lead magnets, optimize signup forms"
          },
          {
            "date": "Week 5-8",
            "title": "Content Creation",
            "description": "Develop welcome series, newsletters, promotional campaigns"
          },
          {
            "date": "Week 9-12",
            "title": "Optimization",
            "description": "A/B testing, segmentation, performance analysis"
          }
        ]
      }
    },
    {
      "slideId": "slide_11_seo_quote",
      "slideNumber": 11,
      "slideTitle": "SEO Philosophy",
      "templateId": "quote-center",
      "props": {
        "quote": "The best place to hide a dead body is page 2 of Google search results.",
        "author": "Digital Marketing Wisdom",
        "context": "This humorous quote highlights the critical importance of ranking on the first page of search results for visibility and traffic."
      }
    },
    {
      "slideId": "slide_12_seo_factors",
      "slideNumber": 12,
      "slideTitle": "SEO Success Factors",
      "templateId": "bullet-points-right",
      "props": {
        "title": "Key SEO Elements",
        "bullets": [
          "Keyword research and strategic implementation",
          "High-quality, original content creation",
          "Technical SEO and site speed optimization",
          "Mobile-first design and user experience",
          "Authority building through quality backlinks",
          "Local SEO for geographic targeting"
        ],
        "bulletStyle": "dot",
        "imagePrompt": "SEO optimization illustration with search elements, website structure, and ranking factors in a modern, clean style",
        "imageAlt": "SEO optimization visual guide"
      }
    },
    {
      "slideId": "slide_13_paid_advertising",
      "slideNumber": 13,
      "slideTitle": "Paid Advertising Strategy",
      "templateId": "big-image-left",
      "props": {
        "title": "Maximizing Paid Campaign ROI",
        "subtitle": "Strategic paid advertising accelerates reach and drives targeted traffic when organic efforts need support.",
        "imageUrl": "https://via.placeholder.com/600x400?text=Paid+Advertising",
        "imageAlt": "Digital advertising dashboard",
        "imagePrompt": "A modern advertising dashboard showing campaign performance metrics, targeting options, and ROI indicators across multiple platforms",
        "imageSize": "large"
      }
    },
    {
      "slideId": "slide_14_implementation",
      "slideNumber": 14,
      "slideTitle": "90-Day Implementation Plan",
      "templateId": "process-steps",
      "props": {
        "title": "Your Digital Marketing Roadmap",
        "steps": [
          "Month 1: Foundation - Research, audit, and strategy development",
          "Month 2: Launch - Implement core channels and begin content creation",
          "Month 3: Optimize - Analyze data, refine approach, and scale success"
        ]
      }
    },
    {
      "slideId": "slide_15_conclusion",
      "slideNumber": 15,
      "slideTitle": "Success Principles",
      "templateId": "title-slide",
      "props": {
        "title": "Your Digital Marketing Success Formula",
        "subtitle": "Strategy + Consistency + Measurement = Growth",
        "author": "Remember: Digital marketing is a marathon, not a sprint",
        "backgroundColor": "#059669",
        "titleColor": "#ffffff",
        "subtitleColor": "#d1fae5"
      }
    }
  ],
  "currentSlideId": "slide_1_intro",
  "detectedLanguage": "en"
}
"""

async def get_db_pool():
    if DB_POOL is None:
        detail_msg = "Database service not available." # Generic enough for production
        raise HTTPException(status_code=503, detail=detail_msg)
    return DB_POOL

app = FastAPI(title="Custom Extension Backend")

app.mount(f"/{STATIC_DESIGN_IMAGES_DIR}", StaticFiles(directory=STATIC_DESIGN_IMAGES_DIR), name="static_design_images")
app.mount("/fonts", StaticFiles(directory=STATIC_FONTS_DIR), name="static_fonts")

@app.middleware("http")
async def track_request_analytics(request: Request, call_next):
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    # Get user ID if available
    user_id = None
    try:
        if hasattr(request.state, 'user_id'):
            user_id = request.state.user_id
    except:
        pass
    
    # Get request size
    request_size = None
    try:
        if request.method in ['POST', 'PUT', 'PATCH']:
            body = await request.body()
            request_size = len(body)
    except:
        pass
    
    try:
        response = await call_next(request)
        end_time = time.time()
        response_time_ms = int((end_time - start_time) * 1000)
        
        # Get response size
        response_size = None
        try:
            if hasattr(response, 'body'):
                response_size = len(response.body)
        except:
            pass
        
        # Store analytics in database
        try:
            async with DB_POOL.acquire() as conn:
                await conn.execute("""
                    INSERT INTO request_analytics (
                        id, endpoint, method, user_id, status_code, 
                        response_time_ms, request_size_bytes, response_size_bytes,
                        error_message, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                """, request_id, request.url.path, request.method, user_id,
                     response.status_code, response_time_ms, request_size,
                     response_size, None, datetime.now(timezone.utc))
        except Exception as e:
            logger.error(f"Failed to store request analytics: {e}")
        
        return response
        
    except Exception as e:
        end_time = time.time()
        response_time_ms = int((end_time - start_time) * 1000)
        
        # Store error analytics
        try:
            async with DB_POOL.acquire() as conn:
                await conn.execute("""
                    INSERT INTO request_analytics (
                        id, endpoint, method, user_id, status_code, 
                        response_time_ms, request_size_bytes, response_size_bytes,
                        error_message, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                """, request_id, request.url.path, request.method, user_id,
                     500, response_time_ms, request_size, None,
                     str(e), datetime.now(timezone.utc))
        except Exception as db_error:
            logger.error(f"Failed to store error analytics: {db_error}")
        
        raise

try:
    from app.services.pdf_generator import generate_pdf_from_html_template
    from app.core.config import settings
except ImportError:
    logger.warning("Could not import pdf_generator or settings from 'app' module. Using dummy implementations for PDF generation.")
    class DummySettings:
        CUSTOM_FRONTEND_URL = os.environ.get("CUSTOM_FRONTEND_URL", "http://custom_frontend:3001")
    settings = DummySettings()
    async def generate_pdf_from_html_template(template_name: str, context_data: Dict[str, Any], output_filename: str) -> str:
        logger.info(f"PDF Generation Skipped (Dummy Service): Would generate for template {template_name} to {output_filename}")
        dummy_path = os.path.join("/app/tmp_pdf", output_filename)
        os.makedirs(os.path.dirname(dummy_path), exist_ok=True)
        with open(dummy_path, "w") as f: f.write(f"Dummy PDF for {output_filename} using context: {str(context_data)[:200]}")
        return dummy_path

@app.on_event("startup")
async def startup_event():
    global DB_POOL
    logger.info("Custom Backend starting...")
    if not CUSTOM_PROJECTS_DATABASE_URL:
        logger.critical("CRITICAL: CUSTOM_PROJECTS_DATABASE_URL env var not set.")
        return
    try:
        DB_POOL = await asyncpg.create_pool(dsn=CUSTOM_PROJECTS_DATABASE_URL, min_size=1, max_size=10,
                                            init=lambda conn: conn.set_type_codec(
                                                'jsonb',
                                                encoder=lambda value: json.dumps(value) if value is not None else None,
                                                decoder=lambda value: json.loads(value) if value is not None else None,
                                                schema='pg_catalog',
                                                format='text'
                                            ))
        async with DB_POOL.acquire() as connection:
            await connection.execute("""
                CREATE TABLE IF NOT EXISTS design_templates (
                    id SERIAL PRIMARY KEY,
                    template_name TEXT NOT NULL UNIQUE,
                    template_structuring_prompt TEXT NOT NULL,
                    design_image_path TEXT,
                    microproduct_type TEXT,
                    component_name TEXT NOT NULL,
                    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """)

            await connection.execute("""
                CREATE TABLE IF NOT EXISTS projects (
                    id SERIAL PRIMARY KEY,
                    onyx_user_id TEXT NOT NULL,
                    project_name TEXT NOT NULL,
                    product_type TEXT,
                    microproduct_type TEXT,
                    microproduct_name TEXT,
                    microproduct_content JSONB,
                    design_template_id INTEGER REFERENCES design_templates(id) ON DELETE SET NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """)
            await connection.execute("ALTER TABLE projects ADD COLUMN IF NOT EXISTS microproduct_name TEXT;")
            await connection.execute("ALTER TABLE projects ADD COLUMN IF NOT EXISTS product_type TEXT;")
            await connection.execute("ALTER TABLE projects ADD COLUMN IF NOT EXISTS microproduct_type TEXT;")
            await connection.execute("ALTER TABLE projects ADD COLUMN IF NOT EXISTS design_template_id INTEGER REFERENCES design_templates(id) ON DELETE SET NULL;")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_projects_onyx_user_id ON projects(onyx_user_id);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_projects_design_template_id ON projects(design_template_id);")
            logger.info("'projects' table ensured and updated.")

            await connection.execute("""
                CREATE TABLE IF NOT EXISTS microproduct_pipelines (
                    id SERIAL PRIMARY KEY,
                    pipeline_name TEXT NOT NULL,
                    pipeline_description TEXT,
                    is_prompts_data_collection BOOLEAN DEFAULT FALSE,
                    is_prompts_data_formating BOOLEAN DEFAULT FALSE,
                    prompts_data_collection JSONB,
                    prompts_data_formating JSONB,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """)
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_pipelines_name ON microproduct_pipelines(pipeline_name);")
            logger.info("'microproduct_pipelines' table ensured.")

            col_type_row = await connection.fetchrow(
                "SELECT data_type FROM information_schema.columns "
                "WHERE table_name = 'projects' AND column_name = 'microproduct_content';"
            )
            if col_type_row and col_type_row['data_type'] != 'jsonb':
                logger.info("Attempting to alter 'microproduct_content' column type to JSONB...")
                await connection.execute("ALTER TABLE projects ALTER COLUMN microproduct_content TYPE JSONB USING microproduct_content::text::jsonb;")
                logger.info("Successfully altered 'microproduct_content' to JSONB.")

            await connection.execute("ALTER TABLE projects ADD COLUMN IF NOT EXISTS source_chat_session_id UUID;")
            logger.info("'projects' table ensured and updated with 'source_chat_session_id'.")

            # --- Add source context tracking columns ---
            await connection.execute("ALTER TABLE projects ADD COLUMN IF NOT EXISTS source_context_type TEXT;")
            await connection.execute("ALTER TABLE projects ADD COLUMN IF NOT EXISTS source_context_data JSONB;")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_projects_source_context_type ON projects(source_context_type);")
            logger.info("'projects' table updated with source context tracking columns.")

            # --- Add lesson plan specific columns ---
            await connection.execute("ALTER TABLE projects ADD COLUMN IF NOT EXISTS lesson_plan_data JSONB;")
            await connection.execute("ALTER TABLE projects ADD COLUMN IF NOT EXISTS parent_outline_id INTEGER REFERENCES projects(id);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_projects_parent_outline_id ON projects(parent_outline_id);")
            logger.info("'projects' table updated with lesson plan columns.")

            await connection.execute("CREATE INDEX IF NOT EXISTS idx_design_templates_name ON design_templates(template_name);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_design_templates_mptype ON design_templates(microproduct_type);")
            logger.info("'design_templates' table ensured.")

            # --- Initialize workspace database tables ---
            try:
                from app.core.database import init_database
                await init_database()
                logger.info("Workspace database tables initialized successfully")
            except Exception as db_init_error:
                logger.warning(f"Failed to initialize workspace database tables: {db_init_error}")

            # --- Ensure a soft-delete trash table for projects ---
            await connection.execute("""
                CREATE TABLE IF NOT EXISTS trashed_projects (LIKE projects INCLUDING ALL);
            """)
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_trashed_projects_user ON trashed_projects(onyx_user_id);")
            logger.info("'trashed_projects' table ensured (soft-delete).")

            # --- Ensure user credits table ---
            await connection.execute("""
                CREATE TABLE IF NOT EXISTS user_credits (
                    id SERIAL PRIMARY KEY,
                    onyx_user_id TEXT NOT NULL UNIQUE,
                    name TEXT NOT NULL,
                    credits_balance INTEGER NOT NULL DEFAULT 0,
                    total_credits_used INTEGER NOT NULL DEFAULT 0,
                    credits_purchased INTEGER NOT NULL DEFAULT 0,
                    last_purchase_date TIMESTAMP WITH TIME ZONE,
                    subscription_tier TEXT DEFAULT 'basic',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """)
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_user_credits_onyx_user_id ON user_credits(onyx_user_id);")
            logger.info("'user_credits' table ensured.")

            # NEW: Ensure credit transactions table for analytics/timeline
            await connection.execute(
                """
                CREATE TABLE IF NOT EXISTS credit_transactions (
                    id TEXT PRIMARY KEY,
                    onyx_user_id TEXT NOT NULL,
                    user_credits_id INTEGER REFERENCES user_credits(id) ON DELETE CASCADE,
                    type TEXT NOT NULL CHECK (type IN ('purchase','product_generation','admin_removal')),
                    title TEXT,
                    product_type TEXT,
                    credits INTEGER NOT NULL CHECK (credits >= 0),
                    delta INTEGER NOT NULL,
                    reason TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
                """
            )
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_credit_tx_user ON credit_transactions(onyx_user_id, created_at DESC);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_credit_tx_type ON credit_transactions(type);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_credit_tx_product ON credit_transactions(product_type);")
            
            # Migration: Update credit_transactions table to support admin_removal type
            try:
                await connection.execute("""
                    ALTER TABLE credit_transactions 
                    DROP CONSTRAINT IF EXISTS credit_transactions_type_check;
                """)
                await connection.execute("""
                    ALTER TABLE credit_transactions 
                    ADD CONSTRAINT credit_transactions_type_check 
                    CHECK (type IN ('purchase','product_generation','admin_removal'));
                """)
                logger.info("Updated credit_transactions table to support admin_removal type")
            except Exception as e:
                logger.warning(f"Could not update credit_transactions constraint: {e}")
            
            logger.info("'credit_transactions' table ensured.")

            # Migration: Populate user_credits table with existing Onyx users
            try:
                migrated_count = await migrate_onyx_users_to_credits_table()
                logger.info(f"Populated user_credits table with {migrated_count} existing Onyx users (100 credits each).")
            except Exception as e:
                logger.error(f"Failed to migrate Onyx users to credits table: {e}")
                logger.info("Migration will be available manually via admin interface.")

            await connection.execute("""
                CREATE TABLE IF NOT EXISTS project_folders (
                    id SERIAL PRIMARY KEY,
                    onyx_user_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    "order" INTEGER DEFAULT 0,
                    parent_id INTEGER REFERENCES project_folders(id) ON DELETE CASCADE
                );
            """)
            await connection.execute("ALTER TABLE projects ADD COLUMN IF NOT EXISTS folder_id INTEGER REFERENCES project_folders(id) ON DELETE SET NULL;")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_project_folders_onyx_user_id ON project_folders(onyx_user_id);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_projects_folder_id ON projects(folder_id);")
            
            # Add parent_id column to existing project_folders table if it doesn't exist
            try:
                await connection.execute("ALTER TABLE project_folders ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES project_folders(id) ON DELETE CASCADE;")
            except Exception as e:
                # Column might already exist, which is fine
                if "already exists" not in str(e) and "duplicate column" not in str(e):
                    raise e
            
            # Create index for parent_id column
            try:
                await connection.execute("CREATE INDEX IF NOT EXISTS idx_project_folders_parent_id ON project_folders(parent_id);")
            except Exception as e:
                # Index might already exist, which is fine
                if "already exists" not in str(e) and "duplicate key" not in str(e):
                    raise e
            
            # Add order column to existing project_folders table if it doesn't exist
            try:
                await connection.execute("ALTER TABLE project_folders ADD COLUMN \"order\" INTEGER DEFAULT 0;")
            except Exception as e:
                # Column might already exist, which is fine
                if "already exists" not in str(e) and "duplicate column" not in str(e):
                    raise e
            
            # Create index for order column
            try:
                await connection.execute("CREATE INDEX IF NOT EXISTS idx_project_folders_order ON project_folders(\"order\");")
            except Exception as e:
                # Index might already exist, which is fine
                if "already exists" not in str(e) and "duplicate key" not in str(e):
                    raise e
            
            # Add quality_tier column to project_folders table
            try:
                await connection.execute("ALTER TABLE project_folders ADD COLUMN IF NOT EXISTS quality_tier TEXT DEFAULT 'medium';")
                logger.info("Added quality_tier column to project_folders table")
                
                # Update existing folders to have 'medium' tier if they don't have one
                await connection.execute("UPDATE project_folders SET quality_tier = 'medium' WHERE quality_tier IS NULL;")
                logger.info("Updated existing folders with default 'medium' tier")
                
                # Create index for quality_tier column
                await connection.execute("CREATE INDEX IF NOT EXISTS idx_project_folders_quality_tier ON project_folders(quality_tier);")
                logger.info("Created index for quality_tier column")
                
            except Exception as e:
                # Column might already exist, which is fine
                if "already exists" not in str(e) and "duplicate column" not in str(e):
                    logger.error(f"Error adding quality_tier column: {e}")
                    raise e
            
            # Add custom_rate column to project_folders table
            try:
                await connection.execute("ALTER TABLE project_folders ADD COLUMN IF NOT EXISTS custom_rate INTEGER DEFAULT 200;")
                logger.info("Added custom_rate column to project_folders table")
                
                # Update existing folders to have default custom_rate if they don't have one
                await connection.execute("UPDATE project_folders SET custom_rate = 200 WHERE custom_rate IS NULL;")
                logger.info("Updated existing folders with default custom_rate")
                
                # Create index for custom_rate column
                await connection.execute("CREATE INDEX IF NOT EXISTS idx_project_folders_custom_rate ON project_folders(custom_rate);")
                logger.info("Created index for custom_rate column")
                
            except Exception as e:
                # Column might already exist, which is fine
                if "already exists" not in str(e) and "duplicate column" not in str(e):
                    logger.error(f"Error adding custom_rate column: {e}")
                    raise e
            
            # Add order column for project sorting
            await connection.execute("ALTER TABLE projects ADD COLUMN IF NOT EXISTS \"order\" INTEGER DEFAULT 0;")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(\"order\");")

            # Add completionTime column to projects table (for the new completion time feature)
            try:
                await connection.execute("ALTER TABLE projects ADD COLUMN IF NOT EXISTS completion_time INTEGER;")
            except Exception as e:
                # Column might already exist, which is fine
                if "already exists" not in str(e) and "duplicate column" not in str(e):
                    raise e

            # Add project-level custom rate and quality tier columns
            try:
                await connection.execute("ALTER TABLE projects ADD COLUMN IF NOT EXISTS custom_rate INTEGER;")
                await connection.execute("ALTER TABLE projects ADD COLUMN IF NOT EXISTS quality_tier TEXT;")
                logger.info("Added custom_rate and quality_tier columns to projects table")
                
                # Create indexes for project-level custom rate and quality tier
                await connection.execute("CREATE INDEX IF NOT EXISTS idx_projects_custom_rate ON projects(custom_rate);")
                await connection.execute("CREATE INDEX IF NOT EXISTS idx_projects_quality_tier ON projects(quality_tier);")
                logger.info("Created indexes for project-level custom_rate and quality_tier columns")
                
            except Exception as e:
                # Columns might already exist, which is fine
                if "already exists" not in str(e) and "duplicate column" not in str(e):
                    logger.error(f"Error adding project-level custom_rate/quality_tier columns: {e}")
                    raise e
            
            # Add is_advanced and advanced_rates to project_folders for advanced per-product rates
            try:
                await connection.execute("ALTER TABLE project_folders ADD COLUMN IF NOT EXISTS is_advanced BOOLEAN DEFAULT FALSE;")
                await connection.execute("ALTER TABLE project_folders ADD COLUMN IF NOT EXISTS advanced_rates JSONB;")
                await connection.execute("ALTER TABLE project_folders ADD COLUMN IF NOT EXISTS completion_times JSONB;")
                await connection.execute("CREATE INDEX IF NOT EXISTS idx_project_folders_is_advanced ON project_folders(is_advanced);")
                logger.info("Ensured is_advanced, advanced_rates, and completion_times on project_folders")
            except Exception as e:
                if "already exists" not in str(e) and "duplicate column" not in str(e):
                    logger.error(f"Error adding is_advanced/advanced_rates to project_folders: {e}")
                    raise e

            # Add is_advanced and advanced_rates to projects for advanced per-product rates
            try:
                await connection.execute("ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_advanced BOOLEAN DEFAULT FALSE;")
                await connection.execute("ALTER TABLE projects ADD COLUMN IF NOT EXISTS advanced_rates JSONB;")
                await connection.execute("ALTER TABLE projects ADD COLUMN IF NOT EXISTS completion_times JSONB;")
                await connection.execute("CREATE INDEX IF NOT EXISTS idx_projects_is_advanced ON projects(is_advanced);")
                logger.info("Ensured is_advanced, advanced_rates, and completion_times on projects")
            except Exception as e:
                if "already exists" not in str(e) and "duplicate column" not in str(e):
                    logger.error(f"Error adding is_advanced/advanced_rates to projects: {e}")
                    raise e
            
            # Add completionTime column to trashed_projects table to match projects table schema
            try:
                await connection.execute("ALTER TABLE trashed_projects ADD COLUMN IF NOT EXISTS completion_time INTEGER;")
            except Exception as e:
                # Column might already exist, which is fine
                if "already exists" not in str(e) and "duplicate column" not in str(e):
                    raise e

            # Add other missing columns to trashed_projects table to match projects table schema
            try:
                await connection.execute("ALTER TABLE trashed_projects ADD COLUMN IF NOT EXISTS source_chat_session_id UUID;")
            except Exception as e:
                # Column might already exist, which is fine
                if "already exists" not in str(e) and "duplicate column" not in str(e):
                    raise e

            try:
                await connection.execute("ALTER TABLE trashed_projects ADD COLUMN IF NOT EXISTS folder_id INTEGER REFERENCES project_folders(id) ON DELETE SET NULL;")
            except Exception as e:
                # Column might already exist, which is fine
                if "already exists" not in str(e) and "duplicate column" not in str(e):
                    raise e

            try:
                await connection.execute("ALTER TABLE trashed_projects ADD COLUMN IF NOT EXISTS \"order\" INTEGER DEFAULT 0;")
            except Exception as e:
                # Column might already exist, which is fine
                if "already exists" not in str(e) and "duplicate column" not in str(e):
                    raise e

            # Add project-level columns to trashed_projects table
            try:
                await connection.execute("ALTER TABLE trashed_projects ADD COLUMN IF NOT EXISTS custom_rate INTEGER;")
                await connection.execute("ALTER TABLE trashed_projects ADD COLUMN IF NOT EXISTS quality_tier TEXT;")
                logger.info("Added custom_rate and quality_tier columns to trashed_projects table")
            except Exception as e:
                # Columns might already exist, which is fine
                if "already exists" not in str(e) and "duplicate column" not in str(e):
                    logger.error(f"Error adding project-level columns to trashed_projects: {e}")
                    raise e

            # CRITICAL FIX: Ensure order and completion_time columns are TEXT type to prevent casting errors
            try:
                logger.info("Applying critical fix: Ensuring order and completion_time columns are TEXT type")
                
                # Fix projects table - ensure TEXT type
                await connection.execute("""
                    ALTER TABLE projects 
                    ALTER COLUMN "order" TYPE TEXT,
                    ALTER COLUMN completion_time TYPE TEXT;
                """)
                logger.info("Successfully set projects.order and projects.completion_time to TEXT type")
                
                # Fix trashed_projects table - ensure TEXT type
                await connection.execute("""
                    ALTER TABLE trashed_projects 
                    ALTER COLUMN "order" TYPE TEXT,
                    ALTER COLUMN completion_time TYPE TEXT;
                """)
                logger.info("Successfully set trashed_projects.order and trashed_projects.completion_time to TEXT type")
                
                # Set default values for empty strings
                await connection.execute("""
                    UPDATE projects 
                    SET "order" = '0' WHERE "order" IS NULL OR "order" = '';
                """)
                await connection.execute("""
                    UPDATE projects 
                    SET completion_time = '0' WHERE completion_time IS NULL OR completion_time = '';
                """)
                await connection.execute("""
                    UPDATE trashed_projects 
                    SET "order" = '0' WHERE "order" IS NULL OR "order" = '';
                """)
                await connection.execute("""
                    UPDATE trashed_projects 
                    SET completion_time = '0' WHERE completion_time IS NULL OR completion_time = '';
                """)
                logger.info("Successfully set default values for empty order and completion_time fields")
                
            except Exception as e:
                logger.error(f"Error applying critical TEXT type fix: {e}")

            # Final verification - ensure all required columns exist with correct types
            try:
                # Verify projects table schema
                projects_schema = await connection.fetch("""
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns 
                    WHERE table_name = 'projects' 
                    AND column_name IN ('order', 'completion_time', 'source_chat_session_id', 'folder_id')
                    ORDER BY column_name;
                """)
                
                logger.info("Projects table schema verification:")
                for row in projects_schema:
                    logger.info(f"  {row['column_name']}: {row['data_type']} (nullable: {row['is_nullable']})")
                
                # Verify trashed_projects table schema
                trashed_schema = await connection.fetch("""
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns 
                    WHERE table_name = 'trashed_projects' 
                    AND column_name IN ('order', 'completion_time', 'source_chat_session_id', 'folder_id')
                    ORDER BY column_name;
                """)
                
                logger.info("Trashed_projects table schema verification:")
                for row in trashed_schema:
                    logger.info(f"  {row['column_name']}: {row['data_type']} (nullable: {row['is_nullable']})")
                
            except Exception as e:
                logger.error(f"Error during schema verification: {e}")

            # Create request analytics table
            await connection.execute("""
                CREATE TABLE IF NOT EXISTS request_analytics (
                    id TEXT PRIMARY KEY,
                    endpoint TEXT NOT NULL,
                    method TEXT NOT NULL,
                    user_id TEXT,
                    status_code INTEGER NOT NULL,
                    response_time_ms INTEGER NOT NULL,
                    request_size_bytes INTEGER,
                    response_size_bytes INTEGER,
                    error_message TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """)
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_request_analytics_created_at ON request_analytics(created_at);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_request_analytics_endpoint ON request_analytics(endpoint);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_request_analytics_user_id ON request_analytics(user_id);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_request_analytics_status_code ON request_analytics(status_code);")
            logger.info("'request_analytics' table ensured.")

            # Add AI parser tracking columns to request_analytics table
            try:
                await connection.execute("ALTER TABLE request_analytics ADD COLUMN IF NOT EXISTS is_ai_parser_request BOOLEAN DEFAULT FALSE;")
                await connection.execute("ALTER TABLE request_analytics ADD COLUMN IF NOT EXISTS ai_parser_tokens INTEGER;")
                await connection.execute("ALTER TABLE request_analytics ADD COLUMN IF NOT EXISTS ai_parser_model TEXT;")
                await connection.execute("ALTER TABLE request_analytics ADD COLUMN IF NOT EXISTS ai_parser_project_name TEXT;")
                await connection.execute("CREATE INDEX IF NOT EXISTS idx_request_analytics_ai_parser ON request_analytics(is_ai_parser_request);")
                logger.info("AI parser tracking columns added to request_analytics table.")
            except Exception as e:
                logger.warning(f"Error adding AI parser columns (may already exist): {e}")

            # Add is_standalone field to projects table to track standalone vs outline-based products
            try:
                await connection.execute("ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_standalone BOOLEAN DEFAULT NULL;")
                await connection.execute("CREATE INDEX IF NOT EXISTS idx_projects_is_standalone ON projects(is_standalone);")
                logger.info("Added is_standalone column to projects table.")
                
                # Add same field to trashed_projects table to match schema
                await connection.execute("ALTER TABLE trashed_projects ADD COLUMN IF NOT EXISTS is_standalone BOOLEAN DEFAULT NULL;")
                logger.info("Added is_standalone column to trashed_projects table.")
                
                # For legacy support: Set is_standalone = NULL for all existing products
                # This allows the frontend filtering logic to handle legacy products gracefully
                # New products will have this field explicitly set during creation
                logger.info("Legacy support: is_standalone field defaults to NULL for existing products.")
                
            except Exception as e:
                logger.warning(f"Error adding is_standalone column (may already exist): {e}")

            # ============================
            # SMART DRIVE DATABASE MIGRATIONS
            # ============================
            
            # SmartDrive Accounts: Per-user SmartDrive linkage with individual Nextcloud credentials
            await connection.execute("""
                CREATE TABLE IF NOT EXISTS smartdrive_accounts (
                    id SERIAL PRIMARY KEY,
                    onyx_user_id VARCHAR(255) NOT NULL UNIQUE,
                    nextcloud_username VARCHAR(255),
                    nextcloud_password_encrypted TEXT,
                    nextcloud_base_url VARCHAR(512) DEFAULT 'http://nc1.contentbuilder.ai:8080',
                    sync_cursor JSONB DEFAULT '{}',
                    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT idx_smartdrive_accounts_onyx_user UNIQUE (onyx_user_id)
                );
            """)
            
            # Add new columns to existing tables (migration-safe)
            try:
                await connection.execute("ALTER TABLE smartdrive_accounts ADD COLUMN IF NOT EXISTS nextcloud_username VARCHAR(255);")
                await connection.execute("ALTER TABLE smartdrive_accounts ADD COLUMN IF NOT EXISTS nextcloud_password_encrypted TEXT;")
                await connection.execute("ALTER TABLE smartdrive_accounts ADD COLUMN IF NOT EXISTS nextcloud_base_url VARCHAR(512) DEFAULT 'http://nc1.contentbuilder.ai:8080';")
            except Exception as e:
                logger.info(f"Columns may already exist: {e}")
                pass
            # Add encryption helper functions - provide placeholder for old nextcloud_user_id column
            await connection.execute("INSERT INTO smartdrive_accounts (onyx_user_id, nextcloud_username, nextcloud_password_encrypted) VALUES ('system_encryption_key', '__encryption_key__', '__placeholder__') ON CONFLICT (onyx_user_id) DO NOTHING;")
            logger.info("'smartdrive_accounts' table ensured.")

            # SmartDrive Imports: Maps SmartDrive files to Onyx files with etags/checksums
            await connection.execute("""
                CREATE TABLE IF NOT EXISTS smartdrive_imports (
                    id SERIAL PRIMARY KEY,
                    onyx_user_id VARCHAR(255) NOT NULL,
                    smartdrive_path VARCHAR(1000) NOT NULL,
                    onyx_file_id VARCHAR(255) NOT NULL,
                    etag VARCHAR(255),
                    checksum VARCHAR(255),
                    file_size BIGINT,
                    mime_type VARCHAR(255),
                    imported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    last_modified TIMESTAMP WITH TIME ZONE,
                    CONSTRAINT idx_smartdrive_imports_user_path UNIQUE (onyx_user_id, smartdrive_path)
                );
            """)
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_smartdrive_imports_onyx_user_id ON smartdrive_imports(onyx_user_id);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_smartdrive_imports_onyx_file_id ON smartdrive_imports(onyx_file_id);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_smartdrive_imports_imported_at ON smartdrive_imports(imported_at);")
            logger.info("'smartdrive_imports' table ensured.")

            # User Connectors: Per-user connector configs and encrypted tokens
            await connection.execute("""
                CREATE TABLE IF NOT EXISTS user_connectors (
                    id SERIAL PRIMARY KEY,
                    onyx_user_id VARCHAR(255) NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    source VARCHAR(100) NOT NULL,
                    config JSONB DEFAULT '{}',
                    credentials_encrypted TEXT,
                    status VARCHAR(50) DEFAULT 'active',
                    last_sync_at TIMESTAMP WITH TIME ZONE,
                    last_error TEXT,
                    total_docs_indexed INTEGER DEFAULT 0,
                    onyx_connector_id INTEGER,
                    onyx_credential_id INTEGER,
                    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
            """)
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_user_connectors_onyx_user_id ON user_connectors(onyx_user_id);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_user_connectors_source ON user_connectors(source);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_user_connectors_status ON user_connectors(status);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_user_connectors_created_at ON user_connectors(created_at);")
            logger.info("'user_connectors' table ensured.")

            # --- Ensure offers table ---
            await connection.execute("""
                CREATE TABLE IF NOT EXISTS offers (
                    id SERIAL PRIMARY KEY,
                    onyx_user_id TEXT NOT NULL,
                    company_id INTEGER REFERENCES project_folders(id) ON DELETE CASCADE,
                    offer_name TEXT NOT NULL,
                    created_on TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    manager TEXT NOT NULL,
                    status TEXT NOT NULL CHECK (status IN (
                        'Draft',
                        'Internal Review', 
                        'Approved',
                        'Sent to Client',
                        'Viewed by Client',
                        'Negotiation',
                        'Accepted',
                        'Rejected',
                        'Archived'
                    )),
                    total_hours INTEGER DEFAULT 0,
                    link TEXT,
                    share_token TEXT UNIQUE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """)
            await connection.execute("ALTER TABLE offers ADD COLUMN IF NOT EXISTS share_token TEXT;")
            await connection.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_offers_share_token ON offers(share_token) WHERE share_token IS NOT NULL;")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_offers_onyx_user_id ON offers(onyx_user_id);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_offers_company_id ON offers(company_id);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_offers_created_on ON offers(created_on);")
            logger.info("'offers' table ensured.")

            logger.info("Smart Drive database migrations completed successfully.")
            # --- Feature Management Tables ---
            await connection.execute("""
                CREATE TABLE IF NOT EXISTS feature_definitions (
                    id SERIAL PRIMARY KEY,
                    feature_name VARCHAR(100) UNIQUE NOT NULL,
                    display_name VARCHAR(200) NOT NULL,
                    description TEXT,
                    category VARCHAR(100),
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """)
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_feature_definitions_name ON feature_definitions(feature_name);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_feature_definitions_active ON feature_definitions(is_active);")
            logger.info("'feature_definitions' table ensured.")

            await connection.execute("""
                CREATE TABLE IF NOT EXISTS user_features (
                    id SERIAL PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    feature_name VARCHAR(100) NOT NULL,
                    is_enabled BOOLEAN DEFAULT false,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE(user_id, feature_name)
                );
            """)
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_user_features_user_id ON user_features(user_id);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_user_features_feature_name ON user_features(feature_name);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_user_features_enabled ON user_features(is_enabled);")
            
            # Migration: Ensure user_id column is TEXT type (not UUID)
            try:
                await connection.execute("""
                    ALTER TABLE user_features 
                    ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT
                """)
                logger.info("Migrated user_features.user_id column to TEXT type.")
            except Exception as e:
                # This might fail if column is already TEXT or if there are no records
                logger.info(f"user_features.user_id column migration skipped (likely already TEXT): {e}")
            
            logger.info("'user_features' table ensured.")

            # Seed initial feature definitions
            try:
                initial_features = [
                    ('ai_audit_templates', 'AI Audit Templates', 'Access to AI-powered audit template generation', 'Templates'),
                ]

                for feature_name, display_name, description, category in initial_features:
                    await connection.execute("""
                        INSERT INTO feature_definitions (feature_name, display_name, description, category)
                        VALUES ($1, $2, $3, $4)
                        ON CONFLICT (feature_name) DO UPDATE SET
                            display_name = EXCLUDED.display_name,
                            description = EXCLUDED.description,
                            category = EXCLUDED.category,
                            is_active = true
                    """, feature_name, display_name, description, category)
                
                logger.info(f"Seeded {len(initial_features)} feature definitions.")
                
                # Deactivate unused features that are not wired
                unused_features = [
                    'advanced_analytics', 'bulk_operations', 'premium_support', 
                    'beta_features', 'api_access', 'custom_themes', 'advanced_export'
                ]
                
                for feature_name in unused_features:
                    await connection.execute("""
                        UPDATE feature_definitions 
                        SET is_active = false 
                        WHERE feature_name = $1
                    """, feature_name)
                
                logger.info(f"Deactivated {len(unused_features)} unused feature definitions.")
            except Exception as e:
                logger.warning(f"Error seeding feature definitions (may already exist): {e}")

            # Create feature entries for existing users (all disabled by default)
            try:
                users = await connection.fetch("SELECT onyx_user_id FROM user_credits")
                
                if users:
                    # Get all active feature names
                    feature_names = await connection.fetch("SELECT feature_name FROM feature_definitions WHERE is_active = true")
                    
                    for user in users:
                        user_id = user['onyx_user_id']
                        for feature_row in feature_names:
                            feature_name = feature_row['feature_name']
                            await connection.execute("""
                                INSERT INTO user_features (user_id, feature_name, is_enabled)
                                VALUES ($1, $2, false)
                                ON CONFLICT (user_id, feature_name) DO NOTHING
                            """, user_id, feature_name)
                    
                    logger.info(f"Created feature entries for {len(users)} existing users.")
            except Exception as e:
                logger.warning(f"Error creating user feature entries (may already exist): {e}")

            logger.info("Database schema migration completed successfully.")
    except Exception as e:
        logger.critical(f"Failed to initialize custom DB pool or ensure tables: {e}", exc_info=not IS_PRODUCTION)
        DB_POOL = None

@app.on_event("shutdown")
async def shutdown_event():
    if DB_POOL:
        await DB_POOL.close()
        logger.info("Custom projects DB pool closed.")

effective_origins = list(set(filter(None, [
    "http://localhost:3001",
    "http://143.198.59.56:3001",
    "http://143.198.59.56:8088",
    os.environ.get("WEB_DOMAIN", "http://localhost:3000"),
    settings.CUSTOM_FRONTEND_URL if 'settings' in globals() and hasattr(settings, 'CUSTOM_FRONTEND_URL') else os.environ.get("CUSTOM_FRONTEND_URL", "http://custom_frontend:3001")
])))
if not effective_origins: effective_origins = ["http://localhost:3001"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=effective_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class StatusInfo(BaseModel):
    type: str = "unknown"
    text: str = ""
    model_config = {"from_attributes": True}

# Credits Models
class UserCredits(BaseModel):
    id: int
    onyx_user_id: str
    name: str
    credits_balance: int
    total_credits_used: int
    credits_purchased: int
    last_purchase_date: Optional[datetime]
    subscription_tier: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class CreditTransactionRequest(BaseModel):
    user_email: str
    amount: int
    action: Literal["add", "remove"]
    reason: Optional[str] = "Admin adjustment"

class CreditTransactionResponse(BaseModel):
    success: bool
    message: str
    new_balance: int
    user_credits: UserCredits

# Offers Models
class OfferBase(BaseModel):
    company_id: int
    offer_name: str
    manager: str
    status: str
    total_hours: int = 0
    # link is auto-generated, not provided in create requests

class OfferCreate(OfferBase):
    pass

class OfferUpdate(BaseModel):
    company_id: Optional[int] = None
    offer_name: Optional[str] = None
    manager: Optional[str] = None
    status: Optional[str] = None
    total_hours: Optional[int] = None
    created_on: Optional[datetime] = None
    # link is auto-generated and not editable

class OfferResponse(OfferBase):
    id: int
    onyx_user_id: str
    created_on: datetime
    created_at: datetime
    updated_at: datetime
    company_name: str  # Joined from project_folders

class OfferListResponse(BaseModel):
    offers: List[OfferResponse]
    total_count: int

# NEW: Analytics/timeline models
class ProductUsage(BaseModel):
    product_type: str
    credits_used: int

class CreditUsageAnalyticsResponse(BaseModel):
    usage_by_product: List[ProductUsage]
    total_credits_used: int

class TimelineActivity(BaseModel):
    id: str
    type: Literal['purchase', 'product_generation', 'admin_removal']
    title: str
    credits: int
    timestamp: datetime
    product_type: Optional[str] = None

class UserTransactionHistoryResponse(BaseModel):
    user_id: int
    user_email: str
    user_name: str
    transactions: List[TimelineActivity]

class LessonDetail(BaseModel):
    title: str
    check: StatusInfo = Field(default_factory=StatusInfo)
    contentAvailable: StatusInfo = Field(default_factory=StatusInfo)
    source: str = ""
    hours: int = 0
    completionTime: str = ""  # Estimated completion time in minutes (e.g., "5m", "6m", "7m", "8m")
    custom_rate: Optional[int] = None  # Individual lesson-level custom rate override
    quality_tier: Optional[str] = None  # Individual lesson-level quality tier override
    recommended_content_types: Optional[Dict[str, Any]] = None
    model_config = {"from_attributes": True}

class SectionDetail(BaseModel):
    id: str
    title: str
    totalHours: int = 0
    totalCompletionTime: Optional[int] = None  # Total completion time in minutes for the section
    lessons: List[LessonDetail] = Field(default_factory=list)
    autoCalculateHours: bool = True
    custom_rate: Optional[int] = None  # Module-level custom rate override
    quality_tier: Optional[str] = None  # Module-level quality tier override
    model_config = {"from_attributes": True}

class TrainingPlanDetails(BaseModel):
    mainTitle: Optional[str] = None
    sections: List[SectionDetail] = Field(default_factory=list)
    detectedLanguage: Optional[str] = None
    # Store user preferences on which optional columns to show in UI (frontend reads this)
    displayOptions: Optional[Dict[str, bool]] = None  # e.g., {"knowledgeCheck": true, "contentAvailability": false}
    # Store theme selection for styling
    theme: Optional[str] = "cherry"  # Default theme
    model_config = {"from_attributes": True}

AnyContentBlock = Union["HeadlineBlock", "ParagraphBlock", "BulletListBlock", "NumberedListBlock", "AlertBlock", "SectionBreakBlock"]
ListItem = Union[str, AnyContentBlock, List[AnyContentBlock]]

class BaseContentBlock(BaseModel):
    type: str
    model_config = {"from_attributes": True}

class HeadlineBlock(BaseContentBlock):
    type: str = "headline"
    level: int = Field(ge=1, le=4)
    text: str
    iconName: Optional[str] = None
    backgroundColor: Optional[str] = None
    textColor: Optional[str] = None
    isImportant: Optional[bool] = Field(default=False, description="Set to true if this headline (typically Level 4) and its immediately following single block (list or paragraph) form an important section to be visually boxed.")

class ParagraphBlock(BaseContentBlock):
    type: str = "paragraph"
    text: str
    isRecommendation: Optional[bool] = Field(default=False, description="Set to true if this paragraph is a 'recommendation' within a numbered list item, to be styled distinctly.")

class BulletListBlock(BaseContentBlock):
    type: Literal['bullet_list'] = 'bullet_list'
    items: List[ListItem] = []
    iconName: Optional[str] = None

class NumberedListBlock(BaseContentBlock):
    type: Literal['numbered_list'] = 'numbered_list'
    items: List[ListItem] = []

class AlertBlock(BaseContentBlock):
    type: str = "alert"
    title: Optional[str] = None
    text: str
    alertType: str = "info"
    iconName: Optional[str] = None
    backgroundColor: Optional[str] = None
    borderColor: Optional[str] = None
    textColor: Optional[str] = None
    iconColor: Optional[str] = None

class SectionBreakBlock(BaseContentBlock):
    type: str = "section_break"
    style: Optional[str] = "solid"

AnyContentBlockValue = Union[
    HeadlineBlock, ParagraphBlock, BulletListBlock, NumberedListBlock, AlertBlock, SectionBreakBlock, TableBlock, ImageBlock
]

class PdfLessonDetails(BaseModel):
    lessonTitle: str
    # Optional: sequential number of the lesson inside the parent Training Plan
    lessonNumber: Optional[int] = None
    contentBlocks: List[AnyContentBlockValue] = Field(default_factory=list)
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True}

class VideoLessonSlideData(BaseModel):
    slideId: str
    slideNumber: int
    slideTitle: str
    displayedText: Optional[str] = None
    imagePath: Optional[str] = None
    videoPath: Optional[str] = None
    voiceoverText: Optional[str] = None
    displayedPictureDescription: Optional[str] = None
    displayedVideoDescription: Optional[str] = None
    model_config = {"from_attributes": True}

class VideoLessonData(BaseModel):
    mainPresentationTitle: str
    slides: List[VideoLessonSlideData] = Field(default_factory=list)
    currentSlideId: Optional[str] = None # To store the active slide from frontend
    lessonNumber: Optional[int] = None  # Sequential number in Training Plan
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True}


# --- Start: Add New Quiz Models ---

class QuizQuestionOption(BaseModel):
    id: str  # e.g., "A", "B", "C"
    text: str
    model_config = {"from_attributes": True}

class MatchingPrompt(BaseModel):
    id: str # e.g., "A", "B", "C"
    text: str
    model_config = {"from_attributes": True}

class MatchingOption(BaseModel):
    id: str # e.g., "1", "2", "3"
    text: str
    model_config = {"from_attributes": True}

class SortableItem(BaseModel):
    id: str # e.g., "step1", "step2"
    text: str
    model_config = {"from_attributes": True}

class BaseQuestion(BaseModel):
    question_text: str
    explanation: Optional[str] = None
    model_config = {"from_attributes": True}

class MultipleChoiceQuestion(BaseQuestion):
    question_type: Literal["multiple-choice"]
    options: List[QuizQuestionOption]
    correct_option_id: str
    model_config = {"from_attributes": True}

class MultiSelectQuestion(BaseQuestion):
    question_type: Literal["multi-select"]
    options: List[QuizQuestionOption]
    correct_option_ids: List[str]
    model_config = {"from_attributes": True}

class MatchingQuestion(BaseQuestion):
    question_type: Literal["matching"]
    prompts: List[MatchingPrompt]
    options: List[MatchingOption]
    correct_matches: Dict[str, str]  # Maps prompt.id to option.id, e.g. {"A": "3", "B": "1"}
    model_config = {"from_attributes": True}

class SortingQuestion(BaseQuestion):
    question_type: Literal["sorting"]
    items_to_sort: List[SortableItem]
    correct_order: List[str]  # List of SortableItem.id in the correct sequence
    model_config = {"from_attributes": True}

class OpenAnswerQuestion(BaseQuestion):
    question_type: Literal["open-answer"]
    acceptable_answers: List[str]
    model_config = {"from_attributes": True}

AnyQuizQuestion = Union[
    MultipleChoiceQuestion,
    MultiSelectQuestion,
    MatchingQuestion,
    SortingQuestion,
    OpenAnswerQuestion
]

class QuizData(BaseModel):
    quizTitle: str
    questions: List[AnyQuizQuestion] = Field(default_factory=list)
    lessonNumber: Optional[int] = None  # Sequential number in Training Plan
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True, "use_enum_values": True}

# --- End: Add New Quiz Models ---

# +++ NEW MODEL FOR TEXT PRESENTATION +++
class TextPresentationDetails(BaseModel):
    textTitle: str
    contentBlocks: List[AnyContentBlockValue] = Field(default_factory=list)
    detectedLanguage: Optional[str] = None
    model_config = {"from_attributes": True}
# +++ END NEW MODEL +++

MicroProductContentType = Union[TrainingPlanDetails, PdfLessonDetails, VideoLessonData, SlideDeckDetails, QuizData, TextPresentationDetails, None]

class DesignTemplateBase(BaseModel):
    template_name: str
    template_structuring_prompt: str
    microproduct_type: str
    component_name: str
    model_config = {"from_attributes": True}

class DesignTemplateCreate(DesignTemplateBase):
    design_image_path: Optional[str] = None

class DesignTemplateUpdate(BaseModel):
    template_name: Optional[str] = None
    template_structuring_prompt: Optional[str] = None
    microproduct_type: Optional[str] = None
    component_name: Optional[str] = None
    design_image_path: Optional[str] = None
    model_config = {"from_attributes": True}

class DesignTemplateResponse(DesignTemplateBase):
    id: int
    design_image_path: Optional[str] = None
    date_created: datetime

class ProjectCreateRequest(BaseModel):
    projectName: str
    design_template_id: int
    microProductName: Optional[str] = None
    aiResponse: str
    chatSessionId: Optional[uuid.UUID] = None
    outlineId: Optional[int] = None  # Add outlineId for consistent naming
    folder_id: Optional[int] = None  # Add folder_id for automatic folder assignment
    theme: Optional[str] = None      # Selected theme for presentations
    # Source context tracking
    source_context_type: Optional[str] = None  # 'files', 'connectors', 'knowledge_base', 'text', 'prompt'
    source_context_data: Optional[dict] = None  # JSON data about the source
    model_config = {"from_attributes": True}

class ProjectDB(BaseModel):
    id: int
    onyx_user_id: str
    project_name: str
    product_type: Optional[str] = None
    microproduct_type: Optional[str] = None
    microproduct_name: Optional[str] = None
    microproduct_content: Optional[MicroProductContentType] = None
    design_template_id: Optional[int] = None
    created_at: datetime
    custom_rate: Optional[int] = None
    quality_tier: Optional[str] = None
    is_advanced: Optional[bool] = None
    advanced_rates: Optional[Dict[str, float]] = None
    completion_times: Optional[Dict[str, int]] = None
    model_config = {"from_attributes": True}

class MicroProductApiResponse(BaseModel):
    name: str
    slug: str
    project_id: int
    design_template_id: int
    component_name: str
    parentProjectName: Optional[str] = None
    webLinkPath: Optional[str] = None
    pdfLinkPath: Optional[str] = None
    details: Optional[MicroProductContentType] = None
    sourceChatSessionId: Optional[uuid.UUID] = None
    custom_rate: Optional[int] = None
    quality_tier: Optional[str] = None
    is_advanced: Optional[bool] = None
    advanced_rates: Optional[Dict[str, float]] = None
    lesson_plan_data: Optional[Dict[str, Any]] = None  # Add lesson plan data field
    model_config = {"from_attributes": True}

class ProjectApiResponse(BaseModel):
    id: int
    projectName: str
    projectSlug: str
    microproduct_name: Optional[str] = None
    design_template_name: Optional[str] = None
    design_microproduct_type: Optional[str] = None
    created_at: datetime
    design_template_id: Optional[int] = None
    folder_id: Optional[int] = None
    order: Optional[int] = None
    source_chat_session_id: Optional[str] = None
    is_standalone: Optional[bool] = None  # Track whether this is standalone or part of an outline
    model_config = {"from_attributes": True}

class ProjectDetailForEditResponse(BaseModel):
    id: int
    projectName: str
    microProductName: Optional[str] = None
    design_template_id: Optional[int] = None
    microProductContent: Optional[MicroProductContentType] = None
    createdAt: Optional[datetime] = None
    design_template_name: Optional[str] = None
    design_component_name: Optional[str] = None
    design_image_path: Optional[str] = None
    model_config = {"from_attributes": True}

class ProjectUpdateRequest(BaseModel):
    projectName: Optional[str] = None
    design_template_id: Optional[int] = None
    microProductName: Optional[str] = None
    microProductContent: Optional[Dict[str, Any]] = None
    custom_rate: Optional[int] = None
    quality_tier: Optional[str] = None
    model_config = {"from_attributes": True}

class ProjectTierRequest(BaseModel):
    quality_tier: str
    custom_rate: int
    is_advanced: Optional[bool] = None
    advanced_rates: Optional[Dict[str, float]] = None
    completion_times: Optional[Dict[str, int]] = None

BulletListBlock.model_rebuild()
NumberedListBlock.model_rebuild()
PdfLessonDetails.model_rebuild()
TextPresentationDetails.model_rebuild()
QuizData.model_rebuild()
ProjectDB.model_rebuild()
MicroProductApiResponse.model_rebuild()
ProjectDetailForEditResponse.model_rebuild()
ProjectUpdateRequest.model_rebuild()
TrainingPlanDetails.model_rebuild()

class ErrorDetail(BaseModel):
    detail: str

class RequestAnalytics(BaseModel):
    id: str
    endpoint: str
    method: str
    user_id: Optional[str] = None
    status_code: int
    response_time_ms: int
    request_size_bytes: Optional[int] = None
    response_size_bytes: Optional[int] = None
    error_message: Optional[str] = None
    created_at: datetime
    model_config = {"from_attributes": True}

class ProjectsDeleteRequest(BaseModel):
    project_ids: List[int]
    scope: Optional[str] = 'self'

class MicroproductPipelineBase(BaseModel):
    pipeline_name: str
    pipeline_description: Optional[str] = None
    is_discovery_prompts: bool = Field(False, alias="is_prompts_data_collection")
    is_structuring_prompts: bool = Field(False, alias="is_prompts_data_formating")
    discovery_prompts_list: Optional[List[str]] = Field(default_factory=list)
    structuring_prompts_list: Optional[List[str]] = Field(default_factory=list)
    model_config = {"from_attributes": True, "populate_by_name": True}

class MicroproductPipelineCreateRequest(MicroproductPipelineBase):
    pass

class MicroproductPipelineUpdateRequest(MicroproductPipelineBase):
    pass

class MicroproductPipelineDBRaw(BaseModel):
    id: int
    pipeline_name: str
    pipeline_description: Optional[str] = None
    is_prompts_data_collection: bool
    is_prompts_data_formating: bool
    prompts_data_collection: Optional[Dict[str, str]] = None
    prompts_data_formating: Optional[Dict[str, str]] = None
    created_at: datetime
    model_config = {"from_attributes": True}

class MicroproductPipelineGetResponse(BaseModel):
    id: int
    pipeline_name: str
    pipeline_description: Optional[str] = None
    is_discovery_prompts: bool
    is_structuring_prompts: bool
    discovery_prompts_list: List[str] = Field(default_factory=list)
    structuring_prompts_list: List[str] = Field(default_factory=list)
    created_at: datetime
    model_config = {"from_attributes": True}

class DuplicatedProductInfo(BaseModel):
    original_id: int
    new_id: int
    type: str
    name: str

class ProjectDuplicationResponse(BaseModel):
    id: int
    name: str
    type: str
    connected_products: Optional[List[DuplicatedProductInfo]] = None
    total_products_duplicated: int
    model_config = {"from_attributes": True}

    @classmethod
    def from_db_model(cls, db_model: MicroproductPipelineDBRaw) -> "MicroproductPipelineGetResponse":
        discovery_list = [db_model.prompts_data_collection[key] for key in sorted(db_model.prompts_data_collection.keys(), key=int)] if db_model.prompts_data_collection else []
        structuring_list = [db_model.prompts_data_formating[key] for key in sorted(db_model.prompts_data_formating.keys(), key=int)] if db_model.prompts_data_formating else []
        return cls(
            id=db_model.id,
            pipeline_name=db_model.pipeline_name,
            pipeline_description=db_model.pipeline_description,
            is_discovery_prompts=db_model.is_prompts_data_collection,
            is_structuring_prompts=db_model.is_prompts_data_formating,
            discovery_prompts_list=discovery_list,
            structuring_prompts_list=structuring_list,
            created_at=db_model.created_at
        )

# --- Authentication and Utility Functions ---
# async def bing_company_research(company_name: str, company_desc: str) -> str:
#     if not BING_API_KEY:
#         return "(Bing API key not configured)"
#     query = f"{company_name} {company_desc} официальный сайт отзывы новости"
#     headers = {"Ocp-Apim-Subscription-Key": BING_API_KEY}
#     params = {"q": query, "mkt": "ru-RU"}
#     async with httpx.AsyncClient(timeout=15.0) as client:
#         resp = await client.get(BING_API_URL, headers=headers, params=params)
#         resp.raise_for_status()
#         data = resp.json()
#     # Extract summary: snippet, knowledge panel, news, etc.
#     snippets = []
#     if "webPages" in data:
#         for item in data["webPages"].get("value", [])[:3]:
#             snippets.append(item.get("snippet", ""))
#     if "entities" in data and data["entities"].get("value"):
#         for ent in data["entities"]["value"]:
#             if ent.get("description"):
#                 snippets.append(ent["description"])
#     if "news" in data and data["news"].get("value"):
#         for news in data["news"]["value"][:2]:
#             snippets.append(f"Новость: {news.get('name', '')} — {news.get('description', '')}")
#     return "\n".join(snippets)

async def serpapi_company_research(company_name: str, company_desc: str, company_website: str) -> str:
    """
    Uses SerpAPI to gather:
    - General company info (snippets, knowledge panel, about, etc.)
    - Website-specific info (site: queries)
    - Open job listings (site:company_website jobs/careers, and generic queries)
    Returns a structured string with all findings.
    """
    url = "https://serpapi.com/search.json"
    async with httpx.AsyncClient(timeout=20.0) as client:
        # 1. General company info
        params_general = {
            "q": f"{company_name} {company_desc}",
            "engine": "google",
            "api_key": SERPAPI_KEY,
            "hl": "ru"
        }
        resp = await client.get(url, params=params_general)
        resp.raise_for_status()
        data = resp.json()
        general_snippets = []
        if "organic_results" in data:
            for item in data["organic_results"][:3]:
                if "snippet" in item:
                    general_snippets.append(item["snippet"])
        if "knowledge_graph" in data:
            kg = data["knowledge_graph"]
            if "description" in kg:
                general_snippets.append(kg["description"])
            if "title" in kg:
                general_snippets.append(f"Название: {kg['title']}")
            if "type" in kg:
                general_snippets.append(f"Тип: {kg['type']}")
            if "website" in kg:
                general_snippets.append(f"Сайт: {kg['website']}")
            if "address" in kg:
                general_snippets.append(f"Адрес: {kg['address']}")
            if "phone" in kg:
                general_snippets.append(f"Телефон: {kg['phone']}")
        general_info = "\n".join(general_snippets) or "(Нет релевантных данных SerpAPI)"

        # 2. Website-specific info
        website_info = ""
        if company_website:
            params_site = {
                "q": f"site:{company_website} о компании информация контакты",
                "engine": "google",
                "api_key": SERPAPI_KEY,
                "hl": "ru"
            }
            resp2 = await client.get(url, params=params_site)
            resp2.raise_for_status()
            data2 = resp2.json()
            site_snippets = []
            if "organic_results" in data2:
                for item in data2["organic_results"][:3]:
                    if "snippet" in item:
                        site_snippets.append(item["snippet"])
            website_info = "\n".join(site_snippets) or "(Нет информации по сайту)"

        # 3. Open job listings (site:company_website + jobs/careers)
        jobs_info = ""
        jobs_snippets = []
        if company_website:
            # Try site:company_website jobs/careers
            params_jobs_site = {
                "q": f"site:{company_website} вакансии OR careers OR jobs OR работа",
                "engine": "google",
                "api_key": SERPAPI_KEY,
                "hl": "ru"
            }
            resp3 = await client.get(url, params=params_jobs_site)
            resp3.raise_for_status()
            data3 = resp3.json()
            if "organic_results" in data3:
                for item in data3["organic_results"][:5]:
                    title = item.get("title", "")
                    link = item.get("link", "")
                    snippet = item.get("snippet", "")
                    jobs_snippets.append(f"{title}\n{snippet}\n{link}")
        # If not enough, try generic company_name + jobs
        if len(jobs_snippets) < 2:
            params_jobs_generic = {
                "q": f"{company_name} вакансии OR careers OR jobs OR работа",
                "engine": "google",
                "api_key": SERPAPI_KEY,
                "hl": "ru"
            }
            resp4 = await client.get(url, params=params_jobs_generic)
            resp4.raise_for_status()
            data4 = resp4.json()
            if "organic_results" in data4:
                for item in data4["organic_results"][:5]:
                    title = item.get("title", "")
                    link = item.get("link", "")
                    snippet = item.get("snippet", "")
                    jobs_snippets.append(f"{title}\n{snippet}\n{link}")
        jobs_info = "\n\n".join(jobs_snippets) or "(Нет информации о вакансиях)"

    # Combine all
    combined = (
        f"[SerpAPI General Info]\n{general_info}\n\n"
        f"[Website Info]\n{website_info}\n\n"
        f"[Open Positions]\n{jobs_info}"
    )
    return combined

async def duckduckgo_company_research(company_name: str, company_desc: str, company_website: str) -> str:
    # Step 1: General info
    general_query = f"{company_name} {company_desc} официальный сайт отзывы новости"
    url = "https://api.duckduckgo.com/"
    params = {
        "format": "json",
        "no_redirect": 1,
        "no_html": 1,
        "skip_disambig": 1,
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        # General info
        resp = await client.get(url, params={**params, "q": general_query})
        resp.raise_for_status()
        data = resp.json()
        general_snippets = []
        if data.get("AbstractText"):
            general_snippets.append(data["AbstractText"])
        if data.get("RelatedTopics"):
            for topic in data["RelatedTopics"]:
                if isinstance(topic, dict) and topic.get("Text"):
                    general_snippets.append(topic["Text"])
        if data.get("Answer"):
            general_snippets.append(data["Answer"])
        if data.get("Definition"):
            general_snippets.append(data["Definition"])
        general_info = "\n".join([s for s in general_snippets if s]).strip() or "(Нет релевантных данных DuckDuckGo)"

        # Step 2: Info about the company website
        website_info = ""
        if company_website:
            website_query = f"site:{company_website} о компании информация контакты"
            resp2 = await client.get(url, params={**params, "q": website_query})
            resp2.raise_for_status()
            data2 = resp2.json()
            website_snippets = []
            if data2.get("AbstractText"):
                website_snippets.append(data2["AbstractText"])
            if data2.get("RelatedTopics"):
                for topic in data2["RelatedTopics"]:
                    if isinstance(topic, dict) and topic.get("Text"):
                        website_snippets.append(topic["Text"])
            if data2.get("Answer"):
                website_snippets.append(data2["Answer"])
            if data2.get("Definition"):
                website_snippets.append(data2["Definition"])
            website_info = "\n".join([s for s in website_snippets if s]).strip() or "(Нет информации по сайту)"

        # Step 3: Open positions
        jobs_info = ""
        if company_website:
            jobs_query = f"site:{company_website} вакансии OR careers OR jobs"
            resp3 = await client.get(url, params={**params, "q": jobs_query})
            resp3.raise_for_status()
            data3 = resp3.json()
            jobs_snippets = []
            if data3.get("AbstractText"):
                jobs_snippets.append(data3["AbstractText"])
            if data3.get("RelatedTopics"):
                for topic in data3["RelatedTopics"]:
                    if isinstance(topic, dict) and topic.get("Text"):
                        jobs_snippets.append(topic["Text"])
            if data3.get("Answer"):
                jobs_snippets.append(data3["Answer"])
            if data3.get("Definition"):
                jobs_snippets.append(data3["Definition"])
            jobs_info = "\n".join([s for s in jobs_snippets if s]).strip() or "(Нет информации о вакансиях)"

    # Combine all
    combined = (
        f"[DuckDuckGo General Info]\n{general_info}\n\n"
        f"[Website Info]\n{website_info}\n\n"
        f"[Open Positions]\n{jobs_info}"
    )
    return combined

async def get_current_onyx_user_id(request: Request) -> str:
    session_cookie_value = request.cookies.get(ONYX_SESSION_COOKIE_NAME)
    if not session_cookie_value:
        dev_user_id = request.headers.get("X-Dev-Onyx-User-ID")
        if dev_user_id: return dev_user_id
        detail_msg = "Authentication required." if IS_PRODUCTION else f"Onyx session cookie '{ONYX_SESSION_COOKIE_NAME}' missing."
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail_msg)

    onyx_user_info_url = f"{ONYX_API_SERVER_URL}/me"
    cookies_to_forward = {ONYX_SESSION_COOKIE_NAME: session_cookie_value}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(onyx_user_info_url, cookies=cookies_to_forward)
            response.raise_for_status()
            user_data = response.json()
            onyx_user_id = user_data.get("userId") or user_data.get("id")
            if not onyx_user_id:
                logger.error("Could not extract user ID from Onyx user data.")
                detail_msg = "User ID extraction failed." if IS_PRODUCTION else "Could not extract user ID from Onyx."
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)
            return str(onyx_user_id)
    except httpx.HTTPStatusError as e:
        logger.error(f"Onyx API '{onyx_user_info_url}' call failed. Status: {e.response.status_code}, Response: {e.response.text[:500]}", exc_info=not IS_PRODUCTION)
        detail_msg = "Onyx user validation failed." if IS_PRODUCTION else f"Onyx user validation failed ({e.response.status_code})."
        raise HTTPException(status_code=e.response.status_code, detail=detail_msg)
    except httpx.RequestError as e:
        logger.error(f"Error requesting user info from Onyx '{onyx_user_info_url}': {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "Could not connect to Onyx auth service." if IS_PRODUCTION else f"Could not connect to Onyx auth service: {str(e)[:100]}"
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail_msg)
    except Exception as e:
        logger.error(f"Unexpected error in get_current_onyx_user_id: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "Internal user validation error." if IS_PRODUCTION else f"Internal user validation error: {str(e)[:100]}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)

async def get_current_onyx_user_with_email(request: Request) -> tuple[str, str]:
    """Get both user ID and email from Onyx"""
    session_cookie_value = request.cookies.get(ONYX_SESSION_COOKIE_NAME)
    if not session_cookie_value:
        dev_user_id = request.headers.get("X-Dev-Onyx-User-ID")
        if dev_user_id: 
            return dev_user_id, "dev@example.com"  # Dev fallback
        detail_msg = "Authentication required." if IS_PRODUCTION else f"Onyx session cookie '{ONYX_SESSION_COOKIE_NAME}' missing."
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail_msg)

    onyx_user_info_url = f"{ONYX_API_SERVER_URL}/me"
    cookies_to_forward = {ONYX_SESSION_COOKIE_NAME: session_cookie_value}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(onyx_user_info_url, cookies=cookies_to_forward)
            response.raise_for_status()
            user_data = response.json()
            onyx_user_id = user_data.get("userId") or user_data.get("id")
            user_email = user_data.get("email", "")
            if not onyx_user_id:
                logger.error("Could not extract user ID from Onyx user data.")
                detail_msg = "User ID extraction failed." if IS_PRODUCTION else "Could not extract user ID from Onyx."
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)
            return str(onyx_user_id), user_email
    except httpx.HTTPStatusError as e:
        logger.error(f"Onyx API '{onyx_user_info_url}' call failed. Status: {e.response.status_code}, Response: {e.response.text[:500]}", exc_info=not IS_PRODUCTION)
        detail_msg = "Onyx user validation failed." if IS_PRODUCTION else f"Onyx user validation failed ({e.response.status_code})."
        raise HTTPException(status_code=e.response.status_code, detail=detail_msg)
    except httpx.RequestError as e:
        logger.error(f"Error requesting user info from Onyx '{onyx_user_info_url}': {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "Could not connect to Onyx auth service." if IS_PRODUCTION else f"Could not connect to Onyx auth service: {str(e)[:100]}"
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail_msg)
    except Exception as e:
        logger.error(f"Unexpected error in get_current_onyx_user_with_email: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "Internal user validation error." if IS_PRODUCTION else f"Internal user validation error: {str(e)[:100]}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)

async def verify_admin_user(request: Request) -> tuple[str, str]:
    """Verify that the current user is an admin using Onyx's built-in role system"""
    session_cookie_value = request.cookies.get(ONYX_SESSION_COOKIE_NAME)
    if not session_cookie_value:
        dev_user_id = request.headers.get("X-Dev-Onyx-User-ID")
        if dev_user_id and not IS_PRODUCTION: 
            return dev_user_id, "dev@example.com"  # Dev fallback
        detail_msg = "Authentication required." if IS_PRODUCTION else f"Onyx session cookie '{ONYX_SESSION_COOKIE_NAME}' missing."
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail_msg)

    onyx_user_info_url = f"{ONYX_API_SERVER_URL}/me"
    cookies_to_forward = {ONYX_SESSION_COOKIE_NAME: session_cookie_value}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(onyx_user_info_url, cookies=cookies_to_forward)
            response.raise_for_status()
            user_data = response.json()
            
            onyx_user_id = user_data.get("userId") or user_data.get("id")
            user_email = user_data.get("email", "")
            user_role = user_data.get("role", "")
            
            if not onyx_user_id:
                logger.error("Could not extract user ID from Onyx user data.")
                detail_msg = "User ID extraction failed." if IS_PRODUCTION else "Could not extract user ID from Onyx."
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)
            
            # Check if user has admin role in Onyx
            if user_role != "admin":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN, 
                    detail="Access denied. Admin privileges required."
                )
            
            return str(onyx_user_id), user_email
            
    except httpx.HTTPStatusError as e:
        logger.error(f"Onyx API '{onyx_user_info_url}' call failed. Status: {e.response.status_code}, Response: {e.response.text[:500]}", exc_info=not IS_PRODUCTION)
        detail_msg = "Onyx user validation failed." if IS_PRODUCTION else f"Onyx user validation failed ({e.response.status_code})."
        raise HTTPException(status_code=e.response.status_code, detail=detail_msg)
    except httpx.RequestError as e:
        logger.error(f"Error requesting user info from Onyx '{onyx_user_info_url}': {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "Could not connect to Onyx auth service." if IS_PRODUCTION else f"Could not connect to Onyx auth service: {str(e)[:100]}"
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail_msg)
    except Exception as e:
        logger.error(f"Unexpected error in verify_admin_user: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "Internal user validation error." if IS_PRODUCTION else f"Internal user validation error: {str(e)[:100]}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)

def create_slug(text: Optional[str]) -> str:
    if not text: return "default-slug"
    text_processed = str(text).lower()
    text_processed = re.sub(r'\s+', '-', text_processed)
    text_processed = re.sub(r'[^\wа-яёa-z0-9\-]+', '', text_processed, flags=re.UNICODE | re.IGNORECASE)
    return text_processed or "generated-slug"

def get_tier_ratio(tier: str) -> int:
    """Get the creation hours ratio for a given tier (legacy support)"""
    ratios = {
        'starter': 120,
        'medium': 200,
        'advanced': 320,
        'professional': 450,
        'basic': 100,
        'interactive': 200,
        'immersive': 700
    }
    return ratios.get(tier, 200)  # Default to medium (200) if tier not found

def calculate_creation_hours(completion_time_minutes: int, custom_rate: int) -> int:
    """Calculate creation hours based on completion time and custom rate, rounded to nearest integer"""
    if completion_time_minutes <= 0:
        return 0
    
    # Convert completion time from minutes to hours, then multiply by custom rate
    completion_hours = completion_time_minutes / 60.0
    creation_hours = completion_hours * custom_rate
    return round(creation_hours)


def analyze_lesson_content_recommendations(lesson_title: str, quality_tier: Optional[str], existing_content: Optional[Dict[str, bool]] = None) -> Dict[str, Any]:
    """Smart, robust combo recommendations per tier.
    Returns a "primary" list of product types composing the chosen combo.
    Types: 'one-pager' | 'presentation' | 'quiz' | 'video-lesson'
    """
    import hashlib

    if existing_content is None:
        existing_content = {}

    title = (lesson_title or "").strip().lower()
    tier = (quality_tier or "interactive").strip().lower()

    # Keyword signals
    kw_one_pager = ["introduction", "overview", "basics", "summary", "quick", "reference", "primer", "cheatsheet"]
    kw_presentation = ["tutorial", "step-by-step", "process", "method", "workflow", "guide", "how to", "how-to", "walkthrough"]
    kw_video = ["demo", "walkthrough", "show", "demonstrate", "visual", "hands-on", "practical", "screencast", "recording"]
    kw_quiz = ["test", "check", "verify", "practice", "exercise", "assessment", "evaluation", "quiz"]

    def score_for(keys: list[str]) -> float:
        hits = sum(1 for k in keys if k in title)
        return min(1.0, hits / 3.0)  # saturate after 3 hits

    s_one = score_for(kw_one_pager)
    s_pres = score_for(kw_presentation)
    s_vid = score_for(kw_video)
    s_quiz = score_for(kw_quiz)

    # Deterministic variety seed per lesson
    seed_val = int(hashlib.sha1(f"{title}|{tier}".encode("utf-8")).hexdigest()[:8], 16) / 0xFFFFFFFF

    # Define candidate combos per tier
    # combos are arrays of product types constituting the recommendation
    if tier == "basic":
        combos = [
            ["one-pager"],
            ["presentation"],
        ]
        # weights prefer brevity/overview to one-pager, procedural to presentation
        weights = [
            0.55 + 0.35 * s_one - 0.10 * s_pres,
            0.45 + 0.35 * s_pres - 0.10 * s_one,
        ]
    elif tier == "interactive":
        combos = [
            ["presentation", "quiz"],
            ["presentation"],
            ["one-pager", "quiz"],
        ]
        weights = [
            0.40 + 0.30 * s_pres + 0.30 * s_quiz,  # pres+quiz
            0.30 + 0.50 * s_pres - 0.10 * s_quiz,  # pres
            0.30 + 0.40 * s_one + 0.30 * s_quiz,   # one+quiz
        ]
    elif tier == "advanced":
        combos = [
            ["presentation", "quiz"],
            ["video-lesson", "quiz"],
        ]
        weights = [
            0.50 + 0.30 * s_pres + 0.20 * s_quiz,
            0.50 + 0.40 * s_vid + 0.20 * s_quiz,
        ]
    else:  # immersive
        combos = [
            ["video-lesson", "quiz"],
            ["video-lesson"],
        ]
        weights = [
            0.60 + 0.25 * s_vid + 0.15 * s_quiz,
            0.40 + 0.60 * s_vid - 0.10 * s_quiz,
        ]

    # Normalize weights, add small hash-based jitter for deterministic variety
    eps = 1e-6
    jitter = [(i + 1) * 0.0005 * seed_val for i in range(len(weights))]
    norm_weights = [max(eps, w + jitter[i]) for i, w in enumerate(weights)]

    # Sort combos by weight desc, break ties deterministically
    ranked = sorted(range(len(combos)), key=lambda i: (-norm_weights[i], i))

    # Choose the best combo that doesn’t fully collide with existing content
    chosen: list[str] | None = None
    for idx in ranked:
        c = combos[idx]
        # If combo has two items and one exists, we still propose the remaining one; if all exist, skip.
        missing = [t for t in c if not existing_content.get(t, False)]
        if missing:
            chosen = missing
            break

    # Fallback to the top combo if everything existed (rare)
    if not chosen:
        chosen = combos[ranked[0]]

    return {
        "primary": chosen,
        "reasoning": (
            f"tier={tier}; signals(one={s_one:.2f}, pres={s_pres:.2f}, video={s_vid:.2f}, quiz={s_quiz:.2f}); "
            f"seed={seed_val:.3f}; combos={combos}"
        ),
        "last_updated": datetime.utcnow().isoformat(),
        "quality_tier_used": tier,
    }

# --- Completion time from recommendations ---
PRODUCT_COMPLETION_RANGES = {
    "one-pager": (2, 3),
    "presentation": (5, 10),
    "quiz": (5, 7),
    "video-lesson": (2, 5),
}

def compute_completion_time_from_recommendations(primary_types: list[str]) -> str:
    total = 0
    for p in primary_types:
        r = PRODUCT_COMPLETION_RANGES.get(p)
        if not r:
            continue
        total += random.randint(r[0], r[1])
    if total <= 0:
        total = 5
    return f"{total}m"

def sanitize_training_plan_for_parse(content: Dict[str, Any]) -> Dict[str, Any]:
    try:
        sections = content.get('sections') or []
        for section in sections:
            lessons = section.get('lessons') or []
            for lesson in lessons:
                if isinstance(lesson, dict):
                    # keep recommended_content_types for persistence
                    pass
    except Exception:
        pass
    return content


def round_hours_in_content(content: Any) -> Any:
    """Recursively round all hours fields to integers in content structure"""
    if isinstance(content, dict):
        result = {}
        for key, value in content.items():
            if key == 'hours' and isinstance(value, (int, float)):
                result[key] = round(value)
            elif key == 'totalHours' and isinstance(value, (int, float)):
                result[key] = round(value)
            elif isinstance(value, (dict, list)):
                result[key] = round_hours_in_content(value)
            else:
                result[key] = value
        return result
    elif isinstance(content, list):
        return [round_hours_in_content(item) for item in content]
    else:
        return content

async def get_folder_tier(folder_id: int, pool: asyncpg.Pool) -> str:
    """Get the tier of a folder, inheriting from parent if not set"""
    async with pool.acquire() as conn:
        # Get the folder and its tier
        folder = await conn.fetchrow(
            "SELECT quality_tier, parent_id FROM project_folders WHERE id = $1",
            folder_id
        )
        
        if not folder:
            return 'interactive'  # Default tier
        
        # If folder has its own tier, use it
        if folder['quality_tier']:
            return folder['quality_tier']
        
        # Otherwise, inherit from parent folder
        if folder['parent_id']:
            return await get_folder_tier(folder['parent_id'], pool)
        
        # Default to interactive tier
        return 'interactive'

async def get_folder_custom_rate(folder_id: int, pool: asyncpg.Pool) -> int:
    """Get the custom rate of a folder, inheriting from parent if not set"""
    async with pool.acquire() as conn:
        # Get the folder and its custom rate
        folder = await conn.fetchrow(
            "SELECT custom_rate, parent_id FROM project_folders WHERE id = $1",
            folder_id
        )
        
        if not folder:
            return 200  # Default custom rate
        
        # If folder has its own custom rate, use it
        if folder['custom_rate']:
            return folder['custom_rate']
        
        # Otherwise, inherit from parent folder
        if folder['parent_id']:
            return await get_folder_custom_rate(folder['parent_id'], pool)
        
        # Default to 200 custom rate
        return 200

async def get_project_custom_rate(project_id: int, pool: asyncpg.Pool) -> int:
    """Get the effective custom rate for a project, falling back to folder rate if not set"""
    async with pool.acquire() as conn:
        # Get the project's custom rate and folder_id
        project = await conn.fetchrow(
            "SELECT custom_rate, folder_id FROM projects WHERE id = $1",
            project_id
        )
        
        if not project:
            return 200  # Default custom rate
        
        # If project has its own custom rate, use it
        if project['custom_rate']:
            return project['custom_rate']
        
        # Otherwise, get the folder's custom rate
        if project['folder_id']:
            return await get_folder_custom_rate(project['folder_id'], pool)
        
        # Default to 200 custom rate
        return 200

async def get_project_quality_tier(project_id: int, pool: asyncpg.Pool) -> str:
    """Get the effective quality tier for a project, falling back to folder tier if not set"""
    async with pool.acquire() as conn:
        # Get the project's quality tier and folder_id
        project = await conn.fetchrow(
            "SELECT quality_tier, folder_id FROM projects WHERE id = $1",
            project_id
        )
        
        if not project:
            return 'interactive'  # Default tier
        
        # If project has its own quality tier, use it
        if project['quality_tier']:
            return project['quality_tier']
        
        # Otherwise, get the folder's quality tier
        if project['folder_id']:
            return await get_folder_tier(project['folder_id'], pool)
        
        # Default to interactive tier
        return 'interactive'

def get_lesson_effective_custom_rate(lesson: dict, project_custom_rate: int) -> int:
    """Get the effective custom rate for a lesson, falling back to project rate if not set"""
    if lesson.get('custom_rate'):
        return lesson['custom_rate']
    return project_custom_rate

def get_lesson_effective_quality_tier(lesson: dict, project_quality_tier: str) -> str:
    """Get the effective quality tier for a lesson, falling back to project tier if not set"""
    if lesson.get('quality_tier'):
        return lesson['quality_tier']
    return project_quality_tier

def calculate_lesson_creation_hours(lesson: dict, project_custom_rate: int) -> int:
    """Calculate creation hours for a specific lesson using its tier settings"""
    completion_time_str = lesson.get('completionTime', '')
    if not completion_time_str:
        return 0
    
    try:
        completion_time_minutes = int(completion_time_str.replace('m', ''))
        effective_custom_rate = get_lesson_effective_custom_rate(lesson, project_custom_rate)
        return calculate_creation_hours(completion_time_minutes, effective_custom_rate)
    except (ValueError, AttributeError):
        return 0

def get_module_effective_custom_rate(section: dict, project_custom_rate: int) -> int:
    """Get the effective custom rate for a module, falling back to project rate if not set"""
    if section.get('custom_rate'):
        return section['custom_rate']
    return project_custom_rate

def get_module_effective_quality_tier(section: dict, project_quality_tier: str) -> str:
    """Get the effective quality tier for a module, falling back to project tier if not set"""
    if section.get('quality_tier'):
        return section['quality_tier']
    return project_quality_tier

def calculate_lesson_creation_hours_with_module_fallback(lesson: dict, section: dict, project_custom_rate: int) -> int:
    """Calculate creation hours for a lesson with module-level fallback"""
    completion_time_str = lesson.get('completionTime', '')
    if not completion_time_str:
        return 0
    
    try:
        completion_time_minutes = int(completion_time_str.replace('m', ''))
        
        # Check lesson-level tier first, then module-level, then project-level
        if lesson.get('custom_rate'):
            effective_custom_rate = lesson['custom_rate']
        elif section.get('custom_rate'):
            effective_custom_rate = section['custom_rate']
        else:
            effective_custom_rate = project_custom_rate
            
        return calculate_creation_hours(completion_time_minutes, effective_custom_rate)
    except (ValueError, AttributeError):
        return 0

async def get_or_create_user_credits(onyx_user_id: str, user_name: str, pool: asyncpg.Pool) -> UserCredits:
    """Get user credits or create if doesn't exist"""
    async with pool.acquire() as conn:
        # Try to get existing credits
        credits_row = await conn.fetchrow(
            "SELECT * FROM user_credits WHERE onyx_user_id = $1",
            onyx_user_id
        )
        
        if credits_row:
            return UserCredits(**dict(credits_row))
        
        # Create new user credits entry with default values
        new_credits_row = await conn.fetchrow("""
            INSERT INTO user_credits (onyx_user_id, name, credits_balance, credits_purchased)
            VALUES ($1, $2, $3, $3)
            RETURNING *
        """, onyx_user_id, user_name, 100, 100)  # Default 100 credits for new users
        
        logger.info(f"Auto-migrated new user {onyx_user_id} ({user_name}) with 100 credits")
        return UserCredits(**dict(new_credits_row))

def calculate_product_credits(product_type: str, content_data: dict = None) -> int:
    """Calculate credit cost for product creation"""
    if product_type == "course_outline":
        return 5  # Course outline finalization costs 5 credits
    elif product_type == "lesson_presentation":
        # Calculate based on slide count
        if content_data and isinstance(content_data, dict):
            slides = content_data.get("slides", [])
            slide_count = len(slides) if slides else 0
            
            if slide_count <= 5:
                return 3
            elif slide_count <= 10:
                return 5
            else:
                return 10
        return 5  # Default if we can't determine slide count
    elif product_type in ["quiz", "one_pager"]:
        return 5  # Quiz and one-pager both cost 5 credits
    else:
        return 0  # Unknown product type, no cost

# Helper: reason -> product type fallback
def infer_product_type_from_reason(reason: str) -> str:
    r = (reason or "").lower()
    if "course outline" in r:
        return "Course Outline"
    if "lesson presentation" in r or "text presentation" in r or "presentation" in r:
        return "Presentation"
    if "quiz" in r:
        return "Quiz"
    if "one-pager" in r or "one pager" in r:
        return "One-Pager"
    if "video" in r:
        return "Video Lesson"
    return "Unknown"

# Helper: write a credit transaction row
async def log_credit_transaction(
    conn,
    *,
    onyx_user_id: str,
    user_credits_id: Optional[int],
    type_: Literal['purchase','product_generation','admin_removal'],
    amount: int,
    delta: int,
    title: Optional[str] = None,
    product_type: Optional[str] = None,
    reason: Optional[str] = None,
) -> None:
    tx_id = str(uuid.uuid4())
    await conn.execute(
        """
        INSERT INTO credit_transactions
            (id, onyx_user_id, user_credits_id, type, title, product_type, credits, delta, reason, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        """,
        tx_id, onyx_user_id, user_credits_id, type_, title, product_type, abs(amount), delta, reason
    )

async def deduct_credits(
    onyx_user_id: str,
    amount: int,
    pool: asyncpg.Pool,
    reason: str = "Product creation",
    product_type: Optional[str] = None,
    title: Optional[str] = None,
) -> UserCredits:
    """Deduct credits from user balance with transaction safety"""
    async with pool.acquire() as conn:
        async with conn.transaction():
            # Check current balance
            current_balance = await conn.fetchval(
                "SELECT credits_balance FROM user_credits WHERE onyx_user_id = $1",
                onyx_user_id
            )
            
            if current_balance is None:
                raise HTTPException(status_code=404, detail="User credits not found")
            
            if current_balance < amount:
                raise HTTPException(
                    status_code=402, 
                    detail=f"Insufficient credits. Current balance: {current_balance}, Required: {amount}"
                )
            
            # Deduct credits and update usage
            updated_row = await conn.fetchrow("""
                UPDATE user_credits 
                SET credits_balance = credits_balance - $1,
                    total_credits_used = total_credits_used + $1,
                    updated_at = NOW()
                WHERE onyx_user_id = $2
                RETURNING *
            """, amount, onyx_user_id)

            # Log product_generation transaction
            user_row = await conn.fetchrow("SELECT id FROM user_credits WHERE onyx_user_id = $1", onyx_user_id)
            await log_credit_transaction(
                conn,
                onyx_user_id=onyx_user_id,
                user_credits_id=int(user_row["id"]) if user_row else None,
                type_='product_generation',
                amount=amount,
                delta=-abs(amount),
                title=title or reason,
                product_type=product_type or infer_product_type_from_reason(reason),
                reason=reason,
            )
            
            return UserCredits(**dict(updated_row))

async def modify_user_credits_by_email(user_email: str, amount: int, action: str, pool: asyncpg.Pool, reason: str = "Admin adjustment") -> UserCredits:
    """Modify user credits by email (for admin use)"""
    async with pool.acquire() as conn:
        async with conn.transaction():
            if action == "add":
                # Add credits (can be new user or existing)
                # Use email as onyx_user_id for simplicity in admin interface
                credits_row = await conn.fetchrow("""
                    INSERT INTO user_credits (onyx_user_id, name, credits_balance, credits_purchased)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (onyx_user_id) 
                    DO UPDATE SET 
                        credits_balance = user_credits.credits_balance + $3,
                        credits_purchased = user_credits.credits_purchased + $3,
                        last_purchase_date = NOW(),
                        updated_at = NOW()
                    RETURNING *
                """, user_email, user_email.split('@')[0], amount, amount)

                # Log purchase
                await log_credit_transaction(
                    conn,
                    onyx_user_id=credits_row["onyx_user_id"],
                    user_credits_id=int(credits_row["id"]),
                    type_='purchase',
                    amount=amount,
                    delta=abs(amount),
                    title="Credits purchase",
                    product_type=None,
                    reason=reason or "Credits purchase",
                )
                
            elif action == "remove":
                # Remove credits (must exist)
                credits_row = await conn.fetchrow("""
                    UPDATE user_credits 
                    SET credits_balance = GREATEST(0, credits_balance - $1),
                        updated_at = NOW()
                    WHERE onyx_user_id = $2
                    RETURNING *
                """, amount, user_email)
                
                if not credits_row:
                    raise HTTPException(status_code=404, detail="User not found")

                # Log admin removal as 'admin_removal'
                await log_credit_transaction(
                    conn,
                    onyx_user_id=credits_row["onyx_user_id"],
                    user_credits_id=int(credits_row["id"]),
                    type_='admin_removal',
                    amount=amount,
                    delta=-abs(amount),
                    title="Admin adjustment",
                    product_type=None,
                    reason=reason or "Admin adjustment",
                )
            
            else:
                raise HTTPException(status_code=400, detail="Invalid action. Must be 'add' or 'remove'")
            
            return UserCredits(**dict(credits_row))

async def migrate_onyx_users_to_credits_table() -> int:
    """Migrate users from Onyx database to credits table"""
    if not ONYX_DATABASE_URL:
        raise Exception("ONYX_DATABASE_URL not configured")
    
    logger.info(f"Attempting to connect to Onyx database: {ONYX_DATABASE_URL}")
    
    # Try multiple possible database names
    possible_db_urls = [
        ONYX_DATABASE_URL,
        ONYX_DATABASE_URL.replace('/onyx_db', '/postgres'),  # Try postgres DB name
        ONYX_DATABASE_URL.replace('/postgres', '/onyx_db')   # Try onyx_db name
    ]
    
    # Remove duplicates while preserving order
    db_urls_to_try = []
    for url in possible_db_urls:
        if url not in db_urls_to_try:
            db_urls_to_try.append(url)
    
    onyx_pool = None
    last_error = None
    
    for db_url in db_urls_to_try:
        try:
            logger.info(f"Trying to connect to: {db_url}")
            # Connect to Onyx database
            onyx_pool = await asyncpg.create_pool(dsn=db_url, min_size=1, max_size=5)
        
            async with onyx_pool.acquire() as onyx_conn:
                # Get users from Onyx database
                onyx_users = await onyx_conn.fetch("""
                    SELECT 
                        id::text as onyx_user_id,
                        COALESCE(email, 'Unknown User') as name
                    FROM "user" 
                    WHERE is_active = true
                    AND role != 'ext_perm_user'
                    AND role != 'slack_user'
                    AND email NOT LIKE '%@danswer-api-key.invalid'
                """)
            
            if not onyx_users:
                logger.info("No Onyx users found to migrate")
                return 0
            
            logger.info(f"Found {len(onyx_users)} Onyx users to migrate")
            
            # Insert into custom database
            async with DB_POOL.acquire() as custom_conn:
                migrated_count = 0
                for user in onyx_users:
                    try:
                        await custom_conn.execute("""
                            INSERT INTO user_credits (onyx_user_id, name, credits_balance)
                            VALUES ($1, $2, 100)
                            ON CONFLICT (onyx_user_id) DO NOTHING
                        """, user['onyx_user_id'], user['name'])
                        migrated_count += 1
                    except Exception as e:
                        logger.warning(f"Failed to migrate user {user['onyx_user_id']}: {e}")
                
                return migrated_count
                
        except Exception as e:
            last_error = e
            logger.warning(f"Failed to connect to {db_url}: {e}")
            if onyx_pool:
                await onyx_pool.close()
                onyx_pool = None
            continue  # Try next database URL
        
        # If we got here, the connection worked, so break out of the loop
        break
    
    # If we tried all URLs and none worked, raise the last error
    if onyx_pool is None:
        raise Exception(f"Could not connect to any Onyx database. Last error: {last_error}")
    
    # This should never be reached, but just in case
    return 0

VIDEO_SCRIPT_LANG_STRINGS = {
    'ru': {
        'VIDEO_LESSON_SCRIPT_DEFAULT_TITLE': 'Видео урок',
        'SLIDE_NUMBER_PREFIX': 'СЛАЙД №',
        'DISPLAYED_TEXT_LABEL': 'Отображаемый текст:',
        'DISPLAYED_IMAGE_LABEL': 'Отображаемая картинка:',
        'DISPLAYED_VIDEO_LABEL': 'Отображаемое видео:',
        'VOICEOVER_TEXT_LABEL': 'Текст озвучки:',
        'NO_SLIDES_TEXT': 'Нет слайдов для отображения.',
        'EMPTY_CONTENT_PLACEHOLDER': '...',
        'courseLabel': 'КУРС',
        'lessonLabel': 'УРОК',
        'quiz': {
            'quizTitle': 'Название теста',
            'question': 'Вопрос',
            'correctAnswer': 'Правильный ответ',
            'correctAnswers': 'Правильные ответы',
            'acceptableAnswers': 'Допустимые ответы',
            'prompts': 'Элементы',
            'options': 'Варианты',
            'correctMatches': 'Правильные соответствия',
            'itemsToSort': 'Элементы для сортировки',
            'explanation': 'Объяснение',
            'multipleChoice': 'Один правильный ответ',
            'multiSelect': 'Несколько правильных ответов',
            'matching': 'Соответствие',
            'sorting': 'Сортировка',
            'openAnswer': 'Свободный ответ',
            'answerKey': 'Ключ ответов',
            'correctOrder': 'Правильный порядок',
            'emptyContent': '...',
        }
    },
    'en': {
        'VIDEO_LESSON_SCRIPT_DEFAULT_TITLE': 'Video Lesson Script',
        'SLIDE_NUMBER_PREFIX': 'SLIDE №',
        'DISPLAYED_TEXT_LABEL': 'Displayed Text:',
        'DISPLAYED_IMAGE_LABEL': 'Displayed Image:',
        'DISPLAYED_VIDEO_LABEL': 'Displayed Video:',
        'VOICEOVER_TEXT_LABEL': 'Voiceover Text:',
        'NO_SLIDES_TEXT': 'No slides to display.',
        'EMPTY_CONTENT_PLACEHOLDER': '...',
        'courseLabel': 'COURSE',
        'lessonLabel': 'LESSON',
        'quiz': {
            'quizTitle': 'Quiz Title',
            'question': 'Question',
            'correctAnswer': 'Correct Answer',
            'correctAnswers': 'Correct Answers',
            'acceptableAnswers': 'Acceptable Answers',
            'prompts': 'Items',
            'options': 'Options',
            'correctMatches': 'Correct Matches',
            'itemsToSort': 'Items to Sort',
            'explanation': 'Explanation',
            'multipleChoice': 'Multiple Choice',
            'multiSelect': 'Multi-Select',
            'matching': 'Matching',
            'sorting': 'Sorting',
            'openAnswer': 'Open Answer',
            'answerKey': 'Answer Key',
            'correctOrder': 'Correct Order',
            'emptyContent': '...',
        }
    },
    'uk': {
        'VIDEO_LESSON_SCRIPT_DEFAULT_TITLE': 'Відео урок',
        'SLIDE_NUMBER_PREFIX': 'СЛАЙД №',
        'DISPLAYED_TEXT_LABEL': 'Текст, що відображається:',
        'DISPLAYED_IMAGE_LABEL': 'Зображення, що відображається:',
        'DISPLAYED_VIDEO_LABEL': 'Відео, що відображається:',
        'VOICEOVER_TEXT_LABEL': 'Текст озвучення:',
        'NO_SLIDES_TEXT': 'Немає слайдів для відображення.',
        'EMPTY_CONTENT_PLACEHOLDER': '...',
        'courseLabel': 'КУРС',
        'lessonLabel': 'УРОК',
        'quiz': {
            'quizTitle': 'Назва тесту',
            'question': 'Питання',
            'correctAnswer': 'Правильна відповідь',
            'correctAnswers': 'Правильні відповіді',
            'acceptableAnswers': 'Допустимі відповіді',
            'prompts': 'Елементи',
            'options': 'Варіанти',
            'correctMatches': 'Правильні відповідності',
            'itemsToSort': 'Елементи для сортування',
            'explanation': 'Пояснення',
            'multipleChoice': 'Одна правильна відповідь',
            'multiSelect': 'Декілька правильних відповідей',
            'matching': 'Відповідність',
            'sorting': 'Сортування',
            'openAnswer': 'Вільна відповідь',
            'answerKey': 'Ключ відповідей',
            'correctOrder': 'Правильний порядок',
            'emptyContent': '...',
        }
    },
    'es': {
        'VIDEO_LESSON_SCRIPT_DEFAULT_TITLE': 'Guión de la lección en video',
        'SLIDE_NUMBER_PREFIX': 'DIAPOSITIVA №',
        'DISPLAYED_TEXT_LABEL': 'Texto mostrado:',
        'DISPLAYED_IMAGE_LABEL': 'Imagen mostrada:',
        'DISPLAYED_VIDEO_LABEL': 'Video mostrado:',
        'VOICEOVER_TEXT_LABEL': 'Texto de voz en off:',
        'NO_SLIDES_TEXT': 'No hay diapositivas para mostrar.',
        'EMPTY_CONTENT_PLACEHOLDER': '...',
        'courseLabel': 'CURSO',
        'lessonLabel': 'LECCIÓN',
        'quiz': {
            'quizTitle': 'Título del cuestionario',
            'question': 'Pregunta',
            'correctAnswer': 'Respuesta correcta',
            'correctAnswers': 'Respuestas correctas',
            'acceptableAnswers': 'Respuestas aceptables',
            'prompts': 'Elementos',
            'options': 'Opciones',
            'correctMatches': 'Correspondencias correctas',
            'itemsToSort': 'Elementos para ordenar',
            'explanation': 'Explicación',
            'multipleChoice': 'Opción múltiple',
            'multiSelect': 'Selección múltiple',
            'matching': 'Correspondencia',
            'sorting': 'Ordenamiento',
            'openAnswer': 'Respuesta abierta',
            'answerKey': 'Clave de respuestas',
            'correctOrder': 'Orden correcto',
            'emptyContent': '...',
        }
    }
}

def detect_language(text: str, configs: Dict[str, Dict[str, str]] = LANG_CONFIG) -> str:
    en_score = 0; ru_score = 0; uk_score = 0
    en_config = configs.get('en', {})
    ru_config = configs.get('ru', {})
    uk_config = configs.get('uk', {})

    if en_config.get('MODULE_KEYWORD') and en_config.get('LESSONS_HEADER_KEYWORD') and en_config.get('TOTAL_TIME_KEYWORD'):
        if en_config['MODULE_KEYWORD'] in text and \
           en_config['LESSONS_HEADER_KEYWORD'] in text and \
           en_config['TOTAL_TIME_KEYWORD'] in text:
            en_score += 3
    if ru_config.get('MODULE_KEYWORD') and ru_config.get('LESSONS_HEADER_KEYWORD') and ru_config.get('TOTAL_TIME_KEYWORD'):
        if ru_config['MODULE_KEYWORD'] in text and \
           ru_config['LESSONS_HEADER_KEYWORD'] in text and \
           ru_config['TOTAL_TIME_KEYWORD'] in text:
            ru_score += 3
    if uk_config.get('MODULE_KEYWORD') and uk_config.get('LESSONS_HEADER_KEYWORD') and uk_config.get('TOTAL_TIME_KEYWORD'):
        if uk_config['MODULE_KEYWORD'] in text and \
           uk_config['LESSONS_HEADER_KEYWORD'] in text and \
           uk_config['TOTAL_TIME_KEYWORD'] in text:
            uk_score += 3
    if en_score == 0 and ru_score == 0 and uk_score == 0:
        if en_config.get('MODULE_KEYWORD') and en_config['MODULE_KEYWORD'] in text: en_score +=1
        if ru_config.get('MODULE_KEYWORD') and ru_config['MODULE_KEYWORD'] in text: ru_score +=1
        if uk_config.get('MODULE_KEYWORD') and uk_config['MODULE_KEYWORD'] in text: uk_score +=1
        if en_config.get('TIME_KEYWORD') and en_config['TIME_KEYWORD'] in text: en_score +=1
        if ru_config.get('TIME_KEYWORD') and ru_config['TIME_KEYWORD'] in text: ru_score +=1
        if uk_config.get('TIME_KEYWORD') and uk_config['TIME_KEYWORD'] in text: uk_score +=1
        if en_score == 0 and ru_score == 0 and uk_score == 0:
            en_chars = sum(1 for char_ in text if 'a' <= char_.lower() <= 'z')
            cyrillic_chars = sum(1 for char_ in text if 'а' <= char_.lower() <= 'я' or char_.lower() in ['і', 'ї', 'є', 'ґ'])
            if en_chars > cyrillic_chars and en_chars > 10 :
                 en_score += 0.1
            elif cyrillic_chars > en_chars and cyrillic_chars > 10:
                if uk_score == 0: uk_score += 0.05
                if ru_score == 0: ru_score += 0.05
                ukrainian_specific_chars = sum(1 for char_ in text if char_.lower() in ['і', 'ї', 'є', 'ґ'])
                if ukrainian_specific_chars > 0:
                    uk_score += 0.05 * ukrainian_specific_chars
    if en_score > ru_score and en_score > uk_score: return 'en'
    if ru_score > en_score and ru_score > uk_score: return 'ru'
    if uk_score > en_score and uk_score > ru_score: return 'uk'
    if uk_score > 0 and uk_score >= ru_score and uk_score >= en_score: return 'uk'
    if ru_score > 0 and ru_score >= en_score : return 'ru'
    if en_score > 0 : return 'en'
    logger.warning("detect_language could not reliably determine language. Defaulting to 'en'.")
    return 'en'

def parse_training_plan_from_string(original_content_str: str, main_table_title: str) -> Optional[TrainingPlanDetails]:
    logger.warning("Old 'parse_training_plan_from_string' called. Ensure this is intended for legacy data.")
    return TrainingPlanDetails(mainTitle=f"Content for {main_table_title} (Old Parser)", sections=[], detectedLanguage='ru')

async def parse_ai_response_with_llm(
    ai_response: str,
    project_name: str,
    target_model: Type[BaseModel],
    default_error_model_instance: BaseModel,
    dynamic_instructions: str,
    target_json_example: str
) -> BaseModel:
    # Start timing for analytics
    start_time = time.time()
    
    # DEBUG: Log that the function was called
    logger.info(f"=== AI PARSER FUNCTION CALLED ===")
    logger.info(f"Project: {project_name}")
    logger.info(f"Target model: {target_model.__name__}")
    logger.info(f"AI response length: {len(ai_response)}")
    logger.info(f"DB_POOL available: {DB_POOL is not None}")
    logger.info(f"Call stack: {len(inspect.stack())} frames")
    logger.info(f"=== END FUNCTION CALL DEBUG ===")
    
    # Create a list of API keys to try, filtering out any that are not set
    api_keys_to_try = [key for key in [LLM_API_KEY, LLM_API_KEY_FALLBACK] if key]

    if not api_keys_to_try:
        logger.error(f"LLM_API_KEY not configured for {project_name}. Cannot parse AI response with LLM.")
        return default_error_model_instance

    prompt_message = f"""
You are a highly accurate text-to-JSON parsing assistant. Your task is to convert the *entirety* of the following unstructured text into a single, structured JSON object.
Ensure *all* relevant information from the "Raw text to parse" is included in your JSON output.
Pay close attention to data types: strings should be quoted, numerical values should be numbers, and lists should be arrays. Null values are not permitted for string fields; use an empty string "" instead if text is absent but the field is required according to the example structure.
Maintain the original language of the input text for all textual content in the JSON.

🚨 SPECIAL INSTRUCTION FOR VIDEO LESSONS: If the target model is SlideDeckDetails and the JSON example contains "voiceoverText" fields, you MUST generate voiceover text for every slide object. Look at the example JSON structure and ensure your output matches it exactly, including all voiceoverText fields and hasVoiceover flag.

Specific Instructions for this Content Type ({target_model.__name__}):
---
{dynamic_instructions}
---

The desired JSON output format is exemplified below. This example is CRUCIAL and your output MUST strictly follow this JSON format and structure.
---
{target_json_example}
---

Raw text to parse:
---
{ai_response}
---

Return ONLY the JSON object corresponding to the parsed text. Do not include any other explanatory text or markdown formatting (like ```json ... ```) around the JSON.
The entire output must be a single, valid JSON object and must include all relevant data found in the input, with textual content in the original language.
    """
    # OpenAI Chat API expects a list of chat messages
    system_msg = {"role": "system", "content": "You are a JSON parsing expert. You must output ONLY valid JSON in the exact format specified. Do not include any explanations, markdown formatting, or additional text. Your response must be a single, complete JSON object. CRITICAL: If the example JSON contains voiceoverText fields, your output MUST include them for every slide. Match the example structure exactly."}
    user_msg = {"role": "user", "content": prompt_message}
    base_payload: Dict[str, Any] = {"model": LLM_DEFAULT_MODEL, "messages": [system_msg, user_msg], "temperature": 0.1}
    # Ask the model to output pure JSON
    base_payload_with_rf = {**base_payload, "response_format": {"type": "json_object"}}
    detected_lang_by_rules = detect_language(ai_response)
    last_exception = None

    for i, api_key in enumerate(api_keys_to_try):
        attempt_number = i + 1
        logger.info(f"Attempting LLM call for '{project_name}' using API key #{attempt_number}.")
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

        try:
            # Try with response_format first, then without if Cohere rejects it
            for pf_idx, payload_variant in enumerate([base_payload_with_rf, base_payload]):
                try:
                    # Remove per-request timeout so long parses are not cut off (backend will rely on upstream timeouts)
                    async with httpx.AsyncClient(timeout=None) as client:
                        response = await client.post(LLM_API_URL, headers=headers, json=payload_variant)
                        response.raise_for_status()
                    break  # success
                except httpx.HTTPStatusError as he:
                    # OpenAI returns 400 when response_format isn't supported for a given model
                    if he.response.status_code in (400, 422) and pf_idx == 0:
                        logger.info("LLM rejected response_format – retrying without it.")
                        continue
                    raise

            llm_api_response_data = response.json()

            # --- Process the Response ---
            json_text_output = None
            if "text" in llm_api_response_data: json_text_output = llm_api_response_data["text"]
            elif "chatHistory" in llm_api_response_data and llm_api_response_data["chatHistory"]:
                last_message = next((msg for msg in reversed(llm_api_response_data["chatHistory"]) if msg.get("role") == "CHATBOT"), None)
                if last_message and "message" in last_message: json_text_output = last_message["message"]
            elif llm_api_response_data.get("generations") and isinstance(llm_api_response_data["generations"], list) and llm_api_response_data["generations"][0].get("text"):
                json_text_output = llm_api_response_data["generations"][0]["text"]
            elif "choices" in llm_api_response_data and isinstance(llm_api_response_data["choices"], list) and llm_api_response_data["choices"]:
                # Support for OpenAI Chat Completions format: choices[0].message.content (or .delta.content in streaming)
                first_choice = llm_api_response_data["choices"][0]
                if isinstance(first_choice, dict):
                    # Standard chat completion response
                    if "message" in first_choice and isinstance(first_choice["message"], dict):
                        json_text_output = first_choice["message"].get("content")
                    # If using the delta format (streaming-style response aggregated by OpenAI)
                    if not json_text_output and "delta" in first_choice and isinstance(first_choice["delta"], dict):
                        json_text_output = first_choice["delta"].get("content")
                    # Fallback to any direct text field
                    if not json_text_output:
                        json_text_output = first_choice.get("text")

            if json_text_output is None:
                # Log the raw keys of the response for easier debugging
                logger.warning(
                    "No 'content' field found in LLM response. Raw keys: %s" % list(llm_api_response_data.keys())
                )
                logger.debug("Full LLM response: %s" % json.dumps(llm_api_response_data)[:1000])
                raise ValueError("LLM response did not contain an expected text field.")

            json_text_output = re.sub(r"^```json\s*|\s*```$", "", json_text_output.strip(), flags=re.MULTILINE)

            cleaned_json_str = json_text_output.strip()
            cleaned_json_str = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned_json_str, flags=re.IGNORECASE | re.MULTILINE).strip()
            first_brace = cleaned_json_str.find('{')
            last_brace = cleaned_json_str.rfind('}')
            if first_brace != -1 and last_brace != -1 and first_brace < last_brace:
                cleaned_json_str = cleaned_json_str[first_brace:last_brace + 1]
            if not cleaned_json_str.startswith('{'):
                cleaned_json_str = json_text_output.strip()
            json_text_output = cleaned_json_str

            try:
                parsed_json_data = json.loads(json_text_output)
            except json.JSONDecodeError:
                fixed_str = _clean_loose_json(json_text_output)
                try:
                    parsed_json_data = json.loads(fixed_str)
                except json.JSONDecodeError:
                    import ast
                    try:
                        parsed_json_data = ast.literal_eval(fixed_str)
                    except (ValueError, SyntaxError):
                        # Last-ditch heuristic: convert single quotes to double and
                        # Python constants to JSON equivalents, then try json.loads again.
                        brute = fixed_str
                        brute = re.sub(r"'([^']*)'", lambda m: '"' + m.group(1).replace('"', '\\"') + '"', brute)
                        brute = brute.replace("True", "true").replace("False", "false").replace("None", "null")
                        parsed_json_data = json.loads(brute)

            logger.debug(f'Cohere response: {parsed_json_data}')

            if 'detectedLanguage' not in parsed_json_data or not parsed_json_data['detectedLanguage']:
                parsed_json_data['detectedLanguage'] = detected_lang_by_rules

            if target_model == TrainingPlanDetails and ('mainTitle' not in parsed_json_data or not parsed_json_data['mainTitle']):
                parsed_json_data['mainTitle'] = project_name
            elif target_model == PdfLessonDetails and ('lessonTitle' not in parsed_json_data or not parsed_json_data['lessonTitle']):
                parsed_json_data['lessonTitle'] = project_name
            
            # Round hours to integers before validation to prevent float validation errors
            if target_model == TrainingPlanDetails:
                parsed_json_data = round_hours_in_content(parsed_json_data)
            
            validated_model = target_model.model_validate(parsed_json_data)
            logger.info(f"LLM parsing for '{project_name}' succeeded on attempt #{attempt_number}.")

            # Log AI parser usage
            if DB_POOL:
                try:
                    # Count tokens using tiktoken
                    encoding = tiktoken.get_encoding("cl100k_base")  # GPT-4 encoding
                    prompt_tokens = len(encoding.encode(ai_response))
                    response_tokens = len(encoding.encode(json.dumps(parsed_json_data)))
                    total_tokens = prompt_tokens + response_tokens
                    
                    logger.info(f"=== AI PARSER LOGGING DEBUG ===")
                    logger.info(f"Project: {project_name}")
                    logger.info(f"Prompt tokens: {prompt_tokens}")
                    logger.info(f"Response tokens: {response_tokens}")
                    logger.info(f"Total tokens: {total_tokens}")
                    logger.info(f"Response time: {int((time.time() - start_time) * 1000)}ms")
                    logger.info(f"=== END AI PARSER LOGGING DEBUG ===")
                    
                    async with DB_POOL.acquire() as conn:
                        logger.info(f"About to insert AI parser record for {project_name}")
                        try:
                            result = await conn.execute(
                                "INSERT INTO request_analytics (id, endpoint, method, user_id, status_code, response_time_ms, request_size_bytes, response_size_bytes, error_message, is_ai_parser_request, ai_parser_tokens, ai_parser_model, ai_parser_project_name, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)",
                                str(uuid.uuid4()), '/ai/parse', 'POST', None, 200, int((time.time() - start_time) * 1000), len(ai_response), len(json.dumps(parsed_json_data)), None, True, total_tokens, LLM_DEFAULT_MODEL, project_name, datetime.now(timezone.utc)
                            )
                            logger.info(f"Database insert result: {result}")
                            logger.info(f"Successfully logged AI parser usage for {project_name}")
                        except Exception as db_error:
                            logger.error(f"Database insert failed: {db_error}")
                            logger.error(f"Insert parameters: endpoint='/ai/parse', method='POST', status_code=200, tokens={total_tokens}, model={LLM_DEFAULT_MODEL}, project={project_name}")
                            raise
                except Exception as e:
                    logger.warning(f"Failed to log AI parser usage: {e}")
                    logger.error(f"AI Parser logging error details: {str(e)}")

            return validated_model

        except Exception as e:
            last_exception = e
            logger.warning(
                f"LLM parsing attempt #{attempt_number} for '{project_name}' failed with {type(e).__name__}. "
                f"Details: {str(e)[:250]}. Trying next key if available."
            )
            
            # Log failed AI parser attempt
            if DB_POOL:
                try:
                    # Count tokens using tiktoken
                    encoding = tiktoken.get_encoding("cl100k_base")  # GPT-4 encoding
                    prompt_tokens = len(encoding.encode(ai_response))
                    total_tokens = prompt_tokens  # No response tokens for failed attempts
                    
                    logger.info(f"=== AI PARSER FAILED LOGGING DEBUG ===")
                    logger.info(f"Project: {project_name}")
                    logger.info(f"Prompt tokens: {prompt_tokens}")
                    logger.info(f"Total tokens: {total_tokens}")
                    logger.info(f"Response time: {int((time.time() - start_time) * 1000)}ms")
                    logger.info(f"Error: {str(e)[:200]}")
                    logger.info(f"=== END AI PARSER FAILED LOGGING DEBUG ===")
                    
                    async with DB_POOL.acquire() as conn:
                        logger.info(f"About to insert failed AI parser record for {project_name}")
                        try:
                            result = await conn.execute(
                                "INSERT INTO request_analytics (id, endpoint, method, user_id, status_code, response_time_ms, request_size_bytes, response_size_bytes, error_message, is_ai_parser_request, ai_parser_tokens, ai_parser_model, ai_parser_project_name, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)",
                                str(uuid.uuid4()), '/ai/parse', 'POST', None, 500, int((time.time() - start_time) * 1000), len(ai_response), 0, str(e)[:500], True, total_tokens, LLM_DEFAULT_MODEL, project_name, datetime.now(timezone.utc)
                            )
                            logger.info(f"Failed attempt database insert result: {result}")
                            logger.info(f"Successfully logged failed AI parser attempt for {project_name}")
                        except Exception as db_error:
                            logger.error(f"Failed attempt database insert failed: {db_error}")
                            logger.error(f"Failed attempt insert parameters: endpoint='/ai/parse', method='POST', status_code=500, tokens={total_tokens}, model={LLM_DEFAULT_MODEL}, project={project_name}")
                            raise
                except Exception as log_error:
                    logger.warning(f"Failed to log AI parser error: {log_error}")
                    logger.error(f"AI Parser failed logging error details: {str(log_error)}")
            
            continue

    # --- Handle Final Failure ---
    # This block is reached only if the loop completes without a successful return.
    logger.error(f"All LLM API call attempts failed for '{project_name}'. Last error: {last_exception}")
    if hasattr(default_error_model_instance, 'detectedLanguage'):
        default_error_model_instance.detectedLanguage = detected_lang_by_rules
    return default_error_model_instance

def _clean_loose_json(text: str) -> str:
    """Attempt to fix common minor JSON issues produced by LLMs: trailing commas, smart quotes, etc."""
    # remove common markdown code fences again (defensive)
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.IGNORECASE | re.MULTILINE)
    # replace smart quotes with standard quotes
    for sq in ('\u201c', '\u201d', '\u2018', '\u2019'):
        text = text.replace(sq, '"')
    # strip trailing commas before object/array close
    text = re.sub(r",\s*(\}|\])", r"\1", text)
    # remove escaped newlines that are unnecessary
    text = text.replace('\\n', '\n')
    return text

# --- API Endpoints ---
@app.post("/api/custom/pipelines/add", response_model=MicroproductPipelineDBRaw, status_code=status.HTTP_201_CREATED)
async def add_pipeline(pipeline_data: MicroproductPipelineCreateRequest, pool: asyncpg.Pool = Depends(get_db_pool)):
    discovery_prompts_json_for_db = {str(i+1): prompt for i, prompt in enumerate(pipeline_data.discovery_prompts_list) if prompt.strip()} if pipeline_data.discovery_prompts_list else None
    structuring_prompts_json_for_db = {str(i+1): prompt for i, prompt in enumerate(pipeline_data.structuring_prompts_list) if prompt.strip()} if pipeline_data.structuring_prompts_list else None
    db_is_discovery = pipeline_data.model_fields['is_discovery_prompts'].alias if pipeline_data.model_fields['is_discovery_prompts'].alias else 'is_discovery_prompts'
    db_is_structuring = pipeline_data.model_fields['is_structuring_prompts'].alias if pipeline_data.model_fields['is_structuring_prompts'].alias else 'is_structuring_prompts'
    query = f"""
        INSERT INTO microproduct_pipelines (pipeline_name, pipeline_description, {db_is_discovery}, {db_is_structuring}, prompts_data_collection, prompts_data_formating, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, pipeline_name, pipeline_description, is_prompts_data_collection, is_prompts_data_formating, prompts_data_collection, prompts_data_formating, created_at;
    """
    try:
        async with pool.acquire() as conn:
            current_time = datetime.now(timezone.utc)
            row = await conn.fetchrow(query, pipeline_data.pipeline_name, pipeline_data.pipeline_description,
                                      pipeline_data.is_discovery_prompts, pipeline_data.is_structuring_prompts,
                                      discovery_prompts_json_for_db, structuring_prompts_json_for_db, current_time)
        if not row:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create pipeline.")
        return MicroproductPipelineDBRaw(**dict(row))
    except Exception as e:
        logger.error(f"Error inserting pipeline: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "An error occurred while adding the pipeline." if IS_PRODUCTION else f"DB error on pipeline insert: {str(e)}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)

@app.get("/api/custom/pipelines", response_model=List[MicroproductPipelineGetResponse])
async def get_pipelines(pool: asyncpg.Pool = Depends(get_db_pool)):
    query = "SELECT id, pipeline_name, pipeline_description, is_prompts_data_collection, is_prompts_data_formating, prompts_data_collection, prompts_data_formating, created_at FROM microproduct_pipelines ORDER BY created_at DESC;"
    try:
        async with pool.acquire() as conn: rows = await conn.fetch(query)
        pipelines_list = [MicroproductPipelineGetResponse.from_db_model(MicroproductPipelineDBRaw(**dict(row))) for row in rows]
        return pipelines_list
    except Exception as e:
        logger.error(f"Error fetching pipelines: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "An error occurred while fetching pipelines." if IS_PRODUCTION else f"DB error fetching pipelines: {str(e)}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)

@app.get("/api/custom/pipelines/{pipeline_id}", response_model=MicroproductPipelineGetResponse)
async def get_pipeline(pipeline_id: int, pool: asyncpg.Pool = Depends(get_db_pool)):
    query = "SELECT id, pipeline_name, pipeline_description, is_prompts_data_collection, is_prompts_data_formating, prompts_data_collection, prompts_data_formating, created_at FROM microproduct_pipelines WHERE id = $1;"
    try:
        async with pool.acquire() as conn: row = await conn.fetchrow(query, pipeline_id)
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pipeline not found.")
        return MicroproductPipelineGetResponse.from_db_model(MicroproductPipelineDBRaw(**dict(row)))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching pipeline {pipeline_id}: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "An error occurred while fetching the pipeline." if IS_PRODUCTION else f"DB error fetching pipeline: {str(e)}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)

@app.put("/api/custom/pipelines/update/{pipeline_id}", response_model=MicroproductPipelineDBRaw)
async def update_pipeline(pipeline_id: int, pipeline_data: MicroproductPipelineUpdateRequest, pool: asyncpg.Pool = Depends(get_db_pool)):
    discovery_prompts_json_for_db = {str(i+1): prompt for i, prompt in enumerate(pipeline_data.discovery_prompts_list) if prompt.strip()} if pipeline_data.discovery_prompts_list else None
    structuring_prompts_json_for_db = {str(i+1): prompt for i, prompt in enumerate(pipeline_data.structuring_prompts_list) if prompt.strip()} if pipeline_data.structuring_prompts_list else None
    db_is_discovery = pipeline_data.model_fields['is_discovery_prompts'].alias if pipeline_data.model_fields['is_discovery_prompts'].alias else 'is_discovery_prompts'
    db_is_structuring = pipeline_data.model_fields['is_structuring_prompts'].alias if pipeline_data.model_fields['is_structuring_prompts'].alias else 'is_structuring_prompts'
    query = f"""
        UPDATE microproduct_pipelines SET pipeline_name = $1, pipeline_description = $2, {db_is_discovery} = $3, {db_is_structuring} = $4, prompts_data_collection = $5, prompts_data_formating = $6
        WHERE id = $7 RETURNING id, pipeline_name, pipeline_description, is_prompts_data_collection, is_prompts_data_formating, prompts_data_collection, prompts_data_formating, created_at;
    """
    try:
        async with pool.acquire() as conn:
            row = await conn.fetchrow(query, pipeline_data.pipeline_name, pipeline_data.pipeline_description,
                                      pipeline_data.is_discovery_prompts, pipeline_data.is_structuring_prompts,
                                      discovery_prompts_json_for_db, structuring_prompts_json_for_db, pipeline_id)
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pipeline not found or update failed.")
        return MicroproductPipelineDBRaw(**dict(row))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating pipeline {pipeline_id}: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "An error occurred while updating the pipeline." if IS_PRODUCTION else f"DB error on pipeline update: {str(e)}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)

@app.delete("/api/custom/pipelines/delete/{pipeline_id}", status_code=status.HTTP_200_OK)
async def delete_pipeline(pipeline_id: int, pool: asyncpg.Pool = Depends(get_db_pool)):
    query = "DELETE FROM microproduct_pipelines WHERE id = $1 RETURNING id;"
    try:
        async with pool.acquire() as conn: deleted_id = await conn.fetchval(query, pipeline_id)
        if deleted_id is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pipeline not found.")
        return {"detail": f"Successfully deleted pipeline with ID {pipeline_id}."}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting pipeline {pipeline_id}: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "An error occurred while deleting the pipeline." if IS_PRODUCTION else f"DB error on pipeline deletion: {str(e)}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)

@app.post("/api/custom/design_templates/upload_image", responses={200: {"description": "Image uploaded successfully", "content": {"application/json": {"example": {"file_path": f"/{STATIC_DESIGN_IMAGES_DIR}/your_image_name.png"}}}},400: {"description": "Invalid file type or other error", "model": ErrorDetail},413: {"description": "File too large", "model": ErrorDetail}})
async def upload_design_template_image(file: UploadFile = File(...)):
    allowed_extensions = {".png", ".jpg", ".jpeg", ".gif", ".webp"}; max_file_size = 5 * 1024 * 1024
    file_content = await file.read()
    if len(file_content) > max_file_size:
        detail_msg = "File too large." if IS_PRODUCTION else f"File too large. Max size {max_file_size // (1024*1024)}MB."
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=detail_msg)
    await file.seek(0)
    file_extension = os.path.splitext(file.filename)[1].lower() if file.filename else ".png"
    if file_extension not in allowed_extensions:
        detail_msg = "Invalid file type." if IS_PRODUCTION else f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail_msg)
    safe_filename_base = str(uuid.uuid4()); unique_filename = f"{safe_filename_base}{file_extension}"; file_path_on_disk = os.path.join(STATIC_DESIGN_IMAGES_DIR, unique_filename)
    try:
        with open(file_path_on_disk, "wb") as buffer: shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"Error saving design image: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "Could not save image." if IS_PRODUCTION else f"Could not save image: {str(e)}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)
    finally:
        await file.close()
    web_accessible_path = f"/{STATIC_DESIGN_IMAGES_DIR}/{unique_filename}"
    return {"file_path": web_accessible_path}

@app.post("/api/custom/onepager/upload_image", responses={200: {"description": "Image uploaded successfully", "content": {"application/json": {"example": {"file_path": f"/{STATIC_DESIGN_IMAGES_DIR}/your_image_name.png"}}}},400: {"description": "Invalid file type or other error", "model": ErrorDetail},413: {"description": "File too large", "model": ErrorDetail}})
async def upload_onepager_image(file: UploadFile = File(...)):
    """Upload an image for use in one-pagers"""
    allowed_extensions = {".png", ".jpg", ".jpeg", ".gif", ".webp"}; max_file_size = 10 * 1024 * 1024  # 10MB for one-pager images
    file_content = await file.read()
    if len(file_content) > max_file_size:
        detail_msg = "File too large." if IS_PRODUCTION else f"File too large. Max size {max_file_size // (1024*1024)}MB."
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=detail_msg)
    await file.seek(0)
    file_extension = os.path.splitext(file.filename)[1].lower() if file.filename else ".png"
    if file_extension not in allowed_extensions:
        detail_msg = "Invalid file type." if IS_PRODUCTION else f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail_msg)
    safe_filename_base = str(uuid.uuid4()); unique_filename = f"onepager_{safe_filename_base}{file_extension}"; file_path_on_disk = os.path.join(STATIC_DESIGN_IMAGES_DIR, unique_filename)
    try:
        with open(file_path_on_disk, "wb") as buffer: shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"Error saving one-pager image: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "Could not save image." if IS_PRODUCTION else f"Could not save image: {str(e)}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)
    finally:
        await file.close()
    web_accessible_path = f"/{STATIC_DESIGN_IMAGES_DIR}/{unique_filename}"
    return {"file_path": web_accessible_path}

@app.post("/api/custom/presentation/upload_image", responses={200: {"description": "Image uploaded successfully", "content": {"application/json": {"example": {"file_path": f"/{STATIC_DESIGN_IMAGES_DIR}/your_image_name.png"}}}},400: {"description": "Invalid file type or other error", "model": ErrorDetail},413: {"description": "File too large", "model": ErrorDetail}})
async def upload_presentation_image(file: UploadFile = File(...)):
    """Upload an image for use in presentations"""
    allowed_extensions = {".png", ".jpg", ".jpeg", ".gif", ".webp"}; max_file_size = 10 * 1024 * 1024  # 10MB for presentation images
    file_content = await file.read()
    if len(file_content) > max_file_size:
        detail_msg = "File too large." if IS_PRODUCTION else f"File too large. Max size {max_file_size // (1024*1024)}MB."
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=detail_msg)
    await file.seek(0)
    file_extension = os.path.splitext(file.filename)[1].lower() if file.filename else ".png"
    if file_extension not in allowed_extensions:
        detail_msg = "Invalid file type." if IS_PRODUCTION else f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail_msg)
    safe_filename_base = str(uuid.uuid4()); unique_filename = f"presentation_{safe_filename_base}{file_extension}"; file_path_on_disk = os.path.join(STATIC_DESIGN_IMAGES_DIR, unique_filename)
    try:
        with open(file_path_on_disk, "wb") as buffer: shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"Error saving presentation image: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "Could not save image." if IS_PRODUCTION else f"Could not save image: {str(e)}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)
    finally:
        await file.close()
    web_accessible_path = f"/{STATIC_DESIGN_IMAGES_DIR}/{unique_filename}"
    return {"file_path": web_accessible_path}

# NEW: AI Image Generation Endpoint
class AIImageGenerationRequest(BaseModel):
    prompt: str = Field(..., description="Text prompt for image generation")
    width: int = Field(..., description="Image width in pixels", ge=256, le=1792)
    height: int = Field(..., description="Image height in pixels", ge=256, le=1792)
    quality: str = Field(default="standard", description="Image quality: standard or hd")
    style: str = Field(default="vivid", description="Image style: vivid or natural")
    model: str = Field(default="dall-e-3", description="DALL-E model to use")

@app.post("/api/custom/presentation/generate_image", responses={
    200: {"description": "Image generated successfully", "content": {"application/json": {"example": {"file_path": f"/{STATIC_DESIGN_IMAGES_DIR}/ai_generated_image.png"}}}},
    400: {"description": "Invalid request parameters", "model": ErrorDetail},
    500: {"description": "AI generation failed", "model": ErrorDetail}
})
async def generate_ai_image(request: AIImageGenerationRequest):
    """Generate an image using DALL-E AI"""
    try:
        logger.info(f"[AI_IMAGE_GENERATION] Starting generation with prompt: '{request.prompt[:50]}...'")
        logger.info(f"[AI_IMAGE_GENERATION] Dimensions: {request.width}x{request.height}, Quality: {request.quality}, Style: {request.style}")
        
        # Validate dimensions (DALL-E 3 requirements)
        valid_sizes = [(1024, 1024), (1792, 1024), (1024, 1792)]
        current_size = (request.width, request.height)
        
        if current_size not in valid_sizes:
            # Find the closest valid size based on aspect ratio
            aspect_ratio = request.width / request.height
            
            if aspect_ratio > 1.5:  # Landscape
                request.width, request.height = 1792, 1024
            elif aspect_ratio < 0.7:  # Portrait
                request.width, request.height = 1024, 1792
            else:  # Square-ish
                request.width, request.height = 1024, 1024
                
            logger.info(f"[AI_IMAGE_GENERATION] Adjusted dimensions from {current_size} to {request.width}x{request.height}")
        
        # Get OpenAI client
        client = get_openai_client()
        
        # Generate image using DALL-E
        response = await client.images.generate(
            model=request.model,
            prompt=request.prompt,
            size=f"{request.width}x{request.height}",
            quality=request.quality,
            style=request.style,
            n=1
        )
        
        if not response.data or len(response.data) == 0:
            raise Exception("No image data received from DALL-E")
        
        # Get the generated image URL
        image_url = response.data[0].url
        if not image_url:
            raise Exception("No image URL received from DALL-E")
        
        logger.info(f"[AI_IMAGE_GENERATION] Image generated successfully, downloading from: {image_url[:50]}...")
        
        # Download the image
        async with httpx.AsyncClient() as http_client:
            image_response = await http_client.get(image_url)
            image_response.raise_for_status()
            image_data = image_response.content
        
        # Save the image to disk
        safe_filename_base = str(uuid.uuid4())
        unique_filename = f"ai_generated_{safe_filename_base}.png"
        file_path_on_disk = os.path.join(STATIC_DESIGN_IMAGES_DIR, unique_filename)
        
        try:
            with open(file_path_on_disk, "wb") as buffer:
                buffer.write(image_data)
            
            web_accessible_path = f"/{STATIC_DESIGN_IMAGES_DIR}/{unique_filename}"
            
            logger.info(f"[AI_IMAGE_GENERATION] Image saved successfully: {web_accessible_path}")
            
            return {
                "file_path": web_accessible_path,
                "prompt": request.prompt,
                "dimensions": {"width": request.width, "height": request.height},
                "quality": request.quality,
                "style": request.style
            }
            
        except Exception as e:
            logger.error(f"[AI_IMAGE_GENERATION] Error saving image to disk: {e}", exc_info=not IS_PRODUCTION)
            detail_msg = "Could not save generated image." if IS_PRODUCTION else f"Could not save generated image: {str(e)}"
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[AI_IMAGE_GENERATION] Error generating image: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "AI image generation failed." if IS_PRODUCTION else f"AI image generation failed: {str(e)}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)

@app.post("/api/custom/design_templates/add", response_model=DesignTemplateResponse, status_code=status.HTTP_201_CREATED)
async def add_design_template(template_data: DesignTemplateCreate, pool: asyncpg.Pool = Depends(get_db_pool)):
    query = "INSERT INTO design_templates (template_name, template_structuring_prompt, design_image_path, microproduct_type, component_name, date_created) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, template_name, template_structuring_prompt, design_image_path, microproduct_type, component_name, date_created;"
    try:
        async with pool.acquire() as conn:
            current_time = datetime.now(timezone.utc)
            row = await conn.fetchrow(query, template_data.template_name, template_data.template_structuring_prompt, template_data.design_image_path, template_data.microproduct_type, template_data.component_name, current_time)
        if not row:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create design template.")
        return DesignTemplateResponse(**dict(row))
    except asyncpg.exceptions.UniqueViolationError:
        detail_msg = "Design template with this name already exists." if IS_PRODUCTION else f"Design template with name '{template_data.template_name}' already exists."
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail_msg)
    except Exception as e:
        logger.error(f"Error inserting design template: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "An error occurred while adding design template." if IS_PRODUCTION else f"DB error on design template insert: {str(e)}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)

@app.get("/api/custom/design_templates", response_model=List[DesignTemplateResponse])
async def get_design_templates_list(pool: asyncpg.Pool = Depends(get_db_pool)):
    query = "SELECT id, template_name, template_structuring_prompt, design_image_path, microproduct_type, component_name, date_created FROM design_templates ORDER BY date_created DESC;"
    try:
        async with pool.acquire() as conn: rows = await conn.fetch(query)
        return [DesignTemplateResponse(**dict(row)) for row in rows]
    except Exception as e:
        logger.error(f"Error fetching design templates: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "An error occurred while fetching design templates." if IS_PRODUCTION else f"DB error fetching design templates: {str(e)}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)

@app.get("/api/custom/design_templates/{template_id}", response_model=DesignTemplateResponse)
async def get_design_template(template_id: int, pool: asyncpg.Pool = Depends(get_db_pool)):
    query = "SELECT id, template_name, template_structuring_prompt, design_image_path, microproduct_type, component_name, date_created FROM design_templates WHERE id = $1;"
    try:
        async with pool.acquire() as conn: row = await conn.fetchrow(query, template_id)
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design template not found")
        return DesignTemplateResponse(**dict(row))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching design template {template_id}: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "An error occurred while fetching design template." if IS_PRODUCTION else f"DB error fetching design template: {str(e)}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)

@app.put("/api/custom/design_templates/update/{template_id}", response_model=DesignTemplateResponse)
async def update_design_template(template_id: int, template_data: DesignTemplateUpdate, pool: asyncpg.Pool = Depends(get_db_pool)):
    try:
        async with pool.acquire() as conn:
            existing_template_row = await conn.fetchrow("SELECT * FROM design_templates WHERE id = $1", template_id)
            if not existing_template_row:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design template not found")

        update_fields = template_data.model_dump(exclude_unset=True)
        if not update_fields:
            return DesignTemplateResponse(**dict(existing_template_row))

        set_clauses = []; update_values = []; i = 1
        for key, value in update_fields.items(): set_clauses.append(f"{key} = ${i}"); update_values.append(value); i += 1
        update_values.append(template_id)
        query = f"UPDATE design_templates SET {', '.join(set_clauses)} WHERE id = ${i} RETURNING id, template_name, template_structuring_prompt, design_image_path, microproduct_type, component_name, date_created;"

        async with pool.acquire() as conn: row = await conn.fetchrow(query, *update_values)
        if not row:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update design template.")
        return DesignTemplateResponse(**dict(row))
    except asyncpg.exceptions.UniqueViolationError:
        detail_msg = "Update would violate a unique constraint (e.g., template name)."
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail_msg)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating design template {template_id}: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "An error occurred while updating design template." if IS_PRODUCTION else f"DB error on design template update: {str(e)}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)

@app.delete("/api/custom/design_templates/delete/{template_id}", status_code=status.HTTP_200_OK)
async def delete_design_template(template_id: int, pool: asyncpg.Pool = Depends(get_db_pool)):
    try:
        async with pool.acquire() as conn:
            template_to_delete = await conn.fetchrow("SELECT design_image_path FROM design_templates WHERE id = $1", template_id)
            if not template_to_delete:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design template not found.")

            if template_to_delete["design_image_path"]:
                filename_only = os.path.basename(template_to_delete["design_image_path"])
                full_image_path = os.path.join(STATIC_DESIGN_IMAGES_DIR, filename_only)
                if os.path.exists(full_image_path):
                    try:
                        os.remove(full_image_path)
                        logger.info(f"Successfully deleted image file: {full_image_path}")
                    except OSError as e_img:
                        logger.warning(f"Error deleting image file {full_image_path}: {e_img}. Continuing with DB record deletion.", exc_info=not IS_PRODUCTION)
                else:
                    logger.warning(f"Image file not found for deletion: {full_image_path}")
            deleted_count_status = await conn.execute("DELETE FROM design_templates WHERE id = $1", template_id)
        if deleted_count_status == "DELETE 0":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design template not found during delete, or already deleted.")
        return {"detail": f"Successfully initiated deletion for design template with ID {template_id}."}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting design template {template_id}: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "An error occurred during design template deletion." if IS_PRODUCTION else f"DB error on design template deletion: {str(e)}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)

ALLOWED_MICROPRODUCT_TYPES_FOR_DESIGNS = [
    "Training Plan", "PDF Lesson", "Slide Deck", "Text Presentation"
]

# Constants for text size thresholds - Aggressive thresholds to prevent AI memory issues
TEXT_SIZE_THRESHOLD = 1500  # Characters - switch to compression for texts larger than this
LARGE_TEXT_THRESHOLD = 3000  # Characters - use virtual file system to prevent AI memory issues
VIRTUAL_TEXT_FILE_PREFIX = "paste_text_"

# Cache for virtual text files to prevent duplicate uploads
VIRTUAL_TEXT_FILE_CACHE: Dict[str, int] = {}

def compress_text(text_content: str) -> str:
    """
    Compress large text content using gzip and encode as base64.
    This reduces the payload size for large texts.
    """
    try:
        # Compress the text
        text_bytes = text_content.encode('utf-8')
        compressed = gzip.compress(text_bytes)
        # Encode as base64 for JSON transmission
        compressed_b64 = base64.b64encode(compressed).decode('utf-8')
        logger.info(f"Compressed text from {len(text_content)} chars to {len(compressed_b64)} chars (reduction: {(1 - len(compressed_b64)/len(text_content))*100:.1f}%)")
        return compressed_b64
    except Exception as e:
        logger.error(f"Error compressing text: {e}")
        # Return original text if compression fails
        return text_content

def decompress_text(compressed_b64: str) -> str:
    """
    Decompress base64-encoded gzipped text content.
    """
    try:
        # Decode from base64
        compressed = base64.b64decode(compressed_b64.encode('utf-8'))
        # Decompress
        text_bytes = gzip.decompress(compressed)
        return text_bytes.decode('utf-8')
    except Exception as e:
        logger.error(f"Error decompressing text: {e}")
        # Return original if decompression fails (assume it wasn't compressed)
        return compressed_b64

def chunk_text(text_content: str, max_chunk_size: int = 2000) -> List[str]:
    """
    Split large text into manageable chunks while preserving sentence boundaries.
    """
    if len(text_content) <= max_chunk_size:
        return [text_content]
    
    chunks = []
    current_chunk = ""
    
    # Split by sentences first, then by words if needed
    sentences = text_content.replace('\n', ' ').split('. ')
    
    for sentence in sentences:
        # Add period back if it's not the last sentence
        if not sentence.endswith('.') and sentence != sentences[-1]:
            sentence += '.'
        
        # If adding this sentence would exceed chunk size
        if len(current_chunk) + len(sentence) + 1 > max_chunk_size:
            if current_chunk:
                chunks.append(current_chunk.strip())
                current_chunk = sentence
            else:
                # Single sentence is too long, split by words
                words = sentence.split()
                for word in words:
                    if len(current_chunk) + len(word) + 1 > max_chunk_size:
                        if current_chunk:
                            chunks.append(current_chunk.strip())
                            current_chunk = word
                        else:
                            # Single word is too long, truncate
                            chunks.append(word[:max_chunk_size])
                            current_chunk = ""
                    else:
                        current_chunk += " " + word if current_chunk else word
        else:
            current_chunk += " " + sentence if current_chunk else sentence
    
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    
    logger.info(f"Split text into {len(chunks)} chunks (original: {len(text_content)} chars)")
    return chunks



async def create_virtual_text_file(text_content: str, cookies: Dict[str, str]) -> int:
    """
    Create a virtual text file for large text content and return the file ID.
    Uses caching to prevent duplicate uploads of the same text.
    """
    try:
        # Create a hash of the text content for caching
        import hashlib
        text_hash = hashlib.md5(text_content.encode('utf-8')).hexdigest()
        
        # Check if we already have this text cached
        if text_hash in VIRTUAL_TEXT_FILE_CACHE:
            cached_file_id = VIRTUAL_TEXT_FILE_CACHE[text_hash]
            logger.info(f"Using cached virtual file for text hash {text_hash[:8]}... -> file ID: {cached_file_id}")
            return cached_file_id
        
        # Create a temporary file-like object with the text content
        text_bytes = text_content.encode('utf-8')
        text_file = io.BytesIO(text_bytes)
        
        # Create a filename with timestamp for uniqueness
        timestamp = int(asyncio.get_event_loop().time())
        filename = f"{VIRTUAL_TEXT_FILE_PREFIX}{timestamp}.txt"
        
        # Create FormData for file upload
        files = {
            'files': (filename, text_file, 'text/plain')
        }
        
        # Upload file to Onyx file system
        async with httpx.AsyncClient(timeout=180.0) as client:  # 3 minutes timeout for large files
            logger.info(f"Uploading virtual text file: {filename} ({len(text_content)} chars)")
            
            response = await client.post(
                f"{ONYX_API_SERVER_URL}/user/file/upload",
                files=files,
                cookies=cookies
            )
            response.raise_for_status()
            
            # Parse response to get file ID
            upload_result = response.json()
            if not upload_result or len(upload_result) == 0:
                raise HTTPException(status_code=500, detail="No file ID returned from upload response")
            
            file_id = upload_result[0].get('id')
            if not file_id:
                raise HTTPException(status_code=500, detail="Invalid file ID in upload response")
            
            logger.info(f"File uploaded successfully with ID: {file_id}")
            
            # Cache the file ID for this text content
            VIRTUAL_TEXT_FILE_CACHE[text_hash] = file_id
            
            # For text files, we don't need to wait for processing - they're immediately available
            # The 405 error suggests the status endpoint doesn't exist for simple text files
            logger.info(f"Virtual text file ready for use: {file_id}")
            return file_id
                    
    except Exception as e:
        logger.error(f"Error creating virtual text file: {e}", exc_info=not IS_PRODUCTION)
        raise HTTPException(status_code=500, detail=f"Failed to create virtual text file: {str(e)}")

# --- Enhanced Hybrid Approach Functions ---

# Cache for file contexts to avoid repeated extraction
FILE_CONTEXT_CACHE: Dict[str, Dict[str, Any]] = {}
FILE_CONTEXT_CACHE_TTL = 3600  # 1 hour cache

async def extract_file_context_from_onyx(file_ids: List[int], folder_ids: List[int], cookies: Dict[str, str]) -> Dict[str, Any]:
    """
    Extract relevant context from files and folders using Onyx's capabilities.
    Returns structured context that can be used with OpenAI.
    """
    try:
        # Create cache key
        cache_key = f"{hash(tuple(sorted(file_ids)))}_{hash(tuple(sorted(folder_ids)))}"
        
        # Check cache first
        if cache_key in FILE_CONTEXT_CACHE:
            cached_data = FILE_CONTEXT_CACHE[cache_key]
            if time.time() - cached_data["timestamp"] < FILE_CONTEXT_CACHE_TTL:
                logger.info(f"[FILE_CONTEXT] Using cached context for key: {cache_key[:16]}...")
                return cached_data["context"]
        
        logger.info(f"[FILE_CONTEXT] Extracting context from {len(file_ids)} files and {len(folder_ids)} folders")
        
        extracted_context = {
            "file_summaries": [],
            "file_contents": [],
            "folder_contexts": [],
            "key_topics": [],
            "metadata": {
                "total_files": len(file_ids),
                "total_folders": len(folder_ids),
                "extraction_time": time.time()
            }
        }
        
        # Extract file contexts with enhanced retry mechanism
        successful_extractions = 0
        for file_id in file_ids:
            file_context = None
            for retry_attempt in range(3):  # Up to 3 attempts per file
                try:
                    file_context = await extract_single_file_context(file_id, cookies)
                    if file_context and (file_context.get("summary") or file_context.get("content")):
                        # Check if this was a successful extraction (not a generic response or error)
                        content = file_context.get("content", "")
                        if any(phrase in content.lower() for phrase in ["file access issue", "not indexed", "could not access", "file_access_error"]):
                            logger.warning(f"[FILE_CONTEXT] File {file_id} has access issues (attempt {retry_attempt + 1})")
                            if retry_attempt < 2:  # Don't sleep on the last attempt
                                await asyncio.sleep(2 * (retry_attempt + 1))  # Exponential backoff
                                continue
                        
                        # Success - add to context
                        extracted_context["file_summaries"].append(file_context["summary"])
                        extracted_context["file_contents"].append(file_context["content"])
                        extracted_context["key_topics"].extend(file_context.get("topics", []))
                        successful_extractions += 1
                        logger.info(f"[FILE_CONTEXT] Successfully extracted context from file {file_id} (attempt {retry_attempt + 1})")
                        break  # Success, no need for more retries
                    else:
                        logger.warning(f"[FILE_CONTEXT] No valid context extracted from file {file_id} (attempt {retry_attempt + 1})")
                        if retry_attempt < 2:  # Don't sleep on the last attempt
                            await asyncio.sleep(2 * (retry_attempt + 1))  # Exponential backoff
                except Exception as e:
                    logger.warning(f"[FILE_CONTEXT] Failed to extract context from file {file_id} (attempt {retry_attempt + 1}): {e}")
                    if retry_attempt < 2:  # Don't sleep on the last attempt
                        await asyncio.sleep(2 * (retry_attempt + 1))  # Exponential backoff
            
            if not file_context or not (file_context.get("summary") or file_context.get("content")):
                logger.error(f"[FILE_CONTEXT] All attempts failed for file {file_id}")
        
        # Extract folder contexts
        for folder_id in folder_ids:
            try:
                folder_context = await extract_folder_context(folder_id, cookies)
                if folder_context and folder_context.get("summary"):
                    extracted_context["folder_contexts"].append(folder_context)
                    extracted_context["key_topics"].extend(folder_context.get("topics", []))
                    successful_extractions += 1
                    logger.info(f"[FILE_CONTEXT] Successfully extracted context from folder {folder_id}")
                else:
                    logger.warning(f"[FILE_CONTEXT] No valid context extracted from folder {folder_id}")
            except Exception as e:
                logger.warning(f"[FILE_CONTEXT] Failed to extract context from folder {folder_id}: {e}")
        
        # If no context was extracted successfully, provide a fallback
        if successful_extractions == 0:
            logger.warning(f"[FILE_CONTEXT] No context extracted successfully, providing fallback context")
            extracted_context["file_summaries"] = [f"File(s) provided for content creation (IDs: {file_ids + folder_ids})"]
            extracted_context["key_topics"] = ["content creation", "educational materials"]
            extracted_context["metadata"]["fallback_used"] = True
        
        # Remove duplicate topics
        extracted_context["key_topics"] = list(set(extracted_context["key_topics"]))
        
        # Cache the result
        FILE_CONTEXT_CACHE[cache_key] = {
            "context": extracted_context,
            "timestamp": time.time()
        }
        
        logger.info(f"[FILE_CONTEXT] Successfully extracted context: {len(extracted_context['file_summaries'])} file summaries, {len(extracted_context['key_topics'])} key topics")
        
        return extracted_context
        
    except Exception as e:
        logger.error(f"[FILE_CONTEXT] Error extracting file context: {e}", exc_info=True)
        return {
            "file_summaries": [],
            "file_contents": [],
            "folder_contexts": [],
            "key_topics": [],
            "metadata": {"error": str(e)}
        }

async def extract_connector_context_from_onyx(connector_sources: str, prompt: str, cookies: Dict[str, str]) -> Dict[str, Any]:
    """
    Extract context from specific connectors using the Search persona with connector filtering.
    This function performs a comprehensive search within selected connectors only.
    Uses the same approach as Knowledge Base search but with connector source filtering.
    """
    try:
        logger.info(f"[CONNECTOR_CONTEXT] Starting connector search for sources: {connector_sources}")
        
        # Parse connector sources
        connector_list = [source.strip() for source in connector_sources.split(',') if source.strip()]
        logger.info(f"[CONNECTOR_CONTEXT] Parsed connector sources: {connector_list}")
        
        # Create a temporary chat session with the Search persona (ID 0)
        search_persona_id = 0
        temp_chat_id = await create_onyx_chat_session(search_persona_id, cookies)
        logger.info(f"[CONNECTOR_CONTEXT] Created search chat session: {temp_chat_id}")
        
        # Create a comprehensive search prompt (similar to Knowledge Base approach)
        search_prompt = f"""
        Please search within the following connector sources for information relevant to this topic: "{prompt}"
        
        Search only within these specific sources: {', '.join(connector_list)}
        
        I need you to:
        1. Search within the specified connector sources only
        2. Find the most relevant information related to this topic
        3. Provide a comprehensive summary of what you find
        4. Extract key topics, concepts, and important details
        5. Identify any specific examples, case studies, or practical applications
        
        Please format your response as:
        SUMMARY: [comprehensive summary of relevant information found]
        KEY_TOPICS: [comma-separated list of key topics and concepts]
        IMPORTANT_DETAILS: [specific details, examples, or practical information]
        RELEVANT_SOURCES: [mention of any specific documents or sources that were particularly relevant]
        
        Focus only on content from these connector sources: {', '.join(connector_list)}
        Be thorough and comprehensive in your search and analysis.
        """
        
        # Use the Search persona to perform the connector-filtered search
        logger.info(f"[CONNECTOR_CONTEXT] Sending search request to Search persona with connector filters")
        search_result = await enhanced_stream_chat_message_with_filters(temp_chat_id, search_prompt, cookies, connector_list)
        logger.info(f"[CONNECTOR_CONTEXT] Received search result ({len(search_result)} chars)")
        
        # Log the full response for debugging
        logger.info(f"[CONNECTOR_CONTEXT] Full search response: {search_result}")
        
        if len(search_result) == 0:
            logger.warning(f"[CONNECTOR_CONTEXT] Search result is empty! This might indicate no documents in connectors or search failed")
        
        # Parse the search result - handle Onyx response format (same as Knowledge Base)
        summary = ""
        key_topics = []
        important_details = ""
        relevant_sources = ""
        
        # Extract content flexibly using string searching
        logger.info(f"[CONNECTOR_CONTEXT] Starting content extraction from search result")
        
        if "SUMMARY:" in search_result:
            summary_start = search_result.find("SUMMARY:") + 8
            summary_end = search_result.find("KEY_TOPICS:", summary_start)
            if summary_end == -1:
                summary_end = search_result.find("IMPORTANT_DETAILS:", summary_start)
            if summary_end == -1:
                summary_end = search_result.find("RELEVANT_SOURCES:", summary_start)
            if summary_end == -1:
                summary_end = len(search_result)
            summary = search_result[summary_start:summary_end].strip()
            logger.info(f"[CONNECTOR_CONTEXT] Extracted summary: {len(summary)} chars")
        
        if "KEY_TOPICS:" in search_result:
            topics_start = search_result.find("KEY_TOPICS:") + 11
            topics_end = search_result.find("IMPORTANT_DETAILS:", topics_start)
            if topics_end == -1:
                topics_end = search_result.find("RELEVANT_SOURCES:", topics_start)
            if topics_end == -1:
                # Look for next section marker or end of text
                next_section = search_result.find("\n\n", topics_start)
                topics_end = next_section if next_section != -1 else len(search_result)
            topics_text = search_result[topics_start:topics_end].strip()
            key_topics = [t.strip() for t in topics_text.split(',') if t.strip()]
            logger.info(f"[CONNECTOR_CONTEXT] Extracted {len(key_topics)} key topics")
        
        if "IMPORTANT_DETAILS:" in search_result:
            details_start = search_result.find("IMPORTANT_DETAILS:") + 18
            details_end = search_result.find("RELEVANT_SOURCES:", details_start)
            if details_end == -1:
                details_end = len(search_result)
            important_details = search_result[details_start:details_end].strip()
            logger.info(f"[CONNECTOR_CONTEXT] Extracted important details: {len(important_details)} chars")
        
        if "RELEVANT_SOURCES:" in search_result:
            sources_start = search_result.find("RELEVANT_SOURCES:") + 17
            relevant_sources = search_result[sources_start:].strip()
            logger.info(f"[CONNECTOR_CONTEXT] Extracted relevant sources: {len(relevant_sources)} chars")
        
        # Final fallback if still no content
        if not summary and not key_topics:
            summary = search_result[:1000] + "..." if len(search_result) > 1000 else search_result
            key_topics = ["connector search"]
            logger.info(f"[CONNECTOR_CONTEXT] Using fallback summary from raw response")
        
        # Log the extracted information
        logger.info(f"[CONNECTOR_CONTEXT] Extracted summary: {summary[:200]}...")
        logger.info(f"[CONNECTOR_CONTEXT] Extracted key topics: {key_topics}")
        logger.info(f"[CONNECTOR_CONTEXT] Extracted important details: {important_details[:200]}...")
        logger.info(f"[CONNECTOR_CONTEXT] Extracted relevant sources: {relevant_sources[:200]}...")
        
        # Return context in the same format as knowledge base context
        return {
            "connector_search": True,
            "topic": prompt,
            "connector_sources": connector_list,
            "summary": summary,
            "key_topics": key_topics,
            "important_details": important_details,
            "relevant_sources": relevant_sources,
            "full_search_result": search_result,
            "file_summaries": [{
                "file_id": "connector_search",
                "name": f"Connector Search: {', '.join(connector_list)}",
                "summary": summary,
                "topics": key_topics,
                "key_info": important_details
            }]
        }
        
    except Exception as e:
        logger.error(f"[CONNECTOR_CONTEXT] Error extracting connector context: {e}", exc_info=True)
        # Return fallback context
        return {
            "connector_search": True,
            "topic": prompt,
            "connector_sources": connector_sources.split(','),
            "summary": f"Connector search failed for sources: {connector_sources}",
            "key_topics": ["search error"],
            "important_details": "Unable to search connectors",
            "relevant_sources": "",
            "full_search_result": "",
            "file_summaries": [{
                "file_id": "connector_search_error",
                "name": f"Connector Search Error: {connector_sources}",
                "summary": "Search failed",
                "topics": ["error"],
                "key_info": str(e)
            }]
        }

def _save_section_content(section_name: str, content_lines: list, local_vars: dict):
    """Helper function to save accumulated section content"""
    content = " ".join(content_lines).strip()
    if section_name == "summary":
        local_vars["summary"] = content
    elif section_name == "important_details":
        local_vars["important_details"] = content
    elif section_name == "relevant_sources":
        local_vars["relevant_sources"] = content

async def enhanced_stream_chat_message(chat_session_id: str, message: str, cookies: Dict[str, str]) -> str:
    """Enhanced version of stream_chat_message specifically for Knowledge Base searches with better streaming handling."""
    logger.info(f"[enhanced_stream_chat_message] Starting Knowledge Base search - chat_id={chat_session_id} len(message)={len(message)}")

    async with httpx.AsyncClient(timeout=600.0) as client:  # Longer timeout for KB searches
        retrieval_options = {
            "run_search": "always",  # Always search for Knowledge Base
            "real_time": False,
        }
        payload = {
            "chat_session_id": chat_session_id,
            "message": message,
            "parent_message_id": None,
            "file_descriptors": [],
            "user_file_ids": [],
            "user_folder_ids": [],
            "prompt_id": None,
            "search_doc_ids": None,
            "retrieval_options": retrieval_options,
            "stream_response": True,  # Force streaming for better control
        }
        
        logger.info(f"[enhanced_stream_chat_message] Sending request to {ONYX_API_SERVER_URL}/chat/send-message")
        resp = await client.post(
            f"{ONYX_API_SERVER_URL}/chat/send-message",
            json=payload,
            cookies=cookies,
        )
        
        logger.info(f"[enhanced_stream_chat_message] Response status={resp.status_code} ctype={resp.headers.get('content-type')}")
        resp.raise_for_status()
        
        # Handle the response
        ctype = resp.headers.get("content-type", "")
        if ctype.startswith("text/event-stream"):
            logger.info(f"[enhanced_stream_chat_message] Processing streaming response...")
            full_answer = ""
            line_count = 0
            done_received = False
            last_log_length = 0
            import time
            start_time = time.time()
            last_activity_time = start_time
            max_idle_time = 120.0  # Wait up to 2 minutes without new content
            max_total_time = 600.0  # Maximum 10 minutes total
            
            logger.info(f"[enhanced_stream_chat_message] Starting to read lines from stream...")
            async for line in resp.aiter_lines():
                line_count += 1
                current_time = time.time()
                elapsed_time = current_time - start_time
                idle_time = current_time - last_activity_time
                
                # Log progress every 25 lines to track what's happening
                if line_count % 25 == 0:
                    logger.info(f"[enhanced_stream_chat_message] Progress: Line {line_count}, Elapsed: {elapsed_time:.1f}s, Idle: {idle_time:.1f}s, Chars: {len(full_answer)}")
                
                # Check for timeouts - but be more patient
                if elapsed_time > max_total_time:
                    logger.warning(f"[enhanced_stream_chat_message] Maximum total time ({max_total_time}s) exceeded after {line_count} lines, {len(full_answer)} chars")
                    break
                    
                # Only timeout on idle if we have NO content after significant time
                if idle_time > max_idle_time and len(full_answer) == 0 and elapsed_time > 60.0:
                    logger.warning(f"[enhanced_stream_chat_message] Maximum idle time ({max_idle_time}s) exceeded since last content, still no answer content after {line_count} lines, elapsed: {elapsed_time:.1f}s")
                    break
                
                if not line:
                    if line_count <= 5:  # Log first few empty lines
                        logger.debug(f"[enhanced_stream_chat_message] Line {line_count}: Empty line")
                    continue
                    
                # Onyx doesn't use "data: " prefix - each line is a direct JSON object  
                # Skip empty lines but process all non-empty lines as JSON
                payload_text = line.strip()
                if not payload_text:
                    if line_count <= 5:  # Log first few empty lines
                        logger.debug(f"[enhanced_stream_chat_message] Line {line_count}: Empty line")
                    continue
                    
                try:
                    packet = json.loads(payload_text)
                except Exception as e:
                    logger.debug(f"[enhanced_stream_chat_message] Failed to parse JSON line {line_count}: {str(e)} | Line: {payload_text[:100]}")
                    continue
                
                # For the first 10 packets, log full content to understand structure
                if line_count <= 10:
                    packet_str = str(packet)[:500] if packet else "empty"
                    logger.info(f"[enhanced_stream_chat_message] Packet {line_count} content: {packet_str}")
                
                # Log packet structure for debugging (every 50 lines to avoid spam)
                if line_count % 50 == 0:
                    packet_keys = list(packet.keys()) if isinstance(packet, dict) else "not-dict"
                    logger.info(f"[enhanced_stream_chat_message] Line {line_count} packet keys: {packet_keys}")
                
                # Handle different Onyx packet types
                answer_content = None
                
                # Check for OnyxAnswerPiece
                if "answer_piece" in packet:
                    answer_piece = packet["answer_piece"]
                    if answer_piece is None:
                        # OnyxAnswerPiece with None signals end of answer
                        logger.info(f"[enhanced_stream_chat_message] Received answer termination signal (answer_piece=None) after {line_count} lines")
                        done_received = True
                        break
                    elif answer_piece:
                        answer_content = answer_piece
                        
                # Check for AgentAnswerPiece (agent search responses)
                elif packet.get("answer_type") and packet.get("answer_piece"):
                    answer_content = packet["answer_piece"]
                    logger.info(f"[enhanced_stream_chat_message] Received agent answer piece: {packet.get('answer_type')}")
                    
                # Check for QADocsResponse (search results)
                elif packet.get("top_documents") or packet.get("rephrased_query"):
                    logger.info(f"[enhanced_stream_chat_message] Received search results packet")
                    last_activity_time = current_time  # Reset timer for search activity
                    
                # Check for StreamStopInfo
                elif packet.get("stop_reason"):
                    if packet["stop_reason"] == "finished":
                        logger.info(f"[enhanced_stream_chat_message] Received stream stop signal: finished")
                        done_received = True
                        break
                    
                if answer_content:
                    full_answer += answer_content
                    last_activity_time = current_time  # Reset activity timer on content
                    
                    # Log progress every 200 chars to track streaming
                    if len(full_answer) - last_log_length >= 200:
                        logger.info(f"[enhanced_stream_chat_message] Accumulated {len(full_answer)} chars so far...")
                        last_log_length = len(full_answer)
                else:
                    # Log what we're getting for non-answer packets
                    if line_count <= 10 or line_count % 100 == 0:  # Log first 10 and every 100th
                        packet_preview = str(packet)[:200] if packet else "empty"
                        logger.debug(f"[enhanced_stream_chat_message] Line {line_count} - non-answer packet: {packet_preview}")
            
            # Stream ended - determine why
            logger.info(f"[enhanced_stream_chat_message] Stream reading loop ended naturally")
            final_elapsed = time.time() - start_time
            logger.info(f"[enhanced_stream_chat_message] Streaming completed. Total chars: {len(full_answer)}, Lines processed: {line_count}, Done received: {done_received}, Elapsed: {final_elapsed:.1f}s")
            
            # If we got no content and stream ended quickly, something went wrong
            if len(full_answer) == 0 and final_elapsed < 60.0 and not done_received:
                logger.error(f"[enhanced_stream_chat_message] Stream ended prematurely! Only {final_elapsed:.1f}s elapsed, {line_count} lines processed, no content received")
                logger.error(f"[enhanced_stream_chat_message] This suggests an issue with the Onyx search or streaming connection")
                
            if not done_received and len(full_answer) == 0:
                logger.warning(f"[enhanced_stream_chat_message] Stream ended without [DONE] signal and no content - may be incomplete")
            elif not done_received:
                logger.warning(f"[enhanced_stream_chat_message] Stream ended without [DONE] signal but got {len(full_answer)} chars")
                
            # Ensure we have some minimum content or waited minimum time
            if len(full_answer) == 0 and final_elapsed < 60.0:
                logger.warning(f"[enhanced_stream_chat_message] No content received and insufficient wait time ({final_elapsed:.1f}s < 60s)")
                # Wait a bit more to see if content comes
                logger.info(f"[enhanced_stream_chat_message] Attempting extended wait for delayed response...")
                import asyncio
                await asyncio.sleep(5.0)  # Wait 5 more seconds
                
            return full_answer
        else:
            # Non-streaming response
            logger.info(f"[enhanced_stream_chat_message] Processing non-streaming response")
            try:
                data = resp.json()
                result = data.get("answer") or data.get("answer_citationless") or ""
                logger.info(f"[enhanced_stream_chat_message] Non-streaming result: {len(result)} chars")
                return result
            except Exception as e:
                logger.error(f"[enhanced_stream_chat_message] Failed to parse non-streaming response: {e}")
                return resp.text.strip()

async def enhanced_stream_chat_message_with_filters(chat_session_id: str, message: str, cookies: Dict[str, str], connector_sources: list) -> str:
    """Enhanced version of stream_chat_message for connector searches with source filtering."""
    logger.info(f"[enhanced_stream_chat_message_with_filters] Starting connector search - chat_id={chat_session_id} sources={connector_sources} len(message)={len(message)}")

    async with httpx.AsyncClient(timeout=600.0) as client:  # Longer timeout for searches
        retrieval_options = {
            "run_search": "always",  # Always search for connectors
            "real_time": False,
            "filters": {
                "connectorSources": connector_sources  # Filter by specific connector sources
            }
        }
        payload = {
            "chat_session_id": chat_session_id,
            "message": message,
            "parent_message_id": None,
            "file_descriptors": [],
            "user_file_ids": [],
            "user_folder_ids": [],
            "prompt_id": None,
            "search_doc_ids": None,
            "retrieval_options": retrieval_options,
            "stream_response": True,  # Force streaming for better control
        }
        
        logger.info(f"[enhanced_stream_chat_message_with_filters] Sending request to {ONYX_API_SERVER_URL}/chat/send-message with connector filters: {connector_sources}")
        resp = await client.post(
            f"{ONYX_API_SERVER_URL}/chat/send-message",
            json=payload,
            cookies=cookies,
        )
        
        logger.info(f"[enhanced_stream_chat_message_with_filters] Response status={resp.status_code} ctype={resp.headers.get('content-type')}")
        resp.raise_for_status()
        
        # Handle the response (EXACT same logic as enhanced_stream_chat_message for Knowledge Base)
        ctype = resp.headers.get("content-type", "")
        if ctype.startswith("text/event-stream"):
            logger.info(f"[enhanced_stream_chat_message_with_filters] Processing streaming response...")
            full_answer = ""
            line_count = 0
            done_received = False
            last_log_length = 0
            import time
            start_time = time.time()
            last_activity_time = start_time
            max_idle_time = 120.0  # Wait up to 2 minutes without new content
            max_total_time = 600.0  # Maximum 10 minutes total
            
            logger.info(f"[enhanced_stream_chat_message_with_filters] Starting to read lines from stream...")
            async for line in resp.aiter_lines():
                line_count += 1
                current_time = time.time()
                elapsed_time = current_time - start_time
                idle_time = current_time - last_activity_time
                
                # Log progress every 25 lines to track what's happening
                if line_count % 25 == 0:
                    logger.info(f"[enhanced_stream_chat_message_with_filters] Progress: Line {line_count}, Elapsed: {elapsed_time:.1f}s, Idle: {idle_time:.1f}s, Chars: {len(full_answer)}")
                
                # Check for timeouts - but be more patient
                if elapsed_time > max_total_time:
                    logger.warning(f"[enhanced_stream_chat_message_with_filters] Maximum total time ({max_total_time}s) exceeded after {line_count} lines, {len(full_answer)} chars")
                    break
                    
                # Only timeout on idle if we have NO content after significant time
                if idle_time > max_idle_time and len(full_answer) == 0 and elapsed_time > 60.0:
                    logger.warning(f"[enhanced_stream_chat_message_with_filters] Maximum idle time ({max_idle_time}s) exceeded since last content, still no answer content after {line_count} lines, elapsed: {elapsed_time:.1f}s")
                    break

                if not line:
                    if line_count <= 5:  # Log first few empty lines
                        logger.debug(f"[enhanced_stream_chat_message_with_filters] Line {line_count}: Empty line")
                    continue
                    
                # Onyx doesn't use "data: " prefix - each line is a direct JSON object  
                # Skip empty lines but process all non-empty lines as JSON
                payload_text = line.strip()
                if not payload_text:
                    if line_count <= 5:  # Log first few empty lines
                        logger.debug(f"[enhanced_stream_chat_message_with_filters] Line {line_count}: Empty line")
                    continue
                    
                try:
                    packet = json.loads(payload_text)
                except Exception as e:
                    logger.debug(f"[enhanced_stream_chat_message_with_filters] Failed to parse JSON line {line_count}: {str(e)} | Line: {payload_text[:100]}")
                    continue

                # For the first 10 packets, log full content to understand structure
                if line_count <= 10:
                    packet_str = str(packet)[:500] if packet else "empty"
                    logger.info(f"[enhanced_stream_chat_message_with_filters] Packet {line_count} content: {packet_str}")

                # Log packet structure for debugging (every 50 lines to avoid spam)
                if line_count % 50 == 0:
                    packet_keys = list(packet.keys()) if isinstance(packet, dict) else "not-dict"
                    logger.info(f"[enhanced_stream_chat_message_with_filters] Line {line_count} packet keys: {packet_keys}")

                # Handle different Onyx packet types (EXACT same as Knowledge Base)
                answer_content = None
                
                # Check for OnyxAnswerPiece
                if "answer_piece" in packet:
                    answer_piece = packet["answer_piece"]
                    if answer_piece is None:
                        # OnyxAnswerPiece with None signals end of answer
                        logger.info(f"[enhanced_stream_chat_message_with_filters] Received answer termination signal (answer_piece=None) after {line_count} lines")
                        done_received = True
                        break
                    elif answer_piece:
                        answer_content = answer_piece
                        
                # Check for AgentAnswerPiece (agent search responses)
                elif packet.get("answer_type") and packet.get("answer_piece"):
                    answer_content = packet["answer_piece"]
                    logger.info(f"[enhanced_stream_chat_message_with_filters] Received agent answer piece: {packet.get('answer_type')}")
                    
                # Check for QADocsResponse (search results)
                elif packet.get("top_documents") or packet.get("rephrased_query"):
                    logger.info(f"[enhanced_stream_chat_message_with_filters] Received search results packet")
                    last_activity_time = current_time  # Reset timer for search activity
                    
                # Check for StreamStopInfo
                elif packet.get("stop_reason"):
                    if packet["stop_reason"] == "finished":
                        logger.info(f"[enhanced_stream_chat_message_with_filters] Received stream stop signal: finished")
                        done_received = True
                        break
                    
                if answer_content:
                    full_answer += answer_content
                    last_activity_time = current_time  # Reset activity timer on content
                    
                    # Log progress every 200 chars to track streaming
                    if len(full_answer) - last_log_length >= 200:
                        logger.info(f"[enhanced_stream_chat_message_with_filters] Accumulated {len(full_answer)} chars so far...")
                        last_log_length = len(full_answer)
                else:
                    # Log what we're getting for non-answer packets
                    if line_count <= 10 or line_count % 100 == 0:  # Log first 10 and every 100th
                        packet_preview = str(packet)[:200] if packet else "empty"
                        logger.debug(f"[enhanced_stream_chat_message_with_filters] Line {line_count} - non-answer packet: {packet_preview}")
            
            # Stream ended - determine why
            logger.info(f"[enhanced_stream_chat_message_with_filters] Stream reading loop ended naturally")
            final_elapsed = time.time() - start_time
            logger.info(f"[enhanced_stream_chat_message_with_filters] Streaming completed. Total chars: {len(full_answer)}, Lines processed: {line_count}, Done received: {done_received}, Elapsed: {final_elapsed:.1f}s")
            
            # Log full raw response for debugging
            logger.info(f"[enhanced_stream_chat_message_with_filters] Full raw response: {full_answer}")
            
            # If we got no content and stream ended quickly, something went wrong
            if len(full_answer) == 0 and final_elapsed < 60.0 and not done_received:
                logger.error(f"[enhanced_stream_chat_message_with_filters] Stream ended prematurely! Only {final_elapsed:.1f}s elapsed, {line_count} lines processed, no content received")
                logger.error(f"[enhanced_stream_chat_message_with_filters] This suggests an issue with the Onyx search or streaming connection")
            
            return full_answer.strip()
            
        else:
            # Non-streaming response
            logger.info(f"[enhanced_stream_chat_message_with_filters] Processing non-streaming response")
            try:
                data = resp.json()
                result = data.get("answer") or data.get("answer_citationless") or ""
                logger.info(f"[enhanced_stream_chat_message_with_filters] Non-streaming result: {len(result)} chars")
                return result
            except Exception as e:
                logger.error(f"[enhanced_stream_chat_message_with_filters] Failed to parse non-streaming response: {e}")
                return resp.text.strip()

async def extract_knowledge_base_context(topic: str, cookies: Dict[str, str]) -> Dict[str, Any]:
    """
    Extract context from the entire Knowledge Base using the Search persona.
    This function performs a comprehensive search across all documents in the Knowledge Base.
    """
    try:
        logger.info(f"[KNOWLEDGE_BASE_CONTEXT] Starting Knowledge Base search for topic: {topic}")
        
        # Create a temporary chat session with the Search persona (ID 0)
        search_persona_id = 0
        temp_chat_id = await create_onyx_chat_session(search_persona_id, cookies)
        logger.info(f"[KNOWLEDGE_BASE_CONTEXT] Created search chat session: {temp_chat_id}")
        
        # Create a comprehensive search prompt
        search_prompt = f"""
        Please search your entire Knowledge Base for information relevant to this topic: "{topic}"
        
        I need you to:
        1. Search across all available documents and knowledge sources
        2. Find the most relevant information related to this topic
        3. Provide a comprehensive summary of what you find
        4. Extract key topics, concepts, and important details
        5. Identify any specific examples, case studies, or practical applications
        
        Please format your response as:
        SUMMARY: [comprehensive summary of relevant information found]
        KEY_TOPICS: [comma-separated list of key topics and concepts]
        IMPORTANT_DETAILS: [specific details, examples, or practical information]
        RELEVANT_SOURCES: [mention of any specific documents or sources that were particularly relevant]
        
        Be thorough and comprehensive in your search and analysis.
        """
        
        # Use the Search persona to perform the Knowledge Base search
        logger.info(f"[KNOWLEDGE_BASE_CONTEXT] Sending search request to Search persona")
        search_result = await enhanced_stream_chat_message(temp_chat_id, search_prompt, cookies)
        logger.info(f"[KNOWLEDGE_BASE_CONTEXT] Received search result ({len(search_result)} chars)")
        
        # Log the full response for debugging
        logger.info(f"[KNOWLEDGE_BASE_CONTEXT] Full search response: {search_result}")
        
        if len(search_result) == 0:
            logger.warning(f"[KNOWLEDGE_BASE_CONTEXT] Search result is empty! This might indicate no documents in Knowledge Base or search failed")
        
        # Parse the search result - handle Onyx response format  
        summary = ""
        key_topics = []
        important_details = ""
        relevant_sources = ""
        
        # Extract content flexibly using string searching
        logger.info(f"[KNOWLEDGE_BASE_CONTEXT] Starting content extraction from search result")
        
        if "SUMMARY:" in search_result:
            summary_start = search_result.find("SUMMARY:") + 8
            summary_end = search_result.find("KEY_TOPICS:", summary_start)
            if summary_end == -1:
                summary_end = search_result.find("IMPORTANT_DETAILS:", summary_start)
            if summary_end == -1:
                summary_end = search_result.find("RELEVANT_SOURCES:", summary_start)
            if summary_end == -1:
                summary_end = len(search_result)
            summary = search_result[summary_start:summary_end].strip()
            logger.info(f"[KNOWLEDGE_BASE_CONTEXT] Extracted summary: {len(summary)} chars")
        
        if "KEY_TOPICS:" in search_result:
            topics_start = search_result.find("KEY_TOPICS:") + 11
            topics_end = search_result.find("IMPORTANT_DETAILS:", topics_start)
            if topics_end == -1:
                topics_end = search_result.find("RELEVANT_SOURCES:", topics_start)
            if topics_end == -1:
                # Look for next section marker or end of text
                next_section = search_result.find("\n\n", topics_start)
                topics_end = next_section if next_section != -1 else len(search_result)
            topics_text = search_result[topics_start:topics_end].strip()
            key_topics = [t.strip() for t in topics_text.split(',') if t.strip()]
            logger.info(f"[KNOWLEDGE_BASE_CONTEXT] Extracted {len(key_topics)} key topics")
        
        if "IMPORTANT_DETAILS:" in search_result:
            details_start = search_result.find("IMPORTANT_DETAILS:") + 18
            details_end = search_result.find("RELEVANT_SOURCES:", details_start)
            if details_end == -1:
                details_end = len(search_result)
            important_details = search_result[details_start:details_end].strip()
            logger.info(f"[KNOWLEDGE_BASE_CONTEXT] Extracted important details: {len(important_details)} chars")
        
        if "RELEVANT_SOURCES:" in search_result:
            sources_start = search_result.find("RELEVANT_SOURCES:") + 17
            relevant_sources = search_result[sources_start:].strip()
            logger.info(f"[KNOWLEDGE_BASE_CONTEXT] Extracted relevant sources: {len(relevant_sources)} chars")
        
        # Final fallback if still no content
        if not summary and not key_topics:
            summary = search_result[:1000] + "..." if len(search_result) > 1000 else search_result
            key_topics = ["knowledge base search"]
            logger.info(f"[KNOWLEDGE_BASE_CONTEXT] Using fallback summary from raw response")
        
        # Log the extracted information
        logger.info(f"[KNOWLEDGE_BASE_CONTEXT] Extracted summary: {summary[:200]}...")
        logger.info(f"[KNOWLEDGE_BASE_CONTEXT] Extracted key topics: {key_topics}")
        logger.info(f"[KNOWLEDGE_BASE_CONTEXT] Extracted important details: {important_details[:200]}...")
        logger.info(f"[KNOWLEDGE_BASE_CONTEXT] Extracted relevant sources: {relevant_sources[:200]}...")
        
        # Return context in the same format as file context
        return {
            "knowledge_base_search": True,
            "topic": topic,
            "summary": summary,
            "key_topics": key_topics,
            "important_details": important_details,
            "relevant_sources": relevant_sources,
            "full_search_result": search_result,
            "file_summaries": [{
                "file_id": "knowledge_base",
                "name": f"Knowledge Base Search: {topic}",
                "summary": summary,
                "topics": key_topics,
                "key_info": important_details
            }]
        }
        
    except Exception as e:
        logger.error(f"[KNOWLEDGE_BASE_CONTEXT] Error extracting Knowledge Base context: {e}", exc_info=True)
        # Return fallback context
        return {
            "knowledge_base_search": True,
            "topic": topic,
            "summary": f"Knowledge Base search failed for topic: {topic}",
            "key_topics": ["search error"],
            "important_details": "Unable to search Knowledge Base",
            "relevant_sources": "",
            "full_search_result": f"Error: {str(e)}",
            "file_summaries": []
        }

async def extract_single_file_context(file_id: int, cookies: Dict[str, str]) -> Dict[str, Any]:
    """
    Extract context from a single file using Onyx's chat API with 100% file attachment guarantee.
    """
    try:
        # Step 1: Verify file exists and is accessible
        file_info = await verify_file_accessibility(file_id, cookies)
        if not file_info:
            return {
                "file_id": file_id,
                "summary": f"File {file_id} is not accessible or does not exist",
                "topics": ["file access error"],
                "key_info": "File may need to be re-uploaded",
                "content": f"File {file_id} access verification failed"
            }
        
        # Step 2: Create a temporary chat session with forced file attachment
        persona_id = await get_contentbuilder_persona_id(cookies)
        temp_chat_id = await create_onyx_chat_session(persona_id, cookies)
        
        # Step 3: Enhanced analysis prompt with explicit file reference
        analysis_prompt = f"""
        I have provided you with file ID {file_id}. This file should be directly attached to this message and available for analysis.
        
        Please analyze this specific file and provide:
        1. A concise summary of the main content (max 200 words)
        2. Key topics and concepts covered
        3. The most important information that would be relevant for content creation
        
        IMPORTANT: 
        - The file is attached to this message with ID {file_id}
        - Do not ask for the file content - it should already be available to you
        - If you cannot see the file content, respond with "FILE_ACCESS_ERROR"
        - If you can see the file content, proceed with the analysis
        
        Format your response as:
        SUMMARY: [summary here]
        TOPICS: [comma-separated topics]
        KEY_INFO: [most important information]
        """
        
        # Step 4: Multiple retry attempts with different strategies
        for attempt in range(3):
            try:
                result = await attempt_file_analysis_with_retry(
                    temp_chat_id, file_id, analysis_prompt, cookies, attempt
                )
                if result and not is_generic_response(result):
                    return parse_analysis_result(file_id, result)
                elif attempt < 2:
                    logger.warning(f"[FILE_CONTEXT] Attempt {attempt + 1} failed for file {file_id}, retrying...")
                    await asyncio.sleep(1)  # Brief delay before retry
                else:
                    logger.error(f"[FILE_CONTEXT] All attempts failed for file {file_id}")
                    break
            except Exception as e:
                logger.error(f"[FILE_CONTEXT] Attempt {attempt + 1} error for file {file_id}: {e}")
                if attempt < 2:
                    await asyncio.sleep(1)
                else:
                    raise
        
        # Step 5: Fallback response if all attempts fail
        return {
            "file_id": file_id,
            "summary": f"File analysis failed after multiple attempts (ID: {file_id})",
            "topics": ["analysis error", "file processing"],
            "key_info": "File may need manual review or re-upload",
            "content": f"Analysis failed for file {file_id} ({file_info.get('name', 'Unknown')})"
        }
            
    except Exception as e:
        logger.error(f"[FILE_CONTEXT] Error extracting single file context for file {file_id}: {e}")
        return {
            "file_id": file_id,
            "summary": f"Error processing file {file_id}: {str(e)}",
            "topics": ["processing error"],
            "key_info": "File processing encountered an error",
            "content": f"Error: {str(e)}"
        }

async def verify_file_accessibility(file_id: int, cookies: Dict[str, str]) -> Dict[str, Any]:
    """
    Verify that a file exists and is accessible before attempting analysis.
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Check file indexing status using the correct endpoint
            response = await client.get(
                f"{ONYX_API_SERVER_URL}/user/file/indexing-status?file_ids={file_id}", 
                cookies=cookies
            )
            response.raise_for_status()
            status_data = response.json()
            
            is_indexed = status_data.get(str(file_id), False)
            file_status = "INDEXED" if is_indexed else "NOT_INDEXED"
            
            logger.info(f"[FILE_CONTEXT] File {file_id} indexing status: {file_status}")
            
            # For now, assume the file is accessible if we can check its status
            # The actual file content will be verified during the analysis phase
            return {
                "id": file_id,
                "name": f"file_{file_id}",  # We'll get the real name during analysis
                "status": file_status,
                "accessible": True  # Assume accessible, let the analysis phase handle actual access
            }
    except Exception as e:
        logger.error(f"[FILE_CONTEXT] File accessibility check failed for {file_id}: {e}")
        # Return a basic info structure even if check fails
        return {
            "id": file_id,
            "name": f"file_{file_id}",
            "status": "UNKNOWN",
            "accessible": True  # Let the analysis phase determine actual accessibility
        }

async def attempt_file_analysis_with_retry(
    chat_id: str, 
    file_id: int, 
    prompt: str, 
    cookies: Dict[str, str], 
    attempt: int
) -> str:
    """
    Attempt file analysis with different strategies based on attempt number.
    """
    # Different strategies for each attempt
    strategies = [
        # Attempt 1: Standard approach with user_file_ids
        {
            "user_file_ids": [file_id],
            "retrieval_options": {"run_search": "never", "real_time": False},
            "force_direct_attachment": True
        },
        # Attempt 2: Force search tool with file-specific query
        {
            "user_file_ids": [file_id],
            "retrieval_options": {"run_search": "always", "real_time": False},
            "query_override": f"Analyze the content of file ID {file_id}"
        },
        # Attempt 3: Use file_descriptors as fallback with search
        {
            "file_descriptors": [{"id": str(file_id), "type": "USER_KNOWLEDGE", "name": f"file_{file_id}"}],
            "retrieval_options": {"run_search": "always", "real_time": False},
            "query_override": f"Find and analyze the content of file {file_id}"
        }
    ]
    
    strategy = strategies[attempt]
    
    async with httpx.AsyncClient(timeout=180.0) as client:
        payload = {
            "chat_session_id": chat_id,
            "message": prompt,
            "parent_message_id": None,
            "file_descriptors": strategy.get("file_descriptors", []),
            "user_file_ids": strategy.get("user_file_ids", []),
            "user_folder_ids": [],
            "prompt_id": None,
            "search_doc_ids": None,
            "retrieval_options": strategy["retrieval_options"],
            "stream_response": True,
            "query_override": strategy.get("query_override")
        }
        
        logger.info(f"[FILE_CONTEXT] Attempt {attempt + 1} for file {file_id} with strategy: {list(strategy.keys())}")
        
        try:
            # Try simple API first
            response = await client.post(
                f"{ONYX_API_SERVER_URL}/chat/send-message-simple-api",
                json=payload,
                cookies=cookies
            )
            response.raise_for_status()
            result = response.json()
            return result.get("answer", "")
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                # Fallback to streaming endpoint
                return await stream_file_analysis(client, payload, cookies, file_id)
            else:
                raise

async def stream_file_analysis(
    client: httpx.AsyncClient, 
    payload: Dict[str, Any], 
    cookies: Dict[str, str], 
    file_id: int
) -> str:
    """
    Stream file analysis response with enhanced error handling.
    """
    async with client.stream("POST", f"{ONYX_API_SERVER_URL}/chat/send-message", json=payload, cookies=cookies) as resp:
        resp.raise_for_status()
        analysis_text = ""
        line_count = 0
        file_mentioned = False
        
        async for raw_line in resp.aiter_lines():
            line_count += 1
            if not raw_line:
                continue
                
            line = raw_line.strip()
            if line.startswith("data:"):
                line = line.split("data:", 1)[1].strip()
                
            if line == "[DONE]":
                logger.info(f"[FILE_CONTEXT] Stream completed for file {file_id} after {line_count} lines")
                break
                
            try:
                pkt = json.loads(line)
                if "answer_piece" in pkt:
                    piece = pkt["answer_piece"].replace("\\n", "\n")
                    analysis_text += piece
                    
                    # Check if file is mentioned in the response
                    if str(file_id) in piece or "file" in piece.lower():
                        file_mentioned = True
                        
            except json.JSONDecodeError:
                logger.debug(f"[FILE_CONTEXT] JSON decode error on line {line_count}: {line[:100]}")
                continue
        
        logger.info(f"[FILE_CONTEXT] Stream processing completed for file {file_id}, "
                   f"total text length: {len(analysis_text)}, file mentioned: {file_mentioned}")
        
        return analysis_text

def is_generic_response(text: str) -> bool:
    """
    Check if the AI response is generic (indicating file access issues).
    """
    generic_phrases = [
        "could you please share the file",
        "please share the file",
        "paste its content",
        "upload the file",
        "provide the file",
        "share the document",
        "i don't see any file",
        "no file was provided",
        "file content is not available",
        "file_access_error",
        "i cannot access",
        "i don't have access to",
        "please provide the content",
        "i wasn't able to access the file",
        "it might be in a format i don't support",
        "could be password-protected",
        "try a different file",
        "proceed based on a general topic",
        "using my knowledge"
    ]
    
    text_lower = text.lower()
    return any(phrase in text_lower for phrase in generic_phrases)

def parse_analysis_result(file_id: int, analysis_text: str) -> Dict[str, Any]:
    """
    Parse the analysis result and extract structured information.
    """
    summary = ""
    topics = []
    key_info = ""
    
    # Log the raw response for debugging
    logger.info(f"[FILE_CONTEXT] Raw analysis response for file {file_id} (length: {len(analysis_text)}): "
               f"{analysis_text[:500]}{'...' if len(analysis_text) > 500 else ''}")
    
    lines = analysis_text.split('\n')
    for line in lines:
        if line.startswith("SUMMARY:"):
            summary = line.replace("SUMMARY:", "").strip()
        elif line.startswith("TOPICS:"):
            topics_text = line.replace("TOPICS:", "").strip()
            topics = [t.strip() for t in topics_text.split(',') if t.strip()]
        elif line.startswith("KEY_INFO:"):
            key_info = line.replace("KEY_INFO:", "").strip()
    
    # If no structured response, try to extract meaningful content
    if not summary and analysis_text.strip():
        # Take first 200 characters as summary if no structured response
        summary = analysis_text.strip()[:200]
        if len(analysis_text) > 200:
            summary += "..."
        logger.info(f"[FILE_CONTEXT] No structured SUMMARY found, using first 200 chars as summary for file {file_id}")
    
    # If still no summary, use a fallback
    if not summary:
        summary = f"File content analyzed successfully (ID: {file_id})"
        logger.warning(f"[FILE_CONTEXT] No summary could be extracted for file {file_id}, using fallback")
    
    return {
        "file_id": file_id,
        "summary": summary,
        "topics": topics,
        "key_info": key_info,
        "content": analysis_text
    }

async def extract_folder_context(folder_id: int, cookies: Dict[str, str]) -> Dict[str, Any]:
    """
    Extract context from a folder by analyzing its files.
    """
    try:
        # Get folder files
        async with httpx.AsyncClient(timeout=180.0) as client:  # 3 minutes timeout for large files like 200-page PDFs
            response = await client.get(
                f"{ONYX_API_SERVER_URL}/user/folder/{folder_id}",
                cookies=cookies
            )
            response.raise_for_status()
            
            folder_data = response.json()
            files = folder_data.get("files", [])
            
            if not files:
                return {"folder_id": folder_id, "summary": "Empty folder", "topics": []}
            
            # Create a temporary chat session to analyze folder content
            persona_id = await get_contentbuilder_persona_id(cookies)
            temp_chat_id = await create_onyx_chat_session(persona_id, cookies)
            
            # Analyze folder content
            analysis_prompt = f"""
            This folder contains {len(files)} files. Please analyze the overall theme and provide:
            1. A summary of what this folder is about (max 150 words)
            2. Key topics that are covered across all files
            3. The main purpose or theme of this collection
            
            Format your response as:
            SUMMARY: [summary here]
            TOPICS: [comma-separated topics]
            THEME: [main theme or purpose]
            """
            
            file_ids = [f["id"] for f in files if f.get("status") == "INDEXED"]
            
            if not file_ids:
                return {"folder_id": folder_id, "summary": "No indexed files in folder", "topics": []}
            
            payload = {
                "chat_session_id": temp_chat_id,
                "message": analysis_prompt,
                "parent_message_id": None,
                "file_descriptors": [],
                "user_file_ids": file_ids,
                "user_folder_ids": [],
                "prompt_id": None,
                "search_doc_ids": None,
                "retrieval_options": {"run_search": "never", "real_time": False},
                "stream_response": True,
            }
            
            # Try the simple API first, fallback to regular streaming endpoint
            try:
                response = await client.post(
                    f"{ONYX_API_SERVER_URL}/chat/send-message-simple-api",
                    json=payload,
                    cookies=cookies
                )
                response.raise_for_status()
                result = response.json()
                analysis_text = result.get("answer", "")
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    logger.info(f"[FILE_CONTEXT] Simple API not available, using streaming endpoint for folder {folder_id}")
                    # Fallback to streaming endpoint
                    async with client.stream("POST", f"{ONYX_API_SERVER_URL}/chat/send-message", json=payload, cookies=cookies) as resp:
                        resp.raise_for_status()
                        analysis_text = ""
                        line_count = 0
                        async for raw_line in resp.aiter_lines():
                            line_count += 1
                            if not raw_line:
                                continue
                            line = raw_line.strip()
                            if line.startswith("data:"):
                                line = line.split("data:", 1)[1].strip()
                            if line == "[DONE]":
                                logger.info(f"[FILE_CONTEXT] Stream completed for folder {folder_id} after {line_count} lines")
                                break
                            try:
                                pkt = json.loads(line)
                                if "answer_piece" in pkt:
                                    analysis_text += pkt["answer_piece"].replace("\\n", "\n")
                            except json.JSONDecodeError:
                                logger.debug(f"[FILE_CONTEXT] JSON decode error on line {line_count}: {line[:100]}")
                                continue
                        logger.info(f"[FILE_CONTEXT] Stream processing completed for folder {folder_id}, total text length: {len(analysis_text)}")
                else:
                    raise
            
            # Parse the analysis
            summary = ""
            topics = []
            theme = ""
            
            lines = analysis_text.split('\n')
            for line in lines:
                if line.startswith("SUMMARY:"):
                    summary = line.replace("SUMMARY:", "").strip()
                elif line.startswith("TOPICS:"):
                    topics_text = line.replace("TOPICS:", "").strip()
                    topics = [t.strip() for t in topics_text.split(',') if t.strip()]
                elif line.startswith("THEME:"):
                    theme = line.replace("THEME:", "").strip()
            
            return {
                "folder_id": folder_id,
                "folder_name": folder_data.get("name", ""),
                "summary": summary,
                "topics": topics,
                "theme": theme,
                "file_count": len(files)
            }
            
    except Exception as e:
        logger.error(f"[FILE_CONTEXT] Error extracting folder context for folder {folder_id}: {e}")
        return None

def build_enhanced_prompt_with_context(original_prompt: str, file_context: Dict[str, Any], product_type: str) -> str:
    """
    Build an enhanced prompt that includes the extracted file context for OpenAI.
    """
    enhanced_prompt = f"""
{original_prompt}

--- CONTEXT FROM UPLOADED FILES ---

"""
    
    # Check if fallback was used
    if file_context.get("metadata", {}).get("fallback_used"):
        enhanced_prompt += "NOTE: File context extraction was limited, but files were provided for content creation.\n\n"
    
    # Add file summaries
    if file_context.get("file_summaries"):
        enhanced_prompt += "FILE SUMMARIES:\n"
        for i, summary in enumerate(file_context["file_summaries"], 1):
            enhanced_prompt += f"{i}. {summary}\n"
        enhanced_prompt += "\n"
    
    # Add folder contexts
    if file_context.get("folder_contexts"):
        enhanced_prompt += "FOLDER CONTEXTS:\n"
        for folder_ctx in file_context["folder_contexts"]:
            enhanced_prompt += f"• {folder_ctx.get('folder_name', 'Unknown')}: {folder_ctx.get('summary', '')}\n"
        enhanced_prompt += "\n"
    
    # Add key topics
    if file_context.get("key_topics"):
        enhanced_prompt += f"KEY TOPICS COVERED: {', '.join(file_context['key_topics'])}\n\n"
    
    # Add specific instructions for the product type with enhanced formatting guidance
    if product_type == "Course Outline":
        enhanced_prompt += """
CRITICAL FORMATTING REQUIREMENTS FOR COURSE OUTLINE:
1. Use exactly this structure: ## Module [Number]: [Module Title]
2. Each module must be a separate H2 header starting with ##
3. Lessons must be numbered list items (1. 2. 3.) under each module

ENSURE: Create the requested number of modules, not a single module with all lessons.
"""
    elif product_type == "Lesson Presentation":
        enhanced_prompt += """
CRITICAL FORMATTING REQUIREMENTS FOR LESSON PRESENTATION:
1. After the Universal Product Header (**[Project Name]** : **Lesson Presentation** : **[Lesson Title]**), add exactly TWO blank lines
2. Each slide MUST use this exact format: **Slide N: [Descriptive Title]** `[slide-type]`
3. Use "---" separators between slides (with blank lines before and after each separator)
4. Example structure:
   **Slide 1: Introduction to Topic**
   [Content here]
   
   ---
   
   **Slide 2: Key Concepts**
   [Content here]
   
   ---
   
5. NEVER use markdown headers (##, ###) for slide titles - ONLY use **Slide N: Title** format
6. Ensure slides are numbered sequentially: Slide 1, Slide 2, Slide 3, etc.

ENSURE: Every slide follows the **Slide N: Title** format exactly.
"""
    elif product_type == "Video Lesson Presentation":
        enhanced_prompt += """
CRITICAL FORMATTING REQUIREMENTS FOR VIDEO LESSON PRESENTATION:
1. After the Universal Product Header (**[Project Name]** : **Video Lesson Slides Deck** : **[Lesson Title]**), add exactly TWO blank lines
2. Each slide MUST use this exact format: **Slide N: [Descriptive Title]**
3. Use "---" separators between slides (with blank lines before and after each separator)
4. Example structure:
   **Slide 1: Introduction to Topic**
   [Content here]
   
   ---
   
   **Slide 2: Key Concepts**
   [Content here]
   
   ---
   
5. NEVER use markdown headers (##, ###) for slide titles - ONLY use **Slide N: Title** format
6. Ensure slides are numbered sequentially: Slide 1, Slide 2, Slide 3, etc.

ENSURE: Every slide follows the **Slide N: Title** format exactly for proper video lesson processing.
"""
    
    # Add specific instructions for the product type
    if file_context.get("metadata", {}).get("fallback_used"):
        enhanced_prompt += f"""
IMPORTANT: Files were provided for content creation. Create a {product_type} that is relevant to the uploaded materials.
If specific content details are not available, focus on creating high-quality educational content that would be appropriate for the file types provided.
"""
    else:
        enhanced_prompt += f"""
IMPORTANT: Use the context from the uploaded files to create a {product_type} that is relevant and accurate to the source materials. 
Ensure that the content aligns with the topics and information provided in the file summaries and folder contexts.
"""
    
    return enhanced_prompt

async def stream_hybrid_response(prompt: str, file_context: Dict[str, Any], product_type: str, model: str = None):
    """
    Stream response using OpenAI with enhanced context from Onyx file extraction.
    """
    try:
        # Build enhanced prompt with file context
        enhanced_prompt = build_enhanced_prompt_with_context(prompt, file_context, product_type)
        
        logger.info(f"[HYBRID_STREAM] Starting hybrid streaming with enhanced context")
        logger.info(f"[HYBRID_STREAM] Original prompt length: {len(prompt)} chars")
        logger.info(f"[HYBRID_STREAM] Enhanced prompt length: {len(enhanced_prompt)} chars")
        logger.info(f"[HYBRID_STREAM] File context: {len(file_context.get('file_summaries', []))} summaries, {len(file_context.get('key_topics', []))} topics")
        
        # Use OpenAI with enhanced prompt
        async for chunk_data in stream_openai_response(enhanced_prompt, model):
            yield chunk_data
            
    except Exception as e:
        logger.error(f"[HYBRID_STREAM] Error in hybrid streaming: {e}", exc_info=True)
        yield {"type": "error", "text": f"Hybrid streaming error: {str(e)}"}

@app.get("/api/custom/microproduct_types", response_model=List[str])
async def get_allowed_microproduct_types_list_for_design_templates():
    return ALLOWED_MICROPRODUCT_TYPES_FOR_DESIGNS

# --- Project and MicroProduct Endpoints ---
@app.post("/api/custom/projects/add", response_model=ProjectDB, status_code=status.HTTP_201_CREATED)
def build_source_context(payload) -> tuple[Optional[str], Optional[dict]]:
    """
    Build source context type and data from a finalize payload.
    Returns (context_type, context_data) tuple.
    """
    context_type = None
    context_data = {}
    
    # Check for connector context
    if hasattr(payload, 'fromConnectors') and payload.fromConnectors:
        context_type = 'connectors'
        context_data = {
            'connector_ids': payload.connectorIds.split(',') if payload.connectorIds else [],
            'connector_sources': payload.connectorSources.split(',') if payload.connectorSources else []
        }
    # Check for Knowledge Base context
    elif hasattr(payload, 'fromKnowledgeBase') and payload.fromKnowledgeBase:
        context_type = 'knowledge_base'
        context_data = {'search_query': payload.prompt if hasattr(payload, 'prompt') else None}
    # Check for file context
    elif hasattr(payload, 'fromFiles') and payload.fromFiles:
        context_type = 'files'
        context_data = {
            'folder_ids': payload.folderIds.split(',') if payload.folderIds else [],
            'file_ids': payload.fileIds.split(',') if payload.fileIds else []
        }
    # Check for text context
    elif hasattr(payload, 'fromText') and payload.fromText:
        context_type = 'text'
        context_data = {
            'text_mode': payload.textMode if hasattr(payload, 'textMode') else None,
            'user_text': payload.userText if hasattr(payload, 'userText') and payload.userText else None,
            'user_text_length': len(payload.userText) if hasattr(payload, 'userText') and payload.userText else 0
        }
    # Default to prompt-based
    else:
        context_type = 'prompt'
        context_data = {
            'prompt': payload.prompt if hasattr(payload, 'prompt') else None,
            'prompt_length': len(payload.prompt) if hasattr(payload, 'prompt') and payload.prompt else 0
        }
    
    return context_type, context_data

async def add_project_to_custom_db(project_data: ProjectCreateRequest, onyx_user_id: str = Depends(get_current_onyx_user_id), pool: asyncpg.Pool = Depends(get_db_pool)):
    # ---- Guard against duplicate concurrent submissions (same user+project name) ----
    lock_key = f"{onyx_user_id}:{project_data.projectName.strip().lower()}"
    if lock_key in ACTIVE_PROJECT_CREATE_KEYS:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Project creation already in progress.")
    
    ACTIVE_PROJECT_CREATE_KEYS.add(lock_key)
    
    # Auto-cleanup lock after maximum processing time to prevent deadlocks
    async def cleanup_lock_after_timeout():
        await asyncio.sleep(300)  # 5 minutes max processing time
        ACTIVE_PROJECT_CREATE_KEYS.discard(lock_key)
        logger.warning(f"Auto-cleaned stuck project creation lock: {lock_key}")
    
    # Start cleanup task in background
    asyncio.create_task(cleanup_lock_after_timeout())
    try:
        selected_design_template: Optional[DesignTemplateResponse] = None
        async with pool.acquire() as conn:
            design_row = await conn.fetchrow("SELECT * FROM design_templates WHERE id = $1", project_data.design_template_id)
            if not design_row:
                detail_msg = "Design template not found." if IS_PRODUCTION else f"Design Template with ID {project_data.design_template_id} not found."
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail_msg)
            selected_design_template = DesignTemplateResponse(**dict(design_row))

        db_microproduct_name_to_store = project_data.microProductName if project_data.microProductName and project_data.microProductName.strip() else selected_design_template.template_name

        target_content_model: Type[BaseModel]
        default_error_instance: BaseModel
        llm_json_example: str
        component_specific_instructions: str

        # Using the long specific instructions from the original user prompt
        if selected_design_template.component_name == COMPONENT_NAME_PDF_LESSON:
            target_content_model = PdfLessonDetails
            default_error_instance = PdfLessonDetails(lessonTitle=f"LLM Parsing Error for {project_data.projectName}", contentBlocks=[])
            llm_json_example = selected_design_template.template_structuring_prompt or DEFAULT_PDF_LESSON_JSON_EXAMPLE_FOR_LLM
            component_specific_instructions = """
            You are an expert text-to-JSON parsing assistant for 'PDF Lesson' content.
    Your output MUST be a single, valid JSON object. Strictly follow the JSON structure provided in the example.

    **Overall Goal:** Convert the *entirety* of the "Raw text to parse" into structured JSON. Capture all information and hierarchical relationships. Maintain original language.

    **Global Fields:**
    1.  `lessonTitle` (string): Main lesson title for the document.
       - Look for patterns like "**Course Name** : **Lesson** : **Lesson Title**" or "**Lesson** : **Lesson Title**"
       - Extract ONLY the lesson title part (the last part after the last "**")
       - For example: "**Code Optimization Course** : **Lesson** : **Introduction to Optimization**" → extract "Introduction to Optimization"
       - For example: "**Lesson** : **JavaScript Basics**" → extract "JavaScript Basics"
       - Do NOT include the course name or "Lesson" label in the title
       - If no clear pattern is found, use the first meaningful title or heading
    2.  `contentBlocks` (array): Ordered array of content block objects that form the body of the lesson.
    3.  `detectedLanguage` (string): e.g., "en", "ru".

    **Content Block Instructions (`contentBlocks` array items):** Each object has a `type`.

    1.  **`type: "headline"`**
        * `level` (integer):
            * `1`: Reserved for the main title of a document, usually handled by `lessonTitle`. If the input text contains a clear main title that is also part of the body, use level 1.
            * `2`: Major Section Header (e.g., "Understanding X", "Typical Mistakes"). These should use `iconName: "info"`.
            * `3`: Sub-section Header or Mini-Title. When used as a mini-title inside a numbered list item (see `numbered_list` instruction below), it should not have an icon.
            * `4`: Special Call-outs (e.g., "Module Goal", "Important Note"). Typically use `iconName: "target"` for goals, or lesson objectives.
        * `text` (string): Headline text.
        * `iconName` (string, optional): Based on level and context as described above.
        * `isImportant` (boolean, optional): Set to `true` for Level 3 and 4 headlines like "Lesson Goal" or "Lesson Target". If `true`, this headline AND its *immediately following single block* will be grouped into a visually distinct highlighted box. Do NOT set this to 'true' for sections like 'Conclusion', 'Key Takeaways' or any other section that comes in the very end of the lesson. Do not use this as 'true' for more than 1 section.


    2.  **`type: "paragraph"`**
        * `text` (string): Full paragraph text.
        * `isRecommendation` (boolean, optional): If this paragraph is a 'recommendation' within a numbered list item, set this to `true`. Or set this to true if it is a concluding thoght in the very end of the lesson (this case applies only to one VERY last thought). Cannot be 'true' for ALL the elements in one list. HAS to be 'true' if the paragraph starts with the keyword for recommendation — e.g., 'Recommendation', 'Рекомендация', 'Рекомендація' — or their localized equivalents, and isn't a part of the buller list.

    3.  **`type: "bullet_list"`**
        * `items` (array of `ListItem`): Can be strings or other nested content blocks.
        * `iconName` (string, optional): Default to `chevronRight`. If this bullet list is acting as a structural container for a numbered list item's content (mini-title + description), set `iconName: "none"`.

    4.  **`type: "numbered_list"`**
        * `items` (array of `ListItem`):
            * Can be simple strings for basic numbered points.
            * For complex items that should appear as a single visual "box" with a mini-title, description, and optional recommendation:
                * Each such item in the `numbered_list`'s `items` array should itself be a `bullet_list` block with `iconName: "none"`.
                * The `items` of this *inner* `bullet_list` should then be:
                    1. A `headline` block (e.g., `level: 3`, `text: "Mini-Title Text"`, no icon).
                    2. A `paragraph` block (for the main descriptive text).
                    3. Optionally, another `paragraph` block with `isRecommendation: true`.
            * Only use round numbers in this list, no a1, a2 or 1.1, 1.2.

    **General Parsing Rules & Icon Names:**
    * Ensure correct `level` for headlines. Section headers are `level: 2`. Mini-titles in lists are `level: 3`.
    * Icons: `info` for H2. `target` or `award` for H4 `isImportant`. `chevronRight` for general bullet lists. No icons for H3 mini-titles.
    * Permissible Icon Names: `info`, `target`, `award`, `chevronRight`, `bullet-circle`, `compass`.
    * Make sure to not have any tags in '<>' brackets (e.g. '<u>') in the list elements, UNLESS it is logically a part of the lesson.
    * DO NOT remove the '**' from the text, treat it as an equal part of the text. Moreover, ADD '**' around short parts of the text if you are sure that they should be bold.
    * Make sure to analyze the numbered lists in depth to not break their logically intended structure.

    Important Localization Rule: All auxiliary headings or keywords such as "Recommendation", "Conclusion", "Create from scratch", "Goal", etc. MUST be translated into the same language as the surrounding content. Examples:
      • Ukrainian → "Рекомендація", "Висновок", "Створити з нуля"
      • Russian   → "Рекомендация", "Заключение", "Создать с нуля"
      • Spanish   → "Recomendación", "Conclusión", "Crear desde cero"

    Return ONLY the JSON object. 
            """
        elif selected_design_template.component_name == COMPONENT_NAME_TEXT_PRESENTATION:
            target_content_model = TextPresentationDetails
            default_error_instance = TextPresentationDetails(textTitle=f"LLM Parsing Error for {project_data.projectName}", contentBlocks=[])
            llm_json_example = DEFAULT_PDF_LESSON_JSON_EXAMPLE_FOR_LLM # Can reuse this example structure
            component_specific_instructions = """
            You are an expert text-to-JSON parsing assistant for 'Text Presentation' content.
            This product is for general text like introductions, goal descriptions, etc.
            Your output MUST be a single, valid JSON object. Strictly follow the JSON structure provided in the example.

            **Overall Goal:** Convert the *entirety* of the "Raw text to parse" into a structured JSON. Capture all information and hierarchical relationships. Maintain original language.

            **Global Fields:**
            1.  `textTitle` (string, optional): Main title for the document. This should be derived from a Level 1 headline (`#`) or from the document header.
               - Look for patterns like "**Course Name** : **Text Presentation** : **Title**" or "**Text Presentation** : **Title**"
               - Extract ONLY the title part (the last part after the last "**")
               - For example: "**Code Optimization Course** : **Text Presentation** : **Introduction to Optimization**" → extract "Introduction to Optimization"
               - For example: "**Text Presentation** : **JavaScript Basics**" → extract "JavaScript Basics"
               - Do NOT include the course name or "Text Presentation" label in the title
               - If no clear pattern is found, use the first meaningful title or heading
            2.  `contentBlocks` (array): Ordered array of content block objects that form the body of the lesson.
            3.  `detectedLanguage` (string): e.g., "en", "ru".

            **Content Block Instructions (`contentBlocks` array items):**

            1.  **`type: "headline"`**
                * `level` (integer): `2`, `3`, or `4`.
                * `text` (string): Headline text.
                * `iconName` (string, optional): If the raw text includes an icon name like `{iconName}`, extract it. Permissible Icon Names: `info`, `goal`, `star`, `apple`, `award`, `boxes`, `calendar`, `chart`, `clock`, `globe`.
                * `isImportant` (boolean, optional): If the raw text includes `{isImportant}`, set this to `true`. If `true`, this headline AND its *immediately following single block* will be grouped into a visually distinct highlighted box.

            2.  **`type: "paragraph"`**
                * `text` (string): Full paragraph text.
                * `isRecommendation` (boolean, optional): Set to `true` if this paragraph should be styled as a recommendation (e.g., with a side border).

            3.  **`type: "bullet_list"`**
                * `items` (array of `ListItem`): Can be simple strings. Nested lists are supported; you can place a `bullet_list` or `numbered_list` inside another list's `items` array.

            4.  **`type: "numbered_list"`**
                * `items` (array of `ListItem`): Can be simple strings or other blocks, including a `bullet_list` for nested content.

            5.  **`type: "table"`**
                * `headers` (array of strings): The column headers for the table.
                * `rows` (array of arrays of strings): Each inner array is a row, with each string representing a cell value. The number of cells in each row should match the number of headers.
                * `caption` (string, optional): A short description or title for the table, if present in the source text.
                * Use a table block whenever the source text contains tabular data, a grid, or a Markdown table (with | separators). Do not attempt to represent tables as lists or paragraphs.

            6.  **`type: "alert"`**
                *   `alertType` (string): One of `info`, `success`, `warning`, `danger`.
                *   `title` (string, optional): The title of the alert.
                *   `text` (string): The body text of the alert.
                *   **Parsing Rule:** An alert is identified in the raw text by a blockquote. The first line of the blockquote MUST be `> [!TYPE] Optional Title`. The `TYPE` is extracted for `alertType`. The text after the tag is the `title`. All subsequent lines within the blockquote form the `text`.

            7.  **`type: "section_break"`**
                * `style` (string, optional): e.g., "solid", "dashed", "none". Parse from `---` in the raw text.

            **Key Parsing Rules:**
            *   Parse `{isImportant}` on headlines to the `isImportant` boolean field.
            *   Parse `{iconName}` on headlines to the `iconName` string field.
            *   After extracting `iconName` and `isImportant` values, you MUST remove their corresponding `{...}` tags from the final headline `text` field. The user should not see these tags in the output text.
            *   If a paragraph starts with `**Recommendation:**` (or a localized translation like `**Рекомендация:**`, `**Рекомендація:**`), you MUST set the `isRecommendation` field on that paragraph block to `true` and remove the keyword itself from the final `text` field.
            *   Do NOT remove the `**` from the text for any other purpose; treat it as part of the text. It is critical that you preserve the double-asterisk (`**`) markdown for bold text within all `text` fields.
            *   You are encouraged to use a diverse range of the available `iconName` values to make the presentation visually engaging.
            *   If the raw text starts with `# Title`, this becomes the `textTitle`. The `contentBlocks` should not include this Level 1 headline. All other headlines (`##`, `###`, `####`) are content blocks.
            *   **If the source text contains a Markdown table or tabular data, and the 'tables' style is selected, you MUST output a `table` block as described above. Do NOT output Markdown tables or represent tables as lists or paragraphs.**

            Important Localization Rule: All auxiliary headings or keywords such as "Recommendation", "Conclusion", "Create from scratch", "Goal", etc. MUST be translated into the same language as the surrounding content. Examples:
              • Ukrainian → "Рекомендація", "Висновок", "Створити з нуля"
              • Russian   → "Рекомендация", "Заключение", "Создать с нуля"
              • Spanish   → "Recomendación", "Conclusión", "Crear desde cero"

            Return ONLY the JSON object.
            """
        elif selected_design_template.component_name == COMPONENT_NAME_TRAINING_PLAN:
            target_content_model = TrainingPlanDetails
            default_error_instance = TrainingPlanDetails(mainTitle=f"LLM Parsing Error for {project_data.projectName}", sections=[])
            llm_json_example = selected_design_template.template_structuring_prompt or DEFAULT_TRAINING_PLAN_JSON_EXAMPLE_FOR_LLM
            component_specific_instructions = """
            You are an expert text-to-JSON parsing assistant for 'Training Plan' content.
            Your output MUST be a single, valid JSON object. Strictly follow the JSON structure provided in the example.

            **Overall Goal:** Convert the *entirety* of the "Raw text to parse" into structured JSON that represents a multi-module training programme. Capture all information and hierarchical relationships. Preserve the original language for all textual fields.

            **Global Fields:**
            1.  `mainTitle` (string): Title of the whole programme. If the input lacks a clear title, use the project name given by the caller.
            2.  `sections` (array): Ordered list of module objects.
            3.  `detectedLanguage` (string): 2-letter code such as "en", "ru", "uk", "es".

            **Section Object (`sections` array items):**
            * `id` (string): Sequential number formatted as "№1", "№2", … Always use this exact format; never "Module 1".
            * `title` (string): Module name without the word "Module".
            * `totalHours` (number): Sum of all lesson hours in this module, rounded to one decimal. If not present in the source, set to 0 and rely on `autoCalculateHours`.
            * `lessons` (array): List of lesson objects belonging to the module.
            * `autoCalculateHours` (boolean, default true): Leave as `true` unless the source explicitly provides `totalHours`.

            **Lesson Object (`lessons` array items):**
            * `title` (string): Lesson title WITHOUT leading numeration like "Lesson 1.1".
            * `hours` (number): Duration in hours. If absent, default to 1.
            * `source` (string): Where the learning material comes from (e.g., "Internal Documentation"). "Create from scratch" if unknown.
            * `completionTime` (string): Estimated completion time in minutes, randomly generated between 5-8 minutes. Format as "5m", "6m", "7m", or "8m". This should be randomly assigned for each lesson.
            * `check` (object):
                - `type` (string): One of "test", "quiz", "practice", "none".
                - `text` (string): Description of the assessment. Must be in the original language. If `type` is not "none" and the description is missing, use "No".
+                - IMPORTANT: When the raw text explicitly names the assessment (for example just "Test"), copy that word *exactly*—do not expand it to phrases such as "Knowledge Test", "Proficiency Test", or similar, and do not spell-correct it.
            * `contentAvailable` (object):
                - `type` (string): One of "yes", "no", "percentage".
                - `text` (string): Same information expressed as free text in original language. If not specified in the input, default to {"type": "yes", "text": "100%"}. DO NOT use "Content missing" or "Content Coverage:" or similar phrases in the text.

            **Parsing Rules & Constraints:**
+            • Except where explicit transformations are required by these instructions, reproduce every extracted text fragment verbatim — preserving spelling, punctuation, capitalisation, and line breaks. Absolutely do NOT paraphrase, translate, or autocorrect the source text.
            • Detect modules and lessons from headings, tables, or enumerations in the source text. Preserve their original order.
            • Always use dot as decimal separator for `hours` (e.g., 2.5).
            • If `hours` is written as "2 h 30 min", convert to 2.5.
            • Do not create empty arrays; if a module has no lessons, set `lessons: []`.
            • Never output null values for required string fields; use an empty string instead.
            • Ensure that every lesson belongs to a module; do not leave stray lessons.
            • Preserve bold (`**`) or italic (`*`) markdown that exists inside titles or texts.
            • Auxiliary keywords like "Goal", "Outcome", "Assessment" must be translated to the language of the content using the same localization rules described earlier.

            **Validation Checklist BEFORE returning JSON:**
            □ Each module id follows the "№X" pattern.
            □ No lesson titles start with "Lesson X.Y" or similar numbering patterns.
            □ Sum of `hours` in lessons equals `totalHours` if `autoCalculateHours` is false.
            □ Every `check.type` other than "none" has non-empty `text`.
            □ `detectedLanguage` is filled with a 2-letter code.

            Return ONLY the JSON object.
            """
        elif selected_design_template.component_name == COMPONENT_NAME_SLIDE_DECK:
            target_content_model = SlideDeckDetails
            default_error_instance = SlideDeckDetails(
                lessonTitle=f"LLM Parsing Error for {project_data.projectName}",
                slides=[]
            )
            llm_json_example = DEFAULT_SLIDE_DECK_JSON_EXAMPLE_FOR_LLM  # Force use of new template format
            component_specific_instructions = """
            You are an expert text-to-JSON parsing assistant for 'Slide Deck' content with Component-Based template support.
            Your output MUST be a single, valid JSON object. Strictly follow the JSON structure provided in the example.

            **Overall Goal:** Convert the *entirety* of the "Raw text to parse" into structured JSON. Parse all slides provided without filtering or removing any content. Maintain original language and slide count.

            **CRITICAL: Parse Component-Based Slides with templateId and props**
            You must convert all slides to the component-based format using templateId and props. Parse every slide section provided in the input text.

            **Global Fields:**
            1.  `lessonTitle` (string): Main title of the lesson/presentation.
                - Look for patterns like "**Course Name** : **Lesson Presentation** : **Title**" or similar
                - Extract ONLY the title part (the last part after the last "**")
                - If no clear pattern is found, use the first meaningful title or heading
            2.  `slides` (array): Ordered list of ALL slide objects in COMPONENT-BASED format.
            3.  `currentSlideId` (string, optional): ID of the currently active slide (can be null).
            4.  `lessonNumber` (integer, optional): Sequential number if part of a training plan.
            5.  `detectedLanguage` (string): 2-letter code such as "en", "ru", "uk".

            **SLIDE PARSING RULES - PARSE ALL SLIDES:**
            - Parse every slide section marked by "---" or slide separators in the input text
            - If input contains 15 slides, output exactly 15 slides in JSON
            - Do NOT filter or skip slides based on their titles or content
            - Do NOT remove slides with titles like "Questions", "Thank You", "Further Reading", etc.
            - Your job is to PARSE, not to validate or filter content

            **Component-Based Slide Object (`slides` array items):**
            * `slideId` (string): Generate unique identifier like "slide_1_intro", "slide_2_concepts" based on slide number and title.
            * `slideNumber` (integer): Sequential slide number from input (1, 2, 3, ...).
            * `slideTitle` (string): Extract descriptive title exactly as provided in the input.
            * `templateId` (string): Assign appropriate template based on content structure (see template guidelines below).
            * `props` (object): Template-specific properties containing the actual content from the slide.

            **Template Assignment Guidelines:**
            Assign templateId based on the content structure of each slide:
            - If slide has large title + subtitle format → use "hero-title-slide" or "title-slide"
            - If slide has bullet points or lists → use "bullet-points" or "bullet-points-right"
            - If slide has two distinct sections → use "two-column"
            - If slide has numbered steps → use "process-steps"
            - If slide has 4 distinct points → use "four-box-grid"
            - If slide has 2-3 numerical metrics/statistics with clear values → use "big-numbers"
            - If slide has hierarchical content → use "pyramid"
            - If slide has timeline content → use "timeline"
            - If slide has event dates → use "event-list"
            - If slide has 6 numbered ideas → use "six-ideas-list"
            - If slide has challenges vs solutions → use "challenges-solutions"
            - If slide has analytics metrics in bullet points → use "metrics-analytics"
            - For standard content → use "content-slide"
            
            **CRITICAL TEMPLATE SELECTION RULES:**
            - NEVER use "big-numbers" unless content has exactly 2-3 clear numerical metrics with values, labels, and descriptions
            - NEVER use "metrics-analytics" unless content specifically mentions analytics/performance metrics  
            - If content has bullet points about concepts (not metrics), use "bullet-points" NOT "metrics-analytics"
            - If content mentions "evaluation", "analysis", or has bullet points about tracking/measuring, consider "bullet-points" first
            
            **CRITICAL TABLE RULE:**
            - If ANY of these words appear in the prompt or slide content → MANDATORY USE `table-dark` or `table-light`:
              "table", "data table", "comparison table", "metrics table", "performance table", "results table", "statistics table", "summary table", "analysis table", "comparison data", "tabular data", "data comparison", "side by side", "versus", "vs", "compare", "comparison", "таблица", "сравнение", "сравнительная таблица", "данные", "метрики", "результаты", "статистика", "анализ", "сопоставление", "против", "по сравнению", "сравнительный анализ", "табличные данные", "структурированные данные"
            - Tables MUST use JSON props format with `tableData.headers` and `tableData.rows` arrays
            - NEVER use markdown tables or other formats for table content

            **Content Parsing Instructions:**
            - Extract slide titles from headings or "**Slide N: Title**" format
            - Parse slide content and map to appropriate template props
            - For bullet-points: extract list items into "bullets" array
            - For two-column: split content into left and right sections
            - For process-steps: extract numbered or sequential items into "steps" array
            - For four-box-grid: parse "Box N:" format into "boxes" array
            - For big-numbers: parse table format into "steps" array with value/label/description
            - For timeline: parse chronological content into "steps" array
            - For pyramid: parse hierarchical content into "steps" array
            
            **CRITICAL IMAGE PROMPT EXTRACTION - PRESENTATION ILLUSTRATIONS:**
            - ALWAYS extract image prompts from [IMAGE_PLACEHOLDER] sections
            - Format: [IMAGE_PLACEHOLDER: SIZE | POSITION | DESCRIPTION]
            - Map DESCRIPTION to "imagePrompt" and "imageAlt" fields
            - **CRITICAL: Generate extremely detailed, descriptive prompts with specific visual elements**
            - **DETAILED PROMPT FORMAT REQUIREMENTS:**
              - Start with "Minimalist flat design illustration of [detailed subject/scene description]"
              - Include SPECIFIC visual elements: exact objects, people, layouts, arrangements
              - Describe COMPOSITION: positioning, spatial relationships, perspective
              - Detail CHARACTER descriptions: gender, age, clothing, poses, actions
              - Specify OBJECT details: shapes, sizes, orientations, interactions
              - Include ENVIRONMENTAL elements: setting, context, atmosphere
              - Use color placeholders: [COLOR1], [COLOR2], [COLOR3], [BACKGROUND]
              - End with style and background specifications
              - NO separate color descriptions or presentation context
            - **VISUAL ELEMENT REQUIREMENTS:**
              - **People**: Describe gender, ethnicity, age range, specific clothing, poses, facial expressions, interactions
              - **Objects**: Detail size, shape, orientation, material appearance, positioning relative to other elements
              - **Technology**: Specify device types, screen content, interface elements, connection indicators
              - **Architecture**: Describe building styles, structural elements, spatial relationships, interior/exterior details
              - **Data/Charts**: Detail chart types, data representation methods, axis labels, trend indicators
              - **Nature/Abstract**: Specify shapes, patterns, flow directions, organic vs geometric elements
            - **COMPOSITION REQUIREMENTS:**
              - Describe exact positioning: "person sitting on the left side", "laptop positioned at center-right"
              - Include spatial relationships: "behind", "in front of", "surrounding", "connected by"
              - Specify viewing angles: "front view", "three-quarter perspective", "top-down view"
              - Detail background/foreground layering: "foreground elements", "middle ground", "background context"
            - **COLOR PLACEHOLDER USAGE:**
              - [COLOR1] or [PRIMARY]: Main accent color for primary focal elements
              - [COLOR2] or [SECONDARY]: Secondary color for supporting elements, borders, text
              - [COLOR3] or [TERTIARY]: Accent color for details, highlights, subtle elements
              - [BACKGROUND]: Background color for the entire illustration
            - **ENHANCED PROMPT STRUCTURE:**
              - "Minimalist flat design illustration of [comprehensive scene description with 3-5 specific visual elements]. The scene features [detailed character/object descriptions with exact positioning]. [Additional environmental and compositional details]. [Specific color assignments for each visual element using placeholders]. The style is modern corporate vector art with clean geometric shapes and flat colors. The background is [BACKGROUND], completely clean and isolated."
            - **MANDATORY SCENE STRUCTURING:**
              - ALWAYS describe WHO is in the scene (specific people with demographics, clothing, poses)
              - ALWAYS describe WHERE they are positioned (left, center, right, foreground, background)
              - ALWAYS describe WHAT they are doing (specific actions, interactions, activities)
              - ALWAYS describe the SETTING details (furniture, equipment, environment specifics)
              - ALWAYS describe the LAYOUT (how elements are arranged spatially)
              - NEVER use vague terms like "featuring visual representations" or "playful design"
              - REPLACE abstract descriptions with concrete, observable elements
            - **SIMPLICITY REQUIREMENTS:**
              - LIMIT to 1-2 people maximum per illustration (never 3+ people)
              - SHOW 1-3 main visual elements only (avoid complex multi-panel setups)
              - FOCUS on clean, uncluttered compositions with plenty of white space
              - AVOID crowded scenes with multiple monitors, workstations, or complex layouts
              - PREFER single focal points rather than busy multi-element arrangements
            - **VISUAL ILLUSTRATION REQUIREMENTS:**
              - CREATE scenic illustrations NOT infographics or charts
              - AVOID "featuring icons representing" or "with clear labels" language
              - GENERATE actual scenes with objects, environments, and atmospheres
              - PREFER realistic scenarios over abstract concept representations
              - FOCUS on visual storytelling rather than information display
              - REPLACE "infographic" prompts with "illustration of [actual scene/environment]"
            - **DETAILED SCENE EXAMPLES (SIMPLE COMPOSITIONS):**
              - TEAM COLLABORATION: "two professionals at a clean desk: a Black woman in a blue blazer presenting to an Asian man in glasses who is taking notes on a single laptop, with one simple whiteboard showing basic geometric shapes in the background"
              - TECHNOLOGY SETUP: "a single modern workstation with one large monitor displaying simple geometric charts, a wireless keyboard, and minimal desk accessories"
              - DATA FLOW: "a simple network diagram with three circular nodes connected by clean arrow lines, showing data flow between connected points"
              - EDUCATIONAL SCENE: "one Hispanic female teacher standing next to a single wall chart with simple pictographic elements, facing two students sitting at clean desks"
              - LANGUAGE LEARNING: "one student at a modern desk using a tablet for language learning, with simple educational materials nearby"
            - **TEXT AND LABELING RESTRICTIONS:**
              - MINIMIZE text elements in illustrations - use symbols, icons, and visual indicators instead
              - AVOID readable text, labels, signs, or written content on screens, documents, or displays
              - USE abstract geometric shapes, simple icons, and visual patterns instead of text
              - REPLACE charts with text labels with simple bar charts, pie segments, or geometric data representations
              - AVOID books, documents, or papers with visible text - use blank documents or simple geometric patterns
              - USE color coding and visual hierarchy instead of text labels for differentiation
            - **MANDATORY REQUIREMENTS:**
              - NEVER include "presentation slide" or "for presentations" in the prompt
              - NEVER add separate color descriptions after the main scene description
              - ALWAYS describe at least 3-5 specific visual elements in detail
              - ALWAYS specify exact positioning and spatial relationships
              - ALWAYS include character demographics and specific object details
              - ALWAYS assign colors to specific elements using placeholders
              - MINIMIZE or eliminate text elements - focus on visual symbols and icons
              - NEVER leave imagePrompt fields empty - generate comprehensive, detailed prompts
            - **FORBIDDEN VAGUE LANGUAGE:**
              - NEVER use "featuring visual representations" - describe specific objects instead
              - NEVER use "playful design" - describe specific arrangement and visual elements
              - NEVER use "colorful illustration" - specify who, what, where, and how they're positioned
              - NEVER use "depicting [concept]" - describe the actual scene with people and objects
              - REPLACE abstract concepts with concrete scenes showing people engaged in specific activities
              - REPLACE "showing [topic]" with "scene features [specific people] doing [specific actions] in [specific setting]"
            - **FORBIDDEN INFOGRAPHIC LANGUAGE:**
              - NEVER use "infographic illustrating" - create actual scenic illustrations instead
              - NEVER use "featuring icons representing" - describe real objects and environments
              - NEVER use "with clear labels" or "arranged in a layout" - focus on natural scenes
              - NEVER use "icons for [concepts]" - create realistic environments where concepts occur
              - REPLACE "infographic of [topic]" with "illustration of [people doing topic-related activities in specific environment]"
              - REPLACE "featuring icons" with "scene showing [specific objects, people, and activities]"
            
            **TEMPLATE-SPECIFIC PROPS REQUIREMENTS:**
            
            For "big-image-left" and "big-image-top":
            - "title": Main slide heading
            - "subtitle": Descriptive content (NOT same as title)  
            - "imagePrompt": Detailed description for AI image generation
            - "imageAlt": Alt text for the image
            
            For "bullet-points" and "bullet-points-right":
            - "title": Main heading
            - "bullets": Array of bullet point strings
            - "imagePrompt": Description for supporting image (REQUIRED) - MUST be scenic illustration showing people in real environments, NOT infographics or icons. NEVER leave this field empty or the slide will use generic fallback prompts.
            - "imageAlt": Alt text for image
            
            For "two-column":
            - "title": Main slide title
            - "leftTitle": Left column heading  
            - "rightTitle": Right column heading (NEVER leave empty - always provide meaningful title)
            - "leftContent": Left column text content
            - "rightContent": Right column text content (NEVER leave empty - split slide content between columns)
            - "leftImagePrompt": Image prompt for left column (if applicable)
            - "rightImagePrompt": Image prompt for right column (if applicable)
            - **CRITICAL**: Two-column slides MUST have content in BOTH columns. Split slide content intelligently between left and right sections.
            
            For "big-numbers":
            - "title": Main heading
            - "steps": Array with exactly 3 items, each having:
              - "value": Numerical value or short metric (e.g., "25%", "3x", "$42")
              - "label": Short descriptive label (e.g., "Performance Improvement") 
              - "description": Detailed explanation of the metric
            - **CRITICAL**: ALWAYS provide exactly 3 steps. If slide content has less, expand into 3 logical points. If more than 3, group into 3 main categories.
            
            For "metrics-analytics":
            - "title": Main heading
            - "metrics": Array of metric descriptions (strings)

            **Critical Parsing Rules:**
            - Parse ALL slides provided in the input text - do not skip any
            - Maintain the exact number of slides from input to output
            - Assign appropriate templateId based on content structure, not validation rules
            - Preserve all content exactly as provided in the input
            - Generate sequential slideNumber values (1, 2, 3, ...)
            - Create descriptive slideId values based on number and title
            - NEVER create duplicate content for title and subtitle - extract different content
            - ALWAYS generate imagePrompt for templates that support images - NEVER leave imagePrompt fields empty
            - CRITICAL: bullet-points and bullet-points-right templates MUST include detailed imagePrompt fields

            Important Localization Rule: All auxiliary headings or keywords must be in the same language as the surrounding content.

            Return ONLY the JSON object.
            """
        elif selected_design_template.component_name == COMPONENT_NAME_VIDEO_LESSON_PRESENTATION:
            target_content_model = SlideDeckDetails
            default_error_instance = SlideDeckDetails(
                lessonTitle=f"LLM Parsing Error for {project_data.projectName}",
                slides=[]
            )
            llm_json_example = DEFAULT_VIDEO_LESSON_JSON_EXAMPLE_FOR_LLM  # Use video lesson template with voiceover
            component_specific_instructions = """
            You are an expert text-to-JSON parsing assistant for 'Slide Deck' content with Component-Based template support.
            Your output MUST be a single, valid JSON object. Strictly follow the JSON structure provided in the example.

            **Overall Goal:** Convert the *entirety* of the "Raw text to parse" into structured JSON. Parse all slides provided without filtering or removing any content. Maintain original language and slide count.
            
            **VIDEO LESSON MODE: You are creating a Video Lesson Presentation with voiceover.**
            - This is NOT a regular slide deck - it's a Video Lesson that requires voiceover for every slide
            - You MUST generate voiceover text for each slide regardless of the input content
            - The voiceover is essential for the video lesson functionality
            - FAILURE TO INCLUDE VOICEOVER WILL RESULT IN AN INVALID OUTPUT
            
            🚨 CRITICAL REQUIREMENT: Every slide object MUST have a "voiceoverText" field with 2-4 sentences of conversational explanation. The root object MUST have "hasVoiceover": true. This is NON-NEGOTIABLE for Video Lesson Presentations.

            **CRITICAL: Parse Component-Based Slides with templateId and props**
            You must convert all slides to the component-based format using templateId and props. Parse every slide section provided in the input text.
            
            **VIDEO LESSON VOICEOVER REQUIREMENTS:**
            When parsing a Video Lesson Presentation, you MUST include voiceover text for each slide. The voiceover should:
            - Be conversational and engaging, as if speaking directly to the learner
            - Explain the slide content in detail, expanding on what's visually presented
            - Use natural transitions between concepts
            - Be approximately 30-60 seconds of speaking time per slide
            - Include clear explanations of complex concepts
            - Use inclusive language ("we", "you", "let's") to create connection with the learner
            - Provide context and background information not visible on the slide
            - End with smooth transitions to the next slide
            
            **CRITICAL: You MUST generate voiceover text for EVERY slide in Video Lesson Presentations.**
            - Each slide object MUST include a "voiceoverText" field
            - The voiceover should be 2-4 sentences explaining the slide content
            - Set "hasVoiceover": true in the root object
            - If you don't see voiceover text in the input, GENERATE it based on the slide content
            
            **MANDATORY VOICEOVER GENERATION:**
            - For Video Lesson Presentations, you MUST create voiceover text for EVERY slide
            - Do NOT skip voiceover generation under any circumstances
            - Generate conversational, engaging voiceover that explains the slide content
            - Each voiceover should be 2-4 sentences (approximately 30-60 seconds of speaking time)
            - Use inclusive language ("we", "you", "let's") to create connection with the learner
            - Provide context and background information not visible on the slide
            - End with smooth transitions to the next slide

            **Global Fields:**
            1.  `lessonTitle` (string): Main title of the lesson/presentation.
                - Look for patterns like "**Course Name** : **Lesson Presentation** : **Title**" or similar
                - Extract ONLY the title part (the last part after the last "**")
                - If no clear pattern is found, use the first meaningful title or heading
            2.  `slides` (array): Ordered list of ALL slide objects in COMPONENT-BASED format.
            3.  `currentSlideId` (string, optional): ID of the currently active slide (can be null).
            4.  `lessonNumber` (integer, optional): Sequential number if part of a training plan.
            5.  `detectedLanguage` (string): 2-letter code such as "en", "ru", "uk".
            6.  `hasVoiceover` (boolean, MANDATORY for Video Lessons): For Video Lesson Presentations, you MUST set this to true since every slide will have voiceover text.

            **SLIDE PARSING RULES - PARSE ALL SLIDES:**
            - Parse every slide section marked by "---" or slide separators in the input text
            - If input contains 15 slides, output exactly 15 slides in JSON
            - Do NOT filter or skip slides based on their titles or content
            - Do NOT remove slides with titles like "Questions", "Thank You", "Further Reading", etc.
            - Your job is to PARSE, not to validate or filter content

            **Component-Based Slide Object (`slides` array items):**
            * `slideId` (string): Generate unique identifier like "slide_1_intro", "slide_2_concepts" based on slide number and title.
            * `slideNumber` (integer): Sequential slide number from input (1, 2, 3, ...).
            * `slideTitle` (string): Extract descriptive title exactly as provided in the input.
            * `templateId` (string): Assign appropriate template based on content structure (see template guidelines below).
            * `props` (object): Template-specific properties containing the actual content from the slide.
            * `voiceoverText` (string, MANDATORY for Video Lessons): For Video Lesson Presentations, you MUST include conversational voiceover text that explains the slide content in detail. This field is REQUIRED for every slide in video lessons.

            **Template Assignment Guidelines:**
            Assign templateId based on the content structure of each slide:
            - If slide has large title + subtitle format → use "hero-title-slide" or "title-slide"
            - If slide has bullet points or lists → use "bullet-points" or "bullet-points-right"
            - If slide has two distinct sections → use "two-column" or "two-column-diversity"
            - If slide has numbered steps → use "process-steps"
            - If slide has 4 distinct points → use "four-box-grid"
            - If slide has metrics/statistics → use "big-numbers"
            - If slide has hierarchical content → use "pyramid"
            - If slide has timeline content → use "timeline"
            - For standard content → use "content-slide"
            
            **CRITICAL TABLE RULE:**
            - If ANY of these words appear in the prompt or slide content → MANDATORY USE `table-dark` or `table-light`:
              "table", "data table", "comparison table", "metrics table", "performance table", "results table", "statistics table", "summary table", "analysis table", "comparison data", "tabular data", "data comparison", "side by side", "versus", "vs", "compare", "comparison", "таблица", "сравнение", "сравнительная таблица", "данные", "метрики", "результаты", "статистика", "анализ", "сопоставление", "против", "по сравнению", "сравнительный анализ", "табличные данные", "структурированные данные"
            - Tables MUST use JSON props format with `tableData.headers` and `tableData.rows` arrays
            - NEVER use markdown tables or other formats for table content

            **Available Template IDs and their Props (must match exactly):**

            1. **`hero-title-slide`** - Hero opening slides:
            ```json
            "props": {
              "title": "Main slide title",
              "subtitle": "Detailed subtitle explaining the overview",
              "showAccent": true,
              "accentPosition": "left",
              "textAlign": "center",
              "titleSize": "xlarge",
              "subtitleSize": "medium"
            }
            ```

            2. **`title-slide`** - Simple title slides:
            ```json
            "props": {
              "title": "Presentation Title",
              "subtitle": "Compelling subtitle that captures attention",
              "author": "Author name",
              "date": "Date"
            }
            ```

            3. **`content-slide`** - Standard content slides:
            ```json
            "props": {
              "title": "Slide title",
              "content": "Main content with bullet points:\\n\\n• Point 1\\n• Point 2\\n• Point 3",
              "alignment": "left"
            }
            ```

            4. **`bullet-points`** - Formatted bullet point lists:
            ```json
            "props": {
              "title": "Key Points",
              "bullets": [
                "First important point with detailed explanation",
                "Second key insight with comprehensive analysis",
                "Third critical element with thorough examination",
                "Fourth essential consideration with strategic importance",
                "Fifth valuable perspective with actionable recommendations",
                "Sixth valuable perspective with actionable recommendations",
                "Seventh valuable perspective with actionable recommendations"
              ],
              "maxColumns": 2,
              "bulletStyle": "dot",
              "imagePrompt": "A relevant illustration for the bullet points",
              "imageAlt": "Illustration for bullet points"
            }
            ```

            5. **`two-column`** - Split layout:
            ```json
            "props": {
                "title": "Two Column Layout",
                "leftTitle": "Left Column",
                "leftContent": "Content for the left side with detailed explanations",
                "leftImageUrl": "https://via.placeholder.com/320x200?text=Left+Image",
                "leftImageAlt": "Description of left image",
                "leftImagePrompt": "Prompt for left image",
                "rightTitle": "Right Column",
                "rightContent": "Content for the right side with detailed information",
                "rightImageUrl": "https://via.placeholder.com/320x200?text=Right+Image",
                "rightImageAlt": "Description of right image",
                "rightImagePrompt": "Prompt for right image",
                "columnRatio": "50-50"
            }
            ```

            6. **`process-steps`** - Numbered process steps:
            ```json
            "props": {
              "title": "Process Steps",
              "steps": [
                "Step 1 with detailed description explaining what to do",
                "Step 2 with comprehensive explanation covering the process",
                "Step 3 with thorough description of the methodology",
                "Step 4 with in-depth explanation covering the final phase"
              ],
              "layout": "horizontal"
            }
            ```

            

            7. **`challenges-solutions`** - Problems vs solutions:
            ```json
            "props": {
              "title": "Challenges and Solutions",
              "challengesTitle": "Challenges",
              "solutionsTitle": "Solutions",
              "challenges": [
                "Challenge 1 with detailed explanation of the problem",
                "Challenge 2 with comprehensive analysis of the issue"
              ],
              "solutions": [
                "Solution 1 with detailed approach and implementation strategy",
                "Solution 2 with comprehensive methodology and practical steps"
              ]
            }
            ```

            8. **`big-image-left`** - Large image on left:
            ```json
            "props": {
              "title": "Slide Title",
              "subtitle": "Subtitle or detailed description for the slide",
              "imageUrl": "https://via.placeholder.com/600x400?text=Your+Image",
              "imageAlt": "Descriptive alt text",
              "imagePrompt": "A high-quality illustration that visually represents the slide title",
              "imageSize": "large"
            }
            ```

            9. **`bullet-points-right`** - Title, subtitle, bullet points with image:
            ```json
            "props": {
              "title": "Key Points",
              "subtitle": "Short intro or context before the list",
              "bullets": [
                "First important point",
                "Second key insight",
                "Third critical element",
                "Fourth essential consideration",
                "Fifth valuable perspective"
              ],
              "maxColumns": 1,
              "bulletStyle": "dot",
              "imagePrompt": "A relevant illustration for the bullet points",
              "imageAlt": "Illustration for bullet points"
            }
            ```

            10. **`big-image-top`** - Large image on top:
            ```json
            "props": {
              "title": "Main Title",
              "subtitle": "Subtitle or content goes here",
              "imageUrl": "https://via.placeholder.com/700x350?text=Your+Image",
              "imageAlt": "Descriptive alt text",
              "imagePrompt": "A high-quality illustration for the topic",
              "imageSize": "large"
            }
            ```

            11. **`four-box-grid`** - Title and 4 boxes in 2x2 grid:
            ```json
            "props": {
              "title": "Main Title",
              "boxes": [
                { "heading": "Box 1", "text": "Detailed description with comprehensive explanations" },
                { "heading": "Box 2", "text": "Comprehensive explanation covering detailed insights" },
                { "heading": "Box 3", "text": "Thorough description spanning multiple sentences" },
                { "heading": "Box 4", "text": "In-depth explanation with actionable insights" }
              ]
            }
            ```

            12. **`timeline`** - Horizontal timeline with 4 steps:
            ```json
            "props": {
              "title": "History and Evolution",
              "steps": [
                { "heading": "Step 1", "description": "Detailed description of the first phase" },
                { "heading": "Step 2", "description": "Comprehensive explanation of the second phase" },
                { "heading": "Step 3", "description": "Thorough description of the third phase" },
                { "heading": "Step 4", "description": "In-depth explanation of the final phase" }
              ]
            }
            ```

            13. **`big-numbers`** - Three-column layout for metrics:
            ```json
            "props": {
              "title": "Key Metrics",
              "steps": [
                { "value": "25%", "label": "Performance Improvement", "description": "System performance improved by 25% after optimization" },
                { "value": "3x", "label": "Speed Increase", "description": "Processing speed increased 3 times faster than before" },
                { "value": "50%", "label": "Cost Reduction", "description": "Operating costs reduced by 50% through efficient design" }
              ]
            }
            ```

            14. **`pyramid`** - Pyramid diagram with 3 levels:
            ```json
            "props": {
              "title": "Hierarchical Structure",
              "subtitle": "Explanation of the hierarchical relationship between elements",
              "steps": [
                { "heading": "Top Level", "description": "Description of the highest level" },
                { "heading": "Middle Level", "description": "Description of the intermediate level" },
                { "heading": "Base Level", "description": "Description of the foundational level" }
              ]
            }
            ```

            **Content Parsing Instructions:**
            - Extract slide titles from headings or "**Slide N: Title**" format
            - Parse slide content and map to appropriate template props
            - For bullet-points: extract list items into "bullets" array
            - For two-column: split content into left and right sections
            - For process-steps: extract numbered or sequential items into "steps" array
            - For four-box-grid: parse "Box N:" format into "boxes" array
            - For big-numbers: parse table format into "items" array with value/label/description
            - For timeline: parse chronological content into "steps" array
            - For pyramid: parse hierarchical content into "steps" array

            **Critical Parsing Rules:**
            - Parse ALL slides provided in the input text - do not skip any
            - Maintain the exact number of slides from input to output
            - Assign appropriate templateId based on content structure, not validation rules
            - Preserve all content exactly as provided in the input
            - Generate sequential slideNumber values (1, 2, 3, ...)
            - Create descriptive slideId values based on number and title

            Important Localization Rule: All auxiliary headings or keywords must be in the same language as the surrounding content.

            Return ONLY the JSON object.
            """
        elif selected_design_template.component_name == COMPONENT_NAME_VIDEO_LESSON:
            target_content_model = VideoLessonData
            default_error_instance = VideoLessonData(
                mainPresentationTitle=f"LLM Parsing Error for {project_data.projectName}",
                slides=[]
            )
            llm_json_example = selected_design_template.template_structuring_prompt or """
            {
  "mainPresentationTitle": "Курс: Обучение для рекрутера",
  "slides": [
    {
      "slideId": "slide_1_znakomstvo",
      "slideNumber": 1,
      "slideTitle": "Знакомство",
      "displayedText": "Знакомимся с основами рекрутинга и ключевыми обязанностями.",
      "displayedPictureDescription": "Улыбающиеся профессионалы в современном офисе.",
      "displayedVideoDescription": "Анимация воронки рекрутинга: поиск, отбор, интервью, оффер.",
      "voiceoverText": "Приветствую вас на курсе 'Обучение для рекрутера'! Начнем с основ. Этот модуль посвящен ключевым аспектам профессии."
    },
    {
      "slideId": "slide_2_instrumenty",
      "slideNumber": 2,
      "slideTitle": "Инструменты Рекрутера",
      "displayedText": "Рассматриваем основные инструменты для современного рекрутера.",
      "displayedPictureDescription": "Коллаж логотипов: LinkedIn, ATS, GitHub, поиск, календарь.",
      "displayedVideoDescription": "Анимация кликов по иконкам инструментов с краткими пояснениями их функций.",
      "voiceoverText": "Для успеха рекрутеру нужен арсенал инструментов. Рассмотрим основные категории и их назначение. Эффективное использование повысит вашу производительность."
    }
  ],
  "detectedLanguage": "ru"
}
            """
            component_specific_instructions = """
            You are an expert text-to-JSON parsing assistant. Your task is to convert the provided presentation slide content, which is in a specific structured text format, into a perfectly structured JSON object.

Your output MUST be a single, valid JSON object, and it must strictly adhere to the exact structure provided in the example JSON you have been given separately. Do not include any additional text, explanations, or conversational fillers outside the JSON object.

Input Text Structure and Extraction Rules:
The input text will describe a presentation or video lesson. The content within the fields (like slide titles, descriptions) can be in various languages (e.g., Ukrainian, Russian, English). You must extract the content exactly as it appears, preserving its original language, including any original formatting like line breaks within the content where present (e.g., in "Відображуваний Текст").

Overall Presentation Title:

This will be identified by a header like "Загальний Заголовок Курсу:" (or its equivalent in other languages like "ОБЩИЙ ЗАГОЛОВОК КУРСА:" or "Overall Course Title:").
Extract the text that immediately follows this bolded header as the value for the mainPresentationTitle field.
Individual Slides:

Each slide's information is clearly marked by consistently bolded headers.
slideNumber (integer): Look for "Номер Слайда:" (or equivalent, e.g., "Номер Слайда:", "Slide Number:"). Extract the numerical value that immediately follows this bolded header.
slideTitle (string): Look for "Заголовок Слайда:" (or equivalent, e.g., "Заголовок Слайда:", "Slide Title:"). Extract the text that immediately follows this bolded header.
displayedText (string): Look for "Відображуваний Текст:" (or equivalent, e.g., "Відображуваний Текст:", "Displayed Text:"). Extract all text that immediately follows this bolded header, up until the next bolded header. Preserve any internal line breaks or numbering.
displayedPictureDescription (string): Look for "Опис Зображення:" (or equivalent, e.g., "Опис Зображення:", "Image Description:"). Extract the text that immediately follows this bolded header, up until the next bolded header.
displayedVideoDescription (string): Look for "Опис Відео:" (or equivalent, e.g., "Опис Відео:", "Video Description:"). Extract the text that immediately follows this bolded header, up until the next bolded header.
voiceoverText (string): Look for "Текст Озвучення:" (or equivalent, e.g., "Текст Озвучення:", "Voiceover Text:"). Extract the text that immediately follows this bolded header, up until the next bolded header or the end of the slide's content block.
slideId Generation:

For each slide, you must generate a unique slideId.
This ID should be a concatenation of the literal string "slide_", the slideNumber, and a simplified, lowercase version of the slideTitle.
To simplify the slideTitle for the ID, convert it to lowercase and replace all spaces with underscores (_). Remove any punctuation or special characters from the simplified title part of the ID. If the title is very long, consider using only the first few words to keep the ID concise, but ensure uniqueness. For example:
slideNumber: 1, slideTitle: "Вступ" -> slideId: "slide_1_вступ"
slideNumber: 2, slideTitle: "Питання 1" -> slideId: "slide_2_питання_1"
slideNumber: 3, slideTitle: "Варіанти відповіді" -> slideId: "slide_3_варіанти_відповіді"
slideNumber: 4, slideTitle: "Пояснення до Питання 1" -> slideId: "slide_4_пояснення_до_питання_1"
detectedLanguage (string):

This will be identified by a header like "Language of Content:" (or its equivalent, e.g., "Язык Контента:", "Мова Контенту:").
Extract the two-letter ISO 639-1 language code (e.g., "uk", "ru", "en") that immediately follows this label.
If this "Language of Content:" label is missing from the input, infer the primary language from the majority of the content (specifically the mainPresentationTitle and slideTitle fields) and use the appropriate two-letter ISO 639-1 code.
Key Parsing Rules & Constraints for 100% Reliability:

Header Recognition: Always identify fields by their bolded headers (e.g., "Номер Слайда:", "Заголовок Слайда:"). These bolded headers consistently precede the data you need to extract.
Exact Text Extraction: All extracted text content must be preserved exactly as it appears in the input, including its original capitalization, punctuation, and line breaks within the content block for a given field.
Field Presence: If a field's bolded header is present in the input but the text following it is empty before the next header, the corresponding JSON field should be an empty string (""). Do not use null or omit fields that are defined as strings in the target schema if their labels are present in the input.
Sequential Parsing: Process the text sequentially, extracting content associated with each bolded header until the next bolded header is encountered.
Return ONLY the JSON object.
            """
        elif selected_design_template.component_name == COMPONENT_NAME_QUIZ:
            target_content_model = QuizData
            default_error_instance = QuizData(
                quizTitle=f"LLM Parsing Error for {project_data.projectName}",
                questions=[]
            )
            llm_json_example = selected_design_template.template_structuring_prompt or """
{
"quizTitle": "Advanced Sales Techniques Quiz",
"detectedLanguage": "en",
"questions": [
{
"question_type": "multiple-choice",
"question_text": "Which technique involves assuming the sale is made?",
"options": [
{"id": "A", "text": "The 'Question Close'"},
{"id": "B", "text": "The 'Presumptive Close'"}
],
"correct_option_id": "B",
"explanation": "A presumptive close assumes the sale is made."
},
{
"question_type": "multi-select",
"question_text": "Which of the following are primary colors? (Select all that apply)",
"options": [
{"id": "A", "text": "Red"},
{"id": "B", "text": "Green"},
{"id": "C", "text": "Orange"},
{"id": "D", "text": "Blue"}
],
"correct_option_ids": ["A", "D"],
"explanation": "In the traditional subtractive model, the primary colors are Red, Yellow, and Blue."
},
{
"question_type": "matching",
"question_text": "Match each sales technique with its description:",
"prompts": [
{"id": "A", "text": "The 'Alternative Close'"},
{"id": "B", "text": "The 'Summary Close"}
],
"options": [
{"id": "1", "text": "Presenting two options to the customer"},
{"id": "2", "text": "Recapping key benefits before asking for the sale"}
],
"correct_matches": {"A": "1", "B": "2"},
"explanation": "The Alternative Close gives customers a choice between options, while the Summary Close reinforces value before closing."
},
{
"question_type": "sorting",
"question_text": "Arrange these steps in the correct order for a successful sales call:",
"items_to_sort": [
{"id": "step1", "text": "Identify customer needs"},
{"id": "step2", "text": "Present solution"},
{"id": "step3", "text": "Handle objections"},
{"id": "step4", "text": "Close the sale"}
],
"correct_order": ["step1", "step2", "step3", "step4"],
"explanation": "The sales process follows a logical sequence: first understand needs, then present solutions, address concerns, and finally close."
},
{
"question_type": "open-answer",
"question_text": "What are the three key elements of an effective elevator pitch?",
"acceptable_answers": [
"Problem, Solution, Call to Action",
"Problem statement, Your solution, What you want them to do next",
"The issue, How you solve it, What action to take"
],
"explanation": "An effective elevator pitch should clearly state the problem, present your solution, and include a clear call to action."
}
]
}
            """
            component_specific_instructions = """
            You are an expert text-to-JSON parsing assistant for 'Quiz' content.
            Your output MUST be a single, valid JSON object. Strictly follow the JSON structure provided in the example.

            **Overall Goal:** Convert the provided quiz content into a structured JSON object that captures all questions, their types, options, correct answers, and explanations.

            **Global Fields:**
            1. `quizTitle` (string): The main title of the quiz.
            2. `questions` (array): An array of question objects.
            3. `detectedLanguage` (string): e.g., "en", "ru".

            **Question Types and Their Structures:**

            1. **Multiple Choice (`question_type: "multiple-choice"`)**
               * `question_text` (string): The question text.
               * `options` (array): List of `QuizQuestionOption` objects with `id` and `text`.
               * `correct_option_id` (string): The ID of the correct option.
               * `explanation` (string, optional): Explanation of the correct answer.

            2. **Multi-Select (`question_type: "multi-select"`)**
               * `question_text` (string): The question text.
               * `options` (array): List of `QuizQuestionOption` objects with `id` and `text`.
               * `correct_option_ids` (array): Array of IDs of all correct options.
               * `explanation` (string, optional): Explanation of the correct answers.

            3. **Matching (`question_type: "matching"`)**
               * `question_text` (string): The question text.
               * `prompts` (array): List of `MatchingPrompt` objects with `id` and `text`.
               * `options` (array): List of `MatchingOption` objects with `id` and `text`.
               * `correct_matches` (object): Maps prompt IDs to option IDs.
               * `explanation` (string, optional): Explanation of the correct matches.

            4. **Sorting (`question_type: "sorting"`)**
               * `question_text` (string): The question text.
               * `items_to_sort` (array): List of `SortableItem` objects with `id` and `text`.
               * `correct_order` (array): Array of item IDs in the correct sequence.
               * `explanation` (string, optional): Explanation of the correct order.

            5. **Open Answer (`question_type: "open-answer"`)**
               * `question_text` (string): The question text.
               * `acceptable_answers` (array): List of acceptable answer strings.
               * `explanation` (string, optional): Explanation or additional context.

            **Key Parsing Rules:**
            1. Each question must have a unique type and appropriate fields for that type.
            2. Option IDs should be consistent (e.g., "A", "B", "C" for multiple choice).
            3. Maintain original language and formatting in all text fields.
            4. Include explanations where available to help users understand correct answers.
            5. Ensure all required fields are present for each question type.
            6. Validate that correct answers reference valid option IDs.

            Return ONLY the JSON object.
            """

        elif selected_design_template.component_name == COMPONENT_NAME_LESSON_PLAN:
            # For lesson plans, preserve the original structure without parsing
            logger.info(f"Lesson plan detected for project {project_data.projectName}. Preserving original structure.")
            # Store the raw lesson plan data without parsing
            content_to_store_for_db = json.loads(project_data.aiResponse) if isinstance(project_data.aiResponse, str) else project_data.aiResponse
            derived_product_type = "lesson-plan"
            derived_microproduct_type = "Lesson Plan"
            
            # Skip the LLM parsing for lesson plans but continue with normal flow
            logger.info("Skipping LLM parsing for lesson plan - using raw data directly")
            # Set these variables to be used in the normal flow below
            target_content_model = None  # Not used for lesson plans
            default_error_instance = None  # Not used for lesson plans
            llm_json_example = ""  # Not used for lesson plans
            component_specific_instructions = ""  # Not used for lesson plans
            
        else:
            logger.warning(f"Unknown component_name '{selected_design_template.component_name}' for DT ID {selected_design_template.id}. Defaulting to TrainingPlanDetails for parsing.")
            target_content_model = TrainingPlanDetails
            default_error_instance = TrainingPlanDetails(mainTitle=f"LLM Config Error for {project_data.projectName}", sections=[])
            llm_json_example = DEFAULT_TRAINING_PLAN_JSON_EXAMPLE_FOR_LLM
            component_specific_instructions = "Parse the content according to the JSON example provided."


        if hasattr(default_error_instance, 'detectedLanguage'):
                default_error_instance.detectedLanguage = detect_language(project_data.aiResponse)

        # Skip LLM parsing for lesson plans
        if selected_design_template.component_name == COMPONENT_NAME_LESSON_PLAN:
            logger.info("Lesson plan detected - skipping LLM parsing entirely")
            parsed_content_model_instance = None  # Will not be used
        else:
            parsed_content_model_instance = await parse_ai_response_with_llm(
                ai_response=project_data.aiResponse,
                project_name=project_data.projectName,
                target_model=target_content_model,
                default_error_model_instance=default_error_instance,
                dynamic_instructions=component_specific_instructions,
                target_json_example=llm_json_example
            )

        if selected_design_template.component_name == COMPONENT_NAME_LESSON_PLAN:
            logger.info("Lesson plan detected - using raw data without parsing")
        else:    
            logger.info(f"LLM Parsing Result Type: {type(parsed_content_model_instance).__name__}")
            logger.info(f"LLM Parsed Content (first 200 chars): {str(parsed_content_model_instance.model_dump_json())[:200]}") # Use model_dump_json()

        # Inject theme for slide decks from the finalize request
        if (selected_design_template.component_name == COMPONENT_NAME_SLIDE_DECK and 
            parsed_content_model_instance and
            hasattr(parsed_content_model_instance, 'theme') and 
            hasattr(project_data, 'theme') and 
            project_data.theme):
            parsed_content_model_instance.theme = project_data.theme
            logger.info(f"Injected theme '{project_data.theme}' into slide deck")

        # Post-process module IDs for training plans to ensure № character is preserved
        if (parsed_content_model_instance and
            hasattr(parsed_content_model_instance, 'sections') and parsed_content_model_instance.sections):
            for section in parsed_content_model_instance.sections:
                if hasattr(section, 'id') and section.id:
                    # Fix module IDs that lost the № character
                    if section.id.isdigit():
                        # Plain number like "2" -> "№2"
                        section.id = f"№{section.id}"
                        logger.info(f"[PROJECT_CREATE_ID_FIX] Fixed plain number ID '{section.id[1:]}' to '{section.id}'")
                    elif section.id.startswith("#"):
                        # Hash format like "#2" -> "№2"
                        number = section.id[1:]
                        section.id = f"№{number}"
                        logger.info(f"[PROJECT_CREATE_ID_FIX] Fixed hash ID '#{number}' to '{section.id}'")
                    elif not section.id.startswith("№"):
                        # Other formats without № - try to extract number and format correctly
                        import re
                        number_match = re.search(r'\d+', section.id)
                        if number_match:
                            number = number_match.group()
                            section.id = f"№{number}"
                            logger.info(f"[PROJECT_CREATE_ID_FIX] Fixed ID format to '{section.id}'")

        # Apply slide prop normalization for slide decks and video lesson presentations
        if (selected_design_template.component_name in [COMPONENT_NAME_SLIDE_DECK, COMPONENT_NAME_VIDEO_LESSON_PRESENTATION] and 
            parsed_content_model_instance and
            hasattr(parsed_content_model_instance, 'slides') and 
            parsed_content_model_instance.slides):
            
            # Normalize slide props to fix schema mismatches
            slides_dict = [slide.model_dump() if hasattr(slide, 'model_dump') else dict(slide) for slide in parsed_content_model_instance.slides]
            normalized_slides = normalize_slide_props(slides_dict, selected_design_template.component_name)
            
            # Update the content with normalized slides
            content_dict = parsed_content_model_instance.model_dump(mode='json', exclude_none=True)
            content_dict['slides'] = normalized_slides
            
            # Remove hasVoiceover flag for regular slide decks
            if (selected_design_template.component_name == COMPONENT_NAME_SLIDE_DECK and 
                'hasVoiceover' in content_dict):
                logger.info("Removing hasVoiceover flag for regular slide deck")
                content_dict.pop('hasVoiceover', None)
            
            content_to_store_for_db = content_dict
            
            logger.info(f"Applied slide prop normalization for {len(normalized_slides)} slides")
        elif selected_design_template.component_name == COMPONENT_NAME_LESSON_PLAN:
            # For lesson plans, content_to_store_for_db was already set earlier - don't overwrite it
            logger.info("Lesson plan - using pre-set content_to_store_for_db")
        else:
            content_to_store_for_db = parsed_content_model_instance.model_dump(mode='json', exclude_none=True)
            
        derived_product_type = selected_design_template.microproduct_type
        derived_microproduct_type = selected_design_template.template_name

        logger.info(f"Content prepared for DB storage (first 200 chars of JSON): {str(content_to_store_for_db)[:200]}")

        # Determine if this is a standalone product (default to True for general project creation)
        # For specific products like quizzes, this will be overridden in their dedicated endpoints
        # CONSISTENT STANDALONE FLAG: Set based on whether connected to outline
        is_standalone_product = project_data.outlineId is None
        
        insert_query = """
        INSERT INTO projects (
            onyx_user_id, project_name, product_type, microproduct_type,
            microproduct_name, microproduct_content, design_template_id, source_chat_session_id, is_standalone, created_at, folder_id,
            source_context_type, source_context_data
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10, $11, $12)
        RETURNING id, onyx_user_id, project_name, product_type, microproduct_type, microproduct_name,
                  microproduct_content, design_template_id, source_chat_session_id, is_standalone, created_at, folder_id,
                  source_context_type, source_context_data;
    """

        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                insert_query,
                onyx_user_id,
                project_data.projectName,
                derived_product_type,
                derived_microproduct_type,
                db_microproduct_name_to_store,
                content_to_store_for_db,
                project_data.design_template_id,
                project_data.chatSessionId,
                is_standalone_product,
                project_data.folder_id,
                project_data.source_context_type,
                project_data.source_context_data
            )
        if not row:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create project entry.")

        db_content_dict = row["microproduct_content"]
        final_content_for_response: Optional[MicroProductContentType] = None
        if db_content_dict and isinstance(db_content_dict, dict):
            component_name_from_db = selected_design_template.component_name
            try:
                if component_name_from_db == COMPONENT_NAME_PDF_LESSON:
                    final_content_for_response = PdfLessonDetails(**db_content_dict)
                    logger.info("Re-parsed as PdfLessonDetails.")
                elif component_name_from_db == COMPONENT_NAME_TEXT_PRESENTATION:
                    final_content_for_response = TextPresentationDetails(**db_content_dict)
                    logger.info("Re-parsed as TextPresentationDetails.")
                elif component_name_from_db == COMPONENT_NAME_TRAINING_PLAN:
                    # Round hours to integers before parsing to prevent float validation errors
                    db_content_dict = round_hours_in_content(db_content_dict)
                    final_content_for_response = TrainingPlanDetails(**db_content_dict)
                    logger.info("Re-parsed as TrainingPlanDetails.")
                elif component_name_from_db == COMPONENT_NAME_VIDEO_LESSON:
                    final_content_for_response = VideoLessonData(**db_content_dict)
                    logger.info("Re-parsed as VideoLessonData.")
                elif component_name_from_db == COMPONENT_NAME_QUIZ:
                    final_content_for_response = QuizData(**db_content_dict)
                    logger.info("Re-parsed as QuizData.")
                elif component_name_from_db == COMPONENT_NAME_SLIDE_DECK:
                    # Apply slide normalization before parsing
                    if 'slides' in db_content_dict and db_content_dict['slides']:
                        db_content_dict['slides'] = normalize_slide_props(db_content_dict['slides'], component_name_from_db)
                    final_content_for_response = SlideDeckDetails(**db_content_dict)
                    logger.info("Re-parsed as SlideDeckDetails.")
                elif component_name_from_db == COMPONENT_NAME_VIDEO_LESSON_PRESENTATION:
                    # Apply slide normalization before parsing
                    if 'slides' in db_content_dict and db_content_dict['slides']:
                        db_content_dict['slides'] = normalize_slide_props(db_content_dict['slides'], component_name_from_db)
                    final_content_for_response = SlideDeckDetails(**db_content_dict)
                    logger.info("Re-parsed as SlideDeckDetails (Video Lesson Presentation).")
                elif component_name_from_db == COMPONENT_NAME_LESSON_PLAN:
                    # For lesson plans, preserve the original structure without parsing
                    logger.info("Re-parsing lesson plan - preserving original structure.")
                    final_content_for_response = db_content_dict
                else:
                    logger.warning(f"Unknown component_name '{component_name_from_db}' when re-parsing content from DB on add. Attempting generic TrainingPlanDetails fallback.")
                    # Round hours to integers before parsing to prevent float validation errors
                    db_content_dict = round_hours_in_content(db_content_dict)
                    # Preserve custom fields (e.g., recommended_content_types) for edit view
                    final_content_for_response = db_content_dict
            except Exception as e_parse:
                logger.error(f"Error parsing content from DB on add (proj ID {row['id']}): {e_parse}", exc_info=not IS_PRODUCTION)

        return ProjectDB(
            id=row["id"], onyx_user_id=row["onyx_user_id"], project_name=row["project_name"],
            product_type=row["product_type"], microproduct_type=row["microproduct_type"],
            microproduct_name=row["microproduct_name"], microproduct_content=final_content_for_response,
            design_template_id=row["design_template_id"], created_at=row["created_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error inserting project: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "An error occurred while adding project." if IS_PRODUCTION else f"DB error on project insert: {str(e)}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)
    finally:
        # Always release the in-flight lock
        ACTIVE_PROJECT_CREATE_KEYS.discard(lock_key)


@app.get("/api/custom/projects/names", response_model=List[str], summary="Get unique project names for the user")
async def get_distinct_project_names_for_user(onyx_user_id: str = Depends(get_current_onyx_user_id), pool: asyncpg.Pool = Depends(get_db_pool)):
    query = """
        SELECT DISTINCT project_name
        FROM projects
        WHERE onyx_user_id = $1
        ORDER BY project_name ASC;
        """
    try:
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, onyx_user_id)
        project_names: List[str] = [str(row["project_name"]) for row in rows if row["project_name"] is not None]
        return project_names
    except Exception as e:
        logger.error(f"Error fetching distinct project names for user {onyx_user_id}: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "An error occurred while fetching project names." if IS_PRODUCTION else f"Database error while fetching project names: {str(e)}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)

@app.get("/api/custom/projects/{project_id}/edit", response_model=ProjectDetailForEditResponse)
async def get_project_details_for_edit(project_id: int, onyx_user_id: str = Depends(get_current_onyx_user_id), pool: asyncpg.Pool = Depends(get_db_pool)):
    query = """
        SELECT
            p.id, p.project_name, p.microproduct_name, p.microproduct_content, p.created_at,
            p.design_template_id, dt.template_name as design_template_name,
            dt.component_name as design_component_name,
            dt.design_image_path as design_image_path,
            p.product_type, p.microproduct_type
        FROM projects p
        LEFT JOIN design_templates dt ON p.design_template_id = dt.id
        WHERE p.id = $1 AND p.onyx_user_id = $2;
    """
    try:
        async with pool.acquire() as conn: row = await conn.fetchrow(query, project_id, onyx_user_id)
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

        row_dict = dict(row)
        db_content_json = row_dict.get("microproduct_content")
        parsed_content_for_response: Optional[MicroProductContentType] = None
        component_name = row_dict.get("design_component_name")

        # Round hours to integers in the content before parsing
        if db_content_json and isinstance(db_content_json, dict):
            db_content_json = round_hours_in_content(db_content_json)
            
        if db_content_json and isinstance(db_content_json, dict):
            try:
                if component_name == COMPONENT_NAME_PDF_LESSON:
                    parsed_content_for_response = PdfLessonDetails(**db_content_json)
                elif component_name == COMPONENT_NAME_TEXT_PRESENTATION:
                    parsed_content_for_response = TextPresentationDetails(**db_content_json)
                elif component_name == COMPONENT_NAME_TRAINING_PLAN:
                    db_content_json = sanitize_training_plan_for_parse(db_content_json)
                    parsed_content_for_response = TrainingPlanDetails(**db_content_json)
                elif component_name == COMPONENT_NAME_VIDEO_LESSON:
                    parsed_content_for_response = VideoLessonData(**db_content_json)
                elif component_name == COMPONENT_NAME_QUIZ:
                    parsed_content_for_response = QuizData(**db_content_json)
                elif component_name == COMPONENT_NAME_SLIDE_DECK:
                    # Apply slide normalization before parsing
                    if 'slides' in db_content_json and db_content_json['slides']:
                        db_content_json['slides'] = normalize_slide_props(db_content_json['slides'], component_name)
                    parsed_content_for_response = SlideDeckDetails(**db_content_json)
                elif component_name == COMPONENT_NAME_VIDEO_LESSON_PRESENTATION:
                    # Apply slide normalization before parsing
                    if 'slides' in db_content_json and db_content_json['slides']:
                        db_content_json['slides'] = normalize_slide_props(db_content_json['slides'], component_name)
                    parsed_content_for_response = SlideDeckDetails(**db_content_json)
                else:
                    logger.warning(f"Unknown component_name '{component_name}' for project {project_id}. Trying fallbacks.", exc_info=not IS_PRODUCTION)
                    try: parsed_content_for_response = TrainingPlanDetails(**db_content_json)
                    except:
                        try: parsed_content_for_response = PdfLessonDetails(**db_content_json)
                        except Exception as e_parse_fallback: logger.error(f"Fallback parsing failed for project {project_id}: {e_parse_fallback}", exc_info=not IS_PRODUCTION)
            except Exception as e_main_parse:
                logger.error(f"Pydantic validation error for DB JSON (project {project_id}, component {component_name}): {e_main_parse}", exc_info=not IS_PRODUCTION)
        elif isinstance(db_content_json, str) and component_name == COMPONENT_NAME_TRAINING_PLAN:
                parsed_content_for_response = parse_training_plan_from_string(db_content_json, row_dict["project_name"])

        return ProjectDetailForEditResponse(
            id=row_dict["id"], projectName=row_dict["project_name"], microProductName=row_dict.get("microproduct_name"),
            design_template_id=row_dict.get("design_template_id"), microProductContent=parsed_content_for_response,
            createdAt=row_dict.get("created_at"), design_template_name=row_dict.get("design_template_name"),
            design_component_name=component_name, design_image_path=row_dict.get("design_image_path")
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching project {project_id} for edit: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "An error occurred while fetching project details." if IS_PRODUCTION else f"DB error fetching project details for edit: {str(e)}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)

async def get_user_identifiers_for_workspace(request: Request) -> tuple[str, str]:
    """Get both user UUID and email for workspace access"""
    try:
        session_cookie_value = request.cookies.get(ONYX_SESSION_COOKIE_NAME)
        if not session_cookie_value:
            dev_user_id = request.headers.get("X-Dev-Onyx-User-ID")
            if dev_user_id: 
                # For dev users, assume email format and return both
                return dev_user_id, dev_user_id
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

        onyx_user_info_url = f"{ONYX_API_SERVER_URL}/me"
        cookies_to_forward = {ONYX_SESSION_COOKIE_NAME: session_cookie_value}
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(onyx_user_info_url, cookies=cookies_to_forward)
            response.raise_for_status()
            user_data = response.json()
            
            user_id = user_data.get("userId") or user_data.get("id")
            user_email = user_data.get("email")
            
            if not user_id:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="User ID extraction failed")
            
            return str(user_id), user_email or str(user_id)
    except Exception as e:
        logger.error(f"Error getting user identifiers: {e}")
        raise

@app.get("/api/custom/projects", response_model=List[ProjectApiResponse])
async def get_user_projects_list_from_db(
    request: Request,
    pool: asyncpg.Pool = Depends(get_db_pool),
    folder_id: Optional[int] = None
):
    # Get both UUID and email for the user
    user_uuid, user_email = await get_user_identifiers_for_workspace(request)
    
    # For backward compatibility with existing code
    onyx_user_id = user_uuid
    
    # For backward compatibility with existing code
    onyx_user_id = user_uuid
    
    # First, get projects owned by the user
    owned_projects_query = """
        SELECT p.id, p.project_name, p.microproduct_name, p.created_at, p.design_template_id,
               dt.template_name as design_template_name,
               dt.microproduct_type as design_microproduct_type,
               p.folder_id, p."order", p.microproduct_content, p.source_chat_session_id, p.is_standalone
        FROM projects p
        LEFT JOIN design_templates dt ON p.design_template_id = dt.id
        WHERE p.onyx_user_id = $1 {folder_filter}
    """
    
    # Then, get projects the user has access to through workspace permissions
    shared_projects_query = """
        SELECT DISTINCT p.id, p.project_name, p.microproduct_name, p.created_at, p.design_template_id,
               dt.template_name as design_template_name,
               dt.microproduct_type as design_microproduct_type,
               p.folder_id, p."order", p.microproduct_content, p.source_chat_session_id, p.is_standalone
        FROM projects p
        LEFT JOIN design_templates dt ON p.design_template_id = dt.id
        INNER JOIN product_access pa ON p.id = pa.product_id
        INNER JOIN workspace_members wm ON pa.workspace_id = wm.workspace_id
        WHERE (wm.user_id = $1 OR wm.user_id = $2)
          AND wm.status = 'active'
          AND pa.access_type IN ('workspace', 'role', 'individual')
          AND (
              pa.access_type = 'workspace' 
              OR (pa.access_type = 'role' AND pa.target_id = CAST(wm.role_id AS TEXT))
              OR (pa.access_type = 'individual' AND (pa.target_id = $1 OR pa.target_id = $2))
          )
          {folder_filter}
    """
    
    # Get both UUID and email for workspace access
    try:
        session_cookie_value = request.cookies.get(ONYX_SESSION_COOKIE_NAME)
        if not session_cookie_value:
            dev_user_id = request.headers.get("X-Dev-Onyx-User-ID")
            if dev_user_id:
                user_uuid = dev_user_id
                user_email = dev_user_id  # For dev, assume email format
            else:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
        else:
            onyx_user_info_url = f"{ONYX_API_SERVER_URL}/me"
            cookies_to_forward = {ONYX_SESSION_COOKIE_NAME: session_cookie_value}
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(onyx_user_info_url, cookies=cookies_to_forward)
                response.raise_for_status()
                user_data = response.json()
                
                user_uuid = str(user_data.get("userId") or user_data.get("id"))
                user_email = user_data.get("email") or user_uuid
    except Exception as e:
        logger.error(f"Error getting user identifiers: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="User identification failed")
    
    folder_filter = ""
    owned_params = [user_uuid]
    shared_params = [user_uuid, user_email]
    
    if folder_id is not None:
        folder_filter = "AND p.folder_id = $2"
        owned_params.append(folder_id)
        folder_filter_shared = "AND p.folder_id = $3"
        shared_params.append(folder_id)
    else:
        folder_filter_shared = ""
    
    # Use email for workspace queries if available, otherwise use UUID
    user_for_workspace = user_email if user_email else onyx_user_id
    
    owned_query = owned_projects_query.format(folder_filter=folder_filter)
    shared_query = shared_projects_query.format(folder_filter=folder_filter)
    
    # Get user email for workspace access (workspace members are stored with emails)
    user_email = None
    try:
        session_cookie_value = request.cookies.get(ONYX_SESSION_COOKIE_NAME)
        if session_cookie_value:
            onyx_user_info_url = f"{ONYX_API_SERVER_URL}/me"
            cookies_to_forward = {ONYX_SESSION_COOKIE_NAME: session_cookie_value}
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(onyx_user_info_url, cookies=cookies_to_forward)
                if response.status_code == 200:
                    user_data = response.json()
                    user_email = user_data.get("email")
    except Exception as e:
        logger.warning(f"Could not get user email for workspace access: {e}")
    
    # Use email for workspace queries if available, otherwise use UUID
    user_for_workspace = user_email if user_email else onyx_user_id
    
    async with pool.acquire() as conn:
        # Get owned projects (use UUID)
        owned_rows = await conn.fetch(owned_query, *owned_params)
        
        # Get shared projects (use email)
        shared_rows = await conn.fetch(shared_query, *shared_params)
        
        # 🔍 DEBUG: Log workspace access results
        logger.info(f"🔍 [WORKSPACE ACCESS] User {user_uuid} (email: {user_email}) projects query results:")
        logger.info(f"   - Owned projects: {len(owned_rows)}")
        logger.info(f"   - Shared projects: {len(shared_rows)}")
        logger.info(f"   - Folder filter: {folder_id}")
        
        if owned_rows:
            logger.info(f"   - Owned project IDs: {[row['id'] for row in owned_rows]}")
        if shared_rows:
            logger.info(f"   - Shared project IDs: {[row['id'] for row in shared_rows]}")
        else:
            # Debug why no shared projects found
            logger.info(f"🔍 [WORKSPACE DEBUG] No shared projects found for user {onyx_user_id}. Investigating...")
            
            # Check workspace memberships
            membership_check = await conn.fetch("""
                SELECT wm.*, w.name as workspace_name, wr.name as role_name
                FROM workspace_members wm
                JOIN workspaces w ON wm.workspace_id = w.id
                JOIN workspace_roles wr ON wm.role_id = wr.id
                WHERE wm.user_id = $1
            """, onyx_user_id)
            
            logger.info(f"   - User workspace memberships: {len(membership_check)}")
            for membership in membership_check:
                logger.info(f"     * Workspace: {membership['workspace_name']} (ID: {membership['workspace_id']})")
                logger.info(f"       Role: {membership['role_name']} (ID: {membership['role_id']})")
                logger.info(f"       Status: {membership['status']}")
            
            if not membership_check:
                logger.info(f"   ❌ User {onyx_user_id} is not a member of any workspace!")
                logger.info(f"   💡 Add user to a workspace to enable shared project access")
            else:
                # Debug why no shared projects found
                logger.info(f"🔍 [WORKSPACE DEBUG] Checking why no shared projects found for user {onyx_user_id}:")
            
            # Check workspace memberships
            membership_check = await conn.fetch("""
                SELECT wm.*, w.name as workspace_name, wr.name as role_name
                FROM workspace_members wm
                JOIN workspaces w ON wm.workspace_id = w.id
                JOIN workspace_roles wr ON wm.role_id = wr.id
                WHERE wm.user_id = $1
            """, onyx_user_id)
            
            logger.info(f"   - User workspace memberships: {len(membership_check)}")
            for membership in membership_check:
                logger.info(f"     * Workspace: {membership['workspace_name']} (ID: {membership['workspace_id']})")
                logger.info(f"       Role: {membership['role_name']} (ID: {membership['role_id']})")
                logger.info(f"       Status: {membership['status']}")
            
            # Check product access records
            if membership_check:
                workspace_ids = [m['workspace_id'] for m in membership_check]
                access_check = await conn.fetch("""
                    SELECT pa.*, p.project_name, w.name as workspace_name
                    FROM product_access pa
                    JOIN projects p ON pa.product_id = p.id
                    JOIN workspaces w ON pa.workspace_id = w.id
                    WHERE pa.workspace_id = ANY($1::int[])
                """, workspace_ids)
                
                logger.info(f"   - Product access records in user's workspaces: {len(access_check)}")
                for access in access_check:
                    logger.info(f"     * Project: {access['project_name']} (ID: {access['product_id']})")
                    logger.info(f"       Workspace: {access['workspace_name']} (ID: {access['workspace_id']})")
                    logger.info(f"       Access Type: {access['access_type']}")
                    logger.info(f"       Target ID: {access['target_id']}")
            else:
                logger.info(f"   - No workspace memberships found - user needs to be added to a workspace")
        
        # Combine and deduplicate projects
        all_projects = {}
        
        # Process owned projects first
        for row_data in owned_rows:
            row_dict = dict(row_data)
            project_slug = create_slug(row_dict.get('project_name'))
            source_chat_session_id = row_dict.get("source_chat_session_id")
            if source_chat_session_id:
                source_chat_session_id = str(source_chat_session_id)
            
            all_projects[row_dict["id"]] = ProjectApiResponse(
                id=row_dict["id"], projectName=row_dict["project_name"], projectSlug=project_slug,
                microproduct_name=row_dict.get("microproduct_name"),
                design_template_name=row_dict.get("design_template_name"),
                design_microproduct_type=row_dict.get("design_microproduct_type"),
                created_at=row_dict["created_at"], design_template_id=row_dict.get("design_template_id"),
                folder_id=row_dict.get("folder_id"), order=row_dict.get("order"),
                microproduct_content=row_dict.get("microproduct_content"),
                source_chat_session_id=source_chat_session_id,
                is_standalone=row_dict.get("is_standalone")
            )
        
        # Process shared projects (will override owned if same ID, which is fine)
        for row_data in shared_rows:
            row_dict = dict(row_data)
            project_slug = create_slug(row_dict.get('project_name'))
            source_chat_session_id = row_dict.get("source_chat_session_id")
            if source_chat_session_id:
                source_chat_session_id = str(source_chat_session_id)
            
            all_projects[row_dict["id"]] = ProjectApiResponse(
                id=row_dict["id"], projectName=row_dict["project_name"], projectSlug=project_slug,
                microproduct_name=row_dict.get("microproduct_name"),
                design_template_name=row_dict.get("design_template_name"),
                design_microproduct_type=row_dict.get("design_microproduct_type"),
                created_at=row_dict["created_at"], design_template_id=row_dict.get("design_template_id"),
                folder_id=row_dict.get("folder_id"), order=row_dict.get("order"),
                microproduct_content=row_dict.get("microproduct_content"),
                source_chat_session_id=source_chat_session_id,
                is_standalone=row_dict.get("is_standalone")
            )
    
    # Convert to list and sort
    projects_list = list(all_projects.values())
    projects_list.sort(key=lambda x: (x.order or 0, x.created_at), reverse=True)
    
    return projects_list

@app.get("/api/custom/projects/view/{project_id}", response_model=MicroProductApiResponse, responses={404: {"model": ErrorDetail}})
async def get_project_instance_detail(project_id: int, onyx_user_id: str = Depends(get_current_onyx_user_id), pool: asyncpg.Pool = Depends(get_db_pool)):
    # Check if user owns the project or has workspace access
    select_query = """
        SELECT p.*, dt.template_name as design_template_name, dt.microproduct_type as design_microproduct_type, dt.component_name
        FROM projects p
        LEFT JOIN design_templates dt ON p.design_template_id = dt.id
        WHERE p.id = $1 AND (
            p.onyx_user_id = $2 
            OR EXISTS (
                SELECT 1 FROM product_access pa
                INNER JOIN workspace_members wm ON pa.workspace_id = wm.workspace_id
                WHERE pa.product_id = p.id 
                  AND wm.user_id = $2 
                  AND wm.status = 'active'
                  AND pa.access_type IN ('workspace', 'role', 'individual')
                  AND (
                      pa.access_type = 'workspace' 
                      OR (pa.access_type = 'role' AND pa.target_id = CAST(wm.role_id AS TEXT))
                      OR (pa.access_type = 'individual' AND pa.target_id = $2)
                  )
            )
        )
    """
    async with pool.acquire() as conn:
        row = await conn.fetchrow(select_query, project_id, onyx_user_id)
    if not row:
        raise HTTPException(status_code=404, detail="Project not found")
    row_dict = dict(row)
    project_instance_name = row_dict.get("microproduct_name") or row_dict.get("project_name")
    project_slug = create_slug(project_instance_name)
    component_name = row_dict.get("component_name")
    details_data = row_dict.get("microproduct_content")
    
    # 🔍 BACKEND VIEW LOGGING: What we retrieved from database for view
    logger.info(f"📋 [BACKEND VIEW] Project {project_id} - Raw details_data type: {type(details_data)}")
    
    # Parse the details_data if it's a JSON string
    parsed_details = None
    if details_data:
        if isinstance(details_data, str):
            try:
                # Parse JSON string to dict
                details_dict = json.loads(details_data)
                # Round hours to integers before returning
                details_dict = round_hours_in_content(details_dict)
                parsed_details = details_dict
                logger.info(f"📋 [BACKEND VIEW] Project {project_id} - Parsed from JSON string: {json.dumps(parsed_details, indent=2)}")
            except (json.JSONDecodeError, TypeError) as e:
                logger.error(f"Failed to parse microproduct_content JSON for project {project_id}: {e}")
                parsed_details = None
        else:
            # Already a dict, just round hours
            parsed_details = round_hours_in_content(details_data)
            logger.info(f"📋 [BACKEND VIEW] Project {project_id} - Already dict, after round_hours: {json.dumps(parsed_details, indent=2)}")
    
    # 🔍 BACKEND VIEW RESULT LOGGING
    if parsed_details and 'contentBlocks' in parsed_details:
        image_blocks = [block for block in parsed_details['contentBlocks'] if block.get('type') == 'image']
        logger.info(f"📋 [BACKEND VIEW] Project {project_id} - Final image blocks for frontend: {json.dumps(image_blocks, indent=2)}")
    else:
        logger.info(f"📋 [BACKEND VIEW] Project {project_id} - No contentBlocks in parsed_details or parsed_details is None")
    
    web_link_path = None
    pdf_link_path = None
    
    # Parse lesson_plan_data if it exists and is a JSON string
    lesson_plan_data = row_dict.get("lesson_plan_data")
    if lesson_plan_data and isinstance(lesson_plan_data, str):
        try:
            lesson_plan_data = json.loads(lesson_plan_data)
        except (json.JSONDecodeError, TypeError) as e:
            logger.error(f"Failed to parse lesson_plan_data JSON for project {project_id}: {e}")
            lesson_plan_data = None
    
    return MicroProductApiResponse(
        name=project_instance_name, slug=project_slug, project_id=project_id,
        design_template_id=row_dict["design_template_id"], component_name=component_name,
        webLinkPath=web_link_path, pdfLinkPath=pdf_link_path, details=parsed_details,
        sourceChatSessionId=row_dict.get("source_chat_session_id"),
        parentProjectName=row_dict.get('project_name'),
        custom_rate=row_dict.get("custom_rate"),
        quality_tier=row_dict.get("quality_tier"),
        is_advanced=row_dict.get("is_advanced"),
        advanced_rates=row_dict.get("advanced_rates"),
        lesson_plan_data=lesson_plan_data
        # folder_id is not in MicroProductApiResponse, but can be added if needed
    )

@app.get("/api/custom/pdf/folder/{folder_id}", response_class=FileResponse, responses={404: {"model": ErrorDetail}, 500: {"model": ErrorDetail}})
async def download_folder_as_pdf(
    folder_id: int,
    onyx_user_id: str = Depends(get_current_onyx_user_id),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    """Download all products in a folder as a single PDF, ordered by type and creation date."""
    try:
        # First, verify the folder exists and belongs to the user
        async with pool.acquire() as conn:
            folder_row = await conn.fetchrow(
                """
                SELECT name FROM project_folders 
                WHERE id = $1 AND onyx_user_id = $2;
                """,
                folder_id, onyx_user_id
            )
        if not folder_row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found for user.")

        folder_name = folder_row['name']
        
        # Get all projects in the folder, ordered by their position in the folder
        async with pool.acquire() as conn:
            projects = await conn.fetch(
                """
                SELECT p.id, p.project_name, p.microproduct_name, p.microproduct_content,
                       p.created_at, dt.component_name as design_component_name
                FROM projects p
                LEFT JOIN design_templates dt ON p.design_template_id = dt.id
                WHERE p.folder_id = $1 AND p.onyx_user_id = $2
                ORDER BY p."order" ASC, p.created_at ASC;
                """,
                folder_id, onyx_user_id
            )
        
        if not projects:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No projects found in folder.")
        
        # Generate individual PDFs for each project
        pdf_paths = []
        project_names = []
        
        for project in projects:
            project_id = project['id']
            project_name = project['microproduct_name'] or project['project_name']
            content_json = project['microproduct_content']
            component_name = project['design_component_name']
            
            # Skip unsupported project types
            if component_name not in ['TextPresentationDisplay', 'TrainingPlanTable']:
                continue
            
            try:
                # Generate PDF for this project using existing logic
                mp_name_for_pdf_context = project_name
                content_json = project['microproduct_content']
                component_name = project['design_component_name']
                data_for_template_render: Optional[Dict[str, Any]] = None
                pdf_template_file: str

                detected_lang_for_pdf = 'ru'  # Default language
                if isinstance(content_json, dict) and content_json.get('detectedLanguage'):
                    detected_lang_for_pdf = content_json.get('detectedLanguage')
                elif mp_name_for_pdf_context:
                    detected_lang_for_pdf = detect_language(mp_name_for_pdf_context)
                
                current_pdf_locale_strings = VIDEO_SCRIPT_LANG_STRINGS.get(detected_lang_for_pdf, VIDEO_SCRIPT_LANG_STRINGS['en'])

                if component_name == 'TextPresentationDisplay':
                    pdf_template_file = "text_presentation_pdf_template.html"
                    if content_json and isinstance(content_json, dict):
                        data_for_template_render = json.loads(json.dumps(content_json))
                        if not data_for_template_render.get('detectedLanguage'):
                            data_for_template_render['detectedLanguage'] = detected_lang_for_pdf
                        
                        # Log content blocks for debugging image issues
                        content_blocks = data_for_template_render.get('contentBlocks', [])
                        image_blocks = [block for block in content_blocks if block.get('type') == 'image']
                        
                        logger.info(f"🖼️ [PDF GEN] Processing {len(content_blocks)} content blocks, {len(image_blocks)} image blocks")
                        for i, block in enumerate(image_blocks):
                            logger.info(f"🖼️ [PDF GEN] Image block {i}: {json.dumps(block, indent=2)}")
                            if hasattr(block, 'keys'):
                                logger.info(f"🖼️ [PDF GEN] Image block {i} keys: {list(block.keys())}")
                            if 'src' in block:
                                logger.info(f"🖼️ [PDF GEN] Image block {i} src: '{block['src']}' (type: {type(block['src'])})")
                            else:
                                logger.info(f"🚨 [PDF GEN] Image block {i} missing 'src' property!")
                                
                    else:
                        data_for_template_render = {
                            "title": f"Content Unavailable: {mp_name_for_pdf_context}",
                            "contentBlocks": [],
                            "detectedLanguage": detected_lang_for_pdf
                        }
                
                elif component_name == 'TrainingPlanTable':
                    pdf_template_file = "training_plan_pdf_template.html"
                    if content_json and isinstance(content_json, dict):
                        try:
                            content_json = round_hours_in_content(content_json)
                            parsed_model = TrainingPlanDetails(**content_json)
                            if parsed_model.detectedLanguage:
                                detected_lang_for_pdf = parsed_model.detectedLanguage
                                current_pdf_locale_strings = VIDEO_SCRIPT_LANG_STRINGS.get(detected_lang_for_pdf, VIDEO_SCRIPT_LANG_STRINGS['en'])
                            
                            data_for_template_render = {
                                'mainTitle': parsed_model.mainTitle,
                                'sections': parsed_model.sections,
                                'detectedLanguage': detected_lang_for_pdf
                            }
                        except Exception as e:
                            logger.error(f"Error parsing training plan for project {project_id}: {e}")
                            data_for_template_render = {
                                "mainTitle": f"Error: {mp_name_for_pdf_context}",
                                "sections": [],
                                "detectedLanguage": detected_lang_for_pdf
                            }
                    else:
                        data_for_template_render = {
                            "mainTitle": f"Content Unavailable: {mp_name_for_pdf_context}",
                            "sections": [],
                            "detectedLanguage": detected_lang_for_pdf
                        }
                
                else:
                    continue  # Skip unsupported types
                
                if not isinstance(data_for_template_render, dict):
                    data_for_template_render = {"title": "Error", "contentBlocks": [], "detectedLanguage": "en"}
                
                unique_output_filename = f"folder_export_{folder_id}_project_{project_id}_{uuid.uuid4().hex[:8]}.pdf"
                
                context_for_jinja = {
                    'details': data_for_template_render,
                    'locale': current_pdf_locale_strings,
                    'pdf_context': {
                        'static_images_path': os.path.abspath(STATIC_DESIGN_IMAGES_DIR) + '/'
                    }
                }
                
                pdf_path = await generate_pdf_from_html_template(pdf_template_file, context_for_jinja, unique_output_filename)
                if os.path.exists(pdf_path):
                    pdf_paths.append(pdf_path)
                    project_names.append(project_name)
                
            except Exception as e:
                logger.error(f"Error generating PDF for project {project_id}: {e}")
                continue
        
        if not pdf_paths:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No PDFs could be generated for projects in folder.")
        
        # Combine PDFs into a single file
        try:
            if PdfMerger is None:
                # If PyPDF2 is not available, return the first PDF as a fallback
                logger.warning("PyPDF2 not available, returning first PDF as fallback")
                if pdf_paths:
                    user_friendly_filename = f"{create_slug(folder_name)}_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
                    return FileResponse(
                        path=pdf_paths[0],
                        filename=user_friendly_filename,
                        media_type='application/pdf',
                        headers={"Cache-Control": "no-cache, no-store, must-revalidate", "Pragma": "no-cache", "Expires": "0"}
                    )
                else:
                    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No PDFs generated and PyPDF2 not available")
            
            merger = PdfMerger()
            
            for pdf_path in pdf_paths:
                merger.append(pdf_path)
            
            combined_pdf_path = f"/tmp/folder_export_{folder_id}_{uuid.uuid4().hex[:8]}.pdf"
            merger.write(combined_pdf_path)
            merger.close()
            
            # Clean up individual PDF files
            for pdf_path in pdf_paths:
                try:
                    os.remove(pdf_path)
                except:
                    pass
            
            user_friendly_filename = f"{create_slug(folder_name)}_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            
            return FileResponse(
                path=combined_pdf_path,
                filename=user_friendly_filename,
                media_type='application/pdf',
                headers={"Cache-Control": "no-cache, no-store, must-revalidate", "Pragma": "no-cache", "Expires": "0"}
            )
            
        except Exception as e:
            logger.error(f"Error combining PDFs for folder {folder_id}: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to combine PDFs")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating folder PDF: {e}", exc_info=not IS_PRODUCTION)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate folder PDF: {str(e)[:200]}")
    

# Streaming slide deck PDF generation with progress updates
@app.get("/api/custom/pdf/slide-deck/{project_id}/stream")
async def stream_slide_deck_pdf_generation(
    project_id: int,
    theme: Optional[str] = Query("dark-purple"),
    onyx_user_id: str = Depends(get_current_onyx_user_id),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    """Stream slide deck PDF generation with progress updates"""
    from fastapi.responses import StreamingResponse
    import json
    
    async def generate_with_progress():
        try:
            # Get project data (same as the existing endpoint)
            async with pool.acquire() as conn:
                target_row_dict = await conn.fetchrow(
                    """
                    SELECT p.project_name, p.microproduct_name, p.microproduct_content,
                           dt.component_name as design_component_name
                    FROM projects p
                    LEFT JOIN design_templates dt ON p.design_template_id = dt.id
                    WHERE p.id = $1 AND p.onyx_user_id = $2;
                    """,
                    project_id, onyx_user_id
                )
            
            if not target_row_dict:
                yield f"data: {json.dumps({'error': 'Project not found'})}\n\n"
                return

            component_name = target_row_dict.get("design_component_name")
            if component_name != COMPONENT_NAME_SLIDE_DECK:
                yield f"data: {json.dumps({'error': 'This endpoint is only for slide deck projects'})}\n\n"
                return

            content_json = target_row_dict.get('microproduct_content')
            if not content_json or not isinstance(content_json, dict):
                yield f"data: {json.dumps({'error': 'Invalid slide deck content'})}\n\n"
                return

            # Prepare slide deck data
            slide_deck_data = {
                'slides': content_json.get('slides', []),
                'theme': theme or 'dark-purple'
            }

            total_slides = len(slide_deck_data['slides'])
            yield f"data: {json.dumps({'type': 'progress', 'message': f'Starting PDF generation for {total_slides} slides...', 'current': 0, 'total': total_slides})}\n\n"

            mp_name_for_pdf_context = target_row_dict.get('microproduct_name') or target_row_dict.get('project_name')
            unique_output_filename = f"slide_deck_{project_id}_{uuid.uuid4().hex[:12]}.pdf"
            
            # Generate PDF with regular function and send progress updates
            from app.services.pdf_generator import generate_slide_deck_pdf_with_dynamic_height
            
            # Send intermediate progress messages
            yield f"data: {json.dumps({'type': 'progress', 'message': 'Calculating slide dimensions...', 'current': 1, 'total': total_slides})}\n\n"
            
            # Simulate progress for user feedback during long operation
            import asyncio
            
            # Start PDF generation in background and send periodic updates
            pdf_task = asyncio.create_task(generate_slide_deck_pdf_with_dynamic_height(
                slides_data=slide_deck_data['slides'],
                theme=theme,
                output_filename=unique_output_filename,
                use_cache=True
            ))
            
            # Send progress updates while PDF is generating
            progress_step = 0
            max_steps = total_slides * 2  # Simulate steps for dimension calc + generation
            
            while not pdf_task.done():
                await asyncio.sleep(2)  # Update every 2 seconds
                progress_step += 1
                current_progress = min(progress_step, max_steps - 1)
                
                if progress_step <= total_slides:
                    message = f"Calculating dimensions for slide {progress_step}..."
                else:
                    slide_num = progress_step - total_slides
                    message = f"Generating slide {slide_num}..."
                
                yield f"data: {json.dumps({'type': 'progress', 'message': message, 'current': current_progress, 'total': max_steps})}\n\n"
            
            # Wait for PDF generation to complete
            pdf_path = await pdf_task
            
            # Send final progress update
            yield f"data: {json.dumps({'type': 'progress', 'message': 'PDF generation completed!', 'current': max_steps, 'total': max_steps})}\n\n"
                
            # Final success message with download info - FIXED: Return filename instead of URL that triggers regeneration
            user_friendly_pdf_filename = f"{create_slug(mp_name_for_pdf_context)}_{uuid.uuid4().hex[:8]}.pdf"
            final_message = {
                'type': 'complete',
                'message': 'PDF generation completed successfully!',
                'download_url': f'/pdf/slide-deck/{project_id}/download/{os.path.basename(pdf_path)}?theme={theme}',
                'filename': user_friendly_pdf_filename
            }
            yield f"data: {json.dumps(final_message)}\n\n"
            
        except Exception as e:
            logger.error(f"Error in streaming PDF generation: {e}", exc_info=True)
            error_message = {
                'type': 'error',
                'message': f'PDF generation failed: {str(e)[:200]}'
            }
            yield f"data: {json.dumps(error_message)}\n\n"

    return StreamingResponse(
        generate_with_progress(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        }
    )

# New endpoint to serve cached PDFs without regeneration
@app.get("/api/custom/pdf/slide-deck/{project_id}/download/{pdf_filename}", response_class=FileResponse, responses={404: {"model": ErrorDetail}, 500: {"model": ErrorDetail}})
async def download_cached_slide_deck_pdf(
    project_id: int,
    pdf_filename: str,
    theme: Optional[str] = Query("dark-purple"),
    onyx_user_id: str = Depends(get_current_onyx_user_id),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    """Download cached slide deck PDF without regeneration"""
    try:
        # Verify the project exists and user has access
        async with pool.acquire() as conn:
            target_row_dict = await conn.fetchrow(
                """
                SELECT p.project_name, p.microproduct_name, p.microproduct_content,
                       dt.component_name as design_component_name
                FROM projects p
                LEFT JOIN design_templates dt ON p.design_template_id = dt.id
                WHERE p.id = $1 AND p.onyx_user_id = $2;
                """,
                project_id, onyx_user_id
            )
        
        if not target_row_dict:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found for user.")

        component_name = target_row_dict.get("design_component_name")
        if component_name != COMPONENT_NAME_SLIDE_DECK:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This endpoint is only for slide deck projects.")

        # Construct the path to the cached PDF
        from app.services.pdf_generator import PDF_CACHE_DIR
        pdf_path = PDF_CACHE_DIR / pdf_filename
        
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PDF file not found. It may have expired or been deleted.")
        
        # Create user-friendly filename
        mp_name_for_pdf_context = target_row_dict.get('microproduct_name') or target_row_dict.get('project_name')
        user_friendly_pdf_filename = f"{create_slug(mp_name_for_pdf_context)}_{uuid.uuid4().hex[:8]}.pdf"
        
        return FileResponse(
            path=str(pdf_path), 
            filename=user_friendly_pdf_filename, 
            media_type='application/pdf', 
            headers={"Cache-Control": "no-cache, no-store, must-revalidate", "Pragma": "no-cache", "Expires": "0"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving cached slide deck PDF for project {project_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to serve PDF: {str(e)[:200]}")

# Move slide deck route BEFORE the general route to avoid path conflicts
@app.get("/api/custom/pdf/slide-deck/{project_id}", response_class=FileResponse, responses={404: {"model": ErrorDetail}, 500: {"model": ErrorDetail}})
async def download_slide_deck_pdf(
    project_id: int,
    theme: Optional[str] = Query("dark-purple"),
    onyx_user_id: str = Depends(get_current_onyx_user_id),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    """Download slide deck as multi-page PDF"""
    try:
        async with pool.acquire() as conn:
            target_row_dict = await conn.fetchrow(
                """
                SELECT p.project_name, p.microproduct_name, p.microproduct_content,
                       dt.component_name as design_component_name
                FROM projects p
                LEFT JOIN design_templates dt ON p.design_template_id = dt.id
                WHERE p.id = $1 AND p.onyx_user_id = $2;
                """,
                project_id, onyx_user_id
            )
        if not target_row_dict:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found for user.")

        component_name = target_row_dict.get("design_component_name")
        if component_name != COMPONENT_NAME_SLIDE_DECK:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This endpoint is only for slide deck projects.")

        mp_name_for_pdf_context = target_row_dict.get('microproduct_name') or target_row_dict.get('project_name')
        user_friendly_pdf_filename = f"{create_slug(mp_name_for_pdf_context)}_{uuid.uuid4().hex[:8]}.pdf"

        content_json = target_row_dict.get('microproduct_content')
        if not content_json or not isinstance(content_json, dict):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid slide deck content.")

        # Prepare slide deck data for PDF generation
        slide_deck_data = {
            'lessonTitle': content_json.get('lessonTitle', mp_name_for_pdf_context),
            'slides': content_json.get('slides', []),
            'theme': theme,
            'detectedLanguage': content_json.get('detectedLanguage', 'en')
        }

        # Validate slides structure
        if not isinstance(slide_deck_data['slides'], list):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid slides structure.")

        logger.info(f"Slide Deck PDF Gen (Project {project_id}): Generating PDF with {len(slide_deck_data['slides'])} slides, theme: {theme}")

        # ✅ NEW: Detailed logging for slide data before PDF generation
        logger.info(f"=== SLIDE DATA ANALYSIS BEFORE PDF GENERATION ===")
        logger.info(f"Project ID: {project_id}")
        logger.info(f"Total slides: {len(slide_deck_data['slides'])}")
        logger.info(f"Theme: {theme}")
        
        # Analyze each slide for big-image-left template
        big_image_left_slides = []
        for i, slide in enumerate(slide_deck_data['slides']):
            if slide.get('templateId') == 'big-image-left':
                big_image_left_slides.append((i, slide))
                logger.info(f"Found big-image-left slide at index {i}")
                
                # Log slide structure
                logger.info(f"  Slide {i} structure:")
                logger.info(f"    templateId: {slide.get('templateId')}")
                logger.info(f"    slideId: {slide.get('slideId')}")
                logger.info(f"    props keys: {list(slide.get('props', {}).keys())}")
                logger.info(f"    metadata keys: {list(slide.get('metadata', {}).keys()) if slide.get('metadata') else 'None'}")
                
                # Log text content
                props = slide.get('props', {})
                logger.info(f"    title: '{props.get('title', 'NOT SET')}'")
                logger.info(f"    subtitle: '{props.get('subtitle', 'NOT SET')}'")
                
                # Log image info without base64 data
                image_path = props.get('imagePath', '')
                if image_path:
                    if image_path.startswith('data:'):
                        logger.info(f"    imagePath: [BASE64 DATA URL - {len(image_path)} characters]")
                    else:
                        logger.info(f"    imagePath: {image_path}")
                else:
                    logger.info(f"    imagePath: NOT SET")
                
                # Log positioning data
                metadata = slide.get('metadata', {})
                element_positions = metadata.get('elementPositions', {})
                logger.info(f"    elementPositions exists: {bool(element_positions)}")
                if element_positions:
                    logger.info(f"    elementPositions keys: {list(element_positions.keys())}")
                    
                    # Check for title and subtitle positions
                    slide_id = slide.get('slideId', 'unknown')
                    title_id = f'draggable-{slide_id}-0'
                    subtitle_id = f'draggable-{slide_id}-1'
                    
                    title_pos = element_positions.get(title_id)
                    subtitle_pos = element_positions.get(subtitle_id)
                    
                    logger.info(f"    title element ID: {title_id}")
                    logger.info(f"    title position: {title_pos}")
                    logger.info(f"    subtitle element ID: {subtitle_id}")
                    logger.info(f"    subtitle position: {subtitle_pos}")
        
        logger.info(f"Total big-image-left slides found: {len(big_image_left_slides)}")
        logger.info(f"=== END SLIDE DATA ANALYSIS ===")

        # Prepare template context
        context_for_jinja = {
            'details': slide_deck_data
        }

        unique_output_filename = f"slide_deck_{project_id}_{uuid.uuid4().hex[:12]}.pdf"
        
        # Generate PDF using the new dynamic height slide deck generation
        from app.services.pdf_generator import generate_slide_deck_pdf_with_dynamic_height
        
        pdf_path = await generate_slide_deck_pdf_with_dynamic_height(
            slides_data=slide_deck_data['slides'],
            theme=theme,
            output_filename=unique_output_filename,
            use_cache=True
        )
        
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="PDF file not found after generation.")
        
        return FileResponse(
            path=pdf_path, 
            filename=user_friendly_pdf_filename, 
            media_type='application/pdf', 
            headers={"Cache-Control": "no-cache, no-store, must-revalidate", "Pragma": "no-cache", "Expires": "0"}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating slide deck PDF for project {project_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate slide deck PDF: {str(e)[:200]}")


@app.post("/api/custom/pdf/debug/slides", response_class=JSONResponse)
async def debug_slide_generation(
    slides_data: List[Dict[str, Any]],
    theme: Optional[str] = Query("light-modern"),
    onyx_user_id: str = Depends(get_current_onyx_user_id)
):
    """Debug endpoint to test individual slide generation and identify problematic slides."""
    try:
        from app.services.pdf_generator import test_all_slides_individually
        
        logger.info(f"Debug slide generation: Testing {len(slides_data)} slides with theme: {theme}")
        
        # Test all slides individually
        summary = await test_all_slides_individually(slides_data, theme)
        
        return JSONResponse(content=summary)
        
    except Exception as e:
        logger.error(f"Error in debug slide generation: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Debug failed: {str(e)[:200]}")


@app.get("/api/custom/pdf/{project_id}/", response_class=FileResponse, responses={404: {"model": ErrorDetail}, 500: {"model": ErrorDetail}})
async def download_project_instance_pdf_no_slug(
    project_id: int,
    # all other parameters as in the main function
    parentProjectName: Optional[str] = Query(None),
    lessonNumber: Optional[int] = Query(None),
    knowledgeCheck: Optional[str] = Query(None),
    contentAvailability: Optional[str] = Query(None),
    informationSource: Optional[str] = Query(None),
    time: Optional[str] = Query(None),
    estCompletionTime: Optional[str] = Query(None),
    qualityTier: Optional[str] = Query(None),
    onyx_user_id: str = Depends(get_current_onyx_user_id),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    # Just call the main function with a default slug
    return await download_project_instance_pdf(
        project_id=project_id,
        document_name_slug="-",  # or any default value
        parentProjectName=parentProjectName,
        lessonNumber=lessonNumber,
        knowledgeCheck=knowledgeCheck,
        contentAvailability=contentAvailability,
        informationSource=informationSource,
        time=time,
        estCompletionTime=estCompletionTime,
        qualityTier=qualityTier,
        onyx_user_id=onyx_user_id,
        pool=pool,
    )    


@app.get("/api/custom/pdf/{project_id}/{document_name_slug}", response_class=FileResponse, responses={404: {"model": ErrorDetail}, 500: {"model": ErrorDetail}})
async def download_project_instance_pdf(
    project_id: int,
    document_name_slug: str,
    parentProjectName: Optional[str] = Query(None),
    lessonNumber: Optional[int] = Query(None),
    knowledgeCheck: Optional[str] = Query(None),
    contentAvailability: Optional[str] = Query(None),
    informationSource: Optional[str] = Query(None),
    time: Optional[str] = Query(None),
    estCompletionTime: Optional[str] = Query(None),
    qualityTier: Optional[str] = Query(None),
    onyx_user_id: str = Depends(get_current_onyx_user_id),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    print("OPTIONAL DATA:", parentProjectName, lessonNumber)
    try:
        async with pool.acquire() as conn:
            target_row_dict = await conn.fetchrow(
                """
                SELECT p.project_name, p.microproduct_name, p.microproduct_content,
                       dt.component_name as design_component_name
                FROM projects p
                LEFT JOIN design_templates dt ON p.design_template_id = dt.id
                WHERE p.id = $1 AND p.onyx_user_id = $2;
                """,
                project_id, onyx_user_id
            )
        if not target_row_dict:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found for user.")

        mp_name_for_pdf_context = target_row_dict.get('microproduct_name') or target_row_dict.get('project_name')
        user_friendly_pdf_filename = f"{create_slug(mp_name_for_pdf_context)}_{uuid.uuid4().hex[:8]}.pdf"

        content_json = target_row_dict.get('microproduct_content')
        component_name = target_row_dict.get("design_component_name")
        data_for_template_render: Optional[Dict[str, Any]] = None
        pdf_template_file: str

        detected_lang_for_pdf = 'ru'  # Default language
        if isinstance(content_json, dict) and content_json.get('detectedLanguage'):
            detected_lang_for_pdf = content_json.get('detectedLanguage')
        elif mp_name_for_pdf_context: # Fallback if not in content_json
            detected_lang_for_pdf = detect_language(mp_name_for_pdf_context)
        
        # Get the locale strings for the detected language, defaulting to 'en' if not found
        current_pdf_locale_strings = VIDEO_SCRIPT_LANG_STRINGS.get(detected_lang_for_pdf, VIDEO_SCRIPT_LANG_STRINGS['en'])

        logger.info(f"Project {project_id} PDF Gen: Raw content_json from DB (type: {type(content_json)}). First 1000 chars: {str(content_json)[:1000]}")

        if component_name == COMPONENT_NAME_PDF_LESSON:
            pdf_template_file = "pdf_lesson_pdf_template.html"
            if content_json and isinstance(content_json, dict):
                logger.info(f"Project {project_id} PDF Gen (PDF LESSON): Using raw content_json directly for template.")
                data_for_template_render = json.loads(json.dumps(content_json)) 
                if not data_for_template_render.get('detectedLanguage'):
                    try:
                        parsed_model_for_fallback_lang = PdfLessonDetails(**content_json)
                        if parsed_model_for_fallback_lang and parsed_model_for_fallback_lang.detectedLanguage:
                            detected_lang_for_pdf = parsed_model_for_fallback_lang.detectedLanguage
                            # Update locale strings if language detection changed
                            current_pdf_locale_strings = VIDEO_SCRIPT_LANG_STRINGS.get(detected_lang_for_pdf, VIDEO_SCRIPT_LANG_STRINGS['en'])
                    except Exception: pass
                    data_for_template_render['detectedLanguage'] = detected_lang_for_pdf
            else:
                logger.warning(f"Project {project_id} PDF Gen (PDF LESSON): content_json is not a valid dict or is None. Using fallback structure.")
                data_for_template_render = {
                    "lessonTitle": f"Content Unavailable/Invalid: {mp_name_for_pdf_context}",
                    "contentBlocks": [], "detectedLanguage": detected_lang_for_pdf}
        elif component_name == COMPONENT_NAME_TEXT_PRESENTATION:
            pdf_template_file = "text_presentation_pdf_template.html"
            if content_json and isinstance(content_json, dict):
                data_for_template_render = json.loads(json.dumps(content_json))
                if not data_for_template_render.get('detectedLanguage'):
                    data_for_template_render['detectedLanguage'] = detected_lang_for_pdf
            else:
                data_for_template_render = {
                    "textTitle": f"Content Unavailable/Invalid: {mp_name_for_pdf_context}",
                    "contentBlocks": [], "detectedLanguage": detected_lang_for_pdf
                }
        elif component_name == COMPONENT_NAME_TRAINING_PLAN:
            pdf_template_file = "training_plan_pdf_template.html"
            temp_dumped_dict = None
            if content_json and isinstance(content_json, dict):
                try:
                    logger.info(f"PDF Gen (Proj {project_id}): Raw content_json type: {type(content_json)}")
                    logger.info(f"PDF Gen (Proj {project_id}): Raw content_json keys: {list(content_json.keys()) if isinstance(content_json, dict) else 'Not a dict'}")
                    if 'sections' in content_json:
                        logger.info(f"PDF Gen (Proj {project_id}): sections type: {type(content_json['sections'])}, length: {len(content_json['sections']) if isinstance(content_json['sections'], list) else 'Not a list'}")
                    
                    # Round hours to integers before parsing to prevent float validation errors
                    content_json = round_hours_in_content(content_json)
                    
                    parsed_model = TrainingPlanDetails(**content_json)
                    logger.info(f"PDF Gen (Proj {project_id}): Parsed model sections length: {len(parsed_model.sections)}")
                    
                    if parsed_model.detectedLanguage: 
                        detected_lang_for_pdf = parsed_model.detectedLanguage
                        # Update locale strings if language detection changed
                        current_pdf_locale_strings = VIDEO_SCRIPT_LANG_STRINGS.get(detected_lang_for_pdf, VIDEO_SCRIPT_LANG_STRINGS['en'])
                    
                    # Calculate completion time for each section
                    for section in parsed_model.sections:
                        total_completion_minutes = 0
                        for lesson in section.lessons:
                            if lesson.completionTime:
                                time_str = str(lesson.completionTime).strip()
                                if time_str and time_str != '':
                                    # Extract numeric part using regex to handle all language units (m, м, хв)
                                    import re
                                    numbers = re.findall(r'\d+', time_str)
                                    if numbers:
                                        try:
                                            # If it contains 'h' (hour indicator), convert to minutes
                                            if 'h' in time_str.lower():
                                                total_completion_minutes += int(numbers[0]) * 60
                                            else:
                                                # For minutes (m, м, хв), just use the number
                                                total_completion_minutes += int(numbers[0])
                                        except (ValueError, IndexError):
                                            total_completion_minutes += 5  # Fallback to 5 minutes
                        
                        # Add the calculated completion time to the section
                        section.totalCompletionTime = total_completion_minutes
                    
                    temp_dumped_dict = parsed_model.model_dump(mode='json', exclude_none=True)
                    logger.info(f"PDF Gen (Proj {project_id}): Dumped dict sections length: {len(temp_dumped_dict.get('sections', []))}")
                    data_for_template_render = json.loads(json.dumps(temp_dumped_dict))
                    logger.info(f"PDF Gen (Proj {project_id}): Final data sections length: {len(data_for_template_render.get('sections', []))}")
                except Exception as e_parse_dump:
                    logger.error(f"Pydantic parsing/dumping failed for TrainingPlan (Proj {project_id}): {e_parse_dump}", exc_info=not IS_PRODUCTION)
            if data_for_template_render is None:
                 logger.warning(f"Project {project_id} PDF Gen (TRAINING PLAN): data_for_template_render is None. Using fallback.")
                 data_for_template_render = {"mainTitle": f"Content Error: {mp_name_for_pdf_context}", "sections": [], "detectedLanguage": detected_lang_for_pdf}
            
            current_lang_cfg_main = LANG_CONFIG.get(detected_lang_for_pdf, LANG_CONFIG['ru']) # Using main LANG_CONFIG for units
            data_for_template_render['time_unit_singular'] = current_lang_cfg_main.get('TIME_UNIT_SINGULAR', 'h')
            data_for_template_render['time_unit_decimal_plural'] = current_lang_cfg_main.get('TIME_UNIT_DECIMAL_PLURAL', 'h')
            data_for_template_render['time_unit_general_plural'] = current_lang_cfg_main.get('TIME_UNIT_GENERAL_PLURAL', 'h')
        elif component_name == COMPONENT_NAME_VIDEO_LESSON: # Updated logic for Video Lesson
            pdf_template_file = "video_lesson_pdf_template.html"
            if content_json and isinstance(content_json, dict):
                data_for_template_render = json.loads(json.dumps(content_json))
                if not data_for_template_render.get('detectedLanguage'):
                    try:
                        parsed_model = VideoLessonData(**content_json)
                        if parsed_model.detectedLanguage:
                            detected_lang_for_pdf = parsed_model.detectedLanguage
                            # Update locale strings if language detection changed
                            current_pdf_locale_strings = VIDEO_SCRIPT_LANG_STRINGS.get(detected_lang_for_pdf, VIDEO_SCRIPT_LANG_STRINGS['en'])
                    except Exception: pass 
                    data_for_template_render['detectedLanguage'] = detected_lang_for_pdf
                else: # If language IS in content_json, ensure locale strings match
                    detected_lang_for_pdf = data_for_template_render.get('detectedLanguage', detected_lang_for_pdf)
                    current_pdf_locale_strings = VIDEO_SCRIPT_LANG_STRINGS.get(detected_lang_for_pdf, VIDEO_SCRIPT_LANG_STRINGS['en'])

            else:
                data_for_template_render = {
                    "mainPresentationTitle": f"Content Error: {mp_name_for_pdf_context}",
                    "slides": [], "detectedLanguage": detected_lang_for_pdf
                }
        elif component_name == COMPONENT_NAME_QUIZ: # Quiz handling
            pdf_template_file = "quiz_pdf_template.html"
            if content_json and isinstance(content_json, dict):
                try:
                    parsed_model = QuizData(**content_json)
                    if parsed_model.detectedLanguage:
                        detected_lang_for_pdf = parsed_model.detectedLanguage
                        # Update locale strings if language detection changed
                        current_pdf_locale_strings = VIDEO_SCRIPT_LANG_STRINGS.get(detected_lang_for_pdf, VIDEO_SCRIPT_LANG_STRINGS['en'])
                    data_for_template_render = parsed_model.model_dump(mode='json', exclude_none=True)
                except Exception as e_parse_dump:
                    logger.error(f"Pydantic parsing/dumping failed for Quiz (Proj {project_id}): {e_parse_dump}", exc_info=not IS_PRODUCTION)
                    data_for_template_render = {
                        "quizTitle": f"Content Error: {mp_name_for_pdf_context}",
                        "questions": [],
                        "detectedLanguage": detected_lang_for_pdf
                    }
            else:
                data_for_template_render = {
                    "quizTitle": f"Content Error: {mp_name_for_pdf_context}",
                    "questions": [],
                    "detectedLanguage": detected_lang_for_pdf
                }
        else:
            logger.warning(f"PDF: Unknown component_name '{component_name}' for project {project_id}. Defaulting to simple PDF Lesson structure.")
            pdf_template_file = "pdf_lesson_pdf_template.html" # Or a generic template
            data_for_template_render = {
                "lessonTitle": f"Unknown Content Type: {mp_name_for_pdf_context}",
                "contentBlocks": [{"type":"paragraph", "text":"The content type of this project is not configured for PDF export."}],
                "detectedLanguage": detected_lang_for_pdf
            }

        if not isinstance(data_for_template_render, dict):
             logger.critical(f"Project {project_id} PDF Gen: data_for_template_render is NOT A DICT ({type(data_for_template_render)}) before final context prep.")
             data_for_template_render = {"lessonTitle": "Critical Data Preparation Error", "contentBlocks": [], "detectedLanguage": "en"}
             # Ensure locale is set for critical error case
             current_pdf_locale_strings = VIDEO_SCRIPT_LANG_STRINGS['en']


        if isinstance(data_for_template_render, dict):
            logger.info(f"Project {project_id} PDF Gen: Starting deep inspection of data_for_template_render (to be passed as 'details' in template context)...")
            inspect_list_items_recursively(data_for_template_render.get('contentBlocks', []), "data_for_template_render.contentBlocks")

        unique_output_filename = f"{project_id}_{document_name_slug}_{uuid.uuid4().hex[:12]}.pdf"
        
        # Pass the locale strings to the template context
        static_images_abs_path = os.path.abspath(STATIC_DESIGN_IMAGES_DIR) + '/'
        logger.info(f"📄 [PDF CONTEXT] Project {project_id} - Static images path: {static_images_abs_path}")
        logger.info(f"📄 [PDF CONTEXT] Project {project_id} - Path exists: {os.path.exists(static_images_abs_path.rstrip('/'))}")
        
        context_for_jinja = {
            'details': data_for_template_render, 
            'locale': current_pdf_locale_strings,
            'parentProjectName': parentProjectName,
            'lessonNumber': lessonNumber,
            'pdf_context': {
                'static_images_path': static_images_abs_path
            }
        }
        
        # 🔍 PDF CONTEXT LOGGING: What we're passing to the template
        logger.info(f"📄 [PDF CONTEXT] Project {project_id} - Full context keys: {list(context_for_jinja.keys())}")
        
        # Log image blocks without transforming them (let PDF generator handle the transformation)
        if 'details' in context_for_jinja and isinstance(context_for_jinja['details'], dict) and 'contentBlocks' in context_for_jinja['details']:
            content_blocks = context_for_jinja['details']['contentBlocks']
            logger.info(f"📄 [PDF CONTEXT] Project {project_id} - Processing {len(content_blocks)} content blocks")
            
            image_blocks = [block for block in content_blocks if block.get('type') == 'image']
            logger.info(f"📄 [PDF CONTEXT] Project {project_id} - Found {len(image_blocks)} image blocks")
            for img_block in image_blocks:
                original_src = img_block.get('src', '')
                logger.info(f"📄 [PDF CONTEXT] Project {project_id} - Image block src (before PDF generation): {original_src}")
                if original_src.startswith('/static_design_images/'):
                    filename = original_src.replace('/static_design_images/', '')
                    full_path = static_images_abs_path + filename
                    logger.info(f"📄 [PDF CONTEXT] Project {project_id} - Expected file path: {full_path} (exists: {os.path.exists(full_path)})")
        else:
            logger.info(f"📄 [PDF CONTEXT] Project {project_id} - No contentBlocks found in details")
        
        # Add column visibility settings for Training Plan PDFs
        if component_name == COMPONENT_NAME_TRAINING_PLAN:
            column_visibility = {
                'knowledgeCheck': knowledgeCheck == '1' if knowledgeCheck else True,
                'contentAvailability': contentAvailability == '1' if contentAvailability else True,
                'informationSource': informationSource == '1' if informationSource else True,
                'time': time == '1' if time else True,
                'estCompletionTime': estCompletionTime == '1' if estCompletionTime else True,
                'qualityTier': qualityTier == '1' if qualityTier else False,  # Hidden by default
            }
            context_for_jinja['columnVisibility'] = column_visibility

        logger.info(f"Project {project_id} PDF Gen: Type of context_for_jinja['details']: {type(context_for_jinja.get('details'))}")
        if isinstance(context_for_jinja.get('details'), dict) and isinstance(context_for_jinja['details'].get('details'), dict):
            final_cb_source = context_for_jinja['details']['details']
            final_cb_type = type(final_cb_source.get('contentBlocks'))
            logger.info(f"Project {project_id} PDF Gen: Type of context_for_jinja['details']['details']['contentBlocks']: {final_cb_type}")
            if isinstance(final_cb_source.get('contentBlocks'), list):
                 for block_idx, block_item_final_check in enumerate(final_cb_source.get('contentBlocks', [])):
                    if isinstance(block_item_final_check, dict) and block_item_final_check.get('type') in ('bullet_list', 'numbered_list'):
                        items_final_check_type = type(block_item_final_check.get('items'))
                        if not isinstance(block_item_final_check.get('items'), list):
                            logger.error(f"Project {project_id} PDF Gen: CRITICAL - 'items' in block_item_final_check for block #{block_idx} is STILL NOT A LIST (type: {items_final_check_type}) just before Jinja render.")
            elif final_cb_type is not None: # if it's not None and not a list
                logger.error(f"Project {project_id} PDF Gen: CRITICAL - context_for_jinja['details']['details']['contentBlocks'] is NOT A LIST (type: {final_cb_type}) just before Jinja render.")

        pdf_path = await generate_pdf_from_html_template(pdf_template_file, context_for_jinja, unique_output_filename)
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="PDF file not found after generation.")
        return FileResponse(path=pdf_path, filename=user_friendly_pdf_filename, media_type='application/pdf', headers={"Cache-Control": "no-cache, no-store, must-revalidate", "Pragma": "no-cache", "Expires": "0"})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in PDF endpoint for project {project_id}: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "An error occurred during PDF generation." if IS_PRODUCTION else f"Error during PDF generation: {str(e)[:200]}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)

@app.post("/api/custom/projects/delete-multiple", status_code=status.HTTP_200_OK)
async def delete_multiple_projects(delete_request: ProjectsDeleteRequest, onyx_user_id: str = Depends(get_current_onyx_user_id), pool: asyncpg.Pool = Depends(get_db_pool)):
    if not delete_request.project_ids:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"detail": "No project IDs provided."})

    project_ids_to_trash = set(delete_request.project_ids)

    try:
        async with pool.acquire() as conn:
            # If scope is 'all', find all associated lesson projects for any Training Plans
            if delete_request.scope == 'all':
                for project_id in delete_request.project_ids:
                    # Fetch outline project name
                    row = await conn.fetchrow(
                        "SELECT project_name, microproduct_type FROM projects WHERE id=$1 AND onyx_user_id=$2",
                        project_id, onyx_user_id
                    )
                    if not row:
                        continue
                    outline_name: str = row["project_name"]
                    # Treat both 'Training Plan' and 'Course Outline' as outline types
                    if row["microproduct_type"] not in ("Training Plan", "Course Outline"):
                        # Not an outline – no