import { flagConductorEnable } from '../../features/conductor/flagConductorEnable';
import { flagConductorEvaluatorUrl } from '../../features/conductor/flagConductorEvaluatorUrl';
import { flagLanguageDirectoryEnable } from '../../features/languageDirectory/flagLanguageDirectory';
import { FeatureFlag } from './FeatureFlag';

export const publicFlags: FeatureFlag<any>[] = [
  flagConductorEnable,
  flagConductorEvaluatorUrl,
  flagLanguageDirectoryEnable
];
