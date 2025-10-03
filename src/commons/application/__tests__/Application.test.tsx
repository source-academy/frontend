import { expect, test, vi } from 'vitest';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import { shallowRender } from 'src/commons/utils/TestUtils';

import Application from '../Application';

vi.mock(import('react-redux'), async importOriginal => ({
  ...(await importOriginal()),
  useDispatch: vi.fn(),
  useSelector: vi.fn()
}));
const useSelectorMock = vi.mocked(useTypedSelector);

test('Application renders correctly', () => {
  useSelectorMock.mockReturnValue({ name: 'Bob' });

  const app = <Application />;
  const tree = shallowRender(app);
  expect(tree).toMatchSnapshot();
});
