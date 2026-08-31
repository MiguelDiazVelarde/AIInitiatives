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
    switch (config.provider) {
      case 'openai':
      case 'azure-openai':
        return new OpenAIClient(config);
      default:
        throw new Error(`Unsupported model provider: ${config.provider}`);
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
