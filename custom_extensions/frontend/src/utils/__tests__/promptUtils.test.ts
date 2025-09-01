import { getPromptFromUrlOrStorage, isPromptReference, generatePromptId } from '../promptUtils';

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('promptUtils', () => {
  beforeEach(() => {
    mockSessionStorage.clear();
  });

  describe('generatePromptId', () => {
    it('should generate a unique prompt ID with correct format', () => {
      const id1 = generatePromptId();
      const id2 = generatePromptId();

      expect(id1).toMatch(/^prompt_\d+_[a-z0-9]{9}$/);
      expect(id2).toMatch(/^prompt_\d+_[a-z0-9]{9}$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('isPromptReference', () => {
    it('should return true for valid prompt references', () => {
      expect(isPromptReference('prompt_1703123456789_abc123def')).toBe(true);
      expect(isPromptReference('prompt_1234567890_xyz987')).toBe(true);
    });

    it('should return false for invalid prompt references', () => {
      expect(isPromptReference('prompt_123')).toBe(false);
      expect(isPromptReference('prompt_abc123def')).toBe(false);
      expect(isPromptReference('not_a_prompt_ref')).toBe(false);
      expect(isPromptReference('')).toBe(false);
    });
  });

  describe('getPromptFromUrlOrStorage', () => {
    it('should return the prompt as-is if it is not a reference', () => {
      const shortPrompt = 'Create a course about JavaScript';
      const result = getPromptFromUrlOrStorage(shortPrompt);
      expect(result).toBe(shortPrompt);
    });

    it('should retrieve and clean up stored prompt if it is a reference', () => {
      const storedPrompt = 'This is a very long prompt that was stored in sessionStorage to avoid URL length limitations...';
      const promptId = 'prompt_1703123456789_abc123def';
      
      // Store the prompt
      mockSessionStorage.setItem(promptId, storedPrompt);
      
      // Retrieve it
      const result = getPromptFromUrlOrStorage(promptId);
      
      // Should return the stored prompt
      expect(result).toBe(storedPrompt);
      
      // Should clean up the stored prompt
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(promptId);
    });

    it('should fallback to URL prompt if sessionStorage retrieval fails', () => {
      const promptId = 'prompt_1703123456789_abc123def';
      
      // Mock sessionStorage.getItem to return null (simulating failure)
      mockSessionStorage.getItem.mockReturnValueOnce(null);
      
      const result = getPromptFromUrlOrStorage(promptId);
      
      // Should return the ID as-is (fallback behavior)
      expect(result).toBe(promptId);
    });

    it('should handle empty and undefined inputs', () => {
      expect(getPromptFromUrlOrStorage('')).toBe('');
      expect(getPromptFromUrlOrStorage(undefined as any)).toBe('');
    });

    it('should handle very long prompts correctly', () => {
      const longPrompt = 'A'.repeat(1000); // 1000 character prompt
      const result = getPromptFromUrlOrStorage(longPrompt);
      expect(result).toBe(longPrompt);
    });
  });
}); 