import { MemoryRouter } from 'react-router';
import { renderTreeJson } from 'src/commons/utils/TestUtils';
import { expect, test } from 'vitest';

import SicpToc from './SicpToc';

test('Sicp toc renders correctly', async () => {
  const props = {
    handleCloseToc: () => {},
  };

  const tree = await renderTreeJson(
    <MemoryRouter>
      <SicpToc {...props} />
    </MemoryRouter>,
  );
  expect(tree).toMatchSnapshot();
});
