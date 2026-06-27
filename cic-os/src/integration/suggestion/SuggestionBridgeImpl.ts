import { SuggestionBridge, MAALValidationResult } from './SuggestionBridge';
import { RouteAction } from '../../learning/action/RouteAction';
import { RoutingConstraints } from '../../core/maal/ConstraintEngine';

export class SuggestionBridgeImpl implements SuggestionBridge {
  proposeSplAction(state: any): RouteAction {
    return {
      actionType: 'SELECT_MODEL',
      modelId: 'claude-3-5-sonnet',
      reason: 'spl proposal',
    };
  }

  validateWithMARL(proposal: RouteAction, constraints: RoutingConstraints): MAALValidationResult {
    if (!proposal.modelId) {
      return {
        accepted: false,
        rejectionReason: 'No model specified',
      };
    }

    if (constraints.disallowedModels && constraints.disallowedModels.includes(proposal.modelId)) {
      return {
        accepted: false,
        rejectionReason: 'Model disallowed by constraints',
      };
    }

    return {
      accepted: true,
      modifications: undefined,
    };
  }

  applyMAALValidation(proposal: RouteAction, validation: MAALValidationResult): RouteAction {
    if (!validation.accepted) {
      return {
        actionType: 'DEFER_TO_HUMAN',
        reason: validation.rejectionReason || 'maal rejected spl proposal',
      };
    }

    if (validation.modifications) {
      return {
        ...proposal,
        ...validation.modifications,
      };
    }

    return proposal;
  }
}
