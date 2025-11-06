# Session Persistence Test Script
# This script tests the optimized session persistence scenario

Write-Host "🔐 Testing Session Persistence Scenario" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Step 1: Build the application
Write-Host "`n🔨 Step 1: Building application..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Start the server
Write-Host "`n🚀 Step 2: Starting server..." -ForegroundColor Cyan
$serverProcess = Start-Process -FilePath "npm" -ArgumentList "start" -PassThru -WindowStyle Hidden
Write-Host "Server started with PID: $($serverProcess.Id)"

# Wait for server to be ready
Write-Host "`n⏳ Step 3: Waiting for server to be ready..." -ForegroundColor Cyan
Start-Sleep 8

# Check server health
$healthCheck = $false
for ($i = 1; $i -le 5; $i++) {
    try {
        Write-Host "Health check attempt $i/5..."
        $response = Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Server is ready!" -ForegroundColor Green
            $healthCheck = $true
            break
        }
    }
    catch {
        Write-Host "⏳ Server not ready yet, waiting..." -ForegroundColor Yellow
        Start-Sleep 3
    }
}

if (-not $healthCheck) {
    Write-Host "❌ Server failed to start properly" -ForegroundColor Red
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

# Step 4: Run the session persistence test
Write-Host "`n🧪 Step 4: Running session persistence test..." -ForegroundColor Cyan
Write-Host "Testing scenario: Session persistence after browser refresh" -ForegroundColor White

$testResult = $null
try {
    $testOutput = npx cucumber-js tests/features/session-test.feature --require-module ts-node/register --require "tests/step-definitions/**/*.ts" --format progress-bar 2>&1
    $testResult = $LASTEXITCODE
    Write-Host "`nTest Output:" -ForegroundColor Cyan
    Write-Host $testOutput
}
catch {
    Write-Host "❌ Test execution failed: $($_.Exception.Message)" -ForegroundColor Red
    $testResult = 1
}

# Step 5: Cleanup
Write-Host "`n🧹 Step 5: Cleaning up..." -ForegroundColor Cyan
try {
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Server stopped"
}
catch {
    Write-Host "⚠️ Server cleanup warning: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Final results
Write-Host "`n📊 Test Results Summary" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green

if ($testResult -eq 0) {
    Write-Host "✅ Session persistence test PASSED!" -ForegroundColor Green
    Write-Host "The optimizations successfully resolved the timeout issues." -ForegroundColor Green
} else {
    Write-Host "⚠️ Session persistence test had issues (Exit code: $testResult)" -ForegroundColor Yellow
    Write-Host "This could be due to:" -ForegroundColor Yellow
    Write-Host "  - Test environment setup" -ForegroundColor Yellow
    Write-Host "  - Missing authentication implementation" -ForegroundColor Yellow
    Write-Host "  - Browser automation timeouts" -ForegroundColor Yellow
    Write-Host "`nThe optimizations have been applied to:" -ForegroundColor Cyan
    Write-Host "  ✅ Increased Cucumber timeout to 60 seconds" -ForegroundColor Green
    Write-Host "  ✅ Enhanced browser refresh handling" -ForegroundColor Green
    Write-Host "  ✅ Improved authentication state checking" -ForegroundColor Green
    Write-Host "  ✅ Better error handling and logging" -ForegroundColor Green
    Write-Host "  ✅ Multiple fallback authentication checks" -ForegroundColor Green
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. The CI workflow has been optimized with better timeouts" -ForegroundColor White
Write-Host "2. Session persistence step definitions are more robust" -ForegroundColor White
Write-Host "3. Consider implementing the missing authentication features" -ForegroundColor White

exit $testResult