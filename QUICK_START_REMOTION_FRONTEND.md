# 🚀 Quick Start: Remotion in Frontend Container

## **TL;DR**
Remotion moved from backend → frontend. Backend calls frontend via `docker exec`.

---

## **⚡ Quick Test Commands**

### **1. Verify Setup**
```bash
# Check frontend has Remotion
docker exec onyx-stack-custom_frontend-1 npx remotion --version

# Check backend can talk to Docker
docker exec onyx-stack-custom_backend-1 docker ps

# Check shared volume
docker exec onyx-stack-custom_frontend-1 ls /app-backend-output/presentations/
docker exec onyx-stack-custom_backend-1 ls /app/output/presentations/
# ↑ Should show same files
```

### **2. Rebuild After Changes**
```bash
cd deployment/docker_compose

# Full rebuild
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d

# Or just rebuild one service
docker-compose -f docker-compose.dev.yml build custom_backend --no-cache
docker-compose -f docker-compose.dev.yml up -d custom_backend
```

### **3. Watch Logs**
```bash
# Backend logs (shows docker exec calls)
docker logs onyx-stack-custom_backend-1 -f | grep DEBUG_RENDER

# Frontend logs (shows Remotion output)
docker logs onyx-stack-custom_frontend-1 -f
```

---

## **📁 What Changed?**

### **Files Modified:**
1. ✅ `frontend/package.json` - Added Remotion dependencies
2. ✅ `docker-compose.dev.yml` - Added shared volume + Docker socket
3. ✅ `backend/Dockerfile` - Added Docker CLI, removed Remotion
4. ✅ `backend/main.py` - Changed to use `docker exec`

### **Files Moved:**
```
backend/video_compositions/  →  frontend/video_compositions/
```

---

## **🔄 How Rendering Works Now**

```
Frontend UI
    ↓ POST /api/custom/presentations/debug-render
Backend (Python)
    ↓ docker exec custom_frontend npx remotion render
Frontend Container (Node.js)
    ↓ Renders video to /app-backend-output/
Shared Volume
    ↓ Backend sees file at /app/output/
Backend
    ↓ GET /debug-render/{job_id}/video
Frontend UI (download video)
```

---

## **🐛 Common Issues**

### **Issue: "node_modules missing"**
**Solution:** Frontend no longer has volume mount, rebuild:
```bash
docker-compose -f docker-compose.dev.yml build custom_frontend --no-cache
```

### **Issue: "Docker CLI not found"**
**Solution:** Backend needs Docker CLI installed:
```bash
docker-compose -f docker-compose.dev.yml build custom_backend --no-cache
```

### **Issue: "Output file not created"**
**Solution:** Check shared volume mount:
```bash
docker inspect onyx-stack-custom_frontend-1 | grep -A 5 "Mounts"
# Should show: backend/output:/app-backend-output
```

### **Issue: "Frontend container not found"**
**Solution:** Check container name:
```bash
docker ps --filter "name=frontend"
# Should show: onyx-stack-custom_frontend-1
```

---

## **📊 Environment Variables**

Set in `docker-compose.dev.yml`:

```yaml
custom_backend:
  environment:
    - FRONTEND_CONTAINER_NAME=onyx-stack-custom_frontend-1
```

Change if your frontend container has a different name.

---

## **✅ Success Checklist**

Before testing, verify:
- [ ] Frontend container is running: `docker ps | grep frontend`
- [ ] Remotion is installed: `docker exec custom_frontend npx remotion --version`
- [ ] Shared volume exists: `docker inspect custom_frontend | grep backend-output`
- [ ] Docker socket mounted: `docker inspect custom_backend | grep docker.sock`
- [ ] Backend can exec: `docker exec custom_backend docker ps`

---

## **🎯 Test the Debug Render**

1. Open frontend UI in browser
2. Click "Debug" button in video editor
3. Check backend logs for:
   ```
   🐛 [DEBUG_RENDER] Calling frontend container
   🐛 [DEBUG_RENDER] Executing docker command: docker exec...
   🐛 [DEBUG_RENDER] ✅ Remotion render completed successfully
   ```
4. Video should download automatically

---

## **📚 Full Documentation**

See [REMOTION_MOVED_TO_FRONTEND.md](./REMOTION_MOVED_TO_FRONTEND.md) for:
- Complete migration details
- Architecture explanation
- Troubleshooting guide
- Before/after comparison

---

**Quick Start Complete! 🎉**

