import { act, render, screen } from '@testing-library/react';
import { runInContext } from 'js-slang/dist/';
import { Provider } from 'react-redux';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import { renderTreeJson } from 'src/commons/utils/TestUtils';

import { mockContext } from '../../mocks/ContextMocks';
import { visualizeCSEMachine } from '../../utils/JsSlangHelper';
import { SideContentCSEMachine } from '../content/SideContentCSEMachine';

const mockStore = mockInitialStore();
const element = (
  <Provider store={mockStore}>
    <SideContentCSEMachine workspaceLocation="playground" />
  </Provider>
);

test('CSE Machine component renders correctly', () => {
  const tree = renderTreeJson(element);
  expect(tree).toMatchSnapshot();
});

test('CSE Machine sets visualization state and renders', async () => {
  render(element);
  expect(screen.queryAllByTestId('cse-machine-default-text')).toHaveLength(1);
  expect(screen.queryAllByTestId('sa-cse-machine')).toHaveLength(0);

  const context = mockContext();
  runInContext('const hello="world"; debugger;', context);
  act(() => visualizeCSEMachine({ context }));

  expect(screen.queryAllByTestId('cse-machine-default-text')).toHaveLength(0);
  expect(screen.queryAllByTestId('sa-cse-machine')).toHaveLength(1);
});
