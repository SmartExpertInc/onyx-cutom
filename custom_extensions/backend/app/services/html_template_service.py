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
                                 theme: str = "dark-purple") -> str:
        """
        Generate clean HTML for avatar slides.
        
        Args:
            template_id: The avatar template ID (avatar-checklist, avatar-crm, etc.)
            props: Slide properties from frontend
            theme: Theme name (dark-purple, light-modern, corporate-blue)
            
        Returns:
            Generated HTML string
        """
        try:
            logger.info(f"🎬 [HTML_TEMPLATE] Generating HTML for template: {template_id}, theme: {theme}")
            logger.info(f"🎬 [HTML_TEMPLATE] Props received:")
            logger.info(f"  - Props type: {type(props)}")
            logger.info(f"  - Props keys: {list(props.keys())}")
            
            # Log detailed props content
            for key, value in props.items():
                if isinstance(value, str):
                    logger.info(f"  - {key}: '{value[:200]}...'")
                else:
                    logger.info(f"  - {key}: {value}")
            
            # Load the avatar slide template
            template = self.jinja_env.get_template("avatar_slide_template.html")
            
            # Prepare context data
            context_data = {
                "templateId": template_id,
                "theme": theme,
                **props  # Spread all props into context
            }
            
            logger.info(f"🎬 [HTML_TEMPLATE] Context data prepared:")
            logger.info(f"  - Template ID: {template_id}")
            logger.info(f"  - Theme: {theme}")
            logger.info(f"  - Context keys: {list(context_data.keys())}")
            
            # Render the template
            html_content = template.render(**context_data)
            
            logger.info(f"🎬 [HTML_TEMPLATE] HTML content generated successfully")
            logger.info(f"🎬 [HTML_TEMPLATE] HTML content length: {len(html_content)} characters")
            
            # Log a snippet of the generated HTML for debugging
            html_snippet = html_content[:500] + "..." if len(html_content) > 500 else html_content
            logger.info(f"🎬 [HTML_TEMPLATE] HTML snippet: {html_snippet}")
            
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
                    "title": props.get("title", "Как звучать профессионально"),
                    "items": props.get("items", [
                        {"text": "«Позвольте я помогу»", "isPositive": True},
                        {"text": "«С удовольствием уточню»", "isPositive": True},
                        {"text": "«Спасибо, что обратили внимание»", "isPositive": True},
                        {"text": "Исключаем холодные фразы и неуверенность", "isPositive": False}
                    ])
                }
                
            elif template_id == "avatar-crm":
                validated_props = {
                    "title": props.get("title", "Личное отношение - залог следующих ВИЗИТОВ"),
                    "subtitle": props.get("subtitle", "Помните детали"),
                    "content": props.get("content", "Интересуйтесь")
                }
                
            elif template_id == "avatar-service":
                validated_props = {
                    "title": props.get("title", "Клиентский сервис -"),
                    "subtitle": props.get("subtitle"),
                    "content": props.get("content")
                }
                
            elif template_id == "avatar-buttons":
                validated_props = {
                    "title": props.get("title", "Продуманный сервис ощущается сразу"),
                    "buttons": props.get("buttons", [
                        {"text": "Внимание", "color": "#e91e63"},
                        {"text": "Скорость", "color": "#e91e63"},
                        {"text": "Тепло", "color": "#e91e63"},
                        {"text": "Забота", "color": "#e91e63"}
                    ])
                }
                
            elif template_id == "avatar-steps":
                validated_props = {
                    "title": props.get("title", "Каждый шаг - это часть сервиса"),
                    "steps": props.get("steps", [
                        "Приветствие",
                        "Консультация",
                        "Комфорт во время",
                        "Финальные рекомендации",
                        "Прощание и отзыв"
                    ])
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
                                    theme: str = "dark-purple") -> str:
        """
        Generate clean HTML optimized for video generation.
        
        This is the main entry point for video generation pipeline.
        
        Args:
            template_id: The avatar template ID
            props: Slide properties from frontend
            theme: Theme name
            
        Returns:
            Clean HTML string ready for PNG conversion
        """
        try:
            # Validate and normalize props
            validated_props = self.validate_avatar_slide_props(template_id, props)
            
            # Generate HTML
            html_content = self.generate_avatar_slide_html(template_id, validated_props, theme)
            
            logger.info(f"Generated clean HTML for video: {template_id}")
            return html_content
            
        except Exception as e:
            logger.error(f"Failed to generate clean HTML for video: {str(e)}")
            raise

# Global instance
html_template_service = HTMLTemplateService()
