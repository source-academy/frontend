import { MemoryRouter } from 'react-router';
import { renderTreeJson } from 'src/commons/utils/TestUtils';
import { expect, test } from 'vitest';

import SicpIndexPage from './SicpIndexPage';

test('Sicp index page', async () => {
  const tree = await renderTreeJson(
    <MemoryRouter>
      <SicpIndexPage />
    </MemoryRouter>,
  );
  expect(tree).toMatchSnapshot();
});
