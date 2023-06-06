import { require as acequire } from 'ace-builds';
import { FSModule } from 'browserfs/dist/node/core/FS';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouteObject, RouterProvider } from 'react-router';
import { Dispatch } from 'redux';
import { WorkspaceSettingsContext } from 'src/commons/WorkspaceSettingsContext';
import { EditorBinding } from 'src/commons/WorkspaceSettingsContext';
import { createStore } from 'src/pages/createStore';

import Playground, { handleHash } from '../Playground';

jest.mock('ace-builds', () => ({
  ...jest.requireActual('ace-builds'),
  require: jest.fn()
}));

const acequireMock = acequire as jest.Mock;

describe('Playground tests', () => {
  let routes: RouteObject[];
  beforeEach(() => {
    const mockStore = createStore();
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
    const tree = mount(<RouterProvider router={router} />);
    expect(tree.debug()).toMatchSnapshot();
  });

  test('Playground with link renders correctly', async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/playground#chap=2&prgrm=CYSwzgDgNghgngCgOQAsCmUoHsCESCUA3EA'],
      initialIndex: 0
    });
    const tree = mount(<RouterProvider router={router} />);
    expect(tree.debug()).toMatchSnapshot();
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
