import { shallowRender } from 'src/commons/utils/TestUtils';

import SicpLatex from '../SicpLatex';

describe('Sicp latex renders', () => {
  test('correctly block', () => {
    const props = {
      math: '1+1',
      inline: false
    };

    const tree = shallowRender(<SicpLatex {...props} />);
    expect(tree).toMatchSnapshot();
  });

  test('correctly inline', () => {
    const props = {
      math: '1+1',
      inline: true
    };

    const tree = shallowRender(<SicpLatex {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
