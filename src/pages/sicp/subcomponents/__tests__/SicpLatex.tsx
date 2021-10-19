import { mount } from 'enzyme';

import SicpLatex from '../SicpLatex';

describe('Sicp latex renders', () => {
  test('correctly block', () => {
    const props = {
      math: '1+1',
      inline: false
    };

    const tree = mount(<SicpLatex {...props} />);
    expect(tree.debug()).toMatchSnapshot();
  });

  test('correctly inline', () => {
    const props = {
      math: '1+1',
      inline: true
    };

    const tree = mount(<SicpLatex {...props} />);
    expect(tree.debug()).toMatchSnapshot();
  });
});
