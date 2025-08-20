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