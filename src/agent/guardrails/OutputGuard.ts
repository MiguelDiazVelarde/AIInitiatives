import { GuardrailCheckResult, GuardrailConfig, GuardrailViolation } from '../types';

const SENSITIVE_OUTPUT_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'api-key', pattern: /\b(?:sk|pk|api[-_]?key)[-_]?[A-Za-z0-9]{20,}\b/i },
  { name: 'password-leak', pattern: /password\s*[:=]\s*\S+/i },
  { name: 'private-key', pattern: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/ },
];

export class OutputGuard {
  private config: GuardrailConfig;

  constructor(config: GuardrailConfig) {
    this.config = config;
  }

  check(output: string): GuardrailCheckResult {
    const start = Date.now();
    const violations: GuardrailViolation[] = [];
    let sanitized = output;

    if (!this.config.enableOutputFilter) {
      return { passed: true, violations: [], checkLatencyMs: Date.now() - start };
    }

    // Length check
    if (output.length > this.config.maxOutputLength) {
      sanitized = output.slice(0, this.config.maxOutputLength) + '\n[Output truncated]';
      violations.push({
        ruleId: 'max-output-length',
        ruleName: 'Maximum Output Length',
        severity: 'low',
        action: 'redact',
        matchedContent: `${output.length} chars`,
        message: `Output truncated to ${this.config.maxOutputLength} characters`,
      });
    }

    // Sensitive data patterns
    for (const { name, pattern } of SENSITIVE_OUTPUT_PATTERNS) {
      if (pattern.test(sanitized)) {
        violations.push({
          ruleId: `sensitive-${name}`,
          ruleName: `Sensitive Data: ${name}`,
          severity: 'critical',
          action: 'redact',
          matchedContent: name,
          message: `Output contains sensitive data (${name}) — redacting`,
        });
        sanitized = sanitized.replace(pattern, `[REDACTED-${name.toUpperCase()}]`);
      }
    }

    // Custom rules
    for (const rule of this.config.customRules) {
      const re = new RegExp(rule.pattern, 'gi');
      if (re.test(sanitized)) {
        violations.push({
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          action: rule.action,
          matchedContent: rule.pattern,
          message: `Custom rule '${rule.name}' triggered on output`,
        });
        if (rule.action === 'redact') {
          sanitized = sanitized.replace(re, '[REDACTED]');
        } else if (rule.action === 'block') {
          return {
            passed: false,
            violations,
            sanitizedContent: '[Response blocked by guardrail]',
            checkLatencyMs: Date.now() - start,
          };
        }
      }
    }

    return {
      passed: true,
      violations,
      sanitizedContent: sanitized !== output ? sanitized : undefined,
      checkLatencyMs: Date.now() - start,
    };
  }
}
