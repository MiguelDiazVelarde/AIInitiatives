# Test Fixes Plan - 35 Failing Scenarios

## Summary of Issues

### 🔴 Critical Issues (Blocks Multiple Tests)

#### 1. Logout Not Redirecting to /auth
**Impact:** 2 scenarios failing  
**Files:** `authentication.steps.ts:1026-1034, 741-748`  
**Error:** After logout, stays on `/dashboard` instead of `/auth`  
**Root Cause:** Server-side logout not redirecting properly  
**Solution:** Check `src/server/routes/auth.ts` logout endpoint

#### 2. Product Form Not Visible on Dashboard  
**Impact:** 10+ scenarios failing  
**Files:** Multiple product tests  
**Error:** `page.waitForSelector: Timeout 10000ms exceeded` for `input[name="name"]`  
**Root Cause:** Dashboard doesn't show product creation form, or different UI structure  
**Solution:** Verify client dashboard component, adjust selectors

#### 3. waitForLoadState Timeouts (30s)
**Impact:** 15+ scenarios failing  
**Files:** Multiple files using `page.waitForLoadState('networkidle')`  
**Error:** Timeout after 30 seconds  
**Root Cause:** Using `networkidle` instead of `domcontentloaded`  
**Solution:** Replace all `waitForLoadState()` with shorter timeout or `domcontentloaded`

### 🟡 Medium Issues

#### 4. Invalid Playwright Selector
**Impact:** 1 scenario  
**File:** `navigation.steps.ts:366`  
**Error:** `Unknown engine "text*" while parsing selector text*="admin"`  
**Solution:** Change `text*="admin"` to `text="admin"` or `:text("admin")`

#### 5. Duplicate Step Definition
**Impact:** 2 scenarios  
**Files:** `performance-reliability.steps.ts:323` and `products.steps.ts:314`  
**Error:** `When I view the product list` defined twice  
**Solution:** Remove or rename one definition

#### 6. API Timeout on Invalid Endpoint
**Impact:** 1 scenario  
**File:** `api-technical.steps.ts:263`  
**Error:** GET `/api/invalid-endpoint` times out (30s)  
**Solution:** Server should return 404 quickly, or reduce test timeout

### 🟢 Low Priority (Missing Implementations)

#### 7. Undefined Step Definitions
**Impact:** Multiple scenarios skip steps  
**Examples:**
- "I submit the product form"
- "Then the product should be created successfully"
- "I have created multiple products"
- etc.

**Solution:** Implement missing step definitions

## Recommended Fix Order

1. ✅ Fix invalid selector (`text*=`)
2. ✅ Remove duplicate step definition
3. ✅ Replace all `waitForLoadState` with faster alternative
4. ✅ Fix API timeout
5. ⚠️ Investigate dashboard product form visibility
6. ⚠️ Fix logout redirect (requires server change)
7. 📝 Implement missing step definitions

## Files to Modify

### Step Definitions
- `tests/step-definitions/navigation.steps.ts` - Fix selector line 366
- `tests/step-definitions/products.steps.ts` - Remove duplicate OR rename
- `tests/step-definitions/performance-reliability.steps.ts` - Remove duplicate OR rename
- `tests/step-definitions/api-technical.steps.ts` - Add timeout to line 263
- Multiple files - Replace `waitForLoadState` calls

### Server (if needed)
- `src/server/routes/auth.ts` - Verify logout endpoint redirects

### Client (if needed)
- `client/src/components/Dashboard.tsx` (or similar) - Verify product form exists

## Quick Wins (Can Fix Immediately)

```typescript
// 1. Fix invalid selector (navigation.steps.ts:366)
- const isVisible = await this.page.locator('text*="admin"').isVisible();
+ const isVisible = await this.page.locator('text="admin"').isVisible();

// 2. Fix API timeout (api-technical.steps.ts:263)
- const response = await this.page.request.get(url);
+ const response = await this.page.request.get(url, { timeout: 5000 });

// 3. Replace waitForLoadState
- await this.page.waitForLoadState('networkidle');
+ await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
```

## Tests Requiring Investigation

1. **Product Form Tests** - Need to see actual dashboard HTML to fix selectors
2. **Logout Tests** - Need to verify server logout implementation
3. **Missing Step Definitions** - Need product requirements to implement

## Estimated Impact

- **Quick fixes:** Will resolve ~10-15 scenarios
- **Load state fixes:** Will resolve ~10-12 scenarios  
- **Product form fix:** Will resolve ~10 scenarios
- **Logout fix:** Will resolve 2 scenarios
- **Missing steps:** Need implementation specs

**Total recoverable with current info:** ~25-30 scenarios
**Remaining:** ~5-10 scenarios (need more investigation)
