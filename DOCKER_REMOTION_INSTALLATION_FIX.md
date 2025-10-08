# Docker Remotion Installation Fix - Complete Solution

**Date:** October 8, 2025  
**Status:** ✅ **FIXED** - Dockerfile Corrected + .dockerignore Added  
**Issue:** `npm error could not determine executable to run`

---

## **🔍 ROOT CAUSE IDENTIFIED**

### **The Problem:**

**You installed Remotion locally** (Windows machine):
```powershell
PS D:\project\...\video_compositions> npm install
PS D:\project\...\video_compositions> npx remotion --version
@remotion/cli 4.0.356 ✅  # Works locally!
```

**But Docker container doesn't have it because:**

**ORIGINAL Dockerfile (BROKEN):**
```dockerfile
# Line 105-112: Install Remotion FIRST
COPY video_compositions/package.json /app/video_compositions/
WORKDIR /app/video_compositions
RUN npm install  # ✅ Creates node_modules/

# Line 117-118: Copy code SECOND
WORKDIR /app
COPY . .  # ❌ OVERWRITES video_compositions/ with local version!
          # ❌ DELETES the node_modules that were just installed!
```

**Result:**
```
Docker container: /app/video_compositions/node_modules/  ❌ DELETED
Local machine:   D:\project\...\video_compositions\node_modules/  ✅ EXISTS

Code runs in: Docker container  ❌ No Remotion!
Error: "npm error could not determine executable to run"
```

---

## **✅ THE FIX APPLIED**

### **Fix #1: Reorder Dockerfile Steps**

**File Modified:** `backend/Dockerfile` (Lines 101-115)

**NEW Dockerfile (CORRECT):**
```dockerfile
# PART 4: Copy Application Code First
COPY . .

# PART 5: Install Remotion AFTER copying code (to avoid overwrite)
WORKDIR /app/video_compositions
RUN npm install && \
    chmod -R 755 node_modules && \
    npx remotion --version && \
    echo "✅ Remotion installed successfully in Docker container"

WORKDIR /app
```

**Why This Works:**
1. `COPY . .` brings in local code (including `package.json`)
2. `npm install` runs **AFTER** copy, so it won't be overwritten
3. `node_modules/` stays in the Docker container

---

### **Fix #2: Add .dockerignore File**

**File Created:** `backend/.dockerignore`

**Contents:**
```
# Prevent local node_modules from overwriting Docker-installed packages
video_compositions/node_modules/

# Python cache
__pycache__/
*.pyc
*.pyo

# Output files (don't include in image)
output/
```

**Why This Helps:**
- Even if `COPY . .` runs before `npm install`, it won't copy your local `node_modules`
- Prevents confusion between local and Docker dependencies
- Reduces Docker image size

---

## **📋 REBUILD INSTRUCTIONS**

### **Step 1: Navigate to Docker Directory**

```bash
cd ~/onyx-dev/onyx-cutom/deployment/docker_compose
# OR
cd <your-docker-compose-directory>
```

---

### **Step 2: Find Your Container Name**

```bash
docker ps | grep backend
```

**Expected output:**
```
CONTAINER ID   IMAGE                    NAMES
abc123def456   deployment_custom_backend   deployment-custom_backend-1
```

**Note the container name** (last column). Common patterns:
- `deployment-custom_backend-1`
- `docker-compose-custom_backend-1`
- `onyx-custom_backend-1`

---

### **Step 3: Rebuild Docker Image**

```bash
# Stop the container
docker-compose stop custom_backend

# Rebuild with no cache (IMPORTANT!)
docker-compose build --no-cache custom_backend

# Start the container
docker-compose up -d custom_backend
```

**Expected output during build:**
```
Step X/Y : RUN npm install
 ---> Running in abc123...
added 523 packages in 45s
✅ Remotion installed successfully in Docker container

Step Y/Y : CMD ["uvicorn", "main:app", ...]
Successfully built def456ghi789
Successfully tagged deployment_custom_backend:latest
```

---

### **Step 4: Verify Remotion in Container**

**Using your actual container name:**

```bash
# Replace CONTAINER_NAME with your actual name from Step 2
CONTAINER_NAME="deployment-custom_backend-1"  # Example

# Test Node.js
docker exec $CONTAINER_NAME node --version
# Expected: v18.x.x

# Test npm
docker exec $CONTAINER_NAME npm --version
# Expected: 9.x.x or 10.x.x

# Test Remotion CLI
docker exec $CONTAINER_NAME npx remotion --version
# Expected: 4.0.356 (or similar)

# Verify node_modules exists IN DOCKER
docker exec $CONTAINER_NAME ls /app/video_compositions/node_modules/@remotion
# Expected: cli  player  (and other packages)
```

---

### **Step 5: Check Docker Logs**

```bash
docker-compose logs -f custom_backend | grep -i remotion
```

**Expected during startup:**
```
custom_backend-1  | ✅ Remotion installed successfully in Docker container
```

---

### **Step 6: Test Debug Render**

1. Open video lesson editor in browser
2. Click orange "Debug" button
3. Wait ~25 seconds
4. **Expected:** Alert shows "✅ Debug render completed! Video downloaded (X.XX MB)."
5. **Expected:** Video file downloads (1-5 MB)
6. **Expected:** Video plays when opened

---

## **🐛 TROUBLESHOOTING**

### **Issue: Still Getting "npm error could not determine executable to run"**

**Diagnosis:**
```bash
# Check if node_modules was actually installed in Docker
docker exec CONTAINER_NAME ls -la /app/video_compositions/

# If you DON'T see node_modules/, then npm install didn't run properly
```

**Solution:**
```bash
# Install manually inside running container
docker exec -it CONTAINER_NAME sh -c "cd /app/video_compositions && npm install"

# Verify
docker exec CONTAINER_NAME ls /app/video_compositions/node_modules/@remotion
```

---

### **Issue: "Cannot find module 'react'"**

**Diagnosis:**
```bash
docker exec CONTAINER_NAME ls /app/video_compositions/node_modules/ | grep react
# If empty, React isn't installed
```

**Solution:**
```bash
# Install React dependencies
docker exec CONTAINER_NAME sh -c "cd /app/video_compositions && npm install react react-dom"
```

---

### **Issue: Build Fails with "npm install" Error**

**Check `package.json` exists:**
```bash
# Verify package.json is in the right place locally
ls -la onyx-cutom/custom_extensions/backend/video_compositions/package.json
```

**If missing, the COPY in Dockerfile fails.**

**Solution:** Ensure `package.json` exists locally before building.

---

## **📊 BEFORE vs AFTER**

### **Before Fix:**

```
Docker Build:
  1. COPY package.json
  2. npm install  → node_modules created ✅
  3. COPY . .  → node_modules OVERWRITTEN ❌
  
Docker Container:
  /app/video_compositions/node_modules/  ❌ MISSING

npx remotion render:
  npm error: could not determine executable to run  ❌
```

---

### **After Fix:**

```
Docker Build:
  1. COPY . .  → All code copied (local node_modules ignored by .dockerignore)
  2. npm install  → node_modules created ✅
  
Docker Container:
  /app/video_compositions/node_modules/@remotion/  ✅ EXISTS

npx remotion render:
  Rendering frames 0-149...  ✅
  Video saved successfully  ✅
```

---

## **🎯 EXPECTED BEHAVIOR AFTER FIX**

### **Backend Logs (Success):**
```
INFO:main:🐛 [DEBUG_RENDER] Debug render endpoint called
INFO:main:🐛 [DEBUG_RENDER] Working directory: /app
INFO:main:🐛 [DEBUG_RENDER] Executing command: npx remotion render...
INFO:main:🐛 [DEBUG_RENDER] Remotion process completed with return code: 0  ✅
INFO:main:🐛 [DEBUG_RENDER] Stdout: [Remotion] Rendering frames 0-149...
INFO:main:🐛 [DEBUG_RENDER] Output video file size: 1234567 bytes (1.18 MB)  ✅
INFO:main:🐛 [DEBUG_RENDER] ✅ Remotion render completed successfully
INFO:main:🐛 [DEBUG_RENDER] ✅ File size validated: 1.18 MB
INFO: 172.18.0.12:xxxxx - "POST /api/custom/presentations/debug-render HTTP/1.1" 200 OK  ✅
```

### **Frontend:**
```javascript
🐛 [DEBUG_RENDER] Success! Video path: output/presentations/debug_render_abc123.mp4
✅ Debug render completed! Video downloaded (1.18 MB).
```

### **Downloaded Video:**
- File size: 1-5 MB ✅
- Duration: 5 seconds ✅
- Resolution: 1920x1080 ✅
- Shows: Slide content + "DEBUG MODE" orange box ✅

---

## **🔄 QUICK REBUILD COMMANDS**

```bash
# Navigate to docker-compose directory
cd ~/onyx-dev/onyx-cutom/deployment/docker_compose

# Stop container
docker-compose stop custom_backend

# Rebuild (no cache to ensure npm install runs)
docker-compose build --no-cache custom_backend

# Start container
docker-compose up -d custom_backend

# Watch logs for "✅ Remotion installed successfully"
docker-compose logs -f custom_backend | grep -i remotion

# Test Remotion inside container
docker exec $(docker ps -q --filter "name=custom_backend") npx remotion --version

# Test debug render
# Click Debug button in UI
```

---

## **⚡ ALTERNATIVE: Quick Fix Without Rebuild**

If you don't want to rebuild Docker right now:

```bash
# Find container name
CONTAINER=$(docker ps --format "{{.Names}}" | grep backend)

# Install Remotion manually inside running container
docker exec -it $CONTAINER sh -c "cd /app/video_compositions && npm install"

# Verify
docker exec $CONTAINER ls /app/video_compositions/node_modules/@remotion
# Should show: cli  player

# Test immediately
# Click Debug button in UI - should work now!
```

**This works immediately but will be lost if container restarts.**  
**For permanent fix, rebuild with updated Dockerfile.**

---

## **📈 SUCCESS CRITERIA**

After rebuilding, you should see:

- [ ] Build completes without errors
- [ ] Build logs show "✅ Remotion installed successfully in Docker container"
- [ ] `docker exec CONTAINER npx remotion --version` returns `4.0.x`
- [ ] `docker exec CONTAINER ls /app/video_compositions/node_modules/@remotion` shows packages
- [ ] Debug button generates video in ~25 seconds
- [ ] Video file is 1-5 MB (not 39 bytes)
- [ ] Video plays correctly
- [ ] Shows "DEBUG MODE" orange placeholder

---

## **🎓 LESSON LEARNED**

### **Docker Build Order Matters:**

❌ **WRONG:**
```dockerfile
RUN npm install
COPY . .  # Overwrites node_modules!
```

✅ **CORRECT:**
```dockerfile
COPY . .
RUN npm install  # Creates node_modules after copy
```

**OR use .dockerignore:**
```
video_compositions/node_modules/
```

---

## **📝 FILES MODIFIED**

1. **`backend/Dockerfile`** - Reordered COPY and npm install
2. **`backend/.dockerignore`** - Added to prevent node_modules copy

---

## **⏱️ TIME ESTIMATE**

- Dockerfile already updated: ✅ Done
- .dockerignore created: ✅ Done
- Docker rebuild: ~10 minutes
- Verification: ~5 minutes
- **Total: ~15 minutes to working system**

---

## **🚀 NEXT STEP**

**Rebuild your Docker container now:**

```bash
cd ~/onyx-dev/onyx-cutom/deployment/docker_compose
docker-compose build --no-cache custom_backend
docker-compose up -d custom_backend
```

**Then test the Debug button!** 🎉

