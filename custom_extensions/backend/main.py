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
  "lessonTitle": "Example Slide Deck Lesson",
  "slides": [
    {
      "slideId": "slide_1_intro",
      "slideNumber": 1,
      "slideTitle": "Introduction",
      "deckgoTemplate": "deckgo-slide-title",
      "contentBlocks": [
        { "type": "headline", "level": 2, "text": "Welcome to the Lesson" },
        { "type": "paragraph", "text": "This slide introduces the main topic." },
        {
          "type": "bullet_list",
          "items": [
            "Key point 1",
            "Key point 2", 
            "Key point 3"
          ]
        }
      ],
      "imagePlaceholders": [
        {
          "size": "BACKGROUND",
          "position": "BACKGROUND",
          "description": "Educational theme background"
        }
      ]
    },
    {
      "slideId": "slide_2_main",
      "slideNumber": 2,
      "slideTitle": "Main Concepts",
      "deckgoTemplate": "deckgo-slide-content",
      "contentBlocks": [
        { "type": "headline", "level": 2, "text": "Core Ideas" },
        {
          "type": "numbered_list",
          "items": [
            "First important concept",
            "Second important concept"
          ]
        },
        { "type": "paragraph", "text": "These concepts form the foundation of understanding." }
      ],
      "imagePlaceholders": [
        {
          "size": "MEDIUM",
          "position": "RIGHT",
          "description": "Concept visualization or diagram"
        }
      ]
    },
    {
      "slideId": "slide_3_data",
      "slideNumber": 3,
      "slideTitle": "Understanding Schedules",
      "deckgoTemplate": "deckgo-slide-chart",
      "contentBlocks": [
        { "type": "headline", "level": 2, "text": "Timetable Chart" },
        { "type": "paragraph", "text": "Timetables and schedules keep you on track. Learn how to read a simple timetable chart." },
        {
          "type": "bullet_list",
          "items": [
            "Check the departure and arrival columns carefully.",
            "The station code is listed beside each time."
          ]
        }
      ],
      "imagePlaceholders": [
        {
          "size": "BACKGROUND",
          "position": "BACKGROUND", 
          "description": "A train timetable board"
        }
      ]
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
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_design_templates_name ON design_templates(template_name);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_design_templates_mptype ON design_templates(microproduct_type);")
            logger.info("'design_templates' table ensured.")

            # --- Ensure a soft-delete trash table for projects ---
            await connection.execute("""
                CREATE TABLE IF NOT EXISTS trashed_projects (LIKE projects INCLUDING ALL);
            """)
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_trashed_projects_user ON trashed_projects(onyx_user_id);")
            logger.info("'trashed_projects' table ensured (soft-delete).")

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

class LessonDetail(BaseModel):
    title: str
    check: StatusInfo = Field(default_factory=StatusInfo)
    contentAvailable: StatusInfo = Field(default_factory=StatusInfo)
    source: str = ""
    hours: int = 0
    completionTime: str = ""  # Estimated completion time in minutes (e.g., "5m", "6m", "7m", "8m")
    model_config = {"from_attributes": True}

class SectionDetail(BaseModel):
    id: str
    title: str
    totalHours: int = 0
    totalCompletionTime: Optional[int] = None  # Total completion time in minutes for the section
    lessons: List[LessonDetail] = Field(default_factory=list)
    autoCalculateHours: bool = True
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
    HeadlineBlock, ParagraphBlock, BulletListBlock, NumberedListBlock, AlertBlock, SectionBreakBlock
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
    slideId: str               # "slide_1_intro"
    slideNumber: int           # 1, 2, 3, ...
    slideTitle: str            # "Introduction to Key Concepts"
    contentBlocks: List[AnyContentBlockValue] = Field(default_factory=list)
    deckgoTemplate: Optional[str] = None  # "deckgo-slide-chart", "deckgo-slide-split", etc.
    imagePlaceholders: List[ImagePlaceholder] = Field(default_factory=list)
    model_config = {"from_attributes": True}

class SlideDeckDetails(BaseModel):
    lessonTitle: str
    slides: List[DeckSlide] = Field(default_factory=list)
    currentSlideId: Optional[str] = None  # To store the active slide from frontend
    lessonNumber: Optional[int] = None    # Sequential number in Training Plan
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
    model_config = {"from_attributes": True}

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


# --- Directory for Design Template Images ---
STATIC_DESIGN_IMAGES_DIR = "static_design_images"
os.makedirs(STATIC_DESIGN_IMAGES_DIR, exist_ok=True)

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
  "lessonTitle": "Example Slide Deck Lesson",
  "slides": [
    {
      "slideId": "slide_1_intro",
      "slideNumber": 1,
      "slideTitle": "Introduction",
      "deckgoTemplate": "deckgo-slide-title",
      "contentBlocks": [
        { "type": "headline", "level": 2, "text": "Welcome to the Lesson" },
        { "type": "paragraph", "text": "This slide introduces the main topic." },
        {
          "type": "bullet_list",
          "items": [
            "Key point 1",
            "Key point 2", 
            "Key point 3"
          ]
        }
      ],
      "imagePlaceholders": [
        {
          "size": "BACKGROUND",
          "position": "BACKGROUND",
          "description": "Educational theme background"
        }
      ]
    },
    {
      "slideId": "slide_2_main",
      "slideNumber": 2,
      "slideTitle": "Main Concepts",
      "deckgoTemplate": "deckgo-slide-content",
      "contentBlocks": [
        { "type": "headline", "level": 2, "text": "Core Ideas" },
        {
          "type": "numbered_list",
          "items": [
            "First important concept",
            "Second important concept"
          ]
        },
        { "type": "paragraph", "text": "These concepts form the foundation of understanding." }
      ],
      "imagePlaceholders": [
        {
          "size": "MEDIUM",
          "position": "RIGHT",
          "description": "Concept visualization or diagram"
        }
      ]
    },
    {
      "slideId": "slide_3_data",
      "slideNumber": 3,
      "slideTitle": "Understanding Schedules",
      "deckgoTemplate": "deckgo-slide-chart",
      "contentBlocks": [
        { "type": "headline", "level": 2, "text": "Timetable Chart" },
        { "type": "paragraph", "text": "Timetables and schedules keep you on track. Learn how to read a simple timetable chart." },
        {
          "type": "bullet_list",
          "items": [
            "Check the departure and arrival columns carefully.",
            "The station code is listed beside each time."
          ]
        }
      ],
      "imagePlaceholders": [
        {
          "size": "BACKGROUND",
          "position": "BACKGROUND", 
          "description": "A train timetable board"
        }
      ]
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
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_design_templates_name ON design_templates(template_name);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_design_templates_mptype ON design_templates(microproduct_type);")
            logger.info("'design_templates' table ensured.")

            # --- Ensure a soft-delete trash table for projects ---
            await connection.execute("""
                CREATE TABLE IF NOT EXISTS trashed_projects (LIKE projects INCLUDING ALL);
            """)
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_trashed_projects_user ON trashed_projects(onyx_user_id);")
            logger.info("'trashed_projects' table ensured (soft-delete).")

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


# --- Directory for Design Template Images ---
STATIC_DESIGN_IMAGES_DIR = "static_design_images"
os.makedirs(STATIC_DESIGN_IMAGES_DIR, exist_ok=True)

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
  "lessonTitle": "Example Slide Deck Lesson",
  "slides": [
    {
      "slideId": "slide_1_intro",
      "slideNumber": 1,
      "slideTitle": "Introduction",
      "deckgoTemplate": "deckgo-slide-title",
      "contentBlocks": [
        { "type": "headline", "level": 2, "text": "Welcome to the Lesson" },
        { "type": "paragraph", "text": "This slide introduces the main topic." },
        {
          "type": "bullet_list",
          "items": [
            "Key point 1",
            "Key point 2", 
            "Key point 3"
          ]
        }
      ],
      "imagePlaceholders": [
        {
          "size": "BACKGROUND",
          "position": "BACKGROUND",
          "description": "Educational theme background"
        }
      ]
    },
    {
      "slideId": "slide_2_main",
      "slideNumber": 2,
      "slideTitle": "Main Concepts",
      "deckgoTemplate": "deckgo-slide-content",
      "contentBlocks": [
        { "type": "headline", "level": 2, "text": "Core Ideas" },
        {
          "type": "numbered_list",
          "items": [
            "First important concept",
            "Second important concept"
          ]
        },
        { "type": "paragraph", "text": "These concepts form the foundation of understanding." }
      ],
      "imagePlaceholders": [
        {
          "size": "MEDIUM",
          "position": "RIGHT",
          "description": "Concept visualization or diagram"
        }
      ]
    },
    {
      "slideId": "slide_3_data",
      "slideNumber": 3,
      "slideTitle": "Understanding Schedules",
      "deckgoTemplate": "deckgo-slide-chart",
      "contentBlocks": [
        { "type": "headline", "level": 2, "text": "Timetable Chart" },
        { "type": "paragraph", "text": "Timetables and schedules keep you on track. Learn how to read a simple timetable chart." },
        {
          "type": "bullet_list",
          "items": [
            "Check the departure and arrival columns carefully.",
            "The station code is listed beside each time."
          ]
        }
      ],
      "imagePlaceholders": [
        {
          "size": "BACKGROUND",
          "position": "BACKGROUND", 
          "description": "A train timetable board"
        }
      ]
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
  "lessonTitle": "Example Slide Deck Lesson",
  "slides": [
    {
      "slideId": "slide_1_intro",
      "slideNumber": 1,
      "slideTitle": "Introduction",
      "deckgoTemplate": "deckgo-slide-title",
      "contentBlocks": [
        { "type": "headline", "level": 2, "text": "Welcome to the Lesson" },
        { "type": "paragraph", "text": "This slide introduces the main topic." },
        {
          "type": "bullet_list",
          "items": [
            "Key point 1",
            "Key point 2", 
            "Key point 3"
          ]
        }
      ],
      "imagePlaceholders": [
        {
          "size": "BACKGROUND",
          "position": "BACKGROUND",
          "description": "Educational theme background"
        }
      ]
    },
    {
      "slideId": "slide_2_main",
      "slideNumber": 2,
      "slideTitle": "Main Concepts",
      "deckgoTemplate": "deckgo-slide-content",
      "contentBlocks": [
        { "type": "headline", "level": 2, "text": "Core Ideas" },
        {
          "type": "numbered_list",
          "items": [
            "First important concept",
            "Second important concept"
          ]
        },
        { "type": "paragraph", "text": "These concepts form the foundation of understanding." }
      ],
      "imagePlaceholders": [
        {
          "size": "MEDIUM",
          "position": "RIGHT",
          "description": "Concept visualization or diagram"
        }
      ]
    },
    {
      "slideId": "slide_3_data",
      "slideNumber": 3,
      "slideTitle": "Understanding Schedules",
      "deckgoTemplate": "deckgo-slide-chart",
      "contentBlocks": [
        { "type": "headline", "level": 2, "text": "Timetable Chart" },
        { "type": "paragraph", "text": "Timetables and schedules keep you on track. Learn how to read a simple timetable chart." },
        {
          "type": "bullet_list",
          "items": [
            "Check the departure and arrival columns carefully.",
            "The station code is listed beside each time."
          ]
        }
      ],
      "imagePlaceholders": [
        {
          "size": "BACKGROUND",
          "position": "BACKGROUND", 
          "description": "A train timetable board"
        }
      ]
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
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_design_templates_name ON design_templates(template_name);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_design_templates_mptype ON design_templates(microproduct_type);")
            logger.info("'design_templates' table ensured.")

            # --- Ensure a soft-delete trash table for projects ---
            await connection.execute("""
                CREATE TABLE IF NOT EXISTS trashed_projects (LIKE projects INCLUDING ALL);
            """)
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_trashed_projects_user ON trashed_projects(onyx_user_id);")
            logger.info("'trashed_projects' table ensured (soft-delete).")

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

class LessonDetail(BaseModel):
    title: str
    check: StatusInfo = Field(default_factory=StatusInfo)
    contentAvailable: StatusInfo = Field(default_factory=StatusInfo)
    source: str = ""
    hours: int = 0
    completionTime: str = ""  # Estimated completion time in minutes (e.g., "5m", "6m", "7m", "8m")
    model_config = {"from_attributes": True}

class SectionDetail(BaseModel):
    id: str
    title: str
    totalHours: int = 0
    totalCompletionTime: Optional[int] = None  # Total completion time in minutes for the section
    lessons: List[LessonDetail] = Field(default_factory=list)
    autoCalculateHours: bool = True
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
    HeadlineBlock, ParagraphBlock, BulletListBlock, NumberedListBlock, AlertBlock, SectionBreakBlock
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
    slideId: str               # "slide_1_intro"
    slideNumber: int           # 1, 2, 3, ...
    slideTitle: str            # "Introduction to Key Concepts"
    contentBlocks: List[AnyContentBlockValue] = Field(default_factory=list)
    deckgoTemplate: Optional[str] = None  # "deckgo-slide-chart", "deckgo-slide-split", etc.
    imagePlaceholders: List[ImagePlaceholder] = Field(default_factory=list)
    model_config = {"from_attributes": True}

class SlideDeckDetails(BaseModel):
    lessonTitle: str
    slides: List[DeckSlide] = Field(default_factory=list)
    currentSlideId: Optional[str] = None  # To store the active slide from frontend
    lessonNumber: Optional[int] = None    # Sequential number in Training Plan
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
    model_config = {"from_attributes": True}

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


# --- Directory for Design Template Images ---
STATIC_DESIGN_IMAGES_DIR = "static_design_images"
os.makedirs(STATIC_DESIGN_IMAGES_DIR, exist_ok=True)

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
  "lessonTitle": "Example Slide Deck Lesson",
  "slides": [
    {
      "slideId": "slide_1_intro",
      "slideNumber": 1,
      "slideTitle": "Introduction",
      "deckgoTemplate": "deckgo-slide-title",
      "contentBlocks": [
        { "type": "headline", "level": 2, "text": "Welcome to the Lesson" },
        { "type": "paragraph", "text": "This slide introduces the main topic." },
        {
          "type": "bullet_list",
          "items": [
            "Key point 1",
            "Key point 2", 
            "Key point 3"
          ]
        }
      ],
      "imagePlaceholders": [
        {
          "size": "BACKGROUND",
          "position": "BACKGROUND",
          "description": "Educational theme background"
        }
      ]
    },
    {
      "slideId": "slide_2_main",
      "slideNumber": 2,
      "slideTitle": "Main Concepts",
      "deckgoTemplate": "deckgo-slide-content",
      "contentBlocks": [
        { "type": "headline", "level": 2, "text": "Core Ideas" },
        {
          "type": "numbered_list",
          "items": [
            "First important concept",
            "Second important concept"
          ]
        },
        { "type": "paragraph", "text": "These concepts form the foundation of understanding." }
      ],
      "imagePlaceholders": [
        {
          "size": "MEDIUM",
          "position": "RIGHT",
          "description": "Concept visualization or diagram"
        }
      ]
    },
    {
      "slideId": "slide_3_data",
      "slideNumber": 3,
      "slideTitle": "Understanding Schedules",
      "deckgoTemplate": "deckgo-slide-chart",
      "contentBlocks": [
        { "type": "headline", "level": 2, "text": "Timetable Chart" },
        { "type": "paragraph", "text": "Timetables and schedules keep you on track. Learn how to read a simple timetable chart." },
        {
          "type": "bullet_list",
          "items": [
            "Check the departure and arrival columns carefully.",
            "The station code is listed beside each time."
          ]
        }
      ],
      "imagePlaceholders": [
        {
          "size": "BACKGROUND",
          "position": "BACKGROUND", 
          "description": "A train timetable board"
        }
      ]
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
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_design_templates_name ON design_templates(template_name);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_design_templates_mptype ON design_templates(microproduct_type);")
            logger.info("'design_templates' table ensured.")

            # --- Ensure a soft-delete trash table for projects ---
            await connection.execute("""
                CREATE TABLE IF NOT EXISTS trashed_projects (LIKE projects INCLUDING ALL);
            """)
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_trashed_projects_user ON trashed_projects(onyx_user_id);")
            logger.info("'trashed_projects' table ensured (soft-delete).")

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


# --- Directory for Design Template Images ---
STATIC_DESIGN_IMAGES_DIR = "static_design_images"
os.makedirs(STATIC_DESIGN_IMAGES_DIR, exist_ok=True)

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
  "lessonTitle": "Example Slide Deck Lesson",
  "slides": [
    {
      "slideId": "slide_1_intro",
      "slideNumber": 1,
      "slideTitle": "Introduction",
      "deckgoTemplate": "deckgo-slide-title",
      "contentBlocks": [
        { "type": "headline", "level": 2, "text": "Welcome to the Lesson" },
        { "type": "paragraph", "text": "This slide introduces the main topic." },
        {
          "type": "bullet_list",
          "items": [
            "Key point 1",
            "Key point 2", 
            "Key point 3"
          ]
        }
      ],
      "imagePlaceholders": [
        {
          "size": "BACKGROUND",
          "position": "BACKGROUND",
          "description": "Educational theme background"
        }
      ]
    },
    {
      "slideId": "slide_2_main",
      "slideNumber": 2,
      "slideTitle": "Main Concepts",
      "deckgoTemplate": "deckgo-slide-content",
      "contentBlocks": [
        { "type": "headline", "level": 2, "text": "Core Ideas" },
        {
          "type": "numbered_list",
          "items": [
            "First important concept",
            "Second important concept"
          ]
        },
        { "type": "paragraph", "text": "These concepts form the foundation of understanding." }
      ],
      "imagePlaceholders": [
        {
          "size": "MEDIUM",
          "position": "RIGHT",
          "description": "Concept visualization or diagram"
        }
      ]
    },
    {
      "slideId": "slide_3_data",
      "slideNumber": 3,
      "slideTitle": "Understanding Schedules",
      "deckgoTemplate": "deckgo-slide-chart",
      "contentBlocks": [
        { "type": "headline", "level": 2, "text": "Timetable Chart" },
        { "type": "paragraph", "text": "Timetables and schedules keep you on track. Learn how to read a simple timetable chart." },
        {
          "type": "bullet_list",
          "items": [
            "Check the departure and arrival columns carefully.",
            "The station code is listed beside each time."
          ]
        }
      ],
      "imagePlaceholders": [
        {
          "size": "BACKGROUND",
          "position": "BACKGROUND", 
          "description": "A train timetable board"
        }
      ]
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
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_design_templates_name ON design_templates(template_name);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_design_templates_mptype ON design_templates(microproduct_type);")
            logger.info("'design_templates' table ensured.")

            # --- Ensure a soft-delete trash table for projects ---
            await connection.execute("""
                CREATE TABLE IF NOT EXISTS trashed_projects (LIKE projects INCLUDING ALL);
            """)
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_trashed_projects_user ON trashed_projects(onyx_user_id);")
            logger.info("'trashed_projects' table ensured (soft-delete).")

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

class LessonDetail(BaseModel):
    title: str
    check: StatusInfo = Field(default_factory=StatusInfo)
    contentAvailable: StatusInfo = Field(default_factory=StatusInfo)
    source: str = ""
    hours: int = 0
    completionTime: str = ""  # Estimated completion time in minutes (e.g., "5m", "6m", "7m", "8m")
    model_config = {"from_attributes": True}

class SectionDetail(BaseModel):
    id: str
    title: str
    totalHours: int = 0
    totalCompletionTime: Optional[int] = None  # Total completion time in minutes for the section
    lessons: List[LessonDetail] = Field(default_factory=list)
    autoCalculateHours: bool = True
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
    HeadlineBlock, ParagraphBlock, BulletListBlock, NumberedListBlock, AlertBlock, SectionBreakBlock
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
    slideId: str               # "slide_1_intro"
    slideNumber: int           # 1, 2, 3, ...
    slideTitle: str            # "Introduction to Key Concepts"
    contentBlocks: List[AnyContentBlockValue] = Field(default_factory=list)
    deckgoTemplate: Optional[str] = None  # "deckgo-slide-chart", "deckgo-slide-split", etc.
    imagePlaceholders: List[ImagePlaceholder] = Field(default_factory=list)
    model_config = {"from_attributes": True}

class SlideDeckDetails(BaseModel):
    lessonTitle: str
    slides: List[DeckSlide] = Field(default_factory=list)
    currentSlideId: Optional[str] = None  # To store the active slide from frontend
    lessonNumber: Optional[int] = None    # Sequential number in Training Plan
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
    model_config = {"from_attributes": True}

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


# --- Directory for Design Template Images ---
STATIC_DESIGN_IMAGES_DIR = "static_design_images"
os.makedirs(STATIC_DESIGN_IMAGES_DIR, exist_ok=True)

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
  "lessonTitle": "Example Slide Deck Lesson",
  "slides": [
    {
      "slideId": "slide_1_intro",
      "slideNumber": 1,
      "slideTitle": "Introduction",
      "deckgoTemplate": "deckgo-slide-title",
      "contentBlocks": [
        { "type": "headline", "level": 2, "text": "Welcome to the Lesson" },
        { "type": "paragraph", "text": "This slide introduces the main topic." },
        {
          "type": "bullet_list",
          "items": [
            "Key point 1",
            "Key point 2", 
            "Key point 3"
          ]
        }
      ],
      "imagePlaceholders": [
        {
          "size": "BACKGROUND",
          "position": "BACKGROUND",
          "description": "Educational theme background"
        }
      ]
    },
    {
      "slideId": "slide_2_main",
      "slideNumber": 2,
      "slideTitle": "Main Concepts",
      "deckgoTemplate": "deckgo-slide-content",
      "contentBlocks": [
        { "type": "headline", "level": 2, "text": "Core Ideas" },
        {
          "type": "numbered_list",
          "items": [
            "First important concept",
            "Second important concept"
          ]
        },
        { "type": "paragraph", "text": "These concepts form the foundation of understanding." }
      ],
      "imagePlaceholders": [
        {
          "size": "MEDIUM",
          "position": "RIGHT",
          "description": "Concept visualization or diagram"
        }
      ]
    },
    {
      "slideId": "slide_3_data",
      "slideNumber": 3,
      "slideTitle": "Understanding Schedules",
      "deckgoTemplate": "deckgo-slide-chart",
      "contentBlocks": [
        { "type": "headline", "level": 2, "text": "Timetable Chart" },
        { "type": "paragraph", "text": "Timetables and schedules keep you on track. Learn how to read a simple timetable chart." },
        {
          "type": "bullet_list",
          "items": [
            "Check the departure and arrival columns carefully.",
            "The station code is listed beside each time."
          ]
        }
      ],
      "imagePlaceholders": [
        {
          "size": "BACKGROUND",
          "position": "BACKGROUND", 
          "description": "A train timetable board"
        }
      ]
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
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_design_templates_name ON design_templates(template_name);")
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_design_templates_mptype ON design_templates(microproduct_type);")
            logger.info("'design_templates' table ensured.")

            # --- Ensure a soft-delete trash table for projects ---
            await connection.execute("""
                CREATE TABLE IF NOT EXISTS trashed_projects (LIKE projects INCLUDING ALL);
            """)
            await connection.execute("CREATE INDEX IF NOT EXISTS idx_trashed_projects_user ON trashed_projects(onyx_user_id);")
            logger.info("'trashed_projects' table ensured (soft-delete).")

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

class LessonDetail(BaseModel):
    title: str
    check: StatusInfo = Field(default_factory=StatusInfo)
    contentAvailable: StatusInfo = Field(default_factory=StatusInfo)
    source: str = ""
    hours: int = 0
    completionTime: str = ""  # Estimated completion time in minutes (e.g., "5m", "6m", "7m", "8m")
    model_config = {"from_attributes": True}

class SectionDetail(BaseModel):
    id: str
    title: str
    totalHours: int = 0
    totalCompletionTime: Optional[int] = None  # Total completion time in minutes for the section
    lessons: List[LessonDetail] = Field(default_factory=list)
    autoCalculateHours: bool = True
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
    HeadlineBlock, ParagraphBlock, BulletListBlock, NumberedListBlock, AlertBlock, SectionBreakBlock
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
    slideId: str               # "slide_1_intro"
    slideNumber: int           # 1, 2, 3, ...
    slideTitle: str            # "Introduction to Key Concepts"
    contentBlocks: List[AnyContentBlockValue] = Field(default_factory=list)
    deckgoTemplate: Optional[str] = None  # "deckgo-slide-chart", "deckgo-slide-split", etc.
    imagePlaceholders: List[ImagePlaceholder] = Field(default_factory=list)
    model_config = {"from_attributes": True}

class SlideDeckDetails(BaseModel):
    lessonTitle: str
    slides: List[DeckSlide] = Field(default_factory=list)
    currentSlideId: Optional[str] = None  # To store the active slide from frontend
    lessonNumber: Optional[int] = None    # Sequential number in Training Plan
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
    microProductContent: Optional[MicroProductContentType] = None
    model_config = {"from_attributes": True}

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
        'basic': 120,
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
    system_msg = {"role": "system", "content": "You are a JSON parsing expert. You must output ONLY valid JSON in the exact format specified. Do not include any explanations, markdown formatting, or additional text. Your response must be a single, complete JSON object."}
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

@app.get("/api/custom/microproduct_types", response_model=List[str])
async def get_allowed_microproduct_types_list_for_design_templates():
    return ALLOWED_MICROPRODUCT_TYPES_FOR_DESIGNS

# --- Project and MicroProduct Endpoints ---
@app.post("/api/custom/projects/add", response_model=ProjectDB, status_code=status.HTTP_201_CREATED)
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
            llm_json_example = selected_design_template.template_structuring_prompt or DEFAULT_PDF_LESSON_JSON_EXAMPLE_FOR_LLM # Can reuse this example structure
            component_specific_instructions = """
            You are an expert text-to-JSON parsing assistant for 'Text Presentation' content.
            This product is for general text like introductions, goal descriptions, etc.
            Your output MUST be a single, valid JSON object. Strictly follow the JSON structure provided in the example.

            **Overall Goal:** Convert the *entirety* of the "Raw text to parse" into a structured JSON. Capture all information and hierarchical relationships. Maintain original language.

            **Global Fields:**
            1.  `textTitle` (string, optional): Main title for the document. This should be derived from a Level 1 headline (`#`).
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

            5.  **`type: "alert"`**
                *   `alertType` (string): One of `info`, `success`, `warning`, `danger`.
                *   `title` (string, optional): The title of the alert.
                *   `text` (string): The body text of the alert.
                *   **Parsing Rule:** An alert is identified in the raw text by a blockquote. The first line of the blockquote MUST be `> [!TYPE] Optional Title`. The `TYPE` is extracted for `alertType`. The text after the tag is the `title`. All subsequent lines within the blockquote form the `text`.

            6.  **`type: "section_break"`**
                * `style` (string, optional): e.g., "solid", "dashed", "none". Parse from `---` in the raw text.

            **Key Parsing Rules:**
            *   Parse `{isImportant}` on headlines to the `isImportant` boolean field.
            *   Parse `{iconName}` on headlines to the `iconName` string field.
            *   After extracting `iconName` and `isImportant` values, you MUST remove their corresponding `{...}` tags from the final headline `text` field. The user should not see these tags in the output text.
            *   If a paragraph starts with `**Recommendation:**` (or a localized translation like `**Рекомендация:**`, `**Рекомендація:**`), you MUST set the `isRecommendation` field on that paragraph block to `true` and remove the keyword itself from the final `text` field.
            *   Do NOT remove the `**` from the text for any other purpose; treat it as part of the text. It is critical that you preserve the double-asterisk (`**`) markdown for bold text within all `text` fields.
            *   You are encouraged to use a diverse range of the available `iconName` values to make the presentation visually engaging.
            *   If the raw text starts with `# Title`, this becomes the `textTitle`. The `contentBlocks` should not include this Level 1 headline. All other headlines (`##`, `###`, `####`) are content blocks.

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
            llm_json_example = selected_design_template.template_structuring_prompt or DEFAULT_SLIDE_DECK_JSON_EXAMPLE_FOR_LLM
            component_specific_instructions = """
            You are an expert text-to-JSON parsing assistant for 'Slide Deck' content with DeckDeckGo template support.
            Your output MUST be a single, valid JSON object. Strictly follow the JSON structure provided in the example.

            **Overall Goal:** Convert the provided slide deck lesson content into a structured JSON that represents multiple slides with content blocks. Capture all information, hierarchical relationships, DeckDeckGo templates, and image placeholders. Preserve the original language for all textual fields.

            **Global Fields:**
            1.  `lessonTitle` (string): Main title of the lesson/presentation.
            2.  `slides` (array): Ordered list of slide objects.
            3.  `currentSlideId` (string, optional): ID of the currently active slide (can be null).
            4.  `lessonNumber` (integer, optional): Sequential number if part of a training plan.
            5.  `detectedLanguage` (string): 2-letter code such as "en", "ru", "uk".

            **Slide Object (`slides` array items):**
            * `slideId` (string): Unique identifier like "slide_1_intro", "slide_2_concepts".
            * `slideNumber` (integer): Sequential slide number (1, 2, 3, ...).
            * `slideTitle` (string): Descriptive title for the slide.
            * `contentBlocks` (array): List of content block objects for this slide.
            * `deckgoTemplate` (string, optional): DeckDeckGo template type (e.g., "deckgo-slide-chart", "deckgo-slide-split").
            * `imagePlaceholders` (array, optional): List of image placeholder objects.

            **Enhanced Slide Parsing Rules:**
            * Each slide should be separated by `---` in the input markdown
            * Extract slide titles from `**Slide N: Title**` format, which may include DeckDeckGo template specification like `` `deckgo-slide-chart` ``
            * Parse DeckDeckGo template specification: Look for backtick-enclosed template names (e.g., `` `deckgo-slide-chart` ``) in slide titles
            * Extract image placeholders: Parse `[IMAGE_PLACEHOLDER: SIZE | POSITION | Description]` syntax
            * Convert slide content following content block rules, ignoring image placeholders in content flow
            * Generate appropriate `slideId` values based on slide number and title
            * Preserve all formatting, bold text (**text**), and original language

            **DeckDeckGo Template Parsing:**
            When you encounter a slide title like: `**Slide 8: Understanding Schedules** ` `` `deckgo-slide-chart` ``
            - Extract `slideTitle`: "Understanding Schedules" (without the Slide number prefix)
            - Extract `deckgoTemplate`: "deckgo-slide-chart"
            - Store template information in the `deckgoTemplate` field

            **Image Placeholder Parsing:**
            When you encounter: `[IMAGE_PLACEHOLDER: MEDIUM | RIGHT | Concept visualization or diagram]`
            Create an image placeholder object:
            ```json
            {
              "size": "MEDIUM",
              "position": "RIGHT", 
              "description": "Concept visualization or diagram"
            }
            ```
            Add these to the `imagePlaceholders` array. Do NOT include image placeholder text in content blocks.

            **Content Block Instructions (enhanced):**
            Parse each slide's content into appropriate content blocks:
            - Headlines (levels 2-4 with optional icons and isImportant flags)
            - Paragraphs (with optional isRecommendation flag)
            - Bullet lists and numbered lists (with nesting support)
            - Alerts (info, warning, success, danger)
            - Section breaks
            - **IGNORE**: Image placeholder syntax in content flow

            **Special Content Handling:**
            * Lines containing `[Chart/Data visualization content]` should be converted to appropriate content blocks or special chart content types
            * Template-specific content should be preserved but not included as regular content blocks if it's placeholder syntax
            * Focus on actual educational content, not template/placeholder instructions

            **Content Guidelines per Slide:**
            * Keep content focused - each slide should cover one main concept
            * Limit text per slide for readability
            * Use mix of content types for visual variety
            * Maintain logical flow between slides
            * Preserve educational value while supporting visual templates

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
        else:
            logger.warning(f"Unknown component_name '{selected_design_template.component_name}' for DT ID {selected_design_template.id}. Defaulting to TrainingPlanDetails for parsing.")
            target_content_model = TrainingPlanDetails
            default_error_instance = TrainingPlanDetails(mainTitle=f"LLM Config Error for {project_data.projectName}", sections=[])
            llm_json_example = DEFAULT_TRAINING_PLAN_JSON_EXAMPLE_FOR_LLM
            component_specific_instructions = "Parse the content according to the JSON example provided."


        if hasattr(default_error_instance, 'detectedLanguage'):
                default_error_instance.detectedLanguage = detect_language(project_data.aiResponse)

        parsed_content_model_instance = await parse_ai_response_with_llm(
            ai_response=project_data.aiResponse,
            project_name=project_data.projectName,
            target_model=target_content_model,
            default_error_model_instance=default_error_instance,
            dynamic_instructions=component_specific_instructions,
            target_json_example=llm_json_example
        )

        logger.info(f"LLM Parsing Result Type: {type(parsed_content_model_instance).__name__}")
        logger.info(f"LLM Parsed Content (first 200 chars): {str(parsed_content_model_instance.model_dump_json())[:200]}") # Use model_dump_json()

        content_to_store_for_db = parsed_content_model_instance.model_dump(mode='json', exclude_none=True)
        derived_product_type = selected_design_template.microproduct_type
        derived_microproduct_type = selected_design_template.template_name

        logger.info(f"Content prepared for DB storage (first 200 chars of JSON): {str(content_to_store_for_db)[:200]}")

        insert_query = """
        INSERT INTO projects (
            onyx_user_id, project_name, product_type, microproduct_type,
            microproduct_name, microproduct_content, design_template_id, source_chat_session_id, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING id, onyx_user_id, project_name, product_type, microproduct_type, microproduct_name,
                  microproduct_content, design_template_id, source_chat_session_id, created_at;
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
                project_data.chatSessionId
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
                    final_content_for_response = SlideDeckDetails(**db_content_dict)
                    logger.info("Re-parsed as SlideDeckDetails.")
                else:
                    logger.warning(f"Unknown component_name '{component_name_from_db}' when re-parsing content from DB on add. Attempting generic TrainingPlanDetails fallback.")
                    # Round hours to integers before parsing to prevent float validation errors
                    db_content_dict = round_hours_in_content(db_content_dict)
                    final_content_for_response = TrainingPlanDetails(**db_content_dict)
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
                    parsed_content_for_response = TrainingPlanDetails(**db_content_json)
                elif component_name == COMPONENT_NAME_VIDEO_LESSON:
                    parsed_content_for_response = VideoLessonData(**db_content_json)
                elif component_name == COMPONENT_NAME_QUIZ:
                    parsed_content_for_response = QuizData(**db_content_json)
                elif component_name == COMPONENT_NAME_SLIDE_DECK:
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

@app.get("/api/custom/projects", response_model=List[ProjectApiResponse])
async def get_user_projects_list_from_db(
    onyx_user_id: str = Depends(get_current_onyx_user_id),
    pool: asyncpg.Pool = Depends(get_db_pool),
    folder_id: Optional[int] = None
):
    select_query = """
        SELECT p.id, p.project_name, p.microproduct_name, p.created_at, p.design_template_id,
               dt.template_name as design_template_name,
               dt.microproduct_type as design_microproduct_type,
               p.folder_id, p."order", p.microproduct_content
        FROM projects p
        LEFT JOIN design_templates dt ON p.design_template_id = dt.id
        WHERE p.onyx_user_id = $1 {folder_filter}
        ORDER BY p."order" ASC, p.created_at DESC;
    """
    folder_filter = ""
    params = [onyx_user_id]
    if folder_id is not None:
        folder_filter = "AND p.folder_id = $2"
        params.append(folder_id)
    query = select_query.format(folder_filter=folder_filter)
    async with pool.acquire() as conn:
        db_rows = await conn.fetch(query, *params)
    projects_list: List[ProjectApiResponse] = []
    for row_data in db_rows:
        row_dict = dict(row_data)
        project_slug = create_slug(row_dict.get('project_name'))
        projects_list.append(ProjectApiResponse(
            id=row_dict["id"], projectName=row_dict["project_name"], projectSlug=project_slug,
            microproduct_name=row_dict.get("microproduct_name"),
            design_template_name=row_dict.get("design_template_name"),
            design_microproduct_type=row_dict.get("design_microproduct_type"),
            created_at=row_dict["created_at"], design_template_id=row_dict.get("design_template_id"),
            folder_id=row_dict.get("folder_id"), order=row_dict.get("order"),
            microproduct_content=row_dict.get("microproduct_content")
        ))
    return projects_list

@app.get("/api/custom/projects/view/{project_id}", response_model=MicroProductApiResponse, responses={404: {"model": ErrorDetail}})
async def get_project_instance_detail(project_id: int, onyx_user_id: str = Depends(get_current_onyx_user_id), pool: asyncpg.Pool = Depends(get_db_pool)):
    select_query = """
        SELECT p.*, dt.template_name as design_template_name, dt.microproduct_type as design_microproduct_type, dt.component_name
        FROM projects p
        LEFT JOIN design_templates dt ON p.design_template_id = dt.id
        WHERE p.id = $1 AND p.onyx_user_id = $2
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
    
    # Parse the details_data if it's a JSON string
    parsed_details = None
    if details_data:
        if isinstance(details_data, str):
            try:
                # Parse JSON string to dict
                details_dict = json.loads(details_data)
                # Round hours to integers in the content before returning
                details_dict = round_hours_in_content(details_dict)
                parsed_details = details_dict
            except (json.JSONDecodeError, TypeError) as e:
                logger.error(f"Failed to parse microproduct_content JSON for project {project_id}: {e}")
                parsed_details = None
        else:
            # Already a dict, just round hours
            parsed_details = round_hours_in_content(details_data)
    
    web_link_path = None
    pdf_link_path = None
    return MicroProductApiResponse(
        name=project_instance_name, slug=project_slug, project_id=project_id,
        design_template_id=row_dict["design_template_id"], component_name=component_name,
        webLinkPath=web_link_path, pdfLinkPath=pdf_link_path, details=parsed_details,
        sourceChatSessionId=row_dict.get("source_chat_session_id"),
        parentProjectName=row_dict.get('project_name')
        # folder_id is not in MicroProductApiResponse, but can be added if needed
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
                                    if time_str.endswith('m'):
                                        try:
                                            minutes = int(time_str[:-1])
                                            total_completion_minutes += minutes
                                        except ValueError:
                                            pass
                                    elif time_str.endswith('h'):
                                        try:
                                            hours = int(time_str[:-1])
                                            total_completion_minutes += (hours * 60)
                                        except ValueError:
                                            pass
                                    elif time_str.isdigit():
                                        try:
                                            total_completion_minutes += int(time_str)
                                        except ValueError:
                                            pass
                        
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
        context_for_jinja = {
            'details': data_for_template_render, 
            'locale': current_pdf_locale_strings,
            'parentProjectName': parentProjectName,
            'lessonNumber': lessonNumber
        }
        
        # Add column visibility settings for Training Plan PDFs
        if component_name == COMPONENT_NAME_TRAINING_PLAN:
            column_visibility = {
                'knowledgeCheck': knowledgeCheck == '1' if knowledgeCheck else True,
                'contentAvailability': contentAvailability == '1' if contentAvailability else True,
                'informationSource': informationSource == '1' if informationSource else True,
                'time': time == '1' if time else True,
                'estCompletionTime': estCompletionTime == '1' if estCompletionTime else True,
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
                        # Not an outline – nothing extra to move
                        continue

                    # Select IDs of all projects whose name equals outline_name OR starts with outline_name + ': '
                    pattern = outline_name + ":%"
                    lesson_rows = await conn.fetch(
                        "SELECT id FROM projects WHERE onyx_user_id=$1 AND (project_name = $2 OR project_name LIKE $3)",
                        onyx_user_id, outline_name, pattern
                    )
                    for lr in lesson_rows:
                        project_ids_to_trash.add(lr["id"])

            if not project_ids_to_trash:
                 return JSONResponse(status_code=status.HTTP_200_OK, content={"detail": "No projects found to move to trash."})

            # First, fetch all the data we need to move to trash
            projects_to_trash = await conn.fetch("""
                SELECT 
                    id, onyx_user_id, project_name, product_type, microproduct_type,
                    microproduct_name, microproduct_content, design_template_id, created_at,
                    source_chat_session_id, folder_id, "order", completion_time
                FROM projects 
                WHERE id = ANY($1::bigint[]) AND onyx_user_id = $2
            """, list(project_ids_to_trash), onyx_user_id)

            if not projects_to_trash:
                return JSONResponse(status_code=status.HTTP_200_OK, content={"detail": "No projects found to move to trash."})

            async with conn.transaction():
                # Process each project individually to handle data conversion safely
                for project in projects_to_trash:
                    # Safely convert order and completion_time to strings (never integers)
                    order_value = "0"
                    completion_time_value = "0"
                    
                    # Handle order field - always convert to string
                    if project['order'] is not None:
                        try:
                            if isinstance(project['order'], str):
                                if project['order'].strip() and project['order'].isdigit():
                                    order_value = project['order'].strip()
                                else:
                                    order_value = "0"
                            else:
                                # Convert any non-string value to string
                                order_value = str(project['order']) if project['order'] is not None else "0"
                        except (ValueError, TypeError):
                            order_value = "0"
                    
                    # Handle completion_time field - always convert to string
                    if project['completion_time'] is not None:
                        try:
                            if isinstance(project['completion_time'], str):
                                if project['completion_time'].strip() and project['completion_time'].isdigit():
                                    completion_time_value = project['completion_time'].strip()
                                else:
                                    completion_time_value = "0"
                            else:
                                # Convert any non-string value to string
                                completion_time_value = str(project['completion_time']) if project['completion_time'] is not None else "0"
                        except (ValueError, TypeError):
                            completion_time_value = "0"

                    # Insert into trashed_projects with safe values
                    await conn.execute("""
                        INSERT INTO trashed_projects (
                            id, onyx_user_id, project_name, product_type, microproduct_type, 
                            microproduct_name, microproduct_content, design_template_id, created_at,
                            source_chat_session_id, folder_id, "order", completion_time
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    """,
                        project['id'], project['onyx_user_id'], project['project_name'],
                        project['product_type'], project['microproduct_type'], project['microproduct_name'],
                        project['microproduct_content'], project['design_template_id'], project['created_at'],
                        project['source_chat_session_id'], project['folder_id'], order_value, completion_time_value
                    )

                # Delete from projects table
                result_status = await conn.execute(
                    "DELETE FROM projects WHERE id = ANY($1::bigint[]) AND onyx_user_id = $2",
                    list(project_ids_to_trash), onyx_user_id
                )
        
        deleted_count_match = re.search(r"DELETE\s+(\d+)", result_status)
        deleted_count = int(deleted_count_match.group(1)) if deleted_count_match else 0
        
        logger.info(f"User {onyx_user_id} moved IDs {list(project_ids_to_trash)} to trash. Count: {deleted_count}.")
        return JSONResponse(status_code=status.HTTP_200_OK, content={"detail": f"Successfully moved {deleted_count} project(s) to trash."})

    except Exception as e:
        logger.error(f"Error moving projects to trash for user {onyx_user_id}, IDs {delete_request.project_ids}: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "An error occurred while sending projects to trash." if IS_PRODUCTION else f"Database error during trash operation: {str(e)}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)

# --- Analytics Endpoints ---

@app.get("/api/custom/analytics/dashboard", response_model=Dict[str, Any])
async def get_analytics_dashboard(
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    endpoint: Optional[str] = Query(None, description="Filter by endpoint"),
    method: Optional[str] = Query(None, description="Filter by HTTP method"),
    status_code: Optional[int] = Query(None, description="Filter by status code"),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    """Get comprehensive analytics dashboard data"""
    import json
    
    print(f"=== DASHBOARD DEBUG: Incoming parameters ===")
    print(f"date_from: {date_from}")
    print(f"date_to: {date_to}")
    print(f"=== END PARAMETERS ===")

    try:
        # DEBUG: Print the latest 10 rows from request_analytics
        async with pool.acquire() as conn:
            debug_rows = await conn.fetch(
                "SELECT id, endpoint, method, status_code, created_at FROM request_analytics ORDER BY created_at DESC LIMIT 10"
            )
            print("=== DEBUG: Latest 10 rows from request_analytics ===")
            for row in debug_rows:
                print(dict(row))
            print("=== END DEBUG ===")
            
            # DEBUG: Check specifically for AI parser records
            ai_parser_rows = await conn.fetch(
                "SELECT id, endpoint, method, status_code, is_ai_parser_request, ai_parser_tokens, ai_parser_model, ai_parser_project_name, created_at FROM request_analytics WHERE is_ai_parser_request = true ORDER BY created_at DESC LIMIT 10"
            )
            print("=== DEBUG: AI Parser records from request_analytics ===")
            for row in ai_parser_rows:
                print(dict(row))
            print(f"Total AI parser records found: {len(ai_parser_rows)}")
            print("=== END AI PARSER DEBUG ===")
            
            # DEBUG: Check if the columns exist and have any data
            column_check = await conn.fetch(
                "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'request_analytics' ORDER BY ordinal_position"
            )
            print("=== DEBUG: All request_analytics columns check ===")
            for row in column_check:
                print(dict(row))
            print("=== END COLUMN CHECK ===")
            
            # DEBUG: Check for any records with non-null ai_parser fields
            any_ai_parser_data = await conn.fetch(
                "SELECT id, endpoint, is_ai_parser_request, ai_parser_tokens, ai_parser_model, ai_parser_project_name FROM request_analytics WHERE is_ai_parser_request IS NOT NULL OR ai_parser_tokens IS NOT NULL OR ai_parser_model IS NOT NULL OR ai_parser_project_name IS NOT NULL ORDER BY created_at DESC LIMIT 5"
            )
            print("=== DEBUG: Any AI parser data ===")
            for row in any_ai_parser_data:
                print(dict(row))
            print(f"Total records with any AI parser data: {len(any_ai_parser_data)}")
            print("=== END ANY AI PARSER DATA ===")
    except Exception as e:
        print(f"DEBUG ERROR: Could not fetch request_analytics: {e}")

    try:
        # Build comprehensive filter with proper datetime conversion including timezone
        conditions = []
        params = []
        param_count = 0
        
        if date_from:
            param_count += 1
            conditions.append(f"created_at >= ${param_count}")
            start_datetime = datetime.strptime(date_from, '%Y-%m-%d').replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
            params.append(start_datetime)
        
        if date_to:
            param_count += 1
            conditions.append(f"created_at <= ${param_count}")
            end_datetime = datetime.strptime(date_to, '%Y-%m-%d').replace(hour=23, minute=59, second=59, microsecond=999999, tzinfo=timezone.utc)
            params.append(end_datetime)
        
        if endpoint:
            param_count += 1
            conditions.append(f"endpoint ILIKE ${param_count}")
            params.append(f"%{endpoint}%")
        
        if method:
            param_count += 1
            conditions.append(f"method = ${param_count}")
            params.append(method.upper())
        
        if status_code is not None:
            param_count += 1
            conditions.append(f"status_code = ${param_count}")
            params.append(status_code)
        
        where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
        
        print(f"=== DASHBOARD DEBUG: Filter and params ===")
        print(f"where_clause: {where_clause}")
        print(f"params: {params}")
        print(f"=== END FILTER ===")

        async with pool.acquire() as conn:
            # Overall statistics
            stats_query = f"""
                SELECT 
                    COUNT(*) as total_requests,
                    COUNT(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 END) as successful_requests,
                    COUNT(CASE WHEN status_code >= 400 THEN 1 END) as failed_requests,
                    COUNT(CASE WHEN error_message IS NOT NULL THEN 1 END) as error_requests,
                    AVG(response_time_ms) as avg_response_time,
                    MAX(response_time_ms) as max_response_time,
                    MIN(response_time_ms) as min_response_time,
                    SUM(COALESCE(request_size_bytes, 0) + COALESCE(response_size_bytes, 0)) as total_data_transferred,
                    COUNT(DISTINCT user_id) as unique_users,
                    COUNT(DISTINCT endpoint) as unique_endpoints,
                    COUNT(CASE WHEN is_ai_parser_request THEN 1 END) as ai_parser_requests,
                    AVG(ai_parser_tokens) as avg_ai_parser_tokens,
                    MAX(ai_parser_tokens) as max_ai_parser_tokens,
                    MIN(ai_parser_tokens) as min_ai_parser_tokens,
                    SUM(ai_parser_tokens) as total_ai_parser_tokens
                FROM request_analytics
                {where_clause}
            """
            print(f"=== DASHBOARD DEBUG: Stats query ===")
            print(f"Query: {stats_query}")
            print(f"Params: {params}")
            stats_row = await conn.fetchrow(stats_query, *params)
            print(f"Stats result: {dict(stats_row) if stats_row else 'None'}")
            
            # Debug AI parser specific data
            if stats_row:
                print(f"=== AI PARSER DEBUG ===")
                print(f"ai_parser_requests: {stats_row['ai_parser_requests']}")
                print(f"avg_ai_parser_tokens: {stats_row['avg_ai_parser_tokens']}")
                print(f"max_ai_parser_tokens: {stats_row['max_ai_parser_tokens']}")
                print(f"min_ai_parser_tokens: {stats_row['min_ai_parser_tokens']}")
                print(f"total_ai_parser_tokens: {stats_row['total_ai_parser_tokens']}")
                print(f"=== END AI PARSER DEBUG ===")
            
            print(f"=== END STATS ===")
            
            # Status code distribution
            status_query = f"""
                SELECT 
                    status_code,
                    COUNT(*) as count,
                    AVG(response_time_ms) as avg_time
                FROM request_analytics
                {where_clause}
                GROUP BY status_code
                ORDER BY count DESC
            """
            print(f"=== DASHBOARD DEBUG: Status query ===")
            print(f"Query: {status_query}")
            print(f"Params: {params}")
            status_rows = await conn.fetch(status_query, *params)
            print(f"Status rows count: {len(status_rows)}")
            print(f"Status results: {[dict(row) for row in status_rows]}")
            print(f"=== END STATUS ===")
            
            # Top endpoints by request count
            endpoints_query = f"""
                SELECT 
                    endpoint,
                    method,
                    COUNT(*) as request_count,
                    AVG(response_time_ms) as avg_response_time,
                    COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count,
                    SUM(COALESCE(request_size_bytes, 0) + COALESCE(response_size_bytes, 0)) as total_data
                FROM request_analytics
                {where_clause}
                GROUP BY endpoint, method
                ORDER BY request_count DESC
                LIMIT 20
            """
            endpoints_rows = await conn.fetch(endpoints_query, *params)
            
            # Top users by request count
            users_query = f"""
                SELECT 
                    user_id,
                    COUNT(*) as request_count,
                    AVG(response_time_ms) as avg_response_time,
                    COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count,
                    MAX(created_at) as last_request
                FROM request_analytics
                {where_clause}
                {"AND user_id IS NOT NULL" if where_clause else "WHERE user_id IS NOT NULL"}
                GROUP BY user_id
                ORDER BY request_count DESC
                LIMIT 20
            """
            users_rows = await conn.fetch(users_query, *params)
            
            # Hourly distribution
            hourly_query = f"""
                SELECT 
                    EXTRACT(HOUR FROM created_at) as hour,
                    COUNT(*) as request_count,
                    AVG(response_time_ms) as avg_response_time
                FROM request_analytics
                {where_clause}
                GROUP BY EXTRACT(HOUR FROM created_at)
                ORDER BY hour
            """
            hourly_rows = await conn.fetch(hourly_query, *params)
            
            # Daily distribution
            daily_query = f"""
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as request_count,
                    AVG(response_time_ms) as avg_response_time,
                    COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count
                FROM request_analytics
                {where_clause}
                GROUP BY DATE(created_at)
                ORDER BY date DESC
                LIMIT 30
            """
            daily_rows = await conn.fetch(daily_query, *params)
            
            # Method distribution
            method_query = f"""
                SELECT 
                    method,
                    COUNT(*) as request_count,
                    AVG(response_time_ms) as avg_response_time,
                    COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count
                FROM request_analytics
                {where_clause}
                GROUP BY method
                ORDER BY request_count DESC
            """
            method_rows = await conn.fetch(method_query, *params)
            
            # Recent errors
            errors_query = f"""
                SELECT 
                    id,
                    endpoint,
                    method,
                    status_code,
                    response_time_ms,
                    error_message,
                    user_id,
                    created_at
                FROM request_analytics
                {where_clause}
                {"AND (error_message IS NOT NULL OR status_code >= 400)" if where_clause else "WHERE error_message IS NOT NULL OR status_code >= 400"}
                ORDER BY created_at DESC
                LIMIT 50
            """
            errors_rows = await conn.fetch(errors_query, *params)
            
            # Performance percentiles
            percentile_query = f"""
                SELECT 
                    percentile_cont(0.5) WITHIN GROUP (ORDER BY response_time_ms) as p50,
                    percentile_cont(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95,
                    percentile_cont(0.99) WITHIN GROUP (ORDER BY response_time_ms) as p99
                FROM request_analytics
                {where_clause}
            """
            percentile_row = await conn.fetchrow(percentile_query, *params)

        response_data = {
            "overview": {
                "total_requests": stats_row["total_requests"],
                "successful_requests": stats_row["successful_requests"],
                "failed_requests": stats_row["failed_requests"],
                "error_requests": stats_row["error_requests"],
                "success_rate": round((stats_row["successful_requests"] / stats_row["total_requests"]) * 100, 2) if stats_row["total_requests"] > 0 else 0,
                "avg_response_time": round(stats_row["avg_response_time"], 2) if stats_row["avg_response_time"] else 0,
                "max_response_time": stats_row["max_response_time"],
                "min_response_time": stats_row["min_response_time"],
                "total_data_transferred": stats_row["total_data_transferred"],
                "unique_users": stats_row["unique_users"],
                "unique_endpoints": stats_row["unique_endpoints"],
                "ai_parser_requests": stats_row["ai_parser_requests"] or 0,
                "avg_ai_parser_tokens": round(stats_row["avg_ai_parser_tokens"], 2) if stats_row["avg_ai_parser_tokens"] else 0,
                "max_ai_parser_tokens": stats_row["max_ai_parser_tokens"] or 0,
                "min_ai_parser_tokens": stats_row["min_ai_parser_tokens"] or 0,
                "total_ai_parser_tokens": stats_row["total_ai_parser_tokens"] or 0
            },
            "status_distribution": [{"status_code": row["status_code"], "count": row["count"], "avg_time": round(row["avg_time"], 2) if row["avg_time"] else 0} for row in status_rows],
            "top_endpoints": [{
                "endpoint": row["endpoint"],
                "method": row["method"],
                "request_count": row["request_count"],
                "avg_response_time": round(row["avg_response_time"], 2) if row["avg_response_time"] else 0,
                "error_count": row["error_count"],
                "error_rate": round((row["error_count"] / row["request_count"]) * 100, 2) if row["request_count"] > 0 else 0,
                "total_data": row["total_data"]
            } for row in endpoints_rows],
            "top_users": [{
                "user_id": row["user_id"],
                "request_count": row["request_count"],
                "avg_response_time": round(row["avg_response_time"], 2) if row["avg_response_time"] else 0,
                "error_count": row["error_count"],
                "last_request": row["last_request"].isoformat() if row["last_request"] else None
            } for row in users_rows],
            "hourly_distribution": [{"hour": int(row["hour"]), "request_count": row["request_count"], "avg_response_time": round(row["avg_response_time"], 2) if row["avg_response_time"] else 0} for row in hourly_rows],
            "daily_distribution": [{
                "date": row["date"].isoformat(),
                "request_count": row["request_count"],
                "avg_response_time": round(row["avg_response_time"], 2) if row["avg_response_time"] else 0,
                "error_count": row["error_count"]
            } for row in daily_rows],
            "method_distribution": [{
                "method": row["method"],
                "request_count": row["request_count"],
                "avg_response_time": round(row["avg_response_time"], 2) if row["avg_response_time"] else 0,
                "error_count": row["error_count"]
            } for row in method_rows],
            "recent_errors": [{
                "id": row["id"],
                "endpoint": row["endpoint"],
                "method": row["method"],
                "status_code": row["status_code"],
                "response_time_ms": row["response_time_ms"],
                "error_message": row["error_message"],
                "user_id": row["user_id"],
                "created_at": row["created_at"].isoformat()
            } for row in errors_rows],
            "performance_percentiles": {
                "p50": round(percentile_row["p50"], 2) if percentile_row["p50"] else 0,
                "p95": round(percentile_row["p95"], 2) if percentile_row["p95"] else 0,
                "p99": round(percentile_row["p99"], 2) if percentile_row["p99"] else 0
            }
        }
        
        print(f"=== DASHBOARD DEBUG: Final response ===")
        print(f"Response overview: {response_data['overview']}")
        print(f"Status distribution count: {len(response_data['status_distribution'])}")
        print(f"Top endpoints count: {len(response_data['top_endpoints'])}")
        print(f"=== END FINAL RESPONSE ===")
        
        return response_data
    except Exception as e:
        logger.error(f"Error fetching analytics dashboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics data")


@app.get("/api/custom/analytics/requests", response_model=List[RequestAnalytics])
async def get_analytics_requests(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=1000, description="Items per page"),
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    status_code: Optional[int] = Query(None, description="Filter by status code"),
    method: Optional[str] = Query(None, description="Filter by HTTP method"),
    endpoint: Optional[str] = Query(None, description="Filter by endpoint"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    min_response_time: Optional[int] = Query(None, description="Minimum response time in ms"),
    max_response_time: Optional[int] = Query(None, description="Maximum response time in ms"),
    has_error: Optional[bool] = Query(None, description="Filter by error status"),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    """Get paginated request analytics with filters"""
    try:
        # Build WHERE clause
        conditions = []
        params = []
        param_count = 0
        
        if date_from:
            param_count += 1
            conditions.append(f"created_at >= ${param_count}")
            start_datetime = datetime.strptime(date_from, '%Y-%m-%d').replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
            params.append(start_datetime)
        
        if date_to:
            param_count += 1
            conditions.append(f"created_at <= ${param_count}")
            end_datetime = datetime.strptime(date_to, '%Y-%m-%d').replace(hour=23, minute=59, second=59, microsecond=999999, tzinfo=timezone.utc)
            params.append(end_datetime)
        
        if status_code is not None:
            param_count += 1
            conditions.append(f"status_code = ${param_count}")
            params.append(status_code)
        
        if method:
            param_count += 1
            conditions.append(f"method = ${param_count}")
            params.append(method)
        
        if endpoint:
            param_count += 1
            conditions.append(f"endpoint ILIKE ${param_count}")
            params.append(f"%{endpoint}%")
        
        if user_id:
            param_count += 1
            conditions.append(f"user_id = ${param_count}")
            params.append(user_id)
        
        if min_response_time is not None:
            param_count += 1
            conditions.append(f"response_time_ms >= ${param_count}")
            params.append(min_response_time)
        
        if max_response_time is not None:
            param_count += 1
            conditions.append(f"response_time_ms <= ${param_count}")
            params.append(max_response_time)
        
        if has_error is not None:
            if has_error:
                conditions.append("(error_message IS NOT NULL OR status_code >= 400)")
            else:
                conditions.append("(error_message IS NULL AND status_code < 400)")
        
        where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
        
        # Calculate offset
        offset = (page - 1) * limit
        
        # Build query
        query = f"""
            SELECT 
                id, endpoint, method, user_id, status_code, 
                response_time_ms, request_size_bytes, response_size_bytes,
                error_message, created_at
            FROM request_analytics
            {where_clause}
            ORDER BY created_at DESC
            LIMIT ${param_count + 1} OFFSET ${param_count + 2}
        """
        params.extend([limit, offset])
        
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, *params)
            
            return [RequestAnalytics(**dict(row)) for row in rows]
            
    except Exception as e:
        logger.error(f"Error fetching analytics requests: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch request data")


@app.get("/api/custom/analytics/export")
async def export_analytics_data(
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    endpoint: Optional[str] = Query(None, description="Filter by endpoint"),
    method: Optional[str] = Query(None, description="Filter by HTTP method"),
    status_code: Optional[int] = Query(None, description="Filter by status code"),
    format: str = Query("csv", description="Export format (csv or json)"),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    """Export analytics data as CSV or JSON"""
    try:
        # Build comprehensive filter with proper datetime conversion including timezone
        conditions = []
        params = []
        param_count = 0
        
        if date_from:
            param_count += 1
            conditions.append(f"created_at >= ${param_count}")
            start_datetime = datetime.strptime(date_from, '%Y-%m-%d').replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
            params.append(start_datetime)
        
        if date_to:
            param_count += 1
            conditions.append(f"created_at <= ${param_count}")
            end_datetime = datetime.strptime(date_to, '%Y-%m-%d').replace(hour=23, minute=59, second=59, microsecond=999999, tzinfo=timezone.utc)
            params.append(end_datetime)
        
        if endpoint:
            param_count += 1
            conditions.append(f"endpoint ILIKE ${param_count}")
            params.append(f"%{endpoint}%")
        
        if method:
            param_count += 1
            conditions.append(f"method = ${param_count}")
            params.append(method.upper())
        
        if status_code is not None:
            param_count += 1
            conditions.append(f"status_code = ${param_count}")
            params.append(status_code)
        
        where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""

        async with pool.acquire() as conn:
            query = f"""
                SELECT 
                    id, endpoint, method, user_id, status_code, 
                    response_time_ms, request_size_bytes, response_size_bytes,
                    error_message, created_at
                FROM request_analytics
                {where_clause}
                ORDER BY created_at DESC
            """
            rows = await conn.fetch(query, *params)
            
            if format.lower() == "csv":
                import csv
                import io
                
                output = io.StringIO()
                writer = csv.writer(output)
                
                # Write header
                writer.writerow([
                    "ID", "Endpoint", "Method", "User ID", "Status Code",
                    "Response Time (ms)", "Request Size (bytes)", "Response Size (bytes)",
                    "Error Message", "Created At"
                ])
                
                # Write data
                for row in rows:
                    writer.writerow([
                        row["id"], row["endpoint"], row["method"], row["user_id"],
                        row["status_code"], row["response_time_ms"],
                        row["request_size_bytes"], row["response_size_bytes"],
                        row["error_message"], row["created_at"].isoformat()
                    ])
                
                return StreamingResponse(
                    io.BytesIO(output.getvalue().encode()),
                    media_type="text/csv",
                    headers={"Content-Disposition": f"attachment; filename=analytics_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
                )
            else:
                # JSON format
                data = [{
                    "id": row["id"],
                    "endpoint": row["endpoint"],
                    "method": row["method"],
                    "user_id": row["user_id"],
                    "status_code": row["status_code"],
                    "response_time_ms": row["response_time_ms"],
                    "request_size_bytes": row["request_size_bytes"],
                    "response_size_bytes": row["response_size_bytes"],
                    "error_message": row["error_message"],
                    "created_at": row["created_at"].isoformat()
                } for row in rows]
                
                return JSONResponse(
                    content=data,
                    headers={"Content-Disposition": f"attachment; filename=analytics_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"}
                )
                
    except Exception as e:
        logger.error(f"Error exporting analytics data: {e}")
        raise HTTPException(status_code=500, detail="Failed to export analytics data")


@app.get("/api/custom/health")
async def health_check():
    return {"status": "healthy"}

HeadlineBlock.model_rebuild()
ParagraphBlock.model_rebuild()
AlertBlock.model_rebuild()
SectionBreakBlock.model_rebuild()
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

# ========================= Wizard Course Outline Endpoints =========================

class OutlineWizardPreview(BaseModel):
    prompt: str
    modules: int
    lessonsPerModule: str
    language: str = "en"
    chatSessionId: Optional[str] = None
    # NEW: full markdown string of the current outline so the assistant can apply
    # targeted changes when the user sends an incremental "edit" prompt.
    originalOutline: Optional[str] = None
    # NEW: file context for creation from documents
    fromFiles: Optional[bool] = None
    folderIds: Optional[str] = None  # comma-separated folder IDs
    fileIds: Optional[str] = None    # comma-separated file IDs
    # NEW: text context for creation from user text
    fromText: Optional[bool] = None
    textMode: Optional[str] = None   # "context" or "base"
    userText: Optional[str] = None   # User's pasted text
    theme: Optional[str] = None  # Selected theme from frontend

class OutlineWizardFinalize(BaseModel):
    prompt: str
    modules: int
    lessonsPerModule: str
    language: str = "en"
    chatSessionId: Optional[str] = None
    editedOutline: Dict[str, Any]
    # NEW: file context for creation from documents
    fromFiles: Optional[bool] = None
    folderIds: Optional[str] = None  # comma-separated folder IDs
    fileIds: Optional[str] = None    # comma-separated file IDs
    # NEW: text context for creation from user text
    fromText: Optional[bool] = None
    textMode: Optional[str] = None   # "context" or "base"
    userText: Optional[str] = None   # User's pasted text
    theme: Optional[str] = None  # Selected theme from frontend

_CONTENTBUILDER_PERSONA_CACHE: Optional[int] = None

async def get_contentbuilder_persona_id(cookies: Dict[str, str]) -> int:
    """Return persona id of the default ContentBuilder assistant (cached)."""
    global _CONTENTBUILDER_PERSONA_CACHE
    if _CONTENTBUILDER_PERSONA_CACHE is not None:
        return _CONTENTBUILDER_PERSONA_CACHE
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(f"{ONYX_API_SERVER_URL}/persona", cookies=cookies)
        resp.raise_for_status()
        personas = resp.json()
        # naive: first persona marked is_default_persona and has name 'ContentBuilder'
        for p in personas:
            if p.get("is_default_persona") or "contentbuilder" in p.get("name", "").lower():
                _CONTENTBUILDER_PERSONA_CACHE = p["id"]
                return _CONTENTBUILDER_PERSONA_CACHE
    raise HTTPException(status_code=500, detail="Could not locate ContentBuilder persona")

async def create_onyx_chat_session(persona_id: int, cookies: Dict[str, str]) -> str:
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(
            f"{ONYX_API_SERVER_URL}/chat/create-chat-session",
            json={"persona_id": persona_id, "description": None},
            cookies=cookies,
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("chat_session_id") or data.get("chatSessionId")

async def stream_chat_message(chat_session_id: str, message: str, cookies: Dict[str, str]) -> str:
    """Send message via Onyx non-streaming simple API and return the full answer."""
    logger.debug(f"[stream_chat_message] chat_id={chat_session_id} len(message)={len(message)}")

    async with httpx.AsyncClient(timeout=300.0) as client:
        minimal_retrieval = {
            "run_search": "never",
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
            "retrieval_options": minimal_retrieval,
            "stream_response": False,
        }
        # Prefer the non-streaming simplified endpoint if available (much faster and avoids nginx timeouts)
        simple_url = f"{ONYX_API_SERVER_URL}/chat/send-message-simple-api"
        logger.debug(f"[stream_chat_message] POST {simple_url} (preferred) ...")
        try:
            resp = await client.post(simple_url, json=payload, cookies=cookies)
            if resp.status_code == 404:
                raise HTTPStatusError("simple api not found", request=resp.request, response=resp)
        except HTTPStatusError:
            logger.debug("[stream_chat_message] simple-api not available, falling back to generic endpoint")
            # Fallback to the generic endpoint (may stream)
            resp = await client.post(
                f"{ONYX_API_SERVER_URL}/chat/send-message",
                json=payload,
                cookies=cookies,
            )
        logger.debug(f"[stream_chat_message] Response status={resp.status_code} ctype={resp.headers.get('content-type')}")
        resp.raise_for_status()
        # Depending on deployment, Onyx may return SSE stream or JSON.
        ctype = resp.headers.get("content-type", "")
        if ctype.startswith("text/event-stream"):
            full_answer = ""
            async for line in resp.aiter_lines():
                if not line or not line.startswith("data: "):
                    continue
                payload = line.removeprefix("data: ").strip()
                if payload == "[DONE]":
                    break
                try:
                    packet = json.loads(payload)
                except Exception:
                    continue
                if packet.get("answer_piece"):
                    full_answer += packet["answer_piece"]
            return full_answer
        # Fallback JSON response
        try:
            data = resp.json()
            return data.get("answer") or data.get("answer_citationless") or ""
        except Exception:
            return resp.text.strip()

# ------------ utility to parse markdown outline (very simple) -------------

def _parse_outline_markdown(md: str) -> List[Dict[str, Any]]:
    """Parse the markdown outline produced by the assistant into a lightweight
    list-of-modules representation expected by the wizard UI.

    Now also captures the "Total Time" line for each module and stores it as
    `totalHours` (float).
    """
    logger.info(f"[PARSE_OUTLINE] Starting parse with input length: {len(md)}")
    logger.info(f"[PARSE_OUTLINE] Input preview: {md[:200]}{'...' if len(md) > 200 else ''}")
    
    modules: List[Dict[str, Any]] = []
    current: Optional[Dict[str, Any]] = None

    list_item_regex = re.compile(r"^(?:- |\* |\d+\.)")
    _buf: List[str] = []  # buffer for current lesson lines

    def flush_current_lesson(buf: List[str]) -> Optional[str]:
        """Combine buffered lines into a single lesson string."""
        if not buf:
            return None
        return "\n".join(buf)

    lines_processed = 0
    for raw_line in md.splitlines():
        lines_processed += 1
        if not raw_line.strip():
            continue  # skip empty lines

        indent = len(raw_line) - len(raw_line.lstrip())
        line = raw_line.lstrip()

        # Module detection
        if line.startswith("## "):
            # flush any buffered lesson into previous module before switching
            if current:
                last_lesson = flush_current_lesson(_buf)
                if last_lesson:
                    current["lessons"].append(last_lesson)
                _buf = []

            title_part = line.lstrip("# ").strip()
            if ":" in title_part:
                title_part = title_part.split(":", 1)[-1].strip()
            current = {
                "id": f"mod{len(modules) + 1}",
                "title": title_part,
                "totalHours": 0.0,
                "lessons": [],
            }
            modules.append(current)
            logger.debug(f"[PARSE_OUTLINE] Found module: {title_part}")
            continue

        # Lesson detection – only consider top-level list items (indent == 0)
        if current:
            # Capture Total Time lines before lessons
            m_time = re.match(r"(?:Total Time|Общее время|Загальний час)\s*:\s*([0-9]+(?:\.[0-9]+)?)", line, re.IGNORECASE)
            if m_time:
                try:
                    current["totalHours"] = float(m_time.group(1))
                except ValueError:
                    pass  # leave default 0.0 if parsing fails

            if indent == 0 and list_item_regex.match(line):
                # Starting a new top-level lesson → flush previous buffer
                ls_string = flush_current_lesson(_buf) if '_buf' in locals() else None
                if ls_string:
                    current["lessons"].append(ls_string)
                _buf = []  # reset buffer for new lesson

                lesson_title = re.sub(r"^(?:- |\* |\d+\.\s*)", "", line).strip()
                if lesson_title.startswith("**") and "**" in lesson_title[2:]:
                    lesson_title = lesson_title.split("**", 2)[1].strip()
                _buf.append(lesson_title)
                logger.debug(f"[PARSE_OUTLINE] Found lesson: {lesson_title}")
                continue
            elif current.get('lessons') is not None and '_buf' in locals():
                # inside a lesson details block (indented)
                if indent > 0:
                    _buf.append(line)
                continue

    # flush buffer after loop to whichever module is active
    if current:
        last_lesson = flush_current_lesson(_buf)
        if last_lesson:
            current["lessons"].append(last_lesson)

    logger.info(f"[PARSE_OUTLINE] After main parsing: {len(modules)} modules found, {lines_processed} lines processed")

    # Fallback when no module headings present
    if not modules:
        logger.warning(f"[PARSE_OUTLINE] No modules found, using fallback parsing")
        tmp_module = {"id": "mod1", "title": "Outline", "lessons": []}
        fallback_lessons = 0
        for raw_line in md.splitlines():
            if not raw_line.strip():
                continue
            indent = len(raw_line) - len(raw_line.lstrip())
            line = raw_line.lstrip()
            if indent == 0 and list_item_regex.match(line):
                txt = re.sub(r"^(?:- |\* |\d+\.\s*)", "", line).strip()
                if txt.startswith("**") and "**" in txt[2:]:
                    txt = txt.split("**", 2)[1].strip()
                tmp_module["lessons"].append(txt)
                fallback_lessons += 1
        if not tmp_module["lessons"]:
            # As very last resort just dump all lines
            logger.warning(f"[PARSE_OUTLINE] No list items found, dumping all non-empty lines")
            tmp_module["lessons"] = [l.strip() for l in md.splitlines() if l.strip()]
            fallback_lessons = len(tmp_module["lessons"])
        modules.append(tmp_module)
        logger.info(f"[PARSE_OUTLINE] Fallback created 1 module with {fallback_lessons} lessons")

    logger.info(f"[PARSE_OUTLINE] Final result: {len(modules)} modules")
    for i, module in enumerate(modules):
        logger.info(f"[PARSE_OUTLINE] Module {i+1}: '{module.get('title', 'No title')}' with {len(module.get('lessons', []))} lessons")

    return modules

# ----------------------- ENDPOINTS ---------------------------------------

@app.post("/api/custom/course-outline/preview")
async def wizard_outline_preview(payload: OutlineWizardPreview, request: Request):
    logger.info(f"[PREVIEW_START] Course outline preview initiated")
    logger.info(f"[PREVIEW_PARAMS] prompt='{payload.prompt[:50]}...' modules={payload.modules} lessonsPerModule={payload.lessonsPerModule} lang={payload.language}")
    logger.info(f"[PREVIEW_PARAMS] fromFiles={payload.fromFiles} fromText={payload.fromText} textMode={payload.textMode}")
    logger.info(f"[PREVIEW_PARAMS] userText length={len(payload.userText) if payload.userText else 0}")
    logger.info(f"[PREVIEW_PARAMS] folderIds={payload.folderIds} fileIds={payload.fileIds}")
    
    cookies = {ONYX_SESSION_COOKIE_NAME: request.cookies.get(ONYX_SESSION_COOKIE_NAME)}
    logger.info(f"[PREVIEW_AUTH] Cookie present: {bool(cookies[ONYX_SESSION_COOKIE_NAME])}")

    if payload.chatSessionId:
        chat_id = payload.chatSessionId
        logger.info(f"[PREVIEW_CHAT] Using existing chat session: {chat_id}")
    else:
        logger.info(f"[PREVIEW_CHAT] Creating new chat session")
        try:
            persona_id = await get_contentbuilder_persona_id(cookies)
            logger.info(f"[PREVIEW_CHAT] Got persona ID: {persona_id}")
            chat_id = await create_onyx_chat_session(persona_id, cookies)
            logger.info(f"[PREVIEW_CHAT] Created new chat session: {chat_id}")
        except Exception as e:
            logger.error(f"[PREVIEW_CHAT_ERROR] Failed to create chat session: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create chat session: {str(e)}")

    wiz_payload = {
        "product": "Course Outline",
        "prompt": payload.prompt,
        "language": payload.language,
    }

    # Add file context if provided
    if payload.fromFiles:
        wiz_payload["fromFiles"] = True
        if payload.folderIds:
            wiz_payload["folderIds"] = payload.folderIds
        if payload.fileIds:
            wiz_payload["fileIds"] = payload.fileIds

    # Add text context if provided - use virtual file system for large texts to prevent AI memory issues
    if payload.fromText and payload.userText:
        wiz_payload["fromText"] = True
        wiz_payload["textMode"] = payload.textMode
        
        text_length = len(payload.userText)
        logger.info(f"Processing text input: mode={payload.textMode}, length={text_length} chars")
        
        if text_length > LARGE_TEXT_THRESHOLD:
            # Use virtual file system for large texts to prevent AI memory issues
            logger.info(f"Text exceeds large threshold ({LARGE_TEXT_THRESHOLD}), using virtual file system")
            try:
                virtual_file_id = await create_virtual_text_file(payload.userText, cookies)
                wiz_payload["virtualFileId"] = virtual_file_id
                wiz_payload["textCompressed"] = False
                logger.info(f"Successfully created virtual file for large text ({text_length} chars) -> file ID: {virtual_file_id}")
            except Exception as e:
                logger.error(f"Failed to create virtual file for large text: {e}")
                # Fallback to chunking if virtual file creation fails
                chunks = chunk_text(payload.userText)
                if len(chunks) == 1:
                    # Single chunk, use compression
                    compressed_text = compress_text(payload.userText)
                    wiz_payload["userText"] = compressed_text
                    wiz_payload["textCompressed"] = True
                    logger.info(f"Fallback to compressed text for large content ({text_length} -> {len(compressed_text)} chars)")
                else:
                    # Multiple chunks, use first chunk with compression
                    first_chunk = chunks[0]
                    compressed_chunk = compress_text(first_chunk)
                    wiz_payload["userText"] = compressed_chunk
                    wiz_payload["textCompressed"] = True
                    wiz_payload["textChunked"] = True
                    wiz_payload["totalChunks"] = len(chunks)
                    logger.info(f"Fallback to first chunk with compression ({text_length} -> {len(compressed_chunk)} chars, {len(chunks)} total chunks)")
        elif text_length > TEXT_SIZE_THRESHOLD:
            # Compress medium text to reduce payload size
            logger.info(f"Text exceeds compression threshold ({TEXT_SIZE_THRESHOLD}), using compression")
            compressed_text = compress_text(payload.userText)
            wiz_payload["userText"] = compressed_text
            wiz_payload["textCompressed"] = True
            logger.info(f"Using compressed text for medium content ({text_length} -> {len(compressed_text)} chars)")
        else:
            # Use direct text for small content
            logger.info(f"Using direct text for small content ({text_length} chars)")
            wiz_payload["userText"] = payload.userText
            wiz_payload["textCompressed"] = False
    elif payload.fromText and not payload.userText:
        # Log this problematic case to help with debugging
        logger.warning(f"Received fromText=True but userText is empty or None. This may cause infinite loading. textMode={payload.textMode}")
        # Don't process fromText if userText is empty to avoid confusing the AI
    elif payload.fromText:
        logger.warning(f"Received fromText=True but userText evaluation failed. userText type: {type(payload.userText)}, value: {repr(payload.userText)[:100] if payload.userText else 'None'}")

    if payload.originalOutline:
        wiz_payload["originalOutline"] = payload.originalOutline
    else:
        wiz_payload.update({
            "modules": payload.modules,
            "lessonsPerModule": payload.lessonsPerModule,
        })

    # Decompress text if it was compressed
    if wiz_payload.get("textCompressed") and wiz_payload.get("userText"):
        try:
            decompressed_text = decompress_text(wiz_payload["userText"])
            wiz_payload["userText"] = decompressed_text
            wiz_payload["textCompressed"] = False  # Mark as decompressed
            logger.info(f"Decompressed text for assistant ({len(decompressed_text)} chars)")
        except Exception as e:
            logger.error(f"Failed to decompress text: {e}")
            # Continue with original text if decompression fails
    
    wizard_message = "WIZARD_REQUEST\n" + json.dumps(wiz_payload)

    # ---------- StreamingResponse with keep-alive -----------
    async def streamer():
        assistant_reply: str = ""
        last_send = asyncio.get_event_loop().time()
        chunks_received = 0
        total_bytes_received = 0
        done_received = False

        # Use longer timeout for large text processing to prevent AI memory issues
        timeout_duration = 300.0 if wiz_payload.get("virtualFileId") else None  # 5 minutes for large texts
        logger.info(f"[PREVIEW_STREAM] Starting streamer with timeout: {timeout_duration} seconds")
        logger.info(f"[PREVIEW_STREAM] Wizard payload keys: {list(wiz_payload.keys())}")
        
        try:
            async with httpx.AsyncClient(timeout=timeout_duration) as client:
                # Parse folder and file IDs for Onyx
                folder_ids_list = []
                file_ids_list = []
                if payload.fromFiles and payload.folderIds:
                    folder_ids_list = [int(fid) for fid in payload.folderIds.split(',') if fid.strip().isdigit()]
                if payload.fromFiles and payload.fileIds:
                    file_ids_list = [int(fid) for fid in payload.fileIds.split(',') if fid.strip().isdigit()]
                
                # Add virtual file ID if created for large text
                if wiz_payload.get("virtualFileId"):
                    file_ids_list.append(wiz_payload["virtualFileId"])
                    logger.info(f"[PREVIEW_STREAM] Added virtual file ID {wiz_payload['virtualFileId']} to file_ids_list")
                
                send_payload = {
                    "chat_session_id": chat_id,
                    "message": wizard_message,
                    "parent_message_id": None,
                    "file_descriptors": [],
                    "user_file_ids": file_ids_list,
                    "user_folder_ids": folder_ids_list,
                    "prompt_id": None,
                    "search_doc_ids": None,
                    "retrieval_options": {"run_search": "never", "real_time": False},
                    "stream_response": True,
                }
                logger.info(f"[PREVIEW_ONYX] Sending request to Onyx /chat/send-message with payload: user_file_ids={file_ids_list}, user_folder_ids={folder_ids_list}")
                logger.info(f"[PREVIEW_ONYX] Message length: {len(wizard_message)} chars")
                
                async with client.stream("POST", f"{ONYX_API_SERVER_URL}/chat/send-message", json=send_payload, cookies=cookies) as resp:
                    logger.info(f"[PREVIEW_ONYX] Response status: {resp.status_code}")
                    logger.info(f"[PREVIEW_ONYX] Response headers: {dict(resp.headers)}")
                    
                    if resp.status_code != 200:
                        logger.error(f"[PREVIEW_ONYX] Non-200 status code: {resp.status_code}")
                        error_text = await resp.text()
                        logger.error(f"[PREVIEW_ONYX] Error response: {error_text}")
                        raise HTTPException(status_code=resp.status_code, detail=f"Onyx API error: {error_text}")
                    
                    async for raw_line in resp.aiter_lines():
                        total_bytes_received += len(raw_line.encode('utf-8'))
                        chunks_received += 1
                        
                        if not raw_line:
                            logger.debug(f"[PREVIEW_ONYX] Empty line received (chunk {chunks_received})")
                            continue
                            
                        line = raw_line.strip()
                        logger.debug(f"[PREVIEW_ONYX] Raw line {chunks_received}: {line[:100]}{'...' if len(line) > 100 else ''}")
                        
                        if line.startswith("data:"):
                            line = line.split("data:", 1)[1].strip()
                            logger.debug(f"[PREVIEW_ONYX] Processed data line: {line[:100]}{'...' if len(line) > 100 else ''}")
                            
                        if line == "[DONE]":
                            logger.info(f"[PREVIEW_ONYX] Received [DONE] signal after {chunks_received} chunks, {total_bytes_received} bytes")
                            done_received = True
                            break
                            
                        try:
                            pkt = json.loads(line)
                            if "answer_piece" in pkt:
                                delta_text = pkt["answer_piece"].replace("\\n", "\n")
                                assistant_reply += delta_text
                                logger.debug(f"[PREVIEW_ONYX] Chunk {chunks_received}: received {len(delta_text)} chars, total so far: {len(assistant_reply)}")
                                yield (json.dumps({"type": "delta", "text": delta_text}) + "\n").encode()
                            else:
                                logger.debug(f"[PREVIEW_ONYX] Chunk {chunks_received}: no answer_piece, keys: {list(pkt.keys())}")
                        except json.JSONDecodeError as e:
                            logger.error(f"[PREVIEW_ONYX] JSON decode error in chunk {chunks_received}: {e} | Raw: {line[:200]}")
                            continue
                        except Exception as e:
                            logger.error(f"[PREVIEW_ONYX] Unexpected error processing chunk {chunks_received}: {e} | Raw: {line[:200]}")
                            continue

                        # send keep-alive every 8s
                        now = asyncio.get_event_loop().time()
                        if now - last_send > 8:
                            yield b" "
                            last_send = now
                            logger.debug(f"[PREVIEW_ONYX] Sent keep-alive after {now - last_send}s")
                    
                    if not done_received:
                        logger.warning(f"[PREVIEW_ONYX] Stream ended without [DONE] signal after {chunks_received} chunks")
                        
        except httpx.TimeoutException as e:
            logger.error(f"[PREVIEW_ONYX] Timeout error: {e}")
            raise HTTPException(status_code=408, detail=f"Request timeout: {e}")
        except httpx.RequestError as e:
            logger.error(f"[PREVIEW_ONYX] Request error: {e}")
            raise HTTPException(status_code=502, detail=f"Onyx API request failed: {e}")
        except Exception as e:
            logger.error(f"[PREVIEW_ONYX] Exception in streaming: {e}", exc_info=True)
            raise

        logger.info(f"[PREVIEW_STREAM] Stream completed. Total chunks: {chunks_received}, total bytes: {total_bytes_received}")
        logger.info(f"[PREVIEW_STREAM] Final assistant_reply length: {len(assistant_reply)}")
        logger.info(f"[PREVIEW_STREAM] Assistant reply preview: {assistant_reply[:200]}{'...' if len(assistant_reply) > 200 else ''}")

        # Cache full raw outline for later finalize step
        if chat_id:
            OUTLINE_PREVIEW_CACHE[chat_id] = assistant_reply
            logger.info(f"[PREVIEW_CACHE] Cached preview for chat_id={chat_id}, length={len(assistant_reply)}")

        if not assistant_reply.strip():
            logger.error(f"[PREVIEW_STREAM] CRITICAL: assistant_reply is empty or whitespace only!")
            # Send error packet to frontend
            error_packet = {"type": "error", "message": "No content received from AI service"}
            yield (json.dumps(error_packet) + "\n").encode()
            return

        modules_preview = _parse_outline_markdown(assistant_reply)
        logger.info(f"[PREVIEW_DONE] Parsed modules: {len(modules_preview)}")
        logger.info(f"[PREVIEW_DONE] Module details: {[{'id': m.get('id'), 'title': m.get('title'), 'lessons_count': len(m.get('lessons', []))} for m in modules_preview]}")
        
        # Send completion packet with the parsed outline.
        done_packet = {"type": "done", "modules": modules_preview, "raw": assistant_reply}
        yield (json.dumps(done_packet) + "\n").encode()
        logger.info(f"[PREVIEW_STREAM] Sent completion packet with {len(modules_preview)} modules")

    return StreamingResponse(streamer(), media_type="application/json")

async def _ensure_training_plan_template(pool: asyncpg.Pool) -> int:
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT id FROM design_templates WHERE component_name = $1 LIMIT 1", COMPONENT_NAME_TRAINING_PLAN)
        if row:
            return row["id"]
        # create minimal template
        row = await conn.fetchrow(
            """
            INSERT INTO design_templates (template_name, template_structuring_prompt, microproduct_type, component_name)
            VALUES ($1, $2, $3, $4) RETURNING id;
            """,
            "Training Plan", DEFAULT_TRAINING_PLAN_JSON_EXAMPLE_FOR_LLM, "Training Plan", COMPONENT_NAME_TRAINING_PLAN
        )
        return row["id"]

@app.post("/api/custom/course-outline/finalize")
async def wizard_outline_finalize(payload: OutlineWizardFinalize, request: Request, pool: asyncpg.Pool = Depends(get_db_pool)):
    cookies = {ONYX_SESSION_COOKIE_NAME: request.cookies.get(ONYX_SESSION_COOKIE_NAME)}
    if not cookies[ONYX_SESSION_COOKIE_NAME]:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Ensure we have a chat session id (needed both for cache lookup and possible assistant fallback)
    if payload.chatSessionId:
        chat_id = payload.chatSessionId
    else:
        persona_id = await get_contentbuilder_persona_id(cookies)
        chat_id = await create_onyx_chat_session(persona_id, cookies)

    # Helper: check whether the user made ANY changes (structure or content)
    def _any_changes_made(orig_modules: List[Dict[str, Any]], edited: Dict[str, Any]) -> bool:
        try:
            edited_sections = edited.get("sections") or edited.get("modules") or []
            
            # Debug logging to understand the data structures
            logger.info(f"Comparing changes: orig_modules count={len(orig_modules)}, edited_sections count={len(edited_sections)}")
            
            # Check structural changes first (modules/lessons added/removed)
            if len(orig_modules) != len(edited_sections):
                logger.info(f"Structural change detected: module count changed from {len(orig_modules)} to {len(edited_sections)}")
                return True
            
            # Check for content changes (titles modified)
            for i, (o, e) in enumerate(zip(orig_modules, edited_sections)):
                # Compare module titles
                orig_title = str(o.get("title", "")).strip()
                edited_title = str(e.get("title", "")).strip() if isinstance(e, dict) else str(e).strip()
                
                logger.debug(f"Module {i}: comparing titles '{orig_title}' vs '{edited_title}'")
                if orig_title != edited_title:
                    logger.info(f"Module title change detected at index {i}: '{orig_title}' -> '{edited_title}'")
                    return True
                
                # Compare lesson structure and content
                orig_lessons = o.get("lessons", [])
                edited_lessons = e.get("lessons", []) if isinstance(e, dict) else []
                
                if len(orig_lessons) != len(edited_lessons):
                    logger.info(f"Lesson count change detected in module {i}: {len(orig_lessons)} -> {len(edited_lessons)}")
                    return True
                
                # Compare individual lesson titles
                for j, (ol, el) in enumerate(zip(orig_lessons, edited_lessons)):
                    # Handle different lesson formats
                    if isinstance(ol, dict):
                        orig_lesson = str(ol.get("title", ol.get("name", ""))).strip()
                    else:
                        orig_lesson = str(ol).strip()
                    
                    if isinstance(el, dict):
                        edited_lesson = str(el.get("title", el.get("name", ""))).strip()
                    else:
                        edited_lesson = str(el).strip()
                    
                    logger.debug(f"Module {i}, Lesson {j}: comparing '{orig_lesson}' vs '{edited_lesson}'")
                    if orig_lesson != edited_lesson:
                        logger.info(f"Lesson change detected in module {i}, lesson {j}: '{orig_lesson}' -> '{edited_lesson}'")
                        return True
            
            logger.info("No changes detected - outline is identical")
            return False
        except Exception as e:
            # On any parsing issue assume changes were made so we use assistant
            logger.warning(f"Error during change detection (assuming changes made): {e}")
            return True

    # ---------- 1) Decide strategy ----------
    raw_outline_cached = OUTLINE_PREVIEW_CACHE.get(chat_id)
    
    # Debug cache lookup
    logger.info(f"DEBUG: Cache lookup for chat_id='{chat_id}', found cached outline: {bool(raw_outline_cached)}")
    if raw_outline_cached:
        logger.info(f"DEBUG: Cached outline preview (first 200 chars): {raw_outline_cached[:200]}...")
    else:
        logger.info(f"DEBUG: Available cache keys: {list(OUTLINE_PREVIEW_CACHE.keys())}")
    
    if raw_outline_cached:
        parsed_orig = _parse_outline_markdown(raw_outline_cached)
        
        # Debug: Log the data structures being compared
        logger.info(f"DEBUG: parsed_orig structure: {json.dumps(parsed_orig, indent=2)[:500]}...")
        logger.info(f"DEBUG: payload.editedOutline structure: {json.dumps(payload.editedOutline, indent=2)[:500]}...")
        
        any_changes = _any_changes_made(parsed_orig, payload.editedOutline)
        
        if not any_changes:
            # NO CHANGES: Use direct parser path (fastest)
            use_direct_parser = True
            use_assistant_then_parser = False
            logger.info("No changes detected - using direct parser path")
        else:
            # CHANGES DETECTED: Use assistant first, then parser
            use_direct_parser = False
            use_assistant_then_parser = True
            logger.info("Changes detected - using assistant + parser path")
    else:
        # No cached data available - use assistant + parser path
        use_direct_parser = False
        use_assistant_then_parser = True
        logger.info("No cached outline - using assistant + parser path")

    # ---------- 2) DIRECT PARSER PATH: No changes made, use cached data directly ----------
    if use_direct_parser:
        direct_path_project_id = None  # Track project ID for cleanup if needed
        try:
            # Use cached outline directly since no changes were made
            template_id = await _ensure_training_plan_template(pool)
            project_name_detected = _extract_project_name_from_markdown(raw_outline_cached) or payload.prompt
            
            logger.info(f"Direct parser path: Using cached outline with {len(raw_outline_cached)} characters")
            
            project_request = ProjectCreateRequest(
                projectName=project_name_detected,
                design_template_id=template_id,
                microProductName=None,
                aiResponse=raw_outline_cached,
                chatSessionId=uuid.UUID(chat_id) if chat_id else None,
            )
            onyx_user_id = await get_current_onyx_user_id(request)

            project_db_candidate = await add_project_to_custom_db(project_request, onyx_user_id, pool)  # type: ignore[arg-type]
            direct_path_project_id = project_db_candidate.id  # Store for potential cleanup
            
            logger.info(f"Direct parser path: Created project {direct_path_project_id}")
            logger.info(f"Direct parser path: Project content type: {type(project_db_candidate.microproduct_content)}")
            
            # Check if content was parsed successfully
            content_valid = False
            if project_db_candidate.microproduct_content:
                if hasattr(project_db_candidate.microproduct_content, "sections"):
                    sections = getattr(project_db_candidate.microproduct_content, "sections", [])
                    content_valid = len(sections) > 0
                    logger.info(f"Direct parser path: Found {len(sections)} sections in parsed content")
                else:
                    logger.warning(f"Direct parser path: Content does not have sections attribute")
            else:
                logger.warning(f"Direct parser path: microproduct_content is None")

            # --- Patch theme into DB if provided (only for TrainingPlan components) ---
            if payload.theme and content_valid:
                async with pool.acquire() as conn:
                    design_template = await conn.fetchrow("SELECT component_name FROM design_templates WHERE id = $1", template_id)
                    if design_template and design_template.get("component_name") == COMPONENT_NAME_TRAINING_PLAN:
                        await conn.execute(
                            """
                            UPDATE projects
                            SET microproduct_content = jsonb_set(COALESCE(microproduct_content::jsonb, '{}'), '{theme}', to_jsonb($1::text), true)
                            WHERE id = $2
                            """,
                            payload.theme, project_db_candidate.id
                        )
                        row_patch = await conn.fetchrow("SELECT microproduct_content FROM projects WHERE id = $1", project_db_candidate.id)
                        if row_patch and row_patch["microproduct_content"] is not None:
                            project_db_candidate.microproduct_content = row_patch["microproduct_content"]

            # Success when we have valid parsed content
            if content_valid:
                logger.info(f"Direct parser path successful for project {direct_path_project_id}")
                return JSONResponse(content=json.loads(project_db_candidate.model_dump_json()))
            else:
                # Direct parser path validation failed - clean up the created project and fall back to assistant
                logger.warning(f"Direct parser path validation failed for project {direct_path_project_id} - LLM parsing likely failed")
                logger.warning(f"Content details: {project_db_candidate.microproduct_content}")
                try:
                    async with pool.acquire() as conn:
                        await conn.execute("DELETE FROM projects WHERE id = $1 AND onyx_user_id = $2", direct_path_project_id, onyx_user_id)
                    logger.info(f"Successfully cleaned up failed direct parser project {direct_path_project_id}")
                except Exception as cleanup_e:
                    logger.error(f"Failed to cleanup direct parser project {direct_path_project_id}: {cleanup_e}")
                
                # Fall back to assistant path
                logger.info("Falling back to assistant + parser path due to direct parser failure")
                use_direct_parser = False
                use_assistant_then_parser = True
                
        except Exception as direct_e:
            # Clean up any project created during direct parser path failure
            if direct_path_project_id:
                logger.warning(f"Direct parser path failed with project {direct_path_project_id}, attempting cleanup...")
                try:
                    onyx_user_id = await get_current_onyx_user_id(request)
                    async with pool.acquire() as conn:
                        await conn.execute("DELETE FROM projects WHERE id = $1 AND onyx_user_id = $2", direct_path_project_id, onyx_user_id)
                    logger.info(f"Successfully cleaned up failed direct parser project {direct_path_project_id}")
                except Exception as cleanup_e:
                    logger.error(f"Failed to cleanup direct parser project {direct_path_project_id}: {cleanup_e}")
            
            logger.error(f"Direct parser path failed with error: {direct_e}")
            
            # If another concurrent request already started creation we patiently wait for it instead of kicking off assistant again
            if isinstance(direct_e, HTTPException) and direct_e.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
                logger.info("wizard_outline_finalize detected in-progress creation. Waiting for completion…")
                max_wait_sec = 900  # 15 minutes
                poll_every_sec = 1
                waited = 0
                while waited < max_wait_sec:
                    async with pool.acquire() as conn:
                        if chat_id:
                            # Prefer locating the project by the wizard chat_session_id (unique identifier per outline wizard run)
                            row = await conn.fetchrow(
                                "SELECT id, microproduct_content FROM projects WHERE source_chat_session_id = $1 ORDER BY created_at DESC LIMIT 1",
                                uuid.UUID(chat_id),
                            )
                        else:
                            # Fallback to the previous behaviour when we have no chat_id information available
                            row = await conn.fetchrow(
                                "SELECT id, microproduct_content FROM projects WHERE onyx_user_id = $1 AND project_name = $2 ORDER BY created_at DESC LIMIT 1",
                                onyx_user_id,
                                payload.prompt,
                            )
                    if row and row["microproduct_content"] is not None:
                        return JSONResponse(content={"id": row["id"]})
                    await asyncio.sleep(poll_every_sec)
                    waited += poll_every_sec
                logger.warning("wizard_outline_finalize waited too long for existing creation – giving up")
            else:
                logger.warning(f"wizard_outline_finalize direct parser path failed – will use assistant path. Details: {direct_e}")
            
            # Fall back to assistant path
                use_direct_parser = False
                use_assistant_then_parser = True

    # ---------- 3) ASSISTANT + PARSER PATH: Process changes with assistant, then parse ----------
    if use_assistant_then_parser:
        # Before starting assistant path, check if a project was already created successfully for this session
        if chat_id:
            try:
                async with pool.acquire() as conn:
                    existing_row = await conn.fetchrow(
                        "SELECT id, microproduct_content FROM projects WHERE source_chat_session_id = $1 ORDER BY created_at DESC LIMIT 1",
                        uuid.UUID(chat_id),
                    )
                    if existing_row and existing_row["microproduct_content"] is not None:
                        # Check if the existing project has valid content
                        try:
                            content = existing_row["microproduct_content"]
                            if isinstance(content, dict) and content.get("sections"):
                                logger.info(f"Found existing valid project {existing_row['id']} for chat session, returning it")
                                return JSONResponse(content={"id": existing_row["id"]})
                        except Exception:
                            pass  # Continue with assistant path if content validation fails
            except Exception as e:
                logger.warning(f"Failed to check for existing project: {e}")
        
        wizard_message = (
            "WIZARD_REQUEST\n" +
            json.dumps({
                "product": "Course Outline",
                "action": "finalize",
                "prompt": payload.prompt,
                "modules": payload.modules,
                "lessonsPerModule": payload.lessonsPerModule,
                "language": payload.language,
                "editedOutline": payload.editedOutline,
            })
        )

        async def streamer():
            assistant_reply: str = ""
            last_send = asyncio.get_event_loop().time()

            # Use longer timeout for large text processing to prevent AI memory issues
            timeout_duration = 300.0 if wiz_payload.get("virtualFileId") else None  # 5 minutes for large texts
            logger.info(f"Using timeout duration: {timeout_duration} seconds for AI processing")
            try:
                async with httpx.AsyncClient(timeout=timeout_duration) as client:
                    # Parse folder and file IDs for Onyx
                    folder_ids_list = []
                    file_ids_list = []
                    if payload.fromFiles and payload.folderIds:
                        folder_ids_list = [int(fid) for fid in payload.folderIds.split(',') if fid.strip().isdigit()]
                    if payload.fromFiles and payload.fileIds:
                        file_ids_list = [int(fid) for fid in payload.fileIds.split(',') if fid.strip().isdigit()]
                    
                    # Add virtual file ID if created for large text
                    if wiz_payload.get("virtualFileId"):
                        file_ids_list.append(wiz_payload["virtualFileId"])
                        logger.info(f"Added virtual file ID {wiz_payload['virtualFileId']} to file_ids_list")
                    
                    send_payload = {
                        "chat_session_id": chat_id,
                        "message": wizard_message,
                        "parent_message_id": None,
                        "file_descriptors": [],
                        "user_file_ids": file_ids_list,
                        "user_folder_ids": folder_ids_list,
                        "prompt_id": None,
                        "search_doc_ids": None,
                        "retrieval_options": {"run_search": "never", "real_time": False},
                        "stream_response": True,
                    }
                    logger.info(f"[PREVIEW_ONYX] Sending request to Onyx /chat/send-message with payload: user_file_ids={file_ids_list}, user_folder_ids={folder_ids_list}")
                    async with client.stream("POST", f"{ONYX_API_SERVER_URL}/chat/send-message", json=send_payload, cookies=cookies) as resp:
                        logger.info(f"[PREVIEW_ONYX] Response status: {resp.status_code}")
                        async for raw_line in resp.aiter_lines():
                            if not raw_line:
                                continue
                            line = raw_line.strip()
                            if line.startswith("data:"):
                                line = line.split("data:", 1)[1].strip()
                            if line == "[DONE]":
                                logger.info("[PREVIEW_ONYX] Received [DONE] from Onyx stream")
                                break
                            try:
                                pkt = json.loads(line)
                                if "answer_piece" in pkt:
                                    delta_text = pkt["answer_piece"].replace("\\n", "\n")
                                    assistant_reply += delta_text
                                    logger.debug(f"[PREVIEW_ONYX] Received chunk: {delta_text[:80]}")
                                    yield (json.dumps({"type": "delta", "text": delta_text}) + "\n").encode()
                            except Exception as e:
                                logger.error(f"[PREVIEW_ONYX] Error parsing chunk: {e} | Raw: {line[:100]}")
                                continue

                            # send keep-alive every 8s
                            now = asyncio.get_event_loop().time()
                            if now - last_send > 8:
                                yield b" "
                                last_send = now
            except Exception as e:
                logger.error(f"[PREVIEW_ONYX] Exception in streaming: {e}")
                raise

            # Cache full raw outline for later finalize step
            if chat_id:
                OUTLINE_PREVIEW_CACHE[chat_id] = assistant_reply
                logger.info(f"[PREVIEW_CACHE] Cached preview for chat_id={chat_id}, length={len(assistant_reply)}")

            modules_preview = _parse_outline_markdown(assistant_reply)
            logger.info(f"[PREVIEW_DONE] Parsed modules: {len(modules_preview)}")
            # Send completion packet with the parsed outline.
            done_packet = {"type": "done", "modules": modules_preview, "raw": assistant_reply}
            yield (json.dumps(done_packet) + "\n").encode()

        return StreamingResponse(streamer(), media_type="application/json")

@app.post("/api/custom/course-outline/init-chat")
async def init_course_outline_chat(request: Request):
    """Pre-create Chat Session & persona so subsequent preview calls are faster."""
    cookies = request.cookies
    persona_id = await get_contentbuilder_persona_id(cookies)
    chat_id = await create_onyx_chat_session(persona_id, cookies)
    return {"personaId": persona_id, "chatSessionId": chat_id}

# ======================= End Wizard Section ==============================

# === Wizard Outline helpers & cache ===
OUTLINE_PREVIEW_CACHE: Dict[str, str] = {}  # chat_session_id -> raw markdown outline

def _apply_title_edits_to_outline(original_md: str, edited_outline: Dict[str, Any]) -> str:
    """Return a markdown outline that reflects the *structure* provided in
    `edited_outline` (modules & lessons) while preserving the original header.

    Instead of trying to patch-in titles at the old positions, we rebuild each
    module's lesson list from scratch. This guarantees correctness even when
    lessons were inserted, removed or reordered in the UI.
    """

    # ---- 1. Normalise `edited_outline` ----
    sections: Optional[List[Any]] = None
    if isinstance(edited_outline, dict):
        sections = edited_outline.get("sections") or edited_outline.get("modules")
    elif isinstance(edited_outline, list):
        sections = edited_outline

    if not sections:
        return original_md  # nothing to merge -> return original untouched

    # ---- 2. Preserve the very first non-empty line (usually Universal Header) ----
    header_line = None
    for line in original_md.splitlines():
        if line.strip():
            header_line = line.rstrip()
            break

    out_lines: List[str] = []
    if header_line:
        out_lines.append(header_line)
        out_lines.append("")  # spacer line to match original formatting

    # ---- 3. Rebuild modules & lessons ----
    for idx, sec in enumerate(sections):
        # Module title
        title = sec.get("title") if isinstance(sec, dict) else str(sec)
        out_lines.append(f"## Module {idx + 1}: {title.strip()}")

        # Lessons
        lessons_list: List[Any] = []
        if isinstance(sec, dict):
            lessons_list = sec.get("lessons", []) or []
        elif isinstance(sec, list):
            lessons_list = sec

        for ls in lessons_list:
            ls_raw = ls.get("title") if isinstance(ls, dict) else str(ls)
            if not isinstance(ls_raw, str):
                ls_raw = str(ls_raw)

            segments = ls_raw.split("\n")
            main_line = segments[0].strip()
            out_lines.append(f"- **{main_line}**")

            for extra in segments[1:]:
                extra = extra.rstrip()
                if extra:
                    out_lines.append(f"  {extra}")

        out_lines.append("")  # blank line between modules for readability

    return "\n".join(out_lines).rstrip()  # drop trailing newline

# ------------------- Utility: extract project name from AI markdown header -------------------

_HEADER_RE = re.compile(r"^\*\*(?P<name>[^*]+)\*\*\s*:\s*\*\*.+")


def _extract_project_name_from_markdown(md: str) -> Optional[str]:
    """Return the first **Project Name** element found in the Universal Product Header.

    The header line looks like:
        **Project Name** : **Course Outline** : **Course Outline**
    We return "Project Name" (stripped).
    """
    if not md:
        return None
    first_line = md.splitlines()[0].strip()
    m = _HEADER_RE.match(first_line)
    if m:
        return m.group("name").strip()
    return None

# --- PDF Lesson helper and wizard endpoints ---

# Ensure a design template for PDF Lesson exists, return its ID
async def _ensure_pdf_lesson_template(pool: asyncpg.Pool) -> int:
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT id FROM design_templates WHERE component_name = $1 LIMIT 1", COMPONENT_NAME_PDF_LESSON)
        if row:
            return row["id"]
        row = await conn.fetchrow(
            """
            INSERT INTO design_templates (template_name, template_structuring_prompt, microproduct_type, component_name)
            VALUES ($1, $2, $3, $4) RETURNING id;
            """,
            "PDF Lesson", DEFAULT_PDF_LESSON_JSON_EXAMPLE_FOR_LLM, "PDF Lesson", COMPONENT_NAME_PDF_LESSON,
        )
        return row["id"]

# Ensure a design template for Slide Deck exists, return its ID
async def _ensure_slide_deck_template(pool: asyncpg.Pool) -> int:
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT id FROM design_templates WHERE component_name = $1 LIMIT 1", COMPONENT_NAME_SLIDE_DECK)
        if row:
            return row["id"]
        row = await conn.fetchrow(
            """
            INSERT INTO design_templates (template_name, template_structuring_prompt, microproduct_type, component_name)
            VALUES ($1, $2, $3, $4) RETURNING id;
            """,
            "Slide Deck", DEFAULT_SLIDE_DECK_JSON_EXAMPLE_FOR_LLM, "Slide Deck", COMPONENT_NAME_SLIDE_DECK,
        )
        return row["id"]


# -------- Lesson Presentation (PDF Lesson) Wizard ---------

class LessonWizardPreview(BaseModel):
    outlineProjectId: Optional[int] = None  # Parent Training Plan project id
    lessonTitle: Optional[str] = None      # Specific lesson to generate, optional when prompt-based
    lengthRange: Optional[str] = None      # e.g. "400-500 words"
    prompt: Optional[str] = None           # Fallback free-form prompt
    language: str = "en"
    chatSessionId: Optional[str] = None
    slidesCount: Optional[int] = 5         # Number of slides to generate
    # NEW: file context for creation from documents
    fromFiles: Optional[bool] = None
    folderIds: Optional[str] = None  # comma-separated folder IDs
    fileIds: Optional[str] = None    # comma-separated file IDs
    # NEW: text context for creation from user text
    fromText: Optional[bool] = None
    textMode: Optional[str] = None   # "context" or "base"
    userText: Optional[str] = None   # User's pasted text


class LessonWizardFinalize(BaseModel):
    outlineProjectId: Optional[int] = None
    lessonTitle: str
    lengthRange: Optional[str] = None
    aiResponse: str                        # User-edited markdown / plain text
    chatSessionId: Optional[str] = None
    slidesCount: Optional[int] = 5         # Number of slides to generate


@app.post("/api/custom/lesson-presentation/preview")
async def wizard_lesson_preview(payload: LessonWizardPreview, request: Request, pool: asyncpg.Pool = Depends(get_db_pool)):
    cookies = {ONYX_SESSION_COOKIE_NAME: request.cookies.get(ONYX_SESSION_COOKIE_NAME)}
    if not cookies[ONYX_SESSION_COOKIE_NAME]:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Ensure chat session
    if payload.chatSessionId:
        chat_id = payload.chatSessionId
    else:
        persona_id = await get_contentbuilder_persona_id(cookies)
        chat_id = await create_onyx_chat_session(persona_id, cookies)

    # Build wizard request for assistant persona
    wizard_dict: Dict[str, Any] = {
        "product": "Slides Deck",
        "action": "preview",
        "language": payload.language,
        "slidesCount": payload.slidesCount or 5,
    }
    if payload.outlineProjectId is not None:
        wizard_dict["outlineProjectId"] = payload.outlineProjectId
        
        # Fetch outline name to include in wizard request
        try:
            # Get current user ID to fetch the outline
            onyx_user_id = await get_current_onyx_user_id(request)
            
            # Fetch outline name from database
            async with pool.acquire() as conn:
                outline_row = await conn.fetchrow(
                    "SELECT project_name FROM projects WHERE id = $1 AND onyx_user_id = $2",
                    payload.outlineProjectId, onyx_user_id
                )
                if outline_row:
                    wizard_dict["outlineName"] = outline_row["project_name"]
        except Exception as e:
            logger.warning(f"Failed to fetch outline name for project {payload.outlineProjectId}: {e}")
            # Continue without outline name - not critical for preview
            
    if payload.lessonTitle:
        wizard_dict["lessonTitle"] = payload.lessonTitle
    if payload.prompt:
        wizard_dict["prompt"] = payload.prompt
    
    # Add file context if provided
    if payload.fromFiles:
        wizard_dict["fromFiles"] = True
        if payload.folderIds:
            wizard_dict["folderIds"] = payload.folderIds
        if payload.fileIds:
            wizard_dict["fileIds"] = payload.fileIds

    # Add text context if provided - use compression for large texts
    if payload.fromText and payload.userText:
        wizard_dict["fromText"] = True
        wizard_dict["textMode"] = payload.textMode
        
        if len(payload.userText) > TEXT_SIZE_THRESHOLD:
            # Compress large text to reduce payload size
            compressed_text = compress_text(payload.userText)
            wizard_dict["userText"] = compressed_text
            wizard_dict["textCompressed"] = True
            logger.info(f"Using compressed text for large lesson content ({len(payload.userText)} -> {len(compressed_text)} chars)")
        else:
            # Use direct text for smaller content
            wizard_dict["userText"] = payload.userText
            wizard_dict["textCompressed"] = False
    elif payload.fromText and not payload.userText:
        # Log this problematic case to help with debugging
        logger.warning(f"Received fromText=True but userText is empty or None. This may cause infinite loading. textMode={payload.textMode}")
        # Don't process fromText if userText is empty to avoid confusing the AI
    elif payload.fromText:
        logger.warning(f"Received fromText=True but userText evaluation failed. userText type: {type(payload.userText)}, value: {repr(payload.userText)[:100] if payload.userText else 'None'}")

    # Decompress text if it was compressed
    if wizard_dict.get("textCompressed") and wizard_dict.get("userText"):
        try:
            decompressed_text = decompress_text(wizard_dict["userText"])
            wizard_dict["userText"] = decompressed_text
            wizard_dict["textCompressed"] = False  # Mark as decompressed
            logger.info(f"Decompressed lesson text for assistant ({len(decompressed_text)} chars)")
        except Exception as e:
            logger.error(f"Failed to decompress lesson text: {e}")
            # Continue with original text if decompression fails
    
    wizard_message = "WIZARD_REQUEST\n" + json.dumps(wizard_dict)

    async def streamer():
        assistant_reply: str = ""
        last_send = asyncio.get_event_loop().time()

        # Use longer timeout for large text processing to prevent AI memory issues
        timeout_duration = 300.0 if wizard_dict.get("virtualFileId") else None  # 5 minutes for large texts
        logger.info(f"Using timeout duration: {timeout_duration} seconds for AI processing")
        try:
            async with httpx.AsyncClient(timeout=timeout_duration) as client:
                # Parse folder and file IDs for Onyx
                folder_ids_list = []
                file_ids_list = []
                if payload.fromFiles and payload.folderIds:
                    folder_ids_list = [int(fid) for fid in payload.folderIds.split(',') if fid.strip().isdigit()]
                if payload.fromFiles and payload.fileIds:
                    file_ids_list = [int(fid) for fid in payload.fileIds.split(',') if fid.strip().isdigit()]
                
                # Add virtual file ID if created for large text
                if wizard_dict.get("virtualFileId"):
                    file_ids_list.append(wizard_dict["virtualFileId"])
                    logger.info(f"Added virtual file ID {wizard_dict['virtualFileId']} to file_ids_list")
                
                send_payload = {
                    "chat_session_id": chat_id,
                    "message": wizard_message,
                    "parent_message_id": None,
                    "file_descriptors": [],
                    "user_file_ids": file_ids_list,
                    "user_folder_ids": folder_ids_list,
                    "prompt_id": None,
                    "search_doc_ids": None,
                    "retrieval_options": {"run_search": "never", "real_time": False},
                    "stream_response": True,
                }
                logger.info(f"[PREVIEW_ONYX] Sending request to Onyx /chat/send-message with payload: user_file_ids={file_ids_list}, user_folder_ids={folder_ids_list}")
                async with client.stream("POST", f"{ONYX_API_SERVER_URL}/chat/send-message", json=send_payload, cookies=cookies) as resp:
                    logger.info(f"[PREVIEW_ONYX] Response status: {resp.status_code}")
                    async for raw_line in resp.aiter_lines():
                        if not raw_line:
                            continue
                        line = raw_line.strip()
                        if line.startswith("data:"):
                            line = line.split("data:", 1)[1].strip()
                        if line == "[DONE]":
                            logger.info("[PREVIEW_ONYX] Received [DONE] from Onyx stream")
                            break
                        try:
                            pkt = json.loads(line)
                            if "answer_piece" in pkt:
                                delta_text = pkt["answer_piece"].replace("\\n", "\n")
                                assistant_reply += delta_text
                                logger.debug(f"[PREVIEW_ONYX] Received chunk: {delta_text[:80]}")
                                yield (json.dumps({"type": "delta", "text": delta_text}) + "\n").encode()
                        except Exception as e:
                            logger.error(f"[PREVIEW_ONYX] Error parsing chunk: {e} | Raw: {line[:100]}")
                            continue

                        # send keep-alive every 8s
                        now = asyncio.get_event_loop().time()
                        if now - last_send > 8:
                            yield b" "
                            last_send = now
        except Exception as e:
            logger.error(f"[PREVIEW_ONYX] Exception in streaming: {e}")
            raise

        # Cache full raw outline for later finalize step
        if chat_id:
            OUTLINE_PREVIEW_CACHE[chat_id] = assistant_reply
            logger.info(f"[PREVIEW_CACHE] Cached preview for chat_id={chat_id}, length={len(assistant_reply)}")

        modules_preview = _parse_outline_markdown(assistant_reply)
        logger.info(f"[PREVIEW_DONE] Parsed modules: {len(modules_preview)}")
        # Send completion packet with the parsed outline.
        done_packet = {"type": "done", "modules": modules_preview, "raw": assistant_reply}
        yield (json.dumps(done_packet) + "\n").encode()

    return StreamingResponse(streamer(), media_type="text/plain")


@app.post("/api/custom/lesson-presentation/finalize")
async def wizard_lesson_finalize(payload: LessonWizardFinalize, request: Request, pool: asyncpg.Pool = Depends(get_db_pool)):
    logger.info(f"Finalizing lesson presentation: {payload.lessonTitle}")
    
    # Validate required fields early
    if not payload.lessonTitle or not payload.lessonTitle.strip():
        raise HTTPException(status_code=400, detail="Lesson title is required")
    
    if not payload.aiResponse or not payload.aiResponse.strip():
        raise HTTPException(status_code=400, detail="AI response content is required")

    try:
        # Get the slide deck template with retry mechanism
        max_retries = 3
        slide_deck_template_id = None
        for attempt in range(max_retries):
            try:
                slide_deck_template_id = await _ensure_slide_deck_template(pool)
                break
            except Exception as e:
                if attempt == max_retries - 1:
                    logger.error(f"Failed to get slide deck template after {max_retries} attempts: {e}")
                    raise HTTPException(status_code=500, detail="Unable to initialize template")
                await asyncio.sleep(0.5)  # Brief delay before retry

        if not slide_deck_template_id:
            raise HTTPException(status_code=500, detail="Template initialization failed")

        # Get user ID
        onyx_user_id = await get_current_onyx_user_id(request)
        
        # Determine the project name - if connected to outline, use correct naming convention
        project_name = payload.lessonTitle.strip()
        if payload.outlineProjectId:
            try:
                # Fetch outline name from database
                async with pool.acquire() as conn:
                    outline_row = await conn.fetchrow(
                        "SELECT project_name FROM projects WHERE id = $1 AND onyx_user_id = $2",
                        payload.outlineProjectId, onyx_user_id
                    )
                    if outline_row:
                        outline_name = outline_row["project_name"]
                        project_name = f"{outline_name}: {payload.lessonTitle.strip()}"
            except Exception as e:
                logger.warning(f"Failed to fetch outline name for lesson naming: {e}")
                # Continue with plain lesson title if outline fetch fails

        # Create project data
        project_data = ProjectCreateRequest(
            projectName=project_name,
            design_template_id=slide_deck_template_id,
            microProductName=None,
            aiResponse=payload.aiResponse.strip(),
            chatSessionId=payload.chatSessionId
        )
        
        # Create project with proper error handling
        try:
            created_project = await add_project_to_custom_db(project_data, onyx_user_id, pool)
        except HTTPException as e:
            # Re-raise HTTP exceptions as-is
            raise e
        except Exception as e:
            logger.error(f"Failed to create project: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Failed to create lesson project")

        # Validate the created project
        if not created_project or not created_project.id:
            logger.error("Project creation returned invalid result")
            raise HTTPException(status_code=500, detail="Project creation failed - invalid response")

        logger.info(f"Successfully finalized lesson presentation with project ID: {created_project.id}")
        
        # Return response in the expected format
        return {
            "id": created_project.id,
            "projectName": created_project.project_name,
            "message": "Lesson presentation finalized successfully"
        }
    
    except HTTPException:
        # Re-raise HTTP exceptions without modification
        raise
    except Exception as e:
        logger.error(f"Unexpected error in lesson finalization: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail="An unexpected error occurred during finalization"
        )

# --- New endpoint: list trashed projects for user ---

@app.get("/api/custom/projects/trash", response_model=List[ProjectApiResponse])
async def get_user_trashed_projects(onyx_user_id: str = Depends(get_current_onyx_user_id), pool: asyncpg.Pool = Depends(get_db_pool)):
    """Return projects that were moved to trash (soft-deleted)."""
    query = """
        SELECT p.id, p.project_name, p.microproduct_name, p.created_at, p.design_template_id,
               dt.template_name as design_template_name,
               dt.microproduct_type as design_microproduct_type
        FROM trashed_projects p
        LEFT JOIN design_templates dt ON p.design_template_id = dt.id
        WHERE p.onyx_user_id = $1 ORDER BY p.created_at DESC;
    """
    try:
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, onyx_user_id)
        resp: List[ProjectApiResponse] = []
        for row in rows:
            row_d = dict(row)
            resp.append(ProjectApiResponse(
                id=row_d["id"],
                projectName=row_d["project_name"],
                projectSlug=create_slug(row_d["project_name"]),
                microproduct_name=row_d.get("microproduct_name"),
                design_template_name=row_d.get("design_template_name"),
                design_microproduct_type=row_d.get("design_microproduct_type"),
                created_at=row_d["created_at"],
                design_template_id=row_d.get("design_template_id")
            ))
        return resp
    except Exception as e:
        logger.error(f"Error fetching trashed projects list: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "An error occurred while fetching trashed projects." if IS_PRODUCTION else f"DB error fetching trashed projects: {str(e)}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)

# --- Restore trashed projects ---

@app.post("/api/custom/projects/restore-multiple", status_code=status.HTTP_200_OK)
async def restore_multiple_projects(delete_request: ProjectsDeleteRequest, onyx_user_id: str = Depends(get_current_onyx_user_id), pool: asyncpg.Pool = Depends(get_db_pool)):
    if not delete_request.project_ids:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"detail": "No project IDs provided for restore."})

    ids_to_restore: set[int] = set(delete_request.project_ids)

    try:
        async with pool.acquire() as conn:
            # Expand scope to related lessons when requested
            if delete_request.scope == 'all':
                for pid in delete_request.project_ids:
                    row = await conn.fetchrow(
                        "SELECT project_name, microproduct_type FROM trashed_projects WHERE id=$1 AND onyx_user_id=$2",
                        pid, onyx_user_id
                    )
                    if not row:
                        continue
                    pname: str = row["project_name"]
                    if row["microproduct_type"] not in ("Training Plan", "Course Outline"):
                        continue
                    pattern = pname + ":%"
                    lesson_rows = await conn.fetch(
                        "SELECT id FROM trashed_projects WHERE onyx_user_id=$1 AND (project_name=$2 OR project_name LIKE $3)",
                        onyx_user_id, pname, pattern
                    )
                    for lr in lesson_rows:
                        ids_to_restore.add(lr["id"])

            if not ids_to_restore:
                return JSONResponse(status_code=status.HTTP_200_OK, content={"detail": "No projects found to restore."})

            # First, fetch all the data we need to restore
            projects_to_restore = await conn.fetch("""
                SELECT 
                    id, onyx_user_id, project_name, product_type, microproduct_type,
                    microproduct_name, microproduct_content, design_template_id, created_at,
                    source_chat_session_id, folder_id, "order", completion_time
                FROM trashed_projects 
                WHERE id = ANY($1::bigint[]) AND onyx_user_id = $2
            """, list(ids_to_restore), onyx_user_id)

            if not projects_to_restore:
                return JSONResponse(status_code=status.HTTP_200_OK, content={"detail": "No projects found to restore."})

            async with conn.transaction():
                # Process each project individually to handle data conversion safely
                for project in projects_to_restore:
                    # Safely convert order and completion_time to strings (never integers)
                    order_value = "0"
                    completion_time_value = "0"
                    
                    # Handle order field - always convert to string
                    if project['order'] is not None:
                        try:
                            if isinstance(project['order'], str):
                                if project['order'].strip() and project['order'].isdigit():
                                    order_value = project['order'].strip()
                                else:
                                    order_value = "0"
                            else:
                                # Convert any non-string value to string
                                order_value = str(project['order']) if project['order'] is not None else "0"
                        except (ValueError, TypeError):
                            order_value = "0"
                    
                    # Handle completion_time field - always convert to string
                    if project['completion_time'] is not None:
                        try:
                            if isinstance(project['completion_time'], str):
                                if project['completion_time'].strip() and project['completion_time'].isdigit():
                                    completion_time_value = project['completion_time'].strip()
                                else:
                                    completion_time_value = "0"
                            else:
                                # Convert any non-string value to string
                                completion_time_value = str(project['completion_time']) if project['completion_time'] is not None else "0"
                        except (ValueError, TypeError):
                            completion_time_value = "0"

                    # Insert into projects with safe values
                    await conn.execute("""
                        INSERT INTO projects (
                            id, onyx_user_id, project_name, product_type, microproduct_type,
                            microproduct_name, microproduct_content, design_template_id, created_at,
                            source_chat_session_id, folder_id, "order", completion_time
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    """,
                        project['id'], project['onyx_user_id'], project['project_name'],
                        project['product_type'], project['microproduct_type'], project['microproduct_name'],
                        project['microproduct_content'], project['design_template_id'], project['created_at'],
                        project['source_chat_session_id'], project['folder_id'], order_value, completion_time_value
                    )

                # Delete from trashed_projects table
                await conn.execute(
                    "DELETE FROM trashed_projects WHERE id = ANY($1::bigint[]) AND onyx_user_id = $2",
                    list(ids_to_restore), onyx_user_id
                )

        return JSONResponse(status_code=status.HTTP_200_OK, content={"detail": f"Successfully restored {len(ids_to_restore)} project(s)."})

    except Exception as e:
        logger.error(f"Error restoring projects: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "An error occurred while restoring projects." if IS_PRODUCTION else f"DB error while restoring projects: {str(e)}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)


# --- Permanently delete trashed projects ---

@app.post("/api/custom/projects/delete-permanently", status_code=status.HTTP_200_OK)
async def delete_permanently(delete_request: ProjectsDeleteRequest, onyx_user_id: str = Depends(get_current_onyx_user_id), pool: asyncpg.Pool = Depends(get_db_pool)):
    if not delete_request.project_ids:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"detail": "No project IDs provided for permanent deletion."})

    ids_to_delete: set[int] = set(delete_request.project_ids)

    try:
        async with pool.acquire() as conn:
            for pid in delete_request.project_ids:
                row = await conn.fetchrow(
                    "SELECT project_name, microproduct_type FROM trashed_projects WHERE id=$1 AND onyx_user_id=$2",
                    pid, onyx_user_id
                )
                if not row:
                    continue
                pname: str = row["project_name"]
                # If this is an outline, cascade to its lessons
                if row["microproduct_type"] in ("Training Plan", "Course Outline"):
                    pattern = pname + ":%"
                    lesson_rows = await conn.fetch(
                        "SELECT id FROM trashed_projects WHERE onyx_user_id=$1 AND (project_name=$2 OR project_name LIKE $3)",
                        onyx_user_id, pname, pattern
                    )
                    for lr in lesson_rows:
                        ids_to_delete.add(lr["id"])

            # Perform deletion of all collected ids
            result = await conn.execute(
                "DELETE FROM trashed_projects WHERE id = ANY($1::bigint[]) AND onyx_user_id=$2",
                list(ids_to_delete), onyx_user_id
            )

        deleted_count = int(result.split(" ")[1]) if result else 0
        return JSONResponse(status_code=status.HTTP_200_OK, content={"detail": f"Successfully deleted {deleted_count} project(s) permanently."})
    except Exception as e:
        logger.error(f"Error permanently deleting projects: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "An error occurred during permanent deletion." if IS_PRODUCTION else f"DB error during permanent deletion: {str(e)}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)


@app.get("/api/custom/projects/trash", response_model=List[ProjectApiResponse])
async def get_user_trashed_projects(onyx_user_id: str = Depends(get_current_onyx_user_id), pool: asyncpg.Pool = Depends(get_db_pool)):
    """Return projects that were moved to trash (soft-deleted)."""
    query = """
        SELECT p.id, p.project_name, p.microproduct_name, p.created_at, p.design_template_id,
               dt.template_name as design_template_name,
               dt.microproduct_type as design_microproduct_type
        FROM trashed_projects p
        LEFT JOIN design_templates dt ON p.design_template_id = dt.id
        WHERE p.onyx_user_id = $1 ORDER BY p.created_at DESC;
    """
    try:
        async with pool.acquire() as conn:
            rows = await conn.fetch(query, onyx_user_id)
        resp: List[ProjectApiResponse] = []
        for row in rows:
            row_d = dict(row)
            resp.append(ProjectApiResponse(
                id=row_d["id"],
                projectName=row_d["project_name"],
                projectSlug=create_slug(row_d["project_name"]),
                microproduct_name=row_d.get("microproduct_name"),
                design_template_name=row_d.get("design_template_name"),
                design_microproduct_type=row_d.get("design_microproduct_type"),
                created_at=row_d["created_at"],
                design_template_id=row_d.get("design_template_id")
            ))
        return resp
    except Exception as e:
        logger.error(f"Error fetching trashed projects list: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "An error occurred while fetching trashed projects." if IS_PRODUCTION else f"DB error fetching trashed projects: {str(e)}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)

# Add the new model for training plan editing
class TrainingPlanEditRequest(BaseModel):
    prompt: str
    projectId: int
    chatSessionId: Optional[str] = None
    language: str = "en"
    # File context for creation from documents
    fromFiles: Optional[bool] = None
    folderIds: Optional[str] = None  # comma-separated folder IDs
    fileIds: Optional[str] = None    # comma-separated file IDs

@app.post("/api/custom/training-plan/edit")
async def edit_training_plan_with_prompt(payload: TrainingPlanEditRequest, request: Request, pool: asyncpg.Pool = Depends(get_db_pool)):
    """Edit an existing training plan using AI prompt"""
    logger.info(f"[edit_training_plan_with_prompt] projectId={payload.projectId} prompt='{payload.prompt[:50]}...'")
    
    # Get current user
    onyx_user_id = await get_current_onyx_user_id(request)
    cookies = {ONYX_SESSION_COOKIE_NAME: request.cookies.get(ONYX_SESSION_COOKIE_NAME)}
    
    # Get the existing project data
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            SELECT p.*, dt.component_name 
            FROM projects p 
            LEFT JOIN design_templates dt ON p.design_template_id = dt.id 
            WHERE p.id = $1 AND p.onyx_user_id = $2
        """, payload.projectId, onyx_user_id)
        
        if not row:
            raise HTTPException(status_code=404, detail="Project not found")
        
        if row["component_name"] != COMPONENT_NAME_TRAINING_PLAN:
            raise HTTPException(status_code=400, detail="Project is not a training plan")

    # Get or create chat session
    if payload.chatSessionId:
        chat_id = payload.chatSessionId
    else:
        persona_id = await get_contentbuilder_persona_id(cookies)
        chat_id = await create_onyx_chat_session(persona_id, cookies)

    # Convert existing training plan to markdown format for AI processing
    existing_content = row["microproduct_content"]
    current_outline = ""
    
    if existing_content:
        # Convert existing training plan to markdown format with full details
        content_data = existing_content
        if isinstance(content_data, dict):
            main_title = content_data.get("mainTitle", "Training Plan")
            current_outline = f"# {main_title}\n\n"
            
            sections = content_data.get("sections", [])
            for section in sections:
                section_id = section.get("id", "")
                section_title = section.get("title", "")
                total_hours = section.get("totalHours", 0.0)
                current_outline += f"## {section_id} {section_title}\n"
                current_outline += f"**Total Hours:** {total_hours}\n\n"
                
                lessons = section.get("lessons", [])
                if lessons:
                    current_outline += "### Lessons:\n"
                    for idx, lesson in enumerate(lessons, 1):
                        lesson_title = lesson.get("title", "")
                        lesson_hours = lesson.get("hours", 1.0)
                        lesson_source = lesson.get("source", "Create from scratch")
                        
                        # Get check details
                        check = lesson.get("check", {})
                        check_type = check.get("type", "none")
                        check_text = check.get("text", "No")
                        
                        # Get content availability
                        content_available = lesson.get("contentAvailable", {})
                        content_type = content_available.get("type", "yes")
                        content_text = content_available.get("text", "100%")
                        
                        current_outline += f"{idx}. **{lesson_title}**\n"
                        current_outline += f"   - Hours: {lesson_hours}\n"
                        current_outline += f"   - Source: {lesson_source}\n"
                        current_outline += f"   - Assessment: {check_type} ({check_text})\n"
                        current_outline += f"   - Content Available: {content_type} ({content_text})\n\n"
                else:
                    current_outline += "*No lessons defined*\n\n"
                current_outline += "\n"

    # Prepare wizard payload
    wiz_payload = {
        "product": "Training Plan Edit",
        "prompt": payload.prompt,
        "language": payload.language,
        "originalOutline": current_outline,
        "editMode": True
    }

    wizard_message = "WIZARD_REQUEST\n" + json.dumps(wiz_payload)

    # Stream the response
    async def streamer():
        assistant_reply: str = ""
        last_send = asyncio.get_event_loop().time()

        # Use longer timeout for large text processing to prevent AI memory issues
        timeout_duration = 300.0 if wiz_payload.get("virtualFileId") else None  # 5 minutes for large texts
        logger.info(f"Using timeout duration: {timeout_duration} seconds for AI processing")
        try:
            async with httpx.AsyncClient(timeout=timeout_duration) as client:
                # Parse folder and file IDs for Onyx
                folder_ids_list = []
                file_ids_list = []
                if payload.fromFiles and payload.folderIds:
                    folder_ids_list = [int(fid) for fid in payload.folderIds.split(',') if fid.strip().isdigit()]
                if payload.fromFiles and payload.fileIds:
                    file_ids_list = [int(fid) for fid in payload.fileIds.split(',') if fid.strip().isdigit()]
                
                # Add virtual file ID if created for large text
                if wiz_payload.get("virtualFileId"):
                    file_ids_list.append(wiz_payload["virtualFileId"])
                    logger.info(f"Added virtual file ID {wiz_payload['virtualFileId']} to file_ids_list")
                
                send_payload = {
                    "chat_session_id": chat_id,
                    "message": wizard_message,
                    "parent_message_id": None,
                    "file_descriptors": [],
                    "user_file_ids": file_ids_list,
                    "user_folder_ids": folder_ids_list,
                    "prompt_id": None,
                    "search_doc_ids": None,
                    "retrieval_options": {"run_search": "never", "real_time": False},
                    "stream_response": True,
                }
                logger.info(f"[PREVIEW_ONYX] Sending request to Onyx /chat/send-message with payload: user_file_ids={file_ids_list}, user_folder_ids={folder_ids_list}")
                async with client.stream("POST", f"{ONYX_API_SERVER_URL}/chat/send-message", json=send_payload, cookies=cookies) as resp:
                    logger.info(f"[PREVIEW_ONYX] Response status: {resp.status_code}")
                    async for raw_line in resp.aiter_lines():
                        if not raw_line:
                            continue
                        line = raw_line.strip()
                        if line.startswith("data:"):
                            line = line.split("data:", 1)[1].strip()
                        if line == "[DONE]":
                            logger.info("[PREVIEW_ONYX] Received [DONE] from Onyx stream")
                            break
                        try:
                            pkt = json.loads(line)
                            if "answer_piece" in pkt:
                                delta_text = pkt["answer_piece"].replace("\\n", "\n")
                                assistant_reply += delta_text
                                logger.debug(f"[PREVIEW_ONYX] Received chunk: {delta_text[:80]}")
                                yield (json.dumps({"type": "delta", "text": delta_text}) + "\n").encode()
                        except Exception as e:
                            logger.error(f"[PREVIEW_ONYX] Error parsing chunk: {e} | Raw: {line[:100]}")
                            continue

                        # send keep-alive every 8s
                        now = asyncio.get_event_loop().time()
                        if now - last_send > 8:
                            yield b" "
                            last_send = now
        except Exception as e:
            logger.error(f"[PREVIEW_ONYX] Exception in streaming: {e}")
            raise

        # Cache full raw outline for later finalize step
        if chat_id:
            OUTLINE_PREVIEW_CACHE[chat_id] = assistant_reply
            logger.info(f"[PREVIEW_CACHE] Cached preview for chat_id={chat_id}, length={len(assistant_reply)}")

        modules_preview = _parse_outline_markdown(assistant_reply)
        logger.info(f"[PREVIEW_DONE] Parsed modules: {len(modules_preview)}")

        # NEW: Parse AI response into structured TrainingPlanDetails and update the database immediately
        updated_content_dict: Optional[Dict[str, Any]] = None
        try:
            # Use the proper LLM parser to convert AI response to TrainingPlanDetails
            component_specific_instructions = "Parse the training plan content according to the JSON example provided. Extract all sections, lessons, and their details including hours, assessment types, and content availability."
            
            # Create a default TrainingPlanDetails instance for error handling
            default_training_plan = TrainingPlanDetails(
                mainTitle=row["project_name"],
                sections=[],
                detectedLanguage=detect_language(assistant_reply)
            )
            
            # Example JSON structure for the LLM parser
            llm_json_example = json.dumps({
                "mainTitle": "Example Training Plan",
                "sections": [
                    {
                        "id": "№1",
                        "title": "Introduction to Topic",
                        "totalHours": 10,
                        "lessons": [
                            {
                                "title": "Lesson 1: Basics",
                                "hours": 2,
                                "source": "Create from scratch",
                                "completionTime": "5m",
                                "check": {"type": "test", "text": "Test"},
                                "contentAvailable": {"type": "yes", "text": "100%"}
                            }
                        ],
                        "autoCalculateHours": True
                    }
                ],
                "detectedLanguage": "en",
                "theme": "cherry"
            })
            
            parsed_training_plan = await parse_ai_response_with_llm(
                ai_response=assistant_reply,
                project_name=row["project_name"],
                target_model=TrainingPlanDetails,
                default_error_model_instance=default_training_plan,
                dynamic_instructions=component_specific_instructions,
                target_json_example=llm_json_example
            )
            
            if parsed_training_plan:
                # Detect language and set it
                parsed_training_plan.detectedLanguage = detect_language(assistant_reply)
                updated_content_dict = parsed_training_plan.model_dump(mode='json', exclude_none=True)
                
                # Update the database immediately
                async with pool.acquire() as conn:
                    await conn.execute("""
                        UPDATE projects 
                        SET microproduct_content = $1
                        WHERE id = $2 AND onyx_user_id = $3
                    """, updated_content_dict, payload.projectId, onyx_user_id)
                
                logger.info(f"[SMART_EDIT_SUCCESS] Updated training plan projectId={payload.projectId}")
            
        except Exception as e:
            logger.error(f"[SMART_EDIT_ERROR] Error parsing/updating training plan: {e}")
            # Fall back to the preview-only mode if parsing fails
            updated_content_dict = None

        # Send completion packet with updatedContent for frontend
        if updated_content_dict:
            done_packet = {"type": "done", "updatedContent": updated_content_dict}
        else:
            # Fallback to old format if parsing failed
            done_packet = {"type": "done", "modules": modules_preview, "raw": assistant_reply}
        
        yield (json.dumps(done_packet) + "\n").encode()

    return StreamingResponse(streamer(), media_type="application/json")

# Add the finalize model for training plan editing
class TrainingPlanEditFinalize(BaseModel):
    prompt: str
    projectId: int
    chatSessionId: str
    editedOutline: Dict[str, Any]
    language: str = "en"

@app.post("/api/custom/training-plan/finalize")
async def finalize_training_plan_edit(payload: TrainingPlanEditFinalize, request: Request, pool: asyncpg.Pool = Depends(get_db_pool)):
    """Finalize and apply the edited training plan"""
    logger.info(f"[finalize_training_plan_edit] projectId={payload.projectId} chatSessionId={payload.chatSessionId}")
    
    # Get current user
    onyx_user_id = await get_current_onyx_user_id(request)
    
    # Get the cached preview
    cached_preview = OUTLINE_PREVIEW_CACHE.get(payload.chatSessionId)
    if not cached_preview:
        raise HTTPException(status_code=400, detail="No preview found for this session. Please regenerate the preview.")
    
    # Get the existing project data
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            SELECT p.*, dt.component_name 
            FROM projects p 
            LEFT JOIN design_templates dt ON p.design_template_id = dt.id 
            WHERE p.id = $1 AND p.onyx_user_id = $2
        """, payload.projectId, onyx_user_id)
        
        if not row:
            raise HTTPException(status_code=404, detail="Project not found")
        
        if row["component_name"] != COMPONENT_NAME_TRAINING_PLAN:
            raise HTTPException(status_code=400, detail="Project is not a training plan")
    
    # Parse the edited outline from the cached preview
    try:
        training_plan_details = parse_training_plan_from_string(cached_preview, row["project_name"])
        if not training_plan_details:
            raise HTTPException(status_code=400, detail="Failed to parse the edited training plan")
        
        # Detect language from the content
        detected_language = detect_language(cached_preview)
        training_plan_details.detectedLanguage = detected_language
        
        # Update the project with the new content
        await conn.execute("""
            UPDATE projects 
            SET microproduct_content = $1, 
                updated_at = NOW()
            WHERE id = $2 AND onyx_user_id = $3
        """, json.dumps(training_plan_details.dict()), payload.projectId, onyx_user_id)
        
        logger.info(f"[FINALIZE_SUCCESS] Updated training plan projectId={payload.projectId}")
        
        # Clean up the cache
        OUTLINE_PREVIEW_CACHE.pop(payload.chatSessionId, None)
        
        return {"success": True, "message": "Training plan updated successfully"}
        
    except Exception as e:
        logger.error(f"[FINALIZE_ERROR] Error finalizing training plan: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to finalize training plan: {str(e)}")

# --- Folders API Models ---
class ProjectFolderCreateRequest(BaseModel):
    name: str
    parent_id: Optional[int] = None
    quality_tier: Optional[str] = "medium"  # Default to medium tier
    custom_rate: Optional[int] = 200  # Default to 200 custom rate

class ProjectFolderResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    parent_id: Optional[int] = None
    quality_tier: Optional[str] = "medium"  # Default to medium tier
    custom_rate: Optional[int] = 200  # Default to 200 custom rate

class ProjectFolderListResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    order: int
    parent_id: Optional[int] = None
    quality_tier: Optional[str] = "medium"  # Default to medium tier
    custom_rate: Optional[int] = 200  # Default to 200 custom rate
    project_count: int
    total_lessons: int
    total_hours: int
    total_completion_time: int
    model_config = {"from_attributes": True}

class ProjectFolderRenameRequest(BaseModel):
    name: str

class ProjectFolderMoveRequest(BaseModel):
    parent_id: Optional[int] = None

class ProjectFolderTierRequest(BaseModel):
    quality_tier: str
    custom_rate: int

# --- Folders API Endpoints ---
@app.get("/api/custom/projects/folders", response_model=List[ProjectFolderListResponse])
async def list_folders(onyx_user_id: str = Depends(get_current_onyx_user_id), pool: asyncpg.Pool = Depends(get_db_pool)):
    query = """
        SELECT 
            pf.id, 
            pf.name, 
            pf.created_at, 
            pf."order", 
            pf.parent_id,
            COALESCE(pf.quality_tier, 'medium') as quality_tier,
            COALESCE(pf.custom_rate, 200) as custom_rate,
            COUNT(p.id) as project_count,
            COALESCE(
                SUM(
                    CASE 
                        WHEN p.microproduct_content IS NOT NULL 
                        AND p.microproduct_content->>'sections' IS NOT NULL 
                        THEN (
                            SELECT COUNT(*)::int 
                            FROM jsonb_array_elements(p.microproduct_content->'sections') AS section
                            CROSS JOIN LATERAL jsonb_array_elements(section->'lessons') AS lesson
                        )
                        ELSE 0 
                    END
                ), 0
            ) as total_lessons,
            COALESCE(
                SUM(
                    CASE 
                        WHEN p.microproduct_content IS NOT NULL 
                        AND p.microproduct_content->>'sections' IS NOT NULL 
                        THEN (
                            SELECT COALESCE(SUM(
                                CASE 
                                    WHEN lesson->>'completionTime' IS NOT NULL AND lesson->>'completionTime' != '' 
                                    THEN (
                                        -- Calculate tier-adjusted creation hours using the same method as Python calculate_creation_hours
                                        -- Python: round((completion_time_minutes / 60.0) * ratio)
                                        -- SQL equivalent: ROUND((completion_time_minutes / 60.0) * ratio)
                                        ROUND((REPLACE(lesson->>'completionTime', 'm', '')::int / 60.0) * COALESCE(pf.custom_rate, 200))
                                    )
                                    ELSE 0 
                                END
                            ), 0)
                            FROM jsonb_array_elements(p.microproduct_content->'sections') AS section
                            CROSS JOIN LATERAL jsonb_array_elements(section->'lessons') AS lesson
                        )
                        ELSE 0 
                    END
                ), 0
            ) as total_hours,
            COALESCE(
                SUM(
                    CASE 
                        WHEN p.microproduct_content IS NOT NULL 
                        AND p.microproduct_content->>'sections' IS NOT NULL 
                        THEN (
                            SELECT COALESCE(SUM(
                                CASE 
                                    WHEN lesson->>'completionTime' IS NOT NULL AND lesson->>'completionTime' != '' 
                                    THEN (REPLACE(lesson->>'completionTime', 'm', '')::int)
                                    ELSE 0 
                                END
                            ), 0)
                            FROM jsonb_array_elements(p.microproduct_content->'sections') AS section
                            CROSS JOIN LATERAL jsonb_array_elements(section->'lessons') AS lesson
                        )
                        ELSE 0 
                    END
                ), 0
            ) as total_completion_time
        FROM project_folders pf
        LEFT JOIN projects p ON pf.id = p.folder_id
        WHERE pf.onyx_user_id = $1
        GROUP BY pf.id, pf.name, pf.created_at, pf."order", pf.parent_id
        ORDER BY pf."order" ASC, pf.created_at ASC;
    """
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, onyx_user_id)
    return [ProjectFolderListResponse(**dict(row)) for row in rows]

@app.post("/api/custom/projects/folders", response_model=ProjectFolderResponse)
async def create_folder(req: ProjectFolderCreateRequest, onyx_user_id: str = Depends(get_current_onyx_user_id), pool: asyncpg.Pool = Depends(get_db_pool)):
    async with pool.acquire() as conn:
        # If parent_id is provided, verify it exists and belongs to user
        if req.parent_id is not None:
            parent_folder = await conn.fetchrow(
                "SELECT * FROM project_folders WHERE id = $1 AND onyx_user_id = $2",
                req.parent_id, onyx_user_id
            )
            if not parent_folder:
                raise HTTPException(status_code=404, detail="Parent folder not found")
        
        query = "INSERT INTO project_folders (onyx_user_id, name, parent_id, quality_tier, custom_rate) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, created_at, parent_id, quality_tier, custom_rate;"
        row = await conn.fetchrow(query, onyx_user_id, req.name, req.parent_id, req.quality_tier, req.custom_rate)
    return ProjectFolderResponse(**dict(row))

@app.patch("/api/custom/projects/folders/{folder_id}", response_model=ProjectFolderResponse)
async def rename_folder(folder_id: int, req: ProjectFolderRenameRequest, onyx_user_id: str = Depends(get_current_onyx_user_id), pool: asyncpg.Pool = Depends(get_db_pool)):
    query = "UPDATE project_folders SET name = $1 WHERE id = $2 AND onyx_user_id = $3 RETURNING id, name, created_at;"
    async with pool.acquire() as conn:
        row = await conn.fetchrow(query, req.name, folder_id, onyx_user_id)
    if not row:
        raise HTTPException(status_code=404, detail="Folder not found")
    return ProjectFolderResponse(**dict(row))

@app.delete("/api/custom/projects/folders/{folder_id}", status_code=204)
async def delete_folder(folder_id: int, onyx_user_id: str = Depends(get_current_onyx_user_id), pool: asyncpg.Pool = Depends(get_db_pool)):
    # Set folder_id to NULL for all projects in this folder (preserve projects)
    async with pool.acquire() as conn:
        await conn.execute("UPDATE projects SET folder_id = NULL WHERE folder_id = $1 AND onyx_user_id = $2;", folder_id, onyx_user_id)
        result = await conn.execute("DELETE FROM project_folders WHERE id = $1 AND onyx_user_id = $2;", folder_id, onyx_user_id)
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Folder not found")
    return JSONResponse(status_code=204, content={})

@app.put("/api/custom/projects/folders/{folder_id}/move", response_model=ProjectFolderResponse)
async def move_folder(folder_id: int, req: ProjectFolderMoveRequest, onyx_user_id: str = Depends(get_current_onyx_user_id), pool: asyncpg.Pool = Depends(get_db_pool)):
    """Move a folder to a different parent folder"""
    async with pool.acquire() as conn:
        # Verify the folder exists and belongs to user
        folder = await conn.fetchrow(
            "SELECT * FROM project_folders WHERE id = $1 AND onyx_user_id = $2",
            folder_id, onyx_user_id
        )
        if not folder:
            raise HTTPException(status_code=404, detail="Folder not found")
        
        # If parent_id is provided, verify it exists and belongs to user
        if req.parent_id is not None:
            parent_folder = await conn.fetchrow(
                "SELECT * FROM project_folders WHERE id = $1 AND onyx_user_id = $2",
                req.parent_id, onyx_user_id
            )
            if not parent_folder:
                raise HTTPException(status_code=404, detail="Parent folder not found")
            
            # Prevent circular references - check if the target parent is a descendant of this folder
            if req.parent_id == folder_id:
                raise HTTPException(status_code=400, detail="Cannot move folder into itself")
            
            # Check for circular references by traversing up the tree
            current_parent_id = req.parent_id
            while current_parent_id is not None:
                if current_parent_id == folder_id:
                    raise HTTPException(status_code=400, detail="Cannot move folder into its own descendant")
                parent = await conn.fetchrow(
                    "SELECT parent_id FROM project_folders WHERE id = $1 AND onyx_user_id = $2",
                    current_parent_id, onyx_user_id
                )
                if not parent:
                    break
                current_parent_id = parent['parent_id']
        
        # Update the folder's parent_id
        updated_folder = await conn.fetchrow(
            "UPDATE project_folders SET parent_id = $1 WHERE id = $2 AND onyx_user_id = $3 RETURNING id, name, created_at, parent_id",
            req.parent_id, folder_id, onyx_user_id
        )
        
        return ProjectFolderResponse(**dict(updated_folder))

@app.patch("/api/custom/projects/folders/{folder_id}/tier", response_model=ProjectFolderResponse)
async def update_folder_tier(folder_id: int, req: ProjectFolderTierRequest, onyx_user_id: str = Depends(get_current_onyx_user_id), pool: asyncpg.Pool = Depends(get_db_pool)):
    """Update the quality tier of a folder and recalculate creation hours for all projects in the folder"""
    async with pool.acquire() as conn:
        # Verify the folder exists and belongs to user
        folder = await conn.fetchrow(
            "SELECT * FROM project_folders WHERE id = $1 AND onyx_user_id = $2",
            folder_id, onyx_user_id
        )
        if not folder:
            raise HTTPException(status_code=404, detail="Folder not found")
        
        # Update the folder's quality_tier and custom_rate
        updated_folder = await conn.fetchrow(
            "UPDATE project_folders SET quality_tier = $1, custom_rate = $2 WHERE id = $3 AND onyx_user_id = $4 RETURNING id, name, created_at, parent_id, quality_tier, custom_rate",
            req.quality_tier, req.custom_rate, folder_id, onyx_user_id
        )
        
        # Get all projects in this folder (including subfolders recursively)
        projects_to_update = await conn.fetch("""
            WITH RECURSIVE folder_tree AS (
                -- Base case: the target folder
                SELECT id, parent_id FROM project_folders WHERE id = $1
                UNION ALL
                -- Recursive case: child folders
                SELECT pf.id, pf.parent_id 
                FROM project_folders pf
                INNER JOIN folder_tree ft ON pf.parent_id = ft.id
            )
            SELECT DISTINCT p.id, p.microproduct_content, p.folder_id
            FROM projects p
            INNER JOIN folder_tree ft ON p.folder_id = ft.id
            WHERE p.microproduct_content IS NOT NULL 
            AND p.microproduct_content->>'sections' IS NOT NULL
        """, folder_id)
        
        # Update creation hours for each project based on the new tier and custom rate
        for project in projects_to_update:
            try:
                content = project['microproduct_content']
                if isinstance(content, dict) and 'sections' in content:
                    sections = content['sections']
                    total_completion_time = 0
                    
                    # Calculate total completion time
                    for section in sections:
                        if isinstance(section, dict) and 'lessons' in section:
                            for lesson in section['lessons']:
                                if isinstance(lesson, dict):
                                    completion_time_str = lesson.get('completionTime', '')
                                    if completion_time_str:
                                        try:
                                            completion_time_minutes = int(completion_time_str.replace('m', ''))
                                            total_completion_time += completion_time_minutes
                                        except (ValueError, AttributeError):
                                            pass
                    
                    # Update the hours in each lesson and recalculate section totals
                    for section in sections:
                        if isinstance(section, dict) and 'lessons' in section:
                            section_total_hours = 0
                            for lesson in section['lessons']:
                                if isinstance(lesson, dict) and lesson.get('completionTime'):
                                    # Calculate proportional hours for this lesson
                                    lesson_completion_time = int(lesson['completionTime'].replace('m', ''))
                                    lesson_creation_hours = calculate_creation_hours(lesson_completion_time, req.custom_rate)
                                    lesson['hours'] = lesson_creation_hours
                                    section_total_hours += lesson_creation_hours
                            
                            # Update the section's totalHours with tier-adjusted sum
                            if 'totalHours' in section:
                                section['totalHours'] = round(section_total_hours)
                    
                    # Update the project in the database
                    await conn.execute(
                        "UPDATE projects SET microproduct_content = $1 WHERE id = $2",
                        content, project['id']
                    )
                    
            except Exception as e:
                logger.error(f"Error updating project {project['id']} creation hours: {e}")
                continue
        
        return ProjectFolderResponse(**dict(updated_folder))

# --- Update project queries to support folder_id (backward compatible) ---
# In all project list endpoints, add folder_id to SELECT and response models, and allow filtering by folder_id (optional)
# ... existing code ...

class ProjectFolderUpdateRequest(BaseModel):
    folder_id: Optional[int] = None
    model_config = {"from_attributes": True}

@app.put("/api/custom/projects/update/{project_id}", response_model=ProjectDB)
async def update_project_in_db(project_id: int, project_update_data: ProjectUpdateRequest, onyx_user_id: str = Depends(get_current_onyx_user_id), pool: asyncpg.Pool = Depends(get_db_pool)):
    try:
        db_microproduct_name_to_store = project_update_data.microProductName
        current_component_name = None
        async with pool.acquire() as conn:
            project_row = await conn.fetchrow("SELECT dt.component_name FROM projects p JOIN design_templates dt ON p.design_template_id = dt.id WHERE p.id = $1 AND p.onyx_user_id = $2", project_id, onyx_user_id)
            if not project_row:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found or not owned by user.")
            current_component_name = project_row["component_name"]

        if (not db_microproduct_name_to_store or not db_microproduct_name_to_store.strip()) and project_update_data.design_template_id:
            async with pool.acquire() as conn: design_row = await conn.fetchrow("SELECT template_name FROM design_templates WHERE id = $1", project_update_data.design_template_id)
            if design_row: db_microproduct_name_to_store = design_row["template_name"]

        content_to_store_for_db = project_update_data.microProductContent.model_dump(mode='json', exclude_none=True) if project_update_data.microProductContent else None

        derived_product_type = None; derived_microproduct_type = None
        if project_update_data.design_template_id is not None:
            async with pool.acquire() as conn: design_template = await conn.fetchrow("SELECT microproduct_type, template_name, component_name FROM design_templates WHERE id = $1", project_update_data.design_template_id)
            if design_template:
                derived_product_type = design_template["microproduct_type"]
                derived_microproduct_type = design_template["template_name"]
                current_component_name = design_template["component_name"]

        update_clauses = []; update_values = []; arg_idx = 1
        
        # Handle project name updates and sync with Training Plan mainTitle
        project_name_updated = False
        if project_update_data.projectName is not None: 
            update_clauses.append(f"project_name = ${arg_idx}")
            update_values.append(project_update_data.projectName)
            arg_idx += 1
            project_name_updated = True
        if db_microproduct_name_to_store is not None: update_clauses.append(f"microproduct_name = ${arg_idx}"); update_values.append(db_microproduct_name_to_store); arg_idx +=1
        if project_update_data.design_template_id is not None:
            update_clauses.append(f"design_template_id = ${arg_idx}"); update_values.append(project_update_data.design_template_id); arg_idx +=1
            if derived_product_type: update_clauses.append(f"product_type = ${arg_idx}"); update_values.append(derived_product_type); arg_idx += 1
            if derived_microproduct_type: update_clauses.append(f"microproduct_type = ${arg_idx}"); update_values.append(derived_microproduct_type); arg_idx += 1
        if project_update_data.microProductContent is not None: 
            update_clauses.append(f"microproduct_content = ${arg_idx}")
            update_values.append(content_to_store_for_db); arg_idx += 1
            
            # SYNC TITLES: For Training Plans, keep project_name and mainTitle synchronized
            if current_component_name == COMPONENT_NAME_TRAINING_PLAN and content_to_store_for_db:
                try:
                    # Extract mainTitle from the content
                    main_title = content_to_store_for_db.get('mainTitle')
                    if main_title and isinstance(main_title, str) and main_title.strip():
                        # Update project_name to match mainTitle
                        update_clauses.append(f"project_name = ${arg_idx}")
                        update_values.append(main_title.strip())
                        arg_idx += 1
                except Exception as e:
                    logger.warning(f"Could not sync mainTitle to project_name for project {project_id}: {e}")

        # SYNC TITLES: If only project_name was updated (not content), sync it to mainTitle for Training Plans
        if (project_name_updated and project_update_data.microProductContent is None and 
            current_component_name == COMPONENT_NAME_TRAINING_PLAN):
            try:
                # Get current content to update mainTitle
                async with pool.acquire() as conn:
                    current_row = await conn.fetchrow(
                        "SELECT microproduct_content FROM projects WHERE id = $1 AND onyx_user_id = $2", 
                        project_id, onyx_user_id
                    )
                    if current_row and current_row["microproduct_content"]:
                        current_content = dict(current_row["microproduct_content"])
                        current_content["mainTitle"] = project_update_data.projectName
                        update_clauses.append(f"microproduct_content = ${arg_idx}")
                        update_values.append(current_content)
                        arg_idx += 1
            except Exception as e:
                logger.warning(f"Could not sync project_name to mainTitle for project {project_id}: {e}")

        if not update_clauses:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No update data provided.")

        update_values.extend([project_id, onyx_user_id])
        update_query = f"UPDATE projects SET {', '.join(update_clauses)} WHERE id = ${arg_idx} AND onyx_user_id = ${arg_idx + 1} RETURNING id, onyx_user_id, project_name, product_type, microproduct_type, microproduct_name, microproduct_content, design_template_id, created_at;"

        async with pool.acquire() as conn: row = await conn.fetchrow(update_query, *update_values)
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found or update failed.")

        db_content = row["microproduct_content"]
        final_content_for_model: Optional[MicroProductContentType] = None
        if db_content and isinstance(db_content, dict):
            # Round hours to integers before parsing to prevent float validation errors
            if current_component_name == COMPONENT_NAME_TRAINING_PLAN:
                db_content = round_hours_in_content(db_content)
            
            try:
                if current_component_name == COMPONENT_NAME_PDF_LESSON:
                    final_content_for_model = PdfLessonDetails(**db_content)
                elif current_component_name == COMPONENT_NAME_TEXT_PRESENTATION:
                    final_content_for_model = TextPresentationDetails(**db_content)
                elif current_component_name == COMPONENT_NAME_TRAINING_PLAN:
                    final_content_for_model = TrainingPlanDetails(**db_content)
                elif current_component_name == COMPONENT_NAME_VIDEO_LESSON:
                    final_content_for_model = VideoLessonData(**db_content)
                elif current_component_name == COMPONENT_NAME_QUIZ:
                    final_content_for_model = QuizData(**db_content)
                elif current_component_name == COMPONENT_NAME_SLIDE_DECK:
                    final_content_for_model = SlideDeckDetails(**db_content)
                else:
                    final_content_for_model = TrainingPlanDetails(**db_content)
            except Exception as e_parse:
                logger.error(f"Error parsing updated content from DB (proj ID {row['id']}): {e_parse}", exc_info=not IS_PRODUCTION)

        return ProjectDB(
            id=row["id"], onyx_user_id=row["onyx_user_id"], project_name=row["project_name"],
            product_type=row["product_type"], microproduct_type=row["microproduct_type"],
            microproduct_name=row["microproduct_name"], microproduct_content=final_content_for_model,
            design_template_id=row["design_template_id"], created_at=row["created_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating project {project_id}: {e}", exc_info=not IS_PRODUCTION)
        detail_msg = "An error occurred while updating project." if IS_PRODUCTION else f"DB error on project update: {str(e)}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)

@app.put("/api/custom/projects/{project_id}/folder", response_model=ProjectDB)
async def update_project_folder(project_id: int, update_data: ProjectFolderUpdateRequest, onyx_user_id: str = Depends(get_current_onyx_user_id), pool: asyncpg.Pool = Depends(get_db_pool)):
    """Update a project's folder assignment and recalculate creation hours based on the new folder's tier"""
    async with pool.acquire() as conn:
        # Verify project belongs to user
        project = await conn.fetchrow(
            "SELECT * FROM projects WHERE id = $1 AND onyx_user_id = $2",
            project_id, onyx_user_id
        )
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # If folder_id is provided, verify it exists and belongs to user
        if update_data.folder_id is not None:
            folder = await conn.fetchrow(
                "SELECT * FROM project_folders WHERE id = $1 AND onyx_user_id = $2",
                update_data.folder_id, onyx_user_id
            )
            if not folder:
                raise HTTPException(status_code=404, detail="Folder not found")
        
        # Update the project's folder_id
        updated_project = await conn.fetchrow(
            "UPDATE projects SET folder_id = $1 WHERE id = $2 AND onyx_user_id = $3 RETURNING *",
            update_data.folder_id, project_id, onyx_user_id
        )
        
        # If the project has content and is being moved to a folder, recalculate creation hours
        if update_data.folder_id is not None and project['microproduct_content']:
            try:
                # Get the folder's custom rate
                folder_custom_rate = await get_folder_custom_rate(update_data.folder_id, pool)
                
                content = project['microproduct_content']
                if isinstance(content, dict) and 'sections' in content:
                    sections = content['sections']
                    
                    # Update the hours in each lesson and recalculate section totals
                    for section in sections:
                        if isinstance(section, dict) and 'lessons' in section:
                            section_total_hours = 0
                            for lesson in section['lessons']:
                                if isinstance(lesson, dict) and lesson.get('completionTime'):
                                    # Calculate new hours for this lesson
                                    lesson_completion_time = int(lesson['completionTime'].replace('m', ''))
                                    lesson_creation_hours = calculate_creation_hours(lesson_completion_time, folder_custom_rate)
                                    lesson['hours'] = lesson_creation_hours
                                    section_total_hours += lesson_creation_hours
                            
                            # Update the section's totalHours with tier-adjusted sum
                            if 'totalHours' in section:
                                section['totalHours'] = round(section_total_hours)
                    
                    # Round all hours in the content to ensure they are integers
                    content = round_hours_in_content(content)
                    
                    # Update the project in the database with new hours
                    await conn.execute(
                        "UPDATE projects SET microproduct_content = $1 WHERE id = $2",
                        content, project_id
                    )
                    
                    # Update the returned project data
                    updated_project = await conn.fetchrow(
                        "SELECT * FROM projects WHERE id = $1 AND onyx_user_id = $2",
                        project_id, onyx_user_id
                    )
                    
            except Exception as e:
                logger.error(f"Error updating project {project_id} creation hours after folder move: {e}")
        
        # Parse the content properly based on component type
        db_content = updated_project["microproduct_content"]
        final_content_for_model: Optional[MicroProductContentType] = None
        
        if db_content and isinstance(db_content, dict):
            try:
                # Get the component name to determine the content type
                component_row = await conn.fetchrow(
                    "SELECT dt.component_name FROM projects p JOIN design_templates dt ON p.design_template_id = dt.id WHERE p.id = $1",
                    project_id
                )
                current_component_name = component_row["component_name"] if component_row else COMPONENT_NAME_TRAINING_PLAN
                
                # Round hours to integers before parsing to prevent float validation errors
                if current_component_name == COMPONENT_NAME_TRAINING_PLAN:
                    db_content = round_hours_in_content(db_content)
                
                if current_component_name == COMPONENT_NAME_PDF_LESSON:
                    final_content_for_model = PdfLessonDetails(**db_content)
                elif current_component_name == COMPONENT_NAME_TEXT_PRESENTATION:
                    final_content_for_model = TextPresentationDetails(**db_content)
                elif current_component_name == COMPONENT_NAME_TRAINING_PLAN:
                    final_content_for_model = TrainingPlanDetails(**db_content)
                elif current_component_name == COMPONENT_NAME_VIDEO_LESSON:
                    final_content_for_model = VideoLessonData(**db_content)
                elif current_component_name == COMPONENT_NAME_QUIZ:
                    final_content_for_model = QuizData(**db_content)
                elif current_component_name == COMPONENT_NAME_SLIDE_DECK:
                    final_content_for_model = SlideDeckDetails(**db_content)
                else:
                    final_content_for_model = TrainingPlanDetails(**db_content)
            except Exception as e_parse:
                logger.error(f"Error parsing updated content from DB (proj ID {updated_project['id']}): {e_parse}", exc_info=not IS_PRODUCTION)
        
        return ProjectDB(
            id=updated_project["id"], 
            onyx_user_id=updated_project["onyx_user_id"], 
            project_name=updated_project["project_name"],
            product_type=updated_project["product_type"], 
            microproduct_type=updated_project["microproduct_type"],
            microproduct_name=updated_project["microproduct_name"], 
            microproduct_content=final_content_for_model,
            design_template_id=updated_project["design_template_id"], 
            created_at=updated_project["created_at"]
        )

class ProjectOrderUpdateRequest(BaseModel):
    orders: List[Dict[str, int]]  # List of {projectId: int, order: int}

@app.put("/api/custom/projects/update-order", status_code=status.HTTP_200_OK)
async def update_project_order(order_data: ProjectOrderUpdateRequest, onyx_user_id: str = Depends(get_current_onyx_user_id), pool: asyncpg.Pool = Depends(get_db_pool)):
    """Update the order of multiple projects"""
    try:
        async with pool.acquire() as conn:
            # Update each project's order
            for order_item in order_data.orders:
                project_id = order_item.get('projectId')
                order = order_item.get('order')
                
                if project_id is not None and order is not None:
                    # Verify project belongs to user and update order
                    result = await conn.execute(
                        "UPDATE projects SET \"order\" = $1 WHERE id = $2 AND onyx_user_id = $3",
                        order, project_id, onyx_user_id
                    )
                    
                    if result == "UPDATE 0":
                        logger.warning(f"Project {project_id} not found or not owned by user {onyx_user_id}")
        
        return {"message": "Project order updated successfully"}
    except Exception as e:
        logger.error(f"Error updating project order: {e}", exc_info=not IS_PRODUCTION)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update project order")

@app.put("/api/custom/projects/folders/update-order")
async def update_folder_order(
    orders: List[Dict[str, int]], 
    onyx_user_id: str = Depends(get_current_onyx_user_id), 
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    """Update the order of folders"""
    async with pool.acquire() as conn:
        for order_data in orders:
            folder_id = order_data.get("folderId")
            order = order_data.get("order")
            if folder_id is not None and order is not None:
                await conn.execute(
                    "UPDATE project_folders SET \"order\" = $1 WHERE id = $2 AND onyx_user_id = $3",
                    order, folder_id, onyx_user_id
                )
    return {"message": "Folder order updated successfully"}

@app.get("/api/custom/projects/{project_id}/lesson-data")
async def get_project_lesson_data(project_id: int, onyx_user_id: str = Depends(get_current_onyx_user_id), pool: asyncpg.Pool = Depends(get_db_pool)):
    """Get lesson data for a project with tier-adjusted creation hours"""
    try:
        async with pool.acquire() as conn:
            # Get project details including folder_id
            project = await conn.fetchrow(
                "SELECT p.microproduct_content, p.folder_id, dt.component_name FROM projects p JOIN design_templates dt ON p.design_template_id = dt.id WHERE p.id = $1 AND p.onyx_user_id = $2",
                project_id, onyx_user_id
            )
            
            if not project:
                raise HTTPException(status_code=404, detail="Project not found")
            
            content = project["microproduct_content"]
            component_name = project["component_name"]
            folder_id = project["folder_id"]
            
            # Only Training Plans have lesson data
            if component_name != COMPONENT_NAME_TRAINING_PLAN or not content:
                return {"lessonCount": 0, "totalHours": 0, "completionTime": 0, "sections": []}
            
            # Get the folder's custom rate (with inheritance from parent)
            folder_custom_rate = 200  # Default custom rate
            if folder_id:
                folder_custom_rate = await get_folder_custom_rate(folder_id, pool)
            
            # Parse the training plan content
            try:
                if isinstance(content, dict):
                    sections = content.get("sections", [])
                    total_lessons = 0
                    total_hours = 0
                    total_completion_time = 0
                    sections_data = []
                    
                    for section in sections:
                        if isinstance(section, dict):
                            lessons = section.get("lessons", [])
                            section_lessons = len(lessons)
                            section_hours = 0
                            section_completion_time = 0
                            
                            total_lessons += section_lessons
                            
                            # Sum up completion time and calculate tier-adjusted hours for this section
                            for lesson in lessons:
                                if isinstance(lesson, dict):
                                    # Parse completion time (e.g., "5m", "6m", "7m", "8m")
                                    completion_time_str = lesson.get("completionTime", "")
                                    if completion_time_str:
                                        try:
                                            # Remove 'm' suffix and convert to integer
                                            completion_time_minutes = int(completion_time_str.replace('m', ''))
                                            section_completion_time += completion_time_minutes
                                            total_completion_time += completion_time_minutes
                                            
                                            # Calculate custom rate-adjusted creation hours
                                            lesson_creation_hours = calculate_creation_hours(completion_time_minutes, folder_custom_rate)
                                            section_hours += lesson_creation_hours
                                            total_hours += lesson_creation_hours
                                        except (ValueError, AttributeError):
                                            # If parsing fails, skip this lesson's completion time
                                            pass
                            
                            # Add section data with tier-adjusted totals
                            sections_data.append({
                                "id": section.get("id", ""),
                                "title": section.get("title", ""),
                                "totalHours": round(section_hours),
                                "totalCompletionTime": section_completion_time,
                                "lessonCount": section_lessons
                            })
                    
                    return {
                        "lessonCount": total_lessons, 
                        "totalHours": round(total_hours), 
                        "completionTime": total_completion_time,
                        "sections": sections_data
                    }
                else:
                    return {"lessonCount": 0, "totalHours": 0, "completionTime": 0, "sections": []}
            except Exception as e:
                logger.warning(f"Error parsing lesson data for project {project_id}: {e}")
                return {"lessonCount": 0, "totalHours": 0, "completionTime": 0, "sections": []}
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting lesson data for project {project_id}: {e}", exc_info=not IS_PRODUCTION)
        raise HTTPException(status_code=500, detail="Failed to get lesson data")

@app.get("/api/custom/pdf/projects-list", response_class=FileResponse, responses={404: {"model": ErrorDetail}, 500: {"model": ErrorDetail}})
async def download_projects_list_pdf(
    folder_id: Optional[int] = Query(None),
    column_visibility: Optional[str] = Query(None),  # JSON string of column visibility settings
    client_name: Optional[str] = Query(None),  # Client name for PDF header customization
    selected_folders: Optional[str] = Query(None),  # JSON string of selected folder IDs
    selected_projects: Optional[str] = Query(None),  # JSON string of selected project IDs
    column_widths: Optional[str] = Query(None),  # JSON string of column width settings
    onyx_user_id: str = Depends(get_current_onyx_user_id),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    """Download projects list as PDF with all folders expanded, deduplicated like the products page."""
    try:
        # Parse column visibility settings
        column_visibility_settings = {
            'title': True,
            'created': False,
            'creator': False,
            'numberOfLessons': True,
            'estCreationTime': True,
            'estCompletionTime': True
        }
        if column_visibility:
            try:
                parsed_settings = json.loads(column_visibility)
                column_visibility_settings.update(parsed_settings)
            except json.JSONDecodeError:
                logger.warning("Invalid column_visibility JSON, using defaults")

        # Fetch projects and folders data
        async with pool.acquire() as conn:
            # Fetch projects
            projects_query = """
                SELECT p.id, p.project_name, p.microproduct_name, p.created_at, p.design_template_id,
                       dt.template_name as design_template_name,
                       dt.microproduct_type as design_microproduct_type,
                       p.folder_id, p."order", p.microproduct_content
                FROM projects p
                LEFT JOIN design_templates dt ON p.design_template_id = dt.id
                WHERE p.onyx_user_id = $1
                ORDER BY p."order" ASC, p.created_at DESC;
            """
            projects_params = [onyx_user_id]
            
            if folder_id is not None:
                projects_query = projects_query.replace("WHERE p.onyx_user_id = $1", "WHERE p.onyx_user_id = $1 AND p.folder_id = $2")
                projects_params.append(folder_id)
            
            projects_rows = await conn.fetch(projects_query, *projects_params)
            
            # Fetch folders with hierarchical structure (only if not viewing a specific folder)
            folders_data = []
            if folder_id is None:
                folders_query = """
                    SELECT 
                        pf.id, 
                        pf.name, 
                        pf.created_at, 
                        pf."order", 
                        pf.parent_id,
                        pf.quality_tier,
                        pf.custom_rate,
                        COUNT(p.id) as project_count,
                        COALESCE(
                            SUM(
                                CASE 
                                    WHEN p.microproduct_content IS NOT NULL 
                                    AND p.microproduct_content->>'sections' IS NOT NULL 
                                    THEN (
                                        SELECT COUNT(*)::int 
                                        FROM jsonb_array_elements(p.microproduct_content->'sections') AS section
                                        CROSS JOIN LATERAL jsonb_array_elements(section->'lessons') AS lesson
                                    )
                                    ELSE 0 
                                END
                            ), 0
                        ) as total_lessons,
                        COALESCE(
                            SUM(
                                CASE 
                                    WHEN p.microproduct_content IS NOT NULL 
                                    AND p.microproduct_content->>'sections' IS NOT NULL 
                                    THEN (
                                        SELECT COALESCE(SUM((lesson->>'hours')::float), 0)
                                        FROM jsonb_array_elements(p.microproduct_content->'sections') AS section
                                        CROSS JOIN LATERAL jsonb_array_elements(section->'lessons') AS lesson
                                    )
                                    ELSE 0 
                                END
                            ), 0
                        ) as total_hours,
                        COALESCE(
                            SUM(
                                CASE 
                                    WHEN p.microproduct_content IS NOT NULL 
                                    AND p.microproduct_content->>'sections' IS NOT NULL 
                                    THEN (
                                        SELECT COALESCE(SUM(
                                            CASE 
                                                WHEN lesson->>'completionTime' IS NOT NULL AND lesson->>'completionTime' != '' 
                                                THEN (REPLACE(lesson->>'completionTime', 'm', '')::int)
                                                ELSE 0 
                                            END
                                        ), 0)
                                        FROM jsonb_array_elements(p.microproduct_content->'sections') AS section
                                        CROSS JOIN LATERAL jsonb_array_elements(section->'lessons') AS lesson
                                    )
                                    ELSE 0 
                                END
                            ), 0
                        ) as total_completion_time
                    FROM project_folders pf
                    LEFT JOIN projects p ON pf.id = p.folder_id
                    WHERE pf.onyx_user_id = $1
                    GROUP BY pf.id, pf.name, pf.created_at, pf."order", pf.parent_id, pf.quality_tier, pf.custom_rate
                    ORDER BY pf."order" ASC, pf.created_at ASC;
                """
                folders_rows = await conn.fetch(folders_query, onyx_user_id)
                folders_data = [dict(row) for row in folders_rows]

        # Process projects data
        projects_data = []
        for row in projects_rows:
            row_dict = dict(row)
            
            # Calculate individual project times
            total_lessons = 0
            total_hours = 0.0
            total_completion_time = 0
            
            if row_dict.get('microproduct_content') and isinstance(row_dict['microproduct_content'], dict):
                content = row_dict['microproduct_content']
                if content.get('sections') and isinstance(content['sections'], list):
                    for section in content['sections']:
                        if section.get('lessons') and isinstance(section['lessons'], list):
                            for lesson in section['lessons']:
                                total_lessons += 1
                                if lesson.get('hours'):
                                    try:
                                        total_hours += float(lesson['hours'])
                                    except (ValueError, TypeError):
                                        pass
                                if lesson.get('completionTime'):
                                    time_str = str(lesson['completionTime']).strip()
                                    if time_str and time_str != '':
                                        if time_str.endswith('m'):
                                            try:
                                                minutes = int(time_str[:-1])
                                                total_completion_time += minutes
                                            except ValueError:
                                                pass
                                        elif time_str.endswith('h'):
                                            try:
                                                hours = int(time_str[:-1])
                                                total_completion_time += (hours * 60)
                                            except ValueError:
                                                pass
                                        elif time_str.isdigit():
                                            try:
                                                total_completion_time += int(time_str)
                                            except ValueError:
                                                pass
            
            projects_data.append({
                'id': row_dict['id'],
                'title': row_dict.get('project_name') or row_dict.get('microproduct_name') or 'Untitled',
                'created_at': row_dict['created_at'],
                'created_by': 'You',
                'design_microproduct_type': row_dict.get('design_microproduct_type'),
                'folder_id': row_dict.get('folder_id'),
                'order': row_dict.get('order', 0),
                'microproduct_content': row_dict.get('microproduct_content'),
                'total_lessons': total_lessons,
                'total_hours': round(total_hours),
                'total_completion_time': total_completion_time
            })

        # --- Deduplicate projects: only show top-level products and outlines, hide lessons/quizzes that belong to an outline ---
        def deduplicate_projects(projects_arr):
            outline_names = set()
            filtered_projects = []
            grouped = {}
            # First pass: collect all outline names and group by title
            for proj in projects_arr:
                is_outline = (proj.get('design_microproduct_type') or '').lower() == 'training plan'
                if is_outline:
                    outline_names.add(proj['title'].strip())
                if proj['title'] not in grouped:
                    grouped[proj['title']] = {'outline': None, 'others': []}
                if is_outline:
                    if not grouped[proj['title']]['outline']:
                        grouped[proj['title']]['outline'] = proj
                else:
                    grouped[proj['title']]['others'].append(proj)
            # Second pass: filter projects
            for proj in projects_arr:
                is_outline = (proj.get('design_microproduct_type') or '').lower() == 'training plan'
                if is_outline:
                    filtered_projects.append(proj)
                else:
                    project_title = proj['title'].strip()
                    belongs_to_outline = False
                    group_for_this_title = grouped[proj['title']]
                    if group_for_this_title and group_for_this_title['outline']:
                        belongs_to_outline = True
                    if not belongs_to_outline and ': ' in project_title:
                        outline_part = project_title.split(': ')[0].strip()
                        if outline_part in outline_names:
                            belongs_to_outline = True
                    if not belongs_to_outline:
                        filtered_projects.append(proj)
            return filtered_projects

        projects_data = deduplicate_projects(projects_data)

        # Build folder tree structure
        def build_folder_tree(folders):
            folder_map = {}
            root_folders = []
            
            # Create folder map
            for folder in folders:
                folder['children'] = []
                folder_map[folder['id']] = folder
            
            # Build tree structure
            for folder in folders:
                if folder['parent_id'] is None:
                    root_folders.append(folder)
                else:
                    parent = folder_map.get(folder['parent_id'])
                    if parent:
                        parent['children'].append(folder)
            
            return root_folders

        # Group projects by folder
        folder_projects = {}
        unassigned_projects = []
        
        for project in projects_data:
            if project['folder_id']:
                if project['folder_id'] not in folder_projects:
                    folder_projects[project['folder_id']] = []
                folder_projects[project['folder_id']].append(project)
            else:
                unassigned_projects.append(project)

        # Build hierarchical folder structure
        folder_tree = build_folder_tree(folders_data) if folders_data else []

        # Calculate recursive totals for folders (including subfolder projects)
        def calculate_recursive_totals(folder):
            # Start with direct project totals
            direct_projects = folder_projects.get(folder['id'], [])
            total_lessons = sum(p['total_lessons'] for p in direct_projects)
            total_hours = sum(p['total_hours'] for p in direct_projects)
            total_completion_time = sum(p['total_completion_time'] for p in direct_projects)
            total_items = len(direct_projects)
            
            # Add subfolder totals recursively
            if folder.get('children'):
                for child in folder['children']:
                    child_totals = calculate_recursive_totals(child)
                    total_lessons += child_totals['total_lessons']
                    total_hours += child_totals['total_hours']
                    total_completion_time += child_totals['total_completion_time']
                    total_items += child_totals['total_items']
            
            # Update folder with recursive totals
            folder['total_lessons'] = total_lessons
            folder['total_hours'] = total_hours
            folder['total_completion_time'] = total_completion_time
            folder['project_count'] = total_items
            
            return {
                'total_lessons': total_lessons,
                'total_hours': total_hours,
                'total_completion_time': total_completion_time,
                'total_items': total_items
            }

        # Calculate recursive totals for all root folders
        for folder in folder_tree:
            calculate_recursive_totals(folder)

        # Helper function to get tier color
        def get_tier_color(tier):
            tier_colors = {
                'basic': '#22c55e',        # green-500
                'interactive': '#f97316',  # orange-500
                'advanced': '#a855f7',     # purple-500
                'immersive': '#3b82f6',    # blue-500
                # Legacy tier support
                'starter': '#22c55e',      # green-500 (mapped to basic)
                'medium': '#f97316',       # orange-500 (mapped to interactive)
                'professional': '#3b82f6'  # blue-500 (mapped to immersive)
            }
            return tier_colors.get(tier, '#f97316')  # default to interactive

        # Helper function to check if folder has course outlines
        def has_course_outlines(folder_id):
            projects = folder_projects.get(folder_id, [])
            return any(p.get('design_microproduct_type', '').lower() == 'training plan' for p in projects)

        # Helper function to check if folder or any subfolder has course outlines
        def has_course_outlines_recursive(folder):
            # Check direct projects
            if has_course_outlines(folder['id']):
                return True
            
            # Check subfolders recursively
            if folder.get('children'):
                for child in folder['children']:
                    if has_course_outlines_recursive(child):
                        return True
            
            return False

        # Add tier information and check for course outlines
        def add_tier_info(folder):
            folder['tier_color'] = get_tier_color(folder.get('quality_tier', 'interactive'))
            folder['has_course_outlines'] = has_course_outlines_recursive(folder)
            
            # Recursively process children
            if folder.get('children'):
                for child in folder['children']:
                    add_tier_info(child)

        # Add tier information to all folders
        for folder in folder_tree:
            add_tier_info(folder)

        # Filter data based on selected folders and projects
        if selected_folders or selected_projects:
            try:
                selected_folder_ids = set()
                selected_project_ids = set()
                
                # Parse selected folders
                if selected_folders:
                    selected_folder_ids = set(json.loads(selected_folders))
                
                # Parse selected projects
                if selected_projects:
                    selected_project_ids = set(json.loads(selected_projects))
                
                # Filter folders - only include selected folders and their children
                def filter_folders_recursive(folders_list):
                    filtered_folders = []
                    for folder in folders_list:
                        # Include folder if it's selected or if any of its children are selected
                        if folder['id'] in selected_folder_ids:
                            filtered_folders.append(folder)
                        else:
                            # Check if any children are selected
                            if folder.get('children'):
                                filtered_children = filter_folders_recursive(folder['children'])
                                if filtered_children:
                                    folder_copy = folder.copy()
                                    folder_copy['children'] = filtered_children
                                    filtered_folders.append(folder_copy)
                    return filtered_folders
                
                filtered_folder_tree = filter_folders_recursive(folder_tree)
                
                # Filter folder projects - only include projects from selected folders
                filtered_folder_projects = {}
                for folder_id, projects in folder_projects.items():
                    if folder_id in selected_folder_ids:
                        # Filter projects within this folder
                        if selected_project_ids:
                            filtered_projects = [p for p in projects if p['id'] in selected_project_ids]
                            if filtered_projects:
                                filtered_folder_projects[folder_id] = filtered_projects
                        else:
                            filtered_folder_projects[folder_id] = projects
                
                # Filter unassigned projects
                filtered_unassigned_projects = unassigned_projects
                if selected_project_ids:
                    filtered_unassigned_projects = [p for p in unassigned_projects if p['id'] in selected_project_ids]
                
                # Use filtered data
                folder_tree = filtered_folder_tree
                folder_projects = filtered_folder_projects
                unassigned_projects = filtered_unassigned_projects
                
            except (json.JSONDecodeError, TypeError) as e:
                logger.warning(f"Error parsing selected folders/projects: {e}. Using all data.")
                # If parsing fails, use all data (fallback)

        # Parse column widths if provided
        column_widths_settings = {}
        if column_widths:
            try:
                column_widths_settings = json.loads(column_widths)
            except (json.JSONDecodeError, TypeError) as e:
                logger.warning(f"Error parsing column widths: {e}. Using default widths.")
                column_widths_settings = {}

        # Prepare data for template
        template_data = {
            'folders': folder_tree,  # Use hierarchical structure
            'folder_projects': folder_projects,
            'unassigned_projects': unassigned_projects,
            'column_visibility': column_visibility_settings,
            'column_widths': column_widths_settings,
            'folder_id': folder_id,
            'client_name': client_name,  # Client name for header customization
            'generated_at': datetime.now().isoformat()
        }

        # Generate PDF
        unique_output_filename = f"projects_list_{onyx_user_id}_{uuid.uuid4().hex[:12]}.pdf"
        pdf_path = await generate_pdf_from_html_template("projects_list_pdf_template.html", template_data, unique_output_filename)
        
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="PDF file not found after generation.")
        
        user_friendly_filename = f"projects_list_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        return FileResponse(
            path=pdf_path, 
            filename=user_friendly_filename, 
            media_type='application/pdf', 
            headers={"Cache-Control": "no-cache, no-store, must-revalidate", "Pragma": "no-cache", "Expires": "0"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating projects list PDF: {e}", exc_info=not IS_PRODUCTION)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate PDF: {str(e)[:200]}")


# Quiz endpoints
class QuizWizardPreview(BaseModel):
    outlineId: Optional[int] = None  # Parent Training Plan project id
    lesson: Optional[str] = None      # Specific lesson to generate quiz for, optional when prompt-based
    prompt: Optional[str] = None           # Fallback free-form prompt
    language: str = "en"
    chatSessionId: Optional[str] = None
    questionTypes: str = "multiple-choice,multi-select,matching,sorting,open-answer"  # comma-separated question types
    questionCount: int = 10  # Number of questions to generate
    # NEW: file context for creation from documents
    fromFiles: Optional[bool] = None
    folderIds: Optional[str] = None  # comma-separated folder IDs
    fileIds: Optional[str] = None    # comma-separated file IDs
    # NEW: text context for creation from user text
    fromText: Optional[bool] = None
    textMode: Optional[str] = None   # "context" or "base"
    userText: Optional[str] = None   # User's pasted text

class QuizWizardFinalize(BaseModel):
    outlineId: Optional[int] = None
    lesson: str
    aiResponse: str                        # User-edited quiz data
    chatSessionId: Optional[str] = None
    questionTypes: str = "multiple-choice,multi-select,matching,sorting,open-answer"
    questionCount: int = 10  # Number of questions to generate
    language: str = "en"
    # NEW: file context for creation from documents
    fromFiles: Optional[bool] = None
    folderIds: Optional[str] = None  # comma-separated folder IDs
    fileIds: Optional[str] = None    # comma-separated file IDs
    # NEW: text context for creation from user text
    fromText: Optional[bool] = None
    textMode: Optional[str] = None   # "context" or "base"
    userText: Optional[str] = None   # User's pasted text

async def _ensure_quiz_template(pool: asyncpg.Pool) -> int:
    """Ensure quiz design template exists, return template ID"""
    try:
        # Check if quiz template exists
        template_query = """
            SELECT id FROM design_templates 
            WHERE microproduct_type = 'Quiz' 
            LIMIT 1
        """
        template_result = await pool.fetchval(template_query)
        
        if template_result:
            return template_result
        
        # Create quiz template if it doesn't exist
        insert_query = """
            INSERT INTO design_templates 
            (template_name, template_structuring_prompt, microproduct_type, component_name, design_image_path)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        """
        template_id = await pool.fetchval(
            insert_query,
            "Quiz Template",
            "Create an interactive quiz with various question types including multiple choice, multi-select, matching, sorting, and open answer questions.",
            "Quiz",
            COMPONENT_NAME_QUIZ,
            "/quiz.png"
        )
        return template_id
        
    except Exception as e:
        logger.error(f"Error ensuring quiz template: {e}", exc_info=not IS_PRODUCTION)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to ensure quiz template")

@app.post("/api/custom/quiz/generate")
async def quiz_generate(payload: QuizWizardPreview, request: Request):
    """Generate quiz content with streaming response"""
    logger.info(f"[QUIZ_PREVIEW_START] Quiz preview initiated")
    logger.info(f"[QUIZ_PREVIEW_PARAMS] outlineId={payload.outlineId} lesson='{payload.lesson}' prompt='{payload.prompt[:50] if payload.prompt else None}...'")
    logger.info(f"[QUIZ_PREVIEW_PARAMS] questionTypes={payload.questionTypes} lang={payload.language}")
    logger.info(f"[QUIZ_PREVIEW_PARAMS] fromFiles={payload.fromFiles} fromText={payload.fromText} textMode={payload.textMode}")
    logger.info(f"[QUIZ_PREVIEW_PARAMS] userText length={len(payload.userText) if payload.userText else 0}")
    logger.info(f"[QUIZ_PREVIEW_PARAMS] folderIds={payload.folderIds} fileIds={payload.fileIds}")
    
    cookies = {ONYX_SESSION_COOKIE_NAME: request.cookies.get(ONYX_SESSION_COOKIE_NAME)}
    logger.info(f"[QUIZ_PREVIEW_AUTH] Cookie present: {bool(cookies[ONYX_SESSION_COOKIE_NAME])}")

    if payload.chatSessionId:
        chat_id = payload.chatSessionId
        logger.info(f"[QUIZ_PREVIEW_CHAT] Using existing chat session: {chat_id}")
    else:
        logger.info(f"[QUIZ_PREVIEW_CHAT] Creating new chat session")
        try:
            persona_id = await get_contentbuilder_persona_id(cookies)
            logger.info(f"[QUIZ_PREVIEW_CHAT] Got persona ID: {persona_id}")
            chat_id = await create_onyx_chat_session(persona_id, cookies)
            logger.info(f"[QUIZ_PREVIEW_CHAT] Created new chat session: {chat_id}")
        except Exception as e:
            logger.error(f"[QUIZ_PREVIEW_CHAT_ERROR] Failed to create chat session: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create chat session: {str(e)}")

    wiz_payload = {
        "product": "Quiz",
        "prompt": payload.prompt or "Create a quiz",
        "language": payload.language,
        "questionTypes": payload.questionTypes,
        "questionCount": payload.questionCount,
    }

    # Add outline context if provided
    if payload.outlineId:
        wiz_payload["outlineId"] = payload.outlineId
    if payload.lesson:
        wiz_payload["lesson"] = payload.lesson

    # Add file context if provided
    if payload.fromFiles:
        wiz_payload["fromFiles"] = True
        if payload.folderIds:
            wiz_payload["folderIds"] = payload.folderIds
        if payload.fileIds:
            wiz_payload["fileIds"] = payload.fileIds

    # Add text context if provided - use virtual file system for large texts to prevent AI memory issues
    if payload.fromText and payload.userText:
        wiz_payload["fromText"] = True
        wiz_payload["textMode"] = payload.textMode
        
        text_length = len(payload.userText)
        logger.info(f"Processing text input: mode={payload.textMode}, length={text_length} chars")
        
        if text_length > LARGE_TEXT_THRESHOLD:
            # Use virtual file system for large texts to prevent AI memory issues
            logger.info(f"Text exceeds large threshold ({LARGE_TEXT_THRESHOLD}), using virtual file system")
            try:
                virtual_file_id = await create_virtual_text_file(payload.userText, cookies)
                wiz_payload["virtualFileId"] = virtual_file_id
                wiz_payload["textCompressed"] = False
                logger.info(f"Successfully created virtual file for large text ({text_length} chars) -> file ID: {virtual_file_id}")
            except Exception as e:
                logger.error(f"Failed to create virtual file for large text: {e}")
                # Fallback to chunking if virtual file creation fails
                chunks = chunk_text(payload.userText)
                if len(chunks) == 1:
                    # Single chunk, use compression
                    compressed_text = compress_text(payload.userText)
                    wiz_payload["userText"] = compressed_text
                    wiz_payload["textCompressed"] = True
                    logger.info(f"Fallback to compressed text for large content ({text_length} -> {len(compressed_text)} chars)")
                else:
                    # Multiple chunks, use first chunk with compression
                    first_chunk = chunks[0]
                    compressed_chunk = compress_text(first_chunk)
                    wiz_payload["userText"] = compressed_chunk
                    wiz_payload["textCompressed"] = True
                    wiz_payload["textChunked"] = True
                    wiz_payload["totalChunks"] = len(chunks)
                    logger.info(f"Fallback to first chunk with compression ({text_length} -> {len(compressed_chunk)} chars, {len(chunks)} total chunks)")
        elif text_length > TEXT_SIZE_THRESHOLD:
            # Compress medium text to reduce payload size
            logger.info(f"Text exceeds compression threshold ({TEXT_SIZE_THRESHOLD}), using compression")
            compressed_text = compress_text(payload.userText)
            wiz_payload["userText"] = compressed_text
            wiz_payload["textCompressed"] = True
            logger.info(f"Using compressed text for medium content ({text_length} -> {len(compressed_text)} chars)")
        else:
            # Use direct text for small content
            logger.info(f"Using direct text for small content ({text_length} chars)")
            wiz_payload["userText"] = payload.userText
            wiz_payload["textCompressed"] = False
    elif payload.fromText and not payload.userText:
        # Log this problematic case to help with debugging
        logger.warning(f"Received fromText=True but userText is empty or None. This may cause infinite loading. textMode={payload.textMode}")
        # Don't process fromText if userText is empty to avoid confusing the AI
    elif payload.fromText:
        logger.warning(f"Received fromText=True but userText evaluation failed. userText type: {type(payload.userText)}, value: {repr(payload.userText)[:100] if payload.userText else 'None'}")

    # Decompress text if it was compressed
    if wiz_payload.get("textCompressed") and wiz_payload.get("userText"):
        try:
            decompressed_text = decompress_text(wiz_payload["userText"])
            wiz_payload["userText"] = decompressed_text
            wiz_payload["textCompressed"] = False  # Mark as decompressed
            logger.info(f"Decompressed text for assistant ({len(decompressed_text)} chars)")
        except Exception as e:
            logger.error(f"Failed to decompress text: {e}")
            # Continue with original text if decompression fails
    
    wizard_message = "WIZARD_REQUEST\n" + json.dumps(wiz_payload)

    # ---------- StreamingResponse with keep-alive -----------
    async def streamer():
        assistant_reply: str = ""
        last_send = asyncio.get_event_loop().time()
        chunks_received = 0
        total_bytes_received = 0
        done_received = False

        # Use longer timeout for large text processing to prevent AI memory issues
        timeout_duration = 300.0 if wiz_payload.get("virtualFileId") else None  # 5 minutes for large texts
        logger.info(f"[QUIZ_PREVIEW_STREAM] Starting streamer with timeout: {timeout_duration} seconds")
        logger.info(f"[QUIZ_PREVIEW_STREAM] Wizard payload keys: {list(wiz_payload.keys())}")
        
        try:
            async with httpx.AsyncClient(timeout=timeout_duration) as client:
                # Parse folder and file IDs for Onyx
                folder_ids_list = []
                file_ids_list = []
                if payload.fromFiles and payload.folderIds:
                    folder_ids_list = [int(fid) for fid in payload.folderIds.split(',') if fid.strip().isdigit()]
                if payload.fromFiles and payload.fileIds:
                    file_ids_list = [int(fid) for fid in payload.fileIds.split(',') if fid.strip().isdigit()]
                
                # Add virtual file ID if created for large text
                if wiz_payload.get("virtualFileId"):
                    file_ids_list.append(wiz_payload["virtualFileId"])
                    logger.info(f"[QUIZ_PREVIEW_STREAM] Added virtual file ID {wiz_payload['virtualFileId']} to file_ids_list")
                
                send_payload = {
                    "chat_session_id": chat_id,
                    "message": wizard_message,
                    "parent_message_id": None,
                    "file_descriptors": [],
                    "user_file_ids": file_ids_list,
                    "user_folder_ids": folder_ids_list,
                    "prompt_id": None,
                    "search_doc_ids": None,
                    "retrieval_options": {"run_search": "never", "real_time": False},
                    "stream_response": True,
                }
                logger.info(f"[QUIZ_PREVIEW_ONYX] Sending request to Onyx /chat/send-message with payload: user_file_ids={file_ids_list}, user_folder_ids={folder_ids_list}")
                logger.info(f"[QUIZ_PREVIEW_ONYX] Message length: {len(wizard_message)} chars")
                
                async with client.stream("POST", f"{ONYX_API_SERVER_URL}/chat/send-message", json=send_payload, cookies=cookies) as resp:
                    logger.info(f"[QUIZ_PREVIEW_ONYX] Response status: {resp.status_code}")
                    logger.info(f"[QUIZ_PREVIEW_ONYX] Response headers: {dict(resp.headers)}")
                    
                    if resp.status_code != 200:
                        logger.error(f"[QUIZ_PREVIEW_ONYX] Non-200 status code: {resp.status_code}")
                        error_text = await resp.text()
                        logger.error(f"[QUIZ_PREVIEW_ONYX] Error response: {error_text}")
                        raise HTTPException(status_code=resp.status_code, detail=f"Onyx API error: {error_text}")
                    
                    async for raw_line in resp.aiter_lines():
                        total_bytes_received += len(raw_line.encode('utf-8'))
                        chunks_received += 1
                        
                        if not raw_line:
                            logger.debug(f"[QUIZ_PREVIEW_ONYX] Empty line received (chunk {chunks_received})")
                            continue
                            
                        line = raw_line.strip()
                        logger.debug(f"[QUIZ_PREVIEW_ONYX] Raw line {chunks_received}: {line[:100]}{'...' if len(line) > 100 else ''}")
                        
                        if line.startswith("data:"):
                            line = line.split("data:", 1)[1].strip()
                            logger.debug(f"[QUIZ_PREVIEW_ONYX] Processed data line: {line[:100]}{'...' if len(line) > 100 else ''}")
                            
                        if line == "[DONE]":
                            logger.info(f"[QUIZ_PREVIEW_ONYX] Received [DONE] signal after {chunks_received} chunks, {total_bytes_received} bytes")
                            done_received = True
                            break
                            
                        try:
                            pkt = json.loads(line)
                            if "answer_piece" in pkt:
                                delta_text = pkt["answer_piece"].replace("\\n", "\n")
                                assistant_reply += delta_text
                                logger.debug(f"[QUIZ_PREVIEW_ONYX] Chunk {chunks_received}: received {len(delta_text)} chars, total so far: {len(assistant_reply)}")
                                yield (json.dumps({"type": "delta", "text": delta_text}) + "\n").encode()
                            else:
                                logger.debug(f"[QUIZ_PREVIEW_ONYX] Chunk {chunks_received}: no answer_piece, keys: {list(pkt.keys())}")
                        except json.JSONDecodeError as e:
                            logger.error(f"[QUIZ_PREVIEW_ONYX] JSON decode error in chunk {chunks_received}: {e} | Raw: {line[:200]}")
                            continue
                    
                    if not done_received:
                        logger.warning(f"[QUIZ_PREVIEW_ONYX] Stream ended without [DONE] signal after {chunks_received} chunks")
                    
                    logger.info(f"[QUIZ_PREVIEW_ONYX] Stream completed: {chunks_received} chunks, {total_bytes_received} bytes, {len(assistant_reply)} chars total")
                    
        except Exception as e:
            logger.error(f"[QUIZ_PREVIEW_STREAM_ERROR] Error in streamer: {e}", exc_info=not IS_PRODUCTION)
            yield (json.dumps({"type": "error", "text": str(e)}) + "\n").encode()
            return

    return StreamingResponse(
        streamer(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        }
    )

@app.post("/api/custom/quiz/finalize")
async def quiz_finalize(payload: QuizWizardFinalize, request: Request, pool: asyncpg.Pool = Depends(get_db_pool)):
    """Finalize quiz creation by parsing AI response and saving to database"""
    onyx_user_id = await get_current_onyx_user_id(request)
    
    # Create a unique key for this quiz finalization to prevent duplicates
    quiz_key = f"{onyx_user_id}:{payload.lesson}:{hash(payload.aiResponse) % 1000000}"
    
    # Check if this quiz is already being processed
    if quiz_key in ACTIVE_QUIZ_FINALIZE_KEYS:
        logger.warning(f"[QUIZ_FINALIZE_DUPLICATE] Quiz finalization already in progress for key: {quiz_key}")
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Quiz finalization already in progress")
    
    # Add to active set and track timestamp
    ACTIVE_QUIZ_FINALIZE_KEYS.add(quiz_key)
    QUIZ_FINALIZE_TIMESTAMPS[quiz_key] = time.time()
    
    # Clean up stale entries (older than 5 minutes)
    current_time = time.time()
    stale_keys = [key for key, timestamp in QUIZ_FINALIZE_TIMESTAMPS.items() if current_time - timestamp > 300]
    for stale_key in stale_keys:
        ACTIVE_QUIZ_FINALIZE_KEYS.discard(stale_key)
        QUIZ_FINALIZE_TIMESTAMPS.pop(stale_key, None)
        logger.info(f"[QUIZ_FINALIZE_CLEANUP] Cleaned up stale quiz key: {stale_key}")
    
    try:
        # Ensure quiz template exists
        template_id = await _ensure_quiz_template(pool)
        
        # Create a consistent project name to prevent re-parsing issues
        project_name = f"Quiz - {payload.lesson or 'Standalone Quiz'}"
        
        logger.info(f"[QUIZ_FINALIZE_START] Starting quiz finalization for project: {project_name}")
        logger.info(f"[QUIZ_FINALIZE_PARAMS] aiResponse length: {len(payload.aiResponse)}")
        logger.info(f"[QUIZ_FINALIZE_PARAMS] lesson: {payload.lesson}")
        logger.info(f"[QUIZ_FINALIZE_PARAMS] language: {payload.language}")
        logger.info(f"[QUIZ_FINALIZE_PARAMS] quiz_key: {quiz_key}")
        
        # Parse the quiz data using LLM - only call once with consistent project name
        parsed_quiz = await parse_ai_response_with_llm(
            ai_response=payload.aiResponse,
            project_name=project_name,  # Use consistent project name
            target_model=QuizData,
            default_error_model_instance=QuizData(
                quizTitle=project_name,
                questions=[],
                detectedLanguage=payload.language
            ),
            dynamic_instructions=f"""
            CRITICAL: You must output ONLY valid JSON in the exact format shown in the example. Do not include any natural language, explanations, or markdown formatting.

            The AI response contains quiz questions in natural language format. You need to convert this into a structured QuizData JSON format.

            REQUIREMENTS:
            1. Extract the quiz title from the content
            2. For each question in the content, create a structured question object with:
               - "question_type": MUST be one of: "multiple-choice", "multi-select", "matching", "sorting", "open-answer"
               - "question_text": The actual question text
               - For multiple-choice: "options" array with {{"id": "A", "text": "option text"}}, "correct_option_id": "A"
               - For multi-select: "options" array, "correct_option_ids": ["A", "B"] (array)
               - For matching: "prompts" array, "options" array, "correct_matches": {{"A": "1", "B": "2"}}
               - For sorting: "items_to_sort" array, "correct_order": ["step1", "step2"]
               - For open-answer: "acceptable_answers": ["answer1", "answer2"]
               - "explanation": Explanation for the answer

            CRITICAL RULES:
            - Output ONLY the JSON object, no other text
            - Every question MUST have "question_type" field
            - Use exact field names as shown in the example
            - All IDs must be strings: "A", "B", "C", "D" or "1", "2", "3"
            - If content is unclear, infer question types based on structure
            - Language: {payload.language}
            """,
            target_json_example=DEFAULT_QUIZ_JSON_EXAMPLE_FOR_LLM
        )
        
        logger.info(f"[QUIZ_FINALIZE_PARSE] Parsing completed successfully for project: {project_name}")
        logger.info(f"[QUIZ_FINALIZE_PARSE] Parsed quiz title: {parsed_quiz.quizTitle}")
        logger.info(f"[QUIZ_FINALIZE_PARSE] Number of questions: {len(parsed_quiz.questions)}")
        
        # Detect language if not provided
        if not parsed_quiz.detectedLanguage:
            parsed_quiz.detectedLanguage = detect_language(payload.aiResponse)
        
        # If parsing failed and we have no questions, create a basic quiz structure
        if not parsed_quiz.questions:
            logger.warning(f"[QUIZ_FINALIZE_FALLBACK] LLM parsing failed for quiz, creating fallback structure")
            # Create a simple quiz with the AI response as content
            parsed_quiz.quizTitle = project_name
            parsed_quiz.questions = [
                {
                    "question_type": "open-answer",
                    "question_text": "Please review the quiz content and answer the questions.",
                    "acceptable_answers": ["See quiz content for answers"],
                    "explanation": "This is a fallback quiz structure. The original content is preserved in the AI response."
                }
            ]
        else:
            # Validate that all questions have the required question_type field
            valid_questions = []
            for i, question in enumerate(parsed_quiz.questions):
                if hasattr(question, 'question_type') and question.question_type:
                    valid_questions.append(question)
                else:
                    logger.warning(f"[QUIZ_FINALIZE_VALIDATION] Question {i} missing question_type, converting to open-answer")
                    # Convert to open-answer if question_type is missing
                    if hasattr(question, 'question_text'):
                        valid_questions.append({
                            "question_type": "open-answer",
                            "question_text": question.question_text,
                            "acceptable_answers": ["See original content for answer"],
                            "explanation": "This question was converted from the original format."
                        })
            
            if not valid_questions:
                logger.warning(f"[QUIZ_FINALIZE_VALIDATION] No valid questions found, creating fallback structure")
                parsed_quiz.questions = [
                    {
                        "question_type": "open-answer",
                        "question_text": "Please review the quiz content and answer the questions.",
                        "acceptable_answers": ["See quiz content for answers"],
                        "explanation": "This is a fallback quiz structure. The original content is preserved in the AI response."
                    }
                ]
            else:
                parsed_quiz.questions = valid_questions
        
        # Use the parsed quiz title or fallback to the consistent project name
        final_project_name = parsed_quiz.quizTitle or project_name
        
        logger.info(f"[QUIZ_FINALIZE_CREATE] Creating project with name: {final_project_name}")
        
        # For quiz components, we need to insert directly to avoid double parsing
        # since add_project_to_custom_db would call parse_ai_response_with_llm again
        insert_query = """
        INSERT INTO projects (
            onyx_user_id, project_name, product_type, microproduct_type,
            microproduct_name, microproduct_content, design_template_id, source_chat_session_id, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING id, onyx_user_id, project_name, product_type, microproduct_type, microproduct_name,
                  microproduct_content, design_template_id, source_chat_session_id, created_at;
        """
        
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                insert_query,
                onyx_user_id,
                final_project_name,
                "Quiz",  # product_type
                "Quiz",  # microproduct_type
                final_project_name,  # microproduct_name
                parsed_quiz.model_dump(mode='json', exclude_none=True),  # microproduct_content
                template_id,  # design_template_id
                None  # source_chat_session_id
            )
        
        if not row:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create quiz project entry.")
        
        created_project = ProjectDB(**dict(row))
        
        logger.info(f"[QUIZ_FINALIZE_SUCCESS] Quiz finalization successful: project_id={created_project.id}, project_name={final_project_name}")
        return {"id": created_project.id, "name": final_project_name}
        
    except Exception as e:
        logger.error(f"[QUIZ_FINALIZE_ERROR] Error in quiz finalization: {e}", exc_info=not IS_PRODUCTION)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    finally:
        # Always remove from active set and timestamps
        ACTIVE_QUIZ_FINALIZE_KEYS.discard(quiz_key)
        QUIZ_FINALIZE_TIMESTAMPS.pop(quiz_key, None)
        logger.info(f"[QUIZ_FINALIZE_CLEANUP] Removed quiz_key from active set: {quiz_key}")

# Default quiz JSON example for LLM parsing
DEFAULT_QUIZ_JSON_EXAMPLE_FOR_LLM = """
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
{"id": "B", "text": "The 'Summary Close'"}
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

CRITICAL REQUIREMENTS:
- Output ONLY the JSON object, no other text or formatting
- Every question MUST have "question_type" field with exact values: "multiple-choice", "multi-select", "matching", "sorting", "open-answer"
- Use exact field names as shown above
- All IDs must be strings: "A", "B", "C", "D" or "1", "2", "3"
- The "question_type" field is MANDATORY for every question
"""
