# GitHub Codespaces Setup Guide

This guide explains how to set up and use GitHub Codespaces for collaborative development on the Onyx project.

## Overview

GitHub Codespaces provides a cloud-based development environment that allows your second developer to work on the project without needing to set up the entire stack locally. The environment includes:

- **5 Docker containers** running the full Onyx stack
- **Pre-configured development tools** (Python, Node.js, Docker, etc.)
- **Port forwarding** for all services
- **Shared development environment** with consistent tooling

## Quick Start for Second Developer

### 1. Access the Codespace

1. Go to the GitHub repository
2. Click the green "Code" button
3. Select the "Codespaces" tab
4. Click "Create codespace on main" (or select a specific branch)
5. Wait for the environment to build (5-10 minutes)

### 2. Initial Setup

Once the Codespace loads, the setup script will automatically:
- Install all necessary development tools
- Create a `.env` file with Codespaces-specific configuration
- Set up pre-commit hooks
- Create convenience scripts

### 3. Start Development Environment

```bash
# Start the full Onyx stack
./start-dev.sh

# The application will be available at:
# - Web Interface: http://localhost:8088
# - API Server: http://localhost:8080
```

### 4. Configure API Keys

Edit `deployment/docker_compose/.env` and add your API keys (copy from your dev server):

```bash
# Required for AI features
OPENAI_API_KEY=your_openai_key_here
OPENAI_API_KEY_FALLBACK=your_fallback_key
COHERE_API_KEY=your_cohere_key_here
COHERE_API_KEY_FALLBACK=your_cohere_fallback

# OAuth configuration (if using OAuth)
OAUTH_CLIENT_ID=your_oauth_client_id
OAUTH_CLIENT_SECRET=your_oauth_client_secret
```

## Full Features Enabled by Default

### ✅ Enabled Features

The Codespaces environment now matches your dev server configuration with all features enabled:

| Feature | Setting | Purpose |
|---------|---------|---------|
| **Authentication** | `AUTH_TYPE=basic` | Full authentication with login |
| **Model Server** | `DISABLE_MODEL_SERVER=False` | AI model inference and embeddings |
| **Telemetry** | `DISABLE_TELEMETRY=false` | Usage analytics and monitoring |
| **AI Features** | All `DISABLE_*` flags set to `false` | Full AI-powered functionality |
| **OAuth** | Configured for Google OAuth | OAuth authentication flows |

### 🎯 Benefits of Full Features

1. **Production-like Environment**: Matches your dev server exactly
2. **Complete Testing**: Test all features including auth and AI
3. **Consistent Behavior**: Same functionality as your development environment
4. **Full Integration**: Test OAuth, AI features, and all connectors
5. **Real-world Scenarios**: Test actual user workflows

### 🔧 When to Use Minimal Features

Switch to minimal features when you need:

- **Faster Development**: Focus on code changes without AI overhead
- **Resource Optimization**: Reduce memory and CPU usage
- **Cost Control**: Avoid API calls during development
- **Quick Testing**: Test basic functionality without auth complexity

## Switching to Minimal Features (Optional)

### Quick Switch

```bash
# Switch to minimal features for faster development
./enable-minimal-features.sh

# Restart the environment to apply changes
./stop-dev.sh
./start-dev.sh
```

### Manual Configuration

Edit `deployment/docker_compose/.env` and change these settings:

```bash
# Disable authentication
AUTH_TYPE=disabled

# Disable AI features
DISABLE_MODEL_SERVER=True
DISABLE_GENERATIVE_AI=true
DISABLE_LLM_CHOOSE_SEARCH=true
DISABLE_LLM_QUERY_REPHRASE=true

# Disable telemetry
DISABLE_TELEMETRY=true

# Remove API keys (optional)
# GEN_AI_API_KEY=
# COHERE_API_KEY=
```

### When to Use Minimal Features

| Scenario | Benefits |
|----------|----------|
| **Code Development** | Faster startup, no API costs |
| **UI Testing** | Focus on interface without AI overhead |
| **Resource Constraints** | Lower memory and CPU usage |
| **Quick Iterations** | Faster restart cycles |

## Domain Configuration

### What Changed for Codespaces

**Original Configuration:**
- `WEB_DOMAIN=143.198.59.56` (your production domain)
- `WEB_DOMAIN_NO_PROTOCOL=143.198.59.56`

**Codespaces Configuration:**
- `WEB_DOMAIN=http://localhost:8088`
- `WEB_DOMAIN_NO_PROTOCOL=localhost:8088`

### Why This Works

1. **Port Forwarding**: GitHub Codespaces automatically forwards ports to your local machine
2. **Localhost Access**: The application runs on `localhost` within the Codespace
3. **No Domain Conflicts**: Each developer gets their own isolated environment

## Port Configuration

### Ports Used in Codespaces

| Service | Port | Purpose | Access |
|---------|------|---------|--------|
| Nginx | 8088 | Main web interface | `http://localhost:8088` |
| API Server | 8080 | Backend API | `http://localhost:8080` |
| PostgreSQL | 5432 | Main database | `localhost:5432` |
| Custom Projects DB | 5433 | Custom extensions DB | `localhost:5433` |
| Redis | 6379 | Cache | `localhost:6379` |
| Vespa Admin | 19071 | Search admin | `http://localhost:19071` |
| Vespa App | 8081 | Search application | `http://localhost:8081` |
| Model Server | 9000 | AI model server | `localhost:9000` |

### No Port Conflicts

- **Original Setup**: Uses specific ports on your LXD containers
- **Codespaces**: Uses the same ports but in isolated containers
- **No Changes Needed**: The port configuration remains the same

## Development Workflow

### Daily Development

1. **Start the environment:**
   ```bash
   ./start-dev.sh
   ```

2. **Make code changes** in the Codespace editor

3. **Test changes** at `http://localhost:8088`

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

5. **Stop when done:**
   ```bash
   ./stop-dev.sh
   ```

### Testing Different Features

```bash
# Test with full features (default - matches dev server)
./start-dev.sh

# Switch to minimal features for faster development
./enable-minimal-features.sh
./stop-dev.sh
./start-dev.sh

# Switch back to full features
./enable-full-features.sh
./stop-dev.sh
./start-dev.sh
```

### Useful Commands

```bash
# Start development environment
./start-dev.sh

# Stop development environment
./stop-dev.sh

# View logs
./logs-dev.sh

# Switch to minimal features
./enable-minimal-features.sh

# Switch back to full features
./enable-full-features.sh

# View specific service logs
cd deployment/docker_compose
docker-compose logs -f api_server

# Restart specific service
docker-compose restart web_server

# Access database
psql -h localhost -p 5432 -U postgres -d onyx_db

# Access Redis
redis-cli -h localhost -p 6379
```

## Environment Differences

### Development vs Production

| Aspect | Development (Codespaces) | Production (LXD) |
|--------|-------------------------|-------------------|
| Domain | `localhost:8088` | `143.198.59.56` |
| Database | Fresh PostgreSQL | Persistent PostgreSQL |
| Cache | Fresh Redis | Persistent Redis |
| Search | Fresh Vespa | Persistent Vespa |
| Model Server | Disabled by default | Enabled |
| Auth | Disabled by default | Enabled |
| Telemetry | Disabled | Enabled |

### Configuration Files

- **Main Config**: `deployment/docker_compose/docker-compose.yml`
- **Dev Overrides**: `deployment/docker_compose/docker-compose.dev.yml`
- **Environment**: `deployment/docker_compose/.env`

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   lsof -i :8088
   
   # Stop conflicting services
   docker-compose down
   ```

2. **Database connection issues:**
   ```bash
   # Check database status
   docker-compose ps relational_db
   
   # Restart database
   docker-compose restart relational_db
   ```

3. **Build failures:**
   ```bash
   # Clean and rebuild
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

4. **Memory issues:**
   - Codespaces provides 32GB RAM by default
   - If you need more, upgrade to a larger machine type

5. **AI features not working:**
   ```bash
   # Check if model server is enabled
   grep DISABLE_MODEL_SERVER .env
   
   # Check if API keys are configured
   grep OPENAI_API_KEY .env
   
   # Re-enable full features if needed
   ./enable-full-features.sh
   ```

### Getting Help

- Check the logs: `./logs-dev.sh`
- Review the `.env` configuration
- Ensure all API keys are properly set
- Check Docker container status: `docker-compose ps`

## Cost Considerations

### GitHub Codespaces Pricing

- **Free tier**: 60 hours/month for public repos
- **Paid tier**: $0.18/hour for 4-core, 8GB RAM
- **Large machines**: Available for complex workloads

### Cost Optimization

1. **Stop Codespaces when not in use**
2. **Use smaller machine types** for simple tasks
3. **Set auto-stop timers** to prevent idle charges
4. **Monitor usage** in GitHub billing settings
5. **Keep features enabled** by default (matches dev server)

## Security Considerations

### API Keys

- **Never commit API keys** to the repository
- **Use environment variables** in the `.env` file
- **Rotate keys regularly** for security

### Access Control

- **Repository permissions** control who can create Codespaces
- **Branch protection** prevents unauthorized changes
- **Code review** process for all changes

## Next Steps

1. **Invite your second developer** to the repository
2. **Share this guide** with them
3. **Set up API keys** in their Codespace (copy from dev server)
4. **Establish development workflow** and communication

## Support

For issues with:
- **GitHub Codespaces**: Check [GitHub Docs](https://docs.github.com/en/codespaces)
- **Onyx Application**: Check the [Onyx Documentation](https://docs.onyx.app/)
- **Docker Issues**: Check [Docker Documentation](https://docs.docker.com/)

---

**Note**: This setup provides a fully isolated development environment for your second developer while maintaining the same development experience as your dev server. All features are enabled by default to match your current development environment, but can be easily disabled for faster development when needed. 