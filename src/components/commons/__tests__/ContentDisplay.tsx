import { mount } from 'enzyme';
import * as React from 'react';

import ContentDisplay, { IContentDisplayProps } from '../ContentDisplay';

const mockProps: IContentDisplayProps = {
  display: <div> Test Content </div>,
  loadContentDispatch: () => {}
};

test('ContentDisplay page renders correctly', () => {
  const app = <ContentDisplay {...mockProps} />;
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
});
