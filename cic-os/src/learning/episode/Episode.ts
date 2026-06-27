import { RouteState } from '../state/RouteState';
import { RouteAction } from '../action/RouteAction';
import { RewardSignal } from '../reward/RewardSignal';

export interface Step {
  state: RouteState;
  action: RouteAction;
  reward: RewardSignal;
  nextState: RouteState;
}

export interface Episode {
  episodeId: string;
  steps: Step[];
  totalReward: number;
  isSuccess: boolean;
  startTimestamp: number;
  endTimestamp: number;
}

export interface EpisodeBuffer {
  append(episode: Episode): void;
  sample(batchSize: number): Episode[];
  size(): number;
}
