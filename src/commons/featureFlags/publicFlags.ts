import { flagDirectoryModulesUrl } from 'src/features/directory/flagDirectoryModulesUrl';

import { flagConductorEnable } from '../../features/conductor/flagConductorEnable';
import { flagDirectoryLanguageUrl } from '../../features/directory/flagDirectoryLanguageUrl';
import { flagDirectoryPluginUrl } from '../../features/directory/flagDirectoryPluginUrl';
import { flagConductorEv3Enable } from '../../features/remoteExecutionConductor/flagConductorEv3Enable';
import { FeatureFlag } from './FeatureFlag';

export const publicFlags: FeatureFlag<any>[] = [
  flagConductorEnable,
  flagConductorEv3Enable,
  flagDirectoryLanguageUrl,
  flagDirectoryPluginUrl,
  flagDirectoryModulesUrl,
];
