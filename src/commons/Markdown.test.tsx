import { expect, test } from 'vitest';

import Markdown from './Markdown';
import { renderTreeJson } from './utils/TestUtils';

const content = 'Welcome to the **Source Academy** [playground](https://sourceacademy.org).';

test('Markdown page renders correctly', async () => {
  const tree = await renderTreeJson(<Markdown content={content} openLinksInNewWindow />);
  expect(tree).toMatchSnapshot();
});
