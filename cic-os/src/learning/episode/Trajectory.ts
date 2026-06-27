import { Episode } from './Episode';

export interface Trajectory {
  trajectoryId: string;
  episodes: Episode[];
  cumulativeReward: number;
  policyVersion: string;
}

export interface TrajectoryCollector {
  startTrajectory(): string;
  appendEpisode(trajectoryId: string, episode: Episode): void;
  finalize(trajectoryId: string): Trajectory;
}
