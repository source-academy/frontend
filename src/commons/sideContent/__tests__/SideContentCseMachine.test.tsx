import { render, screen } from '@testing-library/react';
import { runInContext } from 'js-slang/dist/';
import { act } from 'react';
import { Provider } from 'react-redux';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import { renderTreeJson } from 'src/commons/utils/TestUtils';

import { mockContext } from '../../mocks/ContextMocks';
import { visualizeCseMachine } from '../../utils/JsSlangHelper';
import { SideContentCseMachine } from '../content/SideContentCseMachine';

const mockStore = mockInitialStore();
const element = (
  <Provider store={mockStore}>
    <SideContentCseMachine workspaceLocation="playground" />
  </Provider>
);

test('CSE Machine component renders correctly', async () => {
  const tree = await renderTreeJson(element);
  expect(tree).toMatchSnapshot();
});

test('CSE Machine sets visualization state and renders', async () => {
  await act(() => render(element));
  expect(screen.queryAllByTestId('cse-machine-default-text')).toHaveLength(1);
  expect(screen.queryAllByTestId('sa-cse-machine')).toHaveLength(0);

  const context = mockContext();
  await runInContext('const hello="world"; debugger;', context);
  act(() => visualizeCseMachine({ context }));

  expect(screen.queryAllByTestId('cse-machine-default-text')).toHaveLength(0);
  expect(screen.queryAllByTestId('sa-cse-machine')).toHaveLength(1);
});
