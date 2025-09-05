import re

# Read the file
with open("main.py", "r", encoding="utf-8") as f:
    content = f.read()

# Add source materials extraction before the OpenAI prompt preparation
insert_position = content.find("        # Prepare OpenAI prompt")
if insert_position != -1:
    source_materials_code = """        # Extract source materials from the course outline context
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

"""
    
    # Insert the source materials extraction code
    new_content = content[:insert_position] + source_materials_code + content[insert_position:]
    
    # Write the updated content
    with open("main.py", "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print("Successfully added source materials extraction code")
else:
    print("Could not find insertion point")
