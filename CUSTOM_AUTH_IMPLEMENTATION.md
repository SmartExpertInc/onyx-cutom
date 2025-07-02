# Custom Authentication System Implementation

This document describes the complete implementation of a custom authentication system for the Onyx platform that integrates with the existing Onyx authentication while storing additional user profile data.

## Overview

The custom authentication system provides:
- Custom login and registration pages with additional user fields (first name, last name)
- Integration with Onyx's existing authentication system
- Storage of additional user profile data in a separate database table
- Protected routes that require authentication
- User profile management

## Architecture

### Backend Components

#### 1. Database Schema
- **Table**: `custom_user_profiles`
  - `id`: Primary key
  - `onyx_user_id`: UUID reference to Onyx user
  - `first_name`: User's first name
  - `last_name`: User's last name
  - `display_name`: Computed field (first_name + last_name)
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

#### 2. API Endpoints
- `POST /api/custom/auth/register` - Register new user
- `POST /api/custom/auth/login` - Login user
- `GET /api/custom/auth/profile` - Get user profile
- `PUT /api/custom/auth/profile` - Update user profile

#### 3. Authentication Flow
1. **Registration**: 
   - Create user in Onyx system
   - Store additional profile data in custom database
   - Return combined user data

2. **Login**:
   - Authenticate with Onyx system
   - Retrieve profile data from custom database
   - Return combined user data

### Frontend Components

#### 1. Authentication Pages
- `/auth/login` - Custom login page
- `/auth/register` - Custom registration page

#### 2. Authentication Hook
- `useAuth()` - React hook for managing authentication state
- Provides login, register, logout, and profile update functions

#### 3. Protected Routes
- `ProtectedRoute` component that redirects to login if not authenticated
- Applied to all pages that require authentication

## Implementation Details

### Backend Implementation

#### Database Migration
The custom user profiles table is created automatically during backend startup:

```sql
CREATE TABLE IF NOT EXISTS custom_user_profiles (
    id SERIAL PRIMARY KEY,
    onyx_user_id UUID NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Authentication Service Functions
- `create_onyx_user()` - Creates user in Onyx system
- `authenticate_with_onyx()` - Authenticates with Onyx system
- `create_user_profile()` - Creates profile in custom database
- `get_user_profile()` - Retrieves user profile
- `update_user_profile()` - Updates user profile

#### API Integration
The system integrates with Onyx's API endpoints:
- `/auth/register` - For user creation
- `/auth/login` - For user authentication

### Frontend Implementation

#### Authentication Hook (`useAuth`)
```typescript
interface User {
  onyx_user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, first_name: string, last_name: string) => Promise<User>;
  logout: () => void;
  updateProfile: (first_name: string, last_name: string) => Promise<User>;
}
```

#### Protected Route Component
```typescript
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
```

### Nginx Configuration

The nginx configuration has been updated to route custom authentication requests:

```nginx
# Custom extensions backend API routes
location ~ ^/api/custom-projects-backend(/.*)?$ {
    rewrite ^/api/custom-projects-backend(/.*)$ $1 break;
    proxy_pass http://custom_backend;
}

# Custom extensions frontend routes
location ~ ^/(auth|projects|create|editor|pipelines|add-to-project|admin)(/.*)?$ {
    proxy_pass http://custom_frontend;
}
```

### Docker Compose Configuration

Added custom services to the docker-compose file:

```yaml
# Custom Extensions Backend
custom_backend:
  build:
    context: ../../custom_extensions/backend
    dockerfile: Dockerfile
  environment:
    - CUSTOM_PROJECTS_DATABASE_URL=${CUSTOM_PROJECTS_DATABASE_URL:-postgresql://postgres:postgres@relational_db:5432/custom_projects}
    - ONYX_API_SERVER_URL=http://api_server:8080
    - ONYX_SESSION_COOKIE_NAME=${ONYX_SESSION_COOKIE_NAME:-fastapiusersauth}

# Custom Extensions Frontend
custom_frontend:
  build:
    context: ../../custom_extensions/frontend
    dockerfile: Dockerfile
  environment:
    - NEXT_PUBLIC_CUSTOM_BACKEND_URL=http://custom_backend:8000
    - NEXT_PUBLIC_ONYX_API_URL=http://api_server:8080
```

## Usage

### For Users

1. **Registration**:
   - Navigate to `/auth/register`
   - Fill in email, password, first name, and last name
   - Account is created in both Onyx and custom systems

2. **Login**:
   - Navigate to `/auth/login`
   - Enter email and password
   - Access to protected pages is granted

3. **Profile Management**:
   - User data is displayed in the header
   - Profile can be updated via API endpoints

### For Developers

#### Adding Authentication to New Pages
```typescript
import ProtectedRoute from '../components/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>Protected content here</div>
    </ProtectedRoute>
  );
}
```

#### Using User Data
```typescript
import { useAuth } from '../hooks/useAuth';

export default function MyComponent() {
  const { user } = useAuth();
  
  return (
    <div>
      Welcome, {user?.first_name}!
    </div>
  );
}
```

## Security Considerations

1. **Session Management**: Uses Onyx's existing session management
2. **Password Security**: Passwords are handled by Onyx's secure authentication
3. **Data Validation**: Input validation on both frontend and backend
4. **CORS**: Proper CORS configuration for cross-origin requests
5. **HTTPS**: All communication should be over HTTPS in production

## Environment Variables

### Backend
- `CUSTOM_PROJECTS_DATABASE_URL`: Database connection string
- `ONYX_API_SERVER_URL`: Onyx API server URL
- `ONYX_SESSION_COOKIE_NAME`: Session cookie name

### Frontend
- `NEXT_PUBLIC_CUSTOM_BACKEND_URL`: Custom backend API URL
- `NEXT_PUBLIC_ONYX_API_URL`: Onyx API URL

## Deployment

1. **Database Setup**: Ensure the custom database is created and accessible
2. **Environment Variables**: Set all required environment variables
3. **Docker Compose**: Use the updated docker-compose file with custom services
4. **Nginx**: Ensure nginx configuration includes custom service routing

## Troubleshooting

### Common Issues

1. **Authentication Failures**:
   - Check Onyx API server connectivity
   - Verify session cookie configuration
   - Ensure database connection is working

2. **Routing Issues**:
   - Verify nginx configuration
   - Check custom service URLs
   - Ensure all services are running

3. **Database Issues**:
   - Verify database connection string
   - Check table creation during startup
   - Ensure proper permissions

### Debug Mode

Enable debug logging by setting:
```bash
LOG_LEVEL=debug
```

## Future Enhancements

1. **Email Verification**: Add email verification for new registrations
2. **Password Reset**: Implement password reset functionality
3. **Social Login**: Add OAuth providers (Google, GitHub, etc.)
4. **Profile Pictures**: Add profile picture upload functionality
5. **Two-Factor Authentication**: Implement 2FA for enhanced security
6. **Audit Logging**: Add comprehensive audit logging for security events

## Support

For issues or questions regarding the custom authentication system:
1. Check the logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all services are running and accessible
4. Review the nginx configuration for routing issues 