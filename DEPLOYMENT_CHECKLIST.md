# Course Outline Parsing Fix - Deployment Checklist

## Pre-Deployment Testing

### ✅ 1. Backend Testing
- [ ] Test with the original problem case (12 lessons with separators)
- [ ] Test with properly formatted markdown (## Module headers)
- [ ] Test with flat lesson lists (no module structure)
- [ ] Test with mixed header formats
- [ ] Verify validation logic triggers correctly
- [ ] Check enhanced logging output

### ✅ 2. Integration Testing
- [ ] Test course outline preview from files
- [ ] Test course outline preview from text
- [ ] Test course outline preview from general knowledge
- [ ] Verify all three generation methods work correctly
- [ ] Test with different module/lesson configurations

### ✅ 3. Performance Testing
- [ ] Ensure parsing performance hasn't degraded
- [ ] Test with large course outlines (20+ lessons)
- [ ] Verify memory usage is acceptable
- [ ] Check streaming response times

## Deployment Steps

### 1. Backup Current System
```bash
# Backup the current main.py
cp custom_extensions/backend/main.py custom_extensions/backend/main.py.backup-$(date +%Y%m%d)
```

### 2. Deploy Changes
- The fix has been implemented in `custom_extensions/backend/main.py`
- No database migrations required
- No environment variable changes needed
- No additional dependencies required

### 3. Restart Services
```bash
# Restart the custom backend service
docker-compose restart custom_backend-1
# or
systemctl restart custom-backend
```

### 4. Verify Deployment
- [ ] Check service starts without errors
- [ ] Verify logs show enhanced parsing messages
- [ ] Test a simple course outline generation
- [ ] Confirm validation warnings appear when appropriate

## Monitoring

### Key Log Messages to Watch For

✅ **Success Indicators**:
```
[PARSE_OUTLINE] Found module: Module 1
[PARSE_OUTLINE] Intelligent fallback created 3 modules
[PREVIEW_VALIDATION] Outline structure validation passed
```

⚠️ **Warning Indicators** (expected for problematic content):
```
[PARSE_OUTLINE] No modules found, using intelligent fallback parsing
[PREVIEW_VALIDATION] Outline structure validation failed: Single module with 12 lessons detected
```

❌ **Error Indicators** (should be rare):
```
[PREVIEW_PARSING] CRITICAL: Failed to parse outline markdown
[HYBRID_STREAM_ERROR] Error in hybrid streaming
```

### Dashboard Metrics
Monitor these metrics for any changes:
- Course outline generation success rate
- Average generation time
- User completion rates for course outlines
- Error rates in parsing

## Rollback Plan

If issues arise, rollback steps:

### 1. Quick Rollback
```bash
# Restore backup
cp custom_extensions/backend/main.py.backup-YYYYMMDD custom_extensions/backend/main.py
docker-compose restart custom_backend-1
```

### 2. Verify Rollback
- [ ] Service starts successfully
- [ ] Course outline generation works (even with single modules)
- [ ] No parsing errors in logs

## Post-Deployment Validation

### 1. Functional Tests (24 hours after deployment)
- [ ] Generate course outlines from files
- [ ] Generate course outlines from text
- [ ] Generate course outlines from general knowledge
- [ ] Test various module/lesson configurations
- [ ] Verify user experience improvements

### 2. Performance Metrics (1 week after deployment)
- [ ] Compare generation success rates before/after
- [ ] Monitor user feedback
- [ ] Track any increase in course outline usage
- [ ] Check for any new error patterns

### 3. User Feedback Collection
- [ ] Monitor support tickets related to course outlines
- [ ] Check user reports of preview disappearing (should decrease)
- [ ] Gather feedback on improved module structure

## Success Criteria

The deployment is considered successful when:

1. **✅ Problem Resolution**: No more reports of previews disappearing with single modules containing 10+ lessons
2. **✅ Improved Structure**: Course outlines consistently generate multiple modules as requested
3. **✅ Maintained Performance**: No degradation in generation speed or reliability
4. **✅ Enhanced Logging**: Better visibility into parsing process for debugging
5. **✅ Backward Compatibility**: Existing properly formatted outlines continue to work

## Contact Information

**Primary Contact**: Development Team  
**Secondary Contact**: DevOps Team  
**Emergency Contact**: On-call Engineer

---

**Deployment Date**: _TBD_  
**Deployed By**: _TBD_  
**Approved By**: _TBD_ 