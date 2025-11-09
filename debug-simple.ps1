# GitHub Actions Debug Helper
Write-Host "Debugging GitHub Actions Issues" -ForegroundColor Cyan

# Step 1: Check environment
Write-Host "`nChecking environment..." -ForegroundColor Yellow
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found" -ForegroundColor Red
    exit 1
}

# Step 2: Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Dependency installation failed" -ForegroundColor Red
    exit 1
}

# Step 3: Build application
Write-Host "`nBuilding application..." -ForegroundColor Yellow
npm run build:server
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Server build failed" -ForegroundColor Red
    exit 1
}

npm run build:client
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Client build failed" -ForegroundColor Red
    exit 1
}

# Step 4: Install Playwright
Write-Host "`nInstalling Playwright browsers..." -ForegroundColor Yellow
npx playwright install chromium
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Playwright installation failed" -ForegroundColor Red
    exit 1
}

Write-Host "`nAll steps completed successfully!" -ForegroundColor Green
Write-Host "Environment is ready for GitHub Actions testing." -ForegroundColor Green