import { TestCase, TestResult, CodeChange, MLPrediction } from '../core/types';

/**
 * Machine Learning predictor for test failure likelihood
 * Uses simple statistical models and patterns to predict test failures
 */
export class MLPredictor {
  private config: any;
  private models: Map<string, any> = new Map();
  private trainingData: Array<{features: number[], label: boolean}> = [];

  constructor(config: any) {
    this.config = config;
  }

  /**
   * Predict test failure probabilities for given test cases
   */
  async predictTestFailures(
    testCases: TestCase[],
    codeChanges?: CodeChange[]
  ): Promise<MLPrediction[]> {
    const predictions: MLPrediction[] = [];

    for (const testCase of testCases) {
      const prediction = await this.predictSingleTest(testCase, codeChanges);
      predictions.push(prediction);
    }

    return predictions.sort((a, b) => b.failureProbability - a.failureProbability);
  }

  /**
   * Predict failure probability for a single test
   */
  async predictSingleTest(
    testCase: TestCase,
    codeChanges?: CodeChange[]
  ): Promise<MLPrediction> {
    const features = this.extractFeatures(testCase, codeChanges);
    const failureProbability = this.calculateFailureProbability(features);
    const confidence = this.calculateConfidence(testCase, features);

    return {
      testId: testCase.id,
      failureProbability,
      confidence,
      factors: this.explainPrediction(features),
      reasoning: this.generateReasoning(features, failureProbability)
    };
  }

  /**
   * Update the model with new execution results
   */
  async updateModel(results: TestResult[]): Promise<void> {
    if (!this.config.enabled) return;

    // Add new training data
    for (const result of results) {
      const features = this.extractFeaturesFromResult(result);
      const label = result.status === 'failed';
      
      this.trainingData.push({ features, label });
    }

    // Keep only recent data for training (last 1000 samples)
    this.trainingData = this.trainingData.slice(-1000);

    // Retrain model if we have enough data
    if (this.trainingData.length >= 50) {
      await this.retrainModel();
    }
  }

  /**
   * Train or retrain the prediction model
   */
  async retrainModel(): Promise<void> {
    console.log('Retraining ML model with', this.trainingData.length, 'samples');

    try {
      // Simple logistic regression-like model using weighted averages
      const model = this.trainSimpleModel(this.trainingData);
      this.models.set('failure_prediction', model);
      
      console.log('Model retrained successfully');
    } catch (error) {
      console.error('Error retraining model:', error);
    }
  }

  /**
   * Get model performance metrics
   */
  getModelMetrics(): any {
    if (this.trainingData.length === 0) {
      return { accuracy: 0, precision: 0, recall: 0, f1: 0 };
    }

    // Simple validation using last 20% of data
    const testSize = Math.floor(this.trainingData.length * 0.2);
    const testData = this.trainingData.slice(-testSize);
    const trainData = this.trainingData.slice(0, -testSize);

    if (testData.length === 0) return { accuracy: 0, precision: 0, recall: 0, f1: 0 };

    // Train on subset
    const model = this.trainSimpleModel(trainData);
    
    // Test predictions
    let correct = 0;
    let truePositives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;

    for (const sample of testData) {
      const prediction = this.predictWithModel(model, sample.features) > 0.5;
      if (prediction === sample.label) correct++;
      
      if (prediction && sample.label) truePositives++;
      if (prediction && !sample.label) falsePositives++;
      if (!prediction && sample.label) falseNegatives++;
    }

    const accuracy = correct / testData.length;
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1 = 2 * (precision * recall) / (precision + recall) || 0;

    return { accuracy, precision, recall, f1 };
  }

  // Private helper methods

  private extractFeatures(testCase: TestCase, codeChanges?: CodeChange[]): number[] {
    const features: number[] = [];

    // Historical failure rate
    const failureRate = this.calculateHistoricalFailureRate(testCase);
    features.push(failureRate);

    // Test execution time (normalized)
    const normalizedDuration = Math.min(testCase.estimatedDuration / 30000, 1); // Cap at 30s
    features.push(normalizedDuration);

    // Test age (days since last execution)
    const lastExecution = testCase.lastExecutionTime || Date.now();
    const daysSinceExecution = (Date.now() - lastExecution) / (1000 * 60 * 60 * 24);
    features.push(Math.min(daysSinceExecution / 30, 1)); // Cap at 30 days

    // Test complexity (based on code mapping)
    const complexity = testCase.codeMapping.reduce((sum, mapping) => sum + mapping.complexity, 0);
    features.push(Math.min(complexity / 20, 1)); // Cap at 20

    // Code change impact
    if (codeChanges) {
      const impact = this.calculateCodeChangeImpact(testCase, codeChanges);
      features.push(impact);
    } else {
      features.push(0);
    }

    // Test type indicator
    features.push(testCase.type === 'playwright' ? 1 : 0); // Playwright tests tend to be more flaky

    // Criticality level
    const criticalityScore = {
      'low': 0.25,
      'medium': 0.5,
      'high': 0.75,
      'critical': 1.0
    }[testCase.criticalityLevel];
    features.push(criticalityScore);

    // Recent failure streak
    const recentFailures = this.calculateRecentFailureStreak(testCase);
    features.push(Math.min(recentFailures / 5, 1)); // Cap at 5 consecutive failures

    return features;
  }

  private extractFeaturesFromResult(result: TestResult): number[] {
    // This would extract features from a test result for training
    // For now, return dummy features
    return [
      result.status === 'failed' ? 1 : 0,
      Math.min(result.duration / 30000, 1),
      0, // placeholder for other features
      0,
      0,
      0,
      0,
      0
    ];
  }

  private calculateFailureProbability(features: number[]): number {
    const model = this.models.get('failure_prediction');
    
    if (model) {
      return this.predictWithModel(model, features);
    }

    // Fallback: simple weighted average
    const weights = [0.3, 0.1, 0.1, 0.2, 0.15, 0.05, 0.05, 0.05]; // Sum = 1.0
    let probability = 0;

    for (let i = 0; i < Math.min(features.length, weights.length); i++) {
      probability += features[i] * weights[i];
    }

    return Math.max(0, Math.min(1, probability));
  }

  private calculateConfidence(testCase: TestCase, features: number[]): number {
    // Confidence based on amount of historical data
    const historyCount = testCase.historicalResults.length;
    const baseConfidence = Math.min(historyCount / 10, 0.8); // Max 80% from history
    
    // Adjust based on feature consistency
    const featureVariance = this.calculateFeatureVariance(features);
    const adjustmentFactor = 1 - (featureVariance * 0.3);
    
    return Math.max(0.1, baseConfidence * adjustmentFactor);
  }

  private explainPrediction(features: number[]): {[key: string]: number} {
    const featureNames = [
      'historicalFailureRate',
      'executionTime',
      'testAge',
      'complexity',
      'codeChangeImpact',
      'isPlaywright',
      'criticalityLevel',
      'recentFailures'
    ];

    const explanation: {[key: string]: number} = {};
    for (let i = 0; i < Math.min(features.length, featureNames.length); i++) {
      explanation[featureNames[i]] = features[i];
    }

    return explanation;
  }

  private generateReasoning(features: number[], probability: number): string {
    const reasons: string[] = [];

    if (features[0] > 0.5) reasons.push('High historical failure rate');
    if (features[1] > 0.7) reasons.push('Long execution time');
    if (features[2] > 0.5) reasons.push('Test not run recently');
    if (features[3] > 0.6) reasons.push('High code complexity');
    if (features[4] > 0.4) reasons.push('Significant code changes in related areas');
    if (features[5] === 1) reasons.push('Playwright test (typically more flaky)');
    if (features[6] > 0.7) reasons.push('Critical functionality test');
    if (features[7] > 0.3) reasons.push('Recent failure pattern');

    if (reasons.length === 0) {
      reasons.push('Low risk factors detected');
    }

    const riskLevel = probability > 0.7 ? 'High' : probability > 0.4 ? 'Medium' : 'Low';
    return `${riskLevel} failure risk. Factors: ${reasons.join(', ')}`;
  }

  private calculateHistoricalFailureRate(testCase: TestCase): number {
    if (testCase.historicalResults.length === 0) return 0;
    
    const failures = testCase.historicalResults.filter(r => r.status === 'failed').length;
    return failures / testCase.historicalResults.length;
  }

  private calculateCodeChangeImpact(testCase: TestCase, codeChanges: CodeChange[]): number {
    let impact = 0;

    for (const change of codeChanges) {
      const relevantMappings = testCase.codeMapping.filter(
        mapping => mapping.filePath === change.filePath
      );

      if (relevantMappings.length > 0) {
        // Calculate impact based on change size and complexity
        const changeSize = (change.linesAdded + change.linesDeleted) / 100; // Normalize
        const changeComplexity = change.complexity / 10; // Normalize
        impact += Math.min(changeSize + changeComplexity, 1);
      }
    }

    return Math.min(impact, 1); // Cap at 1
  }

  private calculateRecentFailureStreak(testCase: TestCase): number {
    const recentResults = testCase.historicalResults
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10); // Last 10 executions

    let streak = 0;
    for (const result of recentResults) {
      if (result.status === 'failed') {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private trainSimpleModel(data: Array<{features: number[], label: boolean}>): any {
    // Simple linear model: weighted sum of features
    const featureCount = data[0]?.features.length || 8;
    const weights = new Array(featureCount).fill(0);
    const learningRate = 0.01;
    const epochs = 100;

    // Simple gradient descent
    for (let epoch = 0; epoch < epochs; epoch++) {
      for (const sample of data) {
        const prediction = this.sigmoid(this.dotProduct(weights, sample.features));
        const error = (sample.label ? 1 : 0) - prediction;

        // Update weights
        for (let i = 0; i < weights.length; i++) {
          weights[i] += learningRate * error * sample.features[i];
        }
      }
    }

    return { weights };
  }

  private predictWithModel(model: any, features: number[]): number {
    const rawPrediction = this.dotProduct(model.weights, features);
    return this.sigmoid(rawPrediction);
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  private dotProduct(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      sum += a[i] * b[i];
    }
    return sum;
  }

  private calculateFeatureVariance(features: number[]): number {
    if (features.length === 0) return 0;
    
    const mean = features.reduce((sum, f) => sum + f, 0) / features.length;
    const variance = features.reduce((sum, f) => sum + Math.pow(f - mean, 2), 0) / features.length;
    
    return Math.sqrt(variance);
  }
}