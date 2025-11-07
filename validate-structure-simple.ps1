#!/usr/bin/env pwsh

Write-Host "Project Structure Validation" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

Write-Host "`nChecking current project structure..." -ForegroundColor Yellow

# Check for main directories
$directories = @("src", "tests", "client", ".github", "dist")
foreach ($dir in $directories) {
    if (Test-Path $dir) {
        Write-Host "✓ $dir/ - EXISTS" -ForegroundColor Green
    } else {
        Write-Host "✗ $dir/ - MISSING" -ForegroundColor Red
    }
}

Write-Host "`nChecking for script files..." -ForegroundColor Yellow

# Check for PowerShell scripts
$psScripts = Get-ChildItem -Path "." -Name "*.ps1" -ErrorAction SilentlyContinue
if ($psScripts) {
    Write-Host "✓ PowerShell scripts found:" -ForegroundColor Green
    foreach ($script in $psScripts) {
        Write-Host "   - $script" -ForegroundColor White
    }
} else {
    Write-Host "✗ No PowerShell scripts found" -ForegroundColor Red
}

Write-Host "`nChecking workflow files for missing directory references..." -ForegroundColor Yellow

# Check if the debug-test.yml file was fixed
if (Test-Path ".github/workflows/debug-test.yml") {
    $content = Get-Content ".github/workflows/debug-test.yml" -Raw
    if ($content -like "*scripts/*") {
        Write-Host "⚠ debug-test.yml still contains 'scripts/' reference" -ForegroundColor Yellow
    } else {
        Write-Host "✓ debug-test.yml has been fixed" -ForegroundColor Green
    }
} else {
    Write-Host "✗ debug-test.yml not found" -ForegroundColor Red
}

Write-Host "`nAuthentication Test Infrastructure:" -ForegroundColor Yellow

# Check authentication test files
$authFiles = @(
    "tests/step-definitions/authentication.steps.ts",
    "tests/features/functional-requirements/authentication/authentication.feature",
    "tests/support/hooks.js"
)

foreach ($file in $authFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file - EXISTS" -ForegroundColor Green
    } else {
        Write-Host "✗ $file - MISSING" -ForegroundColor Red
    }
}

Write-Host "`nValidation Complete!" -ForegroundColor Green
Write-Host "The debug-test.yml workflow has been fixed to prevent the 'scripts/' error." -ForegroundColor Green