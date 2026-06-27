import { ShadowDecisionsWriter } from './ShadowDecisionsWriter';
import { ShadowDecision } from '../shadow/ShadowRoutingMonitor';

export class ShadowDecisionsWriterImpl implements ShadowDecisionsWriter {
  private buffer: ShadowDecision[] = [];

  async write(decision: ShadowDecision): Promise<void> {
    this.buffer.push(decision);
  }

  async writeBatch(decisions: ShadowDecision[]): Promise<void> {
    this.buffer.push(...decisions);
  }

  async flush(): Promise<void> {
    this.buffer = [];
  }
}
