# Node.js Docker Installation Required - Critical Fix

**Date:** October 8, 2025  
**Status:** 🔴 **CRITICAL** - Remotion Cannot Run Without Node.js  
**Issue:** FileNotFoundError: [Errno 2] No such file or directory: 'npx'

---

## **Problem Statement**

The backend Docker container is running **Python only** and does **NOT have Node.js installed**. This makes the entire Remotion video generation pipeline non-functional.

### **Evidence from Logs:**
```
ERROR:main:🐛 [DEBUG_RENDER] Error: [Errno 2] No such file or directory: 'npx'
FileNotFoundError: [Errno 2] No such file or directory: 'npx'
Working directory: /
```

**Impact:**
- ❌ Debug render feature: **100% broken**
- ❌ Normal video generation with Remotion: **100% broken**
- ❌ Any `npx remotion render` command: **Cannot execute**

---

## **Root Cause**

### **Current Docker Container:**
```dockerfile
FROM python:3.9
# Only Python installed!
# No Node.js, no npm, no npx
```

### **Required Stack:**
```
Python 3.9     ✅ Installed
Node.js 18.x   ❌ NOT INSTALLED (CRITICAL!)
npm            ❌ NOT INSTALLED
npx            ❌ NOT INSTALLED
Remotion       ❌ NOT INSTALLED
```

---

## **Solution: Update Dockerfile**

### **Option 1: Add Node.js to Existing Python Container (RECOMMENDED)**

**Modify your `custom_backend` Dockerfile:**

```dockerfile
FROM python:3.9

# Install Node.js 18.x (LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Verify Node.js installation
RUN node --version && npm --version && npx --version

# Set up application directory
WORKDIR /app

# Copy and install Python dependencies first (for better caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Install Remotion dependencies
WORKDIR /app/video_compositions
RUN npm install

# Return to app directory
WORKDIR /app

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
```

---

### **Option 2: Use Multi-Stage Build (MORE EFFICIENT)**

```dockerfile
# Stage 1: Node.js base
FROM node:18 AS node_base

# Stage 2: Python with Node.js
FROM python:3.9

# Copy Node.js and npm from node_base
COPY --from=node_base /usr/local/bin/node /usr/local/bin/
COPY --from=node_base /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm && \
    ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Verify installation
RUN node --version && npm --version && npx --version

# Set up application
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Install Remotion dependencies
WORKDIR /app/video_compositions
RUN npm install --production

# Return to app directory
WORKDIR /app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
```

---

### **Option 3: Use Official Python+Node Image (EASIEST)**

```dockerfile
# Use an image that has both Python and Node.js
FROM nikolaik/python-nodejs:python3.9-nodejs18

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Install Remotion dependencies
WORKDIR /app/video_compositions
RUN npm install

# Return to app directory
WORKDIR /app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
```

---

## **Step-by-Step Installation Instructions**

### **Step 1: Find Your Dockerfile**

```bash
# Look for the custom_backend Dockerfile
find . -name "Dockerfile" -path "*custom*backend*"
# OR
find . -name "docker-compose.yml"
```

**Likely location:**
- `onyx-cutom/custom_extensions/backend/Dockerfile`
- `onyx-cutom/docker-compose.yml` (check for `custom_backend` service)

---

### **Step 2: Update Dockerfile**

Choose one of the 3 options above and update your Dockerfile.

**Recommended:** Option 1 (Add Node.js to Python image) for simplicity.

---

### **Step 3: Rebuild Docker Container**

```bash
# Navigate to docker-compose directory
cd onyx-cutom/

# Stop the running container
docker-compose stop custom_backend

# Rebuild with no cache (important!)
docker-compose build --no-cache custom_backend

# Start the container
docker-compose up -d custom_backend

# Check logs
docker-compose logs -f custom_backend
```

---

### **Step 4: Verify Installation**

```bash
# Test Node.js
docker exec custom_backend-1 node --version
# Expected output: v18.x.x

# Test npm
docker exec custom_backend-1 npm --version
# Expected output: 9.x.x

# Test npx
docker exec custom_backend-1 npx --version
# Expected output: 9.x.x

# Test Remotion
docker exec custom_backend-1 npx remotion --version
# Expected output: 4.0.x
```

---

### **Step 5: Verify Remotion Dependencies**

```bash
# Check if node_modules exists
docker exec custom_backend-1 ls /app/video_compositions/node_modules/@remotion
# Expected: cli, player, and other Remotion packages

# If not, install manually:
docker exec custom_backend-1 sh -c "cd /app/video_compositions && npm install"
```

---

### **Step 6: Test Debug Render**

1. Open video lesson editor in browser
2. Click orange "Debug" button
3. Check backend logs for:
   ```
   INFO: 🐛 [DEBUG_RENDER] Executing command: npx remotion render...
   INFO: 🐛 [DEBUG_RENDER] ✅ Remotion render completed successfully
   INFO: 🐛 [DEBUG_RENDER] ✅ File size validated: 1.23 MB
   ```
4. Verify video downloads and plays

---

## **Alternative: Docker Compose Service**

If modifying the main Dockerfile is complex, create a separate Remotion rendering service:

```yaml
# docker-compose.yml
services:
  custom_backend:
    # ... existing Python service
    
  remotion_renderer:
    image: node:18
    working_dir: /app
    volumes:
      - ./custom_extensions/backend/video_compositions:/app/video_compositions
      - ./custom_extensions/backend/output:/app/output
    command: tail -f /dev/null  # Keep running
    networks:
      - backend

# Then call from Python:
subprocess.run([
    "docker", "exec", "remotion_renderer",
    "npx", "remotion", "render", ...
])
```

**Pros:** Doesn't modify existing container  
**Cons:** More complex, slower execution

---

## **Verification Tests**

### **Test 1: Node.js Available**
```bash
docker exec custom_backend-1 which node
# Expected: /usr/local/bin/node

docker exec custom_backend-1 which npx
# Expected: /usr/local/bin/npx
```

### **Test 2: Remotion CLI Works**
```bash
docker exec custom_backend-1 npx remotion --help
# Should show Remotion CLI help text
```

### **Test 3: Debug Render End-to-End**
```bash
# Click Debug button in UI
# Check logs:
docker-compose logs --tail=50 custom_backend | grep DEBUG_RENDER

# Should see:
# INFO: ✅ Remotion render completed successfully
# INFO: ✅ File size validated: X.XX MB
```

---

## **Common Issues After Installation**

### **Issue: "Cannot find module '@remotion/cli'"**

**Solution:**
```bash
docker exec custom_backend-1 sh -c "cd /app/video_compositions && npm install"
```

### **Issue: "EACCES: permission denied"**

**Solution:** Add proper permissions in Dockerfile:
```dockerfile
RUN chmod -R 777 /app/output
RUN chmod -R 777 /app/video_compositions
```

### **Issue: "Module not found: Can't resolve 'react'"**

**Solution:** Install React dependencies:
```bash
docker exec custom_backend-1 sh -c "cd /app/video_compositions && npm install react react-dom"
```

---

## **Performance Considerations**

### **Image Size Impact:**
- Python 3.9 image: ~900 MB
- Node.js installation: ~200 MB additional
- **Total:** ~1.1 GB (acceptable)

### **Build Time:**
- First build: 10-15 minutes (downloads Node.js)
- Subsequent builds: 2-3 minutes (cached layers)

### **Runtime Performance:**
- No impact (Node.js only used for rendering)
- Python API remains fast
- Remotion render: 10-30 seconds per video

---

## **Dockerfile Example (Complete)**

```dockerfile
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ffmpeg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18.x LTS
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Verify Node.js installation
RUN echo "Node.js version:" && node --version && \
    echo "npm version:" && npm --version && \
    echo "npx version:" && npx --version

# Set up application directory
WORKDIR /app

# Copy Python requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create output directories with proper permissions
RUN mkdir -p /app/output/presentations /app/output/clean_videos && \
    chmod -R 777 /app/output

# Install Remotion dependencies
WORKDIR /app/video_compositions
RUN npm install --production && \
    npx remotion --version

# Return to app root
WORKDIR /app

# Expose port
EXPOSE 8001

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

---

## **Checklist for Successful Installation**

- [ ] Dockerfile updated with Node.js installation
- [ ] Docker image rebuilt with `--no-cache`
- [ ] Container started successfully
- [ ] `node --version` returns v18.x.x
- [ ] `npm --version` returns 9.x.x
- [ ] `npx --version` returns 9.x.x
- [ ] `/app/video_compositions/node_modules` exists
- [ ] `npx remotion --version` returns 4.0.x
- [ ] Debug button test passes
- [ ] Video file > 100KB downloaded
- [ ] Video plays in media player

---

## **Summary**

### **Current State:**
🔴 **BROKEN** - Node.js not installed, Remotion cannot run

### **After Fix:**
✅ **FUNCTIONAL** - Node.js installed, Remotion renders videos

### **Time Required:**
- Dockerfile update: 5 minutes
- Docker rebuild: 10 minutes
- Verification: 5 minutes
- **Total: ~20 minutes**

### **Critical Files to Update:**
1. `Dockerfile` (or `docker-compose.yml`)
2. **That's it!** (Code fixes already applied)

**Once Node.js is installed, all the Remotion code will work correctly.** 🚀

