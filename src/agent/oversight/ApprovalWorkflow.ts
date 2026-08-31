import { OversightConfig, ReviewRequest, ReviewStatus } from '../types';
import { ReviewQueue } from './ReviewQueue';

type ApprovalInput = Omit<ReviewRequest, 'id' | 'createdAt' | 'status'>;

export class ApprovalWorkflow {
  private config: OversightConfig;
  private queue: ReviewQueue;

  constructor(config: OversightConfig, queue: ReviewQueue) {
    this.config = config;
    this.queue = queue;
  }

  /**
   * Requests approval and waits for the decision (or escalation policy timeout).
   * Returns true if approved.
   */
  async requestAndWait(input: ApprovalInput): Promise<boolean> {
    const req = this.queue.enqueue(input);

    return new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => {
        if (this.queue.get(req.id)?.status === 'pending') {
          this.applyEscalationPolicy(req.id);
          const final = this.queue.get(req.id)!;
          resolve(final.status === 'approved');
        }
      }, this.config.reviewTimeoutMs);

      this.queue.on('resolved', (updated) => {
        if (updated.id === req.id) {
          clearTimeout(timer);
          resolve(updated.status === 'approved');
        }
      });
    });
  }

  approve(requestId: string, reviewedBy = 'system', notes?: string): void {
    this.queue.resolve(requestId, 'approved', reviewedBy, notes);
  }

  reject(requestId: string, reviewedBy = 'system', notes?: string): void {
    this.queue.resolve(requestId, 'rejected', reviewedBy, notes);
  }

  private applyEscalationPolicy(requestId: string): void {
    const status: ReviewStatus =
      this.config.escalationPolicy === 'auto-approve'
        ? 'approved'
        : this.config.escalationPolicy === 'auto-reject'
        ? 'rejected'
        : 'timeout';

    this.queue.resolve(requestId, status, 'escalation-policy', `Policy: ${this.config.escalationPolicy}`);
  }
}
