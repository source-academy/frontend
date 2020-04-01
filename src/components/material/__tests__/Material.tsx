import { shallow } from 'enzyme';
import * as React from 'react';

import Material, { IMaterialProps } from '../Material';

test('GameDev page renders correctly', () => {
  const props: IMaterialProps = {
    handleFetchMaterialIndex(p1: number) {},
    materialDirectoryTree: null,
    materialIndex: null
  };
  const app = <Material {...props} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});
