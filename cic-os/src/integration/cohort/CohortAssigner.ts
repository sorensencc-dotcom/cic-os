export type CohortType = 'control' | 'treatment';

export interface CohortAssignment {
  taskId: string;
  cohort: CohortType;
  assignedAt: number;
}

export interface CohortAssigner {
  assignCohort(taskId: string): CohortAssignment;
  validateDistribution(assignments: CohortAssignment[]): { controlPct: number; treatmentPct: number };
  isCohortConsistent(taskId: string): boolean;
}
