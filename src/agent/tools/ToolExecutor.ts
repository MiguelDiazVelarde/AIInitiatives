import { ToolCall, ToolExecution, ToolExecutionContext, ToolExecutionResult } from '../types';
import { OversightManager } from '../oversight/OversightManager';
import { ToolRegistry } from './ToolRegistry';
import crypto from 'crypto';

export type ToolExecutionBase = Pick<ToolExecutionContext, 'agentId' | 'sessionId'>;

export class ToolExecutor {
  constructor(
    private registry: ToolRegistry,
    private oversight: OversightManager
  ) {}

  async execute(
    toolCall: ToolCall,
    context: ToolExecutionBase
  ): Promise<ToolExecution> {
    const tool = this.registry.get(toolCall.name);
    const executionId = crypto.randomUUID();
    const ctx: ToolExecutionContext = {
      agentId: context.agentId,
      sessionId: context.sessionId,
      arguments: toolCall.arguments,
      toolName: toolCall.name,
      requestId: executionId,
    };

    const execution: ToolExecution = {
      id: executionId,
      toolName: toolCall.name,
      arguments: toolCall.arguments,
      approvalRequired: tool.requiresApproval,
      executedAt: new Date(),
    };

    if (tool.requiresApproval) {
      const approved = await this.oversight.requestApproval({
        sessionId: context.sessionId,
        agentId: context.agentId,
        type: 'tool_execution',
        content: `Execute tool: ${toolCall.name}`,
        context: { arguments: toolCall.arguments },
        riskLevel: 'medium',
      });

      execution.approvalStatus = approved ? 'approved' : 'rejected';
      if (!approved) {
        const result: ToolExecutionResult = {
          success: false,
          output: null,
          error: 'Tool execution rejected by human reviewer',
          latencyMs: 0,
          approved: false,
        };
        execution.result = result;
        return execution;
      }
      execution.approvalStatus = 'approved';
    }

    const start = Date.now();
    try {
      execution.result = await tool.execute(toolCall.arguments, ctx);
    } catch (err) {
      execution.result = {
        success: false,
        output: null,
        error: err instanceof Error ? err.message : String(err),
        latencyMs: Date.now() - start,
      };
    }

    return execution;
  }
}
