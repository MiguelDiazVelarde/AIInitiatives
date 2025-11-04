import { ExecutionPlan, TestPriority, OptimizationMetrics, TestResult } from '../core/types';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Generates reports and dashboards for test optimization metrics
 */
export class ReportGenerator {
  private config: any;
  private outputDir: string;

  constructor(config: any) {
    this.config = config;
    this.outputDir = config.outputPath || './test-optimizer-reports';
    this.ensureOutputDirectory();
  }

  /**
   * Generate comprehensive optimization report
   */
  async generateOptimizationReport(
    executionPlan: ExecutionPlan,
    priorities: TestPriority[]
  ): Promise<void> {
    const reportData = {
      timestamp: new Date().toISOString(),
      planId: executionPlan.id,
      strategy: executionPlan.strategy.name,
      summary: this.generateSummary(executionPlan),
      optimization: this.generateOptimizationSection(executionPlan),
      riskAssessment: this.generateRiskSection(executionPlan.riskAssessment),
      testSelection: this.generateTestSelectionSection(executionPlan, priorities),
      parallelExecution: this.generateParallelExecutionSection(executionPlan),
      recommendations: this.generateRecommendations(executionPlan, priorities)
    };

    if (this.config.format === 'json' || this.config.format === 'both') {
      await this.saveJsonReport(reportData, `optimization-report-${executionPlan.id}.json`);
    }

    if (this.config.format === 'html' || this.config.format === 'both') {
      await this.saveHtmlReport(reportData, `optimization-report-${executionPlan.id}.html`);
    }

    console.log(`📊 Optimization report generated: ${this.outputDir}`);
  }

  /**
   * Generate execution results report
   */
  async generateExecutionReport(
    executionPlan: ExecutionPlan,
    results: TestResult[]
  ): Promise<void> {
    const reportData = {
      timestamp: new Date().toISOString(),
      planId: executionPlan.id,
      executionSummary: this.generateExecutionSummary(results),
      testResults: this.generateTestResultsSection(results),
      performance: this.generatePerformanceSection(results, executionPlan),
      failures: this.generateFailuresSection(results),
      trends: this.generateTrendsSection(results)
    };

    if (this.config.format === 'json' || this.config.format === 'both') {
      await this.saveJsonReport(reportData, `execution-report-${executionPlan.id}.json`);
    }

    if (this.config.format === 'html' || this.config.format === 'both') {
      await this.saveHtmlReport(reportData, `execution-report-${executionPlan.id}.html`);
    }
  }

  /**
   * Generate dashboard data for real-time monitoring
   */
  async generateDashboardData(
    executionPlan: ExecutionPlan,
    results: TestResult[]
  ): Promise<any> {
    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: results.length,
        passed: results.filter(r => r.status === 'passed').length,
        failed: results.filter(r => r.status === 'failed').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        duration: results.reduce((sum, r) => sum + r.duration, 0)
      },
      optimization: {
        timeReduction: executionPlan.optimizationMetrics.timeReduction.percentage,
        testReduction: executionPlan.optimizationMetrics.testReduction.percentage,
        confidenceScore: executionPlan.optimizationMetrics.confidenceScore
      },
      risk: {
        overallRisk: executionPlan.riskAssessment.overallRisk,
        coverageRisk: executionPlan.riskAssessment.coverageRisk,
        criticalCoverage: executionPlan.optimizationMetrics.riskCoverage.criticalCoverage
      },
      realTimeMetrics: this.generateRealTimeMetrics(results)
    };
  }

  /**
   * Generate trend analysis report
   */
  async generateTrendReport(
    historicalPlans: ExecutionPlan[],
    historicalResults: TestResult[]
  ): Promise<void> {
    const trendData = {
      timestamp: new Date().toISOString(),
      period: `${historicalPlans.length} executions`,
      optimizationTrends: this.calculateOptimizationTrends(historicalPlans),
      qualityTrends: this.calculateQualityTrends(historicalResults),
      performanceTrends: this.calculatePerformanceTrends(historicalResults),
      recommendations: this.generateTrendRecommendations(historicalPlans, historicalResults)
    };

    await this.saveJsonReport(trendData, 'trend-analysis.json');
    await this.saveHtmlReport(trendData, 'trend-analysis.html');
  }

  // Private methods for report sections

  private generateSummary(executionPlan: ExecutionPlan): any {
    return {
      strategy: executionPlan.strategy.name,
      selectedTests: executionPlan.selectedTests.length,
      totalAvailableTests: executionPlan.totalTests,
      estimatedDuration: this.formatDuration(executionPlan.estimatedDuration),
      parallelGroups: executionPlan.parallelGroups.length,
      optimizationScore: executionPlan.optimizationMetrics.confidenceScore
    };
  }

  private generateOptimizationSection(executionPlan: ExecutionPlan): any {
    const metrics = executionPlan.optimizationMetrics;
    return {
      timeReduction: {
        original: this.formatDuration(metrics.timeReduction.original),
        optimized: this.formatDuration(metrics.timeReduction.optimized),
        savings: `${metrics.timeReduction.percentage.toFixed(1)}%`
      },
      testReduction: {
        original: metrics.testReduction.original,
        selected: metrics.testReduction.selected,
        reduction: `${metrics.testReduction.percentage.toFixed(1)}%`
      },
      riskCoverage: {
        critical: `${(metrics.riskCoverage.criticalCoverage * 100).toFixed(1)}%`,
        high: `${(metrics.riskCoverage.highCoverage * 100).toFixed(1)}%`,
        medium: `${(metrics.riskCoverage.mediumCoverage * 100).toFixed(1)}%`,
        low: `${(metrics.riskCoverage.lowCoverage * 100).toFixed(1)}%`
      }
    };
  }

  private generateRiskSection(riskAssessment: any): any {
    return {
      overallRisk: riskAssessment.overallRisk,
      riskFactors: {
        coverage: `${(riskAssessment.coverageRisk * 100).toFixed(1)}%`,
        functional: `${(riskAssessment.functionalRisk * 100).toFixed(1)}%`,
        performance: `${(riskAssessment.performanceRisk * 100).toFixed(1)}%`,
        security: `${(riskAssessment.securityRisk * 100).toFixed(1)}%`
      },
      skipRisks: riskAssessment.skipRisk.slice(0, 5), // Top 5 risks
      mitigation: this.generateRiskMitigation(riskAssessment)
    };
  }

  private generateTestSelectionSection(executionPlan: ExecutionPlan, priorities: TestPriority[]): any {
    const selectedIds = executionPlan.selectedTests.map(t => t.id);
    const selectedPriorities = priorities.filter(p => selectedIds.includes(p.testId));
    
    return {
      selectionCriteria: executionPlan.strategy.description,
      topPriorityTests: selectedPriorities.slice(0, 10).map(p => ({
        testId: p.testId,
        score: p.score.toFixed(3),
        reasoning: p.reasoning.join(', ')
      })),
      distributionByType: this.calculateTestDistribution(executionPlan.selectedTests),
      distributionByCriticality: this.calculateCriticalityDistribution(executionPlan.selectedTests)
    };
  }

  private generateParallelExecutionSection(executionPlan: ExecutionPlan): any {
    return {
      strategy: executionPlan.strategy.parallelization ? 'Parallel' : 'Sequential',
      groups: executionPlan.parallelGroups.map(group => ({
        id: group.id,
        testCount: group.tests.length,
        parallelizable: group.parallelizable,
        estimatedDuration: this.formatDuration(group.estimatedDuration)
      })),
      parallelizationBenefit: this.calculateParallelizationBenefit(executionPlan)
    };
  }

  private generateRecommendations(executionPlan: ExecutionPlan, priorities: TestPriority[]): any {
    const recommendations: string[] = [];

    // Time optimization recommendations
    if (executionPlan.optimizationMetrics.timeReduction.percentage < 30) {
      recommendations.push('Consider more aggressive test selection to improve time savings');
    }

    // Risk recommendations
    if (executionPlan.riskAssessment.overallRisk === 'high' || executionPlan.riskAssessment.overallRisk === 'critical') {
      recommendations.push('High risk detected - consider including more critical tests');
    }

    // Coverage recommendations
    if (executionPlan.optimizationMetrics.riskCoverage.criticalCoverage < 0.9) {
      recommendations.push('Critical test coverage is below 90% - add more critical tests');
    }

    // Performance recommendations
    const longRunningTests = executionPlan.selectedTests.filter(t => t.estimatedDuration > 60000);
    if (longRunningTests.length > 5) {
      recommendations.push('Consider optimizing or parallelizing long-running tests');
    }

    return recommendations;
  }

  private generateExecutionSummary(results: TestResult[]): any {
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    return {
      totalTests: results.length,
      passed,
      failed,
      skipped,
      passRate: results.length > 0 ? (passed / results.length * 100).toFixed(1) + '%' : '0%',
      totalDuration: this.formatDuration(totalDuration),
      averageDuration: this.formatDuration(totalDuration / results.length)
    };
  }

  private generateTestResultsSection(results: TestResult[]): any {
    return {
      byStatus: {
        passed: results.filter(r => r.status === 'passed').map(r => r.testId),
        failed: results.filter(r => r.status === 'failed').map(r => ({
          testId: r.testId,
          error: r.error,
          duration: r.duration
        })),
        skipped: results.filter(r => r.status === 'skipped').map(r => r.testId)
      },
      slowestTests: results
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10)
        .map(r => ({
          testId: r.testId,
          duration: this.formatDuration(r.duration)
        }))
    };
  }

  private generatePerformanceSection(results: TestResult[], executionPlan: ExecutionPlan): any {
    const actualDuration = results.reduce((sum, r) => sum + r.duration, 0);
    const estimatedDuration = executionPlan.estimatedDuration;
    const variance = ((actualDuration - estimatedDuration) / estimatedDuration) * 100;

    return {
      estimatedDuration: this.formatDuration(estimatedDuration),
      actualDuration: this.formatDuration(actualDuration),
      variance: `${variance.toFixed(1)}%`,
      parallelEfficiency: this.calculateParallelEfficiency(results, executionPlan)
    };
  }

  private generateFailuresSection(results: TestResult[]): any {
    const failures = results.filter(r => r.status === 'failed');
    
    return {
      totalFailures: failures.length,
      failureRate: `${(failures.length / results.length * 100).toFixed(1)}%`,
      failuresByError: this.groupFailuresByError(failures),
      newFailures: [], // Would need historical comparison
      flakyTests: this.identifyFlakyTestsFromResults(results)
    };
  }

  private generateTrendsSection(results: TestResult[]): any {
    // This would typically analyze trends over time
    return {
      durationTrend: 'stable', // Placeholder
      failureRateTrend: 'improving', // Placeholder
      testStabilityTrend: 'stable' // Placeholder
    };
  }

  private generateRealTimeMetrics(results: TestResult[]): any {
    return {
      currentStatus: 'completed',
      progress: 100,
      estimatedCompletion: new Date().toISOString(),
      recentFailures: results.filter(r => r.status === 'failed').slice(-5)
    };
  }

  // Helper methods

  private async ensureOutputDirectory(): Promise<void> {
    try {
      await fs.promises.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error('Error creating output directory:', error);
    }
  }

  private async saveJsonReport(data: any, filename: string): Promise<void> {
    const filePath = path.join(this.outputDir, filename);
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  private async saveHtmlReport(data: any, filename: string): Promise<void> {
    const html = this.generateHtmlReport(data);
    const filePath = path.join(this.outputDir, filename);
    await fs.promises.writeFile(filePath, html);
  }

  private generateHtmlReport(data: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Test Optimization Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; padding: 15px; border-left: 4px solid #007acc; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: #f9f9f9; border-radius: 3px; }
        .risk-high { color: #d32f2f; }
        .risk-medium { color: #f57c00; }
        .risk-low { color: #388e3c; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Test Optimization Report</h1>
        <p>Generated: ${data.timestamp}</p>
        <p>Plan ID: ${data.planId || 'N/A'}</p>
    </div>
    
    <div class="section">
        <h2>Summary</h2>
        ${this.generateHtmlSection(data.summary || data.executionSummary)}
    </div>
    
    <div class="section">
        <h2>Optimization Metrics</h2>
        ${this.generateHtmlSection(data.optimization || {})}
    </div>
    
    <div class="section">
        <h2>Risk Assessment</h2>
        ${this.generateHtmlSection(data.riskAssessment || data.risk || {})}
    </div>
    
    ${data.recommendations ? `
    <div class="section">
        <h2>Recommendations</h2>
        <ul>
            ${data.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
    ` : ''}
</body>
</html>
    `;
  }

  private generateHtmlSection(data: any): string {
    if (!data || typeof data !== 'object') return '';
    
    return Object.entries(data)
      .map(([key, value]) => {
        if (typeof value === 'object') {
          return `<h3>${key}</h3>${this.generateHtmlSection(value)}`;
        }
        return `<div class="metric"><strong>${key}:</strong> ${value}</div>`;
      })
      .join('');
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }

  private calculateTestDistribution(tests: any[]): any {
    const distribution: any = {};
    for (const test of tests) {
      distribution[test.type] = (distribution[test.type] || 0) + 1;
    }
    return distribution;
  }

  private calculateCriticalityDistribution(tests: any[]): any {
    const distribution: any = {};
    for (const test of tests) {
      distribution[test.criticalityLevel] = (distribution[test.criticalityLevel] || 0) + 1;
    }
    return distribution;
  }

  private calculateParallelizationBenefit(executionPlan: ExecutionPlan): string {
    if (!executionPlan.strategy.parallelization) return 'N/A';
    
    const sequentialTime = executionPlan.selectedTests.reduce((sum, t) => sum + t.estimatedDuration, 0);
    const parallelTime = executionPlan.estimatedDuration;
    const benefit = ((sequentialTime - parallelTime) / sequentialTime) * 100;
    
    return `${benefit.toFixed(1)}% time savings`;
  }

  private calculateParallelEfficiency(results: TestResult[], executionPlan: ExecutionPlan): string {
    // This is a simplified calculation
    return '85%'; // Placeholder
  }

  private groupFailuresByError(failures: TestResult[]): any {
    const grouped: any = {};
    for (const failure of failures) {
      const errorType = failure.error?.split(':')[0] || 'Unknown';
      grouped[errorType] = (grouped[errorType] || 0) + 1;
    }
    return grouped;
  }

  private identifyFlakyTestsFromResults(results: TestResult[]): string[] {
    // This would need historical data to properly identify flaky tests
    return []; // Placeholder
  }

  private calculateOptimizationTrends(plans: ExecutionPlan[]): any {
    // Calculate trends over multiple plans
    return {
      averageTimeReduction: plans.reduce((sum, p) => sum + p.optimizationMetrics.timeReduction.percentage, 0) / plans.length,
      averageTestReduction: plans.reduce((sum, p) => sum + p.optimizationMetrics.testReduction.percentage, 0) / plans.length,
      averageConfidence: plans.reduce((sum, p) => sum + p.optimizationMetrics.confidenceScore, 0) / plans.length
    };
  }

  private calculateQualityTrends(results: TestResult[]): any {
    // Calculate quality trends over time
    return {
      overallPassRate: results.filter(r => r.status === 'passed').length / results.length,
      failureRate: results.filter(r => r.status === 'failed').length / results.length
    };
  }

  private calculatePerformanceTrends(results: TestResult[]): any {
    // Calculate performance trends
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    return {
      averageExecutionTime: avgDuration,
      trend: 'stable' // Would need historical comparison
    };
  }

  private generateTrendRecommendations(plans: ExecutionPlan[], results: TestResult[]): string[] {
    const recommendations: string[] = [];
    
    const avgTimeReduction = plans.reduce((sum, p) => sum + p.optimizationMetrics.timeReduction.percentage, 0) / plans.length;
    if (avgTimeReduction < 30) {
      recommendations.push('Consider more aggressive optimization strategies to improve time savings');
    }

    const avgFailureRate = results.filter(r => r.status === 'failed').length / results.length;
    if (avgFailureRate > 0.05) { // 5% failure rate threshold
      recommendations.push('High failure rate detected - focus on test stability improvements');
    }

    return recommendations;
  }

  private generateRiskMitigation(riskAssessment: any): string[] {
    const mitigations: string[] = [];
    
    if (riskAssessment.coverageRisk > 0.5) {
      mitigations.push('Increase test coverage in next full run');
    }
    
    if (riskAssessment.functionalRisk > 0.3) {
      mitigations.push('Add more functional tests to critical paths');
    }
    
    if (riskAssessment.securityRisk > 0.4) {
      mitigations.push('Include security tests in next execution');
    }

    return mitigations;
  }
}