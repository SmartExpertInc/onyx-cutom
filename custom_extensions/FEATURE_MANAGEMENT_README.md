# Feature Management System

This document describes the comprehensive feature management system implemented for the application, allowing administrators to control user access to specific features through a centralized admin dashboard.

## Overview

The feature management system provides:
- **Database-driven feature flags** with per-user granularity
- **Admin dashboard** with tabs for Credits, Analytics, and Features
- **Graceful degradation** when features are disabled
- **Bulk operations** for efficient feature management
- **Real-time feature flag checking** in the frontend

## Architecture

### Backend Components

#### 1. Database Schema
```sql
CREATE TABLE user_feature_flags (
    id SERIAL PRIMARY KEY,
    onyx_user_id VARCHAR(255) NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(onyx_user_id, feature_name)
);
```

#### 2. Pydantic Models
```python
class FeatureFlag(BaseModel):
    id: int
    onyx_user_id: str
    feature_name: str
    is_enabled: bool
    created_at: datetime
    updated_at: datetime

class FeatureFlagUpdateRequest(BaseModel):
    feature_name: str
    is_enabled: bool

class FeatureFlagBulkUpdateRequest(BaseModel):
    feature_name: str
    user_emails: List[str]
    is_enabled: bool

class UserFeatureFlagsResponse(BaseModel):
    feature_flags: Dict[str, bool]
    user_id: str
```

#### 3. Feature Flag Enum
```python
class FeatureFlagEnum(str, Enum):
    SETTINGS_MODAL = "settings_modal"
    QUALITY_TIER_DISPLAY = "quality_tier_display"
    AI_IMAGE_GENERATION = "ai_image_generation"
    ADVANCED_EDITING = "advanced_editing"
    ANALYTICS_DASHBOARD = "analytics_dashboard"
    CUSTOM_RATES = "custom_rates"
    FOLDER_MANAGEMENT = "folder_management"
    BULK_OPERATIONS = "bulk_operations"
```

#### 4. FeatureFlagService
Located at `custom_extensions/backend/app/services/feature_flags.py`

Key methods:
- `get_user_feature_flags(onyx_user_id)` - Get all flags for a user
- `check_feature_flag(onyx_user_id, feature_name)` - Check if a feature is enabled
- `update_feature_flag(onyx_user_id, feature_name, is_enabled)` - Update a single flag
- `bulk_update_feature_flag(user_emails, feature_name, is_enabled)` - Bulk update
- `get_all_users_feature_flags()` - Get all users and their flags (admin)
- `get_available_features()` - Get list of all available features

#### 5. API Endpoints
```
GET    /api/custom-projects-backend/admin/users/feature-flags
PATCH  /api/custom-projects-backend/admin/users/{user_email}/feature-flags
PATCH  /api/custom-projects-backend/admin/users/feature-flags/bulk
GET    /api/custom-projects-backend/users/me/feature-flags
GET    /api/custom-projects-backend/admin/feature-flags/available
```

### Frontend Components

#### 1. Admin Dashboard
- **Location**: `custom_extensions/frontend/src/app/admin/main/page.tsx`
- **Tabs**: Credits, Analytics, Features
- **Features Tab**: Complete feature flag management interface

#### 2. useFeatureFlags Hook
- **Location**: `custom_extensions/frontend/src/hooks/useFeatureFlags.ts`
- **Purpose**: Fetch and manage current user's feature flags
- **Returns**: `{ featureFlags, loading, error, isFeatureEnabled, refresh }`

#### 3. FeatureFlagWrapper Component
- **Location**: `custom_extensions/frontend/src/components/FeatureFlagWrapper.tsx`
- **Purpose**: Conditionally render content based on feature flags
- **Props**: `featureName`, `children`, `fallback`, `showWhenDisabled`

## Usage Examples

### 1. Basic Feature Flag Usage
```tsx
import FeatureFlagWrapper from '../components/FeatureFlagWrapper';

function MyComponent() {
  return (
    <div>
      <h1>My App</h1>
      
      <FeatureFlagWrapper featureName="settings_modal">
        <button>Open Settings</button>
      </FeatureFlagWrapper>
      
      <FeatureFlagWrapper featureName="ai_image_generation">
        <button>Generate AI Image</button>
      </FeatureFlagWrapper>
    </div>
  );
}
```

### 2. With Fallback Content
```tsx
<FeatureFlagWrapper 
  featureName="analytics_dashboard"
  fallback={<div>Analytics not available</div>}
>
  <AnalyticsDashboard />
</FeatureFlagWrapper>
```

### 3. Show Content When Feature is Disabled
```tsx
<FeatureFlagWrapper 
  featureName="premium_features"
  showWhenDisabled={true}
>
  <div>Upgrade to access premium features</div>
</FeatureFlagWrapper>
```

### 4. Using the Hook Directly
```tsx
import useFeatureFlags from '../hooks/useFeatureFlags';

function MyComponent() {
  const { isFeatureEnabled, loading } = useFeatureFlags();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {isFeatureEnabled('advanced_editing') && (
        <AdvancedEditingTools />
      )}
    </div>
  );
}
```

## Admin Dashboard Features

### Features Tab
- **User Search**: Filter users by name or email
- **Feature Toggle**: Individual toggle switches for each feature per user
- **Bulk Operations**: Update multiple users at once
- **Real-time Updates**: Changes reflect immediately in the UI

### Bulk Update Modal
- **Feature Selection**: Choose from available features
- **User Selection**: Multi-select users to update
- **Action Selection**: Enable or disable the feature
- **Progress Feedback**: Shows update progress and results

## Available Features

1. **settings_modal** - Advanced settings and configuration options
2. **quality_tier_display** - Quality tier options in the UI
3. **ai_image_generation** - AI-powered image generation
4. **advanced_editing** - Advanced editing capabilities
5. **analytics_dashboard** - Analytics and usage statistics
6. **custom_rates** - Custom pricing rate settings
7. **folder_management** - Folder organization features
8. **bulk_operations** - Bulk actions on multiple items

## Database Migration

The feature flags table is automatically created during application startup in `main.py`:

```python
@app.on_event("startup")
async def startup_event():
    # ... existing code ...
    
    # Feature Flags Table
    await connection.execute("""
        CREATE TABLE IF NOT EXISTS user_feature_flags (
            id SERIAL PRIMARY KEY,
            onyx_user_id VARCHAR(255) NOT NULL,
            feature_name VARCHAR(100) NOT NULL,
            is_enabled BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(onyx_user_id, feature_name)
        );
    """)
    await connection.execute("CREATE INDEX IF NOT EXISTS idx_user_feature_flags_onyx_user_id ON user_feature_flags(onyx_user_id);")
    await connection.execute("CREATE INDEX IF NOT EXISTS idx_user_feature_flags_feature_name ON user_feature_flags(feature_name);")
```

## Security Considerations

1. **Admin Authentication**: All admin endpoints require admin privileges
2. **User Isolation**: Users can only access their own feature flags
3. **Graceful Degradation**: Disabled features don't break the application
4. **Default Behavior**: Features default to enabled if no flag is set

## Error Handling

### Backend
- Database errors are logged and return appropriate HTTP status codes
- Missing feature flags default to enabled (true)
- Invalid requests return 400 Bad Request

### Frontend
- Network errors show user-friendly messages
- Loading states prevent premature rendering
- Fallback content ensures graceful degradation

## Performance Considerations

1. **Indexing**: Database indexes on `onyx_user_id` and `feature_name`
2. **Caching**: Feature flags are fetched once per session
3. **Bulk Operations**: Efficient batch updates for multiple users
4. **Lazy Loading**: Feature flags are only fetched when needed

## Testing

### Backend Testing
```python
# Test feature flag service
async def test_feature_flag_service():
    service = FeatureFlagService(pool)
    
    # Test individual flag operations
    await service.update_feature_flag("user@example.com", "settings_modal", True)
    assert await service.check_feature_flag("user@example.com", "settings_modal") == True
    
    # Test bulk operations
    results = await service.bulk_update_feature_flag(
        ["user1@example.com", "user2@example.com"], 
        "ai_image_generation", 
        False
    )
    assert all(results.values())
```

### Frontend Testing
```tsx
// Test FeatureFlagWrapper
import { render, screen } from '@testing-library/react';
import FeatureFlagWrapper from './FeatureFlagWrapper';

test('renders content when feature is enabled', () => {
  render(
    <FeatureFlagWrapper featureName="settings_modal">
      <button>Settings</button>
    </FeatureFlagWrapper>
  );
  
  expect(screen.getByText('Settings')).toBeInTheDocument();
});
```

## Deployment

1. **Database Migration**: The table is created automatically on startup
2. **Environment Variables**: Ensure `CUSTOM_PROJECTS_DATABASE_URL` is set
3. **Admin Access**: Verify admin user permissions for the dashboard
4. **Feature Rollout**: Use the admin dashboard to gradually enable features

## Monitoring

### Key Metrics
- Feature flag usage by feature
- User adoption of new features
- Performance impact of feature flags
- Error rates for disabled features

### Logging
- Feature flag changes are logged with user and timestamp
- Bulk operations log success/failure counts
- API errors are logged with full context

## Future Enhancements

1. **Feature Flag Analytics**: Track feature usage and adoption
2. **A/B Testing**: Support for experimental features
3. **Time-based Flags**: Schedule feature enablement/disablement
4. **User Groups**: Apply flags to user groups instead of individuals
5. **Feature Dependencies**: Handle feature interdependencies
6. **Audit Trail**: Complete history of feature flag changes

## Support

For issues or questions about the feature management system:
1. Check the admin dashboard for current feature flag states
2. Review the application logs for error messages
3. Verify database connectivity and permissions
4. Test feature flags in a development environment first 