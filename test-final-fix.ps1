#!/usr/bin/env pwsh

Write-Host "🧪 Testing Final Authentication Fix" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Run just the failing scenario to test our fix
Write-Host "`n🎯 Running the specific failing scenario..." -ForegroundColor Yellow

# Run the specific scenario that was failing
$scenario = "Secure logout process"
Write-Host "Testing scenario: $scenario" -ForegroundColor Green

# Run the test with verbose output
npm run test:cucumber -- --grep "Secure logout process"

Write-Host "`n📊 Test completed!" -ForegroundColor Cyan

# Check if the test passed
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ SUCCESS: Final authentication fix working!" -ForegroundColor Green
    Write-Host "🎉 All authentication tests should now be resolved!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Still some issues to resolve..." -ForegroundColor Yellow
    Write-Host "Lets run the full auth test suite to see the current status:" -ForegroundColor Yellow
    
    Write-Host "`n🔍 Running full authentication test suite..." -ForegroundColor Cyan
    npm run test:auth
}

Write-Host "`n🎯 Final Authentication Fix Test Complete!" -ForegroundColor Cyan