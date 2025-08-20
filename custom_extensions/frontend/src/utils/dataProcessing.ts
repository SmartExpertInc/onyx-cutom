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
 * Process Block 1. Course Overview data to match PDF generation logic
 * This ensures the same data structure and calculations as the backend PDF template
 */
export function processBlock1CourseOverview(projects: any[]): any {
  if (!projects || !Array.isArray(projects)) {
    return [];
  }

  // Group projects by type (same logic as PDF)
  const projectGroups: { [key: string]: any } = {};
  
  projects.forEach(project => {
    // Get project type - same logic as PDF
    let projectType = 'Unknown';
    if ('design_microproduct_type' in project) {
      projectType = (project as any).design_microproduct_type || 'Unknown';
    } else {
      projectType = (project as any).designMicroproductType || 'Unknown';
    }
    
    if (!projectGroups[projectType]) {
      projectGroups[projectType] = {
        name: projectType,
        modules: 0,
        lessons: 0,
        learningDuration: 0,
        productionTime: 0
      };
    }
    
    // Add project data - same logic as PDF
    projectGroups[projectType].modules += 1;
    
    // Get lessons and hours - same logic as PDF
    if ('total_lessons' in project && 'total_hours' in project) {
      // Backend data - use real values
      const backendProject = project as any;
      projectGroups[projectType].lessons += backendProject.total_lessons || 0;
      projectGroups[projectType].learningDuration += backendProject.total_hours || 0;
      projectGroups[projectType].productionTime += (backendProject.total_hours || 0) * 300; // 300 hours per learning hour
    } else if ('totalLessons' in project && 'totalHours' in project) {
      // Frontend data - use real values
      const frontendProject = project as any;
      projectGroups[projectType].lessons += frontendProject.totalLessons || 0;
      projectGroups[projectType].learningDuration += frontendProject.totalHours || 0;
      projectGroups[projectType].productionTime += (frontendProject.totalHours || 0) * 300; // 300 hours per learning hour
    } else {
      // Fallback - use random values like in original frontend logic
      projectGroups[projectType].lessons += Math.floor(Math.random() * 5) + 3; // 3-7 lessons
      projectGroups[projectType].learningDuration += Math.floor(Math.random() * 5) + 3; // 3-7 hours
      projectGroups[projectType].productionTime += (Math.floor(Math.random() * 5) + 3) * 300; // 300 hours per learning hour
    }
  });

  // Convert to array and apply rounding
  return Object.values(projectGroups).map(group => ({
    ...group,
    learningDuration: Math.round(group.learningDuration),
    productionTime: Math.round(group.productionTime)
  }));
} 