import crypto from 'crypto';
import { ReviewRequest, ReviewStatus } from '../types';

export class ReviewQueue {
  private requests = new Map<string, ReviewRequest>();
  private listeners = new Map<string, Array<(req: ReviewRequest) => void>>();

  enqueue(request: Omit<ReviewRequest, 'id' | 'createdAt' | 'status'>): ReviewRequest {
    const req: ReviewRequest = {
      ...request,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date(),
    };
    this.requests.set(req.id, req);
    this.emit('enqueued', req);
    return req;
  }

  resolve(
    id: string,
    status: Exclude<ReviewStatus, 'pending'>,
    reviewedBy?: string,
    notes?: string
  ): ReviewRequest {
    const req = this.requests.get(id);
    if (!req) throw new Error(`Review request '${id}' not found`);
    const updated: ReviewRequest = {
      ...req,
      status,
      resolvedAt: new Date(),
      reviewedBy,
      reviewNotes: notes,
    };
    this.requests.set(id, updated);
    this.emit('resolved', updated);
    return updated;
  }

  pending(): ReviewRequest[] {
    return Array.from(this.requests.values()).filter((r) => r.status === 'pending');
  }

  get(id: string): ReviewRequest | undefined {
    return this.requests.get(id);
  }

  list(): ReviewRequest[] {
    return Array.from(this.requests.values());
  }

  on(event: string, listener: (req: ReviewRequest) => void): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(listener);
  }

  private emit(event: string, req: ReviewRequest): void {
    this.listeners.get(event)?.forEach((fn) => fn(req));
  }
}
