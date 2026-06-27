import { CohortAssigner, CohortAssignment, CohortType } from './CohortAssigner';

export class CohortAssignerImpl implements CohortAssigner {
  private assignments: Map<string, CohortAssignment> = new Map();

  assignCohort(taskId: string): CohortAssignment {
    if (this.assignments.has(taskId)) {
      return this.assignments.get(taskId)!;
    }

    const hash = this.hashTaskId(taskId) % 100;
    const cohort: CohortType = hash < 90 ? 'control' : 'treatment';

    const assignment: CohortAssignment = {
      taskId,
      cohort,
      assignedAt: Date.now(),
    };

    this.assignments.set(taskId, assignment);
    return assignment;
  }

  validateDistribution(assignments: CohortAssignment[]): { controlPct: number; treatmentPct: number } {
    const controlCount = assignments.filter((a) => a.cohort === 'control').length;
    const treatmentCount = assignments.filter((a) => a.cohort === 'treatment').length;
    const total = assignments.length;

    return {
      controlPct: (controlCount / total) * 100,
      treatmentPct: (treatmentCount / total) * 100,
    };
  }

  isCohortConsistent(taskId: string): boolean {
    return this.assignments.has(taskId);
  }

  private hashTaskId(taskId: string): number {
    let hash = 0;
    for (let i = 0; i < taskId.length; i++) {
      hash = (hash << 5) - hash + taskId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}
