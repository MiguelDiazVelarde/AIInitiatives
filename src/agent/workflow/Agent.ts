import crypto from 'crypto';
import {
  AgentConfig,
  AgentSession,
  AgentStatus,
  Message,
  ModelResponse,
  RAGContext,
  ToolExecution,
} from '../types';
import { ModelClient } from '../foundation/ModelClient';
import { PromptLibrary } from '../prompts/PromptLibrary';
import { KnowledgeBaseRegistry } from '../knowledge/KnowledgeBase';
import { ToolRegistry } from '../tools/ToolRegistry';
import { ToolExecutor } from '../tools/ToolExecutor';
import { GuardrailsEngine } from '../guardrails/GuardrailsEngine';
import { Monitor } from '../monitoring/Monitor';
import { AgentMemory } from './Memory';

export class Agent {
  private config: AgentConfig;
  private model: ModelClient;
  private promptLibrary: PromptLibrary;
  private toolRegistry: ToolRegistry;
  private toolExecutor: ToolExecutor;
  private guardrails: GuardrailsEngine;
  private monitor: Monitor;

  constructor(
    config: AgentConfig,
    model: ModelClient,
    promptLibrary: PromptLibrary,
    toolRegistry: ToolRegistry,
    toolExecutor: ToolExecutor,
    guardrails: GuardrailsEngine,
    monitor: Monitor
  ) {
    this.config = config;
    this.model = model;
    this.promptLibrary = promptLibrary;
    this.toolRegistry = toolRegistry;
    this.toolExecutor = toolExecutor;
    this.guardrails = guardrails;
    this.monitor = monitor;
  }

  async run(userInput: string): Promise<AgentSession> {
    const session = this.createSession();
    const memory = new AgentMemory();
    const span = this.monitor.startSpan('agent.run', session.sessionId);

    try {
      // 1. Guardrails — validate input
      const inputCheck = await this.guardrails.checkInput(userInput);
      if (!inputCheck.passed) {
        session.status = 'failed';
        session.messages.push({
          role: 'assistant',
          content: `Request blocked: ${inputCheck.violations.map((v) => v.message).join('; ')}`,
        });
        this.monitor.endSpan(span, 'error');
        return this.finalise(session);
      }

      const safeInput = inputCheck.sanitizedContent ?? userInput;

      // 2. Prompt / Instructions — build system message
      const systemContent = this.buildSystemPrompt();
      memory.appendMessage({ role: 'system', content: systemContent });

      // 3. RAG / Knowledge — augment user query
      let augmentedInput = safeInput;
      if (this.config.enableRAG) {
        const ragCtx = await this.retrieveKnowledge(safeInput);
        session.ragContexts.push(...ragCtx);
        if (ragCtx.length > 0) {
          augmentedInput = ragCtx[ragCtx.length - 1].augmentedPrompt;
        }
      }

      memory.appendMessage({ role: 'user', content: augmentedInput });

      // 4. Agent loop — Tools + Foundation Model
      session.status = 'running';
      const tools = this.toolRegistry.getDefinitions(this.config.tools);
      let iterations = 0;

      while (iterations < this.config.maxIterations) {
        iterations++;
        const modelSpan = this.monitor.startSpan('model.complete', session.sessionId);
        const response: ModelResponse = await this.model.complete(memory.getMessages(), tools);
        this.monitor.endSpan(modelSpan, 'ok', { latencyMs: response.latencyMs, tokens: response.usage.totalTokens });
        this.monitor.recordTokens(this.config.id, response.usage.totalTokens);

        if (!response.toolCalls || response.toolCalls.length === 0) {
          // 5. Guardrails — validate output
          const outputCheck = await this.guardrails.checkOutput(response.content);
          const finalContent = outputCheck.sanitizedContent ?? response.content;
          memory.appendMessage({ role: 'assistant', content: finalContent });
          session.messages = memory.getMessages();
          break;
        }

        // Model wants to call tools
        memory.appendMessage({ role: 'assistant', content: response.content });

        for (const toolCall of response.toolCalls) {
          const toolSpan = this.monitor.startSpan(`tool.${toolCall.name}`, session.sessionId);
          const execution = await this.toolExecutor.execute(toolCall, {
            agentId: this.config.id,
            sessionId: session.sessionId,
          });
          session.toolCallHistory.push(execution);
          this.monitor.recordToolCall(this.config.id);
          this.monitor.endSpan(toolSpan, execution.result?.success ? 'ok' : 'error');

          memory.appendMessage({
            role: 'tool',
            toolCallId: toolCall.id,
            name: toolCall.name,
            content: JSON.stringify(execution.result?.output ?? execution.result?.error),
          });
        }
      }

      session.status = 'completed';
      this.monitor.endSpan(span, 'ok');
    } catch (err) {
      session.status = 'failed';
      const msg = err instanceof Error ? err.message : String(err);
      session.messages.push({ role: 'assistant', content: `An error occurred: ${msg}` });
      this.monitor.endSpan(span, 'error', { error: msg });
      this.monitor.recordError(this.config.id);
    }

    return this.finalise(session);
  }

  private buildSystemPrompt(): string {
    try {
      const template = this.promptLibrary.get(this.config.systemPromptId);
      const rendered = template.render({
        agent_name: this.config.name,
        agent_role: this.config.description,
        current_date: new Date().toISOString().split('T')[0],
      });
      return rendered.content;
    } catch {
      return `You are ${this.config.name}. ${this.config.description}`;
    }
  }

  private async retrieveKnowledge(query: string): Promise<RAGContext[]> {
    const contexts: RAGContext[] = [];
    for (const kbId of this.config.knowledgeBaseIds) {
      try {
        const kb = KnowledgeBaseRegistry.get(kbId);
        const ctx = await kb.buildContext(query, query);
        if (ctx.retrievedDocuments.length > 0) contexts.push(ctx);
      } catch {
        // knowledge base may not be loaded; skip silently
      }
    }
    return contexts;
  }

  private createSession(): AgentSession {
    return {
      sessionId: crypto.randomUUID(),
      agentId: this.config.id,
      status: 'idle' as AgentStatus,
      messages: [],
      toolCallHistory: [] as ToolExecution[],
      ragContexts: [],
      startedAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
    };
  }

  private finalise(session: AgentSession): AgentSession {
    session.completedAt = new Date();
    session.updatedAt = new Date();
    this.monitor.recordSession(this.config.id, session.status === 'completed');
    return session;
  }
}
