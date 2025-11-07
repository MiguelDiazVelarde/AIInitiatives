#!/usr/bin/env pwsh

Write-Host "Testing single authentication scenario..." -ForegroundColor Cyan

# Run just the first authentication scenario to test our fixes
Write-Host "Running: Basic user login scenario" -ForegroundColor Yellow

npx cucumber-js tests/features/functional-requirements/authentication/authentication.feature --require-module ts-node/register --require tests/step-definitions/**/*.ts --format progress-bar --grep "Basic user login"

Write-Host "`nSingle test completed!" -ForegroundColor Cyan