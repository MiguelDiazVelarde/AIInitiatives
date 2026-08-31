import { execFile } from 'child_process';
import { ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../../types';
import { Tool } from '../Tool';

export class TestRunnerTool extends Tool {
  readonly definition: ToolDefinition = {
    name: 'run_tests',
    description:
      'Run the project test suite with an optional filter. Returns exit code, stdout and stderr.',
    category: 'test',
    requiresApproval: true, // running tests is an external side-effect
    parameters: [
      {
        name: 'filter',
        type: 'string',
        description: 'Grep pattern to filter tests (empty = run all)',
        required: false,
        default: '',
      },
      {
        name: 'timeout_ms',
        type: 'number',
        description: 'Maximum execution time in ms',
        required: false,
        default: 60000,
      },
    ],
  };

  private readonly cwd: string;
  private readonly command: string;
  private readonly baseArgs: string[];

  constructor(cwd: string, command = 'npm', baseArgs = ['test']) {
    super();
    this.cwd = cwd;
    this.command = command;
    this.baseArgs = baseArgs;
  }

  async execute(
    args: Record<string, unknown>,
    _context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    const start = Date.now();
    const filter = String(args['filter'] ?? '');
    const timeoutMs = Number(args['timeout_ms'] ?? 60000);
    const cmdArgs = filter ? [...this.baseArgs, '--grep', filter] : [...this.baseArgs];

    return new Promise((resolve) => {
      execFile(
        this.command,
        cmdArgs,
        { cwd: this.cwd, timeout: timeoutMs, shell: process.platform === 'win32' },
        (error, stdout, stderr) => {
          resolve(
            this.success(
              { exitCode: error?.code ?? 0, stdout, stderr },
              Date.now() - start
            )
          );
        }
      );
    });
  }
}
