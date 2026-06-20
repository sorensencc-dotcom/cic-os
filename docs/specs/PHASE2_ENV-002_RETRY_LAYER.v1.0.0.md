---
title: PHASE2_ENV-002_RETRY_LAYER
version: 1.0.0
status: Complete
owner: CIC / Sweeper
created: 2026-06-20
updated: 2026-06-20
---

# Phase 2 ENV-002: Deterministic Retry Layer

**Status:** ✅ Complete  
**Tests:** 49/49 passing (25 RetryPolicy + 24 CloakBrowserAdapter)  
**Commits:** Pending

---

# 0. Overview

Implemented deterministic retry layer for CloakBrowser navigation failures.

Bounded retries (max 2) with exponential backoff (250ms, 500ms) on transient errors only. Permanent errors fail immediately. Structured retry logs emitted to CIC event bus.

---

# 1. Components

## 1.1 RetryPolicy (New)

**File:** `src/extractors/browser/RetryPolicy.ts` (247 lines)

**Responsibilities:**
- Classify errors as transient (retryable) vs permanent
- Enforce max retry count (2)
- Calculate backoff duration (250ms, 500ms)
- Record attempt history (timestamp, code, message, backoff)
- Session-scoped cleanup

**Public Methods:**
```ts
isTransient(errorCode: BrowserErrorCode): boolean
shouldRetry(sessionId: string, errorCode: BrowserErrorCode): boolean
getBackoffMs(sessionId: string): number
recordAttempt(sessionId: string, errorCode: string, message: string): void
getAttempts(sessionId: string): RetryAttempt[]
clearAttempts(sessionId: string): void
```

**Transient Errors (Retryable):**
- BROWSER_TIMEOUT
- BROWSER_NAV_FAIL
- BROWSER_JS_FAIL

**Permanent Errors (Not Retried):**
- BROWSER_SCREENSHOT_FAIL
- BROWSER_CONTENT_FAIL

## 1.2 CloakBrowserAdapter (Updated)

**File:** `src/extractors/browser/CloakBrowserAdapter.ts`

**Changes:**
- Added `retryPolicy: RetryPolicy` field
- Wrapped `open()` method in deterministic retry loop
- Emit `browser.open.retry` logs with backoff + attempt count
- Clean up attempts after success or final failure

**Retry Loop Logic:**
1. Attempt navigation
2. On transient error:
   - Check shouldRetry (max 2)
   - Record attempt with code, message, backoff
   - Emit `browser.open.retry` log
   - Wait backoff (250ms or 500ms)
   - Retry (goto step 1)
3. On permanent error:
   - Emit `browser.open.error` log
   - Throw immediately
4. On success:
   - Emit `browser.open.success` log
   - Clear retry state
   - Return session

---

# 2. Test Coverage

## RetryPolicy (25 tests)

**Transient Detection (5):**
- BROWSER_TIMEOUT is transient ✅
- BROWSER_NAV_FAIL is transient ✅
- BROWSER_JS_FAIL is transient ✅
- BROWSER_SCREENSHOT_FAIL is permanent ✅
- BROWSER_CONTENT_FAIL is permanent ✅

**Retry Conditions (5):**
- Allow retry on transient + attempts available ✅
- Deny retry on permanent error ✅
- Deny retry after max attempts ✅
- Allow retry on first attempt ✅
- Allow retry on second attempt ✅

**Backoff Calculation (3):**
- First backoff: 250ms ✅
- Second backoff: 500ms ✅
- Max backoff after max retries: 500ms ✅

**Attempt Recording (4):**
- Record error code, message, timestamp ✅
- Include backoff duration ✅
- Increment attempt number ✅
- Multiple attempts tracked ✅

**Session Cleanup (2):**
- Clear attempts for session ✅
- Allow retry after cleanup ✅

**Custom Config (3):**
- Respect custom max retries ✅
- Respect custom backoff schedule ✅
- Respect custom transient codes ✅

**Edge Cases (3):**
- Multiple sessions independent ✅
- Return empty attempts for unknown session ✅
- Clear on unknown session safe ✅

## CloakBrowserAdapter (24 tests)

All existing tests pass with retry integration ✅

---

# 3. Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| Max 2 retries enforced | ✅ |
| Backoff: 250ms → 500ms | ✅ |
| Retry only on transient errors | ✅ |
| Permanent errors not retried | ✅ |
| Structured retry logs emitted | ✅ |
| Session-scoped cleanup | ✅ |
| No regressions in existing tests | ✅ |

---

# 4. Logs Emitted

### browser.open.start
```json
{
  "event": "browser.open.start",
  "url": "...",
  "timeout": 10000
}
```

### browser.open.retry (New)
```json
{
  "event": "browser.open.retry",
  "code": "BROWSER_TIMEOUT",
  "message": "...",
  "backoffMs": 250,
  "attempts": 1
}
```

### browser.open.error
```json
{
  "event": "browser.open.error",
  "code": "BROWSER_NAV_FAIL",
  "message": "...",
  "duration": 2500,
  "attempts": 2
}
```

### browser.open.success
```json
{
  "event": "browser.open.success",
  "url": "...",
  "duration": 2750
}
```

---

# 5. Performance Impact

- **Latency:** +0–1000ms on transient failures (best case: no retry; worst case: 2 retries)
- **Throughput:** No impact on successful requests
- **Memory:** Session-scoped attempt tracking (~1KB per session)

---

# 6. Files Modified

- `src/extractors/browser/RetryPolicy.ts` (new)
- `src/extractors/browser/RetryPolicy.test.ts` (new)
- `src/extractors/browser/CloakBrowserAdapter.ts` (updated)

---

# 7. Next Steps

- Commit ENV-002 work
- Begin DEV-003 (warm pool) or wrap Phase 2 session
