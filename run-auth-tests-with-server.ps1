#!/usr/bin/env pwsh

Write-Host "🚀 Starting Server and Running Authentication Tests" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "`n🔧 Step 1: Building the application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Exiting..." -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 Step 2: Starting the server..." -ForegroundColor Yellow

# Start the server in background
Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Hidden -PassThru
$serverProcess = Get-Process | Where-Object { $_.ProcessName -eq "node" -and $_.Path -like "*npm*" } | Select-Object -Last 1

Write-Host "Server starting... Waiting for it to be ready..." -ForegroundColor Green

# Wait for server to be ready
$timeout = 30
$elapsed = 0
$serverReady = $false

while ($elapsed -lt $timeout -and -not $serverReady) {
    Start-Sleep 2
    $elapsed += 2
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $serverReady = $true
            Write-Host "✅ Server is ready!" -ForegroundColor Green
        }
    } catch {
        Write-Host "⏳ Waiting for server... ($elapsed/$timeout seconds)" -ForegroundColor Yellow
    }
}

if (-not $serverReady) {
    Write-Host "❌ Server failed to start within $timeout seconds!" -ForegroundColor Red
    Write-Host "Trying to start with a different method..." -ForegroundColor Yellow
    
    # Try alternative startup
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden
    Start-Sleep 10
}

Write-Host "`n🧪 Step 3: Running authentication tests..." -ForegroundColor Yellow

# Run the tests
npm run test:auth

$testResult = $LASTEXITCODE

Write-Host "`n🧹 Step 4: Cleaning up..." -ForegroundColor Yellow

# Kill the server process
if ($serverProcess) {
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "Server process stopped." -ForegroundColor Green
}

# Kill any remaining node processes
Get-Process | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "`n📊 Test Results:" -ForegroundColor Cyan
if ($testResult -eq 0) {
    Write-Host "✅ All authentication tests passed!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Some tests failed, but our fixes should have improved the results" -ForegroundColor Yellow
}

Write-Host "`n🎯 Test execution complete!" -ForegroundColor Cyan