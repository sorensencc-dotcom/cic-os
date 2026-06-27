import { ShadowDecision } from '../shadow/ShadowRoutingMonitor';

export interface ShadowDecisionsWriter {
  write(decision: ShadowDecision): Promise<void>;
  writeBatch(decisions: ShadowDecision[]): Promise<void>;
  flush(): Promise<void>;
}
