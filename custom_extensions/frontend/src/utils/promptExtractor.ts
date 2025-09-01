/**
 * Utility function to extract prompts from URL parameters with sessionStorage fallback
 * for long prompts to avoid URL length issues.
 * 
 * @param urlPrompt - The prompt from URL parameters
 * @returns The actual prompt (either from URL or sessionStorage)
 */
export const extractPrompt = (urlPrompt: string | null): string => {
  if (!urlPrompt) return "";
  
  // Check if this is a prompt reference (long prompt stored in sessionStorage)
  if (urlPrompt.startsWith('[PROMPT_REF:') && urlPrompt.endsWith(']')) {
    const promptKey = urlPrompt.slice(12, -1); // Extract key from [PROMPT_REF:key]
    const storedPrompt = sessionStorage.getItem(promptKey);
    if (storedPrompt) {
      // Clean up the stored prompt after retrieving it
      sessionStorage.removeItem(promptKey);
      return storedPrompt;
    }
  }
  
  return urlPrompt;
};

/**
 * Utility function to store long prompts in sessionStorage and return a reference
 * to be used in URL parameters.
 * 
 * @param prompt - The prompt to store
 * @param prefix - Prefix for the storage key (e.g., 'course_outline', 'quiz')
 * @returns Either the original prompt (if short) or a reference key (if long)
 */
export const storePromptIfLong = (prompt: string, prefix: string): string => {
  if (prompt.length > 500) { // Threshold for "long" prompts
    const promptKey = `${prefix}_prompt_${Date.now()}`;
    sessionStorage.setItem(promptKey, prompt);
    // Store a reference to the prompt in sessionStorage
    sessionStorage.setItem('currentPromptKey', promptKey);
    // Return a short placeholder for URL
    return `[PROMPT_REF:${promptKey}]`;
  } else {
    // Clear any existing prompt references
    sessionStorage.removeItem('currentPromptKey');
    return prompt;
  }
}; 