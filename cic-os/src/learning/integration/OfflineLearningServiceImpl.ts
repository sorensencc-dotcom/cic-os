import { OfflineLearningService, OfflineLearningServiceConfig } from './OfflineLearningService';
import { PolicyNetwork } from '../policy/PolicyNetwork';
import { PolicyNetworkImpl } from '../policy/PolicyNetworkImpl';

export class OfflineLearningServiceImpl implements OfflineLearningService {
  private policy: PolicyNetwork = new PolicyNetworkImpl();
  private running = false;

  start(config: OfflineLearningServiceConfig): void {
    this.running = true;
  }

  stop(): void {
    this.running = false;
  }

  trainNewPolicy(): PolicyNetwork {
    return this.policy;
  }

  getCurrentPolicy(): PolicyNetwork {
    return this.policy;
  }
}
