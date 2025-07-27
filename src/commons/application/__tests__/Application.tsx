import { useTypedSelector } from 'src/commons/utils/Hooks';
import { shallowRender } from 'src/commons/utils/TestUtils';
import { vi } from 'vitest';

import Application from '../Application';

// JSDOM does not implement window.matchMedia, so we have to mock it.
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {}
    };
  };

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn()
}));
const useSelectorMock = useTypedSelector as jest.Mock;

test('Application renders correctly', () => {
  useSelectorMock.mockReturnValue({ name: 'Bob' });

  const app = <Application />;
  const tree = shallowRender(app);
  expect(tree).toMatchSnapshot();
});
