"use client";

import React, { useEffect, useMemo, useState } from 'react';
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
  type: 'purchase' | 'product_generation' | 'admin_removal';
  title: string;
  credits: number;
  timestamp: string;
  product_type?: string;
}

interface UserTransactionHistoryResponse {
  user_id: number;
  user_email: string;
  user_name: string;
  transactions: TimelineActivity[];
}

interface UserActivityTimelineProps {
  selectedUser: UserCredits | null;
}

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

const UserActivityTimeline: React.FC<UserActivityTimelineProps> = ({ selectedUser }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<TimelineActivity[]>([]);

  useEffect(() => {
    let cancelled = false;
    const fetchTransactions = async (userId: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${CUSTOM_BACKEND_URL}/admin/credits/user/${encodeURIComponent(userId)}/transactions`, {
          credentials: 'same-origin',
        });
        if (!res.ok) throw new Error(`Failed to fetch transactions: ${res.status}`);
        const data: UserTransactionHistoryResponse = await res.json();
        if (!cancelled) setActivities(data.transactions || []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load timeline');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (selectedUser) {
      fetchTransactions(selectedUser.onyx_user_id);
    } else {
      setActivities([]);
    }

    return () => {
      cancelled = true;
    };
  }, [selectedUser]);

  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activities]);

  const getActivityColor = (type: string) => {
    if (type === 'purchase') return '#10B981'; // green-500
    if (type === 'product_generation') return '#3B82F6'; // blue-500
    if (type === 'admin_removal') return '#EF4444'; // red-500
    return '#EF4444'; // red-500
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

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6 h-[480px]">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Activity Timeline for {selectedUser.name}
      </h3>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="h-64 flex items-center justify-center text-red-600">{error}</div>
      ) : sortedActivities.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-lg mb-2">No activity found</div>
            <div className="text-sm">This user hasn't performed any actions yet</div>
          </div>
        </div>
      ) : (
        <div className="h-96 overflow-y-auto">
          <Timeline position="alternate" sx={{ 
            '& .MuiTimelineItem-root': {
              minHeight: 'auto',
              '&:before': {
                display: 'none'
              }
            },
            '& .MuiTimelineContent-root': {
              py: 2,
              px: 2
            }
          }}>
            {sortedActivities.map((activity, index) => (
              <TimelineItem key={activity.id}>
                <TimelineContent sx={{ 
                  py: 2, 
                  px: 2,
                  '&:before': {
                    display: 'none'
                  }
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 0.5,
                    backgroundColor: '#F8FAFC',
                    borderRadius: 2,
                    p: 2,
                    border: '1px solid #E2E8F0',
                    textAlign: 'center',
                    minWidth: '120px'
                  }}>
                    <Typography 
                      variant="body2" 
                      component="span" 
                      sx={{ 
                        fontWeight: 400,
                        color: '#6B7280',
                        fontSize: '14px'
                      }}
                    >
                      {formatTimestamp(activity.timestamp)}
                    </Typography>
                  </Box>
                </TimelineContent>

                <TimelineSeparator>
                  <TimelineDot sx={{ 
                    backgroundColor: getActivityColor(activity.type),
                    color: 'white',
                    width: 12,
                    height: 12,
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                  </TimelineDot>
                  {index < sortedActivities.length - 1 && (
                    <TimelineConnector sx={{ 
                      backgroundColor: '#E5E7EB',
                      width: '2px',
                      minHeight: '60px'
                    }} />
                  )}
                </TimelineSeparator>

                <TimelineContent sx={{ 
                  py: 2, 
                  px: 2,
                  '&:before': {
                    display: 'none'
                  }
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 1,
                    backgroundColor: '#F8FAFC',
                    borderRadius: 2,
                    p: 2,
                    border: '1px solid #E2E8F0',
                    minWidth: '200px'
                  }}>
                    <Typography 
                      variant="body2" 
                      component="span" 
                      sx={{ 
                        fontWeight: 600,
                        color: '#1F2937',
                        fontSize: '14px',
                        mb: 0.5
                      }}
                    >
                      {activity.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: activity.type === 'purchase' ? '#059669' : '#DC2626',
                        fontWeight: 600,
                        fontSize: '14px'
                      }}
                    >
                      {activity.type === 'purchase' ? '+' : '-'}{activity.credits} credits
                    </Typography>
                  </Box>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </div>
      )}
    </div>
  );
};

export default UserActivityTimeline;
