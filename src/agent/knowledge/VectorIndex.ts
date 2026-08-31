import { Document, RetrievalResult } from '../types';

/**
 * In-process vector index using TF-IDF-based sparse embeddings
 * for environments without a dedicated vector database.
 * Swap `embed` for a real embedding model to upgrade to dense retrieval.
 */
export class VectorIndex {
  private embeddings = new Map<string, number[]>();
  private vocabulary = new Set<string>();

  index(doc: Document): void {
    const embedding = this.embed(doc.content);
    this.embeddings.set(doc.id, embedding);
  }

  indexMany(docs: Document[]): void {
    // First pass: build vocabulary
    for (const doc of docs) {
      for (const token of this.tokenize(doc.content)) {
        this.vocabulary.add(token);
      }
    }
    // Second pass: compute embeddings with full vocab
    for (const doc of docs) {
      this.embeddings.set(doc.id, this.embed(doc.content));
    }
  }

  remove(docId: string): void {
    this.embeddings.delete(docId);
  }

  search(query: string, topK: number, docs: Document[]): RetrievalResult[] {
    const queryVec = this.embed(query);
    const scored = docs
      .map((doc) => {
        const vec = this.embeddings.get(doc.id) ?? this.embed(doc.content);
        return { document: doc, score: this.cosine(queryVec, vec) };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return scored.map((r, idx) => ({ ...r, rank: idx + 1 }));
  }

  private embed(text: string): number[] {
    const tokens = this.tokenize(text);
    const vocab = Array.from(this.vocabulary);
    if (vocab.length === 0) {
      // Ensure current text tokens are in the vocabulary
      for (const t of tokens) this.vocabulary.add(t);
      vocab.push(...tokens);
    }
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    return vocab.map((v) => (tf.get(v) ?? 0) / Math.max(tokens.length, 1));
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2);
  }

  private cosine(a: number[], b: number[]): number {
    const len = Math.min(a.length, b.length);
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < len; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
