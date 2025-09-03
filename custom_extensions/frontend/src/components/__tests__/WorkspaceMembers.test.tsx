import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WorkspaceMembers from '../WorkspaceMembers';
import workspaceService from '../../services/workspaceService';

// Mock the workspace service
jest.mock('../../services/workspaceService');
const mockWorkspaceService = workspaceService as jest.Mocked<typeof workspaceService>;

// Mock the language context
jest.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string, fallback: string) => fallback,
  }),
}));

describe('WorkspaceMembers Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders workspace selection when no workspaceId is provided', async () => {
    // Mock empty workspaces
    mockWorkspaceService.getWorkspaces.mockResolvedValue([]);

    render(<WorkspaceMembers />);

    await waitFor(() => {
      expect(screen.getByText('Welcome to Workspaces')).toBeInTheDocument();
      expect(screen.getByText('Create Your First Workspace')).toBeInTheDocument();
    });
  });

  it('renders workspace selection when user has existing workspaces', async () => {
    // Mock existing workspaces
    const mockWorkspaces = [
      { id: 1, name: 'Test Workspace', description: 'Test Description', member_count: 5 }
    ];
    mockWorkspaceService.getWorkspaces.mockResolvedValue(mockWorkspaces);

    render(<WorkspaceMembers />);

    await waitFor(() => {
      expect(screen.getByText('Test Workspace')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });
  });

  it('renders workspace management when workspaceId is provided', async () => {
    // Mock workspace data
    mockWorkspaceService.getWorkspaceRoles.mockResolvedValue([]);
    mockWorkspaceService.getWorkspaceMembers.mockResolvedValue([]);

    render(<WorkspaceMembers workspaceId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Add Member')).toBeInTheDocument();
      expect(screen.getByText('Manage Roles')).toBeInTheDocument();
    });
  });

  it('shows create workspace modal when button is clicked', async () => {
    mockWorkspaceService.getWorkspaces.mockResolvedValue([]);

    render(<WorkspaceMembers />);

    await waitFor(() => {
      const createButton = screen.getByText('Create Your First Workspace');
      fireEvent.click(createButton);
    });

    expect(screen.getByText('Create New Workspace')).toBeInTheDocument();
  });

  it('creates a new workspace when form is submitted', async () => {
    const mockWorkspace = { id: 1, name: 'New Workspace', description: 'New Description' };
    mockWorkspaceService.getWorkspaces.mockResolvedValue([]);
    mockWorkspaceService.createWorkspace.mockResolvedValue(mockWorkspace);

    render(<WorkspaceMembers />);

    await waitFor(() => {
      const createButton = screen.getByText('Create Your First Workspace');
      fireEvent.click(createButton);
    });

    const nameInput = screen.getByPlaceholderText('Enter workspace name');
    const descriptionInput = screen.getByPlaceholderText('Describe your workspace');
    const submitButton = screen.getByText('Create Workspace');

    fireEvent.change(nameInput, { target: { value: 'New Workspace' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockWorkspaceService.createWorkspace).toHaveBeenCalledWith({
        name: 'New Workspace',
        description: 'New Description'
      });
    });
  });
}); 