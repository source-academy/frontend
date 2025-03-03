import { useTypedSelector } from '../utils/Hooks';
import { FeatureFlag } from './FeatureFlag';

export function useFeature<T>(featureFlag: FeatureFlag<T>): T {
  const { flagName, defaultValue } = featureFlag;
  const flagValue = useTypedSelector(state => state.featureFlags.modifiedFlags[flagName]);
  return flagValue ?? defaultValue;
}
