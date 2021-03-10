import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import { mockInitialStore } from '../../mocks/StoreMocks';
import ApplicationContainer from '../ApplicationContainer';

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

/* TODO: currently crashes w/ ReferenceError---PIXI libraries are not loaded in this test
test('ApplicationContainer redirects from / to /academy', () => {
  const store = mockInitialStore()
  const app = (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']}>
        <ApplicationContainer />
      </MemoryRouter>
    </Provider>
  )
  const tree = mount(app)
  expect(tree.find('.Game').length).toBe(1)
  expect(tree.find('.NavigationBar__link.pt-active').contains('Game')).toBe(true)
}) */

test('ApplicationContainer renders NotFound on unknown routes', () => {
  const store = mockInitialStore();
  const app = (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/unknown']}>
        <ApplicationContainer />
      </MemoryRouter>
    </Provider>
  );
  const tree = mount(app);
  expect(tree.find('.NoPage').length).toBe(1);
  expect(tree.find('.NavigationBar__link.pt-active').length).toBe(0);
});
