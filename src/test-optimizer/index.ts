#!/usr/bin/env node

import { RegressionTestOptimizer } from './core/RegressionTestOptimizer';
import { ConfigManager, OptimizerAPI } from './config/ConfigManager';
import { CodeAnalyzer } from './analyzers/CodeAnalyzer';

/**
 * Command Line Interface for the Test Optimizer
 */
class TestOptimizerCLI {
  private optimizer: RegressionTestOptimizer;
  private configManager: ConfigManager;
  private codeAnalyzer: CodeAnalyzer;

  constructor() {
    this.configManager = new ConfigManager();
    this.codeAnalyzer = new CodeAnalyzer();
  }

  /**
   * Initialize the optimizer
   */
  async initialize(): Promise<void> {
    const config = await this.configManager.loadConfig();
    this.optimizer = new RegressionTestOptimizer(config);
    console.log('🤖 Test Optimizer initialized');
  }

  /**
   * Main CLI entry point
   */
  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!this.optimizer) {
      await this.initialize();
    }

    try {
      switch (command) {
        case 'optimize':
          await this.handleOptimize(args.slice(1));
          break;
        case 'execute':
          await this.handleExecute(args.slice(1));
          break;
        case 'smoke':
          await this.handleSmokeTests();
          break;
        case 'critical':
          await this.handleCriticalTests();
          break;
        case 'recommendations':
          await this.handleRecommendations(args.slice(1));
          break;
        case 'stats':
          await this.handleStats();
          break;
        case 'config':
          await this.handleConfig(args.slice(1));
          break;
        case 'server':
          await this.handleServer(args.slice(1));
          break;
        case 'help':
        default:
          this.showHelp();
          break;
      }
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }

  /**
   * Handle optimize command
   */
  private async handleOptimize(args: string[]): Promise<void> {
    const strategy = args[0] || 'balanced';
    const commitHash = args[1];
    
    console.log(`🔄 Generating optimization plan with strategy: ${strategy}`);
    
    // Get code changes if commit hash provided
    let codeChanges;
    if (commitHash) {
      console.log(`📝 Analyzing code changes from commit: ${commitHash}`);
      codeChanges = await this.codeAnalyzer.getCodeChangesFromGit(commitHash);
    }

    const plan = await this.optimizer.optimizeTestExecution(strategy, codeChanges);
    
    console.log('📊 Optimization Plan Generated:');
    console.log(`   Strategy: ${plan.strategy.name}`);
    console.log(`   Selected Tests: ${plan.selectedTests.length}`);
    console.log(`   Estimated Duration: ${this.formatDuration(plan.estimatedDuration)}`);
    console.log(`   Time Reduction: ${plan.optimizationMetrics.timeReduction.percentage.toFixed(1)}%`);
    console.log(`   Confidence Score: ${(plan.optimizationMetrics.confidenceScore * 100).toFixed(1)}%`);
    console.log(`   Overall Risk: ${plan.riskAssessment.overallRisk}`);
    
    // Save plan for later execution
    await this.savePlan(plan);
    console.log(`📁 Plan saved as: plan-${plan.id}.json`);
  }

  /**
   * Handle execute command
   */
  private async handleExecute(args: string[]): Promise<void> {
    const planId = args[0];
    
    if (planId) {
      // Load and execute specific plan
      const plan = await this.loadPlan(planId);
      if (!plan) {
        console.error(`❌ Plan not found: ${planId}`);
        return;
      }
      
      console.log(`🚀 Executing plan: ${planId}`);
      const results = await this.optimizer.executeOptimizedPlan(plan);
      this.displayResults(results);
    } else {
      // Generate and execute new plan
      console.log('🚀 Generating and executing optimization plan...');
      const plan = await this.optimizer.optimizeTestExecution('balanced');
      const results = await this.optimizer.executeOptimizedPlan(plan);
      this.displayResults(results);
    }
  }

  /**
   * Handle smoke tests command
   */
  private async handleSmokeTests(): Promise<void> {
    console.log('🔥 Running smoke tests...');
    const results = await this.optimizer.runSmokeTests();
    this.displayResults(results);
  }

  /**
   * Handle critical tests command
   */
  private async handleCriticalTests(): Promise<void> {
    console.log('🚨 Running critical tests...');
    const results = await this.optimizer.runCriticalTests();
    this.displayResults(results);
  }

  /**
   * Handle recommendations command
   */
  private async handleRecommendations(args: string[]): Promise<void> {
    const commitHash = args[0];
    
    if (!commitHash) {
      console.error('❌ Commit hash required for recommendations');
      return;
    }

    console.log(`💡 Getting test recommendations for commit: ${commitHash}`);
    const codeChanges = await this.codeAnalyzer.getCodeChangesFromGit(commitHash);
    const recommendations = await this.optimizer.getTestRecommendations(codeChanges);
    
    console.log(`📋 Recommended Tests (${recommendations.length}):`);
    for (const test of recommendations.slice(0, 10)) {
      console.log(`   • ${test.name} (${test.criticalityLevel})`);
    }
  }

  /**
   * Handle stats command
   */
  private async handleStats(): Promise<void> {
    console.log('📊 Optimization Statistics:');
    const stats = await this.optimizer.getOptimizationStats();
    
    console.log(`   Total Executions: ${stats.totalExecutions}`);
    console.log(`   Failure Rate: ${(stats.failureRate * 100).toFixed(1)}%`);
    console.log(`   Avg Execution Time: ${this.formatDuration(stats.avgExecutionTime)}`);
    console.log(`   Flaky Tests: ${stats.flakyTests}`);
    console.log(`   Slow Tests: ${stats.slowTests}`);
    console.log(`   Stability Score: ${(stats.testStabilityScore * 100).toFixed(1)}%`);
  }

  /**
   * Handle config command
   */
  private async handleConfig(args: string[]): Promise<void> {
    const action = args[0];
    
    switch (action) {
      case 'show':
        console.log('📋 Current Configuration:');
        console.log(JSON.stringify(this.configManager.getConfig(), null, 2));
        break;
      
      case 'validate':
        const validation = this.configManager.validateConfig();
        if (validation.isValid) {
          console.log('✅ Configuration is valid');
        } else {
          console.log('❌ Configuration errors:');
          for (const error of validation.errors) {
            console.log(`   • ${error}`);
          }
        }
        break;
      
      case 'save':
        await this.configManager.saveConfig();
        break;
      
      default:
        console.log('📋 Available config commands: show, validate, save');
    }
  }

  /**
   * Handle server command
   */
  private async handleServer(args: string[]): Promise<void> {
    const port = parseInt(args[0]) || 3001;
    
    console.log(`🚀 Starting Test Optimizer API server on port ${port}...`);
    const api = new OptimizerAPI(this.optimizer, port);
    await api.start();
    
    // Keep server running
    process.on('SIGINT', async () => {
      console.log('\n⏹️ Stopping server...');
      await api.stop();
      process.exit(0);
    });
  }

  /**
   * Display test results
   */
  private displayResults(results: any[]): void {
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const totalTime = results.reduce((sum, r) => sum + r.duration, 0);
    
    console.log('\n📊 Test Results:');
    console.log(`   Total: ${results.length}`);
    console.log(`   Passed: ${passed} ✅`);
    console.log(`   Failed: ${failed} ❌`);
    console.log(`   Skipped: ${skipped} ⏭️`);
    console.log(`   Duration: ${this.formatDuration(totalTime)}`);
    console.log(`   Pass Rate: ${(passed / results.length * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      results
        .filter(r => r.status === 'failed')
        .slice(0, 5)
        .forEach(r => console.log(`   • ${r.testId}: ${r.error}`));
    }
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.log(`
🤖 Test Optimizer CLI

Usage: test-optimizer <command> [options]

Commands:
  optimize [strategy] [commit]   Generate optimization plan
  execute [planId]               Execute optimization plan
  smoke                          Run smoke tests
  critical                       Run critical tests
  recommendations <commit>       Get test recommendations for code changes
  stats                          Show optimization statistics
  config <action>                Manage configuration (show, validate, save)
  server [port]                  Start API server (default port: 3001)
  help                           Show this help

Strategies:
  quick                          Fast feedback (5 min, ~20 tests)
  balanced                       Balanced approach (30 min, ~50 tests)
  comprehensive                  Full coverage (60 min, ~100 tests)
  smoke                          Critical path only (10 min, ~15 tests)
  critical                       High priority tests (20 min, ~30 tests)

Examples:
  test-optimizer optimize balanced HEAD~1
  test-optimizer execute plan-123
  test-optimizer smoke
  test-optimizer recommendations abc123
  test-optimizer server 3001

For more information, visit: https://github.com/your-repo/test-optimizer
    `);
  }

  /**
   * Save optimization plan to file
   */
  private async savePlan(plan: any): Promise<void> {
    const fs = await import('node:fs');
    const filename = `plan-${plan.id}.json`;
    await fs.promises.writeFile(filename, JSON.stringify(plan, null, 2));
  }

  /**
   * Load optimization plan from file
   */
  private async loadPlan(planId: string): Promise<any> {
    try {
      const fs = await import('node:fs');
      const filename = `plan-${planId}.json`;
      const content = await fs.promises.readFile(filename, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }
}

// CLI entry point
if (require.main === module) {
  const cli = new TestOptimizerCLI();
  cli.run().catch(error => {
    console.error('❌ CLI Error:', error);
    process.exit(1);
  });
}

export { TestOptimizerCLI, RegressionTestOptimizer };