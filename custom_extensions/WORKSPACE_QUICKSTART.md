# Workspace System Quick Start Guide

Get your multi-tenant collaboration system up and running in minutes!

## 🚀 Quick Setup

### 1. Backend Setup

Navigate to your backend directory:
```bash
cd custom_extensions/backend
```

Run the migration script to create the required database tables:
```bash
python migrate_workspace_system.py
```

### 2. Restart Your Backend

The workspace system will be automatically initialized when your FastAPI application starts.

### 3. Test the System

Run the test script to verify everything is working:
```bash
python test_workspace_system.py
```

## 📱 Frontend Integration

### 1. Update Your Component

Replace the mock data in your `WorkspaceMembers` component with the new API service:

```tsx
import workspaceService from '../services/workspaceService';

// Use the service instead of mock data
const workspaces = await workspaceService.getWorkspaces();
```

### 2. Add to Your Pages

Include the WorkspaceMembers component in your pages:

```tsx
import WorkspaceMembers from '../components/WorkspaceMembers';

// In your page component
<WorkspaceMembers workspaceId={1} />
```

## 🔑 First Steps

### 1. Create Your First Workspace

```typescript
const workspace = await workspaceService.createWorkspace({
  name: "My Team",
  description: "Our collaborative workspace"
});
```

### 2. Add Team Members

```typescript
const member = await workspaceService.addMember(workspace.id, {
  user_id: "team@example.com",
  role_id: 2, // Member role
  status: "pending"
});
```

### 3. Create Custom Roles

```typescript
const editorRole = await workspaceService.createRole(workspace.id, {
  name: "Content Editor",
  color: "#FFE4E1",
  text_color: "#DC143C",
  permissions: ["view_content", "edit_content"]
});
```

## 🌐 API Endpoints

Your workspace system is now available at:

- **Workspaces**: `/api/custom/workspaces`
- **Roles**: `/api/custom/workspaces/{id}/roles`
- **Members**: `/api/custom/workspaces/{id}/members`
- **Product Access**: `/api/custom/products/{id}/access`

## 🔧 Configuration

### Environment Variables

Add to your `.env` file:
```bash
CUSTOM_PROJECTS_DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### Database Requirements

- PostgreSQL 12+ with JSONB support
- Connection pool with at least 5 connections
- Proper indexing for performance

## 📊 Default Roles

The system automatically creates three default roles:

1. **Admin** - Full control (purple)
2. **Moderator** - Member management (green)  
3. **Member** - Basic collaboration (blue)

## 🚨 Troubleshooting

### Common Issues

**"Table doesn't exist"**
- Run the migration script: `python migrate_workspace_system.py`

**"Connection refused"**
- Check your database URL and ensure PostgreSQL is running

**"Permission denied"**
- Verify your database user has CREATE TABLE privileges

**"Import error"**
- Ensure you're running scripts from the backend directory

### Getting Help

1. Check the logs for detailed error messages
2. Verify database connectivity
3. Ensure all environment variables are set
4. Check the full documentation in `WORKSPACE_SYSTEM_README.md`

## 🎯 Next Steps

1. **Customize Roles**: Create roles specific to your workflow
2. **Integrate Authentication**: Connect with your user management system
3. **Add Product Access**: Control access to your content and features
4. **Scale Up**: Add more workspaces and members as needed

## 📚 Full Documentation

For complete details, see:
- `WORKSPACE_SYSTEM_README.md` - Comprehensive system documentation
- `test_workspace_system.py` - Example usage and testing
- `migrate_workspace_system.py` - Database migration utilities

---

**Need help?** Check the logs, verify your setup, and refer to the full documentation. The system is designed to be robust and self-documenting! 