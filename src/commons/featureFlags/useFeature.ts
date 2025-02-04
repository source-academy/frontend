import { useTypedSelector } from "../utils/Hooks";
import { FeatureFlag } from "./FeatureFlag";

export function useFeature<T>(featureFlag: FeatureFlag<T>) {
    const [flag, defaultValue] = featureFlag;
    const flagValue = useTypedSelector(state => state.featureFlags.modifiedFlags[flag]);
    return flagValue ?? defaultValue;
}
