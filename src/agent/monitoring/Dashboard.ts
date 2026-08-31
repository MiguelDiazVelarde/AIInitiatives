import { AgentMetrics, Alert, EvaluationResult, Span } from '../types';
import { MetricsCollector } from './MetricsCollector';
import { Tracer } from './Tracer';

export interface DashboardData {
  generatedAt: Date;
  agentMetrics: AgentMetrics[];
  recentSpans: Span[];
  recentEvaluations: EvaluationResult[];
  alerts: Alert[];
  summary: {
    totalAgents: number;
    totalSessions: number;
    overallSuccessRate: number;
    overallAvgScore: number;
    activeAlerts: number;
  };
}

export class Dashboard {
  constructor(
    private metricsCollector: MetricsCollector,
    private tracer: Tracer
  ) {}

  build(agentIds: string[], evaluations: EvaluationResult[]): DashboardData {
    const period = {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: new Date(),
    };

    const agentMetrics = agentIds.map((id) =>
      this.metricsCollector.getMetrics(id, period)
    );

    const totalSessions = agentMetrics.reduce((s, m) => s + m.totalSessions, 0);
    const successSessions = agentMetrics.reduce((s, m) => s + m.successfulSessions, 0);
    const avgScore =
      agentMetrics.length > 0
        ? agentMetrics.reduce((s, m) => s + m.avgEvaluationScore, 0) / agentMetrics.length
        : 0;

    const alerts = this.metricsCollector.getFiredAlerts();

    const recentSpans = this.tracer
      .allSpans()
      .filter((s) => s.startTime >= period.start)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, 50);

    return {
      generatedAt: new Date(),
      agentMetrics,
      recentSpans,
      recentEvaluations: evaluations.slice(-20),
      alerts,
      summary: {
        totalAgents: agentIds.length,
        totalSessions,
        overallSuccessRate: totalSessions > 0 ? successSessions / totalSessions : 0,
        overallAvgScore: avgScore,
        activeAlerts: alerts.length,
      },
    };
  }
}
