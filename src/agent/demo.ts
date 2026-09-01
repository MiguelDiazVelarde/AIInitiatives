#!/usr/bin/env ts-node
/**
 * Demo sin API key real — usa un ModelClient mock que simula respuestas.
 * Ejecutar: npx ts-node src/agent/demo.ts
 */

import { ModelClient } from './foundation/ModelClient';
import { ModelRegistry } from './foundation/ModelRegistry';
import { ModelConfig, ModelResponse, Message, ToolDefinition } from './types';
import {
  AgentPipeline,
  KnowledgeBase,
  KnowledgeBaseRegistry,
  CodeAnalysisTool,
  SearchTool,
} from './index';

// ─── Mock model: simula respuestas sin llamar a ninguna API ──────────────────

class MockModelClient extends ModelClient {
  constructor() {
    super({ provider: 'local', model: 'mock-gpt' } as ModelConfig);
  }

  async complete(messages: Message[], tools?: ToolDefinition[]): Promise<ModelResponse> {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
    const hasTools = tools && tools.length > 0;

    return {
      content: hasTools
        ? `[Mock] Respuesta para: "${lastUser.slice(0, 80)}..." (herramientas disponibles: ${tools!.map((t) => t.name).join(', ')})`
        : `[Mock] Respuesta para: "${lastUser.slice(0, 80)}..."`,
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      model: 'mock-gpt',
      finishReason: 'stop',
      latencyMs: 80,
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

// ─── Registrar el mock como si fuera OpenAI ──────────────────────────────────

ModelRegistry.register('mock-gpt', new MockModelClient());

// ─── Configurar pipeline ──────────────────────────────────────────────────────

const pipeline = new AgentPipeline({
  agentConfig: {
    id: 'demo-agent',
    name: 'Demo Agent',
    description: 'agente de demostración de la arquitectura de 9 capas',
    model: { provider: 'local', model: 'mock-gpt' },
    systemPromptId: 'agent-system',
    tools: ['search_knowledge_base', 'analyze_code_file'],
    maxIterations: 3,
    enableRAG: true,
    knowledgeBaseIds: ['project-kb'],
    guardrails: {
      enableInputFilter: true,
      enableOutputFilter: true,
      blockedTopics: [],
      maxInputLength: 32000,
      maxOutputLength: 16000,
      requirePIICheck: true,
      customRules: [],
    },
    oversight: {
      requireApprovalForTools: [],
      requireApprovalForHighRiskActions: false,
      reviewTimeoutMs: 5000,
      escalationPolicy: 'auto-approve',
    },
  },
  evaluationConfig: {
    metrics: ['relevance', 'coherence', 'safety', 'latency', 'tool_accuracy'],
  },
});

// ─── Layer 3: cargar documentos en la Knowledge Base ────────────────────────

const kb = new KnowledgeBase('project-kb', 'Project Knowledge Base');
kb.addDocuments([
  {
    content: 'El módulo src/agent implementa una arquitectura de agente con 9 capas: Foundation Model, Prompts, RAG, Tools, Workflow, Guardrails, Evaluation, Human Oversight y Monitoring.',
    source: 'README.md',
    metadata: { type: 'documentation' },
  },
  {
    content: 'AgentPipeline es el punto de entrada principal. Acepta AgentConfig y opcionalmente EvaluationConfig. Expone pipeline.run(input) y pipeline.monitor.getDashboard().',
    source: 'src/agent/index.ts',
    metadata: { type: 'code' },
  },
  {
    content: 'GuardrailsEngine valida la entrada buscando PII (tarjetas de crédito, SSN, email) y temas bloqueados. La salida se verifica buscando credenciales (api-key, private key).',
    source: 'src/agent/guardrails/',
    metadata: { type: 'code' },
  },
]);
KnowledgeBaseRegistry.register(kb);

// ─── Layer 4: registrar herramientas ─────────────────────────────────────────

pipeline.tools.register(
  new SearchTool(async (query, topK) => {
    const results = await kb.search(query);
    return results.slice(0, topK).map((r) => ({
      score: r.score.toFixed(3),
      source: r.document.source,
      excerpt: r.document.content.slice(0, 120),
    }));
  })
);

pipeline.tools.register(new CodeAnalysisTool(process.cwd()));

// ─── Ejecutar ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║        AI Agent Architecture — Demo                 ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  const queries = [
    '¿Qué capas tiene la arquitectura del agente?',
    '¿Cómo funciona el sistema de guardrails?',
  ];

  for (const query of queries) {
    console.log(`\n── Query: "${query}"`);
    const { session, evaluation } = await pipeline.run(query);

    // Mostrar respuesta
    const answer = session.messages.filter((m) => m.role === 'assistant').pop();
    console.log(`   Respuesta : ${answer?.content}`);

    // Mostrar contexto RAG recuperado
    const ragCtx = session.ragContexts[0];
    if (ragCtx?.retrievedDocuments.length) {
      console.log(`   RAG docs  : ${ragCtx.retrievedDocuments.length} documentos recuperados (latency: ${ragCtx.retrievalLatencyMs}ms)`);
    }

    // Mostrar evaluación
    if (evaluation) {
      console.log(`   Eval score: ${(evaluation.overallScore * 100).toFixed(0)}%  passed=${evaluation.passed}`);
      evaluation.scores.forEach((s) =>
        console.log(`     • ${s.metric.padEnd(14)} ${(s.score * 100).toFixed(0).padStart(3)}%  ${s.passed ? '✓' : '✗'}`)
      );
    }

    console.log(`   Status    : ${session.status}`);
  }

  // ─── Dashboard de monitoreo ─────────────────────────────────────────────────
  const dash = pipeline.monitor.getDashboard();
  console.log('\n── Monitoring Dashboard');
  console.log(`   Total sesiones  : ${dash.summary.totalSessions}`);
  console.log(`   Tasa de éxito   : ${(dash.summary.overallSuccessRate * 100).toFixed(0)}%`);
  console.log(`   Avg eval score  : ${(dash.summary.overallAvgScore * 100).toFixed(0)}%`);
  console.log(`   Spans trazados  : ${dash.recentSpans.length}`);
  console.log(`   Alertas activas : ${dash.summary.activeAlerts}`);

  // ─── Cola de supervisión humana ─────────────────────────────────────────────
  const pending = pipeline.oversight.pendingReviews();
  console.log(`\n── Human Oversight: ${pending.length} revisiones pendientes`);

  console.log('\n✅ Demo completo — todos los layers ejecutados correctamente.\n');
}

main().catch((err) => {
  console.error('Error en demo:', err);
  process.exit(1);
});
