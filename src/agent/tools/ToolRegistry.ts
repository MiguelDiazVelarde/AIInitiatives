import { ToolDefinition } from '../types';
import { Tool } from './Tool';

export class ToolRegistry {
  private tools = new Map<string, Tool>();

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): Tool {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Tool '${name}' not registered`);
    return tool;
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  list(): Tool[] {
    return Array.from(this.tools.values());
  }

  getDefinitions(names?: string[]): ToolDefinition[] {
    const tools = names ? names.map((n) => this.get(n)) : this.list();
    return tools.map((t) => t.definition);
  }

  unregister(name: string): boolean {
    return this.tools.delete(name);
  }
}
