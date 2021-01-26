import { mount } from 'enzyme';

import ContentDisplay, { ContentDisplayProps } from '../ContentDisplay';

const mockProps: ContentDisplayProps = {
  display: <div> Test Content </div>,
  loadContentDispatch: () => {}
};

test('ContentDisplay page renders correctly', () => {
  const app = <ContentDisplay {...mockProps} />;
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
});
