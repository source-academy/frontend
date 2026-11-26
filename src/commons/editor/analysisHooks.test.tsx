import type { AnalysisRange } from '@sourceacademy/common-autocomplete';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { AnalysisProvider } from '../../features/conductor/analysisStore';
import useHighlighting from './UseHighlighting';
import useNavigation from './UseNavigation';
import useRefactor from './UseRefactor';

let provider: AnalysisProvider | undefined;
vi.mock('./useAnalysis', async importOriginal => ({
  ...(await importOriginal<typeof import('./useAnalysis')>()),
  // A ref that always reads the current provider, as the real one does.
  useAnalysis: () => ({
    get current() {
      return provider;
    },
  }),
}));
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
    let tab: { location: { href: string }; close: ReturnType<typeof vi.fn> };
    beforeEach(() => {
      tab = { location: { href: '' }, close: vi.fn() };
      open = vi.spyOn(window, 'open').mockImplementation(() => tab as unknown as Window);
    });
    afterEach(() => open.mockRestore());

    test('a name of the library opens its documentation, in a tab that was opened before the answer', async () => {
      const answer = deferred<AnalysisRange | null>();
      provider = providerOf({ definition: vi.fn(() => answer.promise) });
      const ace = fakeAce(
        'display(1);',
        { row: 0, column: 2 },
        { type: 'support.function', value: 'display' },
      );

      const navigating = navigate(ace);
      // A browser lets a page open a tab only for a moment after the keypress: not after an answer.
      expect(open).toHaveBeenCalledWith('', '_blank');
      expect(tab.location.href).toBe('');
      answer.resolve(null);
      await navigating;

      expect(tab.location.href).toBe('https://docs.example/global.html#display');
      expect(tab.close).not.toHaveBeenCalled();
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
      expect(tab.location.href).toBe('https://docs.example/');
    });

    test('opens the documentation as before if no tab could be opened ahead', async () => {
      provider = providerOf();
      open.mockImplementationOnce(() => null);
      const ace = fakeAce(
        'display(1);',
        { row: 0, column: 2 },
        { type: 'support.function', value: 'display' },
      );
      await navigate(ace);
      expect(open).toHaveBeenLastCalledWith('https://docs.example/global.html#display');
    });

    test('a name of the library that the program declares goes to the declaration, and the tab is closed', async () => {
      provider = providerOf({ definition: vi.fn(async () => range(0, 4, 11)) });
      const ace = fakeAce(
        'const display = 1;\ndisplay;',
        { row: 1, column: 2 },
        { type: 'support.function', value: 'display' },
      );
      await navigate(ace);
      expect(ace.editor.moveCursorToPosition).toHaveBeenCalledWith({ row: 0, column: 4 });
      expect(tab.close).toHaveBeenCalled();
      expect(tab.location.href).toBe('');
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

    test('closes the tab if the answer is for what is no longer there', async () => {
      const answer = deferred<AnalysisRange | null>();
      provider = providerOf({ definition: vi.fn(() => answer.promise) });
      const ace = fakeAce(
        'display(1);',
        { row: 0, column: 2 },
        { type: 'support.function', value: 'display' },
      );
      const navigating = navigate(ace);
      ace.state.cursor = { row: 0, column: 5 };
      answer.resolve(null);
      await navigating;
      expect(tab.close).toHaveBeenCalled();
      expect(tab.location.href).toBe('');
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
  test('is not acted on if another editor session is shown when the evaluator answers (a tab was switched)', async () => {
    const answer = deferred<AnalysisRange | null>();
    provider = providerOf({ definition: vi.fn(() => answer.promise) });
    const ace = fakeAce('const x = 1;\nx;', { row: 1, column: 0 });

    const navigating = navigate(ace);
    // Ace keeps its editor and replaces the session; the new tab has the same text and cursor.
    ace.editor.session = { ...ace.session } as typeof ace.session;
    answer.resolve(range(0, 6, 7));
    await navigating;

    expect(ace.editor.moveCursorToPosition).not.toHaveBeenCalled();
  });

  test('is not acted on if another evaluator is selected when the evaluator answers', async () => {
    const answer = deferred<AnalysisRange | null>();
    provider = providerOf({ definition: vi.fn(() => answer.promise) });
    const ace = fakeAce('const x = 1;\nx;', { row: 1, column: 0 });

    const navigating = navigate(ace);
    provider = providerOf({
      capabilities: { occurrences: false, definition: false, scope: false },
    });
    answer.resolve(range(0, 6, 7));
    await navigating;

    expect(ace.editor.moveCursorToPosition).not.toHaveBeenCalled();
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

  test('selects nothing if the cursor has moved while the evaluator answered', async () => {
    const answer = deferred<AnalysisRange[]>();
    provider = providerOf({ occurrences: vi.fn(() => answer.promise) });
    const ace = fakeAce('const x = 1;\nconst y = 2;', { row: 0, column: 6 });

    const refactoring = refactor(ace);
    // The text is the same, but the user is at another name now.
    ace.state.cursor = { row: 1, column: 6 };
    answer.resolve([range(0, 6, 7)]);
    await refactoring;

    expect(ace.selection.addRange).not.toHaveBeenCalled();
  });

  test('selects nothing if another editor session or another evaluator is there when the evaluator answers', async () => {
    const answer = deferred<AnalysisRange[]>();
    provider = providerOf({ occurrences: vi.fn(() => answer.promise) });
    const ace = fakeAce();
    const refactoring = refactor(ace);
    ace.editor.session = { ...ace.session } as typeof ace.session;
    answer.resolve([range(0, 6, 7)]);
    await refactoring;
    expect(ace.selection.addRange).not.toHaveBeenCalled();

    const second = deferred<AnalysisRange[]>();
    provider = providerOf({ occurrences: vi.fn(() => second.promise) });
    const ace2 = fakeAce();
    const refactoringAgain = refactor(ace2);
    provider = undefined;
    second.resolve([range(0, 6, 7)]);
    await refactoringAgain;
    expect(ace2.selection.addRange).not.toHaveBeenCalled();
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

  test('does not restore the markers of an answer that comes after another evaluator was selected', async () => {
    const answer = deferred<AnalysisRange[]>();
    provider = providerOf({ occurrences: vi.fn(() => answer.promise) });
    const ace = fakeAce();
    const { outProps } = renderHook(() => useHook(useHighlighting, ace.ref)).result.current;

    outProps.onCursorChange();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20);
    });
    // The evaluator that was asked is no longer the selected one.
    provider = undefined;
    await act(async () => {
      answer.resolve([range(0, 6, 7)]);
    });

    expect(ace.session.addMarker).not.toHaveBeenCalled();
  });

  test('removes the markers when the evaluator says that it no longer provides the occurrences', async () => {
    provider = providerOf({ occurrences: vi.fn(async () => [range(0, 6, 7)]) });
    const ace = fakeAce();
    const hook = renderHook(() => useHook(useHighlighting, ace.ref));
    await moveCursorAndWait(hook.result.current.outProps);
    expect(ace.session.addMarker).toHaveBeenCalledTimes(1);
    expect(ace.session.removeMarker).not.toHaveBeenCalled();

    // The provider is still there, with one analysis less.
    provider = providerOf({ capabilities: { occurrences: false, definition: true, scope: true } });
    hook.rerender();

    expect(ace.session.removeMarker).toHaveBeenCalledWith(1);
  });

  test('does not restore the scope of an answer that comes after the cursor has moved', async () => {
    const answer = deferred<AnalysisRange[]>();
    provider = providerOf({ scope: vi.fn(() => answer.promise) });
    const ace = fakeAce('const x = 1;\nx;', { row: 1, column: 0 });
    const { keyBindings } = renderHook(() => useHook(useHighlighting, ace.ref)).result.current;

    const highlighting = keyBindings.highlightScope();
    ace.state.cursor = { row: 0, column: 0 };
    answer.resolve([range(0, 0, 5)]);
    await highlighting;

    expect(ace.session.addMarker).not.toHaveBeenCalled();
  });
});
