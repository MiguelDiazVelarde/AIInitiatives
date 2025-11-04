# Test Optimizer CI/CD Wrapper Script (PowerShell)
# This script runs test optimizer commands with proper error handling

param(
    [Parameter(Mandatory=$true)]
    [string]$Command,
    
    [Parameter(Mandatory=$false)]
    [string]$Strategy = ""
)

Write-Host "🤖 Test Optimizer CI/CD Wrapper" -ForegroundColor Cyan
Write-Host "Command: $Command" -ForegroundColor Gray
Write-Host "Strategy: $Strategy" -ForegroundColor Gray

# Check if dependencies are available
function Test-Dependencies {
    Write-Host "Checking Test Optimizer dependencies..." -ForegroundColor Yellow
    
    # Check if ts-node is available
    try {
        $null = Get-Command npx -ErrorAction Stop
    } catch {
        Write-Host "❌ npx not found" -ForegroundColor Red
        return $false
    }
    
    # Check if test optimizer files exist
    if (-not (Test-Path "src/test-optimizer/index.ts")) {
        Write-Host "❌ Test Optimizer source files not found" -ForegroundColor Red
        return $false
    }
    
    # Check if config file exists
    if (-not (Test-Path "test-optimizer.config.json")) {
        Write-Host "❌ Test Optimizer config file not found" -ForegroundColor Red
        return $false
    }
    
    Write-Host "✅ Dependencies check passed" -ForegroundColor Green
    return $true
}

# Run test optimizer command
function Invoke-Optimizer {
    param([string]$cmd, [string]$strategy)
    
    Write-Host "Running Test Optimizer command: $cmd" -ForegroundColor Cyan
    
    try {
        switch ($cmd) {
            "config" {
                npx ts-node src/test-optimizer/index.ts config show
                break
            }
            "smoke" {
                npm run optimizer:smoke
                break
            }
            "quick" {
                npm run optimizer:quick
                break
            }
            "balanced" {
                npm run optimizer:balanced
                break
            }
            "comprehensive" {
                npm run optimizer:comprehensive
                break
            }
            "stats" {
                npm run optimizer:stats
                break
            }
            default {
                Write-Host "❌ Unknown command: $cmd" -ForegroundColor Red
                return $false
            }
        }
        return $true
    } catch {
        Write-Host "❌ Error executing optimizer command: $_" -ForegroundColor Red
        return $false
    }
}

# Main execution
function Main {
    if (Test-Dependencies) {
        Write-Host "🚀 Running Test Optimizer..." -ForegroundColor Green
        if (Invoke-Optimizer $Command $Strategy) {
            Write-Host "✅ Test Optimizer completed successfully" -ForegroundColor Green
            exit 0
        } else {
            Write-Host "⚠️ Test Optimizer failed, but this is not critical for CI" -ForegroundColor Yellow
            Write-Host "   The build can continue with standard testing" -ForegroundColor Yellow
            exit 0  # Don't fail the build
        }
    } else {
        Write-Host "⚠️ Test Optimizer dependencies not met" -ForegroundColor Yellow
        Write-Host "   Skipping optimization - this is not critical for CI" -ForegroundColor Yellow
        exit 0  # Don't fail the build
    }
}

# Execute main function
Main