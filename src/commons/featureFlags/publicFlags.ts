import { flagConductorEnable } from '../../features/conductor/flagConductorEnable';
import { flagDirectoryLanguageUrl } from '../../features/directory/flagDirectoryLanguageUrl';
import { flagDirectoryPluginUrl } from '../../features/directory/flagDirectoryPluginUrl';
import { flagMonacoEditorEnable } from '../../features/monaco/flagMonacoEditorEnable';
import { FeatureFlag } from './FeatureFlag';

export const publicFlags: FeatureFlag<any>[] = [
  flagConductorEnable,
  flagDirectoryLanguageUrl,
  flagDirectoryPluginUrl,
  flagMonacoEditorEnable
];
