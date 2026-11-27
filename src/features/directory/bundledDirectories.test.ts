import { languages } from '@sourceacademy/language-directory';
import { plugins } from '@sourceacademy/plugin-directory';
import { generatePluginMap } from '@sourceacademy/plugin-directory/dist/util';
import { describe, expect, test } from 'vitest';

import { isToolEvaluator } from '../conductor/toolEvaluators';
import { toolTabsOf } from './toolTabs';

/**
 * The directories are bundled into the frontend (the language directory always, unless a course
 * points the frontend at another URL), at the versions that `package.json` pins. The frontend names
 * no tool, so what a language's tools are is only what these say. This fails if a bump of the pins
 * drops one.
 */
const pluginMap = Object.fromEntries(generatePluginMap(plugins));

describe('the bundled directories', () => {
  const withCse = languages.filter(language =>
    language.evaluators.some(e => (e.capabilities as string[] | undefined)?.includes('cse')),
  );

  test('there are languages with a CSE machine', () => {
    expect(withCse.length).toBeGreaterThan(0);
  });

  test.each(withCse.map(language => [language.id, language] as const))(
    '%s: its CSE evaluator names the CSE machine plugin, which has a tab',
    (_id, language) => {
      const cse = language.evaluators.filter(e =>
        (e.capabilities as string[] | undefined)?.includes('cse'),
      );
      expect(cse).toHaveLength(1);
      expect(cse[0].plugin).toBe('cse-machine');
      expect(isToolEvaluator(cse[0])).toBe(true);

      const tabs = toolTabsOf(language.evaluators, pluginMap);
      expect(tabs.map(t => t.evaluatorId)).toContain(cse[0].id);
      expect(tabs.find(t => t.evaluatorId === cse[0].id)?.tab).toMatchObject({
        id: 'cse-machine',
        label: 'CSE Machine',
        hidesRepl: true,
        resizable: false,
      });
    },
  );
});
