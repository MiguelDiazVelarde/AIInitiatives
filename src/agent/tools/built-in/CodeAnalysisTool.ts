import fs from 'fs';
import path from 'path';
import { ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../../types';
import { Tool } from '../Tool';

interface FileStats {
  path: string;
  lines: number;
  sizeBytes: number;
  extension: string;
}

export class CodeAnalysisTool extends Tool {
  readonly definition: ToolDefinition = {
    name: 'analyze_code_file',
    description: 'Analyse a source file: count lines, detect language, read a snippet',
    category: 'code',
    requiresApproval: false,
    parameters: [
      {
        name: 'file_path',
        type: 'string',
        description: 'Absolute or workspace-relative path to the file',
        required: true,
      },
      {
        name: 'start_line',
        type: 'number',
        description: 'First line to include in snippet (1-based)',
        required: false,
        default: 1,
      },
      {
        name: 'end_line',
        type: 'number',
        description: 'Last line to include in snippet (inclusive)',
        required: false,
        default: 50,
      },
    ],
  };

  private readonly rootDir: string;

  constructor(rootDir: string) {
    super();
    this.rootDir = rootDir;
  }

  async execute(
    args: Record<string, unknown>,
    _context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    const start = Date.now();
    const filePath = this.resolveSafe(String(args['file_path'] ?? ''));

    if (!filePath) {
      return this.failure('Invalid or disallowed file path', Date.now() - start);
    }

    if (!fs.existsSync(filePath)) {
      return this.failure(`File not found: ${filePath}`, Date.now() - start);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const startLine = Math.max(1, Number(args['start_line'] ?? 1)) - 1;
    const endLine = Math.min(lines.length, Number(args['end_line'] ?? 50));

    const stats: FileStats = {
      path: filePath,
      lines: lines.length,
      sizeBytes: Buffer.byteLength(content),
      extension: path.extname(filePath),
    };

    return this.success(
      {
        stats,
        snippet: lines.slice(startLine, endLine).join('\n'),
      },
      Date.now() - start
    );
  }

  private resolveSafe(filePath: string): string | null {
    const resolved = path.isAbsolute(filePath)
      ? path.normalize(filePath)
      : path.resolve(this.rootDir, filePath);

    // Prevent path traversal outside rootDir
    if (!resolved.startsWith(path.normalize(this.rootDir))) return null;
    return resolved;
  }
}
