import { RouteState } from './RouteState';

export interface StateVector {
  features: number[];
  featureNames: string[];
}

export interface StateFeaturizer {
  featurize(state: RouteState): StateVector;
  stateSpaceDim(): number;
}
