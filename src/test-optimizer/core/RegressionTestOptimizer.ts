import { 
  TestCase, 
  TestResult, 
  CodeChange, 
  ExecutionPlan, 
  ExecutionStrategy, 
  OptimizerConfig,
  TestPriority,
  HistoricalData,
  MLPrediction,
  OptimizationMetrics
} from './types';
import { TestAnalyzer } from '../analyzers/TestAnalyzer';
import { CodeAnalyzer } from '../analyzers/CodeAnalyzer';
import { CoverageAnalyzer } from '../analyzers/CoverageAnalyzer';
import { MLPredictor } from '../ml/MLPredictor';
import { PrioritizationStrategy } from '../strategies/PrioritizationStrategy';
import { ExecutionOptimizer } from '../strategies/ExecutionOptimizer';
import { DataStore } from '../data/DataStore';
import { ReportGenerator } from '../reporting/ReportGenerator';

/**
 * Main class for the Regression Test Execution Optimizer
 * Orchestrates all components to provide intelligent test optimization
 */
export class RegressionTestOptimizer {
  private config: OptimizerConfig;
  private testAnalyzer!: TestAnalyzer;
  private codeAnalyzer!: CodeAnalyzer;
  private coverageAnalyzer!: CoverageAnalyzer;
  private mlPredictor!: MLPredictor;
  private prioritizationStrategy!: PrioritizationStrategy;
  private executionOptimizer!: ExecutionOptimizer;
  private dataStore!: DataStore;
  private reportGenerator!: ReportGenerator;

  constructor(config: OptimizerConfig) {
    this.config = config;
    this.initializeComponents();
  }

  private initializeComponents(): void {
    this.dataStore = new DataStore();
    this.testAnalyzer = new TestAnalyzer(this.dataStore);
    this.codeAnalyzer = new CodeAnalyzer();
    this.coverageAnalyzer = new CoverageAnalyzer();
    this.mlPredictor = new MLPredictor(this.config.ml);
    this.prioritizationStrategy = new PrioritizationStrategy();
    this.executionOptimizer = new ExecutionOptimizer();
    this.reportGenerator = new ReportGenerator(this.config.reporting);
  }

  /**
   * Main entry point - generates optimized execution plan
   */
  async optimizeTestExecution(
    strategy: string = 'balanced',
    codeChanges?: CodeChange[]
  ): Promise<ExecutionPlan> {
    console.log(`🔄 Starting test optimization with strategy: ${strategy}`);

    // 1. Load historical data and current test suite
    const historicalData = await this.loadHistoricalData();
    const testSuite = await this.discoverTests();

    // 2. Analyze code changes if provided
    let affectedAreas: string[] = [];
    if (codeChanges) {
      affectedAreas = await this.codeAnalyzer.analyzeChanges(codeChanges);
    }

    // 3. Get ML predictions for test failures
    const predictions = this.config.ml.enabled
      ? await this.mlPredictor.predictTestFailures(testSuite, codeChanges)
      : [];

    // 4. Calculate test priorities
    const priorities = await this.prioritizationStrategy.calculatePriorities(
      testSuite,
      historicalData,
      affectedAreas,
      predictions
    );

    // 5. Generate execution plan
    const executionStrategy = (this.config.strategies as any)[strategy] || this.config.strategies.balanced;
    const executionPlan = await this.executionOptimizer.generatePlan(
      testSuite,
      priorities,
      executionStrategy,
      this.config
    );

    // 6. Generate optimization report
    if (this.config.reporting.enabled) {
      await this.reportGenerator.generateOptimizationReport(executionPlan, priorities);
    }

    console.log(`✅ Optimization complete - Selected ${executionPlan.selectedTests.length} tests`);
    return executionPlan;
  }

  /**
   * Execute the optimized test plan
   */
  async executeOptimizedPlan(plan: ExecutionPlan): Promise<TestResult[]> {
    console.log(`🚀 Executing optimized test plan: ${plan.id}`);

    const results: TestResult[] = [];
    
    try {
      // Execute test groups in parallel where possible
      for (const group of plan.parallelGroups) {
        const groupResults = await this.executeTestGroup(group);
        results.push(...groupResults);
      }

      // Store results for future learning
      await this.storeExecutionResults(plan, results);

      // Update ML model if configured
      if (this.config.ml.enabled) {
        await this.mlPredictor.updateModel(results);
      }

      console.log(`✅ Execution complete - ${results.length} tests executed`);
      return results;

    } catch (error) {
      console.error('❌ Execution failed:', error);
      throw error;
    }
  }

  /**
   * Quick smoke test execution
   */
  async runSmokeTests(): Promise<TestResult[]> {
    console.log('🔥 Running smoke tests...');
    
    const smokeStrategy = this.config.strategies.smoke;
    const plan = await this.optimizeTestExecution('smoke');
    
    return this.executeOptimizedPlan(plan);
  }

  /**
   * Critical path test execution
   */
  async runCriticalTests(): Promise<TestResult[]> {
    console.log('🚨 Running critical tests...');
    
    const plan = await this.optimizeTestExecution('critical');
    return this.executeOptimizedPlan(plan);
  }

  /**
   * Analyze test results and provide insights
   */
  async analyzeResults(results: TestResult[]): Promise<OptimizationMetrics> {
    return this.testAnalyzer.analyzeResults(results);
  }

  /**
   * Get test recommendations based on code changes
   */
  async getTestRecommendations(codeChanges: CodeChange[]): Promise<TestCase[]> {
    const affectedAreas = await this.codeAnalyzer.analyzeChanges(codeChanges);
    const testSuite = await this.discoverTests();
    
    return testSuite.filter(test => 
      test.codeMapping.some(mapping => 
        affectedAreas.includes(mapping.filePath)
      )
    );
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<OptimizerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initializeComponents();
  }

  /**
   * Get optimization statistics
   */
  async getOptimizationStats(): Promise<any> {
    const historicalData = await this.loadHistoricalData();
    return this.testAnalyzer.getOptimizationStats(historicalData);
  }

  // Private helper methods

  private async loadHistoricalData(): Promise<HistoricalData> {
    return this.dataStore.loadHistoricalData();
  }

  private async discoverTests(): Promise<TestCase[]> {
    const cucumberTests = await this.testAnalyzer.discoverCucumberTests();
    const playwrightTests = await this.testAnalyzer.discoverPlaywrightTests();
    
    return [...cucumberTests, ...playwrightTests];
  }

  private async executeTestGroup(group: any): Promise<TestResult[]> {
    // Implementation would depend on test framework
    // This is a placeholder for the actual execution logic
    console.log(`Executing test group: ${group.id} with ${group.tests.length} tests`);
    
    // For now, return mock results
    return group.tests.map((test: any) => ({
      testId: test.id,
      status: 'passed' as const,
      duration: test.estimatedDuration || 1000,
      timestamp: new Date(),
      environment: 'test',
      commitHash: 'mock-hash',
      buildId: 'mock-build'
    }));
  }

  private async storeExecutionResults(plan: ExecutionPlan, results: TestResult[]): Promise<void> {
    await this.dataStore.storeExecutionResults(plan, results);
  }
}