import { ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../types';

export abstract class Tool {
  abstract readonly definition: ToolDefinition;

  abstract execute(
    args: Record<string, unknown>,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult>;

  get name(): string {
    return this.definition.name;
  }

  get requiresApproval(): boolean {
    return this.definition.requiresApproval;
  }

  protected success(output: unknown, latencyMs: number): ToolExecutionResult {
    return { success: true, output, latencyMs };
  }

  protected failure(error: string, latencyMs: number): ToolExecutionResult {
    return { success: false, output: null, error, latencyMs };
  }
}
