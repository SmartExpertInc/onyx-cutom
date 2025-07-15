# Local Development + Codespaces Testing Guide

This guide explains how the second developer can work locally while using Codespaces for testing the full stack.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Second Dev    │    │   GitHub Repo   │    │   Codespaces    │
│   Local Setup   │◄──►│   (GitHub)      │◄──►│   (Testing)     │
│                 │    │                 │    │                 │
│ - Local IDE     │    │ - Main branch   │    │ - Full stack    │
│ - Local testing │    │ - Feature       │    │ - Integration   │
│ - Git commits   │    │   branches      │    │ - E2E testing   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Setup for Local Development

### **1. Local Environment Setup**

The second developer can set up a local development environment:

```bash
# Clone the repository
git clone https://github.com/your-username/onyx-cutom.git
cd onyx-cutom

# Install dependencies
# Backend (Python)
cd backend
pip install -r requirements.txt
pip install -e .

# Frontend (Node.js)
cd ../web
npm install

# Custom extensions
cd ../custom_extensions/backend
pip install -r requirements.txt

cd ../frontend
npm install
```

### **2. Local Development Workflow**

```bash
# 1. Make changes locally
# Edit files in your preferred IDE (VS Code, Cursor, etc.)

# 2. Test locally (if possible)
# Run backend tests
cd backend
pytest

# Run frontend tests
cd ../web
npm test

# 3. Commit and push
git add .
git commit -m "Add new feature"
git push origin main
```

### **3. Codespaces for Full Stack Testing**

```bash
# 1. Open Codespaces
# Go to GitHub → Code → Codespaces → Create codespace

# 2. Pull latest changes
git pull origin main

# 3. Run setup (if needed)
./setup-codespace-manual.sh

# 4. Configure API keys
nano deployment/docker_compose/.env
# Add your API keys

# 5. Start full stack
./start-dev.sh

# 6. Test at http://localhost:8088
```

## 📋 Daily Workflow

### **Morning Routine:**

```bash
# Local development
git pull origin main
# Start working on features locally

# When ready to test full stack
# Open Codespaces and test there
```

### **Development Cycle:**

1. **Local Development:**
   ```bash
   # Make changes locally
   # Run unit tests
   # Commit changes
   git add .
   git commit -m "Add feature X"
   git push origin main
   ```

2. **Codespaces Testing:**
   ```bash
   # Open Codespaces
   git pull origin main
   ./start-dev.sh
   # Test full integration at http://localhost:8088
   ```

3. **Iterate:**
   ```bash
   # If issues found, fix locally
   # Push changes
   # Test again in Codespaces
   ```

## 🛠️ Local Development Commands

### **Backend Development:**
```bash
cd backend

# Run backend server
uvicorn onyx.main:app --reload --host 0.0.0.0 --port 8080

# Run tests
pytest

# Run specific test
pytest tests/test_specific_feature.py

# Check code quality
black .
flake8 .
isort .
```

### **Frontend Development:**
```bash
cd web

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Check code quality
npm run lint
```

### **Custom Extensions:**
```bash
cd custom_extensions/backend

# Run backend
uvicorn main:app --reload --host 0.0.0.0 --port 8001

cd ../frontend

# Run frontend
npm run dev
```

## 🔧 Hybrid Development Strategies

### **Strategy 1: Local for Development, Codespaces for Testing**

**Pros:**
- Fast local development
- Full stack testing in Codespaces
- Cost effective (only pay for testing time)

**Cons:**
- Need to sync between environments
- Some features only testable in full stack

### **Strategy 2: Local for Simple Changes, Codespaces for Complex Features**

**Use Local For:**
- Bug fixes
- Simple UI changes
- Backend logic changes
- Unit tests

**Use Codespaces For:**
- Integration testing
- Database changes
- AI feature testing
- OAuth testing
- Full user workflows

### **Strategy 3: Feature-based Approach**

```bash
# For simple features
# Work locally → test locally → push → test in Codespaces

# For complex features
# Work in Codespaces → test full stack → push
```

## 📊 Cost Optimization

### **Local Development Benefits:**
- **No costs** for development time
- **Faster iteration** cycles
- **Better IDE integration**
- **Offline development** possible

### **Codespaces Usage:**
- **Only for testing** (1-2 hours/day)
- **Full stack validation**
- **Integration testing**
- **Production-like environment**

## 🎯 Best Practices

### **For Local Development:**
1. **Use virtual environments** for Python
2. **Keep dependencies updated**
3. **Run tests frequently**
4. **Use pre-commit hooks**
5. **Commit often** with descriptive messages

### **For Codespaces Testing:**
1. **Test before pushing** to main
2. **Use the same API keys** as dev server
3. **Test full user workflows**
4. **Check all services** are working
5. **Stop environment** when done

### **For Both:**
1. **Pull latest changes** before starting
2. **Communicate** about breaking changes
3. **Use feature branches** for major changes
4. **Test integration** points
5. **Document** any environment-specific issues

## 🔄 Workflow Examples

### **Example 1: Backend API Change**

```bash
# Local development
cd backend
# Edit API endpoint
# Run tests
pytest tests/test_api.py
# Commit and push
git add .
git commit -m "Add new API endpoint"
git push origin main

# Codespaces testing
# Open Codespaces
git pull origin main
./start-dev.sh
# Test API at http://localhost:8080/docs
# Test frontend integration at http://localhost:8088
```

### **Example 2: Frontend UI Change**

```bash
# Local development
cd web
# Edit React component
# Run tests
npm test
# Test locally
npm run dev
# Commit and push
git add .
git commit -m "Update UI component"
git push origin main

# Codespaces testing
# Open Codespaces
git pull origin main
./start-dev.sh
# Test full UI at http://localhost:8088
```

## 🚨 Troubleshooting

### **Local Issues:**
```bash
# Python environment issues
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Node.js issues
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Git issues
git status
git stash  # if you have uncommitted changes
git pull origin main
```

### **Codespaces Issues:**
```bash
# Scripts not found
./setup-codespace-manual.sh

# Environment issues
./stop-dev.sh
./start-dev.sh

# API key issues
nano deployment/docker_compose/.env
# Check all API keys are set
```

This hybrid approach gives the second developer the best of both worlds: fast local development and comprehensive testing in a production-like environment! 