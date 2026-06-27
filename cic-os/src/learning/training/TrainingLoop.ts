import { PolicyNetwork } from '../policy/PolicyNetwork';

export interface TrainingConfig {
  maxEpochs: number;
  targetMetric: "meanReward" | "successRate" | "costEfficiency";
  targetThreshold: number;
  earlyStoppingPatience: number;
}

export interface TrainingMetrics {
  epoch: number;
  trainingLoss: number;
  trainingReward: number;
  evalReward: number;
  evalSuccessRate: number;
  policyVersion: string;
  timestamp: number;
}

export interface TrainingLoop {
  run(
    config: TrainingConfig
  ): {
    finalPolicy: PolicyNetwork;
    metrics: TrainingMetrics[];
    converged: boolean;
  };
  checkpoint(policy: PolicyNetwork, metrics: TrainingMetrics): void;
  loadBestPolicy(targetMetric: string): PolicyNetwork;
}
