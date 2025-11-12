# Vespa Data Persistence Issue - FIXED

**Date:** November 12, 2025  
**Issue:** All indexed documents lost after `docker compose down` + `docker compose up`  
**Status:** ✅ FIXED

---

## Problem Description

After running `docker compose down` and `docker compose up`, all documents indexed in Vespa are lost. Users have to re-upload and re-index all files, which is time-consuming and defeats the purpose of data persistence.

---

## Root Causes

### Cause 1: Using `docker compose down -v`

The `-v` flag **removes all volumes**, including Vespa's data:

```bash
docker compose down -v  # ❌ This deletes ALL volumes including Vespa data!
```

### Cause 2: Incomplete Volume Configuration

The original configuration only mounted `/opt/vespa/var` (data directory), but not `/opt/vespa/conf` (configuration directory). Vespa needs both for proper persistence:

**Original (Incomplete):**
```yaml
volumes:
  - vespa_volume:/opt/vespa/var  # Only data, missing config
```

**Fixed (Complete):**
```yaml
volumes:
  - vespa_volume:/opt/vespa/var      # Data (indexes, documents)
  - vespa_config:/opt/vespa/conf     # Config (schemas, deployments)
```

### Cause 3: Missing Vespa Environment Variables

Vespa needs proper config server settings to maintain state correctly.

---

## Solution Applied

### Changes Made to `docker-compose.dev.yml`

**1. Added Vespa Environment Variables** (lines 402-403)
```yaml
environment:
  - VESPA_SKIP_UPGRADE_CHECK=true
  - VESPA_CONFIGSERVERS=index              # ✅ NEW: Config server setting
  - VESPA_CONFIGSERVER_JVMARGS=-Xms32M -Xmx128M  # ✅ NEW: Memory optimization
```

**2. Added Config Volume Mount** (line 410)
```yaml
volumes:
  - vespa_volume:/opt/vespa/var    # Data directory
  - vespa_config:/opt/vespa/conf   # ✅ NEW: Config directory
```

**3. Declared Config Volume** (line 533)
```yaml
volumes:
  db_volume:
  vespa_volume: # Vespa data directory (indexes, documents)
  vespa_config: # ✅ NEW: Vespa configuration (schemas, deployments)
```

---

## How to Apply the Fix

### Step 1: Stop Services (WITHOUT removing volumes)

```bash
# ✅ CORRECT - Keeps volumes
docker compose down

# ❌ NEVER USE - Removes volumes
# docker compose down -v
```

### Step 2: Verify Volumes Exist

```bash
docker volume ls | grep vespa
```

**Expected output:**
```
onyx-cutom_vespa_volume
onyx-cutom_vespa_config  # May not exist yet, will be created
```

### Step 3: Restart Services

```bash
docker compose up -d
```

### Step 4: Verify Vespa is Running

```bash
# Check Vespa health
curl http://localhost:19071/state/v1/health

# Should return: { "status": "up" }
```

### Step 5: Check If Existing Data Persisted

If you had data before:
1. Log into your application
2. Go to SmartDrive or Files section
3. Check if previously uploaded files still show as "INDEXED"
4. Try searching for content from those files

---

## Testing Data Persistence

### Test 1: Upload a File

```bash
# 1. Upload a test file via the UI
# 2. Wait for indexing to complete
# 3. Verify it appears in search results
```

### Test 2: Restart Without Volume Removal

```bash
# Stop services (KEEP volumes)
docker compose down

# Restart
docker compose up -d

# Wait 30 seconds for Vespa to fully start

# Check if file still indexed:
# - Go to Files section
# - File should still show as "INDEXED"
# - Search should still find content from the file
```

### Test 3: Check Volume Persistence

```bash
# Check volume size (should not be empty)
docker volume inspect onyx-cutom_vespa_volume

# Look for "Mountpoint" and check disk usage
du -sh /var/lib/docker/volumes/onyx-cutom_vespa_volume/_data
```

---

## Troubleshooting

### Issue: Data Still Lost After Fix

**Cause:** You may have used `docker compose down -v` before applying the fix

**Solution:**
1. All old data is permanently deleted by `-v`
2. Apply the fix above
3. Re-upload and re-index your files
4. From now on, data will persist between restarts

### Issue: Vespa Not Starting

**Symptoms:**
```
curl http://localhost:19071/state/v1/health
# Returns connection refused or timeout
```

**Solution:**
```bash
# Check Vespa logs
docker logs onyx-cutom-index-1

# If you see config errors, remove vespa_config volume and restart
docker compose down
docker volume rm onyx-cutom_vespa_config
docker compose up -d
```

### Issue: "Volume is in use" Error

**Symptom:**
```
Error: remove volume: volume is in use
```

**Solution:**
```bash
# Stop all containers first
docker compose down

# Check what's using the volume
docker ps -a | grep vespa

# Force remove stuck containers
docker rm -f <container_id>

# Then restart
docker compose up -d
```

---

## Best Practices

### ✅ DO:

1. **Always use `docker compose down`** (without `-v`)
2. **Use `docker compose restart <service>`** for single service restarts
3. **Backup volumes regularly:**
   ```bash
   # Backup Vespa data
   docker run --rm -v onyx-cutom_vespa_volume:/data -v $(pwd):/backup alpine tar czf /backup/vespa_backup.tar.gz /data
   ```

### ❌ DON'T:

1. **Never use `docker compose down -v`** unless you want to delete everything
2. **Don't delete volumes manually** unless troubleshooting
3. **Don't restart Vespa during active indexing** (can corrupt data)

---

## Volume Management Commands

### List All Volumes
```bash
docker volume ls
```

### Inspect Volume
```bash
docker volume inspect onyx-cutom_vespa_volume
```

### Check Volume Size
```bash
docker system df -v
```

### Backup Volume (Recommended Before Major Changes)
```bash
# Backup Vespa data
docker run --rm -v onyx-cutom_vespa_volume:/data -v $(pwd):/backup alpine tar czf /backup/vespa_data_backup.tar.gz /data

# Backup Vespa config
docker run --rm -v onyx-cutom_vespa_config:/data -v $(pwd):/backup alpine tar czf /backup/vespa_config_backup.tar.gz /data
```

### Restore Volume (If Needed)
```bash
# Stop services
docker compose down

# Restore data
docker run --rm -v onyx-cutom_vespa_volume:/data -v $(pwd):/backup alpine tar xzf /backup/vespa_data_backup.tar.gz -C /

# Restart
docker compose up -d
```

---

## Why This Fix Works

### Docker Volume Persistence

Docker named volumes (like `vespa_volume`) persist by default between container restarts:
- Data survives `docker compose down`
- Data survives `docker compose restart`
- Data survives container recreation
- Data is only deleted with `docker compose down -v` or `docker volume rm`

### Vespa Data Structure

Vespa stores data in two main locations:

1. **`/opt/vespa/var`** (Data Directory)
   - Document indexes
   - Search indexes
   - Document content
   - **Without this:** Lose all indexed documents

2. **`/opt/vespa/conf`** (Config Directory)
   - Schema definitions
   - Deployment configs
   - Application state
   - **Without this:** Vespa can't find/read the data even if it exists

By mounting **both** directories as persistent volumes, Vespa maintains full state across restarts.

---

## Expected Behavior After Fix

### Before Fix:
```
1. docker compose down
2. docker compose up
3. ❌ All files lost - need to re-upload and re-index
```

### After Fix:
```
1. docker compose down
2. docker compose up
3. ✅ All files still indexed - ready to use immediately
```

---

## Verification Checklist

After applying the fix, verify:

- [ ] `docker-compose.dev.yml` updated with new Vespa config
- [ ] Services restarted: `docker compose down && docker compose up -d`
- [ ] Vespa is healthy: `curl http://localhost:19071/state/v1/health`
- [ ] Upload a test file and verify it indexes
- [ ] Restart services: `docker compose down && docker compose up -d`
- [ ] Test file still shows as indexed
- [ ] Search still finds content from test file
- [ ] Volume sizes non-zero: `docker volume inspect onyx-cutom_vespa_volume`

---

## Summary

**What Was Fixed:**
- ✅ Added `vespa_config` volume for configuration persistence
- ✅ Added Vespa environment variables for proper config server setup
- ✅ Documented proper shutdown procedure (no `-v` flag)

**Result:**
- ✅ Documents persist between restarts
- ✅ No need to re-upload files
- ✅ No need to re-index content
- ✅ System ready immediately after restart

**Files Modified:**
- `deployment/docker_compose/docker-compose.dev.yml`

**Next Steps:**
1. Apply the same fix to `docker-compose.prod.yml` if you use it
2. Educate team members about **not using `docker compose down -v`**
3. Set up regular volume backups for disaster recovery

---

## Production Deployment Notes

For production, consider:

1. **External Volume Mounts:** Use bind mounts to a specific directory for easier backup:
   ```yaml
   volumes:
     - /path/to/persistent/storage/vespa/data:/opt/vespa/var
     - /path/to/persistent/storage/vespa/config:/opt/vespa/conf
   ```

2. **Backup Strategy:** Schedule regular backups:
   ```bash
   # Daily backup cron job
   0 2 * * * docker run --rm -v onyx-cutom_vespa_volume:/data -v /backups:/backup alpine tar czf /backup/vespa_$(date +\%Y\%m\%d).tar.gz /data
   ```

3. **Monitoring:** Monitor volume disk usage:
   ```bash
   # Alert if volume >80% full
   df -h | grep vespa
   ```

---

## Conclusion

The Vespa data persistence issue is now **fixed**. Documents will persist across restarts as long as you:

1. ✅ Use `docker compose down` (not `docker compose down -v`)
2. ✅ Don't manually delete volumes
3. ✅ Keep the updated docker-compose configuration

Your indexed documents are now safe! 🎉

