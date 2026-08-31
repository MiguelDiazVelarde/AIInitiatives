import { AgentSession } from '../types';
import { Agent } from './Agent';

export interface WorkflowStep {
  id: string;
  name: string;
  agentId: string;
  inputTemplate: string; // may reference {{previous_output}}
  dependsOn?: string[]; // step IDs
}

export interface WorkflowConfig {
  id: string;
  name: string;
  steps: WorkflowStep[];
  stopOnFailure: boolean;
}

export interface WorkflowRun {
  workflowId: string;
  runId: string;
  status: 'running' | 'completed' | 'failed';
  stepResults: Map<string, AgentSession>;
  startedAt: Date;
  completedAt?: Date;
}

export class WorkflowEngine {
  private agents = new Map<string, Agent>();

  registerAgent(agentId: string, agent: Agent): void {
    this.agents.set(agentId, agent);
  }

  async execute(config: WorkflowConfig, initialInput: string): Promise<WorkflowRun> {
    const run: WorkflowRun = {
      workflowId: config.id,
      runId: crypto.randomUUID(),
      status: 'running',
      stepResults: new Map(),
      startedAt: new Date(),
    };

    const completed = new Set<string>();
    let previousOutput = initialInput;

    // Topological execution respecting dependsOn
    const pending = [...config.steps];

    while (pending.length > 0) {
      const ready = pending.filter((step) =>
        !step.dependsOn || step.dependsOn.every((dep) => completed.has(dep))
      );

      if (ready.length === 0) {
        run.status = 'failed';
        break;
      }

      // Execute ready steps (sequentially for now; parallelise if no data deps)
      for (const step of ready) {
        const agent = this.agents.get(step.agentId);
        if (!agent) {
          if (config.stopOnFailure) {
            run.status = 'failed';
            run.completedAt = new Date();
            return run;
          }
          completed.add(step.id);
          pending.splice(pending.indexOf(step), 1);
          continue;
        }

        const input = step.inputTemplate.replace('{{previous_output}}', previousOutput);
        const session = await agent.run(input);
        run.stepResults.set(step.id, session);
        completed.add(step.id);
        pending.splice(pending.indexOf(step), 1);

        if (session.status === 'failed' && config.stopOnFailure) {
          run.status = 'failed';
          run.completedAt = new Date();
          return run;
        }

        const lastMsg = session.messages.filter((m) => m.role === 'assistant').pop();
        previousOutput = lastMsg?.content ?? previousOutput;
      }
    }

    run.status = run.status === 'failed' ? 'failed' : 'completed';
    run.completedAt = new Date();
    return run;
  }
}
