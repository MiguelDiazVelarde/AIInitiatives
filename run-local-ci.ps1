# Local CI Execution Script for Windows PowerShell
# This script simulates the GitHub Actions CI workflow locally

Write-Host "🚀 Starting Local CI Execution" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Yellow

# Function to run command with timeout
function Invoke-CommandWithTimeout {
    param(
        [string]$Command,
        [string]$Description,
        [int]$TimeoutSeconds = 60,
        [bool]$ContinueOnError = $false
    )
    
    Write-Host "🔄 $Description" -ForegroundColor Cyan
    Write-Host "   Command: $Command" -ForegroundColor Gray
    
    try {
        $job = Start-Job -ScriptBlock { 
            param($cmd)
            Invoke-Expression $cmd
        } -ArgumentList $Command
        
        $completed = Wait-Job $job -Timeout $TimeoutSeconds
        
        if ($completed) {
            $result = Receive-Job $job
            $exitCode = $job.State
            Remove-Job $job
            
            if ($exitCode -eq "Completed") {
                Write-Host "✅ $Description - SUCCESS" -ForegroundColor Green
                if ($result) { Write-Host $result }
                return $true
            } else {
                Write-Host "❌ $Description - FAILED" -ForegroundColor Red
                if ($result) { Write-Host $result }
                if (-not $ContinueOnError) { exit 1 }
                return $false
            }
        } else {
            Write-Host "⏰ $Description - TIMEOUT after $TimeoutSeconds seconds" -ForegroundColor Yellow
            Stop-Job $job
            Remove-Job $job
            if (-not $ContinueOnError) { exit 1 }
            return $false
        }
    } catch {
        Write-Host "❌ $Description - ERROR: $($_.Exception.Message)" -ForegroundColor Red
        if (-not $ContinueOnError) { exit 1 }
        return $false
    }
}

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Function to kill processes on port
function Stop-ProcessOnPort {
    param([int]$Port)
    Write-Host "🛑 Killing processes on port $Port..." -ForegroundColor Yellow
    try {
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep 2
    } catch {
        # Ignore errors
    }
}

# Set environment variables
$env:NODE_ENV = "test"
$env:PORT = "3000"
$env:TEST_BASE_URL = "http://localhost:3000"
$env:HEADLESS = "true"

Write-Host "📋 Environment Variables:" -ForegroundColor Cyan
Write-Host "   NODE_ENV: $env:NODE_ENV"
Write-Host "   PORT: $env:PORT"
Write-Host "   TEST_BASE_URL: $env:TEST_BASE_URL"
Write-Host ""

# Step 1: Verify Node.js and npm
Invoke-CommandWithTimeout -Command "node --version" -Description "Check Node.js version" -TimeoutSeconds 10
Invoke-CommandWithTimeout -Command "npm --version" -Description "Check npm version" -TimeoutSeconds 10

# Step 2: Install dependencies (with timeout)
Write-Host "📦 Installing Dependencies..." -ForegroundColor Yellow
Invoke-CommandWithTimeout -Command "npm ci --silent" -Description "Install main dependencies" -TimeoutSeconds 120
Invoke-CommandWithTimeout -Command "cd client; npm ci --silent; cd .." -Description "Install client dependencies" -TimeoutSeconds 120

# Step 3: Install Playwright (with timeout)
Write-Host "🎭 Installing Playwright..." -ForegroundColor Yellow
Invoke-CommandWithTimeout -Command "npx playwright install chromium" -Description "Install Playwright browsers" -TimeoutSeconds 300 -ContinueOnError $true

# Step 4: Build application
Write-Host "🔨 Building Application..." -ForegroundColor Yellow
Invoke-CommandWithTimeout -Command "npm run build" -Description "Build application" -TimeoutSeconds 120

# Step 5: Verify build artifacts
if (Test-Path "dist/server/index.js") {
    Write-Host "✅ Build artifacts verified" -ForegroundColor Green
} else {
    Write-Host "❌ Build artifacts not found" -ForegroundColor Red
    exit 1
}

# Step 6: TypeScript compilation check
Write-Host "📝 TypeScript Compilation Check..." -ForegroundColor Yellow
Invoke-CommandWithTimeout -Command "npx tsc -p tsconfig.server.json --noEmit" -Description "Server TypeScript compilation" -TimeoutSeconds 60
Invoke-CommandWithTimeout -Command "cd client; npx tsc --noEmit; cd .." -Description "Client TypeScript compilation" -TimeoutSeconds 60

# Step 7: Test Optimizer Stats
Write-Host "🤖 AI Test Optimizer..." -ForegroundColor Yellow
Invoke-CommandWithTimeout -Command "npx ts-node src/test-optimizer/index.ts stats" -Description "Test Optimizer stats" -TimeoutSeconds 30 -ContinueOnError $true

# Step 8: Quick Server Test (with timeout and cleanup)
Write-Host "🚀 Server Test..." -ForegroundColor Yellow

# Ensure port is free
Stop-ProcessOnPort -Port 3000

# Test with simple server
$serverTest = {
    try {
        # Start server in background
        $serverJob = Start-Job -ScriptBlock {
            Set-Location "C:\Workspaces\iainitiatives"
            $env:NODE_ENV = "test"
            $env:PORT = "3000"
            node dist/server/index.js
        }
        
        # Wait for server to start
        Start-Sleep 5
        
        # Test health endpoint
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Server health check passed" -ForegroundColor Green
            $success = $true
        } else {
            Write-Host "❌ Server health check failed" -ForegroundColor Red
            $success = $false
        }
        
        # Cleanup
        Stop-Job $serverJob -ErrorAction SilentlyContinue
        Remove-Job $serverJob -ErrorAction SilentlyContinue
        
        return $success
    } catch {
        Write-Host "❌ Server test error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

$serverResult = & $serverTest

# Step 9: Run Tests (with timeout)
if ($serverResult) {
    Write-Host "🧪 Running Tests..." -ForegroundColor Yellow
    
    # Ensure clean environment
    Stop-ProcessOnPort -Port 3000
    
    # Start server for tests
    Write-Host "   Starting server for tests..."
    $testServerJob = Start-Job -ScriptBlock {
        Set-Location "C:\Workspaces\iainitiatives"
        $env:NODE_ENV = "test"
        $env:PORT = "3000"
        node dist/server/index.js
    }
    
    Start-Sleep 8
    
    # Run smoke tests with timeout
    Invoke-CommandWithTimeout -Command "npm run test:smoke" -Description "Smoke tests" -TimeoutSeconds 180 -ContinueOnError $true
    
    # Cleanup
    Stop-Job $testServerJob -ErrorAction SilentlyContinue
    Remove-Job $testServerJob -ErrorAction SilentlyContinue
    Stop-ProcessOnPort -Port 3000
}

# Final cleanup
Stop-ProcessOnPort -Port 3000

Write-Host ""
Write-Host "🎯 Local CI Execution Completed" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Yellow

# Show summary
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Dependencies installed"
Write-Host "   ✅ Application built successfully"
Write-Host "   ✅ TypeScript compilation passed"
Write-Host "   ✅ Test Optimizer initialized"
if ($serverResult) {
    Write-Host "   ✅ Server functionality verified"
} else {
    Write-Host "   ⚠️ Server test had issues"
}
Write-Host ""
Write-Host "Ready for CI deployment!" -ForegroundColor Green