"use client";

import React from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import { Typography, Paper, Box } from '@mui/material';
import { Plus, Minus, ShoppingCart, FileText, Video, HelpCircle, Presentation, FileCheck } from 'lucide-react';

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
  description: string;
  credits: number;
  timestamp: string;
  productType?: string;
}

// Mock timeline data for users
const mockUserTimelineData: Record<string, TimelineActivity[]> = {
  'user1@example.com': [
    {
      id: '1',
      type: 'purchase',
      title: 'Credit Purchase',
      description: 'Purchased 500 credits',
      credits: 500,
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      type: 'product_generation',
      title: 'Course Outline Created',
      description: 'Generated Course Outline"',
      credits: 5,
      timestamp: '2024-01-14T14:20:00Z',
      productType: 'Course Outline'
    },
    {
      id: '3',
      type: 'product_generation',
      title: 'Video Lesson Created',
      description: 'Generated Video Lesson"',
      credits: 10,
      timestamp: '2024-01-13T09:15:00Z',
      productType: 'Video Lesson'
    },
    {
      id: '4',
      type: 'product_generation',
      title: 'Quiz Created',
      description: 'Generated Quiz"',
      credits: 5,
      timestamp: '2024-01-12T16:45:00Z',
      productType: 'Quiz'
    },
    {
      id: '5',
      type: 'product_generation',
      title: 'Presentation Created',
      description: 'Generated Presentation"',
      credits: 10,
      timestamp: '2024-01-11T11:30:00Z',
      productType: 'Presentation'
    },
    {
      id: '6',
      type: 'product_generation',
      title: 'One-Pager Created',
      description: 'Generated One-Pager"',
      credits: 5,
      timestamp: '2024-01-10T13:20:00Z',
      productType: 'One-Pager'
    }
  ],
  'user2@example.com': [
    {
      id: '1',
      type: 'purchase',
      title: 'Credit Purchase',
      description: 'Purchased 300 credits',
      credits: 300,
      timestamp: '2024-01-10T14:20:00Z'
    },
    {
      id: '2',
      type: 'product_generation',
      title: 'Video Lesson Created',
      description: 'Generated Video Lesson"',
      credits: 10,
      timestamp: '2024-01-09T10:15:00Z',
      productType: 'Video Lesson'
    },
    {
      id: '3',
      type: 'product_generation',
      title: 'Quiz Created',
      description: 'Generated Quiz"',
      credits: 5,
      timestamp: '2024-01-08T15:30:00Z',
      productType: 'Quiz'
    },
    {
      id: '4',
      type: 'product_generation',
      title: 'Course Outline Created',
      description: 'Generated Course Outline"',
      credits: 5,
      timestamp: '2024-01-07T12:45:00Z',
      productType: 'Course Outline'
    },
    {
      id: '5',
      type: 'product_generation',
      title: 'Presentation Created',
      description: 'Generated Presentation"',
      credits: 10,
      timestamp: '2024-01-06T09:20:00Z',
      productType: 'Presentation'
    },
    {
      id: '6',
      type: 'product_generation',
      title: 'One-Pager Created',
      description: 'Generated One-Pager"',
      credits: 5,
      timestamp: '2024-01-05T14:10:00Z',
      productType: 'One-Pager'
    }
  ],
  'user3@example.com': [
    {
      id: '1',
      type: 'purchase',
      title: 'Credit Purchase',
      description: 'Purchased 400 credits',
      credits: 400,
      timestamp: '2024-01-12T09:15:00Z'
    },
    {
      id: '2',
      type: 'product_generation',
      title: 'Presentation Created',
      description: 'Generated Presentation"',
      credits: 10,
      timestamp: '2024-01-11T16:30:00Z',
      productType: 'Presentation'
    },
    {
      id: '3',
      type: 'product_generation',
      title: 'Course Outline Created',
      description: 'Generated Course Outline"',
      credits: 5,
      timestamp: '2024-01-10T11:45:00Z',
      productType: 'Course Outline'
    },
    {
      id: '4',
      type: 'product_generation',
      title: 'Quiz Created',
      description: 'Generated Quiz"',
      credits: 5,
      timestamp: '2024-01-09T13:20:00Z',
      productType: 'Quiz'
    },
    {
      id: '5',
      type: 'product_generation',
      title: 'Video Lesson Created',
      description: 'Generated Video Lesson"',
      credits: 10,
      timestamp: '2024-01-08T10:15:00Z',
      productType: 'Video Lesson'
    },
    {
      id: '6',
      type: 'product_generation',
      title: 'One-Pager Created',
      description: 'Generated One-Pager"',
      credits: 5,
      timestamp: '2024-01-07T14:50:00Z',
      productType: 'One-Pager'
    }
  ]
};

interface UserActivityTimelineProps {
  selectedUser: UserCredits | null;
}

const UserActivityTimeline: React.FC<UserActivityTimelineProps> = ({ selectedUser }) => {
  if (!selectedUser) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6">
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
    
    switch (productType) {
      case 'Course Outline':
        return '#FF6B6B'; // Red
      case 'Video Lesson':
        return '#4ECDC4'; // Teal
      case 'Quiz':
        return '#45B7D1'; // Blue
      case 'Presentation':
        return '#96CEB4'; // Green
      case 'One-Pager':
        return '#FFEAA7'; // Yellow
      default:
        return '#FF6B6B'; // Default red
    }
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
    <div className="bg-white shadow rounded-lg p-6 mb-6">
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
        <Timeline position="right" sx={{ maxHeight: '400px', overflowY: 'auto' }}>
          {sortedActivities.map((activity, index) => (
            <TimelineItem key={activity.id}>
              <TimelineContent sx={{ py: '12px', px: 2 }}>
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
                  
                  {/* Row 3: Date and time */}
                  <Typography variant="caption" color="text.secondary">
                    {formatTimestamp(activity.timestamp)}
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
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </div>
  );
};

export default UserActivityTimeline;
