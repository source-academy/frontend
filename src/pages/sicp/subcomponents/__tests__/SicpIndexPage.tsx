import { MemoryRouter } from 'react-router';
import { renderTreeJson } from 'src/commons/utils/TestUtils';

import SicpIndexPage from '../../subcomponents/SicpIndexPage';

test('Sicp index page', () => {
  const tree = renderTreeJson(
    <MemoryRouter>
      <SicpIndexPage />
    </MemoryRouter>
  );
  expect(tree).toMatchSnapshot();
});
