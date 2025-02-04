import { SagaIterator } from "redux-saga";
import { select } from "redux-saga/effects";

import { FeatureFlag } from "./FeatureFlag";

export function* selectFeature<T>(featureFlag: FeatureFlag<T>): SagaIterator<T> {
    const [flag, defaultValue] = featureFlag;
    const flagValue = yield select(state => state.featureFlags.modifiedFlags[flag]);
    return flagValue ?? defaultValue;
}
