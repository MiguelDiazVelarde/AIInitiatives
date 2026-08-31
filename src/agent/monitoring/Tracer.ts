import crypto from 'crypto';
import { Span, SpanEvent } from '../types';

export class Tracer {
  private spans = new Map<string, Span>();

  startSpan(name: string, traceId?: string, parentSpanId?: string): Span {
    const span: Span = {
      traceId: traceId ?? crypto.randomUUID(),
      spanId: crypto.randomUUID(),
      parentSpanId,
      name,
      startTime: new Date(),
      status: 'ok',
      attributes: {},
      events: [],
    };
    this.spans.set(span.spanId, span);
    return span;
  }

  endSpan(
    span: Span,
    status: Span['status'],
    attributes?: Record<string, string | number | boolean>,
    error?: string
  ): void {
    span.endTime = new Date();
    span.durationMs = span.endTime.getTime() - span.startTime.getTime();
    span.status = status;
    if (attributes) Object.assign(span.attributes, attributes);
    if (error) span.error = error;
  }

  addEvent(span: Span, name: string, attributes?: Record<string, string | number | boolean>): void {
    const event: SpanEvent = {
      name,
      timestamp: new Date(),
      attributes: attributes ?? {},
    };
    span.events.push(event);
  }

  setAttribute(span: Span, key: string, value: string | number | boolean): void {
    span.attributes[key] = value;
  }

  getTrace(traceId: string): Span[] {
    return Array.from(this.spans.values()).filter((s) => s.traceId === traceId);
  }

  allSpans(): Span[] {
    return Array.from(this.spans.values());
  }

  clear(): void {
    this.spans.clear();
  }
}
