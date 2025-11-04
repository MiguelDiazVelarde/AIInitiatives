export interface TestCase {
  id: string;
  name: string;
  feature: string;
  path: string;
  type: 'cucumber' | 'playwright' | 'unit' | 'integration';
  tags: string[];
  estimatedDuration: number; // in milliseconds
  dependencies: string[]; // Test IDs this test depends on
  criticalityLevel: 'low' | 'medium' | 'high' | 'critical';
  lastExecutionTime?: number;
  lastExecutionResult?: TestResult;
  historicalResults: TestResult[];
  codeMapping: CodeMapping[];
}

export interface TestResult {
  testId: string;
  status: 'passed' | 'failed' | 'skipped' | 'timeout' | 'error';
  duration: number;
  timestamp: Date;
  error?: string;
  stackTrace?: string;
  coverage?: CoverageData;
  environment: string;
  commitHash: string;
  buildId: string;
}

export interface CodeMapping {
  filePath: string;
  lineStart: number;
  lineEnd: number;
  functionName?: string;
  className?: string;
  complexity: number;
}

export interface CoverageData {
  lines: {
    total: number;
    covered: number;
    percentage: number;
  };
  functions: {
    total: number;
    covered: number;
    percentage: number;
  };
  branches: {
    total: number;
    covered: number;
    percentage: number;
  };
  statements: {
    total: number;
    covered: number;
    percentage: number;
  };
  files: FileCoverage[];
}

export interface FileCoverage {
  path: string;
  lines: number[];
  functions: string[];
  branches: number[];
  statements: number[];
}

export interface CodeChange {
  filePath: string;
  changeType: 'added' | 'modified' | 'deleted' | 'renamed';
  linesAdded: number;
  linesDeleted: number;
  complexity: number;
  affectedFunctions: string[];
  affectedClasses: string[];
  diffContent: string;
}

export interface TestPriority {
  testId: string;
  score: number;
  factors: {
    riskScore: number;
    historicalFailureRate: number;
    codeChangeRelevance: number;
    businessCriticality: number;
    executionTime: number;
    flakyScore: number;
  };
  reasoning: string[];
}

export interface ExecutionPlan {
  id: string;
  timestamp: Date;
  strategy: ExecutionStrategy;
  totalTests: number;
  selectedTests: TestCase[];
  estimatedDuration: number;
  parallelGroups: TestGroup[];
  riskAssessment: RiskAssessment;
  optimizationMetrics: OptimizationMetrics;
}

export interface TestGroup {
  id: string;
  tests: TestCase[];
  parallelizable: boolean;
  dependencies: string[];
  estimatedDuration: number;
  environment?: string;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  coverageRisk: number;
  functionalRisk: number;
  performanceRisk: number;
  securityRisk: number;
  skipRisk: SkipRisk[];
}

export interface SkipRisk {
  testId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  mitigationStrategy?: string;
}

export interface OptimizationMetrics {
  timeReduction: {
    original: number;
    optimized: number;
    percentage: number;
  };
  testReduction: {
    original: number;
    selected: number;
    percentage: number;
  };
  riskCoverage: {
    criticalCoverage: number;
    highCoverage: number;
    mediumCoverage: number;
    lowCoverage: number;
  };
  confidenceScore: number;
}

export interface ExecutionStrategy {
  name: string;
  description: string;
  maxDuration?: number;
  maxTests?: number;
  riskTolerance: 'conservative' | 'balanced' | 'aggressive';
  parallelization: boolean;
  includeSmoke: boolean;
  includeCritical: boolean;
  skipFlaky: boolean;
}

export interface MLPrediction {
  testId: string;
  failureProbability: number;
  confidence: number;
  factors: {
    [key: string]: number;
  };
  reasoning: string;
}

export interface HistoricalData {
  testExecutions: TestResult[];
  codeChanges: CodeChange[];
  buildData: BuildData[];
  environmentData: EnvironmentData[];
}

export interface BuildData {
  id: string;
  timestamp: Date;
  commitHash: string;
  branch: string;
  status: 'success' | 'failure' | 'cancelled';
  duration: number;
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  coverage?: CoverageData;
}

export interface EnvironmentData {
  name: string;
  type: 'development' | 'testing' | 'staging' | 'production';
  stability: number;
  avgResponseTime: number;
  errorRate: number;
}

export interface OptimizerConfig {
  strategies: {
    quick: ExecutionStrategy;
    balanced: ExecutionStrategy;
    comprehensive: ExecutionStrategy;
    smoke: ExecutionStrategy;
    critical: ExecutionStrategy;
  };
  ml: {
    enabled: boolean;
    modelPath?: string;
    retrainInterval: number;
    confidenceThreshold: number;
  };
  thresholds: {
    flakyTestThreshold: number;
    minCoverageThreshold: number;
    maxExecutionTime: number;
    riskToleranceLevel: number;
  };
  integrations: {
    cucumber: boolean;
    playwright: boolean;
    jest: boolean;
    coverage: boolean;
    git: boolean;
    ci: boolean;
  };
  reporting: {
    enabled: boolean;
    format: 'json' | 'html' | 'both';
    outputPath: string;
    includeMetrics: boolean;
    includePredictions: boolean;
  };
}