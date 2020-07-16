import { mount } from 'enzyme';
import React from 'react';

import EditableModalImage from '../EditableModalImage';

const mockProps = {
  modalImageUrl:
    'https://source-academy-assets.s3-ap-southeast-1.amazonaws.com/locations/planet-y-orbit/crashing.png',
  title: 'Sample Title',
  setModalImageUrl: () => {}
};

test('EditableModalImage component renders correctly', () => {
  const image = <EditableModalImage {...mockProps} />;
  const tree = mount(image);
  expect(tree.debug()).toMatchSnapshot();
});
