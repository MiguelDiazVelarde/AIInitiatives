import { TestCase, TestResult, HistoricalData, OptimizationMetrics } from '../core/types';
import { DataStore } from '../data/DataStore';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Analyzes test execution history, patterns, and metrics
 */
export class TestAnalyzer {
  private dataStore: DataStore;

  constructor(dataStore: DataStore) {
    this.dataStore = dataStore;
  }

  /**
   * Discover Cucumber test cases from feature files
   */
  async discoverCucumberTests(): Promise<TestCase[]> {
    const testCases: TestCase[] = [];
    const featuresDir = path.join(process.cwd(), 'tests', 'features');
    
    try {
      const featureFiles = await this.findFeatureFiles(featuresDir);
      
      for (const featureFile of featureFiles) {
        const scenarios = await this.parseFeatureFile(featureFile);
        testCases.push(...scenarios);
      }
    } catch (error) {
      console.warn('Error discovering Cucumber tests:', error);
    }

    return testCases;
  }

  /**
   * Discover Playwright test cases
   */
  async discoverPlaywrightTests(): Promise<TestCase[]> {
    const testCases: TestCase[] = [];
    const testsDir = path.join(process.cwd(), 'tests');
    
    try {
      const testFiles = await this.findTestFiles(testsDir, ['.spec.ts', '.test.ts']);
      
      for (const testFile of testFiles) {
        const tests = await this.parsePlaywrightFile(testFile);
        testCases.push(...tests);
      }
    } catch (error) {
      console.warn('Error discovering Playwright tests:', error);
    }

    return testCases;
  }

  /**
   * Analyze test execution results and calculate metrics
   */
  async analyzeResults(results: TestResult[]): Promise<OptimizationMetrics> {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.status === 'passed').length;
    const failedTests = results.filter(r => r.status === 'failed').length;
    const skippedTests = results.filter(r => r.status === 'skipped').length;
    
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    const avgDuration = totalDuration / totalTests;

    // Calculate historical comparison
    const historicalData = await this.dataStore.loadHistoricalData();
    const historicalAvgDuration = this.calculateHistoricalAverage(historicalData);
    
    return {
      timeReduction: {
        original: historicalAvgDuration,
        optimized: totalDuration,
        percentage: ((historicalAvgDuration - totalDuration) / historicalAvgDuration) * 100
      },
      testReduction: {
        original: historicalData.testExecutions.length,
        selected: totalTests,
        percentage: ((historicalData.testExecutions.length - totalTests) / historicalData.testExecutions.length) * 100
      },
      riskCoverage: {
        criticalCoverage: this.calculateCriticalCoverage(results),
        highCoverage: this.calculateHighCoverage(results),
        mediumCoverage: this.calculateMediumCoverage(results),
        lowCoverage: this.calculateLowCoverage(results)
      },
      confidenceScore: this.calculateConfidenceScore(results, totalTests)
    };
  }

  /**
   * Get optimization statistics from historical data
   */
  async getOptimizationStats(historicalData: HistoricalData): Promise<any> {
    const totalExecutions = historicalData.testExecutions.length;
    const failureRate = historicalData.testExecutions.filter(e => e.status === 'failed').length / totalExecutions;
    
    const executionTrends = this.calculateExecutionTrends(historicalData.testExecutions);
    const flakyTests = this.identifyFlakyTests(historicalData.testExecutions);
    const slowTests = this.identifySlowTests(historicalData.testExecutions);

    return {
      totalExecutions,
      failureRate,
      executionTrends,
      flakyTests: flakyTests.length,
      slowTests: slowTests.length,
      avgExecutionTime: this.calculateHistoricalAverage(historicalData),
      testStabilityScore: this.calculateStabilityScore(historicalData.testExecutions)
    };
  }

  /**
   * Identify flaky tests based on execution history
   */
  identifyFlakyTests(executions: TestResult[], threshold: number = 0.2): string[] {
    const testStats = new Map<string, { total: number; failed: number }>();
    
    executions.forEach(execution => {
      const stats = testStats.get(execution.testId) || { total: 0, failed: 0 };
      stats.total++;
      if (execution.status === 'failed') {
        stats.failed++;
      }
      testStats.set(execution.testId, stats);
    });

    const flakyTests: string[] = [];
    testStats.forEach((stats, testId) => {
      const failureRate = stats.failed / stats.total;
      if (failureRate > 0 && failureRate < threshold && stats.total >= 5) {
        flakyTests.push(testId);
      }
    });

    return flakyTests;
  }

  /**
   * Identify slow tests that consistently take longer than average
   */
  identifySlowTests(executions: TestResult[], multiplier: number = 2): string[] {
    const avgDuration = executions.reduce((sum, e) => sum + e.duration, 0) / executions.length;
    const slowThreshold = avgDuration * multiplier;

    const testDurations = new Map<string, number[]>();
    executions.forEach(execution => {
      const durations = testDurations.get(execution.testId) || [];
      durations.push(execution.duration);
      testDurations.set(execution.testId, durations);
    });

    const slowTests: string[] = [];
    testDurations.forEach((durations, testId) => {
      const avgTestDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      if (avgTestDuration > slowThreshold && durations.length >= 3) {
        slowTests.push(testId);
      }
    });

    return slowTests;
  }

  // Private helper methods

  private async findFeatureFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const subFiles = await this.findFeatureFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.name.endsWith('.feature')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist, that's okay
    }

    return files;
  }

  private async findTestFiles(dir: string, extensions: string[]): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const subFiles = await this.findTestFiles(fullPath, extensions);
          files.push(...subFiles);
        } else if (extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist, that's okay
    }

    return files;
  }

  private async parseFeatureFile(filePath: string): Promise<TestCase[]> {
    const testCases: TestCase[] = [];
    
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      let currentFeature = '';
      let currentScenario = '';
      let lineNumber = 0;
      
      for (const line of lines) {
        lineNumber++;
        const trimmed = line.trim();
        
        if (trimmed.startsWith('Feature:')) {
          currentFeature = trimmed.replace('Feature:', '').trim();
        } else if (trimmed.startsWith('Scenario:') || trimmed.startsWith('Scenario Outline:')) {
          currentScenario = trimmed.replace(/^Scenario( Outline)?:/, '').trim();
          
          const testCase: TestCase = {
            id: `${path.basename(filePath)}-${currentScenario.replace(/\s+/g, '-').toLowerCase()}`,
            name: currentScenario,
            feature: currentFeature,
            path: filePath,
            type: 'cucumber',
            tags: this.extractTags(lines, lineNumber - 1),
            estimatedDuration: 5000, // Default 5 seconds
            dependencies: [],
            criticalityLevel: this.determineCriticality(currentScenario, filePath),
            historicalResults: [],
            codeMapping: []
          };
          
          testCases.push(testCase);
        }
      }
    } catch (error) {
      console.warn(`Error parsing feature file ${filePath}:`, error);
    }

    return testCases;
  }

  private async parsePlaywrightFile(filePath: string): Promise<TestCase[]> {
    const testCases: TestCase[] = [];
    
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const testMatches = content.match(/test\(['"`]([^'"`]+)['"`]/g);
      
      if (testMatches) {
        testMatches.forEach((match, index) => {
          const testName = match.replace(/test\(['"`]/, '').replace(/['"`]$/, '');
          
          const testCase: TestCase = {
            id: `${path.basename(filePath)}-test-${index}`,
            name: testName,
            feature: path.basename(filePath, path.extname(filePath)),
            path: filePath,
            type: 'playwright',
            tags: [],
            estimatedDuration: 10000, // Default 10 seconds for Playwright tests
            dependencies: [],
            criticalityLevel: this.determineCriticality(testName, filePath),
            historicalResults: [],
            codeMapping: []
          };
          
          testCases.push(testCase);
        });
      }
    } catch (error) {
      console.warn(`Error parsing Playwright file ${filePath}:`, error);
    }

    return testCases;
  }

  private extractTags(lines: string[], scenarioLineIndex: number): string[] {
    const tags: string[] = [];
    
    // Look for tags on the line before the scenario
    if (scenarioLineIndex > 0) {
      const previousLine = lines[scenarioLineIndex - 1].trim();
      if (previousLine.startsWith('@')) {
        const tagMatches = previousLine.match(/@\w+/g);
        if (tagMatches) {
          tags.push(...tagMatches);
        }
      }
    }

    return tags;
  }

  private determineCriticality(name: string, filePath: string): 'low' | 'medium' | 'high' | 'critical' {
    const lowercaseName = name.toLowerCase();
    const lowercasePath = filePath.toLowerCase();
    
    if (lowercaseName.includes('critical') || lowercasePath.includes('critical') || 
        lowercaseName.includes('security') || lowercasePath.includes('security')) {
      return 'critical';
    }
    
    if (lowercaseName.includes('auth') || lowercasePath.includes('auth') ||
        lowercaseName.includes('login') || lowercasePath.includes('login')) {
      return 'high';
    }
    
    if (lowercaseName.includes('smoke') || lowercasePath.includes('smoke')) {
      return 'high';
    }
    
    return 'medium';
  }

  private calculateHistoricalAverage(historicalData: HistoricalData): number {
    if (historicalData.testExecutions.length === 0) return 0;
    
    return historicalData.testExecutions.reduce((sum, e) => sum + e.duration, 0) / 
           historicalData.testExecutions.length;
  }

  private calculateCriticalCoverage(results: TestResult[]): number {
    // This would need to be enhanced with actual criticality mapping
    return 0.95; // Placeholder
  }

  private calculateHighCoverage(results: TestResult[]): number {
    return 0.85; // Placeholder
  }

  private calculateMediumCoverage(results: TestResult[]): number {
    return 0.75; // Placeholder
  }

  private calculateLowCoverage(results: TestResult[]): number {
    return 0.65; // Placeholder
  }

  private calculateConfidenceScore(results: TestResult[], totalTests: number): number {
    const passRate = results.filter(r => r.status === 'passed').length / totalTests;
    return Math.min(0.95, passRate + 0.1); // Cap at 95% confidence
  }

  private calculateExecutionTrends(executions: TestResult[]): any {
    // Group by date and calculate trends
    const dailyStats = new Map<string, { total: number; failed: number; duration: number }>();
    
    executions.forEach(execution => {
      const date = execution.timestamp.toISOString().split('T')[0];
      const stats = dailyStats.get(date) || { total: 0, failed: 0, duration: 0 };
      stats.total++;
      if (execution.status === 'failed') stats.failed++;
      stats.duration += execution.duration;
      dailyStats.set(date, stats);
    });

    return Array.from(dailyStats.entries()).map(([date, stats]) => ({
      date,
      totalTests: stats.total,
      failureRate: stats.failed / stats.total,
      avgDuration: stats.duration / stats.total
    }));
  }

  private calculateStabilityScore(executions: TestResult[]): number {
    if (executions.length === 0) return 1.0;
    
    const failureRate = executions.filter(e => e.status === 'failed').length / executions.length;
    return Math.max(0, 1 - (failureRate * 2)); // Penalize failures heavily
  }
}