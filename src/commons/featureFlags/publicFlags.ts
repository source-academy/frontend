import { flagConductorEnable } from 'src/features/conductor/flagConductorEnable';
import { flagConductorEvaluatorUrl } from 'src/features/conductor/flagConductorEvaluatorUrl';

import { FeatureFlag } from './FeatureFlag';

export const publicFlags: FeatureFlag<any>[] = [flagConductorEnable, flagConductorEvaluatorUrl];
