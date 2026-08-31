import { GuardrailCheckResult, GuardrailConfig, GuardrailViolation } from '../types';

const PII_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'credit-card', pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/ },
  { name: 'ssn', pattern: /\b\d{3}-\d{2}-\d{4}\b/ },
  { name: 'email', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/ },
];

export class InputGuard {
  private config: GuardrailConfig;

  constructor(config: GuardrailConfig) {
    this.config = config;
  }

  check(input: string): GuardrailCheckResult {
    const start = Date.now();
    const violations: GuardrailViolation[] = [];
    let sanitized = input;

    if (!this.config.enableInputFilter) {
      return { passed: true, violations: [], checkLatencyMs: Date.now() - start };
    }

    // Length check
    if (input.length > this.config.maxInputLength) {
      violations.push({
        ruleId: 'max-input-length',
        ruleName: 'Maximum Input Length',
        severity: 'high',
        action: 'block',
        matchedContent: `${input.length} chars`,
        message: `Input exceeds maximum length of ${this.config.maxInputLength} characters`,
      });
    }

    // Blocked topics
    for (const topic of this.config.blockedTopics) {
      const re = new RegExp(topic, 'gi');
      if (re.test(input)) {
        violations.push({
          ruleId: `blocked-topic-${topic}`,
          ruleName: `Blocked Topic: ${topic}`,
          severity: 'critical',
          action: 'block',
          matchedContent: topic,
          message: `Input contains blocked topic: "${topic}"`,
        });
      }
    }

    // PII detection
    if (this.config.requirePIICheck) {
      for (const { name, pattern } of PII_PATTERNS) {
        if (pattern.test(input)) {
          violations.push({
            ruleId: `pii-${name}`,
            ruleName: `PII: ${name}`,
            severity: 'high',
            action: 'redact',
            matchedContent: name,
            message: `Input contains ${name} – redacting`,
          });
          sanitized = sanitized.replace(pattern, `[REDACTED-${name.toUpperCase()}]`);
        }
      }
    }

    // Custom rules
    for (const rule of this.config.customRules) {
      const re = new RegExp(rule.pattern, 'gi');
      if (re.test(input)) {
        violations.push({
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          action: rule.action,
          matchedContent: rule.pattern,
          message: `Custom rule '${rule.name}' triggered`,
        });
        if (rule.action === 'redact') {
          sanitized = sanitized.replace(re, '[REDACTED]');
        }
      }
    }

    const blocking = violations.filter((v) => v.action === 'block');
    return {
      passed: blocking.length === 0,
      violations,
      sanitizedContent: sanitized !== input ? sanitized : undefined,
      checkLatencyMs: Date.now() - start,
    };
  }
}
