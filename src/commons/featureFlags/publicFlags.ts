import { flagConductorEnable } from '../../features/conductor/flagConductorEnable';
import { flagConductorEvaluatorUrl } from '../../features/conductor/flagConductorEvaluatorUrl';
import { FeatureFlag } from './FeatureFlag';

export const publicFlags: FeatureFlag<any>[] = [flagConductorEnable, flagConductorEvaluatorUrl];
