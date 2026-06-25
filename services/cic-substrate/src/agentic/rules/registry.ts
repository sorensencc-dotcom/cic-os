import { AgenticRule } from './types';

export const ruleRegistry: AgenticRule[] = [
  // Example placeholder rule
  {
    id: 'large-output-without-review',
    description: 'Large model outputs should be reviewed',
    evaluate(ctx) {
      return ctx.requests
        .filter(r => r.tokensOut > 1500)
        .filter(r => !ctx.reviews.some(rv => rv.sessionRequestId === r.id))
        .map(r => ({
          id: `finding-${r.id}`,
          ruleId: 'large-output-without-review',
          severity: 'high',
          message: `Large output (${r.tokensOut} tokens) without review`,
          sessionRequestId: r.id,
        }));
    },
  },
];
