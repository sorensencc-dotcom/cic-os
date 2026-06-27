import { Episode } from '../episode/Episode';

export interface ReplayBuffer {
  push(episode: Episode): void;
  sample(batchSize: number): Episode[];
  size(): number;
  clear(): void;
}

export interface PrioritizedReplayBuffer {
  push(episode: Episode, priority: number): void;
  sample(batchSize: number): Episode[];
  updatePriorities(
    episodeIds: string[],
    priorities: number[]
  ): void;
}
