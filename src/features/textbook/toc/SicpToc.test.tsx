import type { TreeNodeInfo } from '@blueprintjs/core';
import { MemoryRouter } from 'react-router';
import { renderTreeJson } from 'src/commons/utils/TestUtils';
import { expect, test } from 'vitest';

import SicpToc from './SicpToc';

const toc: TreeNodeInfo[] = [
  {
    id: 0,
    hasCaret: true,
    label: '1 Building Abstractions with Functions',
    nodeData: '1',
    childNodes: [
      { id: 1, hasCaret: false, label: '1.1 The Elements of Programming', nodeData: '1.1' },
    ],
  },
];

test('Sicp toc renders correctly', async () => {
  const tree = await renderTreeJson(
    <MemoryRouter>
      <SicpToc toc={toc} />
    </MemoryRouter>,
  );
  expect(tree).toMatchSnapshot();
});
