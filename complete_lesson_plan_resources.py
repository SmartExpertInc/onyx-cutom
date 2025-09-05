import re
import json

def update_backend():
    """Update the backend with file name fetching and improved prompts"""
    
    with open('main.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add function to fetch file names from Onyx API
    file_name_function = '''
async def fetch_file_names_from_onyx(file_ids: List[int], cookies: Dict[str, str]) -> Dict[int, str]:
    """
    Fetch actual file names from Onyx API using file IDs.
    Returns a mapping of file_id -> file_name
    """
    file_names = {}
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Get the file system to find files by ID
            response = await client.get(
                f"{ONYX_API_SERVER_URL}/user/file-system",
                cookies=cookies
            )
            response.raise_for_status()
            folders_data = response.json()
            
            # Extract file names from the folder structure
            for folder in folders_data:
                if 'files' in folder:
                    for file_info in folder['files']:
                        if file_info.get('id') in file_ids:
                            file_names[file_info['id']] = file_info.get('name', f'File {file_info["id"]}')
            
            # For any files not found in folders, they might be in root
            # Try to get individual file info if needed
            for file_id in file_ids:
                if file_id not in file_names:
                    file_names[file_id] = f'Document {file_id}'  # Fallback
                    
    except Exception as e:
        logger.error(f"Error fetching file names: {e}")
        # Fallback to generic names
        for file_id in file_ids:
            file_names[file_id] = f'Document {file_id}'
    
    return file_names

async def fetch_folder_names_from_onyx(folder_ids: List[int], cookies: Dict[str, str]) -> Dict[int, str]:
    """
    Fetch actual folder names from Onyx API using folder IDs.
    Returns a mapping of folder_id -> folder_name
    """
    folder_names = {}
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Get the file system to find folders by ID
            response = await client.get(
                f"{ONYX_API_SERVER_URL}/user/file-system",
                cookies=cookies
            )
            response.raise_for_status()
            folders_data = response.json()
            
            # Extract folder names
            for folder in folders_data:
                if folder.get('id') in folder_ids:
                    folder_names[folder['id']] = folder.get('name', f'Folder {folder["id"]}')
                    
    except Exception as e:
        logger.error(f"Error fetching folder names: {e}")
        # Fallback to generic names
        for folder_id in folder_ids:
            folder_names[folder_id] = f'Folder {folder_id}'
    
    return folder_names

'''
    
    # Insert the file name fetching functions before the source materials extraction
    insert_pos = content.find('        # Extract source materials from the course outline context')
    if insert_pos != -1:
        content = content[:insert_pos] + file_name_function + content[insert_pos:]
    
    # Update the source materials extraction to use actual file names
    old_extraction = '''        # Extract source materials from the course outline context
        source_materials = []
        
        if source_context_type == "files" and source_context_data:
            file_ids = source_context_data.get("file_ids", [])
            folder_ids = source_context_data.get("folder_ids", [])
            
            # Add files if present
            if file_ids:
                source_materials.extend([f"Document ID: {file_id}" for file_id in file_ids])
            
            # Add folders if present  
            if folder_ids:
                source_materials.extend([f"Folder ID: {folder_id}" for folder_id in folder_ids])'''
    
    new_extraction = '''        # Extract source materials from the course outline context
        source_materials = []
        
        if source_context_type == "files" and source_context_data:
            file_ids = source_context_data.get("file_ids", [])
            folder_ids = source_context_data.get("folder_ids", [])
            
            # Get cookies from request for Onyx API calls
            cookies = dict(request.cookies)
            
            # Fetch actual file names
            if file_ids:
                file_names = await fetch_file_names_from_onyx(file_ids, cookies)
                source_materials.extend([file_names[file_id] for file_id in file_ids])
            
            # Fetch actual folder names
            if folder_ids:
                folder_names = await fetch_folder_names_from_onyx(folder_ids, cookies)
                source_materials.extend([f"{folder_names[folder_id]} (Folder)" for folder_id in folder_ids])'''
    
    content = content.replace(old_extraction, new_extraction)
    
    # Update the AI prompt to use actual source materials and structured prompts
    old_materials_prompt = '''MATERIALS: List specific, actionable resources and tools needed for content creation, including:
- Primary source materials and references
- Technical tools and software requirements
- Assessment instruments and rubrics
- Visual aids and multimedia specifications'''
    
    new_materials_prompt = '''MATERIALS: List the actual source materials used to create this lesson plan, followed by general content creation resources:

Source Materials Used:
{", ".join(source_materials)}

Additional Resources Needed:
- Content creation tools and software
- Assessment and evaluation instruments  
- Visual design and multimedia resources'''
    
    content = content.replace(old_materials_prompt, new_materials_prompt)
    
    # Update the prompts section to generate exactly one prompt per product with titles
    old_prompts_section = '''AI TOOL PROMPTS: Create ready-to-use prompts for AI content creation tools (like Synthesia, Gamma, etc.) ONLY for the recommended product types:

- If "video-lesson" is in recommendedProducts: Create 1 detailed video creation prompt for AI tools like Synthesia, using this enhanced format: "Create a professional training video for [specific target audience]. This is [lesson context/position in course], titled {payload.lessonTitle}. The video should [detailed content requirements including key learning objectives, specific topics to cover, and practical applications]. Emphasize [key themes and important concepts]. Provide a clear overview of [specific content areas]. The tone should be [specific tone description], and the duration should be around [X] minutes."

- If "presentation" is in recommendedProducts: Create 1 detailed presentation creation prompt for AI tools like Gamma, using this enhanced format: "Create a comprehensive presentation for [specific target audience] on {payload.lessonTitle}. This presentation should cover [detailed content requirements], include [specific visual elements and slide types], and explain [key concepts and applications]. Structure the presentation with [specific organization], use [design elements], and consist of approximately [X] slides with clear learning progression from [beginning concept] to [end goal]."

- For "quiz" products: Create assessment prompts for AI quiz generators
- For "one-pager" products: Create document generation prompts for AI writing tools
- Maximum 2-3 prompts total, with detailed, AI-tool-ready specifications'''
    
    new_prompts_section = '''AI TOOL PROMPTS: Create exactly one specific prompt for each recommended product type. Format each prompt with a clear title indicating the product type:

Format each prompt as:
**[PRODUCT TYPE] Creation Prompt:**
[Detailed prompt content here]

Requirements:
- Create exactly {len(payload.recommendedProducts)} prompts (one for each recommended product)
- Each prompt should be specifically formatted for AI content creation tools
- Include specific duration/length requirements based on completion times from the timing guidelines above
- Make prompts actionable and detailed for immediate use
- Use the exact product names from the recommendedProducts list as titles

Example format:
**Video Lesson Creation Prompt:**
Create a professional training video for [target audience]. This lesson, titled {payload.lessonTitle}, should [detailed requirements]. Duration: [X] minutes.

**Quiz Creation Prompt:**
Create an interactive quiz for [target audience] on {payload.lessonTitle}. Include [X] questions covering [key topics]. Format: [question types].'''
    
    content = content.replace(old_prompts_section, new_prompts_section)
    
    # Write the updated content
    with open('main.py', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Backend updated successfully!")
    print("- Added file name fetching functions")
    print("- Updated source materials to use actual file names")
    print("- Updated AI prompt for structured prompts with titles")

def update_frontend():
    """Update the frontend LessonPlanView component"""
    
    component_path = '../frontend/src/components/LessonPlanView.tsx'
    
    with open(component_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update the handleSeePrompt function to scroll to prompts section
    old_handle = '''  const handleSeePrompt = (productName: string, description: string) => {
    // Find the corresponding prompt for this product
    const prompt = lessonPlanData.suggestedPrompts.find(p => 
      p.toLowerCase().includes(productName.toLowerCase()) || 
      p.toLowerCase().includes(productName.replace('-', ' ').toLowerCase())
    );
    
    if (prompt) {
      // Create a modal or copy to clipboard functionality
      navigator.clipboard.writeText(prompt).then(() => {
        alert('Prompt copied to clipboard!');
      }).catch(() => {
        // Fallback: show prompt in alert
        alert(prompt);
      });
    } else {
      // Fallback: show the product description
      alert(description);
    }
  };'''
    
    new_handle = '''  const handleSeePrompt = (productName: string) => {
    // Scroll to the prompts section
    const promptsSection = document.getElementById('prompts-section');
    if (promptsSection) {
      promptsSection.scrollIntoView({ behavior: 'smooth' });
      
      // Highlight the specific prompt for this product
      const productPrompt = document.getElementById(`prompt-${productName}`);
      if (productPrompt) {
        productPrompt.style.backgroundColor = '#fef3c7';
        setTimeout(() => {
          productPrompt.style.backgroundColor = '';
        }, 2000);
      }
    }
  };'''
    
    content = content.replace(old_handle, new_handle)
    
    # Update the button call to only pass product name
    content = content.replace(
        'onClick={() => handleSeePrompt(block.product_name, block.product_description)}',
        'onClick={() => handleSeePrompt(block.product_name)}'
    )
    
    # Update the Resources section to show actual source materials
    old_resources = '''        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Resources
          </h3>
          <p className="text-sm text-gray-600 italic mb-4">Essential resources and tools for content development</p>
          <div className="space-y-2">
            {lessonPlanData.materials.map((material, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 leading-relaxed">{material}</span>
              </div>
            ))}
          </div>
        </div>'''
    
    new_resources = '''        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Resources
          </h3>
          <p className="text-sm text-gray-600 italic mb-4">Source materials and development resources</p>
          
          {/* Source Materials Section */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Source Materials Used:</h4>
            <div className="bg-blue-50 rounded-lg p-3 space-y-2">
              {lessonPlanData.materials.slice(0, lessonPlanData.materials.findIndex(m => m.includes('Additional Resources')) || lessonPlanData.materials.length).map((material, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-800 font-medium leading-relaxed">{material}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Additional Resources Section */}
          {lessonPlanData.materials.some(m => m.includes('Additional Resources')) && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Additional Resources Needed:</h4>
              <div className="space-y-2">
                {lessonPlanData.materials.slice(lessonPlanData.materials.findIndex(m => m.includes('Additional Resources')) + 1).map((material, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 leading-relaxed">{material}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>'''
    
    content = content.replace(old_resources, new_resources)
    
    # Update the Prompts section to parse structured prompts with titles
    old_prompts = '''        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            Content Creation Prompts
          </h3>
          <p className="text-sm text-gray-600 italic mb-4">AI-ready prompts for creating educational content</p>
          <div className="space-y-4">
            {lessonPlanData.suggestedPrompts.map((prompt, index) => (
              <div key={index} className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
                <div className="flex items-start gap-2">
                  <span className="bg-yellow-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-gray-800 leading-relaxed">{prompt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>'''
    
    new_prompts = '''        <div id="prompts-section" className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            Content Creation Prompts
          </h3>
          <p className="text-sm text-gray-600 italic mb-4">AI-ready prompts for creating educational content</p>
          <div className="space-y-4">
            {lessonPlanData.suggestedPrompts.map((prompt, index) => {
              // Parse structured prompts with titles
              const lines = prompt.split('\\n');
              const titleMatch = lines[0].match(/\\*\\*(.+?)\\*\\*/);
              const title = titleMatch ? titleMatch[1] : `Prompt ${index + 1}`;
              const content = titleMatch ? lines.slice(1).join('\\n').trim() : prompt;
              
              // Extract product name from title for ID
              const productName = title.toLowerCase().includes('video') ? 'video-lesson' :
                                title.toLowerCase().includes('presentation') ? 'presentation' :
                                title.toLowerCase().includes('quiz') ? 'quiz' :
                                title.toLowerCase().includes('one-pager') ? 'one-pager' :
                                `product-${index}`;
              
              return (
                <div key={index} id={`prompt-${productName}`} className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400 transition-colors duration-300">
                  <div className="mb-2">
                    <h4 className="font-semibold text-yellow-800 text-sm uppercase tracking-wide">{title}</h4>
                  </div>
                  <div className="text-gray-800 leading-relaxed">
                    {content}
                  </div>
                </div>
              );
            })}
          </div>
        </div>'''
    
    content = content.replace(old_prompts, new_prompts)
    
    # Write the updated content
    with open(component_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Frontend updated successfully!")
    print("- Updated handleSeePrompt to scroll to prompts section")
    print("- Enhanced Resources section to show source materials vs additional resources")
    print("- Updated Prompts section to parse structured prompts with titles")
    print("- Added highlighting when clicking 'See Prompt'")

if __name__ == "__main__":
    print("🚀 Completing Lesson Plan Resources and Prompts Implementation...")
    print()
    
    try:
        update_backend()
        print()
        update_frontend()
        print()
        print("🎉 Implementation completed successfully!")
        print()
        print("📋 Summary of changes:")
        print("✅ Backend: Added file name fetching from Onyx API")
        print("✅ Backend: Updated source materials to use actual document names")
        print("✅ Backend: Updated AI prompt for structured prompts with product titles")
        print("✅ Frontend: Updated Resources section to show source materials clearly")
        print("✅ Frontend: Updated Prompts section with product-specific titles")
        print("✅ Frontend: Added scroll-to-prompt functionality for 'See Prompt' button")
        
    except Exception as e:
        print(f"❌ Error during implementation: {e}")
        import traceback
        traceback.print_exc() 