#!/bin/bash
# Test Optimizer CI/CD Wrapper Script
# This script runs test optimizer commands with proper error handling

COMMAND=$1
STRATEGY=$2

echo "🤖 Test Optimizer CI/CD Wrapper"
echo "Command: $COMMAND"
echo "Strategy: $STRATEGY"

# Check if dependencies are available
check_dependencies() {
    echo "Checking Test Optimizer dependencies..."
    
    # Check if ts-node is available
    if ! command -v npx &> /dev/null; then
        echo "❌ npx not found"
        return 1
    fi
    
    # Check if test optimizer files exist
    if [ ! -f "src/test-optimizer/index.ts" ]; then
        echo "❌ Test Optimizer source files not found"
        return 1
    fi
    
    # Check if config file exists
    if [ ! -f "test-optimizer.config.json" ]; then
        echo "❌ Test Optimizer config file not found"
        return 1
    fi
    
    echo "✅ Dependencies check passed"
    return 0
}

# Run test optimizer command
run_optimizer() {
    local cmd=$1
    local strategy=$2
    
    echo "Running Test Optimizer command: $cmd"
    
    case $cmd in
        "config")
            npx ts-node src/test-optimizer/index.ts config show
            ;;
        "smoke")
            npm run optimizer:smoke
            ;;
        "quick")
            npm run optimizer:quick
            ;;
        "balanced") 
            npm run optimizer:balanced
            ;;
        "comprehensive")
            npm run optimizer:comprehensive
            ;;
        "stats")
            npm run optimizer:stats
            ;;
        *)
            echo "❌ Unknown command: $cmd"
            return 1
            ;;
    esac
}

# Main execution
main() {
    if check_dependencies; then
        echo "🚀 Running Test Optimizer..."
        if run_optimizer "$COMMAND" "$STRATEGY"; then
            echo "✅ Test Optimizer completed successfully"
            return 0
        else
            echo "⚠️ Test Optimizer failed, but this is not critical for CI"
            echo "   The build can continue with standard testing"
            return 0  # Don't fail the build
        fi
    else
        echo "⚠️ Test Optimizer dependencies not met"
        echo "   Skipping optimization - this is not critical for CI"
        return 0  # Don't fail the build
    fi
}

# Execute main function
main