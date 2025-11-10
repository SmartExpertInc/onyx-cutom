# 🔧 Race Condition Fix - Implementation Guide

## 🎯 Quick Summary

**Problem:** Multiple async tasks and threads modify `self.jobs` dictionary simultaneously  
**Solution:** Add `asyncio.Lock` to synchronize access  
**Time to implement:** ~30 minutes  
**Files to modify:** 1 file (`presentation_service.py`)  

---

## 📝 Step-by-Step Implementation

### **Step 1: Add Lock to Service** (1 line)

**Location:** `presentation_service.py:77` (in `__init__` method)

```python
class ProfessionalPresentationService:
    def __init__(self):
        self.jobs: Dict[str, PresentationJob] = {}
        self.heartbeat_tasks: Dict[str, asyncio.Task] = {}
        self.heartbeat_interval = 5  # seconds
        self.job_lock = asyncio.Lock()  # 🆕 ADD THIS LINE
        
        self.output_dir = Path("output/presentations")
        # ... rest of init ...
```

---

### **Step 2: Make _update_job_status Async** (3 changes)

**Location:** `presentation_service.py:88`

**Change 1: Function signature**
```python
# Before:
def _update_job_status(self, job_id: str, **kwargs):

# After:
async def _update_job_status(self, job_id: str, **kwargs):  # 🆕 async
```

**Change 2: Add lock**
```python
async def _update_job_status(self, job_id: str, **kwargs):
    """Thread-safe job status update."""
    async with self.job_lock:  # 🆕 ADD THIS
        if job_id in self.jobs:
            job = self.jobs[job_id]
            old_status = job.status
            old_progress = job.progress
            
            for key, value in kwargs.items():
                setattr(job, key, value)
            
            # ... rest of existing code ...
```

**Change 3: Update all callers (25+ locations)**
```python
# Find all:
self._update_job_status(

# Replace with:
await self._update_job_status(
```

**Locations to change:**
- Line 323: `await self._update_job_status(job_id, status="processing", progress=5.0)`
- Line 328: `await self._update_job_status(job_id, progress=10.0)`
- Line 425: `await self._update_job_status(job_id, ...)`
- Line 462: `await self._update_job_status(job_id, ...)`
- Line 522: `await self._update_job_status(job_id, progress=90.0)`
- Line 548: `await self._update_job_status(job_id, progress=40.0)`
- ... (search for all occurrences)

---

### **Step 3: Protect Heartbeat Access**

**Location:** `presentation_service.py:124-146`

```python
async def heartbeat_task():
    """Send periodic heartbeat updates to keep connection alive."""
    logger.info(f"💓 [HEARTBEAT] Heartbeat task started for job {job_id}")
    try:
        heartbeat_count = 0
        while True:  # Changed from "while job_id in self.jobs"
            async with self.job_lock:  # 🆕 ADD THIS LOCK
                # Check if job still exists
                if job_id not in self.jobs:
                    logger.info(f"💓 [HEARTBEAT] Job {job_id} removed, stopping heartbeat")
                    break
                
                job = self.jobs[job_id]
                heartbeat_count += 1
                
                # Only send heartbeats for active jobs
                if job.status in ["processing"]:
                    logger.info(f"💓 [HEARTBEAT] Job {job_id}: status={job.status}, progress={job.progress}% (beat #{heartbeat_count})")
                    logger.info(f"💓 [HEARTBEAT] Keeping connection alive - {datetime.now().isoformat()}")
                    job.last_heartbeat = datetime.now()
                elif job.status in ["completed", "failed"]:
                    logger.info(f"💓 [HEARTBEAT] Job {job_id} finished with status {job.status}, stopping heartbeat")
                    break
                else:
                    logger.info(f"💓 [HEARTBEAT] Job {job_id} status is {job.status}, continuing heartbeat")
            
            # Sleep OUTSIDE the lock
            await asyncio.sleep(self.heartbeat_interval)
            
    except asyncio.CancelledError:
        logger.info(f"💓 [HEARTBEAT] Heartbeat task cancelled for job {job_id}")
        raise
    except Exception as e:
        logger.error(f"💓 [HEARTBEAT] Heartbeat task failed for job {job_id}: {e}")
```

**Key changes:**
- ✅ Moved `if job_id not in self.jobs` check inside lock
- ✅ Wrapped all job access with `async with self.job_lock:`
- ✅ Kept `await asyncio.sleep()` OUTSIDE the lock (important!)

---

### **Step 4: Protect Threaded Access**

**Location:** `presentation_service.py:254-257`

```python
def run_blocking_processing():
    """Run the processing in a separate thread."""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(self._process_presentation(job_id, request))
        
    except Exception as e:
        logger.error(f"Thread processing failed for {job_id}: {e}")
        
        # 🆕 NEW: Thread-safe status update
        async def update_failed_status():
            async with self.job_lock:
                if job_id in self.jobs:
                    self.jobs[job_id].status = "failed"
                    self.jobs[job_id].error = str(e)
                    self.jobs[job_id].completed_at = datetime.now()
        
        # Run in new event loop (thread-safe)
        main_loop = asyncio.new_event_loop()
        main_loop.run_until_complete(update_failed_status())
        main_loop.run_until_complete(self._stop_heartbeat(job_id))
        main_loop.run_until_complete(
            self._schedule_job_cleanup(job_id, delay_minutes=5)
        )
        main_loop.close()
```

---

### **Step 5: Protect Job Retrieval**

**Location:** `presentation_service.py:222`

```python
async def get_job_status(self, job_id: str) -> Optional[PresentationJob]:
    """Get the status of a presentation job (thread-safe)."""
    async with self.job_lock:  # 🆕 ADD THIS
        return self.jobs.get(job_id)
```

---

### **Step 6: Protect Job Deletion**

**Location:** `presentation_service.py:2503-2525`

```python
async def _schedule_job_cleanup(self, job_id: str, delay_minutes: int = 5):
    """Schedule cleanup of a completed job after a delay."""
    try:
        await asyncio.sleep(delay_minutes * 60)
        
        async with self.job_lock:  # 🆕 ADD THIS
            # Check if job still exists and is completed
            if job_id in self.jobs:
                job = self.jobs[job_id]
                if job.status in ["completed", "failed"]:
                    logger.info(f"🧹 [CLEANUP] Starting cleanup for job: {job_id}")
                    
                    # Clean up all tracked files
                    for file_path in job.created_files:
                        try:
                            if os.path.exists(file_path):
                                size_mb = os.path.getsize(file_path) / (1024*1024)
                                os.remove(file_path)
                                logger.info(f"🧹 Видалено: {os.path.basename(file_path)} ({size_mb:.1f}MB)")
                        except Exception as e:
                            logger.error(f"🧹 Не вдалося видалити {file_path}: {e}")
                    
                    # Stop any remaining heartbeat tasks
                    if job_id in self.heartbeat_tasks:
                        self.heartbeat_tasks[job_id].cancel()
                        del self.heartbeat_tasks[job_id]
                    
                    # Remove job from memory
                    del self.jobs[job_id]
                    logger.info(f"🧹 [CLEANUP] Job {job_id} видалено з пам'яті (активних: {len(self.jobs)})")
                    
    except Exception as e:
        logger.error(f"🧹 [CLEANUP] Помилка очищення {job_id}: {e}")
```

---

## ✅ Verification Checklist

After implementing, verify:

- [ ] `self.job_lock = asyncio.Lock()` added to `__init__`
- [ ] `_update_job_status` changed to `async def`
- [ ] All `self._update_job_status(` calls changed to `await self._update_job_status(`
- [ ] Heartbeat task wraps job access with `async with self.job_lock:`
- [ ] Threaded access uses async helper function
- [ ] `get_job_status` uses lock
- [ ] `_schedule_job_cleanup` uses lock for deletion
- [ ] No linter errors: `read_lints presentation_service.py`
- [ ] All tests pass

---

## 🧪 Testing

### Test 1: Manual Test
```bash
# Start server
python -m uvicorn app.main:app --reload

# Create a video
# Monitor logs for:
# - No progress going backward
# - Heartbeat shows correct progress
# - Job completes cleanly
```

### Test 2: Check Logs
```bash
# Should see clean progression
grep "JOB_STATUS_UPDATE" logs/backend.log | tail -20

# Should see heartbeat with consistent progress
grep "HEARTBEAT" logs/backend.log | tail -20
```

### Test 3: Concurrent Requests
```bash
# Send 5 video generation requests simultaneously
for i in {1..5}; do
  curl -X POST http://localhost:8000/api/custom/presentations \
    -H "Content-Type: application/json" \
    -d '{"slides_data": [...], "avatar_code": "mikhailo"}' &
done

# Check logs for any race condition errors
grep -i "error\|race\|conflict" logs/backend.log
```

---

## 🚨 Common Mistakes to Avoid

### ❌ Mistake 1: Forgetting `await`
```python
# Wrong:
self._update_job_status(job_id, progress=50)

# Correct:
await self._update_job_status(job_id, progress=50)
```

### ❌ Mistake 2: Sleeping Inside Lock
```python
# Wrong:
async with self.job_lock:
    job.progress = 50
    await asyncio.sleep(5)  # Blocks all other job updates for 5 seconds!

# Correct:
async with self.job_lock:
    job.progress = 50
# Sleep outside lock
await asyncio.sleep(5)
```

### ❌ Mistake 3: Nested Lock Acquisition
```python
# Wrong (can deadlock):
async def method_a():
    async with self.job_lock:
        await method_b()  # method_b also tries to acquire lock!

# Correct (acquire once):
async def method_a():
    async with self.job_lock:
        # Do both operations under same lock
        pass
```

### ❌ Mistake 4: Lock in Wrong Scope
```python
# Wrong (lock not protecting the read):
job = self.jobs[job_id]  # Read outside lock
async with self.job_lock:
    job.progress = 50  # Write inside lock

# Correct (both inside lock):
async with self.job_lock:
    job = self.jobs[job_id]  # Read inside lock
    job.progress = 50  # Write inside lock
```

---

## 📊 Expected Changes Summary

| File | Lines Added | Lines Modified | Risk |
|------|-------------|----------------|------|
| `presentation_service.py` | ~10 | ~30 | Low |

**Total time:** 30-45 minutes  
**Testing time:** 15 minutes  
**Risk level:** Low (non-breaking change)  

---

## 🔄 Rollback Plan

If issues occur:

1. **Remove lock from init:**
   ```python
   # Delete line:
   self.job_lock = asyncio.Lock()
   ```

2. **Revert `_update_job_status` to sync:**
   ```python
   # Change back to:
   def _update_job_status(self, job_id: str, **kwargs):
       # Remove: async with self.job_lock
   ```

3. **Remove all `await` keywords:**
   ```bash
   # Find and replace:
   await self._update_job_status(
   # With:
   self._update_job_status(
   ```

4. **Remove locks from heartbeat and cleanup**

---

## 📞 Support

If you encounter issues:
1. Check logs for deadlocks: `grep -i "deadlock\|timeout" logs/backend.log`
2. Verify all `await` keywords added correctly
3. Ensure no long operations inside locks
4. Test with single request first, then concurrent

---

**Status:** Ready to implement  
**Estimated time:** 45 minutes  
**Risk:** Low  
**Benefit:** Eliminates race conditions completely  

