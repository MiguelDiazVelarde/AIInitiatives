# 🔧 GitHub Actions Troubleshooting Guide

## 🎯 Common GitHub Actions Issues & Solutions

### 1. **Permission Issues**
```yaml
# Ensure proper permissions in workflow
permissions:
  contents: read
  pull-requests: write
  issues: write
  checks: write
```

### 2. **Playwright Installation Timeout**
**Problem**: Browser installation takes too long or fails
**Solution**: Enhanced timeout and monitoring (already implemented)
```bash
timeout 300 bash -c 'npx playwright install --with-deps chromium'
```

### 3. **Server Startup Issues**
**Problem**: Server fails to start or health checks fail
**Solutions**:
- ✅ Already implemented: Comprehensive health checks
- ✅ Environment variables properly set: `NODE_ENV=test`
- ✅ Multiple verification endpoints
- ✅ Proper cleanup with PID tracking

### 4. **Node.js Version Compatibility**
**Current Matrix**: Node.js 20.x and 22.x
- Both versions are LTS and stable
- Dependencies are compatible

### 5. **Cache Issues**
**Solution**: Using npm cache with node_modules caching
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

### 6. **Test Timeout Issues**
**Solutions Implemented**:
- ✅ 30-minute job timeout
- ✅ 5-minute Playwright installation timeout
- ✅ 120-second server startup timeout
- ✅ Proper error handling and diagnostics

### 7. **Environment Variable Issues**
**Properly Set**:
```bash
NODE_ENV=test
PORT=3000
TEST_BASE_URL=http://localhost:3000
```

## 🚀 **Recommended Next Steps**

### Phase 1: Validate with Debug Workflow
1. **Run the debug workflow first**:
   ```bash
   # Go to GitHub Actions → Run workflow → debug-comprehensive.yml
   ```

2. **Check specific steps**:
   - ✅ Dependencies installation
   - ✅ Build process
   - ✅ Playwright installation
   - ✅ Basic environment

### Phase 2: Test with Ultra-Simple Workflow
If debug workflow passes, try the ultra-simple workflow to isolate issues.

### Phase 3: Comprehensive Testing
Only after simpler workflows pass, run the full comprehensive test suite.

## 🔍 **Debugging Commands**

### Local Verification (Already Successful)
```bash
.\debug-simple.ps1  # ✅ PASSED
```

### GitHub Actions Status Check
```bash
# Check if workflows are enabled
gh workflow list

# View recent runs
gh run list

# View specific run details
gh run view [RUN_ID]
```

## 🛠️ **Quick Fixes for Common Issues**

### Issue: "Register link selector not found"
**Status**: ✅ FIXED in navigation.steps.ts

### Issue: Server connection refused
**Solutions Implemented**:
- ✅ Enhanced server startup sequence
- ✅ Multiple health check endpoints
- ✅ Proper error diagnostics
- ✅ Background process management

### Issue: Workflow permission denied
**Solution**: Ensure repository settings allow Actions:
1. Settings → Actions → General
2. Allow all actions and reusable workflows

## 📊 **Current Workflow Status**

### ✅ **Working Locally**
- Dependencies: ✅ Install successfully
- Build: ✅ Server and client build
- Playwright: ✅ Browser installation
- Environment: ✅ Ready for testing

### 🔄 **GitHub Actions Next Steps**
1. **Manual trigger debug-comprehensive.yml**
2. **Review logs for specific failure points**
3. **Apply targeted fixes based on actual errors**

## 🎯 **Most Likely Issues**

Based on the comprehensive setup, the most likely issues are:

1. **Workflow Trigger**: Ensure the workflow is triggered correctly
2. **Repository Permissions**: Verify Actions are enabled
3. **Secret/Token Issues**: Check if any secrets are required
4. **Branch Protection**: Ensure workflows can run on the target branch

## 📝 **Action Items**

1. ✅ Fixed navigation step definitions
2. ✅ Created comprehensive workflows with robust error handling
3. ✅ Validated local environment
4. 🔄 **NEXT**: Run debug-comprehensive.yml workflow in GitHub Actions
5. 🔄 **THEN**: Analyze specific GitHub Actions logs for targeted fixes

The setup is solid and should work. The next step is to test the debug workflow in the actual GitHub Actions environment to identify any platform-specific issues.