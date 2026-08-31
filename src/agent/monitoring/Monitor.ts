import { AgentMetrics, AlertRule, EvaluationResult, Span } from '../types';
import { MetricsCollector } from './MetricsCollector';
import { Tracer } from './Tracer';
import { Dashboard, DashboardData } from './Dashboard';

export class Monitor {
  readonly tracer: Tracer;
  readonly metrics: MetricsCollector;
  private dashboard: Dashboard;
  private evaluations: EvaluationResult[] = [];
  private agentIds = new Set<string>();

  constructor() {
    this.tracer = new Tracer();
    this.metrics = new MetricsCollector();
    this.dashboard = new Dashboard(this.metrics, this.tracer);
  }

  // ─── Span helpers ─────────────────────────────────────────────────────────

  startSpan(name: string, traceId?: string, parentSpanId?: string): Span {
    return this.tracer.startSpan(name, traceId, parentSpanId);
  }

  endSpan(
    span: Span,
    status: Span['status'],
    attributes?: Record<string, string | number | boolean>
  ): void {
    this.tracer.endSpan(span, status, attributes);
  }

  // ─── Metric helpers ───────────────────────────────────────────────────────

  recordSession(agentId: string, success: boolean, latencyMs?: number): void {
    this.agentIds.add(agentId);
    this.metrics.recordSession(agentId, success, latencyMs);
  }

  recordTokens(agentId: string, count: number): void {
    this.metrics.recordTokens(agentId, count);
  }

  recordToolCall(agentId: string): void {
    this.metrics.recordToolCall(agentId);
  }

  recordGuardrailTrigger(): void {
    this.metrics.recordGuardrailTrigger();
  }

  recordHumanIntervention(): void {
    this.metrics.recordHumanIntervention();
  }

  recordEvaluationScore(agentId: string, score: number): void {
    this.metrics.recordEvaluationScore(agentId, score);
  }

  recordError(agentId: string): void {
    this.metrics.recordError(agentId);
  }

  storeEvaluation(result: EvaluationResult): void {
    this.evaluations.push(result);
  }

  addAlertRule(rule: AlertRule): void {
    this.metrics.addAlertRule(rule);
  }

  // ─── Dashboard ────────────────────────────────────────────────────────────

  getDashboard(): DashboardData {
    return this.dashboard.build(Array.from(this.agentIds), this.evaluations);
  }

  getMetrics(agentId: string): AgentMetrics {
    return this.metrics.getMetrics(agentId, {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: new Date(),
    });
  }
}
