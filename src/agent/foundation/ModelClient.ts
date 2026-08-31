import { Message, ModelConfig, ModelResponse, ToolDefinition } from '../types';

export abstract class ModelClient {
  protected config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  abstract complete(
    messages: Message[],
    tools?: ToolDefinition[]
  ): Promise<ModelResponse>;

  abstract isAvailable(): Promise<boolean>;

  get modelId(): string {
    return this.config.model;
  }

  get provider(): string {
    return this.config.provider;
  }
}
