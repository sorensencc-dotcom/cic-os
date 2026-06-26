import { EnforcementEngine } from '../enforcement-engine';
import { SLOController } from '../slo-controller';

jest.mock('../slo-controller');
jest.mock('../canary-abort');
jest.mock('../canary-rollback');

describe('EnforcementEngine', () => {
  let engine: EnforcementEngine;
  let controller: jest.Mocked<SLOController>;

  beforeEach(() => {
    controller = new SLOController() as jest.Mocked<SLOController>;
    engine = new EnforcementEngine(controller);
  });

  test('enforce returns none when no violations', async () => {
    controller.evaluate = jest.fn().mockResolvedValue([
      {
        sloId: 'test',
        currentBurnRate: 5,
        threshold: 14,
        isViolating: false,
        remainingBudget: 100,
        estimatedBudgetExhaustion: null,
      },
    ]);

    const action = await engine.enforce();

    expect(action.type).toBe('none');
    expect(action.reason).toBe('all_slos_healthy');
  });

  test('enforce returns rollback on critical violation', async () => {
    controller.evaluate = jest.fn().mockResolvedValue([
      {
        sloId: 'latency_p99',
        currentBurnRate: 20,
        threshold: 14,
        isViolating: true,
        remainingBudget: 10,
        estimatedBudgetExhaustion: new Date(),
      },
    ]);

    const action = await engine.enforce();

    expect(action.type).toMatch(/rollback|abort/);
  });

  test('enforce respects abort cooldown', async () => {
    controller.evaluate = jest.fn().mockResolvedValue([
      {
        sloId: 'test',
        currentBurnRate: 20,
        threshold: 14,
        isViolating: true,
        remainingBudget: 10,
        estimatedBudgetExhaustion: new Date(),
      },
    ]);

    // First call triggers abort
    const action1 = await engine.enforce();
    expect(action1.type).toMatch(/rollback|abort/);

    // Second call immediately after respects cooldown
    const action2 = await engine.enforce();
    expect(action2.reason).toBe('abort_cooldown_active');
  });
});
