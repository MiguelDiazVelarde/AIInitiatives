#!/usr/bin/env pwsh

Write-Host "🔍 Project Structure Validation" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

Write-Host "`n📁 Checking current project structure..." -ForegroundColor Yellow

# Check for main directories
$directories = @("src", "tests", "client", ".github", "dist")
foreach ($dir in $directories) {
    if (Test-Path $dir) {
        Write-Host "✅ $dir/ - EXISTS" -ForegroundColor Green
    } else {
        Write-Host "❌ $dir/ - MISSING" -ForegroundColor Red
    }
}

Write-Host "`n📜 Checking for script files..." -ForegroundColor Yellow

# Check for PowerShell scripts
$psScripts = Get-ChildItem -Path "." -Name "*.ps1" -ErrorAction SilentlyContinue
if ($psScripts) {
    Write-Host "✅ PowerShell scripts found:" -ForegroundColor Green
    foreach ($script in $psScripts) {
        Write-Host "   - $script" -ForegroundColor White
    }
} else {
    Write-Host "❌ No PowerShell scripts found" -ForegroundColor Red
}

Write-Host "`n🔍 Searching for missing directory references..." -ForegroundColor Yellow

# Search for references to non-existent directories
$missingDirRefs = @()

# Check for 'scripts/' references
$scriptsRefs = Select-String -Path ".github/workflows/*.yml" -Pattern "scripts/" -ErrorAction SilentlyContinue
if ($scriptsRefs) {
    Write-Host "⚠️ Found references to 'scripts/' directory:" -ForegroundColor Yellow
    foreach ($ref in $scriptsRefs) {
        Write-Host "   - $($ref.Filename):$($ref.LineNumber) - $($ref.Line.Trim())" -ForegroundColor White
        $missingDirRefs += $ref
    }
}

# Check for other potential missing directory references
$commonDirs = @("bin", "scripts", "utils", "tools", "helpers")
foreach ($dir in $commonDirs) {
    if (-not (Test-Path $dir)) {
        $refs = Select-String -Path ".github/workflows/*.yml" -Pattern "$dir/" -ErrorAction SilentlyContinue
        if ($refs) {
            Write-Host "⚠️ Found references to missing '$dir/' directory:" -ForegroundColor Yellow
            foreach ($ref in $refs) {
                Write-Host "   - $($ref.Filename):$($ref.LineNumber) - $($ref.Line.Trim())" -ForegroundColor White
                $missingDirRefs += $ref
            }
        }
    }
}

Write-Host "`n📊 Validation Results:" -ForegroundColor Cyan

if ($missingDirRefs.Count -eq 0) {
    Write-Host "✅ No missing directory references found!" -ForegroundColor Green
    Write-Host "✅ All workflow references are valid" -ForegroundColor Green
} else {
    Write-Host "⚠️ Found $($missingDirRefs.Count) missing directory references" -ForegroundColor Yellow
    Write-Host "❗ These should be fixed to prevent workflow errors" -ForegroundColor Red
}

Write-Host "`n🛠️ Authentication Test Infrastructure:" -ForegroundColor Yellow

# Check authentication test files
$authFiles = @(
    "tests/step-definitions/authentication.steps.ts",
    "tests/features/functional-requirements/authentication/authentication.feature",
    "tests/support/hooks.js"
)

foreach ($file in $authFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file - EXISTS" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - MISSING" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Recommendations:" -ForegroundColor Cyan

if ($missingDirRefs.Count -gt 0) {
    Write-Host "1. Fix missing directory references in workflow files" -ForegroundColor Yellow
    Write-Host "2. Update workflows to use existing project structure" -ForegroundColor Yellow
}

Write-Host "3. Consider creating a 'scripts/' directory if needed" -ForegroundColor Yellow
Write-Host "4. Verify all workflow files are using correct paths" -ForegroundColor Yellow

Write-Host "`n✅ Project Structure Validation Complete!" -ForegroundColor Green