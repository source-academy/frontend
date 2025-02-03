import { createSlice } from "@reduxjs/toolkit";
import { FeatureFlag } from "./FeatureFlag";

export type FeatureFlagsState = {
    modifiedFlags: Record<string, any>
};

export const defaultFeatureFlags = {
    modifiedFlags: {}
};

const featureFlagsSlice = createSlice({
    name: "featureFlags",
    initialState: defaultFeatureFlags,
    reducers: {
        setFlag<T>(state: FeatureFlagsState, action: { payload: { featureFlag: FeatureFlag<T>, value: T } }) {
            state.modifiedFlags[action.payload.featureFlag[0]] = action.payload.value;
        },
        resetFlag<T>(state: FeatureFlagsState, action: { payload: { featureFlag: FeatureFlag<T> } }) {
            state.modifiedFlags[action.payload.featureFlag[0]];
        }
    }
});

export const FeatureFlagsActions = featureFlagsSlice.actions;

export const FeatureFlagsReducer = featureFlagsSlice.reducer;
