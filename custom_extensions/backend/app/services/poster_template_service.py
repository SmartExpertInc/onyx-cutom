# app/services/poster_template_service.py
import os
import logging
from typing import Dict, Any

try:
    from jinja2 import Environment, FileSystemLoader
    JINJA2_AVAILABLE = True
except ImportError:
    JINJA2_AVAILABLE = False
    Environment = None
    FileSystemLoader = None

logger = logging.getLogger(__name__)

class PosterTemplateService:
    """Service for generating poster HTML templates using Jinja2."""
    
    def __init__(self):
        """Initialize the poster template service."""
        if not JINJA2_AVAILABLE:
            logger.warning("Jinja2 not available, poster template service will use fallback method")
            self.jinja_env = None
            return
            
        # Set up Jinja2 environment
        template_dir = os.path.join(os.path.dirname(__file__), "..", "templates", "posters")
        os.makedirs(template_dir, exist_ok=True)
        
        try:
            self.jinja_env = Environment(
                loader=FileSystemLoader(template_dir),
                autoescape=True
            )
            logger.info("Poster Template Service initialized with Jinja2")
        except Exception as e:
            logger.error(f"Failed to initialize Jinja2 environment: {e}")
            self.jinja_env = None
    
    def generate_poster_html(self, poster_data: Dict[str, Any]) -> str:
        """
        Generate HTML content for poster using Jinja2 templates.
        Follows the same architecture as slide generation.
        """
        try:
            # Check if Jinja2 is available and initialized
            if not self.jinja_env:
                raise Exception("Jinja2 template environment not available")
                
            # Load the poster template
            template = self.jinja_env.get_template("event_poster_template.html")
            
            # Prepare context data (same pattern as slide generation)
            context_data = {
                "eventName": poster_data.get('eventName', ''),
                "mainSpeaker": poster_data.get('mainSpeaker', ''),
                "speakerDescription": poster_data.get('speakerDescription', ''),
                "date": poster_data.get('date', ''),
                "topic": poster_data.get('topic', ''),
                "additionalSpeakers": poster_data.get('additionalSpeakers', ''),
                "ticketPrice": poster_data.get('ticketPrice', ''),
                "ticketType": poster_data.get('ticketType', ''),
                "freeAccessConditions": poster_data.get('freeAccessConditions', ''),
                "speakerImageSrc": poster_data.get('speakerImageSrc', ''),
                "theme": "event-poster"  # Poster theme
            }
            
            # Parse date (same logic as current implementation)
            date_parts = context_data["date"].split('.')
            context_data["dayMonth"] = '.'.join(date_parts[:2]) if len(date_parts) >= 2 else context_data["date"]
            context_data["year"] = '.'.join(date_parts[2:]) if len(date_parts) > 2 else ''
            
            logger.info(f"🎬 [POSTER_TEMPLATE] Context data prepared:")
            logger.info(f"  - Event: {context_data['eventName']}")
            logger.info(f"  - Speaker: {context_data['mainSpeaker']}")
            logger.info(f"  - Theme: {context_data['theme']}")
            
            # Render the template
            html_content = template.render(**context_data)
            
            logger.info(f"🎬 [POSTER_TEMPLATE] HTML content generated successfully")
            logger.info(f"🎬 [POSTER_TEMPLATE] HTML content length: {len(html_content)} characters")
            
            return html_content
            
        except Exception as e:
            logger.error(f"Failed to generate poster HTML: {str(e)}")
            raise

# Global instance (same pattern as slide system)
poster_template_service = PosterTemplateService()
