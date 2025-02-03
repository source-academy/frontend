import { featureConductor } from "src/features/conductor/featureConductor";
import { FeatureFlag } from "./FeatureFlag";

export const publicFlags: FeatureFlag<any>[] = [
    featureConductor
];
