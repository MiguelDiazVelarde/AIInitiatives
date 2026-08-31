export interface SystemInstruction {
  id: string;
  name: string;
  content: string;
  role: string;
  priority: number;
}

export class SystemInstructions {
  private instructions = new Map<string, SystemInstruction>();

  register(instruction: SystemInstruction): void {
    this.instructions.set(instruction.id, instruction);
  }

  get(id: string): SystemInstruction {
    const inst = this.instructions.get(id);
    if (!inst) throw new Error(`System instruction '${id}' not found`);
    return inst;
  }

  compose(ids: string[]): string {
    return ids
      .map((id) => this.get(id))
      .sort((a, b) => a.priority - b.priority)
      .map((i) => i.content)
      .join('\n\n');
  }

  list(): SystemInstruction[] {
    return Array.from(this.instructions.values()).sort((a, b) => a.priority - b.priority);
  }
}
