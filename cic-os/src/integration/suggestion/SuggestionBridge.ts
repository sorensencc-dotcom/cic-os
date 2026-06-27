import { RouteAction } from '../../learning/action/RouteAction';
import { RoutingConstraints } from '../../core/maal/ConstraintEngine';

export interface MAALValidationResult {
  accepted: boolean;
  modifications?: Partial<RouteAction>;
  rejectionReason?: string;
}

export interface SuggestionBridge {
  proposeSplAction(state: any): RouteAction;
  validateWithMARL(proposal: RouteAction, constraints: RoutingConstraints): MAALValidationResult;
  applyMAALValidation(proposal: RouteAction, validation: MAALValidationResult): RouteAction;
}
