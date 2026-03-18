import { useTypedSelector } from 'src/commons/utils/Hooks';
import { shallowRender } from 'src/commons/utils/TestUtils';
import { Mock, vi } from 'vitest';

import Application from '../Application';

vi.mock('react-redux', async importOriginal => ({
  ...(await importOriginal()),
  useDispatch: vi.fn(),
  useSelector: vi.fn()
}));
const useSelectorMock = useTypedSelector as Mock;

test('Application renders correctly', () => {
  useSelectorMock.mockReturnValue({ name: 'Bob' });

  const app = <Application />;
  const tree = shallowRender(app);
  expect(tree).toMatchSnapshot();
});
