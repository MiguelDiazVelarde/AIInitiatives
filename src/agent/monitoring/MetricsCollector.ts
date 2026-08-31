import { AgentMetrics, Alert, AlertRule } from '../types';

interface Counter {
  total: number;
  success: number;
  failed: number;
}

interface Bucket {
  sessions: Counter;
  tokens: number;
  toolCalls: number;
  guardrailTriggers: number;
  humanInterventions: number;
  evaluationScores: number[];
  latencies: number[];
  errors: number;
}

export class MetricsCollector {
  private buckets = new Map<string, Bucket>();
  private alertRules: AlertRule[] = [];
  private firedAlerts: Alert[] = [];

  private ensureBucket(agentId: string): Bucket {
    if (!this.buckets.has(agentId)) {
      this.buckets.set(agentId, {
        sessions: { total: 0, success: 0, failed: 0 },
        tokens: 0,
        toolCalls: 0,
        guardrailTriggers: 0,
        humanInterventions: 0,
        evaluationScores: [],
        latencies: [],
        errors: 0,
      });
    }
    return this.buckets.get(agentId)!;
  }

  recordSession(agentId: string, success: boolean, latencyMs?: number): void {
    const b = this.ensureBucket(agentId);
    b.sessions.total++;
    if (success) b.sessions.success++;
    else b.sessions.failed++;
    if (latencyMs !== undefined) b.latencies.push(latencyMs);
    this.checkAlerts(agentId, b);
  }

  recordTokens(agentId: string, count: number): void {
    this.ensureBucket(agentId).tokens += count;
  }

  recordToolCall(agentId: string): void {
    this.ensureBucket(agentId).toolCalls++;
  }

  recordGuardrailTrigger(agentId?: string): void {
    this.ensureBucket(agentId ?? '__global__').guardrailTriggers++;
  }

  recordHumanIntervention(agentId?: string): void {
    this.ensureBucket(agentId ?? '__global__').humanInterventions++;
  }

  recordEvaluationScore(agentId: string, score: number): void {
    this.ensureBucket(agentId).evaluationScores.push(score);
  }

  recordError(agentId: string): void {
    this.ensureBucket(agentId).errors++;
  }

  getMetrics(agentId: string, period: { start: Date; end: Date }): AgentMetrics {
    const b = this.ensureBucket(agentId);
    const sortedLatencies = [...b.latencies].sort((a, c) => a - c);
    const avg = sortedLatencies.length
      ? sortedLatencies.reduce((s, v) => s + v, 0) / sortedLatencies.length
      : 0;
    const p95 = sortedLatencies.length
      ? sortedLatencies[Math.floor(sortedLatencies.length * 0.95)]
      : 0;
    const avgEval = b.evaluationScores.length
      ? b.evaluationScores.reduce((s, v) => s + v, 0) / b.evaluationScores.length
      : 0;

    return {
      agentId,
      period,
      totalSessions: b.sessions.total,
      successfulSessions: b.sessions.success,
      failedSessions: b.sessions.failed,
      avgLatencyMs: avg,
      p95LatencyMs: p95,
      totalTokensUsed: b.tokens,
      totalToolCalls: b.toolCalls,
      guardrailTriggers: b.guardrailTriggers,
      humanInterventions: b.humanInterventions,
      avgEvaluationScore: avgEval,
    };
  }

  addAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule);
  }

  getFiredAlerts(): Alert[] {
    return [...this.firedAlerts];
  }

  private checkAlerts(agentId: string, bucket: Bucket): void {
    for (const rule of this.alertRules.filter((r) => r.enabled)) {
      let value: number | undefined;

      switch (rule.metric) {
        case 'failed_sessions':
          value = bucket.sessions.failed;
          break;
        case 'error_rate':
          value = bucket.sessions.total > 0 ? bucket.errors / bucket.sessions.total : 0;
          break;
        case 'guardrail_triggers':
          value = bucket.guardrailTriggers;
          break;
      }

      if (value === undefined) continue;

      const triggered =
        rule.operator === 'gt' ? value > rule.threshold :
        rule.operator === 'gte' ? value >= rule.threshold :
        rule.operator === 'lt' ? value < rule.threshold :
        rule.operator === 'lte' ? value <= rule.threshold :
        value === rule.threshold;

      if (triggered) {
        this.firedAlerts.push({
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          message: `[${agentId}] ${rule.name}: ${value} ${rule.operator} ${rule.threshold}`,
          value,
          threshold: rule.threshold,
          triggeredAt: new Date(),
        });
      }
    }
  }
}
