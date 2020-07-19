import { mount } from 'enzyme';
import React from 'react';

import EditableViewlImage from '../EditableViewlImage';

const mockProps = {
  modalImageUrl:
    'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/locations/planet-y-orbit/crashing.png',
  title: 'Sample Title',
  setModalImageUrl: () => {}
};

test('EditableViewlImage component renders correctly', () => {
  const image = <EditableViewlImage {...mockProps} />;
  const tree = mount(image);
  expect(tree.debug()).toMatchSnapshot();
});
