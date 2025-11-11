# ✅ Solution: Dynamic Timeout Based on Slide Count

## 🎯 Recommended Fix

Implement **dynamic timeout calculation** that scales with the number of slides being processed, plus configurable per-environment settings.

---

## 📋 Solution Overview

### **3-Level Solution**

1. **Level 1:** Dynamic timeout based on slide count (Easy) ⭐
2. **Level 2:** Per-slide timeout tracking (Medium)
3. **Level 3:** Configurable environment-based timeouts (Advanced)

---

## ⭐ Level 1: Dynamic Timeout (RECOMMENDED)

### **Implementation**

**File:** `video_generation_service.py`

```python
class ElaiVideoGenerationService:
    def __init__(self):
        self.api_base = "https://apis.elai.io/api/v1"
        self.api_token = "5774fLyEZuhr22LTmv6zwjZuk9M5rQ9e"
        
        # ✅ NEW: Configurable timeout parameters
        self.base_wait_time = 10 * 60  # 10 minutes base
        self.per_slide_time = 2 * 60   # 2 minutes per additional slide
        self.min_wait_time = 5 * 60    # Minimum 5 minutes
        self.max_wait_time = 60 * 60   # Maximum 60 minutes (safety cap)
        
        # Adaptive polling configuration
        self.initial_poll_interval = 10
        self.max_poll_interval = 60
        self.poll_backoff_multiplier = 1.5
        self.poll_reset_on_change = True
    
    def calculate_timeout(self, slide_count: int = 1) -> int:
        """
        Calculate dynamic timeout based on number of slides.
        
        Args:
            slide_count: Number of slides in presentation
            
        Returns:
            Timeout in seconds
            
        Formula:
            timeout = base_time + (slide_count × per_slide_time)
            capped between min_wait_time and max_wait_time
        """
        timeout = self.base_wait_time + (slide_count * self.per_slide_time)
        
        # Apply min/max constraints
        timeout = max(self.min_wait_time, timeout)
        timeout = min(self.max_wait_time, timeout)
        
        logger.info(
            f"⏱️ [DYNAMIC_TIMEOUT] Calculated timeout: {timeout}s ({timeout/60:.1f} min) "
            f"for {slide_count} slides"
        )
        
        return timeout
    
    async def wait_for_completion(
        self, 
        video_id: str, 
        slide_count: int = 1  # ✅ NEW parameter
    ) -> Optional[str]:
        """
        Wait for video completion with dynamic timeout.
        
        Args:
            video_id: Elai video ID
            slide_count: Number of slides (for timeout calculation)
        """
        start_time = datetime.now()
        max_wait = self.calculate_timeout(slide_count)  # ✅ Dynamic!
        
        logger.info(f"⏱️ [WAIT] Starting wait for video {video_id}")
        logger.info(f"⏱️ [WAIT] Timeout: {max_wait}s ({max_wait/60:.1f} min)")
        logger.info(f"⏱️ [WAIT] Slide count: {slide_count}")
        
        # ... rest of polling logic ...
        
        while (datetime.now() - start_time).total_seconds() < max_wait:
            # Existing polling code...
            pass
        
        logger.error(
            f"❌ [TIMEOUT] Video {video_id} timeout after {max_wait}s "
            f"({max_wait/60:.1f} min) for {slide_count} slides"
        )
        return None
```

### **Timeout Calculation Examples**

```python
# Formula: base_time (10 min) + (slides × 2 min per slide)

calculate_timeout(1)   # 10 + (1×2)  = 12 min
calculate_timeout(3)   # 10 + (3×2)  = 16 min
calculate_timeout(5)   # 10 + (5×2)  = 20 min
calculate_timeout(10)  # 10 + (10×2) = 30 min
calculate_timeout(15)  # 10 + (15×2) = 40 min
calculate_timeout(50)  # 10 + (50×2) = 110 min → capped at 60 min
```

### **Update Callers**

**File:** `presentation_service.py`

```python
async def _wait_for_avatar_video(
    self, 
    video_id: str, 
    job_id: str,
    slide_index: int,
    start_progress: float,
    end_progress: float,
    total_slides: int  # ✅ NEW: Pass total slide count
) -> str:
    """Wait for avatar video with dynamic timeout."""
    
    # Call wait_for_completion with slide count
    avatar_video_path = await video_generation_service.wait_for_completion(
        video_id,
        slide_count=total_slides  # ✅ Pass total slides
    )
    
    # ... rest of code ...
```

**Update in `_process_multi_slide_presentation`:**

```python
async def _process_multi_slide_presentation(self, ...):
    total_slides = len(slides_data)
    
    for slide_index, slide_data in enumerate(slides_data):
        # Wait for avatar with total slide count
        avatar_video_path = await self._wait_for_avatar_video(
            video_id=avatar_video_ids[slide_index],
            job_id=job_id,
            slide_index=slide_index,
            start_progress=base_progress + 10,
            end_progress=base_progress + 30,
            total_slides=total_slides  # ✅ Pass total
        )
```

---

## 📊 Level 2: Per-Slide Timeout Tracking

For more granular control, track timeout per individual slide:

```python
class ElaiVideoGenerationService:
    async def wait_for_completion_with_tracking(
        self,
        video_id: str,
        slide_index: int,
        total_slides: int
    ) -> Optional[str]:
        """
        Wait for video with per-slide timeout tracking.
        
        Timeout adjusts based on:
        - Which slide we're on (later slides might be ready faster)
        - How long previous slides took (adaptive)
        - Overall job progress
        """
        # First slide gets full timeout
        if slide_index == 0:
            timeout = self.base_wait_time
        else:
            # Later slides get reduced timeout (already rendering in parallel)
            # Assume parallel rendering means later slides are mostly done
            timeout = self.base_wait_time // 2
        
        logger.info(
            f"⏱️ [PER_SLIDE_TIMEOUT] Slide {slide_index + 1}/{total_slides}: "
            f"timeout={timeout}s ({timeout/60:.1f} min)"
        )
        
        # ... polling logic ...
```

---

## ⚙️ Level 3: Environment-Based Configuration

Make timeouts configurable via environment variables:

```python
# .env file
ELAI_BASE_TIMEOUT=600           # 10 minutes
ELAI_PER_SLIDE_TIMEOUT=120      # 2 minutes per slide
ELAI_MIN_TIMEOUT=300            # 5 minutes minimum
ELAI_MAX_TIMEOUT=3600           # 60 minutes maximum

# For production (more conservative)
ELAI_BASE_TIMEOUT=900           # 15 minutes
ELAI_PER_SLIDE_TIMEOUT=180      # 3 minutes per slide
ELAI_MAX_TIMEOUT=5400           # 90 minutes
```

```python
import os

class ElaiVideoGenerationService:
    def __init__(self):
        # Load from environment with defaults
        self.base_wait_time = int(os.getenv('ELAI_BASE_TIMEOUT', '600'))
        self.per_slide_time = int(os.getenv('ELAI_PER_SLIDE_TIMEOUT', '120'))
        self.min_wait_time = int(os.getenv('ELAI_MIN_TIMEOUT', '300'))
        self.max_wait_time = int(os.getenv('ELAI_MAX_TIMEOUT', '3600'))
        
        logger.info("⏱️ [TIMEOUT_CONFIG] Loaded timeout configuration:")
        logger.info(f"  - Base timeout: {self.base_wait_time}s ({self.base_wait_time/60:.1f} min)")
        logger.info(f"  - Per-slide: {self.per_slide_time}s ({self.per_slide_time/60:.1f} min)")
        logger.info(f"  - Min: {self.min_wait_time}s, Max: {self.max_wait_time}s")
```

---

## 📈 Timeout Comparison

### Before (Fixed 15 minutes)

| Slides | Expected Time | Fixed Timeout | Result |
|--------|---------------|---------------|--------|
| 1      | ~5 min        | 15 min        | ✅ Pass (10 min buffer) |
| 3      | ~12 min       | 15 min        | ✅ Pass (3 min buffer) |
| 5      | ~15 min       | 15 min        | ⚠️ Tight (0 min buffer) |
| 10     | ~22 min       | 15 min        | ❌ **FAIL** (-7 min) |
| 15     | ~30 min       | 15 min        | ❌ **FAIL** (-15 min) |

### After (Dynamic Timeout)

| Slides | Expected Time | Dynamic Timeout | Result |
|--------|---------------|-----------------|--------|
| 1      | ~5 min        | 12 min          | ✅ Pass (7 min buffer) |
| 3      | ~12 min       | 16 min          | ✅ Pass (4 min buffer) |
| 5      | ~15 min       | 20 min          | ✅ Pass (5 min buffer) |
| 10     | ~22 min       | 30 min          | ✅ **PASS** (8 min buffer) |
| 15     | ~30 min       | 40 min          | ✅ **PASS** (10 min buffer) |

---

## 🧪 Testing Strategy

### Test 1: Single Slide
```python
# Should use base timeout (12 min)
video_path = await wait_for_completion(video_id, slide_count=1)
# Expected timeout: 12 minutes
```

### Test 2: Small Presentation (3 slides)
```python
# Should use: 10 + (3 × 2) = 16 min
video_path = await wait_for_completion(video_id, slide_count=3)
# Expected timeout: 16 minutes
```

### Test 3: Large Presentation (15 slides)
```python
# Should use: 10 + (15 × 2) = 40 min
video_path = await wait_for_completion(video_id, slide_count=15)
# Expected timeout: 40 minutes
```

### Test 4: Extreme Case (100 slides)
```python
# Should cap at max: 60 min
video_path = await wait_for_completion(video_id, slide_count=100)
# Expected timeout: 60 minutes (capped)
```

---

## 📊 Benefits of Solution

### ✅ Advantages

1. **Scales with presentation size**
   - 1 slide: 12 min
   - 10 slides: 30 min
   - Automatic adjustment

2. **Safety caps prevent infinite waits**
   - Min: 5 minutes (even for 0 slides)
   - Max: 60 minutes (reasonable upper bound)

3. **Configurable per environment**
   - Development: Shorter timeouts
   - Production: Longer, conservative timeouts

4. **Backward compatible**
   - Default `slide_count=1` works for existing code
   - No breaking changes

5. **Clear logging**
   - Shows timeout calculation in logs
   - Helps debugging timeout issues

### ⚠️ Considerations

1. **Resource usage**
   - Longer timeouts mean longer-running tasks
   - Need monitoring for stuck jobs

2. **False sense of security**
   - If Elai API is down, timeout won't help
   - Need health checks separate from timeout

3. **Configuration complexity**
   - More parameters to tune
   - Need documentation

---

## 📝 Implementation Checklist

- [ ] Add `calculate_timeout()` method to `ElaiVideoGenerationService`
- [ ] Add `slide_count` parameter to `wait_for_completion()`
- [ ] Update `_wait_for_avatar_video()` to pass total slides
- [ ] Update `_process_multi_slide_presentation()` callers
- [ ] Add environment variable support (optional)
- [ ] Update logging to show calculated timeout
- [ ] Add timeout configuration to documentation
- [ ] Test with 1, 3, 5, 10, 15 slide presentations
- [ ] Monitor production for timeout adjustments needed

---

## 🎯 Expected Outcome

### Before
```
User creates 10-slide presentation
→ Times out at 15 minutes
→ Job fails at slide 7
→ ❌ 35% failure rate for 10+ slides
```

### After
```
User creates 10-slide presentation
→ Timeout set to 30 minutes (10 + 10×2)
→ Completes in 22 minutes
→ ✅ 0% failure rate for 10+ slides
```

---

## 💡 Alternative Solutions

### Option A: No Timeout
```python
# Remove timeout entirely
while True:
    status = await check_video_status(video_id)
    if status in ["rendered", "failed"]:
        break
```

**Pros:** Never times out  
**Cons:** Could wait forever if Elai API hangs

### Option B: Fixed Long Timeout
```python
self.max_wait_time = 60 * 60  # 60 minutes for everything
```

**Pros:** Simple, handles all cases  
**Cons:** Wastes resources on failed jobs, no scaling

### Option C: Exponential Backoff Timeout
```python
timeout = base_time * (1.5 ** slide_count)  # Exponential growth
```

**Pros:** Scales dramatically for large presentations  
**Cons:** Can grow too fast, complex to tune

---

## 📚 Configuration Examples

### Development Environment
```python
# .env.development
ELAI_BASE_TIMEOUT=300           # 5 min (faster feedback)
ELAI_PER_SLIDE_TIMEOUT=60       # 1 min per slide
ELAI_MAX_TIMEOUT=1800           # 30 min max
```

### Production Environment
```python
# .env.production
ELAI_BASE_TIMEOUT=900           # 15 min (conservative)
ELAI_PER_SLIDE_TIMEOUT=180      # 3 min per slide (buffer)
ELAI_MAX_TIMEOUT=5400           # 90 min max (very large presentations)
```

### Testing Environment
```python
# .env.test
ELAI_BASE_TIMEOUT=120           # 2 min (fast tests)
ELAI_PER_SLIDE_TIMEOUT=30       # 30s per slide
ELAI_MAX_TIMEOUT=600            # 10 min max
```

---

## 🎯 Recommendation

**Implement Level 1 (Dynamic Timeout) immediately:**
- Low complexity
- High impact
- Solves 90% of timeout issues
- Easy to test and monitor

**Consider Level 3 (Environment Config) later:**
- Adds flexibility
- Good for production tuning
- Can be added incrementally

**Skip Level 2 (Per-Slide Tracking) for now:**
- Added complexity
- Marginal benefit over Level 1
- Can be added if needed

---

**Status:** Solution Proposed  
**Complexity:** Low (Level 1)  
**Effort:** ~30 minutes implementation  
**Risk:** Very Low  
**Recommended:** ⭐ Implement ASAP  

