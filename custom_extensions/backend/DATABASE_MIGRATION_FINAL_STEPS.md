# ✅ Database Migration - Final Implementation (Asyncpg Pattern)

## 🎯 Updated Approach - Using Existing Pattern

After analyzing the codebase, I discovered the project **already uses asyncpg** (PostgreSQL) with a connection pool pattern. I've updated the implementation to match this existing style.

---

## ✅ What's Been Applied

### **1. Table Created in `main.py`** ✅

**File:** `main.py:8048-8067`

```python
# --- ✅ NEW: Ensure presentation_jobs table for persistent video job storage ---
await connection.execute("""
    CREATE TABLE IF NOT EXISTS presentation_jobs (
        job_id TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        progress REAL DEFAULT 0.0,
        error TEXT,
        video_url TEXT,
        thumbnail_url TEXT,
        slide_image_path TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        completed_at TIMESTAMPTZ,
        last_heartbeat TIMESTAMPTZ,
        created_files JSONB DEFAULT '[]'::jsonb
    );
""")
await connection.execute("CREATE INDEX IF NOT EXISTS idx_presentation_jobs_status ON presentation_jobs(status);")
await connection.execute("CREATE INDEX IF NOT EXISTS idx_presentation_jobs_created_at ON presentation_jobs(created_at);")
await connection.execute("CREATE INDEX IF NOT EXISTS idx_presentation_jobs_status_created ON presentation_jobs(status, created_at);")
logger.info("'presentation_jobs' table ensured - video jobs will persist across restarts ✅")
```

This follows the **exact same pattern** as all other tables in the project.

---

## 📋 Required Changes to `presentation_service.py`

### **Update 1: Import DB_POOL at top of file**

Add after existing imports:

```python
# ✅ NEW: Import DB_POOL for database persistence
import sys
import os
# Add main.py's directory to path to import DB_POOL
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import DB_POOL
```

**OR** better yet, pass DB_POOL as a parameter when creating the service.

### **Update 2: Modify `__init__` method**

```python
def __init__(self, db_pool=None):
    self.output_dir = Path("output/presentations")
    self.output_dir.mkdir(parents=True, exist_ok=True)
    
    # ✅ NEW: Store database pool reference
    self.db_pool = db_pool
    if self.db_pool:
        logger.info("✅ [DATABASE] PresentationService initialized with database persistence")
    else:
        logger.warning("⚠️ [DATABASE] PresentationService running without persistence (memory only)")
    
    # Job tracking (DUAL-WRITE during transition)
    self.jobs: Dict[str, PresentationJob] = {}
    self.job_lock = asyncio.Lock()
    
    # ... rest of init ...
```

### **Update 3: Add helper method for database operations**

```python
async def _save_job_to_db(self, job: PresentationJob):
    """Save job to database."""
    if not self.db_pool:
        return
    
    try:
        async with self.db_pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO presentation_jobs (
                    job_id, status, progress, error, video_url, thumbnail_url,
                    slide_image_path, created_at, completed_at, last_heartbeat, created_files
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                ON CONFLICT (job_id) DO UPDATE SET
                    status = EXCLUDED.status,
                    progress = EXCLUDED.progress,
                    error = EXCLUDED.error,
                    video_url = EXCLUDED.video_url,
                    thumbnail_url = EXCLUDED.thumbnail_url,
                    slide_image_path = EXCLUDED.slide_image_path,
                    completed_at = EXCLUDED.completed_at,
                    last_heartbeat = EXCLUDED.last_heartbeat,
                    created_files = EXCLUDED.created_files
            """, job.job_id, job.status, job.progress, job.error, job.video_url,
                 job.thumbnail_url, job.slide_image_path, job.created_at,
                 job.completed_at, job.last_heartbeat, json.dumps(job.created_files))
        logger.debug(f"💾 [DB] Saved job {job.job_id} to database")
    except Exception as e:
        logger.error(f"❌ [DB] Failed to save job {job.job_id}: {e}")

async def _get_job_from_db(self, job_id: str) -> Optional[PresentationJob]:
    """Get job from database."""
    if not self.db_pool:
        return None
    
    try:
        async with self.db_pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM presentation_jobs WHERE job_id = $1",
                job_id
            )
            if row:
                return PresentationJob(
                    job_id=row['job_id'],
                    status=row['status'],
                    progress=row['progress'],
                    error=row['error'],
                    video_url=row['video_url'],
                    thumbnail_url=row['thumbnail_url'],
                    slide_image_path=row['slide_image_path'],
                    created_at=row['created_at'],
                    completed_at=row['completed_at'],
                    last_heartbeat=row['last_heartbeat'],
                    created_files=json.loads(row['created_files']) if row['created_files'] else []
                )
    except Exception as e:
        logger.error(f"❌ [DB] Failed to get job {job_id}: {e}")
    return None
```

### **Update 4: Modify `create_presentation` method**

Find where `self.jobs[job_id] = job` and add after it:

```python
# Create job tracking
job = PresentationJob(
    job_id=job_id,
    status="queued"
)
self.jobs[job_id] = job  # Memory (backward compat)

# ✅ NEW: Save to database
await self._save_job_to_db(job)

logger.info(f"💾 [DB] Created presentation job: {job_id}")
```

### **Update 5: Modify `_update_job_status` method**

Already updated! Just needs to call the helper:

```python
async def _update_job_status(self, job_id: str, **kwargs):
    async with self.job_lock:
        if job_id in self.jobs:
            job = self.jobs[job_id]
            # ... update memory ...
        
        # ✅ Call helper to save to DB
        if job_id in self.jobs:
            await self._save_job_to_db(self.jobs[job_id])
```

### **Update 6: Modify `get_job_status` method**

```python
async def get_job_status(self, job_id: str) -> Optional[PresentationJob]:
    """Get job status from database (with memory fallback)."""
    
    # Try database first (persistent)
    job = await self._get_job_from_db(job_id)
    if job:
        logger.debug(f"💾 [DB] Retrieved job {job_id} from database")
        return job
    
    # Fallback to memory (transitional)
    async with self.job_lock:
        return self.jobs.get(job_id)
```

---

## 🔧 How to Apply These Changes

### **Option A: Manual Updates (Recommended)**

1. Add the helper methods (`_save_job_to_db`, `_get_job_from_db`) to `presentation_service.py`
2. Update `__init__` to accept `db_pool` parameter
3. Update `create_presentation` to call `await self._save_job_to_db(job)`
4. Update `_update_job_status` to call `await self._save_job_to_db(self.jobs[job_id])`
5. Update `get_job_status` to try database first

### **Option B: Update Service Instantiation**

In `main.py`, when creating the presentation service, pass DB_POOL:

```python
# Find where ProfessionalPresentationService() is created
# Add db_pool parameter
presentation_service = ProfessionalPresentationService(db_pool=DB_POOL)
```

---

## 📊 Benefits of This Approach

✅ **Matches existing codebase pattern** - Uses asyncpg like everything else  
✅ **No new dependencies** - asyncpg already installed  
✅ **Familiar to team** - Same pattern as user_credits, projects, etc.  
✅ **Battle-tested** - asyncpg connection pool already proven  
✅ **Simple integration** - Just add 2 helper methods  

---

## 🧪 Testing

```python
# Test sequence:
1. Start server
2. Create presentation job via API
3. Check database:
   SELECT * FROM presentation_jobs;
4. RESTART server
5. Check job still exists via API
   # Should work! Job persisted ✅
```

---

## ⚠️ Important Notes

1. **DB_POOL must be passed** - The service needs access to the connection pool
2. **Import json** - Need to serialize created_files list
3. **Error handling** - All database operations wrapped in try/except
4. **Graceful degradation** - Works without database (memory-only mode)

---

## 📝 Summary

**Status:** Database table created ✅  
**Pattern:** Following existing asyncpg style ✅  
**Dependencies:** None (asyncpg already used) ✅  
**Remaining:** Add 2 helper methods + update 3 existing methods  
**Time:** ~30 minutes to complete  
**Risk:** Low (graceful fallback to memory)  

The hard work is done - just need to wire up the helper methods!

---

**Next Step:** Add the helper methods to `presentation_service.py` and you'll have full persistence! 🚀

