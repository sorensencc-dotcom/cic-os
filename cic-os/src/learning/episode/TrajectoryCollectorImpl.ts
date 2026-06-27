import { Trajectory, TrajectoryCollector } from './Trajectory';
import { Episode } from './Episode';

export class TrajectoryCollectorImpl implements TrajectoryCollector {
  private trajectories: Map<string, Episode[]> = new Map();

  startTrajectory(): string {
    const id = `traj_${Date.now()}_${Math.random()}`;
    this.trajectories.set(id, []);
    return id;
  }

  appendEpisode(trajectoryId: string, episode: Episode): void {
    const episodes = this.trajectories.get(trajectoryId) || [];
    episodes.push(episode);
    this.trajectories.set(trajectoryId, episodes);
  }

  finalize(trajectoryId: string): Trajectory {
    const episodes = this.trajectories.get(trajectoryId) || [];
    const cumulativeReward = episodes.reduce(
      (sum, ep) => sum + ep.totalReward,
      0
    );

    return {
      trajectoryId,
      episodes,
      cumulativeReward,
      policyVersion: 'π_v0',
    };
  }
}
