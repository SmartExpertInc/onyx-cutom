# custom_extensions/backend/app/services/html_template_service.py

import os
import logging
from typing import Dict, Any, Optional
from jinja2 import Environment, FileSystemLoader

logger = logging.getLogger(__name__)

class HTMLTemplateService:
    """Service for generating clean HTML from slide props for video generation."""
    
    def __init__(self):
        """Initialize the HTML template service."""
        # Set up Jinja2 environment
        template_dir = os.path.join(os.path.dirname(__file__), "../../templates")
        self.jinja_env = Environment(
            loader=FileSystemLoader(template_dir),
            trim_blocks=True,
            lstrip_blocks=True
        )
        
        # Add shuffle filter for randomization
        self.jinja_env.filters['shuffle'] = self._shuffle_filter
        
        logger.info(f"HTML Template Service initialized with template directory: {template_dir}")
    
    def _shuffle_filter(self, seq):
        """Jinja2 filter to shuffle a sequence."""
        try:
            import random
            seq_copy = list(seq)
            random.shuffle(seq_copy)
            return seq_copy
        except:
            return seq
    
    def generate_avatar_slide_html(self, 
                                 template_id: str, 
                                 props: Dict[str, Any], 
                                 theme: str = "dark-purple",
                                 metadata: Dict[str, Any] = None,
                                 slide_id: str = None) -> str:
        """
        Generate clean HTML for avatar slides.
        
        Args:
            template_id: The avatar template ID (avatar-checklist, avatar-crm, etc.)
            props: Slide properties from frontend
            theme: Theme name (dark-purple, light-modern, corporate-blue)
            metadata: Slide metadata (contains elementPositions for drag-and-drop)
            slide_id: Slide ID for positioning calculations
            
        Returns:
            Generated HTML string
        """
        try:
            logger.info(f"🎬 [HTML_TEMPLATE] Generating HTML for template: {template_id}, theme: {theme}")
            logger.info(f"🎬 [HTML_TEMPLATE] Props received:")
            logger.info(f"  - Props type: {type(props)}")
            logger.info(f"  - Props keys: {list(props.keys())}")
            logger.info(f"🎬 [HTML_TEMPLATE] Metadata received: {metadata}")
            logger.info(f"🎬 [HTML_TEMPLATE] Slide ID received: {slide_id}")
            
            # CRITICAL: Log text element positioning data
            logger.info(f"🔍 [TEXT_POSITIONING_DEBUG] === TEXT ELEMENT POSITIONING ANALYSIS ===")
            logger.info(f"🔍 [TEXT_POSITIONING_DEBUG] Input Data Check:")
            logger.info(f"  - Template ID: {template_id}")
            logger.info(f"  - Slide ID: {slide_id}")
            logger.info(f"  - Metadata type: {type(metadata)}")
            logger.info(f"  - Metadata content: {metadata}")
            
            if metadata and isinstance(metadata, dict):
                element_positions = metadata.get('elementPositions', {})
                logger.info(f"🔍 [TEXT_POSITIONING_DEBUG] Element Positions found:")
                logger.info(f"  - Element positions type: {type(element_positions)}")
                logger.info(f"  - Element positions content: {element_positions}")
                logger.info(f"  - Element positions keys: {list(element_positions.keys()) if element_positions else 'None'}")
                
                # Log each text element position
                if element_positions:
                    for element_id, position in element_positions.items():
                        if 'draggable' in element_id:  # Text elements use draggable IDs
                            logger.info(f"🔍 [TEXT_POSITIONING_DEBUG] Text Element Position:")
                            logger.info(f"    - Element ID: {element_id}")
                            logger.info(f"    - Position: {position}")
                            logger.info(f"    - X coordinate: {position.get('x', 'MISSING')}")
                            logger.info(f"    - Y coordinate: {position.get('y', 'MISSING')}")
                else:
                    logger.warning(f"🔍 [TEXT_POSITIONING_DEBUG] ⚠️ NO ELEMENT POSITIONS FOUND IN METADATA")
            else:
                logger.warning(f"🔍 [TEXT_POSITIONING_DEBUG] ⚠️ NO METADATA PROVIDED OR INVALID FORMAT")
            
            # Log detailed props content
            for key, value in props.items():
                if isinstance(value, str):
                    logger.info(f"  - {key}: '{value[:200]}...'")
                else:
                    logger.info(f"  - {key}: {value}")
            
            # Load the avatar slide template
            template = self.jinja_env.get_template("avatar_slide_template.html")
            
            # CRITICAL FIX: Include metadata AND slideId in context data for element positioning
            # Prepare context data
            context_data = {
                "templateId": template_id,
                "theme": theme,
                "metadata": metadata or {},  # Pass metadata to template
                "slideId": slide_id or "unknown-slide",  # CRITICAL: Add slideId for positioning
                **props  # Spread all props into context
            }
            
            logger.info(f"🎬 [HTML_TEMPLATE] Context data prepared:")
            logger.info(f"  - Template ID: {template_id}")
            logger.info(f"  - Theme: {theme}")
            logger.info(f"  - Metadata: {metadata}")
            logger.info(f"  - Slide ID: {slide_id}")
            logger.info(f"  - Context keys: {list(context_data.keys())}")
            
            # CRITICAL: Log context data for positioning
            logger.info(f"🔍 [TEXT_POSITIONING_DEBUG] Context Data Check:")
            logger.info(f"  - Context metadata: {context_data.get('metadata', 'MISSING')}")
            logger.info(f"  - Context slideId: {context_data.get('slideId', 'MISSING')}")
            
            # Render the template
            logger.info(f"🔍 [TEXT_POSITIONING_DEBUG] === RENDERING TEMPLATE ===")
            html_content = template.render(**context_data)
            
            logger.info(f"🎬 [HTML_TEMPLATE] HTML content generated successfully")
            logger.info(f"🎬 [HTML_TEMPLATE] HTML content length: {len(html_content)} characters")
            
            # CRITICAL: Log the raw HTML to check for positioning CSS injection
            logger.info(f"🔍 [TEXT_POSITIONING_DEBUG] === INJECTION FAILURE CHECK ===")
            logger.info(f"🔍 [TEXT_POSITIONING_DEBUG] Raw HTML Output Analysis:")
            
            # Check if positioning CSS was injected
            if 'transform: translate(' in html_content:
                logger.info(f"🔍 [TEXT_POSITIONING_DEBUG] ✅ POSITIONING CSS FOUND in HTML")
                # Find all transform: translate occurrences
                import re
                transform_matches = re.findall(r'transform:\s*translate\([^)]+\)', html_content)
                logger.info(f"🔍 [TEXT_POSITIONING_DEBUG] Transform CSS found: {len(transform_matches)} occurrences")
                for i, match in enumerate(transform_matches):
                    logger.info(f"🔍 [TEXT_POSITIONING_DEBUG]   {i+1}. {match}")
            else:
                logger.error(f"🔍 [TEXT_POSITIONING_DEBUG] ❌ NO POSITIONING CSS FOUND in HTML")
                logger.error(f"🔍 [TEXT_POSITIONING_DEBUG] This indicates positioning data was NOT injected")
            
            # Check for positioned-element class
            if 'positioned-element' in html_content:
                logger.info(f"🔍 [TEXT_POSITIONING_DEBUG] ✅ positioned-element class found in HTML")
            else:
                logger.warning(f"🔍 [TEXT_POSITIONING_DEBUG] ⚠️ positioned-element class NOT found in HTML")
            
            # Log a snippet of the generated HTML for debugging
            html_snippet = html_content[:1000] + "..." if len(html_content) > 1000 else html_content
            logger.info(f"🎬 [HTML_TEMPLATE] HTML snippet: {html_snippet}")
            
            # CRITICAL: Log final output check
            logger.info(f"🔍 [TEXT_POSITIONING_DEBUG] === FINAL OUTPUT CHECK ===")
            logger.info(f"🔍 [TEXT_POSITIONING_DEBUG] Final HTML length: {len(html_content)} characters")
            logger.info(f"🔍 [TEXT_POSITIONING_DEBUG] HTML contains positioning: {'transform: translate(' in html_content}")
            logger.info(f"🔍 [TEXT_POSITIONING_DEBUG] HTML contains slideId: {slide_id in html_content if slide_id else 'No slideId provided'}")
            
            return html_content
            
        except Exception as e:
            logger.error(f"Failed to generate HTML for {template_id}: {str(e)}")
            raise
    
    def validate_avatar_slide_props(self, template_id: str, props: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate and normalize props for avatar slides.
        
        Args:
            template_id: The avatar template ID
            props: Raw props from frontend
            
        Returns:
            Validated and normalized props
        """
        validated_props = {}
        
        try:
            if template_id == "avatar-checklist":
                validated_props = {
                    "title": props.get("title", ""),
                    "items": props.get("items", [])
                }
                
            elif template_id == "avatar-crm":
                validated_props = {
                    "title": props.get("title", ""),
                    "subtitle": props.get("subtitle", ""),
                    "content": props.get("content", "")
                }
                
            elif template_id == "avatar-service" or template_id == "avatar-service-slide":
                validated_props = {
                    "title": props.get("title", ""),
                    "subtitle": props.get("subtitle", ""),
                    "content": props.get("content", "")
                }
                
            elif template_id == "avatar-buttons":
                validated_props = {
                    "title": props.get("title", ""),
                    "buttons": props.get("buttons", [])
                }
                
            elif template_id == "avatar-steps":
                validated_props = {
                    "title": props.get("title", ""),
                    "steps": props.get("steps", [])
                }
                
            else:
                logger.warning(f"Unknown template ID: {template_id}")
                validated_props = props
            
            logger.info(f"Validated props for {template_id}: {list(validated_props.keys())}")
            return validated_props
            
        except Exception as e:
            logger.error(f"Failed to validate props for {template_id}: {str(e)}")
            return props
    
    def generate_clean_html_for_video(self, 
                                    template_id: str, 
                                    props: Dict[str, Any], 
                                    theme: str = "dark-purple",
                                    metadata: Dict[str, Any] = None,
                                    slide_id: str = None) -> str:
        """
        Generate clean HTML optimized for video generation.
        
        This is the main entry point for video generation pipeline.
        
        Args:
            template_id: The avatar template ID
            props: Slide properties from frontend
            theme: Theme name
            metadata: Slide metadata (contains elementPositions for drag-and-drop)
            slide_id: Slide ID for positioning calculations
            
        Returns:
            Clean HTML string ready for PNG conversion
        """
        try:
            # Validate and normalize props
            validated_props = self.validate_avatar_slide_props(template_id, props)
            
            # Generate HTML with metadata AND slideId
            html_content = self.generate_avatar_slide_html(
                template_id, validated_props, theme, metadata=metadata, slide_id=slide_id
            )
            
            logger.info(f"Generated clean HTML for video: {template_id}")
            return html_content
            
        except Exception as e:
            logger.error(f"Failed to generate clean HTML for video: {str(e)}")
            raise

# Global instance
html_template_service = HTMLTemplateService()
