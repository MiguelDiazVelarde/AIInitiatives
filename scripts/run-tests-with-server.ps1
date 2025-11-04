#!/usr/bin/env pwsh
# PowerShell script to run tests with server
# This script starts the server, waits for it to be ready, runs tests, then cleans up

# Configuration with environment variable support
$TEST_PORT = if ($env:PORT) { $env:PORT } else { 3001 }
$TEST_BASE_URL = if ($env:TEST_BASE_URL) { $env:TEST_BASE_URL } else { "http://localhost:$TEST_PORT" }
$NODE_ENV = if ($env:NODE_ENV) { $env:NODE_ENV } else { "test" }

Write-Host "🚀 Starting test execution with server on port $TEST_PORT..." -ForegroundColor Green
Write-Host "📍 Test URL: $TEST_BASE_URL" -ForegroundColor Cyan
Write-Host "🌍 Environment: $NODE_ENV" -ForegroundColor Cyan

# Check if build exists, if not build first
if (-not (Test-Path "dist")) {
    Write-Host "📦 Building project first..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
}

# Start the server in background with environment variables
Write-Host "🔧 Starting backend server on port $TEST_PORT..." -ForegroundColor Blue
$env:PORT = $TEST_PORT
$env:NODE_ENV = $NODE_ENV
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
        $response = Invoke-WebRequest -Uri "$TEST_BASE_URL/api/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
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

# Run the tests with environment variables
Write-Host "🧪 Running authentication tests..." -ForegroundColor Green
$env:TEST_BASE_URL = $TEST_BASE_URL
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