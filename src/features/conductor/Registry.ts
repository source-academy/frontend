import type { ITabService } from '@sourceacademy/common-tabs';
import type { PluginClass } from '@sourceacademy/conductor/conduit';

import AutoCompletePlugin from './AutocompletePlugin';
import { TestPlugin } from './TestPlugin';

/**
 * Registry of *built-in* web plugins implemented inside the frontend (e.g. autocomplete). These are
 * registered directly by id without going through the plugin directory. External plugins (such as
 * the stepper) are not listed here — they are resolved from the plugin directory and imported
 * dynamically (see {@link createPreparedConductor} in `conductorEvaluatorCache`).
 *
 * Each registered plugin class is constructed with the shared {@link ITabService} so it can
 * contribute side-content tabs.
 */
export type PluginRegistry = Map<string, PluginClass<[ITabService]>>;

export const registry: PluginRegistry = new Map();
registry.set('__autocomplete_plugin_web', AutoCompletePlugin);
registry.set('test', TestPlugin);
