import { RouteState } from '../state/RouteState';

export interface PolicyNetworkWeights {
  version: string;
  parameters: Record<string, unknown>;
  trainedAt: number;
  trainingIterations: number;
}

export interface PolicyNetwork {
  forward(state: RouteState): {
    actionLogits: number[];
    entropy: number;
  };
  updateWeights(gradient: Record<string, unknown>): void;
  getWeights(): PolicyNetworkWeights;
  loadWeights(weights: PolicyNetworkWeights): void;
}
