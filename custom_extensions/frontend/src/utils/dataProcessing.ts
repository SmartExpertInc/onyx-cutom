/**
 * Frontend utility to match backend's round_hours_in_content processing
 * This ensures data consistency between PDF and preview
 */

export function roundHoursInContent(content: any): any {
  if (typeof content === 'object' && content !== null) {
    if (Array.isArray(content)) {
      return content.map(item => roundHoursInContent(item));
    } else {
      const result: any = {};
      for (const [key, value] of Object.entries(content)) {
        if (key === 'hours' && (typeof value === 'number')) {
          result[key] = Math.round(value);
        } else if (key === 'totalHours' && (typeof value === 'number')) {
          result[key] = Math.round(value);
        } else if (typeof value === 'object' && value !== null) {
          result[key] = roundHoursInContent(value);
        } else {
          result[key] = value;
        }
      }
      return result;
    }
  }
  return content;
}

/**
 * Process content data consistently for preview display
 * This matches the backend processing in get_project_instance_detail
 */
export function processContentForPreview(content: any): any {
  if (!content) {
    return null;
  }
  
  // Apply the same rounding logic as backend
  return roundHoursInContent(content);
}

/**
 * Process Block 1. Course Overview data to match PDF generation logic exactly
 * This ensures the same data structure and calculations as the backend PDF template
 * The backend processes folders hierarchically with their projects, so we need to do the same
 */
export function processBlock1CourseOverview(projects: any[]): any {
  if (!projects || !Array.isArray(projects)) {
    return [];
  }

  // Group projects by folder_id to match backend logic
  const folderProjects: { [folderId: number]: any[] } = {};
  const unassignedProjects: any[] = [];

  // Separate projects by folder (same logic as backend)
  projects.forEach(project => {
    if (project.folderId) {
      if (!folderProjects[project.folderId]) {
        folderProjects[project.folderId] = [];
      }
      folderProjects[project.folderId].push(project);
    } else {
      unassignedProjects.push(project);
    }
  });

  // Create folder entries (simplified - we don't have folder names from backend)
  const folders: any[] = [];
  Object.keys(folderProjects).forEach(folderId => {
    const folderProjectsList = folderProjects[parseInt(folderId)];
    const totalLessons = folderProjectsList.reduce((sum, project) => sum + (project.total_lessons || 0), 0);
    const totalHours = folderProjectsList.reduce((sum, project) => sum + (project.total_hours || 0), 0);
    const totalModules = folderProjectsList.reduce((sum, project) => sum + (project.total_modules || 0), 0);
    const totalCreationHours = folderProjectsList.reduce((sum, project) => sum + (project.total_creation_hours || 0), 0);
    
    folders.push({
      id: parseInt(folderId),
      name: `Folder ${folderId}`, // We don't have folder names from backend
      projects: folderProjectsList,
      total_lessons: totalLessons,
      total_hours: totalHours,
      total_modules: totalModules,
      total_creation_hours: totalCreationHours
    });
  });

  // Process data exactly like the backend PDF template
  const result: any[] = [];
  let totalLessons = 0;
  let totalHours = 0;
  let totalProductionTime = 0;

  // Process folders first (like backend template)
  folders.forEach(folder => {
    // Add folder row
    result.push({
      name: folder.name,
      modules: folder.total_modules,
      lessons: folder.total_lessons,
      learningDuration: folder.total_hours, // Learning Duration uses total_hours (like PDF template)
      productionTime: folder.total_creation_hours, // Production Time uses total_creation_hours (like PDF template)
      isFolder: true
    });
    
    totalLessons += folder.total_lessons;
    totalHours += folder.total_hours;
    totalProductionTime += folder.total_creation_hours;

    // Add individual projects under folder (like backend template)
    folder.projects.forEach((project: any) => {
      result.push({
        name: `  ${project.title || project.project_name || 'Untitled'}`, // Use title from frontend API
        modules: project.total_modules || 1,
        lessons: project.total_lessons || 0,
        learningDuration: project.total_completion_time || 0, // Learning Duration uses total_completion_time (like PDF template)
        productionTime: project.total_hours || 0, // Production Time uses total_hours (like PDF template)
        isProject: true
      });
      
      totalLessons += project.total_lessons || 0;
      totalHours += project.total_hours || 0;
      totalProductionTime += project.total_creation_hours || 0;
    });
  });

  // Process unassigned projects (like backend template)
  unassignedProjects.forEach(project => {
    result.push({
      name: project.title || project.project_name || 'Untitled', // Use title from frontend API
      modules: project.total_modules || 1,
      lessons: project.total_lessons || 0,
      learningDuration: project.total_completion_time || 0, // Learning Duration uses total_completion_time (like PDF template)
      productionTime: project.total_hours || 0, // Production Time uses total_hours (like PDF template)
      isUnassigned: true
    });
    
    totalLessons += project.total_lessons || 0;
    totalHours += project.total_hours || 0;
    totalProductionTime += project.total_creation_hours || 0;
  });

  // Apply rounding like backend
  return result.map(item => ({
    ...item,
    learningDuration: Math.round(item.learningDuration),
    productionTime: Math.round(item.productionTime)
  }));
} 