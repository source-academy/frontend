import { useSelector } from "react-redux";
import { OverallState } from "../application/ApplicationTypes";
import { FeatureFlag } from "./FeatureFlag";

export function useFeature<T>(featureFlag: FeatureFlag<T>) {
    const [flag, defaultValue] = featureFlag;
    const flagValue = useSelector<OverallState, T | undefined>(state => state.featureFlags.modifiedFlags[flag]);
    return flagValue ?? defaultValue;
}
