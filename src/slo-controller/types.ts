/**
 * SLO Controller Types
 * Workstream B: SLO Controller + Prometheus Integration
 */

export interface SLORule {
  id: string;
  name: string;
  metric: 'latency' | 'error_rate' | 'saturation';
  target: number; // target value (e.g., 99.9 for 99.9%)
  window: number; // time window in seconds
  burnRateThreshold: number; // multiplier (e.g., 2 = 2x burn rate)
}

export interface Metrics {
  latency: LatencyMetrics;
  errorRate: ErrorRateMetrics;
  saturation: SaturationMetrics;
}

export interface LatencyMetrics {
  p50: number;
  p95: number;
  p99: number;
  mean: number;
}

export interface ErrorRateMetrics {
  total: number;
  failed: number;
  rate: number; // percentage 0-100
}

export interface SaturationMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  connectionCount: number;
}

export interface BurnRateResult {
  sloId: string;
  currentBurnRate: number;
  threshold: number;
  isViolating: boolean;
  remainingBudget: number;
  estimatedBudgetExhaustion: Date | null;
}

export interface SLOViolationEvent {
  timestamp: Date;
  sloId: string;
  metric: string;
  value: number;
  threshold: number;
  burnRate: number;
  severity: 'warning' | 'critical';
}
