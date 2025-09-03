// custom_extensions/frontend/src/services/workspaceService.ts

export interface Workspace {
  id: number;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
  member_count?: number;
}

export interface WorkspaceRole {
  id: number;
  workspace_id: number;
  name: string;
  color: string;
  text_color: string;
  permissions: string[];
  is_default: boolean;
  created_by: string;
  created_at: string;
  updated_at?: string;
  member_count?: number;
}

export interface WorkspaceMember {
  id: number;
  workspace_id: number;
  user_id: string;
  role_id: number;
  status: 'pending' | 'active' | 'suspended';
  invited_at: string;
  joined_at?: string;
  updated_at?: string;
  user_name?: string;
  user_email?: string;
  role_name?: string;
  role_color?: string;
  role_text_color?: string;
}

export interface ProductAccess {
  id: number;
  product_id: number;
  workspace_id: number;
  access_type: 'workspace' | 'role' | 'individual';
  target_id?: string;
  granted_by: string;
  granted_at: string;
}

export interface WorkspaceCreate {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface WorkspaceUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface WorkspaceRoleCreate {
  workspace_id: number;
  name: string;
  color: string;
  text_color: string;
  permissions: string[];
  is_default?: boolean;
}

export interface WorkspaceRoleUpdate {
  name?: string;
  color?: string;
  text_color?: string;
  permissions?: string[];
}

export interface WorkspaceMemberCreate {
  workspace_id: number;
  user_id: string;
  role_id: number;
  status?: 'pending' | 'active' | 'suspended';
}

export interface WorkspaceMemberUpdate {
  role_id?: number;
  status?: 'pending' | 'active' | 'suspended';
}

export interface ProductAccessCreate {
  product_id: number;
  workspace_id: number;
  access_type: 'workspace' | 'role' | 'individual';
  target_id?: string;
}

class WorkspaceService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `/api/custom-projects-backend${endpoint}`;
    
    const response = await fetch(url, {
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Workspace Management
  async createWorkspace(data: WorkspaceCreate): Promise<Workspace> {
    return this.request<Workspace>('/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWorkspaces(): Promise<Workspace[]> {
    return this.request<Workspace[]>('/workspaces');
  }

  async getWorkspace(id: number): Promise<Workspace> {
    return this.request<Workspace>(`/workspaces/${id}`);
  }

  async getWorkspaceWithMembers(id: number): Promise<Workspace & { members: WorkspaceMember[]; roles: WorkspaceRole[] }> {
    return this.request<Workspace & { members: WorkspaceMember[]; roles: WorkspaceRole[] }>(`/workspaces/${id}/full`);
  }

  async updateWorkspace(id: number, data: WorkspaceUpdate): Promise<Workspace> {
    return this.request<Workspace>(`/workspaces/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWorkspace(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/workspaces/${id}`, {
      method: 'DELETE',
    });
  }

  // Role Management
  async createRole(workspaceId: number, data: Omit<WorkspaceRoleCreate, 'workspace_id'>): Promise<WorkspaceRole> {
    return this.request<WorkspaceRole>(`/workspaces/${workspaceId}/roles`, {
      method: 'POST',
      body: JSON.stringify({ ...data, workspace_id: workspaceId }),
    });
  }

  async getWorkspaceRoles(workspaceId: number): Promise<WorkspaceRole[]> {
    return this.request<WorkspaceRole[]>(`/workspaces/${workspaceId}/roles`);
  }

  async getWorkspaceRole(workspaceId: number, roleId: number): Promise<WorkspaceRole> {
    return this.request<WorkspaceRole>(`/workspaces/${workspaceId}/roles/${roleId}`);
  }

  async updateRole(workspaceId: number, roleId: number, data: WorkspaceRoleUpdate): Promise<WorkspaceRole> {
    return this.request<WorkspaceRole>(`/workspaces/${workspaceId}/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRole(workspaceId: number, roleId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/workspaces/${workspaceId}/roles/${roleId}`, {
      method: 'DELETE',
    });
  }

  // Member Management
  async addMember(workspaceId: number, data: Omit<WorkspaceMemberCreate, 'workspace_id'>): Promise<WorkspaceMember> {
    return this.request<WorkspaceMember>(`/workspaces/${workspaceId}/members`, {
      method: 'POST',
      body: JSON.stringify({ ...data, workspace_id: workspaceId }),
    });
  }

  async getWorkspaceMembers(workspaceId: number): Promise<WorkspaceMember[]> {
    return this.request<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`);
  }

  async updateMember(workspaceId: number, userId: string, data: WorkspaceMemberUpdate): Promise<WorkspaceMember> {
    return this.request<WorkspaceMember>(`/workspaces/${workspaceId}/members/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async removeMember(workspaceId: number, userId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/workspaces/${workspaceId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  async leaveWorkspace(workspaceId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/workspaces/${workspaceId}/leave`, {
      method: 'POST',
    });
  }

  // Product Access Control
  async grantProductAccess(productId: number, data: Omit<ProductAccessCreate, 'product_id'>): Promise<ProductAccess> {
    return this.request<ProductAccess>(`/products/${productId}/access`, {
      method: 'POST',
      body: JSON.stringify({ ...data, product_id: productId }),
    });
  }

  async getProductAccessList(productId: number): Promise<ProductAccess[]> {
    return this.request<ProductAccess[]>(`/products/${productId}/access`);
  }

  async revokeProductAccess(productId: number, accessId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/products/${productId}/access/${accessId}`, {
      method: 'DELETE',
    });
  }

  async checkUserProductAccess(productId: number, workspaceId: number): Promise<{
    product_id: number;
    workspace_id: number;
    user_id: string;
    has_access: boolean;
  }> {
    return this.request<{
      product_id: number;
      workspace_id: number;
      user_id: string;
      has_access: boolean;
    }>(`/products/${productId}/access/check?workspace_id=${workspaceId}`);
  }

  async getWorkspaceProductAccess(workspaceId: number): Promise<{
    workspace_id: number;
    access_records: ProductAccess[];
    count: number;
  }> {
    return this.request<{
      workspace_id: number;
      access_records: ProductAccess[];
      count: number;
    }>(`/products/workspace/${workspaceId}/access`);
  }
}

export const workspaceService = new WorkspaceService();
export default workspaceService; 