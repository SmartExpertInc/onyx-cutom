# Daily Development Workflow Guide

This guide explains how the daily development workflow should work between you (the main developer) and your second developer using GitHub Codespaces.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Your Local    │    │   GitHub Repo   │    │  Second Dev     │
│   Development   │◄──►│   (GitHub)      │◄──►│  (Codespaces)   │
│                 │    │                 │    │                 │
│ - Cursor IDE    │    │ - Main branch   │    │ - Cloud IDE     │
│ - Local testing │    │ - Feature       │    │ - Full stack    │
│ - Git commits   │    │   branches      │    │ - Testing       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔄 Daily Development Workflow

### **Option 1: Traditional Workflow (Recommended)**

This is the workflow you're currently using:

#### **Your Daily Workflow:**
1. **Make changes** in your local Cursor IDE
2. **Test locally** (if needed)
3. **Commit and push** to GitHub
4. **Pull on dev server** and restart containers
5. **Test on dev server** at `https://ml-dev.contentbuilder.ai`

#### **Second Developer's Daily Workflow:**
1. **Pull latest changes** from GitHub
2. **Make changes** in Codespaces
3. **Test in Codespaces** at `http://localhost:8088`
4. **Commit and push** to GitHub
5. **You pull and test** on dev server

### **Option 2: Parallel Development Workflow**

For when you both work simultaneously:

#### **Branch-based Workflow:**
1. **Create feature branches** for each developer
2. **Work independently** on different features
3. **Merge to main** when features are complete
4. **Test on dev server** after merging

## 🚀 Getting Started (Second Developer)

### **First Time Setup:**

1. **Run the manual setup script:**
   ```bash
   chmod +x setup-codespace-manual.sh
   ./setup-codespace-manual.sh
   ```

2. **Configure API keys:**
   ```bash
   # Edit the .env file
   nano deployment/docker_compose/.env
   
   # Add your API keys (copy from your dev server):
   OPENAI_API_KEY=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
   OPENAI_API_KEY_FALLBACK=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
   COHERE_API_KEY=JeFpHZBT5evp3mrWDST69FqlVVJT0YBd28bFmlrY
   COHERE_API_KEY_FALLBACK=amNraVTsUHbyAYmM5aFrc5K9i1UBU9k0EQ66ndLm
   OAUTH_CLIENT_ID=665931152659-gkcgmvecjvednlaamvj4p2i30tvvib4f.apps.googleusercontent.com
   OAUTH_CLIENT_SECRET=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
   ```

3. **Start the development environment:**
   ```bash
   ./start-dev.sh
   ```

4. **Access the application:**
   - Web Interface: `http://localhost:8088`
   - API Server: `http://localhost:8080`

### **Daily Startup:**

```bash
# Pull latest changes
git pull origin main

# Start the environment
./start-dev.sh

# Access at http://localhost:8088
```

## 📋 Detailed Workflow Examples

### **Scenario 1: You're Working on Backend, Second Dev on Frontend**

#### **Your Workflow:**
```bash
# 1. Make backend changes in Cursor
# 2. Test locally (optional)
# 3. Commit and push
git add backend/
git commit -m "Add new API endpoint for user preferences"
git push origin main

# 4. Pull on dev server
ssh your-dev-server
cd /path/to/onyx
git pull origin main
docker-compose restart api_server

# 5. Test on dev server
# Visit https://ml-dev.contentbuilder.ai
```

#### **Second Developer's Workflow:**
```bash
# 1. Pull your changes
git pull origin main

# 2. Make frontend changes in Codespaces
# Edit web/ components

# 3. Test in Codespaces
# Visit http://localhost:8088

# 4. Commit and push
git add web/
git commit -m "Update frontend to use new API endpoint"
git push origin main

# 5. You'll pull and test on dev server
```

### **Scenario 2: Both Working on Same Feature**

#### **Branch-based Workflow:**
```bash
# You create a feature branch
git checkout -b feature/user-dashboard
git push origin feature/user-dashboard

# Second developer works on the same branch
git checkout feature/user-dashboard
git pull origin feature/user-dashboard

# Both make changes and push
git add .
git commit -m "Add user dashboard components"
git push origin feature/user-dashboard

# When ready, merge to main
git checkout main
git merge feature/user-dashboard
git push origin main
```

## 🛠️ Development Commands

### **Essential Commands:**

```bash
# Start development environment
./start-dev.sh

# Stop development environment
./stop-dev.sh

# View logs
./logs-dev.sh

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

### **Git Workflow Commands:**

```bash
# Pull latest changes
git pull origin main

# Check status
git status

# Create feature branch
git checkout -b feature/your-feature-name

# Switch branches
git checkout main

# View commit history
git log --oneline -10
```

## 🔧 Troubleshooting

### **Common Issues:**

1. **Scripts not found:**
   ```bash
   # Run manual setup
   ./setup-codespace-manual.sh
   ```

2. **Port conflicts:**
   ```bash
   # Check what's using the port
   lsof -i :8088
   
   # Stop conflicting services
   ./stop-dev.sh
   ```

3. **Database issues:**
   ```bash
   # Restart database
   cd deployment/docker_compose
   docker-compose restart relational_db
   ```

4. **API keys not working:**
   ```bash
   # Check if keys are set
   grep OPENAI_API_KEY deployment/docker_compose/.env
   
   # Re-enable full features
   ./enable-full-features.sh
   ```

## 📊 Best Practices

### **For You (Main Developer):**
1. **Always test on dev server** after pulling changes
2. **Use descriptive commit messages**
3. **Review second developer's code** before merging
4. **Keep dev server updated** with latest changes
5. **Communicate about breaking changes**

### **For Second Developer:**
1. **Pull latest changes** before starting work
2. **Test thoroughly** in Codespaces before pushing
3. **Use feature branches** for major changes
4. **Communicate about API changes**
5. **Keep commits atomic** and well-described

### **For Both:**
1. **Regular communication** about what you're working on
2. **Avoid conflicts** by working on different areas
3. **Test integration** when features interact
4. **Document changes** in commit messages
5. **Use consistent coding standards**

## 🎯 Workflow Summary

### **Daily Routine:**

1. **Morning:**
   - Pull latest changes
   - Start development environment
   - Check for any issues

2. **During Development:**
   - Make changes
   - Test frequently
   - Commit regularly

3. **End of Day:**
   - Push changes
   - Update main developer
   - Stop environment to save resources

### **Communication:**
- **Slack/Discord** for quick questions
- **GitHub Issues** for bug reports
- **Pull Requests** for code reviews
- **Daily standup** (if needed)

This workflow ensures smooth collaboration while maintaining the stability of your development environment! 