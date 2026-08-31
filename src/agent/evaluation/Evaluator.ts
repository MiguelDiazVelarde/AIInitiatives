import {
  AgentSession,
  EvaluationConfig,
  EvaluationMetricName,
  EvaluationResult,
  EvaluationScore,
} from '../types';
import { METRICS } from './Metrics';

export class Evaluator {
  async evaluate(
    session: AgentSession,
    config: EvaluationConfig
  ): Promise<EvaluationResult> {
    const start = Date.now();
    const scores: EvaluationScore[] = [];

    for (const metricName of config.metrics) {
      const evaluator = METRICS[metricName];
      if (!evaluator) continue;
      scores.push(evaluator.evaluate(session, config.groundTruth));
    }

    const overallScore =
      scores.length > 0 ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length : 0;

    const passed = scores.every((s) => s.passed);

    return {
      sessionId: session.sessionId,
      scores,
      overallScore,
      passed,
      evaluatedAt: new Date(),
      latencyMs: Date.now() - start,
    };
  }

  defaultMetrics(): EvaluationMetricName[] {
    return ['relevance', 'coherence', 'safety', 'latency', 'tool_accuracy'];
  }
}
