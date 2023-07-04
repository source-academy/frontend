import { act, render, screen } from '@testing-library/react';
import { runInContext } from 'js-slang/dist/';
import { Provider } from 'react-redux';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import { renderTreeJson } from 'src/commons/utils/TestUtils';

import { mockContext } from '../../mocks/ContextMocks';
import { visualizeEnv } from '../../utils/JsSlangHelper';
import SideContentEnvVisualizer from '../SideContentEnvVisualizer';

const mockStore = mockInitialStore();
const element = (
  <Provider store={mockStore}>
    <SideContentEnvVisualizer workspaceLocation="playground" />
  </Provider>
);

test('EnvVisualizer component renders correctly', () => {
  const tree = renderTreeJson(element);
  expect(tree).toMatchSnapshot();
});

test('EnvVisualizer sets visualization state and renders', async () => {
  render(element);
  expect(screen.queryAllByTestId('env-visualizer-default-text')).toHaveLength(1);
  expect(screen.queryAllByTestId('sa-env-visualizer')).toHaveLength(0);

  const context = mockContext();
  runInContext('const hello="world"; debugger;', context);
  act(() => visualizeEnv({ context }));

  expect(screen.queryAllByTestId('env-visualizer-default-text')).toHaveLength(0);
  expect(screen.queryAllByTestId('sa-env-visualizer')).toHaveLength(1);
});
