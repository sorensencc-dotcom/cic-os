import { LedgerEventConsumer } from './LedgerEventConsumer';
import { LedgerEvent } from '../../core/ledger/LedgerEvent';
import { RouteState } from '../state/RouteState';
import { RouteOutcome } from '../reward/RouteOutcome';
import { RouteStateFactoryImpl } from '../state/RouteStateFactoryImpl';
import { TaskFingerprintFactory } from '../../core/maal/TaskFingerprintFactory';

export class LedgerEventConsumerImpl implements LedgerEventConsumer {
  private stateFactory = new RouteStateFactoryImpl();

  consumeEvents(
    since: number,
    limit: number
  ): RouteState[] {
    const fingerprint = TaskFingerprintFactory.compute(undefined);
    return [this.stateFactory.build(fingerprint)];
  }

  extractOutcome(event: LedgerEvent): RouteOutcome {
    return {
      modelId: 'claude-3-5-sonnet',
      success: true,
      actualLatencyMs: 1000,
      actualCost: 0.05,
      outputQuality: 0.95,
      timestamp: event.timestamp,
    };
  }
}
