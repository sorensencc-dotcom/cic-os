import { Request, Response } from 'express';
import { loadRuleContext } from '../context/loader';
import { extractSkills } from '../skills';

export async function getSkillDetections(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string;
    const workspace = req.query.workspace as string;
    const windowStart = req.query.windowStart as string;
    const windowEnd = req.query.windowEnd as string;
    const minConfidence = parseFloat((req.query.minConfidence as string) || '0.6');

    if (!userId || !workspace) {
      return res.status(400).json({ error: 'userId and workspace are required' });
    }

    // Load context for the specified window (default: 24h)
    const start = windowStart
      ? new Date(windowStart)
      : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const end = windowEnd
      ? new Date(windowEnd)
      : new Date();

    const ctx = await loadRuleContext({
      userId,
      workspace,
      windowStart: start,
      windowEnd: end,
    });

    // Extract skills using substrate-side detection
    const allSkills = extractSkills(ctx);

    // Filter by confidence threshold
    const filtered = allSkills.filter(s => s.confidence >= minConfidence);

    // Build response with adoption recommendations
    const skills = filtered.map(s => ({
      promptHash: s.promptHash,
      frequency: s.frequency,
      stabilityScore: (s.stabilityScore * 100).toFixed(0) + '%',
      confidence: (s.confidence * 100).toFixed(0) + '%',
      sessionClusters: s.sessionClusters,
      avgContextCoverage: (s.avgContextCoverage * 100).toFixed(0) + '%',
      avgContextFreshness: (s.avgContextFreshness * 100).toFixed(0) + '%',
      avgTokensIn: Math.round(s.avgTokensIn),
      avgTokensOut: Math.round(s.avgTokensOut),
      successRate: (s.successRate * 100).toFixed(0) + '%',
      recommendation: s.recommendation,
    }));

    return res.json({
      count: skills.length,
      windowStart: start.toISOString(),
      windowEnd: end.toISOString(),
      skills,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to extract skills', details: message });
  }
}
