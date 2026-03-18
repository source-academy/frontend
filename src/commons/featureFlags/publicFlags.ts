import { flagConductorEnable } from '../../features/conductor/flagConductorEnable';
import { flagConductorEvaluatorUrl } from '../../features/conductor/flagConductorEvaluatorUrl';
import { flagDirectoryLanguageEnable } from '../../features/directory/flagDirectoryLanguageEnable';
import { flagDirectoryLanguageUrl } from '../../features/directory/flagDirectoryLanguageUrl';
import { flagDirectoryPluginUrl } from '../../features/directory/flagDirectoryPluginUrl';
import { FeatureFlag } from './FeatureFlag';

export const publicFlags: FeatureFlag<any>[] = [
  flagConductorEnable,
  flagConductorEvaluatorUrl,
  flagDirectoryLanguageEnable,
  flagDirectoryLanguageUrl,
  flagDirectoryPluginUrl
];
