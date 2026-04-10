import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';

import Application from '../Application';

test('Application renders correctly', () => {
  const store = mockInitialStore({
    session: {
      name: 'Bob'
    }
  });

  const app = (
    <Provider store={store}>
      <MemoryRouter>
        <Application />
      </MemoryRouter>
    </Provider>
  );

  const tree = render(app);
  expect(tree.asFragment()).toMatchSnapshot();
});
