# Create a backup
cp main.py main.py.backup_lesson_plan_resources

# Create a Python script to make the changes
cat > update_lesson_plan.py << 'EOF'
import re

def update_lesson_plan_generation():
    with open('main.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the location to add source materials extraction (before the OpenAI prompt)
    # Look for the line that starts the OpenAI prompt construction
    pattern = r'(\s+# Prepare OpenAI prompt\s+openai_prompt = f""")'
    
    # Add source materials extraction logic before the OpenAI prompt
    source_materials_code = '''        
        # Extract source materials from the course outline context
        source_materials = []
        
        if source_context_type == "files" and source_context_data:
            file_ids = source_context_data.get("file_ids", [])
            folder_ids = source_context_data.get("folder_ids", [])
            
            # Add files if present
            if file_ids:
                source_materials.extend([f"Document ID: {file_id}" for file_id in file_ids])
            
            # Add folders if present  
            if folder_ids:
                source_materials.extend([f"Folder ID: {folder_id}" for folder_id in folder_ids])
                
        elif source_context_type == "connectors" and source_context_data:
            connector_sources = source_context_data.get("connector_sources", [])
            if connector_sources:
                source_materials.extend([f"Connector: {source}" for source in connector_sources])
                
        elif source_context_type == "text" and source_context_data:
            source_materials.append("Custom Text Input")
            
        elif source_context_type == "knowledge_base" and source_context_data:
            search_query = source_context_data.get("search_query", "")
            if search_query:
                source_materials.append(f"Knowledge Base Query: {search_query}")
        
        # If no source materials found, use general knowledge
        if not source_materials:
            source_materials = ["General Knowledge"]

        # Prepare OpenAI prompt'''
    
    # Replace the original line with the new code
    updated_content = re.sub(pattern, source_materials_code, content)
    
    # Update the materials section in the prompt to use actual source materials
    materials_pattern = r'(MATERIALS: List specific, actionable resources and tools needed for content creation, including:\s*- Primary source materials and references\s*- Technical tools and software requirements\s*- Assessment instruments and rubrics\s*- Visual aids and multimedia specifications)'
    
    new_materials_section = '''MATERIALS: List the actual source materials used to create this lesson plan, followed by general content creation resources:

Source Materials Used:
{", ".join(source_materials)}

Additional Resources Needed:
- Content creation tools and software
- Assessment and evaluation instruments  
- Visual design and multimedia resources'''
    
    updated_content = re.sub(materials_pattern, new_materials_section, updated_content, flags=re.MULTILINE | re.DOTALL)
    
    # Update the prompts section to create exactly one prompt per recommended product
    prompts_pattern = r'(AI TOOL PROMPTS: Create ready-to-use prompts for AI content creation tools \(like Synthesia, Gamma, etc\.\) ONLY for the recommended product types:.*?- Maximum 2-3 prompts total, with detailed, AI-tool-ready specifications)'
    
    new_prompts_section = '''AI TOOL PROMPTS: Create exactly one specific prompt for each recommended product type. Each prompt should be formatted with a clear title indicating the product type:

Format each prompt as:
**[PRODUCT TYPE] Creation Prompt:**
[Detailed prompt content here]

Requirements:
- Create exactly {len(payload.recommendedProducts)} prompts (one for each recommended product)
- Each prompt should be specifically formatted for AI content creation tools
- Include specific duration/length requirements based on completion times
- Make prompts actionable and detailed for immediate use'''
    
    updated_content = re.sub(prompts_pattern, new_prompts_section, updated_content, flags=re.MULTILINE | re.DOTALL)
    
    with open('main.py', 'w', encoding='utf-8') as f:
        f.write(updated_content)
    
    print("Updated lesson plan generation with source materials extraction")

if __name__ == "__main__":
    update_lesson_plan_generation()
EOF

python update_lesson_plan.py
