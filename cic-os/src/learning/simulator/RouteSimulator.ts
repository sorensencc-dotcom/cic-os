import { RouteState } from '../state/RouteState';
import { Episode } from '../episode/Episode';
import { Trajectory } from '../episode/Trajectory';
import { PolicyNetwork } from '../policy/PolicyNetwork';

export interface SimulationConfig {
  maxEpisodesPerTrajectory: number;
  maxStepsPerEpisode: number;
  warmupEpisodes: number;
  evalFrequency: number;
}

export interface RouteSimulator {
  generateEpisode(
    initialState: RouteState,
    policy: PolicyNetwork
  ): Episode;
  simulate(
    config: SimulationConfig
  ): {
    trajectories: Trajectory[];
    totalReward: number;
    avgRewardPerEpisode: number;
  };
  evaluate(
    policy: PolicyNetwork,
    testSize: number
  ): {
    meanReward: number;
    stdReward: number;
    successRate: number;
  };
}
