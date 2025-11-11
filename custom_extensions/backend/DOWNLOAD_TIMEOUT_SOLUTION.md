# ✅ Solution: Dynamic Download Timeout with Retry Logic

## 🎯 Recommended Fix

Implement **dynamic timeout calculation** based on expected file size, plus **retry logic with exponential backoff** for transient network failures.

---

## 📋 Solution Overview

### **3-Level Solution**

1. **Level 1:** Dynamic timeout based on file size (RECOMMENDED) ⭐
2. **Level 2:** Streaming download with chunk timeout (Advanced)
3. **Level 3:** Retry logic with exponential backoff (Resilience)

---

## ⭐ Level 1: Dynamic Timeout Based on File Size (RECOMMENDED)

### **Implementation**

**File:** `video_generation_service.py`

```python
class ElaiVideoGenerationService:
    def __init__(self):
        # ... existing code ...
        
        # ✅ NEW: Dynamic download timeout configuration
        self.min_download_timeout = 60          # Minimum 1 minute
        self.base_download_timeout = 5 * 60     # Base 5 minutes
        self.timeout_per_mb = 2                 # 2 seconds per MB
        self.max_download_timeout = 30 * 60     # Maximum 30 minutes (safety cap)
    
    def calculate_download_timeout(self, file_size_bytes: int) -> float:
        """
        Calculate dynamic download timeout based on expected file size.
        
        Args:
            file_size_bytes: Expected file size in bytes
            
        Returns:
            Timeout in seconds
            
        Formula:
            timeout = base_timeout + (file_size_mb × timeout_per_mb)
            capped between min_download_timeout and max_download_timeout
            
        Examples:
            10 MB  → 320 seconds (5.3 min)
            50 MB  → 400 seconds (6.7 min)
            200 MB → 700 seconds (11.7 min)
            500 MB → 1300 seconds (21.7 min)
        """
        if file_size_bytes <= 0:
            # If size unknown, use base timeout
            logger.warning("File size unknown, using base timeout")
            return self.base_download_timeout
        
        file_size_mb = file_size_bytes / (1024 * 1024)
        timeout = self.base_download_timeout + (file_size_mb * self.timeout_per_mb)
        
        # Apply min/max constraints
        timeout = max(self.min_download_timeout, timeout)
        timeout = min(self.max_download_timeout, timeout)
        
        logger.info(
            f"⏱️ [DOWNLOAD_TIMEOUT] Calculated timeout: {timeout}s ({timeout/60:.1f} min) "
            f"for {file_size_mb:.1f} MB file"
        )
        
        return timeout
    
    async def download_video(self, download_url: str, output_path: str) -> bool:
        """
        Download the rendered video to local storage with dynamic timeout.
        
        Args:
            download_url: The URL to download the video from
            output_path: Path where to save the video
            
        Returns:
            True if download successful, False otherwise
        """
        client = self._get_client()
        if not client:
            logger.error("HTTP client not available")
            return False
        
        try:
            logger.info(f"📥 [DOWNLOAD] Starting video download")
            logger.info(f"📥 [DOWNLOAD] URL: {download_url}")
            logger.info(f"📥 [DOWNLOAD] Output: {output_path}")
            
            # ✅ STEP 1: HEAD request to get file size (with short timeout)
            try:
                head_response = await client.head(download_url, timeout=30)
                expected_size = int(head_response.headers.get('content-length', 0))
                
                if expected_size > 0:
                    logger.info(f"📥 [DOWNLOAD] Expected file size: {expected_size / (1024*1024):.2f} MB")
                    
                    # Calculate dynamic timeout based on file size
                    download_timeout = self.calculate_download_timeout(expected_size)
                else:
                    logger.warning("📥 [DOWNLOAD] File size not available from headers")
                    download_timeout = self.base_download_timeout
                    
            except Exception as e:
                logger.warning(f"📥 [DOWNLOAD] HEAD request failed: {e}, using base timeout")
                download_timeout = self.base_download_timeout
            
            # ✅ STEP 2: Download with dynamic timeout
            logger.info(f"⏱️ [DOWNLOAD] Using timeout: {download_timeout}s ({download_timeout/60:.1f} min)")
            
            start_time = datetime.now()
            response = await client.get(download_url, timeout=download_timeout)  # ✅ Dynamic!
            response.raise_for_status()
            
            # Get total size for progress tracking
            total_size = int(response.headers.get('content-length', 0))
            downloaded_size = 0
            
            # Create output directory if it doesn't exist
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Download the video with progress logging
            logger.info(f"📥 [DOWNLOAD] Starting file transfer...")
            with open(output_path, 'wb') as f:
                async for chunk in response.aiter_bytes(chunk_size=8192):
                    f.write(chunk)
                    downloaded_size += len(chunk)
                    
                    if total_size > 0:
                        progress = (downloaded_size / total_size) * 100
                        # Log every 10% progress
                        if downloaded_size % (total_size // 10) < 8192:
                            elapsed = (datetime.now() - start_time).total_seconds()
                            speed_mbps = (downloaded_size / (1024*1024)) / elapsed
                            logger.info(
                                f"📥 [DOWNLOAD] Progress: {progress:.1f}% "
                                f"({downloaded_size/(1024*1024):.1f}/{total_size/(1024*1024):.1f} MB) "
                                f"Speed: {speed_mbps:.2f} MB/s"
                            )
            
            elapsed_total = (datetime.now() - start_time).total_seconds()
            final_size = os.path.getsize(output_path) / (1024*1024)
            avg_speed = final_size / elapsed_total
            
            logger.info(f"✅ [DOWNLOAD] Video downloaded successfully")
            logger.info(f"✅ [DOWNLOAD] File: {output_path}")
            logger.info(f"✅ [DOWNLOAD] Size: {final_size:.2f} MB")
            logger.info(f"✅ [DOWNLOAD] Time: {elapsed_total:.1f}s ({elapsed_total/60:.1f} min)")
            logger.info(f"✅ [DOWNLOAD] Avg speed: {avg_speed:.2f} MB/s")
            
            return True
            
        except httpx.TimeoutException as e:
            logger.error(
                f"❌ [DOWNLOAD] Timeout after {download_timeout}s "
                f"({download_timeout/60:.1f} min): {str(e)}"
            )
            return False
        except Exception as e:
            logger.error(f"❌ [DOWNLOAD] Error: {str(e)}")
            return False
        finally:
            await client.aclose()
```

---

## 📊 Level 2: Streaming Download with Chunk Timeout

For even more resilience, use separate timeouts for connection vs. data transfer:

```python
import httpx

async def download_video_with_chunk_timeout(
    self, 
    download_url: str, 
    output_path: str
) -> bool:
    """
    Download with separate connection and read timeouts.
    """
    try:
        # Separate timeouts for different phases
        timeout_config = httpx.Timeout(
            connect=60.0,       # 60 seconds to establish connection
            read=30.0,          # 30 seconds between chunks (not total!)
            write=30.0,         # 30 seconds for write operations
            pool=None           # No pool timeout
        )
        
        async with httpx.AsyncClient(timeout=timeout_config) as client:
            logger.info(f"📥 [DOWNLOAD] Using chunk-based timeout")
            logger.info(f"📥 [DOWNLOAD] Connect timeout: 60s")
            logger.info(f"📥 [DOWNLOAD] Read timeout: 30s per chunk")
            
            async with client.stream('GET', download_url) as response:
                response.raise_for_status()
                
                total_size = int(response.headers.get('content-length', 0))
                downloaded_size = 0
                
                os.makedirs(os.path.dirname(output_path), exist_ok=True)
                
                with open(output_path, 'wb') as f:
                    async for chunk in response.aiter_bytes(chunk_size=1024*1024):  # 1MB chunks
                        f.write(chunk)
                        downloaded_size += len(chunk)
                        
                        if total_size > 0:
                            progress = (downloaded_size / total_size) * 100
                            logger.info(f"📥 Progress: {progress:.1f}%")
                
                logger.info(f"✅ [DOWNLOAD] Completed: {downloaded_size/(1024*1024):.2f} MB")
                return True
                
    except httpx.ReadTimeout:
        logger.error("❌ [DOWNLOAD] Read timeout: No data received for 30 seconds")
        return False
    except httpx.ConnectTimeout:
        logger.error("❌ [DOWNLOAD] Connect timeout: Could not establish connection")
        return False
    except Exception as e:
        logger.error(f"❌ [DOWNLOAD] Error: {str(e)}")
        return False
```

**Benefits:**
- Timeout resets with each chunk (not total time)
- Can download 10GB file as long as chunks arrive within 30s
- More resilient to large files

---

## 🔄 Level 3: Retry Logic with Exponential Backoff

Add automatic retries for transient failures:

```python
async def download_video_with_retry(
    self,
    download_url: str,
    output_path: str,
    max_retries: int = 3
) -> bool:
    """
    Download video with automatic retry on failure.
    
    Args:
        download_url: URL to download from
        output_path: Where to save the file
        max_retries: Maximum number of retry attempts
        
    Returns:
        True if successful, False if all retries exhausted
    """
    for attempt in range(1, max_retries + 1):
        logger.info(f"📥 [DOWNLOAD] Attempt {attempt}/{max_retries}")
        
        try:
            # Try to download
            success = await self.download_video(download_url, output_path)
            
            if success:
                logger.info(f"✅ [DOWNLOAD] Success on attempt {attempt}")
                return True
            else:
                # Download returned False (timeout or error)
                if attempt < max_retries:
                    # Calculate exponential backoff delay
                    delay = min(2 ** attempt, 60)  # Cap at 60 seconds
                    logger.warning(
                        f"⚠️ [DOWNLOAD] Attempt {attempt} failed, "
                        f"retrying in {delay}s..."
                    )
                    await asyncio.sleep(delay)
                else:
                    logger.error(f"❌ [DOWNLOAD] All {max_retries} attempts failed")
                    return False
                    
        except Exception as e:
            logger.error(f"❌ [DOWNLOAD] Attempt {attempt} exception: {str(e)}")
            
            if attempt < max_retries:
                delay = min(2 ** attempt, 60)
                logger.warning(f"⚠️ [DOWNLOAD] Retrying in {delay}s...")
                await asyncio.sleep(delay)
            else:
                logger.error(f"❌ [DOWNLOAD] All {max_retries} attempts exhausted")
                return False
    
    return False
```

**Retry Schedule:**
```
Attempt 1: Immediate
Attempt 2: Wait 2 seconds
Attempt 3: Wait 4 seconds
Attempt 4: Wait 8 seconds
```

---

## 📊 Timeout Comparison

### Before (Fixed 5 minutes)

| File Size | Expected Time | Fixed Timeout | Result |
|-----------|---------------|---------------|--------|
| 10 MB     | 8 sec         | 5 min         | ✅ Pass (huge buffer) |
| 100 MB    | 80 sec        | 5 min         | ✅ Pass (good buffer) |
| 300 MB    | 240 sec       | 5 min         | ✅ Pass (tight buffer) |
| 500 MB    | 400 sec       | 5 min         | ⚠️ Sometimes fails |
| 800 MB    | 640 sec       | 5 min         | ❌ **FAIL** |

### After (Dynamic Timeout)

| File Size | Expected Time | Dynamic Timeout | Result |
|-----------|---------------|-----------------|--------|
| 10 MB     | 8 sec         | 5.3 min         | ✅ Pass |
| 100 MB    | 80 sec        | 8.3 min         | ✅ Pass |
| 300 MB    | 240 sec       | 15 min          | ✅ Pass |
| 500 MB    | 400 sec       | 21.7 min        | ✅ Pass |
| 800 MB    | 640 sec       | 31.7 min → **30 min** (capped) | ✅ Pass |

---

## 🧪 Testing Strategy

### Test 1: Small File (10 MB)
```python
# Should use minimum timeout (~5 min)
success = await download_video(url, output)
# Expected timeout: ~320 seconds
# Expected duration: ~10 seconds
# Buffer: ~310 seconds
```

### Test 2: Medium File (200 MB)
```python
# Should use: 300 + (200 × 2) = 700 seconds
success = await download_video(url, output)
# Expected timeout: 700 seconds (11.7 min)
# Expected duration: ~160 seconds (2.7 min)
# Buffer: ~540 seconds (9 min)
```

### Test 3: Large File (500 MB)
```python
# Should use: 300 + (500 × 2) = 1300 seconds
success = await download_video(url, output)
# Expected timeout: 1300 seconds (21.7 min)
# Expected duration: ~400 seconds (6.7 min)
# Buffer: ~900 seconds (15 min)
```

### Test 4: Slow Connection
```python
# Simulate 2 Mbps connection
# 300 MB file should take ~1200 seconds (20 min)
# Timeout: 300 + (300 × 2) = 900 seconds (15 min)
# Result: Should still pass (adequate buffer)
```

---

## 📈 Benefits of Solution

### ✅ Advantages

1. **Scales with file size**
   - Small files: Fast timeout (no unnecessary waiting)
   - Large files: Adequate time to complete

2. **Safety caps prevent infinite waits**
   - Min: 1 minute (even for 1KB files)
   - Max: 30 minutes (reasonable upper bound)

3. **Better error handling**
   - Separate timeout types (connect vs. read)
   - Retry logic for transient failures

4. **Improved logging**
   - Shows expected size, timeout, progress
   - Helps debugging timeout issues

5. **Backward compatible**
   - Falls back to base timeout if size unknown
   - No breaking changes

### ⚠️ Considerations

1. **HEAD request overhead**
   - Extra HTTP request to get file size
   - Minimal (typically <1 second)

2. **Longer max timeout**
   - Could wait up to 30 minutes for stuck downloads
   - Mitigated by chunk timeout in Level 2

3. **Retry logic resource usage**
   - Multiple attempts consume more bandwidth
   - Trade-off for reliability

---

## 📝 Implementation Checklist

- [ ] Add `calculate_download_timeout()` method
- [ ] Update `download_video()` to use HEAD request
- [ ] Implement dynamic timeout calculation
- [ ] Add progress logging (every 10%)
- [ ] Add retry logic (Level 3)
- [ ] Implement chunk timeout (Level 2) - optional
- [ ] Update error messages to include timeout details
- [ ] Test with various file sizes (10MB, 100MB, 500MB)
- [ ] Test with simulated slow connections
- [ ] Monitor production for timeout adjustments

---

## 🎯 Expected Outcome

### Before
```
Large video (600 MB)
→ Download starts
→ Progress: 0% → 80% → 95%
→ 5:00 timeout hit
→ ❌ Download fails
→ Job fails
```

### After
```
Large video (600 MB)
→ HEAD request: Size = 600 MB
→ Calculate timeout: 300 + (600 × 2) = 1500s (25 min)
→ Download starts with 25-min timeout
→ Progress: 0% → 50% → 100%
→ Complete in 8 minutes
→ ✅ Success (17 min buffer remaining)
```

---

## 💡 Configuration Examples

### Development Environment
```python
# Faster timeouts for development
self.base_download_timeout = 2 * 60     # 2 minutes
self.timeout_per_mb = 1                 # 1 second per MB
self.max_download_timeout = 10 * 60     # 10 minutes max
```

### Production Environment
```python
# Conservative timeouts for production
self.base_download_timeout = 5 * 60     # 5 minutes
self.timeout_per_mb = 2                 # 2 seconds per MB
self.max_download_timeout = 30 * 60     # 30 minutes max
```

### High-Bandwidth Environment
```python
# Tighter timeouts for fast connections
self.base_download_timeout = 3 * 60     # 3 minutes
self.timeout_per_mb = 1                 # 1 second per MB
self.max_download_timeout = 15 * 60     # 15 minutes max
```

---

## 🎯 Recommendation

**Implement Level 1 (Dynamic Timeout) + Level 3 (Retry Logic) immediately:**

Level 1 provides the core fix:
- Scales with file size
- Simple to implement
- High impact

Level 3 adds resilience:
- Handles transient failures
- Improves success rate
- Minimal complexity

Level 2 (Chunk Timeout) is optional:
- More complex
- Marginal benefit over Level 1
- Can be added later if needed

---

**Status:** Solution Proposed  
**Complexity:** Low-Medium (Level 1), Medium (Level 3)  
**Effort:** ~60 minutes implementation  
**Risk:** Low  
**Recommended:** ⭐ Implement Level 1 + Level 3 ASAP  

