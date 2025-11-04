#!/usr/bin/env node

/**
 * Example script demonstrating the Test Optimizer
 * This can be run to see the optimizer in action with sample data
 */

// Since we're using TypeScript modules, we'll create a simple demo without imports
async function runExample() {
  console.log('🤖 Test Optimizer Example\n');

  try {
    // Create sample configuration
    const config = {
      strategies: {
        quick: {
          name: 'quick',
          description: 'Fast feedback with high-priority tests only',
          maxDuration: 300000, // 5 minutes
          maxTests: 20,
          riskTolerance: 'balanced',
          parallelization: true,
          includeSmoke: true,
          includeCritical: true,
          skipFlaky: true
        },
        balanced: {
          name: 'balanced',
          description: 'Balanced approach optimizing time vs risk',
          maxDuration: 1800000, // 30 minutes
          maxTests: 50,
          riskTolerance: 'balanced',
          parallelization: true,
          includeSmoke: true,
          includeCritical: true,
          skipFlaky: false
        }
      },
      ml: {
        enabled: true,
        retrainInterval: 86400000,
        confidenceThreshold: 0.7
      },
      thresholds: {
        flakyTestThreshold: 0.2,
        minCoverageThreshold: 0.8,
        maxExecutionTime: 3600000,
        riskToleranceLevel: 0.3
      },
      integrations: {
        cucumber: true,
        playwright: true,
        jest: false,
        coverage: true,
        git: true,
        ci: true
      },
      reporting: {
        enabled: true,
        format: 'both',
        outputPath: './test-optimizer-reports',
        includeMetrics: true,
        includePredictions: true
      }
    };

    // Initialize optimizer
    console.log('🔧 Initializing Test Optimizer...');
    // const optimizer = new RegressionTestOptimizer(config);
    console.log('✅ Test Optimizer initialized (demo mode)');

    // Example 1: Quick smoke tests
    console.log('\n🔥 Example 1: Running Smoke Tests');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('ℹ️  Smoke tests would execute here (demo mode)');
    console.log('   Selected: 8 critical tests');
    console.log('   Duration: ~3 minutes');
    console.log('   Status: ✅ All passed');
    displayResults([
      { status: 'passed', duration: 2500 },
      { status: 'passed', duration: 1800 },
      { status: 'passed', duration: 3200 }
    ]);

    // Example 2: Balanced optimization
    console.log('\n⚖️  Example 2: Balanced Optimization Strategy');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('ℹ️  Balanced plan would be generated here (demo mode)');
    console.log('   Strategy: balanced');
    console.log('   Selected Tests: 42 out of 78 available');
    console.log('   Estimated Duration: 24 minutes');
    console.log('   Time Reduction: 67%');
    console.log('   Parallel Groups: 3');
    console.log('   Overall Risk: medium');
    console.log('   Confidence Score: 87%');

    // Example 3: Code change analysis
    console.log('\n📝 Example 3: Code Change Analysis');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const sampleCodeChanges = [
      {
        filePath: 'src/components/LoginForm.tsx',
        changeType: 'modified',
        linesAdded: 8,
        linesDeleted: 3,
        complexity: 5,
        affectedFunctions: ['validateLogin', 'handleSubmit'],
        affectedClasses: ['LoginForm'],
        diffContent: '+ Added password strength validation'
      },
      {
        filePath: 'src/services/api.ts',
        changeType: 'modified',
        linesAdded: 12,
        linesDeleted: 0,
        complexity: 7,
        affectedFunctions: ['authenticateUser', 'refreshToken'],
        affectedClasses: [],
        diffContent: '+ Added OAuth2 support'
      }
    ];

    console.log('ℹ️  Test recommendations would be generated here (demo mode)');
    console.log('   💡 Recommended Tests:');
    console.log('   1. Authentication flow tests (critical)');
    console.log('   2. Login form validation tests (high)');
    console.log('   3. API authentication tests (high)');
    console.log('   4. OAuth integration tests (medium)');
    console.log('   5. Password validation tests (medium)');

    // Example 4: Statistics
    console.log('\n📊 Example 4: Optimization Statistics');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('ℹ️  Statistics would be displayed here (demo mode)');
    console.log('   📈 Historical Performance:');
    console.log('   Total Executions: 156');
    console.log('   Average Failure Rate: 3.2%');
    console.log('   Average Execution Time: 18.5 minutes');
    console.log('   Test Stability Score: 94.7%');
    console.log('   Time Savings: 45% average reduction');
    console.log('   Flaky Tests Identified: 4');
    console.log('   Slow Tests Identified: 7');

    console.log('\n✨ Demo Complete!');
    console.log('\nTo get started with your own tests:');
    console.log('1. npm run build');
    console.log('2. npx test-optimizer config save');
    console.log('3. npx test-optimizer smoke');
    console.log('\nFor more information, see TEST-OPTIMIZER-README.md');

  } catch (error) {
    console.error('❌ Demo Error:', error.message);
    console.log('\nThis is expected in demo mode - the optimizer needs actual test files to analyze.');
    console.log('See TEST-OPTIMIZER-README.md for setup instructions.');
  }
}

function displayResults(results) {
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);
  
  console.log(`   📊 Results: ${passed} passed, ${failed} failed`);
  console.log(`   ⏱️  Duration: ${formatDuration(totalTime)}`);
  console.log(`   📈 Pass Rate: ${(passed / results.length * 100).toFixed(1)}%`);
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

// Run the example
if (require.main === module) {
  runExample().catch(console.error);
}

module.exports = { runExample };