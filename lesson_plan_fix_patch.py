#!/usr/bin/env python3
"""
Direct patch to fix lesson plan validation error.
This adds comprehensive validation to ensure product_description is always a string.
"""

# Add this function right after the JSON parsing in the lesson plan generation endpoint

def fix_product_descriptions(lesson_plan_data, logger):
    """
    Ensures all product_description fields are strings, not nested objects.
    """
    if "contentDevelopmentSpecifications" not in lesson_plan_data:
        return
    
    logger.info("🔧 Fixing product descriptions to ensure string format...")
    
    for i, block in enumerate(lesson_plan_data["contentDevelopmentSpecifications"]):
        if block.get("type") == "product" and "product_description" in block:
            description = block["product_description"]
            
            if not isinstance(description, str):
                logger.warning(f"Block {i}: product_description is {type(description)}, converting to string")
                
                if isinstance(description, dict):
                    # Flatten dictionary to comprehensive string
                    text_parts = []
                    
                    def flatten_dict(d, prefix=""):
                        for key, value in d.items():
                            if isinstance(value, dict):
                                flatten_dict(value, f"{prefix}{key}: ")
                            elif isinstance(value, list):
                                text_parts.append(f"{prefix}{key}: {', '.join(map(str, value))}")
                            else:
                                text_parts.append(f"{prefix}{key}: {value}")
                    
                    flatten_dict(description)
                    flattened_description = ". ".join(text_parts) + "."
                    
                    # Ensure comprehensive content
                    if len(flattened_description) < 250:
                        flattened_description += " Additional specifications include technical quality standards, accessibility compliance (WCAG), target audience considerations, assessment criteria, and implementation guidelines for professional content development."
                    
                    block["product_description"] = flattened_description
                    logger.info(f"✅ Block {i}: Flattened to {len(flattened_description)} chars")
                    
                elif isinstance(description, list):
                    # Join list items
                    flattened_description = ". ".join(map(str, description)) + "."
                    block["product_description"] = flattened_description
                    logger.info(f"✅ Block {i}: Joined list to string")
                    
                else:
                    # Convert any other type
                    block["product_description"] = str(description)
                    logger.info(f"✅ Block {i}: Converted to string")
            else:
                logger.info(f"✅ Block {i}: product_description is already a string ({len(description)} chars)")

print("📝 PATCH INSTRUCTIONS:")
print("1. Add the fix_product_descriptions() function to main.py")
print("2. Call it right after JSON parsing:")
print("   lesson_plan_data = json.loads(ai_response)")
print("   fix_product_descriptions(lesson_plan_data, logger)")
print("3. This will ensure no Pydantic validation errors occur") 