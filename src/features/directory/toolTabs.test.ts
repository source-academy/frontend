import type { IPluginDefinition } from '@sourceacademy/plugin-directory/dist/types';
import { describe, expect, test } from 'vitest';

import { tabBehaviour, toolTabsOf } from './toolTabs';

const plugin = (id: string, tab?: IPluginDefinition['tab']): IPluginDefinition => ({
  id,
  name: id,
  resolutions: {},
  tab,
});
const stepperTab = {
  id: 'stepper-tab',
  label: 'Stepper',
  iconName: 'flow-review',
  hidesRepl: true,
  resizable: false,
};
const pluginMap = {
  stepper: plugin('stepper', stepperTab),
  viz: plugin('viz', { id: 'viz-tab', label: 'Viz', iconName: 'eye-open' }),
  tabless: plugin('tabless'),
};

describe('toolTabsOf', () => {
  test('gives the tab of the plugin that an evaluator names, with the evaluator it selects', () => {
    expect(toolTabsOf([{ id: 'plain' }, { id: 'steps', plugin: 'stepper' }], pluginMap)).toEqual([
      { tab: stepperTab, evaluatorId: 'steps' },
    ]);
  });

  test('gives nothing for a plugin that has no tab or is not in the directory', () => {
    expect(
      toolTabsOf(
        [
          { id: 'a', plugin: 'tabless' },
          { id: 'b', plugin: 'missing' },
        ],
        pluginMap,
      ),
    ).toEqual([]);
    expect(toolTabsOf([{ id: 'a', plugin: 'stepper' }], {})).toEqual([]);
  });

  test('gives one tab per evaluator, in order', () => {
    expect(
      toolTabsOf(
        [
          { id: 'x', plugin: 'viz' },
          { id: 'y', plugin: 'stepper' },
        ],
        pluginMap,
      ).map(t => t.evaluatorId),
    ).toEqual(['x', 'y']);
  });
});

describe('tabBehaviour', () => {
  test('reads the flags of the tab that the directory describes', () => {
    expect(tabBehaviour(pluginMap, 'stepper-tab')).toEqual({ hidesRepl: true, resizable: false });
  });

  test('defaults the flags that a tab leaves out', () => {
    expect(tabBehaviour(pluginMap, 'viz-tab')).toEqual({ hidesRepl: false, resizable: true });
  });

  test('gives the defaults for a tab that the directory does not describe', () => {
    expect(tabBehaviour(pluginMap, 'introduction')).toEqual({ hidesRepl: false, resizable: true });
    expect(tabBehaviour(pluginMap, undefined)).toEqual({ hidesRepl: false, resizable: true });
    expect(tabBehaviour({}, 'stepper-tab')).toEqual({ hidesRepl: false, resizable: true });
  });
});
