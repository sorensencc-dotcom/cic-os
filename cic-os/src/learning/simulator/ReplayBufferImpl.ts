import { ReplayBuffer, PrioritizedReplayBuffer } from './ExperienceReplay';
import { Episode } from '../episode/Episode';

export class ReplayBufferImpl implements ReplayBuffer {
  private buffer: Episode[] = [];

  push(episode: Episode): void {
    this.buffer.push(episode);
  }

  sample(batchSize: number): Episode[] {
    return this.buffer.slice(0, batchSize);
  }

  size(): number {
    return this.buffer.length;
  }

  clear(): void {
    this.buffer = [];
  }
}

export class PrioritizedReplayBufferImpl implements PrioritizedReplayBuffer {
  private buffer: Map<string, Episode> = new Map();
  private priorities: Map<string, number> = new Map();

  push(episode: Episode, priority: number): void {
    this.buffer.set(episode.episodeId, episode);
    this.priorities.set(episode.episodeId, priority);
  }

  sample(batchSize: number): Episode[] {
    return Array.from(this.buffer.values()).slice(0, batchSize);
  }

  updatePriorities(
    episodeIds: string[],
    priorities: number[]
  ): void {
    episodeIds.forEach((id, idx) => {
      this.priorities.set(id, priorities[idx]);
    });
  }
}
