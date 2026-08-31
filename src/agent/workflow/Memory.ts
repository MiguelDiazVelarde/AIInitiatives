import { Message } from '../types';

export interface MemoryEntry {
  key: string;
  value: unknown;
  createdAt: Date;
  expiresAt?: Date;
}

export class AgentMemory {
  private shortTerm: Message[] = [];
  private longTerm = new Map<string, MemoryEntry>();
  private readonly maxShortTermMessages: number;

  constructor(maxShortTermMessages = 20) {
    this.maxShortTermMessages = maxShortTermMessages;
  }

  // ─── Short-term (conversation history) ────────────────────────────────────

  appendMessage(message: Message): void {
    this.shortTerm.push(message);
    if (this.shortTerm.length > this.maxShortTermMessages) {
      // Keep system message(s) and trim oldest non-system messages
      const system = this.shortTerm.filter((m) => m.role === 'system');
      const rest = this.shortTerm.filter((m) => m.role !== 'system');
      this.shortTerm = [
        ...system,
        ...rest.slice(rest.length - (this.maxShortTermMessages - system.length)),
      ];
    }
  }

  getMessages(): Message[] {
    return [...this.shortTerm];
  }

  clearShortTerm(): void {
    this.shortTerm = this.shortTerm.filter((m) => m.role === 'system');
  }

  // ─── Long-term (key-value facts) ──────────────────────────────────────────

  remember(key: string, value: unknown, ttlMs?: number): void {
    this.longTerm.set(key, {
      key,
      value,
      createdAt: new Date(),
      expiresAt: ttlMs ? new Date(Date.now() + ttlMs) : undefined,
    });
  }

  recall(key: string): unknown | undefined {
    const entry = this.longTerm.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt && entry.expiresAt < new Date()) {
      this.longTerm.delete(key);
      return undefined;
    }
    return entry.value;
  }

  forget(key: string): boolean {
    return this.longTerm.delete(key);
  }

  listFacts(): MemoryEntry[] {
    const now = new Date();
    return Array.from(this.longTerm.values()).filter(
      (e) => !e.expiresAt || e.expiresAt >= now
    );
  }
}
