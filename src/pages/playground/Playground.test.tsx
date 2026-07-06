import type { Dispatch, Store } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import type { FSModule } from 'browserfs/dist/node/core/FS';
import { Chapter } from 'js-slang/dist/langs';
import { act } from 'react';
import { Provider } from 'react-redux';
import { createMemoryRouter, type RouteObject, RouterProvider } from 'react-router';
import {
  defaultEditorValue,
  defaultPlayground,
  type OverallState,
} from 'src/commons/application/ApplicationTypes';
import type { Router } from 'src/commons/application/types/CommonsTypes';
import { visitSideContent } from 'src/commons/sideContent/SideContentActions';
import { SideContentType } from 'src/commons/sideContent/SideContentTypes';
import { EditorBinding, WorkspaceSettingsContext } from 'src/commons/WorkspaceSettingsContext';
import LanguageDirectoryActions from 'src/features/directory/LanguageDirectoryActions';
import { createStore } from 'src/pages/createStore';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import Playground, { handleHash } from './Playground';

// Mock inspector
(window as any).Inspector = vi.fn();
(window as any).Inspector.highlightClean = vi.fn();

// Mock BlueprintJS Slider due to a bug in initial state causing invalid CSS
// to be generated: `style="left: calc(-0px + (% * nan));"`
vi.mock('@blueprintjs/core', async importOriginal => ({
  ...(await importOriginal()),
  Slider: (props: any) => <div data-testid="mock-slider">{props.children}</div>,
}));

// Using @testing-library/react to render snapshot instead of react-test-renderer
// as the useRefs require the notion of React DOM
const renderTree = async (router: Router) => {
  const app = render(<RouterProvider router={router} />);
  await act(() => app);
  return app.container;
};

describe('Playground tests', () => {
  let routes: RouteObject[];
  let mockStore: Store<OverallState>;

  const getSourceChapterFromStore = (store: Store<OverallState>) =>
    store.getState().playground.languageConfig.chapter;
  const getEditorValueFromStore = (store: Store<OverallState>) =>
    store.getState().workspaces.playground.editorTabs[0].value;

  beforeEach(() => {
    mockStore = createStore();
    routes = [
      {
        path: '/playground',
        element: (
          <Provider store={mockStore}>
            <WorkspaceSettingsContext.Provider
              value={[{ editorBinding: EditorBinding.NONE }, vi.fn()]}
            >
              <Playground />
            </WorkspaceSettingsContext.Provider>
          </Provider>
        ),
      },
    ];
  });

  test('Playground renders correctly', async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/playground'],
      initialIndex: 0,
    });

    const tree = await renderTree(router);
    expect(tree).toMatchSnapshot();

    expect(getSourceChapterFromStore(mockStore)).toBe(defaultPlayground.languageConfig.chapter);
    expect(getEditorValueFromStore(mockStore)).toBe(defaultEditorValue);
  });

  test('Playground with link renders correctly', async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/playground#chap=2&prgrm=CYSwzgDgNghgngCgOQAsCmUoHsCESCUA3EA'],
      initialIndex: 0,
    });

    const tree = await renderTree(router);
    expect(tree).toMatchSnapshot();

    expect(getSourceChapterFromStore(mockStore)).toBe(Chapter.SOURCE_2);
    expect(getEditorValueFromStore(mockStore)).toBe("display('hello!');");
  });

  test('switching the Conductor-selected language resets the side content tab to Introduction (#4061)', async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/playground'],
      initialIndex: 0,
    });
    await renderTree(router);

    await act(() => {
      mockStore.dispatch(
        LanguageDirectoryActions.setLanguages([
          { id: 'python1', name: 'Python §1', evaluators: [] },
          { id: 'python2', name: 'Python §2', evaluators: [] },
        ]),
      );
      mockStore.dispatch(LanguageDirectoryActions.setSelectedLanguage('python1'));
    });

    // Land on some other tab (e.g. the Stepper tab, as in the reported bug).
    await act(() => {
      mockStore.dispatch(visitSideContent('stepper', SideContentType.introduction, 'playground'));
    });
    expect(mockStore.getState().sideContent.playground.selectedTab).toBe('stepper');

    // Switch to Python §2. Previously this left the (now-defunct) Stepper tab active, which hung
    // forever since it belonged to the Python §1 evaluator instance.
    await act(() => {
      mockStore.dispatch(LanguageDirectoryActions.setSelectedLanguage('python2'));
    });

    expect(mockStore.getState().sideContent.playground.selectedTab).toBe(
      SideContentType.introduction,
    );
  });

  describe('handleHash', () => {
    test('disables loading hash with fullJS chapter in URL params', () => {
      const testHash = '#chap=-1&prgrm=CYSwzgDgNghgngCgOQAsCmUoHsCESCUA3EA';

      const mockHandleEditorValueChanged = vi.fn();
      const mockHandleChapterSelect = vi.fn();
      const mockHandleChangeExecTime = vi.fn();

      handleHash(
        testHash,
        {
          handleChapterSelect: mockHandleChapterSelect,
          handleChangeExecTime: mockHandleChangeExecTime,
        },
        'playground',
        // We cannot make use of 'dispatch' & BrowserFS in test cases. However, the
        // behaviour being tested here does not actually invoke either of these. As
        // a workaround, we pass in 'undefined' instead & cast to the expected types.
        undefined as unknown as Dispatch,
        undefined as unknown as FSModule,
      );

      expect(mockHandleEditorValueChanged).not.toHaveBeenCalled();
      expect(mockHandleChapterSelect).not.toHaveBeenCalled();
      expect(mockHandleChangeExecTime).not.toHaveBeenCalled();
    });
  });
});
