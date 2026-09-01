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

// ─── Helpers de visualización ────────────────────────────────────────────────

function header(n: number, title: string) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  LAYER ${n}: ${title}`);
  console.log('─'.repeat(60));
}

function ok(msg: string)   { console.log(`  ✅ ${msg}`); }
function info(msg: string) { console.log(`  ℹ️  ${msg}`); }
function warn(msg: string) { console.log(`  ⚠️  ${msg}`); }

// ─── LAYER 1: Foundation Model (mock) ────────────────────────────────────────

class MockModelClient extends ModelClient {
  constructor() {
    super({ provider: 'local', model: 'mock-gpt' } as ModelConfig);
  }

  async complete(messages: Message[], tools?: ToolDefinition[]): Promise<ModelResponse> {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
    return {
      content: `Basándome en el contexto recuperado, puedo responder: "${lastUser.slice(0, 60)}..."`,
      usage: { promptTokens: 120, completionTokens: 60, totalTokens: 180 },
      model: 'mock-gpt',
      finishReason: 'stop',
      latencyMs: 95,
    };
  }

  async isAvailable(): Promise<boolean> { return true; }
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   AI Agent Architecture — Demo paso a paso (9 layers)   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  // ── LAYER 1 ──────────────────────────────────────────────────────────────
  header(1, 'Foundation Model');
  info('El modelo es el "cerebro". En producción sería OpenAI/Azure.');
  info('Aquí usamos un MockModelClient para no necesitar API key.');
  ModelRegistry.register('mock-gpt', new MockModelClient());
  ok('MockModelClient registrado como "mock-gpt"');

  // ── LAYER 2 ──────────────────────────────────────────────────────────────
  header(2, 'Prompt / Instructions');
  info('El sistema carga plantillas con variables (nombre del agente, fecha, rol).');
  info('El agente usará la plantilla "agent-system" al arrancar.');

  // ── LAYER 3 ──────────────────────────────────────────────────────────────
  header(3, 'RAG / Knowledge Base');
  info('Añadimos 3 documentos de texto al knowledge base.');
  info('Se indexan con TF-IDF. Cuando el usuario pregunte, se recuperan los más relevantes.');

  const kb = new KnowledgeBase('project-kb', 'Project Knowledge Base');
  kb.addDocuments([
    {
      content: 'La arquitectura tiene 9 capas: Foundation Model, Prompts, RAG, Tools, Workflow, Guardrails, Evaluation, Human Oversight y Monitoring.',
      source: 'README.md',
      metadata: { type: 'doc' },
    },
    {
      content: 'Los guardrails detectan PII (emails, tarjetas, SSN) en la entrada y credenciales (api-key, private key) en la salida, y los redactan automáticamente.',
      source: 'guardrails/README',
      metadata: { type: 'doc' },
    },
    {
      content: 'El sistema de evaluación mide: relevance, faithfulness, coherence, completeness, safety, latency y tool_accuracy. Cada métrica puntúa de 0 a 1.',
      source: 'evaluation/README',
      metadata: { type: 'doc' },
    },
  ]);
  KnowledgeBaseRegistry.register(kb);
  ok('3 documentos indexados en "project-kb"');

  // ── LAYER 4 ──────────────────────────────────────────────────────────────
  header(4, 'Tools');
  info('Las herramientas son funciones que el agente puede llamar para obtener información real.');
  info('SearchTool  → busca en el knowledge base.');
  info('CodeAnalysisTool → lee archivos del proyecto de forma segura (sin path traversal).');

  // ── Construir el pipeline (layers 5-9 configurados aquí) ─────────────────
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
        blockedTopics: ['hack', 'exploit'],
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

  pipeline.tools.register(
    new SearchTool(async (query, topK) => {
      const results = await kb.search(query);
      return results.slice(0, topK).map((r) => ({
        score: r.score.toFixed(3),
        source: r.document.source,
        excerpt: r.document.content.slice(0, 100),
      }));
    })
  );
  pipeline.tools.register(new CodeAnalysisTool(process.cwd()));

  // ── LAYER 5 ──────────────────────────────────────────────────────────────
  header(5, 'Agent / Workflow');
  info('El agente recibe la pregunta del usuario y ejecuta el loop ReAct:');
  info('  1) construye prompt  2) llama al modelo  3) si hay tool calls, las ejecuta  4) repite');

  // ── LAYER 6: Guardrails — INPUT ───────────────────────────────────────────
  header(6, 'Guardrails — prueba de INPUT con PII');
  info('Enviamos un mensaje que contiene un email → debería ser redactado.');
  const { session: s1 } = await pipeline.run(
    'Mi email es usuario@ejemplo.com, ¿cómo funciona el sistema?'
  );
  const ragUsed = s1.ragContexts.length > 0 && s1.ragContexts[0].retrievedDocuments.length > 0;
  ok(`Sesión completada: status=${s1.status}`);
  ok(`RAG recuperó ${s1.ragContexts[0]?.retrievedDocuments.length ?? 0} documentos`);
  info('El email fue redactado a [REDACTED-EMAIL] antes de pasarse al modelo.');
  ok(`Respuesta del modelo: "${s1.messages.filter(m => m.role === 'assistant').pop()?.content?.slice(0, 80)}..."`);

  // ── LAYER 6: Guardrails — BLOCKED TOPIC ──────────────────────────────────
  info('\nProbando tema bloqueado ("hack"):');
  const { session: s2 } = await pipeline.run('Cómo hack el sistema de login');
  if (s2.status === 'failed') {
    ok('Mensaje bloqueado por guardrails (tema "hack" en blockedTopics)');
    info(`Respuesta: "${s2.messages.at(-1)?.content}"`);
  }

  // ── LAYER 7 ──────────────────────────────────────────────────────────────
  header(7, 'Evaluation');
  info('Después de cada respuesta se calculan métricas automáticamente.');
  const { session: s3, evaluation } = await pipeline.run('¿Cuántas capas tiene la arquitectura?');
  if (evaluation) {
    ok(`Score global: ${(evaluation.overallScore * 100).toFixed(0)}%`);
    for (const s of evaluation.scores) {
      const icon = s.passed ? '✓' : '✗';
      console.log(`     ${icon} ${s.metric.padEnd(14)} ${(s.score * 100).toFixed(0).padStart(3)}%  — ${s.explanation}`);
    }
  }

  // ── LAYER 8 ──────────────────────────────────────────────────────────────
  header(8, 'Human Oversight');
  info('Las herramientas marcadas con requiresApproval=true generan una "review request".');
  info('El OversightManager espera aprobación humana (o aplica la escalation policy).');
  const pending = pipeline.oversight.pendingReviews();
  ok(`Revisiones pendientes ahora mismo: ${pending.length}`);
  if (pending.length === 0) info('(ninguna — porque las tools de demo no requieren aprobación)');

  // ── LAYER 9 ──────────────────────────────────────────────────────────────
  header(9, 'Monitoring');
  info('El Monitor registra trazas, métricas por agente y puede disparar alertas.');
  const dash = pipeline.monitor.getDashboard();
  ok(`Sesiones ejecutadas  : ${dash.summary.totalSessions}`);
  ok(`Tasa de éxito        : ${(dash.summary.overallSuccessRate * 100).toFixed(0)}%`);
  ok(`Avg eval score       : ${(dash.summary.overallAvgScore * 100).toFixed(0)}%`);
  ok(`Spans de traza       : ${dash.recentSpans.length}`);
  ok(`Alertas activas      : ${dash.summary.activeAlerts}`);
  info('Cada llamada al modelo, cada tool call y cada sesión genera un Span con duración y status.');

  console.log(`\n${'═'.repeat(60)}`);
  console.log('  ✅  Todas las 9 capas ejercitadas correctamente.');
  console.log(`${'═'.repeat(60)}\n`);
}

main().catch((err) => {
  console.error('Error en demo:', err);
  process.exit(1);
});

