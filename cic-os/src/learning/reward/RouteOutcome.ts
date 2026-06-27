export interface RouteOutcome {
  modelId: string;
  success: boolean;
  actualLatencyMs: number;
  actualCost: number;
  outputQuality?: number;
  timestamp: number;
}
