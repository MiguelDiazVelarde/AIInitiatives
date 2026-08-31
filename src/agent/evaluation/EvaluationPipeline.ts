import { AgentSession, EvaluationConfig, EvaluationResult } from '../types';
import { Evaluator } from './Evaluator';
import { Monitor } from '../monitoring/Monitor';

export class EvaluationPipeline {
  private evaluator: Evaluator;
  private monitor?: Monitor;
  private history: EvaluationResult[] = [];

  constructor(monitor?: Monitor) {
    this.evaluator = new Evaluator();
    this.monitor = monitor;
  }

  async run(session: AgentSession, config?: Partial<EvaluationConfig>): Promise<EvaluationResult> {
    const finalConfig: EvaluationConfig = {
      metrics: config?.metrics ?? this.evaluator.defaultMetrics(),
      groundTruth: config?.groundTruth,
      referenceDocuments: config?.referenceDocuments,
    };

    const result = await this.evaluator.evaluate(session, finalConfig);
    this.history.push(result);
    this.monitor?.recordEvaluationScore(session.agentId, result.overallScore);
    return result;
  }

  getHistory(agentId?: string): EvaluationResult[] {
    if (!agentId) return [...this.history];
    return this.history.filter((r) => r.sessionId.startsWith(agentId));
  }

  averageScore(): number {
    if (this.history.length === 0) return 0;
    return this.history.reduce((sum, r) => sum + r.overallScore, 0) / this.history.length;
  }
}
