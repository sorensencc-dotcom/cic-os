import { AgenticMetrics } from './types';

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
