# Smart Drive Indexing Progress Bar Implementation

## Summary
Added progress bar indicators to file cards in Smart Drive (Knowledge Base) to show indexing status when files are being processed.

## Changes Made

### File Modified
- `custom_extensions/frontend/src/components/SmartDrive/SmartDrive/SmartDriveBrowser.tsx`

### Implementation Details

#### 1. Grid View Progress Bar (Lines 1363-1389)
Added a progress bar with percentage display to file cards in grid view:
- Shows "Indexing..." label with percentage
- Displays a blue progress bar that animates as indexing progresses
- Located in the bottom section of each file card, above the date
- Only appears when a file is actively being indexed (`status !== 'done'`)

**Features:**
- Percentage display: Shows the exact progress (e.g., "45%")
- Visual progress bar with smooth transitions
- Tooltip on hover explaining the indexing process
- Automatically handles URL encoding/decoding for file paths

#### 2. List/Table View - Expanded Folder Contents (Lines 1703-1724)
Added progress bar to files shown within expanded folders in table view:
- Simple horizontal progress bar in the Title column
- Shows beneath the file name
- Uses the same styling as the main table view progress bar

#### 3. List/Table View - Main Table (Pre-existing, Lines 1781-1802)
The main table view already had progress bar implementation which served as the reference.

## Technical Implementation

### Progress Detection
The component checks for indexing status using the `indexing` state object:
```typescript
const s = indexing[it.path] || 
          indexing[decodeURIComponent(it.path)] || 
          indexing[encodeURI(it.path)];
const shouldShow = s && s.status !== 'done';
```

### Progress Percentage
The progress percentage is obtained from `s.etaPct` (estimated percentage):
```typescript
const pct = s?.etaPct ?? 10; // Defaults to 10% if not available
```

### Existing Polling Mechanism
The implementation leverages the existing `pollIndexingProgress` function that:
- Polls the backend API for indexing status
- Updates the `indexing` state with progress information
- Calculates `etaPct` based on estimated tokens and time elapsed
- Automatically polls at regular intervals until indexing completes

## User Experience

### Visual Feedback
- **Grid View**: Shows a prominent progress indicator with percentage above the file date
- **Table View**: Shows a thin progress bar beneath the file name
- **Color**: Blue progress bar (`bg-blue-500`) for consistency with app theme
- **Animation**: Smooth transitions as progress updates

### Tooltip
All progress bars include a helpful tooltip:
> "We are indexing this file so it can be searched and used by AI. This usually takes a short moment."

### Automatic Updates
- Progress bars update automatically as the polling mechanism fetches new status
- Progress bars disappear once indexing is complete (`status === 'done'`)
- No manual refresh required

## Files Affected
1. `custom_extensions/frontend/src/components/SmartDrive/SmartDrive/SmartDriveBrowser.tsx` - Main implementation

## Testing Recommendations

1. **Upload a new file** to Smart Drive and verify:
   - Progress bar appears in grid view with percentage
   - Progress bar appears in list view 
   - Progress bar appears in expanded folder view
   - Progress updates smoothly
   - Progress bar disappears when indexing completes

2. **Upload multiple files** and verify:
   - Each file shows its own progress independently
   - Progress bars update correctly for all files simultaneously

3. **Test with different file types**:
   - PDFs
   - Documents (DOCX, TXT)
   - Code files
   - Large files (to see longer indexing times)

4. **Test URL encoding edge cases**:
   - Files with special characters in names
   - Files with spaces
   - Files with international characters

## Notes

- The implementation uses the existing indexing infrastructure
- No backend changes were required
- The progress bar styling is consistent with the existing table view implementation
- Handles URL encoding/decoding edge cases for file paths
- No new linter errors were introduced

## Related Code

### Backend API (Reference)
- `/api/smart-drive/indexing-progress` - Provides indexing status for files
- `pollIndexingProgress()` function - Frontend polling mechanism

### State Management
- `indexing: IndexingState` - Stores indexing status for each file path
- Updates via `setIndexing()` in the polling function

