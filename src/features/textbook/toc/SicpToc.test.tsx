import { MemoryRouter } from 'react-router';
import { renderTreeJson } from 'src/commons/utils/TestUtils';
import { expect, test } from 'vitest';

import toc from './data/sicpjs-toc.json';
import SicpToc from './SicpToc';

test('Sicp toc renders correctly', async () => {
  const tree = await renderTreeJson(
    <MemoryRouter>
      <SicpToc toc={toc} />
    </MemoryRouter>,
  );
  expect(tree).toMatchSnapshot();
});
