import { mount, shallow } from 'enzyme';
import { runInContext } from 'js-slang/dist/';

import { mockContext } from '../../mocks/ContextMocks';
import { visualizeEnv } from '../../utils/JsSlangHelper';
import SideContentEnvVisualizer from '../SideContentEnvVisualizer';

/**
 * This is to fix some weird bug with Jest and Konva
 * See https://github.com/konvajs/konva/issues/200
 */
// Konva.isBrowser = false;

test('EnvVisualizer component renders correctly', () => {
  const app = <SideContentEnvVisualizer />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('EnvVisualizer sets visualization state', async () => {
  const app = <SideContentEnvVisualizer />;
  const tree = mount(app);
  const context = mockContext();
  await runInContext('const hello="world"; debugger;', context);
  visualizeEnv({ context });
  expect(tree.state('visualization')).not.toBeNull();
});
