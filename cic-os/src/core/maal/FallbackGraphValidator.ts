export interface FallbackEdge {
  from: string;
  to: string;
  onFailureCode: string;
}

export interface FallbackGraphValidator {
  validate(edges: FallbackEdge[]): boolean;
}
