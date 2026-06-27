export interface RoutingConstraints {
  maxCost: number;
  maxLatencyMs: number;
  allowedModels: string[];
  disallowedModels: string[];
}

export interface ConstraintEngine {
  derive(input: unknown): RoutingConstraints;
}
