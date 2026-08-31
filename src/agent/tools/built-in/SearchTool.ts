import { ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../../types';
import { Tool } from '../Tool';

export class SearchTool extends Tool {
  readonly definition: ToolDefinition = {
    name: 'search_knowledge_base',
    description: 'Search the knowledge base for relevant documents',
    category: 'search',
    requiresApproval: false,
    parameters: [
      {
        name: 'query',
        type: 'string',
        description: 'The search query',
        required: true,
      },
      {
        name: 'top_k',
        type: 'number',
        description: 'Maximum number of results to return',
        required: false,
        default: 5,
      },
    ],
  };

  private searchFn: (query: string, topK: number) => Promise<unknown[]>;

  constructor(searchFn: (query: string, topK: number) => Promise<unknown[]>) {
    super();
    this.searchFn = searchFn;
  }

  async execute(
    args: Record<string, unknown>,
    _context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    const start = Date.now();
    const query = String(args['query'] ?? '');
    const topK = Number(args['top_k'] ?? 5);

    if (!query.trim()) {
      return this.failure('Query cannot be empty', Date.now() - start);
    }

    const results = await this.searchFn(query, topK);
    return this.success(results, Date.now() - start);
  }
}
