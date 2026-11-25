import type { SyntaxHighlightData } from '@sourceacademy/common-autocomplete';
import type { Editor } from 'ace-builds';
import ace from 'ace-builds/src-noconflict/ace';
import { describe, expect, test, vi } from 'vitest';

import { isKeywordMapperToken } from './autocompleteHighlightRules';
import AutoCompletePlugin from './AutocompletePlugin';

describe('AutoCompletePlugin highlight rules', () => {
  test('accepts a null token without treating it as a keyword mapper', () => {
    expect(isKeywordMapperToken(null)).toBe(false);
    expect(isKeywordMapperToken(['keyword'])).toBe(false);
    expect(isKeywordMapperToken({ map: {}, defaultToken: 'identifier' })).toBe(true);
  });
});

describe('AutoCompletePlugin folding', () => {
  const modeData = (id: string, foldingModule: string, args: string[] = []) =>
    ({
      highlightRules: { start: [] },
      foldingRules: { hookFrom: foldingModule, args },
      lineCommentStart: '',
      pairQuotesAfter: {},
      indents: { hookFrom: 'ace/mode/text' },
      outdents: { hookFrom: 'ace/mode/text' },
      autoOutdent: { hookFrom: 'ace/mode/text' },
      id,
    }) as SyntaxHighlightData;

  // The constructor needs a conduit; loadMode and setMode do not.
  const plugin = () => {
    const instance = Object.create(AutoCompletePlugin.prototype) as AutoCompletePlugin;
    Object.assign(instance, { disposed: false });
    return instance;
  };

  // Returns the mode that the plugin gives to an editor's session.
  const modeSetOn = (instance: AutoCompletePlugin) => {
    const setMode = vi.fn();
    instance.setMode({ getSession: () => ({ setMode }) } as unknown as Editor);
    return setMode.mock.calls[0][0] as { foldingRules?: unknown };
  };

  test('a folding mode that Ace has not defined means a mode without folding', async () => {
    const instance = plugin();
    await instance.loadMode(modeData('ace/mode/nofold', 'ace/mode/folding/not_in_any_loaded_file'));
    expect(modeSetOn(instance).foldingRules).toBeUndefined();
  });

  test('a folding mode that Ace has defined is built with the evaluator’s arguments', async () => {
    const received: unknown[][] = [];
    ace.define('ace/mode/folding/recording', ['require', 'exports'], (_: never, exports: any) => {
      exports.FoldMode = function (...args: unknown[]) {
        received.push(args);
      };
    });
    const instance = plugin();
    await instance.loadMode(
      modeData('ace/mode/withfold', 'ace/mode/folding/recording', ['a', 'b']),
    );
    expect(modeSetOn(instance).foldingRules).toBeDefined();
    expect(received).toEqual([['a', 'b']]);
  });
});
