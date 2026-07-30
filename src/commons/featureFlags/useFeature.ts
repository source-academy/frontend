import { useAppSelector } from '../utils/Hooks';
import { FeatureFlag } from './FeatureFlag';

export function useFeature<T>(featureFlag: FeatureFlag<T>): T {
  const { flagName, defaultValue, lockedValue } = featureFlag;
  const flagValue = useAppSelector(state => state.featureFlags.modifiedFlags[flagName]);
  return lockedValue ?? flagValue ?? defaultValue;
}
