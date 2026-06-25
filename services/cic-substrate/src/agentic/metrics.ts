import { AgenticMetrics } from './types';
import { RuleContext, RuleFinding } from './rules/types';

export interface AgenticMetricsClient {
  getAgenticMetrics(
    userId: string,
    workspace: string,
    window?: { start?: string; end?: string }
  ): Promise<AgenticMetrics | null>;
}

export function createAgenticMetricsClient(): AgenticMetricsClient {
  return {
    async getAgenticMetrics(userId, workspace, window) {
      // Mocked metrics for v1, CIC will eventually pull this from TorqueQuery MCP
      return {
        userId,
        workspace,
        windowStart: window?.start ?? '',
        windowEnd: window?.end ?? '',
        promptDiscipline: 0.78,
        contextHealth: 0.86,
        reviewRigor: 0.91,
        skillReuse: 0.73,
        driftIndex: 0.18,
        readinessIndex: 0.84,
      };
    },
  };
}

export function computeMetrics(ctx: RuleContext, findings: RuleFinding[]): AgenticMetrics {
  const requests = ctx.requests;
  const contexts = ctx.contexts;
  const reviews = ctx.reviews;

  // --- 1. Prompt Discipline ---
  const largeOutputs = requests.filter(r => r.tokensOut > 1500).length;
  const unreviewedLarge = findings.filter(f => f.ruleId === 'large-output-without-review').length;
  const errorRate = requests.filter(r => r.status !== 'ok').length / Math.max(1, requests.length);

  const promptDiscipline = clamp(
    1 -
      (0.4 * (unreviewedLarge / Math.max(1, largeOutputs))) -
      (0.3 * errorRate)
  );

  // --- 2. Context Health ---
  const avgCoverage =
    contexts.reduce((sum, c) => sum + c.coverageScore, 0) /
    Math.max(1, contexts.length);

  const avgFreshness =
    contexts.reduce((sum, c) => sum + c.freshnessScore, 0) /
    Math.max(1, contexts.length);

  const contextHealth = clamp((avgCoverage + avgFreshness) / 2);

  // --- 3. Review Rigor ---
  const reviewed = reviews.length;
  const reviewRate = reviewed / Math.max(1, requests.length);

  const avgDiff =
    reviews.reduce((sum, r) => sum + r.diffSizeLines, 0) /
    Math.max(1, reviews.length);

  const avgComments =
    reviews.reduce((sum, r) => sum + r.commentsCount, 0) /
    Math.max(1, reviews.length);

  const reviewRigor = clamp(
    0.6 * reviewRate +
      0.2 * normalize(avgDiff, 0, 200) +
      0.2 * normalize(avgComments, 0, 20)
  );

  // --- 4. Skill Reuse ---
  const hashCounts = new Map<string, number>();
  for (const r of requests) {
    hashCounts.set(r.promptHash, (hashCounts.get(r.promptHash) || 0) + 1);
  }

  const repeatedHashes = [...hashCounts.values()].filter(c => c > 1).length;
  const skillReuse = clamp(repeatedHashes / Math.max(1, hashCounts.size));

  // --- 5. Drift Index ---
  const violationRate = findings.length / Math.max(1, requests.length);

  const driftIndex = clamp(
    0.5 * violationRate +
      0.3 * errorRate +
      0.2 * (1 - contextHealth)
  );

  // --- 6. Readiness Index ---
  const readinessIndex = clamp(
    0.4 * promptDiscipline +
      0.3 * contextHealth +
      0.2 * reviewRigor +
      0.1 * skillReuse -
      0.5 * driftIndex
  );

  return {
    promptDiscipline,
    contextHealth,
    reviewRigor,
    skillReuse,
    driftIndex,
    readinessIndex,
  };
}

// --- Helpers ---
function clamp(n: number) {
  return Math.max(0, Math.min(1, n));
}

function normalize(value: number, min: number, max: number) {
  if (max === min) return 0;
  return clamp((value - min) / (max - min));
}
