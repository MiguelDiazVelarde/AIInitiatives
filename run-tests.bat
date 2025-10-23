@echo off
echo 🚀 Starting application in background...
start /B npm run dev

echo ⏳ Waiting for application to be ready...
timeout /t 5 /nobreak > nul

echo 🧪 Running functional tests...
npm run test:cucumber

echo 📊 Generating HTML report...
npm run test:report

echo ✅ Tests completed. Report available at reports/cucumber_report.html
pause