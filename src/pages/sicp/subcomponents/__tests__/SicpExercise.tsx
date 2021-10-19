import { Collapse } from '@blueprintjs/core';
import { mount } from 'enzyme';

import SicpExercise, { noSolutionPlaceholder } from '../SicpExercise';

describe('Sicp exercise renders', () => {
  test('correctly', () => {
    const props = {
      title: 'Title',
      body: <div>body</div>,
      solution: <div>solution</div>
    };

    const tree = mount(<SicpExercise {...props} />);
    expect(tree.debug()).toMatchSnapshot();
  });

  test('correctly with solution', () => {
    const props = {
      title: 'Title',
      body: <div>body</div>,
      solution: <div>solution</div>
    };

    const wrapper = mount(<SicpExercise {...props} />);
    wrapper.find('button').simulate('click');
    expect(wrapper.find(Collapse).text()).toEqual('solution');
  });

  test('correctly without solution', () => {
    const props = {
      title: 'Title',
      body: <div>body</div>,
      solution: undefined
    };

    const wrapper = mount(<SicpExercise {...props} />);
    wrapper.find('button').simulate('click');
    expect(wrapper.find(Collapse).text()).toEqual(mount(noSolutionPlaceholder).text());
  });
});
