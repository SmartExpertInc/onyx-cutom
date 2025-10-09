# 🚀 Deployment Instructions - Remotion Frontend Migration

**Last Updated:** October 8, 2025  
**Status:** Ready to Deploy ✅

---

## ✅ **WHAT WAS FIXED**

**Issue:** Docker build failed with:
```
npm error `npm ci` can only install packages when your package.json and 
package-lock.json are in sync.
npm error Missing: @remotion/cli@4.0.356 from lock file
```

**Solution:** Updated `package-lock.json` by running `npm install` locally.

---

## 📦 **FILES MODIFIED (Ready to Commit)**

### **1. Frontend Changes:**
```
✅ custom_extensions/frontend/package.json          (Added Remotion dependencies)
✅ custom_extensions/frontend/package-lock.json     (Updated with npm install)
✅ custom_extensions/frontend/video_compositions/   (Moved from backend)
   ├── src/Root.tsx
   ├── src/AvatarServiceSlide.tsx
   ├── package.json
   ├── tsconfig.json
   └── remotion.config.ts
```

### **2. Backend Changes:**
```
✅ custom_extensions/backend/Dockerfile            (Added Docker CLI, removed Remotion)
✅ custom_extensions/backend/main.py               (Updated to use docker exec)
```

### **3. Docker Compose:**
```
✅ deployment/docker_compose/docker-compose.dev.yml (Added volumes & Docker socket)
```

### **4. Documentation:**
```
✅ REMOTION_MOVED_TO_FRONTEND.md                   (Complete migration guide)
✅ QUICK_START_REMOTION_FRONTEND.md                (Quick reference)
✅ DEPLOYMENT_INSTRUCTIONS.md                      (This file)
```

---

## 🔄 **DEPLOYMENT STEPS**

### **Step 1: Commit All Changes**

```bash
cd d:\project\onyx-cutom

# Stage all modified files
git add custom_extensions/frontend/package.json
git add custom_extensions/frontend/package-lock.json
git add custom_extensions/frontend/video_compositions/
git add custom_extensions/backend/Dockerfile
git add custom_extensions/backend/main.py
git add deployment/docker_compose/docker-compose.dev.yml
git add REMOTION_MOVED_TO_FRONTEND.md
git add QUICK_START_REMOTION_FRONTEND.md
git add DEPLOYMENT_INSTRUCTIONS.md

# Commit
git commit -m "feat: Migrate Remotion from backend to frontend container

- Move video_compositions/ from backend to frontend
- Add Remotion dependencies to frontend package.json
- Update Dockerfile: add Docker CLI to backend, remove Remotion
- Update docker-compose: add shared volumes and Docker socket
- Update backend API to use docker exec for Remotion rendering
- Fix package-lock.json sync issue

This resolves node_modules mounting issues and creates cleaner architecture."

# Push to your branch
git push origin video
```

---

### **Step 2: Deploy on Linux Server**

SSH into your Linux server and run:

```bash
# Navigate to project directory
cd /path/to/onyx-cutom

# Pull latest changes
git pull origin video

# Navigate to docker-compose directory
cd deployment/docker_compose

# Stop existing containers
docker-compose -f docker-compose.dev.yml down

# Rebuild with no cache (important!)
docker-compose -f docker-compose.dev.yml build --no-cache

# Start containers
docker-compose -f docker-compose.dev.yml up -d

# Watch logs to verify startup
docker-compose -f docker-compose.dev.yml logs -f custom_backend custom_frontend
```

---

### **Step 3: Verify Installation**

```bash
# 1. Check frontend has Remotion
docker exec onyx-stack-custom_frontend-1 npx remotion --version
# Expected output: 4.0.356 (or similar)

# 2. Check backend can execute Docker commands
docker exec onyx-stack-custom_backend-1 docker ps
# Should show list of running containers

# 3. Check shared volume exists
docker exec onyx-stack-custom_frontend-1 ls -la /app-backend-output/
# Should show: presentations/

docker exec onyx-stack-custom_backend-1 ls -la /app/output/
# Should show: presentations/ (same directory via shared volume)

# 4. Check Docker socket is mounted
docker exec onyx-stack-custom_backend-1 ls -l /var/run/docker.sock
# Should show: srw-rw---- (socket file)

# 5. Check container names
docker ps --format "table {{.Names}}\t{{.Status}}"
# Should include: onyx-stack-custom_frontend-1 and onyx-stack-custom_backend-1
```

---

### **Step 4: Test Debug Render**

1. **Open Frontend UI** in browser (e.g., `http://your-server-ip:3000`)

2. **Navigate to Video Editor:**
   - Open any project
   - Go to the video generation section

3. **Click "Debug" Button:**
   - This triggers a test render without Elai API
   - Should complete in ~30 seconds

4. **Monitor Backend Logs:**
   ```bash
   docker logs onyx-stack-custom_backend-1 -f | grep DEBUG_RENDER
   ```

5. **Expected Log Output:**
   ```
   🐛 [DEBUG_RENDER] Debug render endpoint called
   🐛 [DEBUG_RENDER] Calling frontend container: onyx-stack-custom_frontend-1
   🐛 [DEBUG_RENDER] Executing docker command: docker exec custom_frontend...
   🐛 [DEBUG_RENDER] Remotion process completed with return code: 0
   🐛 [DEBUG_RENDER] ✅ Remotion render completed successfully
   🐛 [DEBUG_RENDER] ✅ Output video verified: 1.23 MB
   ```

6. **Video should download automatically** in your browser

---

## 🐛 **TROUBLESHOOTING**

### **Issue 1: "Docker CLI not found"**

**Symptoms:**
```
FileNotFoundError: Docker CLI not found or frontend container not running
```

**Solution:**
```bash
# Rebuild backend with Docker CLI
docker-compose -f docker-compose.dev.yml build custom_backend --no-cache
docker-compose -f docker-compose.dev.yml up -d custom_backend
```

---

### **Issue 2: "npx remotion not found"**

**Symptoms:**
```
docker exec: /bin/sh: npx: not found
```

**Solution:**
```bash
# Rebuild frontend with Remotion dependencies
docker-compose -f docker-compose.dev.yml build custom_frontend --no-cache
docker-compose -f docker-compose.dev.yml up -d custom_frontend

# Verify installation
docker exec onyx-stack-custom_frontend-1 npx remotion --version
```

---

### **Issue 3: "Output file not created in shared volume"**

**Symptoms:**
```
Remotion completed but output file was not created in shared volume
```

**Solution:**
```bash
# Check if shared volume is mounted correctly
docker inspect onyx-stack-custom_frontend-1 | grep -A 10 "Mounts"

# Should show:
# "Source": "/path/to/custom_extensions/backend/output"
# "Destination": "/app-backend-output"

# If missing, fix docker-compose.dev.yml and rebuild
```

---

### **Issue 4: "Frontend container not found"**

**Symptoms:**
```
Error: No such container: onyx-stack-custom_frontend-1
```

**Solution:**
```bash
# Check actual container name
docker ps --filter "name=frontend" --format "{{.Names}}"

# Update environment variable in docker-compose.dev.yml if different:
# - FRONTEND_CONTAINER_NAME=<actual-container-name>
```

---

### **Issue 5: "Permission denied: /var/run/docker.sock"**

**Symptoms:**
```
Cannot connect to Docker daemon at unix:///var/run/docker.sock
```

**Solution:**
```bash
# Check if Docker socket is mounted
docker inspect onyx-stack-custom_backend-1 | grep docker.sock

# Should show: "/var/run/docker.sock:/var/run/docker.sock:ro"

# If missing, fix docker-compose.dev.yml:
volumes:
  - /var/run/docker.sock:/var/run/docker.sock:ro
```

---

## 🎯 **SUCCESS INDICATORS**

After deployment, you should see:

✅ **Frontend container has Remotion:**
```bash
$ docker exec custom_frontend npx remotion --version
4.0.356
```

✅ **Backend can execute Docker commands:**
```bash
$ docker exec custom_backend docker ps
CONTAINER ID   IMAGE                  NAMES
abc123...      custom_frontend        onyx-stack-custom_frontend-1
def456...      custom_backend         onyx-stack-custom_backend-1
```

✅ **Shared volume works:**
```bash
# Backend writes to /app/output/
# Frontend sees same files at /app-backend-output/
# Both paths point to the same physical directory
```

✅ **Debug render completes successfully:**
- Returns HTTP 200 with `{"success": true, "jobId": "..."}`
- Video file exists and is > 100KB
- Video downloads in browser

---

## 📊 **Architecture Overview**

### **Before (Broken):**
```
Backend Container
├── Python + Node.js (heavy)
├── node_modules (overwritten by volume mount ❌)
└── npx remotion (fails due to missing node_modules)
```

### **After (Fixed):**
```
Backend Container                Frontend Container
├── Python                       ├── Node.js
├── Docker CLI                   ├── node_modules ✅
├── docker exec → frontend       ├── Remotion
└── Serves video via HTTP        └── Renders video to shared volume
                   ↓                         ↓
              Shared Volume (/app/output/ ↔ /app-backend-output/)
```

---

## 🔗 **Related Documentation**

- **[REMOTION_MOVED_TO_FRONTEND.md](./REMOTION_MOVED_TO_FRONTEND.md)** - Complete technical details
- **[QUICK_START_REMOTION_FRONTEND.md](./QUICK_START_REMOTION_FRONTEND.md)** - Quick reference commands
- **[39_BYTE_VIDEO_FIX.md](./39_BYTE_VIDEO_FIX.md)** - Previous video rendering issues

---

## 🎉 **DEPLOYMENT COMPLETE!**

After following these steps, your Remotion video rendering will work perfectly:

✅ No more `node_modules` mounting issues  
✅ Clean architecture (Python backend + Node.js rendering)  
✅ Easy to debug (`docker exec` commands work)  
✅ Scalable (can add more frontend containers)  
✅ All existing APIs unchanged (no breaking changes)  

**Happy rendering! 🚀**


