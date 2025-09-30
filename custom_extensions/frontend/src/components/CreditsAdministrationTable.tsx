"use client";

import React, { useState } from 'react';
import { Plus, Minus, User, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Box,
  Typography
} from '@mui/material';

interface QuestionnaireAnswer {
  question: string;
  answer: string;
}

interface UserQuestionnaire {
  onyx_user_id: string;
  answers: QuestionnaireAnswer[];
}

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

type Order = 'asc' | 'desc';

interface TableProps {
  users: UserCredits[];
  questionnaires: UserQuestionnaire[];
  selectedUser: UserCredits | null;
  onUserSelect: (user: UserCredits | null) => void;
  onAddCredits: (user: UserCredits) => void;
  onRemoveCredits: (user: UserCredits) => void;
}

const CreditsAdministrationTable: React.FC<TableProps> = ({ users, questionnaires, selectedUser, onUserSelect, onAddCredits, onRemoveCredits }) => {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof UserCredits>('name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserQuestionnaire | null>(null);

  const handleRequestSort = (property: keyof UserCredits) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (userId: number) => {
    const user = users.find(u => u.id === userId);
    const isCurrentlySelected = selectedUser?.id === userId;
    onUserSelect(isCurrentlySelected ? null : user || null);
  };

  const openProfileModal = (userId: string) => {
    const userQuestionnaire = questionnaires.find(q => q.onyx_user_id === userId);
    if (userQuestionnaire) {
      setSelectedUserProfile(userQuestionnaire);
      setShowProfileModal(true);
    }
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedUserProfile(null);
  };

  const hasQuestionnaire = (userId: string) => {
    return questionnaires.some(q => q.onyx_user_id === userId && q.answers.length > 0);
  };

  const sortedUsers = React.useMemo(() => {
    const sorted = [...users].sort((a, b) => {
      let aValue: any = a[orderBy];
      let bValue: any = b[orderBy];

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [users, order, orderBy, page, rowsPerPage]);

  const createSortHandler = (property: keyof UserCredits) => () => {
    handleRequestSort(property);
  };

  return (
    <Paper className="shadow-lg rounded-lg overflow-hidden" sx={{ borderRadius: '0.5rem' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f9fafb' }}>
              <TableCell sx={{ backgroundColor: '#f9fafb' }}>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={createSortHandler('name')}
                  sx={{
                    color: orderBy === 'name' ? '#000000' : '#6b7280',
                    '&:hover': { color: '#000000' },
                    '&.MuiTableSortLabel-active': { color: '#000000' }
                  }}
                >
                  User
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f9fafb' }}>
                <TableSortLabel
                  active={orderBy === 'credits_balance'}
                  direction={orderBy === 'credits_balance' ? order : 'asc'}
                  onClick={createSortHandler('credits_balance')}
                  sx={{
                    color: orderBy === 'credits_balance' ? '#000000' : '#6b7280',
                    '&:hover': { color: '#000000' },
                    '&.MuiTableSortLabel-active': { color: '#000000' }
                  }}
                >
                  Credits Balance
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f9fafb' }}>
                <TableSortLabel
                  active={orderBy === 'total_credits_used'}
                  direction={orderBy === 'total_credits_used' ? order : 'asc'}
                  onClick={createSortHandler('total_credits_used')}
                  sx={{
                    color: orderBy === 'total_credits_used' ? '#000000' : '#6b7280',
                    '&:hover': { color: '#000000' },
                    '&.MuiTableSortLabel-active': { color: '#000000' }
                  }}
                >
                  Total Used
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f9fafb', color: '#6b7280' }}>Purchased</TableCell>
              <TableCell sx={{ backgroundColor: '#f9fafb', color: '#6b7280' }}>Tier</TableCell>
              <TableCell sx={{ backgroundColor: '#f9fafb', color: '#6b7280' }}>Last Purchase</TableCell>
              <TableCell sx={{ backgroundColor: '#f9fafb', color: '#6b7280' }}>Profile</TableCell>
              <TableCell sx={{ backgroundColor: '#f9fafb', color: '#6b7280' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedUsers.map((user) => (
              <TableRow
                key={user.id}
                hover
                selected={selectedUser?.id === user.id}
                onClick={() => handleRowClick(user.id)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {user.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.credits_balance > 50 
                      ? 'bg-green-100 text-green-800'
                      : user.credits_balance > 10
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.credits_balance}
                  </span>
                </TableCell>
                <TableCell>{user.total_credits_used}</TableCell>
                <TableCell>{user.credits_purchased}</TableCell>
                <TableCell>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {user.subscription_tier}
                  </span>
                </TableCell>
                <TableCell>
                  {user.last_purchase_date 
                    ? new Date(user.last_purchase_date).toLocaleDateString()
                    : 'Never'
                  }
                </TableCell>
                <TableCell>
                  {hasQuestionnaire(user.onyx_user_id) ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openProfileModal(user.onyx_user_id);
                      }}
                      className="flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200"
                    >
                      <User className="w-3 h-3 mr-1" />
                      View Profile
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500">No data</span>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddCredits(user);
                      }}
                      className="flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 border border-green-300 rounded hover:bg-green-200"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveCredits(user);
                      }}
                      className="flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-300 rounded hover:bg-red-200"
                    >
                      <Minus className="w-3 h-3 mr-1" />
                      Remove
                    </button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={users.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ 
          backgroundColor: '#f9fafb',
          color: '#6b7280',
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            color: '#6b7280'
          }
        }}
      />

      {/* Profile Modal */}
      {showProfileModal && selectedUserProfile && (
        <div 
          className="fixed inset-0 backdrop-blur-md bg-white bg-opacity-10 flex items-center justify-center p-4 z-50"
          onClick={closeProfileModal}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-black">
                User Profile: {selectedUserProfile.onyx_user_id}
              </h3>
              <button
                onClick={closeProfileModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4">
              <div className="space-y-4">
                {selectedUserProfile.answers.map((qa, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="mb-2">
                      <h4 className="text-sm font-semibold text-gray-800 capitalize">
                        {qa.question.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </h4>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {qa.answer.replace(/-/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedUserProfile.answers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No questionnaire data available for this user.</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeProfileModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Paper>
  );
};

export default CreditsAdministrationTable;
