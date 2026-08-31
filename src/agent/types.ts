// ─── Foundation Model ────────────────────────────────────────────────────────

export type ModelProvider = 'openai' | 'azure-openai' | 'anthropic' | 'local';

export interface ModelConfig {
  provider: ModelProvider;
  model: string;
  apiKey?: string;
  endpoint?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  timeout?: number;
}

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string;
  name?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ModelResponse {
  content: string;
  toolCalls?: ToolCall[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: 'stop' | 'tool_calls' | 'length' | 'content_filter';
  latencyMs: number;
}

// ─── Prompts / Instructions ───────────────────────────────────────────────────

export interface PromptTemplateDefinition {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: 'system' | 'user' | 'few-shot' | 'chain-of-thought';
  version: string;
}

export interface RenderedPrompt {
  templateId: string;
  content: string;
  variables: Record<string, string>;
  renderedAt: Date;
}

// ─── Knowledge / RAG ─────────────────────────────────────────────────────────

export interface Document {
  id: string;
  content: string;
  metadata: Record<string, string | number | boolean>;
  source: string;
  createdAt: Date;
  updatedAt: Date;
  embedding?: number[];
}

export interface RetrievalResult {
  document: Document;
  score: number;
  rank: number;
}

export interface RAGContext {
  query: string;
  retrievedDocuments: RetrievalResult[];
  augmentedPrompt: string;
  retrievalLatencyMs: number;
}

// ─── Tools ───────────────────────────────────────────────────────────────────

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  enum?: string[];
  default?: unknown;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameter[];
  category: 'search' | 'code' | 'test' | 'data' | 'external' | 'utility';
  requiresApproval: boolean;
  timeout?: number;
}

export interface ToolExecutionContext {
  toolName: string;
  arguments: Record<string, unknown>;
  agentId: string;
  sessionId: string;
  requestId: string;
}

export interface ToolExecutionResult {
  success: boolean;
  output: unknown;
  error?: string;
  latencyMs: number;
  approved?: boolean;
}

// ─── Agent / Workflow ─────────────────────────────────────────────────────────

export type AgentStatus =
  | 'idle'
  | 'running'
  | 'waiting_approval'
  | 'completed'
  | 'failed'
  | 'paused';

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  model: ModelConfig;
  systemPromptId: string;
  tools: string[];
  maxIterations: number;
  enableRAG: boolean;
  knowledgeBaseIds: string[];
  guardrails: GuardrailConfig;
  oversight: OversightConfig;
}

export interface AgentSession {
  sessionId: string;
  agentId: string;
  status: AgentStatus;
  messages: Message[];
  toolCallHistory: ToolExecution[];
  ragContexts: RAGContext[];
  startedAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  metadata: Record<string, unknown>;
}

export interface ToolExecution {
  id: string;
  toolName: string;
  arguments: Record<string, unknown>;
  result?: ToolExecutionResult;
  approvalRequired: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  executedAt: Date;
}

// ─── Guardrails ───────────────────────────────────────────────────────────────

export interface GuardrailConfig {
  enableInputFilter: boolean;
  enableOutputFilter: boolean;
  blockedTopics: string[];
  maxInputLength: number;
  maxOutputLength: number;
  requirePIICheck: boolean;
  customRules: GuardrailRule[];
}

export interface GuardrailRule {
  id: string;
  name: string;
  pattern: string;
  action: 'block' | 'warn' | 'redact';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface GuardrailCheckResult {
  passed: boolean;
  violations: GuardrailViolation[];
  sanitizedContent?: string;
  checkLatencyMs: number;
}

export interface GuardrailViolation {
  ruleId: string;
  ruleName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'block' | 'warn' | 'redact';
  matchedContent: string;
  message: string;
}

// ─── Evaluation ───────────────────────────────────────────────────────────────

export interface EvaluationConfig {
  metrics: EvaluationMetricName[];
  groundTruth?: string;
  referenceDocuments?: Document[];
}

export type EvaluationMetricName =
  | 'relevance'
  | 'faithfulness'
  | 'coherence'
  | 'completeness'
  | 'safety'
  | 'latency'
  | 'tool_accuracy';

export interface EvaluationScore {
  metric: EvaluationMetricName;
  score: number; // 0–1
  explanation: string;
  passed: boolean;
  threshold: number;
}

export interface EvaluationResult {
  sessionId: string;
  scores: EvaluationScore[];
  overallScore: number;
  passed: boolean;
  evaluatedAt: Date;
  latencyMs: number;
}

// ─── Human Oversight ─────────────────────────────────────────────────────────

export interface OversightConfig {
  requireApprovalForTools: string[];
  requireApprovalForHighRiskActions: boolean;
  reviewTimeoutMs: number;
  escalationPolicy: 'auto-approve' | 'auto-reject' | 'escalate';
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'escalated' | 'timeout';

export interface ReviewRequest {
  id: string;
  sessionId: string;
  agentId: string;
  type: 'tool_execution' | 'response' | 'action';
  content: string;
  context: Record<string, unknown>;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  status: ReviewStatus;
  createdAt: Date;
  resolvedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
}

// ─── Monitoring ───────────────────────────────────────────────────────────────

export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  durationMs?: number;
  status: 'ok' | 'error' | 'timeout';
  attributes: Record<string, string | number | boolean>;
  events: SpanEvent[];
  error?: string;
}

export interface SpanEvent {
  name: string;
  timestamp: Date;
  attributes: Record<string, string | number | boolean>;
}

export interface AgentMetrics {
  agentId: string;
  period: { start: Date; end: Date };
  totalSessions: number;
  successfulSessions: number;
  failedSessions: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  totalTokensUsed: number;
  totalToolCalls: number;
  guardrailTriggers: number;
  humanInterventions: number;
  avgEvaluationScore: number;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
}

export interface Alert {
  ruleId: string;
  ruleName: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  triggeredAt: Date;
}

export interface AgentPipelineOptions {
  agentConfig: AgentConfig;
  evaluationConfig?: EvaluationConfig;
  enableMonitoring?: boolean;
}
