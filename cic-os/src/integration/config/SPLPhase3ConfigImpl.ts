import { SPLPhase3ConfigManager, SPLPhase3Config } from './SPLPhase3Config';
import { RollbackConfig } from '../rollback/RollbackMonitor';

export class SPLPhase3ConfigImpl implements SPLPhase3ConfigManager {
  private config: SPLPhase3Config = {
    splInfluenceEnabled: false,
    splShadowOnly: true,
    shadowModeEnabled: true,
    abTestingEnabled: true,
    promotionGateEnabled: true,
    rollbackConfig: {
      latencyThresholdMs: 50,
      driftThresholdPct: 5,
      costThresholdPct: 10,
      latencyThresholdPct: 10,
      correctnessThresholdPct: 5,
      rejectionRateThreshold: 0.3,
    },
    controlCohortPct: 90,
    treatmentCohortPct: 10,
    shadowLatencyBudgetMs: 20,
    shadowDivergenceThreshold: 0.15,
  };

  getConfig(): SPLPhase3Config {
    return { ...this.config };
  }

  setConfig(config: Partial<SPLPhase3Config>): void {
    this.config = { ...this.config, ...config };
  }

  getRollbackConfig(): RollbackConfig {
    return { ...this.config.rollbackConfig };
  }

  setRollbackConfig(config: Partial<RollbackConfig>): void {
    this.config.rollbackConfig = { ...this.config.rollbackConfig, ...config };
  }

  disableInfluence(): void {
    this.config.splInfluenceEnabled = false;
  }

  enableShadowMode(): void {
    this.config.shadowModeEnabled = true;
  }
}
