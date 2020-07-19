import { mount } from 'enzyme';
import React from 'react';

import EditableViewImage from '../EditableViewImage';

const mockProps = {
  canvasUrl:
    'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/locations/planet-y-orbit/crashing.png',
  title: 'Sample Title',
  setcanvasUrl: () => {}
};

test('EditableViewImage component renders correctly', () => {
  const image = <EditableViewImage {...mockProps} />;
  const tree = mount(image);
  expect(tree.debug()).toMatchSnapshot();
});
