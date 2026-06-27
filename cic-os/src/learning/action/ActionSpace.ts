import { RouteAction } from './RouteAction';

export interface ActionSpace {
  enumModelIds(): string[];
  enumFallbackEdges(): string[];
  isValid(action: RouteAction): boolean;
}
