# Vespa Data Persistence Fix - Final Solution

## Problem
After `docker compose down` and `docker compose up`, all indexed documents in Vespa were removed.

## Root Cause Analysis

Vespa requires **two directories** to be persisted:

1. **`/opt/vespa/var`** - Contains document indexes and data
2. **`/opt/vespa/logs`** - Contains ZooKeeper transaction logs and state

Without persisting the logs directory, ZooKeeper loses its transaction history and coordination state, which can cause Vespa to think the data is invalid or not properly initialized.

## Solution

### Changes Made to `deployment/docker_compose/docker-compose.dev.yml`

#### 1. Updated Volume Mounts for Vespa Container

```yaml
index:
  image: vespaengine/vespa:8.526.15
  restart: always
  environment:
    - VESPA_SKIP_UPGRADE_CHECK=true
  ports:
    - "19071:19071"
    - "8081:8081"
  volumes:
    - vespa_volume:/opt/vespa/var   # Data and indexes (was already present)
    - vespa_logs:/opt/vespa/logs    # ZooKeeper transaction logs (ADDED)
```

**Key changes:**
- ✅ Kept `vespa_volume:/opt/vespa/var` for data/indexes
- ✅ **Added** `vespa_logs:/opt/vespa/logs` for ZooKeeper state
- ❌ Removed `vespa_config:/opt/vespa/conf` (not needed - config is deployed by Onyx)
- ❌ Removed `VESPA_CONFIGSERVERS` and `VESPA_CONFIGSERVER_JVMARGS` (caused DNS issues)

#### 2. Declared Named Volumes

```yaml
volumes:
  db_volume:
  vespa_volume:  # Vespa data directory (indexes, documents)
  vespa_logs:    # Vespa logs (includes ZooKeeper transaction logs)
  # ... other volumes
```

## Why This Fix Works

### What Persists Now:
1. **Document data** (`/opt/vespa/var/db/vespa/search/`) - Raw indexed documents
2. **Index structures** (`/opt/vespa/var/db/vespa/index/`) - Search indexes
3. **ZooKeeper state** (`/opt/vespa/logs/vespa/zookeeper.0/`) - Transaction logs
4. **Proton logs** (`/opt/vespa/logs/vespa/logarchive/`) - Vespa engine state

### What Vespa Does on Restart:
1. Reads ZooKeeper transaction logs to restore state
2. Verifies data integrity in `/opt/vespa/var`
3. Accepts application redeployment (schema updates)
4. **Preserves all existing documents**

## Testing the Fix

### Step 1: Clean Start
```bash
# Stop and remove everything (including old volumes)
docker compose -f deployment/docker_compose/docker-compose.dev.yml down -v

# Start with new configuration
docker compose -f deployment/docker_compose/docker-compose.dev.yml up -d
```

### Step 2: Index Test Documents
1. Upload a file to SmartDrive
2. Wait for indexing to complete (check logs)
3. Verify file appears in Onyx UI

### Step 3: Verify Persistence
```bash
# Stop containers (without -v to preserve volumes)
docker compose -f deployment/docker_compose/docker-compose.dev.yml down

# Start again
docker compose -f deployment/docker_compose/docker-compose.dev.yml up -d
```

### Step 4: Check Data Survived
1. Go to Onyx UI
2. Check if previously uploaded files are still indexed
3. Try generating a product from those files
4. Verify direct extraction works

### Debugging Commands

If data still disappears, check these:

```bash
# Check if volumes exist
docker volume ls | grep vespa

# Inspect volume contents (while container is running)
docker compose -f deployment/docker_compose/docker-compose.dev.yml exec index ls -la /opt/vespa/var
docker compose -f deployment/docker_compose/docker-compose.dev.yml exec index ls -la /opt/vespa/logs

# Check ZooKeeper logs
docker compose -f deployment/docker_compose/docker-compose.dev.yml exec index ls -la /opt/vespa/logs/vespa/zookeeper.0/

# Verify volume driver
docker volume inspect onyx-cutom_vespa_volume
docker volume inspect onyx-cutom_vespa_logs
```

## Why Previous Attempts Failed

### Attempt 1: Added Config Volume
- **Added:** `vespa_config:/opt/vespa/conf`
- **Why it failed:** Config is deployed by Onyx on startup, not persistent data
- **Side effect:** Created unused volume

### Attempt 2: Added Environment Variables
- **Added:** `VESPA_CONFIGSERVERS=index` and `VESPA_CONFIGSERVER_JVMARGS`
- **Why it failed:** Caused DNS resolution issues during startup
- **Error:** `Failed to resolve 'index' ([Errno -3] Temporary failure in name resolution)`
- These variables are only for multi-node clusters

## Final Configuration Summary

```yaml
# Vespa service configuration
index:
  image: vespaengine/vespa:8.526.15
  restart: always
  environment:
    - VESPA_SKIP_UPGRADE_CHECK=true  # Only this is needed
  volumes:
    - vespa_volume:/opt/vespa/var    # Documents + indexes
    - vespa_logs:/opt/vespa/logs     # ZooKeeper state

# Volume declarations
volumes:
  vespa_volume:  # Managed by Docker, persists across restarts
  vespa_logs:    # Managed by Docker, persists across restarts
```

## Expected Behavior After Fix

✅ **On First Start:**
- Vespa initializes empty volumes
- Creates ZooKeeper data structures
- Deploys application schema
- Ready to accept documents

✅ **After Indexing:**
- Documents stored in `/opt/vespa/var`
- ZooKeeper tracks document metadata
- Transaction logs written to `/opt/vespa/logs`

✅ **After Restart (docker compose down/up):**
- Volumes remain intact (Docker named volumes persist)
- ZooKeeper reads transaction logs
- Vespa recognizes existing data
- All documents remain indexed

✅ **After Schema Redeployment:**
- Onyx calls `ensure_indices_exist()` on startup
- Vespa updates application configuration
- **Documents are NOT cleared** (schema updates are non-destructive)

## Troubleshooting

### If data STILL disappears after this fix:

1. **Check if you're using `-v` flag:**
   ```bash
   # ❌ This WILL delete volumes
   docker compose down -v
   
   # ✅ This preserves volumes
   docker compose down
   ```

2. **Verify volumes persist:**
   ```bash
   # List volumes before shutdown
   docker volume ls | grep vespa
   
   # Shutdown
   docker compose down
   
   # List volumes after shutdown (should still be there)
   docker volume ls | grep vespa
   ```

3. **Check Windows Docker volume driver:**
   ```bash
   # On Windows, volumes should use local driver
   docker volume inspect onyx-cutom_vespa_volume
   # Look for: "Driver": "local"
   ```

4. **Verify Vespa startup logs:**
   ```bash
   docker compose logs index | grep -i "existing data\|documents found"
   ```

5. **Check Postgres vs Vespa sync:**
   - Postgres `user_files` table stores metadata
   - If Postgres says file is indexed but Vespa has no data, that's the problem
   - Solution: The backend will retry indexing automatically

## Additional Notes

- **Named volumes** (e.g., `vespa_volume:`) are managed by Docker and stored in Docker's volume directory
- On Windows: Usually `C:\ProgramData\Docker\volumes\`
- Volumes persist until explicitly deleted with `docker volume rm` or `docker compose down -v`
- The Vespa container runs as UID 1000, but Docker handles permissions automatically for named volumes

## Success Criteria

After applying this fix, you should be able to:
1. ✅ Index files to Vespa
2. ✅ Restart Docker containers
3. ✅ Files remain indexed and searchable
4. ✅ Direct vector extraction works immediately after restart
5. ✅ No need to re-upload or re-index files

