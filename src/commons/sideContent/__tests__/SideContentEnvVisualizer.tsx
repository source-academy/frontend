import { mount } from 'enzyme';
import { runInContext } from 'js-slang/dist/';
import { Provider } from 'react-redux';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';

import { mockContext } from '../../mocks/ContextMocks';
import { visualizeEnv } from '../../utils/JsSlangHelper';
import SideContentEnvVisualizer from '../SideContentEnvVisualizer';

/**
 * This is to fix some weird bug with Jest and Konva
 * See https://github.com/konvajs/konva/issues/200
 */
// Konva.isBrowser = false;
const mockStore = mockInitialStore();

test('EnvVisualizer component renders correctly', () => {
  const app = (
    <Provider store={mockStore}>
      <SideContentEnvVisualizer workspaceLocation="playground" />
    </Provider>
  );
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('EnvVisualizer sets visualization state', async () => {
  const app = (
    <Provider store={mockStore}>
      <SideContentEnvVisualizer workspaceLocation="playground" />
    </Provider>
  );
  const tree = mount(app);
  const context = mockContext();
  await runInContext('const hello="world"; debugger;', context);
  visualizeEnv({ context });
  expect(tree.find('SideContentEnvVisualizer').state('visualization')).not.toBeNull();
});
