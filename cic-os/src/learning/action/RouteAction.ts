export type RouteActionType =
  | "SELECT_MODEL"
  | "USE_FALLBACK"
  | "DEFER_TO_HUMAN"
  | "QUEUE_FOR_BATCH";

export interface RouteAction {
  actionType: RouteActionType;
  modelId?: string;
  fallbackEdgeId?: string;
  reason?: string;
}
