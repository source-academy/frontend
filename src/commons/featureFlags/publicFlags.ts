import { flagConductorEnable } from '../../features/conductor/flagConductorEnable';
import { flagConductorEvaluatorUrl } from '../../features/conductor/flagConductorEvaluatorUrl';
import { flagLangDirUrl } from '../directory/flagLangDirUrl';
import { FeatureFlag } from './FeatureFlag';

export const publicFlags: FeatureFlag<any>[] = [
  flagConductorEnable,
  flagConductorEvaluatorUrl,
  flagLangDirUrl
];
