import { flagDirectoryModulesUrl } from 'src/features/directory/flagDirectoryModulesUrl';

import { flagDirectoryLanguageUrl } from '../../features/directory/flagDirectoryLanguageUrl';
import { flagDirectoryPluginUrl } from '../../features/directory/flagDirectoryPluginUrl';
import { FeatureFlag } from './FeatureFlag';

export const publicFlags: FeatureFlag<any>[] = [
  flagDirectoryLanguageUrl,
  flagDirectoryPluginUrl,
  flagDirectoryModulesUrl,
];
