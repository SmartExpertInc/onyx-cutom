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
        import time
        start_time = time.time()
        
        # Extract session ID if available
        session_id = poster_data.get('sessionId', f'template-{int(time.time())}')
        
        logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] ========== TEMPLATE SERVICE STARTED ==========")
        logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] Input data analysis:")
        logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}]   - Total fields: {len(poster_data)}")
        logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}]   - Data keys: {list(poster_data.keys())}")
        
        # Log detailed input analysis
        for key, value in poster_data.items():
            if key == 'speakerImageSrc' and value and len(str(value)) > 100:
                logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}]   - {key}: [base64 image data, {len(str(value))} chars]")
            else:
                logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}]   - {key}: \"{str(value)[:50]}{'...' if len(str(value)) > 50 else ''}\" (type: {type(value).__name__})")
        
        try:
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] === ENVIRONMENT CHECK ===")
            
            # Check if Jinja2 is available and initialized
            if not self.jinja_env:
                logger.error(f"🎬 [POSTER_TEMPLATE] [{session_id}] ❌ Jinja2 template environment not available")
                logger.error(f"🎬 [POSTER_TEMPLATE] [{session_id}] Environment state: {self.jinja_env}")
                logger.error(f"🎬 [POSTER_TEMPLATE] [{session_id}] JINJA2_AVAILABLE: {globals().get('JINJA2_AVAILABLE', 'undefined')}")
                raise Exception("Jinja2 template environment not available")
            
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] ✅ Jinja2 environment is available")
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] Environment type: {type(self.jinja_env)}")
            
            # Load the poster template
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] === TEMPLATE LOADING ===")
            template_load_start = time.time()
            
            try:
                template = self.jinja_env.get_template("event_poster_template.html")
                template_load_end = time.time()
                template_load_duration = (template_load_end - template_load_start) * 1000
                
                logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] ✅ Template loaded successfully in {template_load_duration:.2f}ms")
                logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] Template name: event_poster_template.html")
                logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] Template object: {type(template)}")
                
            except Exception as template_load_error:
                template_load_end = time.time()
                template_load_duration = (template_load_end - template_load_start) * 1000
                
                logger.error(f"🎬 [POSTER_TEMPLATE] [{session_id}] ❌ Failed to load template after {template_load_duration:.2f}ms")
                logger.error(f"🎬 [POSTER_TEMPLATE] [{session_id}] Template load error: {template_load_error}")
                logger.error(f"🎬 [POSTER_TEMPLATE] [{session_id}] Template load error type: {type(template_load_error).__name__}")
                
                # Try to list available templates
                try:
                    available_templates = self.jinja_env.list_templates()
                    logger.error(f"🎬 [POSTER_TEMPLATE] [{session_id}] Available templates: {available_templates}")
                except Exception as list_error:
                    logger.error(f"🎬 [POSTER_TEMPLATE] [{session_id}] Could not list templates: {list_error}")
                
                raise template_load_error
            
            # Prepare context data (same pattern as slide generation)
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] === CONTEXT PREPARATION ===")
            context_prep_start = time.time()
            
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
            
            context_prep_end = time.time()
            context_prep_duration = (context_prep_end - context_prep_start) * 1000
            
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] Context data prepared in {context_prep_duration:.2f}ms")
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] Context fields: {len(context_data)}")
            
            # Log context data details
            for key, value in context_data.items():
                if key == 'speakerImageSrc' and value and len(str(value)) > 100:
                    logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}]   - {key}: [base64 data, {len(str(value))} chars]")
                else:
                    logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}]   - {key}: \"{str(value)[:50]}{'...' if len(str(value)) > 50 else ''}\"")
            
            # Parse date (same logic as current implementation)
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] === DATE PARSING ===")
            date_parse_start = time.time()
            
            original_date = context_data["date"]
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] Original date: \"{original_date}\"")
            
            date_parts = context_data["date"].split('.')
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] Date parts: {date_parts}")
            
            context_data["dayMonth"] = '.'.join(date_parts[:2]) if len(date_parts) >= 2 else context_data["date"]
            context_data["year"] = '.'.join(date_parts[2:]) if len(date_parts) > 2 else ''
            
            date_parse_end = time.time()
            date_parse_duration = (date_parse_end - date_parse_start) * 1000
            
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] Date parsing completed in {date_parse_duration:.2f}ms")
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] Parsed date components:")
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}]   - dayMonth: \"{context_data['dayMonth']}\"")
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}]   - year: \"{context_data['year']}\"")
            
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] === FINAL CONTEXT SUMMARY ===")
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] Event: {context_data['eventName'][:50]}")
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] Speaker: {context_data['mainSpeaker'][:50]}")
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] Theme: {context_data['theme']}")
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] Total context keys: {len(context_data)}")
            
            # Render the template
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] === TEMPLATE RENDERING ===")
            render_start = time.time()
            
            try:
                logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] Starting template render with {len(context_data)} context variables...")
                html_content = template.render(**context_data)
                
                render_end = time.time()
                render_duration = (render_end - render_start) * 1000
                
                logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] ✅ Template rendered successfully in {render_duration:.2f}ms")
                logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] HTML content length: {len(html_content)} characters")
                logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] HTML preview (first 200 chars): {html_content[:200]}...")
                logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] HTML preview (last 100 chars): ...{html_content[-100:]}")
                
                # Check for key elements in rendered HTML
                key_elements = ['event-poster', 'Montserrat', 'theme-event-poster', context_data['eventName'][:20]]
                found_elements = []
                missing_elements = []
                
                for element in key_elements:
                    if element in html_content:
                        found_elements.append(element)
                    else:
                        missing_elements.append(element)
                
                logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] Content validation:")
                logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}]   - Found elements: {found_elements}")
                if missing_elements:
                    logger.warning(f"🎬 [POSTER_TEMPLATE] [{session_id}]   - Missing elements: {missing_elements}")
                
            except Exception as render_error:
                render_end = time.time()
                render_duration = (render_end - render_start) * 1000
                
                logger.error(f"🎬 [POSTER_TEMPLATE] [{session_id}] ❌ Template rendering failed after {render_duration:.2f}ms")
                logger.error(f"🎬 [POSTER_TEMPLATE] [{session_id}] Render error: {render_error}")
                logger.error(f"🎬 [POSTER_TEMPLATE] [{session_id}] Render error type: {type(render_error).__name__}")
                raise render_error
            
            end_time = time.time()
            total_duration = (end_time - start_time) * 1000
            
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] === TEMPLATE SERVICE COMPLETED ===")
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] Total duration: {total_duration:.2f}ms")
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] Final HTML length: {len(html_content)} characters")
            logger.info(f"🎬 [POSTER_TEMPLATE] [{session_id}] Success: Returning generated HTML")
            
            return html_content
            
        except Exception as e:
            end_time = time.time()
            total_duration = (end_time - start_time) * 1000
            
            logger.error(f"🎬 [POSTER_TEMPLATE] [{session_id}] === TEMPLATE SERVICE FAILED ===")
            logger.error(f"🎬 [POSTER_TEMPLATE] [{session_id}] Error time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
            logger.error(f"🎬 [POSTER_TEMPLATE] [{session_id}] Duration before error: {total_duration:.2f}ms")
            logger.error(f"🎬 [POSTER_TEMPLATE] [{session_id}] Error type: {type(e).__name__}")
            logger.error(f"🎬 [POSTER_TEMPLATE] [{session_id}] Error message: {str(e)}")
            logger.error(f"🎬 [POSTER_TEMPLATE] [{session_id}] Template service will raise exception")
            raise

# Global instance (same pattern as slide system)
poster_template_service = PosterTemplateService()
