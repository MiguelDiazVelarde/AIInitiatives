import { OversightConfig, ReviewRequest } from '../types';
import { ReviewQueue } from './ReviewQueue';
import { ApprovalWorkflow } from './ApprovalWorkflow';
import { Monitor } from '../monitoring/Monitor';

const DEFAULT_CONFIG: OversightConfig = {
  requireApprovalForTools: [],
  requireApprovalForHighRiskActions: true,
  reviewTimeoutMs: 30_000,
  escalationPolicy: 'auto-reject',
};

type ApprovalInput = Omit<ReviewRequest, 'id' | 'createdAt' | 'status'>;

export class OversightManager {
  readonly queue: ReviewQueue;
  private workflow: ApprovalWorkflow;
  private monitor?: Monitor;

  constructor(config?: Partial<OversightConfig>, monitor?: Monitor) {
    const merged = { ...DEFAULT_CONFIG, ...config };
    this.queue = new ReviewQueue();
    this.workflow = new ApprovalWorkflow(merged, this.queue);
    this.monitor = monitor;
  }

  /** Returns true if the action is approved to proceed. */
  async requestApproval(input: ApprovalInput): Promise<boolean> {
    this.monitor?.recordHumanIntervention();
    return this.workflow.requestAndWait(input);
  }

  /** Programmatically approve a pending review (for automated test / integration). */
  approve(requestId: string, reviewedBy?: string, notes?: string): void {
    this.workflow.approve(requestId, reviewedBy, notes);
  }

  /** Programmatically reject a pending review. */
  reject(requestId: string, reviewedBy?: string, notes?: string): void {
    this.workflow.reject(requestId, reviewedBy, notes);
  }

  pendingReviews(): ReviewRequest[] {
    return this.queue.pending();
  }

  allReviews(): ReviewRequest[] {
    return this.queue.list();
  }
}
