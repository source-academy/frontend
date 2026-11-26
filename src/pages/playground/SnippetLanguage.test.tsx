import type { Store } from '@reduxjs/toolkit';
import { getLanguageOfTextbookChapter, languages } from '@sourceacademy/language-directory';
import { plugins } from '@sourceacademy/plugin-directory';
import { render } from '@testing-library/react';
import { compressToEncodedURIComponent } from 'lz-string';
import { act } from 'react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import type { OverallState } from 'src/commons/application/ApplicationTypes';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';
import { EditorBinding, WorkspaceSettingsContext } from 'src/commons/WorkspaceSettingsContext';
import LanguageDirectoryActions from 'src/features/directory/LanguageDirectoryActions';
import PluginDirectoryActions from 'src/features/directory/PluginDirectoryActions';
import { initSession } from 'src/features/eventLogging';
import { createStore } from 'src/pages/createStore';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import Playground from './Playground';

// The event-log sessions are started and checked here, not sent.
vi.mock('src/features/eventLogging', async importOriginal => ({
  ...(await importOriginal<typeof import('src/features/eventLogging')>()),
  initSession: vi.fn(() => 'test-session'),
  log: vi.fn(),
}));

// Mock inspector
(window as any).Inspector = vi.fn();
(window as any).Inspector.highlightClean = vi.fn();

// Mock BlueprintJS Slider due to a bug in initial state causing invalid CSS
// to be generated: `style="left: calc(-0px + (% * nan));"`
vi.mock('@blueprintjs/core', async importOriginal => ({
  ...(await importOriginal()),
  Slider: (props: any) => <div data-testid="mock-slider">{props.children}</div>,
}));

const program = compressToEncodedURIComponent('display(1);');

/**
 * The editor of a snippet of the textbook is a Playground with the snippet's link as its hash, on
 * the page of the section that the snippet is in.
 */
describe('a snippet of the textbook', () => {
  let store: Store<OverallState>;

  const renderSnippet = async (pathname: string, hash: string) => {
    const router = createMemoryRouter(
      [
        {
          path: '/:book/:section',
          element: (
            <Provider store={store}>
              <WorkspaceSettingsContext.Provider
                value={[{ editorBinding: EditorBinding.NONE }, vi.fn()]}
              >
                <Playground isSicpEditor initialEditorValueHash={hash} />
              </WorkspaceSettingsContext.Provider>
            </Provider>
          ),
        },
      ],
      { initialEntries: [pathname], initialIndex: 0 },
    );
    const app = render(<RouterProvider router={router} />);
    await act(() => app);
  };

  const selectedLanguageId = () => store.getState().languageDirectory.selectedLanguageId;
  const languageOfChapter = (route: string, chapter: string) =>
    getLanguageOfTextbookChapter(languages, route, chapter)?.id;

  beforeEach(() => {
    store = createStore();
    store.dispatch(PluginDirectoryActions.setPlugins(plugins));
    store.dispatch(LanguageDirectoryActions.setLanguages(languages));
    vi.mocked(initSession).mockClear();
  });

  test('whose link names no language runs in the language of its chapter, as the directory says', async () => {
    await renderSnippet('/sicpjs/3.2', `prgrm=${program}`);
    expect(selectedLanguageId()).toBe(languageOfChapter('/sicpjs', '3'));
    await renderSnippet('/sicpy/2.1', `prgrm=${program}`);
    expect(selectedLanguageId()).toBe(languageOfChapter('/sicpy', '2'));
  });

  test("whose link names a language runs in that one, not the chapter's", async () => {
    await renderSnippet('/sicpjs/3.2', `chap=1&prgrm=${program}`);
    expect(selectedLanguageId()).toBe('source1');
  });

  test('is given the language once the directory has loaded, without erasing what the reader typed', async () => {
    // The directory is not loaded when the editor mounts.
    store.dispatch(LanguageDirectoryActions.setLanguages([]));
    store.dispatch(LanguageDirectoryActions.clearSelectedLanguage());
    await renderSnippet('/sicpjs/3.2', `prgrm=${program}`);
    expect(selectedLanguageId()).toBeNull();

    act(() => {
      store.dispatch(WorkspaceActions.updateEditorValue('sicp', 0, 'display(2); // typed'));
    });
    await act(async () => {
      store.dispatch(LanguageDirectoryActions.setLanguages(languages));
    });

    expect(selectedLanguageId()).toBe(languageOfChapter('/sicpjs', '3'));
    expect(store.getState().workspaces.sicp.editorTabs[0].value).toBe('display(2); // typed');
  });

  test('starts its event-log session in the language of its chapter, not in the one selected before', async () => {
    store.dispatch(LanguageDirectoryActions.setSelectedLanguage('source1'));
    await renderSnippet('/sicpjs/3.2', `prgrm=${program}`);

    const chapterPosition =
      languages.findIndex(language => language.id === languageOfChapter('/sicpjs', '3')) + 1;
    expect(chapterPosition).toBeGreaterThan(0);
    // Whatever sessions were started on the way, the one that the events go to is in the chapter's.
    expect(vi.mocked(initSession).mock.lastCall?.[1].chapter).toBe(chapterPosition);
  });
});
