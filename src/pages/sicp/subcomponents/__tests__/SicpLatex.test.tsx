import { renderTree } from 'src/commons/utils/TestUtils';

import SicpLatex from '../SicpLatex';

describe('Sicp latex renders', () => {
  test('correctly block', async () => {
    const props = {
      math: '1+1',
      inline: false
    };

    const tree = await renderTree(<SicpLatex {...props} />);
    expect(tree).toMatchSnapshot();
  });

  test('correctly inline', async () => {
    const props = {
      math: '1+1',
      inline: true
    };

    const tree = await renderTree(<SicpLatex {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
