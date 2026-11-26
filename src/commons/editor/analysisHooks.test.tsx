import type { AnalysisRange } from '@sourceacademy/common-autocomplete';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { AnalysisProvider } from '../../features/conductor/analysisStore';
import useHighlighting from './UseHighlighting';
import useNavigation from './UseNavigation';
import useRefactor from './UseRefactor';

let provider: AnalysisProvider | undefined;
vi.mock('./useAnalysis', () => ({ useAnalysis: () => ({ current: provider }) }));
vi.mock('../../features/directory/useLanguageDocumentation', () => ({
  useLanguageDocumentation: () => ({ languageDocsUrl: 'https://docs.example/' }),
}));

const range = (line: number, from: number, to: number): AnalysisRange => ({
  start: { line, character: from },
  end: { line, character: to },
});

/** A promise that the test settles when it chooses: when the evaluator's answer comes. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(r => (resolve = r));
  return { promise, resolve };
}

const providerOf = (overrides: Partial<AnalysisProvider> = {}): AnalysisProvider => ({
  capabilities: { occurrences: true, definition: true, scope: true },
  occurrences: vi.fn(async () => []),
  definition: vi.fn(async () => null),
  scope: vi.fn(async () => []),
  ...overrides,
});

/** The parts of Ace's editor that the hooks use. */
function fakeAce(
  value = 'const x = 1;\nx;',
  cursor = { row: 1, column: 0 },
  token: unknown = null,
) {
  const state = { value, cursor };
  let markerId = 0;
  const session = {
    getValue: () => state.value,
    getTokenAt: vi.fn(() => token),
    addMarker: vi.fn((_range: unknown, _className: string, _type: string) => ++markerId),
    removeMarker: vi.fn(),
    bgTokenizer: {},
  };
  const selection = { clearSelection: vi.fn(), addRange: vi.fn() };
  const editor = {
    getValue: () => state.value,
    getCursorPosition: () => state.cursor,
    session,
    selection,
    getSelection: () => selection,
    moveCursorToPosition: vi.fn(),
    renderer: { showCursor: vi.fn(), scrollCursorIntoView: vi.fn() },
  };
  return { state, editor, session, selection, ref: { current: { editor } } };
}

function useHook(hook: any, ref: unknown) {
  const outProps: any = {};
  const keyBindings: any = {};
  hook({}, outProps, keyBindings, ref);
  return { outProps, keyBindings };
}

beforeEach(() => {
  provider = undefined;
});

describe('go to definition', () => {
  const navigate = (ace: ReturnType<typeof fakeAce>) =>
    renderHook(() => useHook(useNavigation, ace.ref)).result.current.keyBindings.navigate();

  test('asks the evaluator with the code and the 0-based cursor, and moves the cursor to the declaration', async () => {
    provider = providerOf({ definition: vi.fn(async () => range(0, 6, 7)) });
    const ace = fakeAce('const x = 1;\nx;', { row: 1, column: 0 });

    await navigate(ace);

    expect(provider.definition).toHaveBeenCalledWith('const x = 1;\nx;', { line: 1, character: 0 });
    expect(ace.editor.moveCursorToPosition).toHaveBeenCalledWith({ row: 0, column: 6 });
    expect(ace.editor.renderer.scrollCursorIntoView).toHaveBeenCalled();
  });

  test('does nothing for an evaluator that offers no analysis', async () => {
    const ace = fakeAce();
    await navigate(ace);
    expect(ace.editor.moveCursorToPosition).not.toHaveBeenCalled();
  });

  test('does nothing for an evaluator that does not provide the definition', async () => {
    provider = providerOf({
      capabilities: { occurrences: true, definition: false, scope: true },
    });
    const ace = fakeAce();
    await navigate(ace);
    expect(provider.definition).not.toHaveBeenCalled();
    expect(ace.editor.moveCursorToPosition).not.toHaveBeenCalled();
  });

  describe('where there is no declaration in the program', () => {
    let open: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      open = vi.spyOn(window, 'open').mockImplementation(() => null);
    });
    afterEach(() => open.mockRestore());

    test('a name of the library opens its documentation', async () => {
      provider = providerOf();
      const ace = fakeAce(
        'display(1);',
        { row: 0, column: 2 },
        { type: 'support.function', value: 'display' },
      );
      await navigate(ace);
      expect(open).toHaveBeenCalledWith('https://docs.example/global.html#display');
      expect(ace.editor.moveCursorToPosition).not.toHaveBeenCalled();
    });

    test('a keyword opens the documentation of the language', async () => {
      provider = providerOf();
      const ace = fakeAce(
        'const x = 1;',
        { row: 0, column: 1 },
        { type: 'storage.type', value: 'const' },
      );
      await navigate(ace);
      expect(open).toHaveBeenCalledWith('https://docs.example/');
    });

    test('anything else opens nothing', async () => {
      provider = providerOf();
      const ace = fakeAce(
        '1 + 1;',
        { row: 0, column: 0 },
        { type: 'constant.numeric', value: '1' },
      );
      await navigate(ace);
      expect(open).not.toHaveBeenCalled();
    });
  });

  test('is not acted on if the code or the cursor has changed while the evaluator answered', async () => {
    const answer = deferred<AnalysisRange | null>();
    provider = providerOf({ definition: vi.fn(() => answer.promise) });
    const ace = fakeAce('const x = 1;\nx;', { row: 1, column: 0 });
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);

    const navigating = navigate(ace);
    ace.state.value = 'const x = 1;\nxy;';
    answer.resolve(range(0, 6, 7));
    await navigating;
    expect(ace.editor.moveCursorToPosition).not.toHaveBeenCalled();

    ace.state.value = 'const x = 1;\nx;';
    const second = deferred<AnalysisRange | null>();
    (provider.definition as ReturnType<typeof vi.fn>).mockImplementation(() => second.promise);
    const navigatingAgain = navigate(ace);
    ace.state.cursor = { row: 0, column: 0 };
    second.resolve(range(0, 6, 7));
    await navigatingAgain;
    expect(ace.editor.moveCursorToPosition).not.toHaveBeenCalled();
    open.mockRestore();
  });
});

describe('rename in scope', () => {
  const refactor = (ace: ReturnType<typeof fakeAce>) =>
    renderHook(() => useHook(useRefactor, ace.ref)).result.current.keyBindings.refactor();

  test('selects every occurrence that the evaluator names', async () => {
    provider = providerOf({
      occurrences: vi.fn(async () => [range(0, 6, 7), range(1, 0, 1)]),
    });
    const ace = fakeAce('const x = 1;\nx;', { row: 1, column: 0 });

    await refactor(ace);

    expect(provider.occurrences).toHaveBeenCalledWith('const x = 1;\nx;', {
      line: 1,
      character: 0,
    });
    expect(ace.selection.addRange).toHaveBeenCalledTimes(2);
    const added = ace.selection.addRange.mock.calls.map(([r]) => [
      r.start.row,
      r.start.column,
      r.end.row,
      r.end.column,
    ]);
    expect(added).toEqual([
      [0, 6, 0, 7],
      [1, 0, 1, 1],
    ]);
  });

  test('does nothing without an analysis that provides the occurrences', async () => {
    const ace = fakeAce();
    await refactor(ace);
    provider = providerOf({
      capabilities: { occurrences: false, definition: true, scope: true },
    });
    await refactor(ace);
    expect(provider.occurrences).not.toHaveBeenCalled();
    expect(ace.selection.addRange).not.toHaveBeenCalled();
  });

  test('selects nothing if the code has changed while the evaluator answered', async () => {
    const answer = deferred<AnalysisRange[]>();
    provider = providerOf({ occurrences: vi.fn(() => answer.promise) });
    const ace = fakeAce();

    const refactoring = refactor(ace);
    ace.state.value = 'something else';
    answer.resolve([range(0, 6, 7)]);
    await refactoring;

    expect(ace.selection.addRange).not.toHaveBeenCalled();
  });
});

describe('scope highlighting', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  /** The cursor moves: Ace tells the hook, which asks the evaluator after a moment. */
  async function moveCursorAndWait(outProps: any) {
    outProps.onCursorChange();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20);
    });
  }

  test('marks every occurrence that the evaluator names', async () => {
    provider = providerOf({
      occurrences: vi.fn(async () => [range(0, 6, 7), range(1, 0, 1)]),
    });
    const ace = fakeAce();
    const { outProps } = renderHook(() => useHook(useHighlighting, ace.ref)).result.current;

    await moveCursorAndWait(outProps);

    expect(provider.occurrences).toHaveBeenCalledWith('const x = 1;\nx;', {
      line: 1,
      character: 0,
    });
    expect(ace.session.addMarker).toHaveBeenCalledTimes(2);
    expect(ace.session.addMarker.mock.calls.map(call => call[1])).toEqual([
      'ace_variable_highlighting',
      'ace_variable_highlighting',
    ]);
  });

  test('replaces the markers of the previous cursor position', async () => {
    provider = providerOf({ occurrences: vi.fn(async () => [range(0, 6, 7)]) });
    const ace = fakeAce();
    const { outProps } = renderHook(() => useHook(useHighlighting, ace.ref)).result.current;

    await moveCursorAndWait(outProps);
    await moveCursorAndWait(outProps);

    expect(ace.session.removeMarker).toHaveBeenCalledWith(1);
    expect(ace.session.addMarker).toHaveBeenCalledTimes(2);
  });

  test('drops an answer that a later request has overtaken', async () => {
    const slow = deferred<AnalysisRange[]>();
    const fast = deferred<AnalysisRange[]>();
    const answers = [slow, fast];
    provider = providerOf({ occurrences: vi.fn(() => answers.shift()!.promise) });
    const ace = fakeAce();
    const { outProps } = renderHook(() => useHook(useHighlighting, ace.ref)).result.current;

    outProps.onCursorChange();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20);
    });
    outProps.onCursorChange();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20);
    });
    // The answers come in the opposite order.
    await act(async () => {
      fast.resolve([range(1, 0, 1)]);
      slow.resolve([range(0, 6, 7)]);
    });

    expect(ace.session.addMarker).toHaveBeenCalledTimes(1);
    expect(ace.session.addMarker.mock.calls[0][0]).toMatchObject({
      start: { row: 1, column: 0 },
    });
  });

  test('asks nothing of an evaluator that offers no analysis', async () => {
    const ace = fakeAce();
    const { outProps } = renderHook(() => useHook(useHighlighting, ace.ref)).result.current;

    await moveCursorAndWait(outProps);

    expect(ace.session.addMarker).not.toHaveBeenCalled();
  });

  test('highlights the scope that the evaluator names, on request', async () => {
    provider = providerOf({ scope: vi.fn(async () => [range(0, 0, 5)]) });
    const ace = fakeAce();
    const { keyBindings } = renderHook(() => useHook(useHighlighting, ace.ref)).result.current;

    await keyBindings.highlightScope();

    expect(provider.scope).toHaveBeenCalledWith('const x = 1;\nx;', { line: 1, character: 0 });
    expect(ace.session.addMarker).toHaveBeenCalledTimes(1);
    expect(ace.session.addMarker.mock.calls[0][1]).toBe('ace_selection');
  });

  test('does not highlight a scope for an evaluator that does not provide it', async () => {
    provider = providerOf({
      capabilities: { occurrences: true, definition: true, scope: false },
    });
    const ace = fakeAce();
    const { keyBindings } = renderHook(() => useHook(useHighlighting, ace.ref)).result.current;

    await keyBindings.highlightScope();

    expect(provider.scope).not.toHaveBeenCalled();
    expect(ace.session.addMarker).not.toHaveBeenCalled();
  });
});
