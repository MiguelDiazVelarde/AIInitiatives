import { PromptTemplateDefinition, RenderedPrompt } from '../types';

export class PromptTemplate {
  private definition: PromptTemplateDefinition;

  constructor(definition: PromptTemplateDefinition) {
    this.definition = definition;
  }

  render(variables: Record<string, string>): RenderedPrompt {
    const missing = this.definition.variables.filter((v) => !(v in variables));
    if (missing.length > 0) {
      throw new Error(
        `Missing variables for template '${this.definition.id}': ${missing.join(', ')}`
      );
    }

    let content = this.definition.template;
    for (const [key, value] of Object.entries(variables)) {
      content = content.replaceAll(`{{${key}}}`, value);
    }

    return {
      templateId: this.definition.id,
      content,
      variables,
      renderedAt: new Date(),
    };
  }

  get id(): string {
    return this.definition.id;
  }

  get name(): string {
    return this.definition.name;
  }

  get category(): string {
    return this.definition.category;
  }

  get requiredVariables(): string[] {
    return this.definition.variables;
  }
}
