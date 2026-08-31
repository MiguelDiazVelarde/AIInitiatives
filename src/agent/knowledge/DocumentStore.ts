import { Document } from '../types';
import crypto from 'crypto';

export class DocumentStore {
  private documents = new Map<string, Document>();

  add(doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Document {
    const id = crypto.randomUUID();
    const now = new Date();
    const full: Document = { ...doc, id, createdAt: now, updatedAt: now };
    this.documents.set(id, full);
    return full;
  }

  addMany(docs: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>[]): Document[] {
    return docs.map((d) => this.add(d));
  }

  get(id: string): Document | undefined {
    return this.documents.get(id);
  }

  update(id: string, patch: Partial<Pick<Document, 'content' | 'metadata' | 'embedding'>>): Document {
    const existing = this.documents.get(id);
    if (!existing) throw new Error(`Document '${id}' not found`);
    const updated: Document = { ...existing, ...patch, updatedAt: new Date() };
    this.documents.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.documents.delete(id);
  }

  list(): Document[] {
    return Array.from(this.documents.values());
  }

  size(): number {
    return this.documents.size;
  }

  clear(): void {
    this.documents.clear();
  }
}
