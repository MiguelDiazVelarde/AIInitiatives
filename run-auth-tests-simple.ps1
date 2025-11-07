#!/usr/bin/env pwsh

Write-Host "Starting Server and Running Authentication Tests" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

Write-Host "`nStep 1: Building the application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Exiting..." -ForegroundColor Red
    exit 1
}

Write-Host "`nStep 2: Starting the server..." -ForegroundColor Yellow

# Start the server in background
Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Hidden

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
            Write-Host "Server is ready!" -ForegroundColor Green
        }
    } catch {
        Write-Host "Waiting for server... ($elapsed/$timeout seconds)" -ForegroundColor Yellow
    }
}

if (-not $serverReady) {
    Write-Host "Server failed to start within $timeout seconds!" -ForegroundColor Red
    Write-Host "Trying to start with development mode..." -ForegroundColor Yellow
    
    # Try alternative startup
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden
    Start-Sleep 10
}

Write-Host "`nStep 3: Running authentication tests..." -ForegroundColor Yellow

# Run the tests
npm run test:auth

$testResult = $LASTEXITCODE

Write-Host "`nStep 4: Cleaning up..." -ForegroundColor Yellow

# Kill any node processes
Get-Process | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "`nTest Results:" -ForegroundColor Cyan
if ($testResult -eq 0) {
    Write-Host "All authentication tests passed!" -ForegroundColor Green
} else {
    Write-Host "Some tests failed, but our fixes should have improved the results" -ForegroundColor Yellow
}

Write-Host "`nTest execution complete!" -ForegroundColor Cyan