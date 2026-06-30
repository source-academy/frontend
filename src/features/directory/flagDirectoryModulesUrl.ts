import { ModuleLoaderWebPlugin } from '@sourceacademy/web-module-loader';

import { createFeatureFlag } from '../../commons/featureFlags';
import { featureSelector } from '../../commons/featureFlags/featureSelector';

export const flagDirectoryModulesUrl = createFeatureFlag(
  'directory.modules.url',
  'https://source-academy.github.io/modules-conductor/modules.json',
  'The URL where the module directory may be found.',
  // eslint-disable-next-line require-yield
  function* (url: string) {
    ModuleLoaderWebPlugin.instance?.onModuleDirectoryURLChange(url);
  },
);

export const selectDirectoryModulesUrl = featureSelector(flagDirectoryModulesUrl);
