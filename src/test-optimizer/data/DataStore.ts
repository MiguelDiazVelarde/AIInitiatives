import { HistoricalData, TestResult, ExecutionPlan, BuildData, EnvironmentData } from '../core/types';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Manages storage and retrieval of test execution data and historical information
 */
export class DataStore {
  private dataDir: string;
  private executionHistoryFile: string;
  private buildHistoryFile: string;
  private environmentHistoryFile: string;

  constructor(dataDir: string = './test-optimizer-data') {
    this.dataDir = dataDir;
    this.executionHistoryFile = path.join(dataDir, 'execution-history.json');
    this.buildHistoryFile = path.join(dataDir, 'build-history.json');
    this.environmentHistoryFile = path.join(dataDir, 'environment-history.json');
    
    this.ensureDataDirectory();
  }

  /**
   * Load historical test execution data
   */
  async loadHistoricalData(): Promise<HistoricalData> {
    const testExecutions = await this.loadTestExecutions();
    const buildData = await this.loadBuildData();
    const environmentData = await this.loadEnvironmentData();
    
    return {
      testExecutions,
      codeChanges: [], // This would be loaded from Git or other source
      buildData,
      environmentData
    };
  }

  /**
   * Store test execution results
   */
  async storeExecutionResults(plan: ExecutionPlan, results: TestResult[]): Promise<void> {
    try {
      const existingExecutions = await this.loadTestExecutions();
      
      // Add new results with metadata
      const enhancedResults = results.map(result => ({
        ...result,
        planId: plan.id,
        strategy: plan.strategy.name,
        timestamp: new Date()
      }));
      
      const updatedExecutions = [...existingExecutions, ...enhancedResults];
      
      // Keep only last 1000 executions to prevent file from growing too large
      const trimmedExecutions = updatedExecutions.slice(-1000);
      
      await fs.promises.writeFile(
        this.executionHistoryFile,
        JSON.stringify(trimmedExecutions, null, 2)
      );
      
      console.log(`Stored ${results.length} test execution results`);
    } catch (error) {
      console.error('Error storing execution results:', error);
    }
  }

  /**
   * Store build information
   */
  async storeBuildData(buildData: BuildData): Promise<void> {
    try {
      const existingBuilds = await this.loadBuildData();
      const updatedBuilds = [...existingBuilds, buildData];
      
      // Keep only last 100 builds
      const trimmedBuilds = updatedBuilds.slice(-100);
      
      await fs.promises.writeFile(
        this.buildHistoryFile,
        JSON.stringify(trimmedBuilds, null, 2)
      );
    } catch (error) {
      console.error('Error storing build data:', error);
    }
  }

  /**
   * Store environment data
   */
  async storeEnvironmentData(environmentData: EnvironmentData): Promise<void> {
    try {
      const existingEnvironments = await this.loadEnvironmentData();
      
      // Update existing environment or add new one
      const updatedEnvironments = existingEnvironments.filter(
        env => env.name !== environmentData.name
      );
      updatedEnvironments.push(environmentData);
      
      await fs.promises.writeFile(
        this.environmentHistoryFile,
        JSON.stringify(updatedEnvironments, null, 2)
      );
    } catch (error) {
      console.error('Error storing environment data:', error);
    }
  }

  /**
   * Get test execution history for a specific test
   */
  async getTestHistory(testId: string): Promise<TestResult[]> {
    const allExecutions = await this.loadTestExecutions();
    return allExecutions.filter(execution => execution.testId === testId);
  }

  /**
   * Get recent test executions within a time period
   */
  async getRecentExecutions(daysPast: number = 30): Promise<TestResult[]> {
    const allExecutions = await this.loadTestExecutions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysPast);
    
    return allExecutions.filter(execution => 
      new Date(execution.timestamp) >= cutoffDate
    );
  }

  /**
   * Get test statistics
   */
  async getTestStatistics(): Promise<{
    totalExecutions: number;
    averageExecutionTime: number;
    failureRate: number;
    mostFailedTests: Array<{testId: string, failures: number}>;
    slowestTests: Array<{testId: string, avgDuration: number}>;
  }> {
    const executions = await this.loadTestExecutions();
    
    if (executions.length === 0) {
      return {
        totalExecutions: 0,
        averageExecutionTime: 0,
        failureRate: 0,
        mostFailedTests: [],
        slowestTests: []
      };
    }
    
    const totalExecutions = executions.length;
    const totalDuration = executions.reduce((sum, e) => sum + e.duration, 0);
    const averageExecutionTime = totalDuration / totalExecutions;
    const failures = executions.filter(e => e.status === 'failed').length;
    const failureRate = failures / totalExecutions;
    
    // Calculate test-specific statistics
    const testStats = new Map<string, {failures: number, durations: number[]}>();
    
    for (const execution of executions) {
      const stats = testStats.get(execution.testId) || {failures: 0, durations: []};
      if (execution.status === 'failed') {
        stats.failures++;
      }
      stats.durations.push(execution.duration);
      testStats.set(execution.testId, stats);
    }
    
    // Most failed tests
    const mostFailedTests = Array.from(testStats.entries())
      .map(([testId, stats]) => ({testId, failures: stats.failures}))
      .sort((a, b) => b.failures - a.failures)
      .slice(0, 10);
    
    // Slowest tests
    const slowestTests = Array.from(testStats.entries())
      .map(([testId, stats]) => ({
        testId,
        avgDuration: stats.durations.reduce((sum, d) => sum + d, 0) / stats.durations.length
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10);
    
    return {
      totalExecutions,
      averageExecutionTime,
      failureRate,
      mostFailedTests,
      slowestTests
    };
  }

  /**
   * Clean old data beyond retention period
   */
  async cleanOldData(retentionDays: number = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    try {
      // Clean execution history
      const executions = await this.loadTestExecutions();
      const recentExecutions = executions.filter(e => 
        new Date(e.timestamp) >= cutoffDate
      );
      
      await fs.promises.writeFile(
        this.executionHistoryFile,
        JSON.stringify(recentExecutions, null, 2)
      );
      
      // Clean build history
      const builds = await this.loadBuildData();
      const recentBuilds = builds.filter(b => 
        new Date(b.timestamp) >= cutoffDate
      );
      
      await fs.promises.writeFile(
        this.buildHistoryFile,
        JSON.stringify(recentBuilds, null, 2)
      );
      
      console.log(`Cleaned data older than ${retentionDays} days`);
    } catch (error) {
      console.error('Error cleaning old data:', error);
    }
  }

  // Private helper methods

  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.promises.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Error creating data directory:', error);
    }
  }

  private async loadTestExecutions(): Promise<TestResult[]> {
    try {
      const content = await fs.promises.readFile(this.executionHistoryFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      // File doesn't exist yet or is corrupted
      return [];
    }
  }

  private async loadBuildData(): Promise<BuildData[]> {
    try {
      const content = await fs.promises.readFile(this.buildHistoryFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return [];
    }
  }

  private async loadEnvironmentData(): Promise<EnvironmentData[]> {
    try {
      const content = await fs.promises.readFile(this.environmentHistoryFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return [];
    }
  }
}