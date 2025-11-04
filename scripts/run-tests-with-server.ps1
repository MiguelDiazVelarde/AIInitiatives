#!/usr/bin/env pwsh
# PowerShell script to run tests with server
# This script starts the server, waits for it to be ready, runs tests, then cleans up

Write-Host "🚀 Starting test execution with server..." -ForegroundColor Green

# Check if build exists, if not build first
if (-not (Test-Path "dist")) {
    Write-Host "📦 Building project first..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
}

# Start the server in background
Write-Host "🔧 Starting backend server..." -ForegroundColor Blue
$serverProcess = Start-Process -FilePath "npm" -ArgumentList "start" -PassThru -NoNewWindow

# Give server time to start
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Wait for server to be ready (health check)
$maxAttempts = 30
$attempt = 1
$serverReady = $false

while ($attempt -le $maxAttempts -and -not $serverReady) {
    try {
        Write-Host "🔍 Checking server readiness... attempt $attempt/$maxAttempts" -ForegroundColor Cyan
        $response = Invoke-WebRequest -Uri "http://localhost:3000/" -Method GET -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $serverReady = $true
            Write-Host "✅ Server is ready!" -ForegroundColor Green
        }
    } catch {
        Write-Host "⏳ Server not ready yet, waiting..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        $attempt++
    }
}

if (-not $serverReady) {
    Write-Host "❌ Server failed to start after $maxAttempts attempts!" -ForegroundColor Red
    if ($serverProcess -and -not $serverProcess.HasExited) {
        $serverProcess.Kill()
    }
    exit 1
}

# Run the tests
Write-Host "🧪 Running authentication tests..." -ForegroundColor Green
npm run test:auth

$testResult = $LASTEXITCODE

# Cleanup: Stop the server
Write-Host "🧹 Cleaning up server..." -ForegroundColor Yellow
if ($serverProcess -and -not $serverProcess.HasExited) {
    $serverProcess.Kill()
    Write-Host "✅ Server stopped successfully" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Server was already stopped" -ForegroundColor Blue
}

# Report results
if ($testResult -eq 0) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Tests failed with exit code $testResult" -ForegroundColor Red
    exit $testResult
}