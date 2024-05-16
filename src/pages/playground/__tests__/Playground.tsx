import { Router } from '@remix-run/router';
import { act, render } from '@testing-library/react';
import { FSModule } from 'browserfs/dist/node/core/FS';
import { Chapter } from 'js-slang/dist/types';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouteObject, RouterProvider } from 'react-router';
import { Dispatch, Store } from 'redux';
import {
  defaultEditorValue,
  defaultPlayground,
  OverallState
} from 'src/commons/application/ApplicationTypes';
import { WorkspaceSettingsContext } from 'src/commons/WorkspaceSettingsContext';
import { EditorBinding } from 'src/commons/WorkspaceSettingsContext';
import ShareLinkStateEncoder from 'src/features/playground/shareLinks/encoder/Encoder';
import { ShareLinkState } from 'src/features/playground/shareLinks/ShareLinkState';
import { createStore } from 'src/pages/createStore';

import * as EncoderHooks from '../../../features/playground/shareLinks/encoder/EncoderHooks';
import Playground, { setStateFromPlaygroundConfiguration } from '../Playground';

// Mock inspector
(window as any).Inspector = jest.fn();
(window as any).Inspector.highlightClean = jest.fn();

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

  // BrowserFS has to be mocked in nodejs environments
  jest
    .spyOn(EncoderHooks, 'usePlaygroundConfigurationEncoder')
    .mockReturnValue(new ShareLinkStateEncoder({} as ShareLinkState));

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
              value={[{ editorBinding: EditorBinding.NONE }, jest.fn()]}
            >
              <Playground />
            </WorkspaceSettingsContext.Provider>
          </Provider>
        )
      }
    ];
  });

  test('Playground renders correctly', async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/playground'],
      initialIndex: 0
    });

    const tree = await renderTree(router);
    expect(tree).toMatchSnapshot();

    expect(getSourceChapterFromStore(mockStore)).toBe(defaultPlayground.languageConfig.chapter);
    expect(getEditorValueFromStore(mockStore)).toBe(defaultEditorValue);
  });

  test('Playground with link renders correctly', async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/playground#chap=2&prgrm=CYSwzgDgNghgngCgOQAsCmUoHsCESCUA3EA'],
      initialIndex: 0
    });

    const tree = await renderTree(router);
    expect(tree).toMatchSnapshot();

    expect(getSourceChapterFromStore(mockStore)).toBe(Chapter.SOURCE_2);
    expect(getEditorValueFromStore(mockStore)).toBe("display('hello!');");
  });

  describe('setStateFromPlaygroundConfiguration', () => {
    test('disables loading playground with fullJS/ fullTS chapter in playground configuration', () => {
      const chaptersThatDisableLoading: Chapter[] = [Chapter.FULL_JS, Chapter.FULL_TS];

      const mockHandleEditorValueChanged = jest.fn();
      const mockHandleChapterSelect = jest.fn();
      const mockHandleChangeExecTime = jest.fn();

      for (const chap of chaptersThatDisableLoading) {
        setStateFromPlaygroundConfiguration(
          { chap } as ShareLinkState,
          {
            handleChapterSelect: mockHandleChapterSelect,
            handleChangeExecTime: mockHandleChangeExecTime
          },
          'playground',
          // We cannot make use of 'dispatch' & BrowserFS in test cases. However, the
          // behaviour being tested here does not actually invoke either of these. As
          // a workaround, we pass in 'undefined' instead & cast to the expected types.
          undefined as unknown as Dispatch,
          null as unknown as FSModule
        );

        expect(mockHandleEditorValueChanged).not.toHaveBeenCalled();
        expect(mockHandleChapterSelect).not.toHaveBeenCalled();
        expect(mockHandleChangeExecTime).not.toHaveBeenCalled();
      }
    });
  });
});
