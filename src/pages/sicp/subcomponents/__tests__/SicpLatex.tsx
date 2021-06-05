import { MathJaxContext } from 'better-react-mathjax';
import { mount } from 'enzyme';

import { mathjaxConfig } from '../../Sicp';
import SicpLatex from '../SicpLatex';

describe('Sicp latex renders', () => {
  test('correctly block', () => {
    const props = {
      math: '1+1',
      inline: false
    };

    const tree = mount(
      <MathJaxContext version={2} config={mathjaxConfig}>
        <SicpLatex {...props} />
      </MathJaxContext>
    );
    expect(tree.debug()).toMatchSnapshot();
  });

  test('correctly inline', () => {
    const props = {
      math: '1+1',
      inline: true
    };

    const tree = mount(
      <MathJaxContext version={2} config={mathjaxConfig}>
        <SicpLatex {...props} />
      </MathJaxContext>
    );
    expect(tree.debug()).toMatchSnapshot();
  });
});
