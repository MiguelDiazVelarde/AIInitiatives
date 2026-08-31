import { Document, RAGContext, RetrievalResult } from '../types';
import { DocumentStore } from './DocumentStore';
import { VectorIndex } from './VectorIndex';

export interface RetrieverConfig {
  topK: number;
  minScore: number;
  maxContextLength: number;
}

const DEFAULT_CONFIG: RetrieverConfig = {
  topK: 5,
  minScore: 0.05,
  maxContextLength: 4000,
};

export class RAGRetriever {
  private store: DocumentStore;
  private index: VectorIndex;
  private config: RetrieverConfig;

  constructor(store: DocumentStore, index: VectorIndex, config?: Partial<RetrieverConfig>) {
    this.store = store;
    this.index = index;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async retrieve(query: string, filterMetadata?: Record<string, unknown>): Promise<RetrievalResult[]> {
    let docs = this.store.list();

    if (filterMetadata) {
      docs = docs.filter((doc) =>
        Object.entries(filterMetadata).every(([k, v]) => doc.metadata[k] === v)
      );
    }

    const results = this.index.search(query, this.config.topK, docs);
    return results.filter((r) => r.score >= this.config.minScore);
  }

  async buildRAGContext(
    query: string,
    userPrompt: string,
    filterMetadata?: Record<string, unknown>
  ): Promise<RAGContext> {
    const start = Date.now();
    const retrieved = await this.retrieve(query, filterMetadata);
    const context = this.formatContext(retrieved);
    const augmentedPrompt = this.augmentPrompt(userPrompt, context);

    return {
      query,
      retrievedDocuments: retrieved,
      augmentedPrompt,
      retrievalLatencyMs: Date.now() - start,
    };
  }

  addDocument(doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Document {
    const stored = this.store.add(doc);
    this.index.index(stored);
    return stored;
  }

  addDocuments(docs: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>[]): Document[] {
    const stored = this.store.addMany(docs);
    this.index.indexMany(stored);
    return stored;
  }

  private formatContext(results: RetrievalResult[]): string {
    let total = 0;
    const parts: string[] = [];

    for (const r of results) {
      const chunk = `[${r.rank}] (source: ${r.document.source}, score: ${r.score.toFixed(3)})\n${r.document.content}`;
      if (total + chunk.length > this.config.maxContextLength) break;
      parts.push(chunk);
      total += chunk.length;
    }

    return parts.join('\n\n');
  }

  private augmentPrompt(userPrompt: string, context: string): string {
    if (!context.trim()) return userPrompt;
    return `Use the following context to inform your response:

---CONTEXT---
${context}
---END CONTEXT---

${userPrompt}`;
  }
}
