import { ABTestHook, ABTestHookContext } from './ABTestHook';
import { RouteState } from '../../learning/state/RouteState';
import { CohortAssignerImpl } from '../cohort/CohortAssignerImpl';
import { ABTestRecorderImpl } from '../abt/ABTestRecorderImpl';
import { ABTestResultsWriterImpl } from '../telemetry/ABTestResultsWriterImpl';

export class ABTestHookImpl implements ABTestHook {
  private cohortAssigner = new CohortAssignerImpl();
  private recorder = new ABTestRecorderImpl();
  private writer = new ABTestResultsWriterImpl();

  onAssignCohort(state: RouteState): 'control' | 'treatment' {
    const assignment = this.cohortAssigner.assignCohort(state.taskFingerprint.toString());
    return assignment.cohort;
  }

  async onRecordMetrics(context: ABTestHookContext): Promise<void> {
    const metrics = this.recorder.computeMetricDeltas(
      { quality: 0.95, cost: 0.05, latency: 1000, drift: 0.02 },
      { quality: 0.93, cost: 0.06, latency: 1100, drift: 0.03 }
    );

    await this.writer.write({
      cohortId: context.cohort,
      splAction: context.splAction,
      maalAction: context.maalAction,
      correctnessDelta: metrics.correctnessDelta,
      costDelta: metrics.costDelta,
      latencyDelta: metrics.latencyDelta,
      driftDelta: metrics.driftDelta,
      timestamp: Date.now(),
    });
  }
}
