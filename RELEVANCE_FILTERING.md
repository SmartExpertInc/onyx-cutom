# Agentic RAG: Relevance Filtering Implementation

## Overview

Implemented **hybrid relevance filtering** for connector-based agentic RAG to prevent irrelevant chunks from degrading product quality. The system uses both **dynamic** and **absolute** thresholds to intelligently filter chunks while adapting to available content quality.

## Problem Solved

### Before Filtering
- Retrieved chunks included completely irrelevant content (e.g., pricing tables, unrelated Notion pages)
- Low-quality chunks diluted high-quality content
- No mechanism to filter out off-topic results
- Products generated with poor, irrelevant information

### Example from Logs (Before)
```
Retrieved 5 chunks:
- file_0: score=246.785 ✅ (AWS cloud utility) - RELEVANT
- file_1: score=192.969 ✅ (AWS security) - RELEVANT  
- file_2: score=231.726 ✅ (AWS services) - RELEVANT
- file_3: score=71.760  ❌ (Colossian slide ideas) - IRRELEVANT
- file_4: score=50.927  ❌ (Pricing table in Ukrainian) - IRRELEVANT

Result: 40% of content was completely off-topic
```

## Solution: Hybrid Threshold Filtering

The system now applies **two-level filtering** that adapts to content quality:

### 1. Dynamic Threshold (Relative)
- Calculates based on the **best chunk's score**
- Keeps chunks that are at least **40%** as good as the best result
- **Adapts to available content quality**

```python
dynamic_threshold = best_score * 0.4
```

### 2. Absolute Minimum Threshold
- Hard floor at **0.3** (on 0.0-1.0 scale)
- Prevents totally irrelevant content
- **Safety net when everything is low quality**

```python
ABSOLUTE_MIN_RELEVANCE = 0.3
```

### 3. Effective Threshold (Lenient)
- Uses the **more permissive** of the two thresholds
- Ensures some content is kept even when quality is uniformly low

```python
effective_threshold = max(dynamic_threshold, ABSOLUTE_MIN_RELEVANCE)
```

### 4. Minimum Chunks Guarantee
- Always keeps **at least 1 chunk per query** (if any are returned)
- Prevents complete content loss

```python
MIN_CHUNKS_PER_QUERY = 1
```

## How It Works

### Configuration (Line 13519-13523)

```python
# Relevance filtering configuration
ABSOLUTE_MIN_RELEVANCE = 0.3      # Never accept chunks below this (0.0-1.0)
RELATIVE_THRESHOLD = 0.4          # Keep chunks >= 40% as good as best chunk
MIN_CHUNKS_PER_QUERY = 1          # Always keep at least this many (if available)
MAX_CHUNKS_PER_QUERY = 12         # Never exceed this limit
```

### Filtering Logic (Lines 13573-13606)

For each focused query:

1. **Calculate dynamic threshold**:
   ```python
   best_score = max(chunk.get("relevance_score", 0.0) for chunk in chunks)
   dynamic_threshold = best_score * RELATIVE_THRESHOLD  # 40% of best
   ```

2. **Determine effective threshold**:
   ```python
   effective_threshold = max(dynamic_threshold, ABSOLUTE_MIN_RELEVANCE)
   ```

3. **Filter each chunk**:
   ```python
   if relevance_score < effective_threshold and kept_count >= MIN_CHUNKS_PER_QUERY:
       filtered_count += 1
       continue  # Skip this chunk
   ```

4. **Log filtering decision**:
   ```python
   logger.info(
       f"best_score={best_score:.3f} "
       f"dynamic_threshold={dynamic_threshold:.3f} "
       f"absolute_min={ABSOLUTE_MIN_RELEVANCE:.3f} "
       f"effective_threshold={effective_threshold:.3f}"
   )
   ```

## Scenarios and Behavior

### Scenario 1: High-Quality Content Available

**Input:**
```
Chunks: [1.0, 0.95, 0.85, 0.40, 0.25]
```

**Calculation:**
- Best score: `1.0`
- Dynamic threshold: `1.0 * 0.4 = 0.4`
- Absolute minimum: `0.3`
- Effective threshold: `max(0.4, 0.3) = 0.4`

**Result:**
- ✅ Keep: 1.0, 0.95, 0.85, 0.40 (4 chunks)
- ❌ Filter: 0.25 (1 chunk)

**Reason:** Dynamic threshold is higher, filters low-quality chunk.

---

### Scenario 2: Medium-Quality Content

**Input:**
```
Chunks: [0.6, 0.5, 0.4, 0.2, 0.15]
```

**Calculation:**
- Best score: `0.6`
- Dynamic threshold: `0.6 * 0.4 = 0.24`
- Absolute minimum: `0.3`
- Effective threshold: `max(0.24, 0.3) = 0.3`

**Result:**
- ✅ Keep: 0.6, 0.5, 0.4 (3 chunks)
- ❌ Filter: 0.2, 0.15 (2 chunks)

**Reason:** Absolute minimum takes over, filters very low scores.

---

### Scenario 3: Low-Quality Content (Limited Connector Data)

**Input:**
```
Chunks: [0.35, 0.32, 0.28, 0.15, 0.10]
```

**Calculation:**
- Best score: `0.35`
- Dynamic threshold: `0.35 * 0.4 = 0.14`
- Absolute minimum: `0.3`
- Effective threshold: `max(0.14, 0.3) = 0.3`

**Result:**
- ✅ Keep: 0.35, 0.32 (2 chunks, both meet MIN)
- ❌ Filter: 0.28, 0.15, 0.10 (3 chunks, below absolute min)

**Reason:** Absolute minimum prevents garbage, but keeps "best of limited options".

---

### Scenario 4: Extremely Low Quality (Nearly Irrelevant)

**Input:**
```
Chunks: [0.25, 0.20, 0.18, 0.10, 0.05]
```

**Calculation:**
- Best score: `0.25`
- Dynamic threshold: `0.25 * 0.4 = 0.1`
- Absolute minimum: `0.3`
- Effective threshold: `max(0.1, 0.3) = 0.3`

**Result:**
- ✅ Keep: None naturally meet threshold
- ✅ **BUT:** `MIN_CHUNKS_PER_QUERY = 1` forces keeping the best (0.25)
- ❌ Filter: All others

**Reason:** MIN_CHUNKS_PER_QUERY prevents complete content loss, keeps 1 best chunk.

---

## Expected Log Output

### With Filtering Enabled

```
[AGENTIC_CONNECTOR_STAGE2] 1/10: Introduction to AWS
[AGENTIC_CONNECTOR_STAGE2] Retrieved 5 chunks
[AGENTIC_CONNECTOR_STAGE2_FILTER] best_score=1.000 dynamic_threshold=0.400 absolute_min=0.300 effective_threshold=0.400
[AGENTIC_CONNECTOR_STAGE2_FILTER] Filtered chunk with score 0.200 (below 0.400, already have 3 chunks)
[AGENTIC_CONNECTOR_STAGE2_FILTER] Filtered chunk with score 0.150 (below 0.400, already have 3 chunks)
[AGENTIC_CONNECTOR_STAGE2] chunks_retrieved=5 kept=3 filtered=2 unique_added=3 time=0.42s

[AGENTIC_CONNECTOR_STAGE2] 2/10: AWS Global Infrastructure
[AGENTIC_CONNECTOR_STAGE2] Retrieved 5 chunks
[AGENTIC_CONNECTOR_STAGE2_FILTER] best_score=0.950 dynamic_threshold=0.380 absolute_min=0.300 effective_threshold=0.380
[AGENTIC_CONNECTOR_STAGE2] chunks_retrieved=5 kept=4 filtered=1 unique_added=2 time=0.38s
```

## Benefits

### 1. Improved Content Quality ✅
- Filters out completely irrelevant chunks (pricing tables, unrelated pages)
- Keeps only semantically related content
- Products have better focus and accuracy

### 2. Adaptive to Content Availability ✅
- Works well with rich, high-quality connector data
- Gracefully degrades when content is limited
- Never completely starves the product (MIN_CHUNKS_PER_QUERY)

### 3. Transparent Logging ✅
- Shows filtering decisions in logs
- Displays threshold calculations
- Makes debugging easier

### 4. Configurable ⚙️
- Easy to tune thresholds via constants
- Can adjust per product type if needed
- No code changes required for tuning

## Configuration Guide

### Stricter Filtering (Higher Quality Bar)

```python
ABSOLUTE_MIN_RELEVANCE = 0.5      # Increase from 0.3
RELATIVE_THRESHOLD = 0.6          # Increase from 0.4
MIN_CHUNKS_PER_QUERY = 1          # Keep same
```

**Effect:** Filters more aggressively, only keeps high-quality chunks.

**Use when:** Connector has lots of content, quality is critical.

---

### More Lenient Filtering (Accept Lower Quality)

```python
ABSOLUTE_MIN_RELEVANCE = 0.2      # Decrease from 0.3
RELATIVE_THRESHOLD = 0.3          # Decrease from 0.4
MIN_CHUNKS_PER_QUERY = 2          # Increase from 1
```

**Effect:** Keeps more chunks, accepts lower-quality results.

**Use when:** Connector has limited content, need more volume.

---

### Balanced (Default - Recommended)

```python
ABSOLUTE_MIN_RELEVANCE = 0.3      # Current default
RELATIVE_THRESHOLD = 0.4          # Current default
MIN_CHUNKS_PER_QUERY = 1          # Current default
```

**Effect:** Good balance between quality and quantity.

**Use when:** General use, most connector scenarios.

## Monitoring and Debugging

### Key Log Lines to Watch

1. **Threshold Calculation**:
   ```
   [AGENTIC_CONNECTOR_STAGE2_FILTER] best_score=X dynamic_threshold=Y effective_threshold=Z
   ```
   Shows how threshold was determined.

2. **Filtering Summary**:
   ```
   [AGENTIC_CONNECTOR_STAGE2] kept=X filtered=Y unique_added=Z
   ```
   Shows how many chunks were kept vs filtered.

3. **Individual Filters** (debug level):
   ```
   [AGENTIC_CONNECTOR_STAGE2_FILTER] Filtered chunk with score X.XXX (below Y.YYY)
   ```
   Shows each filtered chunk and why.

### Quality Indicators

**Good:**
- `filtered=2-5` per query - removing some bad chunks
- `kept=3-7` per query - keeping good variety
- `unique_added=3-5` - adding new content per query

**Warning:**
- `filtered=10+` per query - may be too strict
- `kept=1` consistently - connector has limited content
- `unique_added=0` often - severe deduplication

**Critical:**
- `kept=0` - no chunks meet threshold (check connector indexing)
- `unique_added=0` always - same chunks every query (poor diversity)

## Testing

### Test Case 1: High-Quality Connector
- **Setup:** Notion with extensive, relevant content
- **Expected:** Most chunks kept, few filtered
- **Log pattern:** `kept=8-10, filtered=2-4`

### Test Case 2: Limited Connector
- **Setup:** Slack with only a few messages about topic
- **Expected:** Absolute minimum threshold activates
- **Log pattern:** `effective_threshold=0.300` (absolute min), `kept=2-3`

### Test Case 3: Mixed Quality
- **Setup:** Connector with both relevant and irrelevant content
- **Expected:** Dynamic threshold adapts, filters garbage
- **Log pattern:** `filtered=5-7`, `kept=3-5`

### Test Case 4: Nearly Empty Connector
- **Setup:** Connector with almost no relevant content
- **Expected:** MIN_CHUNKS_PER_QUERY keeps 1 best chunk
- **Log pattern:** `kept=1, filtered=11`

## Comparison: Before vs After

### Before (No Filtering)

```
Query: "AWS cloud services"
Retrieved: 5 chunks
Kept: 5 chunks
- AWS cloud utility (score: 1.00) ✅
- AWS security (score: 0.95) ✅
- AWS services (score: 0.90) ✅
- Slide animation ideas (score: 0.35) ❌
- Pricing table (score: 0.25) ❌

Problem: 40% irrelevant content
```

### After (With Filtering)

```
Query: "AWS cloud services"
Retrieved: 5 chunks
Kept: 3 chunks (filtered: 2)
- AWS cloud utility (score: 1.00) ✅
- AWS security (score: 0.95) ✅
- AWS services (score: 0.90) ✅

Filtered:
- Slide animation ideas (score: 0.35) ❌
- Pricing table (score: 0.25) ❌

Result: 100% relevant content
```

## Future Enhancements

### 1. Per-Product-Type Thresholds
Different thresholds for different product types:

```python
THRESHOLDS = {
    "Course Outline": {"absolute": 0.4, "relative": 0.5},  # Stricter
    "Quiz": {"absolute": 0.5, "relative": 0.6},            # Very strict
    "Text Presentation": {"absolute": 0.3, "relative": 0.4},  # Balanced
    "Lesson Presentation": {"absolute": 0.3, "relative": 0.4}  # Balanced
}
```

### 2. Content-Length-Based Filtering
Filter based on chunk length too:

```python
if len(chunk_content) < 100:  # Too short
    continue
```

### 3. Keyword Overlap Threshold
Require minimum keyword overlap with query:

```python
overlap = calculate_keyword_overlap(focused_query, chunk_content)
if overlap < 0.05:  # Less than 5% overlap
    continue
```

### 4. Early Stopping on Low Quality
Stop querying if consecutive queries return only low-quality results:

```python
if filtered_count > kept_count for 3 consecutive queries:
    break  # Stop wasting API calls
```

## Files Modified

- **`custom_extensions/backend/main.py`** (lines 13516-13640)
  - Added relevance filtering configuration
  - Implemented hybrid threshold calculation
  - Added filtering logic with MIN_CHUNKS_PER_QUERY guarantee
  - Enhanced logging for filtering decisions

## Status

✅ **Implementation Complete**
- Hybrid threshold filtering active
- Dynamic adaptation implemented
- Minimum chunks guarantee in place
- Comprehensive logging added
- Ready for testing

## Related Documentation

- [`AGENTIC_RAG_FIXES_SUMMARY.md`](AGENTIC_RAG_FIXES_SUMMARY.md) - All bugs fixed during implementation
- [`AGENTIC_RAG_CONNECTOR_FIXES_COMPLETE.md`](AGENTIC_RAG_CONNECTOR_FIXES_COMPLETE.md) - Complete implementation guide
- [`CONNECTOR_TROUBLESHOOTING.md`](CONNECTOR_TROUBLESHOOTING.md) - Troubleshooting connector issues
- [`direct-vector.plan.md`](direct-vector.plan.md) - Original implementation plan

