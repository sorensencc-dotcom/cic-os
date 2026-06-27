import { TaskFingerprint } from './TaskFingerprint';
import { MAALRoutingOutput } from './MAALRoutingOutput';

export interface MAALRouter {
  route(
    fingerprint: TaskFingerprint,
    input: unknown
  ): MAALRoutingOutput;
}
