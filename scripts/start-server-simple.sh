#!/bin/bash

# Simple but robust server startup script for CI
set -e

PORT=${PORT:-3001}
NODE_ENV=${NODE_ENV:-test}
MAX_ATTEMPTS=60
ATTEMPT=0

echo "🚀 Starting server on port $PORT in $NODE_ENV mode..."

# Start server in background
NODE_ENV=$NODE_ENV PORT=$PORT node dist/server/index.js &
SERVER_PID=$!

echo "Server started with PID: $SERVER_PID"

# Function to cleanup
cleanup() {
    echo "Cleaning up server processes..."
    kill $SERVER_PID 2>/dev/null || true
    pkill -f "node.*dist/server" 2>/dev/null || true
}

# Set trap for cleanup
trap cleanup EXIT INT TERM

# Wait for server to be ready
echo "Waiting for server to be ready..."

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))
    
    if curl -f --max-time 3 http://localhost:$PORT/api/health >/dev/null 2>&1; then
        echo "✅ Server health check passed on attempt $ATTEMPT"
        
        # Double check with homepage
        if curl -f --max-time 3 http://localhost:$PORT/ >/dev/null 2>&1; then
            echo "✅ Homepage check passed - server fully ready!"
            echo "🎯 Server is ready for testing on http://localhost:$PORT"
            
            # Keep script running for CI
            wait $SERVER_PID
            exit 0
        else
            echo "⚠️ Homepage check failed on attempt $ATTEMPT"
        fi
    fi
    
    # Show progress every 10 attempts
    if [ $((ATTEMPT % 10)) -eq 0 ]; then
        echo "⏳ Still waiting... attempt $ATTEMPT/$MAX_ATTEMPTS"
    fi
    
    sleep 2
done

echo "❌ Server failed to start after $MAX_ATTEMPTS attempts ($(($MAX_ATTEMPTS * 2)) seconds)"
echo "=== Debug Information ==="
ps aux | grep node | grep -v grep || echo "No node processes found"
netstat -tlnp 2>/dev/null | grep $PORT || echo "Port $PORT not listening"
exit 1