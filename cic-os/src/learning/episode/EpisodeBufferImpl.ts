import { Episode, EpisodeBuffer } from './Episode';

export class EpisodeBufferImpl implements EpisodeBuffer {
  private buffer: Episode[] = [];

  append(episode: Episode): void {
    this.buffer.push(episode);
  }

  sample(batchSize: number): Episode[] {
    return this.buffer.slice(0, batchSize);
  }

  size(): number {
    return this.buffer.length;
  }
}
