import { Index } from "@upstash/vector";

export interface VectorMatch {
  id: string;
  score: number;
  metadata?: Record<string, any>;
  data?: string;
}

export class VectorService {
  private index: Index;

  constructor(config: { url: string; token: string }) {
    this.index = new Index({
      url: config.url,
      token: config.token,
    });
  }

  async upsert(id: string, vector: number[], metadata: Record<string, any>, data: string) {
    await this.index.upsert({
      id,
      vector,
      metadata,
      data,
    });
  }

  async query(vector: number[], options: { topK: number; filter?: string }): Promise<VectorMatch[]> {
    const results = await this.index.query({
      vector,
      topK: options.topK,
      includeMetadata: true,
      includeData: true,
      filter: options.filter,
    });

    return results.map((r) => ({
      id: r.id.toString(),
      score: r.score,
      metadata: r.metadata,
      data: r.data as string,
    }));
  }

  async delete(id: string) {
    await this.index.delete(id);
  }
}
