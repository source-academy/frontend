import type { ITabService } from '@sourceacademy/common-tabs';
import type { PluginClass } from '@sourceacademy/conductor/conduit';

import AutoCompletePlugin from './AutocompletePlugin';
import { TestPlugin } from './TestPlugin';

export type PluginRegistry = Map<string, PluginClass<[ITabService]>>;

export const registry: PluginRegistry = new Map();
registry.set('__autocomplete_plugin_web', AutoCompletePlugin);
registry.set('__web_test', TestPlugin);
