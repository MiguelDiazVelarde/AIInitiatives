#!/usr/bin/env pwsh

Write-Host "🔍 GitHub Actions Debug Helper" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "`n🔧 Step 1: Installing dependencies..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Dependency installation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n🏗️ Step 2: Building the application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎭 Step 3: Installing Playwright browsers..." -ForegroundColor Yellow
npx playwright install chromium
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Playwright installation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 Step 4: Testing server startup..." -ForegroundColor Yellow
$env:NODE_ENV = "test"

# Start server in background
$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    $env:NODE_ENV = "test"
    npm start
}

Write-Host "Server starting... Waiting 15 seconds for initialization..."
Start-Sleep -Seconds 15

# Test server health
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Server health check passed!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Server responded but with status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Server health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔍 Checking server job status..." -ForegroundColor Yellow
    Get-Job $serverJob.Id | Format-Table
    Receive-Job $serverJob.Id
}

Write-Host "`n🧪 Step 5: Running a simple test..." -ForegroundColor Yellow
try {
    npm run test:auth
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Authentication tests passed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Authentication tests failed!" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Test execution error: $($_.Exception.Message)" -ForegroundColor Red
}

# Cleanup
Write-Host "`n🧹 Step 6: Cleaning up..." -ForegroundColor Yellow
Stop-Job $serverJob.Id -ErrorAction SilentlyContinue
Remove-Job $serverJob.Id -ErrorAction SilentlyContinue

# Stop any remaining node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*npm*" -or $_.CommandLine -like "*server*" } | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "- Dependencies: ✅ Installed" -ForegroundColor Green
Write-Host "- Build: ✅ Completed" -ForegroundColor Green
Write-Host "- Playwright: ✅ Ready" -ForegroundColor Green
Write-Host "- Server: Check above for status" -ForegroundColor Yellow
Write-Host "- Tests: Check above for results" -ForegroundColor Yellow

Write-Host "`n🎯 If this script works locally but GitHub Actions fails:" -ForegroundColor Cyan
Write-Host "1. Check GitHub Actions logs for specific error messages" -ForegroundColor White
Write-Host "2. Verify the workflow YAML syntax" -ForegroundColor White
Write-Host "3. Check if all required secrets/permissions are set" -ForegroundColor White
Write-Host "4. Ensure the workflow is triggered correctly" -ForegroundColor White

Write-Host "`n✅ Debug script completed!" -ForegroundColor Green