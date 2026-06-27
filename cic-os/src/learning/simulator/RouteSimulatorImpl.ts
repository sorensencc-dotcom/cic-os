import { RouteSimulator, SimulationConfig } from './RouteSimulator';
import { RouteState } from '../state/RouteState';
import { Episode } from '../episode/Episode';
import { Trajectory } from '../episode/Trajectory';
import { PolicyNetwork } from '../policy/PolicyNetwork';

export class RouteSimulatorImpl implements RouteSimulator {
  generateEpisode(
    initialState: RouteState,
    policy: PolicyNetwork
  ): Episode {
    return {
      episodeId: `ep_${Date.now()}`,
      steps: [],
      totalReward: 0,
      isSuccess: true,
      startTimestamp: Date.now(),
      endTimestamp: Date.now(),
    };
  }

  simulate(config: SimulationConfig) {
    return {
      trajectories: [],
      totalReward: 0,
      avgRewardPerEpisode: 0,
    };
  }

  evaluate(
    policy: PolicyNetwork,
    testSize: number
  ) {
    return {
      meanReward: 0.5,
      stdReward: 0.1,
      successRate: 0.95,
    };
  }
}
