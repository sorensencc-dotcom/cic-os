export type RoutingRegime = "local_only" | "hybrid" | "remote_allowed";

export interface RoutingRegimeSelector {
  select(input: unknown): RoutingRegime;
}
