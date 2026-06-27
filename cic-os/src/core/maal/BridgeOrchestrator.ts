import { MAALRouter } from './MAALRouter';
import { ShadowModeHook } from '../../integration/hooks/ShadowModeHook';
import { ABTestHook } from '../../integration/hooks/ABTestHook';

export interface MAARLRouterDependency {
  maalRouter: MAALRouter;
  shadowModeHook?: ShadowModeHook;
  abTestHook?: ABTestHook;
}
