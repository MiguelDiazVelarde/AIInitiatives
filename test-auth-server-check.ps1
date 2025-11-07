#!/usr/bin/env pwsh

Write-Host "Testing authentication with server check..." -ForegroundColor Cyan

# First check if server is responding
Write-Host "Checking server status..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    Write-Host "Server is responding (Status: $($response.StatusCode))" -ForegroundColor Green
    
    # Now run the authentication tests
    Write-Host "`nRunning authentication tests..." -ForegroundColor Yellow
    
    # Run with better error handling
    $env:HEADLESS = "true"
    npm run test:auth
    
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host "`nAll tests passed!" -ForegroundColor Green
    } else {
        Write-Host "`nSome tests failed (Exit code: $exitCode)" -ForegroundColor Yellow
        Write-Host "This is expected as we're still fixing issues." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "Server is not responding!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the server is running on localhost:3000" -ForegroundColor Yellow
}

Write-Host "`nTest execution completed!" -ForegroundColor Cyan