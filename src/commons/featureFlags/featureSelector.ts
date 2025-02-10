import { OverallState } from '../application/ApplicationTypes';

export const featureSelector = (flagName: string) => (state: OverallState) =>
  state.featureFlags.modifiedFlags[flagName];
