import { PromptTemplateDefinition } from '../types';
import { PromptTemplate } from './PromptTemplate';
import { SystemInstructions } from './SystemInstructions';

export const DEFAULT_TEMPLATES: PromptTemplateDefinition[] = [
  {
    id: 'agent-system',
    name: 'Agent System Prompt',
    description: 'Base system prompt for the AI agent',
    category: 'system',
    version: '1.0.0',
    variables: ['agent_name', 'agent_role', 'current_date'],
    template: `You are {{agent_name}}, an AI agent specialized in {{agent_role}}.
Today's date is {{current_date}}.

You are precise, concise, and always ground your answers in facts.
When you use tools, explain briefly what you are doing and why.
When uncertain, acknowledge it and ask for clarification.`,
  },
  {
    id: 'rag-augmented-query',
    name: 'RAG Augmented User Query',
    description: 'Wraps a user query with retrieved context',
    category: 'user',
    version: '1.0.0',
    variables: ['context', 'query'],
    template: `Use the following context to answer the question.
If the context does not contain enough information, say so explicitly.

---CONTEXT---
{{context}}
---END CONTEXT---

Question: {{query}}`,
  },
  {
    id: 'chain-of-thought',
    name: 'Chain of Thought Reasoning',
    description: 'Encourages step-by-step reasoning before answering',
    category: 'chain-of-thought',
    version: '1.0.0',
    variables: ['task'],
    template: `Task: {{task}}

Think step by step:
1. Understand what is being asked
2. Identify required information or sub-tasks
3. Execute each step
4. Synthesize a final answer

Begin:`,
  },
  {
    id: 'tool-result-summary',
    name: 'Tool Result Summary',
    description: 'Summarises a tool execution result for the user',
    category: 'user',
    version: '1.0.0',
    variables: ['tool_name', 'result'],
    template: `The tool "{{tool_name}}" returned the following result:

{{result}}

Please provide a clear, human-readable summary of this output.`,
  },
];

export class PromptLibrary {
  private templates = new Map<string, PromptTemplate>();
  readonly systemInstructions = new SystemInstructions();

  constructor() {
    for (const def of DEFAULT_TEMPLATES) {
      this.templates.set(def.id, new PromptTemplate(def));
    }

    this.systemInstructions.register({
      id: 'core-safety',
      name: 'Core Safety',
      content:
        'Never execute destructive operations without explicit user confirmation. ' +
        'Always validate inputs before processing. ' +
        'Do not expose sensitive credentials or PII in responses.',
      role: 'system',
      priority: 0,
    });

    this.systemInstructions.register({
      id: 'tool-usage',
      name: 'Tool Usage Guidelines',
      content:
        'Use tools only when necessary to answer the user request. ' +
        'Prefer the least privileged tool available. ' +
        'Always pass the minimum required arguments.',
      role: 'system',
      priority: 10,
    });
  }

  register(template: PromptTemplate): void {
    this.templates.set(template.id, template);
  }

  get(id: string): PromptTemplate {
    const t = this.templates.get(id);
    if (!t) throw new Error(`Prompt template '${id}' not found`);
    return t;
  }

  list(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }
}
