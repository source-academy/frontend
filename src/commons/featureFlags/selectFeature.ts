import { select } from "redux-saga/effects";
import { FeatureFlag } from "./FeatureFlag";
import { SagaIterator } from "redux-saga";

export function* selectFeature<T>(featureFlag: FeatureFlag<T>): SagaIterator<T> {
    const [flag, defaultValue] = featureFlag;
    const flagValue = yield select(state => state.featureFlags.modifiedFlags[flag]);
    return flagValue ?? defaultValue;
}
