/**
 * Utility functions for handling prompts that may be stored in sessionStorage
 * to avoid URL length limitations
 */

/**
 * Retrieves a prompt from either URL parameters or sessionStorage
 * @param urlPrompt - The prompt value from URL parameters
 * @returns The actual prompt text
 */
export function getPromptFromUrlOrStorage(urlPrompt: string): string {
  // If the prompt looks like a sessionStorage reference (starts with 'prompt_' and contains timestamp)
  if (urlPrompt.startsWith('prompt_') && urlPrompt.includes('_')) {
    try {
      // Try to retrieve from sessionStorage
      const storedPrompt = sessionStorage.getItem(urlPrompt);
      if (storedPrompt) {
        // Clean up the stored prompt after retrieving it
        sessionStorage.removeItem(urlPrompt);
        return storedPrompt;
      }
    } catch (error) {
      console.error('Error retrieving prompt from sessionStorage:', error);
    }
  }
  
  // If not a reference or retrieval failed, return the URL prompt as-is
  return urlPrompt;
}

/**
 * Checks if a prompt is a sessionStorage reference
 * @param prompt - The prompt value to check
 * @returns True if the prompt is a sessionStorage reference
 */
export function isPromptReference(prompt: string): boolean {
  return prompt.startsWith('prompt_') && prompt.includes('_');
}

/**
 * Generates a unique prompt ID for sessionStorage
 * @returns A unique prompt identifier
 */
export function generatePromptId(): string {
  return `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
} 