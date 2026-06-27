import { RollbackConfig } from '../rollback/RollbackMonitor';

export interface SPLPhase3Config {
  splInfluenceEnabled: boolean;
  splShadowOnly: boolean;
  shadowModeEnabled: boolean;
  abTestingEnabled: boolean;
  promotionGateEnabled: boolean;
  rollbackConfig: RollbackConfig;
  controlCohortPct: number;
  treatmentCohortPct: number;
  shadowLatencyBudgetMs: number;
  shadowDivergenceThreshold: number;
}

export interface SPLPhase3ConfigManager {
  getConfig(): SPLPhase3Config;
  setConfig(config: Partial<SPLPhase3Config>): void;
  getRollbackConfig(): RollbackConfig;
  setRollbackConfig(config: Partial<RollbackConfig>): void;
  disableInfluence(): void;
  enableShadowMode(): void;
}
