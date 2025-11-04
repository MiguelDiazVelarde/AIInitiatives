import { CoverageData, FileCoverage, TestCase, CodeChange } from '../core/types';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Analyzes code coverage data and correlates with test cases
 */
export class CoverageAnalyzer {

  /**
   * Load coverage data from Istanbul/NYC coverage files
   */
  async loadCoverageData(coveragePath: string = 'coverage/coverage-final.json'): Promise<CoverageData | null> {
    try {
      const coverageContent = await fs.promises.readFile(coveragePath, 'utf-8');
      const coverageJson = JSON.parse(coverageContent);
      
      return this.parseCoverageData(coverageJson);
    } catch (error) {
      console.warn('No coverage data found, continuing without coverage analysis');
      return null;
    }
  }

  /**
   * Analyze coverage overlap between test cases and code changes
   */
  analyzeCoverageImpact(
    coverage: CoverageData,
    codeChanges: CodeChange[],
    testCases: TestCase[]
  ): Map<string, number> {
    const impactScores = new Map<string, number>();
    
    for (const test of testCases) {
      let totalImpact = 0;
      
      for (const change of codeChanges) {
        const fileCoverage = coverage.files.find(f => f.path === change.filePath);
        if (!fileCoverage) continue;
        
        // Calculate how much of the changed file is covered by this test
        const coverageOverlap = this.calculateCoverageOverlap(test, fileCoverage, change);
        totalImpact += coverageOverlap * change.complexity;
      }
      
      impactScores.set(test.id, totalImpact);
    }
    
    return impactScores;
  }

  /**
   * Identify tests that cover specific code areas
   */
  findTestsForCodeArea(
    filePath: string,
    lineStart: number,
    lineEnd: number,
    testCases: TestCase[]
  ): TestCase[] {
    return testCases.filter(test => 
      test.codeMapping.some(mapping => 
        mapping.filePath === filePath &&
        this.rangesOverlap(
          mapping.lineStart, 
          mapping.lineEnd,
          lineStart,
          lineEnd
        )
      )
    );
  }

  /**
   * Calculate coverage percentage for a specific test
   */
  calculateTestCoverage(test: TestCase, coverage: CoverageData): number {
    if (!test.codeMapping.length) return 0;
    
    let totalLines = 0;
    let coveredLines = 0;
    
    for (const mapping of test.codeMapping) {
      const fileCoverage = coverage.files.find(f => f.path === mapping.filePath);
      if (!fileCoverage) continue;
      
      const mappingLines = mapping.lineEnd - mapping.lineStart + 1;
      totalLines += mappingLines;
      
      // Count covered lines in the mapping range
      const coveredInRange = fileCoverage.lines.filter(line => 
        line >= mapping.lineStart && line <= mapping.lineEnd
      ).length;
      
      coveredLines += coveredInRange;
    }
    
    return totalLines > 0 ? coveredLines / totalLines : 0;
  }

  /**
   * Identify coverage gaps in critical code areas
   */
  identifyCoverageGaps(
    coverage: CoverageData,
    codeChanges: CodeChange[]
  ): Array<{filePath: string, lines: number[], severity: 'low' | 'medium' | 'high'}> {
    const gaps: Array<{filePath: string, lines: number[], severity: 'low' | 'medium' | 'high'}> = [];
    
    for (const change of codeChanges) {
      const fileCoverage = coverage.files.find(f => f.path === change.filePath);
      if (!fileCoverage) {
        gaps.push({
          filePath: change.filePath,
          lines: [],
          severity: this.getSeverityForChange(change)
        });
        continue;
      }
      
      // Find uncovered lines in changed areas
      const uncoveredLines = this.findUncoveredLines(fileCoverage, change);
      if (uncoveredLines.length > 0) {
        gaps.push({
          filePath: change.filePath,
          lines: uncoveredLines,
          severity: this.getSeverityForChange(change)
        });
      }
    }
    
    return gaps;
  }

  /**
   * Generate coverage-based test recommendations
   */
  generateCoverageRecommendations(
    coverage: CoverageData,
    codeChanges: CodeChange[],
    testCases: TestCase[]
  ): Array<{reason: string, tests: TestCase[], priority: number}> {
    const recommendations: Array<{reason: string, tests: TestCase[], priority: number}> = [];
    
    // Recommend tests for low coverage areas
    const gaps = this.identifyCoverageGaps(coverage, codeChanges);
    for (const gap of gaps) {
      const relevantTests = testCases.filter(test =>
        test.codeMapping.some(mapping => mapping.filePath === gap.filePath)
      );
      
      if (relevantTests.length > 0) {
        recommendations.push({
          reason: `Low coverage in ${gap.filePath}`,
          tests: relevantTests,
          priority: gap.severity === 'high' ? 0.9 : gap.severity === 'medium' ? 0.7 : 0.5
        });
      }
    }
    
    // Recommend tests for high-impact changes
    const impactScores = this.analyzeCoverageImpact(coverage, codeChanges, testCases);
    const highImpactTests = Array.from(impactScores.entries())
      .filter(([, score]) => score > 0.7)
      .map(([testId]) => testCases.find(t => t.id === testId))
      .filter(Boolean) as TestCase[];
    
    if (highImpactTests.length > 0) {
      recommendations.push({
        reason: 'High coverage impact from code changes',
        tests: highImpactTests,
        priority: 0.8
      });
    }
    
    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  // Private helper methods

  private parseCoverageData(coverageJson: any): CoverageData {
    const files: FileCoverage[] = [];
    let totalLines = 0;
    let coveredLines = 0;
    let totalFunctions = 0;
    let coveredFunctions = 0;
    let totalBranches = 0;
    let coveredBranches = 0;
    let totalStatements = 0;
    let coveredStatements = 0;
    
    for (const [filePath, fileData] of Object.entries(coverageJson)) {
      const data = fileData as any;
      
      // Extract line coverage
      const lines = Object.keys(data.s || {}).map(Number);
      const linesCovered = Object.values(data.s || {}).filter(Boolean).length;
      
      // Extract function coverage
      const functions = Object.keys(data.f || {});
      const functionsCovered = Object.values(data.f || {}).filter(Boolean).length;
      
      // Extract branch coverage
      const branches = Object.keys(data.b || {}).map(Number);
      const branchesCovered = Object.values(data.b || {})
        .flat()
        .filter(Boolean).length;
      
      // Extract statement coverage
      const statements = Object.keys(data.s || {}).map(Number);
      const statementsCovered = Object.values(data.s || {}).filter(Boolean).length;
      
      files.push({
        path: filePath,
        lines: lines.filter((_, i) => Object.values(data.s || {})[i]),
        functions: functions.filter((_, i) => Object.values(data.f || {})[i]),
        branches: branches.filter((_, i) => Object.values(data.b || {})[i]),
        statements: statements.filter((_, i) => Object.values(data.s || {})[i])
      });
      
      totalLines += lines.length;
      coveredLines += linesCovered;
      totalFunctions += functions.length;
      coveredFunctions += functionsCovered;
      totalBranches += branches.length;
      coveredBranches += branchesCovered;
      totalStatements += statements.length;
      coveredStatements += statementsCovered;
    }
    
    return {
      lines: {
        total: totalLines,
        covered: coveredLines,
        percentage: totalLines > 0 ? (coveredLines / totalLines) * 100 : 0
      },
      functions: {
        total: totalFunctions,
        covered: coveredFunctions,
        percentage: totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0
      },
      branches: {
        total: totalBranches,
        covered: coveredBranches,
        percentage: totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0
      },
      statements: {
        total: totalStatements,
        covered: coveredStatements,
        percentage: totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 0
      },
      files
    };
  }

  private calculateCoverageOverlap(
    test: TestCase,
    fileCoverage: FileCoverage,
    change: CodeChange
  ): number {
    if (!test.codeMapping.length) return 0;
    
    const relevantMappings = test.codeMapping.filter(m => m.filePath === change.filePath);
    if (!relevantMappings.length) return 0;
    
    let overlapScore = 0;
    for (const mapping of relevantMappings) {
      const mappingLines = mapping.lineEnd - mapping.lineStart + 1;
      const coveredInMapping = fileCoverage.lines.filter(line =>
        line >= mapping.lineStart && line <= mapping.lineEnd
      ).length;
      
      overlapScore += coveredInMapping / mappingLines;
    }
    
    return overlapScore / relevantMappings.length;
  }

  private rangesOverlap(
    start1: number,
    end1: number,
    start2: number,
    end2: number
  ): boolean {
    return start1 <= end2 && start2 <= end1;
  }

  private getSeverityForChange(change: CodeChange): 'low' | 'medium' | 'high' {
    const totalChanges = change.linesAdded + change.linesDeleted;
    
    if (totalChanges > 50 || change.complexity > 10) return 'high';
    if (totalChanges > 20 || change.complexity > 5) return 'medium';
    return 'low';
  }

  private findUncoveredLines(fileCoverage: FileCoverage, change: CodeChange): number[] {
    // This is a simplified implementation
    // In practice, you'd need to correlate with the actual diff lines
    const uncoveredLines: number[] = [];
    
    // For demonstration, assume we can identify uncovered lines
    // This would need integration with the actual coverage tool
    
    return uncoveredLines;
  }
}