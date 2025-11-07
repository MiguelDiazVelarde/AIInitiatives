# Optimized CI Workflow Commands
# These are the working commands from local testing

# 1. Basic Setup (works)
npm ci
cd client && npm ci && cd ..
npm run build

# 2. TypeScript Check (works)
npx tsc -p tsconfig.server.json --noEmit
cd client && npx tsc --noEmit && cd ..

# 3. AI Test Optimizer (works)
npx ts-node src/test-optimizer/index.ts stats
npx ts-node src/test-optimizer/index.ts optimize balanced

# 4. Playwright Installation (works with timeout)
npx playwright install chromium

# 5. Server Testing (works with proper timing)
# Start server in background
npm start &
SERVER_PID=$!

# Wait for server
sleep 8

# Test health
curl -f http://localhost:3000/api/health

# Cleanup
kill $SERVER_PID
sleep 2
pkill -f "node.*dist/server"

# 6. Run Tests (works with server management)
npm start &
SERVER_PID=$!
sleep 10
npm run test:smoke
kill $SERVER_PID
pkill -f "node.*dist/server"