"use client";

import React from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import { Typography, Box } from '@mui/material';

interface UserCredits {
  id: number;
  onyx_user_id: string;
  name: string;
  credits_balance: number;
  total_credits_used: number;
  credits_purchased: number;
  last_purchase_date: string | null;
  subscription_tier: string;
  created_at: string;
  updated_at: string;
}

interface TimelineActivity {
  id: string;
  type: 'purchase' | 'product_generation';
  title: string;
  credits: number;
  timestamp: string;
  productType?: string;
}

// Product type configuration to reduce redundancy
const PRODUCT_TYPES = {
  'Course Outline': { credits: 5, color: '#FF6B6B' },
  'Video Lesson': { credits: 10, color: '#FF6B6B' },
  'Quiz': { credits: 5, color: '#FFEAA7' },
  'Presentation': { credits: 10, color: '#96CEB4' },
  'One-Pager': { credits: 5, color: '#45B7D1' }
} as const;

// Generate mock timeline data more efficiently
const generateMockTimelineData = (userId: string, baseDate: Date): TimelineActivity[] => {
  const activities: TimelineActivity[] = [];
  
  // Add purchase activity
  activities.push({
    id: '1',
    type: 'purchase',
    title: 'Credit Purchase',
    credits: Math.floor(Math.random() * 200) + 300, // Random between 300-500
    timestamp: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  });

  // Add product generation activities
  const productTypes = Object.keys(PRODUCT_TYPES);
  productTypes.forEach((productType, index) => {
    const activityDate = new Date(baseDate.getTime() - (index + 1) * 24 * 60 * 60 * 1000);
    activities.push({
      id: (index + 2).toString(),
      type: 'product_generation',
      title: `${productType} generated`,
      credits: PRODUCT_TYPES[productType as keyof typeof PRODUCT_TYPES].credits,
      timestamp: activityDate.toISOString(),
      productType
    });
  });

  return activities;
};

// Mock timeline data for users
const mockUserTimelineData: Record<string, TimelineActivity[]> = {
  'user1@example.com': generateMockTimelineData('user1@example.com', new Date('2024-01-15')),
  'user2@example.com': generateMockTimelineData('user2@example.com', new Date('2024-01-10')),
  'user3@example.com': generateMockTimelineData('user3@example.com', new Date('2024-01-12'))
};

interface UserActivityTimelineProps {
  selectedUser: UserCredits | null;
}

const UserActivityTimeline: React.FC<UserActivityTimelineProps> = ({ selectedUser }) => {
  if (!selectedUser) {
      return (
    <div className="bg-white shadow rounded-lg p-6 mb-6 h-[480px]">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity Timeline</h3>
      <div className="h-64 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-lg mb-2">Select a user from the table</div>
          <div className="text-sm">to view their activity timeline</div>
        </div>
      </div>
    </div>
  );
  }

  const activities = mockUserTimelineData[selectedUser.onyx_user_id] || [];
  const sortedActivities = activities.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getActivityColor = (type: string, productType?: string) => {
    if (type === 'purchase') {
      return '#4CAF50'; // Green for purchases
    }
    
    // All product generation activities use blue (like the "add user" button)
    if (type === 'product_generation') {
      return '#2563eb'; // Blue color matching the "add user" button
    }
    
    return '#FF6B6B'; // Default red
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6 h-[480px]">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Activity Timeline for {selectedUser.name}
      </h3>
      
      {sortedActivities.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-lg mb-2">No activity found</div>
            <div className="text-sm">This user hasn't performed any actions yet</div>
          </div>
        </div>
      ) : (
        <Timeline position="alternate" sx={{ maxHeight: '400px', overflowY: 'auto' }}>
          {sortedActivities.map((activity, index) => (
            <TimelineItem key={activity.id}>
              <TimelineContent sx={{ py: '20px', px: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {/* Row 1: Activity Title */}
                  <Typography variant="body2" component="span" fontWeight="medium">
                    {activity.title}
                  </Typography>
                  
                  {/* Row 2: Credits with color */}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: activity.type === 'purchase' ? '#4CAF50' : '#F44336',
                      fontWeight: 'medium'
                    }}
                  >
                    {activity.type === 'purchase' ? '+' : '-'}{activity.credits} credits
                  </Typography>
                </Box>
              </TimelineContent>
              
              <TimelineSeparator>
                <TimelineDot sx={{ 
                  backgroundColor: getActivityColor(activity.type, activity.productType),
                  color: 'white',
                  width: 24,
                  height: 24
                }}>
                </TimelineDot>
                {index < sortedActivities.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              
              <TimelineContent sx={{ py: '20px', px: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {/* Date and time on the right side */}
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                    {formatTimestamp(activity.timestamp)}
                  </Typography>
                </Box>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </div>
  );
};

export default UserActivityTimeline;
