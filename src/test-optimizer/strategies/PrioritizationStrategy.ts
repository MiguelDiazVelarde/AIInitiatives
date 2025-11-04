import { 
  TestCase, 
  TestPriority, 
  HistoricalData, 
  MLPrediction 
} from '../core/types';

/**
 * Calculates test priorities based on various factors
 */
export class PrioritizationStrategy {

  /**
   * Calculate test priorities using multiple factors
   */
  async calculatePriorities(
    testCases: TestCase[],
    historicalData: HistoricalData,
    affectedAreas: string[],
    mlPredictions: MLPrediction[]
  ): Promise<TestPriority[]> {
    const priorities: TestPriority[] = [];

    for (const testCase of testCases) {
      const priority = await this.calculateSingleTestPriority(
        testCase,
        historicalData,
        affectedAreas,
        mlPredictions
      );
      priorities.push(priority);
    }

    // Sort by priority score (highest first)
    return priorities.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate priority for a single test case
   */
  private async calculateSingleTestPriority(
    testCase: TestCase,
    historicalData: HistoricalData,
    affectedAreas: string[],
    mlPredictions: MLPrediction[]
  ): Promise<TestPriority> {
    const factors = {
      riskScore: this.calculateRiskScore(testCase, historicalData),
      historicalFailureRate: this.calculateHistoricalFailureRate(testCase),
      codeChangeRelevance: this.calculateCodeChangeRelevance(testCase, affectedAreas),
      businessCriticality: this.calculateBusinessCriticality(testCase),
      executionTime: this.calculateExecutionTimeScore(testCase),
      flakyScore: this.calculateFlakyScore(testCase, historicalData)
    };

    // Get ML prediction if available
    const mlPrediction = mlPredictions.find(p => p.testId === testCase.id);
    if (mlPrediction) {
      factors.riskScore = Math.max(factors.riskScore, mlPrediction.failureProbability);
    }

    // Calculate weighted score
    const weights = {
      riskScore: 0.25,
      historicalFailureRate: 0.20,
      codeChangeRelevance: 0.20,
      businessCriticality: 0.15,
      executionTime: 0.10,
      flakyScore: -0.10 // Negative weight to deprioritize flaky tests
    };

    let score = 0;
    const reasoning: string[] = [];

    for (const [factor, value] of Object.entries(factors)) {
      const weight = weights[factor as keyof typeof weights] || 0;
      const contribution = value * weight;
      score += contribution;

      if (value > 0.6 && weight > 0) {
        reasoning.push(`High ${factor.replace(/([A-Z])/g, ' $1').toLowerCase()} (${(value * 100).toFixed(0)}%)`);
      }
    }

    // Ensure score is between 0 and 1
    score = Math.max(0, Math.min(1, score));

    // Add reasoning for low scores
    if (score < 0.3) {
      reasoning.push('Low overall risk factors');
    }

    return {
      testId: testCase.id,
      score,
      factors,
      reasoning
    };
  }

  /**
   * Calculate risk score based on test characteristics
   */
  private calculateRiskScore(testCase: TestCase, historicalData: HistoricalData): number {
    let risk = 0;

    // Base risk from criticality level
    const criticalityRisk = {
      'critical': 0.9,
      'high': 0.7,
      'medium': 0.5,
      'low': 0.3
    }[testCase.criticalityLevel];
    risk += criticalityRisk * 0.4;

    // Risk from test type (Playwright tests are typically more flaky)
    if (testCase.type === 'playwright') {
      risk += 0.2;
    }

    // Risk from complexity
    const complexity = testCase.codeMapping.reduce((sum, mapping) => sum + mapping.complexity, 0);
    const complexityRisk = Math.min(complexity / 20, 1);
    risk += complexityRisk * 0.2;

    // Risk from dependencies
    const dependencyRisk = Math.min(testCase.dependencies.length / 5, 1);
    risk += dependencyRisk * 0.2;

    return Math.min(risk, 1);
  }

  /**
   * Calculate historical failure rate for the test
   */
  private calculateHistoricalFailureRate(testCase: TestCase): number {
    if (testCase.historicalResults.length === 0) return 0.5; // Default medium risk
    
    const failures = testCase.historicalResults.filter(r => r.status === 'failed').length;
    return failures / testCase.historicalResults.length;
  }

  /**
   * Calculate relevance to code changes
   */
  private calculateCodeChangeRelevance(testCase: TestCase, affectedAreas: string[]): number {
    if (affectedAreas.length === 0) return 0.5; // Default when no changes

    let relevance = 0;
    for (const mapping of testCase.codeMapping) {
      if (affectedAreas.includes(mapping.filePath)) {
        // Higher relevance for more complex code areas
        const mappingRelevance = Math.min(mapping.complexity / 10, 1);
        relevance = Math.max(relevance, mappingRelevance);
      }
    }

    // Check for tag-based relevance (e.g., @smoke, @critical)
    if (testCase.tags.some(tag => tag.includes('smoke') || tag.includes('critical'))) {
      relevance = Math.max(relevance, 0.8);
    }

    return relevance;
  }

  /**
   * Calculate business criticality score
   */
  private calculateBusinessCriticality(testCase: TestCase): number {
    const criticalityScores = {
      'critical': 1.0,
      'high': 0.75,
      'medium': 0.5,
      'low': 0.25
    };

    let score = criticalityScores[testCase.criticalityLevel];

    // Boost score for certain feature areas
    const criticalFeatures = ['auth', 'login', 'payment', 'security', 'data'];
    const featureName = testCase.feature.toLowerCase();
    
    if (criticalFeatures.some(feature => featureName.includes(feature))) {
      score = Math.min(score + 0.2, 1);
    }

    // Boost score for smoke tests
    if (testCase.tags.some(tag => tag.includes('smoke'))) {
      score = Math.min(score + 0.15, 1);
    }

    return score;
  }

  /**
   * Calculate execution time score (faster tests get higher priority)
   */
  private calculateExecutionTimeScore(testCase: TestCase): number {
    const maxTime = 60000; // 60 seconds
    const timeRatio = testCase.estimatedDuration / maxTime;
    
    // Invert the score so faster tests get higher priority
    return Math.max(0, 1 - Math.min(timeRatio, 1));
  }

  /**
   * Calculate flaky score (higher means more flaky, should be deprioritized)
   */
  private calculateFlakyScore(testCase: TestCase, historicalData: HistoricalData): number {
    if (testCase.historicalResults.length < 5) return 0; // Not enough data

    const results = testCase.historicalResults.slice(-20); // Last 20 executions
    let inconsistencyCount = 0;

    for (let i = 1; i < results.length; i++) {
      const current = results[i];
      const previous = results[i - 1];
      
      // Count status changes between consecutive runs
      if (current.status !== previous.status) {
        inconsistencyCount++;
      }
    }

    const flakyScore = inconsistencyCount / (results.length - 1);
    
    // Also consider duration variance
    const durations = results.map(r => r.duration);
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / durations.length;
    const durationVariability = Math.sqrt(variance) / avgDuration;

    return Math.min(flakyScore + (durationVariability * 0.3), 1);
  }

  /**
   * Get smoke test priorities
   */
  getSmokeTestPriorities(priorities: TestPriority[]): TestPriority[] {
    return priorities.filter(p => {
      // Include tests marked as smoke or critical
      const testCase = this.findTestCase(p.testId, []); // Would need test cases passed in
      return testCase?.tags.some(tag => tag.includes('smoke')) ||
             testCase?.criticalityLevel === 'critical' ||
             p.factors.businessCriticality > 0.8;
    });
  }

  /**
   * Get critical path test priorities
   */
  getCriticalPathPriorities(priorities: TestPriority[]): TestPriority[] {
    return priorities.filter(p => {
      return p.factors.businessCriticality > 0.7 || 
             p.factors.riskScore > 0.6;
    });
  }

  /**
   * Get quick feedback test priorities (fast, high-value tests)
   */
  getQuickFeedbackPriorities(priorities: TestPriority[]): TestPriority[] {
    return priorities
      .filter(p => p.factors.executionTime > 0.7 && p.score > 0.5) // Fast and valuable
      .slice(0, 20); // Limit to top 20 for quick feedback
  }

  /**
   * Adjust priorities based on recent failures
   */
  adjustForRecentFailures(
    priorities: TestPriority[],
    recentFailures: string[]
  ): TestPriority[] {
    return priorities.map(priority => {
      if (recentFailures.includes(priority.testId)) {
        return {
          ...priority,
          score: Math.min(priority.score + 0.2, 1), // Boost priority
          reasoning: [...priority.reasoning, 'Recent failure detected']
        };
      }
      return priority;
    });
  }

  // Private helper method
  private findTestCase(testId: string, testCases: TestCase[]): TestCase | undefined {
    return testCases.find(tc => tc.id === testId);
  }
}