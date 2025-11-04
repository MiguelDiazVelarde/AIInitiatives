import { 
  TestCase, 
  TestPriority, 
  ExecutionPlan, 
  ExecutionStrategy, 
  OptimizerConfig,
  TestGroup,
  RiskAssessment,
  OptimizationMetrics
} from '../core/types';

/**
 * Optimizes test execution plans and parallel execution strategies
 */
export class ExecutionOptimizer {

  /**
   * Generate an optimized execution plan
   */
  async generatePlan(
    testCases: TestCase[],
    priorities: TestPriority[],
    strategy: ExecutionStrategy,
    config: OptimizerConfig
  ): Promise<ExecutionPlan> {
    // Select tests based on strategy
    const selectedTests = this.selectTests(testCases, priorities, strategy, config);
    
    // Create parallel groups
    const parallelGroups = this.createParallelGroups(selectedTests, strategy);
    
    // Calculate metrics
    const estimatedDuration = this.calculateEstimatedDuration(parallelGroups);
    const riskAssessment = this.assessRisk(selectedTests, testCases, priorities);
    const optimizationMetrics = this.calculateOptimizationMetrics(selectedTests, testCases);

    return {
      id: this.generatePlanId(),
      timestamp: new Date(),
      strategy,
      totalTests: selectedTests.length,
      selectedTests,
      estimatedDuration,
      parallelGroups,
      riskAssessment,
      optimizationMetrics
    };
  }

  /**
   * Select tests based on the execution strategy
   */
  private selectTests(
    testCases: TestCase[],
    priorities: TestPriority[],
    strategy: ExecutionStrategy,
    config: OptimizerConfig
  ): TestCase[] {
    let selectedTestIds: string[] = [];

    switch (strategy.name) {
      case 'smoke':
        selectedTestIds = this.selectSmokeTests(priorities, strategy);
        break;
      case 'critical':
        selectedTestIds = this.selectCriticalTests(priorities, strategy);
        break;
      case 'quick':
        selectedTestIds = this.selectQuickTests(priorities, strategy);
        break;
      case 'balanced':
        selectedTestIds = this.selectBalancedTests(priorities, strategy, config);
        break;
      case 'comprehensive':
        selectedTestIds = this.selectComprehensiveTests(priorities, strategy);
        break;
      default:
        selectedTestIds = this.selectBalancedTests(priorities, strategy, config);
    }

    // Filter and return actual test cases
    return testCases.filter(tc => selectedTestIds.includes(tc.id));
  }

  /**
   * Select smoke tests
   */
  private selectSmokeTests(priorities: TestPriority[], strategy: ExecutionStrategy): string[] {
    return priorities
      .filter(p => p.factors.businessCriticality > 0.7)
      .slice(0, strategy.maxTests || 10)
      .map(p => p.testId);
  }

  /**
   * Select critical tests
   */
  private selectCriticalTests(priorities: TestPriority[], strategy: ExecutionStrategy): string[] {
    return priorities
      .filter(p => p.factors.businessCriticality > 0.6 || p.factors.riskScore > 0.7)
      .slice(0, strategy.maxTests || 25)
      .map(p => p.testId);
  }

  /**
   * Select quick feedback tests
   */
  private selectQuickTests(priorities: TestPriority[], strategy: ExecutionStrategy): string[] {
    const maxDuration = strategy.maxDuration || 600000; // 10 minutes default
    const quickTests = priorities
      .filter(p => p.factors.executionTime > 0.5) // Fast tests
      .sort((a, b) => b.score - a.score);

    const selected: string[] = [];
    let totalDuration = 0;

    for (const priority of quickTests) {
      const estimatedDuration = this.getTestDuration(priority.testId);
      if (totalDuration + estimatedDuration <= maxDuration) {
        selected.push(priority.testId);
        totalDuration += estimatedDuration;
      }
    }

    return selected;
  }

  /**
   * Select balanced set of tests
   */
  private selectBalancedTests(
    priorities: TestPriority[],
    strategy: ExecutionStrategy,
    config: OptimizerConfig
  ): string[] {
    const maxDuration = strategy.maxDuration || 1800000; // 30 minutes default
    const maxTests = strategy.maxTests || 50;
    
    // Always include critical tests
    const criticalTests = priorities
      .filter(p => p.factors.businessCriticality > 0.8)
      .slice(0, 10)
      .map(p => p.testId);

    // Add high-priority tests within time budget
    const remainingPriorities = priorities.filter(p => !criticalTests.includes(p.testId));
    const additionalTests: string[] = [];
    let totalDuration = this.calculateDurationForTests(criticalTests);

    for (const priority of remainingPriorities) {
      if (additionalTests.length + criticalTests.length >= maxTests) break;
      
      const testDuration = this.getTestDuration(priority.testId);
      if (totalDuration + testDuration <= maxDuration) {
        // Apply risk tolerance filtering
        if (this.meetsRiskTolerance(priority, strategy.riskTolerance)) {
          additionalTests.push(priority.testId);
          totalDuration += testDuration;
        }
      }
    }

    return [...criticalTests, ...additionalTests];
  }

  /**
   * Select comprehensive test set
   */
  private selectComprehensiveTests(priorities: TestPriority[], strategy: ExecutionStrategy): string[] {
    const maxTests = strategy.maxTests || 100;
    
    // Include most tests, filtering only very low priority or flaky ones
    return priorities
      .filter(p => p.score > 0.2 && p.factors.flakyScore < 0.7)
      .slice(0, maxTests)
      .map(p => p.testId);
  }

  /**
   * Create parallel execution groups
   */
  private createParallelGroups(testCases: TestCase[], strategy: ExecutionStrategy): TestGroup[] {
    if (!strategy.parallelization) {
      // Sequential execution
      return [{
        id: 'sequential',
        tests: testCases,
        parallelizable: false,
        dependencies: [],
        estimatedDuration: testCases.reduce((sum, tc) => sum + tc.estimatedDuration, 0)
      }];
    }

    const groups: TestGroup[] = [];
    const processedTests = new Set<string>();
    
    // Group 1: Independent fast tests (can run in parallel)
    const fastIndependentTests = testCases.filter(tc => 
      tc.estimatedDuration < 30000 && // Less than 30 seconds
      tc.dependencies.length === 0 &&
      !processedTests.has(tc.id)
    );

    if (fastIndependentTests.length > 0) {
      groups.push({
        id: 'fast-parallel',
        tests: fastIndependentTests,
        parallelizable: true,
        dependencies: [],
        estimatedDuration: Math.max(...fastIndependentTests.map(tc => tc.estimatedDuration))
      });
      fastIndependentTests.forEach(tc => processedTests.add(tc.id));
    }

    // Group 2: Medium duration independent tests
    const mediumIndependentTests = testCases.filter(tc => 
      tc.estimatedDuration >= 30000 && 
      tc.estimatedDuration < 120000 && // 30s to 2 minutes
      tc.dependencies.length === 0 &&
      !processedTests.has(tc.id)
    );

    if (mediumIndependentTests.length > 0) {
      groups.push({
        id: 'medium-parallel',
        tests: mediumIndependentTests,
        parallelizable: true,
        dependencies: [],
        estimatedDuration: Math.max(...mediumIndependentTests.map(tc => tc.estimatedDuration))
      });
      mediumIndependentTests.forEach(tc => processedTests.add(tc.id));
    }

    // Group 3: Dependent tests (must run sequentially)
    const dependentTests = testCases.filter(tc => 
      tc.dependencies.length > 0 && !processedTests.has(tc.id)
    );
    
    if (dependentTests.length > 0) {
      // Sort by dependency order
      const sortedDependentTests = this.sortByDependencies(dependentTests);
      groups.push({
        id: 'dependent-sequential',
        tests: sortedDependentTests,
        parallelizable: false,
        dependencies: [],
        estimatedDuration: sortedDependentTests.reduce((sum, tc) => sum + tc.estimatedDuration, 0)
      });
      sortedDependentTests.forEach(tc => processedTests.add(tc.id));
    }

    // Group 4: Remaining tests
    const remainingTests = testCases.filter(tc => !processedTests.has(tc.id));
    if (remainingTests.length > 0) {
      groups.push({
        id: 'remaining',
        tests: remainingTests,
        parallelizable: true,
        dependencies: [],
        estimatedDuration: Math.max(...remainingTests.map(tc => tc.estimatedDuration))
      });
    }

    return groups;
  }

  /**
   * Calculate estimated duration for parallel groups
   */
  private calculateEstimatedDuration(groups: TestGroup[]): number {
    let totalDuration = 0;

    for (const group of groups) {
      if (group.parallelizable) {
        // For parallel groups, use the longest test duration
        totalDuration += group.estimatedDuration;
      } else {
        // For sequential groups, sum all test durations
        totalDuration += group.tests.reduce((sum, tc) => sum + tc.estimatedDuration, 0);
      }
    }

    return totalDuration;
  }

  /**
   * Assess risk of the selected test set
   */
  private assessRisk(
    selectedTests: TestCase[],
    allTests: TestCase[],
    priorities: TestPriority[]
  ): RiskAssessment {
    const totalTests = allTests.length;
    const selectedCount = selectedTests.length;
    const coveragePercentage = selectedCount / totalTests;

    // Calculate coverage by criticality
    const criticalTests = allTests.filter(tc => tc.criticalityLevel === 'critical');
    const selectedCritical = selectedTests.filter(tc => tc.criticalityLevel === 'critical');
    const criticalCoverage = criticalTests.length > 0 ? selectedCritical.length / criticalTests.length : 1;

    // Calculate risk scores
    const overallRisk = this.determineOverallRisk(coveragePercentage, criticalCoverage);
    const skippedTests = allTests.filter(tc => !selectedTests.some(st => st.id === tc.id));
    const skipRisk = this.calculateSkipRisk(skippedTests, priorities);

    return {
      overallRisk,
      coverageRisk: 1 - coveragePercentage,
      functionalRisk: 1 - criticalCoverage,
      performanceRisk: this.calculatePerformanceRisk(selectedTests),
      securityRisk: this.calculateSecurityRisk(selectedTests, allTests),
      skipRisk
    };
  }

  /**
   * Calculate optimization metrics
   */
  private calculateOptimizationMetrics(selectedTests: TestCase[], allTests: TestCase[]): OptimizationMetrics {
    const originalDuration = allTests.reduce((sum, tc) => sum + tc.estimatedDuration, 0);
    const optimizedDuration = selectedTests.reduce((sum, tc) => sum + tc.estimatedDuration, 0);

    const criticalTests = allTests.filter(tc => tc.criticalityLevel === 'critical');
    const selectedCritical = selectedTests.filter(tc => tc.criticalityLevel === 'critical');

    return {
      timeReduction: {
        original: originalDuration,
        optimized: optimizedDuration,
        percentage: ((originalDuration - optimizedDuration) / originalDuration) * 100
      },
      testReduction: {
        original: allTests.length,
        selected: selectedTests.length,
        percentage: ((allTests.length - selectedTests.length) / allTests.length) * 100
      },
      riskCoverage: {
        criticalCoverage: criticalTests.length > 0 ? selectedCritical.length / criticalTests.length : 1,
        highCoverage: this.calculateCoverageByLevel(selectedTests, allTests, 'high'),
        mediumCoverage: this.calculateCoverageByLevel(selectedTests, allTests, 'medium'),
        lowCoverage: this.calculateCoverageByLevel(selectedTests, allTests, 'low')
      },
      confidenceScore: this.calculateConfidenceScore(selectedTests, allTests)
    };
  }

  // Private helper methods

  private generatePlanId(): string {
    return `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getTestDuration(testId: string): number {
    // This would typically look up the actual test duration
    // For now, return a default value
    return 5000; // 5 seconds default
  }

  private calculateDurationForTests(testIds: string[]): number {
    return testIds.length * 5000; // Simplified calculation
  }

  private meetsRiskTolerance(priority: TestPriority, riskTolerance: string): boolean {
    switch (riskTolerance) {
      case 'conservative':
        return priority.score > 0.7;
      case 'balanced':
        return priority.score > 0.4;
      case 'aggressive':
        return priority.score > 0.2;
      default:
        return true;
    }
  }

  private sortByDependencies(tests: TestCase[]): TestCase[] {
    // Simple topological sort for dependencies
    const sorted: TestCase[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (test: TestCase) => {
      if (visiting.has(test.id)) {
        // Circular dependency detected, skip
        return;
      }
      if (visited.has(test.id)) {
        return;
      }

      visiting.add(test.id);

      // Visit dependencies first
      for (const depId of test.dependencies) {
        const depTest = tests.find(t => t.id === depId);
        if (depTest) {
          visit(depTest);
        }
      }

      visiting.delete(test.id);
      visited.add(test.id);
      sorted.push(test);
    };

    for (const test of tests) {
      visit(test);
    }

    return sorted;
  }

  private determineOverallRisk(coveragePercentage: number, criticalCoverage: number): 'low' | 'medium' | 'high' | 'critical' {
    if (criticalCoverage < 0.8 || coveragePercentage < 0.3) return 'critical';
    if (criticalCoverage < 0.9 || coveragePercentage < 0.5) return 'high';
    if (criticalCoverage < 0.95 || coveragePercentage < 0.7) return 'medium';
    return 'low';
  }

  private calculateSkipRisk(skippedTests: TestCase[], priorities: TestPriority[]): any[] {
    return skippedTests
      .map(test => {
        const priority = priorities.find(p => p.testId === test.id);
        const riskLevel = priority ? this.getRiskLevel(priority.score) : 'low';
        
        return {
          testId: test.id,
          riskLevel,
          reason: `Test skipped in optimization`,
          mitigationStrategy: riskLevel === 'high' ? 'Include in next full run' : undefined
        };
      })
      .filter(risk => risk.riskLevel !== 'low')
      .slice(0, 10); // Limit to top 10 risks
  }

  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score > 0.8) return 'critical';
    if (score > 0.6) return 'high';
    if (score > 0.4) return 'medium';
    return 'low';
  }

  private calculatePerformanceRisk(selectedTests: TestCase[]): number {
    const performanceTests = selectedTests.filter(tc => 
      tc.tags.some(tag => tag.includes('performance')) ||
      tc.feature.toLowerCase().includes('performance')
    );
    
    return performanceTests.length === 0 ? 0.7 : 0.2;
  }

  private calculateSecurityRisk(selectedTests: TestCase[], allTests: TestCase[]): number {
    const allSecurityTests = allTests.filter(tc => 
      tc.tags.some(tag => tag.includes('security')) ||
      tc.feature.toLowerCase().includes('security')
    );
    
    const selectedSecurityTests = selectedTests.filter(tc => 
      tc.tags.some(tag => tag.includes('security')) ||
      tc.feature.toLowerCase().includes('security')
    );

    if (allSecurityTests.length === 0) return 0.1;
    
    return 1 - (selectedSecurityTests.length / allSecurityTests.length);
  }

  private calculateCoverageByLevel(
    selectedTests: TestCase[], 
    allTests: TestCase[], 
    level: 'high' | 'medium' | 'low'
  ): number {
    const levelTests = allTests.filter(tc => tc.criticalityLevel === level);
    const selectedLevelTests = selectedTests.filter(tc => tc.criticalityLevel === level);
    
    return levelTests.length > 0 ? selectedLevelTests.length / levelTests.length : 1;
  }

  private calculateConfidenceScore(selectedTests: TestCase[], allTests: TestCase[]): number {
    const coverageRatio = selectedTests.length / allTests.length;
    const criticalCoverage = this.calculateCoverageByLevel(selectedTests, allTests, 'high');
    
    // Weighted confidence based on coverage and critical test inclusion
    return Math.min(0.95, (coverageRatio * 0.6) + (criticalCoverage * 0.4));
  }
}