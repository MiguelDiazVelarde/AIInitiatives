import https from 'https';
import http from 'http';
import { Message, ModelConfig, ModelResponse, ToolDefinition } from '../types';
import { ModelClient } from './ModelClient';

interface OpenAIMessage {
  role: string;
  content: string;
  tool_call_id?: string;
  name?: string;
}

interface OpenAITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, { type: string; description: string; enum?: string[] }>;
      required: string[];
    };
  };
}

interface OpenAIResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string | null;
      tool_calls?: Array<{
        id: string;
        function: { name: string; arguments: string };
      }>;
    };
    finish_reason: string;
  }>;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export class OpenAIClient extends ModelClient {
  private readonly baseUrl: string;

  constructor(config: ModelConfig) {
    super(config);
    this.baseUrl =
      config.provider === 'azure-openai' && config.endpoint
        ? config.endpoint
        : 'https://api.openai.com';
  }

  async complete(messages: Message[], tools?: ToolDefinition[]): Promise<ModelResponse> {
    const start = Date.now();

    const body: Record<string, unknown> = {
      model: this.config.model,
      messages: this.toOpenAIMessages(messages),
      temperature: this.config.temperature ?? 0.7,
      max_tokens: this.config.maxTokens ?? 2048,
    };

    if (tools && tools.length > 0) {
      body['tools'] = this.toOpenAITools(tools);
    }

    const raw = await this.post('/v1/chat/completions', body);
    const data = JSON.parse(raw) as OpenAIResponse;
    const choice = data.choices[0];

    const toolCalls = choice.message.tool_calls?.map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments) as Record<string, unknown>,
    }));

    return {
      content: choice.message.content ?? '',
      toolCalls,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
      model: data.model,
      finishReason: choice.finish_reason as ModelResponse['finishReason'],
      latencyMs: Date.now() - start,
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.post('/v1/models', {});
      return true;
    } catch {
      return false;
    }
  }

  private toOpenAIMessages(messages: Message[]): OpenAIMessage[] {
    return messages.map((m) => ({
      role: m.role,
      content: m.content,
      ...(m.toolCallId ? { tool_call_id: m.toolCallId } : {}),
      ...(m.name ? { name: m.name } : {}),
    }));
  }

  private toOpenAITools(tools: ToolDefinition[]): OpenAITool[] {
    return tools.map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: {
          type: 'object',
          properties: Object.fromEntries(
            t.parameters.map((p) => [
              p.name,
              {
                type: p.type,
                description: p.description,
                ...(p.enum ? { enum: p.enum } : {}),
              },
            ])
          ),
          required: t.parameters.filter((p) => p.required).map((p) => p.name),
        },
      },
    }));
  }

  private post(path: string, body: Record<string, unknown>): Promise<string> {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify(body);
      const url = new URL(path, this.baseUrl);
      const isHttps = url.protocol === 'https:';
      const lib = isHttps ? https : http;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload).toString(),
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      if (this.config.provider === 'azure-openai' && this.config.apiKey) {
        headers['api-key'] = this.config.apiKey;
        delete headers['Authorization'];
      }

      const req = lib.request(
        {
          hostname: url.hostname,
          port: url.port || (isHttps ? 443 : 80),
          path: url.pathname + url.search,
          method: 'POST',
          headers,
          timeout: this.config.timeout ?? 30000,
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (c: Buffer) => chunks.push(c));
          res.on('end', () => {
            const text = Buffer.concat(chunks).toString();
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`HTTP ${res.statusCode}: ${text}`));
            } else {
              resolve(text);
            }
          });
        }
      );

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(payload);
      req.end();
    });
  }
}
