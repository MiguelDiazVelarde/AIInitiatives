import { GuardrailCheckResult, GuardrailConfig } from '../types';
import { InputGuard } from './InputGuard';
import { OutputGuard } from './OutputGuard';
import { Monitor } from '../monitoring/Monitor';

const DEFAULT_CONFIG: GuardrailConfig = {
  enableInputFilter: true,
  enableOutputFilter: true,
  blockedTopics: [],
  maxInputLength: 32_000,
  maxOutputLength: 16_000,
  requirePIICheck: true,
  customRules: [],
};

export class GuardrailsEngine {
  private inputGuard: InputGuard;
  private outputGuard: OutputGuard;
  private monitor?: Monitor;

  constructor(config?: Partial<GuardrailConfig>, monitor?: Monitor) {
    const merged = { ...DEFAULT_CONFIG, ...config };
    this.inputGuard = new InputGuard(merged);
    this.outputGuard = new OutputGuard(merged);
    this.monitor = monitor;
  }

  async checkInput(input: string): Promise<GuardrailCheckResult> {
    const result = this.inputGuard.check(input);
    if (result.violations.length > 0) {
      this.monitor?.recordGuardrailTrigger();
    }
    return result;
  }

  async checkOutput(output: string): Promise<GuardrailCheckResult> {
    const result = this.outputGuard.check(output);
    if (result.violations.length > 0) {
      this.monitor?.recordGuardrailTrigger();
    }
    return result;
  }
}
