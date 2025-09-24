# Multi-Tenant Collaboration System

This document describes the implementation of a comprehensive multi-tenant collaboration system for the Onyx Custom Extensions project.

## Overview

The system provides:
- **Workspace Management**: Create, manage, and organize collaborative workspaces
- **Role-Based Access Control**: Flexible permission system with default and custom roles
- **Member Management**: Invite, manage, and organize workspace members
- **Product Access Control**: Granular access control for products and content
- **API-First Design**: RESTful API endpoints for all operations
- **Frontend Integration**: React components with real-time data integration

## Architecture

### Backend Structure

```
custom_extensions/backend/
├── app/
│   ├── models/
│   │   └── workspace_models.py          # Data models and schemas
│   ├── services/
│   │   ├── workspace_service.py         # Workspace business logic
│   │   ├── role_service.py              # Role management logic
│   │   └── product_access_service.py    # Access control logic
│   ├── api/
│   │   ├── workspaces.py                # Workspace API endpoints
│   │   └── product_access.py            # Product access API endpoints
│   └── core/
│       └── database.py                  # Database configuration and utilities
└── main.py                              # Main FastAPI application
```

### Frontend Structure

```
custom_extensions/frontend/src/
├── components/
│   └── WorkspaceMembers.tsx            # Main workspace management component
├── services/
│   └── workspaceService.ts             # API service layer
└── contexts/
    └── LanguageContext.tsx              # Internationalization support
```

## Database Schema

### Core Tables

#### 1. Workspaces
```sql
CREATE TABLE workspaces (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);
```

#### 2. Workspace Roles
```sql
CREATE TABLE workspace_roles (
    id SERIAL PRIMARY KEY,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    text_color VARCHAR(7) NOT NULL CHECK (text_color ~ '^#[0-9A-Fa-f]{6}$'),
    permissions JSONB NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(workspace_id, name)
);
```

#### 3. Workspace Members
```sql
CREATE TABLE workspace_members (
    id SERIAL PRIMARY KEY,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES workspace_roles(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(workspace_id, user_id)
);
```

#### 4. Product Access
```sql
CREATE TABLE product_access (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('workspace', 'role', 'individual')),
    target_id VARCHAR(255),
    granted_by VARCHAR(255) NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, workspace_id, access_type, target_id)
);
```

## Default Role System

### Admin Role
- **Permissions**: Full workspace control
- **Color**: Purple (#F3E8FF)
- **Capabilities**: 
  - Manage workspace settings
  - Delete workspace
  - Manage all members and roles
  - Control product access
  - Cannot be removed or modified

### Learning Architect Role
- **Permissions**: Content and member management
- **Color**: Green (#ECFDF5)
- **Capabilities**:
  - Manage members (except admins)
  - Manage content
  - Grant/revoke product access
  - Cannot manage roles or delete workspace

### Learning Designer Role
- **Permissions**: Basic collaboration
- **Color**: Blue (#EFF6FF)
- **Capabilities**:
  - View shared content
  - Edit own content
  - Cannot manage members or roles

## API Endpoints

### Workspace Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/custom/workspaces` | Create new workspace |
| GET | `/api/custom/workspaces` | List user's workspaces |
| GET | `/api/custom/workspaces/{id}` | Get workspace details |
| GET | `/api/custom/workspaces/{id}/full` | Get workspace with members and roles |
| PUT | `/api/custom/workspaces/{id}` | Update workspace |
| DELETE | `/api/custom/workspaces/{id}` | Delete workspace |

### Role Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/custom/workspaces/{id}/roles` | Create custom role |
| GET | `/api/custom/workspaces/{id}/roles` | List workspace roles |
| GET | `/api/custom/workspaces/{id}/roles/{role_id}` | Get role details |
| PUT | `/api/custom/workspaces/{id}/roles/{role_id}` | Update custom role |
| DELETE | `/api/custom/workspaces/{id}/roles/{role_id}` | Delete custom role |

### Member Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/custom/workspaces/{id}/members` | Add member to workspace |
| GET | `/api/custom/workspaces/{id}/members` | List workspace members |
| PUT | `/api/custom/workspaces/{id}/members/{user_id}` | Update member |
| DELETE | `/api/custom/workspaces/{id}/members/{user_id}` | Remove member |
| POST | `/api/custom/workspaces/{id}/leave` | Leave workspace |

### Product Access Control

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/custom/products/{id}/access` | Grant product access |
| GET | `/api/custom/products/{id}/access` | List product access records |
| DELETE | `/api/custom/products/{id}/access/{access_id}` | Revoke product access |
| GET | `/api/custom/products/{id}/access/check` | Check user access |
| GET | `/api/custom/products/workspace/{workspace_id}/access` | Get workspace product access |

## Frontend Components

### WorkspaceMembers Component

The main component for managing workspace members and roles. Features include:

- **Member List**: Display all workspace members with search and filtering
- **Role Management**: Create, edit, and delete custom roles
- **Member Actions**: Add, remove, suspend, and activate members
- **Real-time Updates**: Integration with backend API
- **Responsive Design**: Mobile-friendly interface
- **Internationalization**: Multi-language support

### Key Features

1. **Search and Filtering**: Find members by name, email, or status
2. **Role Assignment**: Change member roles with dropdown selection
3. **Status Management**: Manage member status (pending, active, suspended)
4. **Custom Roles**: Create roles with custom colors and permissions
5. **Permission System**: Visual representation of role permissions
6. **Bulk Operations**: Efficient member and role management

## Usage Examples

### Creating a Workspace

```typescript
import workspaceService from '../services/workspaceService';

const newWorkspace = await workspaceService.createWorkspace({
  name: "My Team Workspace",
  description: "Collaborative space for our development team"
});
```

### Adding a Member

```typescript
const newMember = await workspaceService.addMember(workspaceId, {
  user_id: "user@example.com",
  role_id: 2, // Member role
  status: "pending"
});
```

### Creating a Custom Role

```typescript
const customRole = await workspaceService.createRole(workspaceId, {
  name: "Content Editor",
  color: "#FFE4E1",
  text_color: "#DC143C",
  permissions: ["view_content", "edit_content"]
});
```

### Managing Product Access

```typescript
// Grant workspace-wide access
await workspaceService.grantProductAccess(productId, {
  workspace_id: workspaceId,
  access_type: "workspace"
});

// Check user access
const hasAccess = await workspaceService.checkUserProductAccess(
  productId, 
  workspaceId
);
```

## Security Features

### Permission System
- **Granular Permissions**: Fine-grained control over user capabilities
- **Role-based Access**: Assign permissions through roles
- **Default Role Protection**: System roles cannot be modified or deleted
- **Workspace Isolation**: Users can only access workspaces they're members of

### Access Control
- **Product-level Security**: Control access to individual products
- **Multi-level Access**: Workspace, role, or individual access
- **Audit Trail**: Track who granted access and when
- **Cascade Deletion**: Automatic cleanup when workspaces are deleted

## Testing

### Backend Testing

Run the test script to verify the system:

```bash
cd custom_extensions/backend
python test_workspace_system.py
```

### Frontend Testing

The frontend components include error handling and loading states for robust user experience.

## Configuration

### Environment Variables

```bash
# Database connection
CUSTOM_PROJECTS_DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# API configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Database Setup

The system automatically creates required tables on startup. Ensure your PostgreSQL database is accessible and the connection string is properly configured.

## Deployment

### Backend Deployment

1. Ensure PostgreSQL database is running and accessible
2. Set environment variables for database connection
3. Start the FastAPI application
4. The system will automatically initialize database tables

### Frontend Deployment

1. Configure the API endpoint URL
2. Build and deploy the React application
3. Ensure CORS is properly configured on the backend

## Future Enhancements

### Planned Features

1. **Invitation System**: Email-based member invitations
2. **Activity Logging**: Track workspace activities and changes
3. **Advanced Permissions**: Time-based and conditional permissions
4. **Workspace Templates**: Pre-configured workspace setups
5. **Integration APIs**: Connect with external identity providers
6. **Audit Reports**: Comprehensive access and activity reporting

### Scalability Considerations

- **Database Indexing**: Optimized queries for large workspaces
- **Connection Pooling**: Efficient database connection management
- **Caching**: Redis integration for frequently accessed data
- **Async Processing**: Background tasks for heavy operations

## Troubleshooting

### Common Issues

1. **Database Connection**: Verify database URL and credentials
2. **Permission Errors**: Check user role and workspace membership
3. **CORS Issues**: Ensure backend CORS configuration matches frontend
4. **Missing Tables**: Restart backend to trigger table initialization

### Debug Mode

Enable debug logging by setting `IS_PRODUCTION = False` in the backend configuration.

## Contributing

When contributing to the workspace system:

1. **Follow Patterns**: Maintain consistency with existing code structure
2. **Add Tests**: Include tests for new functionality
3. **Update Documentation**: Keep this README current
4. **Security Review**: Ensure new features don't compromise security
5. **Performance**: Consider impact on large workspaces

## License

This workspace system is part of the Onyx Custom Extensions project and follows the same licensing terms.

---

For additional support or questions, refer to the main project documentation or contact the development team. 