# 🐛 AI Test Optimizer Debug Guide

Complete debugging guide for the AI Test Optimizer system in the iainitiatives project.

This guide provides comprehensive debugging instructions for the intelligent test optimization system that uses machine learning to optimize test execution, reduce CI/CD time, and maximize defect detection coverage.

## 🔧 Quick Setup

### 1. VS Code Debug Configuration

The project includes pre-configured debug setups in `.vscode/launch.json`:

- **🐛 Debug Test Optimizer - Help** - General debugging and commands
- **🚀 Debug Test Optimizer - Quick Strategy** - Quick strategy debugging
- **📊 Debug Test Optimizer - Stats** - Statistics debugging
- **🔍 Debug Test Optimizer - Analyze** - File analysis debugging
- **🌐 Debug Test Optimizer - API Server** - API server debugging
- **🔥 Debug Test Optimizer - Smoke Tests** - Smoke tests debugging

### 2. Available Debug Scripts

```bash
# General debug with Node.js Inspector
npm run optimizer:debug

# Debug with verbose logging
npm run optimizer:debug:quick
npm run optimizer:debug:stats
npm run optimizer:debug:server

# Direct debug commands
npx ts-node src/test-optimizer/index.ts [command]
```

## 🎯 Debug Methods

### A. VS Code Debug (Recommended)

1. **Open VS Code**
2. **Go to "Run and Debug" (Ctrl+Shift+D)**
3. **Select desired configuration**
4. **Press F5 or click "Start Debugging"**

**Key Features:**
- ✅ Interactive breakpoints
- ✅ Variable inspection
- ✅ Call stack navigation
- ✅ Watch expressions
- ✅ Source maps support

### B. Terminal Debug

#### Basic Debug Commands
```bash
# Debug general with breakpoints
npx ts-node --inspect-brk src/test-optimizer/index.ts help

# Debug specific strategy
npx ts-node --inspect-brk=0.0.0.0:9229 src/test-optimizer/index.ts optimize quick

# Debug with verbose logging (cross-platform)
npx ts-node src/test-optimizer/index.ts stats

# Debug API server
node --inspect-brk -r ts-node/register src/test-optimizer/index.ts server 3001
```

#### Advanced Debug Commands
```bash
# Analyze specific files
npx ts-node src/test-optimizer/index.ts analyze src/server/routes/auth.ts

# Generate recommendations for commit
npx ts-node src/test-optimizer/index.ts recommendations HEAD~1

# Execute with custom strategy
npx ts-node src/test-optimizer/index.ts optimize balanced HEAD~1

# Start API server with debugging
npx ts-node src/test-optimizer/index.ts server 3001
```

### C. Chrome DevTools Debug

1. **Run command with --inspect:**
   ```bash
   node --inspect -r ts-node/register src/test-optimizer/index.ts stats
   ```

2. **Open Chrome browser**
3. **Navigate to `chrome://inspect`**
4. **Click "Open dedicated DevTools for Node"**

## 🔍 Strategic Debug Points

### 1. Entry Point Debugging (`index.ts`)
- **Line ~35**: Command processing and argument parsing
- **Line ~45**: Switch case for command routing
- **Line ~70**: Error handling and logging

### 2. Core Logic Debugging (`RegressionTestOptimizer.ts`)
- **Method `optimizeTestExecution`**: Main optimization logic
- **Test selection algorithms**: How tests are chosen
- **Metrics calculation**: Performance and risk assessment

### 3. Code Analysis Debugging (`CodeAnalyzer.ts`)
- **Change detection**: Git diff analysis
- **Dependency mapping**: File relationship analysis
- **Risk assessment**: Code impact evaluation

### 4. Data Persistence Debugging (`DataStore.ts`)
- **Data loading/saving**: Historical data operations
- **Historical queries**: Performance data retrieval
- **Statistics calculation**: Metrics aggregation

### 5. API Server Debugging (`ConfigManager.ts`)
- **Endpoint handlers**: REST API functionality
- **Configuration management**: Settings and validation
- **Response formatting**: JSON output structure

## 🛠️ Debug Scenarios

### Scenario 1: Strategy Optimization Debug

**Problem**: Need to debug why a specific strategy isn't working

**Solution**:
```bash
# 1. Start debug session
npm run optimizer:debug

# 2. Set breakpoints in handleOptimize method
# 3. Run with specific strategy
# VS Code: Use "Debug Test Optimizer - Quick Strategy" configuration
```

**Key Debug Points**:
- Arguments processing
- Strategy selection logic
- Test filtering algorithms
- Metrics calculation

### Scenario 2: API Server Debug

**Problem**: API endpoints not responding correctly

**Solution**:
```bash
# 1. Start server with debug
npm run optimizer:debug:server

# 2. Test endpoints
curl http://localhost:3001/api/stats
curl http://localhost:3001/api/config

# 3. Check console for debug output
```

**Key Debug Points**:
- Route handlers
- Request processing
- Response generation
- Error handling

### Scenario 3: File Analysis Debug

**Problem**: Code analysis not detecting changes properly

**Solution**:
```bash
# Debug specific file analysis
npx ts-node --inspect-brk src/test-optimizer/index.ts analyze src/server/routes/auth.ts
```

**Key Debug Points**:
- Git diff parsing
- File dependency detection
- Risk assessment calculation
- Test recommendation logic

### Scenario 4: Statistics Debug

**Problem**: Statistics not calculating correctly

**Solution**:
```bash
# Debug statistics generation
npx ts-node --inspect-brk src/test-optimizer/index.ts stats
```

**Key Debug Points**:
- Data loading from history files
- Aggregation calculations
- Metrics computation
- Output formatting

## 📊 Debug Output Examples

### Console Debug Output
```bash
🔍 DEBUG: handleOptimize called with args: ['quick']
🔍 DEBUG: Using strategy: quick
🔍 DEBUG: Commit hash: none provided
🔄 Generating optimization plan with strategy: quick
📊 Optimization Plan Generated:
   Strategy: quick
   Selected Tests: 20
   Estimated Duration: 5.0min
   Time Reduction: 75.8%
   Confidence Score: 95.2%
   Overall Risk: low
```

### VS Code Debug Variables
```typescript
args: ['quick']
strategy: 'quick'
commitHash: undefined
codeChanges: null
plan: {
  id: 'plan-1762467682016-ur9a0zux7',
  strategy: { name: 'quick', maxTests: 20 },
  selectedTests: [...],
  estimatedDuration: 300000,
  optimizationMetrics: { ... }
}
```

## 🚨 Common Debug Issues

### Issue 1: TypeScript Compilation Errors
**Solution**:
```bash
# Check TypeScript compilation
npm run build

# Fix compilation errors before debugging
npx tsc --noEmit
```

### Issue 2: Missing Dependencies
**Solution**:
```bash
# Install missing dependencies
npm install

# Check for missing types
npm install @types/node @types/jest
```

### Issue 3: Port Already in Use
**Solution**:
```bash
# Kill process using port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or use different port
npx ts-node src/test-optimizer/index.ts server 3002
```

### Issue 4: Debug Session Not Starting
**Solution**:
```bash
# Check Node.js version
node --version

# Update ts-node if needed
npm install -g ts-node

# Use alternative debug command
node -r ts-node/register --inspect-brk src/test-optimizer/index.ts
```

## 🎮 Debug Commands Quick Reference

### Basic Commands
```bash
# Help and general info
npx ts-node src/test-optimizer/index.ts help
npx ts-node src/test-optimizer/index.ts config show

# Strategy execution
npx ts-node src/test-optimizer/index.ts optimize quick
npx ts-node src/test-optimizer/index.ts optimize balanced
npx ts-node src/test-optimizer/index.ts optimize comprehensive

# Analysis and statistics
npx ts-node src/test-optimizer/index.ts stats
npx ts-node src/test-optimizer/index.ts analyze [file]
npx ts-node src/test-optimizer/index.ts recommendations [commit]
```

### Debug Commands
```bash
# Debug with breakpoints
node --inspect-brk -r ts-node/register src/test-optimizer/index.ts [command]

# Debug API server
node --inspect -r ts-node/register src/test-optimizer/index.ts server 3001

# Debug with VS Code
# Use F5 with pre-configured launch configurations
```

### API Testing Commands
```bash
# Start API server
npx ts-node src/test-optimizer/index.ts server 3001

# Test endpoints
curl http://localhost:3001/api/stats
curl http://localhost:3001/api/config
curl -X POST http://localhost:3001/api/optimize -H "Content-Type: application/json" -d '{"strategy": "quick"}'
```

## 📈 Performance Debug Tips

### 1. Memory Usage Monitoring
```bash
# Monitor memory usage during debug
node --inspect --max-old-space-size=4096 -r ts-node/register src/test-optimizer/index.ts
```

### 2. Execution Time Profiling
```typescript
// Add timing to debug code
console.time('optimization');
const plan = await this.optimizer.optimizeTestExecution(strategy);
console.timeEnd('optimization');
```

### 3. Large Dataset Debug
```bash
# Debug with limited data
# Modify DataStore.ts to limit historical data for debugging
```

## 🔧 Development Debug Setup

### 1. Watch Mode for Development
```bash
# Watch TypeScript files and restart on changes
npx nodemon --exec "ts-node src/test-optimizer/index.ts" --ext ts --watch src/
```

### 2. Debug with Test Data
```bash
# Create test data for debugging
npx ts-node src/test-optimizer/index.ts optimize quick --mock-data
```

### 3. Isolated Component Testing
```typescript
// Debug individual components
import { CodeAnalyzer } from './analyzers/CodeAnalyzer';
const analyzer = new CodeAnalyzer();
const result = await analyzer.analyzeFile('test-file.ts');
console.log(result);
```

## 🎯 Next Steps

After setting up debugging:

1. **Set breakpoints** in key methods
2. **Use watch expressions** for variable monitoring
3. **Step through code** to understand flow
4. **Check data structures** at runtime
5. **Verify API responses** with curl commands
6. **Monitor performance** with timing logs

## 🆘 Getting Help

If you encounter issues with debugging:

1. **Check console output** for error messages
2. **Verify TypeScript compilation** with `npm run build`
3. **Check Node.js and npm versions**
4. **Review VS Code debug console** for detailed errors
5. **Use simpler debug commands** if complex ones fail

---

**Happy Debugging! 🐛→✅**

This debug guide provides comprehensive coverage for troubleshooting and understanding the AI Test Optimizer system.