import { ModelConfig } from '../types';
import { ModelClient } from './ModelClient';
import { OpenAIClient } from './OpenAIClient';

export class ModelRegistry {
  private static clients = new Map<string, ModelClient>();

  static register(key: string, client: ModelClient): void {
    this.clients.set(key, client);
  }

  static get(key: string): ModelClient {
    const client = this.clients.get(key);
    if (!client) throw new Error(`Model client '${key}' not registered`);
    return client;
  }

  static create(config: ModelConfig): ModelClient {
    // Return a pre-registered client if one exists for this model id
    if (this.clients.has(config.model)) {
      return this.clients.get(config.model)!;
    }

    switch (config.provider) {
      case 'openai':
      case 'azure-openai':
        return new OpenAIClient(config);
      default:
        throw new Error(
          `Unsupported model provider: '${config.provider}'. ` +
          `Register a custom client first with ModelRegistry.register('${config.model}', client).`
        );
    }
  }

  static createAndRegister(key: string, config: ModelConfig): ModelClient {
    const client = this.create(config);
    this.register(key, client);
    return client;
  }

  static list(): string[] {
    return Array.from(this.clients.keys());
  }
}
