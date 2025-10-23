#!/bin/bash
# Script to run functional tests

echo "🚀 Starting application in background..."
npm run dev &
APP_PID=$!

echo "⏳ Waiting for application to be ready..."
sleep 5

echo "🧪 Running functional tests..."
npm run test:cucumber

echo "📊 Generating HTML report..."
npm run test:report

echo "🛑 Stopping application..."
kill $APP_PID

echo "✅ Tests completed. Report available at reports/cucumber_report.html"