import { OptimizerConfig, ExecutionStrategy } from '../core/types';

/**
 * Configuration manager for the Test Optimizer
 */
export class ConfigManager {
  private config: OptimizerConfig;
  private configPath: string;

  constructor(configPath: string = './test-optimizer.config.json') {
    this.configPath = configPath;
    this.config = this.getDefaultConfig();
  }

  /**
   * Load configuration from file or use defaults
   */
  async loadConfig(): Promise<OptimizerConfig> {
    try {
      const fs = await import('node:fs');
      const configContent = await fs.promises.readFile(this.configPath, 'utf-8');
      const userConfig = JSON.parse(configContent);
      
      // Merge with defaults
      this.config = this.mergeConfig(this.getDefaultConfig(), userConfig);
      console.log('📋 Configuration loaded from:', this.configPath);
    } catch (error) {
      console.log('📋 Using default configuration (no config file found)');
      this.config = this.getDefaultConfig();
    }
    
    return this.config;
  }

  /**
   * Save current configuration to file
   */
  async saveConfig(): Promise<void> {
    try {
      const fs = await import('node:fs');
      await fs.promises.writeFile(
        this.configPath, 
        JSON.stringify(this.config, null, 2)
      );
      console.log('📋 Configuration saved to:', this.configPath);
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): OptimizerConfig {
    return this.config;
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<OptimizerConfig>): void {
    this.config = this.mergeConfig(this.config, updates);
  }

  /**
   * Get strategy by name
   */
  getStrategy(name: string): ExecutionStrategy | null {
    return this.config.strategies[name as keyof typeof this.config.strategies] || null;
  }

  /**
   * Add or update a strategy
   */
  setStrategy(name: string, strategy: ExecutionStrategy): void {
    (this.config.strategies as any)[name] = strategy;
  }

  /**
   * Validate configuration
   */
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!this.config.strategies) {
      errors.push('strategies configuration is required');
    }

    // Validate thresholds
    if (this.config.thresholds.flakyTestThreshold < 0 || this.config.thresholds.flakyTestThreshold > 1) {
      errors.push('flakyTestThreshold must be between 0 and 1');
    }

    if (this.config.thresholds.minCoverageThreshold < 0 || this.config.thresholds.minCoverageThreshold > 1) {
      errors.push('minCoverageThreshold must be between 0 and 1');
    }

    // Validate ML config
    if (this.config.ml.enabled && this.config.ml.confidenceThreshold < 0) {
      errors.push('ML confidenceThreshold must be non-negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): OptimizerConfig {
    return {
      strategies: {
        quick: {
          name: 'quick',
          description: 'Fast feedback with high-priority tests only',
          maxDuration: 300000, // 5 minutes
          maxTests: 20,
          riskTolerance: 'balanced',
          parallelization: true,
          includeSmoke: true,
          includeCritical: true,
          skipFlaky: true
        },
        balanced: {
          name: 'balanced',
          description: 'Balanced approach optimizing time vs risk',
          maxDuration: 1800000, // 30 minutes
          maxTests: 50,
          riskTolerance: 'balanced',
          parallelization: true,
          includeSmoke: true,
          includeCritical: true,
          skipFlaky: false
        },
        comprehensive: {
          name: 'comprehensive',
          description: 'Comprehensive testing with minimal risk',
          maxDuration: 3600000, // 60 minutes
          maxTests: 100,
          riskTolerance: 'conservative',
          parallelization: true,
          includeSmoke: true,
          includeCritical: true,
          skipFlaky: false
        },
        smoke: {
          name: 'smoke',
          description: 'Critical path and smoke tests only',
          maxDuration: 600000, // 10 minutes
          maxTests: 15,
          riskTolerance: 'conservative',
          parallelization: true,
          includeSmoke: true,
          includeCritical: true,
          skipFlaky: true
        },
        critical: {
          name: 'critical',
          description: 'Critical and high-priority tests',
          maxDuration: 1200000, // 20 minutes
          maxTests: 30,
          riskTolerance: 'conservative',
          parallelization: true,
          includeSmoke: true,
          includeCritical: true,
          skipFlaky: true
        }
      },
      ml: {
        enabled: true,
        retrainInterval: 86400000, // 24 hours
        confidenceThreshold: 0.7
      },
      thresholds: {
        flakyTestThreshold: 0.2, // 20% failure rate threshold for flaky tests
        minCoverageThreshold: 0.8, // 80% minimum coverage
        maxExecutionTime: 3600000, // 1 hour max execution time
        riskToleranceLevel: 0.3 // 30% acceptable risk level
      },
      integrations: {
        cucumber: true,
        playwright: true,
        jest: false,
        coverage: true,
        git: true,
        ci: true
      },
      reporting: {
        enabled: true,
        format: 'both',
        outputPath: './test-optimizer-reports',
        includeMetrics: true,
        includePredictions: true
      }
    };
  }

  /**
   * Deep merge configuration objects
   */
  private mergeConfig(base: any, override: any): any {
    const result = { ...base };

    for (const key in override) {
      if (override[key] && typeof override[key] === 'object' && !Array.isArray(override[key])) {
        result[key] = this.mergeConfig(base[key] || {}, override[key]);
      } else {
        result[key] = override[key];
      }
    }

    return result;
  }
}

/**
 * REST API server for external integrations
 */
export class OptimizerAPI {
  private app: any;
  private server: any;
  private optimizer: any;
  private port: number;

  constructor(optimizer: any, port: number = 3001) {
    this.optimizer = optimizer;
    this.port = port;
    this.initializeServer();
  }

  /**
   * Initialize Express server
   */
  private async initializeServer(): Promise<void> {
    const express = await import('express');
    const cors = await import('cors');
    
    this.app = express.default();
    this.app.use(express.default.json());
    this.app.use(cors.default());
    
    this.setupRoutes();
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req: any, res: any) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Get optimizer configuration
    this.app.get('/api/config', (req: any, res: any) => {
      res.json(this.optimizer.config);
    });

    // Update configuration
    this.app.post('/api/config', async (req: any, res: any) => {
      try {
        this.optimizer.updateConfig(req.body);
        res.json({ success: true, message: 'Configuration updated' });
      } catch (error) {
        res.status(400).json({ error: String(error) });
      }
    });

    // Generate optimization plan
    this.app.post('/api/optimize', async (req: any, res: any) => {
      try {
        const { strategy = 'balanced', codeChanges } = req.body;
        const plan = await this.optimizer.optimizeTestExecution(strategy, codeChanges);
        res.json(plan);
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    });

    // Execute optimized plan
    this.app.post('/api/execute', async (req: any, res: any) => {
      try {
        const { planId } = req.body;
        // In a real implementation, you'd store and retrieve plans
        res.json({ message: 'Execution started', planId });
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    });

    // Get test recommendations
    this.app.post('/api/recommendations', async (req: any, res: any) => {
      try {
        const { codeChanges } = req.body;
        const recommendations = await this.optimizer.getTestRecommendations(codeChanges);
        res.json(recommendations);
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    });

    // Get optimization statistics
    this.app.get('/api/stats', async (req: any, res: any) => {
      try {
        const stats = await this.optimizer.getOptimizationStats();
        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    });

    // Run smoke tests
    this.app.post('/api/smoke-tests', async (req: any, res: any) => {
      try {
        const results = await this.optimizer.runSmokeTests();
        res.json(results);
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    });

    // Run critical tests
    this.app.post('/api/critical-tests', async (req: any, res: any) => {
      try {
        const results = await this.optimizer.runCriticalTests();
        res.json(results);
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    });

    // Get available strategies
    this.app.get('/api/strategies', (req: any, res: any) => {
      const strategies = Object.keys(this.optimizer.config.strategies).map(name => ({
        name,
        ...this.optimizer.config.strategies[name]
      }));
      res.json(strategies);
    });

    // WebSocket endpoint for real-time updates (placeholder)
    this.app.get('/api/events', (req: any, res: any) => {
      res.json({ message: 'WebSocket endpoint - would provide real-time updates' });
    });
  }

  /**
   * Start the API server
   */
  async start(): Promise<void> {
    this.server = this.app.listen(this.port, () => {
      console.log(`🚀 Test Optimizer API running on port ${this.port}`);
      console.log(`📊 API documentation available at http://localhost:${this.port}/api`);
    });
  }

  /**
   * Stop the API server
   */
  async stop(): Promise<void> {
    if (this.server) {
      this.server.close();
      console.log('⏹️ Test Optimizer API stopped');
    }
  }

  /**
   * Get API documentation
   */
  getAPIDocumentation(): any {
    return {
      endpoints: {
        'GET /health': 'Health check endpoint',
        'GET /api/config': 'Get current configuration',
        'POST /api/config': 'Update configuration',
        'POST /api/optimize': 'Generate optimization plan',
        'POST /api/execute': 'Execute optimization plan',
        'POST /api/recommendations': 'Get test recommendations for code changes',
        'GET /api/stats': 'Get optimization statistics',
        'POST /api/smoke-tests': 'Run smoke tests',
        'POST /api/critical-tests': 'Run critical tests',
        'GET /api/strategies': 'Get available execution strategies'
      },
      examples: {
        optimize: {
          method: 'POST',
          url: '/api/optimize',
          body: {
            strategy: 'balanced',
            codeChanges: [
              {
                filePath: 'src/components/LoginForm.tsx',
                changeType: 'modified',
                linesAdded: 5,
                linesDeleted: 2
              }
            ]
          }
        },
        recommendations: {
          method: 'POST',
          url: '/api/recommendations',
          body: {
            codeChanges: [
              {
                filePath: 'src/services/api.ts',
                changeType: 'modified',
                linesAdded: 10,
                linesDeleted: 0
              }
            ]
          }
        }
      }
    };
  }
}