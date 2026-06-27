import { StateFeaturizer, StateVector } from './StateFeaturizer';
import { RouteState } from './RouteState';

export class StateFeaturizerImpl implements StateFeaturizer {
  private dim = 10;

  featurize(state: RouteState): StateVector {
    const features = [
      state.systemLoad,
      state.costBudgetRemaining,
      state.latencyBudgetRemaining,
      state.taskFingerprint.complexityBucket / 5,
      state.taskFingerprint.tokenBucket / 6,
      state.recentModelPerformance[0]?.successRate ?? 0.9,
      state.recentModelPerformance[0]?.avgLatencyMs ?? 1000 / 5000,
      state.recentModelPerformance[0]?.avgCost ?? 0.05 / 0.1,
      Math.random(),
      Math.random(),
    ];

    return {
      features,
      featureNames: [
        'systemLoad',
        'costBudgetRemaining',
        'latencyBudgetRemaining',
        'complexityNorm',
        'tokenBucketNorm',
        'successRate',
        'latencyNorm',
        'costNorm',
        'noise1',
        'noise2',
      ],
    };
  }

  stateSpaceDim(): number {
    return this.dim;
  }
}
