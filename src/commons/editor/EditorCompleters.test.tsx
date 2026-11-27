import type { ITabService } from '@sourceacademy/common-tabs';
import { languages } from '@sourceacademy/language-directory';
import { act, render } from '@testing-library/react';
import { require as acequire } from 'ace-builds/src-noconflict/ace';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { createStore } from 'src/pages/createStore';
import { afterEach, describe, expect, test, vi } from 'vitest';

import {
  associateAutocompleteEvaluator,
  createAutocompleteModePublisher,
} from '../../features/conductor/autocompleteModeStore';
import LanguageDirectoryActions from '../../features/directory/LanguageDirectoryActions';
import Editor, { type EditorProps } from './Editor';

/** The completers that the editor installed last: Ace has them as a list, for the whole page. */
function installedCompleters(setCompleters: ReturnType<typeof vi.spyOn>) {
  return setCompleters.mock.calls.at(-1)?.[0] as
    | { getCompletions: (...args: unknown[]) => void }[]
    | undefined;
}

describe('the completers of the editor', () => {
  afterEach(() => vi.restoreAllMocks());

  const handlers = (handlePromptAutocomplete: EditorProps['handlePromptAutocomplete']) =>
    ({
      editorTabIndex: 0,
      breakpoints: [],
      editorSessionId: '',
      sessionDetails: null,
      editorValue: '',
      highlightedLines: [],
      handleEditorEval: () => {},
      handleEditorValueChange: () => {},
      handleEditorUpdateBreakpoints: () => {},
      handleSetSharedbConnected: () => {},
      handleUpdateHasUnsavedChanges: () => {},
      handlePromptAutocomplete,
    }) satisfies EditorProps;

  /** The editor of a language whose evaluator, if it has published one, has published `mode`. */
  async function renderEditorOf(languageId: string, evaluatorId: string, mode?: string) {
    const setCompleters = vi.spyOn(acequire('ace/ext/language_tools'), 'setCompleters');
    const handlePromptAutocomplete = vi.fn((_row: number, _column: number, callback: any) =>
      callback(null, []),
    );
    const store = createStore();
    store.dispatch(LanguageDirectoryActions.setLanguages(languages));
    store.dispatch(LanguageDirectoryActions.setSelectedLanguage(languageId, evaluatorId));
    if (mode) {
      const path = languages
        .find(language => language.id === languageId)!
        .evaluators.find(evaluator => evaluator.id === evaluatorId)!.path;
      const tabService = {} as ITabService;
      associateAutocompleteEvaluator(tabService, path);
      createAutocompleteModePublisher(tabService).publish(mode);
    }
    const editorOf = (editorValue: string) => (
      <Provider store={store}>
        <MemoryRouter>
          <Editor {...handlers(handlePromptAutocomplete)} editorValue={editorValue} />
        </MemoryRouter>
      </Provider>
    );
    let view!: ReturnType<typeof render>;
    await act(async () => {
      view = render(editorOf(''));
    });
    // The editor reads its Ace instance from a ref while rendering, so it has it from the render
    // after the first, which the app has all the time (a change of the text, the cursor, …).
    await act(async () => {
      view.rerender(editorOf('x'));
    });
    return { setCompleters, handlePromptAutocomplete };
  }

  test.each([
    ['Java, whose evaluator publishes the mode ace/mode/java', 'java', 'javaDefault', 'java'],
    ['an evaluator that publishes the mode of C', 'java', 'javaDefault', 'c_cpp'],
    ['Python', 'python1', 'python1Py2js', undefined],
  ])('are the evaluator’s for %s', async (_name, languageId, evaluatorId, mode) => {
    const { setCompleters, handlePromptAutocomplete } = await renderEditorOf(
      languageId,
      evaluatorId,
      mode,
    );

    const completers = installedCompleters(setCompleters);
    expect(completers).toHaveLength(1);
    // The one completer asks the evaluator (and so is not Ace's own text or keyword completer).
    completers![0].getCompletions({}, {}, { row: 0, column: 0 }, 'pr', () => {});
    expect(handlePromptAutocomplete).toHaveBeenCalledTimes(1);
  });
});
