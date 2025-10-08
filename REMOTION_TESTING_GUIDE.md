# 🧪 Remotion Testing Guide

**Complete step-by-step instructions to test the new Remotion setup**

---

## 🚀 **Step 1: Rebuild Containers**

Since we modified Dockerfiles and docker-compose, you need to rebuild:

```bash
cd d:/project/onyx-cutom/deployment/docker_compose

# Stop current containers
docker-compose -f docker-compose.dev.yml down

# Rebuild with no cache (recommended for clean start)
docker-compose -f docker-compose.dev.yml build --no-cache custom_frontend custom_backend

# Start containers
docker-compose -f docker-compose.dev.yml up -d

# Check if containers are running
docker ps --filter "name=custom"
```

**Expected output:**
```
CONTAINER ID   IMAGE         NAMES
abc123...      ...          onyx-stack-custom_frontend-1
def456...      ...          onyx-stack-custom_backend-1
```

---

## ✅ **Step 2: Verify Docker CLI in Backend**

```bash
docker exec onyx-stack-custom_backend-1 docker --version
```

**Expected output:**
```
Docker version 20.10.x, build xxxxx
```

---

## ✅ **Step 3: Verify Remotion in Frontend**

```bash
# Check if Remotion packages are installed
docker exec onyx-stack-custom_frontend-1 ls -la /app/node_modules/@remotion

# Check Remotion CLI
docker exec onyx-stack-custom_frontend-1 npx remotion --version
```

**Expected output:**
```
# First command:
drwxr-xr-x cli
drwxr-xr-x player
...

# Second command:
4.x.x
```

---

## ✅ **Step 4: Verify video_compositions Directory**

```bash
docker exec onyx-stack-custom_frontend-1 ls -la /app/video_compositions
```

**Expected output:**
```
drwxr-xr-x src
-rw-r--r-- package.json
-rw-r--r-- remotion.config.ts
-rw-r--r-- tsconfig.json
```

---

## ✅ **Step 5: Check Remotion Files**

```bash
docker exec onyx-stack-custom_frontend-1 ls -la /app/video_compositions/src
```

**Expected output:**
```
-rw-r--r-- Root.tsx
-rw-r--r-- AvatarServiceSlide.tsx
```

---

## ✅ **Step 6: Verify Shared Volume**

```bash
# Check from backend
docker exec onyx-stack-custom_backend-1 ls -la /app/output

# Check from frontend
docker exec onyx-stack-custom_frontend-1 ls -la /app-backend-output
```

**Expected:** Both should show the same directory (may be empty initially)

---

## 🎬 **Step 7: Test Debug Render (Main Test)**

### **Option A: Via Frontend UI**

1. Open browser: `http://localhost:3000` (or your server IP)
2. Navigate to video generation page
3. Click **"Debug"** button (orange button with gear icon)
4. Wait for response (should take 5-10 seconds)
5. Check if video downloads automatically

### **Option B: Via API (curl)**

```bash
curl -X POST http://localhost:8001/api/custom/presentations/debug-render \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Test Render",
    "theme": "dark-purple",
    "duration": 5,
    "slidesData": [
      {
        "slideId": "test-slide-1",
        "props": {
          "title": "Test Title",
          "subtitle": "Test Subtitle",
          "content": "This is test content"
        },
        "metadata": {
          "elementPositions": {}
        }
      }
    ]
  }'
```

**Expected response:**
```json
{
  "success": true,
  "jobId": "abc-123-def-456",
  "videoPath": "/app/output/presentations/debug_render_abc-123-def-456.mp4",
  "videoSize": 1234567,
  "message": "Debug render completed successfully (no avatar)"
}
```

---

## 📋 **Step 8: Check Backend Logs**

While testing, monitor backend logs in real-time:

```bash
docker logs onyx-stack-custom_backend-1 -f --tail 100
```

**Look for:**
```
🐛 [DEBUG_RENDER] Debug render endpoint called
🐛 [DEBUG_RENDER] Job ID: abc-123-def-456
🐛 [DEBUG_RENDER] Remotion render configuration (via frontend container):
🐛 [DEBUG_RENDER]   - Container: onyx-stack-custom_frontend-1
🐛 [DEBUG_RENDER]   - Entry file: /app/video_compositions/src/Root.tsx
🐛 [DEBUG_RENDER] Remotion process completed with return code: 0
🐛 [DEBUG_RENDER] ✅ Remotion render completed successfully
🐛 [DEBUG_RENDER] ✅ Output video: /app/output/presentations/debug_render_abc-123-def-456.mp4
🐛 [DEBUG_RENDER] ✅ Video size verified: 1.23 MB
```

---

## 📋 **Step 9: Check Frontend Logs**

```bash
docker logs onyx-stack-custom_frontend-1 -f --tail 50
```

**Look for Remotion output:**
```
Bundling video...
Rendering frames...
Stitching frames...
Done in 5.2s
```

---

## 📥 **Step 10: Download and Verify Video**

If you got a `jobId` from the API response, download the video:

```bash
# Replace {jobId} with actual job ID
curl -o test_video.mp4 http://localhost:8001/api/custom/presentations/debug-render/{jobId}/video
```

**Verify video:**
```bash
# Check file size (should be > 100KB)
ls -lh test_video.mp4

# Play video (if you have ffplay)
ffplay test_video.mp4

# Check video properties
ffprobe test_video.mp4
```

**Expected:**
- File size: 1-5 MB
- Duration: 5 seconds (as specified)
- Resolution: 1920x1080
- Codec: H.264

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: "Docker/frontend container not accessible"**

**Symptom:** Backend returns 500 error with this message

**Solution:**
```bash
# Check if docker.sock is mounted
docker exec onyx-stack-custom_backend-1 ls -la /var/run/docker.sock

# Check if Docker CLI is installed
docker exec onyx-stack-custom_backend-1 docker --version

# If missing, rebuild backend:
cd deployment/docker_compose
docker-compose -f docker-compose.dev.yml build --no-cache custom_backend
docker-compose -f docker-compose.dev.yml up -d custom_backend
```

---

### **Issue 2: "Cannot find module '@remotion/cli'"**

**Symptom:** Frontend logs show "Cannot find module"

**Solution:**
```bash
# Check if Remotion is installed
docker exec onyx-stack-custom_frontend-1 npm list @remotion/cli

# If missing, install manually:
docker exec onyx-stack-custom_frontend-1 npm install @remotion/cli @remotion/player remotion

# Or rebuild frontend:
docker-compose -f docker-compose.dev.yml build --no-cache custom_frontend
docker-compose -f docker-compose.dev.yml up -d custom_frontend
```

---

### **Issue 3: "Output video file not created"**

**Symptom:** Backend logs show file not found after rendering

**Solution:**
```bash
# Check if shared volume is mounted correctly
docker exec onyx-stack-custom_frontend-1 ls -la /app-backend-output

# Check permissions
docker exec onyx-stack-custom_frontend-1 ls -la /app-backend-output/presentations

# Create directory if missing
docker exec onyx-stack-custom_frontend-1 mkdir -p /app-backend-output/presentations
```

---

### **Issue 4: "Video file is 39 bytes (corrupted)"**

**Symptom:** Video file exists but is very small

**Cause:** Remotion render failed silently

**Solution:**
```bash
# Check Remotion logs more carefully
docker logs onyx-stack-custom_frontend-1 --tail 200

# Test Remotion directly in frontend:
docker exec onyx-stack-custom_frontend-1 npx remotion preview /app/video_compositions/src/Root.tsx
```

---

### **Issue 5: "Container name not found"**

**Symptom:** Backend can't find `onyx-stack-custom_frontend-1`

**Solution:**
```bash
# Check actual container name
docker ps --filter "name=frontend"

# If name is different, update backend/main.py line 29169:
# Change: "onyx-stack-custom_frontend-1"
# To: actual container name from docker ps
```

---

## 🎯 **Success Criteria Checklist**

- [ ] Backend has Docker CLI installed
- [ ] Backend can access docker.sock
- [ ] Frontend has Remotion packages installed
- [ ] Frontend has video_compositions directory
- [ ] Shared volume `/app-backend-output` is accessible from frontend
- [ ] Backend can execute `docker exec` to frontend
- [ ] Debug render API returns success
- [ ] Video file is created in output directory
- [ ] Video file size is > 100KB
- [ ] Video can be downloaded via API
- [ ] Video plays correctly (1920x1080, 5 seconds)

---

## 📊 **Performance Benchmarks**

**Expected timings:**
- Container startup: 30-60 seconds
- Remotion first render: 10-15 seconds (includes bundling)
- Remotion subsequent renders: 5-10 seconds
- Video download: 1-3 seconds (depends on network)

**Expected file sizes:**
- Simple slide (text only): 1-2 MB
- Complex slide (with avatar): 3-5 MB
- 5-second video: ~1-3 MB

---

## 🔍 **Advanced Debugging**

### **Test Remotion directly in frontend container:**

```bash
# Enter frontend container
docker exec -it onyx-stack-custom_frontend-1 bash

# Navigate to video_compositions
cd /app/video_compositions

# Run Remotion preview (if X11 is available)
npx remotion preview src/Root.tsx

# Render a test video
npx remotion render src/Root.tsx AvatarServiceSlide test.mp4 --props='{"title":"Test"}'

# Exit container
exit
```

---

## 📝 **Manual Testing Checklist**

1. **Container Health**
   - [ ] Backend is running
   - [ ] Frontend is running
   - [ ] No crash loops in logs

2. **Dependencies**
   - [ ] Docker CLI in backend
   - [ ] Remotion in frontend
   - [ ] Node.js in frontend

3. **File Structure**
   - [ ] video_compositions/ exists in frontend
   - [ ] Root.tsx exists
   - [ ] AvatarServiceSlide.tsx exists

4. **Volume Mounts**
   - [ ] docker.sock mounted to backend
   - [ ] backend/output mounted to frontend

5. **API Endpoints**
   - [ ] POST /api/custom/presentations/debug-render works
   - [ ] GET /api/custom/presentations/debug-render/{jobId}/video works

6. **Video Quality**
   - [ ] Video resolution is 1920x1080
   - [ ] Video duration matches request
   - [ ] Text is visible and positioned correctly
   - [ ] Theme colors are applied

---

## 🎉 **Next Steps After Testing**

Once all tests pass:

1. **Update production deployment** with the same changes
2. **Test with real avatar videos** (not PLACEHOLDER)
3. **Test with multiple slides** (longer videos)
4. **Test with different themes** (dark-purple, light-modern, corporate-blue)
5. **Performance testing** with concurrent renders
6. **Monitor resource usage** (CPU, memory, disk)

---

**Happy Testing! 🚀**

