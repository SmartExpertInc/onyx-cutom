# 🚀 Server Deployment Commands

**Status:** All changes have been committed and pushed from Windows ✅

**Latest commit:** `1ad939e15 - fixed docker file`

---

## **📋 Run These Commands on Your Linux Server**

SSH into your Linux server and run these commands:

### **Step 1: Navigate to Project Directory**
```bash
cd ~/onyx-dev/onyx-cutom
```

### **Step 2: Pull Latest Changes from GitHub**
```bash
git pull origin video
```

**Expected output:**
```
remote: Enumerating objects: X, done.
remote: Counting objects: 100% (X/X), done.
Updating abc1234..1ad939e
Fast-forward
 deployment/docker_compose/docker-compose.dev.yml | 3 ++-
 custom_extensions/backend/Dockerfile            | X ++-
 custom_extensions/backend/main.py               | XX ++-
 ...
```

### **Step 3: Verify Docker Socket Configuration**
```bash
grep -A 2 "docker.sock" deployment/docker_compose/docker-compose.dev.yml
```

**Expected output:**
```yaml
      # Allow backend to execute docker commands (for Remotion in frontend)
      - /var/run/docker.sock:/var/run/docker.sock:ro
```

### **Step 4: Recreate Containers with New Configuration**
```bash
cd deployment/docker_compose

# Stop all containers
docker compose down

# Start with new configuration
docker compose up -d
```

**Expected output:**
```
[+] Running 12/12
 ✔ Container onyx-stack-cache-1                   Started
 ✔ Container onyx-stack-index-1                   Started
 ✔ Container onyx-stack-custom-projects-db        Healthy
 ✔ Container onyx-stack-relational_db-1           Healthy
 ✔ Container onyx-stack-custom_backend-1          Started
 ✔ Container onyx-stack-custom_frontend-1         Started
 ...
```

### **Step 5: Verify Docker Socket is Mounted**
```bash
docker inspect onyx-stack-custom_backend-1 | grep -A 20 "Mounts"
```

**Expected output should show TWO mounts:**
```json
"Mounts": [
    {
        "Type": "bind",
        "Source": "/home/dev/onyx-dev/onyx-cutom/custom_extensions/backend",
        "Destination": "/app",
        "Mode": "rw"
    },
    {
        "Type": "bind",
        "Source": "/var/run/docker.sock",
        "Destination": "/var/run/docker.sock",
        "Mode": "ro"
    }
]
```

### **Step 6: Test Docker Access**
```bash
# Test if backend can run docker commands
docker exec onyx-stack-custom_backend-1 docker ps

# Should list all running containers
```

**Expected output:**
```
CONTAINER ID   IMAGE              STATUS         NAMES
abc123...      custom_backend     Up 2 minutes   onyx-stack-custom_backend-1
def456...      custom_frontend    Up 2 minutes   onyx-stack-custom_frontend-1
...
```

### **Step 7: Test Debug Render**

1. Open your frontend in browser
2. Navigate to a video project
3. Click the **"Debug"** button
4. Wait ~30 seconds

**Monitor backend logs:**
```bash
docker logs onyx-stack-custom_backend-1 -f | grep DEBUG_RENDER
```

**Expected output:**
```
INFO:main:🐛 [DEBUG_RENDER] Debug render endpoint called
INFO:main:🐛 [DEBUG_RENDER] Calling frontend container: onyx-stack-custom_frontend-1
INFO:main:🐛 [DEBUG_RENDER] Executing docker command: docker exec...
INFO:main:🐛 [DEBUG_RENDER] Remotion process completed with return code: 0
INFO:main:🐛 [DEBUG_RENDER] ✅ Remotion render completed successfully
INFO:main:🐛 [DEBUG_RENDER] ✅ Output video verified: 1.23 MB
```

---

## **✅ Success Indicators**

After completing all steps, you should have:

- ✅ Docker socket mounted in backend container
- ✅ Backend can execute `docker` commands
- ✅ Backend can call `docker exec custom_frontend`
- ✅ Frontend can run Remotion rendering
- ✅ Debug render completes successfully
- ✅ Video file is created and downloadable

---

## **🐛 Troubleshooting**

### **If `git pull` shows "Already up to date":**

```bash
# Check current commit
git log --oneline -1

# Should show: 1ad939e15 fixed docker file
# If not, force pull:
git fetch origin
git reset --hard origin/video
```

### **If Docker socket still not mounted after recreate:**

```bash
# Check docker-compose file on server
cat deployment/docker_compose/docker-compose.dev.yml | grep -A 5 "docker.sock"

# If it's NOT there, the pull failed. Try:
git fetch --all
git reset --hard origin/video
```

### **If "Cannot connect to Docker daemon" error persists:**

```bash
# Check Docker socket permissions on host
ls -la /var/run/docker.sock

# Should show: srw-rw---- root docker
# If your user is not in docker group:
sudo usermod -aG docker $USER
# Then logout and login again
```

---

## **📊 Before/After Comparison**

### **BEFORE (Current State on Server):**
```bash
$ docker inspect onyx-stack-custom_backend-1 | grep -A 5 "Mounts"
"Mounts": [
    {
        "Source": ".../backend",
        "Destination": "/app"
    }
]  # ❌ Only 1 mount
```

### **AFTER (Expected State):**
```bash
$ docker inspect onyx-stack-custom_backend-1 | grep -A 20 "Mounts"
"Mounts": [
    {
        "Source": ".../backend",
        "Destination": "/app"
    },
    {
        "Source": "/var/run/docker.sock",
        "Destination": "/var/run/docker.sock"
    }
]  # ✅ 2 mounts
```

---

**All changes are ready on GitHub. Just pull and recreate containers on the server!** 🎉

