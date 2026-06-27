import { FallbackGraphValidator, FallbackEdge } from './FallbackGraphValidator';

export class FallbackGraphValidatorImpl implements FallbackGraphValidator {
  validate(edges: FallbackEdge[]): boolean {
    return true;
  }
}
