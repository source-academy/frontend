import type {
  AnalysisCapabilities,
  AnalysisMessage,
  SyntaxHighlightData,
} from '@sourceacademy/common-autocomplete';
import type { ITabService } from '@sourceacademy/common-tabs';
import type { IConduit } from '@sourceacademy/conductor/conduit';
import { act, renderHook } from '@testing-library/react';
import type { Editor } from 'ace-builds';
import ace from 'ace-builds/src-noconflict/ace';
import { describe, expect, test, vi } from 'vitest';

import { useAnalysisProvider } from './analysisStore';
import { isKeywordMapperToken } from './autocompleteHighlightRules';
import { associateAutocompleteEvaluator } from './autocompleteModeStore';
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

describe('AutoCompletePlugin analysis', () => {
  const all: AnalysisCapabilities = { occurrences: true, definition: true, scope: true };
  const range = { start: { line: 0, character: 6 }, end: { line: 0, character: 7 } };

  /** A plugin on fake channels: `sent` is what it sends on the analysis channel, `deliver` is the runner. */
  function makePlugin(evaluatorPath: string) {
    const sent: AnalysisMessage[] = [];
    let deliver: (message: AnalysisMessage) => void = () => {};
    const subscribers = new Set<(message: AnalysisMessage) => void>();
    const quiet = () => ({
      name: 'quiet',
      send: () => {},
      subscribe: () => {},
      unsubscribe: () => {},
      close: () => {},
    });
    const analysisChannel = {
      name: 'analysis',
      send: (message: AnalysisMessage) => sent.push(message),
      subscribe: (subscriber: (message: AnalysisMessage) => void) => subscribers.add(subscriber),
      unsubscribe: (subscriber: (message: AnalysisMessage) => void) =>
        subscribers.delete(subscriber),
      close: () => {},
    };
    deliver = message => subscribers.forEach(subscriber => subscriber(message));
    const tabService = {} as ITabService;
    associateAutocompleteEvaluator(tabService, evaluatorPath);
    const plugin = new AutoCompletePlugin(
      {} as IConduit,

      [quiet(), quiet(), analysisChannel] as any,
      tabService,
    );
    return { plugin, sent, deliver };
  }

  test('offers no analysis until the runner has said which it provides', () => {
    const evaluatorPath = '/evaluators/silent-runner.js';
    const { plugin } = makePlugin(evaluatorPath);
    const { result } = renderHook(() => useAnalysisProvider(evaluatorPath));
    expect(result.current).toBeUndefined();
    plugin.dispose();
  });

  test('offers the analysis of the runner once it has said which it provides, and not after it is disposed', () => {
    const evaluatorPath = '/evaluators/announcing-runner.js';
    const { plugin, deliver } = makePlugin(evaluatorPath);
    const { result } = renderHook(() => useAnalysisProvider(evaluatorPath));

    act(() => deliver({ type: 'capabilities', capabilities: all }));
    expect(result.current?.capabilities).toEqual(all);

    act(() => plugin.dispose());
    expect(result.current).toBeUndefined();
  });

  test('puts a request to the runner and resolves with its answer', async () => {
    const evaluatorPath = '/evaluators/answering-runner.js';
    const { plugin, sent, deliver } = makePlugin(evaluatorPath);
    const { result } = renderHook(() => useAnalysisProvider(evaluatorPath));
    act(() => deliver({ type: 'capabilities', capabilities: all }));
    sent.length = 0;

    const answer = result.current!.definition('const x = 1;\nx;', { line: 1, character: 0 });
    const request = sent.find(message => message.type === 'request');
    expect(request).toEqual({
      type: 'request',
      requestId: expect.any(Number),
      kind: 'definition',
      code: 'const x = 1;\nx;',
      position: { line: 1, character: 0 },
    });
    deliver({
      type: 'response',
      requestId: (request as { requestId: number }).requestId,
      kind: 'definition',
      range,
    });

    expect(await answer).toEqual(range);
    plugin.dispose();
  });

  test('asks the runner only for what it has said it provides', async () => {
    const evaluatorPath = '/evaluators/partial-runner.js';
    const { plugin, sent, deliver } = makePlugin(evaluatorPath);
    const { result } = renderHook(() => useAnalysisProvider(evaluatorPath));
    act(() =>
      deliver({
        type: 'capabilities',
        capabilities: { occurrences: true, definition: false, scope: false },
      }),
    );
    sent.length = 0;

    expect(await result.current!.scope('x', { line: 0, character: 0 })).toEqual([]);
    expect(sent).toEqual([]);
    plugin.dispose();
  });
});
