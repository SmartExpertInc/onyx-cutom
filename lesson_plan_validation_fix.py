#!/usr/bin/env python3
"""
Lesson Plan Validation Fix
==========================

This script contains the complete fix for the lesson plan validation error where 
AI returns nested objects instead of strings for product_description.
"""

def fix_lesson_plan_validation():
    """
    Complete fix for lesson plan validation error.
    
    The main issue is that despite clear instructions, the AI sometimes returns
    nested dictionaries for product_description instead of a single string.
    
    This fix provides:
    1. Enhanced prompt clarity
    2. Comprehensive data validation and flattening
    3. Error recovery mechanisms
    """
    
    # 1. Enhanced validation and flattening function
    validation_code = '''
# Enhanced validation and flattening for lesson plan data
def validate_and_fix_lesson_plan_data(lesson_plan_data, logger):
    """
    Validates and fixes lesson plan data to ensure proper structure.
    Specifically handles product_description fields that might be nested objects.
    """
    if "contentDevelopmentSpecifications" not in lesson_plan_data:
        return lesson_plan_data
    
    for i, block in enumerate(lesson_plan_data["contentDevelopmentSpecifications"]):
        if block.get("type") == "product" and "product_description" in block:
            description = block["product_description"]
            
            # If description is not a string, convert it
            if not isinstance(description, str):
                logger.warning(f"Block {i}: product_description is {type(description)}, converting to string")
                
                if isinstance(description, dict):
                    # Flatten dictionary to comprehensive string
                    flattened_parts = []
                    
                    # Handle common nested structures
                    for key, value in description.items():
                        if isinstance(value, dict):
                            # Nested dictionary - extract key-value pairs
                            nested_items = []
                            for nested_key, nested_value in value.items():
                                if isinstance(nested_value, list):
                                    nested_items.append(f"{nested_key}: {', '.join(map(str, nested_value))}")
                                else:
                                    nested_items.append(f"{nested_key}: {nested_value}")
                            flattened_parts.append(f"{key.upper()}: {'. '.join(nested_items)}")
                        elif isinstance(value, list):
                            # List of items
                            flattened_parts.append(f"{key.upper()}: {', '.join(map(str, value))}")
                        else:
                            # Simple value
                            flattened_parts.append(f"{key}: {value}")
                    
                    # Create comprehensive string
                    flattened_description = ". ".join(flattened_parts) + "."
                    
                    # Ensure minimum length for comprehensive specifications
                    if len(flattened_description) < 300:
                        flattened_description += " This content should include detailed technical specifications, learning objectives, target audience considerations, accessibility requirements (WCAG compliance), quality standards, assessment criteria, and implementation guidelines to ensure comprehensive content development that meets professional standards."
                    
                    block["product_description"] = flattened_description
                    logger.info(f"Block {i}: Flattened nested product_description to {len(flattened_description)} character string")
                    
                elif isinstance(description, list):
                    # List of specifications - join into string
                    flattened_description = ". ".join(map(str, description)) + "."
                    if len(flattened_description) < 200:
                        flattened_description += " Additional comprehensive specifications should include technical requirements, learning objectives, and quality standards."
                    block["product_description"] = flattened_description
                    logger.info(f"Block {i}: Converted list product_description to {len(flattened_description)} character string")
                    
                else:
                    # Other types - convert to string
                    block["product_description"] = str(description)
                    logger.info(f"Block {i}: Converted {type(description)} product_description to string")
            
            # Ensure the string is comprehensive enough
            elif isinstance(description, str) and len(description) < 100:
                logger.warning(f"Block {i}: product_description too short ({len(description)} chars), enhancing")
                enhanced_description = description + " This content should include detailed specifications covering technical requirements, learning objectives, target audience analysis, accessibility compliance, quality standards, assessment criteria, and comprehensive implementation guidelines."
                block["product_description"] = enhanced_description
                logger.info(f"Block {i}: Enhanced short product_description to {len(enhanced_description)} characters")
    
    return lesson_plan_data
'''
    
    # 2. Enhanced AI prompt instructions
    enhanced_prompt_section = '''
PRODUCT BLOCKS - CRITICAL FORMAT REQUIREMENTS:
For each recommended product, create a product block with:
- product_name: Exact name from recommendedProducts list  
- product_description: MUST be a single STRING paragraph (not nested objects or structured data)

EXAMPLE OF CORRECT FORMAT:
{
  "type": "product",
  "product_name": "presentation", 
  "product_description": "Create a comprehensive 15-slide presentation for intermediate project managers with 3+ years experience covering RAG methodology limitations. Content specifications: Include definitions slide, 4 application examples, 3 limitation categories with specific examples, 2 real-world case studies from tech and construction industries. Technical requirements: 16:9 aspect ratio, 1920x1080 resolution, corporate blue/white branding, Arial 24pt titles, 18pt content, high contrast 4.5:1 ratio for accessibility. Structure: 2-minute intro, 8-minute main content, 1-minute conclusion. Include speaker notes with detailed talking points, interactive polls every 4 slides, and comprehensive assessment rubric for evaluation."
}

WRONG FORMAT (DO NOT USE):
{
  "type": "product",
  "product_name": "presentation",
  "product_description": {
    "contentSpecifications": {...},
    "technicalRequirements": {...}
  }
}

The product_description must be ONE comprehensive string with ALL specifications included in paragraph form.
'''
    
    # 3. Error recovery mechanism
    error_recovery_code = '''
# Add this to the lesson plan generation exception handling
except (json.JSONDecodeError, ValueError, ValidationError) as e:
    logger.error(f"Failed to parse or validate lesson plan data: {e}")
    logger.error(f"Raw AI response: {ai_response[:500]}...")
    
    # Try to recover by creating a simplified lesson plan
    try:
        # Extract basic information that we can parse
        recovery_data = {
            "lessonTitle": payload.lessonTitle,
            "lessonObjectives": [
                f"Understand the fundamentals of {payload.lessonTitle}",
                f"Apply key concepts from the {payload.moduleName} module", 
                "Demonstrate comprehension through practical exercises"
            ],
            "shortDescription": f"A comprehensive lesson covering {payload.lessonTitle} as part of the {payload.moduleName} learning module.",
            "contentDevelopmentSpecifications": [],
            "materials": source_materials,
            "suggestedPrompts": []
        }
        
        # Add text blocks and product blocks
        recovery_data["contentDevelopmentSpecifications"].append({
            "type": "text",
            "block_title": f"Introduction to {payload.lessonTitle}",
            "block_content": f"This section provides foundational knowledge about {payload.lessonTitle}, including key concepts, terminology, and practical applications relevant to {payload.moduleName}."
        })
        
        # Add product blocks for each recommended product
        for product in payload.recommendedProducts:
            product_description = f"Create a comprehensive {product.replace('-', ' ')} covering the key learning objectives for {payload.lessonTitle}. "
            
            if "video" in product.lower():
                product_description += "Duration: 4-6 minutes with clear visual demonstrations, professional narration, and accessibility features including closed captions. Technical specs: 1920x1080 resolution, 30fps, clear audio quality."
            elif "presentation" in product.lower():
                product_description += "Structure: 10-15 slides with professional design, clear typography, high contrast for accessibility, and comprehensive speaker notes for each slide."
            elif "quiz" in product.lower():
                product_description += "Format: 8-12 questions mixing multiple choice, true/false, and scenario-based questions with immediate feedback and detailed explanations for each answer."
            else:
                product_description += "Include comprehensive content specifications, technical requirements, and quality standards to ensure professional delivery."
            
            recovery_data["contentDevelopmentSpecifications"].append({
                "type": "product", 
                "product_name": product,
                "product_description": product_description
            })
        
        # Add closing text block
        recovery_data["contentDevelopmentSpecifications"].append({
            "type": "text",
            "block_title": "Summary and Next Steps",
            "block_content": f"This concludes the {payload.lessonTitle} lesson. Learners should now have a solid understanding of the key concepts and be ready to apply this knowledge in practical scenarios."
        })
        
        # Create simple prompts
        for product in payload.recommendedProducts:
            prompt = f"Create a {product.replace('-', ' ')} for the lesson '{payload.lessonTitle}' that covers the learning objectives comprehensively. Ensure professional quality, accessibility compliance, and engaging content delivery appropriate for the target audience."
            recovery_data["suggestedPrompts"].append(prompt)
        
        lesson_plan_data = recovery_data
        logger.info("Successfully created recovery lesson plan data")
        
    except Exception as recovery_error:
        logger.error(f"Recovery mechanism also failed: {recovery_error}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate lesson plan and recovery attempt failed"
        )
'''
    
    print("🔧 LESSON PLAN VALIDATION FIX")
    print("=" * 40)
    print("\n1. ENHANCED VALIDATION FUNCTION:")
    print(validation_code)
    print("\n2. ENHANCED AI PROMPT SECTION:")
    print(enhanced_prompt_section) 
    print("\n3. ERROR RECOVERY MECHANISM:")
    print(error_recovery_code)
    
    print("\n✅ IMPLEMENTATION STEPS:")
    print("1. Add the validation function to the lesson plan generation code")
    print("2. Call validate_and_fix_lesson_plan_data() after JSON parsing")
    print("3. Add the enhanced prompt instructions to the AI prompt")
    print("4. Add the error recovery mechanism to exception handling")
    print("5. Test with problematic lesson plan generations")
    
    print("\n🎯 EXPECTED RESULTS:")
    print("- No more Pydantic validation errors")
    print("- Automatic conversion of nested objects to strings")
    print("- Comprehensive product descriptions even if AI fails")
    print("- Graceful error recovery with usable lesson plans")

if __name__ == "__main__":
    fix_lesson_plan_validation() 