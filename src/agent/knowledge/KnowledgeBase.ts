import { Document, RAGContext, RetrievalResult } from '../types';
import { DocumentStore } from './DocumentStore';
import { VectorIndex } from './VectorIndex';
import { RAGRetriever, RetrieverConfig } from './RAGRetriever';

export class KnowledgeBase {
  readonly id: string;
  readonly name: string;
  private retriever: RAGRetriever;

  constructor(id: string, name: string, retrieverConfig?: Partial<RetrieverConfig>) {
    this.id = id;
    this.name = name;
    const store = new DocumentStore();
    const index = new VectorIndex();
    this.retriever = new RAGRetriever(store, index, retrieverConfig);
  }

  addDocument(doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Document {
    return this.retriever.addDocument(doc);
  }

  addDocuments(docs: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>[]): Document[] {
    return this.retriever.addDocuments(docs);
  }

  async search(query: string, filter?: Record<string, unknown>): Promise<RetrievalResult[]> {
    return this.retriever.retrieve(query, filter);
  }

  async buildContext(query: string, userPrompt: string): Promise<RAGContext> {
    return this.retriever.buildRAGContext(query, userPrompt);
  }
}

export class KnowledgeBaseRegistry {
  private static bases = new Map<string, KnowledgeBase>();

  static register(kb: KnowledgeBase): void {
    this.bases.set(kb.id, kb);
  }

  static get(id: string): KnowledgeBase {
    const kb = this.bases.get(id);
    if (!kb) throw new Error(`Knowledge base '${id}' not found`);
    return kb;
  }

  static list(): KnowledgeBase[] {
    return Array.from(this.bases.values());
  }
}
