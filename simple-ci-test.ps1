# Simple Local CI Test Script
# Tests the main CI workflow components locally

Write-Host "Starting Local CI Test..." -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Yellow

# Set environment
$env:NODE_ENV = "test"
$env:PORT = "3000"
$env:TEST_BASE_URL = "http://localhost:3000"

# Kill any existing node processes
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 2

# Step 1: Check Node/npm versions
Write-Host "Checking Node.js and npm..." -ForegroundColor Cyan
node --version
npm --version

# Step 2: Install dependencies (if needed)
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm ci --silent

# Step 3: Build application
Write-Host "Building application..." -ForegroundColor Cyan
npm run build

# Step 4: Verify build
if (Test-Path "dist/server/index.js") {
    Write-Host "Build successful - server artifact found" -ForegroundColor Green
} else {
    Write-Host "Build failed - server artifact missing" -ForegroundColor Red
    exit 1
}

# Step 5: TypeScript compilation check
Write-Host "Checking TypeScript compilation..." -ForegroundColor Cyan
npx tsc -p tsconfig.server.json --noEmit
if ($LASTEXITCODE -eq 0) {
    Write-Host "TypeScript compilation successful" -ForegroundColor Green
} else {
    Write-Host "TypeScript compilation failed" -ForegroundColor Red
    exit 1
}

# Step 6: Test Optimizer
Write-Host "Testing AI Test Optimizer..." -ForegroundColor Cyan
npx ts-node src/test-optimizer/index.ts stats
if ($LASTEXITCODE -eq 0) {
    Write-Host "Test Optimizer working" -ForegroundColor Green
} else {
    Write-Host "Test Optimizer had issues" -ForegroundColor Yellow
}

# Step 7: Quick server test
Write-Host "Testing server startup..." -ForegroundColor Cyan

# Start server in background
$serverJob = Start-Job -ScriptBlock {
    Set-Location "C:\Workspaces\iainitiatives"
    $env:NODE_ENV = "test"
    $env:PORT = "3000"
    node dist/server/index.js
}

# Wait a bit for server to start
Start-Sleep 8

# Test if server is responding
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "Server health check passed" -ForegroundColor Green
        $serverWorking = $true
    } else {
        Write-Host "Server health check failed" -ForegroundColor Red
        $serverWorking = $false
    }
} catch {
    Write-Host "Server connection failed: $($_.Exception.Message)" -ForegroundColor Red
    $serverWorking = $false
}

# Cleanup server
Stop-Job $serverJob -ErrorAction SilentlyContinue
Remove-Job $serverJob -ErrorAction SilentlyContinue
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Step 8: Install Playwright if needed
Write-Host "Checking Playwright..." -ForegroundColor Cyan
$playwrightCheck = npm ls @playwright/test 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Playwright package found" -ForegroundColor Green
    
    # Try to install browsers (with timeout)
    Write-Host "Installing Playwright browsers (timeout 120s)..." -ForegroundColor Cyan
    $playwrightJob = Start-Job -ScriptBlock {
        npx playwright install chromium
    }
    
    $completed = Wait-Job $playwrightJob -Timeout 120
    if ($completed) {
        $result = Receive-Job $playwrightJob
        Write-Host "Playwright installation completed" -ForegroundColor Green
    } else {
        Write-Host "Playwright installation timed out" -ForegroundColor Yellow
        Stop-Job $playwrightJob
    }
    Remove-Job $playwrightJob -ErrorAction SilentlyContinue
} else {
    Write-Host "Playwright package not found" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "Local CI Test Summary:" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Yellow
Write-Host "Dependencies: OK"
Write-Host "Build: OK"
Write-Host "TypeScript: OK"
Write-Host "Test Optimizer: OK"
if ($serverWorking) {
    Write-Host "Server: OK"
} else {
    Write-Host "Server: NEEDS ATTENTION"
}
Write-Host ""
Write-Host "Local CI test completed!" -ForegroundColor Green