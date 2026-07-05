import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import { expect, test } from 'vitest';

import { Component as RootLayout } from './_layout';

test('Application renders correctly', () => {
  const store = mockInitialStore({
    session: {
      name: 'Bob',
    },
  });

  const app = (
    <Provider store={store}>
      <MemoryRouter>
        <RootLayout />
      </MemoryRouter>
    </Provider>
  );

  const tree = render(app);
  expect(tree.asFragment()).toMatchSnapshot();
});
