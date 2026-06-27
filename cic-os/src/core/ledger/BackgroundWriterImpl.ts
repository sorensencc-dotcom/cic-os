import { BackgroundWriter } from './BackgroundWriter';

export class BackgroundWriterImpl implements BackgroundWriter {
  private running = false;

  start(): void {
    this.running = true;
  }

  stop(): void {
    this.running = false;
  }

  async flush(): Promise<void> {
    return Promise.resolve();
  }
}
