import { RuleContext, AgenticRule, RuleFinding } from './types';
import { computeMetrics } from '../metrics';

export class RuleEngine {
  private rules: AgenticRule[];

  constructor(rules: AgenticRule[]) {
    this.rules = rules;
  }

  evaluate(ctx: RuleContext) {
    const findings: RuleFinding[] = [];

    for (const rule of this.rules) {
      try {
        const result = rule.evaluate(ctx);

        // Normalize rule output
        for (const f of result) {
          findings.push({
            id: f.id ?? `finding-${rule.id}-${Math.random().toString(36).slice(2)}`,
            ruleId: rule.id,
            severity: f.severity ?? 'info',
            message: f.message,
            advice: f.advice,
            sessionId: f.sessionId,
            sessionRequestId: f.sessionRequestId,
          });
        }
      } catch (err) {
        // Rule failure is itself a critical finding
        findings.push({
          id: `error-${rule.id}`,
          ruleId: rule.id,
          severity: 'critical',
          message: `Rule execution failed: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }

    const metrics = computeMetrics(ctx, findings);

    return { findings, metrics };
  }
}
