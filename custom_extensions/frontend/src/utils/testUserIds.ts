/**
 * Test Utility for Setting User IDs
 * Use this in browser console to test different users
 */

import { setDevUserId, clearDevUserId } from '../services/userService';

// Common test user IDs
export const TEST_USERS = {
  ADMIN_USER: 'admin@test.com',
  MODERATOR_USER: 'moderator@test.com', 
  MEMBER_USER: 'member@test.com',
  USER_1: 'user1@example.com',
  USER_2: 'user2@example.com',
  USER_3: 'user3@example.com',
  DEFAULT: 'current_user_123'
};

/**
 * Set the current test user (call this in browser console)
 * Example: setTestUser(TEST_USERS.ADMIN_USER)
 */
export const setTestUser = (userId: string): void => {
  setDevUserId(userId);
  console.log(`🔧 Test user set to: ${userId}`);
  console.log('🔄 Refresh the page to see changes');
};

/**
 * Clear test user and use default
 */
export const clearTestUser = (): void => {
  clearDevUserId();
  console.log('🔧 Test user cleared, using default');
  console.log('🔄 Refresh the page to see changes');
};

/**
 * Show current test user
 */
export const showCurrentUser = (): void => {
  const devUserId = typeof window !== "undefined" ? sessionStorage.getItem("dev_user_id") : null;
  console.log(`🔍 Current test user: ${devUserId || 'default (current_user_123)'}`);
};

// Make functions available globally for console testing
if (typeof window !== "undefined") {
  (window as any).setTestUser = setTestUser;
  (window as any).clearTestUser = clearTestUser;
  (window as any).showCurrentUser = showCurrentUser;
  (window as any).TEST_USERS = TEST_USERS;
  
  console.log('🔧 Test utilities loaded! Available commands:');
  console.log('   setTestUser(TEST_USERS.ADMIN_USER) - Set admin user');
  console.log('   setTestUser(TEST_USERS.MEMBER_USER) - Set member user');
  console.log('   clearTestUser() - Clear test user');
  console.log('   showCurrentUser() - Show current user');
  console.log('   TEST_USERS - See all available test users');
} 