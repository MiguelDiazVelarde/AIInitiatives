/**
 * AI Agent Architecture
 *
 * Foundation Model → Prompt/Instructions → RAG/Knowledge →
 * Tools → Agent/Workflow → Guardrails → Evaluation →
 * Human Oversight → Monitoring
 */

// ─── Public API ───────────────────────────────────────────────────────────────

export * from './types';

// Foundation
export { ModelClient } from './foundation/ModelClient';
export { OpenAIClient } from './foundation/OpenAIClient';
export { ModelRegistry } from './foundation/ModelRegistry';

// Prompts
export { PromptTemplate } from './prompts/PromptTemplate';
export { SystemInstructions } from './prompts/SystemInstructions';
export { PromptLibrary } from './prompts/PromptLibrary';

// Knowledge
export { DocumentStore } from './knowledge/DocumentStore';
export { VectorIndex } from './knowledge/VectorIndex';
export { RAGRetriever } from './knowledge/RAGRetriever';
export { KnowledgeBase, KnowledgeBaseRegistry } from './knowledge/KnowledgeBase';

// Tools
export { Tool } from './tools/Tool';
export { ToolRegistry } from './tools/ToolRegistry';
export { ToolExecutor } from './tools/ToolExecutor';
export { SearchTool } from './tools/built-in/SearchTool';
export { CodeAnalysisTool } from './tools/built-in/CodeAnalysisTool';
export { TestRunnerTool } from './tools/built-in/TestRunnerTool';

// Workflow
export { AgentMemory } from './workflow/Memory';
export { Agent } from './workflow/Agent';
export { WorkflowEngine } from './workflow/WorkflowEngine';

// Guardrails
export { InputGuard } from './guardrails/InputGuard';
export { OutputGuard } from './guardrails/OutputGuard';
export { GuardrailsEngine } from './guardrails/GuardrailsEngine';

// Evaluation
export { METRICS } from './evaluation/Metrics';
export { Evaluator } from './evaluation/Evaluator';
export { EvaluationPipeline } from './evaluation/EvaluationPipeline';

// Human Oversight
export { ReviewQueue } from './oversight/ReviewQueue';
export { ApprovalWorkflow } from './oversight/ApprovalWorkflow';
export { OversightManager } from './oversight/OversightManager';

// Monitoring
export { Tracer } from './monitoring/Tracer';
export { MetricsCollector } from './monitoring/MetricsCollector';
export { Dashboard } from './monitoring/Dashboard';
export { Monitor } from './monitoring/Monitor';

// ─── AgentPipeline — one-stop builder ────────────────────────────────────────

import { AgentConfig, AgentPipelineOptions, AgentSession, EvaluationConfig } from './types';
import { ModelRegistry } from './foundation/ModelRegistry';
import { PromptLibrary } from './prompts/PromptLibrary';
import { ToolRegistry } from './tools/ToolRegistry';
import { ToolExecutor } from './tools/ToolExecutor';
import { GuardrailsEngine } from './guardrails/GuardrailsEngine';
import { OversightManager } from './oversight/OversightManager';
import { EvaluationPipeline } from './evaluation/EvaluationPipeline';
import { Monitor } from './monitoring/Monitor';
import { Agent } from './workflow/Agent';

export class AgentPipeline {
  private agent: Agent;
  private evaluation: EvaluationPipeline;
  readonly monitor: Monitor;
  readonly oversight: OversightManager;
  private evaluationConfig?: EvaluationConfig;

  constructor(options: AgentPipelineOptions) {
    const { agentConfig, evaluationConfig, enableMonitoring = true } = options;

    this.monitor = enableMonitoring ? new Monitor() : new Monitor();
    this.oversight = new OversightManager(agentConfig.oversight, this.monitor);
    this.evaluation = new EvaluationPipeline(this.monitor);
    this.evaluationConfig = evaluationConfig;

    const model = ModelRegistry.create(agentConfig.model);
    const promptLibrary = new PromptLibrary();
    const toolRegistry = new ToolRegistry();
    const toolExecutor = new ToolExecutor(toolRegistry, this.oversight);
    const guardrails = new GuardrailsEngine(agentConfig.guardrails, this.monitor);

    this.agent = new Agent(
      agentConfig,
      model,
      promptLibrary,
      toolRegistry,
      toolExecutor,
      guardrails,
      this.monitor
    );

    // Expose the tool registry so callers can register tools after construction
    (this as unknown as { toolRegistry: ToolRegistry }).toolRegistry = toolRegistry;
    (this as unknown as { promptLibrary: PromptLibrary }).promptLibrary = promptLibrary;
  }

  get tools(): ToolRegistry {
    return (this as unknown as { toolRegistry: ToolRegistry }).toolRegistry;
  }

  get prompts(): PromptLibrary {
    return (this as unknown as { promptLibrary: PromptLibrary }).promptLibrary;
  }

  async run(userInput: string): Promise<{ session: AgentSession; evaluation?: ReturnType<EvaluationPipeline['run']> extends Promise<infer T> ? T : never }> {
    const session = await this.agent.run(userInput);

    let evaluation: Awaited<ReturnType<EvaluationPipeline['run']>> | undefined;
    if (this.evaluationConfig) {
      evaluation = await this.evaluation.run(session, this.evaluationConfig);
      this.monitor.storeEvaluation(evaluation);
    }

    return { session, evaluation } as { session: AgentSession; evaluation: typeof evaluation };
  }

  static create(config: AgentConfig): AgentPipeline {
    return new AgentPipeline({ agentConfig: config });
  }
}
