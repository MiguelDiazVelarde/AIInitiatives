import { TestResult, ExecutionPlan } from '../core/types';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

/**
 * Integration with Cucumber test framework
 */
export class CucumberIntegration {
  
  /**
   * Execute Cucumber tests with specific feature files
   */
  async executeTests(testIds: string[]): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    try {
      // Group tests by feature file for efficient execution
      const featureGroups = this.groupTestsByFeature(testIds);
      
      for (const [featureFile, testNames] of featureGroups.entries()) {
        const featureResults = await this.executeFeatureFile(featureFile, testNames);
        results.push(...featureResults);
      }
      
      return results;
    } catch (error) {
      console.error('Error executing Cucumber tests:', error);
      throw error;
    }
  }

  /**
   * Execute specific scenarios from a feature file
   */
  private async executeFeatureFile(
    featureFile: string, 
    scenarioNames: string[]
  ): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    try {
      // Build Cucumber command with scenario filtering
      const command = this.buildCucumberCommand(featureFile, scenarioNames);
      const startTime = Date.now();
      
      console.log(`🥒 Executing Cucumber: ${featureFile}`);
      const { stdout, stderr } = await execAsync(command);
      
      // Parse Cucumber JSON output
      const jsonOutput = this.parseCucumberOutput(stdout);
      
      for (const scenario of jsonOutput.elements || []) {
        const result: TestResult = {
          testId: this.generateTestId(featureFile, scenario.name),
          status: this.mapCucumberStatus(scenario.status),
          duration: this.calculateScenarioDuration(scenario),
          timestamp: new Date(),
          environment: 'test',
          commitHash: await this.getCurrentCommitHash(),
          buildId: process.env.BUILD_ID || 'local'
        };
        
        if (scenario.status === 'failed') {
          result.error = this.extractErrorMessage(scenario);
          result.stackTrace = this.extractStackTrace(scenario);
        }
        
        results.push(result);
      }
      
    } catch (error) {
      console.error(`Error executing feature ${featureFile}:`, error);
      // Create failure result
      for (const scenarioName of scenarioNames) {
        results.push({
          testId: this.generateTestId(featureFile, scenarioName),
          status: 'error',
          duration: 0,
          timestamp: new Date(),
          error: String(error),
          environment: 'test',
          commitHash: await this.getCurrentCommitHash(),
          buildId: process.env.BUILD_ID || 'local'
        });
      }
    }
    
    return results;
  }

  /**
   * Build Cucumber command with appropriate options
   */
  private buildCucumberCommand(featureFile: string, scenarioNames: string[]): string {
    let command = 'npx cucumber-js';
    command += ` "${featureFile}"`;
    command += ' --require-module ts-node/register';
    command += ' --require tests/step-definitions/**/*.ts';
    command += ' --format json';
    
    // Add scenario name filtering if specific scenarios are requested
    if (scenarioNames.length > 0 && scenarioNames.length < 10) {
      const namePattern = scenarioNames.join('|');
      command += ` --name "${namePattern}"`;
    }
    
    return command;
  }

  /**
   * Parse Cucumber JSON output
   */
  private parseCucumberOutput(output: string): any {
    try {
      // Cucumber outputs JSON to stdout
      const lines = output.split('\n');
      const jsonLine = lines.find(line => line.trim().startsWith('[') || line.trim().startsWith('{'));
      
      if (jsonLine) {
        return JSON.parse(jsonLine);
      }
      
      return { elements: [] };
    } catch (error) {
      console.warn('Error parsing Cucumber output:', error);
      return { elements: [] };
    }
  }

  /**
   * Group test IDs by their feature files
   */
  private groupTestsByFeature(testIds: string[]): Map<string, string[]> {
    const groups = new Map<string, string[]>();
    
    for (const testId of testIds) {
      // Extract feature file from test ID (assumes format: feature-file-scenario-name)
      const parts = testId.split('-');
      if (parts.length >= 2) {
        const featureFile = `tests/features/**/${parts[0]}.feature`;
        const scenarioName = parts.slice(1).join('-');
        
        if (!groups.has(featureFile)) {
          groups.set(featureFile, []);
        }
        groups.get(featureFile)!.push(scenarioName);
      }
    }
    
    return groups;
  }

  /**
   * Generate test ID from feature file and scenario name
   */
  private generateTestId(featureFile: string, scenarioName: string): string {
    const fileName = featureFile.split('/').pop()?.replace('.feature', '') || 'unknown';
    const cleanScenarioName = scenarioName.replaceAll(/\s+/g, '-').toLowerCase();
    return `${fileName}-${cleanScenarioName}`;
  }

  /**
   * Map Cucumber status to our test result status
   */
  private mapCucumberStatus(status: string): TestResult['status'] {
    switch (status?.toLowerCase()) {
      case 'passed':
        return 'passed';
      case 'failed':
        return 'failed';
      case 'skipped':
      case 'pending':
        return 'skipped';
      case 'undefined':
        return 'error';
      default:
        return 'error';
    }
  }

  /**
   * Calculate scenario duration from steps
   */
  private calculateScenarioDuration(scenario: any): number {
    if (!scenario.steps) return 0;
    
    return scenario.steps.reduce((total: number, step: any) => {
      return total + (step.result?.duration || 0);
    }, 0) / 1000000; // Convert nanoseconds to milliseconds
  }

  /**
   * Extract error message from failed scenario
   */
  private extractErrorMessage(scenario: any): string {
    if (!scenario.steps) return 'Unknown error';
    
    const failedStep = scenario.steps.find((step: any) => step.result?.status === 'failed');
    return failedStep?.result?.error_message || 'Test failed';
  }

  /**
   * Extract stack trace from failed scenario
   */
  private extractStackTrace(scenario: any): string {
    if (!scenario.steps) return '';
    
    const failedStep = scenario.steps.find((step: any) => step.result?.status === 'failed');
    return failedStep?.result?.error_message || '';
  }

  /**
   * Get current Git commit hash
   */
  private async getCurrentCommitHash(): Promise<string> {
    try {
      const { stdout } = await execAsync('git rev-parse HEAD');
      return stdout.trim();
    } catch (error) {
      return 'unknown';
    }
  }
}

/**
 * Integration with Playwright test framework
 */
export class PlaywrightIntegration {
  
  /**
   * Execute Playwright tests
   */
  async executeTests(testIds: string[]): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    try {
      // Build Playwright command
      const command = this.buildPlaywrightCommand(testIds);
      const startTime = Date.now();
      
      console.log('🎭 Executing Playwright tests...');
      const { stdout, stderr } = await execAsync(command);
      
      // Parse Playwright JSON output
      const testResults = this.parsePlaywrightOutput(stdout);
      
      for (const testResult of testResults) {
        results.push({
          testId: testResult.testId,
          status: testResult.status,
          duration: testResult.duration,
          timestamp: new Date(),
          error: testResult.error,
          stackTrace: testResult.stackTrace,
          environment: 'test',
          commitHash: await this.getCurrentCommitHash(),
          buildId: process.env.BUILD_ID || 'local'
        });
      }
      
    } catch (error) {
      console.error('Error executing Playwright tests:', error);
      throw error;
    }
    
    return results;
  }

  /**
   * Build Playwright command
   */
  private buildPlaywrightCommand(testIds: string[]): string {
    let command = 'npx playwright test';
    command += ' --reporter=json';
    
    // Add test file filtering if needed
    if (testIds.length > 0) {
      // For now, run all tests in specified files
      // In practice, you'd need more sophisticated filtering
      command += ' --grep=".*"';
    }
    
    return command;
  }

  /**
   * Parse Playwright JSON output
   */
  private parsePlaywrightOutput(output: string): any[] {
    try {
      const results: any[] = [];
      const lines = output.split('\n');
      
      for (const line of lines) {
        if (line.trim().startsWith('{') && line.includes('"status"')) {
          const testResult = JSON.parse(line);
          results.push({
            testId: testResult.title || 'unknown',
            status: this.mapPlaywrightStatus(testResult.status),
            duration: testResult.duration || 0,
            error: testResult.error?.message,
            stackTrace: testResult.error?.stack
          });
        }
      }
      
      return results;
    } catch (error) {
      console.warn('Error parsing Playwright output:', error);
      return [];
    }
  }

  /**
   * Map Playwright status to our test result status
   */
  private mapPlaywrightStatus(status: string): TestResult['status'] {
    switch (status?.toLowerCase()) {
      case 'passed':
        return 'passed';
      case 'failed':
        return 'failed';
      case 'skipped':
        return 'skipped';
      case 'timedout':
        return 'timeout';
      default:
        return 'error';
    }
  }

  /**
   * Get current Git commit hash
   */
  private async getCurrentCommitHash(): Promise<string> {
    try {
      const { stdout } = await execAsync('git rev-parse HEAD');
      return stdout.trim();
    } catch (error) {
      return 'unknown';
    }
  }
}

/**
 * CI/CD Integration utilities
 */
export class CIIntegration {
  
  /**
   * Detect CI environment
   */
  detectCIEnvironment(): string {
    if (process.env.GITHUB_ACTIONS) return 'github-actions';
    if (process.env.JENKINS_URL) return 'jenkins';
    if (process.env.GITLAB_CI) return 'gitlab-ci';
    if (process.env.AZURE_PIPELINES) return 'azure-pipelines';
    if (process.env.CIRCLECI) return 'circleci';
    return 'local';
  }

  /**
   * Get build information from CI environment
   */
  getBuildInfo(): any {
    const ciEnv = this.detectCIEnvironment();
    
    switch (ciEnv) {
      case 'github-actions':
        return {
          buildId: process.env.GITHUB_RUN_ID,
          buildNumber: process.env.GITHUB_RUN_NUMBER,
          branch: process.env.GITHUB_REF_NAME,
          commitHash: process.env.GITHUB_SHA,
          pullRequest: process.env.GITHUB_EVENT_NAME === 'pull_request' ? process.env.GITHUB_EVENT_NUMBER : null
        };
      
      case 'jenkins':
        return {
          buildId: process.env.BUILD_ID,
          buildNumber: process.env.BUILD_NUMBER,
          branch: process.env.GIT_BRANCH,
          commitHash: process.env.GIT_COMMIT,
          pullRequest: process.env.CHANGE_ID
        };
      
      default:
        return {
          buildId: 'local',
          buildNumber: '1',
          branch: 'main',
          commitHash: 'unknown',
          pullRequest: null
        };
    }
  }

  /**
   * Set CI status/check
   */
  async setCIStatus(status: 'pending' | 'success' | 'failure', description: string): Promise<void> {
    const ciEnv = this.detectCIEnvironment();
    
    switch (ciEnv) {
      case 'github-actions':
        // GitHub Actions sets status automatically based on step success/failure
        console.log(`📊 CI Status: ${status} - ${description}`);
        break;
      
      default:
        console.log(`📊 CI Status: ${status} - ${description}`);
    }
  }

  /**
   * Upload test results to CI
   */
  async uploadTestResults(results: TestResult[], plan: ExecutionPlan): Promise<void> {
    const ciEnv = this.detectCIEnvironment();
    
    // Create JUnit XML format for CI consumption
    const junitXml = this.generateJUnitXML(results);
    
    // Save to file for CI to pick up
    const fs = await import('node:fs');
    await fs.promises.writeFile('./test-results.xml', junitXml);
    
    console.log(`📊 Test results uploaded for ${ciEnv}`);
  }

  /**
   * Generate JUnit XML format
   */
  private generateJUnitXML(results: TestResult[]): string {
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const totalTime = results.reduce((sum, r) => sum + r.duration, 0) / 1000; // Convert to seconds

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<testsuite name="Optimized Test Suite" tests="${results.length}" failures="${failed}" skipped="${skipped}" time="${totalTime.toFixed(2)}">\n`;

    for (const result of results) {
      xml += `  <testcase classname="${result.testId}" name="${result.testId}" time="${(result.duration / 1000).toFixed(2)}">\n`;
      
      if (result.status === 'failed') {
        xml += `    <failure message="${result.error || 'Test failed'}">\n`;
        xml += `      ${result.stackTrace || ''}\n`;
        xml += `    </failure>\n`;
      } else if (result.status === 'skipped') {
        xml += `    <skipped/>\n`;
      }
      
      xml += `  </testcase>\n`;
    }

    xml += `</testsuite>\n`;
    return xml;
  }
}