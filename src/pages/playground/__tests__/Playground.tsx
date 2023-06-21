import { render } from '@testing-library/react';
import { require as acequire } from 'ace-builds';
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
import { createStore } from 'src/pages/createStore';

import Playground, { handleHash } from '../Playground';

// Mock inspector
(window as any).Inspector = jest.fn();
(window as any).Inspector.highlightClean = jest.fn();

jest.mock('ace-builds', () => ({
  ...jest.requireActual('ace-builds'),
  require: jest.fn()
}));

const acequireMock = acequire as jest.Mock;

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
              value={[{ editorBinding: EditorBinding.NONE }, jest.fn()]}
            >
              <Playground />
            </WorkspaceSettingsContext.Provider>
          </Provider>
        )
      }
    ];
    acequireMock.mockReturnValue({
      Mode: jest.fn(),
      setCompleters: jest.fn()
    });
  });

  test('Playground renders correctly', async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/playground'],
      initialIndex: 0
    });

    // Using @testing-library/react to render snapshot instead of react-test-renderer
    // as the useRefs require the notion of React DOM
    const tree = render(<RouterProvider router={router} />).container;
    expect(tree).toMatchSnapshot();

    expect(getSourceChapterFromStore(mockStore)).toBe(defaultPlayground.languageConfig.chapter);
    expect(getEditorValueFromStore(mockStore)).toBe(defaultEditorValue);
  });

  test('Playground with link renders correctly', async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/playground#chap=2&prgrm=CYSwzgDgNghgngCgOQAsCmUoHsCESCUA3EA'],
      initialIndex: 0
    });

    // Using @testing-library/react to render snapshot instead of react-test-renderer
    // as the useRefs require the notion of React DOM
    const tree = render(<RouterProvider router={router} />).container;
    expect(tree).toMatchSnapshot();

    expect(getSourceChapterFromStore(mockStore)).toBe(Chapter.SOURCE_2);
    expect(getEditorValueFromStore(mockStore)).toBe("display('hello!');");
  });

  describe('handleHash', () => {
    test('disables loading hash with fullJS chapter in URL params', () => {
      const testHash = '#chap=-1&prgrm=CYSwzgDgNghgngCgOQAsCmUoHsCESCUA3EA';

      const mockHandleEditorValueChanged = jest.fn();
      const mockHandleChapterSelect = jest.fn();
      const mockHandleChangeExecTime = jest.fn();

      handleHash(
        testHash,
        {
          handleChapterSelect: mockHandleChapterSelect,
          handleChangeExecTime: mockHandleChangeExecTime
        },
        'playground',
        // We cannot make use of 'dispatch' & BrowserFS in test cases. However, the
        // behaviour being tested here does not actually invoke either of these. As
        // a workaround, we pass in 'undefined' instead & cast to the expected types.
        undefined as unknown as Dispatch,
        undefined as unknown as FSModule
      );

      expect(mockHandleEditorValueChanged).not.toHaveBeenCalled();
      expect(mockHandleChapterSelect).not.toHaveBeenCalled();
      expect(mockHandleChangeExecTime).not.toHaveBeenCalled();
    });
  });
});
